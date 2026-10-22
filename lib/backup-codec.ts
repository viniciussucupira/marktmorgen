import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import { gzipSync, gunzipSync } from "node:zlib";

// Offline codec only. No provider adapter, scheduler, secrets lookup or network.
// Limits bound memory for synthetic restore; they do not authorize production.
const MAGIC = Buffer.from("MMBK1");
const MAX = 4 * 1024 * 1024;
const AAD = Buffer.from("marktmorgen/backup/v1");
export type BackupRow = { key: string; dump: string; expiresAt: number | null };
export type BackupSnapshot = { version: 1; capturedAt: number; rows: BackupRow[] };
function validate(raw: unknown): BackupSnapshot {
 if (!raw || typeof raw !== "object" || Array.isArray(raw)) throw new Error("Invalid backup");
 const x = raw as Partial<BackupSnapshot>;
 if (x.version !== 1 || !Number.isSafeInteger(x.capturedAt) || Number(x.capturedAt) < 0 || !Array.isArray(x.rows) || x.rows.length > 10000) throw new Error("Invalid backup");
 const keys = new Set<string>();
 for (const row of x.rows) {
  if (!row || typeof row !== "object" || Array.isArray(row) || typeof row.key !== "string" ||
      !row.key.startsWith("nl:") || Buffer.byteLength(row.key) > 1024 || keys.has(row.key) ||
      typeof row.dump !== "string" || !/^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/.test(row.dump) ||
      !row.dump || Buffer.from(row.dump,"base64").toString("base64") !== row.dump ||
      (row.expiresAt !== null && (!Number.isSafeInteger(row.expiresAt) || row.expiresAt <= Number(x.capturedAt)))) throw new Error("Invalid backup row");
  keys.add(row.key);
 }
 return x as BackupSnapshot;
}
function validKey(key: Uint8Array) {
 if (key.byteLength !== 32) throw new Error("Invalid backup key");
}
export function sealBackup(snapshot: BackupSnapshot, key: Uint8Array): Buffer {
 validKey(key);
 const plain = Buffer.from(JSON.stringify(validate(snapshot)));
 if (plain.length > MAX) throw new Error("Backup exceeds codec bound");
 const packed = gzipSync(plain);
 const nonce = randomBytes(12);
 const cipher = createCipheriv("aes-256-gcm",key,nonce);
 cipher.setAAD(AAD);
 const encrypted = Buffer.concat([cipher.update(packed),cipher.final()]);
 return Buffer.concat([MAGIC,nonce,cipher.getAuthTag(),encrypted]);
}
export function openBackup(sealed: Uint8Array, key: Uint8Array): BackupSnapshot {
 validKey(key);
 const blob = Buffer.from(sealed);
 if (blob.length < 34 || blob.length > MAX+65536 || !blob.subarray(0,5).equals(MAGIC)) throw new Error("Invalid backup envelope");
 const decipher = createDecipheriv("aes-256-gcm",key,blob.subarray(5,17));
 decipher.setAAD(AAD);
 decipher.setAuthTag(blob.subarray(17,33));
 // Authenticate all ciphertext before decompression or parsing.
 const packed = Buffer.concat([decipher.update(blob.subarray(33)),decipher.final()]);
 return validate(JSON.parse(gunzipSync(packed,{maxOutputLength:MAX}).toString("utf8")));
}
export function restoreRows(snapshot: BackupSnapshot, now: number): BackupRow[] {
 const checked=validate(snapshot);
 if (!Number.isSafeInteger(now) || now < checked.capturedAt) throw new Error("Invalid restore clock");
 return checked.rows.filter(row=>row.expiresAt===null||row.expiresAt>now).map(row=>({...row}));
}
