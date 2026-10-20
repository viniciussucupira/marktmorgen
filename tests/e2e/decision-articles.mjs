const slugs=["how-much-kajabi-costs-in-2026","skool-fees-explained","kajabi-vs-teachable-vs-marktmorgen"];
export async function checkDecisionArticles({browser,LOCAL,axeSource,is}){
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   const page=await context.newPage();let writes=0,remote=0;
   await page.route("**/api/**",async route=>{if(route.request().method()!=="GET"){writes++;await route.abort();}else await route.continue();});
   page.on("request",request=>{if(new URL(request.url()).origin!==new URL(LOCAL).origin)remote++;});
   for(const slug of slugs){
    await page.goto(LOCAL+"/blog/"+slug,{waitUntil:"domcontentloaded",timeout:60000});
    await page.locator("main h1").waitFor({state:"visible"});
    for(const n of await page.locator("main .reveal").all()){await n.scrollIntoViewIfNeeded();await page.waitForFunction(el=>getComputedStyle(el).opacity==="1",await n.elementHandle(),{timeout:5000});}
    is("article canonical "+slug+"/"+width,await page.locator('link[rel="canonical"]').getAttribute("href").then(x=>x.endsWith("/blog/"+slug)),true);
    const sources=page.getByRole("navigation",{name:"Sources and next steps",exact:true});
    is("dated source links "+slug+"/"+width,await sources.locator('a[href^="https://"]').count()>=1,true);
    is("article links current plan limits "+slug+"/"+width,await sources.locator('a[href="/pricing"]').count(),1);
    for(const a of await sources.getByRole("link").all()){await a.focus();is("source keyboard focus "+slug+"/"+width,await a.evaluate(el=>el===document.activeElement),true);}
    is("article fits "+slug+"/"+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    await page.addScriptTag({content:axeSource});
    const report=await page.evaluate(async()=>(await window.axe.run("main",{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa","wcag22aa"]}})).violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})));
    is("article accessibility "+slug+"/"+width,report,[]);
   }
   await page.goto(LOCAL+"/blog",{waitUntil:"domcontentloaded",timeout:60000});
   for(const category of ["Courses","Community"]){const btn=page.getByRole("button",{name:category,exact:true});await page.waitForFunction(el=>typeof el.onclick==="function",await btn.elementHandle());await btn.focus();await page.keyboard.press("Enter");await page.waitForFunction(el=>el.getAttribute("aria-pressed")==="true",await btn.elementHandle());is("real category has an article "+category+"/"+width,await page.locator('main a[href="/blog/'+(category==="Courses"?slugs[2]:slugs[1])+'"]').count()>=1,true);}
   is("articles make no API writes "+width,writes,0);
   is("reading articles makes no external requests "+width,remote,0);
  }finally{await context.close();}
 }
}
