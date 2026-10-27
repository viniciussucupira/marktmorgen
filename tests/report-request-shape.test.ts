import assert from "node:assert/strict";
import { NextRequest } from "next/server";
import { POST } from "@/app/api/report/route";

async function main() {
  let externalCalls=0;
  globalThis.fetch=(async()=>{externalCalls++;throw new Error("Unexpected external request");}) as typeof fetch;
  const ask=(body:string)=>POST(new NextRequest("https://marktmorgen.com/api/report",{
    method:"POST",headers:{"Content-Type":"application/json",Origin:"https://marktmorgen.com",Host:"marktmorgen.com"},body
  }));
  for (const body of ["null","[]","true","false","1",'"notice"',"["]) {
    const response=await ask(body);
    assert.equal(response.status,400);
    assert.deepEqual(await response.json(),{ok:false,error:"invalid"});
  }
  const missing=await ask("{}");
  assert.equal(missing.status,400);
  assert.deepEqual(await missing.json(),{ok:false,error:"problem",problem:"kind"});
  const honeypot=await ask('{"website":"synthetic-bot"}');
  assert.equal(honeypot.status,200);
  assert.deepEqual(await honeypot.json(),{ok:true});
  const foreign=await POST(new NextRequest("https://marktmorgen.com/api/report",{
    method:"POST",headers:{"Content-Type":"application/json",Origin:"https://example.test",Host:"marktmorgen.com"},body:"null"
  }));
  assert.equal(foreign.status,403,"foreign origin remains refused before body validation");
  assert.equal(externalCalls,0,"invalid input and intentional honeypot must not perform external work");
  console.log("Report request shape: malformed JSON, null, arrays and primitives refused; existing field validation/honeypot preserved; zero external requests.");
}
main().catch(error=>{console.error(error);process.exitCode=1;});
