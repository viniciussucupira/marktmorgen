"""Run the actual bounded pre-order read script only against disposable loopback CI Redis."""
import os
from pathlib import Path
import re
import uuid
from test_crm_pipelines_redis import Redis


def main():
    if os.environ.get("MARKTMORGEN_REDIS_INTEGRATION") != "1":
        raise RuntimeError("Requires dedicated disposable CI Redis on loopback port16379")
    source = (Path(__file__).resolve().parents[1] / "lib/dispute-preorder-review.ts").read_text(encoding="utf-8")
    match = re.search(r"export const PREORDER_REVIEW_READ = '([^']+)';", source)
    if not match:
        raise RuntimeError("Expected the application's exact static read script")
    script = match.group(1)
    assert set(re.findall(r'redis.call\("([A-Z]+)"', script)) == {"HGET", "PTTL"}
    prefix = "marktmorgen:integration:dispute-preorder:" + uuid.uuid4().hex + ":"
    keys = [prefix + name for name in ("one", "missing", "large", "wrongtype")]
    client = Redis()
    try:
        original = '{"to":"buyer@example.test","at":100,"pi":"pi_fixture","given":120}'
        client.command("HSET", keys[0], "cs_fixture", original, "cs_other", "foreign fixture")
        client.command("PEXPIRE", keys[0], 60000)
        before = client.command("PTTL", keys[0])
        reply = client.command("EVAL", script, 1, keys[0], "cs_fixture")
        after = client.command("PTTL", keys[0])
        assert reply[:2] == [1, original]
        assert 0 < after <= reply[2] <= before <= 60000
        assert client.command("HGET", keys[0], "cs_fixture") == original
        assert client.command("HGET", keys[0], "cs_other") == "foreign fixture"
        assert client.command("EVAL", script, 1, keys[0], "cs_missing")[0:2] == [0, ""]
        assert client.command("EVAL", script, 1, keys[1], "cs_fixture") == [0, "", -2]
        assert client.command("EXISTS", keys[1]) == 0
        print("PASS: exact row only; original/foreign values preserved; no TTL extension or missing-key creation")
        client.command("HSET", keys[2], "cs_fixture", "x" * 1025)
        client.command("PEXPIRE", keys[2], 60000)
        reply = client.command("EVAL", script, 1, keys[2], "cs_fixture")
        assert reply[:2] == [2, ""]
        assert client.command("HSTRLEN", keys[2], "cs_fixture") == 1025
        print("PASS: oversized source text is not returned or truncated")
        client.command("SET", keys[3], "unchanged")
        try:
            client.command("EVAL", script, 1, keys[3], "cs_fixture")
        except RuntimeError as error:
            assert "WRONGTYPE" in str(error)
        else:
            raise AssertionError("Wrong-type storage must fail closed")
        assert client.command("GET", keys[3]) == "unchanged"
        print("PASS: wrong-type storage fails and stays unchanged")
    finally:
        assert all(key.startswith(prefix) for key in keys)
        client.command("DEL", *keys)
        client.close()


if __name__ == "__main__":
    main()
