import type { StatsData } from "@/lib/stats";
import { channelCashflows } from "@/lib/channel-cashflow";

export type RefundActivityRow = { source: string; payments: number; refunds: number; records: number; share: number | null };
export type RefundActivity = { payments: number; refunds: number; records: number; share: number | null; rows: RefundActivityRow[] };
/** Same-period money, not the share of purchases or buyers that were refunded. */
export function refundActivityFrom(
  data: Pick<StatsData, "sales" | "cashflowComplete" | "channelDays" | "refunds">,
  range: "d7" | "d30" | "d90", from: string, to: string,
): RefundActivity | null {
  if (data.sales !== "ok" || data.cashflowComplete !== true || !data.channelDays || !data.refunds?.[range]) return null;
  const counts = new Map<string, number>();
  for (const row of data.refunds?.[range] ?? []) {
    const source = row.source || "direct";
    counts.set(source, (counts.get(source) ?? 0) + row.refunds);
  }
  const cash = channelCashflows(data, range, [], new Map(), from, to);
  const rows = cash.map((row): RefundActivityRow => ({
    source: row.source, payments: row.receipts, refunds: row.refunds ?? 0,
    records: counts.get(row.source) ?? 0,
    share: row.receipts > 0 ? (row.refunds ?? 0) / row.receipts : null,
  })).filter((row) => row.refunds > 0 || row.records > 0)
    .sort((a, b) => b.refunds - a.refunds || b.records - a.records || a.source.localeCompare(b.source));
  const payments = cash.reduce((sum, row) => sum + row.receipts, 0);
  const refunds = rows.reduce((sum, row) => sum + row.refunds, 0);
  return { payments, refunds, records: rows.reduce((sum, row) => sum + row.records, 0), share: payments > 0 ? refunds / payments : null, rows };
}
