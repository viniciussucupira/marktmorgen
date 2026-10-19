"""Exercise the application's composed Path scripts against disposable CI Redis only."""
import concurrent.futures
import json
import os
from pathlib import Path
import re
import threading
import uuid
from test_form_opportunity_redis import Redis


def scripts(root):
    constants = {}
    for filename in ["lib/store-data.ts", "lib/path-board-rules.ts", "lib/path-atomic.ts"]:
        source = (root / filename).read_text(encoding="utf-8")
        constants.update(re.findall(r"export const (\w+) = (\d+);", source))
        constants.update(re.findall(r"export const (\w+) = `([\s\S]*?)`;", source))

    def expand(name, stack=()):
        if name in stack or name not in constants:
            raise RuntimeError("Unknown or recursive application script: " + name)
        value = re.sub(r"\$\{([A-Z_]+)\}", lambda match: expand(match.group(1), stack + (name,)), constants[name])
        if "${" in value:
            raise RuntimeError("Unresolved application script")
        return value
    return expand("WRITE_PATH"), expand("FORGET_PATH")



def check_board(redis, write, forget, suffix):
    board, owners = "marktmorgen:integration:board:" + suffix, "marktmorgen:integration:board-owners:" + suffix
    touched = [board, owners]
    sid = uuid.uuid4().hex
    room, record = "marktmorgen:integration:board-room:" + sid, "marktmorgen:integration:board-record:" + sid
    touched.extend([room, record])
    def put(expected, entry=None, limit=100000, client=None):
        client = client or redis
        version = uuid.uuid4().hex
        payload = json.dumps({"v": 1, "r": version, "g": entry})
        return client.command("EVAL", write, 4, room, record, board, owners, limit, "2026-10", 400, expected or "", "1" if expected is None else "0", payload, sid), version
    def remove(client=None):
        return (client or redis).command("EVAL", forget, 4, room, record, board, owners, "2026-10", sid)
    def entry(score=4):
        return {"token": uuid.uuid4().hex, "score": score, "at": 1792411200000}
    try:
        result, initial = put(None)
        assert result == [1, 464]
        before = redis.command("GET", record)
        assert put(initial, entry(), limit=1000)[0][0] == 0
        assert redis.command("GET", record) == before and redis.command("ZCARD", board) == 0
        redis.command("SET", board, "wrong-type")
        assert put(initial, entry())[0][0] == -1
        assert redis.command("GET", record) == before
        redis.command("DEL", board)
        redis.command("HSET", room, "#", "unknown")
        assert put(initial, entry())[0][0] == -1
        assert redis.command("ZCARD", board) == 0 and redis.command("HLEN", owners) == 0
        redis.command("HSET", room, "#", 464)
        print("PASS: board full-room, wrong-type and unknown-meter failures leave no partial membership")
        participation = entry()
        result, joined = put(initial, participation)
        assert result == [1, 2576]
        assert int(redis.command("HGET", room, "path-board")) == 2048
        old_member = redis.command("HGET", owners, sid)
        participation["score"] = 7
        result, updated = put(joined, participation)
        assert result[0] == 1 and redis.command("ZCARD", board) == 1
        assert redis.command("ZSCORE", board, old_member) is None
        result, withdrawn = put(updated)
        assert result == [1, 464] and redis.command("ZCARD", board) == 0
        assert redis.command("HGET", owners, sid) is None
        assert put(updated, participation)[0][0] == -2
        assert redis.command("ZCARD", board) == 0
        # Simultaneous opt-ins from the same read may create exactly one membership.
        def race_join(_):
            client = Redis()
            try:
                return put(withdrawn, entry(), client=client)
            finally:
                client.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            results = list(pool.map(race_join, range(32)))
        assert sum(result[0][0] == 1 for result in results) == 1
        assert redis.command("ZCARD", board) == 1 and redis.command("HLEN", owners) == 1
        print("PASS: consent, shared entry and reserved bytes change together; stale visits cannot undo withdrawal")
        # Reverse membership lets deletion clean up even an unreadable private record.
        redis.command("SET", record, "corrupt")
        assert remove() == [1, 0]
        assert redis.command("GET", record) is None and redis.command("ZCARD", board) == 0
        assert redis.command("HLEN", owners) == 0 and int(redis.command("HGET", room, "#") or 0) == 0
        print("PASS: forgetting also removes shared membership when the private record is unreadable")
        # Real physical Redis allocation, including the entire shared-key overhead.
        for index in range(128):
            item_sid = uuid.uuid4().hex
            item_room, item_record = "marktmorgen:integration:board-room:" + item_sid, "marktmorgen:integration:board-record:" + item_sid
            touched.extend([item_room, item_record])
            item = entry(index % 16)
            payload = json.dumps({"v": 1, "r": uuid.uuid4().hex, "g": item})
            result = redis.command("EVAL", write, 4, item_room, item_record, board, owners, 100000, "2026-10", 400, "", "1", payload, item_sid)
            assert result[0] == 1
            if index + 1 in [1, 16, 128]:
                used = int(redis.command("MEMORY", "USAGE", board)) + int(redis.command("MEMORY", "USAGE", owners))
                assert used <= (index + 1) * 2048, (index + 1, used)
        assert redis.command("ZCARD", board) == 128 and redis.command("HLEN", owners) == 128
        print("PASS: measured shared Redis allocation fits each owner's 2 KB reserve at 1, 16 and 128 entries")
    finally:
        redis.command("DEL", *touched)


