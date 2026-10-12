/**
 * What changed, in words (added 11 October 2026): the few things in a
 * store's numbers worth acting on this week, said as sentences, at the top of
 * the studio's numbers and in the weekly email.
 *
 * Heap (Illuminate), Triple Whale (Moby) and FullStory (StoryAI) sell this as
 * AI. Here it is a short list of rules over the figures the studio already
 * shows, so it costs nothing to run, says nothing it cannot point at, and
 * never invents a cause: each sentence is a measured fact and, where there is
 * an obvious next step, the step. A rule speaks only when its numbers are big
 * enough to mean something; on a quiet week the list is empty, and empty is
 * the honest answer.
 *
 * Ads are called by lib/ad-spend-rules.ts: spend more at SCALE_AT back for
 * each 1 spent, cut below 1.
 *
 * Each sentence can carry the step it points at (added 12 October 2026), as
 * Triple Whale, Cometly and FullStory pair a finding with an action: a
 * button that opens the right screen already set — the page's headline test
 * for a product opened and not bought, the checkout reminders when
 * checkouts go unpaid, the composer for the list when visits drop — or the
 * part of the numbers that shows it. And, where money is at stake, the
 * arithmetic of it, from the measured numbers only, said as arithmetic and
 * never as a promise of what doing it would bring.
 *
 * Pure: the studio's panel and the weekly email both call it on StatsData.
 */
import type { StatsData } from "@/lib/stats";
import { type AdSpend, spendBy, verdictFor } from "@/lib/ad-spend-rules";
import { channelName } from "@/lib/channel-names";
import { HEARD_NAMES, isHeardAnswer } from "@/lib/heard-rules";
import { formatMoney } from "@/lib/money";
import { recordsFrom } from "@/lib/records";

/** Where a sentence leads: a screen of the studio, already set, or a part of the numbers panel by its id there. */
export type InsightAction = { label: string; href: string } | { label: string; section: "funnel" | "channels" | "posts" | "ads" | "products" | "reach" };
export type Insight = {
  text: string;
  tone: "good" | "bad" | "info";
  action?: InsightAction;
  /** The money at stake, as the arithmetic of measured numbers; never a promise. */
  math?: string;
};

/** What the studio knows that the numbers do not: where its screens are and how the store is set. */
export type InsightContext = {
  /** The store's own address, to open it as a buyer. */
  storeUrl?: string;
  /** Whether a reminder goes to buyers who leave a checkout (lib/checkout-recovery.ts). */
  reminders?: boolean;
  /** Whether this person may change settings, edit pages and write to the list: an action they cannot take is not offered. */
  may?: { settings?: boolean; page?: boolean; draft?: boolean };
};

type Window = "d7" | "d30" | "d90";
const SPAN: Record<Window, string> = { d7: "7 days", d30: "30 days", d90: "90 days" };
const DAYS: Record<Window, number> = { d7: 7, d30: 30, d90: 90 };

const pct = (part: number, whole: number) => {
  const value = whole ? (part / whole) * 100 : 0;
  return `${value < 10 ? value.toFixed(1) : Math.round(value)}%`;
};
const n = (value: number) => value.toLocaleString("en-US");

