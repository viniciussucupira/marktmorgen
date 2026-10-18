/**
 * What the site says Marktmorgen takes from a sale (lib/fee-words.ts), held
 * to the switch that decides it (lib/plan.ts COMMISSION_LIVE):
 *
 *   - no page outside lib/fee-words.ts says that nothing is taken from a
 *     sale, so the switch changes every such sentence at once;
 *   - the version for after the switch never says it, and names the share;
 *   - the version for today says 0% of a sale, at the price list of 18 October 2026.
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
  assert.equal(today.gumroad.hundred, "Gumroad's cut is $320 that month. Ours is $69, whether you sell a hundred files or a thousand.");
  assert.equal(today.beacons.ours, "Our cut is 0%, Stripe takes about $1.08, so you keep $25.92 — and you pay $69 that month.");
  assert.equal(monthlyRow(false), "$69, $449 or $999, free for the first 14 days");
  assert.equal(yearlyRow(false), "$690, $4,490 or $9,990 a year");
  assert.equal(planPriceWords("creator", "month", false), "$69 a month");
  // So the scan above cannot pass by matching nothing: it finds today's words.
  assert.ok(sentences(today).some((s) => SAYS_NOTHING.test(s)));
});

test("after the switch, nothing says nothing is taken, and the share is named", () => {
  const live = feeWords(true);
  const said = sentences(live).filter((s) => SAYS_NOTHING.test(s));
  assert.deepEqual(said, []);
  assert.equal(planPriceWords("creator", "month", true), "$69 a month + 6.25% of each sale");
  assert.equal(planPriceWords("scale", "year", true), "$9,990 a year");
  assert.equal(monthlyRow(true), "$69 + 6.25% of each sale, $449 + 2.75%, or $999, free for the first 14 days");
  assert.match(live.gumroad.ours, /Our share is 6\.25%, \$1\.68, .* so you keep \$24\.24/);
  assert.match(live.gumroad.hundred, /Ours is \$237/);
  assert.match(live.termsCharge, /6\.25% on Store, 2\.75% on Studio, none on Scale/);
});

test("the Gumroad post's sums: today's as published, and worked again for the share", async () => {
  const { gumroadSums } = await import("@/lib/fee-words");
  const today = gumroadSums(false);
  assert.equal(today.five, "Gumroad leaves you $113.60. Your own Stripe with a $69 monthly plan leaves you $60.60. Gumroad wins by $53, and at that volume you should be using it.");
  assert.equal(today.evenTitle, "Twenty-two sales of $27");
  assert.equal(today.even, "Gumroad leaves you $499.84. Your own Stripe leaves you $501.24. This is the crossing point, give or take a sale.");
  assert.equal(today.hundred, "Gumroad leaves you $2,272. Your own Stripe leaves you $2,523. The difference is $251, in one month.");
  assert.equal(today.fiveHundred, "Gumroad leaves you $11,360. Your own Stripe leaves you $12,891. The difference is $1,531, in one month, and it comes back every month.");
  const live = gumroadSums(true);
  assert.equal(live.evenTitle, "45 sales of $27");
  // Five hundred sales of $27 is $13,500: Scale, with no share, is the plan such a store picks.
  assert.equal(live.fiveHundred, "Gumroad leaves you $11,360. Your own Stripe leaves you $12,141. The difference is $781, in one month, and it comes back every month.");
  assert.ok(!Object.values(live).some((s) => SAYS_NOTHING.test(s)));
});

test("every public comparison sale-share row follows the published plan offer", async () => {
  const { PAGES } = await import("@/lib/site-pages");
  const rows = PAGES.flatMap(page => page.blocks.flatMap(block => block.kind === "table" ? block.rows.filter(row => row[0] === "Cut of each sale").map(row => ({ page: page.slug, ours: row[2] })) : []));
  assert.ok(rows.length >= 4, "All existing comparison fee rows must be inspected");
  for (const row of rows) assert.equal(row.ours, feeWords().short, row.page + " must use the published share for all plans");
});
