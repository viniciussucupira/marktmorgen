/**
 * A billing period around a moment, for a test's store that pays us: since
 * 17 October 2026 a paying store counts its allowances in its own billing
 * month (lib/allowance-window.ts), and one whose period is not known does
 * nothing that costs money. Ten days behind and twenty ahead, renewing.
 */
export function paidPeriod(now = Date.now(), days: { behind: number; ahead: number } = { behind: 10, ahead: 20 }): { start: number; end: number; renews: boolean } {
  const at = Math.floor(now / 1000);
  return { start: at - days.behind * 86_400, end: at + days.ahead * 86_400, renews: true };
}

/**
 * A billing month that is this calendar month exactly, for a test that reads
 * a monthly company ledger by the calendar month (lib/ai-spend.ts,
 * lib/upload-budget.ts reserve in the ledger of the month a billing month
 * began in). Its window is named by its first day.
 */
export function calendarPeriod(now = Date.now()): { start: number; end: number; renews: boolean } {
  const at = new Date(now);
  return { start: Date.UTC(at.getUTCFullYear(), at.getUTCMonth(), 1) / 1000, end: Date.UTC(at.getUTCFullYear(), at.getUTCMonth() + 1, 1) / 1000, renews: true };
}
/** The name of that window ("2026-10-01"). */
export const calendarPeriodId = (now = Date.now()) => new Date(calendarPeriod(now).start * 1000).toISOString().slice(0, 10);
