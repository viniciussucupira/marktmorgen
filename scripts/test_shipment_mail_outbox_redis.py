"""Run the actual shipment outbox Lua on disposable loopback Redis only.
No application credential, provider call, real recipient or account is used.
"""
import concurrent.futures
import json
import os
from pathlib import Path
import re
import socket
import uuid
from test_form_opportunity_redis import Redis


class LocalRedis(Redis):
    def __init__(self):
        port = int(os.environ.get("MARKTMORGEN_SHIPMENT_REDIS_PORT", "16379"))
        if not 1024 <= port <= 65535:
            raise RuntimeError("Dedicated loopback Redis port required")
        self.sock = socket.create_connection(("127.0.0.1", port), timeout=10)
        self.stream = self.sock.makefile("rb")


def main():
    if os.environ.get("MARKTMORGEN_REDIS_INTEGRATION") != "1":
        raise RuntimeError("Run only against disposable loopback CI Redis")
    root = Path(__file__).resolve().parents[1]
    source = (root / "lib/shipment-mail-outbox.ts").read_text(encoding="utf-8")
    match = re.search(r"export const SHIPMENT_MAIL_SCRIPT = `([^`]+)`;", source)
    assert match and "${" not in match.group(1)
    script = match.group(1)
    prefix = "marktmorgen:integration:shipment-mail:" + uuid.uuid4().hex + ":"
    redis = LocalRedis()
    made = set()
    now = 1_790_000_000_000
    policy = dict(reviewId="SYNTHETIC", evidence="SYNTHETIC ONLY", ongoingStorageFunded=True,
                  emptyInitializationVerified=True, globalItems=10, globalBytes=1_000_000,
                  storeItems=10, storeBytes=1_000_000, maxPayloadBytes=60_000,
                  maximumChecks=100, retryMilliseconds=60_000, admissionsUntil=now + 999_000_000)

    def fixture(name, store="one", person="person", **changes):
        row = dict(id=name, statsId=store, session="cs_test_" + name,
                   person=person, sourceValue=json.dumps(dict(at=now // 1000, tracking="")),
                   sealed="s1.synthetic.nonce.protected-payload", fingerprint="a" * 64,
                   bytes=12_000, created=now, authorizedAt=now, next=now, state="queued", owner="", leaseUntil=0,
                   checks=0, reviewId="SYNTHETIC")
        row.update(changes)
        keys = [prefix + "row:" + name, prefix + "source:" + name, prefix + "due",
                prefix + "store:" + store, prefix + "person:" + store + ":" + person,
                prefix + "pool", prefix + "pool:" + store, prefix + "all",
                prefix + "closed:" + store, prefix + "erased:" + store + ":" + person]
        made.update(keys)
        return row, keys

    def run(op, row, keys, expected="", at=now, owner="owner", p=policy, client=redis):
        return client.command("EVAL", script, 10, *keys, op, expected, json.dumps(row), at,
                              131_072, json.dumps(p), owner)

    def stats():
        out = {}
        for line in redis.command("INFO", "COMMANDSTATS").splitlines():
            m = re.match(r"cmdstat_([^:]+):calls=(\d+),", line)
            if m and m[1] != "info":
                out[m[1]] = int(m[2])
        return out

    def measured(fn, ceiling):
        before = stats()
        result = fn()
        after = stats()
        count = sum(n - before.get(cmd, 0) for cmd, n in after.items())
        assert count <= ceiling, (count, ceiling, result)
        return result, count

    try:
        row, keys = fixture("first")
        reply, count = measured(lambda: run("enqueue", row, keys), 27)
        assert reply == ["queued", json.dumps(row)]
        assert redis.command("TTL", keys[0]) == -1
        assert redis.command("TTL", keys[1]) == -1
        assert redis.command("HGET", keys[5], "items") == "1"
        memory = sum(redis.command("MEMORY", "USAGE", key, "SAMPLES", "0") or 0 for key in keys)
        assert memory <= row["bytes"], (memory, row["bytes"])
        print("PASS: source, protected row and bounded indices are one durable write; billed commands", count)

        duplicate = run("enqueue", row, keys)
        assert duplicate[0] == "existing"
        assert redis.command("HGET", keys[5], "items") == "1"
        blocked, blocked_keys = fixture("no-room")
        assert run("enqueue", blocked, blocked_keys, p={**policy, "globalItems": 1}) == ["full"]
        assert redis.command("EXISTS", blocked_keys[0], blocked_keys[1]) == 0
        assert run("enqueue", blocked, blocked_keys, p={**policy, "globalBytes": 12_001}) == ["full"]
        print("PASS: duplicate/lost enqueue ACK cannot spend another slot; full budgets create no shipment mark")

        claim, count = measured(lambda: run("claim", row, keys, duplicate[1], owner="a" * 48), 16)
        assert claim[0] == "preparing"
        claimed = json.loads(claim[1])
        later = now + 2 * 60_000
        second = run("claim", claimed, keys, claim[1], at=later, owner="b" * 48)
        assert second[0] == "preparing"
        assert run("dispatch", claimed, keys, claim[1], at=later, owner="a" * 48)[0] == "changed"
        current = json.loads(second[1])
        barrier, count = measured(lambda: run("dispatch", current, keys, second[1], at=later, owner="b" * 48), 16)
        assert barrier[0] == "dispatching"
        held = json.loads(barrier[1])
        assert run("claim", held, keys, barrier[1], at=later + 73 * 3_600_000)[0] == "held"
        assert redis.command("ZSCORE", keys[2], row["id"]) is None
        assert redis.command("EXISTS", keys[0]) == 1
        print("PASS: lease recovers only pre-dispatch preparation; a lost dispatch ACK stays held beyond 72h")

        accepted, count = measured(lambda: run("accepted", held, keys, barrier[1], at=later, owner="b" * 48), 27)
        assert accepted == ["accepted"]
        assert redis.command("EXISTS", keys[0]) == 0 and redis.command("EXISTS", keys[1]) == 1
        assert 34_559_900 <= redis.command("TTL", keys[1]) <= 34_560_000
        assert redis.command("HGET", keys[5], "bytes") == "0"
        assert redis.command("EXISTS", keys[6]) == 0
        assert run("enqueue", row, keys)[0] == "legacy"
        print("PASS: accepted email removes payload and reservations; its source prevents another automatic send; commands", count)

        r, k = fixture("erase")
        fresh = run("enqueue", r, k)
        c = run("claim", r, k, fresh[1], owner="c" * 48)
        preparing = json.loads(c[1])
        canceled = run("cancel", preparing, k, c[1], p=None)
        assert canceled == ["canceled"]
        assert run("dispatch", preparing, k, c[1], owner="c" * 48)[0] == "missing"
        assert redis.command("SMEMBERS", k[4]) == []
        print("PASS: erasure before dispatch destroys payload, removes indices and blocks a stale worker")

        r, k = fixture("old")
        original = run("enqueue", r, k)
        c = run("claim", r, k, original[1], owner="d" * 48)
        preparing = json.loads(c[1])
        waiting = run("defer", preparing, k, c[1], owner="d" * 48)
        pending = json.loads(waiting[1])
        assert run("claim", pending, k, waiting[1], at=now + 73 * 3_600_000, owner="e" * 48)[0] == "preparing"
        print("PASS: known no-send work resumes after 24/72h without a checkout or expiring provider idempotency key")

        # Closing admissions stops only new obligations, not the separately
        # funded drain. A successor review must name the old one explicitly.
        r, k = fixture("review-continuation", store="continuation")
        enqueued = run("enqueue", r, k)
        successor = {**policy, "reviewId": "NEXT", "admissionsUntil": now - 1}
        assert run("claim", r, k, enqueued[1], p=successor)[0] == "unknown"
        successor["continuedReviewIds"] = ["SYNTHETIC"]
        resumed = run("claim", r, k, enqueued[1], p=successor)
        assert resumed[0] == "preparing" and json.loads(resumed[1])["reviewId"] == "NEXT"
        print("PASS: funded pending work drains after admissions close and only across an explicitly reviewed successor")

        r, k = fixture("last-preparation", store="last")
        enqueued = run("enqueue", r, k, p={**policy, "maximumChecks": 1})
        last = run("claim", r, k, enqueued[1], p={**policy, "maximumChecks": 1})
        assert redis.command("ZSCORE", k[2], r["id"]) is not None
        held = run("claim", json.loads(last[1]), k, last[1], at=now + 61_000, p={**policy, "maximumChecks": 1})
        assert held[0] == "queued" and json.loads(held[1])["next"] == 0
        assert redis.command("ZSCORE", k[2], r["id"]) is None
        print("PASS: the final abandoned preparation becomes an explicit on-hold record, never a phantom queued retry")

        r, k = fixture("old-producer", store="deleted")
        redis.command("SET", k[9], "erasure-generation")
        assert run("enqueue", r, k) == ["unknown"]
        assert redis.command("EXISTS", k[0], k[1]) == 0
        redis.command("DEL", k[9])
        assert run("enqueue", r, k, at=now + 600_001) == ["unknown"]
        print("PASS: erasure fences block an old producer, and its admission expires before a completed fence can disappear")

        r, k = fixture("erase-before-post", store="post-erased")
        enqueued = run("enqueue", r, k)
        prepared = run("claim", r, k, enqueued[1])
        redis.command("SET", k[8], "store-closing-generation")
        assert run("dispatch", json.loads(prepared[1]), k, prepared[1])[0] == "held"
        assert run("cancel", json.loads(prepared[1]), k, prepared[1], p=None) == ["canceled"]
        print("PASS: store/person deletion that wins before the dispatch barrier prevents the provider POST")

        parallel, parallel_keys = fixture("parallel", store="two")
        def attempt(_):
            client = LocalRedis()
            try:
                return run("enqueue", parallel, parallel_keys, client=client)[0]
            finally:
                client.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
            outcomes = list(pool.map(attempt, range(16)))
        assert outcomes.count("queued") == 1 and outcomes.count("existing") == 15
        print("PASS: sixteen concurrent producers have exactly one durable owner")

        wrong, wrong_keys = fixture("wrong", store="wrong")
        redis.command("RPUSH", wrong_keys[0], "wrong type")
        assert run("enqueue", wrong, wrong_keys) == ["unknown"]
        assert redis.command("EXISTS", wrong_keys[1]) == 0
        print("PASS: wrong types never authorize source writes or provider work")

        large, large_keys = fixture("b" * 64, store="s" * 128, person="c" * 64,
                                    session="cs_test_" + "q" * 200, sealed="s1." + "x" * 80_040,
                                    sourceValue=json.dumps(dict(at=now // 1000, tracking="https://example.test/" + "t" * 470)))
        large["bytes"] = len(json.dumps(large).encode()) + 2 * sum(len(key.encode()) for key in large_keys) + 8_192
        assert run("enqueue", large, large_keys)[0] == "queued"
        memory = sum(redis.command("MEMORY", "USAGE", key, "SAMPLES", "0") or 0 for key in large_keys)
        assert memory <= large["bytes"], (memory, large["bytes"])
        print("PASS: large ciphertext and long ownership keys fit the synthetic pre-write memory reservation; no monetary funding is inferred")

        for malformed in ["24000.0", "024000", "2.4e4", "9007199254740992"]:
            corrupt, corrupt_keys = fixture("shape-" + re.sub(r"\W", "", malformed), store="corrupt")
            current = run("enqueue", corrupt, corrupt_keys)
            before = redis.command("HGET", corrupt_keys[5], "items")
            before_bytes = redis.command("HGET", corrupt_keys[5], "bytes")
            redis.command("HSET", corrupt_keys[5], "bytes", malformed)
            assert run("cancel", corrupt, corrupt_keys, current[1], p=None) == ["canceled"]
            assert redis.command("HGET", corrupt_keys[5], "items") == before
            assert redis.command("HGET", corrupt_keys[5], "bytes") == malformed
            assert run("cancel", corrupt, corrupt_keys, current[1], p=None) == ["missing"]
            assert redis.command("HGET", corrupt_keys[5], "items") == before
            # Restore only this synthetic ledger for the next independent case.
            redis.command("HSET", corrupt_keys[5], "bytes", before_bytes)
        print("PASS: noncanonical integer pools cannot partially refund slots; erasure retains uncertain reserves on repeated calls")

        unknown, unknown_keys = fixture("unknown-pool", store="three")
        enrolled = run("enqueue", unknown, unknown_keys)
        redis.command("HSET", unknown_keys[5], "bytes", "not-a-number")
        assert run("cancel", unknown, unknown_keys, enrolled[1], p=None) == ["canceled"]
        assert redis.command("EXISTS", unknown_keys[0]) == 0
        assert redis.command("HGET", unknown_keys[5], "bytes") == "not-a-number"
        print("PASS: privacy erasure removes payload even if financial evidence is corrupt; unknown reserve is never released")
    finally:
        if made:
            redis.command("DEL", *sorted(made))
        redis.close()


if __name__ == "__main__":
    main()
