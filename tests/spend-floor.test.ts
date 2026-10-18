/**
 * The automatic AI and upload ceilings, held to the owner's floor: a paying
 * customer using every allowance of its plan in full, every month of the
 * period, with no sales commission, keeps at least 60% of what it paid after
 * a 27.5% profit tax. Before tax that allows P x 5/29 of costs
 * (lib/cost-envelope.ts, maximumPretaxCostCents).
 *
 * Costs are the per-plan worst case of tests/plan-cost-model.ts, the sum of
 * every line of tests/plan-cost-registry.ts (storage, video, visits, orders,
 * email, receipts, the automatic AI ceiling, upload operations, workflows,
 * imports, the ClickFunnels move, shared funnels, quizzes, and since 17
 * October 2026 the studio, the API, the inbox, store and access emails,
 * calls to other services, public requests and the share of stores that pay
 * nothing), and, since 18 October 2026, receiving the payment in the one
 * model every plan and add-on is held to (lib/receiving-costs.ts): the dearer
 * provider's fee (6.6% + 30 cents) on the amount charged with the buyer's tax
 * on top at 27%, remittance, and refund and dispute reserves. One window is
 * one payment: since that day every allowance follows the store's billing
 * month (lib/allowance-window.ts), so a monthly plan is one window and an
 * annual plan twelve, for ten monthly prices. And, once a payment, what that
 * payment can leave behind after its plan ends (the registry's
 * PER_PAYMENT_LINES: everything the store keeps, until its closing day). What
 * the registry lists as OPEN is not in the sum and not certified here.
 *
 * Under that model no plan keeps 60% at its full use today
 * (docs/margin-alignment-2026-10-18.md, generated and checked by
 * tests/margin-alignment.test.ts), and the owner ruled out cutting any limit
 * a customer sees. So each plan here either keeps the floor or is not on
 * sale: a plan that misses can never be opened by these sums.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { PUBLISHED_PLAN_PRICES, TIERS, type Cycle, type Tier } from "@/lib/plan";
import { maximumPretaxCostCents } from "@/lib/cost-envelope";
import { PLANNING_PROFIT_TAX_FLOOR_BPS } from "@/lib/net-margin-rules";
import { AUTOMATIC_AI_STORE_MICRO_USD, currentAiSpendPolicy } from "@/lib/ai-spend-policy";
import { currentUploadBudgetPolicy, uploadWorstCostMicroUsd } from "@/lib/upload-budget-policy";
import { AI_MONTHLY } from "@/lib/ai-rules";
import { ANSWERS_MONTHLY } from "@/lib/answers-rules";
import { ANSWER_MICRO_USD, WRITING_JOB_MICRO_USD } from "@/lib/spend-cost-table";
import { SIZING_READING, unitUnder } from "@/lib/receiving-costs";
import { PLANS_ON_SALE } from "@/lib/opening";
import { aiCeilingUsd, perPaymentCost, uploadOpsUsd, worstCost, worstLines } from "./plan-cost-model";

const months = (cycle: Cycle) => (cycle === "year" ? 12 : 1);
function sum(tier: Tier, cycle: Cycle) {
  const priceCents = PUBLISHED_PLAN_PRICES[tier][cycle];
  const paid = priceCents / 100;
  const allowed = maximumPretaxCostCents(priceCents, PLANNING_PROFIT_TAX_FLOOR_BPS)! / 100;
  const monthly = worstCost(tier);
  const ai = aiCeilingUsd(tier), uploads = uploadOpsUsd(tier);
  const after = perPaymentCost(tier);
  const usageCents = Math.ceil(Math.round((months(cycle) * monthly + after) * 1e7) / 1e5);
  const unit = unitUnder(priceCents, usageCents, SIZING_READING, true);
  const receiving = unit.totalCents / 100;
  const total = receiving + usageCents / 100;
  const other = monthly - ai - uploads;
  return { paid, allowed, receiving, other, ai, uploads, after, total, room: allowed - total, unit };
}

test("each plan's AI ceiling is its published writing jobs and answers at the priced units", () => {
  for (const tier of TIERS) assert.equal(AUTOMATIC_AI_STORE_MICRO_USD[tier], AI_MONTHLY[tier] * WRITING_JOB_MICRO_USD + ANSWERS_MONTHLY[tier] * ANSWER_MICRO_USD);
  const ai = currentAiSpendPolicy()!, uploads = currentUploadBudgetPolicy()!;
  for (const tier of TIERS) assert.equal(ai.storeMicroUsd[tier], AUTOMATIC_AI_STORE_MICRO_USD[tier]);
  for (const scope of ["trial", "setup", "ended"] as const) {
    assert.equal(ai.storeMicroUsd[scope], 0);
    assert.equal(ai.fundedStores[scope], 0);
    assert.deepEqual(uploads.perStore[scope], { opens: 0, authorizedBytes: 0, controlRequests: 0 });
    assert.equal(uploads.fundedStores[scope], 0);
  }
});

for (const tier of TIERS) for (const cycle of ["month", "year"] as const) {
  const name = `${tier}, ${cycle}`;
  test(`${name}: every allowance used in full, the AI and upload ceilings included, keeps 60% after tax, or is not on sale`, () => {
    const row = sum(tier, cycle);
    console.log(`${name}: paid $${row.paid.toFixed(2)}, costs allowed $${row.allowed.toFixed(4)}; receiving $${row.receiving.toFixed(4)} + ${months(cycle)} x ($${row.other.toFixed(4)} other + $${row.ai.toFixed(4)} AI + $${row.uploads.toFixed(4)} uploads) + $${row.after.toFixed(4)} kept after the plan ends = $${row.total.toFixed(4)}; room $${row.room.toFixed(4)}; net ${(row.unit.netBps / 100).toFixed(2)}%`);
    // The sums agree with the cost envelope: within a cent of rounding, the costs allowed are the receiving model's own budget.
    assert.ok(Math.abs(row.allowed * 100 - (row.unit.usageRoomCents + row.unit.totalCents)) <= 1, `${name}: the envelope and the receiving model disagree`);
    if (row.unit.meetsFloor) assert.ok(row.total <= row.allowed, `${name} costs $${row.total.toFixed(4)} against $${row.allowed.toFixed(4)} allowed`);
    else assert.equal(PLANS_ON_SALE, false, `${name} keeps ${(row.unit.netBps / 100).toFixed(2)}% at full use, short of 60% by $${(row.unit.gapCents / 100).toFixed(2)}, and may not be on sale`);
  });
}

test("every plan on sale keeps the floor on both cycles with room to spare, and Store still without AI", () => {
  // Until October 17, 2026 Store paid by the year was $1.42 short (a todo
  // here), and Studio and Scale had $0.55 and $1.68 of room by the year
  // before the features of that day were counted at all. The room asserted
  // is the buffer kept, so a later allowance cannot spend a plan back to the
  // edge without failing here: $0.25 by the month, $1 by the year. Since
  // 18 October 2026, when receiving a payment was costed in full, no plan
  // has that room, and none is on sale (docs/margin-alignment-2026-10-18.md).
  assert.equal(AUTOMATIC_AI_STORE_MICRO_USD.creator, 0);
  for (const tier of TIERS) for (const cycle of ["month", "year"] as const) {
    const row = sum(tier, cycle);
    if (PLANS_ON_SALE) assert.ok(row.room >= (cycle === "year" ? 1 : 0.25), `${tier}, ${cycle}: room $${row.room.toFixed(4)}`);
  }
});

test("the worst month, line by line", () => {
  for (const tier of TIERS) {
    const lines = Object.entries(worstLines(tier)).map(([id, usd]) => `${id} $${usd.toFixed(4)}`).join(", ");
    console.log(`${tier}: ${lines}; total $${worstCost(tier).toFixed(4)}`);
  }
});
