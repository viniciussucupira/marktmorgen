"""Exercise the actual funnel share link and saved section Lua against disposable local CI Redis.
No application credentials or production host configuration are read.
"""
import concurrent.futures
import json
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
    share = script(root / "lib/funnel-share-store.ts", "CREATE_SHARE")
    section = script(root / "lib/saved-block-store.ts", "SAVE_SECTION")
    rules = (root / "lib/funnel-share-rules.ts").read_text(encoding="utf-8")
    cap = int(re.search(r"creator: \{ shares: (\d+),", rules).group(1))
    sections_cap = int(re.search(r"creator: \{ shares: \d+, savedBlocks: (\d+),", rules).group(1))
    prefix = "marktmorgen:integration:fshare:" + uuid.uuid4().hex + ":"
    keys = [prefix + str(i) for i in range(8)]
    redis = Redis()

    def create(client, list_key, index, ttl=60):
        lookup = prefix + "lookup:" + list_key[-1] + ":" + str(index)
        meta = json.dumps({"id": str(index).zfill(12)})
        return client.command("EVAL", share, 2, list_key, lookup, str(index).zfill(12), meta, "{}", "{}", "{}", cap, ttl), lookup

    def race(work, count=64):
        def run(index):
            client = Redis()
            try:
                return work(client, index)
            finally:
                client.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            return list(pool.map(run, range(count)))

    made = []
    try:
        assert redis.command("PING") == "PONG"
        results = race(lambda client, index: create(client, keys[0], index))
        made.extend(lookup for _, lookup in results)
        assert sum(1 for result, _ in results if result == 1) == cap
        assert redis.command("HLEN", keys[0]) == cap
        live = [lookup for result, lookup in results if result == 1]
        assert all(redis.command("HGET", lookup, "bundle") == "{}" for lookup in live)
        assert all(0 < redis.command("TTL", lookup) <= 60 for lookup in live)
        assert all(redis.command("EXISTS", lookup) == 0 for result, lookup in results if result != 1)
        print("PASS: concurrent share links respect the plan's cap; each snapshot expires with its link")

        result, lookup = create(redis, keys[1], 1)
        made.append(lookup)
        assert result == 1
        again, _ = create(redis, keys[1], 1)
        assert again == -2
        assert redis.command("HLEN", keys[1]) == 1
        print("PASS: a link can never be written over an existing one")

        redis.command("SET", keys[2], "wrong-type")
        result, lookup = create(redis, keys[2], 1)
        made.append(lookup)
        assert result == -3 and redis.command("EXISTS", lookup) == 0
        print("PASS: wrong-type storage refuses without writing a snapshot")

        def save(client, key, index, action="new"):
            identity = str(index).zfill(10)
            return client.command("EVAL", section, 1, key, identity, json.dumps({"id": identity}), sections_cap, action)
        assert sum(1 for result in race(lambda client, index: save(client, keys[3], index)) if result == 1) == sections_cap
        assert redis.command("HLEN", keys[3]) == sections_cap
        held = redis.command("HKEYS", keys[3])[0]
        assert save(redis, keys[3], int(held), "edit") == 1
        assert redis.command("HLEN", keys[3]) == sections_cap
        print("PASS: concurrent saved sections respect the plan's cap; edits remain possible at capacity")

        assert save(redis, keys[4], 1) == 1
        redis.command("HDEL", keys[4], "0000000001")
        assert save(redis, keys[4], 1, "edit") == -2
        assert redis.command("HLEN", keys[4]) == 0
        redis.command("SET", keys[5], "wrong-type")
        assert save(redis, keys[5], 1) == -3
        print("PASS: a removed section is never resurrected by an edit; wrong-type storage refuses")
    finally:
        cleanup = keys + made
        assert all(key.startswith(prefix) for key in cleanup)
        redis.command("DEL", *cleanup)
        redis.close()


if __name__ == "__main__":
    main()
