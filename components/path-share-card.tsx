"use client";
import { useState } from "react";
import { pathShare, pathShareSvg, type PathShareInput } from "@/lib/path-share";
export function PathShareCard({input}:{input:PathShareInput}){
 const [includeMoney,setIncludeMoney]=useState(false);
 const [message,setMessage]=useState("");
 const content=pathShare(input,includeMoney);
 if(!content)return null;
 function download(){
  const svg=pathShareSvg(input,includeMoney);if(!svg)return;
  const url=URL.createObjectURL(new Blob([svg],{type:"image/svg+xml;charset=utf-8"}));
  const link=document.createElement("a");link.href=url;link.download="marktmorgen-path.svg";link.click();
  setTimeout(()=>URL.revokeObjectURL(url),1000);
  setMessage("Your card is ready in your downloads.");
 }
 return <section className="mt-8" aria-labelledby="path-share-title"><h2 id="path-share-title" className="t-h3">Your card to share</h2>
  <p className="mt-3 text-ink-soft">Choose what appears on your card, then download it to share yourself.</p>
  <div className="mt-4 rounded-2xl border border-line bg-white p-6" aria-label="Card preview">
   <p className="eyebrow">Marktmorgen Path</p><p className="mt-3 text-2xl font-semibold">{content.level}</p><p className="mt-2">{content.days}</p>
   {content.money?<><p className="mt-3">Sales kept after refunds: {content.money}</p><p className="mt-2 text-sm text-ink-soft">{content.reading}</p></>:null}
   <p className="mt-4 text-sm">Every step is real. Every sale is yours.</p>
  </div>
  {input.moneyCents!==null?<label className="mt-4 flex min-h-11 items-center gap-3"><input type="checkbox" checked={includeMoney} onChange={event=>setIncludeMoney(event.target.checked)}/>Include sales kept after refunds</label>:null}
  <button type="button" className="btn btn-secondary mt-4" onClick={download}>Download card</button>
  <p className="mt-3 text-sm" role="status">{message}</p>
 </section>;
}
