import { test } from "node:test";
import { deepStrictEqual, throws } from "node:assert";
import { readPendingPayoutBatches } from "@/lib/pending-payouts";
const batch = { at: 1700000000000, currency: "USD", lines: [{ a: "legacy-affiliate", c: 1500 }] };
const saved = JSON.stringify(batch);
test("confirmed empty array and map remain empty", () => {
  deepStrictEqual([...readPendingPayoutBatches([[]])], []);
  deepStrictEqual([...readPendingPayoutBatches([{}])], []);
});
test("both hash shapes preserve legacy identifiers, amount and currency", () => {
  const expected = [["BATCH1ABC", batch]];
  deepStrictEqual([...readPendingPayoutBatches([["BATCH1ABC", saved]])], expected);
  deepStrictEqual([...readPendingPayoutBatches([{BATCH1ABC: saved}])], expected);
});
test("empty recovery batches remain readable", () => {
  deepStrictEqual(readPendingPayoutBatches([{OLD: JSON.stringify({...batch, lines: []})}]).get("OLD")?.lines, []);
});
for (const [name, response] of [
  ["missing envelope", undefined], ["missing reply", []], ["extra replies", [[], []]],
  ["null hash", [null]], ["string hash", [""]], ["odd hash", [["BATCH1ABC"]]],
  ["non-string key", [[2,saved]]], ["non-string value", [{BATCH1ABC:batch}]],
  ["duplicate key", [["BATCH1ABC",saved,"BATCH1ABC",saved]]],
  ["empty key", [["",saved]]], ["invalid JSON", [{BATCH1ABC:"{"}]],
  ["array record", [{BATCH1ABC:"[]"}]], ["null record", [{BATCH1ABC:"null"}]],
] as const) test(name+" is unavailable", () => { throws(() => readPendingPayoutBatches(response), /unavailable/); });
for (const [name, patch] of [
  ["missing timestamp", {at:undefined}], ["negative timestamp", {at:-1}],
  ["unsafe timestamp", {at:Number.MAX_SAFE_INTEGER+1}], ["timestamp string", {at:"1700"}],
  ["missing currency", {currency:undefined}], ["invalid currency", {currency:"US"}],
  ["missing lines", {lines:undefined}], ["null line", {lines:[null]}],
  ["missing affiliate", {lines:[{c:1}]}], ["blank affiliate", {lines:[{a:" ",c:1}]}],
  ["duplicate affiliate", {lines:[{a:"a",c:1},{a:"a",c:2}]}],
  ["zero cents", {lines:[{a:"a",c:0}]}], ["negative cents", {lines:[{a:"a",c:-1}]}],
  ["fractional cents", {lines:[{a:"a",c:1.5}]}], ["string cents", {lines:[{a:"a",c:"1"}]}],
  ["unsafe cents", {lines:[{a:"a",c:Number.MAX_SAFE_INTEGER+1}]}],
] as const) test(name+" never releases a partially valid hash", () => {
  throws(() => readPendingPayoutBatches([{GOOD:saved,BAD:JSON.stringify({...batch,...patch})}]), /unavailable/);
});
test("input records are left intact when any entry is invalid", () => {
  const raw = ["GOOD",saved,"BAD","{"];
  throws(() => readPendingPayoutBatches([raw]));
  deepStrictEqual(raw, ["GOOD",saved,"BAD","{"]);
});
