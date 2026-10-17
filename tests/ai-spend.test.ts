import test from 'node:test';
import assert from 'node:assert/strict';
import { isAiBudgetConfigured, reserveAiSpend, RESERVE_AI_SPEND } from '../lib/ai-spend';
import { CURRENT_AI_SPEND_POLICY, aiSpendPolicySnapshot, type AiSpendPolicy } from '../lib/ai-spend-policy';
import { reset, seed, ledger, calls, settings } from './ai-spend-redis';
const month = new Date().toISOString().slice(0,7);
const key = 'nl:ai-spend:v1:' + month;
function policy(): AiSpendPolicy { return { reviewId:'test_review', month, evidence:'Test fixture only: not approved production prices',requestMicroUsd:{'claude-sonnet-5-5':100,'claude-haiku-5-5':20},storeMicroUsd:{creator:300,pro:500,scale:1000,trial:0},companyMicroUsd:400 }; }
const take = (id='one', p=policy()) => reserveAiSpend(id,'creator','claude-sonnet-5-5',p);
test('production has no approved spending allocation', async()=>{reset();assert.equal(CURRENT_AI_SPEND_POLICY,null);assert.equal(isAiBudgetConfigured(),false);assert.equal(await reserveAiSpend('one','creator','claude-sonnet-5-5'),false);assert.equal(calls.length,0);});
test('review must cover current UTC month and all finite integer ceilings',()=>{const p=policy();assert.equal(isAiBudgetConfigured(p),true);assert.equal(isAiBudgetConfigured({...p,month:'2000-01'}),false);assert.equal(isAiBudgetConfigured({...p,reviewId:''}),false);for(const n of [NaN,Infinity,-1,0.1,1e12+1])assert.equal(isAiBudgetConfigured({...p,companyMicroUsd:n}),false);assert.equal(isAiBudgetConfigured({...p,requestMicroUsd:{...p.requestMicroUsd,'claude-haiku-5-5':0}}),false);});
test('missing or mismatched funding ledger never gets created',async()=>{reset();assert.equal(await take(),false);assert.equal(ledger.size,0);seed(key,'old_review',aiSpendPolicySnapshot(policy()));assert.equal(await take(),false);assert.equal(ledger.get(key)?.get('company'),'0');});
test('each call reserves both ceilings and full-store use stops exactly at cap',async()=>{reset();seed(key,'test_review',aiSpendPolicySnapshot(policy()));for(let n=0;n<3;n++)assert.equal(await take(),true);assert.equal(await take(),false);assert.equal(ledger.get(key)?.get('store:one'),'300');assert.equal(ledger.get(key)?.get('company'),'300');assert.equal(calls[0].length,1);assert.equal(calls[0][0][0],'EVAL');assert.equal(calls[0][0][2],1);});
test('concurrent customers also stop at company cap',async()=>{reset();seed(key,'test_review',aiSpendPolicySnapshot(policy()));const results=await Promise.all(Array.from({length:20},(_,i)=>take('customer'+i)));assert.equal(results.filter(Boolean).length,4);assert.equal(ledger.get(key)?.get('company'),'400');});
test('all model calls share the same customer counter',async()=>{reset();seed(key,'test_review',aiSpendPolicySnapshot(policy()));assert.equal(await take(),true);assert.equal(await reserveAiSpend('one','creator','claude-haiku-5-5',policy()),true);assert.equal(ledger.get(key)?.get('store:one'),'120');});
test('trial needs its own funded allocation',async()=>{reset();seed(key,'test_review',aiSpendPolicySnapshot(policy()));assert.equal(await reserveAiSpend('one','trial','claude-haiku-5-5',policy()),false);assert.equal(calls.length,0);const funded={...policy(),storeMicroUsd:{...policy().storeMicroUsd,trial:40}}; assert.equal(await reserveAiSpend('one','trial','claude-haiku-5-5',funded),false);reset();seed(key,'test_review',aiSpendPolicySnapshot(funded));assert.equal(await reserveAiSpend('one','trial','claude-haiku-5-5',funded),true);});
test('corrupt amounts and Redis failures deny without fallback',async()=>{for(const corrupt of ['-1','NaN','1.5','01','1000000000001']){reset();seed(key,'test_review',aiSpendPolicySnapshot(policy()));ledger.get(key)!.set('company',corrupt);assert.equal(await take(),false);}reset();seed(key,'test_review',aiSpendPolicySnapshot(policy()));settings({failure:true});assert.equal(await take(),false);settings({failure:false,available:false});assert.equal(await take(),false);});
test('ambiguous Redis acknowledgments never authorize a provider call',async()=>{for(const response of [[],['1'],[true],[1,1],[null],[0]]){reset();settings({response});assert.equal(await take(),false);}});
test('invalid attribution or unsupported model cannot spend',async()=>{reset();seed(key,'test_review',aiSpendPolicySnapshot(policy()));assert.equal(await take(''),false);assert.equal(await take('id:other'),false);assert.equal(await reserveAiSpend('one','creator','claude-unreviewed',policy()),false);assert.equal(calls.length,0);});
test('new review identifiers cannot reset a used ledger',async()=>{reset();seed(key,'test_review',aiSpendPolicySnapshot(policy()));assert.equal(await take(),true);assert.equal(await take('one',{...policy(),reviewId:'different'}),false);assert.equal(ledger.get(key)?.get('company'),'100');});
test('Lua validates all fields before writes and never expires or refunds reservations',()=>{assert.ok(RESERVE_AI_SPEND.indexOf('storeLimit - store') < RESERVE_AI_SPEND.indexOf("redis.call('HINCRBY'"));assert.match(RESERVE_AI_SPEND,/TTL/);assert.doesNotMatch(RESERVE_AI_SPEND,/EXPIRE|DECR|DEL/);});

test('same review identifier cannot silently change any funded ceiling',async()=>{
  const base=policy();
  const edits=[{...base,companyMicroUsd:500},{...base,storeMicroUsd:{...base.storeMicroUsd,creator:400}},{...base,requestMicroUsd:{...base.requestMicroUsd,'claude-sonnet-5-5':80}},{...base,evidence:'Changed evidence'}];
  for(const changed of edits){reset();seed(key,base.reviewId,aiSpendPolicySnapshot(base));assert.equal(await take('one',changed),false);assert.equal(ledger.get(key)?.get('company'),'0');}
});
test('missing snapshot and inconsistent store counters cannot spend',async()=>{
  reset();seed(key,'test_review',aiSpendPolicySnapshot(policy()));ledger.get(key)!.delete('policy');assert.equal(await take(),false);
  reset();seed(key,'test_review',aiSpendPolicySnapshot(policy()));ledger.get(key)!.set('store:one','100');assert.equal(await take(),false);assert.equal(ledger.get(key)?.get('company'),'0');
});
test('canonical policy binding ignores object insertion order',()=>{
  const p=policy();assert.equal(aiSpendPolicySnapshot(p),aiSpendPolicySnapshot({...p,requestMicroUsd:{'claude-haiku-5-5':20,'claude-sonnet-5-5':100},storeMicroUsd:{trial:0,scale:1000,pro:500,creator:300}}));
});
test('malformed review evidence refuses without throwing',()=>{
  for(const value of [0,true,{},[]])assert.equal(isAiBudgetConfigured({...policy(),evidence:value} as unknown as AiSpendPolicy),false);
});
