/** Conservative assessment of declared, evidenced cost ceilings; never a billing authorization. */
export const MINIMUM_NET_MARGIN_BPS = 6_000;
export const PROFIT_COST_CATEGORIES = [
  "taxes", "ownerTaxes", "paymentFees", "ai", "email", "computeAndDatabase", "storageAndTransfer",
  "video", "supportAndOperations", "allocatedFixedCosts", "acquisitionAndCommissions",
  "fraudAndDisputes", "lifecycleAndOther",
] as const;
export type ProfitCostCategory = typeof PROFIT_COST_CATEGORIES[number];
export type ProfitCostBound = { cents: number; evidence: string };
export type ProfitScenario = {
  scope: "plan" | "customer" | "company";
  reference: string;
  scenario: string;
  currency: string;
  period: string;
  /** Collected revenue less discounts, refunds and reversals, before deducting costs/taxes. */
  retainedRevenueCents: number;
  /** All entitlements used together, including trials, cancellation and retained data. */
  fullEntitlementBoundConfirmed: boolean;
  /** Jurisdiction-specific taxes, including taxes on income/profit, have been assessed. */
  taxesConfirmed: boolean;
  /** Personal taxes attributable to the business, explicitly including Brazilian personal taxes on this American business. */
  ownerTaxesConfirmed: boolean;
  validUntil: number;
  costs: Record<ProfitCostCategory, ProfitCostBound>;
};
export type ProfitAssessment =
  | { status: "unverified"; reason: string }
  | { status: "no_revenue" | "below_floor" | "meets_floor"; totalCostCents: number; netProfitCents: number; maximumCostCents: number };
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const money = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;

/** Unknown taxes, unbounded consumption, stale evidence and omitted cost lines never pass. */
export function assessProfitScenario(raw: unknown, nowSeconds = Math.floor(Date.now() / 1_000)): ProfitAssessment {
  const unknown = (reason: string): ProfitAssessment => ({ status: "unverified", reason });
  if (!object(raw) || !Number.isSafeInteger(nowSeconds) || nowSeconds < 0) return unknown("invalid_scenario");
  if ((raw.scope !== "plan" && raw.scope !== "customer" && raw.scope !== "company") || !text(raw.reference) || !text(raw.scenario) || !text(raw.period) || raw.currency !== "USD") return unknown("invalid_identity");
  if (!money(raw.retainedRevenueCents)) return unknown("invalid_revenue");
  if (raw.fullEntitlementBoundConfirmed !== true) return unknown("unbounded_entitlements");
  if (raw.taxesConfirmed !== true) return unknown("taxes_unconfirmed");
  if (raw.ownerTaxesConfirmed !== true) return unknown("owner_taxes_unconfirmed");
  if (!money(raw.validUntil) || raw.validUntil <= nowSeconds) return unknown("expired_cost_evidence");
  if (!object(raw.costs)) return unknown("missing_costs");
  let total = BigInt(0);
  for (const category of PROFIT_COST_CATEGORIES) {
    if (!Object.hasOwn(raw.costs, category)) return unknown("missing_cost:" + category);
    const line = raw.costs[category];
    if (!object(line) || !money(line.cents) || !text(line.evidence)) return unknown("unverified_cost:" + category);
    total += BigInt(line.cents);
  }
  if (total > BigInt(Number.MAX_SAFE_INTEGER)) return unknown("cost_overflow");
  const revenue = BigInt(raw.retainedRevenueCents);
  const result = { totalCostCents: Number(total), netProfitCents: Number(revenue - total), maximumCostCents: Number(revenue * BigInt(2) / BigInt(5)) };
  if (revenue === BigInt(0)) return { status: "no_revenue", ...result };
  return { status: total * BigInt(5) <= revenue * BigInt(2) ? "meets_floor" : "below_floor", ...result };
}

/** Each client/scenario must pass individually; a profitable portfolio cannot subsidize a failing client. */
export function assessProfitPortfolio(raw: unknown, nowSeconds = Math.floor(Date.now() / 1_000)): { meetsPolicy: boolean; reasons: string[]; assessments: ProfitAssessment[] } {
  if (!object(raw) || !Array.isArray(raw.scenarios) || !raw.scenarios.length) return { meetsPolicy: false, reasons: ["missing_scenarios"], assessments: [] };
  const reasons: string[] = [];
  if (raw.coverageConfirmed !== true) reasons.push("customer_and_lifecycle_coverage_unconfirmed");
  const assessments = Array.from(raw.scenarios, item => assessProfitScenario(item, nowSeconds));
  if (assessments.some(item => item.status !== "meets_floor")) reasons.push("scenario_not_proven");
  if (!raw.scenarios.some(item => object(item) && item.scope === "customer")) reasons.push("missing_customer_scenarios");
  if (!raw.scenarios.some(item => object(item) && item.scope === "company")) reasons.push("missing_company_scenarios");
  const identities = new Set<string>();
  let basis: string | undefined;
  for (const item of raw.scenarios) {
    if (!object(item)) continue;
    const identity = JSON.stringify([item.scope, item.reference, item.scenario, item.period]);
    if (identities.has(identity)) reasons.push("duplicate_scenario");
    identities.add(identity);
    const currentBasis = JSON.stringify([item.currency, item.period]);
    if (basis !== undefined && basis !== currentBasis) reasons.push("incomparable_currency_or_period");
    basis = currentBasis;
  }
  return { meetsPolicy: reasons.length === 0, reasons: [...new Set(reasons)], assessments };
}
