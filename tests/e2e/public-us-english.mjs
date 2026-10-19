/** Native page text, excluding comments and persisted identifiers. No writes or provider calls. */
export async function checkPublicAmericanEnglish({browser,LOCAL,is}){
 const context=await browser.newContext();
 try{
  const page=await context.newPage();
  const cases=[["/","Canceling is two clicks in your studio"],["/mission","but not a checkbox"],["/help","with revenue only if you select it"]];
  for(const [path,expected] of cases){
   await page.goto(LOCAL+path,{waitUntil:"domcontentloaded",timeout:60000});
   await page.locator("main details").evaluateAll(nodes=>nodes.forEach(node=>{node.open=true;}));
   const text=await page.locator("main").innerText();
   is("reviewed US-English wording "+path,text.includes(expected),true);
   is("reviewed visible text has no selected British forms "+path,/\b(?:cancelling|colour|licence|untick|tick)\b/i.test(text),false);
  }
 }finally{await context.close();}
}
