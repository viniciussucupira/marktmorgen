/**
 * Any dates, when buyers buy, and marks the store makes on its own (added 12
 * October 2026; lib/stats.ts readRange and hoursOfWeek, lib/buying-hours.ts,
 * lib/auto-marks.ts, lib/store-sale.ts). Checked:
 *
 *   - a stretch of days is read only inside the 400 kept, in order, not in
 *     the future; its visits from the days, its people over the whole
 *     stretch, its sales from Stripe, and the same number of days before;
 *   - checkouts by hour of the week, turned to the reader's own time;
 *   - marks from emails sent, products added and sales begun and ended,
 *     only inside the days asked for; a sale replaced is kept for them.
 */
import { hoursOfWeek, rangeProblem, readRange, recordHit } from "@/lib/stats";
import { busiestHours, toLocalWeek } from "@/lib/buying-hours";
import { marksFrom } from "@/lib/auto-marks";
import { NO_SALE, withPastSale } from "@/lib/store-sale";
import { claimHandle, ensureStatsId, setStripeAccount, storeForEmail } from "@/lib/store";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

process.env.STRIPE_SECRET_KEY = "sk_test_numbers_range_only";

const NOW = Date.UTC(2026, 9, 12, 15);

let sessions: Record<string, unknown>[] = [];
let capped = false;
let failed = false;
let upsells: Record<string, unknown>[] = [];
let upsellsCapped = false;
let pageNumber = 0;

globalThis.fetch = (async (input: string | URL | Request) => {
  const url = new URL(String(input));
  const json = (body: unknown) => new Response(JSON.stringify(body), { status: 200 });
  if (url.pathname === "/v1/checkout/sessions") {
    if (failed) return new Response(JSON.stringify({error:{message:"test reading failed"}}),{status:400});
    pageNumber += 1;
    return json({ object: "list", data: capped ? sessions.map(row=>({...row,id:String(row.id)+"_"+pageNumber})) : sessions, has_more: capped });
  }
  if (url.pathname === "/v1/payment_intents") {
    pageNumber += 1;
    return json({object:"list",data:upsellsCapped ? upsells.map(row=>({...row,id:String(row.id)+"_"+pageNumber})) : upsells,has_more:upsellsCapped});
  }
  return json({ object: "list", data: [], has_more: false });
}) as typeof fetch;

