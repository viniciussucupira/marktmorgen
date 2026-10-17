/**
 * The tax records a closed store leaves (added 18 October 2026).
 *
 * When a store closes (lib/plan-closing.ts), everything it keeps in the
 * database is deleted (lib/closed-store-data.ts). What the law may ask us to
 * keep is kept here instead, compressed, in the file store the store's files
 * were in (Cloudflare R2), under a prefix no store's folder is in, and for a
 * set time: the store's sales of the last CLOSING_RECORD_YEARS full years and
 * of the year it closed, each month's deleted on January 1 of the year after
 * the last that may need it (lib/plan-closing-rules.ts, recordDeleteYear).
 * That reading keeps more than the others; it is question 13 of
 * docs/tax-uncertainty.md, for an accountant.
 *
 * What a record holds, and nothing else:
 *
 *   - the store: its ids, addresses and name, its owner's sign-in address
 *     (the customer our own invoices are to), its Stripe account's id, its
 *     plan and the day it ended and closed;
 *   - each month, each sale made through it as its Stripe account or PayPal
 *     says: when, the payment's references, the product, the amount and
 *     currency, the tax and discount Stripe counted, the buyer's country.
 *     Never a buyer's address, name or anything else about them.
 *
 * The sales are the creator's own records, on their own Stripe account; ours
 * are the subscription and the share of each sale, on our own. This copy is
 * what we keep of the store's side so that nothing a tax question could need
 * is lost when the database forgets the store.
 *
 *   records/closed-stores/<year>/<folder>/<YYYY-MM>.json.gz   a month's sales
 *   records/closed-stores/<year>/<folder>/store.json.gz       the store
 *
 * Its size has a ceiling set in code, not watched: a month holds at most
 * ARCHIVE_LINES_PER_MONTH of the plan's sales, each line at most LINE_BYTES
 * before it is compressed, so a store's records are at most archiveMaxBytes;
 * a month with more than that (a store's Stripe account cannot take more
 * orders through the store than its plan admits) says it is partial, and the
 * whole of it stays on the creator's Stripe account. And a set life, by the
 * year in the path, which the daily job deletes (expireRecords).
 *
 * The months are read a part a day from the first notice on
 * (advanceArchive), so a store with years of sales is written by its closing
 * day; the months since its plan ended are read again on that day.
 */
import { createHash } from "node:crypto";
import { gunzipSync, gzipSync } from "node:zlib";
import type { Tier } from "@/lib/plan";
import { ORDERS_INCLUDED } from "@/lib/order-rules";
import { CLOSING_RECORD_YEARS, firstKeptYear, recordDeleteYear } from "@/lib/plan-closing-rules";
import { readPayPalBetween } from "@/lib/paypal-sales";
import { onAccount } from "@/lib/stripe-account";
import { type Store, saleHandles, storeRef } from "@/lib/store";
import { deleteRecords, listVault, readRecord, vaultConfig, writeRecord } from "@/lib/vault";
import { RECORDS_PREFIX, readRecordPath, recordPath } from "@/lib/vault-rules";

export { CLOSING_RECORD_YEARS };

/**
 * The most sales one month of a store's records holds: twice what its plan
 * admits in a billing month, since a calendar month touches two of them
 * (lib/order-admission.ts admits no order past the figure).
 */
export const ARCHIVE_LINES_PER_MONTH: Record<Tier, number> = {
  creator: 2 * ORDERS_INCLUDED.creator,
  pro: 2 * ORDERS_INCLUDED.pro,
  scale: 2 * ORDERS_INCLUDED.scale,
};
/** The most one sale's line weighs before it is compressed: ids are cut to their longest shape, and a line past it loses its optional parts. */
export const LINE_BYTES = 320;
/** What the store's own record weighs at the most, before it is compressed. */
export const STORE_RECORD_BYTES = 8 * 1024;
/** Months a closed store's records can span: the kept years and the year it closed. */
export const ARCHIVE_MONTHS = (CLOSING_RECORD_YEARS + 1) * 12;
/** Pages of a hundred read of each kind of sale for one month. */
export const pagesPerMonth = (tier: Tier): number => Math.ceil(ARCHIVE_LINES_PER_MONTH[tier] / 100) + 1;

