/**
 * How many people visit a store, where they come from, and how many of them
 * start to pay.
 *
 * Counted without a cookie and without keeping anybody's address. A visitor
 * is told apart from another for one day only, by a one-way fingerprint of
 * the day, the store, their network address and their browser, and even that
 * fingerprint is not kept: it goes into Redis's HyperLogLog, which keeps an
 * estimate of how many different ones it has seen and nothing from which any
 * one of them could be read back.
 *
 * Every day has a record of its own, kept KEPT_DAYS days, and the studio
 * reads the last STATS_DAYS of them for its 7, 30 and 90 day views. "All
 * time" has a record of its own that never expires: the same counts, added
 * to as they happen, and filled once from whatever days are still kept the
 * first time it is read. So all time begins at the store's first counted
 * visit still on record, which the studio says.
 *
 * Where a visit came from is kept three ways: the source (the site, the app,
 * or the utm_source tag on the creator's link), and the utm_medium and
 * utm_campaign tags when the link carries them.
 *
 * Sales are not counted here. They are read from the creator's own Stripe
 * account, which is the only record of money that deserves the name.
 */
import { saleHandles } from "@/lib/store";
import { type Together, parseTogether, togetherFrom } from "@/lib/also-bought";
import { createHash } from "node:crypto";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { onAccount } from "@/lib/stripe-account";
import type { Listing, Store } from "@/lib/store";
import { listingFinder, productIds, recordListings } from "@/lib/catalog";
import { plainAmount } from "@/lib/money";
import { revenueBySource } from "@/lib/came-from";
import { bumpsFromMeta } from "@/lib/bundle-rules";

/** Days kept, a little over a year, so a year-on-year look is possible. */
const TTL_SECONDS = 400 * 86400;

/** The longest window read day by day. "All time" is kept apart (below). */
export const STATS_DAYS = 90;

/** How many days of visits are kept, and so how far back an export of them goes. */
export const KEPT_DAYS = 400;

const MAX_SOURCES = 40;

const dayKey = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const countsKey = (statsId: string, day: string) => `nl:stats:${statsId}:${day}`;
const visitorsKey = (statsId: string, day: string) => `nl:stats:${statsId}:${day}:u`;
const lifeKey = (statsId: string) => `nl:stats:${statsId}:life`;
const lifeLockKey = (statsId: string) => `nl:stats:${statsId}:life:lock`;

import { isBot, classifySource, cleanTag } from "@/lib/source-rules";
export { isBot, classifySource, cleanTag };

export type HitKind = "view" | "checkout" | "link" | "product";

/**
 * Counts one thing a visitor did.
 *
 * A view is counted once per page load, from the page itself; a checkout is
 * counted by the server when a buyer presses the button that takes them to
 * pay, or to get something free; a link is counted when one is opened. Each
 * is added to its day and to the store's all-time record together.
 */
export async function recordHit(
  store: Store,
  hit: { kind: HitKind; id?: string; source?: string; medium?: string; campaign?: string; ip: string; userAgent: string },
  now = Date.now(),
): Promise<void> {
  if (!store.statsId || !isRedisConfigured() || isBot(hit.userAgent)) return;
  const day = dayKey(now);
  const counts = countsKey(store.statsId, day);
  const life = lifeKey(store.statsId);
  const commands: (string | number)[][] = [];
  const both = (field: string) => {
    commands.push(["HINCRBY", counts, field, 1]);
    commands.push(["HINCRBY", life, field, 1]);
  };
  let pfAt = -1;
  if (hit.kind === "view") {
    const visitor = createHash("sha256")
      .update(`${day}|${store.statsId}|${hit.ip}|${hit.userAgent}`)
      .digest("hex")
      .slice(0, 24);
    const visitors = visitorsKey(store.statsId, day);
    both("v");
    both(`r:${hit.source || "direct"}`);
    if (hit.medium) both(`m:${hit.medium}`);
    if (hit.campaign) both(`g:${hit.campaign}`);
    pfAt = commands.length;
    commands.push(["PFADD", visitors, visitor]);
    commands.push(["EXPIRE", visitors, TTL_SECONDS]);
  } else if (hit.kind === "checkout" && hit.id) {
    both("c");
    both(`c:${hit.id}`);
  } else if (hit.kind === "link" && hit.id) {
    both(`l:${hit.id}`);
  } else if (hit.kind === "product" && hit.id) {
    // A product's own page was opened (each page load sends this once,
    // components/store-beacon.tsx): what its checkouts and sales are read
    // against. One command, and the day's end set once by the first of the
    // day, because every visit's cost is held to what a plan charges for it
    // (tests/traffic-cost.ts). The day's count only, not the all-time
    // record, so "all time" has no figure for it rather than a wrong one.
    const [opened] = await redisPipeline([["HINCRBY", counts, `pv:${hit.id}`, 1]]);
    if (Number(opened) === 1) await redisPipeline([["EXPIRE", counts, TTL_SECONDS]]);
    return;
  } else {
    return;
  }
  commands.push(["EXPIRE", counts, TTL_SECONDS]);
  // The day the all-time record started counting, so filling it from the
  // kept days never counts that day or any after it twice.
  commands.push(["HSETNX", life, "started", day]);
  const results = await redisPipeline(commands);
  // A visitor new to today is a visitor for all time too.
  if (pfAt >= 0 && Number(results[pfAt]) === 1) await redisPipeline([["HINCRBY", life, "u", 1]]);
}

export type DayStats = { date: string; views: number; visitors: number; checkouts: number };

