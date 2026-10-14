import type { PaymentComparison } from "@/lib/payment-comparison";
import type { PaymentMix } from "@/lib/payment-mix";
import type { AttributionTable } from "@/lib/attribution-rules";
import type { CreativeRow } from "@/lib/creative-results";
import type { CampaignResults } from "@/lib/campaign-results";
import type { DailyCashflowRow } from "@/lib/daily-cashflow";
import type { RefundActivity } from "@/lib/refund-activity";
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

export function refundActivityReport(activity: RefundActivity, period: ReportPeriod): string {
  const note = "Refund records include pending refunds and are not unique buyers or orders. Refunds are recorded in these UTC days and matched to the purchase channel; purchases may have been earlier. Payments include renewals. Refunds / payments compares same-period amounts, not the percentage of purchases refunded; it may exceed 100%. Blank ratio means no payments in the period. Only complete, matched readings.";
  return csv([
    ["From (UTC)", "To (UTC)", "Currency", "Channel", "Refund records", "Refund amount", "Payments received", "Recorded refunds / payments (%)", "Definition"],
    ...activity.rows.map((row): Cell[] => [period.from, period.to, period.currency.toUpperCase(), channelName(row.source), row.records, amount(row.refunds, period.currency), amount(row.payments, period.currency), row.share === null ? null : Math.round(row.share * 100), note]),
  ]);
}

export function dailyCashflowReport(rows: DailyCashflowRow[], currency: string): string {
  const note = "Recorded payments include renewals. Refunds include pending refunds and belong to the day recorded; purchases may be earlier. Multi-day ad entries are allocated evenly with cumulative rounding that preserves smallest currency units. Before fees, tax, commissions and other costs; not profit or advertising lift. Blank means incomplete or unavailable figures.";
  return csv([
    ["Day (UTC)", "Currency", "Payments received", "Refunds recorded", "Ad spend recorded", "After refunds", "After refunds and ads", "Definition"],
    ...rows.map((row): Cell[] => [row.date, currency.toUpperCase(), amount(row.payments, currency), amount(row.refunds, currency), amount(row.ads, currency), amount(row.afterRefunds, currency), amount(row.afterAds, currency), note]),
  ]);
}

export function campaignResultsReport(report: CampaignResults, currency: string, view?: {query:string;sort:string;total:number}): string {
  const note = "Campaign tag totals across channels; visits are not split by payment channel. Paid records include purchases and one-click extras, not unique buyers; recurring renewals excluded. Gross less ads is before refunds, fees, tax, commissions and other costs, not profit or causal ad lift. Blank means unavailable or incomplete. Untagged ad spend is not allocated to campaign rows.";
  return csv([
    ["From (UTC)", "To (UTC)", "Currency", "Campaign", "Recorded payment channels", "Recorded ad channels", "Visits", "Paid records", "Gross amount", "Recorded ads", "Gross amount less ads", "Untagged ad spend (whole report)", "Definition", ...(view ? ["Search filter", "Sort order", "Unfiltered campaigns (whole report)"] : [])],
    ...report.rows.map((row): Cell[] => [report.from, report.to, currency.toUpperCase(), row.campaign, row.paymentChannels === null ? "Unavailable" : row.paymentChannels.join("; "), row.adChannels === null ? "Unavailable" : row.adChannels.join("; "), row.visits, row.paidRecords, amount(row.gross, currency), amount(row.ads, currency), amount(row.grossLessAds, currency), amount(report.unassignedAds, currency), note, ...(view ? [view.query,view.sort,view.total] : [])]),
  ]);
}

export function creativeResultsReport(rows: CreativeRow[], period: ReportPeriod): string {
  const note = "Each row groups channel, campaign and content tag. Paid records include purchases and one-click extras, not unique buyers; renewals excluded. Gross before refunds, fees and other costs, not profit or causal ad lift. All variants in the selected period are exported, including those outside the first 15 displayed. Only complete purchase readings.";
  return csv([
    ["From (UTC)", "To (UTC)", "Currency", "Channel", "Campaign", "Variant (utm_content)", "Paid records", "Gross amount", "Definition"],
    ...rows.map((row): Cell[] => [period.from, period.to, period.currency.toUpperCase(), row.source, row.campaign, row.content, row.sales, amount(row.cents, period.currency), note]),
  ]);
}