/** The most a closed store's records weigh, before they are compressed: a byte limit no store can pass. */
export function archiveMaxBytes(tier: Tier): number {
  return ARCHIVE_MONTHS * (ARCHIVE_LINES_PER_MONTH[tier] * LINE_BYTES + 1024) + STORE_RECORD_BYTES;
}

/**
 * What a closed store's records cost to keep for their whole life, in
 * byte-months, before they are compressed: the sales of year Y (at most
 * twelve months of lines) are kept to January 1 of Y + 8, so the year it
 * closed is kept eight years at the most, the year before seven, and so on.
 */
export function archiveByteMonths(tier: Tier): number {
  const year = 12 * (ARCHIVE_LINES_PER_MONTH[tier] * LINE_BYTES + 1024);
  let total = 0;
  for (let back = 0; back <= CLOSING_RECORD_YEARS; back += 1) total += year * (CLOSING_RECORD_YEARS + 1 - back) * 12;
  return total + STORE_RECORD_BYTES * (CLOSING_RECORD_YEARS + 1) * 12;
}

/** One sale, as the records keep it: references, amounts and the buyer's country, never the buyer. */
export type SaleLine = {
  /** When it was paid, in seconds. */
  t: number;
  /** A checkout, an offer taken in one click after one, or a PayPal order. */
  k: "c" | "u" | "p";
  /** The checkout, payment or PayPal order. */
  id: string;
  pi?: string;
  sub?: string;
  /** The product, the amount in the currency's smallest unit, and the currency. */
  p: string;
  a: number;
  c: string;
  tax?: number;
  off?: number;
  co?: string;
  /** A gift's or a purchase for several people's id, which the store's own records of it were kept under. */
  g?: string;
  gr?: string;
};

export type MonthRecord = { v: 1; month: string; lines: SaleLine[]; partial: boolean };
export type StoreRecord = {
  v: 1;
  closedAt: number;
  store: {
    sid: string;
    statsId: string | null;
    handle: string;
    handles: string[];
    name: string;
    owner: string;
    createdAt: string;
    stripeAccount: string | null;
    paypal: boolean;
    tier: Tier;
    cycle: string;
    customer: string | null;
    subscription: string | null;
    planEndedAt: string;
  };
  months: number;
  lines: number;
  notes: string[];
};

/** Where a closed store's records are kept: the same file store as its files, under RECORDS_PREFIX. Each throws nothing. */
export type RecordHands = {
  ready: () => boolean;
  put: (pathname: string, bytes: Uint8Array) => Promise<boolean>;
  get: (pathname: string, limit: number) => Promise<Uint8Array | null>;
  list: (prefix: string, cursor?: string) => Promise<{ files: { pathname: string; bytes: number }[]; cursor: string | null } | null>;
  remove: (pathnames: string[]) => Promise<boolean>;
};

export const R2_RECORDS: RecordHands = {
  ready: () => vaultConfig() !== null,
  put: writeRecord,
  get: readRecord,
  list: listVault,
  remove: deleteRecords,
};

/** A store's folder of records: a one-way name, so a path says nothing about whose it is. */
export function recordFolder(store: Pick<Store, "email" | "sid" | "extra">): string {
  return createHash("sha256").update(`nimbus-closed-records:${storeRef(store)}|${store.sid}`).digest("hex").slice(0, 32);
}

const monthOf = (ms: number) => new Date(ms).toISOString().slice(0, 7);
const startOf = (month: string) => Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 1, 1);
export const nextMonth = (month: string) => monthOf(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)), 1));
export const previousMonth = (month: string) => monthOf(Date.UTC(Number(month.slice(0, 4)), Number(month.slice(5, 7)) - 2, 1));

const str = (value: unknown, max: number) => (typeof value === "string" && value && value.length <= max && /^[\w:.-]+$/.test(value) ? value : undefined);
const num = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? Math.round(value) : undefined);

/** A line no longer than LINE_BYTES: past it, the optional parts go first. */
export function fitLine(line: SaleLine): SaleLine {
  if (JSON.stringify(line).length <= LINE_BYTES) return line;
  const bare: SaleLine = { t: line.t, k: line.k, id: line.id.slice(0, 80), p: line.p.slice(0, 40), a: line.a, c: line.c.slice(0, 3) };
  return bare;
}

export type Reading = { lines: SaleLine[]; partial: boolean };

