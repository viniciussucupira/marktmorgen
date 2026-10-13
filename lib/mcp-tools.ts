/**
 * The read-only tools of the MCP server beyond the first three (added 12
 * October 2026): revenue by channel, the funnel, each product, memberships,
 * emails, affiliates, buyers in numbers and what is worth knowing — each the
 * same numbers the studio shows, read by the same functions and their caches
 * (app/api/mcp/route.ts).
 *
 * Read before it was built: DataFast's 67 MCP tools, Umami's 23 read-only
 * ones (run_funnel, run_attribution, get_revenue), ChartMogul's, Matomo's,
 * Northbeam's and Polar's. What they share is that the assistant gets the
 * numbers the product already shows, each tool narrow enough to answer one
 * kind of question.
 *
 * Nobody is named. No tool here returns a buyer's, member's, subscriber's or
 * affiliate's address, name or words: an assistant's conversation is kept by
 * whoever runs the assistant, and those people never agreed to be read there.
 * Affiliates are their link's code; members' reasons for leaving are counted,
 * not quoted. Money is in the smallest unit of the store's currency.
 */
import type { Store } from "@/lib/store";
import { type StatsData, readsSales, productsInStats, readSales, readStats, studioStats } from "@/lib/stats";
import { readListings, readTitles } from "@/lib/catalog";
import { membershipNumbers } from "@/lib/membership-numbers";
import { listBroadcasts } from "@/lib/broadcasts";
import { broadcastMoney, flowMoney, readMailRevenue } from "@/lib/mail-revenue";
import { flowStats, readFlows } from "@/lib/flows";
import { listCounts } from "@/lib/contacts";
import { affiliatesOn, readBook } from "@/lib/affiliates";
import { insightsFrom } from "@/lib/insights";
import { readPaths } from "@/lib/next-bought";
import { refundActivityFrom } from "@/lib/refund-activity";
import { channelCashflows } from "@/lib/channel-cashflow";

export type Window = "d7" | "d30" | "d90";
const NAMES: Record<Window, string> = { d7: "last_7_days", d30: "last_30_days", d90: "last_90_days" };

/** `days`: 7, 30 or 90; anything else is 30. */
export function windowOf(raw: unknown): Window {
  const n = Number(raw);
  return n === 7 ? "d7" : n === 90 ? "d90" : "d30";
}

/** The studio's numbers, with the products, for one store. */
export async function readFullNumbers(store: Store, now = Date.now()): Promise<StatsData | null> {
  const stats = await readStats(store, now);
  if (!stats) return null;
  let state: StatsData["sales"] = readsSales(store) ? "ok" : "none";
  const sales = readsSales(store)
    ? await readSales(store, now).catch(() => {
        state = "error";
        return null;
      })
    : null;
  const listings = await readListings(store, productsInStats(store, stats, sales)).catch(() => []);
  return studioStats(store, stats, sales, state, listings);
}

const share = (part: number, whole: number) => (whole > 0 ? Math.round((part / whole) * 10_000) / 10_000 : null);