export type Ranked = { name: string; visits: number }[];

/** What happened over one stretch of days. */
export type WindowStats = {
  /** People, over the whole window — not the sum of the days. */
  visitors: number;
  views: number;
  checkouts: number;
  sources: Ranked;
  mediums: Ranked;
  campaigns: Ranked;
  checkoutsByProduct: Record<string, number>;
  /** Times each product's own page was opened. */
  viewsByProduct: Record<string, number>;
  linkClicks: Record<string, number>;
};

export type Windows = { d7: WindowStats; d30: WindowStats; d90: WindowStats };

export type Stats = {
  /** The last STATS_DAYS days, oldest first. */
  days: DayStats[];
  windows: Windows;
  /** Everything since `since`, or null when it could not be read. */
  life: (WindowStats & { since: string }) | null;
};

const ranked = (map: Map<string, number>): Ranked =>
  [...map.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, MAX_SOURCES)
    .map(([name, visits]) => ({ name, visits }));

/** Adds one day's (or one record's) fields into running totals. */
class Tally {
  views = 0;
  checkouts = 0;
  sources = new Map<string, number>();
  mediums = new Map<string, number>();
  campaigns = new Map<string, number>();
  checkoutsByProduct: Record<string, number> = {};
  viewsByProduct: Record<string, number> = {};
  linkClicks: Record<string, number> = {};

  add(field: string, count: number) {
    if (field === "v") this.views += count;
    else if (field === "c") this.checkouts += count;
    else if (field.startsWith("r:")) this.sources.set(field.slice(2), (this.sources.get(field.slice(2)) ?? 0) + count);
    else if (field.startsWith("m:")) this.mediums.set(field.slice(2), (this.mediums.get(field.slice(2)) ?? 0) + count);
    else if (field.startsWith("g:")) this.campaigns.set(field.slice(2), (this.campaigns.get(field.slice(2)) ?? 0) + count);
    else if (field.startsWith("c:")) this.checkoutsByProduct[field.slice(2)] = (this.checkoutsByProduct[field.slice(2)] ?? 0) + count;
    else if (field.startsWith("pv:")) this.viewsByProduct[field.slice(3)] = (this.viewsByProduct[field.slice(3)] ?? 0) + count;
    else if (field.startsWith("l:")) this.linkClicks[field.slice(2)] = (this.linkClicks[field.slice(2)] ?? 0) + count;
  }

  window(visitors: number): WindowStats {
    return {
      visitors,
      views: this.views,
      checkouts: this.checkouts,
      sources: ranked(this.sources),
      mediums: ranked(this.mediums),
      campaigns: ranked(this.campaigns),
      checkoutsByProduct: this.checkoutsByProduct,
      viewsByProduct: this.viewsByProduct,
      linkClicks: this.linkClicks,
    };
  }
}

function pairs(reply: unknown): [string, number][] {
  const flat = Array.isArray(reply) ? (reply as unknown[]).map(String) : [];
  const out: [string, number][] = [];
  for (let i = 0; i + 1 < flat.length; i += 2) out.push([flat[i], Number(flat[i + 1]) || 0]);
  return out;
}

/** The dates of the last `count` days, oldest first, ending today (UTC). */
function lastDays(now: number, count: number): string[] {
  const dates: string[] = [];
  for (let i = count - 1; i >= 0; i -= 1) dates.push(dayKey(now - i * 86400_000));
  return dates;
}

/** The last STATS_DAYS days of a store, and its all-time record. */
export async function readStats(store: Store, now = Date.now()): Promise<Stats | null> {
  if (!store.statsId || !isRedisConfigured()) return null;
  const statsId = store.statsId;
  const dates = lastDays(now, STATS_DAYS);

  const commands: (string | number)[][] = [
    ...dates.map((d) => ["HGETALL", countsKey(statsId, d)]),
    ...dates.map((d) => ["PFCOUNT", visitorsKey(statsId, d)]),
    ["PFCOUNT", ...dates.slice(-7).map((d) => visitorsKey(statsId, d))],
    ["PFCOUNT", ...dates.slice(-30).map((d) => visitorsKey(statsId, d))],
    ["PFCOUNT", ...dates.map((d) => visitorsKey(statsId, d))],
  ];
  const results = await redisPipeline(commands);

  const days: DayStats[] = [];
  const tallies = { d7: new Tally(), d30: new Tally(), d90: new Tally() };
  dates.forEach((date, index) => {
    const age = dates.length - 1 - index;
    let views = 0;
    let checkouts = 0;
    for (const [field, count] of pairs(results[index])) {
      if (field === "v") views = count;
      else if (field === "c") checkouts = count;
      tallies.d90.add(field, count);
      if (age < 30) tallies.d30.add(field, count);
      if (age < 7) tallies.d7.add(field, count);
    }
    days.push({ date, views, visitors: Number(results[dates.length + index]) || 0, checkouts });
  });
  const base = dates.length * 2;
  const windows: Windows = {
    d7: tallies.d7.window(Number(results[base]) || 0),
    d30: tallies.d30.window(Number(results[base + 1]) || 0),
    d90: tallies.d90.window(Number(results[base + 2]) || 0),
  };
  const life = await readLife(store, now).catch((error) => {
    console.error("reading all-time counts failed", error);
    return null;
  });
  return { days, windows, life };
}