/** One month's sales of a store, from its Stripe account and its PayPal records. Throws when Stripe could not be read. */
export async function readMonth(store: Store, month: string, tier: Tier): Promise<Reading> {
  const since = Math.floor(startOf(month) / 1000);
  const until = Math.floor(startOf(nextMonth(month)) / 1000);
  const cap = ARCHIVE_LINES_PER_MONTH[tier];
  const pages = pagesPerMonth(tier);
  const handles = saleHandles(store);
  const lines: SaleLine[] = [];
  let partial = false;

  const paypal = await readPayPalBetween(store.statsId, since, until, cap);
  if (paypal.partial) partial = true;
  for (const paid of paypal.sales) {
    lines.push(fitLine({ t: paid.at, k: "p", id: paid.order, p: str(paid.product, 40) ?? "", a: paid.cents, c: paid.currency.slice(0, 3).toLowerCase(), ...(paid.off ? { off: paid.off } : {}) }));
  }

  if (store.stripeAccountId) {
    const account = store.stripeAccountId;
    let after = "";
    for (let page = 0; page < pages; page += 1) {
      const list = (await onAccount("GET", account, `/checkout/sessions?limit=100&status=complete&created[gte]=${since}&created[lt]=${until}${after ? `&starting_after=${encodeURIComponent(after)}` : ""}`)) as { data?: unknown; has_more?: unknown };
      const rows = Array.isArray(list.data) ? (list.data as Record<string, unknown>[]) : [];
      for (const row of rows) {
        const meta = (row.metadata ?? {}) as Record<string, unknown>;
        if (!handles.has(String(meta.store ?? "")) || row.payment_status === "unpaid") continue;
        const details = (row.customer_details ?? {}) as { address?: { country?: unknown } | null };
        const totals = (row.total_details ?? {}) as { amount_tax?: unknown; amount_discount?: unknown };
        const country = details.address?.country;
        lines.push(fitLine({
          t: num(row.created) ?? since,
          k: "c",
          id: str(row.id, 80) ?? "",
          ...(str(row.payment_intent, 60) ? { pi: str(row.payment_intent, 60) } : {}),
          ...(str(row.subscription, 60) ? { sub: str(row.subscription, 60) } : {}),
          p: str(meta.product, 40) ?? "",
          a: num(row.amount_total) ?? 0,
          c: (str(row.currency, 3) ?? "usd").toLowerCase(),
          ...(num(totals.amount_tax) ? { tax: num(totals.amount_tax) } : {}),
          ...(num(totals.amount_discount) ? { off: num(totals.amount_discount) } : {}),
          ...(typeof country === "string" && /^[A-Z]{2}$/.test(country) ? { co: country } : {}),
          ...(str(meta.gift, 40) ? { g: str(meta.gift, 40) } : {}),
          ...(str(meta.group, 40) ? { gr: str(meta.group, 40) } : {}),
        }));
      }
      if (list.has_more !== true || !rows.length) break;
      if (page === pages - 1) partial = true;
      after = String(rows[rows.length - 1].id ?? "");
    }
    // Offers taken in one click after paying are payments of their own: one search for the month, the store's kept.
    let next = "";
    for (let page = 0; page < pages; page += 1) {
      const query = encodeURIComponent(`metadata['kind']:'upsell' AND status:'succeeded' AND created>=${since} AND created<${until}`);
      const found = (await onAccount("GET", account, `/payment_intents/search?limit=100&query=${query}${next ? `&page=${encodeURIComponent(next)}` : ""}`)) as { data?: unknown; has_more?: unknown; next_page?: unknown };
      const rows = Array.isArray(found.data) ? (found.data as Record<string, unknown>[]) : [];
      for (const pi of rows) {
        const meta = (pi.metadata ?? {}) as Record<string, unknown>;
        if (!handles.has(String(meta.store ?? ""))) continue;
        lines.push(fitLine({ t: num(pi.created) ?? since, k: "u", id: str(pi.id, 60) ?? "", pi: str(pi.id, 60), p: str(meta.product, 40) ?? "", a: num(pi.amount) ?? 0, c: (str(pi.currency, 3) ?? "usd").toLowerCase() }));
      }
      next = typeof found.next_page === "string" ? found.next_page : "";
      if (found.has_more !== true || !next) break;
      if (page === pages - 1) partial = true;
    }
  }
  lines.sort((a, b) => a.t - b.t || a.id.localeCompare(b.id));
  if (lines.length > cap) {
    lines.length = cap;
    partial = true;
  }
  return { lines, partial };
}