/** Revenue by channel for the window, three ways, with ads and posts. */
export function channelsTool(data: StatsData, w: Window) {
  const known = data.sales === "ok";
  const table = data.attribution?.[w];
  const days = (data.days ?? []).slice(-(w === "d7" ? 7 : w === "d30" ? 30 : 90));
  const cash = known && days.length ? channelCashflows(data, w, data.channels?.[w] ?? [], new Map(), days[0].date, days[days.length - 1].date) : [];
  const refundActivity = known && days.length ? refundActivityFrom(data, w, days[0].date, days[days.length - 1].date) : null;
  return {
    window: NAMES[w],
    currency: data.currency,
    sales_read: data.sales,
    cashflow_complete: data.cashflowComplete === true,
    cashflow: known && cash.length ? {
      note: "Payments include renewals. Refunds include pending refunds in the days recorded. After refunds is before ad spend, fees, tax, commissions and other costs; not profit or causal lift. Null means incomplete.",
      channels: cash.map((c) => ({ channel: c.source, payments_received: c.receipts, refunds: c.refunds, after_refunds: c.afterRefunds })),
    } : null,
    ...(refundActivity ? { refund_activity: {
      payments_received: refundActivity.payments, refunds_recorded: refundActivity.refunds, refund_records: refundActivity.records,
      note: "Money is in the currency smallest unit. Same-period payments including renewals, and recorded refunds including pending refunds. Not a refund rate for purchases or buyers: refunded purchases may be earlier and records are not unique buyers or orders. Ratio is refunded amount / received amount, may exceed 1; null means no payments. Only complete, matched readings.",
      channels: refundActivity.rows.map((row) => ({ channel: row.source, payments_received: row.payments, refunds_recorded: row.refunds, refund_records: row.records, recorded_refunds_over_payments: row.share })),
    } } : {}),
    buyer_cohorts: known && data.buyerChannels ? {
      history_partial: data.buyerChannels.historyPartial,
      unidentified_orders: data.buyerChannels[w].unidentifiedOrders,
      note: "First purchase observed in up to 180 days; not lifetime acquisition. Renewals are not repurchases. Revenue is gross; the 30-day rate uses only buyers observed for 30 days.",
      channels: data.buyerChannels[w].rows.map((c) => ({ ...c })),
    } : null,
    ...(known && data.buyerChannels?.weekly ? { weekly_repurchase_cohorts: {
      as_of_utc: data.buyerChannels.weekly.asOf,
      history_partial: data.buyerChannels.historyPartial,
      unidentified_orders: data.buyerChannels.weekly.unidentifiedOrders,
      note: "UTC first observed purchase weeks from up to 180 days of history, independent of the selected window. Cumulative repurchases within 7/30/60/90 days, not product activity retention or lifetime acquisition. Only buyers observed for the full period enter the denominator. Null rate means no eligible buyers; renewals and one-click extras do not count. Small groups fluctuate; partial history may miss purchases.",
      weeks: data.buyerChannels.weekly.rows.map((row) => ({ week: row.week, buyers: row.buyers,
        periods: Object.entries(row.observations).map(([days, cell]) => ({ days: Number(days), eligible: cell.eligible, repeated: cell.repeated, percent: cell.eligible ? Math.round(cell.repeated / cell.eligible * 100) : null })),
      })),
    } } : {}),
    channels: (data.channels?.[w] ?? []).map((c) => ({
      channel: c.source,
      visits: c.visits,
      checkouts_started: c.checkouts,
      free_signups: c.free,
      sales: known ? c.sales : null,
      revenue: known ? c.cents : null,
      sales_per_visit: known ? share(c.sales, c.visits) : null,
    })),
    three_ways: table
      ? {
          note: "The same checkouts credited to the last visit before buying, to the first visit in the 90 days before, and to what buyers answered after paying.",
          attribution_days: data.attributionDays ?? 30,
          rows: table.rows.map((r) => ({ channel: r.name, last_visit: r.last, first_visit: r.first, buyers_said: r.said })),
          no_channel: table.unknown,
          no_channel_buyers_said: table.unknownSaid.map((r) => ({ answer: r.name, buyers: r.buyers, revenue: r.cents })),
        }
      : null,
    ads: known ? (data.ads?.[w] ?? []).slice(0, 25).map((r) => ({ ad: r.content, channel: r.source, campaign: r.campaign, sales: r.sales, revenue: r.cents })) : [],
    posts: known ? (data.posts?.[w] ?? []).slice(0, 25).map((r) => ({ post: r.campaign, channel: r.source, visits: r.visits, sales: r.sales, revenue: r.cents })) : [],
  };
}

/** From visit to sale for the window, beside the stretch before, and how far down the store page is read. */
export function funnelTool(data: StatsData, w: Window) {
  const known = data.sales === "ok";
  const t = data.totals[w];
  const p = data.previous?.[w];
  const reach = data.reach?.[w];
  return {
    window: NAMES[w],
    currency: data.currency,
    visitors: t.visitors,
    page_views: t.views,
    checkouts_started: t.checkouts,
    sales: known ? t.sales : null,
    revenue: known ? t.cents : null,
    checkouts_per_visitor: share(t.checkouts, t.visitors),
    sales_per_checkout: known ? share(t.sales, t.checkouts) : null,
    sales_per_visitor: known ? share(t.sales, t.visitors) : null,
    the_same_days_before: p
      ? { visitors: p.visitors, page_views: p.views, checkouts_started: p.checkouts, sales: known ? p.sales : null, revenue: known ? p.cents : null }
      : null,
    store_page: reach
      ? {
          note: "Of the visitors measured, how many reached each item of the store page and how many clicked it, in the page's order.",
          visitors_measured: reach.visitors,
          items: reach.rows.map((r) => ({ item: r.title, kind: r.kind, reached: r.reached, clicked: r.clicks })),
        }
      : null,
  };
}

/** Each product for the window, and what its buyers went on to buy (lib/next-bought.ts). */
export async function productsTool(store: Store, data: StatsData, w: Window) {
  const known = data.sales === "ok";
  const paths = await readPaths(store.statsId).catch(() => null);
  const titles = await readTitles(store).catch(() => new Map<string, string>());
  const name = (id: string) => titles.get(id) ?? id;
  return {
    window: NAMES[w],
    currency: data.currency,
    products: data.products
      .map((row) => ({
        id: row.id,
        title: row.title,
        page_views: row[w].views,
        checkouts_started: row[w].checkouts,
        sales: known ? row[w].sales : null,
        revenue: known ? row[w].cents : null,
        sales_per_page_view: known ? share(row[w].sales, row[w].views) : null,
      }))
      .sort((a, b) => (b.revenue ?? 0) - (a.revenue ?? 0) || b.page_views - a.page_views),
    bought_next: paths
      ? {
          note: "From all sales: what the same buyers bought on a later visit, from three buyers up, with the median days between.",
          bought_first_most: Object.entries(paths.starts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([id, buyers]) => ({ product: name(id), buyers })),
          sequences: Object.entries(paths.next).flatMap(([from, steps]) => steps.map((s) => ({ first: name(from), then: name(s.id), buyers: s.buyers, days_later: s.days }))),
        }
      : null,
  };
}

