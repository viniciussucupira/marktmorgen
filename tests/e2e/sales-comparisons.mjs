/** Read-only public comparisons; no accounts, emails, payments or API writes. */
export async function checkSalesComparisons({browser,LOCAL,axeSource,is}){
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   const page=await context.newPage();let writes=0;
   await page.route("**/api/**",async route=>{
    if(route.request().method()!=="GET"){writes++;await route.abort();return;}
    await route.continue();
   });
   for(const slug of ["comparisons","kajabi","skool"]){
    await page.goto(LOCAL+"/proof/"+slug,{waitUntil:"networkidle",timeout:60000});
    await page.locator("main").waitFor();
    // Reveal actual sections before checking their rendered contrast.
    for(const node of await page.locator("main .reveal").all())await node.scrollIntoViewIfNeeded();
    if(slug!=="comparisons"){
     const name=slug==="kajabi"?"Kajabi":"Skool";
     is(name+" search title "+width,await page.title(),"Marktmorgen vs "+name);
     is(name+" search description "+width,(await page.locator('meta[name="description"]').getAttribute("content")).startsWith("A "+name+" alternative where"),true);
     await page.getByRole("heading",{name:"Where they are ahead",exact:true}).scrollIntoViewIfNeeded();
     const sameSize=await page.evaluate(()=>{
      const ahead=document.querySelector("#where-they-are-ahead").closest("section").querySelector("li");
      const row=innerWidth<640?document.querySelector("main section ul dl dd"):document.querySelector("main table td");
      return {ahead:getComputedStyle(ahead).fontSize,row:getComputedStyle(row).fontSize};
     });
     is("competitor advantages have the comparison's text size "+width,sameSize.ahead,sameSize.row);
     is("paid selling closure is visible "+width,(await page.locator("main").innerText()).includes("paid selling are not open yet"),true);
     const source=page.getByRole("link",{name:slug==="kajabi"?/Kajabi pricing and payment fees/:/Skool plans/});
     is("official source is linked "+width,await source.getAttribute("href"),slug==="kajabi"?"https://www.kajabi.com/pricing":"https://www.skool.com/pricing");
    }else{
     is("index links the real Kajabi page "+width,await page.locator('main a[href="/proof/kajabi"]').count(),1);
     is("index links the real Skool page "+width,await page.locator('main a[href="/proof/skool"]').count(),1);
     is("footer links comparison index "+width,await page.locator('footer a[href="/proof/comparisons"]').count(),1);
    }
    await page.addScriptTag({content:axeSource});
    const issues=await page.evaluate(async()=>(await window.axe.run("main",{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22a","wcag22aa"]}})).violations.map(v=>({id:v.id,targets:v.nodes.map(n=>n.target)})));
    is("comparison page axe "+slug+"/"+width,issues,[]);
    is("comparison page fits "+slug+"/"+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
    const start=page.locator("main").getByRole("link",{name:"Start your store",exact:true});
    await start.focus();await page.keyboard.press("Tab");
    is("next keyboard action is the live demo "+slug+"/"+width,await page.evaluate(()=>document.activeElement.getAttribute("href")),"/demo");
    await page.keyboard.press("Shift+Tab");await page.keyboard.press("Enter");
    await page.waitForURL(url=>url.pathname==="/signin");
   }
   is("comparisons never write an API "+width,writes,0);
  }finally{await context.close();}
 }
}
