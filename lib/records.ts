/**
 * Records (added 11 October 2026): the store's best day and best week of the
 * last 90 days, said when one is new. Ripples marks milestones on its charts
 * for this reason: a creator who knows which day was the best can find what
 * they did that day and do it again.
 *
 * Said as "of the last 90 days", because that is how far the money is read;
 * "ever" would be a claim the numbers cannot back. Only for a store with
 * money on at least RECORD_MIN_DAYS of those days, so the first sale of a new
 * store is not called a record. Pure.
 */
import type { ChannelDays } from "@/lib/stats";
import { moneyByDay } from "@/lib/sales-goal-rules";

export const RECORD_MIN_DAYS = 5;

export type Records = {
  /** The best day of the 90, if it falls in the last 7 days and beats every other. */
  bestDay: { day: string; cents: number } | null;
  /** The last 7 days, if they brought more than any 7 days in a row before them in the 90. */
  bestWeek: { cents: number } | null;
};

const addDays = (day: string, n: number) => new Date(Date.parse(`${day}T00:00:00Z`) + n * 86_400_000).toISOString().slice(0, 10);

export function recordsFrom(channelDays: ChannelDays | undefined, today: string): Records {
  const none: Records = { bestDay: null, bestWeek: null };
  if (!/^\d{4}-\d{2}-\d{2}$/.test(today)) return none;
  const byDay = moneyByDay(channelDays);
  const days: string[] = [];
  for (let i = 89; i >= 0; i -= 1) days.push(addDays(today, -i));
  const money = days.map((d) => byDay[d] ?? 0);
  if (money.filter((c) => c > 0).length < RECORD_MIN_DAYS) return none;

  const out: Records = { ...none };
  const best = Math.max(...money);
  const at = money.lastIndexOf(best);
  const ties = money.filter((c) => c === best).length;
  if (best > 0 && ties === 1 && at >= days.length - 7) out.bestDay = { day: days[at], cents: best };

  const week = (end: number) => money.slice(end - 6, end + 1).reduce((a, b) => a + b, 0);
  const now = week(days.length - 1);
  let before = 0;
  // Every full 7 days that ended before the last 7 began.
  for (let end = 6; end <= days.length - 8; end += 1) before = Math.max(before, week(end));
  if (now > 0 && now > before && before > 0) out.bestWeek = { cents: now };
  return out;
}
