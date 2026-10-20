/** Intercept all address writes: the actual client changes no store record. */
export async function checkRenameAcknowledgment({browser,LOCAL,session,sid,is}){
 const scenarios=[
  {name:"HTTP failure",status:500,body:handle=>({ok:true,handle})},
  {name:"truthy confirmation",body:handle=>({ok:"true",handle})},
  {name:"missing address",body:()=>({ok:true})},
  {name:"different address",body:()=>({ok:true,handle:"another-address"})},
  {name:"null",body:()=>null},
  {name:"malformed",raw:"<html>error</html>"},
  {name:"contradictory error",body:handle=>({ok:true,handle,error:"server_error"})},
  {name:"known refusal",status:400,body:()=>({ok:false,error:"taken"}),specific:true},
  {name:"matching address",body:handle=>({ok:true,handle}),confirmed:true},
 ];
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   await context.addCookies([{name:"nl_session",value:session,url:LOCAL}]);
   const page=await context.newPage();let pending=null,requests=0;
   await page.route("**/api/store/rename",async route=>{
    if(!pending)throw Error("Unexpected address write");
    const work=pending;requests++;
    const handle=route.request().postDataJSON().handle.trim().replace(/^@+/,"").toLowerCase();
    await work.release;
    await route.fulfill({status:work.scenario.status??200,contentType:"application/json",body:work.scenario.raw??JSON.stringify(work.scenario.body(handle))});
   });
   await page.goto(LOCAL+"/studio?store="+sid,{waitUntil:"domcontentloaded",timeout:60000});
   await page.locator("main details").evaluateAll(nodes=>nodes.forEach(node=>{node.open=true;}));
   await page.getByRole("button",{name:"Change my address",exact:true}).click();
   const form=page.locator("form:has(#new-handle)"),field=form.getByLabel("New address",{exact:true});
   for(const scenario of scenarios){
    await field.fill(" @Synthetic.Path ");
    let release;const held=new Promise(resolve=>{release=resolve;});
    pending={scenario,release:held};
    const seen=page.waitForRequest(request=>request.method()==="POST"&&new URL(request.url()).pathname==="/api/store/rename",{timeout:15000});seen.catch(()=>{});
    try{
     await form.getByRole("button",{name:"Change it",exact:true}).click();
     is("address request preserves submitted value "+scenario.name+" "+width,(await seen).postDataJSON().handle," @Synthetic.Path ");
     is("address field locks pending reply "+scenario.name+" "+width,await field.isDisabled(),true);
     is("cancel cannot hide a pending change "+scenario.name+" "+width,await form.getByRole("button",{name:"Cancel",exact:true}).isDisabled(),true);
     is("address form exposes pending state "+scenario.name+" "+width,await form.getAttribute("aria-busy"),"true");
    }finally{release();}
    if(scenario.confirmed){
     await page.locator(".nb-toast-region [role=status]").getByText("Address changed.",{exact:true}).waitFor({state:"attached"});
     await page.locator(".nb-toast-text").filter({hasText:"Address changed."}).waitFor();
     is("only matching confirmation closes address form "+width,await page.locator("#new-handle").count(),0);
    }else{
     const alert=form.getByRole("alert");await alert.waitFor();
     is("address refusal stays honest "+scenario.name+" "+width,(await alert.innerText()).includes(scenario.specific?"Someone already has that address":"We could not confirm whether your address changed"),true);
     is("unconfirmed address never gets success toast "+scenario.name+" "+width,await page.getByText("Address changed.",{exact:true}).count(),0);
     is("failed reply preserves the chosen address "+scenario.name+" "+width,await field.inputValue()," @Synthetic.Path ");
     is("address unlocks after response "+scenario.name+" "+width,await field.isEnabled(),true);
    }
    is("address controls fit viewport "+scenario.name+" "+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   }
   is("all address writes stayed intercepted "+width,requests,scenarios.length);
  }finally{await context.close();}
 }
}
