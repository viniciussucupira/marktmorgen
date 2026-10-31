"""Exercise the actual capped count Lua (lib/capped-count.ts) against disposable local CI Redis.
No application credentials or production host configuration are read.
"""
import concurrent.futures
import os
from pathlib import Path
import random
import re
import uuid
from test_form_opportunity_redis import Redis


def script(path, name):
    source = Path(path).read_text(encoding="utf-8")
    match = re.search(r"export const " + name + r" = `([^`]+)`;", source)
    if not match or "${" in match.group(1):
        raise RuntimeError("Expected static application script " + name)
    return match.group(1)


def reference(hashes, caps, counts):
    """What the script answered before 31 October 2026, re-reading the hash for every count:
    a name already there always counts, a new one only while the hash has fewer fields
    than its most ("~" among them once it is there), the rest under "~"."""
    out = []
    for k, field, by in counts:
        held = hashes[k - 1]
        if field in held or len(held) < caps[k - 1]:
            held[field] = held.get(field, 0) + by
            out.append(held[field])
        else:
            held["~"] = held.get("~", 0) + by
            out.append(0)
    return out


def inside_calls(redis):
    """Commands the server ran, by name: Upstash bills an EVAL as one command plus one
    for every redis.call it runs (upstash.com/docs/redis/overall/billing, read 31/10/2026)."""
    stats = {}
    for line in redis.command("INFO", "commandstats").split("\r\n"):
        match = re.match(r"cmdstat_(\w+):calls=(\d+)", line)
        if match:
            stats[match.group(1)] = int(match.group(2))
    return stats


def main():
    if os.environ.get("MARKTMORGEN_REDIS_INTEGRATION") != "1":
        raise RuntimeError("Run only against dedicated CI Redis on loopback port 16379")
    root = Path(__file__).resolve().parents[1]
    count = script(root / "lib/capped-count.ts", "CAPPED_COUNT")
    prefix = "marktmorgen:integration:capped:" + uuid.uuid4().hex + ":"
    day, life = prefix + "day", prefix + "life"
    redis = Redis()

    def run(client, caps, *counts):
        keys = [day, life][: len(caps)]
        flat = [str(part) for c in counts for part in c]
        return client.command("EVAL", count, len(keys), *keys, *caps, *flat)

    try:
        assert redis.command("PING") == "PONG"
        assert run(redis, [3, 5], (1, "v", 1), (1, "r:a", 1), (2, "r:a", 1)) == [1, 1, 1]
        assert run(redis, [3, 5], (1, "v", 1), (1, "k:x", 1), (1, "k:y", 1)) == [2, 1, 0]
        assert redis.command("HLEN", day) == 4 and int(redis.command("HGET", day, "~")) == 1
        assert run(redis, [3, 5], (1, "k:x", 5), (1, "k:z", 2)) == [6, 0]
        assert int(redis.command("HGET", day, "~")) == 3
        print("PASS: a field there always counts, a new one only below the most, the rest under ~")

        try:
            run(redis, [0], (1, "v", 1))
            raise AssertionError("a most of nothing was taken")
        except RuntimeError:
            pass
        for bad in [[(3, "v", 1)], [(1, "~", 1)], [(1, "", 1)], [(1, "v", "x")], [(1, "v", 1.5)]]:
            before = redis.command("HGETALL", day)
            try:
                run(redis, [3], *bad)
                raise AssertionError("malformed count taken: %r" % (bad,))
            except RuntimeError:
                pass
            assert redis.command("HGETALL", day) == before
        print("PASS: a malformed count writes nothing")

        rng = random.Random(20261031)
        names = ["v", "r:a", "r:b", "k:US", "k:BR", "d:mobile", "m:x", "g:y", "pv:1"]
        for trial in range(400):
            redis.command("DEL", day, life)
            caps = [rng.randint(1, 8), rng.randint(1, 8)]
            hashes = [{}, {}]
            for k, key in ((0, day), (1, life)):
                for name in rng.sample(names + ["~"], rng.randint(0, 9)):
                    value = rng.randint(1, 5)
                    redis.command("HSET", key, name, value)
                    hashes[k][name] = value
            counts = [(rng.randint(1, 2), rng.choice(names), rng.randint(1, 3)) for _ in range(rng.randint(1, 9))]
            expected = reference(hashes, caps, counts)
            got = run(redis, caps, *counts)
            assert got == expected, (trial, caps, counts, got, expected)
            for k, key in ((0, day), (1, life)):
                held = redis.command("HGETALL", key) or []
                assert {held[i]: int(held[i + 1]) for i in range(0, len(held), 2)} == hashes[k], (trial, key)
        print("PASS: 400 random counts, near and past their most, answer and keep exactly what re-reading the hash for every count did")

        # What a store's view sends (lib/stats.ts): nine counts over the day's and the all-time record.
        view = [(1, "v", 1), (1, "r:a", 1), (2, "r:a", 1), (1, "m:x", 1), (2, "m:x", 1), (1, "g:y", 1), (2, "g:y", 1), (1, "k:US", 1), (1, "d:mobile", 1)]
        for label, fill in (("below its most", 0), ("at its most", 100)):
            redis.command("DEL", day, life)
            for i in range(fill):
                redis.command("HSET", day, "f:%d" % i, 1)
            before = inside_calls(redis)
            run(redis, [100, 2100], *view)
            after = inside_calls(redis)
            ran = {name: after.get(name, 0) - before.get(name, 0) for name in ("hexists", "hlen", "hmget", "hincrby", "hget", "hset")}
            # One HINCRBY a count, one HLEN a hash, and one HMGET for a hash a new name may not fit in.
            most = len(view) + 2 + (1 if fill else 0)
            assert sum(ran.values()) <= most and ran["hexists"] == 0, (label, ran)
            print("PASS: a view's nine counts %s run %d commands inside the script (at most %d): %r" % (label, sum(ran.values()), most, ran))

        redis.command("DEL", day)

        def one(index):
            client = Redis()
            try:
                return run(client, [10], (1, "f:%d" % index, 1))[0]
            finally:
                client.close()

        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            results = list(pool.map(one, range(64)))
        # Ten names, and "~" beside them for the other 54.
        assert sum(1 for r in results if r == 1) == 10 and redis.command("HLEN", day) == 11
        assert int(redis.command("HGET", day, "~")) == 54
        print("PASS: concurrent new names never take a hash past its most")
    finally:
        redis.command("DEL", day, life)
        redis.close()


if __name__ == "__main__":
    main()
