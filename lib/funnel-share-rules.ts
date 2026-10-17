/**
 * The numbers behind sharing and copying funnels (lib/funnel-bundle.ts) and
 * the store's saved sections (lib/saved-blocks.ts), per plan, in one place:
 * the routes enforce these and the studio shows the same ones.
 *
 * What each costs us is storage and reads in the store's database, nothing
 * else: no email, no AI, no file storage (a shared funnel never carries a
 * picture or a file). Every resource is capped so a store's worst case is a
 * few megabytes and a few thousand database commands a month:
 *
 *   - shares: active share links a store holds at once, each a snapshot of at
 *     most `bundleBytes`, each kept for at most MAX_SHARE_DAYS;
 *   - savedBlocks: sections in the store's library, each at most
 *     MAX_SECTION_BYTES;
 *   - imports: funnels a store brings in (from a link, a file, a starter, or
 *     a copy of its own) per rolling day;
 *   - every share link may be previewed and imported only so often a day,
 *     whoever asks, so a link posted somewhere cannot run up the sender's
 *     reads (PREVIEWS_PER_SHARE_DAY, IMPORTS_PER_SHARE_DAY).
 *
 * Pure and browser-safe.
 */
import type { Tier } from "@/lib/plan";
import { type PlanFields, standingOf } from "@/lib/plan-standing";

export type ShareLimits = {
  /** Share links a store holds at once. */
  shares: number;
  /** Sections in the store's library. */
  savedBlocks: number;
  /** The most one funnel's file or share link may weigh, in bytes. */
  bundleBytes: number;
  /** Funnels brought into the store per rolling day: imports, starters and copies. */
  importsPerDay: number;
};

export const SHARE_LIMITS: Record<Tier, ShareLimits> = {
  creator: { shares: 3, savedBlocks: 10, bundleBytes: 150_000, importsPerDay: 5 },
  pro: { shares: 10, savedBlocks: 30, bundleBytes: 300_000, importsPerDay: 15 },
  scale: { shares: 20, savedBlocks: 50, bundleBytes: 500_000, importsPerDay: 30 },
};

/** The largest bundle any plan accepts: what a request body is capped at before the plan is known. */
export const MAX_BUNDLE_BYTES = Math.max(...Object.values(SHARE_LIMITS).map((limits) => limits.bundleBytes));

/**
 * The limits a store has right now: its plan's while it is paid up, and the
 * Store plan's otherwise (in a trial, before a plan, after one ended).
 */
export function shareLimitsFor(store: PlanFields & { tier: Tier }, nowSeconds = Date.now() / 1000): ShareLimits {
  return standingOf(store, nowSeconds) === "paid" ? SHARE_LIMITS[store.tier] ?? SHARE_LIMITS.creator : SHARE_LIMITS.creator;
}

/** How long a share link may work, in days, as the creator chooses; a year at most. */
export const SHARE_DAYS = [7, 30, 90, 365] as const;
export type ShareDays = (typeof SHARE_DAYS)[number];
export const MAX_SHARE_DAYS = 365;
export const DEFAULT_SHARE_DAYS: ShareDays = 30;

export function parseShareDays(raw: unknown): ShareDays | null {
  const value = typeof raw === "number" ? raw : typeof raw === "string" && /^\d{1,3}$/.test(raw) ? Number(raw) : NaN;
  return (SHARE_DAYS as readonly number[]).includes(value) ? (value as ShareDays) : null;
}

/** What one link may be read in a day, by everybody together. */
export const PREVIEWS_PER_SHARE_DAY = 200;
export const IMPORTS_PER_SHARE_DAY = 50;
/** Previews one store may ask for in an hour, of any link or file. */
export const PREVIEWS_PER_STORE_HOUR = 60;
/** Times one store may update its pages from a saved section in a day, and pages in one update. */
export const APPLIES_PER_DAY = 20;
export const MAX_APPLY_PAGES = 30;

/** A share code: "mmf_" and 32 hexadecimal characters, 128 random bits. Only its SHA-256 is kept. */
export const SHARE_CODE = /^mmf_[0-9a-f]{32}$/;
export const SHARE_ID = /^[0-9a-f]{12}$/;
/** The share's name the creator sees in the list. */
export const MAX_SHARE_NAME = 60;

/** The code inside whatever was pasted: the code itself, or a link that carries it. */
export function codeFrom(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const match = raw.trim().toLowerCase().match(/mmf_[0-9a-f]{32}/);
  return match && SHARE_CODE.test(match[0]) ? match[0] : "";
}

/** The studio address that opens an import with this code; the code rides after `#`, so it is never sent to a server in an address. */
export function shareLink(base: string, code: string): string {
  return `${base.replace(/\/+$/, "")}/studio/funnels#import=${code}`;
}

/** "150 KB" */
export function bytesWords(bytes: number): string {
  return `${Math.round(bytes / 1000).toLocaleString("en-US")} KB`;
}
