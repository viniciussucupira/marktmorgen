/** Actual studio pixels, local synthetic demo content only. Never signs in to production. */
export async function captureHomeStudio({browser,LOCAL,fixture,is}){
 if(new URL(LOCAL).hostname!=="127.0.0.1")throw Error("Captures require local synthetic services.");
 const context=await browser.newContext({viewport:{width:1280,height:820},deviceScaleFactor:1});
 try{
  await context.addCookies([{name:"nl_session",value:fixture.session,url:LOCAL}]);
  const page=await context.newPage();let writes=0;
  await page.route("**/api/**",async route=>{if(route.request().method()!=="GET"){writes++;await route.abort();}else await route.continue();});
  for(const [name,path] of [["store","/studio?store="+fixture.sid],["sales-page","/studio/pages?store="+fixture.sid+"&product="+fixture.product]]){
   await page.goto(LOCAL+path,{waitUntil:"domcontentloaded",timeout:60000});
   await page.locator("main h1").waitFor({state:"visible"});
   await page.evaluate(()=>document.fonts.ready);
   is("home capture uses real studio "+name,new URL(page.url()).pathname.startsWith("/studio"),true);
   const image=await page.screenshot({type:"jpeg",quality:70,clip:{x:0,y:0,width:1280,height:820}});
   is("home capture byte ceiling "+name,image.length<=140000,true);
   console.log("HOME_STUDIO_CAPTURE:"+name+":"+image.toString("base64"));
  }
  is("home captures make no API writes",writes,0);
 }finally{await context.close();}
}
