import {createRequire} from "node:module";
import {spawn} from "node:child_process";
import {resolve,join} from "node:path";
const appRoot=resolve(process.argv[2]??".");
const require=createRequire(join(appRoot,"package.json"));
const {chromium}=require("playwright-core");
const label=process.env.MOBILE_RENDER_LABEL??"candidate";
const version=process.env.MOBILE_RENDER_SHA??"unknown";
const port=3177,LOCAL="http://127.0.0.1:"+port;
const app=spawn(process.execPath,[join(appRoot,"node_modules/next/dist/bin/next"),"start","-p",String(port)],{cwd:appRoot,env:{...process.env,NEXT_TELEMETRY_DISABLED:"1"},stdio:["ignore","pipe","pipe"]});
let output="";app.stdout.on("data",data=>{output=(output+data).slice(-6000);});app.stderr.on("data",data=>{output=(output+data).slice(-6000);});
let browser;const results=[];let failed=false;
try{
 let ready=false;for(let attempt=0;attempt<120;attempt++){if(app.exitCode!==null)throw Error("Application exited: "+output);try{const reply=await fetch(LOCAL);if(reply.ok){ready=true;break;}}catch{}await new Promise(resolve=>setTimeout(resolve,500));}if(!ready)throw Error("Application unavailable: "+output);
 browser=await chromium.launch({channel:"chrome",headless:true});
 for(const path of ["/","/pricing","/platform/sales-pages"])for(let sample=1;sample<=3;sample++){
  const context=await browser.newContext({viewport:{width:390,height:844},deviceScaleFactor:1,isMobile:true,hasTouch:true});
  try{
   const page=await context.newPage();const cdp=await context.newCDPSession(page);
   await cdp.send("Emulation.setCPUThrottlingRate",{rate:4});await cdp.send("Network.enable");await cdp.send("Network.setCacheDisabled",{cacheDisabled:true});
   await cdp.send("Network.emulateNetworkConditions",{offline:false,latency:150,downloadThroughput:1600000/8,uploadThroughput:750000/8});
   let writes=0;await page.route("**/*",route=>{const request=route.request(),url=new URL(request.url());if(!["GET","HEAD"].includes(request.method())){writes++;return route.abort();}if(url.pathname.startsWith("/api/")||url.origin!==LOCAL)return route.abort();return route.continue();});
   await page.addInitScript(()=>{
    window.__renderLab={lcp:null,cls:0,lastShift:0,windowStart:0,windowScore:0,paint:[],events:[],shifts:[],longTasks:[]};
    new PerformanceObserver(list=>{for(const entry of list.getEntries())window.__renderLab.lcp=entry.startTime;}).observe({type:"largest-contentful-paint",buffered:true});
    new PerformanceObserver(list=>{const state=window.__renderLab;for(const entry of list.getEntries()){if(entry.hadRecentInput)continue;state.shifts.push({value:entry.value,at:entry.startTime,sources:(entry.sources??[]).map(source=>({node:source.node?.outerHTML?.slice(0,220),previous:source.previousRect,current:source.currentRect}))});if(!state.windowStart||entry.startTime-state.lastShift>1000||entry.startTime-state.windowStart>5000){state.windowStart=entry.startTime;state.windowScore=0;}state.lastShift=entry.startTime;state.windowScore+=entry.value;state.cls=Math.max(state.cls,state.windowScore);}}).observe({type:"layout-shift",buffered:true});
    if(PerformanceObserver.supportedEntryTypes.includes("event"))new PerformanceObserver(list=>{for(const entry of list.getEntries())if(entry.interactionId)window.__renderLab.events.push({id:entry.interactionId,duration:entry.duration,name:entry.name,startTime:entry.startTime,processingStart:entry.processingStart,processingEnd:entry.processingEnd});}).observe({type:"event",buffered:true,durationThreshold:16});
    if(PerformanceObserver.supportedEntryTypes.includes("longtask"))new PerformanceObserver(list=>{for(const entry of list.getEntries())window.__renderLab.longTasks.push({startTime:entry.startTime,duration:entry.duration});}).observe({type:"longtask",buffered:true});
    document.addEventListener("pointerdown",event=>{if(!event.isTrusted)return;const start=performance.now();requestAnimationFrame(()=>requestAnimationFrame(()=>window.__renderLab.paint.push(performance.now()-start)));},{capture:true});
   });
   const reply=await page.goto(LOCAL+path,{waitUntil:"load",timeout:60000});if(reply.status()!==200)throw Error("HTTP "+reply.status()+" "+path);
   await page.evaluate(()=>document.fonts.ready);
   await page.evaluate(async()=>{await Promise.all(document.getAnimations().filter(animation=>Number.isFinite(animation.effect?.getComputedTiming().iterations)).map(animation=>animation.finished.catch(()=>{})));});
   // Two rendering frames, not a claim that this represents a real-user percentile.
   await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
   const before=await page.evaluate(()=>({lcp:window.__renderLab.lcp,cls:window.__renderLab.cls,shifts:window.__renderLab.shifts}));
   const control=page.locator("main summary,main button[aria-expanded]").first();
   if(await control.count())for(let interaction=0;interaction<3;interaction++){await control.click();await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));}
   const interaction=await page.evaluate(()=>{const state=window.__renderLab;return {paint:state.paint,event:state.events,longTasks:state.longTasks};});
   const interactionMs=interaction.paint.length?Math.max(...interaction.paint,...interaction.event.map(item=>item.duration)):null;
   const result={label,version,path,sample,viewport:390,cpuSlowdown:4,latencyMs:150,downloadMbps:1.6,cache:"cold",thirdPartyRequests:"blocked",apiWrites:writes,lcpMs:before.lcp,cls:before.cls,interactionToPaintMs:interactionMs,eventTiming:interaction.event,longTasks:interaction.longTasks,fieldINP:null,layoutShiftSources:before.shifts};
   result.targets={lcp:typeof before.lcp==="number"&&before.lcp<2500,cls:before.cls<0.1,interaction:interactionMs!==null&&interactionMs<200};
   console.log("MOBILE_RENDER_MEASUREMENT:"+JSON.stringify(result));results.push(result);
   if(writes||!Number.isFinite(before.lcp)||!Number.isFinite(before.cls)||interactionMs===null)failed=true;
   if(label==="candidate"&&Object.values(result.targets).some(value=>!value))failed=true;
  }finally{await context.close();}
 }
 console.log("MOBILE_RENDER_SUMMARY:"+JSON.stringify({label,version,samples:results.length,scope:"Synthetic cold local Chromium lab. Interaction-to-paint is a lab proxy, not field INP; no p75 Core Web Vitals certification.",results}));
}catch(error){failed=true;console.error(error);console.error(output);}finally{await browser?.close();app.kill("SIGTERM");}
process.exitCode=failed?1:0;
