/** Uses the real store button CSS on the existing disposable focus fixture.
 * This covers opaque button paint, not photo backdrops, gradient overlays,
 * every store text style, assistive technology or whole-site conformance. */
export async function checkButtonContrast({page,target,label,is}){
 const reading=()=>target.evaluate(node=>{
  const c=getComputedStyle(node);
  const rgb=value=>value.match(/[\d.]+/g).slice(0,3).map(Number);
  const lum=value=>rgb(value).map(v=>{v/=255;return v<=.04045?v/12.92:((v+.055)/1.055)**2.4;}).reduce((sum,v,i)=>sum+v*[.2126,.7152,.0722][i],0);
  const a=lum(c.color),b=lum(c.backgroundColor);
  return {ratio:(Math.max(a,b)+.05)/(Math.min(a,b)+.05),filter:c.filter,opacity:c.opacity};
 });
 await page.mouse.move(0,0);
 const normal=await reading();
 is("button opaque normal text7:1 "+label,normal.ratio>=7&&normal.opacity==="1"&&normal.filter==="none",true);
 await target.hover();
 const hover=await reading();
 is("button hover keeps text7:1 "+label,hover.ratio>=7&&hover.opacity==="1"&&hover.filter==="none",true);
 await target.focus();
 const focused=await reading();
 is("button focused text7:1 "+label,focused.ratio>=7&&focused.opacity==="1"&&focused.filter==="none",true);
}
