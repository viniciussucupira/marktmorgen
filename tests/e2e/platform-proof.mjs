export async function checkPlatformProof({browser,LOCAL,is}){
 for(const width of [390,1280]){
 const context=await browser.newContext({viewport:{width,height:1000}});try{
 const page=await context.newPage();let writes=0;await page.route("**/api/**",route=>{if(!["GET","HEAD"].includes(route.request().method())){writes++;return route.abort();}return route.continue();});
 await page.goto(LOCAL+"/");
 is("HT8 unknown platform counts absent "+width,await page.locator("[data-platform-proof]").count(),0);
 is("HT8 no platform-count API writes "+width,writes,0);
 is("HT8 no invented people-watching claim "+width,/people (are )?watching now|people viewing now/i.test(await page.locator("main").innerText()),false);
 }finally{await context.close();}
 }
}
