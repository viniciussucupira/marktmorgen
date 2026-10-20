/** All layout saves/removals are intercepted; no public page or stored creator text changes. */
export async function checkLayoutAcknowledgment({browser,LOCAL,fixture,is}){
 const cases=[
 {name:"HTTP",status:500,reply:value=>value},
 {name:"truthy",reply:value=>({...value,ok:"true"})},
 {name:"missing",reply:()=>({ok:true})},
 {name:"different",reply:(value,kind)=>kind==="sections"?{...value,savedSections:[{title:"Other",at:"other"}]}:{...value,announcement:{text:"Other",product:null}}},
 {name:"flag",reply:(value,kind)=>kind==="sections"?{...value,sections:999}:{...value,on:!value.on}},
 {name:"null",reply:()=>null},
 {name:"array",reply:value=>[value]},
 {name:"contradiction",reply:value=>({...value,error:"server_error"})},
 {name:"malformed",raw:"invalid"},
 {name:"lost",abort:true},
 {name:"inherited",reply:()=>({ok:false,error:"__proto__"})},
 {name:"confirmed",reply:value=>value,confirmed:true}
 ];
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   await context.addCookies([{name:"nl_session",value:fixture.session,url:LOCAL}]);
   const page=await context.newPage();let pending=null,requests=0;
   for(const kind of ["sections","news"])await page.route("**/api/store/"+(kind==="sections"?"sections":"announcement"),async route=>{
    if(!pending||pending.kind!==kind)throw Error("Unexpected layout write");requests++;
    const work=pending,input=route.request().postDataJSON();
    const normal=s=>s.replace(/\s+/g," ").trim();
    const value=kind==="sections"?{ok:true,sections:input.sections.length,savedSections:input.sections.map(row=>({title:normal(row.title),at:row.at}))}:{ok:true,on:!!input.text.trim(),announcement:input.text.trim()?{text:normal(input.text),product:input.product}:null};
    await work.release;if(work.scenario.abort){await route.abort("failed");return;}
    await route.fulfill({status:work.scenario.status??200,contentType:"application/json",body:work.scenario.raw??JSON.stringify(work.scenario.reply(value,kind))});
   });
   await page.goto(LOCAL+"/studio?store="+fixture.sid,{waitUntil:"domcontentloaded",timeout:60000});
   await page.locator("main details").evaluateAll(nodes=>nodes.forEach(n=>{n.open=true;}));
   const section=page.locator("[data-layout-editor]");await section.waitFor();
   for(const kind of ["sections","news"]){
    if(kind==="sections"){await section.getByRole("button",{name:/Add a section/}).click();await section.getByLabel("Heading 1",{exact:true}).fill("Guides  pour vous");}
    else await section.getByLabel("What it says",{exact:false}).fill("Bonjour  à tous");
    for(const remove of [false,true]){
     if(remove){if(kind==="sections")await section.getByRole("button",{name:"Remove heading 1",exact:true}).click();else await section.getByLabel("What it says",{exact:false}).fill("");}
     for(const scenario of cases){
      let release;const held=new Promise(resolve=>{release=resolve;});pending={scenario,kind,release:held};
      const name=kind+"/"+remove+"/"+scenario.name+"/"+width;
      const path="/api/store/"+(kind==="sections"?"sections":"announcement");
      const seen=page.waitForRequest(r=>r.method()==="POST"&&new URL(r.url()).pathname===path);seen.catch(()=>{});
      try{
       await section.getByRole("button",{name:kind==="sections"?"Save sections":"Save",exact:true}).click();const input=(await seen).postDataJSON();
       is("layout removal intent "+name,kind==="sections"?input.sections.length===0:input.text==="",remove);
       is("layout busy "+name,await section.getAttribute("aria-busy"),"true");
       for(const field of await section.locator("input,select,button").all())is("layout controls lock "+name,await field.isDisabled(),true);
      }finally{release();}
      await page.waitForFunction(()=>document.querySelector("[data-layout-editor]")?.getAttribute("aria-busy")==="false");
      if(scenario.confirmed){
       await page.locator(".nb-toast-region [role=status]").getByText(kind==="sections"?"Section settings saved.":"News settings saved.",{exact:true}).first().waitFor({state:"attached"});
       is("layout confirmed without refusal "+name,await section.getByRole("alert").count(),0);
       is("layout saved baseline updated "+name,await section.getByRole("button",{name:kind==="sections"?"Save sections":"Save",exact:true}).isDisabled(),true);
      }
      else{
       const alert=section.getByRole("alert");await alert.waitFor();
       is("layout uncertainty honest "+name,(await alert.innerText()).includes("Reload this page to check before trying again"),true);
       if(!remove)is("creator layout draft retained "+name,await section.getByLabel(kind==="sections"?"Heading 1":"What it says",{exact:kind==="sections"}).inputValue(),kind==="sections"?"Guides  pour vous":"Bonjour  à tous");
      }
      is("layout controls fit "+name,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
     }
    }
   }
   is("all layout writes intercepted "+width,requests,48);
  }finally{await context.close();}
 }
}
