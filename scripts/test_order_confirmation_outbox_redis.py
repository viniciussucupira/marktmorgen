"""Exact protected-origin Lua on disposable loopback Redis, no provider.
Run with MARKTMORGEN_REDIS_INTEGRATION=1 and CONFIRMATION_ORIGIN_REDIS_PORT.
"""
import concurrent.futures
import hashlib
import json
import os
from pathlib import Path
import re
import socket
import uuid
from test_form_opportunity_redis import Redis


class LocalRedis(Redis):
    def __init__(self):
        port = int(os.environ.get("CONFIRMATION_ORIGIN_REDIS_PORT", "16379"))
        if not 1024 <= port <= 65535:
            raise RuntimeError("Dedicated loopback Redis required")
        self.sock = socket.create_connection(("127.0.0.1", port), timeout=10)
        self.stream = self.sock.makefile("rb")


def main():
    if os.environ.get("MARKTMORGEN_REDIS_INTEGRATION") != "1":
        raise RuntimeError("Disposable loopback Redis only")
    root = Path(__file__).resolve().parents[1]
    def script(file, name):
        match = re.search(r"export const " + name + r" = `([^`]+)`;", (root / file).read_text())
        assert match and "${" not in match[1]
        return match[1]
    shared = script("lib/shipment-mail-outbox.ts", "SHIPMENT_MAIL_SCRIPT")
    origin = script("lib/order-confirmation-outbox.ts", "CONFIRMATION_ORIGIN_SCRIPT")
    prefix = "marktmorgen:integration:confirmation-origin:" + uuid.uuid4().hex + ":"
    db = LocalRedis()
    made = set()
    clock = db.command("TIME")
    now = int(clock[0]) * 1000 + int(clock[1]) // 1000
    policy = dict(reviewId="SYNTHETIC", emptyInitializationVerified=True, globalItems=4,
                  globalBytes=2_000_000, storeItems=4, storeBytes=2_000_000,
                  maximumChecks=10, admissionsUntil=now + 86_400_000, retryMilliseconds=60_000)
    def fixture(name):
        ident = hashlib.sha256(name.encode()).hexdigest()
        keys = [prefix + "row:" + ident, prefix + "source:" + ident, prefix + "due",
                prefix + "store", prefix + "person:" + ident, prefix + "pool", prefix + "storepool",
                prefix + "all", prefix + "closed", prefix + "erased:" + ident]
        made.update(keys)
        row = dict(kind="confirmation", id=ident, statsId="SYNTHETIC", nonce=ident, accountId="acct_TestOrigin01",
                   bodyDigest="b" * 64, intentFingerprint="c" * 64, bindingFingerprint="", session="", person=ident,
                   sourceValue="source-" + ident, sealed="s1.synthetic.protected", fingerprint="d" * 64,
                   bytes=160_000, created=now, authorizedAt=now, next=now, expiresAt=now + 450 * 86_400_000,
                   state="queued", phase="awaiting_creation", owner="", leaseUntil=0, checks=0,
                   createAttempts=0, reviewId="SYNTHETIC", recoveryCursor="", recoveryUpper=0)
        return row, keys
    def enqueue(row, keys):
        return db.command("EVAL", shared, 10, *keys, "enqueue", "", json.dumps(row), now, 131072, json.dumps(policy), "")
    def change(op, row, keys, supplied="", client=None, at=now, expected=None, owner="a" * 48):
        return (client or db).command("EVAL", origin, 10, *keys, op,
            expected if expected is not None else db.command("GET", keys[0]), supplied, at, owner, json.dumps(policy))
    def candidate(row, session, token):
        return dict(row, session=session, bindingFingerprint=hashlib.sha256(token.encode()).hexdigest(),
                    phase="awaiting_payment", sourceValue="bound:" + session, sealed="s1." + token)
    def stats():
        out = {}
        for line in db.command("INFO", "COMMANDSTATS").splitlines():
            match = re.match(r"cmdstat_([^:]+):calls=(\d+),", line)
            if match and match[1] != "info": out[match[1]] = int(match[2])
        return out
    def measured(run):
        before = stats(); result = run(); after = stats()
        return result, sum(after.get(k, 0) - before.get(k, 0) for k in set(before) | set(after))
    profiles = {}
    try:
        row, keys = fixture("atomic")
        first, profiles["enqueue"] = measured(lambda: enqueue(row, keys))
        assert first[0] == "queued"
        assert db.command("TTL", keys[0]) == -1 and db.command("TTL", keys[1]) == -1
        assert db.command("HGET", keys[5], "items") == "1"
        assert enqueue(row, keys)[0] == "existing"
        assert db.command("HGET", keys[5], "items") == "1"
        raw_before_create = db.command("GET", keys[0])
        permission, profiles["create"] = measured(lambda: change("create", row, keys, expected=raw_before_create))
        assert permission[0] == "creating" and len(permission) == 4
        assert int(permission[2]) < int(permission[3])
        assert change("create", row, keys)[0] == "held"
        print("PASS: protected source and bounded slots precede acknowledged creation; duplicate/lost enqueue ACK never grants another slot")
        raw = db.command("GET", keys[0]); current = json.loads(raw)
        candidates = [json.dumps(candidate(current, "cs_test_syntheticwinner" + str(i), "token" + str(i))) for i in range(32)]
        def bind(payload):
            conn = LocalRedis()
            try: return change("bind", current, keys, payload, client=conn, expected=raw)
            finally: conn.sock.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            replies = list(pool.map(bind, candidates))
        assert sum(r[0] == "bound" for r in replies) == 1
        saved = db.command("GET", keys[0]); winning = json.loads(saved)
        assert saved in candidates and winning["bindingFingerprint"] and db.command("GET", keys[1]) == winning["sourceValue"]
        another = candidate(winning, "cs_test_differentAfterLostACK", "other-token")
        assert change("bind", winning, keys, json.dumps(another), expected=saved) == ["bound", saved]
        assert db.command("GET", keys[0]) == saved
        print("PASS:32 competing verified-session candidates choose one immutable session/token/fingerprint; replay returns persisted winner")
        _, profiles["bound_replay"] = measured(lambda: change("bind", winning, keys, json.dumps(another), expected=saved))
        for field, value in [("intentFingerprint", "x" * 64), ("bodyDigest", "x" * 64), ("accountId", "acct_Foreign"), ("nonce", "f" * 64)]:
            n = dict(another); n[field] = value
            assert change("bind", winning, keys, json.dumps(n), expected=saved)[0] == "unknown"
        print("PASS: a candidate cannot replace original account/body/nonce/admission fingerprint")
        old, oldkeys = fixture("past-retention")
        old["created"] = now - 25 * 3_600_000
        assert enqueue(old, oldkeys)[0] == "queued"
        assert change("create", old, oldkeys)[0] == "creation_unknown"
        assert json.loads(db.command("GET", oldkeys[0]))["createAttempts"] == 0
        raw_before_cursor = db.command("GET", oldkeys[0])
        progress, profiles["cursor"] = measured(lambda: change("cursor", old, oldkeys, json.dumps(dict(recoveryCursor="cs_test_page000000001", recoveryUpper=now // 1000)), expected=raw_before_cursor))
        assert progress[0] == "cursor"
        assert json.loads(db.command("GET", oldkeys[0]))["recoveryCursor"] == "cs_test_page000000001"
        recovered = candidate(json.loads(db.command("GET", oldkeys[0])), "cs_test_recoveredAfter25h", "original-proof-token")
        raw_before_bind = db.command("GET", oldkeys[0])
        bound, profiles["bind"] = measured(lambda: change("bind", old, oldkeys, json.dumps(recovered), expected=raw_before_bind))
        assert bound[0] == "bound"
        print("PASS: after25h no creation POST permission; durable read pagination and original-proof binding remain possible")
        skew, skewkeys = fixture("skew")
        assert enqueue(skew, skewkeys)[0] == "queued"
        previous = db.command("GET", skewkeys[0])
        assert change("create", skew, skewkeys, at=now - 73 * 3_600_000)[0] == "unknown"
        assert db.command("GET", skewkeys[0]) == previous
        expired = dict(skew, expiresAt=now - 1)
        db.command("SET", skewkeys[0], json.dumps(expired))
        assert change("bind", expired, skewkeys, json.dumps(candidate(expired, "cs_test_pastHorizon00001", "expired")))[0] == "unknown"
        print("PASS: Redis clock denies worker skew and expired original horizon before mutation")
        fenced, fencedkeys = fixture("fenced")
        assert enqueue(fenced, fencedkeys)[0] == "queued"
        db.command("SET", fencedkeys[8], "cleanup-won")
        assert change("create", fenced, fencedkeys)[0] == "held"
        assert change("bind", fenced, fencedkeys, json.dumps(candidate(fenced, "cs_test_fenced000000001", "fenced")))[0] == "held"
        full, fullkeys = fixture("full")
        assert enqueue(full, fullkeys)[0] == "unknown"  # shared store fence also denies producer
        db.command("DEL", fencedkeys[8])
        assert enqueue(full, fullkeys)[0] == "full"
        assert db.command("EXISTS", fullkeys[0], fullkeys[1]) == 0
        print("PASS: closed-store fence wins before creation/binding, and full storage budget creates neither origin nor source")
        assert profiles == {"enqueue": 27, "create": 17, "bound_replay": 15, "cursor": 17, "bind": 18}, profiles
        print(json.dumps({"observed_commands_including_eval_and_redis_call": profiles, "supplier_invoice": False}))
    finally:
        for key in made: db.command("DEL", key)
        db.sock.close()
        print("CLEANUP: only this proof's synthetic keys removed")


if __name__ == "__main__":
    main()
