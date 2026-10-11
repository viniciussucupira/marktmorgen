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
import { type Ranked, type StatsData, readSales, readStats, studioStats } from "@/lib/stats";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { deriveKey } from "@/lib/secret-box";
import { formatMoney } from "@/lib/money";
import { SITE_URL } from "@/lib/site-url";

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
};
const channelWord = (source: string) => CHANNEL_WORDS[source] ?? source;

/** The week's email, in words. Null when the store had no visitors in the week: nothing to say. */
export function weeklyMessage(store: Store, data: StatsData, stopUrl: string): { subject: string; text: string } | null {
  const week = data.totals.d7;
  if (week.visitors === 0) return null;
  const known = data.sales === "ok";
  const money = (cents: number) => formatMoney(cents, data.currency ?? "usd");
  const people = `${week.visitors.toLocaleString("en-US")} ${week.visitors === 1 ? "visitor" : "visitors"}`;
  const subject = known
    ? `${store.name}: ${people} and ${money(week.cents)} in sales this week`
    : `${store.name}: ${people} this week`;

  const lines: string[] = [];
  lines.push(`Here is ${store.name} over the last 7 days.`, "");
  lines.push(`Visitors: ${week.visitors.toLocaleString("en-US")}`);
  lines.push(`Checkouts started: ${week.checkouts.toLocaleString("en-US")}`);
  if (known) {
    lines.push(`Sales: ${week.sales.toLocaleString("en-US")}, ${money(week.cents)} before Stripe's fee`);
    const renewals = data.renewals?.d7;
    if (renewals && renewals.payments > 0) lines.push(`Renewals: ${renewals.payments.toLocaleString("en-US")}, ${money(renewals.cents)}`);
  } else if (data.sales === "none") {
    lines.push("Sales: connect Stripe in your studio to see them here.");
  }

  const channels = (data.channels?.d7 ?? []).slice(0, 3);
  if (channels.length) {
    lines.push("", "Where it came from:");
    for (const c of channels) {
      const sold = known && c.sales > 0 ? `, ${c.sales} ${c.sales === 1 ? "sale" : "sales"} (${money(c.cents)})` : "";
      lines.push(`- ${channelWord(c.source)}: ${c.visits.toLocaleString("en-US")} ${c.visits === 1 ? "visit" : "visits"}${sold}`);
    }
  }

  lines.push("", `Everything, day by day and channel by channel, is in your studio: ${SITE_URL}/studio`);
  lines.push("", `You get this every Monday while your store has visitors. To stop it: ${stopUrl}`);
  return { subject: subject.slice(0, 180), text: lines.join("\n") };
}
