/** HT2 public journey: existing feature pages only; local GETs, no signup or checkout. */
export async function checkCreatorJourney({browser,LOCAL,axeSource,is}){
 const titles=["Create","Charge","Deliver","Sell more","Automate","Grow"];
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:1000}});
  try{
   const page=await context.newPage();let writes=0;
   await page.route("**/api/**",async route=>{if(route.request().method()!=="GET"){writes++;await route.abort();}else await route.continue();});
   await page.goto(LOCAL+"/platform",{waitUntil:"domcontentloaded",timeout:60000});
   const journey=page.locator("[data-creator-journey]");
   is("HT2 stage order "+width,await journey.locator("h3").allInnerTexts(),titles);
   is("HT2 six ordered stages "+width,await journey.locator(":scope > ol > li").count(),6);
   is("HT2 closed-sale notice "+width,(await page.locator("[data-journey-closed]").innerText()).includes("Paid selling is not open yet."),true);
   const seen=new Set();
   for(const link of await journey.locator('a[href^="/platform/"]').all()){
    const href=await link.getAttribute("href");is("HT2 internal feature path "+width,/^\/platform\/[a-z0-9-]+$/.test(href),true);
    await link.focus();is("HT2 feature keyboard focus "+href+"/"+width,await link.evaluate(node=>node===document.activeElement),true);
    is("HT2 feature target "+href+"/"+width,await link.evaluate(node=>node.getBoundingClientRect().height>=44),true);
    if(!seen.has(href)){seen.add(href);const response=await page.request.get(LOCAL+href);is("HT2 existing feature response "+href+"/"+width,response.status(),200);}
   }
   is("HT2 all eighteen factual feature links "+width,await journey.locator('a[href^="/platform/"]').count(),18);
   is("HT2 catalog preserved "+width,await page.getByRole("region",{name:"The feature catalog",exact:true}).count(),1);
   is("HT2 creator choices preserved "+width,await page.getByRole("heading",{name:"By kind of creator",exact:true}).count(),1);
   const browse=journey.getByRole("link",{name:"Browse every feature",exact:true});
   is("HT2 existing catalog anchor "+width,await browse.getAttribute("href"),"#catalogue-title");
   await Promise.all([page.waitForURL(url=>url.hash==="#catalogue-title"),browse.click()]);is("HT2 catalog anchor navigation "+width,new URL(page.url()).hash,"#catalogue-title");
   is("HT2 catalog target receives keyboard focus "+width,await page.locator("#catalogue-title").evaluate(node=>node===document.activeElement),true);
   is("HT2 journey fits "+width,await journey.evaluate(node=>node.scrollWidth<=node.clientWidth+1),true);
   is("HT2 page fits "+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   // The fragment and focus change before a pointer-led smooth scroll finishes.
   // Audit the settled destination, rather than a frame moving under the sticky header.
   const settled=await page.evaluate(async()=>{
    const target=document.getElementById("catalogue-title");if(!target)return false;
    const deadline=performance.now()+5000;let lastY=NaN,stable=0;
    while(performance.now()<deadline){
     await new Promise(resolve=>requestAnimationFrame(resolve));
     const rect=target.getBoundingClientRect();
     stable=Math.abs(scrollY-lastY)<0.5&&rect.top>=64&&rect.bottom<=innerHeight?stable+1:0;
     lastY=scrollY;if(stable>=8)return true;
    }
    return false;
   });
   is("HT2 catalog scroll settles clear of header "+width,settled,true);
   await page.addScriptTag({content:axeSource});
   const violations=await journey.evaluate(async node=>(await window.axe.run(node,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa","wcag22aa"]}})).violations.map(v=>({id:v.id,nodes:v.nodes.slice(0,20).map(n=>({target:n.target,summary:n.failureSummary}))})));
   if(violations.length)console.error("HT2_ACCESSIBILITY_DIAGNOSTIC:"+JSON.stringify({width,scroll:await page.evaluate(()=>({x:scrollX,y:scrollY})),violations,targets:await journey.locator("a").evaluateAll(nodes=>nodes.map(node=>{const r=node.getBoundingClientRect();return {label:node.textContent?.trim(),x:r.x,y:r.y,width:r.width,height:r.height};}))}));
   const audit=violations.map(v=>v.id);
   is("HT2 journey accessibility "+width,audit,[]);
   is("HT2 no API write "+width,writes,0);
  }finally{await context.close();}
 }
}
