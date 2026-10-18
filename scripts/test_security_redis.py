"""The security checks of 18 October 2026, against an isolated local CI Redis.

Runs every tests/security/*.redis-run.ts journey (scripts/security-redis.mjs)
with the application's real Redis client: a small server here answers
Upstash's REST pipeline (POST /pipeline) by sending each command to Redis on
loopback port 16379, in a database of its own that is empty when the check
starts and flushed when it ends. No application credentials or production
host configuration are read; Stripe, the email sender and the file store are
stood in for inside each journey, which says what it proves.

Each journey was written to fail on the code before its fix
(docs/security-audit-2026-10-18.md lists them).
"""
import http.server
import json
import os
from pathlib import Path
import socket
import subprocess
import sys
import threading


class Redis:
    def __init__(self, db):
        self.sock = socket.create_connection(("127.0.0.1", 16379), timeout=30)
        self.stream = self.sock.makefile("rb")
        if db:
            assert self.command("SELECT", db) == "OK"

    def close(self):
        self.stream.close()
        self.sock.close()

    def command(self, *parts):
        encoded = [str(part).encode() for part in parts]
        payload = b"*" + str(len(encoded)).encode() + b"\r\n"
        for part in encoded:
            payload += b"$" + str(len(part)).encode() + b"\r\n" + part + b"\r\n"
        self.sock.sendall(payload)
        return self.read()

    def read(self):
        line = self.stream.readline()
        if not line.endswith(b"\r\n"):
            raise RuntimeError("Incomplete Redis reply")
        kind, value = line[:1], line[1:-2]
        if kind == b"+":
            return value.decode()
        if kind == b"-":
            raise RedisError(value.decode())
        if kind == b":":
            return int(value)
        if kind == b"$":
            length = int(value)
            if length == -1:
                return None
            raw = self.stream.read(length + 2)
            if len(raw) != length + 2 or not raw.endswith(b"\r\n"):
                raise RuntimeError("Incomplete Redis bulk reply")
            return raw[:-2].decode("utf-8", errors="replace")
        if kind == b"*":
            count = int(value)
            if count == -1:
                return None
            return [self.read() for _ in range(count)]
        raise RuntimeError("Unsupported Redis reply")


class RedisError(Exception):
    pass


def pick_database():
    """A database of our own: the first of 1 to 15 that holds nothing."""
    probe = Redis(0)
    try:
        for db in range(15, 0, -1):
            probe.command("SELECT", db)
            if probe.command("DBSIZE") == 0:
                return db
    finally:
        probe.close()
    raise RuntimeError("No empty Redis database to use")


def serve(db):
    lock = threading.Lock()
    client = Redis(db)

    class Pipeline(http.server.BaseHTTPRequestHandler):
        def log_message(self, *args):
            pass

        def do_POST(self):
            if self.path.rstrip("/") != "/pipeline" or self.headers.get("Authorization") != "Bearer security-check":
                self.send_response(404)
                self.end_headers()
                return
            body = self.rfile.read(int(self.headers.get("Content-Length", "0")))
            commands = json.loads(body)
            out = []
            with lock:
                for command in commands:
                    try:
                        out.append({"result": client.command(*command)})
                    except RedisError as error:
                        out.append({"error": str(error)})
            payload = json.dumps(out).encode()
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.send_header("Content-Length", str(len(payload)))
            self.end_headers()
            self.wfile.write(payload)

    server = http.server.ThreadingHTTPServer(("127.0.0.1", 0), Pipeline)
    threading.Thread(target=server.serve_forever, daemon=True).start()
    return server, client


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
            "UPSTASH_REDIS_REST_TOKEN": "security-check",
            "NIMBUS_DATA_KEY": env.get("NIMBUS_DATA_KEY", "tests-only-not-a-real-deployment-secret"),
        })
        for name in ("KV_REST_API_URL", "KV_REST_API_TOKEN", "BLOB_READ_WRITE_TOKEN"):
            env.pop(name, None)
        run = subprocess.run(["node", str(root / "scripts" / "security-redis.mjs")], cwd=root, env=env, timeout=600)
        if run.returncode != 0:
            sys.exit(run.returncode)
        print("PASS: the security checks against a real Redis")
    finally:
        try:
            client.command("FLUSHDB")
        finally:
            client.close()
            server.shutdown()


if __name__ == "__main__":
    main()
