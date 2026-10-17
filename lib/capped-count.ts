/**
 * Counting into hashes that may never grow past a number of fields (added 18
 * October 2026, when what a store keeps in the database was given a figure,
 * tests/store-data-registry.ts).
 *
 * A day's numbers (lib/stats.ts) and a page's reading (lib/page-depth.ts)
 * are counted under fields their visitors' requests name: a source, a term
 * searched for, a block. Each new name was a new field kept for a year, so
 * what a store kept grew with every request that named something new, and
 * no figure said how far. Counted through this script, a field that is
 * already there always counts, and a new one is added only while the hash
 * has fewer fields than its most; past it, what it would have counted is
 * added to the hash's "~" field instead (so the total stays right and the
 * studio can say some were not told apart): a hash holds its most fields and
 * "~" at the most.
 *
 *   KEYS        the hashes
 *   ARGV[1..n]  each hash's most fields, n = #KEYS
 *   then        (hash number, field, by) three at a time
 *
 * Answers each field's new value in order, or 0 for one left out. Nothing
 * is written when anything asked is not a count it can do.
 *
 * scripts/test_capped_count_redis.py runs it on a real Redis.
 */
import { isRedisConfigured, redisPipeline } from "@/lib/redis";

/** The field what did not fit is counted under. */
export const OVER_FIELD = "~";

export const CAPPED_COUNT = `-- marktmorgen:capped-count:v1
local n = #KEYS
if n < 1 or #ARGV < n or (#ARGV - n) % 3 ~= 0 then return redis.error_reply('capped-count: arguments') end
local caps = {}
for i = 1, n do
  local cap = tonumber(ARGV[i])
  if not cap or cap < 1 or cap ~= math.floor(cap) then return redis.error_reply('capped-count: most') end
  caps[i] = cap
end
for i = n + 1, #ARGV, 3 do
  local k = tonumber(ARGV[i])
  local by = tonumber(ARGV[i + 2])
  if not k or k < 1 or k > n or k ~= math.floor(k) or not by or by ~= math.floor(by) or ARGV[i + 1] == '' or ARGV[i + 1] == '~' then return redis.error_reply('capped-count: count') end
end
local out = {}
for i = n + 1, #ARGV, 3 do
  local k = tonumber(ARGV[i])
  local field = ARGV[i + 1]
  local by = tonumber(ARGV[i + 2])
  if redis.call('HEXISTS', KEYS[k], field) == 1 or redis.call('HLEN', KEYS[k]) < caps[k] then
    out[#out + 1] = redis.call('HINCRBY', KEYS[k], field, by)
  else
    redis.call('HINCRBY', KEYS[k], '~', by)
    out[#out + 1] = 0
  end
end
return out`;

export type CappedCount = { hash: number; field: string; by: number };

/** The EVAL that counts these, for a pipeline of its own or one shared with other commands. */
export function cappedCountCommand(hashes: { key: string; most: number }[], counts: CappedCount[]): (string | number)[] {
  return ["EVAL", CAPPED_COUNT, hashes.length, ...hashes.map((h) => h.key), ...hashes.map((h) => h.most), ...counts.flatMap((c) => [c.hash + 1, c.field, c.by])];
}

/** Counts into one hash; each field's new value, or 0 where it was left out. Never throws. */
export async function cappedCount(key: string, most: number, counts: { field: string; by: number }[]): Promise<number[]> {
  if (!isRedisConfigured() || !counts.length) return counts.map(() => 0);
  try {
    const [reply] = await redisPipeline([cappedCountCommand([{ key, most }], counts.map((c) => ({ hash: 0, ...c })))]);
    return Array.isArray(reply) ? reply.map((v) => Number(v) || 0) : counts.map(() => 0);
  } catch {
    return counts.map(() => 0);
  }
}
