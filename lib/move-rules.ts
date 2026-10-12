/**
 * Moving members from another platform (added 12 October 2026): the plain
 * rules, browser-safe. What is kept and sent is in lib/move-members.ts.
 *
 * A membership cannot be handed over the way a download can: it is a
 * subscription, and a subscription is a card being charged. So nobody is
 * given a membership here. Each member the creator brings over gets their own
 * link to keep it, and keeping it is an ordinary checkout on the creator's
 * own Stripe account, with one difference: the card is taken now and first
 * charged on the day the membership would have renewed on the old platform,
 * the date the creator's file gives. They paid there up to that day, so they
 * pay here from that day, never twice for the same weeks. From the moment
 * they keep it, it is a membership like any other, opening what it opens.
 *
 * The creator stops the renewals on the old platform themselves; the studio
 * says so before the import starts.
 */

/** Members one import may bring, the same as past buyers. */
export const MAX_MOVED_MEMBERS = 20_000;
/**
 * Stripe takes a checkout's first charge date only this far ahead (Checkout
 * asks for at least 48 hours, and two more are kept for a page left open): a
 * renewal sooner than that is first charged this long after the checkout,
 * which is after the renewal date, never before it.
 */
export const MIN_DEFER_SECONDS = 50 * 3_600;
/** A renewal further away than this is not a renewal date anybody exports: the row is refused. */
export const MAX_AHEAD_DAYS = 400;
/** The one reminder goes this many days before the first charge date, to those who have not kept it yet. */
export const REMIND_DAYS_BEFORE = 3;
/** A member's link works until this long after their renewal date, and never less than this long after it was sent. */
export const LINK_DAYS = 30;

const MONTHS = ["jan", "feb", "mar", "apr", "may", "jun", "jul", "aug", "sep", "oct", "nov", "dec"];

function at(year: number, month: number, day: number): number | null {
  if (year < 2000 || year > 2100 || month < 1 || month > 12 || day < 1 || day > 31) return null;
  const ms = Date.UTC(year, month - 1, day, 12);
  const back = new Date(ms);
  // "February 30" is not a day.
  if (back.getUTCMonth() !== month - 1 || back.getUTCDate() !== day) return null;
  return Math.floor(ms / 1000);
}

export type ReadDate = { ok: true; at: number } | { ok: false; reason: "empty" | "unreadable" | "ambiguous" };

/**
 * A renewal date as another platform exports it, as noon UTC that day, in
 * seconds: "2026-11-03", "2026-11-03 14:20:00", "2026-11-03T14:20:00Z",
 * "2026/11/03", "Nov 3, 2026", "3 November 2026", and "11/03/2026" or
 * "03/11/2026" when the numbers can only be read one way. "04/05/2026" could
 * be April or May, so it is refused, and the report asks for the year first.
 */
export function readRenewal(raw: string): ReadDate {
  const text = raw.trim().replace(/\s+/g, " ");
  if (!text) return { ok: false, reason: "empty" };
  let m = text.match(/^(\d{4})[-/.](\d{1,2})[-/.](\d{1,2})(?:[ T]\d{1,2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:\s?(?:Z|UTC|[+-]\d{2}:?\d{2}))?)?$/i);
  if (m) {
    const when = at(Number(m[1]), Number(m[2]), Number(m[3]));
    return when ? { ok: true, at: when } : { ok: false, reason: "unreadable" };
  }
  m = text.match(/^(\d{1,2})[-/.](\d{1,2})[-/.](\d{4})(?: \d{1,2}:\d{2}(?::\d{2})?(?: ?[AP]M)?)?$/i);
  if (m) {
    const a = Number(m[1]);
    const b = Number(m[2]);
    const year = Number(m[3]);
    if (a > 12 && b <= 12) {
      const when = at(year, b, a);
      return when ? { ok: true, at: when } : { ok: false, reason: "unreadable" };
    }
    if (b > 12 && a <= 12) {
      const when = at(year, a, b);
      return when ? { ok: true, at: when } : { ok: false, reason: "unreadable" };
    }
    if (a === b) {
      const when = at(year, a, b);
      return when ? { ok: true, at: when } : { ok: false, reason: "unreadable" };
    }
    return { ok: false, reason: a <= 12 && b <= 12 ? "ambiguous" : "unreadable" };
  }
  const month = (word: string) => MONTHS.indexOf(word.slice(0, 3).toLowerCase()) + 1;
  // "Nov 3, 2026", "November 3 2026"
  m = text.match(/^([A-Za-z]{3,9})\.? (\d{1,2})(?:st|nd|rd|th)?,? (\d{4})$/);
  if (m && month(m[1]) > 0) {
    const when = at(Number(m[3]), month(m[1]), Number(m[2]));
    return when ? { ok: true, at: when } : { ok: false, reason: "unreadable" };
  }
  // "3 Nov 2026", "3 November, 2026"
  m = text.match(/^(\d{1,2}) ([A-Za-z]{3,9})\.?,? (\d{4})$/);
  if (m && month(m[2]) > 0) {
    const when = at(Number(m[3]), month(m[2]), Number(m[1]));
    return when ? { ok: true, at: when } : { ok: false, reason: "unreadable" };
  }
  return { ok: false, reason: "unreadable" };
}

/**
 * When the first payment here is taken, in seconds: the renewal date, or,
 * when that is closer than Stripe can wait for, the soonest it can — never
 * before the renewal date, so nobody is charged early. Null when the date
 * has passed: the payment is due, and taken at checkout.
 */
export function firstChargeAt(renews: number, now = Date.now()): number | null {
  const today = Math.floor(now / 1000);
  if (renews <= today) return null;
  return Math.max(renews, today + MIN_DEFER_SECONDS);
}

/** When the one reminder goes, in seconds, or null when there is no time left for one to help. */
export function reminderAt(renews: number, now = Date.now()): number | null {
  const when = renews - REMIND_DAYS_BEFORE * 86_400;
  return when - Math.floor(now / 1000) >= 86_400 ? when : null;
}

/** How long a member's link is kept, in seconds from now. */
export function linkSeconds(renews: number, now = Date.now()): number {
  return Math.max(LINK_DAYS * 86_400, renews + LINK_DAYS * 86_400 - Math.floor(now / 1000));
}

/** When a moved membership's first payment is taken, from its checkout's metadata; 0 for none. */
export function firstCharge(metadata: Record<string, string> | null | undefined): number {
  if (metadata?.moved !== "yes") return 0;
  const when = Number(metadata.first_charge);
  return Number.isInteger(when) && when > 0 ? when : 0;
}
