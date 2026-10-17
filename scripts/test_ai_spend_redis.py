"""Execute AI spend admission against the disposable loopback CI Redis.
No application credentials or production host configuration are read.
"""
import concurrent.futures
import os
from pathlib import Path
import re
import uuid
from test_form_opportunity_redis import Redis


def main():
    if os.environ.get("MARKTMORGEN_REDIS_INTEGRATION") != "1":
        raise RuntimeError("Run only against dedicated CI Redis on loopback port 16379")
    source = (Path(__file__).resolve().parents[1] / "lib/ai-spend.ts").read_text(encoding="utf-8")
    match = re.search(r"export const RESERVE_AI_SPEND = `([^`]+)`;", source)
    if not match or "${" in match.group(1):
        raise RuntimeError("Expected static application AI reservation script")
    script = match.group(1)
    prefix = "marktmorgen:integration:ai-spend:" + uuid.uuid4().hex + ":"
    keys = [prefix + str(index) for index in range(10)]
    redis = Redis()
    def seed(key, slots=1):
        redis.command("HSET", key, "review", "review-v2", "policy", "funded-snapshot-v2", "company", 0, "slots:creator", slots, "slots:pro", 0, "slots:scale", 0, "slots:trial", 0, "slots:setup", 0, "slots:ended", 0)
    def take(client, key, customer="one", snapshot="funded-snapshot-v2", charge=100, store_limit=300, company_limit=400, tier="creator", funded=1):
        return client.command("EVAL", script, 1, key, "review-v2", "store:" + customer, charge, store_limit, company_limit, snapshot, tier, funded)
    try:
        assert redis.command("PING") == "PONG"
        seed(keys[0])
        for _ in range(3):
            assert take(redis, keys[0]) == 1
        assert take(redis, keys[0]) == 0
        assert redis.command("HGET", keys[0], "store:one") == "300"
        assert redis.command("HGET", keys[0], "company") == "300"
        print("PASS: store spending stops at its exact funded ceiling")

        seed(keys[1], slots=4)
        def concurrent_take(index):
            client = Redis()
            try:
                return take(client, keys[1], "customer" + str(index), store_limit=100, funded=4)
            finally:
                client.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            results = list(pool.map(concurrent_take, range(64)))
        assert sum(results) == 4
        assert redis.command("HGET", keys[1], "company") == "400"
        print("PASS: concurrent customers cannot exceed the company ceiling")

        seed(keys[2])
        before = redis.command("HGETALL", keys[2])
        assert take(redis, keys[2], snapshot="changed-ceilings-same-review", store_limit=1000, company_limit=1000) == 0
        assert redis.command("HGETALL", keys[2]) == before
        redis.command("HDEL", keys[2], "policy")
        assert take(redis, keys[2]) == 0
        assert redis.command("HGET", keys[2], "company") == "0"
        print("PASS: changed or missing policy bindings cannot reuse funding")

        seed(keys[3])
        redis.command("HSET", keys[3], "store:one", 100)
        assert take(redis, keys[3]) == 0
        assert redis.command("HGET", keys[3], "company") == "0"
        redis.command("HDEL", keys[3], "store:one")
        for corrupt in ("-1", "01", "NaN", "1.5", "1000000000001"):
            redis.command("HSET", keys[3], "company", corrupt)
            assert take(redis, keys[3]) == 0
            assert redis.command("HGET", keys[3], "company") == corrupt
        print("PASS: corrupt or inconsistent counters refuse without writes")

        seed(keys[4])
        redis.command("EXPIRE", keys[4], 3600)
        assert take(redis, keys[4]) == 0
        redis.command("SET", keys[5], "wrong-type")
        assert take(redis, keys[5]) == 0
        assert take(redis, keys[6]) == 0
        assert redis.command("EXISTS", keys[6]) == 0
        print("PASS: expiring, wrong-type and missing ledgers never authorize spending")

        seed(keys[7])
        def one_slot(index):
            client = Redis()
            try:
                return take(client, keys[7], "slot" + str(index))
            finally:
                client.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            slot_results = list(pool.map(one_slot, range(64)))
        assert sum(slot_results) == 1
        winner = slot_results.index(1)
        assert redis.command("HGET", keys[7], "slots:creator") == "0"
        assert take(redis, keys[7], "slot" + str(winner)) == 1
        assert take(redis, keys[7], "slot" + str(winner)) == 1
        assert redis.command("HGET", keys[7], "company") == "300"
        print("PASS: a funded store allocation cannot be reused and retains its full budget")

        seed(keys[8])
        redis.command("HSET", keys[8], "slots:pro", 1)
        assert take(redis, keys[8]) == 1
        assert take(redis, keys[8], tier="pro") == 0
        redis.command("HDEL", keys[8], "store:one")
        assert take(redis, keys[8]) == 0
        assert redis.command("HGET", keys[8], "company") == "100"
        seed(keys[9])
        redis.command("HDEL", keys[9], "slots:creator")
        assert take(redis, keys[9]) == 0
        assert redis.command("HGET", keys[9], "company") == "0"
        print("PASS: tier transitions and missing allocation metadata require review")

    finally:
        assert all(key.startswith(prefix) for key in keys)
        redis.command("DEL", *keys)
        redis.close()


if __name__ == "__main__":
    main()
