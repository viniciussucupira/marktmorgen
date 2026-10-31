import { PUBLISHED_PLAN_PRICES, type Tier, type Cycle } from "@/lib/plan";

/** A lost payment is a funded liability, never a forecast fee or free allowance. */
export const PLAN_PAYMENT_DISPUTE_KEYS = [
  "creator_month", "creator_year", "pro_month", "pro_year", "scale_month", "scale_year",
] as const;
export type PlanPaymentDisputeKey = typeof PLAN_PAYMENT_DISPUTE_KEYS[number];
export const PLAN_PAYMENT_DISPUTE_COST_RULES = {
  schema: 1, currency: "USD-cents",
  principal: "maximum-total-paid-per-contract-including-all-payments",
  fees: "maximum-total-lost-dispute-fees-over-reviewed-liability-tail",
  unknown: "deny-not-zero", annual: "full-loss-not-divided-by-twelve",
  taxRecovery: "no-credit", reservation: "replace-existing-principal-not-add-it-twice",
  feeAccounting: "included-once-in-refundAndDisputeFees",
  maxInteger: 1_000_000_000_000,
  plans: PLAN_PAYMENT_DISPUTE_KEYS,
} as const;
export type PlanPaymentDisputeCost = {
  maximumPaidPrincipalCents: number | null;
  maximumTotalFeesCents: number | null;
  allContractPaymentsBounded: boolean;
  liabilityTailReviewed: boolean;
  evidence: string;
};
export type PlanPaymentDisputeReview = Partial<Record<PlanPaymentDisputeKey, PlanPaymentDisputeCost | null>>;
export type ReviewedPlanPaymentDisputeCosts = Record<PlanPaymentDisputeKey, {
  principalCents: number; feesCents: number; lostPaymentWorstCaseCents: number;
}>;
function own(value: unknown, key: string): unknown {
  try {
    if (!value || typeof value !== "object" || Array.isArray(value)) return undefined;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    return descriptor && Object.hasOwn(descriptor, "value") ? descriptor.value : undefined;
  } catch { return undefined; }
}
const cents = (value: unknown): value is number =>
  typeof value === "number" && Number.isSafeInteger(value) && value >= 0 &&
  value <= PLAN_PAYMENT_DISPUTE_COST_RULES.maxInteger;

/** Read once, without executing a review. No provider/bank/tax fact is supplied here.
 * Fees of zero require an explicit reviewed value and evidence, never a default.
 * The loss is the whole contract's principal plus fees, including for a yearly plan.
 */
export function assessPlanPaymentDisputeCosts(value: unknown): ReviewedPlanPaymentDisputeCosts | null {
  const result = {} as ReviewedPlanPaymentDisputeCosts;
  for (const key of PLAN_PAYMENT_DISPUTE_KEYS) {
    const row = own(value, key);
    const principal = own(row, "maximumPaidPrincipalCents");
    const fees = own(row, "maximumTotalFeesCents");
    const evidence = own(row, "evidence");
    const [tier, cycle] = key.split("_") as [Tier, Cycle];
    if (!cents(principal) || principal < PUBLISHED_PLAN_PRICES[tier][cycle] || !cents(fees) ||
        own(row, "allContractPaymentsBounded") !== true || own(row, "liabilityTailReviewed") !== true ||
        typeof evidence !== "string" || !evidence.trim() || evidence.length > 1_000) return null;
    const loss = BigInt(principal) + BigInt(fees);
    if (loss > BigInt(PLAN_PAYMENT_DISPUTE_COST_RULES.maxInteger)) return null;
    result[key] = { principalCents: principal, feesCents: fees, lostPaymentWorstCaseCents: Number(loss) };
  }
  return result;
}
