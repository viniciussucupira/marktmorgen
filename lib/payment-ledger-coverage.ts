import type { StatsData } from "@/lib/stats";
import { paidFiguresComplete } from "@/lib/paid-coverage";
export type PaymentLedgerReading = Pick<StatsData, "sales" | "partial" | "paymentsComplete" | "cashflowComplete" | "channelDays"> & Partial<Pick<StatsData, "renewals">>;
/** Receipt coverage includes purchases and renewals, independently of refunds. Legacy snapshots may only confirm the combined ledger. */
export function ledgerPaymentsComplete(data: PaymentLedgerReading): boolean {
  return paidFiguresComplete(data) && !data.renewals?.partial && data.channelDays != null && (data.paymentsComplete ?? data.cashflowComplete) === true;
}
