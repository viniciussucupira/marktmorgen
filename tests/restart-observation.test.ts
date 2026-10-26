import assert from "node:assert/strict";
import test from "node:test";
import {observeStoppedRestartSource,observeRestartedPlan} from "@/lib/billing";
import type {OwnedRestartIntent} from "@/lib/contract-funding";
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

function stoppedFixture(): { intent: OwnedRestartIntent; original: Record<string,unknown> } {
 const source="ctr_StoppedSource01",id="sub_StoppedSource01",review="review_stopped01";
 const created=NOW-40*DAY,start=NOW-32*DAY,end=NOW-2*DAY;
 const intent: OwnedRestartIntent={
  claim:"claim_StoppedSource01",ref:"synthetic",handle:"synthetic",claimedAtSeconds:NOW-10,
  grant:{id:"ctr_NewStopped01",reviewId:review,statsId:"synthetic",key:"creator_month",action:"restart",sourceSubscriptionId:id,
   reservedCents:50,submitUntilSeconds:NOW+120,checkoutExpiresAtSeconds:NOW+3600,activationUntilSeconds:NOW+7200,liabilitiesThrough:new Date((NOW+40*DAY)*1000).toISOString()},
  paused:JSON.stringify({customer:input.customerId,subscription:id,from:end,until:NOW-60,funding:{version:1,grantId:source}}),
  source:{binding:[source,id,"creator_month",created,"paid",start,end].join("|"),receipt:"retained",restartReceipt:"retained",reservedCents:100,carriedCents:0},
 };
 const original={...observed(),id,status:"canceled",created,ended_at:end,canceled_at:end-DAY,cancel_at_period_end:true,pending_update:null,
  metadata:{funding_grant:source,funding_review:review},
  items:{has_more:false,data:[{...observed().items.data[0],current_period_start:start,current_period_end:end}]}};
 return {intent,original};
}
test("owned source stop observation binds exact ended paid source without IO or mutation",()=>{
 const saved=globalThis.fetch;let calls=0;globalThis.fetch=(async()=>{calls++;throw Error("unexpected IO");}) as typeof fetch;
 try{
  const {intent,original}=stoppedFixture(),before=JSON.stringify({intent,original});
  const proof=observeStoppedRestartSource(intent,original,NOW);
  assert.deepEqual(proof,{subscriptionId:original.id,endedAtSeconds:NOW-2*DAY,observedAtSeconds:NOW});
  assert.equal(Object.isFrozen(proof),true);assert.equal(calls,0);assert.equal(JSON.stringify({intent,original}),before);
 }finally{globalThis.fetch=saved;}
});
test("active, requested cancellation, paused collection and unknown originals cannot prove stopped",()=>{
 for(const change of [
  {status:"active"},{status:"paused"},{status:"unpaid"},{status:"incomplete_expired"},
  {ended_at:null},{ended_at:NOW},{canceled_at:NOW},{cancel_at_period_end:false},
  {id:"sub_OtherStopped01"},{customer:"cus_OtherStopped01"},{created:NOW-41*DAY},
  {pending_update:{}},{metadata:{}},{items:{data:[],has_more:false}},
 ]){
  const {intent,original}=stoppedFixture();
  assert.throws(()=>observeStoppedRestartSource(intent,{...original,...change},NOW));
 }
 for(const candidate of [null,[],{},undefined]){
  const {intent}=stoppedFixture();assert.throws(()=>observeStoppedRestartSource(intent,candidate as unknown as Record<string,unknown>,NOW));
 }
});
test("stop proof preserves exact period, single published monthly unit and pending grant precedence",()=>{
 for(const mode of ["period","more","quantity","price","currency","amount","year","pending","review","source"]){
  const {intent,original}=stoppedFixture();
  const value=original as ReturnType<typeof observed> & {metadata:Record<string,unknown>;items:{has_more?:boolean;data:ReturnType<typeof observed>["items"]["data"]}};
  if(mode==="period")value.items.data[0].current_period_end++;
  if(mode==="more")value.items.has_more=true;
  if(mode==="quantity")value.items.data[0].quantity=2;
  if(mode==="price")value.items.data[0].price.id="price_bad";
  if(mode==="currency")value.items.data[0].price.currency="eur";
  if(mode==="amount")value.items.data[0].price.unit_amount++;
  if(mode==="year")value.items.data[0].price.recurring.interval="year";
  if(mode==="pending")value.metadata.funding_pending_review=intent.grant.reviewId;
  if(mode==="review")value.metadata.funding_review="other";
  if(mode==="source")value.metadata.funding_grant="ctr_OtherSource";
  assert.throws(()=>observeStoppedRestartSource(intent,original,NOW),mode);
 }
 const {intent,original}=stoppedFixture();
 (original as Record<string,unknown>).metadata={funding_grant:"ctr_OlderSource",funding_review:"older",funding_pending_grant:"ctr_StoppedSource01",funding_pending_review:intent.grant.reviewId};
 assert.equal(observeStoppedRestartSource(intent,original,NOW).subscriptionId,original.id);
});
test("stop observation refuses expired ownership, clock rollback, source substitution and accessors",()=>{
 const {intent,original}=stoppedFixture();
 for(const clock of [0,NaN,Infinity,NOW-11,NOW+121,NOW+0.5])assert.throws(()=>observeStoppedRestartSource(intent,original,clock));
 assert.throws(()=>observeStoppedRestartSource({...intent,source:{...intent.source,binding:intent.source.binding.replace("paid","trial")}},original,NOW));
 let reads=0;const hostile={...original};Object.defineProperty(hostile,"ended_at",{enumerable:true,get(){reads++;return NOW-2*DAY;}});
 assert.throws(()=>observeStoppedRestartSource(intent,hostile,NOW));assert.equal(reads,0);
});
