/** Client-safe release policy. No secrets, tax rates inferred from residence, or optimistic defaults.
 * Paid plans remain closed until every individual worst case is reviewed and passes the owner's floor.
 */
import { PLAN_PRICES, COMMISSION_BPS, COMMISSION_LIVE, COMMISSION_PLANS_PUBLISHED, PUBLISHED_PLAN_PRICES, TRIAL_DAYS, REFUND_DAYS, PRO_MONTHLY_EMAILS, SCALE_MONTHLY_EMAILS, TRIAL_MONTHLY_EMAILS } from "@/lib/plan";
import { SHARE_PROVED_IN_TEST_MODE } from "@/lib/platform-share";
import { assessCustomerWorstCase, CUSTOMER_COST_CATEGORIES, MINIMUM_NET_MARGIN_BPS, type CustomerWorstCase } from "@/lib/net-margin-rules";
import { AI_SPEND_RULES, CURRENT_AI_SPEND_POLICY } from "@/lib/ai-spend-policy";
import { AI_REQUEST_LIMITS, SUPPORTED_AI_MODELS } from "@/lib/ai-request-rules";
import { AI_MONTHLY, AI_PER_MINUTE, MAX_AI_NOTES, READ_PDF_PAGES, READ_PDF_JOBS } from "@/lib/ai-rules";
import { VIDEO_HOURS_INCLUDED, VIDEO_CENTS_PER_HOUR_OVER } from "@/lib/watch-rules";
import { VISITS_INCLUDED, VISIT_CENTS_PER_THOUSAND_OVER, SETUP_VISITS, TRIAL_VISITS, ROOM_LIVE_PARTS, ROOM_IDLE_PARTS } from "@/lib/traffic-rules";
import { ORDERS_INCLUDED, ORDER_CENTS_PER_THOUSAND_OVER, TRIAL_ORDERS } from "@/lib/order-rules";
import { STORAGE_BRAKE_BYTES } from "@/lib/storage-rules";
import { TRIAL_STORAGE_BYTES, SETUP_STORAGE_BYTES, SETUP_VIDEO_SECONDS } from "@/lib/plan-standing";
import { MAX_FILE_BYTES, MAX_STAMP_BYTES } from "@/lib/product-file";
import { TOP_HEIGHT, MOST_KEPT_BYTES, UPLOAD_WINDOW_SECONDS, ABANDONED_AFTER_MS, GIVE_UP_AFTER_MS } from "@/lib/stream-rules";
import { MAX_LEADS, MAX_IMPORT } from "@/lib/contact-rules";
import { CLOSING_DAYS, RECHECK_DAYS } from "@/lib/plan-closing-rules";
import { PAUSE_MONTHS, PAID_MONTHS_BEFORE_PAUSE, PAUSE_EVERY_DAYS } from "@/lib/plan-pause-rules";
export const REQUIRED_MARGIN_SCENARIOS=[
 "creator_month_full","creator_year_full","pro_month_full","pro_year_full","scale_month_full","scale_year_full",
 "video_overage","visits_overage","orders_overage","free_trial","full_refund","non_payment","post_cancellation","single_customer_all_fixed_costs","company_all_costs",
] as const;
export type MarginScenario=typeof REQUIRED_MARGIN_SCENARIOS[number];
/** Base-plan worst cases cannot rely on future sales, overages or twelve monthly
 * payments for an annual subscription. Only the approved subscription can fund them.
 */
export const BASE_PLAN_REVENUE_CEILINGS: Partial<Record<MarginScenario, number>> = {
 creator_month_full: PUBLISHED_PLAN_PRICES.creator.month,
 creator_year_full: PUBLISHED_PLAN_PRICES.creator.year,
 pro_month_full: PUBLISHED_PLAN_PRICES.pro.month,
 pro_year_full: PUBLISHED_PLAN_PRICES.pro.year,
 scale_month_full: PUBLISHED_PLAN_PRICES.scale.month,
 scale_year_full: PUBLISHED_PLAN_PRICES.scale.year,
};
/** Bind a review to actual priced rights, including free and post-cancellation use.
 * Vendor pricing, tax evidence and enforcement still require an independent review.
 */
