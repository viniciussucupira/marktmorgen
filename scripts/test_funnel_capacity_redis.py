"""Exercise actual funnel admission Lua against disposable local CI Redis."""
import concurrent.futures
import os
from pathlib import Path
import re
import uuid
from test_form_opportunity_redis import Redis


def main():
    if os.environ.get("MARKTMORGEN_REDIS_INTEGRATION") != "1":
        raise RuntimeError("Run only against dedicated CI Redis on loopback port 16379")
    root = Path(__file__).resolve().parents[1]
    source = (root / "lib/page-funnel-store.ts").read_text(encoding="utf-8")
    match = re.search(r"export const SAVE_PAGE_FUNNEL = `([^`]+)`;", source)
    if not match or "${" in match.group(1):
        raise RuntimeError("Expected static application funnel script")
    import json
    script = match.group(1)
    cap = int(re.search(r"export const MAX_PAGE_FUNNELS = (\d+);", (root / "lib/page-funnel.ts").read_text()).group(1))
    prefix = "marktmorgen:integration:funnel:" + uuid.uuid4().hex + ":"
    keys = [prefix + str(i) for i in range(5)]
    redis = Redis()
    def save(client, key, index, slug=None, action="new"):
        identity = str(index).zfill(10)
        body = json.dumps({"id": identity, "slug": slug or "journey-" + str(index)})
        return client.command("EVAL", script, 1, key, identity, body, cap, action)
    def race(key, slug=None):
        def work(index):
            client = Redis()
            try:
                return save(client, key, index, slug)
            finally:
                client.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            return list(pool.map(work, range(64)))
    try:
        assert redis.command("PING") == "PONG"
        assert sum(1 for result in race(keys[0]) if result == 1) == cap
        assert redis.command("HLEN", keys[0]) == cap
        held = redis.command("HKEYS", keys[0])[0]
        assert save(redis, keys[0], int(held), "edited-at-cap", "edit") == 1
        assert redis.command("HLEN", keys[0]) == cap
        print("PASS: concurrent funnel creation respects capacity; edits remain possible")

        assert sum(1 for result in race(keys[1], "launch") if result == 1) == 1
        assert redis.command("HLEN", keys[1]) == 1
        assert save(redis, keys[1], 100, "LAUNCH") == -1
        print("PASS: concurrent creations cannot duplicate a case-insensitive address")

        assert save(redis, keys[2], 1) == 1
        original = redis.command("HGET", keys[2], "0000000001")
        assert save(redis, keys[2], 1, "replace") == -2
        assert redis.command("HGET", keys[2], "0000000001") == original
        redis.command("HDEL", keys[2], "0000000001")
        assert save(redis, keys[2], 1, action="edit") == -2
        assert redis.command("HLEN", keys[2]) == 0
        print("PASS: identity collisions and removed records cannot be overwritten or resurrected")

        redis.command("HSET", keys[3], "corrupt", "not-json")
        assert save(redis, keys[3], 1) == -3
        assert redis.command("HLEN", keys[3]) == 1
        redis.command("SET", keys[4], "wrong-type")
        assert save(redis, keys[4], 1) == -3
        assert redis.command("GET", keys[4]) == "wrong-type"
        print("PASS: malformed records and wrong-type storage refuse without writes")
    finally:
        assert all(key.startswith(prefix) for key in keys)
        redis.command("DEL", *keys)
        redis.close()


if __name__ == "__main__":
    main()
