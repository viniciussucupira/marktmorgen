/**
 * A store's numbers as data, for the two places they leave the studio
 * (added 11 October 2026): the API (/api/v1/stats), for a creator's own tools
 * and assistants, and the weekly email, which brings the week to the creator
 * instead of waiting for them to open the studio.
 *
 * Both are read from exactly what the studio reads (lib/stats.ts): visits
 * from our counts, money from the creator's own Stripe account. Nothing new
 * is recorded for either.
 */
import { createHmac, timingSafeEqual } from "node:crypto";
import type { Store } from "@/lib/store";
import { type Ranked, type StatsData, readSales, readStats, sourcesToday, studioStats, viewsBefore } from "@/lib/stats";
import { NIMBUS_FROM, isSenderConfigured, sendEmail } from "@/lib/email";
import { standingOf } from "@/lib/plan-standing";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { deriveKey } from "@/lib/secret-box";
import { formatMoney } from "@/lib/money";
import { insightsFrom } from "@/lib/insights";
import type { AdSpend } from "@/lib/ad-spend-rules";
import { SITE_URL } from "@/lib/site-url";
import { goalProgress, moneyByDay, monthTitle } from "@/lib/sales-goal-rules";

type Window = "d7" | "d30" | "d90";
const WINDOWS: Window[] = ["d7", "d30", "d90"];

export type SummaryWindow = {
  visitors: number;
  page_views: number;
  checkouts: number;
  sales: number | null;
  revenue: number | null;
  channels: { channel: string; visits: number; checkouts: number; signups: number; sales: number | null; revenue: number | null }[];
  countries: { country: string; views: number }[];
  devices: { device: string; views: number }[];
  /** The same number of days just before, to compare with; sales and revenue null where they were not read in full. */
  previous: { visitors: number; page_views: number; checkouts: number; sales: number | null; revenue: number | null };
  /** Refunds given in the window; null when they were not read. */
  refunded: number | null;
  /** Money by the buyer's country, and by the ad it came from (utm_content), the biggest first. */
  sales_by_country: { country: string; sales: number; revenue: number }[];
  ads: { ad: string; channel: string; campaign: string; sales: number; revenue: number }[];
};

export type Summary = {
  currency: string;
  /** "ok" when sales were read from Stripe, "none" with no Stripe account, "error" when Stripe did not answer. */
  sales: StatsData["sales"];
  days: Record<"last_7_days" | "last_30_days" | "last_90_days", SummaryWindow>;
};

const NAMES: Record<Window, keyof Summary["days"]> = { d7: "last_7_days", d30: "last_30_days", d90: "last_90_days" };

/** The studio's numbers for a store, or null when its counts cannot be read. */
export async function readNumbers(store: Store, now = Date.now()): Promise<StatsData | null> {
  const stats = await readStats(store, now);
  if (!stats) return null;
  let state: StatsData["sales"] = store.stripeAccountId ? "ok" : "none";
  const sales = store.stripeAccountId
    ? await readSales(store, now).catch((error) => {
        console.error("reading sales for a summary failed", error);
        state = "error";
        return null;
      })
    : null;
  // No products listed: neither reader shows them, and reading them costs.
  return studioStats(store, stats, sales, state, []);
}

/** What /api/v1/stats answers: the last 7, 30 and 90 days, money in the smallest unit of the store's currency. */
export function summaryOf(data: StatsData): Summary {
  const known = data.sales === "ok";
  const ranked = <K extends string>(rows: Ranked, key: K) => rows.map((r) => ({ [key]: r.name, views: r.visits })) as ({ [P in K]: string } & { views: number })[];
  const days = {} as Summary["days"];
  for (const w of WINDOWS) {
    const t = data.totals[w];
    days[NAMES[w]] = {
      visitors: t.visitors,
      page_views: t.views,
      checkouts: t.checkouts,
      sales: known ? t.sales : null,
      revenue: known ? t.cents : null,
      channels: (data.channels?.[w] ?? []).map((c) => ({
        channel: c.source,
        visits: c.visits,
        checkouts: c.checkouts,
        signups: c.free,
        sales: known ? c.sales : null,
        revenue: known ? c.cents : null,
      })),
      countries: ranked(data.countries?.[w] ?? [], "country"),
      devices: ranked(data.devices?.[w] ?? [], "device"),
      previous: (() => {
        const p = data.previous?.[w];
        return {
          visitors: p?.visitors ?? 0,
          page_views: p?.views ?? 0,
          checkouts: p?.checkouts ?? 0,
          sales: known && p ? p.sales : null,
          revenue: known && p ? p.cents : null,
        };
      })(),
      refunded: known && data.refunds ? data.refunds[w].reduce((n, r) => n + r.cents, 0) : null,
      sales_by_country: known ? (data.salesCountries?.[w] ?? []).slice(0, 20).map((r) => ({ country: r.country, sales: r.sales, revenue: r.cents })) : [],
      ads: known ? (data.ads?.[w] ?? []).slice(0, 20).map((r) => ({ ad: r.content, channel: r.source, campaign: r.campaign, sales: r.sales, revenue: r.cents })) : [],
    };
  }
  return { currency: data.currency, sales: data.sales, days };
}

