/** Reviewed snapshot only: no account/provider reads on a public page. Unknown is null, never zero. */
export type PlatformMetric="stores"|"sales"|"activeCreators";
export const PLATFORM_PROOF_REVIEW_DATE="2026-10-20";
export const PLATFORM_PROOF_MINIMUM:Readonly<Record<PlatformMetric,number>>={stores:100,sales:1000,activeCreators:50};
export type PlatformProofSnapshot={asOf:string;evidenceRef:string;mode:"live";excludesDemoAndTest:true;counts:Record<PlatformMetric,number|null>;activeWindowDays:30};
/** No audited platform-wide dataset has been supplied. Keep all counters absent. */
export const PLATFORM_PROOF_SNAPSHOT:PlatformProofSnapshot|null=null;
const labels:Record<PlatformMetric,string>={stores:"Stores created",sales:"Settled paid sales",activeCreators:"Creators active in the last 30 days"};
export function platformProof(snapshot:PlatformProofSnapshot|null,minimum:Readonly<Record<PlatformMetric,number>>=PLATFORM_PROOF_MINIMUM,reviewDate=PLATFORM_PROOF_REVIEW_DATE){
 if(!snapshot||snapshot.mode!=="live"||snapshot.excludesDemoAndTest!==true||snapshot.activeWindowDays!==30||!snapshot.evidenceRef.trim())return [];
 if(!/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(?:\.\d{3})?Z$/.test(snapshot.asOf))return [];
 const at=Date.parse(snapshot.asOf),reviewed=Date.parse(reviewDate+"T23:59:59Z");
 if(!Number.isFinite(at)||!Number.isFinite(reviewed)||new Date(at).toISOString().slice(0,10)!==snapshot.asOf.slice(0,10)||at>reviewed||reviewed-at>30*86400000)return [];
 return (["stores","sales","activeCreators"] as const).flatMap(key=>{
 const count=snapshot.counts[key],floor=minimum[key];
 return typeof count==="number"&&Number.isSafeInteger(count)&&count>=0&&Number.isSafeInteger(floor)&&floor>0&&count>=floor?[{key,label:labels[key],count,asOf:snapshot.asOf}]:[];
 });
}
