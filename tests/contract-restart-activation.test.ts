import assert from "node:assert/strict";
import test from "node:test";
import {activateRestartContract,type RestartContractActivation} from "@/lib/contract-restart-activation";
test("uncovered restart activation refuses before getters or any Redis/provider IO",async()=>{
 const original=globalThis.fetch;let calls=0,reads=0;
 globalThis.fetch=(async()=>{calls++;throw Error("Unexpected activation IO");}) as typeof fetch;
 try{
  const hostile=Object.defineProperty({},"armed",{enumerable:true,get(){reads++;throw Error("Unexpected getter");}});
  assert.equal(await activateRestartContract(hostile as RestartContractActivation),false);
  assert.equal(await activateRestartContract(null as unknown as RestartContractActivation),false);
  assert.equal(reads,0);assert.equal(calls,0);
 }finally{globalThis.fetch=original;}
});
