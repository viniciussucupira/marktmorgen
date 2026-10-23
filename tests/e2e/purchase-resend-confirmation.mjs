/** Every resend POST is intercepted; no buyer email or provider write is made. */
export async function checkPurchaseResend({browser,LOCAL,fixture,shipment,axeSource,is}){
 const uncertain="Sending could not be confirmed. Check with the buyer before trying again.";
 const scenarios=[
  {name:"HTTP failure",status:500,body:{ok:true}},
  {name:"truthy string",body:{ok:"true"}},
  {name:"truthy number",body:{ok:1}},
  {name:"missing acknowledgment",body:{}},
  {name:"null body",body:null},
  {name:"array body",body:[{ok:true}]},
  {name:"contradictory error",body:{ok:true,error:"failed"}},
  {name:"empty contradictory error",body:{ok:true,error:""}},
  {name:"null contradictory error",body:{ok:true,error:null}},
  {name:"inherited error",status:400,body:{ok:false,error:"__proto__"}},
  {name:"constructor error",status:400,body:{ok:false,error:"constructor"}},
  {name:"malformed JSON",raw:"not JSON"},
  {name:"lost reply",abort:true},
  {name:"known refusal",status:404,body:{ok:false,error:"unknown"},known:true},
  {name:"confirmed",body:{ok:true},confirmed:true}
 ];
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   await context.addCookies([{name:"nl_session",value:fixture.session,url:LOCAL}]);
   const page=await context.newPage();let pending=null,writes=0,otherWrites=0;const errors=[];
   page.on("pageerror",error=>errors.push(String(error)));
   await page.route("**/api/**",async route=>{
    if(route.request().method()==="GET"){await route.continue();return;}
    if(new URL(route.request().url()).pathname!=="/api/store/resend"){otherWrites++;await route.abort();return;}
    if(!pending)throw Error("Unexpected purchase resend");
    const work=pending;writes++;await work.release;
    if(work.scenario.abort){await route.abort();return;}
    await route.fulfill({status:work.scenario.status??200,contentType:"application/json",body:work.scenario.raw??JSON.stringify(work.scenario.body)});
   });
   for(const scenario of scenarios){
    const name=scenario.name+"/"+width;
    await page.goto(LOCAL+"/studio?store="+fixture.sid+"&resend_case="+encodeURIComponent(scenario.name)+"#sales",{waitUntil:"networkidle",timeout:60000});
    const row=page.locator("#sales li").filter({has:page.getByText("Synthetic shipment",{exact:true})});
    const button=row.getByRole("button",{name:"Send the purchase email again",exact:true});
    await button.waitFor();const control=button.locator("..");
    let release;const held=new Promise(resolve=>{release=resolve;});pending={scenario,release:held};
    const seen=page.waitForRequest(request=>request.method()==="POST"&&new URL(request.url()).pathname==="/api/store/resend");seen.catch(()=>{});
    try{
     await button.focus();await page.keyboard.press("Enter");
     is("resend exact existing reference "+name,(await seen).postDataJSON(),{reference:shipment});
     is("resend locks while waiting "+name,await button.isDisabled(),true);
     is("resend announces pending "+name,await button.getAttribute("aria-busy"),"true");
    }finally{release();}
    await control.getByRole("button",{name:"Send the purchase email again",exact:true}).waitFor();
    await page.waitForFunction(()=>[...document.querySelectorAll("#sales button")].some(node=>node.textContent.trim()==="Send the purchase email again"&&!node.disabled));
    if(scenario.confirmed){
     await page.locator('.nb-toast-region [role="status"]').getByText("Purchase email accepted for sending to shipment-buyer@example.test.",{exact:true}).waitFor();
     is("confirmed resend no error "+name,await control.getByRole("alert").count(),0);
    }else{
     const alert=control.getByRole("alert");await alert.waitFor();
     is("resend refusal or uncertainty "+name,await alert.innerText(),scenario.known?"That sale could not be found on your Stripe account.":uncertain);
     is("unconfirmed resend no success toast "+name,await page.locator('.nb-toast-region [role="status"]').count(),0);
     await page.addScriptTag({content:axeSource});
     const contrast=await alert.evaluate(async node=>{
      const report=await window.axe.run([node],{runOnly:{type:"rule",values:["color-contrast-enhanced"]}});
      return {passes:report.passes.reduce((n,rule)=>n+rule.nodes.length,0),violations:report.violations.map(rule=>rule.id),incomplete:report.incomplete.map(rule=>rule.id)};
     });
     is("resend alert contrast measured "+name,contrast.passes>0,true);
     is("resend alert enhanced contrast "+name,contrast.violations,[]);
     is("resend alert no incomplete contrast "+name,contrast.incomplete,[]);
    }
    is("resend fits viewport "+name,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   }
   is("resend all writes intercepted "+width,writes,scenarios.length);
   is("resend no other writes "+width,otherWrites,0);
   is("resend no browser exception "+width,errors,[]);
  }finally{await context.close();}
 }
}