// ---- The weekly email ------------------------------------------------------------

const OFF = "nl:weekly:off";
const sentKey = (week: string, handle: string) => `nl:weekly:sent:${week}:${handle}`;

/** The week an email belongs to, as the Monday it starts on (UTC). */
export function weekOf(now = Date.now()): string {
  const d = new Date(now);
  const back = (d.getUTCDay() + 6) % 7;
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate() - back)).toISOString().slice(0, 10);
}

/** The token in a weekly email's stop link: the store's handle, signed with a key only this deployment has. */
export function weeklyToken(handle: string): string {
  const key = deriveKey("weekly-report");
  if (!key) return "";
  return createHmac("sha256", key).update(`weekly|${handle}`).digest("base64url").slice(0, 32);
}

export function weeklyTokenOk(handle: string, token: string): boolean {
  const want = weeklyToken(handle);
  if (!want || token.length !== want.length) return false;
  return timingSafeEqual(Buffer.from(want), Buffer.from(token));
}

export async function weeklyOff(handle: string): Promise<boolean> {
  if (!isRedisConfigured()) return false;
  const [member] = await redisPipeline([["SISMEMBER", OFF, handle]]);
  return Number(member) === 1;
}

export async function setWeeklyOff(handle: string, off: boolean): Promise<void> {
  if (!isRedisConfigured()) return;
  await redisPipeline([[off ? "SADD" : "SREM", OFF, handle]]);
}

// ---- The weekly email to the team (added 11 October 2026) ---------------------

/**
 * Team members the owner chose to send the weekly email to as well
 * (Fathom and Umami send their reports to a team the same way). Each is
 * checked against the team when the email goes, so somebody removed from the
 * team, or whose role no longer sees the numbers, gets nothing; and each has
 * their own stop link, which stops only their copy.
 */
const teamKey = (handle: string) => `nl:weekly:to:${handle}`;
export const MAX_WEEKLY_TEAM = 5;

export async function weeklyTeam(handle: string): Promise<string[]> {
  if (!isRedisConfigured()) return [];
  const [members] = await redisPipeline([["SMEMBERS", teamKey(handle)]]);
  return Array.isArray(members) ? (members as unknown[]).map(String).sort() : [];
}

export async function setWeeklyTeam(handle: string, emails: string[]): Promise<void> {
  if (!isRedisConfigured()) return;
  const clean = [...new Set(emails.map((e) => e.trim().toLowerCase()).filter(Boolean))].slice(0, MAX_WEEKLY_TEAM);
  await redisPipeline([["DEL", teamKey(handle)], ...(clean.length ? [["SADD", teamKey(handle), ...clean]] : [])]);
}

export async function leaveWeeklyTeam(handle: string, email: string): Promise<void> {
  if (!isRedisConfigured()) return;
  await redisPipeline([["SREM", teamKey(handle), email.trim().toLowerCase()]]);
}

/** A team member's own stop link token: the store and their address, signed. */
export function weeklyMemberToken(handle: string, email: string): string {
  const key = deriveKey("weekly-report");
  if (!key) return "";
  return createHmac("sha256", key).update(`weekly|${handle}|${email.trim().toLowerCase()}`).digest("base64url").slice(0, 32);
}

export function weeklyMemberTokenOk(handle: string, email: string, token: string): boolean {
  const want = weeklyMemberToken(handle, email);
  if (!want || token.length !== want.length) return false;
  return timingSafeEqual(Buffer.from(want), Buffer.from(token));
}

/** Claims this week's email for a store; false when it was already claimed, so nobody gets two. */
export async function claimWeek(handle: string, now = Date.now()): Promise<boolean> {
  if (!isRedisConfigured()) return false;
  const [ok] = await redisPipeline([["SET", sentKey(weekOf(now), handle), "1", "NX", "EX", 9 * 86400]]);
  return ok !== null;
}

