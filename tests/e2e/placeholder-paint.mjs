/** Compare actual placeholder paint with the same unfocused field without it.
 * No inferred pseudo-element colour, screenshot export or production write. */
export async function placeholderPaint(page,field){
 await page.evaluate(()=>document.fonts.ready);
 const original=await field.evaluate(node=>({placeholder:node.getAttribute("placeholder"),shown:node.matches(":placeholder-shown"),value:node.value,opacity:getComputedStyle(node,"::placeholder").opacity}));
 if(!original.shown||original.value!==""||!original.placeholder)throw Error("Expected actual visible placeholder");
 await page.evaluate(()=>{const active=document.activeElement;if(active instanceof HTMLElement)active.blur();});
 await field.evaluate(node=>node.scrollIntoView({block:"center",behavior:"instant"}));
 const box=await field.boundingBox(),viewport=page.viewportSize();if(!box||!viewport)throw Error("Placeholder bounds unavailable");
 const before=await page.screenshot({animations:"disabled",scale:"css"});
 let after;
 try{await field.evaluate(node=>node.setAttribute("placeholder",""));after=await page.screenshot({animations:"disabled",scale:"css"});}
 finally{await field.evaluate((node,value)=>node.setAttribute("placeholder",value),original.placeholder);}
 const result=await page.evaluate(async({before,after,box,viewport})=>{
  async function decode(encoded){const bytes=Uint8Array.from(atob(encoded),c=>c.charCodeAt(0));const bitmap=await createImageBitmap(new Blob([bytes],{type:"image/png"}));const canvas=new OffscreenCanvas(bitmap.width,bitmap.height);const context=canvas.getContext("2d",{willReadFrequently:true});if(!context)throw Error("No image context");context.drawImage(bitmap,0,0);const data=context.getImageData(0,0,bitmap.width,bitmap.height);bitmap.close();return data;}
  const a=await decode(before),b=await decode(after);if(a.width!==viewport.width||a.height!==viewport.height||b.width!==a.width||b.height!==a.height)throw Error("Unexpected placeholder screenshot scale");
  const lum=(data,i)=>{const v=[data[i],data[i+1],data[i+2]].map(x=>x/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return v[0]*.2126+v[1]*.7152+v[2]*.0722;};
  let pixels=0,corePixels=0,ratio=1;
  const x0=Math.max(0,Math.ceil(box.x+4)),x1=Math.min(a.width,Math.floor(box.x+box.width-4)),y0=Math.max(0,Math.ceil(box.y+4)),y1=Math.min(a.height,Math.floor(box.y+box.height-4));
  for(let y=y0;y<y1;y++)for(let x=x0;x<x1;x++){const i=(y*a.width+x)*4;if(a.data[i+3]!==255||b.data[i+3]!==255)throw Error("Non-opaque placeholder paint");if(a.data[i]===b.data[i]&&a.data[i+1]===b.data[i+1]&&a.data[i+2]===b.data[i+2])continue;pixels++;const first=lum(a.data,i),second=lum(b.data,i),contrast=(Math.max(first,second)+.05)/(Math.min(first,second)+.05);ratio=Math.max(ratio,contrast);if(contrast>=7)corePixels++;}
  if(pixels<20)throw Error("Too few actual placeholder glyph pixels to measure: "+pixels);
  return {pixels,corePixels,ratio};
 },{before:before.toString("base64"),after:after.toString("base64"),box,viewport});
 const opacity=Number(original.opacity);if(!Number.isFinite(opacity))throw Error("Placeholder opacity unavailable");
 return {...result,opacity,shown:original.shown};
}
