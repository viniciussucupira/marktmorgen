/**
 * When buyers buy (added 12 October 2026), as rules the browser can read:
 * the week's checkouts by hour, counted in UTC (lib/stats.ts, hoursOfWeek),
 * turned to the time of whoever reads them.
 */

/** The week's 168 hours in UTC turned to this browser's time: Sunday 0:00 first. Pure. */
export function toLocalWeek(utc: number[], offsetMinutes: number): number[] {
  const shift = Math.round(offsetMinutes / 60);
  const out = new Array<number>(168).fill(0);
  utc.forEach((n, i) => {
    out[(((i - shift) % 168) + 168) % 168] += n;
  });
  return out;
}

/** The three hours in a row, through midnight too, with the most sales: the first of them. Pure. */
export function busiestHours(byHour: number[]): number {
  let best = 0;
  let bestSum = -1;
  for (let h = 0; h < 24; h += 1) {
    const sum = byHour[h] + byHour[(h + 1) % 24] + byHour[(h + 2) % 24];
    if (sum > bestSum) {
      best = h;
      bestSum = sum;
    }
  }
  return best;
}
