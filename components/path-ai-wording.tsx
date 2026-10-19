"use client";
import {useEffect,useRef,useState} from "react";
import {PATH_WORDING_WORDS,readPathWordingReply,type WordingSource,type PathWordingReply} from "@/lib/path-wording-rules";
/** Optional display only. No mission/level/progress state is written by this component. */
export function PathAiWording({source,endpoint}:{source:WordingSource;endpoint:string}){
 const [busy,setBusy]=useState(false),[note,setNote]=useState(""),[reply,setReply]=useState<PathWordingReply|null>(null);
 const flight=useRef(false);
 const live=useRef(true);
 useEffect(()=>{live.current=true;return()=>{live.current=false;};},[]);
 async function request(){
  if(flight.current)return;
  flight.current=true;setBusy(true);setNote("");setReply(null);
  try{
   const response=await fetch(endpoint,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"wording",mission:source.mission}),cache:"no-store"});
   const raw:unknown=await response.json().catch(()=>null);
   if(!live.current)return;
   const checked=response.ok?readPathWordingReply(raw,source):null;
   if(!checked){setNote(response.status===409?PATH_WORDING_WORDS.stale:response.status===429?PATH_WORDING_WORDS.slow:PATH_WORDING_WORDS.unavailable);return;}
   setReply(checked);
   if(checked.fallback)setNote(checked.reason==="used"?PATH_WORDING_WORDS.used:checked.reason==="off"?PATH_WORDING_WORDS.off:PATH_WORDING_WORDS.fallback);
  }catch{if(live.current)setNote(PATH_WORDING_WORDS.unavailable);}
  finally{flight.current=false;if(live.current)setBusy(false);}
 }
 return <aside className="mt-4 rounded-xl border border-line bg-paper p-5" aria-labelledby="path-wording-title">
  <h3 id="path-wording-title" className="font-semibold">{PATH_WORDING_WORDS.button}</h3>
  <p id="path-wording-help" className="mt-2 text-sm text-ink-soft">{PATH_WORDING_WORDS.intro}</p>
  <button className="btn btn-secondary mt-3" type="button" disabled={busy} aria-busy={busy} aria-describedby="path-wording-help" onClick={()=>void request()}>{busy?PATH_WORDING_WORDS.busy:PATH_WORDING_WORDS.button}</button>
  <div role="status" className="mt-3 text-sm">
   {reply?<><p className="font-semibold">{reply.fallback?PATH_WORDING_WORDS.fixed:PATH_WORDING_WORDS.ai}</p><p className="mt-2">{reply.text}</p></>:null}
   {note?<p className="mt-2">{note}</p>:null}
  </div>
 </aside>;
}
