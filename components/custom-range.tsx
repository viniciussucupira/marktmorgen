"use client";

import { paidFiguresComplete } from "@/lib/paid-coverage";
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
const change = (now: number, before: number) => {
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

  async function show() {
    setBusy(true);
    setError(null);
    try {
      const response = await fetch(`/api/store/stats/range?${new URLSearchParams({ from, to })}`, { cache: "no-store" });
      const data = (await response.json().catch(() => ({}))) as { ok?: boolean; error?: string; range?: RangeData & { products: Products }; marks?: AutoMark[] };
      if (data.ok && data.range) setResult({ range: data.range, marks: data.marks ?? [] });
      else setError(MESSAGES[data.error ?? ""] ?? MESSAGES.server_error);
    } catch {
      setError(MESSAGES.server_error);
    } finally {
      setBusy(false);
    }
  }

  const r = result?.range;

  return (
    <div className="mt-5 rounded-[12px] bg-paper px-4 py-4 ring-1 ring-line" role="region" aria-labelledby="custom-range" data-custom-range>
      <p id="custom-range" className="text-sm font-bold text-ink">
        Any dates
      </p>
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
      {r ? <CustomRangeResults range={r} marks={result.marks} currency={currency} /> : null}
    </div>
  );
}

/** The confirmed results of the requested dates, with paid coverage checked separately. */
export function CustomRangeResults({ range, marks, currency }: { range: Omit<RangeData, "products"> & { products: Products }; marks: AutoMark[]; currency: string }) {
  const money = (cents: number) => formatMoney(cents, currency);
  const r = range;
  const sold = paidFiguresComplete(r);
  const peak = Math.max(1, ...r.days.map((d) => d.visitors));
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
      {r.sales === "error" ? <p className="mt-2 text-sm text-ink-soft">Stripe did not answer, so sales are not shown. Try again in a moment.</p> : null}
      {r.partial ? <p className="mt-2 text-sm text-ink-soft">The purchase reading is incomplete. Sales and revenue are unavailable; traffic and checkouts remain visible.</p> : null}
      <div className={`mt-4 flex h-24 items-end ${r.days.length > 60 ? "gap-0" : "gap-[2px]"}`} role="img" aria-label="Visitors each day">
        {r.days.map((d) => (
          <div key={d.date} className="flex h-full min-w-0 flex-1 flex-col justify-end" title={`${day(d.date)}: ${d.visitors} visitors${sold ? `, ${d.sales} sales` : ""}`}>
            <div className="w-full rounded-t-[2px] bg-violet-brand/80" style={{ height: `${Math.max(d.visitors ? 4 : 1, (d.visitors / peak) * 100)}%`, opacity: d.visitors ? 1 : 0.25 }} />
          </div>
        ))}
      </div>
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
      <div className="mt-4 grid gap-5 lg:grid-cols-2">
        {r.channels.length ? (
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-labelledby="range-channels">
            <table className="w-full text-left text-sm">
              <caption id="range-channels" className="text-left text-sm font-bold text-ink">Where they came from</caption>
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                  <th scope="col" className="py-1 font-semibold">Channel</th>
                  <th scope="col" className="py-1 pl-3 text-right font-semibold">Visits</th>
                  {sold ? <th scope="col" className="py-1 pl-3 text-right font-semibold">Sales</th> : null}
                  {sold ? <th scope="col" className="py-1 pl-3 text-right font-semibold">Revenue</th> : null}
                </tr>
              </thead>
              <tbody>
                {r.channels.map((c) => (
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
        {r.products.length ? (
          <div className="overflow-x-auto" tabIndex={0} role="region" aria-labelledby="range-products">
            <table className="w-full text-left text-sm">
              <caption id="range-products" className="text-left text-sm font-bold text-ink">Products</caption>
              <thead>
                <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                  <th scope="col" className="py-1 font-semibold">Product</th>
                  <th scope="col" className="py-1 pl-3 text-right font-semibold">Views</th>
                  <th scope="col" className="py-1 pl-3 text-right font-semibold">Checkouts</th>
                  {sold ? <th scope="col" className="py-1 pl-3 text-right font-semibold">Revenue</th> : null}
                </tr>
              </thead>
              <tbody>
                {r.products.map((p) => (
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
