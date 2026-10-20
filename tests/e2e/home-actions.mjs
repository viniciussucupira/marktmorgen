export async function checkHomeActions({browser,LOCAL,axeSource,is}){
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   const page=await context.newPage();let writes=0;
   await page.route("**/api/**",async route=>{if(route.request().method()!=="GET"){writes++;await route.abort();}else await route.continue();});
   await page.goto(LOCAL+"/",{waitUntil:"domcontentloaded",timeout:60000});
   is("home has five intermediate action pairs "+width,await page.locator("[data-home-actions]").count(),5);
   for(const group of await page.locator("[data-home-actions]").all()){
    await group.scrollIntoViewIfNeeded();const start=group.getByRole("link",{name:"Start your store",exact:true});const demo=group.getByRole("link",{name:"See the live demo",exact:true});
    is("start destination "+width,await start.getAttribute("href"),"/signin");is("demo destination "+width,await demo.getAttribute("href"),"/demo");
    await start.focus();await page.keyboard.press("Tab");is("paired demo follows start "+width,await demo.evaluate(n=>n===document.activeElement),true);
    is("action pair fits "+width,await group.evaluate(n=>n.scrollWidth<=n.clientWidth+1),true);
    await page.addScriptTag({content:axeSource});const issues=await group.evaluate(async n=>(await window.axe.run(n,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa","wcag22aa"]}})).violations.map(v=>v.id));is("action pair accessibility "+width,issues,[]);
   }
   is("home actions make no API writes "+width,writes,0);
  }finally{await context.close();}
 }
}
