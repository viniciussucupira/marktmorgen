"use client";
import Link from "next/link";
import { useState } from "react";
const REASONS:Record<string,string>={
 "not-started":"Start your Path first.",
 quiet:"Your Path is quiet from 9 p.m. until 8 a.m. in your time zone. Please return after quiet hours.",
 stale:"Refresh your Path first so the reminder uses a recent reading.",
 complete:"Your first real sale is recorded. There is no next mission to send.",
 allowance:"Your studio allowance has no room for this reminder.",
 unavailable:"A reminder could not be requested just now. Please try again later."
};
export function PathReminderButton({phoneUrl}:{phoneUrl:string}){
 const [busy,setBusy]=useState(false);const [message,setMessage]=useState("");
 async function send(){
  if(busy)return;setBusy(true);setMessage("");
  try {
   const response=await fetch("/api/store/path",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"remind"})});
   const result=await response.json();
   setMessage(result.ok?(result.devices>0?"Reminder requested for "+result.devices+" of your devices.":"No new reminder was sent. Check your device choices, or return tomorrow if you already sent one today."):REASONS[result.reason] || result.message || "Please try again in a moment.");
  }catch{setMessage("A reminder could not be requested just now. Please try again later.");}
  finally{setBusy(false);}
 }
 return <section className="mt-8" aria-labelledby="path-reminder-title"><h2 id="path-reminder-title" className="t-h3">Take your next mission with you</h2>
  <p className="mt-3 max-w-2xl text-ink-soft">Choose Path on your own devices in phone notifications, then request your current mission here. Once per day, during your local daytime, on online devices. Each request uses 20 additional studio requests.</p>
  <div className="mt-4 flex flex-wrap gap-3"><Link href={phoneUrl} className="btn btn-secondary">Choose your devices</Link><button type="button" disabled={busy} className="btn btn-secondary" onClick={send}>{busy?"Requesting…":"Send your current mission"}</button></div>
  <p className="mt-3 text-sm" role="status" aria-live="polite">{message}</p>
 </section>;
}
