/**
 * "Worth knowing", with the step each sentence points at and the arithmetic
 * of the money at stake (lib/insights.ts; added 12 October 2026). Checked:
 *
 *   - a product opened and not bought opens its page with a headline test;
 *     its money is the store's own rate times its views, said as arithmetic;
 *   - unpaid checkouts turn on the reminders when they are off, and open the
 *     store as a buyer when they are on, with what was left unpaid;
 *   - fewer visitors buying shows where they stop, with the sales the rate
 *     before would have made from the same visitors;
 *   - fewer visitors opens the composer for the list;
 *   - a step this person may not take is not offered: the numbers instead.
 */
import { type InsightContext, insightsFrom } from "@/lib/insights";
import type { StatsData } from "@/lib/stats";
import { done, is, part } from "./check";

const row = (views: number, checkouts: number, sales: number, cents: number) => ({ views, checkouts, sales, cents });
const zero = row(0, 0, 0, 0);
const data = {
  currency: "usd",
  sales: "ok",
  days: [],
  totals: { d7: { visitors: 400, views: 900, checkouts: 30, sales: 4, cents: 20000 }, d30: zero, d90: zero, all: zero },
  previous: { d7: { visitors: 300, views: 600, checkouts: 20, sales: 9, cents: 45000 }, d30: null, d90: null },
  channels: { d7: [], d30: [], d90: [] },
  products: [
    { id: "pbread0001", title: "Bread School", d7: row(300, 20, 4, 20000), d30: zero, d90: zero, all: zero },
    { id: "pknife0001", title: "Knife Skills", d7: row(100, 2, 0, 0), d30: zero, d90: zero, all: zero },
  ],
  reach: { d7: { visitors: 0, rows: [] } },
} as unknown as StatsData;
const owner: InsightContext = { storeUrl: "https://marktmorgen.com/@bakery", reminders: false, may: { settings: true, page: true, draft: true }, pages: ["pknife0001"] };
const said = (context = owner, d = data) => insightsFrom(d, "d7", [], 10, context);
const find = (list: ReturnType<typeof said>, start: string) => list.find((i) => i.text.startsWith(start));

part("A product opened and not bought");
const unsold = find(said(), "“Knife Skills” was opened 100 times");
is("opens its page with a headline test", unsold?.action, { label: "Test a second headline", href: "/studio/pages?product=pknife0001&test=headline" });
is("without a sales page yet: build one", find(said({ ...owner, pages: [] }), "“Knife Skills”")?.action, { label: "Build a sales page for it", href: "/studio/pages?product=pknife0001" });
is("its money as arithmetic of the store's own rate", unsold?.math, "At your store's rate of 1.0% of product views becoming sales, 100 views come to 1 sale: $50 at your average order. Arithmetic, not a forecast.");

part("Checkouts not paid");
const unpaid = find(said(), "Of 30 checkouts started");
is("reminders off: turn them on, with what was left unpaid", [unpaid?.action, unpaid?.math], [
  { label: "Turn on checkout reminders", href: "/studio#checkout-reminders" },
  "26 checkouts not paid × your average order of $50 = $1,300 left at the payment page.",
]);
is("reminders on: open the store as a buyer", find(said({ ...owner, reminders: true }), "Of 30 checkouts started")?.action, { label: "Open your store as a buyer", href: "https://marktmorgen.com/@bakery" });

part("Fewer of the visitors buying");
const fewer = find(said(), "Fewer of your visitors bought");
is("where they stop, and the arithmetic of the rate before", [fewer?.action, fewer?.math], [
  { label: "See where they stop", section: "funnel" },
  "At the rate before, 400 visitors × 3.0% = 12 sales, 8 more than were made: $400 at your average order of $50.",
]);

part("Fewer visitors");
const down = { ...data, totals: { ...data.totals, d7: { ...data.totals.d7, visitors: 200 } } } as StatsData;
is("write to the list", find(said(owner, down), "Fewer people visited")?.action, { label: "Write to your list", href: "/studio/email?who=all" });

part("A step this person may not take");
const support: InsightContext = { storeUrl: owner.storeUrl, reminders: false, may: {} };
is("the numbers instead", [find(said(support), "“Knife Skills”")?.action, find(said(support), "Of 30 checkouts")?.action, find(said(support, down), "Fewer people visited")?.action], [
  { label: "See your products", section: "products" },
  { label: "Open your store as a buyer", href: "https://marktmorgen.com/@bakery" },
  { label: "See where they came from", section: "channels" },
]);

done();
