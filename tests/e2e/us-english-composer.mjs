/** Opens the real block picker without adding/saving a block or issuing an AI request. */
export async function checkComposerAmericanEnglish({browser,LOCAL,session,sid,product,is}){
 const context=await browser.newContext();
 try{
  await context.addCookies([{name:"nl_session",value:session,url:LOCAL}]);const page=await context.newPage();
  let writes=0;page.on("request",request=>{if(request.method()==="POST")writes++;});
  await page.goto(LOCAL+"/studio/pages?store="+sid+"&product="+product,{waitUntil:"domcontentloaded",timeout:60000});
  await page.getByRole("button",{name:/^Add a block \(/}).click();
  // Native click delivery may finish before React commits the opened picker.
  // Wait for the actual accessible region and comparison hint, never re-click.
  const picker=page.getByRole("region",{name:/^Add a block /});
  await picker.waitFor({state:"visible"});
  await picker.getByText(/with check marks, crosses or a few words/).waitFor({state:"visible"});
  const text=(await page.locator("main").innerText()).replace(/\s+/g," ");
  is("real comparison picker describes check marks",text.includes("with check marks, crosses or a few words"),true);
  is("old check wording is absent from composer hint",text.includes("with ticks, crosses"),false);
  is("reading composer wording never posts a draft or AI request",writes,0);
 }finally{await context.close();}
}
