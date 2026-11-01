/**
 * A funnel's results (525 [FN1], unit 1, lib/funnel-results-rules.ts; added
 * 1 November 2026). Checked: the summary from its steps; refunds apart and
 * taken off; average order and revenue per visit, never a division by
 * nothing; an unknown count unknown everywhere it is needed, said as
 * "Unavailable", never 0; the period as whole days in the creator's zone,
 * across a change of clocks; a range that is not a real period refused.
 */
import { SUMMARY_NOTES, countWords, funnelSummary, moneyWords, periodBounds } from "@/lib/funnel-results-rules";
import { done, is, part } from "./check";

part("The summary");
const steps = [
  { visits: 1000, signups: 40, sales: 0, revenue: 0 },
  { visits: 300, signups: 0, sales: 20, revenue: 98_000 },
  { visits: 20, signups: 0, sales: 5, revenue: 9_500 },
];
const s = funnelSummary(steps, 4_900, 4_900);
is("visits are the first step's; sign-ups, sales and revenue add up", [s.visits, s.signups, s.sales, s.oneTime], [1000, 40, 25, 107_500]);
is("refunds apart, and taken off: net is one-time plus recurring less refunds", [s.recurring, s.refunded, s.net], [4_900, 4_900, 107_500]);
is("average order: one-time over sales; per visit: net over the first step's visits", [s.averageOrder, s.perVisit], [4_300, 108]);
is("no sales: no average, never a division by nothing", funnelSummary([{ visits: 10, signups: 1, sales: 0, revenue: 0 }], 0, 0).averageOrder, null);
is("no visits: no revenue per visit", funnelSummary([{ visits: 0, signups: 0, sales: 0, revenue: 0 }], 0, 0).perVisit, null);

part("Unknown stays unknown");
const gap = funnelSummary([{ visits: 1000, signups: 40, sales: null, revenue: 98_000 }, steps[1]], 0, 0);
is("one step's sales unread: the sales and the average are unknown, the rest still counts", [gap.sales, gap.averageOrder, gap.oneTime, gap.visits], [null, null, 196_000, 1000]);
is("refunds unread: net and per visit unknown", [funnelSummary(steps, 0, null).net, funnelSummary(steps, 0, null).perVisit], [null, null]);
is("said as Unavailable, never 0", [moneyWords(null, "usd"), countWords(null), moneyWords(0, "usd"), countWords(0)], ["Unavailable", "Unavailable", "$0", "0"]);
is("a negative or broken count is unknown", funnelSummary([{ visits: -1, signups: 1.5, sales: 2, revenue: 100 }], 0, 0).visits, null);
is("every figure says how it is counted", Object.values(SUMMARY_NOTES).every((n) => n.length > 15), true);

part("The period, in the creator's own days");
const now = Date.UTC(2026, 10, 1, 15); // 1 Nov 2026, 12:00 in Fortaleza (UTC-3)
is("today in Fortaleza: from 03:00 UTC to 03:00 UTC the next day", periodBounds({ kind: "today" }, "America/Fortaleza", now), { from: Date.UTC(2026, 10, 1, 3), to: Date.UTC(2026, 10, 2, 3) });
is("7 days: six whole days before today, and today", periodBounds({ kind: "7" }, "America/Fortaleza", now)?.from, Date.UTC(2026, 9, 26, 3));
is("across a change of clocks (New York, 1 November 2026): the day is 25 hours", (() => { const b = periodBounds({ kind: "today" }, "America/New_York", Date.UTC(2026, 10, 1, 17))!; return [b.from, (b.to - b.from) / 3_600_000]; })(), [Date.UTC(2026, 10, 1, 4), 25]);
is("a range of the creator's choosing", periodBounds({ kind: "range", from: "2026-10-01", to: "2026-10-31" }, "UTC", now), { from: Date.UTC(2026, 9, 1), to: Date.UTC(2026, 10, 1) });
is("not real periods: refused", [
  periodBounds({ kind: "range", from: "2026-02-30", to: "2026-03-01" }, "UTC", now),
  periodBounds({ kind: "range", from: "2026-10-10", to: "2026-10-01" }, "UTC", now),
  periodBounds({ kind: "range", from: "2026-10-01", to: "2026-12-01" }, "UTC", now),
  periodBounds({ kind: "range", from: "2025-01-01", to: "2026-10-01" }, "UTC", now),
  periodBounds({ kind: "today" }, "Mars/Olympus", now),
], [null, null, null, null, null]);
done();
