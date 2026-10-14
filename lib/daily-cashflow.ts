import { ledgerPaymentsComplete, type PaymentLedgerReading } from "@/lib/payment-ledger-coverage";
import type { StatsData } from "@/lib/stats";
import { spendBy, type AdSpend } from "@/lib/ad-spend-rules";
export type DailyCashflowRow = { date: string; payments: number | null; refunds: number | null; ads: number | null; afterRefunds: number | null; afterAds: number | null };
/** Daily recorded money, before fees and other costs. Missing reads stay unknown. */
export function dailyCashflowRows(data: PaymentLedgerReading & Pick<StatsData, "refundDays" | "days">, range: "d7" | "d30" | "d90", spends?: AdSpend[]): DailyCashflowRow[] {
  if (data.sales !== "ok" || !data.channelDays) return [];
  const days = data.days.slice(-(range === "d7" ? 7 : range === "d30" ? 30 : 90));
  const paymentsKnown = ledgerPaymentsComplete(data);
  const complete = paymentsKnown && data.cashflowComplete === true && data.refundDays != null;
  return days.map(({ date }) => {
    const payments = paymentsKnown ? Object.values(data.channelDays ?? {}).reduce((sum, amounts) => sum + (amounts[date] ?? 0), 0) : null;
    const refunds = complete ? data.refundDays?.[date] ?? 0 : null;
    const ads = spends === undefined ? null : spendBy(spends, date, date).total;
    const afterRefunds = refunds === null || payments === null ? null : payments - refunds;
    return { date, payments, refunds, ads, afterRefunds, afterAds: afterRefunds === null || ads === null ? null : afterRefunds - ads };
  });
}
