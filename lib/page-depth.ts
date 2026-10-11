/**
 * How far down a product's sales page visitors read: for each block, the
 * share of visitors who reached it.
 *
 * Measured before it was built (7 October 2026): Kajabi, Stan, Hotmart,
 * Gumroad and Whop report views and sales of a page, not where on it people
 * stop. A creator who sees that half the visitors never get past the third
 * block knows which block to rewrite, or which to move up.
 *
 * What is kept, and what is not: when a visitor leaves the page, it sends the
 * id of the furthest block they saw (components/page-depth.tsx) — one visitor
 * in eight, since 11 October 2026 (lib/page-read.ts). One hash per product
 * counts, for each block id, how many visitors stopped there. No cookie, no address, nothing about who.
 * A block's share is everybody who stopped at it or further down, worked out
 * from the page as it is now; a removed block's count is simply not shown.
 *
 *   nl:depth:<statsId>:<productId>   hash: <blockId> (stopped there); _n (visitors) until 11 October 2026
 */
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { BLOCK_ID_PATTERN } from "@/lib/sales-page";

const key = (statsId: string, productId: string) => `nl:depth:${statsId}:${productId}`;
const KEEP_SECONDS = 400 * 86_400;

/**
 * Counts one visitor who read down to this block: one command (lib/page-read.ts
 * says why that matters). The record's expiry is written only when a block is
 * counted for the first time, so a page counted on keeps its record for a
 * little over a year after its newest block first appeared; how many visitors
 * were counted is the sum of the blocks, so it needs no command of its own.
 */
export async function countDepth(statsId: string | null, productId: string, blockId: string): Promise<void> {
  if (!statsId || !isRedisConfigured() || !BLOCK_ID_PATTERN.test(blockId)) return;
  const k = key(statsId, productId);
  try {
    const [count] = await redisPipeline([["HINCRBY", k, blockId, 1]]);
    if (Number(count) === 1) await redisPipeline([["EXPIRE", k, KEEP_SECONDS]]);
  } catch {
    // A measure that fails is a visitor not counted, nothing more.
  }
}

/** For each block of the page, in order, the share (0–100) of visitors who reached it; and how many were counted. */
export function reachShares(order: string[], stopped: Record<string, number>, visitors: number): { shares: Record<string, number>; visitors: number } {
  const shares: Record<string, number> = {};
  let below = 0;
  for (let i = order.length - 1; i >= 0; i -= 1) {
    below += stopped[order[i]] ?? 0;
    shares[order[i]] = visitors > 0 ? Math.round((Math.min(below, visitors) / visitors) * 100) : 0;
  }
  return { shares, visitors };
}

/** What was counted for a product: visitors, and how many stopped at each block id. */
export async function readDepth(statsId: string | null, productId: string): Promise<{ visitors: number; stopped: Record<string, number> }> {
  if (!statsId || !isRedisConfigured()) return { visitors: 0, stopped: {} };
  const [raw] = await redisPipeline([["HGETALL", key(statsId, productId)]]);
  const pairs: Record<string, string> = {};
  if (Array.isArray(raw)) for (let i = 0; i + 1 < raw.length; i += 2) pairs[String(raw[i])] = String(raw[i + 1]);
  else if (raw && typeof raw === "object") Object.assign(pairs, raw);
  const stopped: Record<string, number> = {};
  let visitors = 0;
  for (const [field, value] of Object.entries(pairs)) {
    if (field === "_n" || !(Number(value) > 0)) continue;
    stopped[field] = Number(value);
    visitors += Number(value);
  }
  // Every visitor counted stopped at exactly one block, so the blocks add up
  // to the visitors; "_n", written until 11 October 2026, said the same.
  return { visitors, stopped };
}
