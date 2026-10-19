import type { PathRecord } from "@/lib/path";
import type { Role } from "@/lib/team-roles";
import { localDay, mayNotify, validTimeZone } from "@/lib/path-rules";
/** A studio invitation never records a check-in or dispatches a message. */
export function pathStudioReminder(record: PathRecord | null, role: Role, now: number): boolean {
  if (role !== "owner" || !record || !Number.isFinite(now) || now < record.startedAt || record.startedAt <= 0) return false;
  const zone = record.answers.timeZone;
  if (!validTimeZone(zone) || !mayNotify(zone, now) || record.checkins.includes(localDay(zone, now))) return false;
  return !record.money || record.money.real === 0;
}
