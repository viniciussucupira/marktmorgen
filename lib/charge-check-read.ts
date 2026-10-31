/**
 * 569 [NC1], unit 5 (second part): reading the paid invoices of the last 48
 * hours from Marktmorgen's own Stripe account, whole, for the daily charge
 * check (lib/charge-check.ts decides each one).
 *
 * Read from Stripe's pages on 30–31 Oct 2026 ("List all invoices": newest
 * first, `status=paid`, `created[gte]`, `limit` 1 to 100, `starting_after`,
 * the page's example sending `Stripe-Version: 2026-10-28.endive`; "The Invoice
 * object": `lines` is a list with `has_more` and its own `url`,
 * `/v1/invoices/<id>/lines`). See docs/billing-correctness.md, "Design of
 * units 5 and 6".
 *
 * Rules this file keeps:
 * - One fixed API version, CHARGE_CHECK_VERSION: the fields the decision
 *   reads moved in 2025, so nothing here reads the account's default shape.
 * - An invoice is handed on only when it was read WHOLE: every line, every
 *   page of lines. One whose lines could not be read is "unread", never
 *   handed on as if it had fewer lines, and never blocks the others.
 * - Bounded: a time budget (`until`, checked before every call), a cap on
 *   list pages and on line pages per invoice. Where it stopped is a cursor
 *   (the window it was reading and the last invoice id), so the next run
 *   carries on in the same window instead of starting over.
 * - A list page Stripe did not answer, or answered in a shape this file does
 *   not know, stops the run with the cursor unchanged: nothing is guessed.
 *
 * It calls only the `get` it is handed, so it is tested against a fake
 * Stripe; `platformGet` is the real one. Nothing runs it yet: the cron and
 * the records it decides against come with the next units.
 */
import { onPlatformAt } from "@/lib/billing";

export const CHARGE_CHECK_VERSION = "2026-10-28.endive";

/** How far back each run looks: the item's 48 hours. */
export const WINDOW_SECONDS = 48 * 60 * 60;
/** A cursor older than this belongs to a window long gone: start a new one. */
export const CURSOR_MAX_AGE_SECONDS = 24 * 60 * 60;
/** Invoices per list page (Stripe's maximum). */
export const PAGE_LIMIT = 100;
/** List pages per run. */
export const MAX_LIST_PAGES = 20;
/** Line pages per invoice (100 lines each) before it is set aside as unread. */
export const MAX_LINE_PAGES = 5;

export type ChargeReadCursor = {
  /** `created[gte]` of the window being read, in seconds. */
  windowStart: number;
  /** The last invoice id read in that window. */
  after: string;
};

export type ChargeReadResult = {
  /** Paid invoices read whole, with every line in `lines.data`. */
  invoices: Record<string, unknown>[];
  /** Paid invoices that could not be read whole, to be tried on a later run. */
  unread: { id: string; reason: string }[];
  /** Where to carry on next run; null when the window was read to its end. */
  cursor: ChargeReadCursor | null;
  stopped: "done" | "budget" | "page_cap" | "list_error";
  /** Requests made, for the run's own cap and report. */
  calls: number;
};

export type StripeGet = (path: string) => Promise<Record<string, unknown>>;

/** The real reader: our own account, at the pinned version. */
export const platformGet: StripeGet = (path) => onPlatformAt(CHARGE_CHECK_VERSION, "GET", path);

function record(value: unknown): Record<string, unknown> | null {
  return value && typeof value === "object" && !Array.isArray(value) ? (value as Record<string, unknown>) : null;
}

const INVOICE_ID = /^in_[A-Za-z0-9]+$/;

/** A Stripe list as the pages describe it, or null. */
function list(value: unknown): { data: unknown[]; hasMore: boolean } | null {
  const v = record(value);
  if (!v || v.object !== "list" || !Array.isArray(v.data) || typeof v.has_more !== "boolean") return null;
  return { data: v.data, hasMore: v.has_more };
}

function lineId(line: unknown): string | null {
  const id = record(line)?.id;
  return typeof id === "string" && id.length > 0 ? id : null;
}

/**
 * Every line of one invoice, or the reason it could not be read whole.
 * The lines already in the invoice are the first page.
 */
