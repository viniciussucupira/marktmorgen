/**
 * A store whose plan has ended, and what it still keeps: the days.
 *
 * lib/plan-closing.ts says what is done and why. These are the figures it
 * is done by, kept apart from it so that the pages that publish them read
 * the same ones the job runs on without bringing the job with them.
 */
import { SETUP_STORAGE_BYTES } from "@/lib/plan-standing";

/**
 * Days from the end of a plan to the day what the store keeps is removed.
 *
 * Long enough for three notices, the last two two weeks and a week before
 * the day, and short enough that a store which paid for a single month, ran
 * every limit of its plan in it and then left all it may keep here until
 * this day has still not cost more than that month brought in, on the
 * smallest plan's price (tests/plan-margin.test.ts).
 *
 * Thirty since October 12, 2026: it was sixty, and at sixty that store cost
 * more than the $22 the smallest plan was set at (lib/plan.ts).
 */
export const CLOSING_DAYS = 30;
/** How long before that day the second and the last notice go out. */
export const WARN_MONTH_DAYS = 14;
export const WARN_WEEK_DAYS = 7;
/** A store found to fit is measured again after this many days, and not before. */
export const RECHECK_DAYS = 7;

/**
 * Plans that end on or after this day (18 October 2026, UTC) keep none of
 * their files past their closing day: the three notices, the week after the
 * last and the check with Stripe are the same, and they apply to all of
 * what the store keeps, files, lesson videos, podcast episodes, students'
 * hand-ins and community pictures. Until this day a store whose plan ended
 * kept the room of a store with no plan (SETUP_STORAGE_BYTES) with no date
 * on it, for as long as it liked: storage nobody paid for, for ever, which
 * no plan's price could cover (tests/plan-cost-registry.ts, retained-files).
 * A plan that ended before this day keeps what it was told it would.
 */
export const KEEP_NOTHING_FROM = Date.UTC(2026, 9, 18);

/** What a store whose plan ended at `endedAtMs` may keep with no date on it. */
export function keptRoomFor(endedAtMs: number): number {
  return Number.isFinite(endedAtMs) && endedAtMs < KEEP_NOTHING_FROM ? SETUP_STORAGE_BYTES : 0;
}
