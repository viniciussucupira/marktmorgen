"""SV4 prerequisite: actual encrypted codec and binary Redis DUMP/RESTORE.
Dedicated disposable CI Redis only; synthetic UUID keys in DB14/DB15.
No accounts, provider credentials, disk backups, production adapter or FLUSH.
"""
import base64
import json
import os
from pathlib import Path
import subprocess
import uuid
from test_form_opportunity_redis import Redis


class BinaryRedis(Redis):
    # Test transport only: retain opaque RDB bytes instead of UTF-8 decoding.
    # Reuse the existing fixed-loopback connection; never reconnect or retry.
    def command(self, *parts):
        encoded = [part if isinstance(part, bytes) else str(part).encode()
                   for part in parts]
        payload = b"*" + str(len(encoded)).encode() + b"\r\n"
        for part in encoded:
            payload += b"$" + str(len(part)).encode() + b"\r\n" + part + b"\r\n"
        self.sock.sendall(payload)
        return self.read()

    def read(self):
        line = self.stream.readline()
        if not line.endswith(b"\r\n"):
            raise RuntimeError("Incomplete synthetic Redis reply")
        kind, value = line[:1], line[1:-2]
        if kind == b"+":
            return value.decode()
        if kind == b"-":
            raise RuntimeError(value.decode())
        if kind == b":":
            return int(value)
        if kind == b"$":
            length = int(value)
            if length == -1:
                return None
            if not 0 <= length <= 1024 * 1024:
                raise RuntimeError("Synthetic reply exceeds test bound")
            raw = self.stream.read(length + 2)
            if len(raw) != length + 2 or not raw.endswith(b"\r\n"):
                raise RuntimeError("Incomplete synthetic bulk reply")
            return raw[:-2]
        if kind == b"*":
            length = int(value)
            if not 0 <= length <= 100:
                raise RuntimeError("Synthetic array exceeds test bound")
            return [self.read() for _ in range(length)]
        raise RuntimeError("Unsupported synthetic Redis reply")


CAPTURE = """
local clock = redis.call('TIME')
local now = tonumber(clock[1])*1000 + math.floor(tonumber(clock[2])/1000)
local rows = {}
for _, key in ipairs(KEYS) do
  local dump = redis.call('DUMP',key)
  local expiry = redis.call('PEXPIRETIME',key)
  if not dump or expiry == -2 then return redis.error_reply('missing synthetic key') end
  rows[#rows+1] = {key,dump,expiry}
end
return {now,rows}
"""


def main():
    if os.environ.get("MARKTMORGEN_REDIS_INTEGRATION") != "1":
        raise RuntimeError("Dedicated disposable CI loopback Redis only")
    prefix = "nl:synthetic:sv4-backup:" + uuid.uuid4().hex + ":"
    keys = [prefix + name for name in
            ("binary", "hash", "list", "set", "zset", "expiry")]
    bad = prefix + "corrupt"
    source, target = BinaryRedis(), BinaryRedis()
    try:
        assert source.command("SELECT", 14) == "OK"
        assert target.command("SELECT", 15) == "OK"
        binary = bytes([0, 255, 128, 13, 10]) + "ação 日本語".encode()
        assert source.command("SET", keys[0], binary) == "OK"
        source.command("HSET", keys[1], "reserved", 100, "liability", "retained")
        source.command("RPUSH", keys[2], "first", "日本語", "last")
        source.command("SADD", keys[3], "one", "two")
        source.command("ZADD", keys[4], 1, "earlier", 5, "later")
        source.command("SET", keys[5], "expires", "PX", 60000)
        captured, raw_rows = source.command("EVAL", CAPTURE, len(keys), *keys)
        snapshot = {"version": 1, "capturedAt": captured, "rows": [
            {"key": key.decode(), "dump": base64.b64encode(dump).decode(),
             "expiresAt": None if expiry == -1 else expiry}
            for key, dump, expiry in raw_rows]}
        assert len(snapshot["rows"]) == 6
        assert all(row["expiresAt"] is None for row in snapshot["rows"][:5])
        expiry = snapshot["rows"][5]["expiresAt"]
        assert expiry > captured
        print("PASS: atomic synthetic capture retains opaque dumps and absolute expiry")

        result = subprocess.run(
            ["node", str(Path(__file__).with_name("test_self_hosted_backup_codec.mjs"))],
            input=json.dumps(snapshot), text=True, capture_output=True, check=True,
            timeout=30, env={"PATH": os.environ.get("PATH", ""),
                            "MARKTMORGEN_REDIS_INTEGRATION": "1"})
        decoded = json.loads(result.stdout)
        assert decoded["rows"] == snapshot["rows"]
        assert decoded["afterExpiry"] == snapshot["rows"][:5]
        print("PASS: actual AES-GCM codec authenticates real binary dumps and rejects tampering")
        print("PASS: expired records and invalid restore clocks cannot extend access")

        # A separate disposable DB, same key identities, no REPLACE or global clear.
        for row in decoded["rows"]:
            dump = base64.b64decode(row["dump"], validate=True)
            deadline = row["expiresAt"]
            parts = ["RESTORE", row["key"], deadline or 0, dump]
            if deadline is not None:
                parts.append("ABSTTL")
            assert target.command(*parts) == "OK"
        assert target.command("GET", keys[0]) == binary
        restored_hash = target.command("HGETALL", keys[1])
        assert dict(zip(restored_hash[::2], restored_hash[1::2])) == {
            b"reserved": b"100", b"liability": b"retained"}
        assert target.command("LRANGE", keys[2], 0, -1) == [
            b"first", "日本語".encode(), b"last"]
        assert sorted(target.command("SMEMBERS", keys[3])) == [b"one", b"two"]
        assert target.command("ZRANGE", keys[4], 0, -1, "WITHSCORES") == [
            b"earlier", b"1", b"later", b"5"]
        assert target.command("GET", keys[5]) == b"expires"
        assert target.command("PEXPIRETIME", keys[5]) == expiry
        assert target.command("PTTL", keys[1]) == -1
        print("PASS: actual Redis restores binary/string/hash/list/set/zset and original deadlines")

        try:
            target.command("RESTORE", keys[0], 0, raw_rows[0][1])
        except RuntimeError as error:
            assert str(error).startswith("BUSYKEY"), str(error)
        else:
            raise AssertionError("Existing destination must not be overwritten")
        assert target.command("GET", keys[0]) == binary
        corrupted = bytearray(raw_rows[0][1])
        corrupted[-1] ^= 1
        try:
            target.command("RESTORE", bad, 0, bytes(corrupted))
        except RuntimeError as error:
            assert str(error).startswith("ERR"), str(error)
        else:
            raise AssertionError("Redis must reject corrupted RDB checksum")
        assert target.command("EXISTS", bad) == 0
        assert source.command("GET", keys[0]) == binary
        assert source.command("HGET", keys[1], "reserved") == b"100"
        assert source.command("PEXPIRETIME", keys[5]) == expiry
        print("PASS: busy/corrupt destinations refuse without overwrite or source cash mutation")
        print("SV4 prerequisite only: no full backup service, failover, capacity or real migration")
    finally:
        # These clients only ever selected dedicated test DBs; remove this UUID only.
        source.command("SELECT", 14)
        target.command("SELECT", 15)
        source.command("DEL", *keys, bad)
        target.command("DEL", *keys, bad)
        source.close()
        target.close()


if __name__ == "__main__":
    main()
