"""Actual application Lua against disposable CI Redis only; no payments or production access."""
import concurrent.futures
import os
from pathlib import Path
import re
import uuid
from test_form_opportunity_redis import Redis

def main():
    if os.environ.get("MARKTMORGEN_REDIS_INTEGRATION") != "1":
        raise RuntimeError("Dedicated loopback CI Redis required")
    source = (Path(__file__).resolve().parents[1] / "lib/headline-test-atomic.ts").read_text()
    match = re.search(r"export const RECORD_TEST_SALE = `([^`]+)`;", source)
    assert match and "${" not in match.group(1)
    script = match.group(1)
    prefix = "marktmorgen:integration:ab-sale:" + uuid.uuid4().hex + ":"
    db = Redis()
    def call(marker, cents=4900, square=24010000, version="b"):
        conn = Redis()
        try:
            return conn.command("EVAL", script, 2, prefix+"counts", prefix+marker, version, cents, square)
        finally:
            conn.close()
    try:
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            assert sum(pool.map(lambda _:call("same"), range(64))) == 1
            assert sum(pool.map(lambda i:call("order"+str(i)), range(64))) == 64
        assert db.command("HMGET",prefix+"counts","sb","rb","qb") == ["65",str(65*4900),str(65*24010000)]
        assert 3455990 <= db.command("TTL",prefix+"same") <= 3456000
        assert 34559990 <= db.command("TTL",prefix+"counts") <= 34560000
        # Discard a successful response; replay sees the completed atomic record.
        call("lost")
        assert call("lost") == 0
        assert db.command("HGET",prefix+"counts","sb") == "66"
        db.command("SET",prefix+"legacy","1","EX",3456000)
        assert call("legacy") == 0
        for bad in ["NaN","-1","1.5","9007199254740991","9223372036854775807"]:
            db.command("DEL",prefix+"counts")
            db.command("HSET",prefix+"counts","sb","2","rb","9800","qb",bad)
            assert call("bad") == -1
            assert db.command("HMGET",prefix+"counts","sb","rb","qb") == ["2","9800",bad]
            assert db.command("EXISTS",prefix+"bad") == 0
            assert db.command("HGET",prefix+"counts","invalid") == "1"
        db.command("DEL",prefix+"counts")
        assert call("large",100000000,"overflow") == -1
        assert db.command("EXISTS",prefix+"large") == 0
        db.command("DEL",prefix+"counts")
        db.command("SET",prefix+"counts","wrong-type")
        assert call("type") == -1
        assert db.command("GET",prefix+"counts") == "wrong-type"
        assert db.command("EXISTS",prefix+"type") == 0
        db.command("DEL",prefix+"counts")
        db.command("HSET",prefix+"wrongmarker","field","value")
        assert call("wrongmarker") == -1
        assert db.command("EXISTS",prefix+"counts") == 0
        assert call("invalid-version",version="c") == -1
        assert db.command("EXISTS",prefix+"invalid-version") == 0
        # New record plus bounded failure flag fits its existing 1 KiB room charge.
        assert call("room") == 1
        db.command("HSET",prefix+"counts","va","1000","vb","1000","ca","100","cb","100","sa","99","ra","999999","qa","99999999999","t0","1792400000000","invalid","1")
        assert db.command("MEMORY","USAGE",prefix+"counts") <= 1024
        print("Actual Redis: concurrent dedupe, totals, response-loss replay, legacy markers, preflight failures, TTLs and 1 KiB room passed")
    finally:
        keys=db.command("KEYS",prefix+"*")
        if keys:
            db.command("DEL",*keys)
        db.close()

if __name__ == "__main__":
    main()
