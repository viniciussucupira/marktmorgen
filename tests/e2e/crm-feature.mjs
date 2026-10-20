export async function checkCrmFeature({browser,LOCAL,axeSource,is}){
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   const page=await context.newPage();let writes=0;
   await page.route("**/api/**",async route=>{if(route.request().method()!=="GET"){writes++;await route.abort();}else await route.continue();});
   await page.goto(LOCAL+"/platform/crm",{waitUntil:"domcontentloaded",timeout:60000});
   await page.locator("main h1").waitFor({state:"visible"});
   for(const node of await page.locator("main .reveal").all()){await node.scrollIntoViewIfNeeded();await page.waitForFunction(element=>getComputedStyle(element).opacity==="1",await node.elementHandle(),{timeout:5000});}
   is("CRM heading "+width,(await page.locator("main h1").innerText()).replace(/\s+/g," ").trim(),"People, deals and pipelines");
   const text=await page.locator("main").innerText();
   for(const fact of ["not a forecast","not permission to send marketing","SMS, WhatsApp"])is("CRM factual scope "+fact+" "+width,text.includes(fact),true);
   is("CRM fits viewport "+width,await page.locator("main").evaluate(node=>node.scrollWidth<=node.clientWidth+1),true);
   await page.addScriptTag({content:axeSource});
   const audit=await page.evaluate(async()=>(await window.axe.run(document.querySelector("main"),{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}})).violations.map(v=>v.id));
   is("CRM accessibility "+width,audit,[]);
   for(const link of await page.locator('main a[href="/proof/highlevel"],main a[href="/pricing"]').all()){await link.focus();is("CRM related link focus "+width,await link.evaluate(node=>node===document.activeElement),true);}
   is("CRM reading makes no API write "+width,writes,0);
   await page.goto(LOCAL+"/",{waitUntil:"domcontentloaded",timeout:60000});
   is("home links the actual CRM page "+width,await page.locator('[aria-labelledby="home-modules-heading"] a[href="/platform/crm"]').count(),1);
  }finally{await context.close();}
 }
}
