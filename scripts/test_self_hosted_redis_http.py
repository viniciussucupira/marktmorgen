"""SV4 prerequisite: bounded synthetic HTTP/Redis contract, never a production proxy.

Only the existing disposable CI Redis at 127.0.0.1:16379 is reachable.
No environment URL/credential, provider API, disk backup or real account is used.
This does not prove a self-hosted site, replication, durable failover or capacity.
"""
import concurrent.futures
import hmac
import http.client
from http.server import BaseHTTPRequestHandler, ThreadingHTTPServer
import json
import os
from pathlib import Path
import re
import secrets
import subprocess
import threading
import urllib.error
import urllib.request
import uuid
from test_form_opportunity_redis import Redis

MAX_BODY = 1024 * 1024  # Fixture admission only, not a customer entitlement.
MAX_COMMANDS = 128
ALLOWED = {"PING", "SET", "GET", "INCR", "HSET", "HGET", "HGETALL",
           "PTTL", "PEXPIRE", "EVAL"}
TOKEN = secrets.token_urlsafe(32)


class Fixture(BaseHTTPRequestHandler):
    def log_message(self, *_args):
        pass  # Never put authorization, command bodies or data into CI logs.

    def answer(self, status, value):
        data = json.dumps(value, ensure_ascii=False).encode()
        self.send_response(status)
        self.send_header("Content-Type", "application/json")
        self.send_header("Content-Length", str(len(data)))
        self.end_headers()
        self.wfile.write(data)

    def do_POST(self):
        if self.path != "/pipeline":
            return self.answer(404, {"error": "Fixture route unavailable"})
        if not hmac.compare_digest(
            self.headers.get("Authorization", ""), "Bearer " + TOKEN
        ):
            return self.answer(401, {"error": "Unauthorized"})
        if self.headers.get("Transfer-Encoding") is not None:
            return self.answer(400, {"error": "Unsupported framing"})
        length = self.headers.get("Content-Length", "")
        if not length.isascii() or not length.isdecimal():
            return self.answer(400, {"error": "Length required"})
        length = int(length)
        if not 0 < length <= MAX_BODY:
            return self.answer(413, {"error": "Fixture request too large"})
        try:
            commands = json.loads(self.rfile.read(length).decode("utf-8"))
        except (ValueError, UnicodeError):
            return self.answer(400, {"error": "Invalid JSON"})
        if (not isinstance(commands, list) or not commands
                or len(commands) > MAX_COMMANDS):
            return self.answer(400, {"error": "Invalid command list"})
        for command in commands:
            if (not isinstance(command, list) or not command
                    or not isinstance(command[0], str)
                    or command[0].upper() not in ALLOWED
                    or any(type(arg) not in (str, int) for arg in command)):
                return self.answer(400, {"error": "Invalid fixture command"})
        client = Redis()
        results = []
        try:
            # Match /pipeline ordered replies; this is NOT MULTI/EXEC.
            # Exactly one send per command, never reconnect or retry.
            for command in commands:
                try:
                    results.append({"result": client.command(*command)})
                except RuntimeError as error:
                    # Only Redis command errors have a known complete reply.
                    # Incomplete transport replies must abort the request.
                    if str(error).startswith(("ERR ", "WRONGTYPE ", "NOSCRIPT ")):
                        results.append({"error": "Synthetic Redis command error"})
                    else:
                        self.close_connection = True
                        return
            if self.headers.get("X-Fixture-Lose-Ack") == "1":
                self.close_connection = True
                return
            self.answer(200, results)
        finally:
            client.close()


