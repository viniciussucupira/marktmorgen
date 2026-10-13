import { COHORT_AGES, type WeeklyBuyerCohorts } from "@/lib/buyer-channel-rules";
import { weeklyCohortReport } from "@/lib/channel-reports";
import { ReportDownload } from "@/components/report-download";

const count = (value: number) => value.toLocaleString("en-US");
export function WeeklyCohortsPanel({ cohorts, historyPartial }: { cohorts: WeeklyBuyerCohorts; historyPartial: boolean }) {
  if (!cohorts.rows.length && !cohorts.unidentifiedOrders) return null;
  return <section className="mt-6 rounded-[12px] bg-paper px-4 py-4 ring-1 ring-line" aria-labelledby="numbers-weekly-cohorts">
    <h3 id="numbers-weekly-cohorts" className="text-sm font-bold text-ink">When each week&apos;s buyers buy again</h3>
    <p className="mt-1 text-xs text-ink-soft">Grouped by the UTC week of their first observed purchase, using up to 180 days of history, independent of the selected channel period. Read at {new Date(cohorts.asOf).toLocaleString("en-US", { timeZone: "UTC", dateStyle: "medium", timeStyle: "short" })} UTC.</p>
    {historyPartial ? <p className="mt-2 text-sm text-ink-soft" role="status">Purchase history was not read in full. Earlier orders or repeat purchases may be missing; these rates describe only the buyers observed.</p> : null}
    {cohorts.rows.length ? <div className="mt-3 overflow-x-auto" tabIndex={0} role="region" aria-label="Weekly buyer repurchase cohorts">
      <table className="w-full text-left text-sm">
        <thead><tr className="border-b border-line text-xs text-ink-soft">
          <th scope="col" className="py-2 font-semibold">First purchase week</th>
          <th scope="col" className="py-2 pl-3 text-right font-semibold">Buyers</th>
          {COHORT_AGES.map((age) => <th key={age} scope="col" className="py-2 pl-3 text-right font-semibold">Within {age} days</th>)}
        </tr></thead>
        <tbody>{cohorts.rows.map((row) => <tr key={row.week} className="border-b border-line/60">
          <th scope="row" className="py-2 font-medium text-ink"><time dateTime={row.week}>{row.week}</time></th>
          <td className="py-2 pl-3 text-right tabular-nums">{count(row.buyers)}</td>
          {COHORT_AGES.map((age) => {
            const { eligible, repeated } = row.observations[age];
            return <td key={age} className="py-2 pl-3 text-right tabular-nums">
              <span className="font-semibold">{eligible ? Math.round(repeated / eligible * 100) + "%" : "—"}</span>
              <span className="block text-xs text-ink-soft">{eligible ? count(repeated) + " of " + count(eligible) + " observed for " + age + " days" : "Not enough time observed"}</span>
            </td>;
          })}
        </tr>)}</tbody>
      </table>
    </div> : null}
    <p className="mt-2 text-xs text-ink-soft">Each rate counts only buyers with the full observation period, so recent buyers are not treated as failing to return. A repeat is another purchase within that many days; recurring renewals and one-click extras do not count. These are observed repurchases, not a prediction or a measure of product usage. A first observed purchase may not be a first-ever purchase; small groups can fluctuate.</p>
    {cohorts.unidentifiedOrders ? <p className="mt-1 text-xs text-ink-soft">{count(cohorts.unidentifiedOrders)} orders could not be linked to a buyer and are left out.</p> : null}
    <ReportDownload csv={weeklyCohortReport(cohorts, historyPartial)} filename={"marktmorgen-weekly-repurchase-" + cohorts.asOf.slice(0, 10) + ".csv"}>Download weekly repurchase</ReportDownload>
  </section>;
}