const CHANNEL_WORDS: Record<string, string> = {
  direct: "direct or unknown",
  instagram: "Instagram",
  tiktok: "TikTok",
  youtube: "YouTube",
  facebook: "Facebook",
  x: "X",
  google: "Google",
  email: "email",
  linkedin: "LinkedIn",
  pinterest: "Pinterest",
  threads: "Threads",
  reddit: "Reddit",
  chatgpt: "ChatGPT",
  perplexity: "Perplexity",
  claude: "Claude",
  gemini: "Gemini",
  copilot: "Copilot",
  deepseek: "DeepSeek",
  grok: "Grok",
};
const channelWord = (source: string) => CHANNEL_WORDS[source] ?? source;

/** The week's email, in words. Null when the store had no visitors in the week: nothing to say. */
export function weeklyMessage(store: Store, data: StatsData, stopUrl: string, spends: AdSpend[] = [], goal = 0): { subject: string; text: string } | null {
  const week = data.totals.d7;
  if (week.visitors === 0) return null;
  const known = data.sales === "ok";
  const money = (cents: number) => formatMoney(cents, data.currency ?? "usd");
  const people = `${week.visitors.toLocaleString("en-US")} ${week.visitors === 1 ? "visitor" : "visitors"}`;
  const subject = known
    ? `${store.name}: ${people} and ${money(week.cents)} in sales this week`
    : `${store.name}: ${people} this week`;

  const before = data.previous?.d7;
  // "(up 23% on the week before)", or nothing when there is nothing honest to say.
  const against = (now: number, then: number | null | undefined) => {
    if (then === null || then === undefined || then === 0) return "";
    const value = ((now - then) / then) * 100;
    if (Math.abs(value) < 0.5) return " (the same as the week before)";
    const shown = Math.abs(value) < 10 ? Math.abs(value).toFixed(1) : String(Math.round(Math.abs(value)));
    return ` (${value > 0 ? "up" : "down"} ${shown}% on the week before)`;
  };
  const lines: string[] = [];
  lines.push(`Here is ${store.name} over the last 7 days.`, "");
  lines.push(`Visitors: ${week.visitors.toLocaleString("en-US")}${against(week.visitors, before?.visitors)}`);
  lines.push(`Checkouts started: ${week.checkouts.toLocaleString("en-US")}${against(week.checkouts, before?.checkouts)}`);
  if (known) {
    lines.push(`Sales: ${week.sales.toLocaleString("en-US")}, ${money(week.cents)} before Stripe's fee${against(week.cents, before?.cents)}`);
    const renewals = data.renewals?.d7;
    if (renewals && renewals.payments > 0) lines.push(`Renewals: ${renewals.payments.toLocaleString("en-US")}, ${money(renewals.cents)}`);
  } else if (data.sales === "none") {
    lines.push("Sales: connect Stripe in your studio to see them here.");
  }
  const line = known ? goalLine(data, goal, money) : "";
  if (line) lines.push(line);

  const channels = (data.channels?.d7 ?? []).slice(0, 3);
  if (channels.length) {
    lines.push("", "Where it came from:");
    for (const c of channels) {
      const sold = known && c.sales > 0 ? `, ${c.sales} ${c.sales === 1 ? "sale" : "sales"} (${money(c.cents)})` : "";
      lines.push(`- ${channelWord(c.source)}: ${c.visits.toLocaleString("en-US")} ${c.visits === 1 ? "visit" : "visits"}${sold}`);
    }
  }

  const worth = insightsFrom(data, "d7", spends, 3);
  if (worth.length) {
    lines.push("", "Worth knowing:");
    for (const item of worth) lines.push(`- ${item.text}`);
  }

  lines.push("", `Everything, day by day and channel by channel, is in your studio: ${SITE_URL}/studio`);
  lines.push("", `You get this every Monday while your store has visitors. To stop it: ${stopUrl}`);
  return { subject: subject.slice(0, 180), text: lines.join("\n") };
}

/** "October goal: $1,240 of $3,000 (41%) …", or "" with no goal. */
function goalLine(data: StatsData, goal: number, money: (cents: number) => string): string {
  const today = data.days[data.days.length - 1]?.date ?? "";
  const progress = goalProgress(goal, moneyByDay(data.channelDays), today);
  if (!progress) return "";
  const name = monthTitle(progress.month).split(" ")[0];
  const share = `${Math.floor(progress.share * 100)}%`;
  if (progress.reachedOn) {
    return `${name} goal: reached on ${name} ${Number(progress.reachedOn.slice(8))}, ${money(progress.done)} of ${money(progress.goal)} (${share}).`;
  }
  const left = progress.days - progress.day;
  return `${name} goal: ${money(progress.done)} of ${money(progress.goal)} (${share})${left > 0 ? `, ${money(progress.perDay)} a day needed for the ${left} ${left === 1 ? "day" : "days"} left` : ""}.`;
}

