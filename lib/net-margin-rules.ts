/** Actual net margin. Missing accounting inputs are never silently treated as zero. */
export const MINIMUM_NET_MARGIN = 0.60;
export type NetMarginCosts = {
  /** Recognized company revenue after refunds and pass-through sales taxes, before expenses. */
  revenue: number;
  processing: number;
  usage: number;
  support: number;
  fixedAllocation: number;
  referralCredits: number;
  acquisitionAndLosses: number;
  /** All company taxes allocated to this revenue period, including fixed taxes. */
  taxes: number;
};
export type MarginAssessment = {status:"unverified"|"below_floor"|"meets_floor";margin:number|null;profit:number|null;missing:string[]};
const fields = ["revenue","processing","usage","support","fixedAllocation","referralCredits","acquisitionAndLosses","taxes"] as const;
export function assessNetMargin(input: Partial<NetMarginCosts>): MarginAssessment {
  const missing = fields.filter(key => typeof input[key] !== "number" || !Number.isFinite(input[key]) || input[key]! < 0);
  if(missing.length || !(input.revenue! > 0)) return {status:"unverified",margin:null,profit:null,missing:missing.length?[...missing]:["positiveRevenue"]};
  const total = fields.filter(key=>key!=="revenue").reduce((sum,key)=>sum+input[key]!,0);
  const profit = input.revenue! - total;
  const margin = profit/input.revenue!;
  return {status:profit >= MINIMUM_NET_MARGIN*input.revenue! ? "meets_floor":"below_floor",margin,profit,missing:[]};
}
/** Scenario only. The effective profit-tax rate must be supplied; this does not select a tax regime. */
export function maximumUsageCost(revenue:number, processing:number, otherCosts:number, profitTaxRate:number): number | null {
  if([revenue,processing,otherCosts,profitTaxRate].some(x=>!Number.isFinite(x)||x<0)||revenue<=0||profitTaxRate>=1)return null;
  // Target profit after tax = (revenue - all pre-tax expenses) * (1 - tax rate).
  return revenue - processing - otherCosts - MINIMUM_NET_MARGIN*revenue/(1-profitTaxRate);
}
/** Company and every customer must independently pass, so profitable tiers cannot hide a loss-making tier. */
export function assessCompanyAndCustomers(company:Partial<NetMarginCosts>, customers:Partial<NetMarginCosts>[]): MarginAssessment["status"] {
  if(!customers.length)return "unverified";
  const results=[assessNetMargin(company),...customers.map(assessNetMargin)];
  if(results.some(r=>r.status==="below_floor"))return "below_floor";
  return results.every(r=>r.status==="meets_floor")?"meets_floor":"unverified";
}

export type CustomerBaseScenario={tier:string;revenue:number;processing:number;usage:number;otherVariableCosts:number};
/** Planning scenario: one effective profit-tax rate, deductible fixed operating costs, equal allocation per payer. */
export function minimumCustomerBase(scenarios:CustomerBaseScenario[],fixedCosts:number,profitTaxRate:number):{status:"unverified"|"no_finite_base"|"feasible";customers:number|null;bindingTier:string|null;headroomPerCustomer:number|null}{
  const unknown={status:"unverified" as const,customers:null,bindingTier:null,headroomPerCustomer:null};
  if(!scenarios.length||!Number.isFinite(fixedCosts)||fixedCosts<0)return unknown;
  const rows=scenarios.map(s=>{const ceiling=maximumUsageCost(s.revenue,s.processing,s.otherVariableCosts,profitTaxRate);return {tier:s.tier,room:ceiling===null||!Number.isFinite(s.usage)||s.usage<0?null:ceiling-s.usage};});
  if(rows.some(r=>r.room===null))return unknown;
  const limiting=rows.reduce((a,b)=>a.room!<=b.room!?a:b);
  if(limiting.room!<0||(limiting.room===0&&fixedCosts>0))return {status:"no_finite_base",customers:null,bindingTier:limiting.tier,headroomPerCustomer:limiting.room};
  const customers=fixedCosts===0?1:Math.max(1,Math.ceil(fixedCosts/limiting.room!));
  if(!Number.isSafeInteger(customers))return unknown;
  return {status:"feasible",customers,bindingTier:limiting.tier,headroomPerCustomer:limiting.room};
}
