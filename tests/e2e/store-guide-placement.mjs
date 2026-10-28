/** Real hydrated store page; guide replies intercepted locally, no external AI/email/payment. */
export async function checkGuidePlacement({browser,LOCAL,fixture,axeSource,is}){
 const local=new URL(LOCAL);
 if(local.protocol!=="http:"||!["localhost","127.0.0.1"].includes(local.hostname)||!local.port)throw Error("Guide checks require synthetic local services");
 for(const viewport of [{width:390,height:844},{width:1280,height:720}]){
  const context=await browser.newContext({viewport,serviceWorkers:"block"});
  try{
   const page=await context.newPage();let calls=0,otherWrites=0;const first=fixture.products[0];
   await page.route("**/api/**",async route=>{
    const request=route.request(),url=new URL(request.url());
    if(url.origin===local.origin&&url.pathname==="/api/store/guide"&&request.method()==="POST"){
     calls++;const body=request.postDataJSON();
     is("ME1 guide keeps store handle "+viewport.width,body.handle,fixture.handle);
     return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({ok:true,picks:body.goal==="a trip to the moon"?[]:[{title:first.title,href:"/@"+fixture.handle+"/p/"+first.id,price:"$10",why:"A synthetic catalog match."}]})});
    }
    if(!["GET","HEAD"].includes(request.method())){otherWrites++;return route.abort();}
    return route.continue();
   });
   await page.goto(LOCAL+"/@"+fixture.handle,{waitUntil:"networkidle",timeout:60000});
   const guide=page.getByRole("region",{name:"Not sure which one is for you?",exact:true});
   await guide.waitFor({state:"visible"});await page.evaluate(()=>document.fonts.ready);
   const placement=await guide.evaluate(node=>{
    const products=[...document.querySelectorAll('[data-part="products"] li[data-item^="p:"]')],last=products.at(-1);
    return {count:products.length,reading:Boolean(last&&(last.compareDocumentPosition(node)&Node.DOCUMENT_POSITION_FOLLOWING)),visual:Boolean(last&&node.getBoundingClientRect().top>=last.getBoundingClientRect().bottom)};
   });
   is("ME1 guide after actual catalog "+viewport.width,placement,{count:3,reading:true,visual:true});
   await guide.getByLabel("What are you looking for?").fill("dinners for a busy family");
   await guide.getByRole("button",{name:"Help me choose",exact:true}).click();
   await guide.locator(".st-guide-pick").waitFor();
   is("ME1 guide recommendation still opens own product "+viewport.width,await guide.locator(".st-guide-pick").getAttribute("href"),"/@"+fixture.handle+"/p/"+first.id);
   await guide.getByLabel("What are you looking for?").fill("a trip to the moon");
   await guide.getByRole("button",{name:"Help me choose",exact:true}).click();
   await guide.getByText(/nothing Guide placement fixture sells fits that yet/).waitFor();
   is("ME1 guide no-match removes old recommendation "+viewport.width,await guide.locator(".st-guide-pick").count(),0);
   is("ME1 guide two synthetic replies "+viewport.width,calls,2);
   is("ME1 guide no unhandled writes "+viewport.width,otherWrites,0);
   await page.addScriptTag({content:axeSource});
   const issues=await guide.evaluate(async node=>(await window.axe.run(node,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa","wcag22aa"]}})).violations.map(v=>v.id));
   is("ME1 moved guide accessibility "+viewport.width,issues,[]);
  }finally{await context.close();}
 }
}
