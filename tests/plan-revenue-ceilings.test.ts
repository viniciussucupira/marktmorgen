import { BASE_PLAN_REVENUE_CEILINGS, CURRENT_PRICE_AND_RIGHTS_SNAPSHOT, REQUIRED_MARGIN_SCENARIOS, commercialMarginReady, commercialPlansMayOpen, type CommercialMarginReview, type MarginScenario } from "@/lib/commercial-margin";
import { PUBLISHED_PLAN_PRICES } from "@/lib/plan";
import { assessCustomerWorstCase, CUSTOMER_COST_CATEGORIES, type CustomerWorstCase } from "@/lib/net-margin-rules";
import { done, is } from "./check";
const costs = (n = 0) => Object.fromEntries(CUSTOMER_COST_CATEGORIES.map(key => [key, key === "other" ? n : 0]));
const funded = (gross: number): CustomerWorstCase => ({ collectedRevenueCents: gross, refundableRevenueCents: 0, taxesCeilingCents: 0, costCeilings: costs(Math.floor(gross * 0.4)), allCostsBounded: true, allTaxesReviewed: true, revenueCollected: true });
const review = (): CommercialMarginReview => ({ priceAndRightsSnapshot: CURRENT_PRICE_AND_RIGHTS_SNAPSHOT, taxEvidence: "TEST ONLY", costAndLimitEvidence: "TEST ONLY", singleCustomerFixedCostsVerified: true, prepaidUsageEnforced: true, scenarios: Object.fromEntries(REQUIRED_MARGIN_SCENARIOS.map(key => [key, funded(BASE_PLAN_REVENUE_CEILINGS[key] ?? 10000)])) });
is("all six approved subscription ceilings", BASE_PLAN_REVENUE_CEILINGS, { creator_month_full: 2200, creator_year_full: 22000, pro_month_full: 14900, pro_year_full: 149000, scale_month_full: 34900, scale_year_full: 349000 });
is("hypothetical exact-floor model remains assessable", commercialMarginReady(review()), true);
for (const [key, ceiling] of Object.entries(BASE_PLAN_REVENUE_CEILINGS) as [MarginScenario, number][]) {
 const inflated = funded(ceiling + 1);
 is(key + " inflated revenue can fool arithmetic alone", assessCustomerWorstCase(inflated).approved, true);
 const bad = review(); bad.scenarios[key] = inflated;
 is(key + " rejects one invented revenue cent", commercialMarginReady(bad), false);
 const futureSales = review(); futureSales.scenarios[key] = funded(ceiling + 1000000);
 is(key + " cannot rely on future sales or commissions", commercialMarginReady(futureSales), false);
 const discounted = review(); discounted.scenarios[key] = funded(ceiling - 1);
 is(key + " lower actual collections remain assessable", commercialMarginReady(discounted), true);
 const unpaid = review(); unpaid.scenarios[key] = { ...funded(ceiling), revenueCollected: false };
 is(key + " still needs collected revenue", commercialMarginReady(unpaid), false);
 const refunded = review(); refunded.scenarios[key] = { ...funded(ceiling), refundableRevenueCents: ceiling };
 is(key + " still rejects full refunds after costs", commercialMarginReady(refunded), false);
}
for (const tier of ["creator", "pro", "scale"] as const) {
 is(tier + " annual ceiling is ten months", BASE_PLAN_REVENUE_CEILINGS[(tier + "_year_full") as MarginScenario], PUBLISHED_PLAN_PRICES[tier].month * 10);
 const twelve = review(); twelve.scenarios[(tier + "_year_full") as MarginScenario] = funded(PUBLISHED_PLAN_PRICES[tier].month * 12);
 is(tier + " annual cannot invent two extra monthly payments", commercialMarginReady(twelve), false);
}
is("pricing bounds do not certify actual taxes or costs", commercialMarginReady(), false);
is("hypothetical arithmetic cannot open paid sales", commercialPlansMayOpen(true, review()), false);
done();
