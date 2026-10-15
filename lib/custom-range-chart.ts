import type { RangeData } from "@/lib/stats";
import { paidFiguresComplete } from "@/lib/paid-coverage";
export const CUSTOM_RANGE_METRICS = [
 {value:"visitors",label:"Visitors",paid:false},
 {value:"views",label:"Page views",paid:false},
 {value:"checkouts",label:"Checkouts started",paid:false},
 {value:"sales",label:"Sales",paid:true},
 {value:"cents",label:"Revenue",paid:true},
] as const;
export type CustomRangeMetric = typeof CUSTOM_RANGE_METRICS[number]["value"];
/** Re-check each snapshot so a prior paid selection cannot expose partial values. */
export function effectiveCustomRangeMetric(range:RangeData,metric:CustomRangeMetric):CustomRangeMetric {
 const choice=CUSTOM_RANGE_METRICS.find(item=>item.value===metric);
 return !choice || (choice.paid&&!paidFiguresComplete(range)) ? "visitors" : choice.value;
}