// ---- The monthly email ------------------------------------------------------------

const monthSentKey = (month: string, handle: string) => `nl:monthly:sent:${month}:${handle}`;

/** The month before the one `now` is in, "2026-09". */
export function lastMonthOf(now = Date.now()): string {
  const d = new Date(now);
  return new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth() - 1, 1)).toISOString().slice(0, 7);
}

/** Claims a month's email for a store; false when it was already claimed. */
export async function claimMonth(handle: string, month: string): Promise<boolean> {
  if (!isRedisConfigured()) return false;
  const [ok] = await redisPipeline([["SET", monthSentKey(month, handle), "1", "NX", "EX", 40 * 86400]]);
  return ok !== null;
}

/**
 * The month's email (added 11 October 2026), sent on the 1st for the month
 * just ended, as Kissmetrics and Baremetrics send theirs: the month's
 * visitors, sales and money set beside the month before, the channels the
 * money came from, its best day, and the goal if there was one. Read from the
 * same 90 days the studio reads, so the month before is there in full. Null
 * when the month had no visitors and no money.
 */
export function monthlyMessage(store: Store, data: StatsData, month: string, stopUrl: string, goal = 0): { subject: string; text: string } | null {
  const known = data.sales === "ok";
  const money = (cents: number) => formatMoney(cents, data.currency ?? "usd");
  const byDay = moneyByDay(data.channelDays);
  const [y, m] = month.split("-").map(Number);
  const before = new Date(Date.UTC(y, m - 2, 1)).toISOString().slice(0, 7);
  const sum = (which: string) => {
    const days = data.days.filter((d) => d.date.startsWith(which));
    return {
      visitors: days.reduce((n, d) => n + d.visitors, 0),
      checkouts: days.reduce((n, d) => n + d.checkouts, 0),
      sales: days.reduce((n, d) => n + d.sales, 0),
      cents: Object.entries(byDay).reduce((n, [day, cents]) => (day.startsWith(which) ? n + cents : n), 0),
    };
  };
  const now = sum(month);
  if (now.visitors === 0 && now.cents === 0) return null;
  // The month before only when the days read start at its first day or earlier.
  const then = data.days[0] && data.days[0].date <= `${before}-01` ? sum(before) : null;
  const against = (a: number, b: number | undefined) => {
    if (!b) return "";
    const value = ((a - b) / b) * 100;
    if (Math.abs(value) < 0.5) return " (the same as the month before)";
    const shown = Math.abs(value) < 10 ? Math.abs(value).toFixed(1) : String(Math.round(Math.abs(value)));
    return ` (${value > 0 ? "up" : "down"} ${shown}% on the month before)`;
  };
  const title = monthTitle(month);
  const lines = [`Here is ${store.name} in ${title}.`, ""];
  lines.push(`Visitors: ${now.visitors.toLocaleString("en-US")}${against(now.visitors, then?.visitors)}`);
  lines.push(`Checkouts started: ${now.checkouts.toLocaleString("en-US")}${against(now.checkouts, then?.checkouts)}`);
  if (known) {
    lines.push(`Sales: ${now.sales.toLocaleString("en-US")}`);
    lines.push(`Money from sales and renewals: ${money(now.cents)} before Stripe's fee${against(now.cents, then?.cents)}`);
    const channels = Object.entries(data.channelDays ?? {})
      .map(([channel, days]) => ({ channel, cents: Object.entries(days).reduce((n, [day, c]) => (day.startsWith(month) ? n + c : n), 0) }))
      .filter((row) => row.cents > 0)
      .sort((a, b) => b.cents - a.cents)
      .slice(0, 3);
    if (channels.length) {
      lines.push("", "Where the money came from:");
      for (const c of channels) lines.push(`- ${channelWord(c.channel)}: ${money(c.cents)}`);
    }
    const best = Object.entries(byDay)
      .filter(([day]) => day.startsWith(month))
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))[0];
    if (best && best[1] > 0) {
      const [by, bm, bd] = best[0].split("-").map(Number);
      const name = new Date(Date.UTC(by, bm - 1, bd)).toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric", timeZone: "UTC" });
      lines.push("", `Best day: ${name}, ${money(best[1])}. Worth noting what you did that day.`);
    }
    if (goal > 0) {
      const share = Math.floor((now.cents / goal) * 100);
      lines.push(
        "",
        now.cents >= goal
          ? `Your goal of ${money(goal)} was reached: ${share}%.`
          : `Your goal was ${money(goal)}: ${money(now.cents)} came in, ${share}% of it.`,
      );
    }
  } else if (data.sales === "none") {
    lines.push("Sales: connect Stripe in your studio to see them here.");
  }
  lines.push("", `Everything, day by day, is in your studio: ${SITE_URL}/studio`);
  lines.push("", `You get this on the 1st of each month while your store has visitors. To stop it, the weekly one and the busy-day one: ${stopUrl}`);
  const subject = known ? `${store.name} in ${title}: ${money(now.cents)} from ${now.sales.toLocaleString("en-US")} ${now.sales === 1 ? "sale" : "sales"}` : `${store.name} in ${title}`;
  return { subject: subject.slice(0, 180), text: lines.join("\n") };
}

