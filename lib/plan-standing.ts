/** Plan standing and finite storage/playback admission thresholds.
 * These provisional allowance sizes are not a verified supplier-cost ceiling
 * or proof of the owner's after-all-tax margin. Paid and trial stream playback
 * both require the explicit monthly threshold; setup and ended stores have a
 * smaller threshold. Storage and retention follow their separate guards.
 */
import type { Tier } from "@/lib/plan";
import { paidVideoSeconds, TRIAL_VIDEO_SECONDS } from "@/lib/video-admission-rules";

const GB = 1024 * 1024 * 1024;

export type Standing = "paid" | "trial" | "none" | "ended";

/** What a store's record says about its plan (lib/store.ts). `trialEnds` in seconds; `planEndedAt` a date, or empty. */
export type PlanFields = {
  subscriptionActive: boolean;
  subscriptionId: string | null;
  trialEnds: number;
  planEndedAt: string;
};

/** Where a store stands with its plan right now. */
export function standingOf(store: PlanFields, nowSeconds = Date.now() / 1000): Standing {
  if (store.subscriptionActive) return store.trialEnds > nowSeconds ? "trial" : "paid";
  // A plan that was started and is not running has ended, whether or not
  // the day it ended was written down.
  return store.planEndedAt || store.subscriptionId ? "ended" : "none";
}

/** Historical trial storage threshold; all-cost review remains required. */
export const TRIAL_STORAGE_BYTES = 50 * GB;
/** Historical setup/ended storage threshold; not a certified cost budget. */
export const SETUP_STORAGE_BYTES = 5 * GB;
/** The hours of lesson video a store with no plan may have watched in a month: its owner looking at their own lessons, and a preview. */
export const SETUP_VIDEO_HOURS = 0.25;
export const SETUP_VIDEO_SECONDS = SETUP_VIDEO_HOURS * 3600;

/**
 * The seconds of lesson video a store may have watched this month before
 * its video is paused. Paid plans also have a finite monthly threshold.
 */
export function videoLimitFor(store: PlanFields & { tier?: Tier }, nowSeconds = Date.now() / 1000): number {
  const standing = standingOf(store, nowSeconds);
  if (standing === "paid") return paidVideoSeconds(store.tier);
  return standing === "trial" ? Math.min(paidVideoSeconds(store.tier), TRIAL_VIDEO_SECONDS) : SETUP_VIDEO_SECONDS;
}

/**
 * Where the stores whose plan has ended are kept in line, by the day it
 * ended: the store's key, scored with that day in milliseconds. Written by
 * the one place a store's plan is written down (lib/store.ts,
 * setSubscription) and read by the daily job (lib/plan-closing.ts).
 */
export const ENDED_INDEX = "nl:plan:ended";

/** The word an upload is refused with when it would not fit, by standing (lib/studio-messages.ts has the sentences). */
export function storageRefusal(standing: Standing): "storage_full" | "storage_trial" | "storage_setup" {
  return standing === "paid" ? "storage_full" : standing === "trial" ? "storage_trial" : "storage_setup";
}