def main():
    if os.environ.get("MARKTMORGEN_REDIS_INTEGRATION") != "1":
        raise RuntimeError("Dedicated CI loopback Redis only; no production mode")
    source = (Path(__file__).resolve().parents[1] /
              "lib/contract-funding.ts").read_text(encoding="utf-8")
    found = re.search(r"export const RESERVE_CONTRACT = `([^`]+)`;", source)
    if not found or "${" in found.group(1):
        raise RuntimeError("Expected the actual static contract reservation Lua")
    script = found.group(1)
    prefix = "marktmorgen:integration:sv4-http:" + uuid.uuid4().hex + ":"
    keys = [prefix + name for name in ("values", "wrongtype", "counter", "cash")]
    keys.extend(prefix + "node-" + name for name in
                ("value", "hash", "counter", "ack", "cutoff"))
    direct = Redis()
    server = ThreadingHTTPServer(("127.0.0.1", 0), Fixture)
    server.daemon_threads = True
    worker = threading.Thread(target=server.serve_forever, daemon=True)
    worker.start()
    url = "http://127.0.0.1:" + str(server.server_address[1])

    def request(commands, token=TOKEN, path="/pipeline", headers=None):
        body = json.dumps(commands, ensure_ascii=False).encode()
        request_headers = {"Authorization": "Bearer " + token,
                           "Content-Type": "application/json"}
        request_headers.update(headers or {})
        req = urllib.request.Request(url + path, data=body,
                                     headers=request_headers, method="POST")
        with urllib.request.urlopen(req, timeout=15) as response:
            return response.status, json.load(response)

    def rejected(commands, status, **kwargs):
        try:
            request(commands, **kwargs)
        except urllib.error.HTTPError as error:
            assert error.code == status, error.code
        else:
            raise AssertionError("Expected rejection before any command")

    try:
        assert direct.command("PING") == "PONG"
        for token in ("", "wrong"):
            rejected([["INCR", keys[2]]], 401, token=token)
        rejected([["INCR", keys[2]]], 404, path="/pipeline?token=" + TOKEN)
        rejected([["INCR", keys[2]], ["FLUSHALL"]], 400)
        rejected([["INCR", keys[2]], ["SET", keys[0], True]], 400)
        rejected([["INCR", keys[2]]] * (MAX_COMMANDS + 1), 400)
        rejected([["SET", keys[0], "x" * MAX_BODY]], 413)
        assert direct.command("GET", keys[2]) is None
        print("PASS: authentication, route and admission failures do not mutate Redis")

        value = "ação — 日本語 / @creator | \\n"
        status, replies = request([["SET", keys[0], value],
                                   ["GET", keys[0]], ["GET", prefix + "missing"]])
        assert status == 200 and replies == [
            {"result": "OK"}, {"result": value}, {"result": None}]
        direct.command("HSET", keys[1], "field", "value")
        _, replies = request([["GET", keys[1]], ["INCR", keys[2]]])
        assert "error" in replies[0] and replies[1] == {"result": 1}
        assert direct.command("GET", keys[2]) == "1"
        print("PASS: ordered UTF-8/null/error replies preserve partial pipeline semantics")

        direct.command("PEXPIRE", keys[0], 60000)
        before = direct.command("PTTL", keys[0])
        _, replies = request([["GET", keys[0]], ["PTTL", keys[0]]])
        assert replies[0] == {"result": value}
        assert 0 < replies[1]["result"] <= before
        assert direct.command("PTTL", keys[1]) == -1
        print("PASS: reading via HTTP preserves expiring and persistent keys")

        direct.command("HSET", keys[3], "review", "review", "policy", "binding",
                       "reserved", 0, "carried", 0, "slots:creator_month", 2)
        def reserve(index):
            store = "synthetic" + str(index)
            receipt = "|".join(map(str, ["review", store, "creator_month",
                "checkout", 50, 1800000300, 1800003600, 1800086400, 2000000000000]))
            command = ["EVAL", script, 1, keys[3], "binding", "review", store,
                       "creator_month", 50, 100, 0, 2, "ctr_" + str(index),
                       receipt, "checkout", "", 1800000001]
            return request([command])[1][0]["result"]
        with concurrent.futures.ThreadPoolExecutor(max_workers=8) as pool:
            results = list(pool.map(reserve, range(64)))
        assert sum(results) == 2
        assert direct.command("HGET", keys[3], "reserved") == "100"
        assert direct.command("HGET", keys[3], "slots:creator_month") == "0"
        assert direct.command("PTTL", keys[3]) == -1
        print("PASS: actual funding Lua admits only two of 64 HTTP contenders")

        before = int(direct.command("GET", keys[2]))
        try:
            request([["INCR", keys[2]]], headers={"X-Fixture-Lose-Ack": "1"})
        except (OSError, urllib.error.URLError, http.client.RemoteDisconnected):
            pass
        else:
            raise AssertionError("The committed reply must be unknown to the caller")
        assert int(direct.command("GET", keys[2])) == before + 1
        assert direct.command("HGET", keys[3], "reserved") == "100"
        print("PASS: lost acknowledgement does not reconnect, replay or release funding")
        # Only the CI job launches Node; no provider credentials are inherited.
        subprocess.run(
            ["node", str(Path(__file__).with_name("test_self_hosted_redis_client.mjs"))],
            env={"PATH": os.environ.get("PATH", ""),
                 "MARKTMORGEN_REDIS_INTEGRATION": "1",
                 "MARKTMORGEN_SYNTHETIC_REDIS_URL": url,
                 "MARKTMORGEN_SYNTHETIC_REDIS_TOKEN": TOKEN,
                 "MARKTMORGEN_SYNTHETIC_REDIS_PREFIX": prefix},
            check=True, timeout=90)
        print("SV4 prerequisite only: no container cutover, backup, capacity or production approval")
    finally:
        server.shutdown()
        server.server_close()
        worker.join(timeout=5)
        direct.command("DEL", *keys)  # Unique synthetic namespace only.
        direct.close()


if __name__ == "__main__":
    main()
