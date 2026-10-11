/**
 * Where what a creator spent on ads is kept (lib/ad-spend-rules.ts says what
 * it is for). One field for each entry, so two people adding at once both
 * keep theirs; at most MAX_SPEND_ENTRIES, the oldest let go; kept as long as
 * the days of visits are, counted from the last entry added. Shown only in
 * the studio.
 *
 *   nl:stats:<statsId>:spend   hash: <id> → JSON { channel, campaign, cents, from, to }
 */
import { randomBytes } from "node:crypto";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { type AdSpend, MAX_SPEND_ENTRIES, readSpend } from "@/lib/ad-spend-rules";

const key = (statsId: string) => `nl:stats:${statsId}:spend`;
const ID = /^[a-f0-9]{8}$/;
const KEEP_SECONDS = 400 * 86_400;

export function parseSpends(raw: unknown): AdSpend[] {
  const flat = Array.isArray(raw) ? (raw as unknown[]).map(String) : [];
  const out: AdSpend[] = [];
  for (let i = 0; i + 1 < flat.length; i += 2) {
    if (!ID.test(flat[i])) continue;
    let value: unknown;
    try {
      value = JSON.parse(flat[i + 1]);
    } catch {
      continue;
    }
    if (!value || typeof value !== "object") continue;
    // Read back through the same rule it was written by, with no "now": a kept entry is never refused for its age.
    const v = value as Record<string, unknown>;
    const read = readSpend({ channel: v.channel, campaign: v.campaign, cents: v.cents, from: v.from, to: v.to }, Number.MAX_SAFE_INTEGER);
    if (read.ok) out.push({ id: flat[i], ...read.spend });
  }
  return out.sort((a, b) => a.from.localeCompare(b.from) || a.id.localeCompare(b.id)).slice(-MAX_SPEND_ENTRIES);
}

export async function readSpends(statsId: string | null): Promise<AdSpend[]> {
  if (!statsId || !isRedisConfigured()) return [];
  const [raw] = await redisPipeline([["HGETALL", key(statsId)]]);
  return parseSpends(raw);
}

export async function addSpend(
  statsId: string,
  input: { channel: unknown; campaign?: unknown; cents: unknown; from: unknown; to: unknown },
  now = Date.now(),
): Promise<{ ok: true; spends: AdSpend[] } | { ok: false; reason: "channel" | "amount" | "days" | "unavailable" }> {
  const read = readSpend(input, now);
  if (!read.ok) return read;
  if (!isRedisConfigured()) return { ok: false, reason: "unavailable" };
  const id = randomBytes(4).toString("hex");
  await redisPipeline([
    ["HSET", key(statsId), id, JSON.stringify(read.spend)],
    ["EXPIRE", key(statsId), KEEP_SECONDS],
  ]);
  const spends = await readSpends(statsId);
  const [count] = await redisPipeline([["HLEN", key(statsId)]]);
  if (Number(count) > MAX_SPEND_ENTRIES) {
    const keep = new Set(spends.map((s) => s.id));
    const [all] = await redisPipeline([["HKEYS", key(statsId)]]);
    const drop = (Array.isArray(all) ? (all as unknown[]).map(String) : []).filter((field) => !keep.has(field));
    if (drop.length) await redisPipeline([["HDEL", key(statsId), ...drop]]);
  }
  return { ok: true, spends };
}

export async function removeSpend(statsId: string, id: unknown): Promise<AdSpend[]> {
  if (typeof id === "string" && ID.test(id) && isRedisConfigured()) await redisPipeline([["HDEL", key(statsId), id]]);
  return readSpends(statsId);
}
