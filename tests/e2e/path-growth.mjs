/** Synthetic authenticated Path page, with the local provider list only. */
export async function checkPostSalePath({browser,LOCAL,services,session,sid,product,axeSource,is}){
 services.seedPathGrowth("growthpath",product);
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 try{
  await context.addCookies([{name:"nl_session",value:session,url:LOCAL}]);
  const page=await context.newPage();
  const errors=[];page.on("pageerror",error=>errors.push(String(error)));
  let manualCompletions=0;
  page.on("request",request=>{if(request.method()==="POST"&&request.url().includes("/api/store/path"))manualCompletions++;});
  for(const width of [390,1280]){
   await page.setViewportSize({width,height:900});
   await page.goto(LOCAL+"/studio/path?store="+sid,{waitUntil:"domcontentloaded",timeout:60000});
   const section=page.locator('section[aria-labelledby="path-growth-title"]');
   await section.getByRole("heading",{name:"After your first sale",exact:true}).waitFor().catch(async error=>{console.error("Synthetic post-sale Path state:",(await page.locator("body").innerText()).slice(-6000));throw error;});
   is("six post-sale missions at "+width,await section.locator(":scope > ul > li").count(),6);
   is("two recorded facts at "+width,await section.getByText("Recorded",{exact:true}).count(),2);
   is("four next steps at "+width,await section.getByText("Ready when you are",{exact:true}).count(),4);
   is("no completion checkboxes at "+width,await section.locator('input[type="checkbox"]').count(),0);
   const email=section.locator("li").filter({has:page.getByRole("heading",{name:"Send your first list email",exact:true})});
   await email.locator("summary").focus();await page.keyboard.press("Enter");
   is("native disclosure opens by keyboard at "+width,await email.locator("details").getAttribute("open"),"");
   const href=new URL(await email.getByRole("link",{name:"Review this in your studio",exact:true}).getAttribute("href"),LOCAL);
   is("email link keeps this store at "+width,href.searchParams.get("store"),sid);
   is("email destination at "+width,href.pathname,"/studio/email");
   is("instructions do not complete the mission at "+width,await email.getByText("Ready when you are",{exact:true}).isVisible(),true);
   is("post-sale page fits at "+width,await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),0);
   await page.addScriptTag({content:axeSource});
   const violations=await page.evaluate(async()=>{const report=await window.axe.run(document.querySelector('section[aria-labelledby="path-growth-title"]'),{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"]}});return report.violations.map(rule=>({id:rule.id,targets:rule.nodes.map(node=>node.target)}));});
   is("post-sale accessibility checks at "+width,violations,[]);
  }
  is("viewing instructions never posts completion",manualCompletions,0);
  is("post-sale page errors",errors,[]);
 }finally{await context.close();}
}
