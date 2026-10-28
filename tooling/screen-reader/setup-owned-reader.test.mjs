import test from "node:test";
import assert from "node:assert/strict";
import {setupOwnedReader} from "./setup-owned-reader.mjs";
const env={GITHUB_ACTIONS:"true",GITHUB_REPOSITORY:"viniciussucupira/marktmorgen",AX2_PUBLIC_DISPOSABLE_RUNNER:"true"};
const ok={status:0,signal:null};
const denied={status:1,signal:null,stderr:'Failed to enable "Do not disturb" mode; osascript is not allowed to send keystrokes'};
test("refuses every unowned or non-disposable host before running",async()=>{
 for(const opts of [{env:{}},{env:{...env,AX2_PUBLIC_DISPOSABLE_RUNNER:"false"}},{env:{...env,GITHUB_REPOSITORY:"other/repo"}},{platform:"linux"}]){
  let calls=0;await assert.rejects(setupOwnedReader({env,platform:"darwin",...opts,run:()=>{calls++;return ok;}}));assert.equal(calls,0);
 }
});
test("successful setup runs once with exact pinned CLI and ceiling",async()=>{
 let calls=0;const result=await setupOwnedReader({env,platform:"darwin",run:(file,args,options)=>{
  calls++;assert.equal(file,process.execPath);assert.ok(args[0].split(String.fromCharCode(92)).join("/").endsWith("/node_modules/@guidepup/setup/bin/guidepup"));
  assert.deepEqual(args.slice(1),["setup","--ci"]);assert.equal(options.timeout,210000);return ok;
 }});assert.deepEqual(result,{attempts:1});assert.equal(calls,1);
});
test("only known macOS permission propagation repeats preparation once",async()=>{
 let calls=0,delay=0;const result=await setupOwnedReader({env,platform:"darwin",run:()=>++calls===1?denied:ok,wait:async ms=>{delay=ms;}});
 assert.deepEqual(result,{attempts:2});assert.equal(calls,2);assert.equal(delay,2000);
});
test("persistent failure never becomes approval or a third attempt",async()=>{
 let calls=0;await assert.rejects(setupOwnedReader({env,platform:"darwin",run:()=>{calls++;return denied;},wait:async()=>{}}));assert.equal(calls,2);
});
test("timeouts, unknown errors and Windows never use the recovery",async()=>{
 for(const result of [{status:null,signal:"SIGTERM"},{status:1,stderr:"unknown error"},{...denied,error:new Error("spawn error")}]){
  let calls=0;await assert.rejects(setupOwnedReader({env,platform:"darwin",run:()=>{calls++;return result;}}));assert.equal(calls,1);
 }
 let calls=0;await assert.rejects(setupOwnedReader({env,platform:"win32",run:()=>{calls++;return denied;}}));assert.equal(calls,1);
});
