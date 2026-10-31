/**
 * 273 [BK1]: one daily backup run. Export every key of ours under the caps of
 * a reviewed cost ceiling (lib/backup-export.ts), seal it (lib/backup-codec.ts),
 * write it once to the backup's own bucket and read it back the same
 * (lib/backup-roundtrip.ts, lib/backup-store.ts), then keep the day's outcome
 * so two failed days in a row can be reported.
 *
 * Off three ways, each checked before a single command is sent:
 *   - no reviewed cost ceiling: BACKUP_COST_REVIEW is null until the owner's
 *     review of what a run costs (database commands, bucket writes and reads,
 *     storage) is recorded with its date and source. Unknown cost is never zero.
 *   - no backup bucket settings (backupStoreConfig()).
 *   - no 32-byte BACKUP_ENCRYPTION_KEY.
 * Nothing schedules it: vercel.json is untouched (owner prerequisite 6 of
 * docs/backup.md), and no route calls it.
 */
import { BACKUP_MAX_BYTES, BACKUP_MAX_ROWS, exportSnapshot } from "@/lib/backup-export";
import { verifyBackupRoundtrip, type BackupObjectStore } from "@/lib/backup-roundtrip";
import { backupStoreConfig, r2BackupStore } from "@/lib/backup-store";
import { redisPipeline } from "@/lib/redis";

/** The reviewed ceiling one run may spend: its caps, and when and from what it was reviewed. */
export type BackupCostReview = { maxRows: number; maxCommands: number; maxBytes: number; reviewedAt: string; source: string };

/** No review yet: the run stays off. */
export const BACKUP_COST_REVIEW: BackupCostReview | null = null;

/** Keys copied per request. */
const BATCH = 100;
/** How long each day's outcome is kept. */
const OUTCOME_SECONDS = 8 * 86_400;
const DAY_MS = 86_400_000;

export type BackupRunResult =
  | { ok: true; id: string; keys: number; bytes: number }
  | { ok: false; reason: "off_review" | "off_store" | "off_key" | "export_limits" | "export_budget" | "export_too_many" | "export_too_big" | "export_unreadable" | "verify" };

/** The encryption key from BACKUP_ENCRYPTION_KEY (base64 of exactly 32 bytes), or none. */
export function backupKey(): Uint8Array | null {
  const raw = process.env.BACKUP_ENCRYPTION_KEY?.trim();
  if (!raw || !/^[A-Za-z0-9+/]+={0,2}$/.test(raw)) return null;
  const key = Buffer.from(raw, "base64");
  return key.length === 32 ? new Uint8Array(key) : null;
}

const dayOf = (ms: number) => new Date(ms).toISOString().slice(0, 10);
const outcomeKey = (ms: number) => `nl:backup:day:${dayOf(ms)}`;

export type BackupRunOptions = { now?: number; review?: BackupCostReview | null; store?: BackupObjectStore | null; key?: Uint8Array | null };

function defaultStore(): BackupObjectStore | null {
  const config = backupStoreConfig();
  return config ? r2BackupStore(config) : null;
}

/** One run: off unless all three are there; otherwise a verified copy, or a failure that says which step. */
export async function runBackup(options: BackupRunOptions = {}): Promise<BackupRunResult> {
  const now = options.now ?? Date.now();
  const review = "review" in options ? options.review : BACKUP_COST_REVIEW;
  if (!review) return { ok: false, reason: "off_review" };
  const store = "store" in options ? options.store : defaultStore();
  if (!store) return { ok: false, reason: "off_store" };
  const key = "key" in options ? options.key : backupKey();
  if (!key || key.length !== 32) return { ok: false, reason: "off_key" };

  const result = await copy(review, store, key, now);
  await redisPipeline([["SET", outcomeKey(now), result.ok ? "ok" : result.reason, "EX", OUTCOME_SECONDS]]);
  return result;
}

async function copy(review: BackupCostReview, store: BackupObjectStore, key: Uint8Array, now: number): Promise<BackupRunResult> {
  const exported = await exportSnapshot({
    maxRows: Math.min(review.maxRows, BACKUP_MAX_ROWS),
    maxCommands: review.maxCommands,
    batch: BATCH,
    maxBytes: Math.min(review.maxBytes, BACKUP_MAX_BYTES),
    now,
  });
  if (!exported.ok) return { ok: false, reason: `export_${exported.reason}` };
  try {
    const done = await verifyBackupRoundtrip(exported.snapshot, key, store, Math.min(review.maxBytes, BACKUP_MAX_BYTES) + 65_536);
    return { ok: true, id: done.id, keys: done.keys, bytes: done.bytes };
  } catch {
    // The write or the read-back failed; every earlier copy is left as it was.
    return { ok: false, reason: "verify" };
  }
}

/** True when the day of `now` and the day before have no successful run: none at all counts as failed. */
export async function backupFailedTwoDays(now: number = Date.now()): Promise<boolean> {
  const [today, yesterday] = (await redisPipeline([["MGET", outcomeKey(now), outcomeKey(now - DAY_MS)]]))[0] as (string | null)[];
  return today !== "ok" && yesterday !== "ok";
}
