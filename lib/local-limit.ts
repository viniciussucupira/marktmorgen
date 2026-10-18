/**
 * A rate limit held in this server instance's memory (18 October 2026,
 * docs/security-audit-2026-10-18.md, MM-SA-04).
 *
 * For the routes where a counter in the store would itself be a cost the
 * plans do not carry: a picture is costed as a request the CDN answers
 * (tests/traffic-cost.ts), so a store-held limit would add commands to every
 * picture a cache does not hold. This one costs nothing.
 *
 * What it is honest about: each server instance counts on its own, so an
 * address spread over many instances gets that many allowances. It stops one
 * machine looping on one route; it is not a lock, and many machines at once
 * are the host's firewall's to stop.
 */
type Window = { n: number; until: number };

const windows = new Map<string, Window>();
/** At most this many windows are kept; past it the ended ones go, then the oldest. */
export const LOCAL_LIMIT_KEYS = 20_000;

/** True while `id` is inside `limit` hits in `windowMs` on this instance. Every call counts. */
export function withinLocalLimit(bucket: string, id: string, limit: number, windowMs: number, now: number = Date.now()): boolean {
  const key = `${bucket}\u0000${id}`;
  let w = windows.get(key);
  if (!w || w.until <= now) {
    if (windows.size >= LOCAL_LIMIT_KEYS) {
      for (const [k, v] of windows) if (v.until <= now) windows.delete(k);
      while (windows.size >= LOCAL_LIMIT_KEYS) windows.delete(windows.keys().next().value as string);
    }
    w = { n: 0, until: now + windowMs };
    windows.set(key, w);
  }
  w.n += 1;
  return w.n <= limit;
}
