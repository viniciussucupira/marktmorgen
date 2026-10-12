/**
 * What a creator chooses about members whose payment fails, and the dates it
 * works out (added 12 October 2026; lib/payment-recovery.ts sends).
 *
 * Read before it was built: Baremetrics Recover sends a sequence of emails
 * after a failed payment and a warning before a card expires; Paddle Retain
 * does both and reports "Recovered MRR". Until now a member here was told
 * once, which is the gentlest choice and stays the default. A creator who
 * wants more chooses two or three emails, on fixed days, and every email
 * stops the moment the payment goes through.
 *
 *   - Reminders: 1, 2 or 3 emails per failed payment, on the day it is first
 *     seen and then 3 and 7 days after the first. Inside Stripe's own retries,
 *     which run for weeks by default, so none arrives after the membership
 *     has already ended.
 *   - The card notice: when the card a membership is paid with stops working
 *     before its next payment, the member is told some days ahead, once per
 *     card, with a page where they add a new one. On by default: it is a
 *     service to the person paying, says nothing they would not want to know,
 *     and needs nothing set up in Stripe.
 *
 * Browser-safe.
 */

export const REMINDER_CHOICES = [1, 2, 3] as const;
export type ReminderCount = (typeof REMINDER_CHOICES)[number];

/** Days after the first email that each later one is due on. */
export const REMINDER_DAYS = [0, 3, 7] as const;

/** How long before a payment the card notice goes out, at most. */
export const CARD_NOTICE_DAYS = 10;

export type Dunning = { reminders: ReminderCount; cardNotice: boolean };
export const DEFAULT_DUNNING: Dunning = { reminders: 1, cardNotice: true };

export function parseDunning(raw: unknown): Dunning {
  const value = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  return {
    reminders: (REMINDER_CHOICES as readonly number[]).includes(value.reminders as number) ? (value.reminders as ReminderCount) : DEFAULT_DUNNING.reminders,
    cardNotice: typeof value.cardNotice === "boolean" ? value.cardNotice : DEFAULT_DUNNING.cardNotice,
  };
}

/**
 * Which email is due now about one failed payment, or 0 for none: the second
 * from 3 days after the first, the third from 7. One at a time, the earliest
 * not yet sent, so a run missed for a day sends the next one and never two.
 */
export function reminderDue(reminders: ReminderCount, firstAt: number, sent: number, now: number): number {
  const next = sent + 1;
  if (next > reminders || next > REMINDER_DAYS.length) return 0;
  return now >= firstAt + REMINDER_DAYS[next - 1] * 86_400_000 ? next : 0;
}

/**
 * Whether a card stops working before a payment due at `payAt` (seconds). A
 * card is good to the last day of the month printed on it, so one marked
 * 10/2026 still pays on October 31 and not on November 1. Read in UTC: a
 * day either way, and the notice is still days early.
 */
export function cardLapsesBefore(expMonth: number, expYear: number, payAt: number): boolean {
  if (!Number.isInteger(expMonth) || expMonth < 1 || expMonth > 12 || !Number.isInteger(expYear) || expYear < 2000) return false;
  const firstDayAfter = Date.UTC(expYear, expMonth, 1) / 1000;
  return payAt >= firstDayAfter;
}

/** Whether the card notice is due: a payment within CARD_NOTICE_DAYS that the card on file will not reach. */
export function cardNoticeDue(card: { expMonth: number; expYear: number }, payAt: number, now: number): boolean {
  const nowSeconds = Math.floor(now / 1000);
  if (payAt <= nowSeconds || payAt - nowSeconds > CARD_NOTICE_DAYS * 86_400) return false;
  return cardLapsesBefore(card.expMonth, card.expYear, payAt);
}
