"use client";
import { useRef, useState } from "react";
import { pathShare, pathShareSvg, pathShareText, type PathShareInput } from "@/lib/path-share";
export function PathShareCard({input}:{input:PathShareInput}){
 const [includeMoney,setIncludeMoney]=useState(false);
 const [message,setMessage]=useState("");
 const [copying,setCopying]=useState(false);
 const locked=useRef(false);
 const textField=useRef<HTMLTextAreaElement>(null);
 const text=pathShareText(input,includeMoney) || "";
 const content=pathShare(input,includeMoney);
 if(!content)return null;
 async function copy(){
  if(locked.current)return;
  locked.current=true;setCopying(true);setMessage("");
  try{
   await navigator.clipboard.writeText(text);
   setMessage("Card text copied. Review it before sharing.");
  }catch{
   textField.current?.focus();textField.current?.select();
   setMessage("Copy was not confirmed. Select and copy the card text below.");
  }finally{locked.current=false;setCopying(false);}
 }
 function download(){
  let url:string|undefined;
  try{
   const svg=pathShareSvg(input,includeMoney);if(!svg)return;
   url=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml;charset=utf-8"}));
   const link=document.createElement("a");link.href=url;link.download="marktmorgen-path.svg";link.click();
   setMessage("Card download requested. Check your browser’s downloads.");
  }catch{
   textField.current?.focus();textField.current?.select();
   setMessage("The card download could not be requested. You can copy the card text below instead.");
  }finally{
   if(url){const downloadUrl=url;setTimeout(()=>URL.revokeObjectURL(downloadUrl),1000);}
  }
 }
 return <section className="mt-8" aria-labelledby="path-share-title"><h2 id="path-share-title" className="t-h3">Your card to share</h2>
  <p className="mt-3 text-ink-soft">Choose what appears on your card, then download it to share yourself.</p>
  <div className="mt-4 rounded-2xl border border-line bg-white p-6" aria-label="Card preview">
   <p className="eyebrow">Marktmorgen Path</p><p className="mt-3 text-2xl font-semibold">{content.level}</p><p className="mt-2">{content.days}</p>
   {content.money?<><p className="mt-3">Sales kept after refunds: {content.money}</p><p className="mt-2 text-sm text-ink-soft">{content.reading}</p></>:null}
   <p className="mt-4 text-sm">Every step is real. Every sale is yours.</p>
  </div>
  {input.moneyCents!==null?<label className="mt-4 flex min-h-11 items-center gap-3"><input type="checkbox" checked={includeMoney} disabled={copying} onChange={event=>{setIncludeMoney(event.target.checked);setMessage("");}}/>Include sales kept after refunds</label>:null}
  <button type="button" className="btn btn-secondary mt-4" onClick={download}>Download card</button>
  <div className="mt-5 grid max-w-2xl gap-3">
   <label htmlFor="path-card-text" className="font-semibold">Card text to share</label>
   <textarea id="path-card-text" ref={textField} className="field min-h-40" readOnly value={text} aria-describedby="path-card-text-help"/>
   <p id="path-card-text-help" className="text-sm text-ink-soft">Includes the same information as your preview. Copying does not post or send it to anyone.</p>
   <button type="button" className="btn btn-secondary justify-self-start" disabled={copying} aria-busy={copying} onClick={()=>void copy()}>{copying?"Copying…":"Copy card text"}</button>
  </div>
  <p className="mt-3 text-sm" role="status">{message}</p>
 </section>;
}
