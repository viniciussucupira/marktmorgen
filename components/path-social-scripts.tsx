"use client";
import {useRef,useState} from "react";
import {copyCampaignLink} from "@/lib/campaign-copy";
import {pathPostScript,scriptPlatform,scriptPreparation,SCRIPT_PLATFORMS,PLATFORM_NAMES,SCRIPT_WORDS,type ScriptProduct,type ScriptPlatform} from "@/lib/path-script-rules";
import type {PathAnswers} from "@/lib/path-rules";
/** Local selection and manual copy only; no posting, persistence or completion request. */
export function PathSocialScripts({products,answers,productsHref}:{products:ScriptProduct[];answers:Pick<PathAnswers,"audience"|"minutes">;productsHref:string}){
 const [productId,setProductId]=useState(products[0]?.id??"");
 const [platform,setPlatform]=useState<ScriptPlatform>(scriptPlatform(answers.audience));
 const [busy,setBusy]=useState(false),[status,setStatus]=useState("");
 const flight=useRef(false),field=useRef<HTMLTextAreaElement>(null);
 const product=products.find(item=>item.id===productId)??products[0];
 const script=product?pathPostScript(product,platform):null;
 async function copy(){
  if(!script||flight.current)return;
  flight.current=true;setBusy(true);setStatus("");
  try{
   const result=await copyCampaignLink(script,()=>field.current,typeof navigator.clipboard?.writeText==="function"?text=>navigator.clipboard.writeText(text):undefined);
   if(field.current?.value!==script)return;
   setStatus(result==="copied"?SCRIPT_WORDS.copied:result==="selected"?SCRIPT_WORDS.selected:SCRIPT_WORDS.unavailable);
  }finally{flight.current=false;setBusy(false);}
 }
 return <section className="mt-8 rounded-2xl border border-line bg-white p-6" aria-labelledby="path-scripts-title">
  <h2 id="path-scripts-title" className="t-h3">{SCRIPT_WORDS.title}</h2>
  <p className="mt-3">{SCRIPT_WORDS.intro}</p>
  {script?<><p className="mt-3 text-sm text-ink-soft">{scriptPreparation(answers.minutes)}</p>
   <fieldset className="mt-4 space-y-4">
    <legend className="sr-only">{SCRIPT_WORDS.title}</legend>
    <div><label className="field-label" htmlFor="path-script-product">{SCRIPT_WORDS.product}</label><select disabled={busy} id="path-script-product" className="field mt-2" value={product?.id??""} onChange={event=>{setProductId(event.target.value);setStatus("");}}>{products.map(item=><option key={item.id} value={item.id}>{item.title}</option>)}</select></div>
    <div><label className="field-label" htmlFor="path-script-platform">{SCRIPT_WORDS.platform}</label><select disabled={busy} id="path-script-platform" className="field mt-2" value={platform} onChange={event=>{setPlatform(event.target.value as ScriptPlatform);setStatus("");}}>{SCRIPT_PLATFORMS.map(value=><option key={value} value={value}>{PLATFORM_NAMES[value]}</option>)}</select></div>
    <div><label className="field-label" htmlFor="path-script-text">{SCRIPT_WORDS.script}</label><textarea ref={field} id="path-script-text" className="field mt-2 resize-y" rows={12} readOnly value={script} aria-describedby="path-script-help"/></div>
    <button disabled={busy} className="btn btn-primary" type="button" onClick={()=>void copy()} aria-busy={busy}>{busy?SCRIPT_WORDS.copying:SCRIPT_WORDS.copy}</button>
   </fieldset>
   <p id="path-script-help" className="mt-3 text-sm text-ink-soft">{SCRIPT_WORDS.help}</p>
   <p role="status" className="mt-3 text-sm">{status}</p>
   <p className="mt-3 text-sm text-ink-soft">{SCRIPT_WORDS.bounded}</p>
  </>:<p className="mt-3">{SCRIPT_WORDS.empty}</p>}
  <a className="mt-4 inline-flex min-h-11 items-center underline" href={productsHref}>{SCRIPT_WORDS.review}</a>
 </section>;
}