const pack = (value: unknown) => new Uint8Array(gzipSync(Buffer.from(JSON.stringify(value), "utf8")));
export const unpack = <T>(bytes: Uint8Array): T => JSON.parse(gunzipSync(Buffer.from(bytes)).toString("utf8")) as T;

/** Writes one month of a store's records, in place of what that month held. False when the file store did not take it. */
export async function writeMonth(store: Store, month: string, reading: Reading, hands: RecordHands = R2_RECORDS): Promise<boolean> {
  if (!reading.lines.length) return true;
  const record: MonthRecord = { v: 1, month, lines: reading.lines, partial: reading.partial };
  return hands.put(recordPath(recordDeleteYear(Number(month.slice(0, 4))), recordFolder(store), month), pack(record));
}

/** Writes the store's own record, kept as long as the last of its months. */
export async function writeStoreRecord(store: Store, closedAt: number, counts: { months: number; lines: number; notes: string[] }, hands: RecordHands = R2_RECORDS): Promise<boolean> {
  const record: StoreRecord = {
    v: 1,
    closedAt,
    store: {
      sid: store.sid,
      statsId: store.statsId ?? null,
      handle: store.handle,
      handles: [...saleHandles(store)].slice(0, 60),
      name: store.name.slice(0, 120),
      owner: store.email,
      createdAt: store.createdAt,
      stripeAccount: store.stripeAccountId,
      paypal: Boolean(store.paypalSeller),
      tier: store.tier,
      cycle: store.cycle,
      customer: store.stripeCustomerId,
      subscription: store.subscriptionId,
      planEndedAt: store.planEndedAt,
    },
    months: counts.months,
    lines: counts.lines,
    notes: counts.notes.slice(0, 20).map((n) => n.slice(0, 200)),
  };
  return hands.put(recordPath(recordDeleteYear(new Date(closedAt).getUTCFullYear()), recordFolder(store), "store"), pack(record));
}

/** A store's months kept, read back: for the closing step that finds what each sale left (lib/closed-store-data.ts). Months it cannot read are left out. */
export async function readMonths(store: Store, months: string[], hands: RecordHands = R2_RECORDS): Promise<SaleLine[]> {
  const out: SaleLine[] = [];
  for (const month of months) {
    const raw = await hands.get(recordPath(recordDeleteYear(Number(month.slice(0, 4))), recordFolder(store), month), 64 * 1024 * 1024).catch(() => null);
    if (!raw) continue;
    try {
      out.push(...unpack<MonthRecord>(raw).lines);
    } catch {
      // A record that cannot be read gives nothing to find.
    }
  }
  return out;
}

/** What an archive in progress has done, kept in the closing job's record of the store (lib/plan-closing.ts). */
export type ArchiveState = {
  /** The next earlier month to read; "" once every month before the plan ended is read. */
  next?: string;
  months?: number;
  lines?: number;
  /** Months whose sales were more than a month may hold, or that could not be read before the deletion. */
  notes?: string[];
  /** When the store's own record was written: the records are complete. */
  done?: number;
};

/** The first month whose sales are kept: January of the first kept year, or the month the store was made if later. */
export function firstMonth(store: Pick<Store, "createdAt">, closingMs: number): string {
  const floor = `${firstKeptYear(new Date(closingMs).getUTCFullYear())}-01`;
  const made = Number.isFinite(Date.parse(store.createdAt)) ? monthOf(Date.parse(store.createdAt)) : floor;
  return made > floor ? made : floor;
}

/**
 * Moves a store's records on, until `until` (ms): the months before its plan
 * ended, newest first, and, when `final`, the months since it ended and the
 * store's own record. Answers the new state, and whether something did not
 * answer (Stripe, the file store) and should be tried again later.
 */
