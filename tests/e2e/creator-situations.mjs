const pages=[
 ["course-creators","photo-1637979910474-38e3ad8d5cab"],
 ["community-builders","photo-1758518730037-a16581a040e8"],
 ["newsletter-writers","photo-1631611114026-8df828ba1ab2"],
 ["consultants-and-mentors","photo-1610050731821-f58da5e8abc6"],
];
export async function checkCreatorSituations({browser,LOCAL,axeSource,is}){
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   const page=await context.newPage();let writes=0,optimized=0;
   await page.route("**/api/**",async route=>{if(route.request().method()!=="GET"){writes++;await route.abort();}else await route.continue();});
   page.on("request",request=>{if(new URL(request.url()).pathname.startsWith("/_next/image"))optimized++;});
   for(const [slug,id] of pages){
    await page.goto(LOCAL+"/for/"+slug,{waitUntil:"domcontentloaded",timeout:60000});
    await page.locator("main h1").waitFor({state:"visible"});
    for(const node of await page.locator("main .reveal").all()){await node.scrollIntoViewIfNeeded();await page.waitForFunction(element=>getComputedStyle(element).opacity==="1",await node.elementHandle(),{timeout:5000});}
    const photo=page.locator('main img[src*="'+id+'"]');
    await page.waitForFunction(element=>element.complete&&element.naturalWidth>0,await photo.elementHandle(),{timeout:15000});
    is("one distinct creator photograph "+slug+" "+width,await page.locator('main img[src*="images.unsplash.com"]').count(),1);
    is("bounded direct image "+slug+" "+width,await photo.evaluate(element=>element.naturalWidth<=1080),true);
    is("stock is not a customer "+slug+" "+width,(await page.locator("main").innerText()).includes("not a customer of ours"),true);
    is("example is not a live store "+slug+" "+width,(await page.locator("main").innerText()).includes("not a customer or a live store"),true);
    is("creator page fits "+slug+" "+width,await page.locator("main").evaluate(node=>node.scrollWidth<=node.clientWidth+1),true);
    is("self-service demo exists "+slug+" "+width,await page.locator("main").getByRole("link",{name:"See the live demo",exact:true}).count()>=1,true);
    await page.addScriptTag({content:axeSource});
    const report=await page.evaluate(async()=>(await window.axe.run(document.querySelector("main"),{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa"]}})).violations.map(v=>v.id));
    is("creator page accessibility "+slug+" "+width,report,[]);
    const primary=page.locator("main").getByRole("link",{name:"Start your store",exact:true}).first();
    await primary.focus();is("creator CTA keyboard focus "+slug+" "+width,await primary.evaluate(element=>element===document.activeElement),true);
   }
   is("creator reading makes no API writes "+width,writes,0);
   is("creator images avoid application image optimization "+width,optimized,0);
  }finally{await context.close();}
 }
}
