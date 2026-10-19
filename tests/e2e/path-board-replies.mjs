import assert from "node:assert/strict";
/** All board POSTs intercepted; actual persistence remains covered by store-copy. */
export async function checkPathBoardReplies({owner,axeSource,joined}){
 const errors=[];
 const pathUrl=owner.url();
 for(const width of [390,1280]){
  const page=await owner.context().newPage();
  page.on("pageerror",error=>errors.push(String(error)));
  let mode="refused",requests=0,release;
  const gate=new Promise(resolve=>{release=resolve;});
  try{
   await page.setViewportSize({width,height:900});
   await page.emulateMedia({reducedMotion:"reduce"});
   await page.route("**/api/store/path*",async route=>{
    if(route.request().method()!=="POST"){await route.continue();return;}
    requests++;
    const body=route.request().postDataJSON();
    assert.equal(body.action,joined?"board_leave":"board_join");
    if(!joined)assert.equal(body.consent,true);
    else assert.equal(Object.hasOwn(body,"consent"),false);
    if(mode==="pending")await gate;
    if(mode==="network"){await route.abort("connectionreset");return;}
    if(mode==="malformed"){await route.fulfill({status:200,contentType:"application/json",body:"{"});return;}
    const [status,bodyOut]=mode==="refused"||mode==="pending"?[409,{ok:false,error:"conflict"}]:mode==="confirmed"?[200,{ok:true}]:[503,{ok:true}];
    await route.fulfill({status,contentType:"application/json",body:JSON.stringify(bodyOut)});
   });
   const region=page.getByRole("region",{name:"Mission board",exact:true});
   const action=region.getByRole("button",{name:joined?"Leave the mission board":"Join the mission board",exact:true});
   const consent=region.getByRole("checkbox");
   async function open(){
    await page.goto(pathUrl,{waitUntil:"domcontentloaded",timeout:60000});
    await action.waitFor();
    if(!joined){
     assert.equal(await consent.isChecked(),false);
     assert.equal(await action.isDisabled(),true);
     await action.evaluate(node=>node.dispatchEvent(new MouseEvent("click",{bubbles:true})));
     assert.equal(requests,0,"no request without explicit consent");
     await consent.check();
    }
   }
   await open();
   await action.click();
   await region.getByRole("status").filter({hasText:"Your Path changed while saving."}).waitFor();
   assert.equal(await action.isEnabled(),true);
   mode="pending";
   await Promise.all([page.waitForRequest(r=>r.method()==="POST"&&r.url().includes("/api/store/path")),action.evaluate(node=>{node.click();node.click();node.click();})]);
   await page.waitForFunction(()=>document.querySelector('[aria-labelledby="path-board-title"]')?.getAttribute("aria-busy")==="true");
   assert.equal(requests,2,"single-flight includes same-event-loop clicks");
   assert.equal(await action.isDisabled(),true);
   if(!joined)assert.equal(await consent.isDisabled(),true);
   release();
   await region.getByRole("status").filter({hasText:"Your Path changed while saving."}).waitFor();
   assert.equal(await action.isEnabled(),true);
   for(const outcome of ["contradiction","malformed","network"]){
    mode=outcome;
    if(outcome!=="contradiction"){
     await page.reload({waitUntil:"domcontentloaded"});await action.waitFor();
     if(!joined){assert.equal(await consent.isChecked(),false);await consent.check();}
    }
    const before=requests;await action.click();
    await region.getByRole("status").filter({hasText:"Your participation change could not be confirmed."}).waitFor();
    assert.equal(await action.isDisabled(),true);
    await action.evaluate(node=>node.dispatchEvent(new MouseEvent("click",{bubbles:true})));
    assert.equal(requests,before+1);
    if(!joined)assert.equal(await consent.isDisabled(),true);
    assert.equal(await region.getByRole("link",{name:"Manage board privacy",exact:true}).isEnabled(),true);
   }
   await page.addScriptTag({content:axeSource});
   const violations=await region.evaluate(async node=>(await window.axe.run(node,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa","wcag22aa"]}})).violations.map(rule=>rule.id));
   assert.deepEqual(violations,[]);
   assert.equal(await region.evaluate(node=>node.scrollWidth<=node.clientWidth),true);
   mode="confirmed";await page.reload({waitUntil:"domcontentloaded"});await action.waitFor();
   if(!joined)await consent.check();
   const before=requests;
   await Promise.all([page.waitForNavigation({waitUntil:"domcontentloaded"}),action.click()]);
   await action.waitFor();
   assert.equal(requests,before+1,"one confirmed request then reload");
   if(!joined)assert.equal(await consent.isChecked(),false,"reload does not persist consent");
   console.log("  ok    Path board "+(joined?"leave":"join")+" consent/single-flight/refusal/uncertainty/reload/AA/fit at "+width);
  }finally{release?.();await page.close();}
 }
 assert.deepEqual(errors,[]);
}