export const CURRENT_COMMERCIAL_TERMS = {
 schemaVersion: 3,
 basePlanRevenueCeilings: BASE_PLAN_REVENUE_CEILINGS,
 minimumNetMarginBps: MINIMUM_NET_MARGIN_BPS,
 costCategories: CUSTOMER_COST_CATEGORIES,
 scenarios: REQUIRED_MARGIN_SCENARIOS,
 prices: PLAN_PRICES,
 publishedPrices: PUBLISHED_PLAN_PRICES,
 commission: COMMISSION_BPS,
 commissionLive: COMMISSION_LIVE,
 commissionOffer: COMMISSION_PLANS_PUBLISHED,
 commissionProven: SHARE_PROVED_IN_TEST_MODE,
 trialDays: TRIAL_DAYS,
 refundDays: REFUND_DAYS,
 email: { trial: TRIAL_MONTHLY_EMAILS, pro: PRO_MONTHLY_EMAILS, scale: SCALE_MONTHLY_EMAILS, maxLeads: MAX_LEADS, maxImport: MAX_IMPORT },
 ai: { spendRules: AI_SPEND_RULES, spendPolicy: CURRENT_AI_SPEND_POLICY, requestLimits: AI_REQUEST_LIMITS, supportedModels: SUPPORTED_AI_MODELS, monthly: AI_MONTHLY, perMinute: AI_PER_MINUTE, maxNotes: MAX_AI_NOTES, pdfPages: READ_PDF_PAGES, pdfJobs: READ_PDF_JOBS },
 storage: { paidBytes: STORAGE_BRAKE_BYTES, trialBytes: TRIAL_STORAGE_BYTES, setupBytes: SETUP_STORAGE_BYTES, maxFileBytes: MAX_FILE_BYTES, maxStampBytes: MAX_STAMP_BYTES },
 video: { includedHours: VIDEO_HOURS_INCLUDED, setupSeconds: SETUP_VIDEO_SECONDS, overageCentsPerHour: VIDEO_CENTS_PER_HOUR_OVER, topHeight: TOP_HEIGHT, maxKeptBytes: MOST_KEPT_BYTES, uploadWindowSeconds: UPLOAD_WINDOW_SECONDS, abandonedAfterMs: ABANDONED_AFTER_MS, giveUpAfterMs: GIVE_UP_AFTER_MS },
 traffic: { included: VISITS_INCLUDED, setup: SETUP_VISITS, trial: TRIAL_VISITS, overageCentsPerThousand: VISIT_CENTS_PER_THOUSAND_OVER, roomLiveParts: ROOM_LIVE_PARTS, roomIdleParts: ROOM_IDLE_PARTS },
 orders: { included: ORDERS_INCLUDED, trial: TRIAL_ORDERS, overageCentsPerThousand: ORDER_CENTS_PER_THOUSAND_OVER },
 closure: { days: CLOSING_DAYS, recheckDays: RECHECK_DAYS },
 pause: { months: PAUSE_MONTHS, paidMonthsRequired: PAID_MONTHS_BEFORE_PAUSE, everyDays: PAUSE_EVERY_DAYS },
} as const;
export const CURRENT_PRICE_AND_RIGHTS_SNAPSHOT = JSON.stringify(CURRENT_COMMERCIAL_TERMS);
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
 return REQUIRED_MARGIN_SCENARIOS.every(key=>{
  const scenario=review.scenarios[key]??null;
  const ceiling=BASE_PLAN_REVENUE_CEILINGS[key];
  if(ceiling!==undefined && (!scenario || typeof scenario.collectedRevenueCents!=="number" || scenario.collectedRevenueCents>ceiling))return false;
  return assessCustomerWorstCase(scenario).approved;
 });
}
export function commercialPlansMayOpen(requested:boolean,review:CommercialMarginReview|null=CURRENT_COMMERCIAL_MARGIN_REVIEW):boolean{
 const commissionReady=!COMMISSION_PLANS_PUBLISHED||(COMMISSION_LIVE&&SHARE_PROVED_IN_TEST_MODE);
 return requested===true&&commissionReady&&commercialMarginReady(review);
}
