/** Private UI uses a local synthetic API boundary; no Stripe or bank submission. */
export async function checkDisputeReview({browser,LOCAL,fixture,axeSource,is}){
 const anon=await browser.newContext();
 try{
  const page=await anon.newPage();await page.goto(LOCAL+"/studio/disputes?store="+fixture.sid,{waitUntil:"domcontentloaded"});
  is("DE1 private page requires a session",new URL(page.url()).pathname,"/signin");
  const denied=await anon.request.post(LOCAL+"/api/store/disputes",{headers:{Origin:LOCAL},data:{action:"review",dispute:"du_fixture"}});
  is("DE1 actual signed-out API refusal",denied.status(),401);
  is("DE1 signed-out refusal is private",denied.headers()["cache-control"],"private, no-store");
 }finally{await anon.close();}
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900},serviceWorkers:"block"});
  await context.addCookies([{name:"nl_session",value:fixture.session,url:LOCAL}]);
  let mode="success",reads=0,unexpected=0,foreign=0,release;
  const gate=new Promise(resolve=>{release=resolve;});
  let arrived;const requestArrived=new Promise(resolve=>{arrived=resolve;});
  const title="<img src=x onerror='window.__de1Unexpected=true'>";
  const payload=()=>({ok:true,submitted:false,history:"Historical records not loaded.",reason:"fraudulent",responseDeadline:null,pastDue:null,submissionCount:0,
   binding:{account:"acct_fixture",dispute:mode==="yen"?"du_yen":"du_fixture",purchase:"cs_fixture",charge:"ch_fixture",paymentIntent:"pi_fixture",buyerEmail:"buyer@example.test",product:"a".repeat(32),title,checkoutCreatedAt:100,chargeCreatedAt:200,amount:1000,disputedAmount:500,currency:mode==="yen"?"jpy":"usd"}});
  try{
   const page=await context.newPage();
   await context.route("**/*",async route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.origin!==LOCAL){foreign++;return route.abort();}
    if(url.pathname==="/api/store/disputes"){
     reads++;const body=request.postDataJSON();
     is("DE1 UI lookup only "+width,request.method(),"POST");
     is("DE1 UI action is review "+width,body.action,"review");
     is("DE1 UI pins selected store "+width,request.headers()["x-nimbus-store"],fixture.sid);
     is("DE1 UI never sends account choice "+width,Object.hasOwn(body,"account"),false);
     if(reads===1){arrived();await gate;}
     return route.fulfill({status:mode==="failure"?503:200,contentType:"application/json",headers:{"Cache-Control":"private, no-store"},body:JSON.stringify(mode==="failure"?{ok:false,reason:"unavailable",message:"Synthetic private provider detail"}:payload())});
    }
    if(!["GET","HEAD"].includes(request.method())){unexpected++;return route.abort();}
    return route.continue();
   });
   await page.goto(LOCAL+"/studio/requests?store="+fixture.sid,{waitUntil:"domcontentloaded",timeout:60000});
   const discovery=page.getByRole("link",{name:"Review a disputed purchase",exact:true});
   await discovery.focus();is("DE1 private discovery focus "+width,await discovery.evaluate(node=>node===document.activeElement),true);
   await Promise.all([page.waitForURL(LOCAL+"/studio/disputes?store="+fixture.sid),discovery.click()]);
   is("DE1 authenticated private heading "+width,await page.getByRole("heading",{level:1,name:"Review one disputed purchase",exact:true}).count(),1);
   const input=page.getByLabel("Stripe dispute reference",{exact:true});
   await input.fill("du_fixture");
   const inputBox=await input.boundingBox();is("DE1 input target at least44px "+width,Boolean(inputBox&&inputBox.height>=44&&inputBox.width>=44),true);
   await page.keyboard.press("Tab");
   is("DE1 review keyboard target "+width,await page.getByRole("button",{name:"Review purchase record",exact:true}).evaluate(node=>node===document.activeElement),true);
   await page.keyboard.press("Shift+Tab");
   is("DE1 input has visible keyboard focus "+width,await input.evaluate(node=>{const s=getComputedStyle(node);return node===document.activeElement&&s.outlineStyle!=="none"&&parseFloat(s.outlineWidth)>=2;}),true);
   await page.keyboard.press("Tab");
   let timer;try{await page.keyboard.press("Enter");await Promise.race([requestArrived,new Promise((_,reject)=>{timer=setTimeout(()=>reject(Error("Synthetic lookup not requested")),10000);})]);}finally{clearTimeout(timer);}
   is("DE1 pending review prevents duplicate activation "+width,await page.getByRole("button",{name:"Reviewing purchase…",exact:true}).isDisabled(),true);
   release();
   const result=page.getByRole("region",{name:"Purchase record",exact:true});await result.waitFor({state:"visible"});
   await page.waitForFunction(()=>document.activeElement?.getAttribute("aria-labelledby")==="dispute-result-heading");
   is("DE1 result receives focus "+width,await result.evaluate(node=>node===document.activeElement),true);
   is("DE1 provider title stays text "+width,await result.getByText(title,{exact:true}).count(),1);
   is("DE1 provider markup never becomes HTML "+width,await result.locator("img").count(),0);
   is("DE1 no injected script "+width,await page.evaluate(()=>window.__de1Unexpected===true),false);
   const field=label=>result.getByText(label,{exact:true}).locator("..").locator("dd");
   is("DE1 captured USD amount "+width,(await field("Captured amount").innerText()).trim(),"$10");
   is("DE1 unknown deadline remains unknown "+width,(await field("Response deadline reported by Stripe").innerText()).trim(),"Unknown");
   is("DE1 zero submissions stays a known zero "+width,(await field("Previous submissions reported by Stripe").innerText()).trim(),"0");
   is("DE1 no bank submission button "+width,await page.getByRole("button",{name:/submit evidence|send evidence/i}).count(),0);
   await page.addScriptTag({content:axeSource});
   is("DE1 private result accessibility "+width,await page.locator("main").evaluate(async node=>(await window.axe.run(node,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}})).violations.map(v=>v.id)),[]);
   is("DE1 private result fits "+width,await page.evaluate(()=>document.documentElement.scrollWidth<=document.documentElement.clientWidth+1),true);
   mode="failure";await input.fill("du_fixture");await input.press("Enter");
   const alert=page.locator("main").getByRole("alert");await alert.waitFor({state:"visible"});
   await page.waitForFunction(()=>document.activeElement?.getAttribute("role")==="alert");
   is("DE1 error receives focus "+width,await alert.evaluate(node=>node===document.activeElement),true);
   is("DE1 stale buyer record removed on failure "+width,await page.getByText("buyer@example.test",{exact:true}).count(),0);
   is("DE1 provider error remains private "+width,await page.getByText("Synthetic private provider detail",{exact:true}).count(),0);
   mode="yen";await input.fill("du_yen");await input.press("Enter");await result.waitFor({state:"visible"});
   is("DE1 zero-decimal money stays in yen "+width,(await field("Captured amount").innerText()).trim(),"¥1,000");
   is("DE1 exactly three requested local reviews "+width,reads,3);
   is("DE1 no unexpected writes "+width,unexpected,0);is("DE1 no foreign requests "+width,foreign,0);
  }finally{release();await context.close();}
 }
}
