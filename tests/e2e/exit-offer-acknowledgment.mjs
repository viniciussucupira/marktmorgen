/** Only intercepted offer settings; no visitor, email, checkout or payment writes. */
export async function checkExitAcknowledgment({browser,LOCAL,fixture,is}){
 const cases=[
 {name:"HTTP",status:500,reply:v=>v},{name:"truthy",reply:v=>({...v,ok:"true"})},
 {name:"missing",reply:()=>({ok:true})},{name:"wrong product",reply:v=>({...v,exitOffer:"other"})},
 {name:"null",reply:()=>null},{name:"array",reply:v=>[v]},
 {name:"contradiction",reply:v=>({...v,error:"server_error"})},
 {name:"malformed",raw:"invalid"},{name:"lost",abort:true},
 {name:"inherited",reply:()=>({ok:false,error:"__proto__"})},
 {name:"confirmed",reply:v=>v,confirmed:true}
 ];
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   await context.addCookies([{name:"nl_session",value:fixture.session,url:LOCAL}]);
   const page=await context.newPage();let pending=null,requests=0;
   await page.route("**/api/store/exit-offer",async route=>{
    if(!pending)throw Error("Unexpected exit offer setting write");requests++;
    const work=pending,input=route.request().postDataJSON();await work.release;
    if(work.scenario.abort){await route.abort("failed");return;}
    await route.fulfill({status:work.scenario.status??200,contentType:"application/json",body:work.scenario.raw??JSON.stringify(work.scenario.reply({ok:true,exitOffer:input.product||null}))});
   });
   await page.goto(LOCAL+"/studio?store="+fixture.sid,{waitUntil:"networkidle",timeout:60000});
   await page.locator("main details").evaluateAll(nodes=>nodes.forEach(n=>{n.open=true;}));
   const section=page.locator("[data-exit-offer-editor]");await section.waitFor();
   const select=section.locator("select"),target=await select.locator('option:not([value=""])').first().getAttribute("value");
   for(const on of [true,false]){
    await select.selectOption(on?target:"");
    for(const scenario of cases){
     let release;const held=new Promise(resolve=>{release=resolve;});pending={scenario,release:held};
     const name=on+"/"+scenario.name+"/"+width;
     const seen=page.waitForRequest(r=>r.method()==="POST"&&new URL(r.url()).pathname==="/api/store/exit-offer");seen.catch(()=>{});
     try{
      await section.getByRole("button",{name:"Save",exact:true}).click();
      is("exit offer settings exact request "+name,(await seen).postDataJSON(),{product:on?target:""});
      is("exit offer settings busy "+name,await section.getAttribute("aria-busy"),"true");
      for(const field of await section.locator("input,select,button").all())is("exit offer settings pending lock "+name,await field.isDisabled(),true);
     }finally{release();}
     await page.waitForFunction(()=>document.querySelector("[data-exit-offer-editor]")?.getAttribute("aria-busy")==="false");
     if(scenario.confirmed){
      is("exit offer settings confirmed "+name,await section.getByRole("alert").count(),0);
      is("exit offer saved baseline "+name,await section.getByRole("button",{name:"Save",exact:true}).isDisabled(),true);
     }else{
      const alert=section.getByRole("alert");await alert.waitFor();
      is("exit offer honest uncertainty "+name,(await alert.innerText()).includes("Reload this page to check before trying again"),true);
      is("exit offer draft retained "+name,await select.inputValue(),on?target:"");
     }
     is("exit offer settings fit "+name,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    }
   }
   is("all exit offer writes intercepted "+width,requests,22);
  }finally{await context.close();}
 }
}
