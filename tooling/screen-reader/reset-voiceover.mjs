import {execFileSync} from "node:child_process";
const EXECUTABLE="/System/Library/CoreServices/VoiceOver.app/Contents/MacOS/VoiceOver";
/** Preflight only on the explicitly marked disposable public CI runner.
 * Never retry heading/speech assertions or treat a failed reader as a pass.
 */
export async function resetVoiceOverRunner(options={}){
 const {env=process.env,platform=process.platform,uid=process.getuid?.(),run=execFileSync,kill=process.kill,
  wait=ms=>new Promise(resolve=>setTimeout(resolve,ms)),now=Date.now}=options;
 if(platform!=="darwin"||env.GITHUB_ACTIONS!=="true"||env.GITHUB_REPOSITORY!=="viniciussucupira/marktmorgen"||
    env.AX2_PUBLIC_DISPOSABLE_RUNNER!=="true"||!Number.isSafeInteger(uid)||uid<0)
  throw Error("VoiceOver reset requires the owned disposable public macOS runner");
 const start=now();
 function command(file,args){
  if(now()-start>8000)throw Error("VoiceOver preflight exceeded its ceiling");
  return run(file,args,{encoding:"utf8",timeout:2000,stdio:["ignore","pipe","pipe"]});
 }
 function pids(){
  let output;
  try{output=command("/usr/bin/pgrep",["-x","VoiceOver"]);}
  catch(error){if(error.status===1&&error.signal==null)return [];throw error;}
  const result=output.trim().split(/\s+/).map(Number);
  if(result.length>8||result.some(pid=>!Number.isSafeInteger(pid)||pid<=1)||new Set(result).size!==result.length)
   throw Error("VoiceOver process inventory is unknown");
  return result;
 }
 function owned(pid){
  const line=command("/bin/ps",["-p",String(pid),"-o","uid=","-o","stat=","-o","comm="]).trim();
  const match=/^(\d+)\s+([A-Za-z+<>=-]{1,16})\s+(.+)$/.exec(line);
  if(!match||Number(match[1])!==uid||match[3]!==EXECUTABLE)
   throw Error("Refusing VoiceOver reset outside the runner user and exact Apple executable");
  return {pid,state:match[2],zombie:match[2].startsWith("Z")};
 }
 const found=pids();
 // A verified zombie has exited and cannot speak or handle events; it is not a live reader.
 // Keep it in the identity inventory, never signal it, and never treat an unknown state as stopped.
 const initial=found.map(owned);
 for(const process of initial)if(!process.zombie){
  if(!owned(process.pid).zombie)kill(process.pid,"SIGTERM");
 }
 if(initial.some(process=>!process.zombie))await wait(250);
 const remaining=pids().map(pid=>{
  if(!found.includes(pid))throw Error("VoiceOver process changed during runner preflight");
  return owned(pid);
 });
 let forced=0;
 for(const process of remaining)if(!process.zombie){
  if(!owned(process.pid).zombie){kill(process.pid,"SIGKILL");forced++;}
 }
 let observed=[];
 for(let attempt=0;attempt<20;attempt++){
  observed=pids().map(pid=>{
   if(!found.includes(pid))throw Error("VoiceOver process changed during runner preflight");
   return owned(pid);
  });
  if(observed.every(process=>process.zombie))
   return {initialProcesses:found.length,forcedProcesses:forced};
  await wait(100);
 }
 throw Error("VoiceOver runner preflight did not prove a stopped reader: "+
  JSON.stringify(observed.map(({pid,state})=>({pid,state}))));
}
