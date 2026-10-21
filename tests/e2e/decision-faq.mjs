const questions=[{"q":"How much does it cost?","hrefs":["/pricing"]},{"q":"Is there a contract? Can I cancel anytime?","hrefs":["/terms#closing","/refunds"]},{"q":"Can I move from Kajabi, Stan or another platform?","hrefs":["/platform/switching-to-marktmorgen"]},{"q":"Does it connect to my other tools?","hrefs":["/developers"]},{"q":"Is there support, and how?","hrefs":["/help","mailto:support@marktmorgen.com"]},{"q":"How long does it take to open a store?","hrefs":["/demo","/platform/path"]}];
export async function checkDecisionFaq({browser,LOCAL,axeSource,is}){
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   const page=await context.newPage();let writes=0;
   await page.route("**/api/**",async route=>{if(route.request().method()!=="GET"){writes++;await route.abort();}else await route.continue();});
   for(const path of ["/","/pricing"]){
    await page.goto(LOCAL+path,{waitUntil:"domcontentloaded",timeout:60000});
    const section=path==="/"?page.locator("#faq"):page.locator('section[aria-labelledby="faq-heading"]');
    await section.scrollIntoViewIfNeeded();
    for(const item of questions){
     const control=section.locator("summary").filter({hasText:item.q});
     const disclosure=control.locator("..");
     if(await disclosure.getAttribute("open")===null){await control.focus();await page.keyboard.press("Enter");}
     await page.waitForFunction(el=>el.hasAttribute("open"),await disclosure.elementHandle());
     const answer=path==="/"?page.locator("#"+await control.getAttribute("aria-controls")):disclosure;
     is("FAQ answer visible "+path+"/"+item.q+"/"+width,await answer.isVisible(),true);
     for(const href of item.hrefs){const link=answer.locator('a[href="'+href+'"]');is("FAQ evidence link "+path+"/"+href+"/"+width,await link.count(),1);await link.focus();is("FAQ evidence keyboard focus "+href,await link.evaluate(el=>el===document.activeElement),true);}
    }
    for(const node of await section.locator(".reveal").all()){await node.scrollIntoViewIfNeeded();await page.waitForFunction(el=>getComputedStyle(el).opacity==="1",await node.elementHandle(),{timeout:5000});}
    await page.addScriptTag({content:axeSource});
    const issues=await section.evaluate(async node=>(await window.axe.run(node,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa","wcag22aa"]}})).violations.map(v=>({id:v.id,nodes:v.nodes.map(n=>({target:n.target,summary:n.failureSummary}))})));
    if(path==="/pricing")for(const target of await section.locator("summary,a").all()){const box=await target.boundingBox();if(!box||box.height<44)console.error("FAQ_TARGET_HEIGHT_DIAGNOSTIC:"+JSON.stringify({width,text:await target.innerText(),box,style:await target.evaluate(node=>({minHeight:getComputedStyle(node).minHeight,height:getComputedStyle(node).height,display:getComputedStyle(node).display,transform:getComputedStyle(node).transform}))}));is("pricing FAQ target height "+width+" "+await target.innerText(),Boolean(box&&box.height>=44),true);}
    is("FAQ accessibility "+path+"/"+width,issues,[]);
    is("FAQ fits "+path+"/"+width,await section.evaluate(el=>el.scrollWidth<=el.clientWidth+1),true);
   }
   is("FAQ reading makes no API writes "+width,writes,0);
  }finally{await context.close();}
 }
}
