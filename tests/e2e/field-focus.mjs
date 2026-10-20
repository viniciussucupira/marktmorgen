/** Quantitative same-pixel paint check on the selected disposable engine. No screenshot is saved or sent elsewhere. */
export async function fieldFocusPixels(page,field) {
  await page.evaluate(()=>window.scrollTo({top:0,left:0,behavior:"instant"}));
  await page.mouse.move(0,0);
  await page.evaluate(()=>document.fonts.ready);
  await field.focus();
  await page.keyboard.press("Shift+Tab");
  if(await field.evaluate(node=>document.activeElement===node))throw Error("Field did not leave keyboard focus");
  // Keep the real previous tab stop focused, but bring the unfocused field
  // into view before comparing the same viewport pixels.
  await field.evaluate(node=>node.scrollIntoView({block:"center",behavior:"instant"}));
  const scroll=await page.evaluate(()=>({x:scrollX,y:scrollY}));
  const box=await field.boundingBox();
  if(!box)throw Error("Missing field bounds");
  const clip={x:Math.floor(box.x)-9,y:Math.floor(box.y)-9,width:Math.ceil(box.x+box.width)+9-(Math.floor(box.x)-9),height:Math.ceil(box.y+box.height)+9-(Math.floor(box.y)-9)};
  const viewport=page.viewportSize();
  if(!viewport || clip.x<0||clip.y<0||clip.x+clip.width>viewport.width||clip.y+clip.height>viewport.height)throw Error("Field focus region is outside the viewport: "+JSON.stringify({box,clip,viewport,scroll}));
  const before=await page.screenshot({animations:"disabled",scale:"css"});
  await page.keyboard.press("Tab");
  if(!await field.evaluate(node=>document.activeElement===node&&node.matches(":focus-visible")))throw Error("Tab did not restore visible field focus");
  const afterBox=await field.boundingBox();
  if(!afterBox || ["x","y","width","height"].some(key=>Math.abs(afterBox[key]-box[key])>0.1))throw Error("Focus shifted field geometry");
  const styles=await field.evaluate(node=>{
    const style=getComputedStyle(node);
    return {width:style.outlineWidth,offset:style.outlineOffset,style:style.outlineStyle,color:style.outlineColor,shadow:style.boxShadow,forcedColorAdjust:style.forcedColorAdjust};
  });
  if(!await page.evaluate(previous=>scrollX===previous.x&&scrollY===previous.y,scroll))throw Error("Focus measurement scrolled after Tab");
  const after=await page.screenshot({animations:"disabled",scale:"css"});
  const pixels=await page.evaluate(async({before,after,box,clip,viewport})=>{
    async function decode(encoded) {
      const bytes=Uint8Array.from(atob(encoded),char=>char.charCodeAt(0));
      const bitmap=await createImageBitmap(new Blob([bytes],{type:"image/png"}));
      const canvas=new OffscreenCanvas(bitmap.width,bitmap.height);
      const context=canvas.getContext("2d",{willReadFrequently:true});
      if(!context)throw Error("No pixel context");
      context.drawImage(bitmap,0,0);
      const image=context.getImageData(0,0,bitmap.width,bitmap.height);
      bitmap.close();
      return image;
    }
    const a=await decode(before),b=await decode(after);
    if(a.width!==viewport.width||a.height!==viewport.height||b.width!==a.width||b.height!==a.height)throw Error("Unexpected screenshot scale");
    const luminance=(data,index)=>{
      const values=[data[index],data[index+1],data[index+2]].map(value=>value/255).map(value=>value<=0.04045?value/12.92:((value+0.055)/1.055)**2.4);
      return values[0]*0.2126+values[1]*0.7152+values[2]*0.0722;
    };
    let contrastingPixels=0;
    for(let y=clip.y;y<clip.y+clip.height;y++)for(let x=clip.x;x<clip.x+clip.width;x++){
      const px=x+0.5,py=y+0.5;
      // Exclude content/caret and the component's original border.
      if(px>=box.x&&px<box.x+box.width&&py>=box.y&&py<box.y+box.height)continue;
      const index=(y*a.width+x)*4;
      if(a.data[index+3]!==255||b.data[index+3]!==255)throw Error("Transparent measurement pixel");
      const first=luminance(a.data,index),second=luminance(b.data,index);
      if((Math.max(first,second)+0.05)/(Math.min(first,second)+0.05)>=3)contrastingPixels++;
    }
    return {contrastingPixels,minimumArea:Math.ceil(4*(box.width+box.height))};
  },{before:before.toString("base64"),after:after.toString("base64"),box,clip,viewport});
  if(pixels.contrastingPixels<pixels.minimumArea)console.error("FIELD_FOCUS_DIAGNOSTIC:"+JSON.stringify({...styles,...pixels,tag:await field.evaluate(node=>node.tagName),classes:await field.getAttribute("class"),forcedColors:await page.evaluate(()=>matchMedia("(forced-colors: active)").matches)}));
  return {...styles,...pixels};
}

/** Real CSS controls on explicit synthetic flat surfaces; does not claim a customer-theme audit. */
export async function mountFieldFocusFixture(page,{surface,kind,invalid=false,className="field",paint={}}) {
  await page.evaluate(({surface,kind,invalid,className,paint})=>{
    document.querySelector("#field-focus-fixture")?.remove();
    window.scrollTo({top:0,left:0,behavior:"instant"});
    const panel=document.createElement("section");
    panel.id="field-focus-fixture";
    panel.setAttribute("aria-label","Synthetic field focus fixture");
    panel.className=surface==="#111827"?"on-dark":"";
    Object.assign(panel.style,{position:"fixed",zIndex:"2147483000",top:"24px",left:"16px",right:"16px",padding:"24px",backgroundColor:surface});
    for(const [name,value] of Object.entries(paint)){
      if(name.startsWith("--"))panel.style.setProperty(name,value);
      else panel.style[name]=value;
    }
    const before=document.createElement("button");
    before.type="button"; before.textContent="Before the synthetic field";
    Object.assign(before.style,{display:"block",marginBottom:"24px",color:surface==="#111827"?"white":"black"});
    const label=document.createElement("label");
    label.htmlFor="field-focus-target";label.textContent="Synthetic "+kind+" field";
    Object.assign(label.style,{display:"block",marginBottom:"8px",color:surface==="#111827"?"white":"black"});
    const field=document.createElement(kind);
    field.id="field-focus-target";field.className=className;
    if(kind==="button"){
      field.type="button";field.textContent="Continue";
    }else if(kind==="a"){
      field.href="#synthetic-focus-only";field.textContent="Creator profile";
    }else if(kind==="select"){
      for(const text of ["First choice","Second choice"]){const option=document.createElement("option");option.textContent=text;field.append(option);}
    }else if(kind==="textarea"){field.rows=3;field.readOnly=true;field.value="Read-only checklist text";}
    else {field.type="text";field.placeholder="Synthetic field";}
    if(invalid)field.setAttribute("aria-invalid","true");
    panel.append(before,label,field);
    document.body.append(panel);
  },{surface,kind,invalid,className,paint});
  return page.locator("#field-focus-target");
}
