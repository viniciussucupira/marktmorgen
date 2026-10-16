import { isRedisConfigured, redisPipeline } from "@/lib/redis";

type ModelBound = { model: string; maxOutputTokens: number; maxRequestBytes: number; upperBoundMicroUsd: number; evidence: string };
export type AiSupplierPolicy = { period: string; currency: "USD"; unit: "microUSD"; budgetMicroUsd: number; validUntil: number; evidence: string; boundsConfirmed: true; models: ModelBound[] };
const integer = (v: unknown, min: number) => typeof v === "number" && Number.isSafeInteger(v) && v >= min;
const evidence = (v: unknown): v is string => typeof v === "string" && v.trim().length > 0 && v.length <= 2_000;

/** Configured upper bounds require external evidence; this does not verify it. */
export function readAiSupplierPolicy(raw: unknown, now: number): AiSupplierPolicy | null {
  if (typeof raw !== "string" || raw.length > 32_000 || !Number.isFinite(now) || !Number.isFinite(new Date(now).getTime())) return null;
  try {
    const p = JSON.parse(raw) as AiSupplierPolicy;
    if (!p || Array.isArray(p) || p.period !== new Date(now).toISOString().slice(0, 7) || p.currency !== "USD" || p.unit !== "microUSD" ||
        !integer(p.budgetMicroUsd, 0) || !integer(p.validUntil, 1) || p.validUntil <= now || p.boundsConfirmed !== true || !evidence(p.evidence) ||
        !Array.isArray(p.models) || p.models.length < 1 || p.models.length > 10) return null;
    const ids = new Set<string>();
    for (const m of p.models) {
      if (!m || typeof m.model !== "string" || !/^claude-[a-z0-9.-]{3,60}$/.test(m.model) || ids.has(m.model) ||
          !integer(m.maxOutputTokens, 1) || !integer(m.maxRequestBytes, 1) || !integer(m.upperBoundMicroUsd, 1) || !evidence(m.evidence)) return null;
      ids.add(m.model);
    }
    return p;
  } catch { return null; }
}

export function isAiSupplierSpendConfigured(now = Date.now()): boolean {
  const p = readAiSupplierPolicy(process.env.AI_SUPPLIER_SPEND_POLICY, now);
  return p !== null && p.budgetMicroUsd > 0 && isRedisConfigured();
}

/**
 * Nonrefundable reservation of a declared worst-case request cost across ALL
 * stores and callers using this Redis database. A policy/model change cannot
 * reset the period key. No expiry, decrement, refund or automatic retry.
 */
export async function reserveAiSupplierSpend(input: { model: string; maxOutputTokens: number; requestBytes: number }, clock: () => number = Date.now): Promise<boolean> {
  const raw = process.env.AI_SUPPLIER_SPEND_POLICY;
  const now = clock();
  const p = readAiSupplierPolicy(raw, now);
  if (!p || !isRedisConfigured() || !integer(input.maxOutputTokens, 1) || !integer(input.requestBytes, 1)) return false;
  const m = p.models.find(m => m.model === input.model);
  if (!m || input.maxOutputTokens > m.maxOutputTokens || input.requestBytes > m.maxRequestBytes || m.upperBoundMicroUsd > p.budgetMicroUsd) return false;
  try {
    const reply = await redisPipeline([["INCRBY", `nl:spend:anthropic:${p.period}`, m.upperBoundMicroUsd]]);
    if (!Array.isArray(reply) || reply.length !== 1 || !integer(reply[0], m.upperBoundMicroUsd) || (reply[0] as number) > p.budgetMicroUsd) return false;
    // A request crossing expiry/month rollover or a changed policy is refused.
    return process.env.AI_SUPPLIER_SPEND_POLICY === raw && readAiSupplierPolicy(raw, clock()) !== null;
  } catch { return false; }
}
