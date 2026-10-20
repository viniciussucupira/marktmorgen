/** All access-link requests are intercepted; no account or email is created. */
export async function checkSigninAcknowledgment({browser,LOCAL,is}){
 const scenarios=[
  {name:"unknown inherited __proto__",body:{ok:false,error:"__proto__"}},
  {name:"unknown inherited constructor",body:{ok:false,error:"constructor"}},
  {name:"HTTP error",status:500,body:{ok:true}},
  {name:"truthy string",body:{ok:"true"}},
  {name:"contradictory error",body:{ok:true,error:"server_error"}},
  {name:"missing confirmation",body:{}},
  {name:"null",body:null},
  {name:"array",body:[{ok:true}]},
  {name:"malformed",raw:"<html>error</html>"},
  {name:"confirmed",body:{ok:true},confirmed:true},
 ];
 for(const width of [390,1280]){
  const context=await browser.newContext({viewport:{width,height:900}});
  try{
   const page=await context.newPage();let pending=null,requests=0;
   await page.route("**/api/auth/request",async route=>{
    if(!pending)throw Error("Unexpected access-link request");
    const work=pending;requests++;await work.release;
    await route.fulfill({status:work.scenario.status??200,contentType:"application/json",body:work.scenario.raw??JSON.stringify(work.scenario.body)});
   });
   await page.goto(LOCAL+"/signin",{waitUntil:"networkidle",timeout:60000});
   for(const scenario of scenarios){
    const field=page.getByLabel("Your email",{exact:true});
    await field.fill("synthetic-access@example.com");
    let release;
    const held=new Promise(resolve=>{release=resolve;});
    pending={scenario,release:held};
    const seen=page.waitForRequest(request=>request.method()==="POST"&&new URL(request.url()).pathname==="/api/auth/request",{timeout:15000});seen.catch(()=>{});
    try{
     await page.getByRole("button",{name:"Email me a link",exact:true}).click();
     is("access request keeps the displayed address "+scenario.name+" "+width,(await seen).postDataJSON().email,"synthetic-access@example.com");
     is("email cannot change while request is pending "+scenario.name+" "+width,await field.isDisabled(),true);
     is("access form announces pending state "+scenario.name+" "+width,await page.locator('form[aria-busy="true"]').count(),1);
    }finally{release();}
    if(scenario.confirmed){
     await page.getByText("Check that inbox",{exact:true}).waitFor();
     is("confirmed screen names the requested inbox "+width,await page.getByText("synthetic-access@example.com",{exact:true}).count(),1);
     is("existing resend cooldown remains in place "+width,await page.getByRole("button",{name:/Send it again in/}).isDisabled(),true);
    }else{
     await page.locator("form").getByRole("alert").waitFor();
     is("unconfirmed reply never announces inbox success "+scenario.name+" "+width,await page.getByText("Check that inbox",{exact:true}).count(),0);
     await field.waitFor();
     is("email unlocks after refusal "+scenario.name+" "+width,await field.isEnabled(),true);
     is("address remains intact after refusal "+scenario.name+" "+width,await field.inputValue(),"synthetic-access@example.com");
    }
    is("access page fits viewport "+scenario.name+" "+width,await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth),true);
   }
   is("all access-link requests stayed intercepted "+width,requests,scenarios.length);
  }finally{await context.close();}
 }
}
