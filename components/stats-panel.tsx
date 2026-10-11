"use client";

import { useState } from "react";

import type { AllTimeSales, Ranked, RangeKey, StatsData } from "@/lib/stats";
import { StoreField } from "@/components/studio-store-pin";
import { formatMoney } from "@/lib/money";

const SOURCE_NAMES: Record<string, string> = {
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  facebook: "Facebook",
  x: "X",
  threads: "Threads",
  linkedin: "LinkedIn",
  pinterest: "Pinterest",
  snapchat: "Snapchat",
  reddit: "Reddit",
  linktree: "Linktree",
  google: "Google",
  bing: "Bing",
  duckduckgo: "DuckDuckGo",
  email: "Email",
  whatsapp: "WhatsApp",
  qr: "QR code",
  device: "Shared from a phone",
  direct: "Direct, or an app that hides it",
};

/** A channel's name where money is concerned: "direct" there means nothing the store could name. */
function channelName(source: string): string {
  if (source === "direct") return "Direct or unknown";
  if (source === "unrecorded") return "Sold before channels were recorded";
  return SOURCE_NAMES[source] ?? source;
}

/**
 * The store's funnel for the range: people, then the ones who started a
 * checkout, then the ones who paid — with how many went on at each step,
 * which is the number a creator can change (a clearer page, a better price).
 * Only counts the store already keeps; nothing new is recorded for it.
 */
function Funnel({ visitors, checkouts, sales, salesHere }: { visitors: number; checkouts: number; sales: number; salesHere: boolean }) {
  const steps = [
    { label: "Visitors", value: visitors, note: "" },
    { label: "Started a checkout", value: checkouts, note: rate(checkouts, visitors) + " of visitors" },
    ...(salesHere ? [{ label: "Paid", value: sales, note: rate(sales, checkouts) + " of checkouts" }] : []),
  ];
  const top = Math.max(1, visitors);
  return (
    <div className="mt-6" role="group" aria-labelledby="numbers-funnel">
      <p id="numbers-funnel" className="text-sm font-bold text-ink">
        From visit to sale
      </p>
      <ol className="mt-3 space-y-2">
        {steps.map((step) => (
          <li key={step.label} className="text-sm">
            <div className="flex items-baseline justify-between gap-3">
              <span className="font-semibold text-ink">{step.label}</span>
              <span className="shrink-0 tabular-nums text-ink-soft">
                {count(step.value)}
                {step.note ? ` · ${step.note}` : ""}
              </span>
            </div>
            <div className="mt-1 h-2 overflow-hidden rounded-full bg-paper ring-1 ring-line" aria-hidden="true">
              <div className="h-full rounded-full bg-violet-brand/70" style={{ width: `${Math.max(1, Math.min(100, (step.value / top) * 100))}%` }} />
            </div>
          </li>
        ))}
      </ol>
      <p className="mt-2 text-xs text-ink-soft">
        A visitor is counted once a day, so somebody who comes back on another day and pays is one more visitor too. A free
        product&apos;s checkouts are the addresses asked for, and are never paid.
      </p>
    </div>
  );
}

const RANGES: { key: RangeKey; label: string }[] = [
  { key: "d7", label: "7 days" },
  { key: "d30", label: "30 days" },
  { key: "d90", label: "90 days" },
  { key: "all", label: "All time" },
];


const count = (n: number) => n.toLocaleString("en-US");

function rate(part: number, whole: number): string {
  if (!whole) return "—";
  const value = (part / whole) * 100;
  return `${value < 10 ? value.toFixed(1) : Math.round(value)}%`;
}

function shortDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" });
}

function longDate(date: string): string {
  const [y, m, d] = date.split("-").map(Number);
  return new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { month: "long", day: "numeric", year: "numeric", timeZone: "UTC" });
}

const COUNTRY = typeof Intl !== "undefined" && "DisplayNames" in Intl ? new Intl.DisplayNames(["en"], { type: "region" }) : null;
function countryName(code: string): string {
  try {
    return COUNTRY?.of(code) ?? code;
  } catch {
    return code;
  }
}
const DEVICE_NAMES: Record<string, string> = { mobile: "Phone", tablet: "Tablet", desktop: "Computer" };

