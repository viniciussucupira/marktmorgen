/** Reviewed USD microdollar ceilings. Unknown budgets never authorize spending. */
export const AI_SPEND_RULES = {
  schema: 3,
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
  return JSON.stringify([AI_SPEND_RULES.schema, policy.reviewId, policy.month, policy.evidence,
    ['claude-sonnet-5-5', 'claude-haiku-5-5'].map(model => [model, policy.requestMicroUsd[model as keyof typeof policy.requestMicroUsd]]),
    AI_BUDGET_TIERS.map(tier => [tier, policy.storeMicroUsd[tier], policy.fundedStores[tier]]), policy.companyMicroUsd]);
}
