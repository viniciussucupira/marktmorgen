/** Every details POST is intercepted; no creator record or AI provider is changed. */
export async function checkDetailsAcknowledgment({browser,LOCAL,session,sid,is}){
 const scenarios=[
  {name:"HTTP failure",status:500,body:value=>({ok:true,...value})},
  {name:"truthy confirmation",body:value=>({ok:"true",...value})},
  {name:"missing details",body:()=>({ok:true})},
  {name:"different name",body:value=>({ok:true,...value,name:"Different"})},
  {name:"different description",body:value=>({ok:true,...value,bio:"Different"})},
  {name:"null",body:()=>null},
  {name:"array",body:()=>[]},
  {name:"unknown inherited error",body:()=>({ok:false,error:"__proto__"})},
  {name:"malformed",raw:"<html>error</html>"},
  {name:"contradictory error",body:value=>({ok:true,...value,error:"server_error"})},
  {name:"known refusal",status:400,body:()=>({ok:false,error:"name"}),specific:true},
  {name:"matching details",body:value=>({ok:true,...value}),confirmed:true},
 ];
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   await context.addCookies([{name:"nl_session",value:session,url:LOCAL}]);
   const page=await context.newPage();let pending=null,requests=0,aiRequests=0;
   await page.route("**/api/store/ai",async route=>{aiRequests++;await route.abort();});
   await page.route("**/api/store/details",async route=>{
    if(!pending)throw Error("Unexpected details write");
    const work=pending;requests++;
    const sent=route.request().postDataJSON();
    const value={name:sent.name.slice(0,60).trim(),bio:sent.bio.slice(0,160).trim()};
    await work.release;
    await route.fulfill({status:work.scenario.status??200,contentType:"application/json",body:work.scenario.raw??JSON.stringify(work.scenario.body(value))});
   });
   await page.goto(LOCAL+"/studio?store="+sid,{waitUntil:"networkidle",timeout:60000});
   await page.locator("main details").evaluateAll(nodes=>nodes.forEach(node=>{if(!node.querySelector("#store-name"))node.open=true;}));
   const editor=page.locator("#details details").filter({has:page.locator("#store-name")});
   await editor.locator(":scope > summary").click();
   is("one action opens native details editor "+width,await editor.evaluate(node=>node.open),true);
   const form=page.locator("form:has(#store-name)"),field=form.getByLabel("Store name",{exact:true}),bio=form.getByLabel("One line about it",{exact:true});
   for(const scenario of scenarios){
    await field.fill(" Synthetic store ");await bio.fill(" A synthetic description. ");
    let release;const held=new Promise(resolve=>{release=resolve;});
    pending={scenario,release:held};
    const seen=page.waitForRequest(request=>request.method()==="POST"&&new URL(request.url()).pathname==="/api/store/details",{timeout:15000});seen.catch(()=>{});
    try{
     await form.getByRole("button",{name:"Save",exact:true}).click();
     is("details request preserves submitted value "+scenario.name+" "+width,(await seen).postDataJSON().name," Synthetic store ");
     is("details field locks pending reply "+scenario.name+" "+width,await field.isDisabled(),true);
     is("description locks pending reply "+scenario.name+" "+width,await bio.isDisabled(),true);
     is("cancel cannot hide a pending change "+scenario.name+" "+width,await form.getByRole("button",{name:"Cancel",exact:true}).isDisabled(),true);
     is("details form exposes pending state "+scenario.name+" "+width,await form.getAttribute("aria-busy"),"true");
    }finally{release();}
    if(scenario.confirmed){
     await page.locator(".nb-toast-region [role=status]").getByText("Name and description saved.",{exact:true}).waitFor({state:"attached"});
     await page.locator(".nb-toast-text").filter({hasText:"Name and description saved."}).waitFor();
     is("only matching confirmation closes details disclosure "+width,await editor.evaluate(node=>node.open),false);
     is("confirmed details fields are hidden "+width,await field.isVisible(),false);
    }else{
     const alert=form.getByRole("alert");await alert.waitFor();
     is("details refusal stays honest "+scenario.name+" "+width,(await alert.innerText()).includes(scenario.specific?"Give the store a name":"We could not confirm whether your name and description changed"),true);
     is("unconfirmed details never gets success toast "+scenario.name+" "+width,await page.getByText("Name and description saved.",{exact:true}).count(),0);
     is("failed reply preserves the chosen details "+scenario.name+" "+width,await field.inputValue()," Synthetic store ");
     is("details unlocks after response "+scenario.name+" "+width,await field.isEnabled(),true);
     is("unconfirmed reply preserves description "+scenario.name+" "+width,await bio.inputValue()," A synthetic description. ");
    }
    const fits=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);
    if(!fits)console.log("Details overflow diagnostics",await page.evaluate(()=>[...document.querySelectorAll("main *")].map(node=>{const box=node.getBoundingClientRect();return {tag:node.tagName,id:node.id,className:String(node.className),left:box.left,right:box.right,width:box.width};}).filter(box=>box.width>0&&(box.right>innerWidth+1||box.left < -1)).slice(0,12)));
    is("details controls fit viewport "+scenario.name+" "+width,fits,true);
   }
   is("all details writes stayed intercepted "+width,requests,scenarios.length);
   is("details confirmation never requests AI "+width,aiRequests,0);
  }finally{await context.close();}
 }
}
