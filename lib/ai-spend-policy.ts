/** Reviewed USD microdollar ceilings. Unknown budgets never authorize spending. */
export const AI_SPEND_RULES = {
  schema: 1,
  microUsdPerUsd: 1_000_000,
  maxInteger: 1_000_000_000_000,
  reservation: 'full-reviewed-request-ceiling-no-refunds',
  ledger: 'nl:ai-spend:v1:YYYY-MM',
  missingLedger: 'deny',
  expiry: 'none',
} as const;
export const AI_BUDGET_TIERS = ['creator', 'pro', 'scale', 'trial'] as const;
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
};
/** No complete, funded, all-cost allocation has been approved. Do not invent a budget. */
export const CURRENT_AI_SPEND_POLICY: AiSpendPolicy | null = null;
