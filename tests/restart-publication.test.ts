import assert from "node:assert/strict";
import test from "node:test";
import {MAX_STORE_BYTES,restartPublicationRecord,withRestartPublicationRecord,type RestartPublicationGoal} from "@/lib/store";
import {publishRestartStore} from "@/lib/contract-restart-publication";
import {prepareRestartActivation,type RestartContractActivation} from "@/lib/contract-restart-activation";

const NOW=1_800_000_000;
function fixture(){
 const goal:RestartPublicationGoal={handle:"publicationstore",statsId:"c".repeat(32),sourceSubscriptionId:"sub_PublicationSource01",
  customerId:"cus_PublicationOwner01",tier:"creator",subscriptionId:"sub_PublicationNew01",
  periodStartSeconds:NOW-10,periodEndSeconds:NOW+30*86400,renews:false,shared:true};
 const value={handle:goal.handle,name:"Creator",email:"publication-owner@example.invalid",sid:"b".repeat(32),extra:false,
  statsId:goal.statsId,subscriptionId:goal.sourceSubscriptionId,stripeCustomerId:goal.customerId,subscriptionActive:false,
  tier:"creator",cycle:"month",trialEnds:0,shared:false,period:null,planEndedAt:"2026-01-01T00:00:00.000Z",
  catalog:{id:"a".repeat(32),items:[["d".repeat(32),0,"e".repeat(32)]],head:[]},
  creatorContent:{emptyArray:[],emptyObject:{},languages:["pt","en"],unknown:{price:1.25,nested:[{},[]]}},
  bio:"Preserve this",futureField:{enabled:true},previousHandles:["olderpublicationstore"]};
 return {goal,value,ref:value.email};
}
test("publication preparation preserves every nonbilling raw creator/catalog field without IO",()=>{
 const {goal,value,ref}=fixture(),raw=JSON.stringify(value),before=JSON.stringify(goal);
 const next=restartPublicationRecord(raw,ref,goal,NOW);assert.ok(next);
 assert.equal(next.expected,raw);assert.equal(JSON.stringify(goal),before);
 const after=JSON.parse(next.next);
 const billing=new Set(["stripeCustomerId","subscriptionId","subscriptionActive","subscriptionCheckedAt","tier","cycle","trialEnds","shared","period","planEndedAt"]);
 for(const key of new Set([...Object.keys(value),...Object.keys(after)])){
  if(!billing.has(key))assert.deepEqual(after[key],(value as Record<string,unknown>)[key],key);
 }
 assert.deepEqual(after.catalog,value.catalog);assert.deepEqual(after.creatorContent,value.creatorContent);
 assert.deepEqual(after.period,{start:goal.periodStartSeconds,end:goal.periodEndSeconds,renews:false,funded:true});
 assert.equal(after.shared,true);assert.equal(after.subscriptionActive,true);assert.equal(after.subscriptionId,goal.subscriptionId);
 assert.equal(after.trialEnds,0);assert.equal(after.planEndedAt,"");
 assert.equal(next.store.catalog.items[0]?.id,"d".repeat(32));
});
test("publication preparation refuses unknown, changed or legacy-default source fields",()=>{
 const {goal,value,ref}=fixture();
 for(const field of ["handle","statsId","subscriptionId","stripeCustomerId","tier","cycle","email","sid","subscriptionActive","extra"]){
  for(const replacement of [undefined,null,{}]){
   assert.equal(restartPublicationRecord(JSON.stringify({...value,[field]:replacement}),ref,goal,NOW),null,field);
  }
 }
 for(const change of [{subscriptionActive:true},{cycle:"year"},{tier:"pro"},{subscriptionId:"sub_ForeignPublication01"},{stripeCustomerId:"cus_ForeignPublication01"},
  {catalog:{id:null,items:[],head:[]}},{email:"foreign@example.invalid"}])
  assert.equal(restartPublicationRecord(JSON.stringify({...value,...change}),ref,goal,NOW),null);
 assert.equal(restartPublicationRecord(JSON.stringify(value),ref,{...goal,subscriptionId:goal.sourceSubscriptionId},NOW),null);
 assert.equal(restartPublicationRecord(JSON.stringify(value),ref,{...goal,periodEndSeconds:NOW},NOW),null);
 assert.equal(restartPublicationRecord(JSON.stringify(value),ref,{...goal,renews:"unknown"} as unknown as RestartPublicationGoal,NOW),null);
});
test("publication preparation bounds raw and grown records and does not invoke goal getters",()=>{
 const {goal,value,ref}=fixture();
 assert.equal(restartPublicationRecord("x".repeat(MAX_STORE_BYTES+1),ref,goal,NOW),null);
 const empty={...value,padding:""},room=MAX_STORE_BYTES-Buffer.byteLength(JSON.stringify(empty))-10;
 const full=JSON.stringify({...empty,padding:"x".repeat(room)});
 assert.ok(Buffer.byteLength(full)<=MAX_STORE_BYTES);
 assert.equal(restartPublicationRecord(full,ref,goal,NOW),null);
 assert.ok(restartPublicationRecord(JSON.stringify({...value,unicode:"é".repeat(10000)}),ref,goal,NOW));
 let reads=0;const hostile={...goal};Object.defineProperty(hostile,"customerId",{enumerable:true,get(){reads++;throw Error("unexpected getter");}});
 assert.equal(restartPublicationRecord(JSON.stringify(value),ref,hostile,NOW),null);assert.equal(reads,0);
});
test("uncovered publication and shared activation preparation refuse before IO or getters",async()=>{
 const original=globalThis.fetch;let io=0,reads=0,callbacks=0;
 globalThis.fetch=(async()=>{io++;throw Error("unexpected publication IO");}) as typeof fetch;
 try{
  const hostile=Object.defineProperty({},"armed",{enumerable:true,get(){reads++;throw Error("unexpected activation getter");}}) as RestartContractActivation;
  assert.equal(prepareRestartActivation(hostile),null);
  assert.equal(await publishRestartStore(hostile),null);
  const {goal,ref}=fixture();Object.defineProperty(goal,"customerId",{enumerable:true,get(){reads++;throw Error("unexpected Store getter");}});
  assert.equal(await withRestartPublicationRecord(ref,goal,async()=>{callbacks++;return true;}),null);
  assert.equal(io,0);assert.equal(reads,0);assert.equal(callbacks,0);
 }finally{globalThis.fetch=original;}
});
