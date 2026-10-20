/** Public pricing only: no account, payment or outbound submission. */
export async function checkPricing({browser,LOCAL,axeSource,is}){
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   const page=await context.newPage();let writes=0;const errors=[];
   page.on("pageerror",error=>errors.push(error.message));
   await page.route("**/api/**",async route=>{if(route.request().method()!=="GET"){writes++;await route.abort();}else await route.continue();});
   await page.goto(LOCAL+"/pricing",{waitUntil:"domcontentloaded"});
   await page.locator("main h1").waitFor({state:"visible"});
   await page.locator('a[href="#content"]').first().focus();await page.keyboard.press("Enter");
   is(await page.locator("main").evaluate(node=>node===document.activeElement),"skip link focuses content "+width);
   is((await page.title()).includes("Pricing"),"pricing title "+width);
   is(await page.locator("main").getByText("Paid plans and paid selling are not open yet.",{exact:false}).count()===1,"pricing keeps paid selling closed "+width);
   const text=await page.locator("main").innerText();
   for(const price of ["$69 a month","$449 a month","$999 a month","$690 a year","$4,490 a year","$9,990 a year"])is(text.includes(price),"pricing shows "+price+" "+width);
   is(await page.locator("main a[href='/proof/comparisons']").count()===1,"real comparison destination "+width);
   for(const summary of await page.locator("main summary").all()){
    await summary.focus();await page.keyboard.press("Enter");
    is(await summary.evaluate(node=>node.parentElement.open),"FAQ opens by keyboard "+width);
   }
   is((await page.locator("main").innerText()).includes("Stripe charges its own processing fee"),"processing separate "+width);
   is(await page.locator("main").evaluate(node=>node.scrollWidth<=node.clientWidth+1),"pricing fits viewport "+width);
   await page.addScriptTag({content:axeSource});
   const audit=await page.evaluate(async()=>await window.axe.run(document.querySelector("main"),{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}}));
   is(audit.violations.length===0,"pricing accessibility "+width+" "+audit.violations.map(v=>v.id).join(","));
   is(errors.length===0,"pricing no browser errors "+width);is(writes===0,"pricing no API writes "+width);
  }finally{await context.close();}
 }
}
