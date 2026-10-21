/** Reuses synthetic PDF metadata only; intercepts every write and blocks preview GETs. */
export async function checkPdfPreviewAcknowledgment({browser,LOCAL,fixture,is}){
 const cases=[
  {name:"HTTP failure",status:500,reply:v=>({ok:true,...v})},
  {name:"truthy ok",reply:v=>({ok:"true",...v})},
  {name:"missing saved fields",reply:()=>({ok:true})},
  {name:"wrong product",reply:v=>({ok:true,...v,id:"different"})},
  {name:"wrong pages",reply:v=>({ok:true,...v,pages:10})},
  {name:"string pages",reply:v=>({ok:true,...v,pages:String(v.pages)})},
  {name:"null response",reply:()=>null},
  {name:"array response",reply:v=>[{ok:true,...v}]},
  {name:"contradictory error",reply:v=>({ok:true,...v,error:"server_error"})},
  {name:"malformed JSON",raw:"<html>Error</html>"},
  {name:"lost reply",abort:true},
  {name:"canonical saved choice",reply:v=>({ok:true,...v}),confirmed:true}
 ];
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   await context.addCookies([{name:"nl_session",value:fixture.session,url:LOCAL}]);
   const page=await context.newPage();let work=null,requests=0,gets=0;
   await page.route("**/api/store/preview**",async route=>{
    if(route.request().method()==="GET"){gets++;await route.abort("failed");return;}
    if(!work)throw Error("Unexpected preview write");requests++;const item=work;await item.held;
    if(item.scenario.abort){await route.abort("failed");return;}
    const value=route.request().postDataJSON();
    await route.fulfill({status:item.scenario.status??200,contentType:"application/json",body:item.scenario.raw??JSON.stringify(item.scenario.reply(value))});
   });
   await page.goto(LOCAL+"/studio?store="+fixture.sid,{waitUntil:"networkidle",timeout:60000});
   await page.locator("main details").evaluateAll(nodes=>nodes.forEach(n=>{n.open=true;}));
   const select=page.locator('[id="preview-'+fixture.product+'"]');await select.waitFor({state:"visible"});
   const box=select.locator("..");
   for(const scenario of cases){
    let release;const held=new Promise(resolve=>{release=resolve;});work={scenario,held};
    const seen=page.waitForRequest(r=>r.method()==="POST"&&new URL(r.url()).pathname==="/api/store/preview");seen.catch(()=>{});
    const name=scenario.name+"/"+width;
    try{
     await select.selectOption("1");is("preview request exact "+name,(await seen).postDataJSON(),{id:fixture.product,pages:1});
     is("preview pending lock "+name,await select.isDisabled(),true);
     is("preview announces busy "+name,await box.getAttribute("aria-busy"),"true");
    }finally{release();}
    if(scenario.confirmed){
     await page.locator(".nb-toast-region [role=status]").getByText("Preview setting saved.",{exact:true}).waitFor({state:"attached"});
    }else{
     const alert=box.getByRole("alert");await alert.waitFor();
     is("preview uncertainty honest "+name,(await alert.innerText()).includes("Reload this page to check before trying again"),true);
     is("preview no false success "+name,await page.getByText("Preview setting saved.",{exact:true}).count(),0);
     is("preview unlocks "+name,await select.isEnabled(),true);
    }
    is("preview document fits "+name,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   }
   is("preview all writes intercepted "+width,requests,cases.length);is("preview no PDF GET "+width,gets,0);
  }finally{await context.close();}
 }
}