/**
 * Page loads that arrived wearing each of these campaign tags, over the last
 * `days` days, today included: what an email's links brought to the store
 * (lib/mail-links.ts), or one subject line's share of them (lib/mail-test.ts).
 *
 * Read from the days themselves, a few fields of each, rather than from the
 * all-time record: that one lets its smallest tags go once it is full, and an
 * email nobody clicked much is exactly the one whose count has to be right.
 * A load, not a person: somebody who opens the link twice is counted twice.
 * Null when it could not be read at all, which is not the same as none.
 */
export async function campaignViews(
  statsId: string | null,
  campaigns: string[],
  days = STATS_DAYS,
  now = Date.now(),
): Promise<Record<string, number> | null> {
  if (!statsId || !isRedisConfigured()) return null;
  const tags = [...new Set(campaigns.map(cleanTag).filter(Boolean))];
  const out: Record<string, number> = Object.fromEntries(tags.map((tag) => [tag, 0]));
  if (!tags.length) return out;
  const dates = lastDays(now, Math.max(1, Math.min(Math.floor(days), KEPT_DAYS)));
  const replies = await redisPipeline(dates.map((date) => ["HMGET", countsKey(statsId, date), ...tags.map((tag) => `g:${tag}`)]));
  for (const reply of replies) {
    if (!Array.isArray(reply)) continue;
    reply.forEach((count, i) => {
      if (i < tags.length) out[tags[i]] += Number(count) || 0;
    });
  }
  return out;
}

/** Fields the all-time record keeps for itself rather than as counts. */
const LIFE_OWN = new Set(["started", "since", "filled", "u"]);
/** Beyond this many fields, the smallest sources and tags are let go. */
const LIFE_MAX_FIELDS = 2000;
const LIFE_KEEP_PER_KIND = 300;

/**
 * The store's all-time record. The first time it is read it is filled from
 * the days still kept from before it started counting — once, under a lock,
 * and marked so it never happens twice.
 */
async function readLife(store: Store, now: number): Promise<(WindowStats & { since: string }) | null> {
  const statsId = store.statsId as string;
  const life = lifeKey(statsId);
  let [raw] = await redisPipeline([["HGETALL", life]]);
  let fields = new Map(pairs(raw));
  const flat = Array.isArray(raw) ? (raw as unknown[]).map(String) : [];
  const text = (name: string) => {
    const at = flat.indexOf(name);
    return at >= 0 && at % 2 === 0 ? flat[at + 1] : "";
  };

  if (!text("filled")) {
    const [mine] = await redisPipeline([["SET", lifeLockKey(statsId), "1", "NX", "EX", 60]]);
    if (mine !== null) {
      const today = dayKey(now);
      const started = /^\d{4}-\d{2}-\d{2}$/.test(text("started")) ? text("started") : today;
      const created = /^\d{4}-\d{2}-\d{2}/.test(store.createdAt) ? store.createdAt.slice(0, 10) : "";
      const earliest = dayKey(now - (KEPT_DAYS - 1) * 86400_000);
      const from = created && created > earliest ? created : earliest;
      const dates = lastDays(now, KEPT_DAYS).filter((d) => d >= from && d < started);
      const tally = new Map<string, number>();
      let visitors = 0;
      let first = "";
      if (dates.length) {
        const replies = await redisPipeline([
          ...dates.map((d) => ["HGETALL", countsKey(statsId, d)]),
          ...dates.map((d) => ["PFCOUNT", visitorsKey(statsId, d)]),
        ]);
        dates.forEach((date, i) => {
          const day = pairs(replies[i]);
          if (day.length && !first) first = date;
          for (const [field, count] of day) tally.set(field, (tally.get(field) ?? 0) + count);
          visitors += Number(replies[dates.length + i]) || 0;
        });
      }
      await redisPipeline([
        ...[...tally.entries()].map(([field, count]) => ["HINCRBY", life, field, count]),
        ...(visitors ? [["HINCRBY", life, "u", visitors]] : []),
        ["HSET", life, "since", first || started, "filled", today],
        ["HSETNX", life, "started", started],
        ["DEL", lifeLockKey(statsId)],
      ]);
      [raw] = await redisPipeline([["HGETALL", life]]);
      fields = new Map(pairs(raw));
      flat.length = 0;
      flat.push(...(Array.isArray(raw) ? (raw as unknown[]).map(String) : []));
    }
  }

  // A record that has gathered too many one-off sources lets the smallest go.
  if (fields.size > LIFE_MAX_FIELDS) {
    const drop: string[] = [];
    for (const prefix of ["r:", "m:", "g:"]) {
      const kind = [...fields.entries()].filter(([f]) => f.startsWith(prefix)).sort((a, b) => b[1] - a[1]);
      drop.push(...kind.slice(LIFE_KEEP_PER_KIND).map(([f]) => f));
    }
    if (drop.length) await redisPipeline([["HDEL", life, ...drop]]);
  }

  const tally = new Tally();
  for (const [field, count] of fields) if (!LIFE_OWN.has(field)) tally.add(field, count);
  const since = text("since") || text("started") || dayKey(now);
  return { ...tally.window(fields.get("u") ?? 0), since };
}

// ---- Sales, from the creator's Stripe -----------------------------------------

type SalesWindow = { sales: number; cents: number };

