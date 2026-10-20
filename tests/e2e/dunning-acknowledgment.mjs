/** Intercept all settings writes; no reminder email, card update or payment occurs. */
export async function checkDunningAcknowledgment({browser,LOCAL,fixture,is}){
 const cases=[
 {name:"HTTP",status:500,reply:v=>v},{name:"truthy",reply:v=>({...v,ok:"true"})},
 {name:"missing",reply:()=>({ok:true})},{name:"wrong reminder count",reply:v=>({...v,dunning:{...v.dunning,reminders:1}})},
 {name:"wrong card flag",reply:v=>({...v,dunning:{...v.dunning,cardNotice:!v.dunning.cardNotice}})},
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
   await page.route("**/api/store/dunning",async route=>{
    if(!pending)throw Error("Unexpected reminder setting write");requests++;
    const work=pending,input=route.request().postDataJSON();await work.release;
    if(work.scenario.abort){await route.abort("failed");return;}
    await route.fulfill({status:work.scenario.status??200,contentType:"application/json",body:work.scenario.raw??JSON.stringify(work.scenario.reply({ok:true,dunning:input}))});
   });
   await page.goto(LOCAL+"/studio?store="+fixture.sid,{waitUntil:"networkidle",timeout:60000});
   await page.locator("main details").evaluateAll(nodes=>nodes.forEach(n=>{n.open=true;}));
   const section=page.locator("[data-dunning-editor]");await section.waitFor();
   const check=section.locator("#dunning-card"),count=section.locator("#dunning-reminders");
   for(const on of [false,true]){
    await count.selectOption(on?"3":"2");await check.setChecked(on);
    for(const scenario of cases){
     let release;const held=new Promise(resolve=>{release=resolve;});pending={scenario,release:held};
     const name=on+"/"+scenario.name+"/"+width;
     const seen=page.waitForRequest(r=>r.method()==="POST"&&new URL(r.url()).pathname==="/api/store/dunning");seen.catch(()=>{});
     try{
      await section.getByRole("button",{name:"Save",exact:true}).click();
      is("reminder settings exact request "+name,(await seen).postDataJSON(),{reminders:on?3:2,cardNotice:on});
      is("reminder settings busy "+name,await section.getAttribute("aria-busy"),"true");
      for(const field of await section.locator("input,select,button").all())is("reminder settings pending lock "+name,await field.isDisabled(),true);
     }finally{release();}
     await page.waitForFunction(()=>document.querySelector("[data-dunning-editor]")?.getAttribute("aria-busy")==="false");
     if(scenario.confirmed){
      is("reminder settings confirmed "+name,await section.getByRole("alert").count(),0);
      is("reminder saved baseline "+name,await section.getByRole("button",{name:"Save",exact:true}).isDisabled(),true);
     }else{
      const alert=section.getByRole("alert");await alert.waitFor();
      is("reminder uncertainty honest "+name,(await alert.innerText()).includes("Reload this page to check before trying again"),true);
      is("reminder card draft retained "+name,await check.isChecked(),on);
      is("reminder count draft retained "+name,await count.inputValue(),on?"3":"2");
     }
     is("reminder settings fit "+name,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    }
   }
   is("all reminder writes intercepted "+width,requests,24);
  }finally{await context.close();}
 }
}
