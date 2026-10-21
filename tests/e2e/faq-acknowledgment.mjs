/** Local fixture only. Every manual save and AI request is intercepted. */
export async function checkFaqAcknowledgment({browser,LOCAL,fixture,is}){
 const cases=[
  {name:"HTTP failure",status:500,reply:v=>({ok:true,faq:v})},
  {name:"truthy ok",reply:v=>({ok:"true",faq:v})},
  {name:"missing saved list",reply:()=>({ok:true})},
  {name:"null response",reply:()=>null},
  {name:"array response",reply:v=>[{ok:true,faq:v}]},
  {name:"missing item",reply:v=>({ok:true,faq:v.slice(1)})},
  {name:"different order",reply:v=>({ok:true,faq:[...v].reverse()})},
  {name:"different question",reply:v=>({ok:true,faq:[{...v[0],q:"Different"},v[1]]})},
  {name:"different answer",reply:v=>({ok:true,faq:[{...v[0],a:"Different"},v[1]]})},
  {name:"invalid item",reply:()=>({ok:true,faq:[null,null]})},
  {name:"contradictory error",reply:v=>({ok:true,faq:v,error:"server_error"})},
  {name:"malformed JSON",raw:"<html>Error</html>"},
  {name:"lost reply",abort:true},
  {name:"unnormalized echo",reply:v=>({ok:true,faq:[{...v[0],q:"  First   question?  "},v[1]]})},
  {name:"canonical saved list",reply:v=>({ok:true,faq:v}),confirmed:true}
 ];
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   await context.addCookies([{name:"nl_session",value:fixture.session,url:LOCAL}]);
   const page=await context.newPage();let work=null,requests=0,aiRequests=0;
   await page.route("**/api/store/ai",async route=>{aiRequests++;await route.abort("failed");});
   await page.route("**/api/store/faq",async route=>{
    if(!work)throw Error("Unexpected FAQ write");requests++;const pending=work;await pending.held;
    const normalizeQ=v=>v.replace(/[\u0000-\u001f\u007f]+/g," ").replace(/\s+/g," ").trim();
    const value=route.request().postDataJSON().items.map(v=>({q:normalizeQ(v.q),a:v.a.replace(/\r\n/g,"\n").trim()}));
    if(pending.scenario.abort){await route.abort("failed");return;}
    await route.fulfill({status:pending.scenario.status??200,contentType:"application/json",body:pending.scenario.raw??JSON.stringify(pending.scenario.reply(value))});
   });
   await page.goto(LOCAL+"/studio?store="+fixture.sid,{waitUntil:"networkidle",timeout:60000});
   await page.locator("main details").evaluateAll(nodes=>nodes.forEach(n=>{n.open=true;}));
   const section=page.locator("section#faq");await section.waitFor({state:"visible"});
   while(await section.getByRole("button",{name:"Remove",exact:true}).count())await section.getByRole("button",{name:"Remove",exact:true}).first().click();
   await section.getByRole("button",{name:"Add a question",exact:true}).click();
   await section.getByRole("button",{name:"Add a question",exact:true}).click();
   const questions=section.locator("input");const answers=section.locator("textarea");
   for(const scenario of cases){
    await questions.nth(0).fill("  First   question?  ");await questions.nth(1).fill("Second question?");
    await answers.nth(0).fill("Écrivez votre question.\n\nKeep this paragraph.");await answers.nth(1).fill("Second answer.");
    let release;const held=new Promise(resolve=>{release=resolve;});work={scenario,held};
    const seen=page.waitForRequest(r=>r.method()==="POST"&&new URL(r.url()).pathname==="/api/store/faq");seen.catch(()=>{});
    const name=scenario.name+"/"+width;
    try{
     await section.getByRole("button",{name:"Save questions",exact:true}).click();const input=(await seen).postDataJSON();
     is("FAQ creator question preserved "+name,input.items[0].q,"  First   question?  ");
     is("FAQ announces pending "+name,await section.getAttribute("aria-busy"),"true");
     is("FAQ pending controls lock "+name,await section.locator("input,textarea,button").evaluateAll(nodes=>nodes.every(n=>n.disabled)),true);
    }finally{release();}
    if(scenario.confirmed){
     await page.locator(".nb-toast-region [role=status]").getByText("Questions saved.",{exact:true}).waitFor({state:"attached"});
    }else{
     const status=section.getByRole("status");await status.getByText("We could not confirm whether your questions were saved. Reload this page to check before trying again.",{exact:true}).waitFor();
     is("FAQ no false success "+name,await page.getByText("Questions saved.",{exact:true}).count(),0);
     is("FAQ draft question retained "+name,await questions.nth(0).inputValue(),"  First   question?  ");
     is("FAQ draft answer retained "+name,await answers.nth(0).inputValue(),"Écrivez votre question.\n\nKeep this paragraph.");
     is("FAQ edits unlock "+name,await questions.nth(0).isEnabled(),true);
    }
    is("FAQ document fits "+name,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   }
   is("FAQ writes intercepted "+width,requests,cases.length);is("FAQ no AI call "+width,aiRequests,0);
  }finally{await context.close();}
 }
}
