/** Manually reviewed permissions only. No creator is listed without dated evidence; no runtime account reads. */
export type CreatorShowcasePermission={name:string;href:string;description:string;permission:{scope:"public-showcase";grantedAt:string;recordedAt:string;evidenceRef:string;revokedAt?:string}};
export const SHOWCASE_REVIEWED_AT="2026-10-20";
export const APPROVED_CREATOR_SHOWCASE:readonly CreatorShowcasePermission[]=[];
export type ShowcaseEntry={name:string;href:string;description:string;kind:"demo"|"creator";permissionRecordedAt:string|null};
const day=(value:string)=>{if(!/^\d{4}-\d{2}-\d{2}$/.test(value))return false;const parsed=Date.parse(value+"T00:00:00Z");return Number.isFinite(parsed)&&new Date(parsed).toISOString().slice(0,10)===value;};
export function creatorShowcase(records:readonly CreatorShowcasePermission[]=APPROVED_CREATOR_SHOWCASE,reviewedAt=SHOWCASE_REVIEWED_AT):ShowcaseEntry[]{
 const real=records.filter(record=>record.name.trim()&&record.description.trim()&&/^\/@[a-z0-9](?:[a-z0-9._-]{1,22}[a-z0-9])$/.test(record.href)&&record.permission?.scope==="public-showcase"&&record.permission.evidenceRef.trim()&&day(record.permission.grantedAt)&&day(record.permission.recordedAt)&&record.permission.grantedAt<=record.permission.recordedAt&&record.permission.recordedAt<=reviewedAt&&!record.permission.revokedAt)
 .map(record=>({name:record.name,href:record.href,description:record.description,kind:"creator" as const,permissionRecordedAt:record.permission.recordedAt}));
 return real.length?real:[{name:"Harbor Kitchen",href:"/demo",description:"A fictional store built by Marktmorgen to demonstrate the product. It is not a customer endorsement or a real creator result.",kind:"demo",permissionRecordedAt:null}];
}
export const CREATOR_SHOWCASE=creatorShowcase();
