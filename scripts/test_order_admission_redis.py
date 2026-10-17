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
    count, held, room, holding = prefix + "n", prefix + "open", prefix + "data", prefix + "open:b"
    hour = 500_000
    keep = 26 * 3600
    redis = Redis()

    def take(client, n=1, at=hour, limit=10, space=10**9, per=4096):
        return client.command("EVAL", admit, 4, count, held, room, holding, limit, n, at, at - 24, keep, space, n * per)

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
        assert int(redis.command("HGET", holding, str(hour))) == 10 * 4096
        assert 0 < redis.command("TTL", held) <= keep and 0 < redis.command("TTL", holding) <= keep
        print("PASS: concurrent checkouts are admitted up to the figure and no further")

        redis.command("DEL", held, holding)
        redis.command("SET", count, 7)
        assert take(redis, n=3) == 1 and take(redis) == 0
        print("PASS: the month's counted orders and the open checkouts are added together")

        assert redis.command("EVAL", settle, 2, held, holding, str(hour), 1, 4096) == 1
        assert int(redis.command("HGET", held, str(hour))) == 2
        assert int(redis.command("HGET", holding, str(hour))) == 2 * 4096
        assert redis.command("EVAL", settle, 2, held, holding, str(hour), 5, 10**9) == 1
        assert redis.command("HEXISTS", held, str(hour)) == 0 and redis.command("HEXISTS", holding, str(hour)) == 0
        assert redis.command("EVAL", settle, 2, held, holding, str(hour), 1, 4096) == 0
        assert redis.command("EVAL", settle, 2, held, holding, str(hour), 1, -1) == 0
        print("PASS: a counted order gives its hour and its bytes back, never below zero")

        redis.command("SET", count, 0)
        redis.command("HSET", held, str(hour - 30), 9, str(hour - 3), 4)
        redis.command("HSET", holding, str(hour - 30), 9 * 4096, str(hour - 3), 4 * 4096)
        assert take(redis, n=6, at=hour) == 1
        assert redis.command("HEXISTS", held, str(hour - 30)) == 0 and redis.command("HEXISTS", holding, str(hour - 30)) == 0
        assert take(redis, n=1, at=hour) == 0
        print("PASS: checkouts older than a day fall out of the window by themselves")

        redis.command("SET", count, "not-a-number")
        assert take(redis) == -1
        redis.command("SET", count, 0)
        assert redis.command("EVAL", admit, 4, count, held, room, holding, 10, 0, hour, hour - 24, keep, 10**9, 4096) == -1
        assert redis.command("EVAL", admit, 4, count, held, room, holding, 10, 1, hour, hour - 24, keep, 10**9, -1) == -1
        print("PASS: an unreadable count or a malformed request admits nothing")

        redis.command("DEL", held, holding)
        redis.command("SET", count, 0)
        redis.command("HSET", room, "#", 10_000)
        # Room for 10,000 + 2 x 4,096 bytes: two open checkouts, not three.
        assert take(redis, space=20_000) == 1 and take(redis, space=20_000) == 1
        assert take(redis, space=20_000) == 2
        assert int(redis.command("HGET", held, str(hour))) == 2
        print("PASS: a checkout is held only while the data room has space for every open one's records")

        redis.command("DEL", held, holding)
        # Each checkout holds what its own orders can leave: one large one leaves no space for a small one.
        # 10,000 kept already: 25,000 and 8,000 fit in 45,000, 6,000 more does not, 2,000 does.
        assert take(redis, space=45_000, per=25_000) == 1 and take(redis, space=45_000, per=8_000) == 1
        assert take(redis, space=45_000, per=6_000) == 2 and take(redis, space=45_000, per=2_000) == 1
        assert int(redis.command("HGET", holding, str(hour))) == 35_000
        print("PASS: each checkout holds its own bytes, large or small")

        redis.command("DEL", held, holding)
        results = race(lambda client, _: take(client, space=10_000 + 5 * 4096, limit=1000))
        assert sum(1 for r in results if r == 1) == 5 and all(r in (1, 2) for r in results)
        print("PASS: concurrent checkouts never hold more data room than there is")

        redis.command("HSET", room, "#", "x")
        assert take(redis) == -1
        print("PASS: an unreadable data room admits nothing")
    finally:
        redis.command("DEL", count, held, room, holding)
        redis.close()


if __name__ == "__main__":
    main()
