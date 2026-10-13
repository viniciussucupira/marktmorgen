import type { ChannelRow, StatsData } from "@/lib/stats";

/** Receipts and refunds in the same UTC days, not accounting profit or ad lift. */
export type ChannelCashflow = {
  source: string;
  receipts: number;
  refunds: number | null;
  adSpend: number;
  afterRefunds: number | null;
  afterAds: number | null;
  backPerOne: number | null;
};

export function channelCashflows(
  data: Pick<StatsData, "sales" | "cashflowComplete" | "channelDays" | "refunds">,
  range: "d7" | "d30" | "d90",
  channels: ChannelRow[],
  spend: Map<string, number>,
  from: string,
  to: string,
): ChannelCashflow[] {
  const receipts = new Map<string, number>();
  for (const [source, days] of Object.entries(data.channelDays ?? {})) {
    for (const [day, cents] of Object.entries(days)) {
      if (day >= from && day <= to) receipts.set(source || "direct", (receipts.get(source || "direct") ?? 0) + cents);
    }
  }
  const refunds = new Map<string, number>();
  for (const row of data.refunds?.[range] ?? []) {
    const source = row.source || "direct";
    refunds.set(source, (refunds.get(source) ?? 0) + row.cents);
  }
  const names = new Set([...channels.map((c) => c.source || "direct"), ...receipts.keys(), ...refunds.keys(), ...spend.keys()]);
  const complete = data.sales === "ok" && data.cashflowComplete === true;
  return [...names].map((source) => {
    const received = receipts.get(source) ?? 0;
    const returned = complete ? refunds.get(source) ?? 0 : null;
    const cost = spend.get(source) ?? 0;
    const afterRefunds = returned === null ? null : received - returned;
    return {
      source,
      receipts: received,
      refunds: returned,
      adSpend: cost,
      afterRefunds,
      afterAds: afterRefunds === null ? null : afterRefunds - cost,
      backPerOne: afterRefunds === null || cost <= 0 ? null : afterRefunds / cost,
    };
  }).sort((a, b) => (b.afterAds ?? b.receipts) - (a.afterAds ?? a.receipts) || a.source.localeCompare(b.source));
}

/** A recorded result, never an instruction to raise an ad budget. */
export function cashflowStatus(row: ChannelCashflow): string {
  if (row.afterAds === null) return "Waiting for complete figures";
  if (row.adSpend <= 0) return "No ad spend recorded";
  return row.afterAds < 0 ? "Below recorded ad spend" : "Covered recorded ad spend";
}
