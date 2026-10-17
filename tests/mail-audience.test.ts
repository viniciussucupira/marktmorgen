/**
 * Buyers and people who have not bought yet: the two halves of a list
 * (lib/contacts.ts), and the sequence that starts on a first purchase.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { WHO, isBuyer } from "@/lib/contacts";

const paid = new Set(["course", "plan"]);

test("somebody holding a product sold for money is a buyer", () => {
  assert.equal(isBuyer({ ids: ["guide", "plan"], source: "free" }, paid), true);
});

test("somebody who only took what is free is not", () => {
  assert.equal(isBuyer({ ids: ["guide"], source: "free" }, paid), false);
  assert.equal(isBuyer({ ids: [], source: "import" }, paid), false);
  assert.equal(isBuyer({ ids: [], source: "" }, paid), false);
});

test("deleting a product, or making it free, does not turn the people who paid for it into leads", () => {
  // They first agreed at a checkout. An email that opens "you have not bought
  // anything yet" must never reach them because the catalogue changed.
  assert.equal(isBuyer({ ids: ["gone"], source: "buyer" }, paid), true);
  assert.equal(isBuyer({ ids: [], source: "buyer" }, new Set()), true);
});

test("the two kinds are each other's complement, so nobody is in both and nobody in neither", () => {
  const src = readFileSync(join(process.cwd(), "lib/contacts.ts"), "utf8");
  assert.match(src, /isBuyer\(contact, who\.paid\) !== \(who\.kind === "buyers"\)\) return;/);
  assert.deepEqual([...WHO], ["all", "buyers", "leads"]);
});

test("who is sold for money comes from the store's index, not from reading products", () => {
  const src = readFileSync(join(process.cwd(), "lib/broadcasts.ts"), "utf8");
  assert.match(src, /paid: new Set\(idsOfKind\(store, "paid"\)\)/);
  // And it is worked out again when a scheduled email starts, so a product
  // priced since then counts.
  assert.match(src, /whoOf\(store, b\.who\)/);
});

test("an email scheduled before the choice existed goes to who it was addressed to", () => {
  const src = readFileSync(join(process.cwd(), "lib/broadcasts.ts"), "utf8");
  assert.match(src, /who: WHO\.includes\(value\.who\) \? value\.who : "all"/);
});

test("a sequence can start on the first thing somebody pays for", () => {
  const src = readFileSync(join(process.cwd(), "lib/flows.ts"), "utf8");
  assert.match(src, /f\.trigger === "bought" && paid/);
  assert.match(src, /idsOfKind\(store, "paid"\)\.includes\(event\.productId as string\)/, "a free download is not a purchase");
  // Saved triggers are read from one list (lib/flow-rules.ts, FLOW_TRIGGERS), which has "bought".
  assert.match(src, /FLOW_TRIGGERS\.find\(\(t\) => t === raw\.trigger\)/, "and the studio may save one");
  assert.match(readFileSync(join(process.cwd(), "lib/flow-rules.ts"), "utf8"), /export const FLOW_TRIGGERS[^\n]*"bought"/);
});
