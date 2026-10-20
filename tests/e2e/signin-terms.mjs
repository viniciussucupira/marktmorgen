export async function checkSigninTerms({browser,LOCAL,prices,axeSource,is}){
 for(const width of [390,1280]){
 const context=await browser.newContext({viewport:{width,height:1000}});try{
 const page=await context.newPage();let posts=0;await page.route("**/api/**",route=>{if(!["GET","HEAD"].includes(route.request().method())){posts++;return route.abort();}return route.continue();});
 await page.goto(LOCAL+"/signin");const terms=page.locator("[data-signin-terms]");
 is("HT6 monthly prices before free setup "+width,await terms.locator("h2").innerText(),"Monthly plan prices");
 for(const price of prices)is("HT6 canonical monthly price "+price.tier+" "+width,(await terms.locator('[data-signin-price="'+price.tier+'"]').innerText()).includes(price.words),true);
 is("HT6 no card to start "+width,(await terms.innerText()).includes("Store setup starts without a card."),true);
 is("HT6 setup does not sell a plan "+width,(await terms.innerText()).includes("not a free paid plan or an active trial"),true);
 is("HT6 one human field "+width,await page.locator("form input:visible").count(),1);
 is("HT6 human field is email "+width,await page.locator("form input:visible").getAttribute("type"),"email");
 is("HT6 truthful form CTA "+width,await page.getByRole("button",{name:"Email me a link",exact:true}).count(),1);
 is("HT6 no card or password input "+width,await page.locator('input[type="password"],input[autocomplete^="cc-"]').count(),0);
 is("HT6 terms before form "+width,await terms.evaluate(node=>!!(node.compareDocumentPosition(document.querySelector("form"))&Node.DOCUMENT_POSITION_FOLLOWING)),true);
 await page.addScriptTag({content:axeSource});const audit=await page.evaluate(async()=>await window.axe.run(document.querySelector("main"),{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa","wcag22aa"]}}));
 is("HT6 signup accessibility "+width,audit.violations.map(v=>v.id),[]);
 is("HT6 signup fits "+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
 await page.goto(LOCAL+"/signin?to=login");is("HT6 returning title "+width,await page.locator("h1").innerText(),"Log in to your store");
 is("HT6 returning flow stays focused "+width,await page.locator("[data-signin-terms]").count(),0);
 is("HT6 no login request or submission "+width,posts,0);
 }finally{await context.close();}
 }
}