/** Memberships as the Membership numbers page shows them, without anybody's address or words. */
export async function membershipsTool(store: Store) {
  const n = await membershipNumbers(store);
  if (!n) return { memberships: null, note: "No memberships could be read: the store has no Stripe account connected, or sells none." };
  const titles = await readTitles(store).catch(() => new Map<string, string>());
  return {
    currency: n.currency,
    mrr: Math.round(n.mrr),
    arr: Math.round(n.mrr * 12),
    paying: n.paying,
    trialing: n.trialing,
    payment_being_retried: { members: n.atRisk, mrr: Math.round(n.atRiskMrr) },
    ended_last_30_days: { members: n.ended30, mrr: Math.round(n.endedMrr30) },
    churn_last_30_days: n.churn30,
    trials_ended_last_90_days: { ended: n.trialsEnded, became_paying: n.trialsConverted },
    by_product: n.byProduct.map((p) => ({ product: titles.get(p.product) ?? p.product, members: p.members, trialing: p.trialing, mrr: Math.round(p.mrr) })),
    by_channel: (n.byChannel ?? []).map((c) => ({ channel: c.channel, started: c.started, running: c.running, still_running_at_3_months: c.stayed3, average_months: c.months })),
    why_members_left: n.leaving ? { canceled: n.leaving.canceled, answered: n.leaving.answered, reasons: n.leaving.reasons.map((r) => ({ reason: r.reason, members: r.members, mrr: Math.round(r.mrr) })), payment_failed: n.leaving.paymentFailed } : null,
    mrr_by_month: n.movements?.months ?? [],
    arpu: n.movements?.arpu ?? null,
    net_revenue_retention: n.movements?.nrr ?? null,
    forecast_next_3_months: n.forecast ?? null,
    complete: n.complete,
  };
}

/** The list and what each email sent to it did. */
export async function emailsTool(store: Store) {
  if (!store.listId) return { list: null, note: "This store keeps no list yet." };
  const [counts, broadcasts, flows] = await Promise.all([listCounts(store.listId), listBroadcasts(store.listId, 30), readFlows(store.listId)]);
  const [revenue, flowCounts] = await Promise.all([
    broadcasts.length || flows.length ? readMailRevenue(store).catch(() => null) : Promise.resolve(null),
    flowStats(flows).catch(() => new Map()),
  ]);
  return {
    currency: store.currency,
    list: { people: counts.total, agreed_to_hear: counts.agreed, left: counts.left, can_be_emailed: counts.mailable },
    emails: broadcasts.map((b) => {
      const money = broadcastMoney(revenue, b.id);
      return {
        subject: b.subject,
        status: b.status,
        // Seconds, as lib/broadcasts.ts keeps them.
        sent_at: b.finishedAt || b.sendAt ? new Date((b.finishedAt || b.sendAt) * 1000).toISOString() : null,
        to: b.total,
        sent: b.sent,
        sales: b.tagged && money ? money.sales : null,
        revenue: b.tagged && money ? money.cents : null,
      };
    }),
    sequences: flows.map((f) => {
      const c = flowCounts.get(f.id);
      const money = flowMoney(revenue, f.id);
      return { name: f.name, trigger: f.trigger, started: c?.started ?? 0, emails_sent: c?.sent ?? 0, reached_the_end: c?.reached ?? 0, sales: money?.sales ?? null, revenue: money?.cents ?? null };
    }),
  };
}

/** The affiliate program, each affiliate by their link's code, never their address. */
export async function affiliatesTool(store: Store) {
  if (!affiliatesOn(store)) return { program: null, note: "The affiliate program is off." };
  const book = await readBook(store);
  return {
    currency: book.currency,
    program: { percent: store.affiliates.percent, days: store.affiliates.days, rule: store.affiliates.rule, memberships_months: store.affiliates.recurring, bonuses: store.affiliates.bonuses },
    affiliates: book.rows.map((r) => ({
      code: r.affiliate.code,
      status: r.affiliate.status,
      clicks: r.clicks,
      sales: r.sales,
      earned: r.earned,
      paid: r.paid,
      owed: r.owed,
      payable_now: r.payable,
      held_for_review: r.held,
      held_because: r.flags,
    })),
    refunds_checked: book.refundsChecked,
  };
}

/** Who bought, in numbers only. */
export function buyersTool(data: StatsData, w: Window) {
  const b = data.buyers?.[w];
  return {
    window: NAMES[w],
    currency: data.currency,
    buyers: b ? { people: b.buyers, orders: b.orders, revenue: b.cents, had_bought_before: b.returning, bought_more_than_once: b.repeat } : null,
  };
}

/** What changed that is worth acting on, by the studio's own rules (lib/insights.ts). */
export function insightsTool(data: StatsData, w: Window) {
  return {
    window: NAMES[w],
    worth_knowing: insightsFrom(data, w, [], 6).map((i) => ({ text: i.text, tone: i.tone, arithmetic: i.math ?? null })),
  };
}