export type SalesStats = {
  /** Paid checkouts per day, same days as the visits. */
  byDay: Record<string, SalesWindow>;
  byProduct: Record<string, { d7: SalesWindow; d30: SalesWindow; d90: SalesWindow }>;
  totals: { d7: SalesWindow; d30: SalesWindow; d90: SalesWindow };
  /** True when there were more sales than one reading covers. */
  partial: boolean;
  /**
   * Sales in another currency than the store's, from before it changed:
   * counted here and left out of every total above, because euros added to
   * dollars make a number that means nothing. They are in the CSV.
   */
  elsewhere: number;
  /**
   * What each of the creator's own links brought in, over the same 90 days,
   * biggest first (lib/came-from.ts). Only the store's own currency, for the
   * reason above. "direct" is every sale that carried no tag.
   */
  bySource: { source: string; currency: string; cents: number; sales: number }[];
  /**
   * The payments after the first (added 11 October 2026): memberships renewed
   * and the later payments of payment plans, read from the paid invoices of
   * this store's subscriptions. A first payment is a checkout and is in the
   * sales above, so it is never counted twice. Absent on a reading from before.
   */
  renewals?: { d7: Renewals; d30: Renewals; d90: Renewals; partial: boolean; bySource?: RenewalsBySource };
  /** What each channel brought in, credited to the buyer's FIRST visit from somewhere (lib/visit-channel.ts). */
  firstBySource?: { source: string; currency: string; cents: number; sales: number }[];
};

/** Payments after the first, and what they came to, in the store's currency. */
export type Renewals = { payments: number; cents: number };

/** Renewals over the last 90 days by the channel the subscription was sold through; "" is direct. */
export type RenewalsBySource = ({ source: string } & Renewals)[];

/** The channel of a subscription sold before channels were written onto subscriptions. */
export const UNRECORDED = "unrecorded";

export type AllTimeSales = {
  totals: SalesWindow;
  byProduct: Record<string, SalesWindow>;
  /** The first sale read, as a date; empty when none. */
  since: string;
  partial: boolean;
  /** What the totals are in: the store's currency when they were read. */
  currency: string;
  /** Sales in another currency, left out of the totals. */
  elsewhere: number;
  /** What the buyers of each product also bought (lib/also-bought.ts); absent on a reading from before it. */
  together?: Together;
};

type Row = {
  id?: unknown;
  status?: unknown;
  payment_status?: unknown;
  amount_total?: unknown;
  currency?: unknown;
  created?: unknown;
  metadata?: Record<string, string> | null;
};

/**
 * One paid sale as read from Stripe: a checkout, or a one-click extra after
 * one, with the amount in the smallest unit of the currency it was paid in.
 */
export type Sale = {
  created: number;
  product: string;
  cents: number;
  currency: string;
  row: Record<string, unknown>;
  upsell: boolean;
  /**
   * The channel this sale is credited to, "" when it came from nowhere the
   * store could name: the utm_source on the page it was bought from
   * (lib/came-from.ts), else the channel remembered for the buyer's visit
   * (lib/visit-channel.ts), which sales from before 11 October 2026 lack.
   */
  source: string;
  medium: string;
  campaign: string;
  /** The channel of the buyer's first visit from somewhere, where it was remembered; else `source`. */
  first: string;
};

/** The channel a checkout's metadata credits, "" for direct (lib/visit-channel.ts). */
function saleChannel(meta: Record<string, string>): { source: string; medium: string; campaign: string; first: string } {
  const named = (value: string | undefined) => (value && value !== "direct" ? value : "");
  const source = meta.utm_source || named(meta.channel);
  return {
    source,
    medium: meta.utm_medium || meta.channel_medium || "",
    campaign: meta.utm_campaign || meta.channel_campaign || "",
    first: named(meta.channel_first) || source,
  };
}

/** The currency Stripe reports on a checkout or a payment; US dollars when it says none. */
const currencyOf = (row: { currency?: unknown }) => (typeof row.currency === "string" && row.currency ? row.currency.toLowerCase() : "usd");

/**
 * Every paid sale of this store since `since` (seconds), newest first, read
 * from the creator's own Stripe account: checkouts this store opened that
 * were paid, and the one-click extras taken after them. At most `pages`
 * pages of a hundred of each are read; `partial` says when there were more.
 * Amounts are what the buyer paid, after any discount code and before
 * Stripe's fee or any refund, each in the currency it was paid in.
 */
export async function readPaidSales(store: Store, since: number, pages: number): Promise<{ sales: Sale[]; partial: boolean }> {
  if (!store.stripeAccountId) return { sales: [], partial: false };
  const handles = saleHandles(store);
  const sales: Sale[] = [];
  let partial = false;
  const walk = async (path: string, take: (row: Record<string, unknown>) => void) => {
    let after = "";
    for (let page = 0; page < pages; page += 1) {
      const list = (await onAccount(
        "GET",
        store.stripeAccountId as string,
        `${path}${since > 0 ? `&created[gte]=${since}` : ""}${after ? `&starting_after=${encodeURIComponent(after)}` : ""}`,
      )) as { data?: unknown; has_more?: unknown };
      const rows = Array.isArray(list.data) ? (list.data as Record<string, unknown>[]) : [];
      rows.forEach(take);
      if (list.has_more !== true || rows.length === 0) return;
      const last = rows[rows.length - 1];
      after = typeof last.id === "string" ? last.id : "";
      if (!after) return;
      if (page === pages - 1) partial = true;
    }
  };
  await walk("/checkout/sessions?limit=100", (raw) => {
    const row = raw as Row;
    const meta = row.metadata ?? {};
    if (!handles.has(meta.store ?? "")) return;
    if (row.status !== "complete" || row.payment_status !== "paid") return;
    sales.push({
      created: typeof row.created === "number" ? row.created * 1000 : Date.now(),
      product: meta.product ?? "",
      cents: typeof row.amount_total === "number" ? row.amount_total : 0,
      currency: currencyOf(row),
      row: raw,
      upsell: false,
      ...saleChannel(meta),
    });
  });
  // Products taken in one click after paying are charges of their own.
  await walk("/payment_intents?limit=100", (pi) => {
    const meta = (pi.metadata ?? {}) as Record<string, string>;
    if (meta.kind !== "upsell" || !handles.has(meta.store ?? "") || pi.status !== "succeeded") return;
    sales.push({
      created: typeof pi.created === "number" ? pi.created * 1000 : Date.now(),
      product: meta.product ?? "",
      cents: typeof pi.amount === "number" ? pi.amount : 0,
      currency: currencyOf(pi),
      row: pi,
      upsell: true,
      // An upsell is taken in one click after a checkout that already has
      // its channel. It belongs to the same visit, and the sale it followed
      // carries the tag, so this is left blank rather than guessed at.
      source: "",
      medium: "",
      campaign: "",
      first: "",
    });
  });
  sales.sort((a, b) => b.created - a.created);
  return { sales, partial };
}

