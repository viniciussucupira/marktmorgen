import { mayNotify, validTimeZone } from "@/lib/path-rules";
/** Extra studio requests reserved before reading devices or dispatching push. */
export const PATH_REMINDER_UNITS = 20;
/** Keep the eight-second push request away from the start of quiet hours. */
export const PATH_PUSH_GRACE_MS = 10_000;
export function maySendPathReminder(timeZone:string,now:number):boolean {
 return Number.isFinite(now)&&Math.abs(now)<8.64e15-PATH_PUSH_GRACE_MS&&validTimeZone(timeZone)&&mayNotify(timeZone,now)&&mayNotify(timeZone,now+PATH_PUSH_GRACE_MS);
}
