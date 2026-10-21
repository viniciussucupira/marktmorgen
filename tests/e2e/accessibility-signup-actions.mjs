import {createRequire} from "node:module";
import {spawn} from "node:child_process";
import {readFileSync} from "node:fs";
import {createServer} from "node:https";
import {request as httpRequest} from "node:http";
import {resolve,join} from "node:path";
import {startServices} from "./services.mjs";
const root=resolve("."),require=createRequire(join(root,"package.json"));
const engine=process.env.E2E_BROWSER??"chromium";
if(!["chromium","firefox","webkit"].includes(engine))throw Error("Unsupported browser");
const driver=require("playwright-core")[engine],axe=readFileSync(require.resolve("axe-core/axe.min.js"),"utf8");
const port=3198,upstream="http://localhost:"+port,origin="https://localhost:3199",here=join(root,"tests/e2e"),FAKE="http://127.0.0.1:4498";
const env = {
  ...process.env,
  VERCEL:"0",
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
if(!process.env.SIGNUP_TLS_KEY||!process.env.SIGNUP_TLS_CERT)throw Error("Disposable local TLS certificate required");
const proxy=createServer({key:readFileSync(process.env.SIGNUP_TLS_KEY),cert:readFileSync(process.env.SIGNUP_TLS_CERT)},(incoming,outgoing)=>{
 const forwarded=httpRequest(upstream+incoming.url,{method:incoming.method,headers:{...incoming.headers,host:"localhost:3199","x-forwarded-host":"localhost:3199","x-forwarded-proto":"https"}},response=>{
  outgoing.writeHead(response.statusCode??502,response.headers);response.pipe(outgoing);
 });
 forwarded.on("error",()=>{if(!outgoing.headersSent)outgoing.writeHead(502);outgoing.end();});
 incoming.on("aborted",()=>forwarded.destroy());
 incoming.pipe(forwarded);
});
const services=await startServices(4498);
const app=spawn(process.execPath,[join(root,"node_modules/next/dist/bin/next"),"start","-p",String(port)],{env,stdio:["ignore","pipe","pipe"]});
let output="";for(const stream of [app.stdout,app.stderr])stream.on("data",chunk=>output=(output+chunk).slice(-6000));
let browser,cases=0,failed=0,audits=0;const gaps=[];
try{
 await new Promise((resolve,reject)=>{proxy.once("error",reject);proxy.listen(3199,"localhost",resolve);});
 let up=false;for(let n=0;n<120;n++){if(app.exitCode!==null)throw Error("Local app exited");try{up=(await fetch(upstream)).ok;}catch{}if(up)break;await new Promise(r=>setTimeout(r,500));}
 if(!up)throw Error("Local app did not start");
 browser=await driver.launch();console.log("SIGNUP_MATRIX_ENGINE:"+JSON.stringify({requested:engine,actual:driver.name(),version:browser.version()}));
 for(const width of [320,390,768,1280,1920])for(const mode of ["baseline","text-spacing","reduced-motion","forced-colors","reflow-320"]){
  const index=cases+1,viewportWidth=mode==="reflow-320"?320:width;
  const context=await browser.newContext({ignoreHTTPSErrors:true,viewport:{width:viewportWidth,height:900},serviceWorkers:"block",reducedMotion:mode==="reduced-motion"?"reduce":"no-preference",forcedColors:mode==="forced-colors"?"active":"none",extraHTTPHeaders:{"x-forwarded-for":"192.0.2."+index}});
  let phase="open",foreign=0;const mutations=[],errors=[];const inbox="matrix-"+engine+"-"+index+"@example.test",before=services.emails().length;
  try{
   if(mode==="text-spacing")await context.addInitScript(()=>document.addEventListener("DOMContentLoaded",()=>{const style=document.createElement("style");style.textContent="*{line-height:1.5!important;letter-spacing:.12em!important;word-spacing:.16em!important}p{margin-bottom:2em!important}";document.head.append(style);},{once:true}));
   const page=await context.newPage();page.setDefaultTimeout(30000);page.setDefaultNavigationTimeout(60000);
   page.on("pageerror",error=>errors.push(String(error).replace(/token=[^&\s"']+/g,"token=redacted")));
   await context.route("**/*",route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.origin!==origin){foreign++;return route.abort();}
    if(!["GET","HEAD"].includes(request.method())){
     mutations.push({method:request.method(),path:url.pathname});
     if(request.method()!=="POST"||!["/api/auth/request","/api/auth/callback"].includes(url.pathname))return route.abort();
    }
    return route.continue();
   });
   async function audit(state){
    await page.waitForLoadState("networkidle");
    await page.evaluate(()=>{document.activeElement?.blur?.();window.scrollTo({top:0,left:0,behavior:"instant"});});
    await page.waitForFunction(()=>scrollX===0&&scrollY===0);
    await page.addScriptTag({content:axe});
    const result=await page.evaluate(async()=>{
     const root=document.documentElement,result=await window.axe.run(document,{rules:{"color-contrast-enhanced":{enabled:true}}});
     return {scroll:root.scrollWidth,client:root.clientWidth,rules:result.passes.map(r=>r.id),
      violations:result.violations.map(r=>({id:r.id,targets:r.nodes.map(n=>n.target)})),
      incomplete:result.incomplete.map(r=>({id:r.id,targets:r.nodes.map(n=>n.target)}))};
    });
    audits++;console.log("SIGNUP_MATRIX_AUDIT:"+JSON.stringify({engine,width,mode,state,...result}));
    if(result.scroll>result.client||result.violations.length)throw Error("Accessibility/overflow failure at "+state);
    if(result.incomplete.length)gaps.push({width,mode,state,manualReview:result.incomplete});
   }
   const response=await page.goto(origin+"/signin",{waitUntil:"networkidle"});if(response.status()!==200)throw Error("Signup document failed");
   if(await page.locator('input[type="password"],input[autocomplete^="cc-"]').count())throw Error("Unexpected password/card field");
   await audit("signup-form");
   if(mode==="baseline"){
    await page.keyboard.press("Tab");
    if(!await page.evaluate(()=>document.activeElement!==document.body))throw Error("Native keyboard focus missing");
   }
   const field=page.getByLabel("Your email",{exact:true});await field.fill(inbox);
   const reply=page.waitForResponse(r=>new URL(r.url()).pathname==="/api/auth/request"&&r.request().method()==="POST");
   phase="submit-access";await page.getByRole("button",{name:"Email me a link",exact:true}).focus();await page.keyboard.press("Enter");
   const requested=await reply;if(!requested.ok()||(await requested.json()).ok!==true)throw Error("Real local access request refused");
   await page.getByText("Check that inbox",{exact:true}).waitFor();
   const mail=services.emails().slice(before).filter(m=>[m.to].flat().includes(inbox));
   if(mail.length!==1)throw Error("Expected exactly one captured local sign-in email");
   const match=String(mail[0].text??"").match(/https?:\/\/[^\s<>"]+\/signin\/confirm\?token=[0-9a-f]{64}/);
   if(!match)throw Error("Captured confirmation link missing");
   const confirmation=new URL(match[0]);if(confirmation.origin!==origin)throw Error("Confirmation escaped synthetic origin");
   phase="confirmation";await page.goto(confirmation.href,{waitUntil:"networkidle"});
   if((await context.cookies()).some(c=>c.name==="nl_session"))throw Error("Reading confirmation spent token or opened session");
   await audit("confirmation-before-tap");
   const signed=page.waitForResponse(r=>new URL(r.url()).pathname==="/api/auth/callback"&&r.request().method()==="POST");
   await page.getByRole("button",{name:"Log me in",exact:true}).focus();await page.keyboard.press("Enter");
   const callback=await signed;if(callback.status()!==303)throw Error("Confirmation did not redirect safely");
   await page.waitForURL(url=>url.pathname==="/studio");await page.waitForLoadState("networkidle");
   if(!(await context.cookies()).some(c=>c.name==="nl_session"&&c.secure&&c.httpOnly&&c.sameSite==="Lax"))throw Error("Local authenticated session missing");
   phase="empty-studio";await audit("authenticated-first-setup");
   if(foreign||errors.length||mutations.length!==2||mutations[0].path!=="/api/auth/request"||mutations[1].path!=="/api/auth/callback")throw Error("Unexpected operation or page error "+JSON.stringify({foreign,errors,mutations}));
   gaps.push({width,mode,reason:"Synthetic disposable local inbox/session only; no real email/account, physical device, assistive user or actual browser400% zoom. Production BotID behavior and manual sticky-scroll review remain open."});
   console.log("SIGNUP_ACTION_PROOF:"+JSON.stringify({engine,width,mode,actualLocalRequest:true,capturedEmails:mail.length,confirmationGetDidNotSignIn:true,explicitConfirmation:true,authenticatedFirstSetup:true,foreign,mutations}));
  }catch(error){failed++;console.error("SIGNUP_MATRIX_FAILURE:"+JSON.stringify({engine,width,mode,phase,error:String(error).replace(/token=[^&\s"']+/g,"token=redacted")}));}
  finally{cases++;await context.close();}
 }
 console.log("SIGNUP_MATRIX_OPEN_GAPS:"+JSON.stringify(gaps));
 console.log("SIGNUP_MATRIX_SUMMARY:"+JSON.stringify({engine,cases,audits,failed,scope:"Real local request/captured fake email/explicit confirmation/new empty authenticated studio. Synthetic services only; no production signup, payment, store publication, checkout or buyer proof."}));
}finally{if(browser)await browser.close();app.kill("SIGTERM");proxy.closeAllConnections();await new Promise(r=>proxy.close(r));await services.close();}
process.exitCode=failed?1:0;
