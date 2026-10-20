import { checkToolsCalculator } from "./tools-calculator.mjs";
/** Public pricing only: no account, payment or outbound submission. */
export async function checkPricing({browser,LOCAL,axeSource,is}){
 await checkToolsCalculator({browser,LOCAL,is});
 const check=(condition,name)=>is(name,condition,true);
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   const page=await context.newPage();let writes=0;const errors=[];
   page.on("pageerror",error=>errors.push(error.message));
   await page.route("**/api/**",async route=>{if(route.request().method()!=="GET"){writes++;await route.abort();}else await route.continue();});
   await page.goto(LOCAL+"/pricing",{waitUntil:"domcontentloaded"});
   await page.locator("main h1").waitFor({state:"visible"});
   check(new URL(page.url()).pathname==="/pricing","pricing route is not redirected "+width);
   await page.locator('a[href="#content"]').first().focus();await page.keyboard.press("Enter");
   check(await page.locator("main").evaluate(node=>node===document.activeElement),"skip link focuses content "+width);
   check((await page.title()).includes("Pricing"),"pricing title "+width);
   check(await page.locator("main header").getByText("Paid plans and paid selling are not open yet.",{exact:false}).isVisible(),"pricing keeps paid selling closed "+width);
   const text=await page.locator("main").innerText();
   for(const price of ["$69 a month","$449 a month","$999 a month","$690 a year","$4,490 a year","$9,990 a year"])check(text.includes(price),"pricing shows "+price+" "+width);
   check(await page.locator("main a[href='/proof/comparisons']").count()===1,"real comparison destination "+width);
   for(const summary of await page.locator("main summary").all()){
    await summary.focus();await page.keyboard.press("Enter");
    check(await summary.evaluate(node=>node.parentElement.open),"FAQ opens by keyboard "+width);
   }
   check((await page.locator("main").innerText()).includes("Stripe charges its own processing fee"),"processing separate "+width);
   check(await page.locator("main").evaluate(node=>node.scrollWidth<=node.clientWidth+1),"pricing fits viewport "+width);
   await page.addScriptTag({content:axeSource});
   const audit=await page.evaluate(async()=>await window.axe.run(document.querySelector("main"),{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}}));
   check(audit.violations.length===0,"pricing accessibility "+width+" "+audit.violations.map(v=>v.id).join(","));
   check(errors.length===0,"pricing no browser errors "+width);check(writes===0,"pricing no API writes "+width);
  }finally{await context.close();}
 }
}
