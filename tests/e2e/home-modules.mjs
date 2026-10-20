/** Public module links, keyboard and responsive semantics; no writes. */
export async function checkHomeModules({browser,LOCAL,axeSource,is}){
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   const page=await context.newPage();let writes=0;
   await page.route("**/api/**",async route=>{if(route.request().method()!=="GET"){writes++;await route.abort();}else await route.continue();});
   await page.goto(LOCAL+"/",{waitUntil:"domcontentloaded",timeout:60000});
   const section=page.getByRole("region",{name:"Everything in one place",exact:true});
   await section.scrollIntoViewIfNeeded();
   is("home shows all14 factual modules "+width,await section.locator("li").count(),14);
   const links=section.locator("li a");
   for(const link of await links.all()){await link.focus();is("module link focus "+width,await link.evaluate(node=>node===document.activeElement),true);}
   is("home module section fits "+width,await section.evaluate(node=>node.scrollWidth<=node.clientWidth+1),true);
   await page.addScriptTag({content:axeSource});
   const audit=await section.evaluate(async node=>(await window.axe.run(node,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}})).violations.map(v=>v.id));
   is("home module accessibility "+width,audit,[]);
   is("module calculator link "+width,await section.locator('a[href="/pricing#calculator-heading"]').count(),1);
   is("home module reading makes no API write "+width,writes,0);
  }finally{await context.close();}
 }
}
