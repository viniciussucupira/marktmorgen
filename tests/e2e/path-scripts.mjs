/** Synthetic manual social-script adaptation: no publisher, AI or real clipboard. */
export async function checkPathScripts({browser,LOCAL,session,sid,axeSource,is}){
 const context=await browser.newContext({viewport:{width:1280,height:900}});
 try{
  await context.addCookies([{name:"nl_session",value:session,url:LOCAL}]);
  await context.addInitScript(()=>Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async()=>{throw Error("Synthetic clipboard refusal");}}}));
  const page=await context.newPage(),errors=[];page.on("pageerror",error=>errors.push(String(error)));
  let writes=0,ai=0;
  page.on("request",request=>{if(request.method()==="POST"&&request.url().includes("/api/store/path"))writes++;if(request.url().includes("/api/store/ai"))ai++;});
  for(const width of [390,1280]){
   await page.waitForLoadState("networkidle");
   await page.setViewportSize({width,height:900});
   await page.waitForLoadState("networkidle");
   await page.goto(LOCAL+"/studio/path?store="+sid,{waitUntil:"domcontentloaded",timeout:60000});
   await page.waitForLoadState("networkidle");
   const section=page.locator('section[aria-labelledby="path-scripts-title"]');
   await section.getByRole("heading",{name:"Post scripts you can adapt",exact:true}).waitFor();
   const field=section.getByLabel("Script to adapt",{exact:true});
   is("a public product supplies the first script at "+width,(await field.inputValue()).includes("First guide"),true);
   is("actual script field stays read-only at "+width,await field.getAttribute("readonly")!==null,true);
   const product=section.getByLabel("Product",{exact:true});
   await product.selectOption({label:"Second guide"});
   const platform=section.getByLabel("Platform",{exact:true});
   for(const value of ["instagram","tiktok","youtube"]){
    await platform.selectOption(value);
    const text=await field.inputValue();
    is(value+" uses the selected own product at "+width,text.includes("Second guide"),true);
    is(value+" keeps an explicit review cue at "+width,text.includes("[Add a store or post link you have reviewed.]"),true);
    is(value+" has no personal goal or buyer at "+width,/\$|@example|goal/i.test(text),false);
   }
   await section.getByRole("button",{name:"Copy script",exact:true}).focus();await page.keyboard.press("Enter");
   await section.getByRole("status").filter({hasText:"Script selected. Use your device's copy command."}).waitFor();
   is("clipboard refusal focuses actual script at "+width,await field.evaluate(node=>document.activeElement===node&&node.selectionStart===0&&node.selectionEnd===node.value.length),true);
   is("selection is never reported copied at "+width,await section.getByText("Script copied. Review it before sharing.",{exact:true}).count(),0);
   is("script fits at "+width,await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),0);
   await page.addScriptTag({content:axeSource});
   const violations=await page.evaluate(async()=>{const result=await window.axe.run(document.querySelector('section[aria-labelledby="path-scripts-title"]'),{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"]}});return result.violations.map(rule=>({id:rule.id,targets:rule.nodes.map(node=>node.target)}));});
   is("script controls accessibility at "+width,violations,[]);
   const href=new URL(await section.getByRole("link",{name:"Review products",exact:true}).getAttribute("href"),LOCAL);
   is("product review keeps the own store at "+width,href.searchParams.get("store"),sid);
  }
  await page.waitForLoadState("networkidle");
  is("script selection/copy never records completion",writes,0);
  is("fixed scripts never request AI",ai,0);
  is("script page errors",errors,[]);
 }finally{await context.close();}
}
