/** All pause-setting POSTs are intercepted, including simulated lost replies.
 * Existing local seed stores cover both enabling and disabling, with no
 * real membership, billing change, email or provider request. */
export async function checkPauseAcknowledgment({browser,LOCAL,fixtures,is}){
 const scenarios=[
  {name:"HTTP failure",status:500,body:pause=>({ok:true,pause})},
  {name:"truthy confirmation",body:pause=>({ok:"true",pause})},
  {name:"missing pause",body:()=>({ok:true})},
  {name:"different pause",body:pause=>({ok:true,pause:pause===0?1:0})},
  {name:"string pause",body:pause=>({ok:true,pause:String(pause)})},
  {name:"null",body:()=>null},
  {name:"array",body:pause=>[{ok:true,pause}]},
  {name:"malformed",raw:"<html>temporary error</html>"},
  {name:"inherited object error",body:()=>({ok:false,error:"__proto__"})},
  {name:"inherited function error",body:()=>({ok:false,error:"constructor"})},
  {name:"contradictory error",body:pause=>({ok:true,pause,error:"server_error"})},
  {name:"lost reply",abort:true},
  {name:"known refusal",status:400,body:()=>({ok:false,error:"months"}),specific:true},
  {name:"matching pause",body:pause=>({ok:true,pause}),confirmed:true},
 ];
 for(const width of [390,1280])for(const fixture of fixtures){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   await context.addCookies([{name:"nl_session",value:fixture.session,url:LOCAL}]);
   const page=await context.newPage();let pending=null,requests=0;
   await page.route("**/api/store/pause",async route=>{
    if(!pending)throw Error("Unexpected pause setting write");
    const work=pending;requests++;
    const chosen=route.request().postDataJSON().months;
    await work.release;
    if(work.scenario.abort){await route.abort("failed");return;}
    await route.fulfill({status:work.scenario.status??200,contentType:"application/json",body:work.scenario.raw??JSON.stringify(work.scenario.body(chosen))});
   });
   await page.goto(LOCAL+"/studio?store="+fixture.sid,{waitUntil:"domcontentloaded",timeout:60000});
   const section=page.locator("[data-pause-editor]"),form=section.locator("form"),field=section.getByRole("combobox",{name:/Members may pause for/});
   try{await section.waitFor({state:"attached",timeout:15000});}
   catch(error){console.log("Pause fixture page",page.url(),(await page.locator("main").innerText()).slice(0,6000));throw error;}
   await page.locator("main details").evaluateAll(nodes=>nodes.forEach(node=>{node.open=true;}));
   is("local pause fixture is the expected setting "+width+"/"+fixture.initial,await field.inputValue(),String(fixture.initial));
   const chosen=fixture.initial?0:1,success=chosen?"Members can pause now.":"Pausing is off.";
   for(const scenario of scenarios){
    await field.selectOption(String(chosen));
    let release;const held=new Promise(resolve=>{release=resolve;});
    pending={scenario,release:held};
    const seen=page.waitForRequest(request=>request.method()==="POST"&&new URL(request.url()).pathname==="/api/store/pause",{timeout:15000});seen.catch(()=>{});
    const label=scenario.name+" "+width+"/"+fixture.initial;
    try{
     await form.getByRole("button",{name:"Save",exact:true}).click();
     is("pause request contains chosen months "+label,(await seen).postDataJSON().months,chosen);
     is("pause choice locks while waiting "+label,await field.isDisabled(),true);
     is("pause form announces pending state "+label,await form.getAttribute("aria-busy"),"true");
    }finally{release();}
    if(scenario.confirmed){
     await page.locator(".nb-toast-region [role=status]").getByText(success,{exact:true}).waitFor({state:"attached"});
     await page.locator(".nb-toast-text").filter({hasText:success}).waitFor();
    }else{
     const alert=section.getByRole("alert");await alert.waitFor();
     is("pause refusal stays honest "+label,(await alert.innerText()).includes(scenario.specific?"Pick off":"We could not confirm whether your pause setting was saved"),true);
     is("unconfirmed pause gets no success toast "+label,await page.getByText(success,{exact:true}).count(),0);
     is("chosen pause is preserved "+label,await field.inputValue(),String(chosen));
     is("pause choice unlocks after refusal "+label,await field.isEnabled(),true);
    }
    is("pause controls fit viewport "+label,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   }
   is("all pause writes stayed intercepted "+width+"/"+fixture.initial,requests,scenarios.length);
  }finally{await context.close();}
 }
}
