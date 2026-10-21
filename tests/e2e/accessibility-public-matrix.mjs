import {createRequire} from "node:module";
import {spawn} from "node:child_process";
import {readFileSync} from "node:fs";
import {resolve,join} from "node:path";
const root=resolve(".");
const require=createRequire(join(root,"package.json"));
const engine=process.env.E2E_BROWSER??"chromium";
if(!["chromium","firefox","webkit"].includes(engine))throw Error("Unsupported engine "+engine);
const driver=require("playwright-core")[engine];
const axe=readFileSync(require.resolve("axe-core/axe.min.js"),"utf8");
const port=3193,origin="http://127.0.0.1:"+port;
const app=spawn(process.execPath,[join(root,"node_modules/next/dist/bin/next"),"start","-p",String(port)],{env:{...process.env,NEXT_TELEMETRY_DISABLED:"1"},stdio:["ignore","pipe","pipe"]});
let output="";for(const stream of [app.stdout,app.stderr])stream.on("data",chunk=>{output=(output+chunk).slice(-6000);});
let browser,failed=0,cases=0;const gaps=[];
try{
 let up=false;for(let n=0;n<120;n++){if(app.exitCode!==null)throw Error(output);try{up=(await fetch(origin)).ok;}catch{}if(up)break;await new Promise(resolve=>setTimeout(resolve,500));}if(!up)throw Error("Local app unavailable "+output);
 browser=await driver.launch();console.log("PUBLIC_MATRIX_ENGINE:"+JSON.stringify({requested:engine,actual:driver.name(),version:browser.version()}));
 for(const path of ["/","/pricing","/signin"])for(const width of [320,390,768,1280,1920])for(const mode of ["baseline","text-spacing","reduced-motion","forced-colors","reflow-320"]){
  const viewportWidth=mode==="reflow-320"?320:width;
  const context=await browser.newContext({viewport:{width:viewportWidth,height:900},serviceWorkers:"block",reducedMotion:mode==="reduced-motion"?"reduce":"no-preference",forcedColors:mode==="forced-colors"?"active":"none"});
  let writes=0,foreign=0;const errors=[];
  try{
   const page=await context.newPage();page.on("pageerror",error=>errors.push(String(error)));
   await context.route("**/*",route=>{const r=route.request(),url=new URL(r.url());if(!["GET","HEAD"].includes(r.method())){writes++;return route.abort();}if(url.origin!==origin){foreign++;return route.abort();}return route.continue();});
   const response=await page.goto(origin+path,{waitUntil:"networkidle",timeout:60000});if(response.status()!==200)throw Error("HTTP "+response.status());
   if(mode==="text-spacing")await page.addStyleTag({content:"*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}"});
   if(mode==="forced-colors"){
    const active=await page.evaluate(()=>matchMedia("(forced-colors: active)").matches);
    if(!active)gaps.push({path,width,mode,reason:"Engine did not activate forced-colors media after emulation request; real OS/device validation remains open."});
   }
   if(mode==="reduced-motion"&&!await page.evaluate(()=>matchMedia("(prefers-reduced-motion: reduce)").matches))throw Error("Reduced-motion request not honored");
   const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,offenders:[...document.querySelectorAll("main *")].filter(node=>{const b=node.getBoundingClientRect();return b.width>0&&(b.right>document.documentElement.clientWidth+1||b.left< -1);}).slice(0,8).map(node=>({html:node.outerHTML.slice(0,220),left:node.getBoundingClientRect().left,right:node.getBoundingClientRect().right}))}));
   if(overflow.scroll>overflow.client)throw Error("Horizontal overflow "+JSON.stringify(overflow));
   // Actual keyboard events; no scripted focus or focus-style suppression.
   if(mode==="baseline"){
    let focused=0;
    for(let n=0;n<10;n++){
     await page.keyboard.press("Tab");
     const state=await page.evaluate(()=>{const node=document.activeElement;if(!node||node===document.body)return null;const b=node.getBoundingClientRect();return {tag:node.tagName,visible:node.matches(":focus-visible"),width:b.width,height:b.height};});
     if(state){
      focused++;if(!state.visible||state.width<=0||state.height<=0)throw Error("Keyboard focus not visible "+JSON.stringify(state));
      try{
       await page.waitForFunction(()=>{
        const node=document.activeElement;if(!node||node===document.body)return false;
        // An inline link can occupy several lines: the center of its union
        // box may be empty space. Check every actual rendered fragment.
        const rects=[...node.getClientRects()].filter(r=>r.width>0&&r.height>0);
        return rects.length>0&&rects.every(r=>{
         const x=r.left+r.width/2,y=r.top+r.height/2;
         if(x<0||x>=innerWidth||y<0||y>=innerHeight)return false;
         const hit=document.elementFromPoint(x,y);return Boolean(hit&&(hit===node||node.contains(hit)));
        });
       },undefined,{timeout:5000});
      }catch(error){
       console.error("PUBLIC_FOCUS_DIAGNOSTIC:"+JSON.stringify({engine,path,width,tab:n+1,...await page.evaluate(()=>{
        const node=document.activeElement;if(!node)return {};
        return {tag:node.tagName,classes:typeof node.className==="string"?node.className:"",scrollY,
         fragments:[...node.getClientRects()].map(r=>{const x=r.left+r.width/2,y=r.top+r.height/2,hit=document.elementFromPoint(x,y);return {left:r.left,top:r.top,width:r.width,height:r.height,hitTag:hit?.tagName,hitClasses:typeof hit?.className==="string"?hit.className:"",inside:Boolean(hit&&(hit===node||node.contains(hit)))};})};
       })}));throw error;
      }
     }
    }
    if(!focused)throw Error("No keyboard target reached");
   }
   // Keyboard proof above retains its real scrolled positions. Whole-document
   // target geometry is evaluated at a stable origin, like the Studio/action matrices.
   // Native focus may still be animating a smooth scroll in Chromium.
   // Wait for the real keyboard scroll to finish before requesting audit origin.
   await page.evaluate(()=>{document.activeElement?.blur?.();});
   await page.waitForFunction(()=>{
    const key=scrollX+","+scrollY,previous=window.__publicKeyboardScroll;
    if(!previous||previous.key!==key){window.__publicKeyboardScroll={key,since:performance.now()};return false;}
    return performance.now()-previous.since>=200;
   },undefined,{timeout:10000});
   await page.evaluate(()=>{delete window.__publicKeyboardScroll;window.scrollTo({top:0,left:0,behavior:"instant"});});
   await page.waitForFunction(()=>{
    if(scrollX!==0||scrollY!==0){delete window.__publicOriginSince;return false;}
    window.__publicOriginSince??=performance.now();return performance.now()-window.__publicOriginSince>=200;
   },undefined,{timeout:10000});
   await page.evaluate(()=>{delete window.__publicOriginSince;});
   await page.addScriptTag({content:axe});
   const report=await page.evaluate(async()=>{
    const tags=["wcag2a","wcag2aa","wcag2aaa","wcag21a","wcag21aa","wcag21aaa","wcag22a","wcag22aa","wcag22aaa"];
    const selected=window.axe.getRules().filter(rule=>rule.tags.some(tag=>tags.includes(tag)));
    if(!selected.some(rule=>rule.ruleId==="color-contrast-enhanced"))throw Error("AAA enhanced-contrast rule missing");
    const result=await window.axe.run(document,{runOnly:{type:"tag",values:tags}});
    return {rules:selected.map(rule=>rule.ruleId),violations:result.violations.map(rule=>({id:rule.id,targets:rule.nodes.map(node=>node.target)})),incomplete:result.incomplete.map(rule=>({id:rule.id,targets:rule.nodes.map(node=>node.target)}))};
   });
   if(report.incomplete.length)gaps.push({path,width,mode,manualReview:report.incomplete});
   console.log("PUBLIC_MATRIX_CASE:"+JSON.stringify({engine,path,width,mode,viewportWidth,writes,foreign,...report,errors}));
   if(report.violations.length||errors.length||writes)failed++;
  }catch(error){failed++;console.error("PUBLIC_MATRIX_FAILURE:"+JSON.stringify({engine,path,width,mode,error:String(error)}));}
  finally{cases++;await context.close();}
 }
 console.log("PUBLIC_MATRIX_OPEN_GAPS:"+JSON.stringify(gaps));
 console.log("PUBLIC_MATRIX_SUMMARY:"+JSON.stringify({engine,cases,failed,gaps:gaps.length,scope:"Three public entry journeys only. Synthetic emulation; reflow320 is not real browser400% zoom. No real-device, assistive-user or whole-product AAA certification."}));
}finally{if(browser)await browser.close();app.kill("SIGTERM");}
process.exitCode=failed?1:0;
