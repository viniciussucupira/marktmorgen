/**
 * A store whose plan has ended, and what it still keeps: the days.
 *
 * lib/plan-closing.ts says what is done and why. These are the figures it
 * is done by, kept apart from it so that the pages that publish them read
 * the same ones the job runs on without bringing the job with them.
 */

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