/** Up to `max` sentences for one window, the ones that matter most first. */
export function insightsFrom(data: StatsData, window: Window, spends: AdSpend[] = [], max = 4, context: InsightContext = {}): Insight[] {
  const out: Insight[] = [];
  const money = (cents: number) => formatMoney(cents, data.currency ?? "usd");
  const known = data.sales === "ok";
  const now = data.totals[window];
  const before = data.previous?.[window];
  const span = SPAN[window];
  const may = context.may ?? {};
  // The average order in these days, the one figure the arithmetic below is made with.
  const average = known && now.sales > 0 ? Math.round(now.cents / now.sales) : 0;

  // 1. Ads that cost more than they brought, in these days.
  if (known && spends.length && data.days.length) {
    const days = data.days.slice(-DAYS[window]);
    const spent = spendBy(spends, days[0].date, days[days.length - 1].date);
    for (const [channel, cost] of spent.channels) {
      const brought = data.channels?.[window]?.find((row) => row.source === channel)?.cents ?? 0;
      const call = verdictFor(brought, cost);
      if (call === "cut") {
        out.push({ text: `Ads on ${channelName(channel)} cost ${money(cost)} in the last ${span} and brought ${money(brought)} in sales: worth cutting, or changing.`, tone: "bad", action: { label: "See your ads", section: "ads" }, math: `${money(cost)} spent − ${money(brought)} brought = ${money(cost - brought)} more out than in.` });
      } else if (call === "scale") {
        out.push({
          text: `Ads on ${channelName(channel)} cost ${money(cost)} in the last ${span} and brought ${money(brought)} in sales, ${(brought / cost).toFixed(1)} back for each 1 spent: worth spending more there.`,
          tone: "good",
          action: { label: "See your ads", section: "ads" },
        });
      }
    }
  }

  // A record of the last 90 days, set in the last 7 (lib/records.ts).
  if (known && data.days.length) {
    const records = recordsFrom(data.channelDays, data.days[data.days.length - 1].date);
    if (records.bestWeek) {
      out.push({ text: `Your best 7 days of the last 90: ${money(records.bestWeek.cents)} in sales and renewals. Worth noting what you did this week.`, tone: "good" });
    } else if (records.bestDay) {
      const [y, m, d] = records.bestDay.day.split("-").map(Number);
      const name = new Date(Date.UTC(y, m - 1, d)).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
      out.push({ text: `${name} was your best day of the last 90: ${money(records.bestDay.cents)} in sales and renewals. Worth noting what you did that day.`, tone: "good" });
    }
  }

  // 2. Visitors up or down on the same stretch before.
  if (before && before.visitors >= 20 && now.visitors > 0) {
    const change = (now.visitors - before.visitors) / before.visitors;
    if (Math.abs(change) >= 0.25) {
      out.push({
        text: `${change > 0 ? "More" : "Fewer"} people visited: ${n(now.visitors)} in the last ${span}, ${change > 0 ? "up" : "down"} ${pct(Math.abs(change), 1)} on the ${span} before.`,
        tone: change > 0 ? "good" : "bad",
        action:
          change < 0 && may.draft
            ? { label: "Write to your list", href: "/studio/email?who=all" }
            : { label: "See where they came from", section: "channels" },
      });
    }
  }

  // 3. Fewer, or more, of the visitors buying.
  if (known && before && before.sales !== null && now.visitors >= 100 && before.visitors >= 100) {
    const nowRate = now.sales / now.visitors;
    const thenRate = before.sales / before.visitors;
    if (thenRate > 0 && Math.abs(nowRate - thenRate) / thenRate >= 0.3) {
      out.push({
        text: `${nowRate > thenRate ? "More" : "Fewer"} of your visitors bought: ${pct(now.sales, now.visitors)} of them, against ${pct(before.sales, before.visitors)} in the ${span} before.`,
        tone: nowRate > thenRate ? "good" : "bad",
        ...(nowRate < thenRate
          ? {
              action: { label: "See where they stop", section: "funnel" as const },
              math:
                average > 0
                  ? (() => {
                      const would = Math.round(now.visitors * thenRate);
                      return would > now.sales
                        ? `At the rate before, ${n(now.visitors)} visitors × ${pct(before.sales, before.visitors)} = ${n(would)} sales, ${n(would - now.sales)} more than were made: ${money((would - now.sales) * average)} at your average order of ${money(average)}.`
                        : undefined;
                    })()
                  : undefined,
            }
          : {}),
      });
    }
  }

  // 4. Checkouts started and not paid.
  if (known && now.checkouts >= 10 && now.sales / now.checkouts < 0.3) {
    out.push({
      text: `Of ${n(now.checkouts)} checkouts started, ${n(now.sales)} ${now.sales === 1 ? "was" : "were"} paid. Open a product as a buyer and go as far as the payment page to see what they see.`,
      tone: "bad",
      action:
        context.reminders === false && may.settings
          ? { label: "Turn on checkout reminders", href: "/studio#checkout-reminders" }
          : context.storeUrl
            ? { label: "Open your store as a buyer", href: context.storeUrl }
            : { label: "See where they stop", section: "funnel" },
      math: average > 0 ? `${n(now.checkouts - now.sales)} checkouts not paid × your average order of ${money(average)} = ${money((now.checkouts - now.sales) * average)} left at the payment page.` : undefined,
    });
  }

  // 5. A channel that brings visitors and no sales, while another sells.
  const channels = data.channels?.[window] ?? [];
  const selling = channels.filter((row) => row.visits >= 30 && row.sales > 0).sort((a, b) => b.sales / b.visits - a.sales / a.visits)[0];
  const idle = channels.filter((row) => row.source !== "direct" && row.visits >= 50 && row.sales === 0).sort((a, b) => b.visits - a.visits)[0];
  if (known && selling && idle && idle.source !== selling.source) {
    out.push({
      text: `${channelName(idle.source)} brought ${n(idle.visits)} visits and no sale; ${channelName(selling.source)} turned ${pct(selling.sales, selling.visits)} of its visits into sales.`,
      tone: "info",
      action: { label: "Compare your channels", section: "channels" },
    });
  }

  // 6. Where the money came from, when one channel brought most of it.
  const total = channels.reduce((sum, row) => sum + row.cents, 0);
  const top = [...channels].sort((a, b) => b.cents - a.cents)[0];
  if (known && top && top.source !== "direct" && total > 0 && top.sales >= 3 && top.cents / total >= 0.5) {
    out.push({ text: `${channelName(top.source)} brought ${pct(top.cents, total)} of your money in the last ${span}: ${money(top.cents)} from ${n(top.sales)} sales.`, tone: "good", action: { label: "See the posts behind it", section: "posts" } });
  }

  // 7. A product opened often and not bought.
  const unsold = data.products
    .map((p) => p[window])
    .map((row, i) => ({ row, title: data.products[i].title, id: data.products[i].id }))
    .filter(({ row }) => row.views >= 50 && row.sales === 0)
    .sort((a, b) => b.row.views - a.row.views)[0];
  if (known && unsold) {
    // The store's own rate of page views turning into sales, across all its products, in these days.
    const views = data.products.reduce((sum, p) => sum + p[window].views, 0);
    const sold = data.products.reduce((sum, p) => sum + p[window].sales, 0);
    const would = views > 0 ? Math.floor((unsold.row.views * sold) / views) : 0;
    out.push({
      text: `“${unsold.title}” was opened ${n(unsold.row.views)} times and not bought: its page is the one to look at.`,
      tone: "bad",
      action: may.page
        ? { label: "Test a second headline", href: `/studio/pages?product=${encodeURIComponent(unsold.id)}&test=headline` }
        : { label: "See your products", section: "products" },
      math:
        would > 0 && average > 0
          ? `At your store's rate of ${pct(sold, views)} of product views becoming sales, ${n(unsold.row.views)} views come to ${n(would)} ${would === 1 ? "sale" : "sales"}: ${money(would * average)} at your average order. Arithmetic, not a forecast.`
          : undefined,
    });
  }

  // 8. An item low on the store page that those who reach it click.
  const reach = data.reach?.[window];
  if (reach && reach.visitors >= 30) {
    const average = reach.rows.reduce((sum, r) => sum + r.clicks, 0) / Math.max(1, reach.rows.reduce((sum, r) => sum + r.reached, 0));
    const buried = reach.rows.find((r) => r.position >= 3 && r.kind !== "part" && r.reached >= 10 && r.clicks / r.reached >= 2 * average && r.reached / reach.visitors <= 0.5);
    if (buried) {
      out.push({
        text: `“${buried.title}” is clicked by ${pct(buried.clicks, buried.reached)} of those who reach it, but only ${pct(buried.reached, reach.visitors)} of visitors get that far down: worth moving up.`,
        tone: "info",
        action: may.page ? { label: "Reorder your products", href: "/studio#products" } : { label: "See how far they read", section: "reach" },
      });
    }
  }

  // 9. What buyers said, and what visitors could not find.
  const heard = data.heard?.[window] ?? [];
  const heardTotal = heard.reduce((sum, r) => sum + r.buyers, 0);
  if (heard[0] && heardTotal >= 5 && heard[0].buyers / heardTotal >= 0.4 && isHeardAnswer(heard[0].answer)) {
    out.push({ text: `Most buyers who answered heard of you from “${HEARD_NAMES[heard[0].answer]}”: ${n(heard[0].buyers)} of ${n(heardTotal)}.`, tone: "info" });
  }
  const missed = data.searchMisses?.[window]?.[0];
  if (missed && missed.visits >= 3) {
    out.push({ text: `“${missed.name}” was searched for in your store ${n(missed.visits)} times and not found.`, tone: "info" });
  }

  // 10. A channel whose sales come back as refunds.
  const refunds = data.refunds?.[window] ?? [];
  for (const row of refunds) {
    const sold = channels.find((c) => c.source === (row.source || "direct"))?.cents ?? 0;
    if (row.refunds >= 2 && sold > 0 && row.cents / sold >= 0.2 && row.source !== "unrecorded") {
      out.push({ text: `${pct(row.cents, sold)} of what ${channelName(row.source || "direct")} sold was refunded in the last ${span}.`, tone: "bad", action: { label: "Compare your channels", section: "channels" }, math: `${money(row.cents)} refunded of ${money(sold)} sold.` });
      break;
    }
  }

  return out.slice(0, max);
}
