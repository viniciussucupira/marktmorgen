import { CHARGE_CHECK_VERSION, CURSOR_MAX_AGE_SECONDS, MAX_CALLS, MAX_LINE_PAGES, MAX_LIST_FAILURES, MAX_LIST_PAGES, WINDOW_SECONDS, readPaidInvoice, readPaidInvoices, type StripeGet } from "@/lib/charge-check-read";
import { done, is, part } from "./check";

const now = 1_790_000_000;

function line(n: number) {
  return { id: `il_${n}`, object: "line_item", amount: 100 };
}

function inv(n: number, over: Record<string, unknown> = {}, lines = [line(n)], linesHasMore = false) {
  const id = `in_${String(n).padStart(4, "0")}`;
  return {
    id,
    object: "invoice",
    status: "paid",
    created: now - n,
    lines: { object: "list", data: lines, has_more: linesHasMore, url: `/v1/invoices/${id}/lines` },
    ...over,
  };
}

/** A fake Stripe: `count` paid invoices newest first, pages as the list page says. */
function fake(
  count: number,
  opts: {
    lineFail?: Set<string>;
    listFailAt?: number;
    extraLines?: Record<string, number>;
    perInvoice?: (n: number) => Record<string, unknown>;
  } = {},
) {
  const all = Array.from({ length: count }, (_, i) => {
    const n = i + 1;
    const id = `in_${String(n).padStart(4, "0")}`;
    const extra = opts.extraLines?.[id] ?? 0;
    return inv(n, opts.perInvoice?.(n) ?? {}, [line(n)], extra > 0);
  });
  const calls: string[] = [];
  let listCalls = 0;
  const get: StripeGet = async (path) => {
    calls.push(path);
    const [p, q] = path.split("?");
    const params = new URLSearchParams(q);
    if (p === "/invoices") {
      listCalls += 1;
      if (opts.listFailAt === listCalls) throw new Error("500");
      if (params.get("status") !== "paid" || !params.get("created[gte]")) throw new Error("bad query");
      const limit = Number(params.get("limit"));
      const gte = Number(params.get("created[gte]"));
      const inWindow = all.filter((i) => i.created >= gte);
      const after = params.get("starting_after");
      const at = after ? inWindow.findIndex((i) => i.id === after) : -1;
      if (after && at < 0) throw new Error("404 no such invoice");
      const from = at + 1;
      const data = inWindow.slice(from, from + limit);
      return { object: "list", data, has_more: from + limit < inWindow.length, url: "/v1/invoices" };
    }
    const m = /^\/invoices\/(in_\d+)\/lines$/.exec(p);
    const one = /^\/invoices\/(in_\d+)$/.exec(p);
    if (one) {
      const found = all.find((i) => i.id === one[1]);
      if (!found || opts.lineFail?.has(one[1])) throw new Error("500");
      return found;
    }
    if (m) {
      const id = m[1];
      if (opts.lineFail?.has(id)) throw new Error("500");
      const total = opts.extraLines?.[id] ?? 0;
      const after = params.get("starting_after")!;
      const start = after.startsWith("il_x") ? Number(after.slice(4)) + 1 : 0;
      const limit = Number(params.get("limit"));
      const data = Array.from({ length: Math.max(0, Math.min(limit, total - start)) }, (_, k) => ({ id: `il_x${start + k}`, amount: 1 }));
      return { object: "list", data, has_more: start + limit < total, url: `/v1/invoices/${id}/lines` };
    }
    throw new Error(`unexpected ${path}`);
  };
  return { get, calls, all };
}

const far = Number.MAX_SAFE_INTEGER;

