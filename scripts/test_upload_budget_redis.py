"""Exercise the exact upload admission Lua against dedicated CI Redis only."""
import concurrent.futures
import os
from pathlib import Path
import re
import uuid
from test_form_opportunity_redis import Redis


def main():
    if os.environ.get("MARKTMORGEN_REDIS_INTEGRATION") != "1":
        raise RuntimeError("Dedicated loopback CI Redis required")
    source = (Path(__file__).resolve().parents[1] / "lib/upload-budget.ts").read_text(encoding="utf-8")
    match = re.search(r"export const RESERVE_UPLOAD_BUDGET = `([^`]+)`;", source)
    if not match or "${" in match.group(1):
        raise RuntimeError("Expected the static application upload Lua")
    script = match.group(1)
    prefix = "marktmorgen:integration:upload:" + uuid.uuid4().hex + ":"
    keys = []
    redis = Redis()
    def fresh():
        key = prefix + str(len(keys))
        keys.append(key)
        redis.command("HSET", key, "policy", "reviewed-test-policy", "company:opens", 0,
                      "company:bytes", 0, "company:controls", 0, "slots:creator", 1)
        return key
    def reserve(client, key, store="store-a", action="open", size=5, scope="creator", policy="reviewed-test-policy", caps=(2, 10, 6), company=(2, 10, 6), funded=1):
        return client.command("EVAL", script, 1, key, policy, store, scope, action, size, *caps, *company, funded)
    def snapshot(key):
        flat = redis.command("HGETALL", key)
        return dict(zip(flat[::2], flat[1::2]))
    try:
        assert redis.command("PING") == "PONG"
        key = fresh()
        def race(_):
            client = Redis()
            try:
                return reserve(client, key)
            finally:
                client.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            replies = list(pool.map(race, range(64)))
        assert sum(replies) == 2, replies
        assert redis.command("HGET", key, "company:bytes") == "10"
        assert redis.command("HGET", key, "slots:creator") == "0"
        before = snapshot(key)
        assert reserve(redis, key) == 0
        assert snapshot(key) == before
        print("PASS: 64 concurrent starts share exact store and company limits")
        for _ in range(4):
            assert reserve(redis, key, action="control", size=0) == 1
        before = snapshot(key)
        assert reserve(redis, key, action="control", size=0) == 0
        assert snapshot(key) == before
        assert redis.command("HGET", key, "company:controls") == "6"
        print("PASS: signing controls consume the same finite monthly counter")
        key = fresh()
        def claim(index):
            client = Redis()
            try:
                return reserve(client, key, store="claim-" + str(index), size=1)
            finally:
                client.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            replies = list(pool.map(claim, range(64)))
        assert sum(replies) == 1, replies
        assert redis.command("HGET", key, "slots:creator") == "0"
        print("PASS: concurrent stores cannot reuse a funded allocation slot")
        key = fresh()
        reserve(redis, key, size=6)  # Ignore committed reply, like a lost HTTP acknowledgement.
        before = snapshot(key)
        assert reserve(redis, key, size=5) == 0
        assert snapshot(key) == before
        assert reserve(redis, key, size=4) == 1
        assert redis.command("HGET", key, "company:bytes") == "10"
        print("PASS: retries cannot refund an acknowledged or unacknowledged reservation")
        for value in ("", "-1", "01", "1.5", "1000000000001", "bad"):
            key = fresh()
            redis.command("HSET", key, "company:bytes", value)
            before = snapshot(key)
            assert reserve(redis, key) == 0
            assert snapshot(key) == before
        print("PASS: corrupt and unsafe counters deny before all writes")
        for changes in ({"policy": "different"}, {"scope": "pro"}, {"action": "other"}, {"size": 0}, {"size": 11}, {"action": "control", "size": 1}):
            key = fresh()
            before = snapshot(key)
            assert reserve(redis, key, **changes) == 0
            assert snapshot(key) == before
        print("PASS: policy, scope, action and byte mismatches preserve ledger")
        key = fresh()
        assert reserve(redis, key, size=1) == 1
        before = snapshot(key)
        assert reserve(redis, key, scope="pro", size=1) == 0
        assert snapshot(key) == before
        key = fresh()
        redis.command("EXPIRE", key, 3600)
        before = snapshot(key)
        assert reserve(redis, key) == 0
        assert snapshot(key) == before
        key = prefix + "wrong-type"
        keys.append(key)
        redis.command("SET", key, "preserved")
        assert reserve(redis, key) == 0
        assert redis.command("GET", key) == "preserved"
        missing = prefix + "missing"
        assert reserve(redis, missing) == 0
        assert redis.command("EXISTS", missing) == 0
        print("PASS: tier changes, expiring, wrong-type and missing ledgers cannot reset usage")
    finally:
        assert all(key.startswith(prefix) for key in keys)
        if keys:
            redis.command("DEL", *keys)
        redis.close()


if __name__ == "__main__":
    main()
