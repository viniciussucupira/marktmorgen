/** The actual public email page; no sending, saving, account or provider action. */
export async function checkEmailCapabilities({browser,LOCAL,is}){
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   const page=await context.newPage();let writes=0;
   await page.route("**/api/**",async route=>{
    if(route.request().method()!=="GET"&&route.request().method()!=="HEAD"){writes++;await route.abort("failed");return;}
    await route.continue();
   });
   await page.goto(LOCAL+"/platform/email",{waitUntil:"domcontentloaded",timeout:60000});
   const text=(await page.locator("main").innerText()).replace(/\s+/g," ");
   is("public email page describes its existing templates "+width,text.includes("Four templates to start from"),true);
   is("email limitation explains its real single-column layout "+width,text.includes("Email layouts use one column. You can start from four templates or design your own with headings, text, lists, buttons, dividers and up to six pictures."),true);
   is("email page never contradicts the existing template feature "+width,/No templates or columns/i.test(text),false);
   is("email capability description fits its viewport "+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   is("reading email capabilities makes no API write "+width,writes,0);
  }finally{await context.close();}
 }
}
