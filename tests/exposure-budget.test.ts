import test from 'node:test';
import assert from 'node:assert/strict';
import {exposureBudgetConfiguration} from '@/lib/exposure-budget-policy';
import {reserveFundedExposure} from '@/lib/exposure-budget';
import {exposureFixture} from './exposure-budget-fixture';
import {reset,seed,ledger,calls,settings} from './exposure-budget-redis';
function start(){reset();const f=exposureFixture();const c=exposureBudgetConfiguration(f.policy,f.context)!;const key='nl:exposure:v1:'+c.month;seed(key,c);return {...f,key,c};}
test('two full allocations survive 64 concurrent stores without overspending',async()=>{const f=start();const results=await Promise.all(Array.from({length:64},(_,i)=>reserveFundedExposure('store'+i,'trial',f.policy,f.context)));assert.equal(results.filter(Boolean).length,2);assert.equal(ledger.get(f.key)?.get('reserved'),'200');assert.equal(ledger.get(f.key)?.get('slots:trial'),'0');});
test('repeated calls reuse the full case allocation instead of creating new spending',async()=>{const f=start();for(let i=0;i<50;i++)assert.equal(await reserveFundedExposure('one','trial',f.policy,f.context),true);assert.equal(ledger.get(f.key)?.get('reserved'),'100');assert.equal(ledger.get(f.key)?.get('slots:trial'),'1');});
test('lost replies retain the reservation; retry does not renew money or slots',async()=>{const f=start();settings({lostAck:true});assert.equal(await reserveFundedExposure('one','trial',f.policy,f.context),false);assert.equal(ledger.get(f.key)?.get('reserved'),'100');assert.equal(await reserveFundedExposure('one','trial',f.policy,f.context),true);assert.equal(ledger.get(f.key)?.get('reserved'),'100');});
test('a review without real reserve evidence or enough reserved funds cannot authorize Redis',async()=>{for(const edit of [(p:ReturnType<typeof exposureFixture>['policy'])=>{p.reservedFundsCents=199;},(p:ReturnType<typeof exposureFixture>['policy'])=>{p.reserveEvidence='';},(p:ReturnType<typeof exposureFixture>['policy'])=>{p.termsSnapshot='changed';}]){const f=start();edit(f.policy);assert.equal(await reserveFundedExposure('one','trial',f.policy,f.context),false);assert.equal(calls.length,0);}});
test('a changed cost allocation cannot reuse a review even when the total is unchanged',async()=>{const f=start();f.policy.review=structuredClone(f.context.review!);f.policy.review.cases.trial.worstCase!.costCeilings.ai=95;f.policy.review.cases.trial.worstCase!.costCeilings.other=5;assert.equal(await reserveFundedExposure('one','trial',f.policy,f.context),false);assert.equal(calls.length,0);});
test('missing, corrupt, exhausted or inconsistent ledgers refuse before writes',async()=>{for(const edit of [(h:Map<string,string>)=>{h.delete('reserved');},(h:Map<string,string>)=>{h.set('reserved','-1');},(h:Map<string,string>)=>{h.set('reserved','201');},(h:Map<string,string>)=>{h.set('slots:trial','3');},(h:Map<string,string>)=>{h.set('slots:trial','0');},(h:Map<string,string>)=>{h.set('policy','changed');}]){const f=start();const h=ledger.get(f.key)!;edit(h);const before=[...h];assert.equal(await reserveFundedExposure('one','trial',f.policy,f.context),false);assert.deepEqual([...h],before);}});
test('a reused receipt needs intact reserved money and a previously consumed slot',async()=>{for(const edit of [(h:Map<string,string>)=>{h.set('reserved','0');},(h:Map<string,string>)=>{h.set('slots:trial','2');},(h:Map<string,string>)=>{h.set('case:trial:one','99');}]){const f=start();assert.equal(await reserveFundedExposure('one','trial',f.policy,f.context),true);edit(ledger.get(f.key)!);const before=[...ledger.get(f.key)!];assert.equal(await reserveFundedExposure('one','trial',f.policy,f.context),false);assert.deepEqual([...ledger.get(f.key)!],before);}});
test('invalid identities, unavailable storage and unexpected acknowledgements authorize nothing',async()=>{const f=start();for(const id of [undefined,null,42,'', 'one:other'])assert.equal(await reserveFundedExposure(id as string,'trial',f.policy,f.context),false);assert.equal(calls.length,0);settings({available:false});assert.equal(await reserveFundedExposure('one','trial',f.policy,f.context),false);settings({available:true,failure:true});assert.equal(await reserveFundedExposure('one','trial',f.policy,f.context),false);settings({failure:false});for(const response of [[],[true],['1'],[1,1]]){settings({response});assert.equal(await reserveFundedExposure('one','trial',f.policy,f.context),false);}});
test('zero funded scopes and absent current approvals remain off',async()=>{const f=start();assert.equal(await reserveFundedExposure('one','setup',f.policy,f.context),false);assert.equal(await reserveFundedExposure('one','trial'),false);assert.equal(calls.length,0);});