/** The metadata of the subscription an invoice is for, where either of Stripe's API versions keeps it. */
function invoiceMeta(invoice: Record<string, unknown>): Record<string, string> {
  const older = (invoice.subscription_details as { metadata?: unknown } | null | undefined)?.metadata;
  const parent = invoice.parent as { subscription_details?: { metadata?: unknown } | null } | null | undefined;
  const newer = parent?.subscription_details?.metadata;
  const meta = (newer && typeof newer === "object" ? newer : older && typeof older === "object" ? older : {}) as Record<string, unknown>;
  return Object.fromEntries(Object.entries(meta).filter((entry): entry is [string, string] => typeof entry[1] === "string"));
}

/**
 * The payments after the first of this store's memberships and payment plans
 * since `since` (seconds): paid invoices Stripe made because a period came
 * round (billing_reason "subscription_cycle"), on subscriptions this store
 * opened. At most `pages` pages of a hundred. Pure on what it is handed, so a
 * test can give it invoices.
 */
export function renewalsFrom(
  store: Store,
  invoices: Record<string, unknown>[],
  now: number,
  currency: string,
): { d7: Renewals; d30: Renewals; d90: Renewals; bySource: RenewalsBySource } {
  const handles = saleHandles(store);
  const cut7 = dayKey(now - 6 * 86400_000);
  const cut30 = dayKey(now - 29 * 86400_000);
  const zero = (): Renewals => ({ payments: 0, cents: 0 });
  const out = { d7: zero(), d30: zero(), d90: zero() };
  const by = new Map<string, Renewals>();
  for (const invoice of invoices) {
    if (invoice.status !== "paid" || invoice.billing_reason !== "subscription_cycle") continue;
    const meta = invoiceMeta(invoice);
    if (!handles.has(meta.store ?? "")) continue;
    if (currencyOf(invoice) !== currency) continue;
    const cents = typeof invoice.amount_paid === "number" ? invoice.amount_paid : 0;
    if (cents <= 0) continue;
    const day = dayKey((typeof invoice.created === "number" ? invoice.created : 0) * 1000);
    const windows: ("d7" | "d30" | "d90")[] = ["d90", ...(day >= cut30 ? (["d30"] as const) : []), ...(day >= cut7 ? (["d7"] as const) : [])];
    for (const w of windows) {
      out[w].payments += 1;
      out[w].cents += cents;
    }
    // The channel the subscription was sold through, which every renewal
    // carries in its subscription's metadata (lib/visit-channel.ts). One sold
    // before channels were written down says nothing, and is kept apart as
    // UNRECORDED rather than counted as direct, which would be a guess.
    const source = "channel" in meta ? (meta.channel === "direct" ? "" : meta.channel) : meta.utm_source || UNRECORDED;
    const row = by.get(source) ?? zero();
    row.payments += 1;
    row.cents += cents;
    by.set(source, row);
  }
  const bySource = [...by.entries()].map(([source, r]) => ({ source, ...r })).sort((a, b) => b.cents - a.cents || a.source.localeCompare(b.source));
  return { ...out, bySource };
}

async function readRenewals(store: Store, since: number, now: number, pages: number): Promise<SalesStats["renewals"]> {
  const invoices: Record<string, unknown>[] = [];
  let after = "";
  let partial = false;
  for (let page = 0; page < pages; page += 1) {
    const list = (await onAccount(
      "GET",
      store.stripeAccountId as string,
      `/invoices?limit=100&status=paid&created[gte]=${since}${after ? `&starting_after=${encodeURIComponent(after)}` : ""}`,
    )) as { data?: unknown; has_more?: unknown };
    const rows = Array.isArray(list.data) ? (list.data as Record<string, unknown>[]) : [];
    invoices.push(...rows);
    if (list.has_more !== true || rows.length === 0) break;
    const last = rows[rows.length - 1];
    after = typeof last.id === "string" ? last.id : "";
    if (!after) break;
    if (page === pages - 1) partial = true;
  }
  return { ...renewalsFrom(store, invoices, now, store.currency), partial };
}

