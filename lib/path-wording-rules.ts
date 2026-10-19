import {forbiddenIn} from "@/lib/path-rules";
import {heldToFacts} from "@/lib/store-assistant-rules";
export type WordingSource={mission:string;step:string};
export const PATH_WORDING_MAX_CHARS=240;
export const PATH_WORDING_MAX_TOKENS=240;
export const PATH_WORDING_PRIVACY="If you request optional AI wording, only a fixed instruction goes to the writing provider. Your free-text answers, personal goal, money and buyer details are not sent, and the suggestion never changes recorded progress.";
export const PATH_WORDING_WORDS={
 button:"Try AI wording",
 intro:"Optional: use one writing job to try another wording of this first step. Started attempts count, even when the fixed wording is kept. Your original steps and recording rule remain above.",
 busy:"Trying another wording…",
 ai:"AI wording suggestion",
 fixed:"Fixed wording",
 fallback:"The fixed step is ready. Writing help did not provide another usable wording.",
 unavailable:"Writing help is unavailable right now. Your original steps remain ready.",
 used:"This month's writing allowance is used. Your fixed step is ready.",
 off:"Writing help is not available for this store right now. Your fixed step is ready.",
 slow:"Please wait a minute before requesting another wording. Your fixed step is ready.",
 stale:"Your next step changed. Reload Path before requesting another wording.",
} as const;
const ACTION=/^(Write|Make|Put|Open|Post|Share)\b/;
const CONNECTORS=new Set(["and","or","if","before","after","without","not","once","until","unless"]);
const GLUE=new Set(["a","an","the","your","you","it","its","this","that","to","of","in","on","at","for","from","as","please","way"]);
const PROTECTED=["your store's name","your store's address","your store's details","one product","short link","Share the store"];
const tokens=(text:string)=>text.toLowerCase().replace(/\b([a-z]+)'s\b/g,"$1").replace(/\bsingle\b/g,"one").match(/[a-z]+/g)??[];
const ordered=(values:string[])=>[...values].sort().join("|");
/** Payment, consent and checkout safety instructions always retain fixed wording. */
export function wordingSource(mission:{id:string;state:string;steps:readonly string[]}|null|undefined):WordingSource|null{
 if(!mission||mission.state!=="open"||!["title","product","social","posts","return-intro","traffic-1","traffic-2","traffic-3","traffic-5","traffic-6","traffic-8"].includes(mission.id))return null;
 const step=mission.steps[0];
 return typeof step==="string"&&step.length<=PATH_WORDING_MAX_CHARS&&ACTION.test(step)&&!forbiddenIn(step)?{mission:mission.id,step}:null;
}
/** A bounded paraphrase of an existing imperative, not a new fact or mission state. */
export function readWording(raw:unknown,source:WordingSource):string|null{
 if(!raw||typeof raw!=="object"||Array.isArray(raw))return null;
 const value=raw as Record<string,unknown>;
 if(Object.keys(value).length!==1||typeof value.text!=="string")return null;
 const text=value.text.trim();
 if(!text||text===source.step||text.length>PATH_WORDING_MAX_CHARS||/[\p{Cc}\p{Cf}\p{Sc}<>\[\]@0-9!?]/u.test(text)||forbiddenIn(text)||!heldToFacts(text,source.step))return null;
 if(/\b(?:will|can|must|should|earned|income|profit|revenue|guarantee\w*|recorded|complete\w*|done|level|success\w*|boost|grow|ready)\b/i.test(text))return null;
 if(text.match(ACTION)?.[0]!==source.step.match(ACTION)?.[0])return null;
 const original=tokens(source.step),reply=tokens(text);
 if(ordered(original.filter(word=>!GLUE.has(word)))!==ordered(reply.filter(word=>!GLUE.has(word))))return null;
 if(ordered(original.filter(word=>CONNECTORS.has(word)))!==ordered(reply.filter(word=>CONNECTORS.has(word))))return null;
 const normalizedOriginal=original.join(" "),normalizedReply=reply.join(" ");
 for(const phrase of PROTECTED){const normalized=tokens(phrase).join(" ");if(normalizedOriginal.includes(normalized)&&!normalizedReply.includes(normalized))return null;}
 return text;
}
export type PathWordingReply={ok:true;mission:string;source:string;text:string;fallback:boolean;left?:number;reason?:"off"|"used"|"failed"};
export function readPathWordingReply(raw:unknown,source:WordingSource):PathWordingReply|null{
 if(!raw||typeof raw!=="object"||Array.isArray(raw))return null;
 const value=raw as Record<string,unknown>;
 if(Object.keys(value).some(key=>!["ok","mission","source","text","fallback","left","reason"].includes(key)))return null;
 if(value.ok!==true||value.mission!==source.mission||value.source!==source.step||typeof value.fallback!=="boolean"||typeof value.text!=="string")return null;
 if(value.reason!==undefined&&(!value.fallback||!["off","used","failed"].includes(String(value.reason))))return null;
 if(value.left!==undefined&&(!Number.isSafeInteger(value.left)||Number(value.left)<0))return null;
 if(value.fallback?value.text!==source.step:readWording({text:value.text},source)!==value.text)return null;
 return {ok:true,mission:source.mission,source:source.step,text:value.text,fallback:value.fallback,...(value.left!==undefined?{left:Number(value.left)}:{}),...(value.reason!==undefined?{reason:value.reason as "off"|"used"|"failed"}:{})};
}