// ---- The busy-day alert ------------------------------------------------------------

/** The fewest store-page views in a day that can make a busy day. */
export const BUSY_FLOOR = 64;
/** How many times a usual day's views make a busy one. */
export const BUSY_TIMES = 3;

const busyKey = (handle: string, day: string) => `nl:busy:${day}:${handle}`;

/**
 * Whether today's views make a busy day: at least BUSY_FLOOR, at least
 * BUSY_TIMES a usual day of the last two weeks, and more than any one of them.
 * Pure, so the rule is held by a test.
 */
export function isBusy(today: number, before: number[]): { busy: boolean; times: number } {
  const usual = before.length ? before.reduce((a, b) => a + b, 0) / before.length : 0;
  const most = before.length ? Math.max(...before) : 0;
  const busy = today >= BUSY_FLOOR && today >= BUSY_TIMES * usual && today > most;
  return { busy, times: usual >= 5 ? Math.floor(today / usual) : 0 };
}

/**
 * The email when a store is busier than usual (added 11 October 2026): a post
 * is bringing people now, which is the moment to answer comments, pin the
 * post or post again — and the one the creator would otherwise learn about
 * the next week.
 *
 * Asked only when today's views reach 64, 128, 256 and so on (lib/visit.ts),
 * so it costs a visit nothing: the few reads it makes happen a handful of
 * times a day at most. Once a day per store, only for a store with a plan
 * running, and never for one whose creator stopped the numbers emails.
 */
export async function maybeBusyAlert(store: Store, today: number, now = Date.now()): Promise<boolean> {
  if (today < BUSY_FLOOR || (today & (today - 1)) !== 0) return false;
  if (!isRedisConfigured() || !isSenderConfigured()) return false;
  const standing = standingOf(store);
  if (standing !== "paid" && standing !== "trial") return false;
  if (await weeklyOff(store.handle)) return false;
  const verdict = isBusy(today, await viewsBefore(store, 14, now));
  if (!verdict.busy) return false;
  const day = new Date(now).toISOString().slice(0, 10);
  const [claimed] = await redisPipeline([["SET", busyKey(store.handle, day), "1", "NX", "EX", 2 * 86400]]);
  if (claimed === null) return false;

  const top = (await sourcesToday(store, now)).filter((s) => s.name !== "direct")[0];
  const token = weeklyToken(store.handle);
  const stopUrl = `${SITE_URL}/api/store/weekly?h=${encodeURIComponent(store.handle)}&t=${encodeURIComponent(token)}`;
  const lines = [
    `${store.name} is having a busy day: ${today.toLocaleString("en-US")} visits to your store page so far today${
      verdict.times >= 2 ? `, about ${verdict.times} times a usual day` : ", more than any day in the last two weeks"
    }.`,
    "",
    top ? `Most of them came from ${CHANNEL_WORDS[top.name] ?? top.name}.` : "",
    "While people are arriving is a good moment to answer comments, pin the post that is working, or share it again.",
    "",
    `See who is on your store right now and where they came from: ${SITE_URL}/studio`,
    "",
    `This comes at most once a day, on a day that is clearly busier than usual. To stop these emails and the weekly one: ${stopUrl}`,
  ].filter((line, i, all) => line !== "" || all[i - 1] !== "");
  return sendEmail({
    from: NIMBUS_FROM,
    to: store.email,
    subject: `${store.name} is busy today: ${today.toLocaleString("en-US")} visits so far`.slice(0, 180),
    text: lines.join("\n"),
    headers: { "List-Unsubscribe": `<${stopUrl}>` },
  }).catch(() => false);
}
