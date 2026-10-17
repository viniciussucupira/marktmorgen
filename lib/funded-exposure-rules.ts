import { assessCustomerWorstCase, CUSTOMER_COST_CATEGORIES, type CustomerWorstCase } from '@/lib/net-margin-rules';
export const EXPOSURE_SCOPES = ['trial','setup','full_refund','non_payment','post_cancellation','paused','legacy_credits'] as const;
export const FUNDED_EXPOSURE_RULES = {schema:1,period:'worst-recognized-month',offsets:'none-no-future-conversions',fixedTaxShield:'none',scopes:EXPOSURE_SCOPES} as const;
export type ExposureScope = typeof EXPOSURE_SCOPES[number];
export type FundedExposureReview = {month:string; evidence:string; admissionLimitsEnforced:boolean; monthlyBudgetCents:number|null; cases:Record<ExposureScope,{maximumMonthlyCases:number|null;worstCase:CustomerWorstCase|null}>};
export type FundedExposureAssessment = {approved:boolean;reason:'unknown'|'invalid'|'unbounded'|'underfunded'|'approved';requiredBudgetCents:number|null;monthlyBudgetCents:number|null};
const integer=(n:unknown):n is number=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0;
/** Review accessors and inherited values cannot fabricate costs or occurrence caps. */
function own(value:unknown,key:string):unknown {try {if(!value||typeof value!=='object'||Array.isArray(value))return undefined;const d=Object.getOwnPropertyDescriptor(value,key);return d&&Object.hasOwn(d,'value')?d.value:undefined;}catch{return undefined;}}
const fail=(reason:FundedExposureAssessment['reason']):FundedExposureAssessment=>({approved:false,reason,requiredBudgetCents:null,monthlyBudgetCents:null});
/** Sum simultaneous recognized losses. No profit margin is invented for a free
 * account: its complete exposure consumes the paid company's available surplus.
 * A review is not a runtime admission ledger or permission to deny legal refunds.
 */
export function assessFundedExposure(review:FundedExposureReview|null,now=new Date()):FundedExposureAssessment {
 if(!Number.isFinite(now.getTime())||own(review,'month')!==now.toISOString().slice(0,7)||typeof own(review,'evidence')!=='string'||!(own(review,'evidence') as string).trim())return fail('unknown');
 if(own(review,'admissionLimitsEnforced')!==true)return fail('unbounded');
 const budget=own(review,'monthlyBudgetCents'),cases=own(review,'cases');if(!integer(budget))return fail(budget==null?'unknown':'invalid');
 let required=BigInt(0);
 for(const scope of EXPOSURE_SCOPES){
  const item=own(cases,scope),count=own(item,'maximumMonthlyCases'),raw=own(item,'worstCase'),costs=own(raw,'costCeilings');
  if(!integer(count))return fail(count==null?'unknown':'invalid');
  const unit={collectedRevenueCents:own(raw,'collectedRevenueCents'),refundableRevenueCents:own(raw,'refundableRevenueCents'),taxesCeilingCents:own(raw,'taxesCeilingCents'),costCeilings:Object.fromEntries(CUSTOMER_COST_CATEGORIES.map(key=>[key,own(costs,key)])),allCostsBounded:own(raw,'allCostsBounded')===true,allTaxesReviewed:own(raw,'allTaxesReviewed')===true,revenueCollected:own(raw,'revenueCollected')===true} as CustomerWorstCase;
  const assessed=assessCustomerWorstCase(unit);
  if(!['approved','below_floor','no_revenue'].includes(assessed.reason))return fail(assessed.reason==='invalid'?'invalid':'unknown');
  // Do not allow revenue from another customer or an expected conversion to
  // offset this occurrence. Positive results never reduce another scope's loss.
  const net=assessed.netCents===null?-BigInt(unit.taxesCeilingCents!)-CUSTOMER_COST_CATEGORIES.reduce((n,key)=>n+BigInt(unit.costCeilings[key]!),BigInt(0)):BigInt(assessed.netCents);
  if(net<BigInt(0))required+=(-net)*BigInt(count);
 }
 if(required>BigInt(Number.MAX_SAFE_INTEGER))return fail('invalid');
 return {approved:BigInt(budget)>=required,reason:BigInt(budget)>=required?'approved':'underfunded',requiredBudgetCents:Number(required),monthlyBudgetCents:budget};
}
