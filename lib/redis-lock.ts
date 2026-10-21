/**
 * A lock in Redis that only its holder can let go of, and that a write can
 * check it still holds before it lands.
 *
 * Several records here are read, changed and written back: a store and its
 * product index (lib/store.ts), a store's team (lib/team.ts). Two requests
 * doing that at the same instant would each write back what they read, and
 * the second would quietly undo the first — a product that vanishes from the
 * index, a person taken off a team who is back a moment later. So each
 * change takes the record's lock first, and the next one waits its turn.
 *
 * The lock is a key set with NX and an expiry, holding a random token of the
 * request that took it. Three things about it are done in one step on the
 * Redis side, with a short script, because doing them as two commands leaves
 * a gap another request can fall into:
 *
 *   - letting go deletes the key only if it still holds our token, so a lock
 *     that ran out and was taken by the next request is never deleted by us;
 *   - holding on (before a write that matters) makes the lock last longer,
 *     again only if it is still ours, and says whether it was;
 *   - a fenced write sets a record only while the lock is still ours, so a
 *     request that was held up past its lock's expiry — a slow network, a
 *     paused function — cannot land a stale copy over a newer one.
 *
 * Upstash runs these scripts (EVAL). Where a Redis does not, each falls back
 * to the same checks made as separate commands, which keeps the rules and
 * only loses the single step; the stand-ins the local checks use are like
 * that.
 */
import { redisPipeline } from "@/lib/redis";

const RELEASE = 'if redis.call("GET", KEYS[1]) == ARGV[1] then return redis.call("DEL", KEYS[1]) else return 0 end';
const EXTEND = 'if redis.call("GET", KEYS[1]) == ARGV[1] then return redis.call("EXPIRE", KEYS[1], ARGV[2]) else return 0 end';
const FENCED_SET = 'if redis.call("GET", KEYS[1]) == ARGV[1] then redis.call("SET", KEYS[2], ARGV[2]) return 1 else return 0 end';
const FENCED_SET_NEW =
  'if redis.call("GET", KEYS[1]) == ARGV[1] and redis.call("EXISTS", KEYS[2]) == 0 then redis.call("SET", KEYS[2], ARGV[2]) return 1 else return 0 end';

export type Held = { key: string; token: string; ttlSeconds: number };

/** Thrown when a lock stayed taken for longer than we wait, or was lost before a write. */
export class LockBusyError extends Error {
  constructor(message = "busy") {
    super(message);
  }
}

async function script(source: string, keys: string[], args: (string | number)[], fallback: () => Promise<number>): Promise<number> {
  try {
    const [result] = await redisPipeline([["EVAL", source, keys.length, ...keys, ...args]]);
    return Number(result);
  } catch {
    return fallback();
  }
}

/**
 * Takes the lock at `key`, waiting up to `waitMs` for another holder to let
 * go. Returns what the holder needs to keep and release it, or throws
 * LockBusyError.
 */
export async function takeLock(key: string, ttlSeconds: number, waitMs: number): Promise<Held> {
  const token = crypto.randomUUID();
  const giveUpAt = Date.now() + waitMs;
  for (let wait = 20; ; wait = Math.min(wait * 2, 250)) {
    const [got] = await redisPipeline([["SET", key, token, "NX", "EX", ttlSeconds]]);
    if (got === "OK") return { key, token, ttlSeconds };
    if (got !== null) throw new LockBusyError();
    if (Date.now() + wait > giveUpAt) throw new LockBusyError();
    await new Promise((resolve) => setTimeout(resolve, wait + Math.floor(Math.random() * 20)));
  }
}

/** Lets go of a lock, only if it is still ours. Never throws. */
export async function releaseLock(held: Held): Promise<void> {
  await script(RELEASE, [held.key], [held.token], async () => {
    const [now] = await redisPipeline([["GET", held.key]]);
    if (now !== held.token) return 0;
    const [gone] = await redisPipeline([["DEL", held.key]]);
    return Number(gone);
  }).catch(() => 0);
}

/**
 * Makes the lock last another full term, if it is still ours. False when it
 * ran out and somebody else may have written since: the caller must not
 * write what it read.
 */
export async function holdLock(held: Held): Promise<boolean> {
  const kept = await script(EXTEND, [held.key], [held.token, held.ttlSeconds], async () => {
    const [now] = await redisPipeline([["GET", held.key]]);
    if (now !== held.token) return 0;
    await redisPipeline([["EXPIRE", held.key, held.ttlSeconds]]);
    return 1;
  });
  return kept === 1;
}

/**
 * Sets `key` to `value` only while the lock is still ours — and, with
 * `absent`, only when nothing is there yet. False, and nothing written,
 * otherwise.
 */
export async function setIfHeld(held: Held, key: string, value: string, options: { absent?: boolean } = {}): Promise<boolean> {
  const done = await script(options.absent ? FENCED_SET_NEW : FENCED_SET, [held.key, key], [held.token, value], async () => {
    const [now, there] = await redisPipeline([["GET", held.key], ["EXISTS", key]]);
    if (now !== held.token || (options.absent && Number(there) === 1)) return 0;
    await redisPipeline([["SET", key, value]]);
    return 1;
  });
  return done === 1;
}

/** Runs `work` with the lock at `key` held, and lets go of it after, whatever happens. */
export async function withLock<T>(key: string, ttlSeconds: number, waitMs: number, work: (held: Held) => Promise<T>): Promise<T> {
  const held = await takeLock(key, ttlSeconds, waitMs);
  try {
    return await work(held);
  } finally {
    await releaseLock(held);
  }
}
