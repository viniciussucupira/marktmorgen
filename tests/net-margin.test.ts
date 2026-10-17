import { zeroExposureFixture } from './margin-test-fixtures';
import {CURRENT_UPLOAD_BUDGET_POLICY as testUploadFunding} from "./upload-budget-approved-policy";
import {fundedCustomerScenario,fundedCustomerWithAi,zeroFixedCompanyFixture} from './margin-test-fixtures';
import { assessCustomerWorstCase, CUSTOMER_COST_CATEGORIES, MINIMUM_NET_MARGIN_BPS, type CustomerWorstCase } from "@/lib/net-margin-rules";
import { commercialMarginReady, commercialPlansMayOpen, CURRENT_PRICE_AND_RIGHTS_SNAPSHOT, REQUIRED_MARGIN_SCENARIOS, BASE_PLAN_REVENUE_CEILINGS, type CommercialMarginReview } from "@/lib/commercial-margin";
import { PLANS_ON_SALE } from "@/lib/opening";
import { done, is } from "./check";
const zeroCosts=()=>Object.fromEntries(CUSTOMER_COST_CATEGORIES.map(key=>[key,0])) as Record<typeof CUSTOMER_COST_CATEGORIES[number],number>;
const scenario=(changes:Partial<CustomerWorstCase>={}):CustomerWorstCase=>({...fundedCustomerScenario(),...changes});
is("owner floor is sixty percent",MINIMUM_NET_MARGIN_BPS,6000);
is("exact sixty percent passes",assessCustomerWorstCase(scenario()),{approved:true,reason:"approved",netCents:6000,marginBps:6000});
is("one cent below floor fails",assessCustomerWorstCase(scenario({costCeilings:{...zeroCosts(),infrastructure:1725}})).approved,false);
is("higher than floor passes",assessCustomerWorstCase(scenario({taxesCeilingCents:2475,costCeilings:{...zeroCosts(),infrastructure:1000}})).approved,true);
is("missing complete input never passes",assessCustomerWorstCase(null).approved,false);
for(const key of CUSTOMER_COST_CATEGORIES){
 const costs={...zeroCosts(),[key]:null};
 is("missing "+key+" not silently zero",assessCustomerWorstCase(scenario({costCeilings:costs})).reason,"unknown");
 const expensive={...zeroCosts(),[key]:4001};
 is(key+" counted in customer worst case",assessCustomerWorstCase(scenario({costCeilings:expensive})).approved,false);
}
for(const n of [NaN,Infinity,-1,0.5,Number.MAX_SAFE_INTEGER+1]){
 is("invalid money rejected",assessCustomerWorstCase(scenario({taxesCeilingCents:n})).reason,"invalid");
}
is("unknown taxes rejected",assessCustomerWorstCase(scenario({taxesCeilingCents:null})).reason,"unknown");
is("unreviewed tax ceiling rejected",assessCustomerWorstCase(scenario({allTaxesReviewed:false})).approved,false);
is("unbounded resource cost rejected",assessCustomerWorstCase(scenario({allCostsBounded:false})).approved,false);
is("invoice not collected is not funded revenue",assessCustomerWorstCase(scenario({revenueCollected:false})).reason,"uncollected");
is("free period does not invent margin",assessCustomerWorstCase(scenario({collectedRevenueCents:0,taxesCeilingCents:0,costCeilings:zeroCosts()})).reason,"no_revenue");
const refunded=assessCustomerWorstCase(scenario({refundableRevenueCents:10000}));
is("full refund after consumption fails",refunded.approved,false);
is("full refund exposes customer loss",refunded.netCents,-4000);
is("refund beyond collection invalid",assessCustomerWorstCase(scenario({refundableRevenueCents:10001})).reason,"invalid");
is("fixed costs included even with one customer",assessCustomerWorstCase(scenario({costCeilings:{...zeroCosts(),fixedBusinessCosts:4001}})).approved,false);
is("cost sum overflow fails safely",assessCustomerWorstCase(scenario({costCeilings:Object.fromEntries(CUSTOMER_COST_CATEGORIES.map(key=>[key,Number.MAX_SAFE_INTEGER]))})).approved,false);
for(const gross of [1,3,10,101,1000,10001,1000000]){
 for(const cost of [Math.floor(gross*0.4),Math.floor(gross*0.4)+1]){
  const tax=Math.ceil(Math.max(0,gross-cost)*0.275);
  const result=assessCustomerWorstCase(scenario({collectedRevenueCents:gross,taxesCeilingCents:tax,costCeilings:{...zeroCosts(),other:cost}}));
  is("exact boundary not display rounding",result.approved,(gross-cost-tax)*100>=gross*60);
 }
}
const review=():CommercialMarginReview=>({companyBase:{monthlyFixedCostsCeilingCents:0,monthlyFixedTaxesCeilingCents:0,allFixedCostsBounded:true,allFixedTaxesReviewed:true,fixedCostsEvidence:"TEST ONLY: zero fixed costs",fixedTaxEvidence:"TEST ONLY: zero fixed taxes",reviewedPayingCustomers:1},priceAndRightsSnapshot:CURRENT_PRICE_AND_RIGHTS_SNAPSHOT,taxEvidence:"TEST ONLY: hypothetical ceilings",costAndLimitEvidence:"TEST ONLY: hypothetical enforced limits",allocatedFixedCostsVerified:true, fundedExposure:zeroExposureFixture(),prepaidUsageEnforced:true,scenarios:Object.fromEntries(REQUIRED_MARGIN_SCENARIOS.map(key=>{const gross=BASE_PLAN_REVENUE_CEILINGS[key]??10000;return [key,fundedCustomerWithAi(gross,Math.floor(gross*.65))];}))});
is("hypothetical complete passing review passes calculation",commercialMarginReady(review()),true);
is("absent real review stays closed",commercialMarginReady(),false);
is("requesting launch cannot bypass missing review",commercialPlansMayOpen(true),false);
is("actual commercial release stays closed",PLANS_ON_SALE,false);
is("no launch request stays closed even with passing fixture",commercialPlansMayOpen(false,review()),false);
for(const key of REQUIRED_MARGIN_SCENARIOS){
 const r=review();delete r.scenarios[key];
 is("missing worst-case scenario "+key+" blocks release",commercialMarginReady(r),false);
 const bad=review();bad.scenarios[key]={...bad.scenarios[key]!,costCeilings:{...zeroCosts(),other:Math.ceil(bad.scenarios[key]!.collectedRevenueCents!*0.9)}};
 is("one unprofitable "+key+" is not cross-subsidized",commercialMarginReady(bad),false);
}
is("price change invalidates old review",commercialMarginReady({...review(),priceAndRightsSnapshot:"old prices"}),false);
is("tax evidence required",commercialMarginReady({...review(),taxEvidence:" "}),false);
is("cost and limit evidence required",commercialMarginReady({...review(),costAndLimitEvidence:""}),false);
is("allocated fixed costs must be reviewed",commercialMarginReady({...review(),allocatedFixedCostsVerified:false}),false);
is("postpaid unlimited consumption cannot be certified",commercialMarginReady({...review(),prepaidUsageEnforced:false}),false);
is("published commission menu cannot launch before fee collection is proven",commercialPlansMayOpen(true,review()),false);

if(!testUploadFunding)throw new Error("Synthetic upload funding fixture missing");
const originalUploadSlots=testUploadFunding.fundedStores.creator;
testUploadFunding.fundedStores.creator=0;
is("a paid cohort is not approved without upload capacity for its possible plan mix",commercialMarginReady(review()),false);
testUploadFunding.fundedStores.creator=originalUploadSlots;
const originalUploadMonth=testUploadFunding.month;
testUploadFunding.month="2000-01";
is("an expired resource budget cannot approve a paid release",commercialMarginReady(review()),false);
testUploadFunding.month=originalUploadMonth;
done();
