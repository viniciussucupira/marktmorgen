import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { confirmedAiReservation } from "@/lib/ai-quota";

/** Nonrefundable weighted attempts, separate from the returned-result quota. */
export const AI_ATTEMPT_MULTIPLIER = 2;
export const aiAttemptKey = (statsId: string, now: number) =>
  `nl:ai-attempt:${statsId}:${new Date(now).toISOString().slice(0, 7)}`;

/**
 * Reserve before work can reach a paid provider. Never release this counter:
 * failed or lost responses can still have incurred cost. Unknown reservation
 * replies authorize no work and are not retried. This is not a dollar budget.
 */
export async function reserveAiAttempt(statsId: string, now: number, allowance: number, jobs = 1): Promise<"reserved" | "exhausted" | "unavailable"> {
  if (!isRedisConfigured() || !/^[A-Za-z0-9_-]{1,128}$/.test(statsId) ||
      !Number.isFinite(now) || !Number.isFinite(new Date(now).getTime()) ||
      !Number.isSafeInteger(allowance) || allowance < 1 ||
      !Number.isSafeInteger(jobs) || jobs < 1 ||
      !Number.isSafeInteger(allowance * AI_ATTEMPT_MULTIPLIER)) return "unavailable";
  const limit = allowance * AI_ATTEMPT_MULTIPLIER;
  if (jobs > limit) return "exhausted";
  try {
    const key = aiAttemptKey(statsId, now);
    const reply = await redisPipeline([["INCRBY", key, jobs], ["EXPIRE", key, 40 * 86_400]]);
    const counters = confirmedAiReservation(reply, [jobs]);
    if (!counters) return "unavailable";
    return counters[0] <= limit ? "reserved" : "exhausted";
  } catch { return "unavailable"; }
}
