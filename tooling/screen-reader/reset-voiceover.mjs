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
  const line=command("/bin/ps",["-p",String(pid),"-o","uid=","-o","comm="]).trim();
  const match=/^(\d+)\s+(.+)$/.exec(line);
  if(!match||Number(match[1])!==uid||match[2]!==EXECUTABLE)
   throw Error("Refusing VoiceOver reset outside the runner user and exact Apple executable");
 }
 const found=pids();
 // Validate the entire bounded inventory before sending any signal.
 for(const pid of found)owned(pid);
 for(const pid of found){owned(pid);kill(pid,"SIGTERM");}
 if(found.length)await wait(250);
 const remaining=pids();
 for(const pid of remaining){
  if(!found.includes(pid))throw Error("VoiceOver process changed during runner preflight");
  owned(pid);
 }
 for(const pid of remaining){owned(pid);kill(pid,"SIGKILL");}
 for(let attempt=0;attempt<20;attempt++){
  if(pids().length===0)return {initialProcesses:found.length,forcedProcesses:remaining.length};
  await wait(100);
 }
 throw Error("VoiceOver runner preflight did not prove a stopped reader");
}
