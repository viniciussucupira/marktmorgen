import assert from "node:assert/strict";
/** Every reminder POST is intercepted: no push, provider or metered dispatch. */
export async function checkPathReminder({owner,LOCAL,sid,axeSource}){
 const errors=[];
 for(const width of [390,1280]){
  const page=await owner.context().newPage();
  page.on("pageerror",error=>errors.push(String(error)));
  let mode="quiet",requests=0,release;
  const pending=new Promise(resolve=>{release=resolve;});
  try{
   await page.setViewportSize({width,height:900});
   await page.emulateMedia({reducedMotion:"reduce"});
   await page.route("**/api/store/path*",async route=>{
    if(route.request().method()!=="POST"){await route.continue();return;}
    requests++;
    assert.equal(route.request().postDataJSON().action,"remind");
    if(mode==="pending"){await pending;await route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({ok:true,devices:2})});return;}
    if(mode==="network"){await route.abort("connectionreset");return;}
    if(mode==="malformed"){await route.fulfill({status:200,contentType:"application/json",body:"{"});return;}
    const [status,body]=mode==="quiet"?[409,{ok:false,reason:"quiet"}]:mode==="zero"?[200,{ok:true,devices:0}]:mode==="unavailable"?[409,{ok:false,reason:"unavailable"}]:[503,{ok:true,devices:2}];
    await route.fulfill({status,contentType:"application/json",body:JSON.stringify(body)});
   });
   const url=LOCAL+"/studio/path?store="+sid;
   await page.goto(url,{waitUntil:"domcontentloaded",timeout:60000});
   const section=page.getByRole("region",{name:"Take your next mission with you",exact:true});
   await section.waitFor();
   const send=section.getByRole("button",{name:"Send your current mission",exact:true});
   const status=section.getByRole("status");
   assert.equal(await section.getByRole("link",{name:"Choose your devices",exact:true}).getAttribute("href"),"/studio/phone?store="+sid);
   await send.click();
   await page.getByText("Your Path is quiet from 9 p.m. until 8 a.m. in your time zone. Please return after quiet hours.",{exact:true}).waitFor();
   assert.equal(await send.isEnabled(),true,"known pre-dispatch refusal permits an explicit retry");
   mode="pending";
   await Promise.all([
    page.waitForRequest(request=>request.url().includes("/api/store/path")&&request.method()==="POST"),
    send.evaluate(node=>{node.click();node.click();node.click();})
   ]);
   await section.getByRole("button",{name:"Requesting…",exact:true}).waitFor();
   assert.equal(requests,2,"simultaneous clicks start only one additional request");
   assert.equal(await section.getByRole("button").isDisabled(),true);
   release();
   await page.getByText("Reminder requested for 2 of your devices.",{exact:true}).waitFor();
   assert.equal(await send.isEnabled(),true);
   mode="zero";await send.click();
   await page.getByText("No device request was confirmed. Check your device choices, or return tomorrow if you already requested one today.",{exact:true}).waitFor();
   assert.equal(await send.isEnabled(),true);
   for(const outcome of ["contradiction","unavailable","malformed","network"]){
    mode=outcome;
    if(outcome!=="contradiction"){
     await page.reload({waitUntil:"domcontentloaded"});
     await send.waitFor();
    }
    const before=requests;
    await send.click();
    await page.getByText("The reminder request could not be confirmed. It may have gone through. Refresh this page before trying again.",{exact:true}).waitFor();
    assert.equal(await send.isDisabled(),true,"uncertainty pauses further dispatch attempts");
    await send.evaluate(node=>node.dispatchEvent(new MouseEvent("click",{bubbles:true})));
    assert.equal(requests,before+1,"uncertain replies never cause automatic or duplicate retries");
    assert.equal(await status.innerText().then(text=>text.includes("Reminder requested for")),false);
   }
   await page.addScriptTag({content:axeSource});
   const violations=await section.evaluate(async node=>(await window.axe.run(node,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa","wcag22aa"]}})).violations.map(rule=>rule.id));
   assert.deepEqual(violations,[]);
   assert.equal(await section.evaluate(node=>node.scrollWidth<=node.clientWidth),true);
   console.log("  ok    Path reminder transport/pending/single-flight/uncertainty/explicit retry/AA/fit at "+width);
  }finally{release?.();await page.close();}
 }
 assert.deepEqual(errors,[]);
}
