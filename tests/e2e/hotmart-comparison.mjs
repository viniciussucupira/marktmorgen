export async function checkHotmartComparison({browser,LOCAL,axeSource,is}){
 for(const width of [390,1280]){
 const context=await browser.newContext({viewport:{width,height:1000}});const page=await context.newPage();let writes=0;
 await page.route("**/api/**",route=>{if(!["GET","HEAD"].includes(route.request().method())){writes++;return route.abort();}return route.continue();});
 const reply=await page.goto(LOCAL+"/proof/hotmart");is("Hotmart comparison responds "+width,reply.status(),200);
 const body=await page.locator("main").innerText();
 for(const phrase of ["Payout timing","15 calendar days","does not mean an instant payout","Branding and domains","domain customization","Ecosystem and portability","do not transfer live subscriptions","Where they are ahead","not open yet"])is("Hotmart scope "+phrase+" "+width,body.includes(phrase),true);
 is("Hotmart Stripe source exists "+width,await page.locator('a[href="https://docs.stripe.com/payouts"]').count(),1);
 is("Hotmart Club source exists "+width,await page.locator('a[href="https://solutions.hotmart.com/update-your-members-area"]').count(),1);
 is("Hotmart comparison fits viewport "+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.addScriptTag({content:axeSource});const result=await page.evaluate(async()=>await window.axe.run(document.querySelector("main"),{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa","wcag22aa"]}}));
 if(result.violations.length)console.log("HT4_AXE_DETAILS",JSON.stringify(result.violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary,html:n.html}))}))));
 is("Hotmart comparison accessibility "+width,result.violations.map(v=>v.id),[]);is("Hotmart comparison performs no API writes "+width,writes,0);await context.close();
 }
}
