import assert from "node:assert/strict";
import test from "node:test";
import {resetVoiceOverRunner} from "./reset-voiceover.mjs";
function fixture(){
 const signals=[],state={running:true,foreign:false,unknown:false,changed:false,zombie:false,keepAlive:false,postKillZombie:false};
 const options={platform:"darwin",uid:501,env:{GITHUB_ACTIONS:"true",GITHUB_REPOSITORY:"viniciussucupira/marktmorgen",AX2_PUBLIC_DISPOSABLE_RUNNER:"true"},
  now:()=>1,wait:async()=>{},
  run:(file)=>{
   if(file.endsWith("pgrep")){
    if(state.unknown)throw Object.assign(Error("inventory unavailable"),{status:2});
    if(!state.running)throw Object.assign(Error("no process"),{status:1});
    return state.changed?"43\n":"42\n";
   }
   return (state.foreign?"0":"501")+(state.zombie?" Z ":" S ")+"/System/Library/CoreServices/VoiceOver.app/Contents/MacOS/VoiceOver\n";
  },
  kill:(pid,signal)=>{signals.push([pid,signal]);if(signal==="SIGKILL"){if(state.postKillZombie)state.zombie=true;else if(!state.keepAlive)state.running=false;}},
 };
 return {options,signals,state};
}
test("stuck exact owned runner process must stop before real reader startup",async()=>{
 const f=fixture();assert.deepEqual(await resetVoiceOverRunner(f.options),{initialProcesses:1,forcedProcesses:1});
 assert.deepEqual(f.signals,[[42,"SIGTERM"],[42,"SIGKILL"]]);
});
test("an explicit empty inventory needs no signal",async()=>{
 const f=fixture();f.state.running=false;assert.deepEqual(await resetVoiceOverRunner(f.options),{initialProcesses:0,forcedProcesses:0});assert.deepEqual(f.signals,[]);
});
test("foreign user, unmarked host, unknown inventory and changed process refuse",async()=>{
 for(const mode of ["foreign","host","inventory","path","changed"]){
  const f=fixture();
  if(mode==="foreign")f.state.foreign=true;
  if(mode==="host")f.options.env.AX2_PUBLIC_DISPOSABLE_RUNNER="false";
  if(mode==="inventory")f.state.unknown=true;
  if(mode==="path"){const original=f.options.run;f.options.run=(file)=>file.endsWith("ps")?"501 S /tmp/VoiceOver\n":original(file);}
  if(mode==="changed")f.options.wait=async()=>{f.state.changed=true;};
  await assert.rejects(resetVoiceOverRunner(f.options),undefined,mode);
  if(mode!=="changed")assert.deepEqual(f.signals,[],mode);
  else assert.deepEqual(f.signals,[[42,"SIGTERM"]]);
 }
});

test("verified owned zombie is exited evidence and receives no signal",async()=>{
 const f=fixture();f.state.zombie=true;
 assert.deepEqual(await resetVoiceOverRunner(f.options),{initialProcesses:1,forcedProcesses:0});
 assert.deepEqual(f.signals,[]);
});
test("post-kill zombie is distinguished from a persistent live reader",async()=>{
 const f=fixture();f.state.postKillZombie=true;
 assert.deepEqual(await resetVoiceOverRunner(f.options),{initialProcesses:1,forcedProcesses:1});
 assert.deepEqual(f.signals,[[42,"SIGTERM"],[42,"SIGKILL"]]);
 const live=fixture();live.state.keepAlive=true;
 await assert.rejects(resetVoiceOverRunner(live.options),/did not prove a stopped reader.*"state":"S"/);
 assert.equal(live.signals.length,2,"no retry or additional signal after the existing kill ceiling");
});
test("foreign or replacement zombie cannot bypass ownership and identity checks",async()=>{
 const foreign=fixture();foreign.state.zombie=true;foreign.state.foreign=true;
 await assert.rejects(resetVoiceOverRunner(foreign.options),/exact Apple executable/);assert.deepEqual(foreign.signals,[]);
 const changed=fixture();changed.options.wait=async()=>{changed.state.changed=true;changed.state.zombie=true;};
 await assert.rejects(resetVoiceOverRunner(changed.options),/process changed/);assert.deepEqual(changed.signals,[[42,"SIGTERM"]]);
});
