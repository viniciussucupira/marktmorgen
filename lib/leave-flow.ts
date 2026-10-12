/**
 * The server side of asking why before a member cancels (lib/leave-rules.ts):
 * the answers counted, one counter per answer given, and the reason written
 * on the membership as Stripe's page is opened for cancelling it.
 *
 *   nl:leave:<statsId>:<yyyy-mm>   hash: said:<reason> → n, said:own → n,
 *                                  paused → n, switched → n, left → n; 400 days
 *
 * Every count is made by a press of a button on the page a member reaches by
 * pressing Cancel, never by a page being opened.
 */
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { LEAVE_REASONS, isOwnReasonId } from "@/lib/leave-rules";

const KEEP_SECONDS = 400 * 86_400;
const countKey = (statsId: string, month: string) => `nl:leave:${statsId}:${month}`;
const monthOf = (ms: number) => new Date(ms).toISOString().slice(0, 7);

export type LeaveCount = `said:${string}` | "paused" | "switched" | "left";

export async function countLeave(statsId: string | null, field: LeaveCount): Promise<void> {
  if (!statsId || !isRedisConfigured()) return;
  const key = countKey(statsId, monthOf(Date.now()));
  await redisPipeline([
    ["HINCRBY", key, field, 1],
    ["EXPIRE", key, KEEP_SECONDS],
  ]).catch(() => {});
}

/** The field an answer is counted under: each listed reason by itself, the creator's own together. */
export const saidField = (reason: string): LeaveCount => (isOwnReasonId(reason) ? "said:own" : `said:${reason}`);

export type LeaveMonth = { said: number; paused: number; switched: number; left: number };

/** This month on the store's cancel page: how many said why, paused, switched plan, or went on to cancel. */
export async function leaveMonth(statsId: string | null, now = Date.now()): Promise<LeaveMonth> {
  const out: LeaveMonth = { said: 0, paused: 0, switched: 0, left: 0 };
  if (!statsId || !isRedisConfigured()) return out;
  const fields = [...LEAVE_REASONS.map((r) => `said:${r}`), "said:own", "paused", "switched", "left"];
  const [values] = await redisPipeline([["HMGET", countKey(statsId, monthOf(now)), ...fields]]);
  if (!Array.isArray(values)) return out;
  fields.forEach((field, i) => {
    const n = Number(values[i]) || 0;
    if (field.startsWith("said:")) out.said += n;
    else out[field as "paused" | "switched" | "left"] += n;
  });
  return out;
}
