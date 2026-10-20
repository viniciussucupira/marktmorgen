
async function reportLayout(page,label){
 const details=await page.evaluate(()=>{
  const items=[...document.querySelectorAll("body *")].map(node=>{
   const r=node.getBoundingClientRect(),style=getComputedStyle(node);
   let right=r.right,left=r.left,depth=0;
   if(node instanceof HTMLElement && !["INPUT","TEXTAREA","SELECT"].includes(node.tagName) && style.overflowX==="visible")right=Math.max(right,r.left+node.scrollWidth);
   const parents=[];for(let parent=node.parentElement;parent;parent=parent.parentElement){
    depth++;if(parent.tagName==="BODY"||parent.tagName==="HTML")continue;
    const ps=getComputedStyle(parent),pr=parent.getBoundingClientRect();
    if(ps.overflowX!=="visible"){right=Math.min(right,pr.right);left=Math.max(left,pr.left);}
    if(parents.length<5)parents.push({tag:parent.tagName,id:parent.id,classes:typeof parent.className==="string"?parent.className:"",overflow:ps.overflowX,width:Math.round(pr.width)});
   }
   return{tag:node.tagName,id:node.id,classes:typeof node.className==="string"?node.className:"",left:Math.round(left),right:Math.round(right),width:Math.round(r.width),client:node.clientWidth,scroll:node.scrollWidth,depth,shown:style.display!=="none"&&style.visibility!=="hidden"&&r.width>0&&r.height>0,text:node.textContent?.replace(/\s+/g," ").slice(0,120),parents};
  });
  return{viewport:innerWidth,scroll:document.documentElement.scrollWidth,wide:items.filter(n=>n.shown&&n.right>n.left&&(n.right>innerWidth+1||n.left< -1)).sort((a,b)=>b.right-a.right||b.depth-a.depth).slice(0,24)};
 });
 console.log(label+"_LAYOUT_DIAGNOSTIC:"+JSON.stringify(details));
 if(details.wide[0]?.id)await page.locator('[id="'+details.wide[0].id+'"]').first().scrollIntoViewIfNeeded();
 const capture=await page.screenshot({type:"jpeg",quality:60});console.log(label+"_LAYOUT_CAPTURE:"+capture.toString("base64"));
}

/** Every contact-setting POST is intercepted; no message or store write occurs. */
export async function checkContactAcknowledgment({browser,LOCAL,fixture,axeSource,is}){
 const scenarios=[
 {name:"HTTP failure",status:500,body:value=>({ok:true,contact:value})},
 {name:"truthy confirmation",body:value=>({ok:"true",contact:value})},
 {name:"missing saved snapshot",body:()=>({ok:true})},
 {name:"different enabled choice",body:value=>({ok:true,contact:{...value,on:!value.on}})},
 {name:"different heading",body:value=>({ok:true,contact:{...value,heading:"Different"}})},
 {name:"different line",body:value=>({ok:true,contact:{...value,line:"Different"}})},
 {name:"null",body:()=>null},
 {name:"array",body:value=>[{ok:true,contact:value}]},
 {name:"malformed",raw:"<html>temporary error</html>"},
 {name:"inherited error",body:()=>({ok:false,error:"__proto__"})},
 {name:"contradictory error",body:value=>({ok:true,contact:value,error:"server_error"})},
 {name:"lost response",abort:true},
 {name:"normalization is not echoed",body:value=>({ok:true,contact:{...value,heading:"  Questions   about dinner  "}})},
 {name:"matching normalized snapshot",body:value=>({ok:true,contact:value}),confirmed:true},
 ];
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   await context.addCookies([{name:"nl_session",value:fixture.session,url:LOCAL}]);
   const page=await context.newPage();let pending=null,requests=0,reported=false;
   await page.route("**/api/store/contact-box",async route=>{
    if(!pending)throw Error("Unexpected contact setting write");
    requests++;const work=pending;const input=route.request().postDataJSON();
    const normalize=text=>text.replace(/\s+/g," ").trim();
    const value={on:input.on,heading:normalize(input.heading),line:normalize(input.line)};
    await work.release;
    if(work.scenario.abort){await route.abort("failed");return;}
    await route.fulfill({status:work.scenario.status??200,contentType:"application/json",body:work.scenario.raw??JSON.stringify(work.scenario.body(value))});
   });
   await page.goto(LOCAL+"/studio?store="+fixture.sid,{waitUntil:"domcontentloaded",timeout:60000});
   await page.locator("main details").evaluateAll(nodes=>nodes.forEach(n=>{n.open=true;}));
   const form=page.locator("form#contact");await form.waitFor({state:"visible"});await page.addScriptTag({content:axeSource});
   const toggle=form.getByRole("checkbox",{name:"Show the contact form on my store page",exact:true});
   const heading=form.getByLabel("Heading (optional)",{exact:true});const line=form.getByLabel("One line under it (optional)",{exact:true});
   const original=await toggle.isChecked();await toggle.setChecked(!original);
   for(const scenario of scenarios){
    await heading.fill("  Questions   about dinner  ");await line.fill("Écrivez   votre question.");
    let release;const held=new Promise(resolve=>{release=resolve;});pending={scenario,release:held};
    const seen=page.waitForRequest(r=>r.method()==="POST"&&new URL(r.url()).pathname==="/api/store/contact-box");seen.catch(()=>{});
    const name=scenario.name+"/"+width;
    try{
     await form.getByRole("button",{name:"Save",exact:true}).click();const input=(await seen).postDataJSON();
     is("contact choice sent "+name,input.on,!original);
     is("creator heading preserved "+name,input.heading,"  Questions   about dinner  ");
     for(const field of [toggle,heading,line])is("contact fields lock "+name,await field.isDisabled(),true);
     is("contact announces pending "+name,await form.getAttribute("aria-busy"),"true");
    }finally{release();}
    if(scenario.confirmed){
     await page.locator(".nb-toast-region [role=status]").getByText("Contact form settings saved.",{exact:true}).waitFor({state:"attached"});
     is("contact toast does not claim public availability "+name,await page.getByText("The contact form is on your store page.",{exact:true}).count(),0);
    }else{
     const alert=form.getByRole("alert");await alert.waitFor();
     is("contact uncertain result stays honest "+name,(await alert.innerText()).includes("Reload this page to check before trying again"),true);
     const contrast=await alert.evaluate(async node=>{const r=await window.axe.run(node,{runOnly:{type:"rule",values:["color-contrast-enhanced"]}});return {violations:r.violations.map(v=>v.id),incomplete:r.incomplete.map(v=>v.id),passed:r.passes.some(v=>v.id==="color-contrast-enhanced")};});
     is("contact error enhanced contrast "+name,contrast,{violations:[],incomplete:[],passed:true});
     is("contact has no false success "+name,await page.getByText("Contact form settings saved.",{exact:true}).count(),0);
     for(const field of [toggle,heading,line])is("contact fields unlock "+name,await field.isEnabled(),true);
     is("creator line remains untouched "+name,await line.inputValue(),"Écrivez   votre question.");
    }
    const fits=await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth);if(!fits&&!reported){await reportLayout(page,"CONTACT");reported=true;}
    is("contact controls fit "+name,fits,true);
   }
   is("all contact writes intercepted "+width,requests,scenarios.length);
  }finally{await context.close();}
 }
}
