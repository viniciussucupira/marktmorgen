/**
 * The limits proposal of 18 October 2026 (docs/limits-proposal-2026-10-18.md):
 * a PROPOSAL, no limit in code changes. The document must be what
 * tests/limits-proposal-table.ts renders today (regenerate it with
 * `node scripts/limits-proposal.mjs`), and every figure it proposes must
 * do what it says.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { join } from "node:path";
import { PLANS_ON_SALE } from "@/lib/opening";
import { ASSISTANT_INPUT_BYTES } from "@/lib/store-assistant-rules";
import { CENTS_PER_MINUTE, MIN_CENTS } from "@/lib/auto-captions-rules";
import { ORDER, assistantAt, assistantInputCap, captionsMinimumFor, captionsOptions, captionsPrice, captionsTodayAnyMinimum, captionsWorstBps, figures, perMinuteHolds, proposals, renderLimitsProposal } from "./limits-proposal-table";

const DOC = "docs/limits-proposal-2026-10-18.md";
const read = (file: string) => readFileSync(join(process.cwd(), file), "utf8");

test("the document is what the numbers render today (run node scripts/limits-proposal.mjs)", () => {
  assert.equal(read(DOC), renderLimitsProposal(PLANS_ON_SALE, PLANS_ON_SALE), `${DOC} is stale: run node scripts/limits-proposal.mjs`);
  assert.match(read(DOC), /^# Limits proposal, 18 October 2026 — a PROPOSAL, nothing here is in force/);
});

test("every proposed figure is a cut, never a raise, and a reachable plan keeps 60% at the figures as printed", () => {
  for (const schedule of ["published", "without"] as const) for (const p of proposals(schedule)) {
    const today = figures(p.tier);
    for (const id of ORDER) p.proposed[id].forEach((n, i) => assert.ok(n <= today[id][i], `${p.tier} ${p.cycle} ${id}: ${n} above today's ${today[id][i]}`));
    if (p.feasible) assert.ok(p.netBps >= 6_000, `${schedule} ${p.tier} ${p.cycle} keeps ${p.netBps}`);
  }
  // Under the published prices every plan but Store monthly is reachable; Store monthly misses even with every printed line at zero.
  const published = proposals("published");
  assert.deepEqual(published.filter((p) => !p.feasible).map((p) => `${p.tier}-${p.cycle}`), ["creator-month"]);
  assert.ok(published.find((p) => p.tier === "creator" && p.cycle === "month")!.atZeroBps < 6_000);
});

test("the Store assistant's input cap: the largest that keeps 60%, one byte more misses", () => {
  const cap = assistantInputCap(false), room = assistantInputCap(true);
  assert.ok(cap < ASSISTANT_INPUT_BYTES && room <= cap);
  assert.equal(assistantAt(cap).meets, true);
  assert.equal(assistantAt(cap + 1).meets, false);
  assert.equal(assistantAt(room).withRoom, true);
  assert.equal(assistantAt(room + 1).withRoom, false);
  assert.equal(assistantAt(ASSISTANT_INPUT_BYTES).meets, false, "today's cap misses, which is why it is proposed");
});

test("AI captions: today's price misses at every minimum, the proposed ones keep 60%, and captions are not on sale", () => {
  assert.equal(captionsTodayAnyMinimum(), false);
  assert.ok(captionsWorstBps(CENTS_PER_MINUTE, MIN_CENTS) < 6_000);
  const lowest = captionsPrice();
  assert.ok(captionsWorstBps(lowest.perMinute, lowest.minimum) >= 6_000);
  assert.deepEqual([perMinuteHolds(lowest.perMinute), perMinuteHolds(lowest.perMinute - 1)], [true, false]);
  for (const o of captionsOptions()) {
    assert.ok(captionsWorstBps(o.perMinute, o.minimum) >= 6_000);
    assert.ok(o.minimum === 25 || captionsWorstBps(o.perMinute, o.minimum - 25) < 6_000);
    assert.equal(captionsMinimumFor(o.perMinute), o.minimum);
  }
  // Not on sale: charged only to a store with an active subscription, and none can be started while the plans are closed.
  assert.equal(PLANS_ON_SALE, false);
  assert.match(read("lib/auto-captions.ts"), /if \(!store\.subscriptionActive \|\| !store\.subscriptionId \|\| !store\.stripeCustomerId\) return \{ ok: false, reason: "plan" \};/);
  assert.match(read("app/api/billing/checkout/route.ts"), /if \(!PLANS_ON_SALE\) return away/);
});
