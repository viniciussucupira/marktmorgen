import assert from "node:assert/strict";
import { test } from "node:test";
import { guardedResendPost as production, type ResendPost } from "../lib/resend-fallback-transport";
import { guardedResendPost as disposable } from "./e2e/reviewed-resend-transport";
const request = (id: string): ResendPost => ({ base: "http://127.0.0.1:4488", path: "/emails", credential: "re_local_only_a_stand_in",
  usageCredential: "re_local_only_a_stand_in", body: JSON.stringify({from:"mail@example.test",to:["buyer@example.test"],subject:id,text:"Synthetic receipt"}),
  recipients:1,idempotencyKey:id });

test("synthetic credentials never populate the production account review",async()=>{
  let calls=0;const original=fetch;globalThis.fetch=async()=>{calls++;throw Error("No network");};
  try {assert.deepEqual(await production(request("closed-production")),{kind:"blocked"});assert.equal(calls,0);}
  finally {globalThis.fetch=original;}
});
test("a disposable build rejects a foreign credential before any provider call",async()=>{
  let calls=0;const original=fetch;globalThis.fetch=async()=>{calls++;throw Error("No network");};
  try {assert.deepEqual(await disposable({...request("foreign-credential"),credential:"re_foreign_not_a_disposable_fixture"}),{kind:"blocked"});assert.equal(calls,0);}
  finally {globalThis.fetch=original;}
});
test("the reviewed fixture cannot bypass the real caller barrier or duplicate accepted POSTs",async()=>{
  let posts=0;const original=fetch;globalThis.fetch=async(_input,init)=>{assert.equal(init?.method,"POST");posts++;return Response.json({id:"synthetic_accepted_receipt"});};
  try {
    const refused=await disposable({...request("barrier-refused"),beforePost:async()=>false});assert.equal(refused.kind,"unknown");assert.equal(posts,0);
    const accepted=request("accepted-once");assert.equal((await disposable(accepted)).kind,"response");assert.equal(posts,1);
    assert.equal((await disposable(accepted)).kind,"accepted_receipt");assert.equal(posts,1);
  }finally {globalThis.fetch=original;}
});
