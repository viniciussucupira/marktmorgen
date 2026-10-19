import assert from "node:assert/strict";
/** Clipboard is a local stand-in; no post, message or provider request is made. */
export async function checkPathCardText({owner,axeSource}){
 const url=owner.url(),errors=[];
 for(const width of [390,1280]){
  const page=await owner.context().newPage();
  page.on("pageerror",error=>errors.push(String(error)));
  try{
   await page.setViewportSize({width,height:900});
   await page.emulateMedia({reducedMotion:"reduce"});
   await page.goto(url,{waitUntil:"domcontentloaded",timeout:60000});
   const region=page.getByRole("region",{name:"Your card to share",exact:true});
   const field=region.getByRole("textbox",{name:"Card text to share",exact:true});
   const copy=region.getByRole("button",{name:"Copy card text",exact:true});
   const money=region.getByRole("checkbox",{name:"Include sales kept after refunds",exact:true});
   await field.waitFor();
   await page.evaluate(()=>{
    window.__cardCopies=[];window.__cardCopyMode="success";
    Object.defineProperty(navigator,"clipboard",{configurable:true,value:{writeText:async text=>{
     window.__cardCopies.push(text);
     if(window.__cardCopyMode==="failure")throw Error("Synthetic clipboard refusal");
     if(window.__cardCopyMode==="pending")await new Promise(resolve=>{window.__finishCardCopy=resolve;});
    }}});
   });
   assert.equal(await money.isChecked(),false);
   const privateText=await field.inputValue();
   assert(privateText.includes("First Light"));
   assert.equal(privateText.includes("Sales kept after refunds"),false);
   assert.equal(await page.evaluate(()=>window.__cardCopies.length),0,"nothing copied on opening");
   await copy.focus();await page.keyboard.press("Enter");
   await region.getByRole("status").filter({hasText:"Card text copied. Review it before sharing."}).waitFor();
   assert.equal(await page.evaluate(()=>window.__cardCopies[0]),privateText);
   await money.check();
   const publicText=await field.inputValue();
   assert(publicText.includes("Sales kept after refunds: $0"));
   assert(publicText.includes("Reading: "));
   await page.evaluate(()=>{window.__cardCopyMode="pending";});
   await copy.evaluate(node=>{node.click();node.click();node.click();});
   await region.getByRole("button",{name:"Copying…",exact:true}).waitFor();
   assert.equal(await page.evaluate(()=>window.__cardCopies.length),2,"single-flight clipboard operation");
   assert.equal(await money.isDisabled(),true,"privacy choice is held until snapshot copy completes");
   await page.evaluate(()=>window.__finishCardCopy());
   await copy.waitFor();
   assert.equal(await page.evaluate(()=>window.__cardCopies[1]),publicText);
   await money.uncheck();
   assert.equal(await field.inputValue(),privateText);
   assert.equal(await region.getByRole("status").innerText(),"","privacy changes clear previous copy confirmation");
   await page.evaluate(()=>{window.__cardCopyMode="failure";});
   await copy.click();
   await region.getByRole("status").filter({hasText:"Copy was not confirmed."}).waitFor();
   assert.equal(await field.evaluate(node=>document.activeElement===node&&node.selectionStart===0&&node.selectionEnd===node.value.length),true);
   assert.equal(await field.inputValue(),privateText);
   assert.equal(await copy.isEnabled(),true);
   await page.addScriptTag({content:axeSource});
   const violations=await region.evaluate(async node=>(await window.axe.run(node,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21aa","wcag22aa"]}})).violations.map(rule=>rule.id));
   assert.deepEqual(violations,[]);
   assert.equal(await region.evaluate(node=>node.scrollWidth<=node.clientWidth),true);
   console.log("  ok    Path card text privacy/keyboard/single-flight/clipboard refusal/manual copy/AA/fit at "+width);
  }finally{await page.evaluate(()=>window.__finishCardCopy?.()).catch(()=>{});await page.close();}
 }
 assert.deepEqual(errors,[]);
}