/** Sales in the last STATS_DAYS days, by day, by product, and for each window. */
export async function readSales(store: Store, now = Date.now()): Promise<SalesStats | null> {
  if (!store.stripeAccountId) return null;
  const since = Math.floor(now / 1000) - STATS_DAYS * 86400;
  // Read beside the sales; a store whose renewals cannot be read still sees its sales.
  const [{ sales, partial }, renewals] = await Promise.all([
    readPaidSales(store, since, 10),
    readRenewals(store, since, now, 10).catch((error) => {
      console.error("reading renewals failed", error);
      return undefined;
    }),
  ]);
  const cut7 = dayKey(now - 6 * 86400_000);
  const cut30 = dayKey(now - 29 * 86400_000);
  const zero = () => ({ sales: 0, cents: 0 });
  const out: SalesStats = { byDay: {}, byProduct: {}, totals: { d7: zero(), d30: zero(), d90: zero() }, partial, elsewhere: 0, bySource: [], ...(renewals ? { renewals } : {}) };
  for (const sale of sales) {
    if (sale.currency !== store.currency) {
      out.elsewhere += 1;
      continue;
    }
    const day = dayKey(sale.created);
    const d = (out.byDay[day] ??= zero());
    d.sales += 1;
    d.cents += sale.cents;
    const p = (out.byProduct[sale.product] ??= { d7: zero(), d30: zero(), d90: zero() });
    const windows: ("d7" | "d30" | "d90")[] = ["d90", ...(day >= cut30 ? (["d30"] as const) : []), ...(day >= cut7 ? (["d7"] as const) : [])];
    for (const w of windows) {
      p[w].sales += 1;
      p[w].cents += sale.cents;
      out.totals[w].sales += 1;
      out.totals[w].cents += sale.cents;
    }
  }
  // What each link brought in, over the same ninety days. Only the store's
  // own currency: the sales in another one are counted in `elsewhere` and
  // left out of every total here, for the reason given on that field.
  out.bySource = revenueBySource(
    sales.filter((sale) => sale.currency === store.currency).map((sale) => ({
      cents: sale.cents,
      currency: sale.currency,
      source: sale.source,
    })),
  );
  out.firstBySource = revenueBySource(
    sales.filter((sale) => sale.currency === store.currency && !sale.upsell).map((sale) => ({
      cents: sale.cents,
      currency: sale.currency,
      source: sale.first,
    })),
  );
  return out;
}

/** The most pages of a hundred read for all-time sales. */
export const ALL_TIME_PAGES = 30;
const allSalesKey = (statsId: string) => `nl:stats:${statsId}:allsales`;
/** How long an all-time reading is reused, so the button can be pressed freely. */
const ALL_SALES_SECONDS = 600;

/**
 * Every sale the store has made, as far back as ALL_TIME_PAGES pages of
 * checkouts reach, read when the creator asks for it and kept ten minutes.
 */
export async function readAllTimeSales(store: Store): Promise<AllTimeSales | null> {
  if (!store.stripeAccountId) return null;
  if (store.statsId && isRedisConfigured()) {
    const [cached] = await redisPipeline([["GET", allSalesKey(store.statsId)]]);
    if (typeof cached === "string" && cached) {
      try {
        const kept = JSON.parse(cached) as AllTimeSales;
        // Read again when the store has changed its currency since.
        if ((kept.currency ?? "usd") === store.currency) return { ...kept, currency: kept.currency ?? "usd", elsewhere: kept.elsewhere ?? 0, together: parseTogether(kept.together) };
      } catch {
        // Read again below.
      }
    }
  }
  const { sales, partial } = await readPaidSales(store, 0, ALL_TIME_PAGES);
  const out: AllTimeSales = { totals: { sales: 0, cents: 0 }, byProduct: {}, since: "", partial, currency: store.currency, elsewhere: 0 };
  for (const sale of sales) {
    if (sale.currency !== store.currency) {
      out.elsewhere += 1;
      continue;
    }
    out.totals.sales += 1;
    out.totals.cents += sale.cents;
    const p = (out.byProduct[sale.product] ??= { sales: 0, cents: 0 });
    p.sales += 1;
    p.cents += sale.cents;
  }
  if (sales.length) out.since = dayKey(sales[sales.length - 1].created);
  out.together = togetherFrom(sales);
  if (store.statsId && isRedisConfigured()) {
    await redisPipeline([["SET", allSalesKey(store.statsId), JSON.stringify(out), "EX", ALL_SALES_SECONDS]]).catch(() => {});
  }
  return out;
}

// ---- What the studio shows ------------------------------------------------

export type RangeKey = "d7" | "d30" | "d90" | "all";

export type Totals = { visitors: number; views: number; checkouts: number; sales: number; cents: number };

/** `views` is -1 for all time, which is not kept for a product's page. */
export type ProductRow = { views: number; checkouts: number; sales: number; cents: number };

export type StatsData = {
  days: { date: string; visitors: number; views: number; checkouts: number; sales: number }[];
  /** "all" has no sales until the creator asks for them (salesAll). */
  totals: Record<RangeKey, Totals>;
  sources: Record<RangeKey, Ranked>;
  mediums: Record<RangeKey, Ranked>;
  campaigns: Record<RangeKey, Ranked>;
  products: ({ id: string; title: string } & Record<RangeKey, ProductRow>)[];
  links: ({ id: string; title: string } & Record<RangeKey, number>)[];
  /** "none" when there is no Stripe account to read sales from yet. */
  sales: "ok" | "none" | "error";
  partial: boolean;
  /** What the money in it is in: the store's currency. */
  currency: string;
  /** Sales in another currency, from before the store changed it: not in the totals. */
  elsewhere: number;
  /** The first day all-time visits cover, or empty when unknown. */
  since: string;
  /**
   * What each link brought in over the last 90 days, biggest first.
   *
   * The whole point of tagging a link is this row and not the visitor count
   * beside it: four hundred people from a newsletter and six hundred dollars
   * in the same month were two numbers that never met, and a creator cannot
   * decide where to spend their week on the first one alone.
   */
  revenueBySource: { source: string; cents: number; sales: number; renewalCents: number; renewals: number }[];
  /**
   * The same money credited to where each buyer FIRST came from, rather than
   * to the visit they bought on (lib/visit-channel.ts). Renewals are not in
   * it: a subscription remembers the channel it was sold through, not the
   * buyer's first one.
   */
  firstBySource: { source: string; cents: number; sales: number }[];
  /** Memberships renewed and later plan payments, by window (SalesStats.renewals); null when they could not be read. */
  renewals: { d7: Renewals; d30: Renewals; d90: Renewals; partial: boolean } | null;
};