async function main(): Promise<void> {
  redis.clear();

  part("Which days can be read");
  is(
    "real dates, in order, not ahead, inside the 400 kept",
    [rangeProblem("2026-10-01", "2026-10-12", NOW), rangeProblem("2026-10-12", "2026-10-01", NOW), rangeProblem("2026-10-01", "2026-10-13", NOW), rangeProblem("2025-09-01", "2026-10-01", NOW), rangeProblem("2026-02-30", "2026-03-01", NOW), rangeProblem("x", "2026-10-01", NOW)],
    [null, "order", "future", "kept", "dates", "dates"],
  );

  part("A stretch of days");
  await claimHandle("owner@example.com", "harbor", "Harbor Kitchen", "");
  await ensureStatsId("owner@example.com");
  await setStripeAccount("owner@example.com", "acct_1TestHarbor0001", true);
  const store = (await storeForEmail("owner@example.com"))!;
  const view = (ip: string, at: number, source = "") => recordHit(store, { kind: "view", ip, userAgent: "Mozilla/5.0 (Macintosh)", source }, at);
  // The launch: Oct 5 to 7. The same three days before: Oct 2 to 4.
  await view("203.0.113.1", Date.UTC(2026, 9, 5, 10), "instagram");
  await view("203.0.113.1", Date.UTC(2026, 9, 6, 10), "instagram");
  await view("203.0.113.2", Date.UTC(2026, 9, 7, 10), "newsletter");
  await view("203.0.113.3", Date.UTC(2026, 9, 3, 10));
  await view("203.0.113.4", Date.UTC(2026, 9, 9, 10));
  const session = (id: string, at: number, cents: number, channel = "") => ({
    id,
    status: "complete",
    payment_status: "paid",
    amount_total: cents,
    currency: "usd",
    created: Math.floor(at / 1000),
    customer_details: { email: "buyer@example.com" },
    metadata: { store: "harbor", product: "guide", ...(channel ? { channel } : {}) },
  });
  sessions = [
    session("cs_test_after00000001", Date.UTC(2026, 9, 9, 10), 1900),
    session("cs_test_launch0000002", Date.UTC(2026, 9, 6, 20), 1900, "instagram"),
    session("cs_test_launch0000001", Date.UTC(2026, 9, 5, 20), 1900, "instagram"),
    session("cs_test_before0000001", Date.UTC(2026, 9, 3, 20), 1900),
  ];
  const range = (await readRange(store, "2026-10-05", "2026-10-07", NOW))!;
  is("the days, each with its visitors and sales", range.days.map((d) => [d.date, d.visitors, d.views, d.sales]), [
    ["2026-10-05", 1, 1, 1],
    ["2026-10-06", 1, 1, 1],
    ["2026-10-07", 1, 1, 0],
  ]);
  // Visitors as every window counts them: a visitor's mark changes each day, so one person on two days is two.
  is("visitors, views, sales and money over the stretch", [range.totals.visitors, range.totals.views, range.totals.sales, range.totals.cents], [3, 3, 2, 3800]);
  is("beside the three days before", range.before, { visitors: 1, views: 1, checkouts: 0, sales: 1, cents: 1900 });
  is("each channel with its visits and its sales", range.channels.map((c) => [c.source, c.visits, c.sales]), [
    ["instagram", 2, 2],
    ["newsletter", 1, 0],
  ]);
  is("nothing read for days that cannot be", await readRange(store, "2026-10-07", "2026-10-05", NOW), null);

  part("Capped readings cannot borrow coverage from old sales");
  capped=true;
  sessions=[session("cs_test_capold",Date.UTC(2026,9,3,20),1900)];
  const oldCap=(await readRange(store,"2026-10-05","2026-10-07",NOW))!;
  is("old sales do not certify current coverage",oldCap.partial,true);
  is("capped prior paid totals unknown",[oldCap.before?.sales,oldCap.before?.cents],[null,null]);
  is("prior traffic survives cap",oldCap.before?.visitors,1);
  is("current traffic survives cap",oldCap.totals.visitors,3);
  sessions=[{...session("cs_test_nonpaid",Date.UTC(2026,9,6),1900),status:"open",payment_status:"unpaid"}];
  const noPaid=(await readRange(store,"2026-10-05","2026-10-07",NOW))!;
  is("empty paid subset of capped reading is incomplete",noPaid.partial,true);
  is("empty capped prior paid figures stay null",noPaid.before?.sales,null);
  sessions=[session("cs_test_boundary",Date.UTC(2026,9,5),1900)];
  is("cap exactly at selected start remains incomplete",(await readRange(store,"2026-10-05","2026-10-07",NOW))?.partial,true);
  capped=false;
  sessions=[session("cs_test_old_complete",Date.UTC(2026,9,3),1900)];
  upsellsCapped=true;
  upsells=[{id:"pi_test_cap",created:Math.floor(Date.UTC(2026,9,6)/1000),status:"succeeded",amount:500,currency:"usd",metadata:{kind:"upsell",store:"harbor",product:"guide"}}];
  is("complete old checkouts cannot certify capped extras",(await readRange(store,"2026-10-05","2026-10-07",NOW))?.partial,true);
  upsellsCapped=false;upsells=[];sessions=[];
  const confirmedZero=(await readRange(store,"2026-10-05","2026-10-07",NOW))!;
  is("complete empty reading remains zero",[confirmedZero.partial,confirmedZero.totals.sales,confirmedZero.before?.sales],[false,0,0]);
  failed=true;
  const failedRange=(await readRange(store,"2026-10-05","2026-10-07",NOW))!;
  is("provider failure remains explicit",failedRange.sales,"error");
  is("failure withholds prior paid figures",[failedRange.before?.sales,failedRange.before?.cents],[null,null]);
  is("failure retains traffic",failedRange.totals.visitors,3);
  failed=false;

  part("When buyers buy");
  const hours = hoursOfWeek([{ created: Date.UTC(2026, 9, 4, 23, 30), cents: 1000 }, { created: Date.UTC(2026, 9, 5, 0, 10), cents: 500 }]);
  // Sunday Oct 4, 23:00 UTC is hour 23; Monday 0:00 UTC is hour 24.
  is("counted in UTC by hour of the week", [hours.sales[23], hours.sales[24], hours.cents[23]], [1, 1, 1000]);
  // In New York in October (UTC-4, an offset of 240 minutes), they were Sunday at 7 pm and 8 pm.
  const local = toLocalWeek(hours.sales, 240);
  is("turned to the reader's own time", [local[19], local[20]], [1, 1]);
  is("and back around the week", toLocalWeek([1, ...new Array(167).fill(0)], 240)[164], 1);
  const byHour = new Array(24).fill(0);
  byHour[23] = 2;
  byHour[0] = 2;
  byHour[1] = 1;
  is("the busiest three hours, through midnight", busiestHours(byHour), 23);

  part("Marks the store makes on its own");
  const at = (d: string) => Date.parse(`${d}T12:00:00Z`) / 1000;
  const marks = marksFrom({
    emails: [
      { subject: "The guide is out", status: "sent", sendAt: at("2026-10-05"), finishedAt: at("2026-10-05"), sent: 340 },
      { subject: "Not yet", status: "scheduled", sendAt: at("2026-10-20"), finishedAt: 0, sent: 0 },
    ],
    products: [
      { title: "The Guide", createdAt: "2026-10-04T09:00:00.000Z" },
      { title: "A draft", createdAt: "2026-10-04T09:00:00.000Z", hidden: true },
      { title: "Old", createdAt: "2026-01-04T09:00:00.000Z" },
    ],
    sales: [{ name: "Launch week", percent: 20, starts: at("2026-10-05"), ends: at("2026-10-08") }, { ...NO_SALE }],
    from: "2026-10-01",
    to: "2026-10-12",
    now: NOW,
  });
  is("emails sent, products added, a sale's first and last day; never one to come, a draft or a day outside", marks.map((m) => [m.day, m.text]), [
    ["2026-10-04", "Product added: The Guide"],
    ["2026-10-05", "Email sent: “The guide is out” to 340"],
    ["2026-10-05", "Sale began: Launch week, 20% off"],
    ["2026-10-08", "Sale ended: Launch week, 20% off"],
  ]);
  const running = { ...NO_SALE, name: "Launch week", percent: 20, starts: at("2026-10-05"), ends: at("2026-10-20"), coupon: "nl_sale_1" };
  is("a sale replaced is kept, ended when it was replaced", withPastSale([], running, { ...NO_SALE }, at("2026-10-09")), [{ name: "Launch week", percent: 20, starts: at("2026-10-05"), ends: at("2026-10-09") }]);
  is("one that had not begun is not", withPastSale([], { ...running, starts: at("2026-10-15") }, { ...NO_SALE }, at("2026-10-09")), []);


  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
