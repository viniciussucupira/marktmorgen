/** Downloads are local HTML with no external resources; no posting or provider calls. */
export async function checkPathCertificates({browser,LOCAL,session,sid,otherSession,axeSource,is}){
 const context=await browser.newContext({acceptDownloads:true});
 try{
  await context.addCookies([{name:"nl_session",value:session,url:LOCAL}]);
  const page=await context.newPage(),errors=[];page.on("pageerror",error=>errors.push(String(error)));
  let writes=0;page.on("request",request=>{if(request.method()==="POST")writes++;});
  for(const width of [390,1280]){
   await page.setViewportSize({width,height:900});
   await page.goto(LOCAL+"/studio/path?store="+sid,{waitUntil:"domcontentloaded",timeout:60000});
   const region=page.getByRole("region",{name:"Your private level certificates",exact:true});
   await region.getByRole("button",{name:"Download certificate",exact:true}).waitFor();
   is("certificate money starts off at "+width,await region.getByRole("checkbox").isChecked(),false);
   const select=region.getByLabel("Reached level",{exact:true}),options=await select.locator("option").evaluateAll(nodes=>nodes.map(node=>({value:node.value,text:node.textContent})));
   is("own live Stripe fixture reaches Sunrise",options.map(option=>option.text),["First Light","Sunrise"]);
   for(const option of options){
    await select.selectOption(option.value);
    const pending=page.waitForEvent("download");
    await region.getByRole("button",{name:"Download certificate",exact:true}).focus();await page.keyboard.press("Enter");
    const download=await pending,stream=await download.createReadStream(),chunks=[];
    for await(const chunk of stream)chunks.push(chunk);
    const html=Buffer.concat(chunks).toString("utf8");
    is("private HTML filename",download.suggestedFilename().endsWith("-certificate.html"),true);
    is("actual downloaded selected level",html.includes("<dd>"+option.text+"</dd>"),true);
    is("download omits sales amount by default",html.includes("Sales kept after refunds:"),false);
    is("no identifying owner or buyer in download",/path-growth-owner|example\.test|Private skill|Private topic/.test(html),false);
    const file=await context.newPage();await file.setContent(html);
    await file.addScriptTag({content:axeSource});
    const violations=await file.evaluate(async()=>{const result=await window.axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"]}});return result.violations.map(rule=>rule.id);});
    is("downloaded certificate accessibility",violations,[]);await file.close();
   }
   await region.getByRole("checkbox").check();
   is("money only after explicit consent",await region.getByLabel("Certificate text",{exact:true}).inputValue().then(text=>text.includes("Sales kept after refunds:")),true);
   is("certificate fits at "+width,await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),0);
   await page.addScriptTag({content:axeSource});
   const violations=await page.evaluate(async()=>{const result=await window.axe.run(document.querySelector('[aria-labelledby="path-certificates-title"]'),{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22aa"]}});return result.violations.map(rule=>rule.id);});
   is("certificate controls accessibility at "+width,violations,[]);
  }
  is("certificate choices and downloads make no server writes",writes,0);
  is("certificate page errors",errors,[]);
 }finally{await context.close();}
 const other=await browser.newContext();
 try{await other.addCookies([{name:"nl_session",value:otherSession,url:LOCAL}]);const page=await other.newPage();await page.goto(LOCAL+"/studio/path?store="+sid,{waitUntil:"domcontentloaded",timeout:60000});is("another owner sees no certificate",await page.getByRole("heading",{name:"Your private level certificates",exact:true}).count(),0);}finally{await other.close();}
}
