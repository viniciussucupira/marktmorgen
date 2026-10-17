"""Exercise the actual capped count Lua (lib/capped-count.ts) against disposable local CI Redis.
No application credentials or production host configuration are read.
"""
import concurrent.futures
import os
from pathlib import Path
import re
import uuid
from test_form_opportunity_redis import Redis


def script(path, name):
    source = Path(path).read_text(encoding="utf-8")
    match = re.search(r"export const " + name + r" = `([^`]+)`;", source)
    if not match or "${" in match.group(1):
        raise RuntimeError("Expected static application script " + name)
    return match.group(1)


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
