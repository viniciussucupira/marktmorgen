/** Visit allowances, and where a month's visits stop.
 * A visitor count is not a bound on requests, transferred bytes, database
 * operations or CPU. These figures alone do not prove a funded cost ceiling
 * or the required 60% after-all-tax margin. Provider enforcement and the
 * commercial review must cover every resource at full simultaneous usage.
 *
 * Since 17 October 2026 visits past a plan's figure are never sold. A visit
 * was billed at VISIT_CENTS_PER_THOUSAND_OVER, half a cent for ten, against
 * about a fortieth of a cent of cost (tests/traffic-cost.ts): more than the
 * 17.2% of a price that a cost may be and still leave the owner's 60% after
 * a 27.5% tax. The price is not changed; it is no longer charged. Instead a
 * month's visits stop at the plan's figure, for every standing:
 *
 *   - the store's public pages (its page, products, blog, collections, the
 *     checkout script's cards) rest at publicVisitLimit, the figure less the
 *     share kept for buyers (BUYER_RESERVE_BPS);
 *   - what buyers already have (courses and lessons, the community and its
 *     live room, a private podcast's feed) goes on until the whole figure,
 *     then rests too, with a page that says their access is kept;
 *   - a checkout already open is never part of it: the checkout and the page
 *     after paying are not visits (lib/order-rules.ts stops new orders).
 */
import { ROOM_GRANT_MINUTES } from "@/lib/chat-pace";
import type { Tier } from "@/lib/plan";
import { type PlanFields, standingOf } from "@/lib/plan-standing";

/** Visits every plan covers, per store, per calendar month. */
export const VISITS_INCLUDED: Record<Tier, number> = {
  creator: 3_000,
  pro: 10_000,
  scale: 50_000,
};

/**
 * What a thousand visits past that cost the creator, in cents, until 17
 * October 2026. Kept as the published price it was; nothing is billed at it
 * any more (see the top of this file).
 */
export const VISIT_CENTS_PER_THOUSAND_OVER = 50;

/**
 * The share of a month's visits kept for buyers' own pages, in hundredths of
 * a percent: public pages rest at 95% of the figure, so a store whose page is
 * busy does not shut its students and members out with it.
 */
export const BUYER_RESERVE_BPS = 500;

/** Where a store's public pages rest, for a month's figure. */
export function publicVisitLimit(limit: number): number {
  if (!Number.isSafeInteger(limit) || limit <= 0) return 0;
  return limit - Math.floor((limit * BUYER_RESERVE_BPS) / 10_000);
}

/** The live room is counted in hundredths of a visit. */
export const PARTS_PER_VISIT = 100;

/**
 * What those minutes of the room count as, in hundredths of a visit: with
 * people talking, when it asks every few seconds, and with the room quiet,
 * when it asks twice a minute.
 */
export const ROOM_LIVE_PARTS = 260;
export const ROOM_IDLE_PARTS = 60;

/** "2.6", "0.6": hundredths of a visit as a figure a page can print. */
export function partsWords(parts: number): string {
  return String(Number((Math.max(0, parts) / PARTS_PER_VISIT).toFixed(2)));
}

/** An hour of the room for one member, in visits: "16" while people talk, "3.6" while it is quiet. */
export function roomHourWords(parts: number): string {
  const visits = (Math.max(0, parts) * (60 / ROOM_GRANT_MINUTES)) / PARTS_PER_VISIT;
  return String(Number(visits.toFixed(visits >= 10 ? 0 : 1)));
}

/** Visits a store with no plan has in a month, before one is started and after one has ended. */
export const SETUP_VISITS = 500;

/**
 * Visits a store has in a month of its free trial, whichever plan the trial
 * is of: what the smallest plan covers. A trial has paid nothing yet, and a
 * larger figure would be handed out for a card number alone.
 */
export const TRIAL_VISITS = VISITS_INCLUDED.creator;

/** The visits a store's plan covers in a month. */
export function visitsIncluded(tier: Tier): number {
  return Object.hasOwn(VISITS_INCLUDED, tier) ? VISITS_INCLUDED[tier] : VISITS_INCLUDED.creator;
}

/** Finite monthly counted-visit threshold for every standing, including paid plans:
 * where buyers' own pages rest. Public pages rest at publicVisitLimit of it.
 * This is not a request/byte ceiling: provider exposure still needs its own bound.
 */
export function visitLimitFor(store: PlanFields & { tier?: Tier }, nowSeconds = Date.now() / 1000): number {
  const standing = standingOf(store, nowSeconds);
  if (standing === "paid") return visitsIncluded(store.tier ?? "creator");
  return standing === "trial" ? TRIAL_VISITS : SETUP_VISITS;
}

/** "4,812 visits", "1 visit": a count, for a page or an email. */
export function visitsWords(visits: number): string {
  const counted = Number.isFinite(visits) && visits > 0 ? Math.floor(visits) : 0;
  return `${counted.toLocaleString("en-US")} ${counted === 1 ? "visit" : "visits"}`;
}

/** "5,000", "30,000": a figure with its thousands marked. */
export function countWords(count: number): string {
  return Math.max(0, Math.floor(count)).toLocaleString("en-US");
}

/**
 * The address a visitor is told apart by, for one day: as it is for the old
 * kind, and the network it belongs to for the new kind, where one
 * subscriber is handed more addresses than there are grains of sand and
 * could otherwise be counted as that many people.
 */
export function visitorAddress(ip: string): string {
  const address = ip.trim().toLowerCase();
  if (!address.includes(":")) return address || "unknown";
  // An old address written the new way ("::ffff:203.0.113.9") is the old address.
  const mapped = /^::ffff:(\d{1,3}(?:\.\d{1,3}){3})$/.exec(address);
  if (mapped) return mapped[1];
  // The first four groups of the eight: the network, whatever follows it.
  const [head, tail = ""] = address.split("::");
  const front = head ? head.split(":") : [];
  const back = tail ? tail.split(":") : [];
  const missing = Math.max(0, 8 - front.length - back.length);
  const groups = address.includes("::") ? [...front, ...Array<string>(missing).fill("0"), ...back] : front;
  if (groups.length !== 8 || groups.some((group) => !/^[0-9a-f]{1,4}$/.test(group))) return address;
  return `${groups
    .slice(0, 4)
    .map((group) => group.replace(/^0+(?=.)/, ""))
    .join(":")}::/64`;
}
