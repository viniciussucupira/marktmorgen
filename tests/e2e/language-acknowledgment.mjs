/** Tests the existing buyer-language choice only; every POST intercepted, no translation activated. */
export async function checkLanguageAcknowledgment({browser,LOCAL,fixture,is}){
 const cases=[
 {name:"HTTP",status:500,body:{ok:true,language:"fr"}},
 {name:"truthy",body:{ok:"true",language:"fr"}},
 {name:"missing",body:{ok:true}},
 {name:"different",body:{ok:true,language:"de"}},
 {name:"unsupported",body:{ok:true,language:"xx"}},
 {name:"prototype",body:{ok:true,language:"__proto__"}},
 {name:"function",body:{ok:true,language:"constructor"}},
 {name:"null",body:null},
 {name:"array",body:[{ok:true,language:"fr"}]},
 {name:"contradiction",body:{ok:true,language:"fr",error:"server_error"}},
 {name:"malformed",raw:"invalid"},
 {name:"lost",abort:true},
 {name:"confirmed",body:{ok:true,language:"fr"},confirmed:true}
 ];
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   await context.addCookies([{name:"nl_session",value:fixture.session,url:LOCAL}]);
   const page=await context.newPage();let pending=null,requests=0;
   await page.route("**/api/store/language",async route=>{
    if(!pending)throw Error("Unexpected language write");requests++;
    const work=pending;await work.release;if(work.scenario.abort){await route.abort("failed");return;}
    await route.fulfill({status:work.scenario.status??200,contentType:"application/json",body:work.scenario.raw??JSON.stringify(work.scenario.body)});
   });
   await page.goto(LOCAL+"/studio?store="+fixture.sid,{waitUntil:"networkidle",timeout:60000});
   await page.locator("main details").evaluateAll(nodes=>nodes.forEach(n=>{n.open=true;}));
   const select=page.locator("#store-language"),section=select.locator("xpath=ancestor::section[1]");
   await select.waitFor();await select.selectOption("fr");
   const initialOptions=await select.locator("option").evaluateAll(nodes=>nodes.map(n=>n.value));
   is("existing language identifiers "+width,initialOptions,["en","es","fr","de","it","nl","pt"]);
   for(const scenario of cases){
    let release;const held=new Promise(resolve=>{release=resolve;});pending={scenario,release:held};
    const name=scenario.name+"/"+width,button=section.getByRole("button",{name:"Save",exact:true});
    const seen=page.waitForRequest(r=>r.method()==="POST"&&new URL(r.url()).pathname==="/api/store/language");seen.catch(()=>{});
    try{
     await button.click();is("existing buyer choice sent "+name,(await seen).postDataJSON(),{language:"fr"});
     is("language locks "+name,await select.isDisabled(),true);
     is("language busy "+name,await section.getAttribute("aria-busy"),"true");
    }finally{release();}
    await page.waitForFunction(()=>document.querySelector("#store-language")?.disabled===false);
    const status=section.getByRole("status");await status.waitFor();
    if(scenario.confirmed)is("language setting confirmed "+name,(await status.innerText()).includes("Buyer language setting saved: French."),true);
    else{
     is("language uncertainty honest "+name,(await status.innerText()).includes("Reload this page to check before trying again"),true);
     is("language no public success link "+name,await status.getByRole("link").count(),0);
     is("language draft preserved "+name,await select.inputValue(),"fr");
     is("language remains unsaved "+name,await section.getByRole("button",{name:"Save",exact:true}).isEnabled(),true);
    }
    is("language controls fit "+name,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   }
   is("all language writes intercepted "+width,requests,cases.length);
  }finally{await context.close();}
 }
}
