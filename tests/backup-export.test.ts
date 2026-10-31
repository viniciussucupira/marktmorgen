/**
 * 273 [BK1]: the daily export of the store's database (lib/backup-export.ts)
 * and a restore of it into an empty database, against the in-memory
 * stand-in (lib/redis-memory.ts), synthetic data only. Nothing real is read
 * or written, and nothing schedules it: the export is built and tested, off.
 *
 * What fails here:
 *   - a key of ours left out, or a key that is not ours taken;
 *   - a type, a value or an expiry that does not come back the same;
 *   - a snapshot handed back when the command budget or the row cap ran out
 *     (never a partial copy that looks whole);
 *   - a restore that writes over a key the target already has;
 *   - the commands spent not counted (each SCAN, and a DUMP and a PTTL per key).
 */
import { MemoryRedis } from "@/lib/redis-memory";
import { exportSnapshot, restoreSnapshot, type RestoreTarget } from "@/lib/backup-export";
import { openBackup, sealBackup } from "@/lib/backup-codec";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

const T0 = 1_792_640_000_000;

/** Everything a key holds, as a test can compare it. */
function look(db: MemoryRedis, key: string): unknown {
  const type = db.run(["TYPE", key]);
  const value =
    type === "string" ? db.run(["GET", key])
    : type === "hash" ? db.run(["HGETALL", key])
    : type === "set" ? (db.run(["SMEMBERS", key]) as string[]).sort()
    : type === "zset" ? db.run(["ZSCAN", key, 0])
    : type === "list" ? db.run(["LRANGE", key, 0, -1])
    : null;
  return { type, value, pttl: db.run(["PTTL", key]) };
}

function into(db: MemoryRedis): RestoreTarget {
  return {
    exists: async (keys) => keys.map((key) => Number(db.run(["EXISTS", key]))),
    restore: async (key, expiresAt, dump) => db.run(["RESTORE", key, expiresAt ?? 0, Buffer.from(dump, "base64").toString("utf8"), ...(expiresAt ? ["ABSTTL"] : [])]) === "OK",
  };
}

async function main(): Promise<void> {
  redis.clear();
  redis.now = () => T0;
  redis.run(["SET", "nl:store:one", "a shop with ü and 🙂"]);
  redis.run(["HSET", "nl:stats:x:2026-10-31", "v", "3", "r:direct", "2"]);
  redis.run(["PEXPIRE", "nl:stats:x:2026-10-31", 86_400_000]);
  redis.run(["SADD", "nl:traffic:day:x", "a", "b", "c"]);
  redis.run(["ZADD", "nl:live:x", 5, "one", 7, "two"]);
  redis.run(["RPUSH", "nl:queue:x", "first", "second"]);
  redis.run(["SET", "other:product:key", "not ours"]);
  for (let i = 0; i < 40; i += 1) redis.run(["SET", `nl:many:${String(i).padStart(2, "0")}`, String(i)]);

  part("Everything of ours, and nothing else");
  const made = await exportSnapshot({ maxRows: 1_000, maxCommands: 10_000, batch: 16, now: T0 });
  if (!made.ok) throw new Error(`export refused: ${made.reason}`);
  const keys = made.snapshot.rows.map((r) => r.key);
  is("every nl: key, each once, in order", [keys.length, new Set(keys).size, keys.includes("other:product:key"), keys.join() === [...keys].sort().join()], [45, 45, false, true]);
  is("an expiry is kept as the moment it ends, a key without one as none", [made.snapshot.rows.find((r) => r.key === "nl:stats:x:2026-10-31")?.expiresAt, made.snapshot.rows.find((r) => r.key === "nl:store:one")?.expiresAt], [T0 + 86_400_000, null]);
  is("the commands spent are counted: each SCAN, a DUMP and a PTTL a key", made.commands === made.scans + 2 * 45 && made.scans >= 1, true);

  part("It comes back the same, into an empty database");
  const key = Buffer.alloc(32, 9);
  const sealed = sealBackup(made.snapshot, key);
  const opened = openBackup(sealed, key);
  const fresh = new MemoryRedis();
  fresh.now = () => T0 + 1_000;
  const restored = await restoreSnapshot(opened, into(fresh), T0 + 1_000);
  is("restored, every key", restored, { ok: true, keys: 45 });
  is("each type, value and expiry the same", keys.every((k) => {
    const a = look(redis, k) as { type: string; value: unknown; pttl: number };
    const b = look(fresh, k) as { type: string; value: unknown; pttl: number };
    return a.type === b.type && JSON.stringify(a.value) === JSON.stringify(b.value) && (a.pttl === -1 ? b.pttl === -1 : Math.abs(a.pttl - 1_000 - b.pttl) <= 1);
  }), true);
  is("and nothing that is not ours", fresh.run(["EXISTS", "other:product:key"]), 0);

  part("Never over a key the target already has");
  const busy = new MemoryRedis();
  busy.now = () => T0 + 1_000;
  busy.run(["SET", "nl:store:one", "newer"]);
  is("refused before anything is written", [await restoreSnapshot(opened, into(busy), T0 + 1_000), busy.run(["GET", "nl:store:one"]), busy.run(["EXISTS", "nl:queue:x"])], [{ ok: false, reason: "exists", keys: 1 }, "newer", 0]);

  part("A cap reached is a refusal, never part of a copy");
  is("the command budget", (await exportSnapshot({ maxRows: 1_000, maxCommands: 50, batch: 16, now: T0 })).ok, false);
  const budget = await exportSnapshot({ maxRows: 1_000, maxCommands: 50, batch: 16, now: T0 });
  is("says which", !budget.ok && budget.reason, "budget");
  const rows = await exportSnapshot({ maxRows: 10, maxCommands: 10_000, batch: 16, now: T0 });
  is("the row cap", [rows.ok, !rows.ok && rows.reason], [false, "too_many"]);
  is("bad limits refused", (await exportSnapshot({ maxRows: 0, maxCommands: 10, batch: 16, now: T0 })).ok, false);

  part("A key gone between the scan and its copy is left out, not copied empty");
  redis.run(["PEXPIRE", "nl:many:00", 1]);
  redis.now = () => T0 + 5;
  const later = await exportSnapshot({ maxRows: 1_000, maxCommands: 10_000, batch: 16, now: T0 + 5 });
  is("gone, so not in the copy", later.ok && later.snapshot.rows.some((r) => r.key === "nl:many:00"), false);
  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