test('reserve accessors and inherited fields are not funding evidence',async()=>{const f=start();let reads=0;Object.defineProperty(f.policy,'reservedFundsCents',{get(){reads++;return 200;}});assert.equal(await reserveFundedExposure('one','trial',f.policy,f.context),false);assert.equal(reads,0);assert.equal(calls.length,0);const inherited=Object.create(exposureFixture().policy);assert.equal(await reserveFundedExposure('one','trial',inherited,f.context),false);});
test('canonical bindings ignore object insertion order without dropping any cost category',()=>{const f=exposureFixture();const before=exposureBudgetConfiguration(f.policy,f.context)!.binding;const reordered=structuredClone(f.policy);for(const item of Object.values(reordered.review.cases))item.worstCase!.costCeilings=Object.fromEntries(Object.entries(item.worstCase!.costCeilings).reverse());assert.equal(exposureBudgetConfiguration(reordered,f.context)!.binding,before);});

test('terms changed while awaiting Redis deny work without refunding the allocation',async()=>{
 const f=start();const pending=reserveFundedExposure('one','trial',f.policy,f.context);
 f.context.termsSnapshot='CHANGED_TERMS';
 assert.equal(await pending,false);assert.equal(ledger.get(f.key)?.get('reserved'),'100');
 assert.equal(ledger.get(f.key)?.get('slots:trial'),'1');
});
test('funding evidence changed while awaiting Redis cannot authorize provider work',async()=>{
 for(const edit of [(p:ReturnType<typeof exposureFixture>['policy'])=>{p.reserveEvidence='';},(p:ReturnType<typeof exposureFixture>['policy'])=>{p.reviewId='different_review';}]){
  const f=start();const pending=reserveFundedExposure('one','trial',f.policy,f.context);edit(f.policy);
  assert.equal(await pending,false);assert.equal(ledger.get(f.key)?.get('reserved'),'100');
 }
});
test('allocation changes after dispatch leave the existing reservation held',async()=>{
 const f=start();const pending=reserveFundedExposure('one','trial',f.policy,f.context);
 f.policy.review=structuredClone(f.context.review!);
 f.policy.review.cases.trial.worstCase!.costCeilings.ai=95;
 f.policy.review.cases.trial.worstCase!.costCeilings.other=5;
 assert.equal(await pending,false);assert.equal(ledger.get(f.key)?.get('reserved'),'100');
});
test('a month rollover before acknowledgement refuses new work but retains the receipt',async t=>{
 t.mock.timers.enable({apis:['Date'],now:Date.UTC(2026,9,31,23,59,59)});
 const f=start();const pending=reserveFundedExposure('one','trial',f.policy,f.context);
 t.mock.timers.setTime(Date.UTC(2026,10,1));
 assert.equal(await pending,false);assert.equal(ledger.get(f.key)?.get('reserved'),'100');
});

function platformStart(){
 reset();
 const f=exposureFixture(), item=f.context.review!.cases.platform_waitlist;
 item.maximumMonthlyCases=2;
 item.worstCase!.costCeilings.email=20;
 f.context.review!.monthlyBudgetCents=240;
 f.policy.reservedFundsCents=240;
 const c=exposureBudgetConfiguration(f.policy,f.context)!;
 assert.ok(c);
 const key='nl:exposure:v1:'+c.month;
 seed(key,c);
 return {...f,key,c};
}
test('platform waitlist competes for the same cash but has independent durable slots and receipts',async()=>{
 const f=platformStart();
 assert.equal(await reserveFundedExposure('same','trial',f.policy,f.context),true);
 assert.equal(await reserveFundedExposure('same','platform_waitlist',f.policy,f.context),true);
 const h=ledger.get(f.key)!;
 assert.equal(h.get('reserved'),'120');
 assert.equal(h.get('slots:trial'),'1');
 assert.equal(h.get('slots:platform_waitlist'),'1');
 assert.equal(h.get('case:trial:same'),'100');
 assert.equal(h.get('case:platform_waitlist:same'),'20');
 for(let i=0;i<10;i++)assert.equal(await reserveFundedExposure('same','platform_waitlist',f.policy,f.context),true);
 assert.equal(h.get('reserved'),'120');
});
test('64 synthetic waitlist contenders cannot spend more than two pre-funded case slots',async()=>{
 const f=platformStart();
 const results=await Promise.all(Array.from({length:64},(_,i)=>reserveFundedExposure('platform'+i,'platform_waitlist',f.policy,f.context)));
 assert.equal(results.filter(Boolean).length,2);
 assert.equal(ledger.get(f.key)!.get('reserved'),'40');
 assert.equal(ledger.get(f.key)!.get('slots:platform_waitlist'),'0');
});
test('missing waitlist scope, changed review or absent current approval refuses before any Redis call',async()=>{
 for(const edit of [
  (f:ReturnType<typeof exposureFixture>)=>{Reflect.deleteProperty(f.policy.review.cases,'platform_waitlist');},
  (f:ReturnType<typeof exposureFixture>)=>{f.policy.review=structuredClone(f.context.review!);f.policy.review.cases.platform_waitlist.maximumMonthlyCases=1;},
 ]){const f=platformStart();edit(f);assert.equal(await reserveFundedExposure('platform','platform_waitlist',f.policy,f.context),false);assert.equal(calls.length,0);}
 reset();
 assert.equal(await reserveFundedExposure('platform','platform_waitlist'),false);
 assert.equal(calls.length,0);
});
