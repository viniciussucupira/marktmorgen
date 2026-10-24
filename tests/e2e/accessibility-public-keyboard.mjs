/** Native target reachability on settled public pages; not a complete keyboard audit. */
export async function checkPublicKeyboardCycle({page,path,is}) {
 await page.evaluate(()=>new Promise(resolve=>requestAnimationFrame(()=>requestAnimationFrame(resolve))));
 const state=await page.evaluateHandle(()=>{
  const nodes=[...document.querySelectorAll("*")];
  const rendered=node=>{
   if(!(node instanceof HTMLElement)||node.tabIndex<0||node.matches(":disabled")||node.closest("[inert]"))return false;
   for(let parent=node.parentElement;parent;parent=parent.parentElement){
    if(parent.tagName==="DETAILS"&&!parent.open){
     const summary=[...parent.children].find(child=>child.tagName==="SUMMARY");
     if(!summary||!summary.contains(node))return false;
    }
   }
   const style=getComputedStyle(node),box=node.getBoundingClientRect();
   return style.display!=="none"&&style.visibility!=="hidden"&&box.width>0&&box.height>0&&node.getClientRects().length>0;
  };
  const candidates=nodes.filter(rendered),groups=[];
  for(const node of candidates){
   if(!(node instanceof HTMLInputElement)||node.type!=="radio"||!node.name)continue;
   if(groups.some(group=>group.includes(node)))continue;
   groups.push(candidates.filter(other=>other instanceof HTMLInputElement&&other.type==="radio"&&other.name===node.name&&other.form===node.form&&other.getRootNode()===node.getRootNode()));
  }
  const unsupported=groups.filter(group=>group.filter(node=>node.checked).length!==1||group.some(node=>node.closest('[role="toolbar"]'))).length;
  const expected=candidates.filter(node=>{
   const group=groups.find(group=>group.includes(node));
   return !group||node.checked;
  });
  return {nodes,expected,groups,unsupported};
 });
 try {
  const snapshot=await state.evaluate(({nodes,expected,groups,unsupported})=>({expected:expected.map(node=>nodes.indexOf(node)),groups:groups.map(group=>group.map(node=>nodes.indexOf(node))),unsupported}));
  const expected=snapshot.expected;
  is("keyboard fixture exposes native targets "+path,expected.length>0,true);
  is("native radio fixture has one selected option and is outside toolbars "+path,snapshot.unsupported,0);
  if(!expected.length||snapshot.unsupported)throw Error("Unsupported native keyboard fixture on "+path);
  const read=()=>state.evaluate(({nodes})=>{
   const node=document.activeElement,documentFocused=document.hasFocus();
   if(!documentFocused)return {outside:true,key:null};
   if(!node||node===document.body||node===document.documentElement)return {outside:false,key:null};
   const box=node.getBoundingClientRect();
   return {outside:false,key:nodes.indexOf(node),visible:node.matches(":focus-visible"),width:box.width,height:box.height,checked:node instanceof HTMLInputElement?node.checked:null};
  });
  const radioReports=[],testedGroups=new Set();
  const checkRadios=async current=>{
   const groupIndex=snapshot.groups.findIndex(group=>group.includes(current.key));
   if(groupIndex<0||testedGroups.has(groupIndex))return;
   testedGroups.add(groupIndex);
   const group=snapshot.groups[groupIndex],start=group.indexOf(current.key),reached=[];
   for(let step=1;step<=group.length;step++){
    const target=group[(start+step)%group.length];
    await page.keyboard.press("ArrowRight");
    const targetHandle=await state.evaluateHandle(({nodes},key)=>nodes[key],target);
    try{
     // Controlled native radios may commit React state after keyup. Observe that
     // real focus and selection settled before issuing the next native key.
     await page.waitForFunction(node=>document.activeElement===node&&node.checked&&node.matches(":focus-visible"),targetHandle,{timeout:3000});
    }catch(error){
     console.log("AX2_RADIO_UNSETTLED:"+JSON.stringify({path,target,actual:await read()}));
     throw error;
    }finally{await targetHandle.dispose();}
    const actual=await read();
    is("native radio arrow reaches next option "+path,actual.key,target);
    is("native radio arrow checks focused visible option "+path,actual.checked&&actual.visible&&actual.width>0&&actual.height>0,true);
    reached.push(actual.key);
   }
   const restored=await read();
   is("native radio traversal restores original selection "+path,restored.key,current.key);
   is("native radio traversal covers every option "+path,new Set(reached).size,group.length);
   radioReports.push({group:groupIndex,expected:group.length,reached:new Set(reached).size,restored:restored.key===current.key});
  };
  const reports=[];
  for(const direction of ["Tab","Shift+Tab"]) {
   await page.bringToFront();
   const visited=new Set();let innerLoop=false,leftDocument=false;
   let current=await read();
   // The reverse journey starts at the last target reached by the forward journey.
   for(let step=0;step<expected.length+5;step++){
    if(current.outside){leftDocument=true;break;}
    if(current.key!==null){
     is("keyboard focus belongs to settled sequential targets "+path,expected.includes(current.key),true);
     is("native keyboard focus is visible "+path,current.visible&&current.width>0&&current.height>0,true);
     if(visited.has(current.key)){innerLoop=true;break;}
     visited.add(current.key);
     await checkRadios(current);
     if(expected.every(key=>visited.has(key)))break;
    }
    await page.keyboard.press(direction);
    current=await read();
   }
   const missing=await state.evaluate(({nodes,expected},keys)=>expected.filter(node=>!keys.includes(nodes.indexOf(node))).map(node=>({key:nodes.indexOf(node),tag:node.tagName,href:node.getAttribute("href"),text:node.textContent?.trim().slice(0,100)})),[...visited]);
   is("native keyboard does not loop before all targets are reached "+path,!innerLoop,true);
   is("keyboard reaches every captured sequential target "+direction+" "+path,missing.length,0);
   reports.push({direction,expected:expected.length,reached:visited.size,leftDocument,innerLoop,missing});
  }
  is("native keyboard verifies every captured radio group "+path,testedGroups.size,snapshot.groups.length);
  console.log("AX2_KEYBOARD_CYCLE:"+JSON.stringify({path,reports,radioReports,scope:"Native target reachability in this settled state only. Browser-chrome exit, semantic order, other disclosure states, menus, dialogs, real devices and conformance remain unverified."}));
  if(reports.some(report=>report.innerLoop||report.missing.length))throw Error("Native keyboard reachability failed for "+path);
 }finally{await state.dispose();}
}
