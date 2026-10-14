import type { StatsData } from "@/lib/stats";
import { paymentMixFrom, paymentShare } from "@/lib/payment-mix";
import { paymentMixReport } from "@/lib/channel-reports";
import { channelName } from "@/lib/channel-names";
import { formatMoney } from "@/lib/money";
import { ReportDownload } from "@/components/report-download";
export function PaymentMixPanel({data,range}:{data:StatsData;range:"d7"|"d30"|"d90"}) {
  if (data.sales !== "ok") return null;
  const mix=paymentMixFrom(data,range);
  return <section className="mt-6 rounded-[12px] bg-paper px-4 py-4 ring-1 ring-line" aria-labelledby="numbers-payment-mix">
    <h3 id="numbers-payment-mix" className="text-sm font-bold text-ink">How payments depend on channels</h3>
    {!mix ? <p className="mt-2 text-sm text-ink-soft" role="status">Complete payment coverage is not available. Payment shares and downloads wait for complete figures.</p> : <>
      <p className="mt-1 text-xs text-ink-soft">{mix.from} to {mix.to}, UTC. {formatMoney(mix.total,data.currency)} in recorded payments, including renewals. Every share uses all these payments as its denominator.</p>
      {data.cashflowComplete !== true ? <p className="mt-2 text-sm text-ink-soft" role="status">The payment reading is complete. Results after refunds remain unavailable; these figures are before refunds.</p> : null}
      {mix.total > 0 ? <>
        <dl className="mt-3 grid gap-3 sm:grid-cols-3">
          <div><dt className="text-xs text-ink-soft">Largest identified channel</dt><dd className="text-sm font-semibold text-ink">{mix.largest ? channelName(mix.largest.source)+" · "+paymentShare(mix.largest.share) : "No identified channel"}</dd></div>
          <div><dt className="text-xs text-ink-soft">Top 3 identified channels</dt><dd className="text-sm font-semibold text-ink">{paymentShare(mix.topThreeShare)}</dd></div>
          <div><dt className="text-xs text-ink-soft">No marketing channel identified</dt><dd className="text-sm font-semibold text-ink">{paymentShare(mix.unidentifiedShare)} · {formatMoney(mix.unidentified,data.currency)}</dd></div>
        </dl>
        <div className="mt-3 max-h-80 overflow-auto" tabIndex={0} role="region" aria-label="Recorded payments and share by channel">
          <table className="w-full text-left text-sm"><thead><tr className="border-b border-line text-xs text-ink-soft"><th scope="col" className="py-2 font-semibold">Channel</th><th scope="col" className="py-2 pl-3 text-right font-semibold">Payments</th><th scope="col" className="py-2 pl-3 text-right font-semibold">Share of all payments</th></tr></thead>
          <tbody>{mix.rows.map(row => <tr key={row.source} className="border-b border-line/60"><th scope="row" className="py-2 font-medium text-ink">{channelName(row.source)}</th><td className="py-2 pl-3 text-right tabular-nums">{formatMoney(row.cents,data.currency)}</td><td className="py-2 pl-3 text-right tabular-nums">{paymentShare(row.share)}</td></tr>)}</tbody></table>
        </div>
        <ReportDownload csv={paymentMixReport(mix,data.currency)} filename={"marktmorgen-payment-mix-"+mix.from+"-to-"+mix.to+".csv"}>Download payment shares</ReportDownload>
      </> : <p className="mt-2 text-sm text-ink-soft">No recorded payments in these days. Shares cannot be calculated.</p>}
      <p className="mt-2 text-xs text-ink-soft">Direct or unknown, sales before channel tracking and imported origins are kept separate from identified marketing channels. Renewals use the recorded subscription channel. Gross payments are before refunds, fees and ads; these shares are not profit, customer acquisition shares or proof of advertising lift. Rounded percentages may not sum to 100%.</p>
    </>}
  </section>;
}
