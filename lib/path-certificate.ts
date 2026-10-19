import {LEVELS,LEVEL_NAMES} from "@/lib/path-rules";
import {pathShare,type PathShareInput} from "@/lib/path-share";
export type PathCertificateInput=PathShareInput & {recordedAt:number};
export const CERTIFICATE_WORDS={
 title:"Your private level certificates",
 help:"Choose a reached level and download a personal record. Nothing is posted or sent. Your name is omitted. Sales amounts are off by default.",
 level:"Reached level",money:"Include sales in this certificate",download:"Download certificate",
 requested:"Certificate download requested. Check your browser's downloads.",
 unavailable:"The download could not be requested. You can copy the certificate text below.",
 text:"Certificate text",textHelp:"The download contains the same information in an accessible web page. Keep it private, or review it before sharing it yourself.",
 artifactTitle:"Marktmorgen Path level certificate",
 scope:"A personal record of a reached Path level, not a professional qualification.",
 kept:"Reached levels stay recorded after refunds. This records a saved level, not a current balance or a prediction.",
 source:"Sales levels use paid live checkouts read by the server from this store's own Stripe account, with refunds taken off. First Light uses the published store and its listed product.",
 reading:"Saved level reading",reached:"Reached level",
} as const;
export const CERTIFICATE_PRIVACY="Level certificates are generated only when you request a download, from your private saved Path level. They contain no name or contact details. Sales amounts are off by default. No public certificate page, separate stored certificate or automatic message is created; a downloaded copy remains under your control.";
/** Inputs come only from the owner-only server page's existing Path record. No new reading or storage. */
export function certificateLevels(input:PathCertificateInput):number[]{
 if(!Number.isInteger(input.level)||input.level<0||input.level>=LEVELS.length||!Number.isSafeInteger(input.recordedAt)||input.recordedAt<=0||input.recordedAt>8.64e15||!pathShare(input))return [];
 return Array.from({length:input.level+1},(_,index)=>index);
}
export function pathCertificate(input:PathCertificateInput,level:number,includeMoney=false){
 if(!certificateLevels(input).includes(level))return null;
 const content=pathShare({...input,level},includeMoney);
 if(!content)return null;
 return {level:LEVEL_NAMES[LEVELS[level]],reading:new Date(input.recordedAt).toISOString(),money:content.money,moneyReading:content.reading};
}
export function pathCertificateText(input:PathCertificateInput,level:number,includeMoney=false):string|null{
 const content=pathCertificate(input,level,includeMoney);if(!content)return null;
 return [CERTIFICATE_WORDS.artifactTitle,CERTIFICATE_WORDS.reached+": "+content.level,CERTIFICATE_WORDS.reading+": "+content.reading,CERTIFICATE_WORDS.scope,CERTIFICATE_WORDS.kept,CERTIFICATE_WORDS.source,...(content.money?["Sales kept after refunds: "+content.money,content.moneyReading||""]:[])].join("\n");
}
const escapes:Record<string,string>={"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"};
const escaped=(text:string)=>text.replace(/[&<>"']/g,char=>escapes[char]);
export function pathCertificateHtml(input:PathCertificateInput,level:number,includeMoney=false):string|null{
 const content=pathCertificate(input,level,includeMoney);if(!content)return null;
 return '<!doctype html><html lang="en-US"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><meta name="referrer" content="no-referrer"><title>'+CERTIFICATE_WORDS.artifactTitle+'</title><style>body{font:1.125rem/1.6 system-ui,sans-serif;color:#241a36;background:#fff;margin:2rem auto;padding:1rem;max-width:44rem}h1{font-size:2rem}dt{font-weight:700}dd{margin:0 0 1rem;overflow-wrap:anywhere}@media print{body{margin:0}}</style></head><body><main><h1>'+CERTIFICATE_WORDS.artifactTitle+'</h1><dl><dt>'+CERTIFICATE_WORDS.reached+'</dt><dd>'+escaped(content.level)+'</dd><dt>'+CERTIFICATE_WORDS.reading+'</dt><dd><time datetime="'+content.reading+'">'+content.reading+'</time></dd></dl><p>'+CERTIFICATE_WORDS.scope+'</p><p>'+CERTIFICATE_WORDS.kept+'</p><p>'+CERTIFICATE_WORDS.source+'</p>'+(content.money?'<p>Sales kept after refunds: '+escaped(content.money)+'</p><p>'+escaped(content.moneyReading||"")+'</p>':"")+'</main></body></html>';
}
