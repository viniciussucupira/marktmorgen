import { aiEntitlementsSnapshot } from '@/lib/ai-entitlement-rules';
import { SUPPORTED_AI_MODELS } from '@/lib/ai-request-rules';
/** Reviewed USD microdollar ceilings. Unknown budgets never authorize spending. */
export const AI_SPEND_RULES = {
  schema: 4,
  microUsdPerUsd: 1_000_000,
  maxInteger: 1_000_000_000_000,
  reservation: 'full-reviewed-request-ceiling-no-refunds',
  ledger: 'nl:ai-spend:v1:YYYY-MM',
  missingLedger: 'deny',
  expiry: 'none',
} as const;
export const AI_BUDGET_TIERS = ['creator', 'pro', 'scale', 'trial', 'setup', 'ended'] as const;
export type AiBudgetTier = typeof AI_BUDGET_TIERS[number];
export type AiSpendPolicy = {
  reviewId: string;
  month: string;
  evidence: string;
  /** Includes the full allowed context, output, media, billing surcharges and currency costs. */
  requestMicroUsd: Record<'claude-sonnet-5-5' | 'claude-haiku-5-5', number>;
  storeMicroUsd: Record<AiBudgetTier, number>;
  /** Includes trial/acquisition calls; those must be separately funded in the review. */
  companyMicroUsd: number;
  /** Maximum store allocations; every admitted store may use its full tier budget. */
  fundedStores: Record<AiBudgetTier, number>;
};
/** No complete, funded, all-cost allocation has been approved. Do not invent a budget. */
export const CURRENT_AI_SPEND_POLICY: AiSpendPolicy | null = null;

/** Canonical binding to every reviewed monetary ceiling; insertion order cannot change it. */
export function aiSpendPolicySnapshot(policy: AiSpendPolicy): string {
  return JSON.stringify([AI_SPEND_RULES.schema, policy.reviewId, policy.month, policy.evidence, aiEntitlementsSnapshot(),
    ['claude-sonnet-5-5', 'claude-haiku-5-5'].map(model => [model, policy.requestMicroUsd[model as keyof typeof policy.requestMicroUsd]]),
    AI_BUDGET_TIERS.map(tier => [tier, policy.storeMicroUsd[tier], policy.fundedStores[tier]]), policy.companyMicroUsd]);
}

const integer = (n: unknown): n is number => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0 && n <= AI_SPEND_RULES.maxInteger;
export function isAiSpendPolicyValid(policy: AiSpendPolicy | null, now = new Date()): policy is AiSpendPolicy {
  if (!policy || !Number.isFinite(now.getTime()) || policy.month !== now.toISOString().slice(0, 7)
    || typeof policy.reviewId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(policy.reviewId)
    || typeof policy.evidence !== 'string' || !policy.evidence.trim()
    || !integer(policy.companyMicroUsd) || policy.companyMicroUsd <= 0
    || !policy.storeMicroUsd || !AI_BUDGET_TIERS.every(tier => integer(policy.storeMicroUsd[tier]))
    || !policy.fundedStores || !AI_BUDGET_TIERS.every(tier => integer(policy.fundedStores[tier]))
    || !policy.requestMicroUsd || !SUPPORTED_AI_MODELS.every(model => integer(policy.requestMicroUsd[model]) && policy.requestMicroUsd[model] > 0)) return false;
  const total = AI_BUDGET_TIERS.reduce((sum, tier) => sum + BigInt(policy.storeMicroUsd[tier]) * BigInt(policy.fundedStores[tier]), BigInt(0));
  return AI_BUDGET_TIERS.some(tier => policy.fundedStores[tier] > 0) && total <= BigInt(policy.companyMicroUsd);
}

/** Full monthly allocations in USD cents, rounded upward only after annual aggregation. */
export function aiStoreCostCents(policy: AiSpendPolicy | null, tier: AiBudgetTier, months: number): number | null {
  if (!isAiSpendPolicyValid(policy) || !AI_BUDGET_TIERS.includes(tier) || (months !== 1 && months !== 12) || policy.fundedStores[tier] < 1) return null;
  return Number((BigInt(policy.storeMicroUsd[tier]) * BigInt(months) + BigInt(9999)) / BigInt(10000));
}
