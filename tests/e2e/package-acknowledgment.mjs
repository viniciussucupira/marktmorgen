/** Existing package settings only; synthetic intercepted replies, no checkout or booking. */
export async function checkPackageAcknowledgment({browser,LOCAL,fixture,is}){
 const common=[
 {name:"HTTP",status:500,reply:v=>v},{name:"truthy",reply:v=>({...v,ok:"true"})},
 {name:"missing",reply:()=>({ok:true})},{name:"null",reply:()=>null},{name:"array",reply:v=>[v]},
 {name:"contradiction",reply:v=>({...v,error:"server_error"})},{name:"malformed",raw:"invalid"},
 {name:"lost",abort:true},{name:"inherited",reply:()=>({ok:false,error:"__proto__"})}];
 const saveCases=[...common,
 {name:"wrong count",reply:v=>({...v,package:{...v.package,sessions:6}})},
 {name:"wrong price",reply:v=>({...v,package:{...v.package,priceCents:49999}})},
 {name:"wrong days",reply:v=>({...v,package:{...v.package,days:180}})},
 {name:"confirmed",reply:v=>v,confirmed:true}];
 const stopCases=[...common,{name:"still offered",reply:()=>({ok:true,package:{sessions:5,priceCents:50000,days:90}})},{name:"confirmed",reply:v=>v,confirmed:true}];
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   await context.addCookies([{name:"nl_session",value:fixture.session,url:LOCAL}]);
   const page=await context.newPage();let pending=null,requests=0;
   await page.route("**/api/store/call-package",async route=>{
    if(!pending)throw Error("Unexpected package write");requests++;
    const work=pending,input=route.request().postDataJSON();await work.release;
    if(work.scenario.abort){await route.abort("failed");return;}
    const good={ok:true,package:input.sessions===0?null:{sessions:5,priceCents:50000,days:90}};
    await route.fulfill({status:work.scenario.status??200,contentType:"application/json",body:work.scenario.raw??JSON.stringify(work.scenario.reply(good))});
   });
   await page.goto(LOCAL+"/studio?store="+fixture.sid,{waitUntil:"networkidle",timeout:60000});
   await page.locator("main details").evaluateAll(nodes=>nodes.forEach(n=>{n.open=true;}));
   const product=page.locator('[aria-controls="product-panel-'+fixture.product+'"]');
   if(await product.getAttribute("aria-expanded")==="false")await product.click();
   const section=page.locator('[data-package-editor="'+fixture.product+'"]');await section.waitFor();
   await section.evaluate(node=>{node.open=true;});
   const sessions=section.locator("select").nth(0),price=section.locator("input"),days=section.locator("select").nth(1);
   await sessions.selectOption("5");await price.fill("500.00");await days.selectOption("90");
   for(const [action,cases] of [["save",saveCases],["stop",stopCases]]){
    for(const scenario of cases){
     let release;const held=new Promise(resolve=>{release=resolve;});pending={scenario,release:held};
     const name=action+"/"+scenario.name+"/"+width;
     const seen=page.waitForRequest(r=>r.method()==="POST"&&new URL(r.url()).pathname==="/api/store/call-package");seen.catch(()=>{});
     try{
      await section.getByRole("button",{name:action==="save"?"Offer the package":"Stop offering it",exact:true}).click();
      is("package exact request "+name,(await seen).postDataJSON(),action==="save"?{id:fixture.product,sessions:5,price:"500.00",days:90}:{id:fixture.product,sessions:0});
      is("package busy "+name,await section.getAttribute("aria-busy"),"true");
      for(const field of await section.locator("select,input,button").all())is("package locked "+name,await field.isDisabled(),true);
     }finally{release();}
     await page.waitForFunction(id=>document.querySelector('[data-package-editor="'+id+'"]')?.getAttribute("aria-busy")==="false",fixture.product);
     if(scenario.confirmed){
      is("package confirms "+name,await section.getByRole("alert").count(),0);
      is("package confirmed status "+name,(await section.locator("summary").innerText()).startsWith("Package:"),action==="save");
     }else{
      const alert=section.getByRole("alert");await alert.waitFor();
      is("package uncertainty "+name,(await alert.innerText()).includes("Reload this page to check before trying again"),true);
      is("package baseline retained "+name,(await section.locator("summary").innerText()).startsWith("Package:"),action==="stop");
     }
     is("package draft retained "+name,[await sessions.inputValue(),await price.inputValue(),await days.inputValue()],["5","500.00","90"]);
     is("package fits "+name,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    }
   }
   is("all package writes intercepted "+width,requests,saveCases.length+stopCases.length);
  }finally{await context.close();}
 }
}
