import assert from "node:assert/strict";
import test from "node:test";
import {publishRestartStore,PUBLISH_RESTART_STORE,READ_RESTART_PUBLICATION} from "@/lib/contract-restart-publication";
import {FINISH,calls,evidence,reset} from "./restart-publication-ack-world";
type Input=Parameters<typeof publishRestartStore>[0];
const input={} as Input;
test("actual publisher accepts only exact own publication ACKs and keeps one readback for unknown",async()=>{
 const original=globalThis.fetch;let provider=0,getters=0,members=0;
 globalThis.fetch=(async()=>{provider++;throw Error("No real provider operation");}) as typeof fetch;
 try{
  for(const flag of [1,2]){
   reset([[[flag,FINISH]]]);assert.equal((await publishRestartStore(input))?.fundedPublication,true);
   assert.equal(calls.length,1);assert.equal(calls[0][1],PUBLISH_RESTART_STORE);
  }
  reset([[0]]);assert.equal(await publishRestartStore(input),null);assert.equal(calls.length,1);
  const outerAccessor=[[]];Object.defineProperty(outerAccessor,"0",{get(){getters++;throw Error("outer getter");}});
  const innerAccessor=[1,FINISH];Object.defineProperty(innerAccessor,"1",{get(){getters++;throw Error("inner getter");}});
  const inherited=new Array(2);const proto=Object.create(Array.prototype);Object.defineProperty(proto,"0",{value:1});Object.defineProperty(proto,"1",{value:FINISH});Object.setPrototypeOf(inherited,proto);
  const symbol=[1,FINISH];Object.defineProperty(symbol,Symbol("untrusted"),{value:1});
  const oversized=(value:unknown[])=>new Proxy(value,{getOwnPropertyDescriptor(target,key){
   if(key==="0"||key==="1"){members++;throw Error("oversized member visited");}
   return Reflect.getOwnPropertyDescriptor(target,key);
  }});
  const outerLarge=oversized([null,null]),innerLarge=oversized([1,FINISH,0]);
  // Positive control proves this probe catches traversal; then reset it.
  assert.throws(()=>Object.getOwnPropertyDescriptor(outerLarge,"0"));assert.equal(members,1);members=0;
  const malformed:unknown[]=[outerAccessor,[innerAccessor],[inherited],[symbol],outerLarge,[innerLarge],
   [],new Array(1),[new Array(2)],[[1,FINISH+1]],[[3,FINISH]],[[1]],{length:1,0:[1,FINISH]},[[true,FINISH]]];
  for(const reply of malformed){
   const before=evidence();reset([reply,reply]);
   assert.equal(await publishRestartStore(input),null);
   assert.equal(calls.length,2,"unknown allows exactly the existing bounded readback");
   assert.equal(calls[0][1],PUBLISH_RESTART_STORE);assert.equal(calls[1][1],READ_RESTART_PUBLICATION);
   assert.deepEqual(evidence(),before,"unknown does not release source/cash/pause evidence");
  }
  assert.equal(getters,0);assert.equal(members,0);assert.equal(provider,0);
  reset([outerLarge,[[2,FINISH]]]);assert.equal((await publishRestartStore(input))?.fundedPublication,true);assert.equal(calls.length,2);
  reset([outerLarge,[0]]);assert.equal(await publishRestartStore(input),null);assert.equal(calls.length,2);
 }finally{globalThis.fetch=original;}
});
