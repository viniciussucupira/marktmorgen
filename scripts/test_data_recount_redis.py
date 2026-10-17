"""Exercise the actual one-time recount page Lua (lib/data-recount.ts, RECOUNT_PAGE) against disposable local CI Redis.

A page's measure is added once, and only from where the job is; a page read
from a cursor the job has moved past adds nothing. Runs pages from many
clients at once to show that a page is never added twice.
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
    page = script(root / "lib/data-recount.ts", "RECOUNT_PAGE")
    base = "marktmorgen:integration:recount:" + uuid.uuid4().hex
    state, sums = base + ":state", base + ":sum"
    redis = Redis()

    def run(client, start, after, *pairs):
        return client.command("EVAL", page, 2, state, sums, start, after, *pairs)

    try:
        assert redis.command("PING") == "PONG"
        assert run(redis, "0", "5", "store-a", 100) == 0
        assert redis.command("EXISTS", sums) == 0
        print("PASS: nothing is added before the job is reading the database")

        redis.command("HSET", state, "phase", "scan", "cursor", "0")
        assert run(redis, "0", "5", "store-a", 100, "store-b", 7) == 1
        assert run(redis, "0", "5", "store-a", 100) == 0
        assert redis.command("HGET", sums, "store-a") == "100" and redis.command("HGET", state, "cursor") == "5"
        print("PASS: a page is added once, and one read from a cursor already passed adds nothing")

        assert run(redis, "5", "9", "store-a", "x") == -1 and run(redis, "5", "9", "store-a") == -1
        assert redis.command("HGET", state, "cursor") == "5"
        print("PASS: a malformed page writes nothing")

        def race(_):
            client = Redis()
            try:
                return run(client, "5", "11", "store-a", 1)
            finally:
                client.close()

        with concurrent.futures.ThreadPoolExecutor(max_workers=12) as pool:
            answers = list(pool.map(race, range(24)))
        assert answers.count(1) == 1 and redis.command("HGET", sums, "store-a") == "101"
        print("PASS: two dozen runs at once add the same page once")

        assert run(redis, "11", "0", "store-c", 3) == 1
        assert redis.command("HGET", state, "phase") == "apply" and redis.command("HGET", state, "cursor") == "0"
        assert run(redis, "0", "0", "store-c", 3) == 0
        print("PASS: the last page moves the job on to setting the rooms, and the walk cannot be added to after")
    finally:
        redis.command("DEL", state, sums)
        redis.close()


if __name__ == "__main__":
    main()