export async function advanceArchive(
  store: Store,
  state: ArchiveState,
  opts: { endedAt: number; closingMs: number; now: number; final: boolean; until: number; hands?: RecordHands },
): Promise<{ state: ArchiveState; stuck: string | null }> {
  const hands = opts.hands ?? R2_RECORDS;
  const tier = store.tier;
  const next: ArchiveState = { months: 0, lines: 0, notes: [], ...state };
  if (!hands.ready()) return { state: next, stuck: "the file store is not set up" };
  const floor = firstMonth(store, opts.closingMs);
  const endedMonth = monthOf(opts.endedAt);
  if (next.next === undefined) next.next = previousMonth(endedMonth);
  const take = async (month: string): Promise<string | null> => {
    let reading: Reading;
    try {
      reading = await readMonth(store, month, tier);
    } catch (error) {
      console.error("reading a closing store's sales failed", error);
      return "Stripe could not be read";
    }
    if (!(await writeMonth(store, month, reading, hands))) return "the file store did not take a record";
    if (reading.lines.length) next.months = (next.months ?? 0) + 1;
    next.lines = (next.lines ?? 0) + reading.lines.length;
    if (reading.partial) next.notes = [...(next.notes ?? []), `${month}: more sales than a month holds; the rest are on the store's Stripe account`].slice(-10);
    return null;
  };
  while (next.next && next.next >= floor) {
    if (Date.now() > opts.until) return { state: next, stuck: null };
    const stuck = await take(next.next);
    if (stuck) return { state: next, stuck };
    next.next = previousMonth(next.next);
  }
  next.next = "";
  if (!opts.final) return { state: next, stuck: null };
  // The months since the plan ended, read on the day: a store with no plan may still have sold.
  for (let month = endedMonth < floor ? floor : endedMonth; month <= monthOf(opts.now); month = nextMonth(month)) {
    if (Date.now() > opts.until) return { state: next, stuck: null };
    const stuck = await take(month);
    if (stuck) return { state: next, stuck };
  }
  if (!(await writeStoreRecord(store, opts.now, { months: next.months ?? 0, lines: next.lines ?? 0, notes: next.notes ?? [] }, hands))) {
    return { state: next, stuck: "the file store did not take the store's record" };
  }
  return { state: { ...next, done: opts.now }, stuck: null };
}

/** The months whose sales may have left records in the database: the last fifteen up to `now`. */
export function recentMonths(now: number): string[] {
  const out: string[] = [];
  for (let month = monthOf(now), i = 0; i < 15; month = previousMonth(month), i += 1) out.push(month);
  return out;
}

/** Deletes every record of a store that did not close after all (its plan was started again). True when nothing of it is left. */
export async function dropRecords(store: Store, now: number, hands: RecordHands = R2_RECORDS): Promise<boolean> {
  if (!hands.ready()) return true;
  const folder = recordFolder(store);
  const year = new Date(now).getUTCFullYear();
  let all = true;
  for (let y = year; y <= recordDeleteYear(year); y += 1) {
    const listed = await hands.list(`${RECORDS_PREFIX}${y}/${folder}/`);
    if (!listed) {
      all = false;
      continue;
    }
    if (listed.files.length && !(await hands.remove(listed.files.map((f) => f.pathname)))) all = false;
  }
  return all;
}

/** The first year any record can be deleted: a store that closed in 2026 keeps its sales from 2019, deleted in 2027. */
export const FIRST_DELETE_YEAR = recordDeleteYear(firstKeptYear(2026));

/**
 * The daily deletion of records whose time is up: every record under a year
 * that has begun. Bounded by `until`; what is left is deleted the next day.
 */
export async function expireRecords(now: number, until: number, hands: RecordHands = R2_RECORDS): Promise<{ deleted: number; done: boolean }> {
  if (!hands.ready()) return { deleted: 0, done: true };
  let deleted = 0;
  for (let year = FIRST_DELETE_YEAR; year <= new Date(now).getUTCFullYear(); year += 1) {
    let cursor: string | undefined;
    for (let page = 0; page < 100; page += 1) {
      if (Date.now() > until) return { deleted, done: false };
      const listed = await hands.list(`${RECORDS_PREFIX}${year}/`, cursor);
      if (!listed) return { deleted, done: false };
      const paths = listed.files.map((f) => f.pathname).filter((p) => readRecordPath(p)?.year === year);
      if (paths.length) {
        if (!(await hands.remove(paths))) return { deleted, done: false };
        deleted += paths.length;
      }
      if (!listed.cursor) break;
      cursor = listed.cursor;
    }
  }
  return { deleted, done: true };
}
