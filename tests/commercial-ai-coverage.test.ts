import test from "node:test";
import assert from "node:assert/strict";
import { CURRENT_AI_SPEND_POLICY as policy } from "@/lib/ai-spend-policy";
import { commercialMarginReady, commercialPlansMayOpen, CURRENT_COMMERCIAL_MARGIN_REVIEW, CURRENT_PRICE_AND_RIGHTS_SNAPSHOT, REQUIRED_MARGIN_SCENARIOS, BASE_PLAN_REVENUE_CEILINGS, type CommercialMarginReview } from "@/lib/commercial-margin";
import { assessCustomerWorstCase } from "@/lib/net-margin-rules";
import { fundedCustomerWithAi, zeroFixedCompanyFixture } from "./margin-test-fixtures";
function review():CommercialMarginReview{return{companyBase:zeroFixedCompanyFixture,priceAndRightsSnapshot:CURRENT_PRICE_AND_RIGHTS_SNAPSHOT,taxEvidence:"TEST ONLY",costAndLimitEvidence:"TEST ONLY",singleCustomerFixedCostsVerified:true,prepaidUsageEnforced:true,scenarios:Object.fromEntries(REQUIRED_MARGIN_SCENARIOS.map(key=>{const gross=BASE_PLAN_REVENUE_CEILINGS[key]??10000;return[key,fundedCustomerWithAi(gross,Math.floor(gross*.65))];}))};}
test("explicitly funded synthetic review remains calculable without opening actual sales",()=>{
  assert.equal(commercialMarginReady(review()),true);
  assert.equal(CURRENT_COMMERCIAL_MARGIN_REVIEW,null);
  assert.equal(commercialMarginReady(),false);
  assert.equal(commercialPlansMayOpen(true,review()),false);
});
test("paid customer review cannot omit the configured AI cost",()=>{
  const r=review(), scenario=r.scenarios.creator_month_full!;
  scenario.costCeilings.infrastructure!+=scenario.costCeilings.ai!;
  scenario.costCeilings.ai=0;
  assert.equal(assessCustomerWorstCase(scenario).approved,true);
  assert.equal(commercialMarginReady(r),false);
});
test("annual discounted revenue still requires twelve months of AI costs",()=>{
  const r=review(), scenario=r.scenarios.creator_year_full!;
  scenario.costCeilings.ai=11;scenario.costCeilings.infrastructure!+=1;
  assert.equal(assessCustomerWorstCase(scenario).approved,true);
  assert.equal(commercialMarginReady(r),false);
});
test("the reviewed customer base needs funded AI slots for every possible paid tier",()=>{
  const p=policy!;const previous=p.fundedStores.creator;
  try{p.fundedStores.creator=0;assert.equal(commercialMarginReady(review()),false);}
  finally{p.fundedStores.creator=previous;}
});
test("expired AI funding cannot approve commercial release",()=>{
  const p=policy!;const previous=p.month;
  try{p.month="2000-01";assert.equal(commercialMarginReady(review()),false);}
  finally{p.month=previous;}
});
test("zero paid-tier spending cannot pretend that the included AI is funded",()=>{
  const p=policy!;const previous=p.storeMicroUsd.creator;
  try{p.storeMicroUsd.creator=0;assert.equal(commercialMarginReady(review()),false);}
  finally{p.storeMicroUsd.creator=previous;}
});
