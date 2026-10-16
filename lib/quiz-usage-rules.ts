/** Fixed terms for newly created quizzes; legacy quizzes have no version. */
export const QUIZ_USAGE_POLICY = "monthly-v1" as const;
export const QUIZ_MONTHLY_SUBMISSIONS = 1_000;
export const QUIZ_USAGE_RETENTION_SECONDS = 93 * 86_400;
export function quizUsageKey(sid: string, now = Date.now()): string | null {
  if (!/^[0-9a-f]{32}$/.test(sid) || !Number.isFinite(now)) return null;
  const date = new Date(now);
  if (!Number.isFinite(date.getTime())) return null;
  return `nl:quiz:usage:${sid}:${date.toISOString().slice(0, 7)}`;
}