const EMPTY_WINDOW: WindowStats = { visitors: 0, views: 0, checkouts: 0, sources: [], mediums: [], campaigns: [], checkoutsByProduct: {}, viewsByProduct: {}, linkClicks: {} };

/**
 * First sales and the renewals they went on to bring, by channel: what each
 * channel is worth over the 90 days, not only what it sold on the day. A
 * channel with renewals and no first sale in the window still gets its row.
 */
export function withRenewals(
  firsts: { source: string; cents: number; sales: number }[],
  renewals: RenewalsBySource,
): StatsData["revenueBySource"] {
  const rows = new Map<string, StatsData["revenueBySource"][number]>();
  for (const f of firsts) rows.set(f.source, { source: f.source, cents: f.cents, sales: f.sales, renewalCents: 0, renewals: 0 });
  for (const r of renewals) {
    const source = r.source || "direct";
    const row = rows.get(source) ?? { source, cents: 0, sales: 0, renewalCents: 0, renewals: 0 };
    row.renewalCents += r.cents;
    row.renewals += r.payments;
    rows.set(source, row);
  }
  return [...rows.values()].sort(
    (a, b) => b.cents + b.renewalCents - (a.cents + a.renewalCents) || a.source.localeCompare(b.source),
  );
}

/** Visits and sales put together, the shape the studio's panel draws. */
/** Products listed in the numbers when none has any activity yet: the first ones in the store's order. */
const QUIET_PRODUCTS = 50;

/**
 * Which products the numbers are about: every product anybody started a
 * checkout for or bought in any window, and while there is none, the first
 * QUIET_PRODUCTS of the store. Read with readListings and handed to studioStats.
 */
export function productsInStats(store: Store, stats: Stats, sales: SalesStats | null): string[] {
  const active = new Set<string>();
  for (const window of [...Object.values(stats.windows), ...(stats.life ? [stats.life] : [])]) {
    for (const [id, count] of Object.entries(window.checkoutsByProduct)) if (count > 0) active.add(id);
  }
  for (const id of Object.keys(sales?.byProduct ?? {})) active.add(id);
  const ids = productIds(store);
  const named = ids.filter((id) => active.has(id));
  return named.length ? named : ids.slice(0, QUIET_PRODUCTS);
}

export function studioStats(
  store: Store,
  stats: Stats,
  sales: SalesStats | null,
  salesState: StatsData["sales"],
  /** The products to list (productsInStats), read by the caller; the store record's own when not given. */
  listings: Listing[] = recordListings(store),
): StatsData {
  const w: Record<RangeKey, WindowStats> = { ...stats.windows, all: stats.life ?? EMPTY_WINDOW };
  const days = stats.days.map((day) => ({ ...day, sales: sales?.byDay[day.date]?.sales ?? 0 }));
  const zero = { sales: 0, cents: 0 };
  const salesOf = (key: RangeKey) => (key === "all" ? zero : sales?.totals[key] ?? zero);
  const keys: RangeKey[] = ["d7", "d30", "d90", "all"];
  const per = <T,>(pick: (key: RangeKey) => T) => Object.fromEntries(keys.map((k) => [k, pick(k)])) as Record<RangeKey, T>;
  return {
    days,
    totals: per((k) => ({ visitors: w[k].visitors, views: w[k].views, checkouts: w[k].checkouts, ...salesOf(k) })),
    sources: per((k) => w[k].sources),
    mediums: per((k) => w[k].mediums),
    campaigns: per((k) => w[k].campaigns),
    products: listings.map((product) => ({
      id: product.id,
      title: product.title,
      ...per((k) => {
        const s = k === "all" ? zero : sales?.byProduct[product.id]?.[k] ?? zero;
        // Page views are kept by the day only (recordHit): no all-time figure, rather than a wrong one.
        return { views: k === "all" ? -1 : w[k].viewsByProduct[product.id] ?? 0, checkouts: w[k].checkoutsByProduct[product.id] ?? 0, sales: s.sales, cents: s.cents };
      }),
    })),
    links: store.links.filter((link) => !link.header).map((link) => ({ id: link.id, title: link.title, ...per((k) => w[k].linkClicks[link.id] ?? 0) })),
    sales: salesState,
    partial: sales?.partial ?? false,
    currency: store.currency,
    elsewhere: sales?.elsewhere ?? 0,
    since: stats.life?.since ?? "",
    revenueBySource: withRenewals(
      (sales?.bySource ?? []).filter((row) => row.currency === store.currency),
      sales?.renewals?.bySource ?? [],
    ),
    firstBySource: (sales?.firstBySource ?? [])
      .filter((row) => row.currency === store.currency)
      .map(({ source, cents, sales: n }) => ({ source, cents, sales: n })),
    renewals: sales?.renewals ?? null,
  };
}

// ---- Files to take away -------------------------------------------------------

