/** Native page text, excluding comments and persisted identifiers. No writes or provider calls. */
export async function checkPublicAmericanEnglish({browser,LOCAL,is}){
 const context=await browser.newContext();
 try{
  const page=await context.newPage();
  const cases=[["/","Canceling is two clicks in your studio"],["/mission","but not a checkbox"],["/help","with revenue only if you select it"],["/privacy","members wrote when canceling"],["/platform/calls","select who hosts it"],["/platform/email","buttons in your store\'s color"],["/platform/insights","reason for canceling"],["/platform/bundles","buyer selects that many"],["/platform/sales-pages","with check marks, crosses"]];
  for(const [path,expected] of cases){
   await page.goto(LOCAL+path,{waitUntil:"domcontentloaded",timeout:60000});
   await page.locator("main details").evaluateAll(nodes=>nodes.forEach(node=>{node.open=true;}));
   const text=(await page.locator("main").innerText()).replace(/\s+/g," ");
   is("reviewed US-English wording "+path,text.includes(expected),true);
   is("reviewed visible text has no selected British forms "+path,/\b(?:cancelling|colour|licence|afterwards|untick(?:ed|ing|s)?|tick(?:ed|ing|s)?)\b/i.test(text),false);
  }
 }finally{await context.close();}
}

export async function checkStudioAmericanEnglish({browser,LOCAL,session,sid,is}){
 const context=await browser.newContext();
 try{
  await context.addCookies([{name:"nl_session",value:session,url:LOCAL}]);const page=await context.newPage();
  for(const [query,expected] of [["declined","Meta's page was closed or canceled. Connect again when you are ready."],["permission","leave “Read your ads” selected on Meta's page."]]){
   await page.goto(LOCAL+"/studio?store="+sid+"&metaads="+query,{waitUntil:"domcontentloaded",timeout:60000});
   const text=(await page.locator("main").innerText()).replace(/\s+/g," ");
   is("US-English Meta notice "+query,text.includes(expected),true);
  }
  await page.goto(LOCAL+"/studio/affiliates?store="+sid,{waitUntil:"domcontentloaded",timeout:60000});
  await page.locator("main details").evaluateAll(nodes=>nodes.forEach(node=>{node.open=true;}));
  const text=(await page.locator("main").innerText()).replace(/\s+/g," ");
  is("US-English affiliate attribution explanation",text.includes("however many links they follow afterward"),true);
  is("reviewed affiliate copy omits British forms",/\b(?:afterwards|tick(?:ed|ing|s)?)\b/i.test(text),false);
 }finally{await context.close();}
}
