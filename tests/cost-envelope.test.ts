import { test } from 'node:test';
import assert from 'node:assert/strict';
import { maximumPretaxCostCents, remainingResourceCostCents } from '../lib/cost-envelope';
import { assessCustomerWorstCase, CUSTOMER_COST_CATEGORIES } from '../lib/net-margin-rules';

test('each locked price has an exact maximum and one extra cent fails', () => {
  for (const revenue of [2200,22000,14900,149000,34900,349000]) {
    const maximum = maximumPretaxCostCents(revenue, 2750)!;
    assert.equal(maximum, Math.floor(revenue * 5 / 29));
    for (const [cost, approved] of [[maximum,true],[maximum+1,false]] as const) {
      const pretax = revenue-cost;
      const scenario = {
        collectedRevenueCents:revenue, refundableRevenueCents:0,
        taxesCeilingCents:Math.ceil(pretax*2750/10000),
        costCeilings:Object.fromEntries(CUSTOMER_COST_CATEGORIES.map(k=>[k,k==='infrastructure'?cost:0])),
        allCostsBounded:true, allTaxesReviewed:true, revenueCollected:true,
      };
      assert.equal(assessCustomerWorstCase(scenario).approved,approved);
    }
  }
});
test('small revenues cannot exploit fractional net profit or a low tax assumption', () => {
  assert.equal(maximumPretaxCostCents(1,0),null);
  assert.equal(maximumPretaxCostCents(22000,0),maximumPretaxCostCents(22000,2750));
  assert.ok(maximumPretaxCostCents(22000,3000)! < maximumPretaxCostCents(22000,2750)!);
  assert.equal(maximumPretaxCostCents(22000,5000),null);
});
test('missing, invalid and overflowing non-resource costs never become free', () => {
  for (const costs of [[],[null],[NaN],[-1],[Number.MAX_SAFE_INTEGER,Number.MAX_SAFE_INTEGER]]) {
    assert.equal(remainingResourceCostCents(22000,2750,costs),null);
  }
  const cap=maximumPretaxCostCents(22000,2750)!;
  assert.equal(remainingResourceCostCents(22000,2750,[cap]),0);
  assert.equal(remainingResourceCostCents(22000,2750,[cap+1]),null);
});
