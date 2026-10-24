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
const port=3196,origin="http://localhost:"+port;
const here=join(root,"tests/e2e"),FAKE="http://127.0.0.1:4496";
const env = {
  ...process.env,
  STRIPE_SECRET_KEY:"sk_test_local_only_a_stand_in_0000",
  ADS_API_BASE:FAKE,
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


const services=await startServices(4496);
const folder=mkdtempSync(join(tmpdir(),"mm-buyer-matrix-")),seedFile=join(folder,"seed.cjs");
let ids;
try{
 await build({entryPoints:[join(here,"seed.ts")],bundle:true,platform:"node",format:"cjs",outfile:seedFile,logLevel:"error",alias:{"@":root}});
 const seeded=await new Promise((resolve,reject)=>{const child=spawn(process.execPath,[seedFile],{cwd:root,env,stdio:["ignore","pipe","pipe"]});let data="";child.stdout.on("data",chunk=>data+=chunk);child.on("error",reject);child.on("close",code=>code===0?resolve(data):reject(Error("Synthetic buyer seed failed")));});
 ids=JSON.parse(seeded.trim().split("\n").at(-1)).ids;
 if(!ids?.["Weeknight Dinners"])throw Error("Synthetic product missing");
}catch(error){await services.close();throw error;}finally{rmSync(folder,{recursive:true,force:true});}
const app=spawn(process.execPath,[join(root,"node_modules/next/dist/bin/next"),"start","-p",String(port)],{env,stdio:["ignore","pipe","pipe"]});
let output="";for(const stream of [app.stdout,app.stderr])stream.on("data",chunk=>output=(output+chunk).slice(-6000));
let browser,cases=0,audits=0,failed=0,libraryLink=null;const gaps=[];
const redact=value=>String(value).replace(/token=[^&\s"']+/g,"token=redacted");
const localLink=value=>String(value).replace("https://marktmorgen.com",origin);
try{
 let up=false;for(let n=0;n<120;n++){if(app.exitCode!==null)throw Error("Local app exited");try{up=(await fetch(origin)).ok;}catch{}if(up)break;await new Promise(r=>setTimeout(r,500));}
 if(!up)throw Error("Local app did not start");
 browser=await driver.launch();console.log("BUYER_MATRIX_ENGINE:"+JSON.stringify({requested:engine,actual:driver.name(),version:browser.version()}));
 for(const width of [320,390,768,1280,1920])for(const mode of ["baseline","text-spacing","reduced-motion","forced-colors","reflow-320",...(process.env.AX2_PUBLIC_STANDARD==="true"?["dark"]:[])]){
  const index=cases+1,viewportWidth=mode==="reflow-320"?320:width;
  const context=await browser.newContext({...(mode==="dark"?{colorScheme:"dark"}:{}),viewport:{width:viewportWidth,height:900},serviceWorkers:"block",reducedMotion:mode==="reduced-motion"?"reduce":"no-preference",forcedColors:mode==="forced-colors"?"active":"none",extraHTTPHeaders:{"x-forwarded-for":"192.0.2."+index,"sec-gpc":"1"}});
  let phase="open",foreign=0;const mutations=[],errors=[],beforeEmails=services.emails().length,beforeCheckouts=services.checkouts().length;let libraryRequested=false;
  try{
   await context.addInitScript(()=>{Object.defineProperty(navigator,"globalPrivacyControl",{value:true,configurable:true});});
   if(mode==="text-spacing")await context.addInitScript(()=>document.addEventListener("DOMContentLoaded",()=>{const style=document.createElement("style");style.textContent="*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}";document.head.append(style);},{once:true}));
   const page=await context.newPage();
   // Explicit page emulation avoids a Firefox page override masking context media.
   if(mode==="dark")await page.emulateMedia({colorScheme:"dark"});
   page.setDefaultTimeout(30000);page.setDefaultNavigationTimeout(60000);
   page.on("pageerror",error=>errors.push(redact(error)));
   await context.route("**/*",route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.origin!==origin&&url.origin!==FAKE){foreign++;return route.abort();}
    if(url.origin===origin&&request.method()==="POST"&&url.pathname==="/api/store/hit")return route.fulfill({status:204,body:""});
    if(!["GET","HEAD"].includes(request.method())){
     mutations.push({method:request.method(),path:url.pathname});
     if(url.origin!==origin||request.method()!=="POST"||!["/api/store/checkout","/api/library"].includes(url.pathname))return route.abort();
    }
    return route.continue();
   });
   async function audit(state){
    await page.waitForLoadState("networkidle");
    await page.evaluate(()=>{document.activeElement?.blur?.();window.scrollTo({top:0,left:0,behavior:"instant"});});
    await page.waitForFunction(()=>scrollX===0&&scrollY===0);
    if(mode==="dark"&&!await page.evaluate(()=>matchMedia("(prefers-color-scheme: dark)").matches))throw Error("Dark color-scheme request not honored");
   await page.addScriptTag({content:axe});
    const result=await page.evaluate(async()=>{
     const root=document.documentElement,result=await window.axe.run(document,{rules:{"color-contrast-enhanced":{enabled:true}}});
     return {scroll:root.scrollWidth,client:root.clientWidth,overflow:root.scrollWidth>root.clientWidth?[...document.querySelectorAll("main *")].filter(n=>{const r=n.getBoundingClientRect();return r.width>1&&r.height>1&&r.right>root.clientWidth+1;}).slice(0,12).map(n=>({tag:n.tagName,classes:typeof n.className==="string"?n.className:"",width:n.getBoundingClientRect().width,right:n.getBoundingClientRect().right,client:n.clientWidth,scroll:n.scrollWidth})):[],violations:result.violations.map(r=>({id:r.id,targets:r.nodes.map(n=>n.target)})),incomplete:result.incomplete.map(r=>({id:r.id,targets:r.nodes.map(n=>n.target)}))};
    });
    audits++;console.log("BUYER_MATRIX_AUDIT:"+JSON.stringify({engine,width,mode,state,...result}));
    if(result.scroll>result.client||result.violations.length)throw Error("Accessibility/overflow failure at "+state);
    if(result.incomplete.length)gaps.push({width,mode,state,manualReview:result.incomplete});
   }
   const response=await page.goto(origin+"/@localshop/p/"+ids["Weeknight Dinners"],{waitUntil:"networkidle"});
   if(response.status()!==200)throw Error("Synthetic product page failed");
   await audit("product-checkout-form");
   const buyForm=page.locator('#buy form[data-checkout]').first();
   const extras=buyForm.locator('input[name="bump"]');
   if(await extras.evaluateAll(nodes=>nodes.some(n=>n.checked)))throw Error("An extra was selected for the buyer");
   if(mode==="baseline"){await page.keyboard.press("Tab");if(!await page.evaluate(()=>document.activeElement!==document.body))throw Error("Native keyboard focus missing");}
   phase="checkout";const checkout=page.waitForResponse(r=>new URL(r.url()).pathname==="/api/store/checkout"&&r.request().method()==="POST");
   await buyForm.locator('button[type="submit"]').focus();await page.keyboard.press("Enter");await checkout;
   await page.waitForURL(url=>url.pathname==="/@localshop/thanks"&&url.searchParams.has("session_id"));await page.waitForLoadState("networkidle");
   const created=services.checkouts().slice(beforeCheckouts);
   if(created.length!==1||created[0].amount_total!==1900||created[0].metadata.product!==ids["Weeknight Dinners"])throw Error("Simulated checkout amount/product mismatch");
   phase="receipt";await audit("simulated-paid-receipt");
   if(!(await page.locator("main").innerText()).includes("Weeknight Dinners"))throw Error("Receipt did not hand over selected product");
   phase="library-request";await page.goto(origin+"/library",{waitUntil:"networkidle"});await audit("buyer-library-request");
   if(!libraryLink){
    const beforeLibrary=services.emails().length;
    await page.locator("#library-email").fill("buyer@example.com");
    await page.locator('form[action="/api/library"] button[type="submit"]').focus();
    await page.keyboard.press("Enter");await page.waitForURL(url=>url.pathname==="/library"&&url.searchParams.get("status")==="sent");
    const mail=services.emails().slice(beforeLibrary).filter(m=>[m.to].flat().includes("buyer@example.com")&&m.subject==="Your purchases on Marktmorgen");
    if(mail.length!==1)throw Error("Captured synthetic library email missing");
    const match=String(mail[0].text??"").match(/https?:\/\/\S+\/library\?token=[0-9a-f]{64}/);
    if(!match)throw Error("Captured library link missing");
    libraryLink=localLink(match[0]);if(new URL(libraryLink).origin!==origin)throw Error("Library link escaped local origin");
    libraryRequested=true;
   }
   phase="library-shelf";await page.goto(libraryLink,{waitUntil:"networkidle"});await audit("authenticated-buyer-library");
   const shelf=page.locator("[data-library-store='localshop']");if(await shelf.count()!==1)throw Error("Purchased store missing from buyer library");
   const purchases=await shelf.getByRole("link",{name:"Open your purchases",exact:true}).getAttribute("href");
   const orderLink=localLink(purchases??"");if(new URL(orderLink,origin).origin!==origin)throw Error("Orders escaped synthetic origin");
   phase="buyer-orders";await page.goto(new URL(orderLink,origin).href,{waitUntil:"networkidle"});await audit("buyer-orders");
   if(!(await page.locator("main").innerText()).includes("Weeknight Dinners"))throw Error("Purchased product missing in buyer area");
   const expected=libraryRequested?2:1;
   if(foreign||errors.length||mutations.length!==expected||mutations.filter(m=>m.path==="/api/store/checkout").length!==1)throw Error("Unexpected operation/page error "+JSON.stringify({foreign,errors,mutations}));
   gaps.push({width,mode,reason:"Local simulated paid return only; Stripe-hosted UI, real card/wallet, external delivery, actual400%zoom, physical devices/AT and manual sticky-scroll not proven. Library token from one real local fake-inbox request per engine is reused for remaining viewport cases."});
   console.log("BUYER_ACTION_PROOF:"+JSON.stringify({engine,width,mode,simulatedCheckout:true,amountCents:created[0].amount_total,productMatched:true,extrasOptedIn:false,capturedLocalEmails:services.emails().length-beforeEmails,libraryRequestThisCase:libraryRequested,buyerLibrary:true,buyerOrders:true,foreign,mutations}));
  }catch(error){failed++;console.error("BUYER_MATRIX_FAILURE:"+JSON.stringify({engine,width,mode,phase,error:redact(error)}));}
  finally{cases++;await context.close();}
 }
 console.log("BUYER_MATRIX_OPEN_GAPS:"+JSON.stringify(gaps));
 console.log("BUYER_MATRIX_SUMMARY:"+JSON.stringify({engine,cases,audits,failed,scope:"Real local app checkout against fake Stripe paid return; local captured inbox/library/orders. No real checkout/payment/provider/message/account or external download."}));
}finally{await browser?.close();app.kill("SIGTERM");await services.close();}
process.exitCode=failed?1:0;
