/** All note saves and removals are intercepted synthetic replies. */
export async function checkThanksAcknowledgment({browser,LOCAL,fixture,is}){
 const cases=[
 {name:"HTTP",status:500,reply:note=>({ok:true,note})},
 {name:"truthy",reply:note=>({ok:"true",note})},
 {name:"missing",reply:()=>({ok:true})},
 {name:"different",reply:note=>({ok:true,note:note?{...note,body:"Different"}:{heading:"",body:"Different",video:null,button:null}})},
 {name:"array",reply:note=>[{ok:true,note}]},
 {name:"null",reply:()=>null},
 {name:"contradiction",reply:note=>({ok:true,note,error:"server_error"})},
 {name:"inherited",reply:()=>({ok:false,error:"__proto__"})},
 {name:"malformed",raw:"invalid"},
 {name:"lost",abort:true},
 {name:"confirmed",reply:note=>({ok:true,note}),confirmed:true}
 ];
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   await context.addCookies([{name:"nl_session",value:fixture.session,url:LOCAL}]);
   const page=await context.newPage();let pending=null,requests=0;
   await page.route("**/api/store/thanks-note",async route=>{
    if(!pending)throw Error("Unexpected note write");
    requests++;const work=pending,input=route.request().postDataJSON();
    const note=input.note===null?null:{heading:input.note.heading.trim(),body:input.note.body.trim(),video:null,button:null};
    await work.release;if(work.scenario.abort){await route.abort("failed");return;}
    await route.fulfill({status:work.scenario.status??200,contentType:"application/json",body:work.scenario.raw??JSON.stringify(work.scenario.reply(note))});
   });
   await page.goto(LOCAL+"/studio/pages?store="+fixture.sid+"&product="+fixture.product,{waitUntil:"domcontentloaded",timeout:60000});
   const section=page.locator("#after-paying");await section.waitFor();
   for(const remove of [false,true]){
    for(const scenario of cases){
     if(!remove){await section.getByLabel("Heading (optional)",{exact:true}).fill("Bonjour");await section.getByLabel("Your note",{exact:true}).fill("Merci pour votre achat.");}
     let release;const held=new Promise(resolve=>{release=resolve;});pending={scenario,release:held};
     const name=scenario.name+"/"+remove+"/"+width,button=section.getByRole("button",{name:remove?"Remove":"Save the note",exact:true});
     const seen=page.waitForRequest(r=>r.method()==="POST"&&new URL(r.url()).pathname==="/api/store/thanks-note");seen.catch(()=>{});
     try{
      await button.click();const input=(await seen).postDataJSON();
      is("note product preserved "+name,input.id,fixture.product);
      is("note intent preserved "+name,input.note===null,remove);
      if(!remove)is("creator note preserved "+name,input.note.body,"Merci pour votre achat.");
      is("note busy "+name,await section.getAttribute("aria-busy"),"true");
      for(const field of await section.locator("input,textarea,button").all())is("note controls lock "+name,await field.isDisabled(),true);
     }finally{release();}
     await page.waitForFunction(()=>document.querySelector("#after-paying")?.getAttribute("aria-busy")==="false");
     if(scenario.confirmed){
      is("note error cleared "+name,await section.getByRole("alert").count(),0);
      is("note saved state "+name,await section.getByRole("button",{name:"Remove",exact:true}).count(),remove?0:1);
     }else{
      const alert=section.getByRole("alert");await alert.waitFor();
      is("note uncertainty honest "+name,(await alert.innerText()).includes("Reload this page to check before trying again"),true);
      is("note draft preserved "+name,await section.getByLabel("Your note",{exact:true}).inputValue(),"Merci pour votre achat.");
     }
     is("note mobile fit "+name,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    }
   }
   is("all note writes intercepted "+width,requests,22);
  }finally{await context.close();}
 }
}
