import { CHARGE_CHECK_VERSION, MAX_LINE_PAGES, MAX_LIST_PAGES, WINDOW_SECONDS, readPaidInvoices, type StripeGet } from "@/lib/charge-check-read";
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
      const after = params.get("starting_after");
      const from = after ? all.findIndex((i) => i.id === after) + 1 : 0;
      const data = all.slice(from, from + limit);
      return { object: "list", data, has_more: from + limit < all.length, url: "/v1/invoices" };
    }
    const m = /^\/invoices\/(in_\d+)\/lines$/.exec(p);
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
  is("a resumed run that fails keeps the old cursor", r2.cursor, cursor);
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

part("Cursor rules");
{
  const f = fake(5);
  const stale = { windowStart: now - WINDOW_SECONDS - 3 * 86400, after: "in_0002" };
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
