/** Actual TaxEditor client contract against intercepted responses; no tax write reaches the server. */
export async function checkTaxSaveAcknowledgment({browser,LOCAL,session,sid,is}){
 const scenarios=[
  {name:"HTTP failure cannot confirm a save",status:500,body:tax=>({ok:true,tax})},
  {name:"a truthy string is not confirmation",body:tax=>({ok:"true",tax})},
  {name:"a missing settings snapshot is unknown",body:()=>({ok:true})},
  {name:"a mismatched settings snapshot is unknown",body:tax=>({ok:true,tax:{...tax,ids:!tax.ids}})},
  {name:"a null reply is unknown",body:()=>null},
  {name:"malformed JSON is unknown",raw:"<html>temporary error</html>"},
  {name:"an array reply is unknown",body:tax=>[{ok:true,tax}]},
  {name:"a contradictory error is not confirmation",body:tax=>({ok:true,tax,error:"server_error"})},
  {name:"a lost reply is unknown",abort:true},
  {name:"a known setup refusal stays specific",status:400,body:()=>({ok:false,error:"setup"}),specific:true},
  {name:"only a successful matching snapshot confirms",body:tax=>({ok:true,tax}),confirmed:true},
 ];
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   await context.addCookies([{name:"nl_session",value:session,url:LOCAL}]);
   const page=await context.newPage();let pending=null,intercepted=0;
   await page.route("**/api/store/tax*",async route=>{
    if(!pending)throw new Error("unexpected tax save");
    const work=pending;intercepted++;
    const tax=route.request().postDataJSON();
    await work.release;
    if(work.scenario.abort){await route.abort("failed");return;}
    await route.fulfill({status:work.scenario.status??200,contentType:"application/json",body:work.scenario.raw??JSON.stringify(work.scenario.body(tax))});
   });
   await page.goto(LOCAL+"/studio?store="+sid,{waitUntil:"domcontentloaded",timeout:60000});
   await page.locator("main details").evaluateAll(nodes=>nodes.forEach(node=>{node.open=true;}));
   const section=page.locator('[aria-labelledby="tax-title"]'),form=section.locator("form");
   const before=await form.locator("input").evaluateAll(nodes=>nodes.map(node=>node.checked));
   for(const scenario of scenarios){
    let release;
    const seen=page.waitForRequest(request=>request.method()==="POST"&&new URL(request.url()).pathname==="/api/store/tax",{timeout:15000});
    seen.catch(()=>{});
    const held=new Promise(resolve=>{release=resolve;});
    pending={scenario,release:held};
    try{
     await form.getByRole("button",{name:"Save",exact:true}).click();
     const sent=(await seen).postDataJSON();
     is("save sends only four existing boolean fields "+scenario.name+" "+width,Object.keys(sent).sort(),["enabled","ids","included","invoices"]);
     is("save keeps boolean values "+scenario.name+" "+width,Object.values(sent).every(value=>typeof value==="boolean"),true);
     is("the actual form reports its pending request "+scenario.name+" "+width,await form.getAttribute("aria-busy"),"true");
     is("options cannot change during acknowledgment "+scenario.name+" "+width,await form.locator("input").evaluateAll(nodes=>nodes.every(node=>node.matches(":disabled"))),true);
    }finally{release();}
    await page.waitForFunction(()=>{const form=document.querySelector('[aria-labelledby="tax-title"] form');return form?.getAttribute("aria-busy")==="false";});
    if(scenario.confirmed){
     await page.locator(".nb-toast-region [role=status]").getByText("Sales tax settings saved.",{exact:true}).waitFor({state:"attached"});
     await page.locator(".nb-toast-text").filter({hasText:"Sales tax settings saved."}).waitFor();
     is("matching confirmation clears prior errors "+width,await form.getByRole("alert").count(),0);
    }else{
     const alert=form.getByRole("alert");await alert.waitFor();
     const text=(await alert.innerText()).replace(/\s+/g," ");
     is("response is explained without inventing success "+scenario.name+" "+width,text.includes(scenario.specific?"Stripe says your tax setup is not finished":"We could not confirm whether your tax settings were saved"),true);
     is("an uncertain response never claims nothing changed "+scenario.name+" "+width,text.includes("Nothing was changed"),false);
     is("an uncertain response does not show saved toast "+scenario.name+" "+width,await page.getByText("Sales tax settings saved.",{exact:true}).count(),0);
    }
    is("reading response leaves chosen options intact "+scenario.name+" "+width,await form.locator("input").evaluateAll(nodes=>nodes.map(node=>node.checked)),before);
    is("tax response text fits its card "+scenario.name+" "+width,await section.evaluate(node=>node.scrollWidth<=node.clientWidth),true);
   }
   is("every save was intercepted before the server "+width,intercepted,scenarios.length);
  }finally{await context.close();}
 }
}
