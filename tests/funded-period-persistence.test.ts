import test from 'node:test';
import assert from 'node:assert/strict';
import {claimHandle,setSubscription,storeForEmail} from '@/lib/store';
import {allowanceWindow} from '@/lib/allowance-window';
import {store as redis} from './redis-stub';
test('an acknowledged period marker survives store persistence and same-period legacy writes',async()=>{
 redis.clear();const email='funded-window@example.test';assert.equal((await claimHandle(email,'fundedwindow','Funded Window','')).ok,true);
 const start=Math.floor(Date.now()/1000)-100,end=start+30*86400,period={start,end,renews:true,funded:true as const};
 const saved=await setSubscription(email,{active:true,subscriptionId:'sub_FundedWindow0001',customerId:'cus_FundedWindow0001',tier:'creator',cycle:'month',trialEnds:0,period});assert.ok(saved);
 const loaded=(await storeForEmail(email))!;assert.equal(loaded.period?.funded,true);assert.equal(allowanceWindow(loaded,end*1000),null);
 const same=await setSubscription(email,{active:true,period:{start,end,renews:true}});assert.ok(same);assert.equal(same.period?.funded,true);
 const before=JSON.stringify(await storeForEmail(email));
 for(const fields of [{period:{start:end,end:end+30*86400,renews:true}},{subscriptionId:'sub_OtherWindow001'},{tier:'pro' as const},{cycle:'year' as const},{period:null}]){
  assert.equal(await setSubscription(email,{active:true,...fields}),null);assert.equal(JSON.stringify(await storeForEmail(email)),before);
 }
 const next={start:end,end:end+30*86400,renews:true,funded:true as const};
 assert.ok(await setSubscription(email,{active:true,period:next}));assert.equal((await storeForEmail(email))?.period?.funded,true);
 assert.ok(await setSubscription(email,{active:false}));assert.equal((await storeForEmail(email))?.period,null);
});
