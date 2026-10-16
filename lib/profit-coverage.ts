import { confirmedProfitRevenue } from "@/lib/profit-revenue";
import { TIERS, type Tier, type Cycle } from "@/lib/plan";
import { assessProfitPortfolio, type ProfitAssessment } from "@/lib/profit-policy";

export const REQUIRED_PROFIT_CASES = ["full_entitlement", "maximum_discount", "refund", "nonpayment", "trial", "cancellation", "post_closure"] as const;
const CYCLES: readonly Cycle[] = ["month", "year"];
const object = (value: unknown): value is Record<string, unknown> => !!value && typeof value === "object" && !Array.isArray(value);
const money = (value: unknown): value is number => typeof value === "number" && Number.isSafeInteger(value) && value >= 0;
const text = (value: unknown): value is string => typeof value === "string" && value.trim().length > 0;
const offer = (plan: unknown, cycle: unknown) => TIERS.includes(plan as Tier) && CYCLES.includes(cycle as Cycle);
const identity = (scope: unknown, reference: unknown, scenario: unknown) => JSON.stringify([scope, reference, scenario]);
export type ProfitCoverageResult = { meetsPolicy: boolean; reasons: string[]; missing: string[]; assessments: ProfitAssessment[] };

/** Explicit stress coverage for every published tier/cycle and every declared customer. Read-only. */
export function assessProfitCoverage(raw: unknown, nowSeconds = Math.floor(Date.now() / 1000)): ProfitCoverageResult {
  const fail = (reason: string): ProfitCoverageResult => ({meetsPolicy:false,reasons:[reason],missing:[],assessments:[]});
  if (!object(raw) || raw.coverageConfirmed !== true) return fail("customer_inventory_unconfirmed");
  if (!Array.isArray(raw.customers) || !raw.customers.length) return fail("missing_customer_inventory");
  if (!Array.isArray(raw.scenarios)) return fail("missing_scenarios");
  const fixed = raw.fixedCostFloor;
  if (!object(fixed) || !money(fixed.cents) || !text(fixed.evidence) || !money(fixed.validUntil) || fixed.validUntil <= nowSeconds || fixed.currency !== "USD" || !text(fixed.period)) return fail("fixed_cost_floor_unverified");
  const customers = new Map<string, {plan: unknown; cycle: unknown}>();
  for (const item of raw.customers) {
    if (!object(item) || !text(item.reference) || !offer(item.plan,item.cycle) || customers.has(item.reference)) return fail("invalid_customer_inventory");
    customers.set(item.reference,{plan:item.plan,cycle:item.cycle});
  }
  const expected = new Map<string, {plan?: unknown; cycle?: unknown}>();
  const requireCase = (scope: string, reference: string, scenario: string, plan?: unknown, cycle?: unknown) => expected.set(identity(scope,reference,scenario),{plan,cycle});
  for (const plan of TIERS) for (const cycle of CYCLES) {
    const reference = plan+":"+cycle;
    for (const scenario of REQUIRED_PROFIT_CASES) requireCase("plan",reference,scenario,plan,cycle);
    requireCase("company","offer:"+reference,"single_customer_maximum_usage",plan,cycle);
  }
  for (const [reference, terms] of customers) {
    for (const scenario of REQUIRED_PROFIT_CASES) requireCase("customer",reference,scenario,terms.plan,terms.cycle);
    requireCase("company","customer:"+reference,"single_customer_maximum_usage",terms.plan,terms.cycle);
  }
  requireCase("company","company","all_customers_maximum_usage");
  const reasons: string[] = [];
  const seen = new Set<string>();
  for (const item of raw.scenarios) {
    if (!object(item)) { reasons.push("invalid_scenario_identity"); continue; }
    const key = identity(item.scope,item.reference,item.scenario);
    const required = expected.get(key);
    if (!required) { reasons.push("unexpected_scenario"); continue; }
    const retained = confirmedProfitRevenue(item.revenueBasis,item.period,nowSeconds);
    if (retained === null || retained !== item.retainedRevenueCents) reasons.push("revenue_basis_unconfirmed:"+key);
    if (item.currency !== fixed.currency || item.period !== fixed.period) reasons.push("fixed_cost_basis_mismatch");
    const allocated = object(item.costs) ? item.costs.allocatedFixedCosts : null;
    if (!object(allocated) || !money(allocated.cents) || allocated.cents < fixed.cents) reasons.push("fixed_cost_understated:"+key);
    if (seen.has(key)) reasons.push("duplicate_scenario");
    seen.add(key);
    if (required.plan !== undefined && (item.plan !== required.plan || item.cycle !== required.cycle)) reasons.push("scenario_terms_mismatch");
  }
  const missing = [...expected.keys()].filter(key => !seen.has(key));
  if (missing.length) reasons.push("incomplete_stress_coverage");
  const result = assessProfitPortfolio(raw,nowSeconds);
  reasons.push(...result.reasons);
  return {meetsPolicy:reasons.length===0,reasons:[...new Set(reasons)],missing,assessments:result.assessments};
}
