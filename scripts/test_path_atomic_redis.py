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
    for filename in ["lib/store-data.ts", "lib/path-atomic.ts"]:
        source = (root / filename).read_text(encoding="utf-8")
        constants.update(re.findall(r"export const (\w+) = `([\s\S]*?)`;", source))

    def expand(name, stack=()):
        if name in stack or name not in constants:
            raise RuntimeError("Unknown or recursive application script: " + name)
        value = re.sub(r"\$\{([A-Z_]+)\}", lambda match: expand(match.group(1), stack + (name,)), constants[name])
        if "${" in value:
            raise RuntimeError("Unresolved application script")
        return value
    return expand("WRITE_PATH"), expand("FORGET_PATH")


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
    finally:
        redis.command("DEL", room, record)
        redis.close()


if __name__ == "__main__":
    main()
