import { buyerChannelsFrom } from "@/lib/buyer-channel-rules";
import { channelCashflows, cashflowStatus } from "@/lib/channel-cashflow";
import { numbersContext, SECTIONS } from "@/lib/numbers-ask";
import { insightsFrom } from "@/lib/insights";
import { RevenueQuality, BuyerChannelsPanel } from "@/components/revenue-quality";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import type { Sale, StatsData } from "@/lib/stats";
import { done, is, part } from "./check";

const NOW = Date.parse("2026-10-13T12:00:00Z");
const DAY = 86_400_000;
let id = 0;
function sale(email: string, ago: number, cents: number, source: string, extra: Partial<Sale> = {}): Sale {
  return { created: NOW - ago * DAY, cents, currency: "usd", product: "p1", source, first: source, medium: "", campaign: "", content: "", country: "", paymentIntent: "",
    row: { id: `cs_${++id}`, customer_details: { email } }, upsell: false, ...extra };
}

part("Buyers are grouped by first observed acquisition, not their latest purchase");
const input = [
  sale("Ana@example.com", 60, 1000, "newsletter"),
  sale("ana@example.com", 40, 2000, "google"),
  sale("ana@example.com", 40, 500, "google", { upsell: true, row: { id: "pi_extra", receipt_email: "ana@example.com" } }),
  sale("ben@example.com", 50, 1000, "newsletter"),
  sale("cy@example.com", 10, 1000, "instagram"),
  sale("cy@example.com", 5, 1000, "google"),
  sale("old@example.com", 120, 3000, "facebook"),
  sale("old@example.com", 2, 1000, "google"),
  sale("tip@example.com", 4, 1000, "tiktok", { row: { customer_details: { email: "tip@example.com" }, metadata: { kind: "tip" } } }),
  sale("euro@example.com", 3, 1000, "x", { currency: "eur" }),
  sale("", 2, 1000, "x"),
  sale("future@example.com", -2, 1000, "x"),
];
const cohorts = buyerChannelsFrom(input, "usd", NOW);
const news = cohorts.d90.rows.find((r) => r.source === "newsletter")!;
is("first channel keeps the later order and extra", [news.buyers, news.repeatBuyers, news.orders, news.cents], [2, 1, 3, 4500]);
is("mature cohorts have an equal thirty days to return", [news.eligible30, news.repeated30], [2, 1]);
const recent = cohorts.d90.rows.find((r) => r.source === "instagram")!;
is("recent buyers are not treated as failures to return", [recent.buyers, recent.repeatBuyers, recent.eligible30, recent.repeated30], [1, 1, 0, 0]);
is("an old buyer's new order is not acquisition this month", cohorts.d30.rows.some((r) => r.source === "facebook" || r.source === "google"), false);
is("unidentified orders are disclosed", cohorts.d30.unidentifiedOrders, 1);
is("no personal identities, tips, foreign currency or future purchases", /@|tip|tiktok|future|euro/.test(JSON.stringify(cohorts)), false);
is("truncated purchase history is disclosed", buyerChannelsFrom(input, "usd", NOW, true).historyPartial, true);
is("the same reading in any order", buyerChannelsFrom([...input].reverse(), "usd", NOW), cohorts);
is("duplicate provider rows do not invent a repeat buyer or extra revenue", buyerChannelsFrom([...input, input[0], input[1]], "usd", NOW), cohorts);
is("an extra without a checkout is not a new buyer", buyerChannelsFrom([input[2]], "usd", NOW).d90.rows, []);
is("first visit is used when it differs from conversion channel", buyerChannelsFrom([sale("buyer@example.com", 3, 1000, "google", { first: "youtube" })], "usd", NOW).d7.rows[0].source, "youtube");

