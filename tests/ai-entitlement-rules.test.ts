import test from 'node:test';
import assert from 'node:assert/strict';
import { requiredAiStoreMicroUsd, aiEntitlementsFunded, aiEntitlementsSnapshot } from '@/lib/ai-entitlement-rules';
import { aiSpendPolicySnapshot, isAiSpendPolicyValid, type AiSpendPolicy } from '@/lib/ai-spend-policy';
const rates={'claude-sonnet-5-5':100,'claude-haiku-5-5':20};
const expected={creator:70000,pro:280000,scale:800000,trial:14000,setup:800000,ended:800000};
function fixture():AiSpendPolicy{return {reviewId:'entitlement_test',month:new Date().toISOString().slice(0,7),evidence:'TEST ONLY hypothetical charges; not approved provider pricing',requestMicroUsd:{...rates},storeMicroUsd:{...expected},fundedStores:{creator:1,pro:1,scale:1,trial:1,setup:1,ended:1},companyMicroUsd:2764000};}
test('every simultaneous writing and visitor allowance is funded at the most expensive model',()=>{for(const [tier,cost] of Object.entries(expected))assert.equal(requiredAiStoreMicroUsd(tier as keyof typeof expected,rates),BigInt(cost));});
test('exact hypothetical coverage passes; one microdollar less fails for every funded scope',()=>{for(const tier of Object.keys(expected) as (keyof typeof expected)[]){const p=fixture();assert.equal(isAiSpendPolicyValid(p),true);assert.equal(aiEntitlementsFunded(p),true);p.storeMicroUsd[tier]--;assert.equal(isAiSpendPolicyValid(p),true);assert.equal(aiEntitlementsFunded(p),false);}});
test('zero funded acquisition slots do not pretend to grant an allocation',()=>{const p=fixture();p.fundedStores.setup=0;p.storeMicroUsd.setup=0;assert.equal(aiEntitlementsFunded(p),true);p.fundedStores.setup=1;assert.equal(aiEntitlementsFunded(p),false);});
test('missing model prices and unknown scopes never become zero costs',()=>{assert.equal(requiredAiStoreMicroUsd('creator',{}),null);assert.equal(requiredAiStoreMicroUsd('creator',{...rates,'claude-haiku-5-5':0}),null);assert.equal(requiredAiStoreMicroUsd('unknown' as 'creator',rates),null);});
test('ledger binding contains the accepted model, request and entitlement envelope',()=>{assert.ok(aiSpendPolicySnapshot(fixture()).includes(JSON.stringify(aiEntitlementsSnapshot()).slice(1,-1)));});
