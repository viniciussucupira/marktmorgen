export async function checkHomePath({browser,LOCAL,axeSource,is}){
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   const page=await context.newPage();let writes=0;
   await page.route("**/api/**",async route=>{if(route.request().method()!=="GET"){writes++;await route.abort();}else await route.continue();});
   await page.goto(LOCAL+"/",{waitUntil:"domcontentloaded",timeout:60000});
   const s=page.getByRole("region",{name:"Your next step, checked against real facts",exact:true});await s.scrollIntoViewIfNeeded();
   is("home shows actual seven missions "+width,await s.locator("li").count(),7);
   is("each mission identifies creator role "+width,await s.getByText("What you do",{exact:true}).count(),7);
   is("each mission identifies platform check "+width,await s.getByText("What Marktmorgen checks",{exact:true}).count(),7);
   const link=s.getByRole("link",{name:"Read how the Path works",exact:true});is("Path discovery "+width,await link.getAttribute("href"),"/platform/path");await link.focus();is("Path discovery keyboard "+width,await link.evaluate(n=>n===document.activeElement),true);
   is("Path fits "+width,await s.evaluate(n=>n.scrollWidth<=n.clientWidth+1),true);
   await page.addScriptTag({content:axeSource});const issues=await s.evaluate(async n=>(await window.axe.run(n,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa","wcag22aa"]}})).violations.map(v=>v.id));is("home Path accessibility "+width,issues,[]);
   is("home Path makes no API writes "+width,writes,0);
  }finally{await context.close();}
 }
}
