import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import type { FlowCounts } from "@/lib/flows";

const COUNTERS = ["started", "sent", "reached", "skipped", "acted"] as const;
const emptyCounts = (): FlowCounts => ({ started: 0, sent: 0, reached: 0, skipped: 0, acted: 0 });

/** An empty confirmed hash means zero; malformed activity remains unknown. */
export function parseFlowCounts(raw: unknown): FlowCounts | null {
  if (!Array.isArray(raw) || raw.length % 2 !== 0) return null;
  const counts = emptyCounts();
  const seen = new Set<string>();
  for (let i = 0; i < raw.length; i += 2) {
    const key = raw[i];
    if (typeof key !== "string" || seen.has(key)) return null;
    seen.add(key);
    if (!(COUNTERS as readonly string[]).includes(key)) continue;
    const value = raw[i + 1];
    if ((typeof value !== "string" && typeof value !== "number") || (typeof value === "string" && !/^\d+$/.test(value))) return null;
    const number = Number(value);
    if (!Number.isSafeInteger(number) || number < 0) return null;
    counts[key as typeof COUNTERS[number]] = number;
  }
  return counts;
}

/** Studio-only strict activity read; existing execution readers remain unchanged. */
export async function readFlowStatsStrict(flows: readonly { id: string }[]): Promise<Map<string, FlowCounts>> {
  if (!flows.length) return new Map();
  if (!isRedisConfigured()) throw new Error("Sequence activity storage is unavailable");
  const rows = await redisPipeline(flows.map(flow => ["HGETALL", `nl:mail:flowstats:${flow.id}`]));
  if (!Array.isArray(rows) || rows.length !== flows.length) throw new Error("Incomplete sequence activity response");
  const result = new Map<string, FlowCounts>();
  flows.forEach((flow, index) => {
    const counts = parseFlowCounts(rows[index]);
    if (!counts) throw new Error("Invalid sequence activity response");
    result.set(flow.id, counts);
  });
  return result;
}
