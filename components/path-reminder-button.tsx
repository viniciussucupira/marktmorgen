"use client";
import Link from "next/link";
import { useRef, useState } from "react";
import { readPathReminderReply } from "@/lib/path-reminder-response";
export function PathReminderButton({phoneUrl}:{phoneUrl:string}){
 const [busy,setBusy]=useState(false);
 const [uncertain,setUncertain]=useState(false);
 const locked=useRef(false);
 const [message,setMessage]=useState("");
 async function send(){
  if(locked.current)return;
  locked.current=true;setBusy(true);setMessage("");
  try {
   const response=await fetch("/api/store/path",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"remind"})});
   const result=readPathReminderReply(response.status,await response.json());
   setMessage(result.message);
   if(result.state==="uncertain")setUncertain(true);
   else locked.current=false;
  }catch{
   setMessage(readPathReminderReply(0,null).message);setUncertain(true);
  }finally{setBusy(false);}
 }
 return <section className="mt-8" aria-labelledby="path-reminder-title" aria-busy={busy}><h2 id="path-reminder-title" className="t-h3">Take your next mission with you</h2>
  <p className="mt-3 max-w-2xl text-ink-soft">Choose Path on your own devices in phone notifications, then request your current mission here. Once per day, during your local daytime, on online devices. Each request uses 20 additional studio requests.</p>
  <div className="mt-4 flex flex-wrap gap-3"><Link href={phoneUrl} className="btn btn-secondary">Choose your devices</Link><button type="button" disabled={busy||uncertain} className="btn btn-secondary" onClick={send}>{busy?"Requesting…":"Send your current mission"}</button></div>
  <p className="mt-3 text-sm" role="status" aria-live="polite">{message}</p>
 </section>;
}
