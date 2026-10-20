export async function checkCreatorShowcase({browser,LOCAL,axeSource,is}){
 for(const width of [390,1280]){
 const context=await browser.newContext({viewport:{width,height:1000}});try{
 const page=await context.newPage();let writes=0;await page.route("**/api/**",route=>{if(!["GET","HEAD"].includes(route.request().method())){writes++;return route.abort();}return route.continue();});
 await page.goto(LOCAL+"/");const showcase=page.locator("[data-creator-showcase]");
 is("HT7 demo-only home listing "+width,await showcase.locator("li").count(),1);
 is("HT7 fictional demo labeled "+width,(await showcase.innerText()).includes("Demo — fictional store"),true);
 is("HT7 no real listing claim "+width,(await showcase.innerText()).includes("no real creator listings with recorded permission"),true);
 is("HT7 review date visible "+width,(await showcase.innerText()).includes("2026-10-20"),true);
 const demo=showcase.getByRole("link",{name:"Open the demo store",exact:true});
 is("HT7 existing demo route "+width,await demo.getAttribute("href"),"/demo");
 await demo.focus();is("HT7 keyboard demo "+width,await demo.evaluate(node=>node===document.activeElement),true);
 is("HT7 demo target "+width,await demo.evaluate(node=>node.getBoundingClientRect().height>=44),true);
 const more=showcase.getByRole("link",{name:"About these store listings",exact:true});
 await more.click();await page.waitForURL(url=>url.pathname==="/proof/creator-showcase");
 const main=await page.locator("main").innerText();is("HT7 page permission condition "+width,main.includes("No real creator listing has recorded permission"),true);
 is("HT7 page demo-only listing "+width,await page.locator('main a[href="/demo"]').count(),1);
 is("HT7 no invented result "+width,/earned \$|made \$|customers earned|guaranteed sales/i.test(main),false);
 is("HT7 showcase fits "+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.addScriptTag({content:axeSource});const audit=await page.evaluate(async()=>await window.axe.run(document.querySelector("main"),{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa","wcag22aa"]}}));is("HT7 page accessibility "+width,audit.violations.map(v=>v.id),[]);
 is("HT7 showcase no API writes "+width,writes,0);
 }finally{await context.close();}
 }
}
