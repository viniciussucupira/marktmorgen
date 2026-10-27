import { test } from 'node:test';
import assert from 'node:assert/strict';
import { reviewedResourceEnvelope } from '../lib/reviewed-resource-envelope';
import { remainingResourceCostCents } from '../lib/cost-envelope';
import { assessCustomerWorstCase, CUSTOMER_COST_CATEGORIES, type CustomerWorstCase } from '../lib/net-margin-rules';
const costs = Object.fromEntries(CUSTOMER_COST_CATEGORIES.map(key=>[key,0]));
function review(): CustomerWorstCase { return { collectedRevenueCents:10000, refundableRevenueCents:0, taxesCeilingCents:3000, costCeilings:{...costs}, allCostsBounded:true, allTaxesReviewed:true, revenueCollected:true }; }
test('reserves full reviewed taxes and admits only exact affordable units',()=>{ const r=reviewedResourceEnvelope(review(),23330000,3); assert.equal(r.approved,true); assert.equal(r.affordableUnits,3); assert.equal(r.remainingMicroUsd,69990000); assert.equal(reviewedResourceEnvelope(review(),23330000,4).approved,false); });
test('zero headroom never authorizes even the smallest charge',()=>{const r=review();r.costCeilings.other=6999;r.taxesCeilingCents=3000;const result=reviewedResourceEnvelope(r,1,1);assert.equal(result.approved,false);assert.equal(result.remainingMicroUsd,0);});
test('fractional cent charges fit only inside an already rounded cent allowance',()=>{ const r=review();r.costCeilings.other=6998;assert.equal(reviewedResourceEnvelope(r,1,10000).approved,true);assert.equal(reviewedResourceEnvelope(r,1,10001).approved,false); });
test('refund liabilities reduce available capacity',()=>{ const r=review();r.refundableRevenueCents=500;assert.equal(reviewedResourceEnvelope(r,1,1).remainingMicroUsd,64990000);r.refundableRevenueCents=10000;assert.equal(reviewedResourceEnvelope(r,1,1).approved,false); });
test('unknown taxes or costs do not authorize provider work',()=>{assert.equal(reviewedResourceEnvelope(null,1,1).approved,false);const r=review();r.allTaxesReviewed=false;assert.equal(reviewedResourceEnvelope(r,1,1).approved,false);r.allTaxesReviewed=true;r.costCeilings.email=null;assert.equal(reviewedResourceEnvelope(r,1,1).approved,false);});
test('malformed unit prices and quantities refuse work',()=>{for(const value of [0,-1,0.5,NaN,Infinity,Number.MAX_SAFE_INTEGER+1]) {assert.equal(reviewedResourceEnvelope(review(),value,1).approved,false);assert.equal(reviewedResourceEnvelope(review(),1,value).approved,false);}});
test('unsafe ledger conversion refuses rather than rounding',()=>{const r=review();r.collectedRevenueCents=Number.MAX_SAFE_INTEGER;r.taxesCeilingCents=Math.ceil(Number.MAX_SAFE_INTEGER*.3);assert.equal(reviewedResourceEnvelope(r,1,1).reason,'unsafe_ledger_amount');});
test('spending approved headroom preserves the floor and one further cent fails',()=>{const r=review();const bound=reviewedResourceEnvelope(r,10000,1);const cents=bound.affordableUnits!;r.costCeilings.other=cents;assert.equal(reviewedResourceEnvelope(r,10000,1).approved,false);assert.equal(reviewedResourceEnvelope(r,10000,1).remainingMicroUsd,0);r.costCeilings.other=cents+1;assert.equal(reviewedResourceEnvelope(r,10000,1).reason,'below_floor');});
test('computed or inherited review fields are refused without executing getters',()=>{
 let reads=0;
 const withGetter=review();Object.defineProperty(withGetter,'taxesCeilingCents',{get(){reads+=1;return 3000;},enumerable:true});
 assert.equal(reviewedResourceEnvelope(withGetter,1,1).approved,false);
 const costGetter=review();Object.defineProperty(costGetter.costCeilings,'email',{get(){reads+=1;return 0;},enumerable:true});
 assert.equal(reviewedResourceEnvelope(costGetter,1,1).approved,false);
 const inherited=Object.create(review()) as CustomerWorstCase;
 assert.equal(reviewedResourceEnvelope(inherited,1,1).approved,false);
 const inheritedCost=review();inheritedCost.costCeilings=Object.create({...costs});
 assert.equal(reviewedResourceEnvelope(inheritedCost,1,1).approved,false);
 assert.equal(reads,0);
});
test('headroom agrees with lib/cost-envelope.ts and spending all of it preserves positive net with every reviewed tax cent retained',()=>{
 let seed=20261017;const next=(n:number)=>{seed=(seed*1103515245+12345)%2147483648;return seed%n;};
 let checked=0;
 for(let i=0;i<4000;i+=1){
  const r=review();
  r.collectedRevenueCents=1+next(400000);
  r.refundableRevenueCents=next(4)===0?next(Math.floor(r.collectedRevenueCents/5)+1):0;
  for(const key of CUSTOMER_COST_CATEGORIES)r.costCeilings[key]=next(3)===0?next(Math.floor(r.collectedRevenueCents/40)+1):0;
  const spent=CUSTOMER_COST_CATEGORIES.reduce((sum,key)=>sum+r.costCeilings[key]!,0);
  const pretax=r.collectedRevenueCents-r.refundableRevenueCents-spent;
  r.taxesCeilingCents=Math.max(0,Math.ceil(pretax*(2750+next(1500))/10000));
  const result=reviewedResourceEnvelope(r,10000,1);
  if(result.remainingMicroUsd===null)continue;
  checked+=1;
  const cents=result.remainingMicroUsd/10000;
  const shared=remainingResourceCostCents(r.collectedRevenueCents-r.refundableRevenueCents,2750,CUSTOMER_COST_CATEGORIES.map(key=>r.costCeilings[key]!));
  assert.ok(shared!==null&&cents<=shared);
  r.costCeilings.other=r.costCeilings.other!+cents;
  assert.equal(assessCustomerWorstCase(r).approved,true);
  r.costCeilings.other+=1;
  assert.equal(assessCustomerWorstCase(r).approved,false);
 }
 assert.ok(checked>1000);
});