async function main(): Promise<void> {
part("Pinned version and query");
{
  is("the version is fixed", CHARGE_CHECK_VERSION, "2026-10-28.endive");
  const f = fake(3);
  const r = await readPaidInvoices({ get: f.get, now, until: far });
  const q = new URLSearchParams(f.calls[0].split("?")[1]);
  is("asks paid invoices only", q.get("status"), "paid");
  is("from 48 hours back", Number(q.get("created[gte]")), now - WINDOW_SECONDS);
  is("100 a page", q.get("limit"), "100");
  is("all three read whole", r.invoices.map((i) => i.id), ["in_0001", "in_0002", "in_0003"]);
  is("window read to its end: no cursor", r.cursor, null);
  is("stopped done", r.stopped, "done");
}

part("More than 50 pages: page cap and cursor, then carried on");
{
  const f = fake(MAX_LIST_PAGES * 100 + 5_000);
  const first = await readPaidInvoices({ get: f.get, now, until: far });
  is("stops at the page cap", first.stopped, "page_cap");
  is("read exactly cap × 100", first.invoices.length, MAX_LIST_PAGES * 100);
  is("cursor at the last one read", first.cursor?.after, f.all[MAX_LIST_PAGES * 100 - 1].id);
  let cursor = first.cursor;
  let seen = first.invoices.length;
  let runs = 1;
  while (cursor && runs < 10) {
    const r = await readPaidInvoices({ get: f.get, now: now + 3600, until: far, cursor });
    is(`run ${runs + 1} keeps the same window`, new URLSearchParams(f.calls[f.calls.length - 1].split("?")[1]).get("created[gte]"), String(now - WINDOW_SECONDS));
    seen += r.invoices.length;
    cursor = r.cursor;
    runs += 1;
  }
  is("every invoice read once across runs", seen, f.all.length);
}

part("Time budget: no request after `until`, cursor before the unfinished one");
{
  const f = fake(250, { extraLines: { in_0150: 300 } });
  let t = 0;
  // Each call takes one tick; the budget allows 2 list pages and a line page.
  const clock = () => t++;
  const r = await readPaidInvoices({ get: f.get, now, until: 3, clock });
  is("stopped on the budget", r.stopped, "budget");
  is("cursor just before the invoice whose lines ran out of time", r.cursor?.after, "in_0149");
  is("that invoice is not handed on", r.invoices.some((i) => i.id === "in_0150"), false);
  is("nor marked unread", r.unread.some((i) => i.id === "in_0150"), false);
}

part("Lines over several pages are read whole");
{
  const f = fake(2, { extraLines: { in_0002: 250 } });
  const r = await readPaidInvoices({ get: f.get, now, until: far });
  const two = r.invoices.find((i) => i.id === "in_0002") as { lines: { data: unknown[]; has_more: boolean } };
  is("1 + 250 lines", two.lines.data.length, 251);
  is("handed on as complete", two.lines.has_more, false);
}

part("Too many lines: set aside, the rest read");
{
  const f = fake(3, { extraLines: { in_0002: MAX_LINE_PAGES * 100 + 1 } });
  const r = await readPaidInvoices({ get: f.get, now, until: far });
  is("unread with its reason", r.unread, [{ id: "in_0002", reason: "too_many_lines" }]);
  is("the other two read", r.invoices.map((i) => i.id), ["in_0001", "in_0003"]);
}

part("A permanent 500 on one invoice's lines never blocks the rest");
{
  const f = fake(4, { lineFail: new Set(["in_0002"]), extraLines: { in_0002: 10 } });
  const r = await readPaidInvoices({ get: f.get, now, until: far });
  is("unread, not shortened", r.unread, [{ id: "in_0002", reason: "lines_not_answered" }]);
  is("not handed on with only its first lines", r.invoices.some((i) => i.id === "in_0002"), false);
  is("the others read", r.invoices.length, 3);
  is("done", r.stopped, "done");
}

part("A list page not answered stops with the cursor unchanged");
{
  const f = fake(150, { listFailAt: 2 });
  const r = await readPaidInvoices({ get: f.get, now, until: far });
  is("stopped list_error", r.stopped, "list_error");
  is("cursor after the 100 read", r.cursor?.after, "in_0100");
  const f2 = fake(10, { listFailAt: 1 });
  const cursor = { windowStart: now - WINDOW_SECONDS, after: "in_0003" };
  const r2 = await readPaidInvoices({ get: f2.get, now, until: far, cursor });
  is("a resumed run that fails keeps its place and counts the failure", r2.cursor, { ...cursor, failures: 1 });
  let c: typeof r2.cursor = r2.cursor;
  let last = r2;
  for (let i = 0; i < MAX_LIST_FAILURES; i++) {
    const fail = fake(10, { listFailAt: 1 });
    last = await readPaidInvoices({ get: fail.get, now: now + 86400 * (i + 1), until: far, cursor: c });
    c = last.cursor;
  }
  is("after the cap of failures in a row the window is abandoned and reported", last.abandoned?.why, "list_failing");
  const fresh = fake(10);
  const r3 = await readPaidInvoices({ get: fresh.get, now: now + 86400 * 4, until: far, cursor: { ...cursor, failures: MAX_LIST_FAILURES } });
  is("and a fresh window is read instead of the failing page", r3.stopped, "done");
}

part("Shapes this file does not know are never taken");
{
  const bad: StripeGet = async () => ({ data: [inv(1)], has_more: false });
  is("a list without object: list", (await readPaidInvoices({ get: bad, now, until: far })).stopped, "list_error");
  const noId: StripeGet = async () => ({ object: "list", data: [{ status: "paid" }], has_more: false });
  const r = await readPaidInvoices({ get: noId, now, until: far });
  is("an entry with no id stops the run", r.stopped, "list_error");
  is("and nothing is handed on", r.invoices.length, 0);
  const emptyMore: StripeGet = async () => ({ object: "list", data: [], has_more: true });
  is("has_more with no data is not looped on", (await readPaidInvoices({ get: emptyMore, now, until: far })).stopped, "list_error");
  const notPaid: StripeGet = async () => ({ object: "list", data: [inv(1, { status: "open" })], has_more: false });
  is("a non-paid entry is not decided", (await readPaidInvoices({ get: notPaid, now, until: far })).unread, [{ id: "in_0001", reason: "not_paid" }]);
  const odd: StripeGet = async () => ({ object: "list", data: [inv(1, { lines: { object: "list", data: [line(1)], has_more: true, url: "/v1/invoices/in_9999/lines" } })], has_more: false });
  is("lines url for another invoice is not followed", (await readPaidInvoices({ get: odd, now, until: far })).unread, [{ id: "in_0001", reason: "lines_url_unexpected" }]);
  const noLines: StripeGet = async () => ({ object: "list", data: [inv(1, { lines: null })], has_more: false });
  is("no lines list: unread", (await readPaidInvoices({ get: noLines, now, until: far })).unread, [{ id: "in_0001", reason: "lines_unreadable" }]);
}

part("A daily cron resumes the same window, and new charges reach the next one");
{
  const f = fake(MAX_LIST_PAGES * 100 + 500);
  const r1 = await readPaidInvoices({ get: f.get, now, until: far });
  const r2 = await readPaidInvoices({ get: f.get, now: now + 86400, until: far, cursor: r1.cursor });
  is("resumed a day later, not dropped", r2.abandoned, null);
  const ids = [...r1.invoices, ...r2.invoices].map((i) => i.id as string);
  is("every invoice exactly once", new Set(ids).size === ids.length && ids.length === f.all.length, true);
  // A charge made after the window began sits above the cursor: the next
  // fresh window reads it.
  f.all.unshift(inv(0, { created: now + 3600, id: "in_9000" }) as (typeof f.all)[number]);
  const r3 = await readPaidInvoices({ get: f.get, now: now + 86400 * 2, until: far, cursor: r2.cursor });
  is("the next fresh window reads the newer charge", r3.invoices.some((i) => i.id === "in_9000"), true);
}

part("Too old a window is abandoned, said, and a fresh one read");
{
  const f = fake(5);
  const old = { windowStart: now - CURSOR_MAX_AGE_SECONDS, after: "in_0002" };
  const r = await readPaidInvoices({ get: f.get, now, until: far, cursor: old });
  is("reported", r.abandoned, { ...old, why: "too_old" });
  is("fresh window", new URLSearchParams(f.calls[0].split("?")[1]).get("starting_after"), null);
}

part("A cap on requests per run, whatever the clock");
{
  const many: Record<string, number> = {};
  for (let n = 1; n <= 200; n++) many[`in_${String(n).padStart(4, "0")}`] = 150;
  const f = fake(200, { extraLines: many });
  const r = await readPaidInvoices({ get: f.get, now, until: far });
  is("stopped on the call cap", r.stopped, "call_cap");
  is("never more than the cap", f.calls.length <= MAX_CALLS, true);
}

part("An unread invoice is read again by id");
{
  const f = fake(3, { extraLines: { in_0002: 120 } });
  const got = await readPaidInvoice({ get: f.get, id: "in_0002", until: far });
  is("read whole by id", (got?.lines as { data: unknown[] }).data.length, 121);
  const f2 = fake(3, { lineFail: new Set(["in_0002"]) });
  is("still failing: null, never decided", await readPaidInvoice({ get: f2.get, id: "in_0002", until: far }), null);
  is("a malformed id asks nothing", await readPaidInvoice({ get: f.get, id: "../x", until: far }), null);
}

part("Cursor rules");
{
  const f = fake(5);
  const stale = { windowStart: now - CURSOR_MAX_AGE_SECONDS - 1, after: "in_0002" };
  await readPaidInvoices({ get: f.get, now, until: far, cursor: stale });
  is("a stale cursor starts a fresh window", new URLSearchParams(f.calls[0].split("?")[1]).get("starting_after"), null);
  const f2 = fake(5);
  await readPaidInvoices({ get: f2.get, now, until: far, cursor: { windowStart: now - WINDOW_SECONDS, after: "bogus" } });
  is("a malformed cursor is not sent to Stripe", new URLSearchParams(f2.calls[0].split("?")[1]).get("starting_after"), null);
  const f3 = fake(5);
  const r = await readPaidInvoices({ get: f3.get, now, until: far, cursor: { windowStart: now - WINDOW_SECONDS, after: "in_0002" } });
  is("a good cursor carries on after its invoice", r.invoices.map((i) => i.id), ["in_0003", "in_0004", "in_0005"]);
  is("calls counted", r.calls, 1);
}

done();
}

void main();
