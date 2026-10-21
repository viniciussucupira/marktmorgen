/** Synthetic owner, real server persistence and native controls; no external services. */
export async function checkReturnPath({browser,LOCAL,session,sid,otherSid,axeSource,is}){
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 try{
  await context.addInitScript(()=>{
   window.__mmRscBodies=[];const original=window.fetch;
   window.fetch=async function(...args){
    const response=await original.apply(this,args);
    if(new URL(response.url).searchParams.has("_rsc")){
     const entry={url:response.url,done:false,bytes:0,error:null};window.__mmRscBodies.push(entry);
     response.clone().text().then(text=>{entry.bytes=text.length;entry.done=true;},error=>{entry.error=String(error);entry.done=true;});
    }
    return response;
   };
  });
  await context.addCookies([{name:"nl_session",value:session,url:LOCAL}]);
  const page=await context.newPage(),errors=[];page.setDefaultTimeout(30000);page.setDefaultNavigationTimeout(60000);page.on("pageerror",error=>errors.push(String(error)));
  const path=LOCAL+"/studio/path?store="+sid;
  let manualCompletions=0;
  page.on("request",request=>{if(request.method()==="POST"&&request.url().includes("/api/store/path"))manualCompletions++;});
  let baseline=null;
  for(const width of [390,1280]){
   await page.setViewportSize({width,height:900});
   await page.waitForLoadState("networkidle");
  await page.goto(path,{waitUntil:"domcontentloaded",timeout:60000});
   await page.getByRole("heading",{name:"Welcome back",exact:true}).waitFor();
   const section=page.locator('section[aria-labelledby="path-next"]');
   is("one focused return mission at "+width,await section.getByRole("heading",{name:"Give your store's introduction one clear update",exact:true}).count(),1);
   is("normal mission grid rests during return at "+width,await page.locator('section[aria-labelledby="path-growth-title"]').count(),0);
   is("no absence pressure at "+width,/missed|behind|failed|lost days|0 check-in days/i.test(await page.locator("main").innerText()),false);
   const link=section.getByRole("link",{name:"Edit your store's introduction",exact:true});
   await link.focus();is("return action receives keyboard focus at "+width,await link.evaluate(node=>node===document.activeElement),true);
   const target=new URL(await link.getAttribute("href"),LOCAL);
   is("same-store details at "+width,target.searchParams.get("store"),sid);
   is("existing details destination at "+width,target.hash,"#details");
   const response=await page.request.get(LOCAL+"/api/store/path?store="+sid);
   is("private owner export readable",response.ok(),true);
   const data=(await response.json()).path;
   if(!baseline)baseline=data.returnStep;
   is("reload preserves saved comparison baseline",data.returnStep,baseline);
   is("return fits at "+width,await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),0);
   await page.addScriptTag({content:axeSource});
   const violations=await page.evaluate(async()=>{const result=await window.axe.run(document.querySelector("main"),{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"]}});return result.violations.map(rule=>({id:rule.id,targets:rule.nodes.map(node=>node.target)}));});
   is("return accessibility checks at "+width,violations,[]);
  }
  is("return baseline exists",typeof baseline?.introHash,"string");
  const forbidden=await page.request.get(LOCAL+"/api/store/path?store="+otherSid,{maxRedirects:0});
  is("another owner's private Path is inaccessible",[302,303,307,400,403,404].includes(forbidden.status()),true);
  const edit=async bio=>{
   await page.waitForLoadState("networkidle");
   await page.goto(LOCAL+"/studio?store="+sid+"#details",{waitUntil:"domcontentloaded",timeout:60000});
   await page.getByRole("button",{name:"Edit name and description",exact:true}).click();
   await page.getByLabel("One line about it",{exact:true}).fill(bio);
   const form=page.locator("form").filter({has:page.getByLabel("One line about it",{exact:true})});
   await page.waitForLoadState("networkidle");
   const refresh=page.waitForResponse(response=>new URL(response.url()).pathname==="/studio"&&response.request().method()==="GET"&&response.request().headers()["rsc"]==="1"&&!response.request().headers()["next-router-prefetch"]);refresh.catch(()=>{});
   const reply=page.waitForResponse(response=>response.url().includes("/api/store/details")&&response.request().method()==="POST");
   await form.getByRole("button",{name:"Save",exact:true}).click();is("details endpoint responds", (await reply).ok(),true);
   await page.locator(".nb-toast-text").filter({hasText:"Name and description saved."}).waitFor();
   // Idle can still describe the previous request set before React starts refresh.
   const refreshed=await refresh;is("details RSC refresh responds",refreshed.ok(),true);
   await page.waitForFunction(url=>window.__mmRscBodies.some(entry=>entry.url===url&&entry.done),refreshed.url(),{timeout:60000});
   const body=await page.evaluate(url=>window.__mmRscBodies.findLast(entry=>entry.url===url&&entry.done),refreshed.url());
   if(body.error||!body.bytes)throw Error("Details browser RSC body incomplete "+JSON.stringify(body));
   await page.waitForLoadState("networkidle");
  };
  await page.route("**/api/store/details",route=>route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({ok:true,name:"Return Path",bio:"A reply that never reached storage."})}));
  await edit("A reply that never reached storage.");
  await page.unroute("**/api/store/details");
  await page.waitForLoadState("networkidle");
  await page.goto(path,{waitUntil:"domcontentloaded",timeout:60000});
  await page.getByRole("heading",{name:"Welcome back",exact:true}).waitFor();
  is("client success alone cannot complete return",await page.getByRole("heading",{name:"Give your store's introduction one clear update",exact:true}).isVisible(),true);
  await edit("Practical guides for people planning their first workshop.");
  await page.waitForLoadState("networkidle");
  await page.goto(path,{waitUntil:"domcontentloaded",timeout:60000});
  await page.getByRole("heading",{name:"Your next mission",exact:true}).waitFor();
  is("server-persisted introduction releases welcome focus",await page.getByRole("heading",{name:"Welcome back",exact:true}).count(),0);
  is("instructions never post mission completion",manualCompletions,0);
  is("return page errors",errors,[]);
 }finally{await context.close();}
}
