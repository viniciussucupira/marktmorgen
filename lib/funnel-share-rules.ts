/**
 * The numbers behind sharing and copying funnels (lib/funnel-bundle.ts) and
 * the store's saved sections (lib/saved-blocks.ts), per plan, in one place:
 * the routes enforce these and the studio shows the same ones.
 *
 * What each costs us is storage and reads in the store's database, nothing
 * else: no email, no AI, no file storage (a shared funnel never carries a
 * picture or a file). Every resource is capped, by plan and by calendar
 * month (UTC), so each plan's worst month counts it
 * (tests/plan-cost-registry.ts):
 *
 *   - shares: active share links a store holds at once, each a snapshot of at
 *     most `bundleBytes`, each kept for at most MAX_SHARE_DAYS;
 *   - sharesPerMonth: share links a store makes in a month;
 *   - savedBlocks: sections in the store's library, each at most
 *     MAX_SECTION_BYTES;
 *   - importsPerMonth: funnels a store brings in (from a link, a file, a
 *     starter, or a copy of its own), failed attempts counted;
 *   - previewsPerMonth: looks at what a link, a file or a starter would make;
 *   - appliesPerMonth: updates of its pages from a saved section, each of at
 *     most MAX_APPLY_PAGES pages;
 *   - exportsPerMonth: funnels downloaded as a file;
 *   - every share link may be previewed and imported only so often a month,
 *     whoever asks, so a link posted somewhere cannot run up the sender's
 *     reads (PREVIEWS_PER_SHARE_MONTH, IMPORTS_PER_SHARE_MONTH).
 *
 * Until 17 October 2026 imports, link reads and section updates were counted
 * by the day (5, 15 and 30 imports a day; 200 previews and 50 imports of a
 * link a day; 20 section updates a day), and links made and files exported
 * not at all: at full use more than Store's whole margin a month.
 *
 * Pure and browser-safe.
 */
import { type WindowFields, windowId } from "@/lib/allowance-window";
import type { Tier } from "@/lib/plan";
import { type PlanFields, standingOf } from "@/lib/plan-standing";

export type ShareLimits = {
  /** Share links a store holds at once. */
  shares: number;
  /** Share links a store makes in a window (lib/allowance-window.ts: a billing month when the store pays). */
  sharesPerMonth: number;
  /** Sections in the store's library. */
  savedBlocks: number;
  /** The most one funnel's file or share link may weigh, in bytes. */
  bundleBytes: number;
  /** Funnels brought into the store in a window (lib/allowance-window.ts: a billing month when the store pays): imports, starters and copies. */
  importsPerMonth: number;
  /** Previews of a link, a file or a starter in a window (lib/allowance-window.ts: a billing month when the store pays). */
  previewsPerMonth: number;
  /** Updates of the store's pages from a saved section in a window (lib/allowance-window.ts: a billing month when the store pays). */
  appliesPerMonth: number;
  /** Funnels downloaded as a file in a window (lib/allowance-window.ts: a billing month when the store pays). */
  exportsPerMonth: number;
};

export const SHARE_LIMITS: Record<Tier, ShareLimits> = {
  creator: { shares: 3, savedBlocks: 10, sharesPerMonth: 6, bundleBytes: 150_000, importsPerMonth: 5, previewsPerMonth: 30, appliesPerMonth: 5, exportsPerMonth: 5 },
  pro: { shares: 10, savedBlocks: 30, sharesPerMonth: 20, bundleBytes: 300_000, importsPerMonth: 20, previewsPerMonth: 150, appliesPerMonth: 20, exportsPerMonth: 30 },
  scale: { shares: 20, savedBlocks: 50, sharesPerMonth: 40, bundleBytes: 500_000, importsPerMonth: 40, previewsPerMonth: 300, appliesPerMonth: 40, exportsPerMonth: 60 },
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

/** What one link may be read in a window (lib/allowance-window.ts: a billing month when the store pays), by everybody together. */
export const PREVIEWS_PER_SHARE_MONTH = 300;
export const IMPORTS_PER_SHARE_MONTH = 50;
/** Previews one store may ask for in an hour, of any link or file: a burst limit under the month's. */
export const PREVIEWS_PER_STORE_HOUR = 60;
/** Pages one update from a saved section may change. */
export const MAX_APPLY_PAGES = 30;

/**
 * The window a store's monthly counts above are kept under
 * (lib/allowance-window.ts): its billing month when it pays us ("2026-10-19"),
 * the calendar month otherwise ("2026-10"); null when it pays and its period
 * is not known, and then nothing is counted or done.
 */
export function monthOfUse(store: WindowFields, now = Date.now()): string | null {
  return windowId(store, now);
}

/**
 * The calendar month (UTC) one link's reads by other stores are kept under:
 * they are counted by the link, whoever reads it, so a billing month of the
 * store that made it touches two of these (tests/plan-cost-registry.ts).
 */
export function calendarMonthOfUse(now = Date.now()): string {
  return new Date(now).toISOString().slice(0, 7);
}

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