part("Channel result includes renewals, recorded refunds and channels with only costs");
const data = {
  sales: "ok", partial: false, cashflowComplete: true, currency: "usd",
  channelDays: { instagram: { "2026-10-01": 90000, "2026-10-12": 10000, "2026-10-13": 5000 }, newsletter: { "2026-10-12": 2000 } },
  refunds: { d7: [{ source: "instagram", cents: 12000, refunds: 1 }], d30: [], d90: [] },
  channels: { d7: [{ source: "instagram", visits: 100, checkouts: 10, sales: 10, cents: 10000, free: 0 }], d30: [], d90: [] },
  days: Array.from({ length: 90 }, (_, i) => ({ date: new Date(NOW - (89 - i) * DAY).toISOString().slice(0, 10), visitors: 1, views: 1, checkouts: 0, sales: 0 })),
  totals: { d7: { visitors: 100, views: 100, checkouts: 10, sales: 10, cents: 10000 }, d30: { visitors: 0, views: 0, checkouts: 0, sales: 0, cents: 0 }, d90: { visitors: 0, views: 0, checkouts: 0, sales: 0, cents: 0 } },
  products: [], buyerChannels: cohorts,
} as unknown as StatsData;
const costs = new Map([["instagram", 5000], ["podcast", 2000]]);
const rows = channelCashflows(data, "d7", data.channels.d7, costs, "2026-10-07", "2026-10-13");
const insta = rows.find((r) => r.source === "instagram")!;
is("gross covers spend but refunds reverse the recorded result", [insta.receipts, insta.refunds, insta.afterRefunds, insta.afterAds, insta.backPerOne], [15000, 12000, 3000, -2000, 0.6]);
is("cost-only channels are still losses", rows.find((r) => r.source === "podcast")?.afterAds, -2000);
is("renewal-only channels are kept", rows.find((r) => r.source === "newsletter")?.receipts, 2000);
is("the result does not tell the creator to spend more", cashflowStatus(insta), "Below recorded ad spend");
const incomplete = channelCashflows({ ...data, cashflowComplete: false }, "d7", data.channels.d7, costs, "2026-10-07", "2026-10-13")[0];
is("incomplete is unknown, never zero", [incomplete.refunds, incomplete.afterRefunds, incomplete.afterAds, incomplete.backPerOne], [null, null, null, null]);

part("Alerts and AI use the same arithmetic with its limits");
const spends = [{ id: "ad1", channel: "instagram", campaign: "", cents: 5000, from: "2026-10-07", to: "2026-10-13" }];
const insights = insightsFrom(data, "d7", spends);
is("the alert points to the recorded loss rather than gross ROAS", [insights[0].tone, insights[0].text.includes("-$20"), insights[0].action], ["bad", true, { label: "See payments and costs", section: "cashflow" }]);
is("no budget instruction", /spending more|worth cutting/.test(JSON.stringify(insights)), false);
is("a recorded loss is not hidden by positive channels when the alert list is short", insightsFrom({ ...data, channelDays: { ...data.channelDays, google: { "2026-10-13": 90000 } } }, "d7", [...spends, { id: "ad2", channel: "google", campaign: "", cents: 1000, from: "2026-10-07", to: "2026-10-13" }], 1)[0].tone, "bad");
is("incomplete figures do not produce financial alerts", insightsFrom({ ...data, cashflowComplete: false }, "d7", spends).some((i) => i.action && "section" in i.action && i.action.section === "cashflow"), false);
const context = numbersContext(data, spends);
const text = JSON.stringify(context);
is("the new metrics are available to the assistant, without identities", [text.includes("after_refunds_and_ads"), text.includes("observed_for_30_days"), text.includes("-$20"), /@/.test(text)], [true, true, true, false]);
is("the assistant can open their exact panel", [SECTIONS.includes("cashflow"), SECTIONS.includes("buyer-channels")], [true, true]);
is("when no spend was provided it is not invented as zero", JSON.stringify(numbersContext(data)).includes("ad_spend_recorded"), false);

part("Rendered panels show figures, limits and unknown states");
const html = renderToStaticMarkup(createElement(RevenueQuality, { data, range: "d7", spends }));
is("negative result is rendered and is not called profit", [html.includes("-$20"), html.includes("it is not profit"), html.includes("renewals")], [true, true, true]);
const missing = renderToStaticMarkup(createElement(RevenueQuality, { data: { ...data, cashflowComplete: false }, range: "d7", spends }));
is("failed reads have a visible explanation", missing.includes("waits for complete figures"), true);
const cohortHtml = renderToStaticMarkup(createElement(BuyerChannelsPanel, { window: cohorts.d90, currency: "usd", historyPartial: false }));
is("young cohorts show no zero retention claim", [cohortHtml.includes("Not enough time observed"), cohortHtml.includes("1 of 2 observed for 30 days"), /@/.test(cohortHtml)], [true, true, false]);
done();
