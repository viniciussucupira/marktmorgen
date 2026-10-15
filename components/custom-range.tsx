"use client";

import { customRangeChannelsReport, customRangeProductsReport, customRangeDailyReport, customRangeComparisonReport, customRangeChartReport } from "@/lib/channel-reports";
import { ReportDownload } from "@/components/report-download";

import { paidFiguresComplete } from "@/lib/paid-coverage";
import { customRangeView, customRangeOrderLabel, effectiveCustomRangeSort, type CustomRangeSort } from "@/lib/custom-range-view";
import { adjacentCustomRange, presetCustomRange, CUSTOM_RANGE_PRESETS, type CustomDatePeriod } from "@/lib/custom-range-dates";
import { CUSTOM_RANGE_METRICS, effectiveCustomRangeMetric, CUSTOM_RANGE_GROUPINGS, effectiveCustomRangeGrouping, customRangeChartRows, type CustomRangeGrouping, type CustomRangeMetric } from "@/lib/custom-range-chart";
import { useState } from "react";
import { formatMoney } from "@/lib/money";
import { channelName } from "@/lib/channel-names";
import type { RangeData } from "@/lib/stats";
import type { AutoMark } from "@/lib/auto-marks";

const MESSAGES: Record<string, string> = {
  dates: "Pick a start and an end date.",
  order: "The start date comes after the end date. Swap them.",
  future: "The end date is in the future. Pick today or a day before it.",
  kept: "Visits are kept for 400 days. Pick a start date inside them.",
  signed_out: "Your session ended. Log in again.",
  server_error: "Your numbers could not be read just now. Try again in a moment.",
};

const count = (n: number) => n.toLocaleString("en-US");
const day = (date: string) => {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric", timeZone: "UTC" });
};
const change = (now: number, before: number | null) => {
  if (before === null) return "";
  if (before === 0) return now === 0 ? "same as the days before" : "none the days before";
  const pct = Math.round(((now - before) / before) * 100);
  return pct === 0 ? "same as the days before" : `${pct > 0 ? "+" : ""}${pct}% on the days before`;
};

type Products = (RangeData["products"][number] & { title: string })[];

/**
 * Any dates the creator picks (lib/stats.ts, readRange): a launch read from
 * its first day to its last, set beside the same number of days before it,
 * with what the store marked on those days.
 */
