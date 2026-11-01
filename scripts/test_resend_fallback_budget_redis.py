"""Exercise the actual global fallback Lua on disposable loopback Redis.

No provider/account credentials or real messages are used. In CI, use the
existing dedicated Redis with MARKTMORGEN_REDIS_INTEGRATION=1. Locally pass
--redis-server /path/to/reviewed/redis-server; only that subprocess is stopped.
Observed commandstats counts are Redis commands, not a supplier invoice.
"""
import argparse
import concurrent.futures
import hashlib
import json
import os
from pathlib import Path
import re
import socket
import subprocess
import tempfile
import time
import uuid


class Redis:
    def __init__(self, port):
        self.sock = socket.create_connection(("127.0.0.1", port), timeout=10)
        self.stream = self.sock.makefile("rb")

    def close(self):
        self.stream.close()
        self.sock.close()

    def command(self, *parts):
        encoded = [str(part).encode() for part in parts]
        packet = b"*" + str(len(encoded)).encode() + b"\r\n"
        for part in encoded:
            packet += b"$" + str(len(part)).encode() + b"\r\n" + part + b"\r\n"
        self.sock.sendall(packet)
        return self.read()

    def read(self):
        line = self.stream.readline()
        if not line.endswith(b"\r\n"):
            raise RuntimeError("Incomplete synthetic Redis reply")
        kind, raw = line[:1], line[1:-2]
        if kind == b"+":
            return raw.decode()
        if kind == b"-":
            raise RuntimeError(raw.decode())
        if kind == b":":
            return int(raw)
        if kind == b"$":
            size = int(raw)
            if size == -1:
                return None
            value = self.stream.read(size + 2)
            if len(value) != size + 2 or not value.endswith(b"\r\n"):
                raise RuntimeError("Incomplete Redis bulk reply")
            return value[:-2].decode()
        if kind == b"*":
            count = int(raw)
            return None if count == -1 else [self.read() for _ in range(count)]
        raise RuntimeError("Unknown Redis response")


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--redis-server")
    parser.add_argument("--port", type=int, default=16481)
    args = parser.parse_args()
    root = Path(__file__).resolve().parents[1]
    source = (root / "lib/resend-fallback-budget.ts").read_text()
    found = re.search(r"export const RESEND_FALLBACK_BUDGET_LUA = `([^`]+)`;", source)
    if not found or "${" in found.group(1):
        raise RuntimeError("Expected the exact static application Lua")
    script = found.group(1)
    owned = None
    temp = tempfile.TemporaryDirectory(prefix="marktmorgen-resend-budget-redis-")
    if args.redis_server:
        binary = Path(args.redis_server).resolve()
        version = subprocess.check_output([str(binary), "--version"], text=True).strip()
        digest = hashlib.sha256(binary.read_bytes()).hexdigest()
        print(json.dumps({"redis_version": version, "binary_sha256": digest, "loopback_port": args.port}))
        # Never select an occupied port or stop someone else's instance.
        with socket.socket() as probe:
            probe.bind(("127.0.0.1", args.port))
        owned = subprocess.Popen([str(binary), "--bind", "127.0.0.1", "--protected-mode", "yes", "--port", str(args.port), "--save", "", "--appendonly", "no", "--dir", temp.name], stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
        port = args.port
        until = time.monotonic() + 10
        while True:
            if owned.poll() is not None:
                raise RuntimeError("The isolated Redis exited before startup")
            try:
                client = Redis(port)
                break
            except OSError:
                if time.monotonic() >= until:
                    owned.terminate()
                    raise
                time.sleep(0.05)
    else:
        if os.environ.get("MARKTMORGEN_REDIS_INTEGRATION") != "1":
            raise RuntimeError("Use a dedicated CI Redis or --redis-server; never production")
        port = 16379
        client = Redis(port)
    touched = set()
    anchor = 1_793_534_400_000
    start = anchor - 15 * 86_400_000
    reset = start + 31 * 86_400_000
    serial = 0

    def account():
        nonlocal serial
        serial += 1
        return hashlib.sha256(("synthetic-resend-budget:" + uuid.uuid4().hex + ":" + str(serial)).encode()).hexdigest()

    def keys(acc, attempt):
        pair = ("nl:resend-budget:{" + acc + "}:ledger", "nl:resend-budget:{" + acc + "}:claim:" + hashlib.sha256(attempt.encode()).hexdigest())
        touched.update(pair)
        return pair

    def call(acc, attempt, op="reserve", *, token="a" * 32, units=1, cap=10, used=0, sent=None, now=anchor, period_start=start, period_reset=reset, until=None, observed=None, prior=None, outcome="", connection=None, lua_override=None):
        if until is None:
            until = min(now + 60_000, period_reset)
        if observed is None:
            observed = now
        if sent is None:
            sent = used
        prior = prior or [0, 0, 0, 0]
        flag = "bootstrap_reviewed" if op == "initialize" else "period_closed" if prior[1] else ""
        argv = [op, acc, token, units, period_start, period_reset, now, until, cap, observed, used, sent, used - sent, hashlib.sha256(attempt.encode()).hexdigest(), *prior, outcome, flag]
        return (connection or client).command("EVAL", lua_override or script, 2, *keys(acc, attempt), *argv)

    def initialize(acc, **kwargs):
        assert call(acc, "bootstrap", "initialize", **kwargs) == ["initialized"]

    def claim_call(acc, attempt, saved, op, outcome="", now=anchor):
        return call(acc, attempt, op, token=saved[1], units=int(saved[2]), period_start=int(saved[3]), period_reset=int(saved[4]), until=int(saved[5]), outcome=outcome, now=now)

    def stats():
        raw = client.command("INFO", "commandstats")
        return {name: int(calls) for name, calls in re.findall(r"^cmdstat_([^:]+):calls=(\d+)", raw, re.M)}

    try:
        assert client.command("PING") == "PONG"
        acc = account()
        assert call(acc, "missing") == ["denied", "uninitialized"]
        assert client.command("EXISTS", keys(acc, "missing")[0]) == 0
        initialize(acc, used=5, sent=2)
        held = call(acc, "last-five", units=5, used=5, sent=2)
        assert held[0] == "reserved" and call(acc, "over", used=5, sent=2) == ["denied", "exhausted"]
        assert int(client.command("HGET", keys(acc, "last-five")[0], "held")) == 5
        print("PASS: missing state is not zero; sent plus received consumes the paid cap")

        race_account = account()
        initialize(race_account)
        def reserve_race(index):
            other = Redis(port)
            try:
                return call(race_account, "race:" + str(index), token=format(index, "032x"), connection=other)
            finally:
                other.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            raced = list(pool.map(reserve_race, range(64)))
        assert sum(row[0] == "reserved" for row in raced) == 10
        assert all(row[0] == "reserved" or row == ["denied", "exhausted"] for row in raced)
        assert int(client.command("HGET", keys(race_account, "race:0")[0], "held")) == 10
        print("PASS: 64 concurrent reservations cannot exceed ten remaining emails")

        acc = account(); initialize(acc)
        original = call(acc, "lost-reserve", units=2)
        # The first response is deliberately discarded, as after a committed SET.
        again = call(acc, "lost-reserve", token="b" * 32, units=2)
        assert again == ["already_reserved", *original[1:]]
        def dispatch_race(_):
            other = Redis(port)
            try:
                return call(acc, "lost-reserve", "dispatch", token=original[1], units=2, connection=other)
            finally:
                other.close()
        with concurrent.futures.ThreadPoolExecutor(max_workers=16) as pool:
            dispatched = list(pool.map(dispatch_race, range(64)))
        assert sum(row[0] == "dispatch" for row in dispatched) == 1
        assert all(row[0] == "dispatch" or row == ["denied", "already_dispatched"] for row in dispatched)
        assert claim_call(acc, "lost-reserve", original, "dispatch") == ["denied", "already_dispatched"]
        assert claim_call(acc, "lost-reserve", original, "settle", "unknown") == ["settled", "unknown"]
        assert client.command("TTL", keys(acc, "lost-reserve")[1]) == -1
        assert claim_call(acc, "lost-reserve", original, "settle", "accepted") == ["settled", "accepted"]
        assert claim_call(acc, "lost-reserve", original, "settle", "accepted") == ["already_settled", "accepted"]
        assert claim_call(acc, "lost-reserve", original, "settle", "confirmed_not_accepted") == ["already_settled", "accepted"]
        assert [int(x) for x in client.command("HMGET", keys(acc, "lost-reserve")[0], "held", "spent")] == [0, 2]
        assert 0 < client.command("TTL", keys(acc, "lost-reserve")[1]) <= 35 * 86400
        print("PASS: lost ACKs and concurrent replays grant at most one POST; uncertainty retains the whole hold")

        acc = account(); initialize(acc)
        reserved = call(acc, "not-sent", units=3)
        assert claim_call(acc, "not-sent", reserved, "settle", "unknown") == ["denied", "not_dispatched"]
        assert claim_call(acc, "not-sent", reserved, "settle", "confirmed_not_accepted") == ["settled", "confirmed_not_accepted"]
        assert claim_call(acc, "not-sent", reserved, "settle", "confirmed_not_accepted") == ["already_settled", "confirmed_not_accepted"]
        assert [int(x) for x in client.command("HMGET", keys(acc, "not-sent")[0], "held", "spent", "attempts")] == [0, 0, 1]
        rearmed = call(acc, "not-sent", token="c" * 32, units=3)
        assert rearmed[0] == "reserved" and rearmed[1] != reserved[1]
        assert client.command("TTL", keys(acc, "not-sent")[1]) == -1
        assert claim_call(acc, "not-sent", reserved, "settle", "confirmed_not_accepted") == ["denied", "claim_conflict"]
        assert claim_call(acc, "not-sent", rearmed, "settle", "confirmed_not_accepted") == ["settled", "confirmed_not_accepted"]
        assert int(client.command("HGET", keys(acc, "not-sent")[0], "attempts")) == 2
        assert call(acc, "next", units=10)[0] == "reserved"
        print("PASS: confirmed nonacceptance releases once, without resetting the attempts bound")

        for outcome, before_release, expected_spent in [("accepted", False, 0), ("accepted", True, 1), ("confirmed_not_accepted", True, 0)]:
            acc = account(); initialize(acc)
            saved = call(acc, "partial-settlement")
            claim_call(acc, "partial-settlement", saved, "dispatch")
            needle = "redis.call('HINCRBY',KEYS[1],'held',-units)" if before_release else "redis.call('EXPIRE',KEYS[2],35*86400)"
            assert script.count(needle) == 1
            interrupted = script.replace(needle, "error('synthetic settlement interruption')", 1)
            try:
                call(acc, "partial-settlement", "settle", token=saved[1], outcome=outcome, lua_override=interrupted)
                raise AssertionError("Expected injected Redis script error")
            except RuntimeError as error:
                assert "synthetic settlement interruption" in str(error)
            assert [int(x) for x in client.command("HMGET", keys(acc, "partial-settlement")[0], "spent", "held")] == [expected_spent, 1]
            assert claim_call(acc, "partial-settlement", saved, "settle", outcome) == ["already_settled", outcome]
            assert [int(x) for x in client.command("HMGET", keys(acc, "partial-settlement")[0], "spent", "held")] == [expected_spent, 1]
        print("PASS: interrupted Lua settlement can over-reserve but cannot free another attempt or erase accepted spend")

        acc = account(); initialize(acc, used=2)
        assert call(acc, "regressed-count", used=1) == ["denied", "usage_regressed"]
        assert call(acc, "regressed-clock", used=2, observed=anchor - 1) == ["denied", "usage_regressed"]
        first = call(acc, "accepted-before-reset", used=2, units=2)
        claim_call(acc, "accepted-before-reset", first, "dispatch")
        assert claim_call(acc, "accepted-before-reset", first, "settle", "accepted") == ["settled", "accepted"]
        unknown = call(acc, "pending-reset", used=2, units=3)
        claim_call(acc, "pending-reset", unknown, "dispatch")
        claim_call(acc, "pending-reset", unknown, "settle", "unknown")
        next_now = reset + 1_000
        next_period = dict(now=next_now, period_start=reset, period_reset=reset + 30 * 86_400_000, used=4)
        assert call(acc, "new-no-proof", **next_period) == ["denied", "unreviewed_reset"]
        assert int(client.command("HGET", keys(acc, "new-no-proof")[0], "spent")) == 2
        assert call(acc, "new-with-proof", prior=[start, reset, 5, reset], **next_period)[0] == "reserved"
        assert [int(x) for x in client.command("HMGET", keys(acc, "new-with-proof")[0], "seenUsed", "spent", "held")] == [4, 0, 4]
        assert claim_call(acc, "pending-reset", unknown, "settle", "accepted", now=next_now) == ["settled", "accepted"]
        assert [int(x) for x in client.command("HMGET", keys(acc, "new-with-proof")[0], "spent", "held")] == [3, 1]
        print("PASS: only a reviewed consecutive provider period resets settled spend; unresolved holds carry over")

        acc = account()
        assert call(acc, "bootstrap", "initialize", cap=50_001) == ["denied", "arguments"]
        initialize(acc)
        ledger = keys(acc, "bounded")[0]
        client.command("HSET", ledger, "attempts", 50_000)
        assert call(acc, "bounded") == ["denied", "attempt_capacity"]
        client.command("EXPIRE", ledger, 10)
        assert call(acc, "expired-ledger") == ["denied", "ledger_shape"]
        wrong = account(); ledger = keys(wrong, "wrong")[0]
        client.command("SET", ledger, "synthetic wrong type")
        assert call(wrong, "wrong") == ["denied", "ledger_shape"]
        assert client.command("GET", ledger) == "synthetic wrong type"
        print("PASS: malformed/expiring state, oversized caps and unlimited refusal tombstones cannot authorize fallback")

        measured = account()
        before = stats(); initialize(measured); after = stats()
        counts = {"initialize": sum(after.get(key, 0) - before.get(key, 0) for key in set(before) | set(after) if key != "info")}
        before = stats(); saved = call(measured, "measured"); after = stats()
        counts["reserve"] = sum(after.get(key, 0) - before.get(key, 0) for key in set(before) | set(after) if key != "info")
        before = stats(); claim_call(measured, "measured", saved, "dispatch"); after = stats()
        counts["dispatch"] = sum(after.get(key, 0) - before.get(key, 0) for key in set(before) | set(after) if key != "info")
        before = stats(); claim_call(measured, "measured", saved, "settle", "accepted"); after = stats()
        counts["settle_accepted"] = sum(after.get(key, 0) - before.get(key, 0) for key in set(before) | set(after) if key != "info")
        print(json.dumps({"observed_redis_commands_including_eval_and_redis_call": counts, "supplier_invoice": False}))
        assert counts == {"initialize": 3, "reserve": 9, "dispatch": 8, "settle_accepted": 11}, counts
        print("PASS: exact application Lua, atomicity and observed Redis command counts")
    finally:
        for key in touched:
            client.command("DEL", key)
        client.close()
        if owned:
            owned.terminate()
            owned.wait(timeout=10)
        temp.cleanup()
        print("CLEANUP: only synthetic keys removed; owned loopback Redis stopped without persistence")


if __name__ == "__main__":
    main()
