import type { Store } from "@/lib/store";
import { readPath, chargeStudio, type PathRecord } from "@/lib/path";
import { countsFresh, moneyFresh, factsFrom } from "@/lib/path-facts";
import { localDay, pathProgress, reminderOf, streakOf } from "@/lib/path-rules";
import { alertCreator, type Alert } from "@/lib/phone-alerts";
import { studioPath } from "@/lib/studio-route";
import { maySendPathReminder, PATH_REMINDER_UNITS } from "@/lib/path-reminder-rules";
type Services={read:()=>Promise<PathRecord|null>;reserve:(units:number)=>Promise<boolean>;push:(alert:Alert,day:string,timeZone:string)=>Promise<number>};
export type PathReminderResult={ok:true;devices:number}|{ok:false;reason:"not-started"|"quiet"|"stale"|"complete"|"allowance"|"unavailable"};
/** Requested by the owner. Reads existing facts, reserves before dispatch, never records a mission or sends email. */
export async function sendPathReminder(store:Store,now=Date.now(),services:Partial<Services>={}):Promise<PathReminderResult>{
 try {
  const record=await (services.read || (()=>readPath(store)))();
  if(!record)return {ok:false,reason:"not-started"};
  if(!maySendPathReminder(record.answers.timeZone,now))return {ok:false,reason:"quiet"};
  if(!countsFresh(record.counts,now)||!moneyFresh(record.money,store,now))return {ok:false,reason:"stale"};
  const day=localDay(record.answers.timeZone,now);
  const progress=pathProgress(factsFrom(store,record.counts,record.money),record.answers,record.startedAt,now);
  const reminder=reminderOf(progress,streakOf(record.checkins,day));
  if(!reminder)return {ok:false,reason:"complete"};
  if(!(await (services.reserve || chargeStudio(store))(PATH_REMINDER_UNITS)))return {ok:false,reason:"allowance"};
  const push=services.push || ((alert:Alert,seed:string,timeZone:string)=>alertCreator(store,"path",alert,{seed,at:now,pathTimeZone:timeZone}));
  const devices=await push({...reminder,url:studioPath(store,"","path")},day,record.answers.timeZone);
  return {ok:true,devices};
 }catch{return {ok:false,reason:"unavailable"};}
}