/**
 * One spreadsheet cell: quoted always, and a leading character a spreadsheet
 * would read as a formula defused, because a product name or a buyer's name
 * is text somebody else typed and must never run on the creator's computer.
 */
export function csvCell(value: string | number): string {
  const text = String(value);
  const safe = /^[=+\-@\t\r]/.test(text) ? `'${text}` : text;
  return `"${safe.replace(/"/g, '""')}"`;
}

export function csvRow(values: (string | number)[]): string {
  return values.map(csvCell).join(",");
}


/** The most pages of a hundred read for a sales file. */
export const EXPORT_PAGES = 50;

/**
 * The store's sales as CSV, newest first: every paid checkout and one-click
 * extra since `sinceSeconds` (0 for all), up to EXPORT_PAGES pages of each.
 */
export async function salesCsv(store: Store, sinceSeconds: number): Promise<{ csv: string; rows: number; partial: boolean }> {
  const { sales, partial } = await readPaidSales(store, sinceSeconds, EXPORT_PAGES);
  const find = listingFinder(store);
  const title = async (id: string, fallback: unknown) => (await find(id))?.title ?? (typeof fallback === "string" ? fallback : "");
  const lines = [
    csvRow(["paid_at_utc", "stripe_id", "product_id", "product", "price_option", "order_bump", "kind", "amount", "discount", "tax", "currency", "buyer_email", "buyer_name", "buyer_country"]),
  ];
  for (const sale of sales) {
    const row = sale.row;
    const meta = (row.metadata ?? {}) as Record<string, string>;
    const details = (row.customer_details ?? {}) as { email?: unknown; name?: unknown; address?: { country?: unknown } | null };
    const totals = (row.total_details ?? {}) as { amount_discount?: unknown; amount_tax?: unknown };
    const text = (v: unknown) => (typeof v === "string" ? v : "");
    const cents = (v: unknown) => (typeof v === "number" ? v : 0);
    const product = await find(sale.product);
    const option = product?.options.find((o) => o.id === meta.option)?.label ?? meta.option ?? "";
    const kind = sale.upsell
      ? "upsell"
      : meta.kind === "tip"
        ? "support"
      : meta.kind === "call"
        ? "call"
        : meta.kind === "plan"
          ? "payment_plan"
          : row.mode === "subscription"
            ? "membership"
            : "one_time";
    lines.push(
      csvRow([
        new Date(sale.created).toISOString().replace(/\.\d{3}Z$/, "Z"),
        text(row.id),
        sale.product,
        await title(sale.product, meta.title),
        option,
        (await Promise.all(bumpsFromMeta(meta).map((added) => title(added.id, "")))).filter(Boolean).join(" + "),
        kind,
        plainAmount(sale.cents, sale.currency),
        plainAmount(cents(totals.amount_discount), sale.currency),
        plainAmount(cents(totals.amount_tax), sale.currency),
        sale.currency.toUpperCase(),
        text(details.email) || text(row.customer_email) || text(row.receipt_email),
        text(details.name),
        text(details.address?.country),
      ]),
    );
  }
  return { csv: `${lines.join("\r\n")}\r\n`, rows: sales.length, partial };
}

/** Every kept day of visits as CSV, newest first. */
export async function visitsCsv(store: Store, now = Date.now()): Promise<string> {
  const lines = [csvRow(["date_utc", "visitors", "page_views", "checkouts_started", "link_opens", "top_source"])];
  if (!store.statsId || !isRedisConfigured()) return `${lines.join("\r\n")}\r\n`;
  const statsId = store.statsId;
  const created = /^\d{4}-\d{2}-\d{2}/.test(store.createdAt) ? store.createdAt.slice(0, 10) : "";
  const dates = lastDays(now, KEPT_DAYS).filter((d) => !created || d >= created);
  const replies = await redisPipeline([
    ...dates.map((d) => ["HGETALL", countsKey(statsId, d)]),
    ...dates.map((d) => ["PFCOUNT", visitorsKey(statsId, d)]),
  ]);
  for (let i = dates.length - 1; i >= 0; i -= 1) {
    let views = 0;
    let checkouts = 0;
    let links = 0;
    let top = ["", 0] as [string, number];
    for (const [field, count] of pairs(replies[i])) {
      if (field === "v") views = count;
      else if (field === "c") checkouts = count;
      else if (field.startsWith("l:")) links += count;
      else if (field.startsWith("r:") && count > top[1]) top = [field.slice(2), count];
    }
    lines.push(csvRow([dates[i], Number(replies[dates.length + i]) || 0, views, checkouts, links, top[0]]));
  }
  return `${lines.join("\r\n")}\r\n`;
}

/** Where visits came from, by source, medium and campaign, for each window, as CSV. */
export function sourcesCsv(data: StatsData): string {
  const lines = [csvRow(["kind", "name", "visits_7_days", "visits_30_days", "visits_90_days", "visits_all_time"])];
  for (const [kind, table] of [["source", data.sources], ["medium", data.mediums], ["campaign", data.campaigns]] as const) {
    const names = new Set<string>();
    for (const key of ["d7", "d30", "d90", "all"] as const) for (const row of table[key]) names.add(row.name);
    const count = (key: RangeKey, name: string) => table[key].find((row) => row.name === name)?.visits ?? 0;
    for (const name of [...names].sort((a, b) => count("all", b) - count("all", a) || count("d90", b) - count("d90", a))) {
      lines.push(csvRow([kind, name, count("d7", name), count("d30", name), count("d90", name), count("all", name)]));
    }
  }
  return `${lines.join("\r\n")}\r\n`;
}
