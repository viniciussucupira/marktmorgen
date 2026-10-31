/**
 * 273 [BK1]: where a backup is restored for a drill — the owner's own,
 * separate and empty Upstash database, never the live one — as the
 * RestoreTarget that restoreSnapshot (lib/backup-export.ts) writes into.
 * Off until the owner sets BACKUP_RESTORE_REDIS_REST_URL and
 * BACKUP_RESTORE_REDIS_REST_TOKEN; refused when either is the live
 * database's (UPSTASH_REDIS_REST_* or KV_REST_API_*). Nothing here creates a
 * database, and nothing calls it yet.
 *
 * Upstash's REST API takes a binary value as the raw body of a POST, appended
 * as the command's last argument (https://upstash.com/docs/redis/features/restapi,
 * "JSON or Binary Value", read 31 October 2026). So each key is one
 * POST /restore/<key>/<ttl> with its DUMP bytes as the body: the value is
 * last, and the time still left is worked out just before sending, so no
 * argument comes after it (no ABSTTL, never REPLACE). RESTORE without
 * REPLACE is refused by the server for a key that is there (BUSYKEY), which
 * is what keeps a key made in between from being written over. Not yet tried
 * against a real Upstash database: that is the drill itself.
 */
import { timed } from "@/lib/fetch-timeout";
import type { RestoreTarget } from "@/lib/backup-export";

export type RestoreTargetConfig = { url: string; token: string };

const TIMEOUT_MS = 10_000;
const BASE64 = /^(?:[A-Za-z0-9+/]{4})*(?:[A-Za-z0-9+/]{2}==|[A-Za-z0-9+/]{3}=)?$/;
const env = (name: string) => (process.env[name] ?? "").trim();
const bare = (url: string) => url.replace(/\/+$/, "");

/** The owner's restore database; null while either setting is missing, malformed, or the live database's. */
export function restoreTargetConfig(): RestoreTargetConfig | null {
  const raw = env("BACKUP_RESTORE_REDIS_REST_URL");
  const token = env("BACKUP_RESTORE_REDIS_REST_TOKEN");
  if (!raw || token.length < 16) return null;
  let url: URL;
  try {
    url = new URL(raw);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.pathname.replace(/\/+$/, "") !== "" || url.search || url.hash || url.username || url.port) return null;
  if (!url.hostname.endsWith(".upstash.io")) return null;
  const address = url.origin;
  const live = [env("UPSTASH_REDIS_REST_URL"), env("KV_REST_API_URL")].filter(Boolean).map(bare);
  const liveTokens = [env("UPSTASH_REDIS_REST_TOKEN"), env("KV_REST_API_TOKEN")].filter(Boolean);
  if (live.includes(address) || liveTokens.includes(token)) return null;
  return { url: address, token };
}

/** The RestoreTarget over Upstash's REST API. A write is true only on "OK" (or for a key whose end has passed, which is left out); anything else, BUSYKEY included, is false. */
export function backupRestoreTarget(config: RestoreTargetConfig, now: () => number = Date.now): RestoreTarget {
  const auth = { Authorization: `Bearer ${config.token}` };
  return {
    exists: async (keys) => {
      const results = await timed(TIMEOUT_MS, async (signal) => {
        const response = await fetch(`${config.url}/pipeline`, {
          method: "POST",
          headers: { ...auth, "Content-Type": "application/json" },
          body: JSON.stringify(keys.map((key) => ["EXISTS", key])),
          signal,
          cache: "no-store",
          redirect: "error",
        });
        if (!response.ok) throw new Error(`Restore database answered ${response.status}`);
        return (await response.json()) as { result?: unknown; error?: string }[];
      });
      if (!Array.isArray(results) || results.length !== keys.length) throw new Error("Restore database answered the wrong number of results");
      return results.map((item) => {
        if (item.error || (item.result !== 0 && item.result !== 1)) throw new Error("Restore database could not say whether a key is there");
        return item.result as number;
      });
    },
    restore: async (key, expiresAt, dump) => {
      if (!BASE64.test(dump)) return false;
      const bytes = new Uint8Array(Buffer.from(dump, "base64"));
      let ttl = 0;
      if (expiresAt !== null) {
        ttl = expiresAt - now();
        if (!Number.isSafeInteger(ttl)) return false;
        // Its end passed while the restore ran (restoreRows keeps only rows alive when it starts):
        // the key would be gone by now, so nothing is written and the restore goes on.
        if (ttl <= 0) return true;
      }
      try {
        return await timed(TIMEOUT_MS, async (signal) => {
          const response = await fetch(`${config.url}/restore/${encodeURIComponent(key)}/${ttl}`, {
            method: "POST",
            headers: { ...auth, "Content-Type": "application/octet-stream" },
            body: bytes as BodyInit,
            signal,
            cache: "no-store",
            redirect: "error",
          });
          const answer = (await response.json().catch(() => null)) as { result?: unknown } | null;
          return response.ok && answer?.result === "OK";
        });
      } catch {
        return false;
      }
    },
  };
}
