/** Native sequential focus on settled public pages, not a complete keyboard audit. */
export async function checkPublicKeyboardCycle({page,path,is}) {
 // Let native details toggle tasks and their React updates settle before the snapshot.
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const state=await page.evaluateHandle(()=>{
  const nodes=[...document.querySelectorAll("*")];
  const expected=nodes.filter(node=>{
   if(!(node instanceof HTMLElement)||node.tabIndex<0||node.matches(":disabled")||node.closest("[inert]"))return false;
   const style=getComputedStyle(node),box=node.getBoundingClientRect();
   return style.display!=="none"&&style.visibility!=="hidden"&&box.width>0&&box.height>0&&node.getClientRects().length>0;
  });
  return {nodes,expected};
 });
 try {
  const expected=await state.evaluate(({nodes,expected})=>expected.map(node=>nodes.indexOf(node)));
  is("keyboard fixture exposes native targets "+path,expected.length>0,true);
  const reports=[];
  for(const direction of ["Tab","Shift+Tab"]) {
   // Restore the actual browser document after sequential focus leaves for browser chrome.
   // This activates the page; it never chooses an element or changes tab order.
   await page.bringToFront();
   const read=()=>state.evaluate(({nodes})=>{
    const node=document.activeElement,documentFocused=document.hasFocus();
    if(!documentFocused)return {outside:true,key:null};
    if(!node||node===document.body||node===document.documentElement)return {outside:false,key:null};
    const box=node.getBoundingClientRect();
    return {outside:false,key:nodes.indexOf(node),visible:node.matches(":focus-visible"),width:box.width,height:box.height,tag:node.tagName};
   });
   const visited=new Set();let first=null,wrapped=false,leftDocument=false,innerLoop=false;
   const initial=await read();
   if(initial.key!==null&&expected.includes(initial.key)){visited.add(initial.key);first=initial.key;}
   for(let step=0;step<expected.length+5;step++){
    await page.keyboard.press(direction);
    const current=await read();
    if(current.outside){leftDocument=true;break;}
    if(current.key===null)continue;
    is("keyboard focus belongs to settled document "+path,current.key>=0,true);
    is("native keyboard focus is visible "+path,current.visible&&current.width>0&&current.height>0,true);
    if(first===null)first=current.key;
    else if(current.key===first){wrapped=true;break;}
    if(visited.has(current.key)){innerLoop=true;break;}
    visited.add(current.key);
   }
   const missing=await state.evaluate(({nodes,expected},keys)=>expected.filter(node=>!keys.includes(nodes.indexOf(node))).map(node=>{
    const box=node.getBoundingClientRect(),style=getComputedStyle(node),details=[];
    for(let parent=node.parentElement;parent;parent=parent.parentElement)if(parent.tagName==="DETAILS")details.push({open:parent.open,id:parent.id});
    return {key:nodes.indexOf(node),tag:node.tagName,id:node.id,href:node.getAttribute("href"),tabindex:node.getAttribute("tabindex"),text:node.textContent?.trim().slice(0,100),connected:node.isConnected,width:box.width,height:box.height,display:style.display,visibility:style.visibility,details};
   }),[...visited]);
   const complete=wrapped||leftDocument;
   is("native keyboard does not loop within a subsection "+path,!innerLoop,true);
   is("keyboard completes traversal or leaves for browser controls "+direction+" "+path,complete,true);
   is("keyboard reaches every captured sequential target "+direction+" "+path,missing.length,0);
   reports.push({direction,expected:expected.length,reached:visited.size,wrapped,leftDocument,innerLoop,missing});
  }
  console.log("AX2_KEYBOARD_CYCLE:"+JSON.stringify({path,reports,scope:"Settled native sequential targets only; menus, dialogs, activation, semantic order, real devices and all-product conformance remain outside this check."}));
  if(reports.some(report=>report.innerLoop||(!report.wrapped&&!report.leftDocument)||report.missing.length))throw Error("Native keyboard traversal failed; exact missing target diagnostics retained for "+path);
 }finally{await state.dispose();}
}
