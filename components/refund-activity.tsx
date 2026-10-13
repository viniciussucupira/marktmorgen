import type { StatsData } from "@/lib/stats";
import { refundActivityFrom } from "@/lib/refund-activity";
import { formatMoney } from "@/lib/money";
import { channelName } from "@/lib/channel-names";
import { refundActivityReport } from "@/lib/channel-reports";
import { ReportDownload } from "@/components/report-download";
const share = (value: number | null) => value === null ? "—" : Math.round(value * 100) + "%";
export function RefundActivityPanel({ data, range }: { data: StatsData; range: "d7" | "d30" | "d90" }) {
  const days = data.days.slice(-(range === "d7" ? 7 : range === "d30" ? 30 : 90));
  if (!days.length) return null;
  const period = { from: days[0].date, to: days[days.length - 1].date, currency: data.currency };
  const activity = refundActivityFrom(data, range, period.from, period.to);
  if (!activity?.rows.length) return null;
  const money = (value: number) => formatMoney(value, data.currency);
  return <section className="mt-6 rounded-[12px] bg-paper px-4 py-4 ring-1 ring-line" aria-labelledby="numbers-refund-activity">
    <h3 id="numbers-refund-activity" className="text-sm font-bold text-ink">Refunds recorded by channel</h3>
    <p className="mt-1 text-xs text-ink-soft">{activity.records.toLocaleString("en-US")} refund records totaling {money(activity.refunds)}, against {money(activity.payments)} in payments received in these days, including renewals. These are recorded amounts, including pending refunds; a record is not a unique buyer or order.</p>
    <div className="mt-3 overflow-x-auto" tabIndex={0} role="region" aria-label="Recorded refunds and payments by channel">
      <table className="w-full text-left text-sm">
        <thead><tr className="border-b border-line text-xs text-ink-soft">
          <th scope="col" className="py-2 font-semibold">Channel</th>
          <th scope="col" className="py-2 pl-3 text-right font-semibold">Refund records</th>
          <th scope="col" className="py-2 pl-3 text-right font-semibold">Refund amount</th>
          <th scope="col" className="py-2 pl-3 text-right font-semibold">Payments received</th>
          <th scope="col" className="py-2 pl-3 text-right font-semibold">Refunds / payments</th>
        </tr></thead>
        <tbody>{activity.rows.map((row) => <tr key={row.source} className="border-b border-line/60">
          <th scope="row" className="py-2 font-medium text-ink">{channelName(row.source)}</th>
          <td className="py-2 pl-3 text-right tabular-nums">{row.records.toLocaleString("en-US")}</td>
          <td className="py-2 pl-3 text-right tabular-nums">{money(row.refunds)}</td>
          <td className="py-2 pl-3 text-right tabular-nums">{money(row.payments)}</td>
          <td className="py-2 pl-3 text-right tabular-nums">{share(row.share)}{row.share === null ? <span className="block text-xs text-ink-soft">No payments in these days</span> : null}</td>
        </tr>)}</tbody>
      </table>
    </div>
    <p className="mt-2 text-xs text-ink-soft">A refund belongs to the day it was recorded and the channel of its matched purchase, which may have been earlier. Refunds / payments compares amounts recorded in the same days, not the percentage of those purchases or buyers refunded. It can exceed 100%; no payments means no ratio. Only complete, matched payment and refund readings appear here.</p>
    <ReportDownload csv={refundActivityReport(activity, period)} filename={"marktmorgen-refund-activity-" + period.from + "-to-" + period.to + ".csv"}>Download refund activity</ReportDownload>
  </section>;
}
