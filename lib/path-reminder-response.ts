export type PathReminderReply = { state: "requested" | "unchanged" | "refused" | "uncertain"; message: string };
const REFUSALS: Record<string,string> = {
 "not-started":"Start your Path first.",
 quiet:"Your Path is quiet from 9 p.m. until 8 a.m. in your time zone. Please return after quiet hours.",
 stale:"Refresh your Path first so the reminder uses a recent reading.",
 complete:"Your first real sale is recorded. There is no next mission to send.",
 allowance:"Your studio allowance has no room for this reminder.",
};
const uncertain = (): PathReminderReply => ({state:"uncertain",message:"The reminder request could not be confirmed. It may have gone through. Refresh this page before trying again."});
/** Dispatch can have started before a failure. Never infer no send or success
 * from a contradictory status, malformed reply or unavailable outcome. */
export function readPathReminderReply(status:number,body:unknown):PathReminderReply {
 const success=status>=200&&status<300;
 const refusal=status>=400&&status<500;
 if(!Number.isInteger(status)||(!success&&!refusal)||!body||typeof body!=="object"||Array.isArray(body))return uncertain();
 const value=body as Record<string,unknown>;
 if(!Object.hasOwn(value,"ok"))return uncertain();
 if(success&&value.ok===true&&Object.hasOwn(value,"devices")&&typeof value.devices==="number"&&Number.isSafeInteger(value.devices)&&value.devices>=0){
  return value.devices>0?{state:"requested",message:"Reminder requested for "+value.devices+" of your devices."}:{state:"unchanged",message:"No device request was confirmed. Check your device choices, or return tomorrow if you already requested one today."};
 }
 if(value.ok===false&&Object.hasOwn(value,"reason")&&typeof value.reason==="string"&&Object.hasOwn(REFUSALS,value.reason))return {state:"refused",message:REFUSALS[value.reason]};
 return uncertain();
}