/** One list of where visits came from, with a bar each. */
function Breakdown({
  title,
  rows,
  named = false,
  label,
}: {
  title: string;
  rows: Ranked;
  named?: boolean;
  /** How a row's name is shown, when it is a code (a country, a device). */
  label?: (name: string) => string;
}) {
  const total = rows.reduce((sum, s) => sum + s.visits, 0) || 1;
  return (
    <div className="min-w-0">
      <p className="text-sm font-bold text-ink">{title}</p>
      <ul className="mt-3 space-y-2">
        {rows.slice(0, 8).map((row) => {
          const share = Math.round((row.visits / total) * 100);
          return (
            <li key={row.name} className="text-sm">
              <div className="flex items-baseline justify-between gap-3">
                <span className="min-w-0 truncate font-semibold text-ink">{label ? label(row.name) : named ? SOURCE_NAMES[row.name] ?? row.name : row.name}</span>
                <span className="shrink-0 tabular-nums text-ink-soft">{`${count(row.visits)} · ${share}%`}</span>
              </div>
              <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-paper ring-1 ring-line" aria-hidden="true">
                <div className="h-full rounded-full bg-violet-brand/70" style={{ width: `${Math.max(2, share)}%` }} />
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

/** A store's visits, checkouts and sales, for the last week, month, quarter or all time. */
export function StatsPanel({ data, canExport = true }: { data: StatsData; canExport?: boolean }) {
  const [range, setRange] = useState<RangeKey>("d7");
  const [all, setAll] = useState<{ state: "idle" | "loading" | "error" } | { state: "ok"; sales: AllTimeSales }>({ state: "idle" });
  const salesKnown = data.sales === "ok";

  async function loadAll() {
    if (!salesKnown || all.state === "loading" || all.state === "ok") return;
    setAll({ state: "loading" });
    try {
      const response = await fetch("/api/store/stats?range=all", { cache: "no-store" });
      const body = (await response.json().catch(() => ({}))) as { ok?: boolean; sales?: AllTimeSales };
      setAll(body.ok && body.sales ? { state: "ok", sales: body.sales } : { state: "error" });
    } catch {
      setAll({ state: "error" });
    }
  }

  function choose(key: RangeKey) {
    setRange(key);
    if (key === "all") loadAll();
  }

  // All-time sales arrive when asked for; until then they are shown as coming.
  const allSales = all.state === "ok" ? all.sales : null;
  const salesHere = salesKnown && (range !== "all" || allSales !== null);
  // Every amount here is in the store's currency (lib/stats.ts leaves sales in
  // any other out of the totals and counts them).
  const money = (cents: number) => formatMoney(cents, data.currency ?? "usd");
  const elsewhere = range === "all" ? allSales?.elsewhere ?? 0 : data.elsewhere ?? 0;
  const totals =
    range === "all" && allSales ? { ...data.totals.all, sales: allSales.totals.sales, cents: allSales.totals.cents } : data.totals[range];
  const days = range === "d7" ? data.days.slice(-7) : range === "d30" ? data.days.slice(-30) : data.days;
  const peak = Math.max(1, ...days.map((d) => d.visitors));
  const empty = data.totals.all.views === 0 && data.totals.d90.checkouts === 0 && data.totals.d90.sales === 0;
  const salesNote = !salesKnown
    ? data.sales === "none"
      ? "Once Stripe is connected"
      : "Stripe did not answer"
    : range === "all" && !allSales
      ? all.state === "error"
        ? "Stripe did not answer"
        : "Reading Stripe…"
      : "Paid, from your Stripe";

  const tiles: { label: string; value: string; note?: string }[] = [
    { label: "Visitors", value: count(totals.visitors), note: "People, each counted once a day" },
    { label: "Page views", value: count(totals.views), note: "Every time your store was opened" },
    { label: "Checkouts started", value: count(totals.checkouts), note: "Pressed buy, book or get it free" },
    { label: "Sales", value: salesHere ? count(totals.sales) : "—", note: salesNote },
    { label: "Revenue", value: salesHere ? money(totals.cents) : "—", note: "Before Stripe's fee" },
    // Memberships renewed and later plan payments: money the sales above leave out (lib/stats.ts).
    // Shown once there is any in the last 90 days, so a store without memberships sees no empty tile.
    ...(data.renewals && data.renewals.d90.payments > 0
      ? [
          range === "all"
            ? { label: "Renewals", value: "—", note: "Shown for up to 90 days; all of them are in your Stripe" }
            : {
                label: "Renewals",
                value: money(data.renewals[range].cents),
                note: `${count(data.renewals[range].payments)} ${data.renewals[range].payments === 1 ? "payment" : "payments"} after the first: memberships renewed and plan payments`,
              },
        ]
      : []),
    { label: "Conversion", value: salesHere ? rate(totals.sales, totals.visitors) : "—", note: "Sales for every 100 visitors" },
    {
      label: "Per visitor",
      value: salesHere && totals.visitors > 0 ? money(Math.round(totals.cents / totals.visitors)) : "—",
      note: "What the average visitor was worth",
    },
  ];

  // Products, the best sellers first: by revenue, then sales, then checkouts.
  const products = data.products
    .map((product) => {
      const row = product[range];
      const sold = range === "all" ? allSales?.byProduct[product.id] ?? { sales: 0, cents: 0 } : row;
      return { id: product.id, title: product.title, views: row.views, checkouts: row.checkouts, sales: sold.sales, cents: sold.cents };
    })
    .sort((a, b) => b.cents - a.cents || b.sales - a.sales || b.checkouts - a.checkouts);
  const shownProducts = products.filter((p) => p.views > 0 || p.checkouts || p.sales).length ? products.filter((p) => p.views > 0 || p.checkouts || p.sales) : products;
  const withRenewalColumn = data.revenueBySource.some((row) => row.renewals > 0);
  // Each channel for the range chosen; "all" has none, because sales are read for 90 days.
  const channels = range === "all" ? [] : data.channels?.[range] ?? [];
  const withFreeColumn = channels.some((row) => row.free > 0);
  // Page views by country and device, kept by the day: none for "all".
  const countries = data.countries?.[range] ?? [];
  const devices = data.devices?.[range] ?? [];
  // Where buyers first found the store, shown when it says something the table
  // above does not: some buyer first came from somewhere other than where they bought.
  const firstFound = (data.firstBySource ?? []).filter((row) => row.source !== "direct");
  const sources = data.sources[range];
  const mediums = data.mediums[range];
  const campaigns = data.campaigns[range];

  return (
    <section className="card mt-8 p-6 sm:p-8" aria-labelledby="numbers-title">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="numbers-title" className="text-lg font-semibold tracking-[-0.02em] text-ink">
          Your numbers
        </h2>
        <div className="inline-flex max-w-full flex-wrap rounded-full bg-paper p-1 ring-1 ring-line" role="group" aria-label="Period">
          {RANGES.map(({ key, label }) => (
            <button
              key={key}
              type="button"
              aria-pressed={range === key}
              onClick={() => choose(key)}
              className={`inline-flex min-h-11 items-center rounded-full px-3 py-1.5 text-sm font-semibold transition ${
                range === key ? "bg-white text-ink shadow-sm ring-1 ring-line" : "text-ink-soft hover:text-ink"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {empty ? (
        <p className="mt-3 text-ink-soft">
          Nothing counted yet. Share your store&apos;s address and the first visits show up here within seconds.
        </p>
      ) : null}
      {range === "all" ? (
        <p className="mt-3 text-sm text-ink-soft">
          {`Visits since ${data.since ? longDate(data.since) : "the first one counted"}. `}
          {allSales
            ? allSales.since
              ? `Sales since ${longDate(allSales.since)}, the first one on your Stripe account.`
              : "No sales on your Stripe account yet."
            : null}
          {allSales?.partial ? " Your store has more sales than one reading covers (3,000 checkouts), so the oldest are left out." : ""}
        </p>
      ) : null}
      {salesHere && elsewhere > 0 ? (
        <p className="mt-3 text-sm text-ink-soft">
          {`${count(elsewhere)} ${elsewhere === 1 ? "sale was" : "sales were"} paid in another currency, from before your store charged in ${(data.currency ?? "usd").toUpperCase()}. ${elsewhere === 1 ? "It is" : "They are"} left out of these numbers, because amounts in two currencies do not add up, and ${elsewhere === 1 ? "it is" : "they are"} in the sales download with ${elsewhere === 1 ? "its" : "their"} own currency.`}
        </p>
      ) : null}

      <dl className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3">
        {tiles.map((tile) => (
          <div key={tile.label} className="rounded-[12px] bg-paper px-4 py-3 ring-1 ring-line">
            <dt className="text-xs font-semibold uppercase tracking-wide text-ink-mute">{tile.label}</dt>
            <dd className="mt-1 text-2xl font-semibold tabular-nums text-ink">{tile.value}</dd>
            {tile.note ? <dd className="mt-0.5 text-xs text-ink-soft">{tile.note}</dd> : null}
          </div>
        ))}
      </dl>

      {range !== "all" ? (
        <div className="mt-6">
          <p className="text-sm font-bold text-ink">Visitors a day</p>
          <div className={`mt-3 flex h-28 items-end ${days.length > 30 ? "gap-px" : "gap-[3px]"}`} aria-hidden="true">
            {days.map((day) => (
              <div key={day.date} className="flex h-full min-w-0 flex-1 flex-col justify-end" title={`${shortDate(day.date)}: ${day.visitors} visitors, ${day.sales} sales`}>
                <div
                  className="w-full rounded-t-[3px] bg-violet-brand/80"
                  style={{ height: `${Math.max(day.visitors ? 4 : 1, (day.visitors / peak) * 100)}%`, opacity: day.visitors ? 1 : 0.25 }}
                />
              </div>
            ))}
          </div>
          <div className="mt-1 flex justify-between text-xs text-ink-mute" aria-hidden="true">
            <span>{shortDate(days[0].date)}</span>
            <span>{shortDate(days[days.length - 1].date)}</span>
          </div>
          <details className="mt-2 text-sm">
            <summary className="cursor-pointer font-semibold text-ink-soft">See each day</summary>
            <div className="max-h-80 overflow-y-auto" tabIndex={0} role="region" aria-label="Each day">
              <table className="mt-2 w-full text-left text-sm">
                <thead>
                  <tr className="text-ink-mute">
                    <th scope="col" className="py-1 font-semibold">Day (UTC)</th>
                    <th scope="col" className="py-1 text-right font-semibold">Visitors</th>
                    <th scope="col" className="py-1 text-right font-semibold">Checkouts</th>
                    <th scope="col" className="py-1 text-right font-semibold">Sales</th>
                  </tr>
                </thead>
                <tbody>
                  {[...days].reverse().map((day) => (
                    <tr key={day.date} className="border-t border-line">
                      <td className="py-1">{shortDate(day.date)}</td>
                      <td className="py-1 text-right tabular-nums">{count(day.visitors)}</td>
                      <td className="py-1 text-right tabular-nums">{count(day.checkouts)}</td>
                      <td className="py-1 text-right tabular-nums">{salesKnown ? count(day.sales) : "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </details>
        </div>
      ) : null}

      {/*
        Money by link, above the visitor counts rather than below them.

        The visitor list was always here and never answered the question a
        creator actually has on a Monday morning: not where people came from,
        but which of those places paid. Those were two numbers that never met
        — four hundred visits from a newsletter in one list, six hundred
        dollars in another — and you cannot decide where to spend the week on
        the first one alone. Only the last ninety days, because that is as far
        back as the sales reading goes, and it says so.
      */}
      {range !== "all" && totals.visitors > 0 ? (
        <Funnel visitors={totals.visitors} checkouts={totals.checkouts} sales={totals.sales} salesHere={salesHere} />
      ) : null}

      {data.revenueBySource.length ? (
        <div className="mt-6 overflow-x-auto" tabIndex={0} role="region" aria-labelledby="numbers-revenue-source">
          <table className="w-full text-left text-sm">
            <caption id="numbers-revenue-source" className="text-left text-sm font-bold text-ink">
              Where the money came from, last 90 days
            </caption>
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                <th scope="col" className="py-1 font-semibold">Channel</th>
                <th scope="col" className="py-1 pl-3 text-right font-semibold">Sales</th>
                <th scope="col" className="py-1 pl-3 text-right font-semibold">Revenue</th>
                {withRenewalColumn ? (
                  <>
                    <th scope="col" className="py-1 pl-3 text-right font-semibold" title="Memberships renewed and later plan payments, by the channel the subscription was sold through">
                      Renewals
                    </th>
                    <th scope="col" className="py-1 pl-3 text-right font-semibold">Total</th>
                  </>
                ) : null}
              </tr>
            </thead>
            <tbody>
              {data.revenueBySource.map((row) => (
                <tr key={row.source} className="border-b border-line/60">
                  <th scope="row" className="py-1 pr-3 font-medium text-ink">
                    {channelName(row.source)}
                  </th>
                  <td className="py-1 pl-3 text-right tabular-nums">{count(row.sales)}</td>
                  <td className="py-1 pl-3 text-right tabular-nums">{money(row.cents)}</td>
                  {withRenewalColumn ? (
                    <>
                      <td className="py-1 pl-3 text-right tabular-nums">{row.renewals ? money(row.renewalCents) : "—"}</td>
                      <td className="py-1 pl-3 text-right font-semibold tabular-nums text-ink">{money(row.cents + row.renewalCents)}</td>
                    </>
                  ) : null}
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-ink-soft">
            Read from your own Stripe account, so it is the money that actually arrived. A sale counts under the tags on the
            page it was bought from; without tags, under the last place the buyer came from in the 30 days before — a link
            you shared, a site, or the Instagram or TikTok app — so somebody who found you on Instagram and came back later by
            typing your address is still counted under Instagram. Where the law asks visitors first (the EU, the UK,
            Switzerland and Brazil), or a browser asks not to be followed, only the page&apos;s tags count.
            {withRenewalColumn ? " A renewal counts under the channel its membership or plan was sold through." : ""}
          </p>
        </div>
      ) : null}

      {channels.length ? (
        <div className="mt-6 overflow-x-auto" tabIndex={0} role="region" aria-labelledby="numbers-channels">
          <table className="w-full text-left text-sm">
            <caption id="numbers-channels" className="text-left text-sm font-bold text-ink">
              Each channel, from visit to sale
            </caption>
            <thead>
              <tr className="border-b border-line text-xs uppercase tracking-wide text-ink-soft">
                <th scope="col" className="py-1 font-semibold">Channel</th>
                <th scope="col" className="py-1 pl-3 text-right font-semibold">Visits</th>
                <th scope="col" className="py-1 pl-3 text-right font-semibold" title="Pressed buy, book or get it free">
                  Checkouts
                </th>
                {withFreeColumn ? (
                  <th scope="col" className="py-1 pl-3 text-right font-semibold" title="Addresses asked for by a free product">
                    Signups
                  </th>
                ) : null}
                <th scope="col" className="py-1 pl-3 text-right font-semibold">Sales</th>
                <th scope="col" className="py-1 pl-3 text-right font-semibold">Revenue</th>
                <th scope="col" className="py-1 pl-3 text-right font-semibold" title="Sales for every 100 visits from the channel">
                  Converts
                </th>
              </tr>
            </thead>
            <tbody>
              {channels.map((row) => (
                <tr key={row.source} className="border-b border-line/60">
                  <th scope="row" className="py-1 pr-3 font-medium text-ink">
                    {channelName(row.source)}
                  </th>
                  <td className="py-1 pl-3 text-right tabular-nums">{count(row.visits)}</td>
                  <td className="py-1 pl-3 text-right tabular-nums">{count(row.checkouts)}</td>
                  {withFreeColumn ? <td className="py-1 pl-3 text-right tabular-nums">{count(row.free)}</td> : null}
                  <td className="py-1 pl-3 text-right tabular-nums">{salesHere ? count(row.sales) : "—"}</td>
                  <td className="py-1 pl-3 text-right font-semibold tabular-nums text-ink">{salesHere ? money(row.cents) : "—"}</td>
                  <td className="py-1 pl-3 text-right tabular-nums">{salesHere && row.visits >= row.sales ? rate(row.sales, row.visits) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-ink-soft">
            Visits are counted under where each visit came from; checkouts, signups and sales under the channel the buyer is
            credited to, so a buyer who first came from Instagram and returned later still counts there. Checkouts and
            signups by channel are counted from October 11, 2026.
          </p>
        </div>
      ) : null}

      {countries.length || devices.length ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {countries.length ? <Breakdown title="Where in the world" rows={countries} label={countryName} /> : null}
          {devices.length ? <Breakdown title="On what" rows={devices} label={(name) => DEVICE_NAMES[name] ?? name} /> : null}
        </div>
      ) : null}

      {firstFound.length ? (
        <div className="mt-6">
          <p className="text-sm font-bold text-ink">Where buyers first found you, last 90 days</p>
          <ul className="mt-2 divide-y divide-line text-sm">
            {firstFound.slice(0, 8).map((row) => (
              <li key={row.source} className="flex items-baseline justify-between gap-3 py-1.5">
                <span className="min-w-0 truncate text-ink">{channelName(row.source)}</span>
                <span className="shrink-0 tabular-nums text-ink-soft">{`${count(row.sales)} ${row.sales === 1 ? "sale" : "sales"} · ${money(row.cents)}`}</span>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-ink-soft">
            The same sales, credited to the first place each buyer came from in the 90 days before, rather than to the visit
            they bought on: where people discover you, beside where they decide.
          </p>
        </div>
      ) : null}

      {sources.length ? (
        <div className="mt-6">
          <Breakdown title="Where visitors came from" rows={sources} named />
          <p className="mt-2 text-xs text-ink-soft">
            Add <span className="font-mono">?utm_source=newsletter</span> (or any word) to a link you share and its visits are counted under that word.
          </p>
        </div>
      ) : null}

      {mediums.length || campaigns.length ? (
        <div className="mt-6 grid gap-6 sm:grid-cols-2">
          {mediums.length ? <Breakdown title="By medium (utm_medium)" rows={mediums} /> : null}
          {campaigns.length ? <Breakdown title="By campaign (utm_campaign)" rows={campaigns} /> : null}
        </div>
      ) : sources.length ? (
        <p className="mt-4 text-xs text-ink-soft">
          Tag links with <span className="font-mono">utm_medium</span> and <span className="font-mono">utm_campaign</span> too (say
          <span className="font-mono"> ?utm_source=instagram&amp;utm_medium=story&amp;utm_campaign=launch</span>) and each gets a list of its own here.
        </p>
      ) : null}

      {data.products.length ? (
        // Scrolls sideways on a narrow phone, so it can be reached from the keyboard too.
        <div className="mt-6 overflow-x-auto" tabIndex={0} role="region" aria-labelledby="numbers-products">
          <table className="w-full text-left text-sm">
            <caption id="numbers-products" className="text-left text-sm font-bold text-ink">
              What you sell, best first
            </caption>
            <thead>
              <tr className="text-ink-mute">
                <th scope="col" className="py-1.5 font-semibold">Product</th>
                <th scope="col" className="whitespace-nowrap py-1.5 pl-3 text-right font-semibold" title="Times the product's own page was opened">
                  Page views
                </th>
                <th scope="col" className="whitespace-nowrap py-1.5 pl-3 text-right font-semibold">Checkouts</th>
                <th scope="col" className="whitespace-nowrap py-1.5 pl-3 text-right font-semibold">Sales</th>
                <th scope="col" className="whitespace-nowrap py-1.5 pl-3 text-right font-semibold">Revenue</th>
                <th scope="col" className="whitespace-nowrap py-1.5 pl-3 text-right font-semibold" title="Sales for every 100 checkouts started">
                  Paid
                </th>
                <th scope="col" className="whitespace-nowrap py-1.5 pl-3 text-right font-semibold" title="Sales for every 100 times its page was opened">
                  Bought
                </th>
              </tr>
            </thead>
            <tbody>
              {shownProducts.map((product, index) => (
                <tr key={product.id} className="border-t border-line">
                  <td className="max-w-[7rem] truncate py-1.5 pr-2 font-semibold text-ink sm:max-w-[14rem]">
                    {index < 3 && product.cents > 0 ? <span className="mr-1.5 tabular-nums text-violet-deep">{index + 1}.</span> : null}
                    {product.title}
                  </td>
                  <td className="py-1.5 pl-3 text-right tabular-nums">{product.views < 0 ? "—" : count(product.views)}</td>
                  <td className="py-1.5 pl-3 text-right tabular-nums">{count(product.checkouts)}</td>
                  <td className="py-1.5 pl-3 text-right tabular-nums">{salesHere ? count(product.sales) : "—"}</td>
                  <td className="py-1.5 pl-3 text-right tabular-nums">{salesHere ? money(product.cents) : "—"}</td>
                  <td className="py-1.5 pl-3 text-right tabular-nums">{salesHere ? rate(product.sales, product.checkouts) : "—"}</td>
                  <td className="py-1.5 pl-3 text-right tabular-nums">{salesHere && product.views > 0 && product.views >= product.sales ? rate(product.sales, product.views) : "—"}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <p className="mt-2 text-xs text-ink-soft">
            Page views are the times the product&apos;s own page was opened, counted from October 8, 2026, for 7, 30 and 90 days.
            Paid is sales for every 100 checkouts started; Bought is sales for every 100 page views, and is left out while a
            product sells more than its page is visited, as when buyers pay from your store&apos;s front page. A free product&apos;s
            checkouts are the addresses asked for, and it has no sales.
          </p>
        </div>
      ) : null}

      {data.links.length ? (
        <div className="mt-6">
          <p className="text-sm font-bold text-ink">Your links, opened</p>
          <ul className="mt-2 divide-y divide-line text-sm">
            {data.links.map((link) => (
              <li key={link.id} className="flex items-baseline justify-between gap-3 py-1.5">
                <span className="min-w-0 truncate text-ink">{link.title}</span>
                <span className="shrink-0 tabular-nums text-ink-soft">{count(link[range])}</span>
              </li>
            ))}
          </ul>
        </div>
      ) : null}

      <div className="mt-6 rounded-[12px] bg-paper px-4 py-4 ring-1 ring-line">
        <p className="text-sm font-bold text-ink">Take your numbers with you</p>
        <p className="mt-1 text-xs text-ink-soft">CSV files that open in Excel, Numbers and Google Sheets.</p>
        {/* Plain GET forms rather than links, so nothing prefetches a file that reads Stripe. */}
        <div className="mt-3 flex flex-wrap items-end gap-3">
          {/* The sales file carries buyers' addresses: only for a role that may take them. */}
          {salesKnown && canExport ? (
            <form action="/api/store/export" method="get" className="flex flex-wrap items-end gap-2">
              <StoreField />
              <input type="hidden" name="what" value="sales" />
              <label className="text-sm">
                <span className="field-label">Sales</span>
                <select name="range" defaultValue="30" className="field mt-1 w-auto py-2">
                  <option value="30">Last 30 days</option>
                  <option value="90">Last 90 days</option>
                  <option value="all">All</option>
                </select>
              </label>
              <button type="submit" className="btn btn-primary btn-sm">
                Download sales
              </button>
            </form>
          ) : null}
          <form action="/api/store/export" method="get">
            <StoreField />
            <input type="hidden" name="what" value="visits" />
            <button type="submit" className="btn btn-secondary btn-sm">
              Visits by day
            </button>
          </form>
          <form action="/api/store/export" method="get">
            <StoreField />
            <input type="hidden" name="what" value="sources" />
            <button type="submit" className="btn btn-secondary btn-sm">
              Sources and campaigns
            </button>
          </form>
        </div>
        {/*
          The sales file is described only where its button is. Without Stripe
          connected there is no button, and a sentence about a file nobody can
          find sends the creator looking for it; they are told instead when it
          will appear.
        */}
        <p className="mt-3 text-xs text-ink-soft">
          {data.sales === "none"
            ? "A third file, your sales, appears here once your Stripe account is connected. "
            : data.sales === "error"
              ? "Your sales could not be read from Stripe just now, so their file is not offered; it comes back when they can be. "
            : !canExport
              ? "Downloading sales, which carry buyers' addresses, is for the owner and Admins. "
              : "The sales file has one row per paid checkout or one-click extra, with the buyer's email and name, and reads up to 5,000 of each from your Stripe account. "}
          Visits go back as far as they are kept, 400 days.
        </p>
      </div>

      <p className="mt-6 text-xs leading-relaxed text-ink-soft">
        Counted without cookies, and your own visits while logged in are not counted. A visitor is one person on one
        device on one day. Days run midnight to midnight UTC. Sales are read from your own Stripe account: new
        purchases and new members, before Stripe&apos;s fee and any refund. Renewals are the payments after the first of
        memberships and payment plans, from the paid invoices of your store&apos;s subscriptions over the last 90 days;
        all of them are in your Stripe dashboard.
        {data.partial ? " These 90 days had more sales than one reading covers (1,000 checkouts), so the oldest are left out of these totals." : ""}
        {data.renewals?.partial ? " They also had more invoices than one reading covers (1,000), so the oldest renewals are left out." : ""}
      </p>
    </section>
  );
}