export function attributionReport(table: AttributionTable, period: ReportPeriod): string {
  const note = "First and last visits are alternative readings of the same purchases; never add the columns. One-click extras excluded. Gross before refunds and fees. Buyer answers belong to the UTC day answered and cover only respondents; their amounts are not an extra revenue source. Answer subset rows describe buyers of last-visit unattributed sales and overlap channel rows. A blank first-visit unattributed figure means unavailable in an older reading, not zero. No causal marketing lift.";
  const entry = (kind: string, name: string, last: number | null, lastCents: number | null, first: number | null, firstCents: number | null, buyers: number | null, saidCents: number | null): Cell[] => [period.from, period.to, period.currency.toUpperCase(), kind, name, last, amount(lastCents, period.currency), first, amount(firstCents, period.currency), buyers, amount(saidCents, period.currency), note];
  return csv([
    ["From (UTC)", "To (UTC)", "Currency", "Row type", "Channel or answer", "Last-visit sales", "Last-visit gross", "First-visit sales", "First-visit gross", "Buyer answers", "Gross of answered sales", "Definition"],
    ...table.rows.map(row => entry("Channel", row.name, row.last.sales, row.last.cents, table.unknownFirst ? row.first.sales : null, table.unknownFirst ? row.first.cents : null, row.said.buyers, row.said.cents)),
    entry("No channel", "No channel", table.unknown.sales, table.unknown.cents, table.unknownFirst?.sales ?? null, table.unknownFirst?.cents ?? null, null, null),
    ...table.unknownSaid.map(row => entry("Answer subset: last-visit no channel", row.name, null, null, null, null, row.buyers, row.cents)),
  ]);
}

export function paymentMixReport(mix: PaymentMix,currency: string): string {
  const note="Gross recorded payments include renewals at the recorded subscription channel; before refunds, fees and ads. Shares use all recorded payments, including unidentified origins. Direct, unrecorded and imported origins are excluded from largest and top-three identified channels. Not profit, customer acquisition or causal ad lift. Only complete ledger coverage; no buyers exported.";
  return csv([
    ["From (UTC)","To (UTC)","Currency","Channel","Identified marketing channel","Payments","Share of all payments (%)","Total payments (whole report)","Unidentified payments (whole report)","Top 3 identified channels (%)","Definition"],
    ...mix.rows.map((row):Cell[] => [mix.from,mix.to,currency.toUpperCase(),row.source,row.identified ? "Yes" : "No",amount(row.cents,currency),row.share*100,amount(mix.total,currency),amount(mix.unidentified,currency),mix.topThreeShare === null ? null : mix.topThreeShare*100,note]),
  ]);
}

export function paymentComparisonReport(report:PaymentComparison,currency:string):string {
  const previous=report.previous;
  const note="Equal adjacent UTC periods, including current day as recorded so far. Gross recorded payments include renewals, before refunds, fees and ads. No previous payments means blank relative change; share change is percentage points and requires payments in both periods. A missing complete previous reading exports no rows. Not new customers, profit or causal marketing lift.";
  return csv([
    ["Current from (UTC)","Current to (UTC)","Previous from (UTC)","Previous to (UTC)","Currency","Channel","Current payments","Previous payments","Payment difference","Payment change (%)","Current share (%)","Previous share (%)","Share change (percentage points)","Definition"],
    ...(previous ? report.rows.map((row):Cell[]=>[report.current.from,report.current.to,previous.from,previous.to,currency.toUpperCase(),row.source,amount(row.current,currency),amount(row.previous,currency),amount(row.current-row.previous,currency),row.change===null ? null : row.change*100,row.currentShare===null ? null : row.currentShare*100,row.previousShare===null ? null : row.previousShare*100,row.shareChange===null ? null : row.shareChange*100,note]) : []),
  ]);
}
