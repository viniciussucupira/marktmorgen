"""Exercise the actual order admission Lua (lib/order-admission.ts) against disposable local CI Redis.
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
    admit = script(root / "lib/order-admission.ts", "ADMIT_ORDERS")
    settle = script(root / "lib/order-admission.ts", "SETTLE_ADMITTED")
    prefix = "marktmorgen:integration:orders:" + uuid.uuid4().hex + ":"
    count, held = prefix + "n", prefix + "open"
    hour = 500_000
    keep = 26 * 3600
    redis = Redis()

    def take(client, n=1, at=hour, limit=10):
        return client.command("EVAL", admit, 2, count, held, limit, n, at, at - 24, keep)

    def race(work, total=64):
        def run(index):
            client = Redis()
            try:
                return work(client, index)
            finally:
                client.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            return list(pool.map(run, range(total)))

    try:
        assert redis.command("PING") == "PONG"
        results = race(lambda client, _: take(client))
        assert sum(1 for r in results if r == 1) == 10 and all(r in (0, 1) for r in results)
        assert int(redis.command("HGET", held, str(hour))) == 10
        assert 0 < redis.command("TTL", held) <= keep
        print("PASS: concurrent checkouts are admitted up to the figure and no further")

        redis.command("DEL", held)
        redis.command("SET", count, 7)
        assert take(redis, n=3) == 1 and take(redis) == 0
        print("PASS: the month's counted orders and the open checkouts are added together")

        assert redis.command("EVAL", settle, 1, held, str(hour), 1) == 1
        assert int(redis.command("HGET", held, str(hour))) == 2
        assert redis.command("EVAL", settle, 1, held, str(hour), 5) == 1
        assert redis.command("HEXISTS", held, str(hour)) == 0
        assert redis.command("EVAL", settle, 1, held, str(hour), 1) == 0
        print("PASS: a counted order gives its hour back, never below zero")

        redis.command("SET", count, 0)
        redis.command("HSET", held, str(hour - 30), 9, str(hour - 3), 4)
        assert take(redis, n=6, at=hour) == 1
        assert redis.command("HEXISTS", held, str(hour - 30)) == 0
        assert take(redis, n=1, at=hour) == 0
        print("PASS: checkouts older than a day fall out of the window by themselves")

        redis.command("SET", count, "not-a-number")
        assert take(redis) == -1
        redis.command("SET", count, 0)
        assert redis.command("EVAL", admit, 2, count, held, 10, 0, hour, hour - 24, keep) == -1
        print("PASS: an unreadable count or a malformed request admits nothing")
    finally:
        redis.command("DEL", count, held)
        redis.close()


if __name__ == "__main__":
    main()
