import {createRequire} from "node:module";
import {spawn} from "node:child_process";
import {readFileSync,mkdtempSync,rmSync} from "node:fs";
import {tmpdir} from "node:os";
import {build} from "esbuild";
import {startServices} from "./services.mjs";
import {resolve,join} from "node:path";
const root=resolve(".");
const require=createRequire(join(root,"package.json"));
const engine=process.env.E2E_BROWSER??"chromium";
if(!["chromium","firefox","webkit"].includes(engine))throw Error("Unsupported engine "+engine);
const driver=require("playwright-core")[engine];
const axe=readFileSync(require.resolve("axe-core/axe.min.js"),"utf8");
const port=3197,origin="http://localhost:"+port;
const here=join(root,"tests/e2e"),FAKE="http://127.0.0.1:4497";
const env = {
  ...process.env,
  UPSTASH_REDIS_REST_URL: FAKE,
  UPSTASH_REDIS_REST_TOKEN: "local",
  RESEND_API_KEY: "re_local_only_a_stand_in",
  RESEND_API_BASE: FAKE,
  ANTHROPIC_API_KEY: "sk-ant-local_only_"+"x".repeat(30),
  ANTHROPIC_API_BASE: FAKE,
  STRIPE_DEMO_SECRET_KEY: "sk_test_local_only_a_stand_in",
  STRIPE_CONNECT_API_BASE: FAKE,
  NEXT_FONT_GOOGLE_MOCKED_RESPONSES: join(here, "google-fonts-mock.cjs"),
  E2E_FONT_ORIGIN: FAKE,
  NEXT_TELEMETRY_DISABLED: "1",
};

