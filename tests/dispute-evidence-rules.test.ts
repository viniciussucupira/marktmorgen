import { test } from "node:test";
import assert from "node:assert/strict";
import { buildDisputeEvidencePacket, type RetainedPurchaseEvidence } from "@/lib/dispute-evidence-rules";

const scope = { account: "acct_fixture", store: "synthetic-store", purchase: "purchase-fixture", buyer: "buyer-fixture" };
const now = 1_000;
function record(patch: Partial<RetainedPurchaseEvidence> = {}): RetainedPurchaseEvidence {
  return { ...scope, kind: "receipt", source: "receipt:fixture", recordedAt: 500, retainedUntil: 2_000, text: "Synthetic purchase receipt", ...patch };
}
test("packet preserves original text and reports missing historical acceptance", () => {
  const text = "Original synthetic receipt\nAmount: 100";
  const packet = buildDisputeEvidencePacket(scope, [record({ text })], now);
  assert.equal(packet.records[0].text, text);
  assert.equal(packet.submitted, false);
  assert.ok(packet.missing.includes("accepted_terms"));
  assert.ok(packet.missing.includes("accepted_refund_policy"));
  assert.equal("buyer" in packet.records[0], false);
});
test("any different account, store, purchase or buyer rejects the complete batch", () => {
  for (const key of ["account", "store", "purchase", "buyer"] as const) {
    assert.throws(() => buildDisputeEvidencePacket(scope, [record(), record({ [key]: "other", source: "other" })], now), /^Error: Evidence packet unavailable$/);
  }
});
test("retention expiry is honored at the exact boundary without extending it", () => {
  const packet = buildDisputeEvidencePacket(scope, [record({ retainedUntil: now })], now);
  assert.deepEqual(packet.records, []);
  assert.ok(packet.missing.includes("receipt"));
  assert.equal(buildDisputeEvidencePacket(scope, [record({ retainedUntil: now + 1 })], now).records.length, 1);
});
test("future, invalid and duplicate original records fail without exposing their content", () => {
  for (const patch of [
    { recordedAt: now + 1 }, { recordedAt: NaN }, { retainedUntil: Infinity },
    { retainedUntil: 500 }, { source: "https://example.test/private?token=fixture" },
    { text: " " }, { kind: "invented" as RetainedPurchaseEvidence["kind"] },
  ]) assert.throws(() => buildDisputeEvidencePacket(scope, [record(patch)], now), /^Error: Evidence packet unavailable$/);
  assert.throws(() => buildDisputeEvidencePacket(scope, [record(), record()], now));
});
test("bounded packets reject oversized evidence instead of silently truncating it", () => {
  assert.throws(() => buildDisputeEvidencePacket(scope, [record({ text: "x".repeat(10_001) })], now));
  const large = Array.from({ length: 6 }, (_, i) => record({ source: "source:" + i, text: "x".repeat(10_000) }));
  assert.throws(() => buildDisputeEvidencePacket(scope, large, now));
  assert.throws(() => buildDisputeEvidencePacket(scope, Array.from({ length: 65 }, (_, i) => record({ source: "source:" + i })), now));
});
test("records sort chronologically and empty packets never invent facts", () => {
  const packet = buildDisputeEvidencePacket(scope, [record({ source: "later", recordedAt: 600 }), record({ source: "earlier", recordedAt: 400 })], now);
  assert.deepEqual(packet.records.map(row => row.source), ["earlier", "later"]);
  const empty = buildDisputeEvidencePacket(scope, [], now);
  assert.deepEqual(empty.records, []);
  assert.equal(empty.missing.length, 10);
  assert.equal(empty.submitted, false);
});
test("invalid scope and time are rejected", () => {
  assert.throws(() => buildDisputeEvidencePacket({ ...scope, buyer: "" }, [], now));
  assert.throws(() => buildDisputeEvidencePacket(scope, [], NaN));
  assert.throws(() => buildDisputeEvidencePacket(scope, [], -1));
});
