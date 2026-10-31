/**
 * 273 [BK1]: the daily backup run (lib/backup-run.ts): export → seal → write
 * to the backup's own bucket → read back, and each day's outcome kept for the
 * two-day failure report. Against the in-memory database and a stand-in
 * store; nothing real. Off three ways today, each checked: no reviewed cost
 * ceiling (BACKUP_COST_REVIEW is null), no backup bucket settings, no
 * encryption key. No schedule calls it (vercel.json is untouched).
 *
 * What fails here:
 *   - a run that sends a single command while any of the three is missing;
 *   - a copy written that does not read back the same, counted as done;
 *   - a day's outcome not kept, or two failed days in a row not seen.
 */
import { readFileSync } from "node:fs";
import { BACKUP_COST_REVIEW, backupFailedTwoDays, backupKey, runBackup, type BackupCostReview } from "@/lib/backup-run";
import type { BackupObjectStore } from "@/lib/backup-roundtrip";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

const T0 = 1_792_640_000_000;
const DAY = 86_400_000;
const review: BackupCostReview = { maxRows: 1_000, maxCommands: 10_000, maxBytes: 1_000_000, reviewedAt: "2026-10-31", source: "synthetic test review" };
const objects = new Map<string, Uint8Array>();
const store: BackupObjectStore = {
  putNew: async (id, bytes) => {
    if (objects.has(id)) throw new Error("exists");
    objects.set(id, new Uint8Array(bytes));
  },
  read: async (id) => objects.get(id) ?? Promise.reject(new Error("missing")),
};
const key = Buffer.alloc(32, 5);

async function main(): Promise<void> {
  redis.clear();
  redis.now = () => T0;
  redis.run(["SET", "nl:store:one", "a shop"]);
  redis.run(["HSET", "nl:stats:x", "v", "3"]);

  part("Off three ways today, and nothing is sent while off");
  is("no reviewed cost ceiling exists yet", BACKUP_COST_REVIEW, null);
  let sent = 0;
  const real = redis.pipeline.bind(redis);
  (redis as unknown as { pipeline: typeof redis.pipeline }).pipeline = (async (list: (string | number)[][]) => {
    sent += list.length;
    return real(list);
  }) as typeof redis.pipeline;
  const before = sent;
  is("no review: off, nothing sent", [await runBackup({ now: T0, review: null, store, key }), sent - before], [{ ok: false, reason: "off_review" }, 0]);
  is("no store: off, nothing sent", [await runBackup({ now: T0, review, store: null, key }), sent - before], [{ ok: false, reason: "off_store" }, 0]);
  is("no key: off, nothing sent", [await runBackup({ now: T0, review, store, key: null }), sent - before], [{ ok: false, reason: "off_key" }, 0]);
  delete process.env.BACKUP_ENCRYPTION_KEY;
  is("the key: none without the setting", backupKey(), null);
  process.env.BACKUP_ENCRYPTION_KEY = Buffer.alloc(16, 1).toString("base64");
  is("the key: not 32 bytes, none", backupKey(), null);
  process.env.BACKUP_ENCRYPTION_KEY = key.toString("base64");
  is("the key: 32 bytes from base64", backupKey()?.length, 32);
  delete process.env.BACKUP_ENCRYPTION_KEY;
  is("the default run, with nothing set, is off", (await runBackup()).ok, false);

  part("With all three, a copy is made, written once and read back the same");
  const ran = await runBackup({ now: T0, review, store, key });
  is("done, with the keys copied and its size", [ran.ok, ran.ok && ran.keys, objects.size], [true, 2, 1]);
  is("the day's outcome is kept", await backupFailedTwoDays(T0), false);

  part("Two failed days in a row are seen");
  const broken: BackupObjectStore = { ...store, read: async () => new Uint8Array([1, 2, 3]) };
  is("a copy that does not read back the same is a failure", await runBackup({ now: T0 + DAY, review, store: broken, key }), { ok: false, reason: "verify" });
  is("one failed day after a good one is not two", await backupFailedTwoDays(T0 + DAY), false);
  is("a cap reached is a failure that says which", await runBackup({ now: T0 + 2 * DAY, review: { ...review, maxRows: 1 }, store, key }), { ok: false, reason: "export_too_many" });
  is("two failed days in a row: seen", await backupFailedTwoDays(T0 + 2 * DAY), true);
  is("a day with no run at all counts as failed", await backupFailedTwoDays(T0 + 4 * DAY), true);

  part("Nothing schedules it");
  is("vercel.json names no backup route", /backup/i.test(readFileSync("vercel.json", "utf8")), false);
  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
