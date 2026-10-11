/**
 * What the creator spent on ads, set against what each channel brought
 * (added 11 October 2026). Pure, so the studio's panel, the server and the
 * tests read it the same way; kept by lib/ad-spend.ts.
 *
 * Revenue alone says where money came from; it does not say where money was
 * made. A channel that brought $900 on $1,200 of ads lost $300, and only the
 * creator knows the $1,200. So they type it in — the channel, a post or
 * campaign if they like, the amount, and the days it ran — and each channel's
 * row gains what was spent, what is left, and how much came back for each
 * dollar. Typed, not read from the ad networks: nothing to connect, nothing
 * of the creator's handed to anybody, and it works for a sponsor paid by
 * transfer as well as for Meta.
 *
 * An amount that ran over several days is spread evenly over them, and a
 * window is charged the part of it that fell inside. Amounts are in the
 * store's currency, in its smallest unit, like every other figure there.
 */

export type AdSpend = {
  id: string;
  /** The channel, as the numbers count it: "instagram", "tiktok", a utm_source. */
  channel: string;
  /** A post or campaign, as its utm_campaign; empty for the whole channel. */
  campaign: string;
  cents: number;
  /** First and last day it ran, inclusive (UTC). */
  from: string;
  to: string;
};

export const MAX_SPEND_ENTRIES = 300;
/** A million in the store's currency, which no single line a creator types should be over. */
export const MAX_SPEND_CENTS = 100_000_000;
const DAY = /^\d{4}-\d{2}-\d{2}$/;
const DAY_MS = 86_400_000;

/** A channel or campaign as the numbers count it: lower case, letters, digits, dots, dashes, underscores. */
export function spendTag(raw: unknown, max = 30): string {
  return typeof raw === "string" ? raw.trim().toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, max) : "";
}

function dayValue(raw: string): number | null {
  if (!DAY.test(raw)) return null;
  const at = Date.parse(`${raw}T00:00:00Z`);
  return Number.isFinite(at) && new Date(at).toISOString().slice(0, 10) === raw ? at : null;
}

/** Days from `from` to `to`, both counted. */
export function daysBetween(from: string, to: string): number {
  const a = dayValue(from);
  const b = dayValue(to);
  return a === null || b === null || b < a ? 0 : Math.round((b - a) / DAY_MS) + 1;
}

/**
 * An entry as typed, made whole, or the reason it cannot be one. The days
 * must be real, in order, no more than 400 apart and not in the future, the
 * amount a positive whole number of cents, and the channel a word.
 */
export function readSpend(input: { channel: unknown; campaign?: unknown; cents: unknown; from: unknown; to: unknown }, now = Date.now()):
  | { ok: true; spend: Omit<AdSpend, "id"> }
  | { ok: false; reason: "channel" | "amount" | "days" } {
  const channel = spendTag(input.channel);
  if (!channel || channel === "direct") return { ok: false, reason: "channel" };
  const cents = Number(input.cents);
  if (!Number.isInteger(cents) || cents <= 0 || cents > MAX_SPEND_CENTS) return { ok: false, reason: "amount" };
  const from = typeof input.from === "string" ? input.from : "";
  const to = typeof input.to === "string" ? input.to : "";
  const span = daysBetween(from, to);
  const last = dayValue(to);
  if (!span || span > 400 || last === null || last > now + DAY_MS) return { ok: false, reason: "days" };
  return { ok: true, spend: { channel, campaign: spendTag(input.campaign, 40), cents, from, to } };
}

/** The part of an entry that fell between two days, both counted: spread evenly over the days it ran. */
export function spendWithin(entry: Pick<AdSpend, "cents" | "from" | "to">, from: string, to: string): number {
  const span = daysBetween(entry.from, entry.to);
  if (!span) return 0;
  const start = entry.from > from ? entry.from : from;
  const end = entry.to < to ? entry.to : to;
  const inside = daysBetween(start, end);
  return inside ? Math.round((entry.cents * inside) / span) : 0;
}

/** What was spent on each channel, and on each campaign, between two days. */
export function spendBy(entries: AdSpend[], from: string, to: string): { channels: Map<string, number>; campaigns: Map<string, number>; total: number } {
  const channels = new Map<string, number>();
  const campaigns = new Map<string, number>();
  let total = 0;
  for (const entry of entries) {
    const cents = spendWithin(entry, from, to);
    if (!cents) continue;
    total += cents;
    channels.set(entry.channel, (channels.get(entry.channel) ?? 0) + cents);
    if (entry.campaign) campaigns.set(entry.campaign, (campaigns.get(entry.campaign) ?? 0) + cents);
  }
  return { channels, campaigns, total };
}
