/** Intercepts every device-exclusion write; no cookie mutation or external submission. */
export async function checkNoCountAcknowledgment({browser,LOCAL,fixture,is}){
 const failures=[
 {name:"HTTP",status:500,body:on=>({ok:true,on})},
 {name:"truthy",body:on=>({ok:"true",on})},
 {name:"opposite",body:on=>({ok:true,on:!on})},
 {name:"missing",body:()=>({ok:true})},
 {name:"null",body:()=>null},
 {name:"array",body:on=>[{ok:true,on}]},
 {name:"contradiction",body:on=>({ok:true,on,error:"server_error"})},
 {name:"malformed",raw:"invalid"},
 {name:"lost",abort:true}
 ];
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   await context.addCookies([{name:"nl_session",value:fixture.session,url:LOCAL}]);
   const page=await context.newPage();let pending=null,requests=0;
   await page.route("**/api/store/no-count",async route=>{
    if(!pending)throw Error("Unexpected device-exclusion write");
    requests++;const work=pending,on=route.request().postDataJSON().on;
    await work.release;
    if(work.scenario.abort){await route.abort("failed");return;}
    await route.fulfill({status:work.scenario.status??200,contentType:"application/json",body:work.scenario.raw??JSON.stringify(work.scenario.body(on))});
   });
   await page.goto(LOCAL+"/studio?store="+fixture.sid,{waitUntil:"domcontentloaded",timeout:60000});
   await page.locator("main details").evaluateAll(nodes=>nodes.forEach(n=>{n.open=true;}));
   const section=page.locator("[data-no-count-editor]");await section.waitFor();
   for(const on of [true,false]){
    for(const scenario of [...failures,{name:"confirmed",body:on=>({ok:true,on}),confirmed:true}]){
     let release;const held=new Promise(resolve=>{release=resolve;});pending={scenario,release:held};
     const name=scenario.name+"/"+on+"/"+width,button=section.getByRole("button");
     const seen=page.waitForRequest(r=>r.method()==="POST"&&new URL(r.url()).pathname==="/api/store/no-count");seen.catch(()=>{});
     try{
      await button.click();is("device choice sent "+name,(await seen).postDataJSON().on,on);
      is("device setting locked "+name,await button.isDisabled(),true);
      is("device setting busy "+name,await section.getAttribute("aria-busy"),"true");
     }finally{release();}
     await button.isEnabled().then(async()=>{await page.waitForFunction(()=>document.querySelector("[data-no-count-editor]")?.getAttribute("aria-busy")==="false");});
     if(scenario.confirmed){
      is("confirmed device setting "+name,await button.innerText(),on?"Count this device again":"Don't count this device");
      is("confirmed error cleared "+name,await section.getByRole("alert").count(),0);
     }else{
      const alert=section.getByRole("alert");await alert.waitFor();
      is("uncertain device setting honest "+name,(await alert.innerText()).includes("Reload this page to check before trying again"),true);
      is("uncertain state preserved "+name,await button.innerText(),on?"Don't count this device":"Count this device again");
     }
     is("device setting mobile fit "+name,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    }
   }
   is("all device writes intercepted "+width,requests,20);
  }finally{await context.close();}
 }
}
