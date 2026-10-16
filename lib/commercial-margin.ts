/** Client-safe release policy. No secrets, tax rates inferred from residence, or optimistic defaults.
 * Paid plans remain closed until every individual worst case is reviewed and passes the owner's floor.
 */
import { PLAN_PRICES, COMMISSION_BPS, COMMISSION_LIVE, COMMISSION_PLANS_PUBLISHED, PUBLISHED_PLAN_PRICES, TRIAL_DAYS, REFUND_DAYS, PRO_MONTHLY_EMAILS, SCALE_MONTHLY_EMAILS } from "@/lib/plan";
import { SHARE_PROVED_IN_TEST_MODE } from "@/lib/platform-share";
import { assessCustomerWorstCase, type CustomerWorstCase } from "@/lib/net-margin-rules";
export const REQUIRED_MARGIN_SCENARIOS=[
 "creator_month_full","creator_year_full","pro_month_full","pro_year_full","scale_month_full","scale_year_full",
 "video_overage","visits_overage","orders_overage","free_trial","full_refund","non_payment","post_cancellation","single_customer_all_fixed_costs","company_all_costs",
] as const;
export type MarginScenario=typeof REQUIRED_MARGIN_SCENARIOS[number];
export const CURRENT_PRICE_AND_RIGHTS_SNAPSHOT=JSON.stringify({prices:PLAN_PRICES,publishedPrices:PUBLISHED_PLAN_PRICES,commission:COMMISSION_BPS,commissionLive:COMMISSION_LIVE,commissionOffer:COMMISSION_PLANS_PUBLISHED,trialDays:TRIAL_DAYS,refundDays:REFUND_DAYS,proEmails:PRO_MONTHLY_EMAILS,scaleEmails:SCALE_MONTHLY_EMAILS});
export type CommercialMarginReview={
 priceAndRightsSnapshot:string;
 taxEvidence:string;
 costAndLimitEvidence:string;
 singleCustomerFixedCostsVerified:boolean;
 prepaidUsageEnforced:boolean;
 scenarios:Partial<Record<MarginScenario,CustomerWorstCase|null>>;
};
/** No verified all-tax/all-cost review exists yet. Unknown is not zero or permission to sell. */
export const CURRENT_COMMERCIAL_MARGIN_REVIEW:CommercialMarginReview|null=null;
export function commercialMarginReady(review:CommercialMarginReview|null=CURRENT_COMMERCIAL_MARGIN_REVIEW):boolean{
 if(!review||review.priceAndRightsSnapshot!==CURRENT_PRICE_AND_RIGHTS_SNAPSHOT)return false;
 if(!review.taxEvidence?.trim()||!review.costAndLimitEvidence?.trim())return false;
 if(review.singleCustomerFixedCostsVerified!==true||review.prepaidUsageEnforced!==true||!review.scenarios)return false;
 return REQUIRED_MARGIN_SCENARIOS.every(key=>assessCustomerWorstCase(review.scenarios[key]??null).approved);
}
export function commercialPlansMayOpen(requested:boolean,review:CommercialMarginReview|null=CURRENT_COMMERCIAL_MARGIN_REVIEW):boolean{
 const commissionReady=!COMMISSION_PLANS_PUBLISHED||(COMMISSION_LIVE&&SHARE_PROVED_IN_TEST_MODE);
 return requested===true&&commissionReady&&commercialMarginReady(review);
}