export function CustomRange({ today, currency }: { today: string; currency: string }) {
  const earliest = new Date(Date.parse(`${today}T00:00:00Z`) - 399 * 86_400_000).toISOString().slice(0, 10);
  const [from, setFrom] = useState(new Date(Date.parse(`${today}T00:00:00Z`) - 13 * 86_400_000).toISOString().slice(0, 10));
  const [to, setTo] = useState(today);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<{ range: Omit<RangeData, "products"> & { products: Products }; marks: AutoMark[] } | null>(null);

  async function show(fullDetails = false, period?: CustomDatePeriod) {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/store/stats/range?${new URLSearchParams({ from: period?.from ?? (fullDetails && result ? result.range.from : from), to: period?.to ?? (fullDetails && result ? result.range.to : to), ...(fullDetails ? { details: "all" } : {}) })}`, { cache: "no-store" });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string; range?: RangeData & { products: Products }; marks?: AutoMark[] };
      if (data.ok && data.range) {
        setResult({ range: data.range, marks: data.marks ?? [] });
        if (period) { setFrom(data.range.from); setTo(data.range.to); }
      }
      else setError(MESSAGES[data.error ?? ""] ?? MESSAGES.server_error);
    } catch {
      setError(MESSAGES.server_error);
    } finally {
      setBusy(false);
    }
  }

  const r = result?.range;
  const previousPeriod = r ? adjacentCustomRange(r,-1,today) : null;
  const nextPeriod = r ? adjacentCustomRange(r,1,today) : null;

  return (
    <div className="mt-5 rounded-[12px] bg-paper px-4 py-4 ring-1 ring-line" role="region" aria-labelledby="custom-range" data-custom-range>
      <p id="custom-range" className="text-sm font-bold text-ink">
        Any dates
      </p>
      <CustomRangePresets today={today} busy={busy} onSelect={period => { void show(false, period); }} />
      <form
        className="mt-2 flex flex-wrap items-end gap-3"
        onSubmit={(event) => {
          event.preventDefault();
          void show();
        }}
      >
        <label className="block" htmlFor="range-from">
          <span className="field-label">From</span>
          <input id="range-from" type="date" className="field mt-1" min={earliest} max={today} value={from} onChange={(event) => setFrom(event.target.value)} required />
        </label>
        <label className="block" htmlFor="range-to">
          <span className="field-label">To</span>
          <input id="range-to" type="date" className="field mt-1" min={earliest} max={today} value={to} onChange={(event) => setTo(event.target.value)} required />
        </label>
        <button type="submit" className="btn btn-primary" disabled={busy} aria-busy={busy}>
          {busy ? "Reading…" : "Show these days"}
        </button>
      </form>
      <p className="mt-2 text-xs text-ink-soft">Any days from the last 400, in UTC like every day here, set beside the same number of days just before.</p>
      {error ? (
        <p className="notice notice-error mt-3" role="alert">
          {error}
        </p>
      ) : null}
      {r ? <CustomRangeResults range={r} marks={result.marks} currency={currency} onShowAll={() => { void show(true); }} busy={busy} onNavigate={direction=>{const period=direction===-1?previousPeriod:nextPeriod;if(period)void show(false,period);}} canPrevious={previousPeriod!==null} canNext={nextPeriod!==null} /> : null}
    </div>
  );
}

/** Direct shortcuts use the same confirmed request flow as period navigation. */
export function CustomRangePresets({today,busy=false,onSelect}:{today:string;busy?:boolean;onSelect:(period:CustomDatePeriod)=>void}) {
 return <div className="mt-2" role="group" aria-label="Quick date ranges">
  <div className="flex flex-wrap gap-2">{CUSTOM_RANGE_PRESETS.map(preset=>{
   const period=presetCustomRange(preset.value,today);
   return <button key={preset.value} type="button" className="btn btn-secondary" disabled={busy || !period} onClick={()=>{if(period)onSelect(period);}}>{preset.label}</button>;
  })}</div>
  <p className="mt-1 text-xs text-ink-soft">Shortcuts include today in UTC. Today’s numbers may still grow.</p>
 </div>;
}

/** The confirmed results of the requested dates, with paid coverage checked separately. */
export function CustomRangeResults({ range, marks, currency, onShowAll, busy = false, onNavigate, canPrevious = false, canNext = false }: { range: Omit<RangeData, "products"> & { products: Products }; marks: AutoMark[]; currency: string; onShowAll?: () => void; busy?: boolean; onNavigate?: (direction:-1|1)=>void; canPrevious?:boolean; canNext?:boolean }) {
  const money = (cents: number) => formatMoney(cents, currency);
  const r = range;
  const [query, setQuery] = useState("");
  const [sort, setSort] = useState<CustomRangeSort>("recorded");
  const actualSort = effectiveCustomRangeSort(r, sort);
  const view = customRangeView(r, query, actualSort);
  const sold = paidFiguresComplete(r);
  const [chartMetric, setChartMetric] = useState<CustomRangeMetric>("visitors");
  const [chartGrouping, setChartGrouping] = useState<CustomRangeGrouping>("day");
  const tiles = [
        { label: "Visitors", value: count(r.totals.visitors), note: r.before ? change(r.totals.visitors, r.before.visitors) : "" },
        { label: "Page views", value: count(r.totals.views), note: r.before ? change(r.totals.views, r.before.views) : "" },
        { label: "Checkouts started", value: count(r.totals.checkouts), note: r.before ? change(r.totals.checkouts, r.before.checkouts) : "" },
        ...(sold
          ? [
              { label: "Sales", value: count(r.totals.sales), note: r.before ? change(r.totals.sales, r.before.sales) : "" },
              { label: "Revenue", value: money(r.totals.cents), note: r.before ? change(r.totals.cents, r.before.cents) : "" },
            ]
          : []),
      ];

  return (
    <div className="mt-4" data-range-result>
      {onNavigate ? <div className="mb-3 flex flex-wrap gap-2" role="group" aria-label="Move between periods">
        <button type="button" className="btn btn-secondary" disabled={busy || !canPrevious} onClick={()=>onNavigate(-1)}>Previous period</button>
        <button type="button" className="btn btn-secondary" disabled={busy || !canNext} onClick={()=>onNavigate(1)}>Next period</button>
        <p className="w-full text-xs text-ink-soft">Move by the same number of days, within the available history.</p>
      </div> : null}
      {onShowAll && (r.channelsTruncated === true || r.productsTruncated === true) ? <button type="button" className="btn btn-secondary mb-3" onClick={onShowAll} disabled={busy} aria-busy={busy}>{busy ? "Reading…" : "Show all channels and products"}</button> : null}
      <p className="text-sm font-semibold text-ink">{r.from === r.to ? day(r.from) : `${day(r.from)} to ${day(r.to)}, ${r.days.length} days`}</p>
      <dl className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
        {tiles.map((t) => (
          <div key={t.label} className="rounded-[12px] bg-white px-4 py-3 ring-1 ring-line">
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-soft">{t.label}</dt>
            <dd className="mt-1 text-xl font-semibold tabular-nums text-ink">{t.value}</dd>
            {t.note ? <dd className="text-xs text-ink-soft">{t.note}</dd> : null}
          </div>
        ))}
      </dl>
      <ReportDownload csv={customRangeComparisonReport(r)} filename={"marktmorgen-custom-comparison-"+r.from+"-to-"+r.to+".csv"}>Download period comparison</ReportDownload>
      {r.days.length ? <ReportDownload csv={customRangeDailyReport(r)} filename={"marktmorgen-custom-daily-"+r.from+"-to-"+r.to+".csv"}>Download daily results</ReportDownload> : null}
      {r.sales === "error" ? <p className="mt-2 text-sm text-ink-soft">Stripe did not answer, so sales are not shown. Try again in a moment.</p> : null}
      {r.partial ? <p className="mt-2 text-sm text-ink-soft">The purchase reading is incomplete. Sales and revenue are unavailable; traffic and checkouts remain visible.</p> : null}
      <CustomRangeChart range={r} currency={currency} metric={chartMetric} onMetricChange={setChartMetric} grouping={chartGrouping} onGroupingChange={setChartGrouping} />
      {marks.length ? (
        <ul className="mt-3 space-y-1 text-sm" aria-label="Marked on these days">
          {marks.map((m, i) => (
            <li key={`${m.day}-${i}`} className="flex gap-2">
              <span className="shrink-0 tabular-nums text-ink-soft">{day(m.day)}</span>
              <span className="min-w-0 text-ink [overflow-wrap:anywhere]">{m.text}</span>
            </li>
          ))}
        </ul>
      ) : null}
      {r.channels.length || r.products.length ? <div className="mt-4">
        <label className="field-label" htmlFor="range-search">Search channels or products</label>
        <input id="range-search" type="search" className="field mt-1" value={query} maxLength={100} onChange={event=>setQuery(event.target.value)} placeholder="Channel, product name or product ID" />
        <label className="field-label mt-3" htmlFor="range-sort">Order channels and products</label>
        <select id="range-sort" className="field mt-1" value={actualSort} onChange={event=>setSort(event.target.value as CustomRangeSort)}>
          <option value="recorded">Recorded order</option><option value="traffic_desc">Traffic, highest first</option><option value="traffic_asc">Traffic, lowest first</option>
          <option value="revenue_desc" disabled={!sold}>Revenue, highest first</option><option value="revenue_asc" disabled={!sold}>Revenue, lowest first</option>
          <option value="sales_desc" disabled={!sold}>Sales, highest first</option><option value="sales_asc" disabled={!sold}>Sales, lowest first</option><option value="name">Name, A–Z</option>
        </select>
        <p className="mt-1 text-xs text-ink-soft">Search applies to the loaded lists. Period totals and daily results stay the same.{r.channelsTruncated || r.productsTruncated ? " Open all results above to search every recorded row." : ""}</p>
        {query.trim() ? <p className="mt-1 text-xs text-ink-soft" role="status">{view.channels.length} of {r.channels.length} loaded channels and {view.products.length} of {r.products.length} loaded products match.</p> : null}
      </div> : null}
      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        {view.channels.length ? (
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-labelledby="range-channels">
          <ReportDownload csv={customRangeChannelsReport(view,{query,sort:actualSort})} filename={"marktmorgen-custom-channels-"+r.from+"-to-"+r.to+".csv"}>Download displayed channels</ReportDownload>
            <table className="w-full text-left text-sm">
              <caption id="range-channels" className="text-left text-sm font-bold text-ink">Where they came from{r.channelsTruncated === true && r.channelsTotal != null ? <span className="mt-1 block text-xs font-normal text-ink-soft">Showing {view.channels.length} of {r.channelsTotal} recorded channels, ordered by {customRangeOrderLabel(r,actualSort,"channels").toLowerCase()}.</span> : null}</caption>
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                  <th scope="col" className="py-1 font-semibold">Channel</th>
                  <th scope="col" className="py-1 pl-3 text-right font-semibold">Visits</th>
                  {sold ? <th scope="col" className="py-1 pl-3 text-right font-semibold">Sales</th> : null}
                  {sold ? <th scope="col" className="py-1 pl-3 text-right font-semibold">Revenue</th> : null}
                </tr>
              </thead>
              <tbody>
                {view.channels.map((c) => (
                  <tr key={c.source} className="border-b border-line/60">
                    <th scope="row" className="py-1.5 pr-3 font-medium text-ink">{channelName(c.source)}</th>
                    <td className="py-1.5 pl-3 text-right tabular-nums">{count(c.visits)}</td>
                    {sold ? <td className="py-1.5 pl-3 text-right tabular-nums">{count(c.sales)}</td> : null}
                    {sold ? <td className="py-1.5 pl-3 text-right tabular-nums">{money(c.cents)}</td> : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
        {view.products.length ? (
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-labelledby="range-products">
          <ReportDownload csv={customRangeProductsReport(view,{query,sort:actualSort})} filename={"marktmorgen-custom-products-"+r.from+"-to-"+r.to+".csv"}>Download displayed products</ReportDownload>
            <table className="w-full text-left text-sm">
              <caption id="range-products" className="text-left text-sm font-bold text-ink">Products{r.productsTruncated === true && r.productsTotal != null ? <span className="mt-1 block text-xs font-normal text-ink-soft">Showing {view.products.length} of {r.productsTotal} recorded products, ordered by {customRangeOrderLabel(r,actualSort,"products").toLowerCase()}.</span> : null}</caption>
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                  <th scope="col" className="py-1 font-semibold">Product</th>
                  <th scope="col" className="py-1 pl-3 text-right font-semibold">Views</th>
                  <th scope="col" className="py-1 pl-3 text-right font-semibold">Checkouts</th>
                  {sold ? <th scope="col" className="py-1 pl-3 text-right font-semibold">Revenue</th> : null}
                </tr>
              </thead>
              <tbody>
                {view.products.map((p) => (
                  <tr key={p.id} className="border-b border-line/60">
                    <th scope="row" className="py-1.5 pr-3 font-medium text-ink [overflow-wrap:anywhere]">{p.title}</th>
                    <td className="py-1.5 pl-3 text-right tabular-nums">{count(p.views)}</td>
                    <td className="py-1.5 pl-3 text-right tabular-nums">{count(p.checkouts)}</td>
                    {sold ? <td className="py-1.5 pl-3 text-right tabular-nums">{money(p.cents)}</td> : null}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : null}
      </div>
    </div>
  );
}


/** Every displayed group uses the current reading's coverage and exact recorded dates. */
export function CustomRangeChart({range,currency,metric="visitors",grouping="day",onMetricChange,onGroupingChange}:{range:RangeData;currency:string;metric?:CustomRangeMetric;grouping?:CustomRangeGrouping;onMetricChange?:(metric:CustomRangeMetric)=>void;onGroupingChange?:(grouping:CustomRangeGrouping)=>void}) {
 const selected=effectiveCustomRangeMetric(range,metric);
 const unit=effectiveCustomRangeGrouping(grouping);
 const label=CUSTOM_RANGE_METRICS.find(item=>item.value===selected)!.label;
 const sold=paidFiguresComplete(range);
 const rows=customRangeChartRows(range,selected,unit);
 const peak=Math.max(1,...rows.map(row=>row.value));
 const value=(n:number)=>selected==="cents"?formatMoney(n,currency):count(n);
 const dates=(row:typeof rows[number])=>row.from===row.to?day(row.from):day(row.from)+" to "+day(row.to);
 const chartLabel=label+(unit==="day"?" each day":unit==="week"?" by week":" by month");
 return <div className="mt-4">
  <label className="field-label" htmlFor="range-chart-metric">Daily chart</label>
  <select id="range-chart-metric" className="field mt-1" value={selected} onChange={event=>onMetricChange?.(event.target.value as CustomRangeMetric)}>
   {CUSTOM_RANGE_METRICS.map(item=><option key={item.value} value={item.value} disabled={item.paid&&!sold}>{item.label}</option>)}
  </select>
  <label className="field-label mt-2" htmlFor="range-chart-grouping">Group chart by</label>
  <select id="range-chart-grouping" className="field mt-1" value={unit} onChange={event=>onGroupingChange?.(event.target.value as CustomRangeGrouping)}>
   {CUSTOM_RANGE_GROUPINGS.map(item=><option key={item.value} value={item.value}>{item.label}</option>)}
  </select>
  <p className="mt-1 text-xs text-ink-soft">Daily totals in UTC.{unit!=="day"?" Weeks start on Monday. First and last groups may cover only part of a week or month. Visitors are summed daily counts, not distinct people across the group.":""}{selected==="cents"||selected==="sales"?" Purchases include one-click extras and exclude renewals. Revenue is before fees, refunds and ad spend.":""}</p>
  <div className={"mt-3 flex h-24 items-end "+(rows.length>60?"gap-0":"gap-[2px]")} role="img" aria-label={chartLabel}>
   {rows.map(row=><div key={row.from} className="flex h-full min-w-0 flex-1 flex-col justify-end" title={dates(row)+": "+value(row.value)+" "+label.toLowerCase()+(selected==="visitors"&&row.sales!==null?", "+row.sales+" sales":"")}>
    <div className="w-full rounded-t-[2px] bg-violet-brand/80" style={{height:Math.max(row.value?4:1,(row.value/peak)*100)+"%",opacity:row.value?1:0.25}} />
   </div>)}
  </div>
  {rows.length?<ReportDownload csv={customRangeChartReport(range,metric,grouping)} filename={"marktmorgen-custom-chart-"+selected+"-"+unit+"-"+range.from+"-to-"+range.to+".csv"}>Download chart values</ReportDownload>:null}
  {rows.length?<details className="mt-2">
   <summary className="cursor-pointer text-sm font-semibold text-ink">View chart values</summary>
   <div className="mt-2 max-h-64 overflow-auto" tabIndex={0} role="region" aria-label="Chart values">
    <table className="w-full text-left text-sm"><caption className="text-left text-xs text-ink-soft">{chartLabel} (UTC)</caption>
     <thead><tr><th scope="col" className="py-1">Dates</th><th scope="col" className="py-1 text-right">{label}</th></tr></thead>
     <tbody>{rows.map(row=><tr key={row.from}><th scope="row" className="py-1 font-normal">{dates(row)}</th><td className="py-1 text-right tabular-nums">{value(row.value)}</td></tr>)}</tbody>
    </table>
   </div>
  </details>:null}
 </div>;
}
