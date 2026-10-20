/** HT1: public hero hierarchy and keyboard journey; no account, checkout or API write. */
export async function checkHomeHero({browser,LOCAL,axeSource,is}){
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:1000}});
  try{
   const page=await context.newPage();let writes=0;
   await page.route("**/api/**",async route=>{if(route.request().method()!=="GET"){writes++;await route.abort();}else await route.continue();});
   await page.goto(LOCAL+"/",{waitUntil:"domcontentloaded",timeout:60000});
   const hero=page.locator("[data-home-hero]"),primary=hero.locator("[data-home-primary]");
   is("HT1 one page heading "+width,await page.locator("h1").count(),1);
   is("HT1 creator result "+width,(await hero.locator("h1").innerText()).replace(/\s+/g," ").trim(),"Sell your work. Build your business.");
   is("HT1 ownership pillar retained "+width,(await hero.locator("[data-home-pillar]").innerText()).trim(),"Your store. Your Stripe. Your money.");
   is("HT1 journey shows first sale to next offers "+width,(await hero.locator(".t-lead").innerText()).includes("From your first sale to everything you sell next:"),true);
   is("HT1 one dominant hero action "+width,await hero.locator("a.btn").count(),1);
   is("HT1 primary leads to existing setup "+width,await primary.getAttribute("href"),"/signin");
   const target=await primary.boundingBox();is("HT1 large primary target "+width,Boolean(target&&target.height>=44&&target.width>=160),true);
   const demo=hero.getByRole("link",{name:"See the live demo",exact:true});
   is("HT1 quiet demo remains "+width,await demo.getAttribute("href"),"/demo");
   is("HT1 no guarantee copy "+width,/guaranteed (income|sales|profit)|earn \$|make \$/.test(await hero.innerText()),false);
   is("HT1 closed-sale notice retained "+width,(await hero.innerText()).includes("Not on sale yet."),true);
   for(const action of await page.locator("[data-home-actions]").all()){
    const link=action.getByRole("link",{name:"Start your store",exact:true});
    is("HT1 repeated action consistent "+width,await link.getAttribute("href"),"/signin");
    is("HT1 repeated action large "+width,await link.evaluate(node=>node.getBoundingClientRect().height>=44),true);
   }
   await primary.focus();is("HT1 keyboard primary "+width,await primary.evaluate(node=>node===document.activeElement),true);
   await page.keyboard.press("Tab");is("HT1 keyboard secondary follows "+width,await demo.evaluate(node=>node===document.activeElement),true);
   is("HT1 hero fits "+width,await hero.evaluate(node=>node.scrollWidth<=node.clientWidth+1),true);
   is("HT1 page fits "+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   await page.addScriptTag({content:axeSource});
   const audit=await hero.evaluate(async node=>(await window.axe.run(node,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa","wcag22aa"]}})).violations.map(v=>v.id));
   is("HT1 hero accessibility "+width,audit,[]);
   await page.evaluate(()=>document.fonts.ready);
   const capture=await page.screenshot({type:"jpeg",quality:70});
   is("HT1 capture byte ceiling "+width,capture.length<=140000,true);
   console.log("HOME_HERO_CAPTURE:"+width+":"+capture.toString("base64"));
   await primary.focus();
   const arrival=page.waitForURL(url=>url.pathname==="/signin");await page.keyboard.press("Enter");await arrival;
   is("HT1 keyboard enters setup "+width,new URL(page.url()).pathname,"/signin");
   is("HT1 no API write "+width,writes,0);
  }finally{await context.close();}
 }
}
