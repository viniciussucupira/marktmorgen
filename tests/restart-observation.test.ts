import assert from "node:assert/strict";
import test from "node:test";
import {observeRestartedPlan} from "@/lib/billing";
import {PLAN_PRICES} from "@/lib/plan";

const NOW=1_800_000_000,DAY=86_400;
const input={customerId:"cus_SyntheticRestart01",tier:"creator" as const,priceId:"price_SyntheticRestart01"};
function observed(){
 return {
  id:"sub_SyntheticRestart01",status:"active",customer:input.customerId,
  start_date:NOW-60,trial_end:null,cancel_at_period_end:false,
  items:{data:[{quantity:1,current_period_start:NOW-60,current_period_end:NOW+30*DAY,
   price:{id:input.priceId,lookup_key:"nimbus_labs_creator_month",currency:"usd",unit_amount:PLAN_PRICES.creator.month,recurring:{interval:"month",interval_count:1}},
  }]},
 };
}
test("an already obtained restart response can be validated without any provider call or input mutation",()=>{
 const before=globalThis.fetch;let calls=0;
 globalThis.fetch=(async()=>{calls++;throw new Error("unexpected provider call");}) as typeof fetch;
 try{
  const candidate=observed(),snapshot=JSON.stringify(candidate);
  const result=observeRestartedPlan(input,candidate,NOW);
  assert.equal(result.subscriptionId,candidate.id);
  assert.equal(result.customerId,input.customerId);
  assert.equal(result.active,true);
  assert.equal(result.tier,"creator");
  assert.equal(result.cycle,"month");
  assert.equal(result.trialEnds,0);
  assert.equal(result.period?.start,NOW-60);
  assert.equal(result.period?.end,NOW+30*DAY);
  assert.equal(JSON.stringify(candidate),snapshot);
  assert.equal(calls,0);
 }finally{globalThis.fetch=before;}
});
test("response ownership, price, quantity and paid monthly standing remain mandatory",()=>{
 const candidates:Record<string,unknown>[]=[
  {...observed(),customer:"cus_OtherRestart01"},
  {...observed(),status:"past_due"},
  {...observed(),status:"trialing",trial_end:NOW+DAY},
 ];
 for(const field of ["id","currency","unit_amount","recurring"]){
  const value=observed(),price=value.items.data[0].price;
  Object.assign(price,field==="id"?{id:"price_OtherRestart01"}:
   field==="currency"?{currency:"eur"}:
   field==="unit_amount"?{unit_amount:PLAN_PRICES.creator.month+1}:
   {recurring:{interval:"year",interval_count:1}});
  candidates.push(value);
 }
 const doubled=observed();doubled.items.data[0].quantity=2;candidates.push(doubled);
 const extra=observed();extra.items.data.push({...extra.items.data[0]});candidates.push(extra);
 for(const candidate of candidates)assert.throws(()=>observeRestartedPlan(input,candidate,NOW));
});
test("unknown, expired, future or overlong paid periods cannot become a recovered plan",()=>{
 for(const [start,end] of [[NOW-2*DAY,NOW],[NOW+1,NOW+DAY],[NOW-60,NOW+32*DAY],[NOW-0.5,NOW+DAY]]){
  const value=observed();value.items.data[0].current_period_start=start;value.items.data[0].current_period_end=end;
  assert.throws(()=>observeRestartedPlan(input,value,NOW));
 }
 const missing=observed();delete (missing.items.data[0] as {current_period_start?:number}).current_period_start;
 assert.throws(()=>observeRestartedPlan(input,missing,NOW));
});
test("an invalid response or clock is unknown rather than a card decline",()=>{
 for(const candidate of [null,[],{},undefined]){
  assert.throws(()=>observeRestartedPlan(input,candidate as unknown as Record<string,unknown>,NOW));
 }
 for(const clock of [NaN,Infinity,0,-1,NOW+0.5]){
  assert.throws(()=>observeRestartedPlan(input,observed(),clock));
 }
});
