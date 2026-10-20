export async function checkEvergreenGuides({browser,LOCAL,is,axeSource}){
 const slugs=["sell-a-digital-file-from-your-bio","plan-an-online-course-before-you-record","plan-a-membership-you-can-deliver","sell-paid-sessions-with-clear-booking-terms","start-a-creator-affiliate-program-with-clear-terms"];
 for(const width of [390,1280]){
 const context=await browser.newContext({viewport:{width,height:1000}});try{
 const page=await context.newPage();let writes=0;await page.route("**/api/**",route=>{if(!["GET","HEAD"].includes(route.request().method())){writes++;return route.abort();}return route.continue();});
 await page.goto(LOCAL+"/blog");
 is("HT12 cluster discovery "+width,await page.locator("[data-creator-guides] a").count(),5);
 for(const slug of slugs){
 const reply=await page.goto(LOCAL+"/blog/"+slug);is("HT12 guide available "+slug+"/"+width,reply.status(),200);
 const faq=page.locator("[data-article-faq]");is("HT12 visible FAQ "+slug+"/"+width,await faq.locator("dt").count(),3);
 const data=await page.locator('script[type="application/ld+json"]').evaluateAll(nodes=>nodes.map(node=>JSON.parse(node.textContent)).find(data=>data["@type"]==="FAQPage"));
 const questions=await faq.locator("dt").allInnerTexts(),answers=await faq.locator("dd").allInnerTexts();
 is("HT12 schema questions equal visible copy "+slug+"/"+width,data.mainEntity.map(item=>item.name),questions);
 is("HT12 schema answers equal visible copy "+slug+"/"+width,data.mainEntity.map(item=>item.acceptedAnswer.text),answers);
 is("HT12 related cluster links "+slug+"/"+width,await page.getByRole("navigation",{name:"More creator guides",exact:true}).locator("a").count(),4);
 is("HT12 existing start CTA "+slug+"/"+width,await page.getByRole("link",{name:"Start your store",exact:true}).count()>=1,true);
 is("HT12 paid availability honest "+slug+"/"+width,(await page.locator("main").innerText()).includes("Paid plans and paid selling remain closed."),true);
 is("HT12 guide fits "+slug+"/"+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.addScriptTag({content:axeSource});const audit=await page.evaluate(async()=>await window.axe.run(document.querySelector("main"),{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa","wcag22aa"]}}));is("HT12 guide accessibility "+slug+"/"+width,audit.violations.map(v=>v.id),[]);
 }
 is("HT12 no signup/payment/AI write "+width,writes,0);
 }finally{await context.close();}
 }
}
