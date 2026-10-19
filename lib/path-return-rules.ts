import {localDay,validPathDay,validTimeZone,type Place} from "@/lib/path-rules";
export type PathReturnStep={day:string;introHash:string};
export type ReturnMission={id:"return-intro";title:string;why:string;steps:string[];closesOn:string;place:Place;state:"open"|"done"};
export const RETURN_HEADING="Welcome back";
export const RETURN_PRIVACY_LINE="We also keep a private return-step date and a fingerprint of your store introduction. This keeps the same small step in place when you reload; opening it never completes it. These markers go with your Path when you delete it or close or delete your store.";
const HASH=/^[0-9a-f]{64}$/;
export function readReturnStep(raw:unknown):PathReturnStep|null{
 if(!raw||typeof raw!=="object"||Array.isArray(raw))return null;
 const value=raw as Record<string,unknown>;
 return validPathDay(value.day)&&typeof value.introHash==="string"&&HASH.test(value.introHash)?{day:value.day,introHash:value.introHash}:null;
}
/** The current public introduction, read by the server, is the only completion witness. */
export function pathReturnMission(step:PathReturnStep|undefined,timeZone:string,facts:{introHash:string;introPublished:boolean},now:number):ReturnMission|null{
 if(!step||!readReturnStep(step)||!validTimeZone(timeZone)||!Number.isFinite(now)||Math.abs(now)>=8.64e15||step.day!==localDay(timeZone,now))return null;
 return {
  id:"return-intro",
  title:"Give your store's introduction one clear update",
  why:"Welcome back. Start with one useful sentence about what your store offers. Set aside about ten minutes; your reached level stays with you.",
  steps:["Open your store's details and read the introduction as a visitor would.","Write one clear sentence about what you offer and who it helps. Use your own words.","Save the updated introduction when you are ready to publish it, then return to Path."],
  closesOn:"Recorded when your store's published introduction is non-empty and differs from the one saved when this step appeared.",
  place:{label:"Edit your store's introduction",hash:"#details"},
  state:facts.introPublished&&HASH.test(facts.introHash)&&facts.introHash!==step.introHash?"done":"open",
 };
}
/** Uses the existing owner-requested reminder channel and quiet-hours admission. */
export function returnReminderOf(mission:ReturnMission|null):{title:string;body:string}|null{
 return mission?.state==="open"?{title:"One small step for your Path",body:"Welcome back. Take about ten minutes to give your store's introduction one clear update."}:null;
}
