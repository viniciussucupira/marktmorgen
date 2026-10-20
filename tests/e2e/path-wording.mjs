/** Explicit monetary refusal is real API behavior; accepted/forged replies below test only client validation. */
export async function checkPathWording({browser,LOCAL,services,session,sid,trialSession,trialSid,axeSource,is}){
 const source="Write your store's name the way you want people to say it.";
 const text="Write your store's name as you want people to say it.";
 const month=new Date().toISOString().slice(0,7);
 await services.redis([["SET","nl:ai-spend:v2:{"+month+"}","synthetic-unavailable-ledger"]]);
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 try{
  await context.addCookies([{name:"nl_session",value:session,url:LOCAL}]);
  const page=await context.newPage(),errors=[];page.on("pageerror",error=>errors.push(String(error)));
  let calls=0;page.on("request",request=>{if(request.method()==="POST"&&request.url().includes("/api/store/path"))calls++;});
  const url=LOCAL+"/studio/path?store="+sid,endpoint="/api/store/path?store="+sid;
  await page.goto(url,{waitUntil:"domcontentloaded",timeout:60000});
  const region=page.locator('aside[aria-labelledby="path-wording-title"]');
  await region.getByRole("button",{name:"Try AI wording",exact:true}).waitFor();
  is("wording never starts on page open",calls,0);
  const before=await page.request.get(LOCAL+endpoint).then(response=>response.json());
  const modelBefore=services.writing().length;
  const response=page.waitForResponse(reply=>reply.request().method()==="POST"&&reply.url().includes("/api/store/path"));
  await region.getByRole("button",{name:"Try AI wording",exact:true}).click();
  const actual=await response;
  is("funding refusal has private response",actual.headers()["cache-control"],"no-store");
  const actualBody=await actual.json();
  is("funding refusal retains original",actualBody.text,source);
  is("funding refusal is fixed fallback",actualBody.fallback,true);
  await region.getByText("Fixed wording",{exact:true}).waitFor();
  is("refused monetary ledger makes no provider call",services.writing().length,modelBefore);
  const after=await page.request.get(LOCAL+endpoint).then(reply=>reply.json());
  is("wording never mutates private Path records",after,before);
  let fakeCalls=0;
  await page.route("**/api/store/path?store="+sid,async route=>{
   if(route.request().method()!=="POST"){await route.continue();return;}
   fakeCalls++;
   await new Promise(resolve=>setTimeout(resolve,150));
   await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({ok:true,mission:"title",source,text,fallback:false,left:39})});
  });
  for(const width of [390,1280]){
   await page.setViewportSize({width,height:900});await page.goto(url,{waitUntil:"domcontentloaded",timeout:60000});
   const button=region.getByRole("button",{name:"Try AI wording",exact:true});
   // React installs this public DOM click handler during hydration. An SSR-visible
   // button can precede it; pressing Enter then sends no request.
   await page.waitForFunction(element=>typeof element.onclick==="function",await button.elementHandle(),{timeout:10000});
   const acceptedReply=page.waitForResponse(reply=>reply.request().method()==="POST"&&reply.url().includes(endpoint));
   await button.focus();await page.keyboard.press("Enter");
   await acceptedReply;
   await region.getByText("AI wording suggestion",{exact:true}).waitFor();
   is("validated synthetic client wording at "+width,await region.getByText(text,{exact:true}).isVisible(),true);
   is("original instruction remains at "+width,await page.getByText(source,{exact:true}).count()>=1,true);
   is("no private free text in AI region at "+width,/Private skill|Private topic|700000/.test(await region.innerText()),false);
   is("wording fits at "+width,await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),0);
   await page.addScriptTag({content:axeSource});
   const violations=await page.evaluate(async()=>{const report=await window.axe.run(document.querySelector('aside[aria-labelledby="path-wording-title"]'),{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"]}});return report.violations.map(rule=>({id:rule.id,targets:rule.nodes.map(node=>node.target)}));});
   is("wording accessibility at "+width,violations,[]);
  }
  is("one explicit request per keyboard activation",fakeCalls,2);
  is("wording page errors",errors,[]);
 }finally{await context.close();}
 const trial=await browser.newContext();
 try{
  await trial.addCookies([{name:"nl_session",value:trialSession,url:LOCAL}]);const page=await trial.newPage();
  await page.goto(LOCAL+"/studio/path?store="+trialSid,{waitUntil:"domcontentloaded",timeout:60000});
  is("trial has no optional AI button",await page.getByRole("button",{name:"Try AI wording",exact:true}).count(),0);
  const modelBefore=services.writing().length;
  const reply=await page.request.post(LOCAL+"/api/store/path?store="+trialSid,{headers:{Origin:LOCAL,"Content-Type":"application/json"},data:{action:"wording",mission:"title"}});
  const data=await reply.json();
  is("direct trial request is fixed only",data.fallback,true);
  is("trial request never reaches model",services.writing().length,modelBefore);
 }finally{await trial.close();}
}
