"""Execute the automatic ledger-opening Lua (AI spend and uploads) against the
disposable loopback CI Redis, followed by the unchanged reservation Lua.
No application credentials or production host configuration are read.
"""
import concurrent.futures
import os
from pathlib import Path
import re
import uuid
from test_form_opportunity_redis import Redis

ROOT = Path(__file__).resolve().parents[1]


def static(file, name):
    source = (ROOT / file).read_text(encoding="utf-8")
    match = re.search(r"export const " + name + r" = `([^`]+)`;", source)
    if not match or "${" in match.group(1):
        raise RuntimeError("Expected static application script " + name)
    return match.group(1)


def main():
    if os.environ.get("MARKTMORGEN_REDIS_INTEGRATION") != "1":
        raise RuntimeError("Run only against dedicated CI Redis on loopback port 16379")
    open_ai = static("lib/ai-spend.ts", "OPEN_AI_SPEND_LEDGER")
    reserve_ai = static("lib/ai-spend.ts", "RESERVE_AI_SPEND")
    open_upload = static("lib/upload-budget.ts", "OPEN_UPLOAD_BUDGET")
    reserve_upload = static("lib/upload-budget.ts", "RESERVE_UPLOAD_BUDGET")
    prefix = "marktmorgen:integration:spend-open:" + uuid.uuid4().hex + ":{t}:"
    used = []
    redis = Redis()

    def pair():
        n = len(used)
        ledger, marker = prefix + "ledger" + str(n), prefix + "ledger" + str(n) + ":opened"
        used.extend([ledger, marker])
        return ledger, marker

    def all_fields(key):
        flat = redis.command("HGETALL", key)
        return dict(zip(flat[::2], flat[1::2]))

    funded = [5, 5, 5, 0, 0, 0]

    def open_ai_ledger(client, ledger, marker, policy="snap-1", review="automatic_cost", counts=funded):
        return client.command("EVAL", open_ai, 2, ledger, marker, review, policy, *counts)

    def take_ai(client, ledger, store="one", charge=100, limit=300, company=1500, policy="snap-1", tier="pro", fund=5, review="automatic_cost"):
        return client.command("EVAL", reserve_ai, 1, ledger, review, "store:" + store, charge, limit, company, policy, tier, fund)

    try:
        assert redis.command("PING") == "PONG"

        ledger, marker = pair()
        assert open_ai_ledger(redis, ledger, marker) == 1
        fields = all_fields(ledger)
        assert fields["review"] == "automatic_cost" and fields["policy"] == "snap-1" and fields["company"] == "0"
        assert fields["slots:pro"] == "5" and fields["funded:pro"] == "5" and fields["slots:trial"] == "0"
        assert redis.command("TTL", ledger) == -1 and redis.command("TTL", marker) == -1
        before = all_fields(ledger)
        assert open_ai_ledger(redis, ledger, marker) == 1
        assert all_fields(ledger) == before
        assert take_ai(redis, ledger) == 1
        print("PASS: AI month opens once, without expiry, and the unchanged reservation then spends")

        def race(index):
            client = Redis()
            try:
                return open_ai_ledger(client, *race_keys) + take_ai(client, race_keys[0], store="s" + str(index))
            finally:
                client.close()
        race_keys = pair()
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            results = list(pool.map(race, range(64)))
        assert sum(1 for r in results if r == 2) == 5, results
        assert redis.command("HGET", race_keys[0], "slots:pro") == "0"
        assert redis.command("HGET", race_keys[0], "company") == "500"
        print("PASS: 64 concurrent first calls open one ledger and claim exactly the funded allocations")

        redis.command("DEL", ledger)
        assert open_ai_ledger(redis, ledger, marker) == 0
        assert redis.command("EXISTS", ledger) == 0
        assert take_ai(redis, ledger) == 0
        print("PASS: a lost ledger whose month was opened is never recreated empty")

        ledger, marker = pair()
        redis.command("HSET", ledger, "review", "separately_reviewed", "policy", "theirs", "company", 0, "slots:pro", 1)
        before = all_fields(ledger)
        assert open_ai_ledger(redis, ledger, marker) == 0
        assert all_fields(ledger) == before
        ledger, marker = pair()
        redis.command("SET", ledger, "wrong-type")
        assert open_ai_ledger(redis, ledger, marker) == 0
        ledger, marker = pair()
        assert open_ai_ledger(redis, ledger, marker) == 1
        redis.command("EXPIRE", ledger, 3600)
        before = all_fields(ledger)
        assert open_ai_ledger(redis, ledger, marker, policy="snap-2") == 0
        assert all_fields(ledger) == before
        print("PASS: other reviews, wrong types and expiring ledgers are refused and left as they are")

        ledger, marker = pair()
        assert open_ai_ledger(redis, ledger, marker) == 1
        assert take_ai(redis, ledger, store="a", charge=250) == 1
        assert take_ai(redis, ledger, store="b", charge=50) == 1
        assert open_ai_ledger(redis, ledger, marker, policy="snap-2", counts=[3, 3, 3, 0, 0, 0]) == 1
        fields = all_fields(ledger)
        assert fields["policy"] == "snap-2" and fields["slots:pro"] == "1" and fields["funded:pro"] == "3"
        assert fields["store:a"] == "250" and fields["store:b"] == "50" and fields["company"] == "300"
        assert take_ai(redis, ledger, store="a", charge=100, limit=200, policy="snap-2", fund=3) == 0
        assert take_ai(redis, ledger, store="c", charge=10, policy="snap-2", fund=3) == 1
        assert take_ai(redis, ledger, store="d", charge=10, policy="snap-2", fund=3) == 0
        assert open_ai_ledger(redis, ledger, marker, policy="snap-3", counts=[1, 1, 1, 0, 0, 0]) == 1
        assert redis.command("HGET", ledger, "slots:pro") == "0"
        print("PASS: changed automatic ceilings carry spent amounts and claimed allocations; lower ceilings refuse")

        ledger, marker = pair()
        assert open_ai_ledger(redis, ledger, marker) == 1
        for corrupt in ("-1", "01", "NaN", "9"):
            redis.command("HSET", ledger, "slots:pro", corrupt)
            before = all_fields(ledger)
            assert open_ai_ledger(redis, ledger, marker, policy="snap-2") == 0
            assert all_fields(ledger) == before
        redis.command("HSET", ledger, "slots:pro", 5)
        redis.command("HDEL", ledger, "funded:scale")
        before = all_fields(ledger)
        assert open_ai_ledger(redis, ledger, marker, policy="snap-2") == 0
        assert all_fields(ledger) == before
        assert open_ai_ledger(redis, *pair(), counts=[1, 1, "x", 0, 0, 0]) == 0
        print("PASS: corrupt allocation metadata or arguments refuse without writes")

        scopes_funded = [2, 2, 2, 0, 0, 0]

        def open_up(client, ledger, marker, policy="up-1", counts=scopes_funded):
            return client.command("EVAL", open_upload, 2, ledger, marker, "automatic_cost", policy, *counts)

        def take_up(client, ledger, store="s1", size=5, policy="up-1", fund=2, scope="pro"):
            return client.command("EVAL", reserve_upload, 1, ledger, policy, store, scope, "open", size, 3, 10, 9, 6, 20, 18, fund)

        ledger, marker = pair()
        assert open_up(redis, ledger, marker) == 1
        fields = all_fields(ledger)
        assert fields["company:bytes"] == "0" and fields["slots:pro"] == "2" and fields["funded:pro"] == "2"
        assert take_up(redis, ledger) == 1 and take_up(redis, ledger, size=6) == 0 and take_up(redis, ledger, size=5) == 1
        assert open_up(redis, ledger, marker, policy="up-2", counts=[4, 4, 4, 0, 0, 0]) == 1
        fields = all_fields(ledger)
        assert fields["slots:pro"] == "3" and fields["store:s1:bytes"] == "10" and fields["company:bytes"] == "10"
        assert take_up(redis, ledger, size=1, policy="up-2", fund=4) == 0
        redis.command("DEL", ledger)
        assert open_up(redis, ledger, marker) == 0 and redis.command("EXISTS", ledger) == 0
        ledger, marker = pair()
        redis.command("HSET", ledger, "policy", "reviewed", "company:opens", 0, "company:bytes", 0, "company:controls", 0, "slots:pro", 1)
        before = all_fields(ledger)
        assert open_up(redis, ledger, marker) == 0 and all_fields(ledger) == before
        print("PASS: upload months open once, carry counters on change, and never recreate or touch reviewed ledgers")
    finally:
        assert all(key.startswith(prefix) for key in used)
        if used:
            redis.command("DEL", *used)
        redis.close()


if __name__ == "__main__":
    main()
