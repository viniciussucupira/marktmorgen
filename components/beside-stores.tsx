import { BANDS, type Band, type Comparison, METRIC_NAMES } from "@/lib/benchmark-rules";

const percent = (v: number) => `${(v * 100).toLocaleString("en-US", { maximumFractionDigits: v < 0.1 ? 1 : 0, minimumFractionDigits: 0 })}%`;

function verdict(row: Comparison): string {
  if (row.place === "within") return "In the middle half";
  if (row.metric === "refunded") return row.place === "above" ? "More refunds than most" : "Fewer refunds than most";
  return row.place === "above" ? "Higher than most" : "Lower than most";
}

/**
 * The store's rates beside the middle half of stores its size, over the last
 * 90 days (lib/benchmark-rules.ts). Shown only for the rates its band has a
 * range for; no store is named or can be picked out.
 */
export function BesideStores({ band, rows }: { band: Band; rows: Comparison[] }) {
  const label = BANDS.find((b) => b.band === band)?.label ?? "";
  return (
    <div className="mt-6 overflow-x-auto" tabIndex={0} role="region" aria-labelledby="numbers-beside" data-beside-stores>
      <table className="w-full text-left text-sm">
        <caption id="numbers-beside" className="text-left text-sm font-bold text-ink">
          Beside stores your size, last 90 days
        </caption>
        <thead>
          <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
            <th scope="col" className="py-1 font-semibold">Rate</th>
            <th scope="col" className="py-1 pl-3 text-right font-semibold">Yours</th>
            <th scope="col" className="py-1 pl-3 text-right font-semibold">Middle half</th>
            <th scope="col" className="py-1 pl-3 text-right font-semibold">Median</th>
            <th scope="col" className="py-1 pl-3 font-semibold">Where you are</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((row) => (
            <tr key={row.metric} className="border-b border-line/60">
              <th scope="row" className="py-1.5 pr-3 font-medium text-ink">{METRIC_NAMES[row.metric]}</th>
              <td className="py-1.5 pl-3 text-right font-semibold tabular-nums text-ink">{percent(row.yours)}</td>
              <td className="py-1.5 pl-3 text-right tabular-nums">{`${percent(row.range.low)} to ${percent(row.range.high)}`}</td>
              <td className="py-1.5 pl-3 text-right tabular-nums">{percent(row.range.median)}</td>
              <td className={`py-1.5 pl-3 ${row.better === true ? "text-mint-deep" : row.better === false ? "text-danger" : "text-ink-soft"}`}>{verdict(row)}</td>
            </tr>
          ))}
        </tbody>
      </table>
      <p className="mt-2 text-xs text-ink-soft">
        {`Stores on Marktmorgen with ${label}, worked out once a day from their own numbers. The middle half is where the stores between the lowest quarter and the highest quarter are. A rate is shown only once at least 10 stores your size have it, and no store is named. Yours comes from the same 90 days.`}
      </p>
    </div>
  );
}
