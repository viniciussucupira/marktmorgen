/**
 * Taking from a store's monthly figures for what had none until 17 October
 * 2026 (lib/store-allowance-rules.ts): studio requests, API requests, inbox
 * messages, store emails, access emails and calls to connected services.
 *
 *   nl:allow:<kind>:<store>:<window>   what was taken in the store's window
 *
 * Taken before the cost is incurred, all or nothing: what does not fit is
 * refused and nothing is kept for it. A store that pays nothing must also
 * hold one of the month's places (lib/free-pool.ts). Unknown is closed: no
 * window (a paying store whose period is not known), no place, or a count
 * that cannot be made, and nothing is taken and the use is refused.
 */
import { createHash } from "node:crypto";
import { reservePaidResourceWindow } from "@/lib/contract-resource-window";
import { type WindowFields, allowanceWindow, keepSecondsFor, resetWords } from "@/lib/allowance-window";
import { admitNonPaying } from "@/lib/free-pool";
import { POOL_FULL_WORDS } from "@/lib/free-pool-rules";
import type { Tier } from "@/lib/plan";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { type AllowanceKind, allowanceFor, askedCeiling, usedWords } from "@/lib/store-allowance-rules";

export type AllowanceStore = WindowFields & { tier?: Tier; sid?: string; statsId?: string | null; handle?: string };

export type Taken = { ok: true; left: number } | { ok: false; reason: "used" | "unknown" | "pool"; limit: number; message: string };

const key = (kind: AllowanceKind, id: string, window: string) => `nl:allow:${kind}:${id}:${window}`;

/** What a store is counted by: its id, or what it is kept under, hashed. */
function idOf(store: AllowanceStore): string | null {
  const raw = store.sid || store.statsId || store.handle || "";
  return raw ? createHash("sha256").update(`allowance:${raw}`).digest("hex").slice(0, 32) : null;
}

/**
 * Takes `n` of a kind from the store's window, or refuses with the sentence to
 * show. `asked`: a confirmation to an address a visitor typed, which may take
 * the figure only to askedCeiling of it, so the rest is kept for the buyers it
 * is for (lib/store-allowance-rules.ts, ASKED_SHARE_BPS). It is counted in the
 * same figure, by the same two commands.
 */
export async function takeAllowance(store: AllowanceStore, kind: AllowanceKind, n = 1, now = Date.now(), asked = false): Promise<Taken> {
  const whole = allowanceFor(store, kind, now / 1000);
  const limit = asked ? askedCeiling(whole) : whole;
  const refuse = (reason: "used" | "unknown" | "pool", message: string): Taken => ({ ok: false, reason, limit, message });
  if (!Number.isSafeInteger(n) || n < 1) return refuse("unknown", "That could not be counted. Try again.");
  const window = allowanceWindow(store, now);
  if (!window) return refuse("unknown", resetWords(store, now));
  if (!Number.isSafeInteger(limit) || limit < n) return refuse("used", usedWords(kind, limit, resetWords(store, now)));
  const id = idOf(store);
  if (!id || !isRedisConfigured()) return refuse("unknown", "This can't be counted right now. Try again in a minute.");
  // A published allowance is not proof that this marked paid term has cash.
  // Share the existing immutable paid cohort before counters or provider work.
  // Legacy/unmarked and non-paying admission retain their existing paths.
  if (store.period?.funded === true && (!store.tier || !(await reservePaidResourceWindow({ ...store, tier: store.tier, statsId: store.statsId ?? null })))) {
    return refuse("unknown", "This can't be counted right now. Try again in a minute.");
  }
  if (!(await admitNonPaying(store, now))) return refuse("pool", POOL_FULL_WORDS);
  try {
    const k = key(kind, id, window.id);
    const [, total] = await redisPipeline([
      ["SET", k, "0", "NX", "EX", keepSecondsFor(window, now)],
      ["INCRBY", k, n],
    ]);
    const counted = Number(total);
    if (!Number.isSafeInteger(counted) || counted < n) return refuse("unknown", "This can't be counted right now. Try again in a minute.");
    if (counted <= limit) return { ok: true, left: limit - counted };
    // Over: what this asked for is given back, so a refused use costs the figure nothing.
    await redisPipeline([["DECRBY", k, n]]).catch(() => {});
    return refuse("used", usedWords(kind, limit, resetWords(store, now)));
  } catch {
    return refuse("unknown", "This can't be counted right now. Try again in a minute.");
  }
}

/** What has been taken of a kind in the store's window, for the studio; 0 when it cannot be read. */
export async function allowanceUsed(store: AllowanceStore, kind: AllowanceKind, now = Date.now()): Promise<number> {
  const window = allowanceWindow(store, now);
  const id = idOf(store);
  if (!window || !id || !isRedisConfigured()) return 0;
  try {
    const [raw] = await redisPipeline([["GET", key(kind, id, window.id)]]);
    const n = Number(raw);
    return Number.isSafeInteger(n) && n > 0 ? n : 0;
  } catch {
    return 0;
  }
}
