import type { StatsData } from "@/lib/stats";
/** A successful provider response can still be a partial purchase reading. */
export function paidFiguresComplete(data:Pick<StatsData,"sales"|"partial">):boolean {return data.sales==="ok" && !data.partial;}
