/**
 * Where the month's goal is kept (lib/sales-goal-rules.ts says what it means):
 * one figure for the store, in its currency's smallest unit, used for every
 * month until it is changed.
 *
 *   nl:goal:<statsId>   the goal, as a number
 */
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { readGoal } from "@/lib/sales-goal-rules";

const key = (statsId: string) => `nl:goal:${statsId}`;

export async function readSalesGoal(statsId: string | null): Promise<number> {
  if (!statsId || !isRedisConfigured()) return 0;
  const [raw] = await redisPipeline([["GET", key(statsId)]]);
  return readGoal(raw) ?? 0;
}

/** Sets the goal, or takes it away with 0. Null when the figure is not one a goal can be. */
export async function setSalesGoal(statsId: string, raw: unknown): Promise<number | null> {
  const cents = readGoal(raw);
  if (cents === null || !isRedisConfigured()) return null;
  await redisPipeline([cents ? ["SET", key(statsId), String(cents)] : ["DEL", key(statsId)]]);
  return cents;
}
