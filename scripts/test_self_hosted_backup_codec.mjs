// CI-only authenticated codec roundtrip. Input/output contain synthetic rows only.
import assert from "node:assert/strict";
import { randomBytes } from "node:crypto";
import { sealBackup, openBackup, restoreRows } from "../lib/backup-codec.ts";
assert.equal(process.env.MARKTMORGEN_REDIS_INTEGRATION, "1");
let input = "";
for await (const chunk of process.stdin) {
  input += chunk;
  assert.ok(Buffer.byteLength(input) <= 1024 * 1024);
}
const snapshot = JSON.parse(input);
assert.equal(snapshot.rows.length, 6);
for (const row of snapshot.rows) {
  assert.match(row.key, /^nl:synthetic:sv4-backup:[0-9a-f]{32}:[a-z]+$/);
}
const key = randomBytes(32);
const encrypted = sealBackup(snapshot, key);
const opened = openBackup(encrypted, key);
assert.deepEqual(opened, snapshot);
assert.equal(encrypted.equals(sealBackup(snapshot, key)), false);
assert.throws(() => openBackup(encrypted, randomBytes(32)));
const corrupt = Buffer.from(encrypted);
corrupt[corrupt.length - 1] ^= 1;
assert.throws(() => openBackup(corrupt, key));
assert.throws(() => openBackup(encrypted.subarray(0, 30), key));
assert.throws(() => restoreRows(opened, snapshot.capturedAt - 1));
assert.throws(() => sealBackup({ ...snapshot, rows: [snapshot.rows[0], snapshot.rows[0]] }, key));
assert.throws(() => sealBackup({ ...snapshot, rows: [
  { ...snapshot.rows[0], key: "foreign:key" },
] }, key));
const expiry = snapshot.rows.find(row => row.expiresAt !== null)?.expiresAt;
assert.ok(Number.isSafeInteger(expiry) && expiry > snapshot.capturedAt);
process.stdout.write(JSON.stringify({
  rows: restoreRows(opened, snapshot.capturedAt),
  afterExpiry: restoreRows(opened, expiry),
}));
