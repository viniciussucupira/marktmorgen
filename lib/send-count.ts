/**
 * The count before sending (460 [EL4], unit 1; added 1 November 2026): next
 * to how many people an email to the list goes to, what that is of this
 * month's emails and how many emails like it the month still holds.
 *
 * Read from the same two numbers the page already shows, the people the
 * email would reach (counted by the server for the choices made) and the
 * month's emails used and allowed (lib/mail.ts), so it adds no request.
 * Sequences use the same month, so the line says "right now". Nothing is
 * sent from here: the server still refuses an email that would go past the
 * month, and nothing goes without the creator pressing send.
 *
 * Browser-safe: a pure function.
 */

const n = (value: number) => value.toLocaleString("en-US");

export type SendCount = { line: string; over: boolean };

/** What one email to `reach` people is of this month's emails, or null when there is nobody to send to. */
export function sendCount(reach: number, used: number, allowance: number): SendCount | null {
  if (!Number.isSafeInteger(reach) || !Number.isSafeInteger(used) || !Number.isSafeInteger(allowance) || reach <= 0 || allowance < 0 || used < 0) return null;
  const left = Math.max(0, allowance - used);
  const emails = (count: number) => `${n(count)} ${count === 1 ? "email" : "emails"}`;
  if (reach > left) {
    return {
      over: true,
      line: `This email needs ${emails(reach)}, and ${left === 0 ? "none are" : `${emails(left)} ${left === 1 ? "is" : "are"}`} left this month right now. Send it to a smaller group, or next month.`,
    };
  }
  const times = Math.floor(left / reach);
  return {
    over: false,
    line: `This email uses ${n(reach)} of the ${emails(left)} left this month right now. ${times === 1 ? "That is enough for this one only." : `That is enough to write to these people ${n(times)} times this month, this one included.`}`,
  };
}
