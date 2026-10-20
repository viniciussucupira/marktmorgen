export async function checkPartnerCopy({browser,LOCAL,axeSource,is}){
 for(const width of [390,1280]){
 const context=await browser.newContext({viewport:{width,height:1000}});try{
 const page=await context.newPage();let writes=0;await page.route("**/api/**",route=>{if(!["GET","HEAD"].includes(route.request().method())){writes++;return route.abort();}return route.continue();});
 const response=await page.goto(LOCAL+"/ht17-missing-page-synthetic");is("HT17 missing page retains status "+width,response.status(),404);
 const main=page.locator("main");is("HT17 direct missing-page heading "+width,await main.getByRole("heading",{level:1}).innerText(),"We couldn't find this page");
 is("HT17 no invented deletion reason "+width,(await main.innerText()).includes("creator let the address go"),false);
 is("HT17 address next step "+width,(await main.innerText()).includes("Check the address"),true);
 is("HT17 home route "+width,await main.getByRole("link",{name:"Go to the home page",exact:true}).getAttribute("href"),"/");
 is("HT17 help route "+width,await main.locator('a[href="/help"]').count(),1);
 await page.addScriptTag({content:axeSource});const audit=await page.evaluate(async()=>await window.axe.run(document.querySelector("main"),{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa","wcag22aa"]}}));is("HT17 missing-page accessibility "+width,audit.violations.map(v=>v.id),[]);
 is("HT17 missing page fits "+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 is("HT17 no account/message/write "+width,writes,0);
 }finally{await context.close();}
 }
}
