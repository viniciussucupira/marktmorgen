import assert from "node:assert/strict";
import {test} from "node:test";
import {createHash} from "node:crypto";
import * as origin from "@/lib/order-confirmation-outbox";
import {prepareCourseOriginBinding} from "@/lib/course-origin-binding";
import {admitOrders} from "@/lib/order-admission";
import {shipmentMailPolicy} from "@/lib/shipment-mail-outbox";
import type {Store} from "@/lib/store";
import {store as redis} from "./redis-stub";
import {courseCandidateWorld} from "./order-confirmation-course-world";
import {shipmentOutboxFixture,shipmentPolicy} from "./shipment-mail-outbox-fixture";

process.env.NIMBUS_DATA_KEY="SYNTHETIC_ONLY_course_origin_persistence_key_2026";
globalThis.fetch=async()=>{throw Error("No external provider in course persistence proof");};
async function fixture(){
 redis.clear();const world=courseCandidateWorld(),now=Date.now();
 const store={...world.store,extra:false,shared:false,subscriptionActive:true,subscriptionId:"sub_SyntheticCoursePersistence",
  trialEnds:0,tier:"creator",planEndedAt:"",cycle:"month",period:{start:Math.floor(now/1000)-86400,end:Math.floor(now/1000)+86400,renews:true}} as Store;
 const pipeline=redis.pipeline;let admission;
 try{redis.pipeline=async()=>[1];admission=await admitOrders(store,1,now,1);}finally{redis.pipeline=pipeline;}
 assert.ok(admission.ok);
 const metadata={...world.metadata,mm_admit:String(admission.hour)},nonce="e".repeat(64);
 const form=new URLSearchParams({mode:"payment","line_items[0][quantity]":"1",
  "line_items[0][price_data][currency]":store.currency,"line_items[0][price_data][unit_amount]":String(world.product.priceCents),
  "line_items[0][price_data][product_data][name]":world.product.title,
  ...Object.fromEntries(Object.entries(metadata).map(([k,v])=>[`metadata[${k}]`,v])),
  "metadata[mm_order_intent]":nonce,"metadata[mm_order_origin]":"course-v1"});
 form.set("metadata[mm_order_hash]",origin.confirmationBodyDigest(form.toString()));
 const selected={store,product:world.product,metadata,body:form.toString(),nonce,admission};
 const issued=await prepareCourseOriginBinding(selected);assert.ok(issued);
 const ack=shipmentOutboxFixture(),commands:(string|number)[][]=[];
 let lose=false;
 const runtime={lifecycle:"active" as const,policy:{...shipmentPolicy(now),coveredOrigins:["course-confirmation" as const]},now:()=>now,
  pipeline:async(batch:(string|number)[][])=>{
   commands.push(...batch);const answers=[];
   for(const c of batch){
    if(c[0]==="TIME"){answers.push([String(Math.floor(now/1000)),String(now%1000*1000)]);continue;}
    const reply=await ack.pipeline([c]);if(lose&&c[0]==="EVAL"){lose=false;throw Error("Lost durable enqueue ACK");}answers.push(...reply);
   }
   return answers;
  }};
 return {selected,issued,runtime,commands,loseNext:()=>{lose=true;},input:{bindingToken:issued.token,nonce,snapshot:{store,product:world.product}}};
}
const closed={admitted:false,permitsCheckout:false,grantsAccess:false};
test("a course requires explicit coverage in the existing storage review, with no default IO",async()=>{
 const f=await fixture();
 assert.deepEqual(await origin.reserveCourseConfirmationOrigin(f.input,{pipeline:f.runtime.pipeline}),{ok:false});assert.equal(f.commands.length,0);
 assert.deepEqual(await origin.reserveCourseConfirmationOrigin(f.input,{...f.runtime,policy:shipmentPolicy(Date.now())}),{ok:false});assert.equal(f.commands.length,0);
 assert.ok(shipmentMailPolicy(f.runtime.policy));
});
test("the protected immutable course winner is recovered after lost ACK without a new source",async()=>{
 const f=await fixture();f.loseNext();assert.deepEqual(await origin.reserveCourseConfirmationOrigin(f.input,f.runtime),{ok:false});
 const result=await origin.reserveCourseConfirmationOrigin(f.input,f.runtime);assert.equal(result.ok,true);
 assert.ok(result.ok);assert.deepEqual({...closed,admitted:result.admitted,permitsCheckout:result.permitsCheckout,grantsAccess:result.grantsAccess},closed);
 const saved=await origin.readCourseConfirmationOrigin(result.id,f.runtime);assert.ok(saved);
 assert.equal(saved.binding.token,f.issued.token);assert.equal(saved.binding.fingerprint,createHash("sha256").update(f.issued.token).digest("hex"));
 assert.equal(saved.binding.candidate.identity.courseId,f.selected.product.course.id);
 assert.equal(saved.row.phase,"course_reserved");assert.equal(saved.row.created,f.runtime.now());
 assert.equal(redis.run(["TTL",origin.confirmationOriginRowKey(result.id)]),-1);
 assert.equal(redis.run(["TTL",`nl:order-confirmation:source:${result.id}`]),-1);
 const originalRaw=saved.raw,originalFingerprint=saved.row.courseBindingFingerprint;
 const alternative=await prepareCourseOriginBinding(f.selected);assert.ok(alternative);assert.notEqual(alternative.token,f.issued.token);
 assert.deepEqual(await origin.reserveCourseConfirmationOrigin({...f.input,bindingToken:alternative.token},f.runtime),{ok:false});
 assert.equal((await origin.readCourseConfirmationOrigin(result.id,f.runtime))?.raw,originalRaw);
 assert.equal((await origin.readCourseConfirmationOrigin(result.id,{...f.runtime,now:()=>f.issued.expiresAtMs+73*3600000}))?.row.courseBindingFingerprint,originalFingerprint);
});
test("course reservation cannot become physical checkout, worker, payment or email permission",async()=>{
 const f=await fixture(),result=await origin.reserveCourseConfirmationOrigin(f.input,f.runtime);assert.ok(result.ok);
 const before=f.commands.length;let provider=0,dispatch=0;
 const runtime={...f.runtime,provider:async()=>{provider++;throw Error("No course provider stage implemented");}};
 assert.equal(await origin.readConfirmationOrigin(result.id,runtime),null);
 assert.equal(await origin.claimConfirmationCreation(result.id,runtime),null);
 assert.equal(await origin.openConfirmationOrigin(result.id,runtime),null);
 await origin.runOrderConfirmationMail(f.runtime.now()+10000,async()=>{dispatch++;return "accepted";},runtime,result.id);
 assert.equal(provider,0);assert.equal(dispatch,0);
 assert.equal(f.commands.slice(before).some(c=>c[0]==="EVAL"),false,"unsupported stages must stop before mutation");
 const snapshot={...f.input.snapshot,store:{...f.input.snapshot.store,sid:"d".repeat(32)}};
 assert.deepEqual(await origin.reserveCourseConfirmationOrigin({...f.input,snapshot},f.runtime),{ok:false});
});
