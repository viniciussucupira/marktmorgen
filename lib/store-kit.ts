/**
 * The creator's media kit (added 9 October 2026): one page at
 * /@handle/media-kit a brand reads before paying for a sponsored post — who
 * the creator is, how many people follow them where, who those people are,
 * what a collaboration costs and who they have worked with — with a way to
 * get in touch and a copy to save as a PDF.
 *
 * Beacons sells it as the reason creators pay for its plan; most stores have
 * nothing like it, so a creator keeps one in a design tool and sends it out
 * of date. Here it sits beside the store, in the store's look and language.
 *
 * Honest by construction. The follower numbers are the creator's own, typed
 * in the studio — nothing here can read them from the networks — so the page
 * says they are, and the date they were last changed (`stated`, set by the
 * server whenever a number changes). What the page says on its own account
 * is only what this site counted: the products listed and the buyers'
 * reviews. Brands are names in plain text, never logos.
 *
 * Kept on the store's record, so the page reads nothing else. Browser-safe.
 */
import { type SocialNetwork, isSocialNetwork } from "@/lib/store-socials";

export type KitAudience = {
  /** Where: a network from lib/store-socials.ts, "email" for a list, "website" for a site. */
  n: SocialNetwork;
  /** Followers, subscribers or monthly visitors, as the creator states them. */
  count: number;
  /** Average views of a post or video, when the creator gives it; 0 when not. */
  views: number;
};

export type KitRate = {
  /** What is offered: "One Instagram Reel", "A YouTube integration". */
  t: string;
  /** Its price in the store currency's smallest unit, or null for "ask". */
  cents: number | null;
};

export type StoreKit = {
  on: boolean;
  /** A few sentences to a brand: who the creator is and who listens to them. */
  pitch: string;
  audience: KitAudience[];
  /** About the audience, one line each: "68% in the US", "Most are 25 to 34". */
  facts: string[];
  rates: KitRate[];
  /** Brands worked with, as plain names. */
  brands: string[];
  /** The day the numbers were last changed (YYYY-MM-DD), "" before any were given. */
  stated: string;
  /**
   * Which numbers this site counted the page shows too (added 13 October
   * 2026; lib/verified-numbers.ts): visitors and sales of the last 30 days,
   * and buyers' countries. Off until the creator picks them.
   */
  counted: KitCounted;
};

export type KitCounted = { visitors: boolean; sales: boolean; countries: boolean };
export const NO_COUNTED: KitCounted = { visitors: false, sales: false, countries: false };

export const MAX_KIT_PITCH = 700;
export const MAX_KIT_AUDIENCE = 8;
export const MAX_KIT_FACTS = 6;
export const MAX_KIT_FACT = 120;
export const MAX_KIT_RATES = 8;
export const MAX_KIT_RATE_TITLE = 80;
export const MAX_KIT_BRANDS = 16;
export const MAX_KIT_BRAND = 40;
/** More than anybody has; a typo with three zeros too many is refused rather than shown. */
export const MAX_KIT_COUNT = 2_000_000_000;

export const NO_KIT: StoreKit = { on: false, pitch: "", audience: [], facts: [], rates: [], brands: [], stated: "", counted: { ...NO_COUNTED } };

const words = (input: unknown, max: number) => (typeof input === "string" ? input.replace(/\s+/g, " ").trim().slice(0, max) : "");
const whole = (input: unknown, max: number) => (typeof input === "number" && Number.isSafeInteger(input) && input >= 0 && input <= max ? input : -1);

/** Which counted numbers are shown: each one only when it is plainly asked for. */
export function parseCounted(raw: unknown): KitCounted {
  const value = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return { visitors: value.visitors === true, sales: value.sales === true, countries: value.countries === true };
}

/** Whatever came back from storage or a form, made safe to show. */
export function parseKit(raw: unknown): StoreKit {
  if (!raw || typeof raw !== "object") return { ...NO_KIT, audience: [], facts: [], rates: [], brands: [], counted: { ...NO_COUNTED } };
  const value = raw as Record<string, unknown>;
  const audience: KitAudience[] = [];
  for (const entry of Array.isArray(value.audience) ? value.audience : []) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    const count = whole(row.count, MAX_KIT_COUNT);
    if (!isSocialNetwork(row.n) || count <= 0 || audience.some((a) => a.n === row.n)) continue;
    audience.push({ n: row.n, count, views: Math.max(0, whole(row.views, MAX_KIT_COUNT)) });
    if (audience.length >= MAX_KIT_AUDIENCE) break;
  }
  const list = (input: unknown, most: number, each: number) =>
    [...new Set((Array.isArray(input) ? input : []).map((line) => words(line, each)).filter(Boolean))].slice(0, most);
  const rates: KitRate[] = [];
  for (const entry of Array.isArray(value.rates) ? value.rates : []) {
    if (!entry || typeof entry !== "object") continue;
    const row = entry as Record<string, unknown>;
    const t = words(row.t, MAX_KIT_RATE_TITLE);
    if (!t) continue;
    const cents = row.cents === null ? null : whole(row.cents, 100_000_000);
    rates.push({ t, cents: cents === null || cents <= 0 ? null : cents });
    if (rates.length >= MAX_KIT_RATES) break;
  }
  const stated = typeof value.stated === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value.stated) ? value.stated : "";
  return {
    on: value.on === true,
    pitch: typeof value.pitch === "string" ? value.pitch.replace(/\r\n?/g, "\n").replace(/\n{3,}/g, "\n\n").trim().slice(0, MAX_KIT_PITCH) : "",
    audience,
    facts: list(value.facts, MAX_KIT_FACTS, MAX_KIT_FACT),
    rates,
    brands: list(value.brands, MAX_KIT_BRANDS, MAX_KIT_BRAND),
    stated,
    counted: parseCounted(value.counted),
  };
}

/**
 * The kit to keep, from what the studio sent and what was kept before: made
 * safe, and dated today when any number in it changed, so the page never
 * shows an old date beside new numbers or a new date beside old ones.
 */
export function nextKit(sent: unknown, before: StoreKit, today: string): StoreKit {
  const kit = parseKit(sent);
  const numbers = (k: StoreKit) => JSON.stringify(k.audience);
  const changed = numbers(kit) !== numbers(before);
  return { ...kit, stated: kit.audience.length === 0 ? "" : changed || !before.stated ? today : before.stated };
}

/** Whether the page has anything to show a brand: on, with a pitch, a number or a rate. */
export function kitShown(kit: StoreKit): boolean {
  return kit.on && (kit.pitch !== "" || kit.audience.length > 0 || kit.rates.length > 0);
}

/** Everyone the creator reaches, added up: one person may follow twice, so the page says "combined", never "people". */
export function combinedReach(kit: StoreKit): number {
  return kit.audience.reduce((sum, row) => sum + row.count, 0);
}
