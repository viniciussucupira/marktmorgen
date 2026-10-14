import type { StatsData } from "@/lib/stats";
export type PaymentMixRow = { source: string; cents: number; share: number; identified: boolean };
export type PaymentMix = { from: string; to: string; total: number; unidentified: number; unidentifiedShare: number | null; largest: PaymentMixRow | null; topThreeShare: number | null; rows: PaymentMixRow[] };
/** Gross recorded payments, including renewals. Unknown channel groups are not treated as a single marketing channel. */
export function paymentMixFrom(data: Pick<StatsData, "sales" | "partial" | "cashflowComplete" | "channelDays" | "days">, range: "d7" | "d30" | "d90"): PaymentMix | null {
  if (data.sales !== "ok" || data.partial || data.cashflowComplete !== true || !data.channelDays) return null;
  const days = data.days.slice(-(range === "d7" ? 7 : range === "d30" ? 30 : 90));
  if (!days.length) return null;
  const selected = new Set(days.map(d => d.date));
  const by = new Map<string, number>();
  for (const [rawSource, amounts] of Object.entries(data.channelDays)) {
    const source = rawSource || "direct";
    for (const [day, cents] of Object.entries(amounts)) {
      if (!selected.has(day)) continue;
      if (!Number.isSafeInteger(cents) || cents < 0) return null;
      by.set(source, (by.get(source) ?? 0) + cents);
    }
  }
  const total = [...by.values()].reduce((sum,cents) => sum+cents,0);
  if (!Number.isSafeInteger(total)) return null;
  const rows = [...by].filter(([,cents]) => cents > 0).map(([source,cents]) => ({source,cents,share:cents/total,identified: !["direct","unrecorded","imported"].includes(source)})).sort((a,b) => b.cents-a.cents || a.source.localeCompare(b.source));
  const identified = rows.filter(row => row.identified);
  const unidentified = rows.filter(row => !row.identified).reduce((sum,row) => sum+row.cents,0);
  return {from:days[0].date,to:days[days.length-1].date,total,unidentified,unidentifiedShare:total ? unidentified/total : null,largest:identified[0] ?? null,topThreeShare:total ? identified.slice(0,3).reduce((sum,row)=>sum+row.cents,0)/total : null,rows};
}
export function paymentShare(share: number | null): string { return share === null ? "—" : (share*100).toFixed(1)+"%"; }
