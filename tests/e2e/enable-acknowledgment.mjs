/** Synthetic enable replies only; no course/podcast write reaches the local server. */
export async function checkEnableAcknowledgment({browser,LOCAL,fixture,is}){
 const cases=[
 {name:"HTTP",status:500,reply:v=>v},{name:"truthy",reply:v=>({...v,ok:"true"})},
 {name:"missing",reply:()=>({ok:true})},{name:"invalid identity",reply:v=>({...v,IDENTITY:"invalid"})},
 {name:"null",reply:()=>null},{name:"array",reply:v=>[v]},
 {name:"contradiction",reply:v=>({...v,error:"server_error"})},
 {name:"malformed",raw:"invalid"},{name:"lost",abort:true},
 {name:"inherited",reply:()=>({ok:false,error:"__proto__"})},
 {name:"known",reply:()=>({ok:false,error:"signed_out"}),known:true},
 {name:"confirmed",reply:v=>v,confirmed:true}
 ];
 for(const width of [390,1280])for(const kind of ["course","podcast"]){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   await context.addCookies([{name:"nl_session",value:fixture.session,url:LOCAL}]);
   const page=await context.newPage();let pending=null,requests=0,navigations=0;
   const destination="/studio/"+kind+"/"+fixture.product;
   await page.route("**"+destination+"*",async route=>{navigations++;await route.fulfill({status:200,contentType:"text/html",body:"<!doctype html><title>Synthetic destination</title><p>Synthetic destination</p>"});});
   await page.route("**/api/store/"+kind,async route=>{
    if(!pending)throw Error("Unexpected enable write");requests++;
    const work=pending;await work.release;
    if(work.scenario.abort){await route.abort("failed");return;}
    let reply=work.scenario.reply?.({ok:true,[kind+"Id"]:"a".repeat(32)});
    if(reply && typeof reply==="object" && "IDENTITY" in reply){reply[kind+"Id"]=reply.IDENTITY;delete reply.IDENTITY;}
    await route.fulfill({status:work.scenario.status??200,contentType:"application/json",body:work.scenario.raw??JSON.stringify(reply)});
   });
   await page.goto(LOCAL+"/studio?store="+fixture.sid,{waitUntil:"domcontentloaded",timeout:60000});
   await page.locator("main details").evaluateAll(nodes=>nodes.forEach(n=>{n.open=true;}));
   const toggle=page.locator('button[aria-controls="product-panel-'+fixture.product+'"]');
   await toggle.waitFor();await page.waitForFunction(el=>typeof el.onclick==="function",await toggle.elementHandle());
   if(await toggle.getAttribute("aria-expanded")!=="true")await toggle.click();
   const panel=page.locator("#product-panel-"+fixture.product);
   const button=panel.getByRole("button",{name:kind==="course"?"Sell this as a course with lessons":"Sell this as a private podcast",exact:true});
   await button.waitFor();
   for(const scenario of cases){
    let release;const held=new Promise(resolve=>{release=resolve;});pending={scenario,release:held};
    const name=kind+"/"+scenario.name+"/"+width;
    const seen=page.waitForRequest(r=>r.method()==="POST"&&new URL(r.url()).pathname==="/api/store/"+kind);seen.catch(()=>{});
    const destinationSeen=scenario.confirmed?page.waitForRequest(r=>new URL(r.url()).pathname===destination):null;destinationSeen?.catch(()=>{});
    try{
     await button.click();is("enable exact request "+name,(await seen).postDataJSON(),{action:"enable",id:fixture.product});
     is("enable pending disabled "+name,await button.isDisabled(),true);
     is("enable busy announced "+name,await button.getAttribute("aria-busy"),"true");
    }finally{release();}
    if(scenario.confirmed){await destinationSeen;is("confirmed enable navigates "+name,navigations>0,true);}
    else{
     await page.waitForFunction(el=>el.getAttribute("aria-busy")==="false",await button.elementHandle());
     const alert=button.locator("..").getByRole("alert");await alert.waitFor();
     is("enable error wording "+name,(await alert.innerText()).includes(scenario.known?"Your session ended":"Reload this page to check before trying again"),true);
     is("uncertain enable stays in studio "+name,new URL(page.url()).pathname,"/studio");
     is("uncertain enable does not navigate "+name,navigations,0);
     is("enable retry available "+name,await button.isEnabled(),true);
     is("enable controls fit "+name,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    }
   }
   is("all enable writes intercepted "+kind+"/"+width,requests,12);
  }finally{await context.close();}
 }
}
