/**
 * What the site says Marktmorgen takes from a sale (lib/fee-words.ts), held
 * to the switch that decides it (lib/plan.ts COMMISSION_LIVE):
 *
 *   - no page outside lib/fee-words.ts says that nothing is taken from a
 *     sale, so the switch changes every such sentence at once;
 *   - the version for after the switch never says it, and names the share;
 *   - the version for today is the one the site has always shown.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { feeWords, monthlyRow, planPriceWords, yearlyRow } from "@/lib/fee-words";

const SAYS_NOTHING = /(?<![\d.])0% of (your|the|a creator|each|every)|take[s]? 0%|take[s]? no cut|no cut of your|We take nothing|nothing taken on top|nothing from your sales|(?<![\d.])0%, as on/i;

function sentences(value: unknown): string[] {
  if (typeof value === "string") return [value];
  if (typeof value === "function") return [String((value as (price: string) => string)("$22"))];
  if (value && typeof value === "object") return Object.values(value).flatMap(sentences);
  return [];
}

function files(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return files(path);
    return /\.(ts|tsx)$/.test(name) ? [path] : [];
  });
}

test("no page outside lib/fee-words.ts says nothing is taken from a sale", () => {
  const found = ["app", "components", "lib"]
    .flatMap((dir) => files(join(process.cwd(), dir)))
    .filter((path) => !path.endsWith(join("lib", "fee-words.ts")))
    .filter((path) => SAYS_NOTHING.test(readFileSync(path, "utf8")));
  assert.deepEqual(found, []);
});

test("today's words are the ones the site has always shown, and the scan reads them", () => {
  const today = feeWords(false);
  assert.equal(today.short, "0% of your sales");
  assert.equal(today.gumroad.ours, "We take nothing. Stripe charges you its own published rate on your own account — about $1.08 on $27 — so you keep $25.92, and you pay us a fixed monthly price.");
  assert.equal(today.gumroad.hundred, "Gumroad's cut is $320 that month. Ours is $29, whether you sell a hundred files or a thousand.");
  assert.equal(today.beacons.ours, "Our cut is 0%, Stripe takes about $1.08, so you keep $25.92 — and you pay $29 that month.");
  assert.equal(monthlyRow(false), "$29 and $99, free for the first 14 days");
  assert.equal(yearlyRow(false), "$300 and $948 a year");
  assert.equal(planPriceWords("creator", "month", false), "$29 a month");
  // So the scan above cannot pass by matching nothing: it finds today's words.
  assert.ok(sentences(today).some((s) => SAYS_NOTHING.test(s)));
});

test("after the switch, nothing says nothing is taken, and the share is named", () => {
  const live = feeWords(true);
  const said = sentences(live).filter((s) => SAYS_NOTHING.test(s));
  assert.deepEqual(said, []);
  assert.equal(planPriceWords("creator", "month", true), "$22 a month + 6.25% of each sale");
  assert.equal(planPriceWords("scale", "year", true), "$3,490 a year");
  assert.equal(monthlyRow(true), "$22 + 6.25% of each sale, $149 + 2.75%, or $349, free for the first 14 days");
  assert.match(live.gumroad.ours, /Our share is 6\.25%, \$1\.68, .* so you keep \$24\.24/);
  assert.match(live.gumroad.hundred, /Ours is \$190/);
  assert.match(live.termsCharge, /6\.25% on Store, 2\.75% on Studio, none on Scale/);
});
