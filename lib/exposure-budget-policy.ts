import { fundedExposureDetails, EXPOSURE_SCOPES, type FundedExposureReview, type ExposureScope } from '@/lib/funded-exposure-rules';
export const EXPOSURE_ADMISSION_RULES={schema:1,ledger:'nl:exposure:v1:YYYY-MM',reservation:'full-case-loss-before-provider-work',repeat:'same-store-scope-month-reuses-reservation',failure:'retain',missing:'deny',expiry:'none',maxInteger:1_000_000_000_000} as const;
export type ExposureFundingContext={termsSnapshot:string;review:FundedExposureReview|null};
export type ExposureBudgetPolicy={reviewId:string;termsSnapshot:string;review:FundedExposureReview;reservedFundsCents:number;reserveEvidence:string};
/** No bank-backed and reconciled company exposure reserve has been approved. */
export const CURRENT_EXPOSURE_BUDGET_POLICY:ExposureBudgetPolicy|null=null;
const integer=(n:unknown):n is number=>typeof n==='number'&&Number.isSafeInteger(n)&&n>=0&&n<=EXPOSURE_ADMISSION_RULES.maxInteger;
function data(value:unknown,key:string):unknown {try{if(!value||typeof value!=='object'||Array.isArray(value))return undefined;const d=Object.getOwnPropertyDescriptor(value,key);return d&&Object.hasOwn(d,'value')?d.value:undefined;}catch{return undefined;}}
export function exposureBudgetConfiguration(policy:ExposureBudgetPolicy|null,context:ExposureFundingContext,now=new Date()):{reviewId:string;month:string;binding:string;budgetCents:number;allocations:Record<ExposureScope,{slots:number;cents:number}>}|null {
 policy={reviewId:data(policy,'reviewId'),termsSnapshot:data(policy,'termsSnapshot'),review:data(policy,'review'),reservedFundsCents:data(policy,'reservedFundsCents'),reserveEvidence:data(policy,'reserveEvidence')} as ExposureBudgetPolicy;
 context={termsSnapshot:data(context,'termsSnapshot'),review:data(context,'review')} as ExposureFundingContext;
 if(!policy||!context||typeof policy.reviewId!=='string'||!/^[A-Za-z0-9_-]{1,128}$/.test(policy.reviewId)||typeof policy.reserveEvidence!=='string'||!policy.reserveEvidence.trim()||typeof context.termsSnapshot!=='string'||!context.termsSnapshot||policy.termsSnapshot!==context.termsSnapshot||!integer(policy.reservedFundsCents))return null;
 const approved=fundedExposureDetails(context.review,now),funded=fundedExposureDetails(policy.review,now);
 if(!approved||!funded||approved.snapshot!==funded.snapshot||!integer(funded.budgetCents)||policy.reservedFundsCents<funded.budgetCents||!EXPOSURE_SCOPES.every(scope=>integer(funded.allocations[scope].cents)&&integer(funded.allocations[scope].slots)))return null;
 return {reviewId:policy.reviewId,month:funded.month,budgetCents:funded.budgetCents,allocations:funded.allocations,binding:JSON.stringify([EXPOSURE_ADMISSION_RULES,policy.reviewId,policy.termsSnapshot,funded.snapshot,policy.reservedFundsCents,policy.reserveEvidence])};
}
