import assert from "node:assert/strict";

/** Synthetic local app only; fixture data and intercepted CRM refusals. */
export async function checkGrowthAndContact({owner,LOCAL,abStore,second,contactToken,axeSource}) {
 const growth=await owner.context().newPage();
 try {
  await growth.emulateMedia({reducedMotion:"reduce"});
  for(const width of [320,390,768,1280]) {
   await growth.setViewportSize({width,height:900});
   for(const goal of ["leads","sales","services","retention"]) {
    await growth.goto(LOCAL+"/studio/growth?store="+second+"&goal="+goal,{waitUntil:"domcontentloaded",timeout:60000});
    await growth.getByRole("heading",{name:"Choose your next business goal",exact:true}).waitFor();
    const goals=growth.getByRole("navigation",{name:"Growth goals"});
    assert.equal(await goals.locator('[aria-current="page"]').count(),1);
    const hrefs=await growth.locator('main a').evaluateAll(nodes=>nodes.map(node=>node.getAttribute("href")));
    assert(hrefs.length>=7&&hrefs.every(href=>href&&href.includes("store="+second)),"all growth destinations preserve selected store");
    assert.equal(await growth.locator("main").getByText("Your next steps",{exact:true}).count(),1);
    assert.equal(await growth.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),0);
    await growth.addScriptTag({content:axeSource});
    const scan=await growth.evaluate(async()=>{const result=await window.axe.run(document.querySelector("main"),{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa","wcag22aa"]}});return result.violations.map(rule=>({id:rule.id,targets:rule.nodes.map(node=>node.target)}));});
    assert.deepEqual(scan,[]);
   }
   console.log("  ok    growth4 goals preserve store/selection/AA/fit at "+width);
  }
 } finally {await growth.close();}
 for(const width of [390,1280]) {
  const contact=await owner.context().newPage();
  try {
   await contact.setViewportSize({width,height:900});
   await contact.emulateMedia({reducedMotion:"reduce"});
   const url=LOCAL+"/studio/people?store="+abStore+"&p="+contactToken;
   await contact.goto(url,{waitUntil:"domcontentloaded",timeout:60000});
   const company=contact.getByLabel("Company",{exact:true});
   await company.waitFor();
   const matched=contact.getByText("Contact fields match the last confirmed values.",{exact:true});
   const savedValue="Confirmed company "+width;
   await company.fill(savedValue);
   await Promise.all([contact.waitForResponse(response=>response.url().endsWith("/api/store/crm")&&response.request().method()==="POST"),company.press("Tab")]);
   await matched.waitFor();
   await contact.reload({waitUntil:"domcontentloaded"});
   await company.waitFor();
   assert.equal(await company.inputValue(),savedValue,"real synthetic API save persists through reload");
   let requests=0,mode="refused",releasePending;
   const pendingGate=new Promise(resolve=>{releasePending=resolve;});
   await contact.route("**/api/store/crm",async route=>{
    requests++;
    if(mode==="pending"){await pendingGate;await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({ok:true})});}
    else if(mode==="refused")await route.fulfill({status:400,contentType:"application/json",body:JSON.stringify({ok:false,error:"value"})});
    // Contradictory transport/body cannot be confirmed as saved.
    else await route.fulfill({status:503,contentType:"application/json",body:JSON.stringify({ok:true})});
   });
   const draft="Retained company "+width;
   await company.fill(draft);
   await Promise.all([contact.waitForResponse(response=>response.url().endsWith("/api/store/crm")),company.press("Tab")]);
   await contact.getByText("This field cannot keep that value. Your entry is still here; correct it and try again.",{exact:true}).waitFor();
   assert.equal(await company.inputValue(),draft);
   const save=contact.getByRole("button",{name:"Save Company",exact:true});
   assert.equal(await save.isEnabled(),true);
   mode="pending";
   await Promise.all([contact.waitForRequest(request=>request.url().endsWith("/api/store/crm")),save.click()]);
   assert.equal(await company.isDisabled(),true);
   assert.equal(await contact.getByLabel("Segment",{exact:true}).isDisabled(),true);
   await save.evaluate(node=>{node.click();node.click();});
   assert.equal(requests,2,"one request per refused attempt and explicit retry;pending duplicate blocked");
   releasePending();
   await matched.waitFor();
   assert.equal(await company.inputValue(),draft);
   mode="uncertain";
   await company.fill("Uncertain company "+width);
   await Promise.all([contact.waitForResponse(response=>response.url().endsWith("/api/store/crm")),company.press("Tab")]);
   await contact.getByText("This change could not be confirmed and may already be saved. Keep a copy of your values, then reload and check the contact before trying again. Saving is paused until you reload.",{exact:true}).waitFor();
   assert.equal(await save.isDisabled(),true);
   await company.fill("Keep this copy "+width);
   await company.press("Tab");
   await save.evaluate(node=>node.click());
   assert.equal(requests,3,"uncertain write is neither retried nor rolled back");
   assert.equal(await company.inputValue(),"Keep this copy "+width);
   await contact.evaluate(href=>{const link=document.createElement("a");link.id="fixture-leave-contact";link.href=href;link.textContent="Synthetic leave";document.body.append(link);},LOCAL+"/studio?store="+abStore);
   const dialogEvent=contact.waitForEvent("dialog");
   const navigation=contact.locator("#fixture-leave-contact").click();
   const dialog=await dialogEvent;
   assert.equal(dialog.type(),"confirm");
   await dialog.dismiss();
   await navigation;
   assert.equal(contact.url(),url,"declined departure preserves uncertain values");
   assert.equal(await company.inputValue(),"Keep this copy "+width);
   assert.equal(await contact.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),0);
   await contact.addScriptTag({content:axeSource});
   const violations=await contact.evaluate(async()=>{const result=await window.axe.run(document.querySelector("main"),{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa","wcag22aa"]}});return result.violations.map(rule=>rule.id);});
   assert.deepEqual(violations,[]);
   console.log("  ok    contact real-save/reload/refusal/retry/pending/uncertain/leave guard/AA/fit at "+width);
  } finally {await contact.close({runBeforeUnload:false});}
 }
}
