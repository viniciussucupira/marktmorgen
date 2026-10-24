/** Native sequential focus on settled public pages, not a complete keyboard audit. */
export async function checkPublicKeyboardCycle({page,path,is}) {
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
  is("keyboard fixture has bounded native targets "+path,expected.length>0&&expected.length<=250,true);
  const reports=[];
  for(const direction of ["Tab","Shift+Tab"]) {
   const visited=new Set();let first=null,wrapped=false;
   for(let step=0;step<expected.length+5;step++){
    await page.keyboard.press(direction);
    const current=await state.evaluate(({nodes})=>{
     const node=document.activeElement;
     if(!node||node===document.body||node===document.documentElement)return null;
     const box=node.getBoundingClientRect();
     return {key:nodes.indexOf(node),visible:node.matches(":focus-visible"),width:box.width,height:box.height,tag:node.tagName};
    });
    if(!current)continue; // Browser chrome may occur between the last and first page target.
    is("keyboard focus belongs to settled document "+path,current.key>=0,true);
    is("native keyboard focus is visible "+path,current.visible&&current.width>0&&current.height>0,true);
    if(first===null)first=current.key;
    else if(current.key===first){wrapped=true;break;}
    is("native keyboard does not loop within a subsection "+path,!visited.has(current.key),true);
    visited.add(current.key);
   }
   is("keyboard reaches complete page cycle "+direction+" "+path,wrapped,true);
   is("keyboard reaches every visible sequential target "+direction+" "+path,expected.every(key=>visited.has(key)),true);
   reports.push({direction,expected:expected.length,reached:visited.size,wrapped});
  }
  console.log("AX2_KEYBOARD_CYCLE:"+JSON.stringify({path,reports,scope:"Settled native sequential targets only; menus, dialogs, activation, semantic order, real devices and all-product conformance remain outside this check."}));
 }finally{await state.dispose();}
}
