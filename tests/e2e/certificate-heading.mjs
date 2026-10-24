/** Actual local issued/withdrawn certificate pages; no external navigation or submission. */
export async function checkCertificateHeading({browser,LOCAL,fixture,axeSource,is}){
 if(!fixture)throw Error("Missing public-repository synthetic certificate fixture");
 const context=await browser.newContext({serviceWorkers:"block"});
 let writes=0,foreign=0;const errors=[];
 try{
  await context.route("**/*",route=>{
   const request=route.request();
   if(!["GET","HEAD"].includes(request.method())){writes++;return route.abort();}
   if(new URL(request.url()).origin!==new URL(LOCAL).origin){foreign++;return route.abort();}
   return route.continue();
  });
  const page=await context.newPage();page.on("pageerror",error=>errors.push(String(error)));
  for(const width of [390,1280])for(const cert of fixture.certs){
   await page.setViewportSize({width,height:900});
   const response=await page.goto(LOCAL+"/@"+fixture.handle+"/certificate/"+cert.id,{waitUntil:"networkidle",timeout:60000});
   is("certificate page responds "+cert.id+"/"+width,response.status(),200);
   const heading=page.getByRole("heading",{level:1,name:"Certificate of completion",exact:true});
   is("certificate has one native main heading "+cert.id+"/"+width,await page.locator("main h1").count(),1);
   is("certificate visual title is exposed as heading "+cert.id+"/"+width,await heading.isVisible(),true);
   is("student name is unchanged "+cert.id+"/"+width,await page.locator(".cert-name").innerText(),fixture.name);
   is("recorded course title is unchanged "+cert.id+"/"+width,await page.locator(".cert-title").innerText(),fixture.title);
   is("existing withdrawal state is preserved "+cert.id+"/"+width,await page.locator(".cert-withdrawn").count(),cert.withdrawn?1:0);
   is("withdrawn download stays unavailable "+cert.id+"/"+width,await page.locator("a[data-pdf]").count(),cert.withdrawn?0:1);
   is("certificate fits the viewport "+cert.id+"/"+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   await page.addScriptTag({content:axeSource});
   const violations=await page.evaluate(async()=>{const report=await window.axe.run(document,{runOnly:{type:"rule",values:["page-has-heading-one","heading-order"]}});return report.violations.map(rule=>rule.id);});
   is("certificate heading semantics "+cert.id+"/"+width,violations,[]);
  }
  is("viewing certificate does not submit data",writes,0);
  is("certificate test never contacts a third party",foreign,0);
  is("certificate page has no browser error",errors,[]);
 }finally{await context.close();}
}