const services=await startServices(4497);
const folder=mkdtempSync(join(tmpdir(),"mm-studio-matrix-")),seedFile=join(folder,"seed.cjs");
let fixture;
try{
 await build({entryPoints:[join(here,"store-copy-seed.ts")],bundle:true,platform:"node",format:"cjs",outfile:seedFile,logLevel:"error",alias:{"@":root}});
 const seeded=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[seedFile],{cwd:root,env,stdio:["ignore","pipe","pipe"]});let data="";child.stdout.on("data",chunk=>data+=chunk);child.stderr.on("data",chunk=>data+=chunk);child.on("error",reject);child.on("close",code=>code===0?resolve(data):reject(Error("Synthetic seed failed")));});
 fixture=JSON.parse(seeded.trim().split("\n").at(-1)).activationFixture;
 if(!fixture?.session||!fixture?.sid)throw Error("Incomplete synthetic fixture");
}catch(error){await services.close();throw error;}finally{rmSync(folder,{recursive:true,force:true});}
const app=spawn(process.execPath,[join(root,"node_modules/next/dist/bin/next"),"start","-p",String(port)],{env,stdio:["ignore","pipe","pipe"]});
let output="";for(const stream of [app.stdout,app.stderr])stream.on("data",chunk=>{output=(output+chunk).slice(-6000);});
let browser,failed=0,cases=0;const gaps=[];
try{
 let up=false;for(let n=0;n<120;n++){if(app.exitCode!==null)throw Error(output);try{up=(await fetch(origin)).ok;}catch{}if(up)break;await new Promise(resolve=>setTimeout(resolve,500));}if(!up)throw Error("Local app unavailable "+output);
 browser=await driver.launch();console.log("PRODUCT_MATRIX_ENGINE:"+JSON.stringify({requested:engine,actual:driver.name(),version:browser.version()}));
 for(const path of ["/studio?store="+fixture.sid])for(const width of [320,390,768,1280,1920])for(const mode of ["baseline","text-spacing","reduced-motion","forced-colors","reflow-320"]){
  const viewportWidth=mode==="reflow-320"?320:width;
  const context=await browser.newContext({viewport:{width:viewportWidth,height:900},serviceWorkers:"block",reducedMotion:mode==="reduced-motion"?"reduce":"no-preference",forcedColors:mode==="forced-colors"?"active":"none"});
  if(mode==="text-spacing")await context.addInitScript(()=>document.addEventListener("DOMContentLoaded",()=>{const style=document.createElement("style");style.textContent="*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}";document.head.append(style);},{once:true}));
  await context.addCookies([{name:"nl_session",value:fixture.session,url:origin}]);
  let writes=0,foreign=0,localProductWrites=0,interceptedVisits=0;const errors=[],blockedWrites=[];
  try{
   const page=await context.newPage();page.on("pageerror",error=>errors.push(String(error)));
   await context.route("**/*",route=>{const r=route.request(),url=new URL(r.url());if(url.origin===origin&&url.pathname==="/api/store/hit"&&r.method()==="POST"){const input=r.postDataJSON();if(input?.h!=="activationonboarding"||input?.k!=="v"){writes++;blockedWrites.push({method:r.method(),path:url.pathname,handle:input?.h,kind:input?.k,bodyBytes:r.postData()?.length??0});return route.abort();}interceptedVisits++;return route.fulfill({status:204});}if(!["GET","HEAD"].includes(r.method())){if(url.origin===origin&&url.pathname==="/api/store/product"&&r.method()==="POST"&&["add","visibility"].includes(r.postDataJSON()?.action)){localProductWrites++;return route.continue();}writes++;blockedWrites.push({method:r.method(),path:url.pathname});return route.abort();}if(url.origin!==origin){foreign++;return route.abort();}return route.continue();});
   const response=await page.goto(origin+path,{waitUntil:"networkidle",timeout:60000});if(response.status()!==200)throw Error("HTTP "+response.status());
   if(new URL(page.url()).pathname.startsWith("/signin"))throw Error("Synthetic authenticated journey redirected to sign-in");
   if(!await page.locator("main").count())throw Error("Authenticated main missing");
   await page.getByRole("button",{name:"Add something to sell",exact:true}).click();
   const title="Synthetic matrix "+engine+" "+width+" "+mode;
   const form=page.locator("form").filter({has:page.locator("#product-title-new")});
   await page.locator("#product-title-new").fill(title);
   await page.locator("#product-summary-new").fill("Disposable local product; no real payment, email or delivery.");
   await page.locator("#product-price-new").fill("0");
   if(mode==="forced-colors"){
    const active=await page.evaluate(()=>matchMedia("(forced-colors: active)").matches);
    if(!active)gaps.push({path,width,mode,reason:"Engine did not activate forced-colors media after emulation request; real OS/device validation remains open."});
   }
   if(mode==="reduced-motion"&&!await page.evaluate(()=>matchMedia("(prefers-reduced-motion: reduce)").matches))throw Error("Reduced-motion request not honored");
   const overflow=await page.evaluate(()=>({scroll:document.documentElement.scrollWidth,client:document.documentElement.clientWidth,internalOverflow:[...document.querySelectorAll("body *")].filter(node=>node.clientWidth>0&&node.scrollWidth>node.clientWidth+1).slice(0,16).map(node=>({html:node.outerHTML.slice(0,300),scroll:node.scrollWidth,client:node.clientWidth,overflow:getComputedStyle(node).overflowX})),offenders:[...document.querySelectorAll("body *")].filter(node=>{const b=node.getBoundingClientRect();if(!(b.width>0&&(b.right>document.documentElement.clientWidth+1||b.left< -1)))return false;for(let parent=node.parentElement;parent&&parent!==document.documentElement;parent=parent.parentElement){if(["auto","scroll","hidden","clip"].includes(getComputedStyle(parent).overflowX))return false;}return true;}).slice(0,12).map(node=>({html:node.outerHTML.slice(0,400),left:node.getBoundingClientRect().left,right:node.getBoundingClientRect().right}))}));
   if(overflow.scroll>overflow.client)throw Error("Horizontal overflow "+JSON.stringify(overflow));
   // Actual keyboard events; no scripted focus or focus-style suppression.
   if(mode==="baseline"){
    let focused=0;
    for(let n=0;n<10;n++){
     await page.keyboard.press("Tab");
     const state=await page.evaluate(()=>{const node=document.activeElement;if(!node||node===document.body)return null;const b=node.getBoundingClientRect();return {tag:node.tagName,visible:node.matches(":focus-visible"),width:b.width,height:b.height};});
     if(state){focused++;if(!state.visible||state.width<=0||state.height<=0)throw Error("Keyboard focus not visible "+JSON.stringify(state));}
    }
    if(!focused)throw Error("No keyboard target reached");
   }
   await page.addScriptTag({content:axe});
   const report=await page.evaluate(async()=>{
    const tags=["wcag2a","wcag2aa","wcag2aaa","wcag21a","wcag21aa","wcag21aaa","wcag22a","wcag22aa","wcag22aaa"];
    const selected=window.axe.getRules().filter(rule=>rule.tags.some(tag=>tags.includes(tag)));
    if(!selected.some(rule=>rule.ruleId==="color-contrast-enhanced"))throw Error("AAA enhanced-contrast rule missing");
    const result=await window.axe.run(document,{runOnly:{type:"tag",values:tags}});
    return {rules:selected.map(rule=>rule.ruleId),violations:result.violations.map(rule=>({id:rule.id,targets:rule.nodes.map(node=>node.target),nodes:rule.nodes.map(node=>({target:node.target,html:node.html.slice(0,600),summary:node.failureSummary}))})),incomplete:result.incomplete.map(rule=>({id:rule.id,targets:rule.nodes.map(node=>node.target)}))};
   });
   if(report.incomplete.length)gaps.push({path,width,mode,manualReview:report.incomplete});
   console.log("PRODUCT_MATRIX_CASE:"+JSON.stringify({engine,path,width,mode,viewportWidth,writes,foreign,...report,errors}));
   if(report.violations.length||errors.length||writes)failed++;
   // Only the real disposable local product API is allowed to mutate.
   let expectedWrites=1;
   await form.getByRole("button",{name:"Add it",exact:true}).focus();
   const creationRefresh=page.waitForResponse(response=>new URL(response.url()).pathname==="/studio"&&response.request().headers()["rsc"]==="1"&&!response.request().headers()["next-router-prefetch"]);creationRefresh.catch(()=>{});
   const creation=page.waitForResponse(response=>new URL(response.url()).pathname==="/api/store/product"&&response.request().method()==="POST");
   await page.keyboard.press("Enter");
   const created=await creation,creationData=await created.json();if(!created.ok()||creationData.ok!==true||!creationData.product||creationData.product.title!==title||!/^[a-z0-9]+$/.test(creationData.product.id))throw Error("Local product creation refused");
   const createdId=creationData.product.id;
   await page.locator(".nb-toast-region [role=status]").getByText("Product added.",{exact:true}).waitFor({state:"attached"});
   const createdRefresh=await creationRefresh;if(!createdRefresh.ok()||await createdRefresh.finished())throw Error("Create RSC refresh failed");
   await page.waitForLoadState("networkidle");
   await page.reload({waitUntil:"networkidle"});
   const row=page.locator("#products li").filter({has:page.locator('button[aria-controls="product-panel-'+createdId+'"]')});
   if(await row.count()!==1)throw Error("Created product row is not unique");
   await row.waitFor();
   async function visibility(button,hidden){
    const refreshed=page.waitForResponse(response=>new URL(response.url()).pathname==="/studio"&&response.request().headers()["rsc"]==="1"&&!response.request().headers()["next-router-prefetch"]);refreshed.catch(()=>{});
    const reply=page.waitForResponse(response=>new URL(response.url()).pathname==="/api/store/product"&&response.request().method()==="POST"&&response.request().postDataJSON()?.action==="visibility");
    await button.focus();await page.keyboard.press("Enter");
    const response=await reply,data=await response.json();
    if(response.request().postDataJSON()?.id!==createdId||!response.ok()||data.ok!==true||!data.product||data.product.id!==createdId||Boolean(data.product.hidden)!==hidden)throw Error("Local visibility refused "+JSON.stringify({status:response.status(),data}));
    const refresh=await refreshed;if(!refresh.ok()||await refresh.finished())throw Error("Visibility RSC refresh failed");
    const flight=await refresh.text();const savedAt=flight.indexOf('"id":"'+data.product.id+'"');console.log("PRODUCT_VISIBILITY_RESPONSE:"+JSON.stringify({engine,width,mode,hidden,url:refresh.url(),productFragment:savedAt<0?"not found":flight.slice(savedAt,savedAt+1600)}));
    await page.waitForLoadState("networkidle");
    console.log("PRODUCT_VISIBILITY_RENDER:"+JSON.stringify({engine,width,mode,hidden,buttons:await row.getByRole("button").allTextContents()}));
   }
   if(await row.getByRole("button",{name:"Unpublish",exact:true}).count()){
    await visibility(row.getByRole("button",{name:"Unpublish",exact:true}),true);expectedWrites++;
    await row.getByRole("button",{name:"Publish it",exact:true}).waitFor();
    await page.waitForLoadState("networkidle");
   }
   await visibility(row.getByRole("button",{name:"Publish it",exact:true}),false);expectedWrites++;
   await row.getByRole("button",{name:"Unpublish",exact:true}).waitFor();
   await page.waitForLoadState("networkidle");
   await page.goto(origin+"/@activationonboarding",{waitUntil:"networkidle"});
   if(!await page.getByText(title,{exact:true}).count())throw Error("Published local product absent from actual storefront");
   if(writes||foreign||localProductWrites!==expectedWrites||interceptedVisits!==1)throw Error("Unexpected operation count "+JSON.stringify({writes,foreign,localProductWrites,expectedWrites,interceptedVisits,blockedWrites}));
   console.log("PRODUCT_ACTION_PROOF:"+JSON.stringify({engine,width,mode,title,localProductWrites,expectedWrites,interceptedVisits,createdAndReloaded:true,explicitPublication:true,storefrontVisible:true,scope:"Disposable local fixture only; no checkout, email, delivery or real account."}));
  }catch(error){failed++;console.error("PRODUCT_MATRIX_FAILURE:"+JSON.stringify({engine,path,width,mode,error:String(error)}));}
  finally{cases++;await context.close();}
 }
 console.log("PRODUCT_MATRIX_OPEN_GAPS:"+JSON.stringify(gaps));
 console.log("PRODUCT_MATRIX_SUMMARY:"+JSON.stringify({engine,cases,failed,gaps:gaps.length,scope:"Product form and actual disposable local creation/reload/manual visibility/storefront proof only; no checkout or buyer-area action proof. Synthetic emulation; reflow320 is not real browser400% zoom. No real-device, assistive-user or whole-product AAA certification."}));
}finally{if(browser)await browser.close();app.kill("SIGTERM");await services.close();}
process.exitCode=failed?1:0;
