/**
 * The video ceiling of students of a free course (541 [FC4], unit 1; added
 * 1 November 2026), by the owner's decision of 1 November 2026, 11:59
 * Fortaleza: at most 20% of the plan's video hours in the month; the creator
 * may choose less, never more. The other 80% or more stays for students who
 * paid. The free students' hours come out of the plan's own hours, already
 * counted at their worst, so the ceiling adds no cost.
 *
 * What is here: the numbers and the one decision made before a free lesson's
 * player is framed, with the same care as the plan's own limit
 * (lib/learn.ts, lessonVideo): a watched figure that could not be read, or a
 * plan limit that is not known, frames no player. The counter of what free
 * students watched, kept from the video service's per-video totals
 * (lib/watch.ts), and the free lesson that shows its text and files when
 * the ceiling is reached, are the next unit: a new kind of record waits on
 * the store data registry (tests/store-data-registry.ts, held by an open PR).
 *
 * Browser-safe: plain numbers and pure functions.
 */

/** The owner's maximum, in percent of the plan's video hours in its month. */
export const FREE_VIDEO_MAX_PERCENT = 20;

/** The creator's choice: a whole percent from 0 to the maximum, above it the maximum; anything that is not a whole percent is 0, never more. */
export function readFreeVideoPercent(raw: unknown): number {
  const value = typeof raw === "string" && raw.trim() !== "" ? Number(raw) : raw;
  if (typeof value !== "number" || !Number.isInteger(value) || value < 0) return 0;
  return Math.min(value, FREE_VIDEO_MAX_PERCENT);
}

/** The seconds free students may watch in the plan's month: the chosen share of its seconds, rounded down; null when the plan's limit is not known. */
export function freeVideoSeconds(planSeconds: number | null, percent: number): number | null {
  if (planSeconds === null || !Number.isSafeInteger(planSeconds) || planSeconds < 0) return null;
  const share = readFreeVideoPercent(percent);
  return Math.floor((planSeconds * share) / 100);
}

export type FreeVideoAdmission = "play" | "paused" | "unknown";

/**
 * Whether a free lesson's video may be framed now. Both ceilings hold: the
 * free students' own, and the plan's whole month (the free hours are part of
 * it). Unknown, from either figure, frames nothing.
 */
export function freeVideoAdmission(input: { planSeconds: number | null; percent: number; watchedAll: number | null; watchedFree: number | null }): FreeVideoAdmission {
  const cap = freeVideoSeconds(input.planSeconds, input.percent);
  const count = (n: number | null) => n !== null && Number.isSafeInteger(n) && n >= 0;
  if (cap === null || input.planSeconds === null || !count(input.watchedAll) || !count(input.watchedFree)) return "unknown";
  if (input.watchedAll! >= input.planSeconds || input.watchedFree! >= cap) return "paused";
  return "play";
}

/** What the studio says the choice means, in hours, from the plan's own seconds. */
export function freeVideoWords(planSeconds: number, percent: number): string {
  const share = readFreeVideoPercent(percent);
  if (share === 0) return "Students of free courses see each lesson's text and files, without the video.";
  const hours = Math.floor(((planSeconds * share) / 100 / 3600) * 10) / 10;
  return `Students of free courses can watch up to ${hours.toLocaleString("en-US")} ${hours === 1 ? "hour" : "hours"} of video a month, ${share}% of your plan's. The rest stays for students who paid.`;
}
