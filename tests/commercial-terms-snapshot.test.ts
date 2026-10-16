import { CURRENT_COMMERCIAL_TERMS, CURRENT_PRICE_AND_RIGHTS_SNAPSHOT, commercialMarginReady, REQUIRED_MARGIN_SCENARIOS, type CommercialMarginReview } from "@/lib/commercial-margin";
import { CUSTOMER_COST_CATEGORIES } from "@/lib/net-margin-rules";
import { STORAGE_BRAKE_BYTES } from "@/lib/storage-rules";
import { STORAGE_BRAKE_BYTES as UPLOAD_STORAGE_BYTES } from "@/lib/storage-quota";
import { AI_MONTHLY } from "@/lib/ai-rules";
import { VISITS_INCLUDED } from "@/lib/traffic-rules";
import { ORDERS_INCLUDED } from "@/lib/order-rules";
import { done, is } from "./check";
const scenario = { collectedRevenueCents: 10000, refundableRevenueCents: 0, taxesCeilingCents: 1000, costCeilings: Object.fromEntries(CUSTOMER_COST_CATEGORIES.map(key => [key, key === "infrastructure" ? 3000 : 0])), allCostsBounded: true, allTaxesReviewed: true, revenueCollected: true };
const review = (): CommercialMarginReview => ({
 priceAndRightsSnapshot: CURRENT_PRICE_AND_RIGHTS_SNAPSHOT,
 taxEvidence: "TEST ONLY: hypothetical taxes",
 costAndLimitEvidence: "TEST ONLY: hypothetical funded limits",
 singleCustomerFixedCostsVerified: true,
 prepaidUsageEnforced: true,
 scenarios: Object.fromEntries(REQUIRED_MARGIN_SCENARIOS.map(key => [key, scenario])),
});
is("hypothetical current review passes calculation", commercialMarginReady(review()), true);
is("actual review remains absent", commercialMarginReady(), false);
is("upload and review use one storage ceiling", UPLOAD_STORAGE_BYTES, STORAGE_BRAKE_BYTES);
is("paid storage ceiling unchanged", STORAGE_BRAKE_BYTES, 200 * 1024 * 1024 * 1024);
is("review uses actual AI entitlements", CURRENT_COMMERCIAL_TERMS.ai.monthly, AI_MONTHLY);
is("review uses actual visit entitlements", CURRENT_COMMERCIAL_TERMS.traffic.included, VISITS_INCLUDED);
is("review uses actual order entitlements", CURRENT_COMMERCIAL_TERMS.orders.included, ORDERS_INCLUDED);
function checkLeaves(value: unknown, path: string[] = []) {
 if (value !== null && typeof value === "object") {
  for (const [key, child] of Object.entries(value)) checkLeaves(child, [...path, key]);
  return;
 }
 const changed = JSON.parse(CURRENT_PRICE_AND_RIGHTS_SNAPSHOT);
 let parent = changed;
 for (const key of path.slice(0, -1)) parent = parent[key];
 parent[path[path.length - 1]] = typeof value === "number" ? value + 1 : typeof value === "boolean" ? !value : String(value) + " changed";
 is("old review rejected after " + path.join(".") + " changes", commercialMarginReady({ ...review(), priceAndRightsSnapshot: JSON.stringify(changed) }), false);
}
checkLeaves(CURRENT_COMMERCIAL_TERMS);
const legacy = JSON.stringify({ prices: CURRENT_COMMERCIAL_TERMS.prices, commission: CURRENT_COMMERCIAL_TERMS.commission, trialDays: CURRENT_COMMERCIAL_TERMS.trialDays });
is("partial legacy contract cannot approve current rights", commercialMarginReady({ ...review(), priceAndRightsSnapshot: legacy }), false);
done();
