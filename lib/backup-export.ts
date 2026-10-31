/**
 * 273 [BK1]: the export of every key of ours in the database, for the daily
 * backup, and its restore into an empty database. Built and tested; nothing
 * calls it yet (no schedule, bucket, credential or key exists: those are the
 * owner's steps in docs/backup.md), so it is off.
 *
 * The export walks the keys with SCAN, keeps those under BACKUP_PREFIX, and
 * copies each with DUMP (Redis's own serialized value, every type, read with
 * the REST API's base64 answers so its bytes are not lost) and PTTL (its
 * time to live, kept as the moment it ends). What it costs is counted as it
 * goes and decided before any DUMP is sent: a SCAN is one command and a key
 * two. A cap reached is a refusal of the whole: never a partial copy handed
 * back as if it were the whole database. Upstash bills every command
 * (https://upstash.com/docs/redis/overall/billing, read 31 October 2026).
 *
 * Not a point-in-time copy: a key written while the walk runs may be in it
 * with its newer value, and one made after its part of the walk is not. A key
 * gone between the walk and its DUMP is left out, never copied empty.
 *
 * The restore writes into a database that has none of the keys: it looks
 * first, and refuses before writing anything when one is there.
 */
import { redisPipeline, redisPipelineBase64 } from "@/lib/redis";
import { restoreRows, type BackupRow, type BackupSnapshot } from "@/lib/backup-codec";

/** Every key of ours starts with it (lib/data-families.ts). */
export const BACKUP_PREFIX = "nl:";
/** The most rows the backup format holds (lib/backup-codec.ts). */
export const BACKUP_MAX_ROWS = 10_000;
/** Keys a SCAN is asked for at a time; a hint, which the server may answer with more or fewer. */
const SCAN_COUNT = 500;

export type ExportLimits = {
  /** The most keys to copy; more is a refusal. */
  maxRows: number;
  /** The most commands to send in all; a walk or a copy that would need more is a refusal before it is sent. */
  maxCommands: number;
  /** Keys copied per request. */
  batch: number;
  /** The moment of the copy, in ms. */
  now: number;
};

export type ExportResult =
  | { ok: true; snapshot: BackupSnapshot; commands: number; scans: number }
  | { ok: false; reason: "limits" | "budget" | "too_many" | "unreadable"; commands: number };

const whole = (n: unknown, most = Number.MAX_SAFE_INTEGER) => typeof n === "number" && Number.isSafeInteger(n) && n > 0 && n <= most;

/** Every key of ours, copied, or a refusal that says why. */
export async function exportSnapshot(limits: ExportLimits): Promise<ExportResult> {
  const { maxRows, maxCommands, batch, now } = limits;
  if (!whole(maxRows, BACKUP_MAX_ROWS) || !whole(maxCommands) || !whole(batch, 500) || !whole(now)) return { ok: false, reason: "limits", commands: 0 };
  let commands = 0;
  let scans = 0;
  const keys = new Set<string>();
  let cursor = "0";
  do {
    if (commands + 1 > maxCommands) return { ok: false, reason: "budget", commands };
    const [reply] = await redisPipeline([["SCAN", cursor, "MATCH", `${BACKUP_PREFIX}*`, "COUNT", SCAN_COUNT]]);
    commands += 1;
    scans += 1;
    if (!Array.isArray(reply) || reply.length !== 2 || typeof reply[0] !== "string" || !Array.isArray(reply[1])) return { ok: false, reason: "unreadable", commands };
    for (const key of reply[1]) {
      if (typeof key !== "string") return { ok: false, reason: "unreadable", commands };
      if (key.startsWith(BACKUP_PREFIX)) keys.add(key);
      if (keys.size > maxRows) return { ok: false, reason: "too_many", commands };
    }
    cursor = reply[0];
  } while (cursor !== "0");

  const sorted = [...keys].sort();
  // Decided before any DUMP: the whole copy fits the budget, or nothing is copied.
  if (commands + 2 * sorted.length > maxCommands) return { ok: false, reason: "budget", commands };
  const rows: BackupRow[] = [];
  for (let at = 0; at < sorted.length; at += batch) {
    const part = sorted.slice(at, at + batch);
    const replies = await redisPipelineBase64(part.flatMap((key) => [["DUMP", key], ["PTTL", key]]));
    commands += 2 * part.length;
    for (let i = 0; i < part.length; i += 1) {
      const dump = replies[2 * i];
      const pttl = Number(replies[2 * i + 1]);
      // Gone between the walk and its copy: left out, never copied empty.
      if (dump === null || pttl === -2 || pttl === 0) continue;
      if (typeof dump !== "string" || !dump || !Number.isSafeInteger(pttl) || pttl < -1) return { ok: false, reason: "unreadable", commands };
      rows.push({ key: part[i], dump, expiresAt: pttl === -1 ? null : now + pttl });
    }
  }
  return { ok: true, snapshot: { version: 1, capturedAt: now, rows }, commands, scans };
}

/** Where a restore writes: whether keys are there, and one key restored from its DUMP with its end, if any. */
export type RestoreTarget = {
  exists: (keys: string[]) => Promise<number[]>;
  restore: (key: string, expiresAt: number | null, dump: string) => Promise<boolean>;
};

export type RestoreResult = { ok: true; keys: number } | { ok: false; reason: "exists" | "failed"; keys: number };

/**
 * A snapshot written into an empty database: every row still alive at `now` (lib/backup-codec.ts, restoreRows),
 * each with its own end. Refused before writing anything when the target has any of the keys (`keys`: how many).
 * A write that fails stops it (`keys`: how many were written before it).
 */
export async function restoreSnapshot(snapshot: BackupSnapshot, target: RestoreTarget, now: number): Promise<RestoreResult> {
  const rows = restoreRows(snapshot, now);
  const there = await target.exists(rows.map((row) => row.key));
  const taken = there.filter((n) => n > 0).length;
  if (taken > 0 || there.length !== rows.length) return { ok: false, reason: "exists", keys: taken };
  let written = 0;
  for (const row of rows) {
    if (!(await target.restore(row.key, row.expiresAt, row.dump))) return { ok: false, reason: "failed", keys: written };
    written += 1;
  }
  return { ok: true, keys: written };
}
