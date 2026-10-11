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
 * Pure: the studio's panel and the weekly email both call it on StatsData.
 */
import type { StatsData } from "@/lib/stats";
import { type AdSpend, spendBy } from "@/lib/ad-spend-rules";
import { channelName } from "@/lib/channel-names";
import { HEARD_NAMES, isHeardAnswer } from "@/lib/heard-rules";
import { formatMoney } from "@/lib/money";

export type Insight = { text: string; tone: "good" | "bad" | "info" };

type Window = "d7" | "d30" | "d90";
const SPAN: Record<Window, string> = { d7: "7 days", d30: "30 days", d90: "90 days" };
const DAYS: Record<Window, number> = { d7: 7, d30: 30, d90: 90 };

const pct = (part: number, whole: number) => {
  const value = whole ? (part / whole) * 100 : 0;
  return `${value < 10 ? value.toFixed(1) : Math.round(value)}%`;
};
const n = (value: number) => value.toLocaleString("en-US");

/** Up to `max` sentences for one window, the ones that matter most first. */
export function insightsFrom(data: StatsData, window: Window, spends: AdSpend[] = [], max = 4): Insight[] {
  const out: Insight[] = [];
  const money = (cents: number) => formatMoney(cents, data.currency ?? "usd");
  const known = data.sales === "ok";
  const now = data.totals[window];
  const before = data.previous?.[window];
  const span = SPAN[window];

  // 1. Ads that cost more than they brought, in these days.
  if (known && spends.length && data.days.length) {
    const days = data.days.slice(-DAYS[window]);
    const spent = spendBy(spends, days[0].date, days[days.length - 1].date);
    for (const [channel, cost] of spent.channels) {
      const brought = data.channels?.[window]?.find((row) => row.source === channel)?.cents ?? 0;
      if (cost >= 1000 && brought < cost) {
        out.push({ text: `Ads on ${channelName(channel)} cost ${money(cost)} in the last ${span} and brought ${money(brought)} in sales.`, tone: "bad" });
      }
    }
  }

  // 2. Visitors up or down on the same stretch before.
  if (before && before.visitors >= 20 && now.visitors > 0) {
    const change = (now.visitors - before.visitors) / before.visitors;
    if (Math.abs(change) >= 0.25) {
      out.push({
        text: `${change > 0 ? "More" : "Fewer"} people visited: ${n(now.visitors)} in the last ${span}, ${change > 0 ? "up" : "down"} ${pct(Math.abs(change), 1)} on the ${span} before.`,
        tone: change > 0 ? "good" : "bad",
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
      });
    }
  }

  // 4. Checkouts started and not paid.
  if (known && now.checkouts >= 10 && now.sales / now.checkouts < 0.3) {
    out.push({
      text: `Of ${n(now.checkouts)} checkouts started, ${n(now.sales)} ${now.sales === 1 ? "was" : "were"} paid. Open a product as a buyer and go as far as the payment page to see what they see.`,
      tone: "bad",
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
    });
  }

  // 6. Where the money came from, when one channel brought most of it.
  const total = channels.reduce((sum, row) => sum + row.cents, 0);
  const top = [...channels].sort((a, b) => b.cents - a.cents)[0];
  if (known && top && top.source !== "direct" && total > 0 && top.sales >= 3 && top.cents / total >= 0.5) {
    out.push({ text: `${channelName(top.source)} brought ${pct(top.cents, total)} of your money in the last ${span}: ${money(top.cents)} from ${n(top.sales)} sales.`, tone: "good" });
  }

  // 7. A product opened often and not bought.
  const unsold = data.products
    .map((p) => p[window])
    .map((row, i) => ({ row, title: data.products[i].title }))
    .filter(({ row }) => row.views >= 50 && row.sales === 0)
    .sort((a, b) => b.row.views - a.row.views)[0];
  if (known && unsold) {
    out.push({ text: `“${unsold.title}” was opened ${n(unsold.row.views)} times and not bought: its page is the one to look at.`, tone: "bad" });
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
      out.push({ text: `${pct(row.cents, sold)} of what ${channelName(row.source || "direct")} sold was refunded in the last ${span}.`, tone: "bad" });
      break;
    }
  }

  return out.slice(0, max);
}
