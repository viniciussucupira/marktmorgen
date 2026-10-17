/**
 * The automatic AI and upload ceilings, held to the owner's floor: a paying
 * customer using every allowance of its plan in full, every month of the
 * period, with no sales commission, keeps at least 60% of what it paid after
 * a 27.5% profit tax. Before tax that allows P x 5/29 of costs
 * (lib/cost-envelope.ts, maximumPretaxCostCents).
 *
 * Costs are the per-plan worst case of tests/plan-cost-model.ts (storage at
 * the dearest store, video, visits, orders, email, receipts), the automatic
 * AI ceiling (lib/ai-spend-policy.ts), every upload operation the automatic
 * upload allowance can start (lib/upload-budget-policy.ts), and Stripe's card
 * and Billing fees on the charge. An annual plan is twelve full months for
 * ten monthly prices.
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
import { BILLING_RATE, aiCeilingUsd, uploadOpsUsd, worstCost } from "./plan-cost-model";

const months = (cycle: Cycle) => (cycle === "year" ? 12 : 1);
function sum(tier: Tier, cycle: Cycle) {
  const paid = PUBLISHED_PLAN_PRICES[tier][cycle] / 100;
  const allowed = maximumPretaxCostCents(PUBLISHED_PLAN_PRICES[tier][cycle], PLANNING_PROFIT_TAX_FLOOR_BPS)! / 100;
  const stripe = paid * (0.029 + BILLING_RATE) + 0.3;
  const monthly = worstCost(tier);
  const ai = aiCeilingUsd(tier), uploads = uploadOpsUsd(tier);
  const total = stripe + months(cycle) * monthly;
  const other = monthly - ai - uploads;
  return { paid, allowed, stripe, other, ai, uploads, total, room: allowed - total };
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
  const known = tier === "creator" && cycle === "year";
  test(`${name}: every allowance used in full, the AI and upload ceilings included, keeps 60% after tax`, { todo: known ? "Store paid by the year is short of the floor before any AI or upload: its visits, orders and receipt allowances need the owner's decision" : false }, () => {
    const row = sum(tier, cycle);
    console.log(`${name}: paid $${row.paid.toFixed(2)}, costs allowed $${row.allowed.toFixed(4)}; Stripe $${row.stripe.toFixed(4)} + ${months(cycle)} x ($${row.other.toFixed(4)} other + $${row.ai.toFixed(4)} AI + $${row.uploads.toFixed(4)} uploads) = $${row.total.toFixed(4)}; room $${row.room.toFixed(4)}`);
    assert.ok(row.total <= row.allowed, `${name} costs $${row.total.toFixed(4)} against $${row.allowed.toFixed(4)} allowed`);
  });
}

test("Store has no AI, so its shortfall paid by the year is none of the AI ceiling's making", () => {
  assert.equal(AUTOMATIC_AI_STORE_MICRO_USD.creator, 0);
  const row = sum("creator", "year");
  const withoutUploads = row.stripe + 12 * row.other;
  console.log(`creator, year, before AI and uploads: $${withoutUploads.toFixed(4)} against $${row.allowed.toFixed(4)} allowed`);
  assert.ok(withoutUploads > row.allowed, "if this now fits, remove the todo above");
});
