/**
 * A store whose plan has ended, and what it still keeps: the days.
 *
 * lib/plan-closing.ts says what is done and why. These are the figures it
 * is done by, kept apart from it so that the pages that publish them read
 * the same ones the job runs on without bringing the job with them. They
 * are imported by client pages too, so nothing here reaches the server's
 * own modules.
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

/**
 * Whether a plan that ended at `endedAtMs` closes the whole store on its
 * closing day (since 18 October 2026, the same day as KEEP_NOTHING_FROM):
 * its files that day, and its records in the database within
 * ERASE_WITHIN_DAYS after it, keeping only CLOSING_RECORD_YEARS of tax
 * records, compressed, in the file store (lib/closed-store-data.ts,
 * lib/closing-archive.ts). Every such store has the three notices and the
 * closing day, whether it keeps any file or not. A plan that ended before
 * keeps the rule it ended under, and its records stay.
 */
export function closesStore(endedAtMs: number): boolean {
  return Number.isFinite(endedAtMs) && endedAtMs >= KEEP_NOTHING_FROM;
}

/**
 * The most days after the closing day before a closed store's records are
 * gone from the database. The deletion walks the whole database once for
 * every store that came due since the last walk (lib/closed-store-data.ts),
 * and a walk starts at most every ERASE_EVERY_DAYS, so what a walk costs is
 * paid a few times a month at the most, however many stores close.
 */
export const ERASE_EVERY_DAYS = 7;
/** A walk that has not reached the end of the database by then is finished on the next runs; the database is read a part a run. */
export const ERASE_WITHIN_DAYS = ERASE_EVERY_DAYS + 7;

/**
 * The tax records a closed store leaves, kept compressed in the file store
 * (lib/closing-archive.ts): the store's sales of the last CLOSING_RECORD_YEARS
 * full years and of the year it closed, then deleted on January 1 of the
 * year after the last of them is that old. The reading with more to keep of
 * an open question for an accountant (docs/tax-uncertainty.md, question 13).
 */
export const CLOSING_RECORD_YEARS = 7;
/** The year a record of a sale made in `year` is deleted, on January 1. */
export const recordDeleteYear = (year: number): number => year + CLOSING_RECORD_YEARS + 1;
/** The first year whose sales are kept, for a store that closes in `year`. */
export const firstKeptYear = (year: number): number => year - CLOSING_RECORD_YEARS;

/**
 * How long a store's records wait for its tax records to be read and
 * written, after its closing day. Stripe or the file store not answering
 * holds the deletion, day after day, for at most this long; after it what
 * could be written is kept, with a note of what could not, and the rest is
 * deleted all the same, so no store is kept for ever because something did
 * not answer (the sales stay on the creator's own Stripe account).
 */
export const ARCHIVE_GRACE_DAYS = 14;

/**
 * Copies of a store's whole export its owner may take once its plan has
 * ended, before it closes (app/api/store/export, what=store): each is read
 * whole from the database, and priced with the rest of a closure
 * (tests/closing-cost.test.ts). While a plan runs, an export is taken from
 * the store's studio figure at its size (lib/store-export.ts, exportUnits).
 */
export const ENDED_STORE_EXPORTS = 5;

/**
 * The most one store's closing may cost the company once nobody pays for it
 * (tests/closing-cost.test.ts): its tax records for their years, what is left
 * by itself in the database past the days already priced, its whole export
 * ENDED_STORE_EXPORTS times and the deletion of its records, each at the
 * ceilings the code holds them to by itself. A post-cancellation exposure of
 * docs/funded-exposure-review.md, one for every store that closes.
 *
 * Nearly all of it is the deletion itself at its fullest: a store's every
 * contact taken out of their library across stores is two commands, and a
 * Scale store's room can hold millions. The rest is cents.
 */
export const CLOSURE_CEILING_USD: Record<"creator" | "pro" | "scale", number> = { creator: 1.25, pro: 7, scale: 13 };
