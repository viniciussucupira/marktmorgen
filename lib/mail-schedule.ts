/** Mirrors the existing broadcast window; timestamps are milliseconds. */
export const MAIL_SCHEDULE_WINDOW_MS = 365 * 86_400_000;
/** A local wall time must exist and still be in the future at the point of use. */
export function readMailSchedule(raw: string, now: number): number | null {
  if (!Number.isFinite(now)) return null;
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2}))?$/.exec(raw);
  if (!match) return null;
  const [, year, month, day, hour, minute, second = "0"] = match;
  const date = new Date(raw);
  const at = date.getTime();
  // Date normalizes impossible calendar dates and daylight-saving gaps.
  if (!Number.isFinite(at) || date.getFullYear() !== Number(year) || date.getMonth() + 1 !== Number(month) || date.getDate() !== Number(day) || date.getHours() !== Number(hour) || date.getMinutes() !== Number(minute) || date.getSeconds() !== Number(second)) return null;
  return at > now && at <= now + MAIL_SCHEDULE_WINDOW_MS ? at : null;
}
