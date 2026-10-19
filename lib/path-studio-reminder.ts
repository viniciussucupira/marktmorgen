import { readPath, type PathRecord } from "@/lib/path";
import type { Store } from "@/lib/store";
import type { Role } from "@/lib/team-roles";
import { localDay, mayNotify, validTimeZone } from "@/lib/path-rules";
/** A studio invitation never records a check-in or dispatches a message. */
export function pathStudioReminder(record: PathRecord | null, role: Role, now: number): boolean {
  if (role !== "owner" || !record || !Number.isFinite(now) || now < record.startedAt || record.startedAt <= 0) return false;
  const zone = record.answers.timeZone;
  if (!validTimeZone(zone) || !mayNotify(zone, now) || record.checkins.includes(localDay(zone, now))) return false;
  return !record.money || record.money.real === 0;
}

/** Request-time server data, read after the record so quiet hours are checked at response time. */
export async function readStudioPathInvitation(store: Pick<Store, "sid">, role: Role): Promise<boolean> {
  if (role !== "owner") return false;
  const record = await readPath(store).catch(() => null);
  return pathStudioReminder(record, role, Date.now());
}
