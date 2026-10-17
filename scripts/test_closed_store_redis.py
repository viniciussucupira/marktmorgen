"""Close a store against an isolated local CI Redis.

Runs tests/closing-journey.ts with the application's real Redis client: a
small server answers Upstash's REST pipeline (POST /pipeline) by sending each
command to Redis on loopback port 16379, in a database of its own that is
empty when the check starts and flushed when it ends (the server of
scripts/test_contact_erasure_redis.py). No application credentials or
production host configuration are read; Stripe and the email sender are stood
in for inside the journey, and the file store is an in-memory stand-in, never
the real bucket.

Checked there: a store with a key in every family the registry erases, people
in every part of it, members in every company list, records found only
through its own and records each sale left under its own reference, closes;
after its day nothing of it is in the file store, and no key or value in the
database names it but the company's declared records and keys gone by
themselves within their declared days (what each sale left under its own
reference, its id in a buyer's library); another store sharing a buyer and a
helper is exactly as it was, and the buyer's library shows it alone.
"""
import os
from pathlib import Path
import subprocess
import sys
from test_contact_erasure_redis import pick_database, serve


def main():
    if os.environ.get("MARKTMORGEN_REDIS_INTEGRATION") != "1":
        raise RuntimeError("Run only against the dedicated CI Redis on loopback port 16379")
    root = Path(__file__).resolve().parents[1]
    db = pick_database()
    server, client = serve(db)
    try:
        assert client.command("PING") == "PONG"
        env = dict(os.environ)
        env.update({
            "UPSTASH_REDIS_REST_URL": "http://127.0.0.1:%d" % server.server_address[1],
            "UPSTASH_REDIS_REST_TOKEN": "erasure-check",
            "NIMBUS_DATA_KEY": env.get("NIMBUS_DATA_KEY", "tests-only-not-a-real-deployment-secret"),
        })
        for name in ("KV_REST_API_URL", "KV_REST_API_TOKEN", "BLOB_READ_WRITE_TOKEN", "R2_ACCOUNT_ID", "R2_ACCESS_KEY_ID", "R2_SECRET_ACCESS_KEY", "R2_BUCKET"):
            env.pop(name, None)
        run = subprocess.run(["node", str(root / "scripts" / "closed-store-redis.mjs")], cwd=root, env=env, timeout=900)
        if run.returncode != 0:
            sys.exit(run.returncode)
        print("PASS: closing a store against a real Redis")
    finally:
        try:
            client.command("FLUSHDB")
        finally:
            client.close()
            server.shutdown()


if __name__ == "__main__":
    main()