def main():
    if os.environ.get("MARKTMORGEN_REDIS_INTEGRATION") != "1":
        raise RuntimeError("Use dedicated disposable loopback CI Redis only")
    write, forget = scripts(Path(__file__).resolve().parents[1])
    suffix = uuid.uuid4().hex
    room, record = "marktmorgen:integration:path:room:" + suffix, "marktmorgen:integration:path:record:" + suffix
    redis = Redis()

    def put(client, expected, size=400, limit=100000, token=None, payload=None):
        token = token or uuid.uuid4().hex
        payload = payload or json.dumps({"v": 1, "r": token})
        result = client.command("EVAL", write, 2, room, record, limit, "2026-10", size, expected or "", "1" if expected is None else "0", payload)
        return result, token

    def remove(client):
        return client.command("EVAL", forget, 2, room, record, "2026-10")

    def total():
        return int(redis.command("HGET", room, "#") or 0)

    try:
        assert redis.command("PING") == "PONG"
        result, first = put(redis, None)
        assert result == [1, 464]
        result, second = put(redis, first, 600)
        assert result == [1, 664]
        assert put(redis, first, 100)[0][0] == -2
        assert json.loads(redis.command("GET", record))["r"] == second and total() == 664
        print("PASS: a stale write changes neither the record nor the data-room count")

        assert remove(redis) == [1, 0]
        assert put(redis, second, 900)[0][0] == -2
        assert redis.command("GET", record) is None and total() == 0
        assert remove(redis) == [1, 0]
        result, restarted = put(redis, None)
        assert result[0] == 1 and restarted != second
        assert put(redis, second, 900)[0][0] == -2
        assert json.loads(redis.command("GET", record))["r"] == restarted
        print("PASS: deletion is idempotent; old writes cannot recreate or replace a restarted Path")

        previous = redis.command("GET", record)
        assert put(redis, restarted, 200000, limit=1000)[0][0] == 0
        assert redis.command("GET", record) == previous and total() == 464
        assert put(redis, restarted, payload=json.dumps({"v": 1, "r": "invalid"}))[0][0] == -1
        assert redis.command("GET", record) == previous and total() == 464
        print("PASS: full rooms and malformed writes leave the record intact")

        redis.command("SET", record, json.dumps({"v": 1}))
        result, migrated = put(redis, "")
        assert result[0] == 1 and json.loads(redis.command("GET", record))["r"] == migrated
        redis.command("HSET", room, "#", "unknown")
        before = redis.command("GET", record)
        assert put(redis, migrated)[0][0] == -1 and redis.command("GET", record) == before
        redis.command("HSET", room, "#", 464)
        print("PASS: legacy records migrate; an unreadable meter refuses the write")

        def edit(index):
            client = Redis()
            try:
                result, token = put(client, migrated, 500 + index)
                return result[0], token, 500 + index
            finally:
                client.close()

        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            results = list(pool.map(edit, range(32)))
        winners = [item for item in results if item[0] == 1]
        assert len(winners) == 1 and all(item[0] in [1, -2] for item in results)
        assert json.loads(redis.command("GET", record))["r"] == winners[0][1]
        assert total() == winners[0][2] + 64
        print("PASS: exactly one simultaneous edit wins and the meter matches its record")

        for _ in range(16):
            remove(redis)
            _, version = put(redis, None)
            barrier = threading.Barrier(2)

            def race(deleting):
                client = Redis()
                try:
                    barrier.wait(timeout=10)
                    return remove(client) if deleting else put(client, version, 700)[0]
                finally:
                    client.close()

            with concurrent.futures.ThreadPoolExecutor(max_workers=2) as pool:
                results = list(pool.map(race, [False, True]))
            assert all(item[0] in [1, -2] for item in results)
            assert redis.command("GET", record) is None and total() == 0
        print("PASS: deletion wins every ordering against an in-flight old edit")
        check_board(redis, write, forget, suffix)
    finally:
        redis.command("DEL", room, record)
        redis.close()


if __name__ == "__main__":
    main()
