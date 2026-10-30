/**
 * A break from the plan instead of leaving it: the figures.
 *
 * lib/plan-pause.ts says what is done and why. These are the numbers it is
 * done by, kept apart so the studio and the pages that publish them read the
 * same ones without bringing the job with them. Nothing here reads a secret.
 */

/**
 * The lengths of break a creator may choose, in months.
 *
 * A break costs us what the store keeps while nothing is paid: at most the
 * storage brake, every month of it. tests/plan-margin.test.ts adds that to
 * the dearest months a plan can have before it and to the days a store has
 * after a plan ends, and requires what those months paid to cover all of it
 * with a quarter to spare. Three months was the first figure, and on the $29
 * plan it took a single paid month past zero in that worst case; two months,
 * after two paid ones, keeps more than a quarter.
 */
export const PAUSE_MONTHS = [1, 2] as const;
export type PauseMonths = (typeof PAUSE_MONTHS)[number];
export const LONGEST_PAUSE_MONTHS: PauseMonths = 2;

/**
 * Monthly payments that must have gone through before a break can be taken:
 * the first after the trial and the one after it. A break is for a creator
 * who has been selling, not a way to keep a trial's files for free.
 */
export const PAID_MONTHS_BEFORE_PAUSE = 2;

/** One break in this many days: a break every quarter would be a plan that is free a third of the time. */
export const PAUSE_EVERY_DAYS = 365;

/** The days before the plan starts again when the creator is told the date and the price, as before a trial ends. */
export const RESTART_NOTICE_DAYS = 7;

export function parsePauseMonths(raw: unknown): PauseMonths | null {
  const n = Number(raw);
  return (PAUSE_MONTHS as readonly number[]).includes(n) ? (n as PauseMonths) : null;
}

/** AV3, 30 October 2026: plan breaks, restart and their notices stay off at opening.
 * Existing implementation and records are retained for queue566 FF2. */
export const PLAN_BREAKS_ENABLED: boolean = false;
