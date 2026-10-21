"use client";
import {useRef,useState,useSyncExternalStore} from "react";
import {LEVEL_NAMES,LEVELS} from "@/lib/path-rules";
import {CERTIFICATE_WORDS,certificateLevels,pathCertificate,pathCertificateHtml,pathCertificateText,type PathCertificateInput} from "@/lib/path-certificate";
const subscribeReady=()=>()=>{};
const clientReady=()=>true;
const serverReady=()=>false;
export function PathCertificates({input}:{input:PathCertificateInput}){
 const ready=useSyncExternalStore(subscribeReady,clientReady,serverReady);
 const levels=certificateLevels(input);
 const [level,setLevel]=useState(input.level),[includeMoney,setIncludeMoney]=useState(false),[message,setMessage]=useState("");
 const field=useRef<HTMLTextAreaElement>(null);
 const content=pathCertificate(input,level,includeMoney),text=pathCertificateText(input,level,includeMoney);
 if(!content||!text)return null;
 function download(){
  if(!ready)return;
  let url:string|undefined;
  try{
   const html=pathCertificateHtml(input,level,includeMoney);if(!html)return;
   url=URL.createObjectURL(new Blob([html],{type:"text/html;charset=utf-8"}));
   const link=document.createElement("a");link.href=url;link.download="marktmorgen-path-"+LEVELS[level]+"-certificate.html";link.click();
   setMessage(CERTIFICATE_WORDS.requested);
  }catch{field.current?.focus();field.current?.select();setMessage(CERTIFICATE_WORDS.unavailable);}
  finally{if(url){const address=url;setTimeout(()=>URL.revokeObjectURL(address),1000);}}
 }
 return <section className="mt-8" aria-labelledby="path-certificates-title">
  <h2 id="path-certificates-title" className="t-h3">{CERTIFICATE_WORDS.title}</h2>
  <p className="mt-3 text-ink-soft">{CERTIFICATE_WORDS.help}</p>
  <div className="mt-4 grid max-w-2xl gap-3">
   <label htmlFor="path-certificate-level" className="font-semibold">{CERTIFICATE_WORDS.level}</label>
   <select id="path-certificate-level" className="field" disabled={!ready} value={level} onChange={event=>{setLevel(Number(event.target.value));setMessage("");}}>{levels.map(index=><option key={index} value={index}>{LEVEL_NAMES[LEVELS[index]]}</option>)}</select>
   <div className="rounded-xl border border-line p-4" aria-label="Certificate preview"><p className="font-semibold">{content.level}</p><p className="mt-2">{CERTIFICATE_WORDS.reading}: <time dateTime={content.reading}>{content.reading}</time></p><p className="mt-2 text-sm">{CERTIFICATE_WORDS.kept}</p>{content.money?<><p className="mt-2">Sales kept after refunds: {content.money}</p><p className="mt-2 text-sm">{content.moneyReading}</p></>:null}</div>
   {input.moneyCents!==null?<label className="flex min-h-11 items-center gap-3"><input type="checkbox" autoComplete="off" disabled={!ready} checked={includeMoney} onChange={event=>{setIncludeMoney(event.target.checked);setMessage("");}}/>{CERTIFICATE_WORDS.money}</label>:null}
   <button type="button" className="btn btn-secondary justify-self-start" disabled={!ready} onClick={download}>{CERTIFICATE_WORDS.download}</button>
   <label htmlFor="path-certificate-text" className="font-semibold">{CERTIFICATE_WORDS.text}</label>
   <textarea id="path-certificate-text" ref={field} className="field min-h-48" readOnly value={text} aria-describedby="path-certificate-help"/>
   <p id="path-certificate-help" className="text-sm text-ink-soft">{CERTIFICATE_WORDS.textHelp}</p>
  </div><p role="status" className="mt-3 text-sm">{message}</p>
 </section>;
}
