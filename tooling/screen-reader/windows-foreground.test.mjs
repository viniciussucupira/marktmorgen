import assert from "node:assert/strict";
import {test} from "node:test";
import {EventEmitter} from "node:events";
import {PassThrough,Writable} from "node:stream";
import {startWindowsForegroundProbe} from "./windows-foreground.mjs";

const env={GITHUB_ACTIONS:"true",GITHUB_REPOSITORY:"viniciussucupira/marktmorgen",AX2_PUBLIC_DISPOSABLE_RUNNER:"true"};
function fixture({handshake=true,exitOnEnd=true}={}){
 const child=new EventEmitter(),requests=[],launches=[];
 child.stdout=new PassThrough();child.stderr=new PassThrough();
 child.stdin=new Writable({write(chunk,_encoding,done){requests.push(String(chunk).trim());done();},final(done){if(exitOnEnd)queueMicrotask(()=>child.emit("exit",0));done();}});
 child.kill=()=>{child.killed=true;queueMicrotask(()=>child.emit("exit",1));return true;};
 const launch=(...args)=>{launches.push(args);if(handshake)queueMicrotask(()=>child.stdout.write('{"ready":true}\n'));return child;};
 return {child,requests,launches,options:{env,platform:"win32",launch,timeoutMs:100},reply:(id,title)=>child.stdout.write(JSON.stringify({id,title})+"\n")};
}
test("one hidden owned process reads correlated titles without keystrokes",async()=>{
 const f=fixture(),probe=await startWindowsForegroundProbe(f.options);
 const one=probe.read(),two=probe.read();
 assert.deepEqual(f.requests,["0","1"]);f.reply("1","Search");f.reply("0","Synthetic — Chromium");
 assert.equal(await one,"Synthetic — Chromium");assert.equal(await two,"Search");
 assert.equal(f.launches.length,1);assert.equal(f.launches[0][0],"powershell.exe");
 assert.equal(f.launches[0][2].windowsHide,true);
 const script=Buffer.from(f.launches[0][1].at(-1),"base64").toString("utf16le");
 assert.ok(script.includes("GetForegroundWindow"));assert.ok(script.includes("GetWindowText"));
 assert.ok(!/SendKeys|SetForegroundWindow|AppActivate|keybd_event/.test(script));
 await probe.close();await assert.rejects(probe.read());
});
test("unknown or malformed correlation refuses every pending title",async()=>{
 for(const raw of ['{"id":"foreign","title":"Search"}', '{"id":"0","title":null}', 'not JSON']){
  const f=fixture(),probe=await startWindowsForegroundProbe(f.options),read=probe.read();
  f.child.stdout.write(raw+"\n");await assert.rejects(read);await assert.rejects(probe.read());await probe.close();
 }
});
test("query deadline is unknown and a late reply cannot authorize another query",async()=>{
 const f=fixture(),probe=await startWindowsForegroundProbe({...f.options,timeoutMs:5});
 await assert.rejects(probe.read(),/deadline/);f.reply("0","Late title");
 await assert.rejects(probe.read(),/deadline/);await probe.close();
});
test("startup deadline closes its observer and an exited child refuses pending reads",async()=>{
 const missing=fixture({handshake:false});await assert.rejects(startWindowsForegroundProbe({...missing.options,timeoutMs:5}),/deadline/);
 assert.equal(missing.child.stdin.writableEnded,true);
 const f=fixture(),probe=await startWindowsForegroundProbe(f.options),read=probe.read();
 f.child.emit("exit",1);await assert.rejects(read,/exited/);await probe.close();
});
test("foreign and non-Windows environments never launch a process",async()=>{
 for(const options of [{platform:"linux",env},{platform:"win32",env:{}},{platform:"win32",env:{...env,GITHUB_REPOSITORY:"foreign/repo"}}]){
  let launches=0;await assert.rejects(startWindowsForegroundProbe({...options,launch(){launches++;}}));assert.equal(launches,0);
 }
});
test("an observer that ignores EOF is terminated only through its owned child handle",async()=>{
 const f=fixture({exitOnEnd:false}),probe=await startWindowsForegroundProbe(f.options);
 await probe.close();assert.equal(f.child.killed,true);assert.equal(f.launches.length,1);
});
test("process errors refuse pending snapshots and retain their cause",async()=>{
 const f=fixture(),probe=await startWindowsForegroundProbe(f.options),read=probe.read();
 f.child.emit("error",Error("synthetic process fault"));await assert.rejects(read,/process failed/);
 await assert.rejects(probe.read(),/process failed/);await probe.close();
});
