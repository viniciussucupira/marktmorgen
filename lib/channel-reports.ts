import type { ChannelCashflow } from "@/lib/channel-cashflow";
import { COHORT_AGES, type WeeklyBuyerCohorts, type BuyerChannelWindow } from "@/lib/buyer-channel-rules";
import { csvCell } from "@/lib/csv";
import { channelName } from "@/lib/channel-names";
import { toMajor } from "@/lib/money";

type Cell = string | number | null;
export type ReportPeriod = { from: string; to: string; currency: string };
/** Text is formula-safe; finite numbers remain numbers, including negative results. */
const line = (cells: Cell[]) => cells.map((value) => typeof value === "number"
  ? Number.isFinite(value) ? String(value) : ""
  : csvCell(value ?? "")).join(",");
const csv = (rows: Cell[][]) => "\uFEFF" + rows.map(line).join("\r\n") + "\r\n";
const amount = (value: number | null, currency: string) => value === null ? null : toMajor(value, currency);

export function cashflowReport(rows: ChannelCashflow[], period: ReportPeriod): string {
  const note = "Recorded payments include renewals; refunds include pending refunds in the days recorded. Before fees, tax, commissions and other costs; not profit or causal advertising lift. Blank result means incomplete payment or refund coverage.";
  return csv([
    ["From (UTC)", "To (UTC)", "Currency", "Channel", "Payments received", "Refunds recorded", "Ad spend recorded", "After refunds", "After refunds and ads", "Payment and refund coverage", "Definition"],
    ...rows.map((r): Cell[] => [period.from, period.to, period.currency.toUpperCase(), channelName(r.source), amount(r.receipts, period.currency), amount(r.refunds, period.currency), amount(r.adSpend, period.currency), amount(r.afterRefunds, period.currency), amount(r.afterAds, period.currency), r.afterRefunds === null ? "Incomplete" : "Complete", note]),
  ]);
}

export function buyerChannelReport(window: BuyerChannelWindow, historyPartial: boolean, period: ReportPeriod): string {
  const note = "First observed purchase in selected UTC days, from up to 180 days of history; not lifetime acquisition. Revenue includes later purchases and one-click extras, before refunds and fees. Renewals are not repeat purchases. The 30-day rate uses only buyers observed for a full 30 days; blank means no eligible buyers. Counts exclude orders without a buyer identity.";
  return csv([
    ["From (UTC)", "To (UTC)", "Currency", "First recorded channel", "Buyers", "Repeat buyers", "Orders", "Gross revenue", "Gross revenue per buyer", "Buyers observed for 30 days", "Bought again within 30 days", "30-day repurchase rate (%)", "History coverage", "Unidentified orders in selected days (whole report)", "Definition"],
    ...window.rows.map((r): Cell[] => [period.from, period.to, period.currency.toUpperCase(), channelName(r.source), r.buyers, r.repeatBuyers, r.orders, amount(r.cents, period.currency), r.buyers ? amount(Math.round(r.cents / r.buyers), period.currency) : null, r.eligible30, r.repeated30, r.eligible30 ? Math.round(r.repeated30 / r.eligible30 * 100) : null, historyPartial ? "Partial" : "Up to 180 days", window.unidentifiedOrders, note]),
    ...(!window.rows.length && window.unidentifiedOrders ? [[period.from, period.to, period.currency.toUpperCase(), "No identified buyers", 0, 0, 0, null, null, 0, 0, null, historyPartial ? "Partial" : "Up to 180 days", window.unidentifiedOrders, note] as Cell[]] : []),
  ]);
}

/** One row per cohort and age, with the exact mature denominator beside every rate. */
export function weeklyCohortReport(cohorts: WeeklyBuyerCohorts, historyPartial: boolean): string {
  const note = "UTC Monday of first observed purchase in up to 180 days of history, independent of the selected channel window. Only buyers observed for the full age enter its denominator. Cumulative repeat purchases within that many days; not recurring renewals, retention activity or lifetime acquisition. Blank rate means nobody has enough observation time; counts exclude unidentified orders.";
  return csv([
    ["First purchase week (UTC Monday)", "As of (UTC)", "Cohort buyers", "Days after first purchase", "Buyers observed for full period", "Buyers who bought again within period", "Repurchase rate (%)", "History coverage", "Unidentified orders (whole report)", "Definition"],
    ...cohorts.rows.flatMap((row) => COHORT_AGES.map((age): Cell[] => {
      const { eligible, repeated } = row.observations[age];
      return [row.week, cohorts.asOf, row.buyers, age, eligible, repeated, eligible ? Math.round(repeated / eligible * 100) : null, historyPartial ? "Partial" : "Up to 180 days", cohorts.unidentifiedOrders, note];
    })),
    ...(!cohorts.rows.length && cohorts.unidentifiedOrders ? [["No identified buyers", cohorts.asOf, 0, null, 0, 0, null, historyPartial ? "Partial" : "Up to 180 days", cohorts.unidentifiedOrders, note] as Cell[]] : []),
  ]);
}
