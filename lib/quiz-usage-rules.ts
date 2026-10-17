/** Fixed terms for newly created quizzes; legacy quizzes have no version. */
export const QUIZ_USAGE_POLICY = "monthly-v1" as const;
export const QUIZ_MONTHLY_SUBMISSIONS = 1_000;
export const QUIZ_USAGE_RETENTION_SECONDS = 93 * 86_400;
/**
 * The key a store's submissions are counted under. `window` is the store's
 * allowance window by its name (lib/allowance-window.ts): its billing month
 * when it pays us, so one payment buys one month of submissions; the
 * calendar month (UTC) when none is given. Null refuses.
 */
export function quizUsageKey(sid: string, now = Date.now(), window?: string | null): string | null {
  if (!/^[0-9a-f]{32}$/.test(sid) || !Number.isFinite(now)) return null;
  if (window === null) return null;
  if (window !== undefined) return /^\d{4}-(0[1-9]|1[0-2])(-(0[1-9]|[12]\d|3[01]))?$/.test(window) ? `nl:quiz:usage:${sid}:${window}` : null;
  const date = new Date(now);
  if (!Number.isFinite(date.getTime())) return null;
  return `nl:quiz:usage:${sid}:${date.toISOString().slice(0, 7)}`;
}
