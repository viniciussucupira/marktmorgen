import {spawn} from "node:child_process";
import {createInterface} from "node:readline";

// One hidden process is prepared BEFORE Chromium. Queries read Win32 state;
// they never activate a window, send a key or start another process.
const SCRIPT=`
$ErrorActionPreference = 'Stop'
[Console]::OutputEncoding = New-Object System.Text.UTF8Encoding($false)
Add-Type -TypeDefinition @'
using System;
using System.Text;
using System.Runtime.InteropServices;
public static class ForegroundSnapshot {
 [DllImport("user32.dll")] public static extern IntPtr GetForegroundWindow();
 [DllImport("user32.dll", CharSet=CharSet.Unicode)] public static extern int GetWindowText(IntPtr h, StringBuilder s, int n);
 public static string Read() { var s = new StringBuilder(1024); GetWindowText(GetForegroundWindow(), s, s.Capacity); return s.ToString(); }
}
'@
[Console]::WriteLine('{"ready":true}')
while ($null -ne ($line = [Console]::ReadLine())) {
 if ($line -notmatch '^[0-9]+$') { throw 'Invalid diagnostic request' }
 $reply = @{id=$line;title=[ForegroundSnapshot]::Read()} | ConvertTo-Json -Compress
 [Console]::WriteLine($reply)
}
`;

export async function startWindowsForegroundProbe(options={}){
 const {env=process.env,platform=process.platform,launch=spawn,timeoutMs=3000}=options;
 if(platform!=="win32"||env.GITHUB_ACTIONS!=="true"||env.GITHUB_REPOSITORY!=="viniciussucupira/marktmorgen"||env.AX2_PUBLIC_DISPOSABLE_RUNNER!=="true")
  throw Error("Native foreground diagnostics require the owned disposable Windows runner");
 const child=launch("powershell.exe",["-NoProfile","-NonInteractive","-EncodedCommand",Buffer.from(SCRIPT,"utf16le").toString("base64")],
  {windowsHide:true,stdio:["pipe","pipe","pipe"],env});
 let next=0,ended=false,closed=false,failure=null;
 const pending=new Map();
 const lines=createInterface({input:child.stdout});
 function fail(error){
  failure??=error;
  for(const entry of pending.values()){clearTimeout(entry.timer);entry.reject(failure);}
  pending.clear();
 }
 function waiting(id){
  return new Promise((resolve,reject)=>{
   const timer=setTimeout(()=>fail(Error("Native foreground diagnostic deadline exceeded")),timeoutMs);
   pending.set(id,{resolve,reject,timer});
  });
 }
 const ready=waiting("ready");
 lines.on("line",line=>{
  try{
   if(line.length>4096)throw Error("Oversized native foreground reply");
   const value=JSON.parse(line);
   const id=value?.ready===true&&Object.keys(value).length===1?"ready":value?.id;
   if(id!=="ready"&&(typeof id!=="string"||!/^[0-9]+$/.test(id)||typeof value.title!=="string"||value.title.length>1023||Object.keys(value).length!==2))throw Error("Malformed native foreground reply");
   const entry=pending.get(id);
   if(!entry)throw Error("Uncorrelated native foreground reply");
   pending.delete(id);clearTimeout(entry.timer);entry.resolve(id==="ready"?null:value.title);
  }catch(error){fail(error);}
 });
 child.stderr.on("data",()=>{}); // Drain only; never expose arbitrary process output.
 child.stdin.on("error",()=>fail(Error("Native foreground query write failed")));
 child.stdout.on("error",()=>fail(Error("Native foreground reply stream failed")));
 child.on("error",()=>fail(Error("Native foreground process failed")));
 child.on("exit",()=>{ended=true;fail(Error("Native foreground process exited"));});
 async function close(){
  if(closed)return;closed=true;
  fail(Error("Native foreground diagnostics closed"));
  child.stdin.end();
  try{
   if(!ended)await new Promise((resolve,reject)=>{
    const timer=setTimeout(()=>{if(!ended)child.kill();},250);
    const deadline=setTimeout(()=>reject(Error("Native foreground observer did not exit")),1000);
    child.once("exit",()=>{clearTimeout(timer);clearTimeout(deadline);resolve();});
   });
  }finally{lines.close();}
 }
 try{await ready;}catch(error){
  try{await close();}catch(cleanup){console.error("AX2_NVDA_NATIVE_FOREGROUND_CLEANUP_ERROR:"+String(cleanup));}
  throw error;
 }
 return {async read(){
  if(closed||ended||failure)throw failure??Error("Native foreground diagnostics unavailable");
  const id=String(next++),answer=waiting(id);
  child.stdin.write(id+"\n",error=>{if(error)fail(Error("Native foreground query write failed"));});
  return answer;
 },close};
}
