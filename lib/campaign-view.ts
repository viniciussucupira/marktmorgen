import type { CampaignResultRow } from "@/lib/campaign-results";
import { channelName } from "@/lib/channel-names";
export const CAMPAIGN_SORTS = [
  {key:"ads",label:"Recorded ads: highest first"},
  {key:"gross",label:"Gross amount: highest first"},
  {key:"result-desc",label:"Gross less ads: highest first"},
  {key:"result-asc",label:"Gross less ads: lowest first"},
  {key:"records",label:"Paid records: highest first"},
  {key:"visits",label:"Visits: highest first"},
  {key:"name",label:"Campaign name: A to Z"},
] as const;
export type CampaignSort = (typeof CAMPAIGN_SORTS)[number]["key"];
export function campaignSort(raw:string):CampaignSort {return CAMPAIGN_SORTS.find(sort=>sort.key===raw)?.key ?? "ads";}
const searchable=(value:string)=>value.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase();
/** A local view over recorded totals; unknown numeric values sort last in either direction. */
export function campaignView(rows:CampaignResultRow[],query:string,sort:CampaignSort):CampaignResultRow[]{
  const terms=searchable(query.trim()).split(/\s+/).filter(Boolean);
  const selected=rows.filter(row=>{
    const channels=[...(row.paymentChannels ?? []),...(row.adChannels ?? [])];
    const text=searchable([row.campaign,...channels,...channels.map(channelName)].join(" "));
    return terms.every(term=>text.includes(term));
  });
  const value=(row:CampaignResultRow):number|null=>sort==="gross" ? row.gross : sort==="result-desc" || sort==="result-asc" ? row.grossLessAds : sort==="records" ? row.paidRecords : sort==="visits" ? row.visits : row.ads;
  return selected.sort((a,b)=>{
    const name=a.campaign.localeCompare(b.campaign);
    if(sort==="name")return name;
    const x=value(a),y=value(b);
    const xKnown=x!==null && Number.isFinite(x),yKnown=y!==null && Number.isFinite(y);
    if(!xKnown || !yKnown)return xKnown ? -1 : yKnown ? 1 : name;
    return (sort==="result-asc" ? x-y : y-x) || name;
  });
}
