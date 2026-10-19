"use client";
import { useRef, useState, type FormEvent } from "react";
import { AUDIENCES, AUDIENCE_WORDS, MINUTES, type PathAnswers } from "@/lib/path-rules";
import { readMoney, parseCurrency, moneyField, decimalsOf } from "@/lib/money";
import { readPathWriteReply } from "@/lib/path-write-response";
export function PathOnboarding({currency, answers}: {currency: string; answers?: PathAnswers}) {
 const [busy,setBusy]=useState(false);
 const [uncertain,setUncertain]=useState(false);
 const locked=useRef(false);
 const [message,setMessage]=useState("");
 async function request(body: unknown) {
  if(locked.current)return;
  locked.current=true;setBusy(true);setMessage("");
  try {
   const response=await fetch("/api/store/path",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});
   const result=readPathWriteReply(response.status,await response.json());
   if(result.state==="saved"){window.location.reload();return;}
   setMessage(result.message);
   if(result.state==="uncertain")setUncertain(true);
   else locked.current=false;
   setBusy(false);
  } catch {
   setMessage(readPathWriteReply(0,null).message);setUncertain(true);setBusy(false);
  }
 }
 function submit(event: FormEvent<HTMLFormElement>) {
  event.preventDefault();if(locked.current)return;
  const form=new FormData(event.currentTarget);
  const goalCents=readMoney(String(form.get("goal") || "0"),parseCurrency(currency));
  if(goalCents===null){setMessage("Please enter a plain amount in your store's currency.");return;}
  void request({action:"start",answers:{goalCents,skills:form.get("skills"),subject:form.get("subject"),minutes:Number(form.get("minutes")),audience:form.get("audience"),timeZone:Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC"}});
 }
 return <form onSubmit={submit} aria-label={answers?"Your Path answers":"Start your Path"} aria-busy={busy} className="mt-6 grid max-w-xl gap-5">
  <label className="grid gap-2 font-semibold">1. What is your personal monthly goal?
   <span className="text-sm font-normal text-ink-soft">Optional, in {currency.toUpperCase()}. Your own goal, without a forecast.</span>
   <input className="field" disabled={busy} name="goal" type="number" min="0" step={decimalsOf(currency)===0?"1":"0.01"} defaultValue={answers?.goalCurrency===currency?moneyField(answers.goalCents,currency):"0"}/>
  </label>
  <fieldset className="grid gap-3"><legend className="font-semibold">2. What could you help someone with?</legend>
   <label className="grid gap-2">Your skills<input className="field" disabled={busy} name="skills" maxLength={120} required defaultValue={answers?.skills}/></label>
   <label className="grid gap-2">Your subject<input className="field" disabled={busy} name="subject" maxLength={80} required defaultValue={answers?.subject}/></label>
  </fieldset>
  <label className="grid gap-2 font-semibold">3. How much time would you like to set aside each day?
   <select className="field" disabled={busy} name="minutes" defaultValue={answers?.minutes || 15}>{MINUTES.map(n=><option key={n} value={n}>{n} minutes</option>)}</select>
  </label>
  <label className="grid gap-2 font-semibold">4. Where do people already hear from you?
   <select className="field" disabled={busy} name="audience" defaultValue={answers?.audience || "none"}>{AUDIENCES.map(a=><option key={a} value={a}>{AUDIENCE_WORDS[a]}</option>)}</select>
  </label>
  <p className="text-sm text-ink-soft">Your browser&apos;s time zone sets your check-in days. Sundays and two rest days each week are yours.</p>
  <div className="flex flex-wrap gap-3"><button disabled={busy||uncertain} className="btn btn-primary">{busy?"Saving…":answers?"Save your answers":"Start your Path"}</button>
   {answers?<button type="button" disabled={busy||uncertain} className="btn btn-secondary" onClick={()=>{if(locked.current)return;if(window.confirm("Delete your Path answers, check-in days and saved level? Your store and orders stay as they are.")) void request({action:"forget"});}}>Delete your Path</button>:null}</div>
  {message?<p role="alert" className="notice notice-error">{message}</p>:null}
 </form>;
}
