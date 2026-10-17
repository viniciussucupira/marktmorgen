import { dispatch } from './mail-reservation-email';
import { claimHandle, ensureListId, ensureStatsId, setMailSettings, setSubscription, storeForEmail } from '@/lib/store';
import { upsertContact } from '@/lib/contacts';
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import { reserve, reserveDay, usedThisMonth, monthlyAllowance, sendTo } from '@/lib/mail';
import { PRO_MONTHLY_EMAILS, SCALE_MONTHLY_EMAILS } from '@/lib/plan';
import type { Store } from '@/lib/store';
import { store as memory } from './redis-stub';
import { paidPeriod } from './billing-period-fixture';
import { windowId } from '@/lib/allowance-window';
const actual=memory.pipeline.bind(memory);
let reply: unknown[]|undefined;
let pipelines:(string|number)[][][]=[];
(memory as unknown as {pipeline:typeof memory.pipeline}).pipeline=(async(commands:(string|number)[][])=>{
 pipelines.push(commands);const result=await actual(commands);
 const key=String(commands[0]?.[1]??'');
 return commands[0]?.[0]==='INCRBY' && (key.startsWith('nl:mail:used:')||key.startsWith('nl:mail:day:')) && reply!==undefined?reply:result;
}) as typeof memory.pipeline;
const store={listId:'a'.repeat(32),tier:'pro',subscriptionActive:true,trialEnds:0} as Store;
beforeEach(()=>{memory.clear();reply=undefined;pipelines=[];process.env.MARKETING_DAILY_CAP='100000';dispatch.calls=0;dispatch.outcome='retry';});
test('lowered paid list caps are the actual runtime allowances',()=>{assert.equal(monthlyAllowance(store),5000);assert.equal(monthlyAllowance({...store,tier:'scale'}),8000);assert.equal(PRO_MONTHLY_EMAILS,5000);assert.equal(SCALE_MONTHLY_EMAILS,8000);});
test('an acknowledged exact reservation consumes the monthly capacity',async()=>{assert.equal(await reserve(store,3),'ok');assert.equal(await usedThisMonth(store.listId),3);});
test('missing, partial or corrupt counter acknowledgements cannot authorize',async()=>{
 for(const value of [[],[1,1],[1,1,1],[1,1,1,1,1],[undefined,1,1,1],[true,1,1,1],['01',1,1,1],[-1,1,1,1],[0,1,1,1],[1.5,1,1,1],[NaN,1,1,1],[Infinity,1,1,1],[1,0,1,1],[1,1,1,0],[1,true,1,1]]){reply=value;assert.equal(await reserve(store,1),'unavailable');}
});
test('a lost acknowledgement retains the actual reservation and never decrements it',async()=>{reply=[];assert.equal(await reserve(store,2),'unavailable');reply=undefined;assert.equal(await usedThisMonth(store.listId),2);assert.equal(pipelines.some(c=>c.some(x=>x[0]==='DECRBY')),false);});
test('invalid or excessive request counts never touch provider or ledger capacity',async()=>{for(const n of [-1,0.5,NaN,Infinity,PRO_MONTHLY_EMAILS+1])assert.equal(await reserve(store,n),'month');assert.equal(pipelines.length,0);assert.equal(await reserve(store,0),'ok');assert.equal(pipelines.length,0);});
test('exact monthly boundary passes and another attempt is refused without over-authorizing',async()=>{assert.equal(await reserve(store,PRO_MONTHLY_EMAILS),'ok');assert.equal(await reserve(store,1),'month');assert.equal(await usedThisMonth(store.listId),PRO_MONTHLY_EMAILS);});
test('day-only reservations also require exact acknowledged counters',async()=>{for(const value of [[],[1],[0,1],[1,0],[false,1],[1,1,1]]){reply=value;assert.equal(await reserveDay(1),false);}reply=undefined;assert.equal(await reserveDay(1),true);});

async function fullStore(){
 const owner='mailbudget@example.com';
 await claimHandle(owner,'mailbudget','Synthetic Mail Budget','');
 await ensureStatsId(owner);await ensureListId(owner);
 await setSubscription(owner,{customerId:'cus_MailBudget0001',subscriptionId:'sub_MailBudget0001',active:true,tier:'pro',period:paidPeriod()});
 await setMailSettings(owner,{fromName:'Synthetic Mail Budget',address:'1 Test St, Portland, OR 97201'});
 const made=(await storeForEmail(owner))!;
 await upsertContact(made.listId!,'reader@example.com',{agreed:true,explicit:true,source:'free'});
 return made;
}
test('actual send loop never dispatches after a lost reservation acknowledgement',async()=>{
 const made=await fullStore();reply=[];const result=await sendTo(made,['reader@example.com'],'Synthetic','Test only','lost-reservation');
 assert.equal(result.stopped,'retry');assert.equal(dispatch.calls,0);reply=undefined;assert.equal(await usedThisMonth(made.listId, windowId(made)),1);
});
test('actual provider retry outcomes retain attempted monthly capacity',async()=>{
 const made=await fullStore();
 for(const key of ['first-attempt','second-attempt']){const result=await sendTo(made,['reader@example.com'],'Synthetic','Test only',key);assert.equal(result.stopped,'retry');}
 assert.equal(dispatch.calls,2);assert.equal(await usedThisMonth(made.listId, windowId(made)),2);
});
test('a provider refusal also cannot replenish dispatched attempt capacity',async()=>{
 const made=await fullStore();dispatch.outcome='refused';const result=await sendTo(made,['reader@example.com'],'Synthetic','Test only','refused-attempt');
 assert.equal(result.stopped,'refused');assert.equal(dispatch.calls,1);assert.equal(await usedThisMonth(made.listId, windowId(made)),1);
});