async function wholeLines(
  invoice: Record<string, unknown>,
  id: string,
  get: StripeGet,
  hasTime: () => boolean,
  count: () => void,
): Promise<{ lines: unknown[] } | { reason: string }> {
  const first = list(invoice.lines);
  if (!first) return { reason: "lines_unreadable" };
  const lines = [...first.data];
  if (!first.hasMore) return { lines };
  const url = record(invoice.lines)?.url;
  if (url !== `/v1/invoices/${id}/lines`) return { reason: "lines_url_unexpected" };
  let more = true;
  for (let page = 0; more; page++) {
    if (page >= MAX_LINE_PAGES) return { reason: "too_many_lines" };
    if (!hasTime()) return { reason: "budget" };
    const last = lineId(lines[lines.length - 1]);
    if (!last) return { reason: "line_without_id" };
    let next: { data: unknown[]; hasMore: boolean } | null;
    try {
      count();
      next = list(await get(`/invoices/${id}/lines?${new URLSearchParams({ limit: String(PAGE_LIMIT), starting_after: last })}`));
    } catch {
      return { reason: "lines_not_answered" };
    }
    if (!next) return { reason: "lines_unreadable" };
    if (next.hasMore && next.data.length === 0) return { reason: "lines_unreadable" };
    lines.push(...next.data);
    more = next.hasMore;
  }
  return { lines };
}

/**
 * Reads the paid invoices of the window, newest first, from where the last
 * run stopped. `now` in seconds; `until` is the time (ms, Date.now() scale)
 * after which no further request is started; `clock` defaults to Date.now.
 */
export async function readPaidInvoices(options: {
  get: StripeGet;
  now: number;
  until: number;
  cursor?: ChargeReadCursor | null;
  clock?: () => number;
}): Promise<ChargeReadResult> {
  const { get, now, until } = options;
  const clock = options.clock ?? Date.now;
  const resume =
    options.cursor &&
    Number.isSafeInteger(options.cursor.windowStart) &&
    INVOICE_ID.test(options.cursor.after) &&
    now - (options.cursor.windowStart + WINDOW_SECONDS) < CURSOR_MAX_AGE_SECONDS
      ? options.cursor
      : null;
  const windowStart = resume ? resume.windowStart : now - WINDOW_SECONDS;
  let after = resume ? resume.after : null;

  const out: ChargeReadResult = { invoices: [], unread: [], cursor: resume, stopped: "done", calls: 0 };
  const hasTime = () => clock() < until;
  const count = () => {
    out.calls += 1;
  };

  for (let page = 0; ; page++) {
    if (page >= MAX_LIST_PAGES) {
      out.stopped = "page_cap";
      return out;
    }
    if (!hasTime()) {
      out.stopped = "budget";
      return out;
    }
    const query = new URLSearchParams({ status: "paid", "created[gte]": String(windowStart), limit: String(PAGE_LIMIT) });
    if (after) query.set("starting_after", after);
    let got: { data: unknown[]; hasMore: boolean } | null;
    try {
      count();
      got = list(await get(`/invoices?${query}`));
    } catch {
      out.stopped = "list_error";
      return out;
    }
    if (!got || (got.hasMore && got.data.length === 0)) {
      out.stopped = "list_error";
      return out;
    }
    for (const item of got.data) {
      const invoice = record(item);
      const id = invoice?.id;
      if (!invoice || typeof id !== "string" || !INVOICE_ID.test(id)) {
        // An entry with no id cannot be resumed after or decided: the page is
        // not what the pages describe, so nothing on it is taken.
        out.stopped = "list_error";
        return out;
      }
      if (invoice.status !== "paid") {
        out.unread.push({ id, reason: "not_paid" });
      } else {
        const read = await wholeLines(invoice, id, get, hasTime, count);
        if ("reason" in read) {
          if (read.reason === "budget") {
            // Out of time on this invoice: carry on from just before it.
            out.stopped = "budget";
            return out;
          }
          out.unread.push({ id, reason: read.reason });
        } else {
          out.invoices.push({ ...invoice, lines: { ...record(invoice.lines), data: read.lines, has_more: false } });
        }
      }
      after = id;
      out.cursor = { windowStart, after };
    }
    if (!got.hasMore) {
      out.cursor = null;
      out.stopped = "done";
      return out;
    }
  }
}
