/**
 * Provider-side Resend usage for an exact UTC window.
 *
 * This is evidence, not admission. The paid fallback ceiling is reserved in
 * Redis before sending; this reader compares that ledger with the provider.
 * Resend's official List Sent Emails endpoint (read 31 October 2026) returns
 * at most 100 newest-first records and uses the last email id as `after`.
 */
import { RESEND_BASE } from "@/lib/email";
import { RESEND_TIMEOUT_MS, timed } from "@/lib/fetch-timeout";

const PAGE_LIMIT = 100;
const MAX_PAGES = 501; // Enough to prove the paid 50,000/month ceiling plus one page.
const ID = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export type ResendUsage =
  | { ok: true; recipients: number; records: number; pages: number; from: string; through: string }
  | { ok: false; reason: "not_configured" | "unauthorized" | "provider" | "unknown" | "too_many" };

function dataRecord(value: unknown): Record<string, unknown> | null {
  if (!value || typeof value !== "object" || Array.isArray(value) ||
      ![Object.prototype, null].includes(Object.getPrototypeOf(value))) return null;
  const copy: Record<string, unknown> = Object.create(null);
  for (const key of Reflect.ownKeys(value)) {
    if (typeof key !== "string") return null;
    const descriptor = Object.getOwnPropertyDescriptor(value, key);
    if (!descriptor || !("value" in descriptor)) return null;
    copy[key] = descriptor.value;
  }
  return copy;
}

function ownArray(value: unknown, max: number): unknown[] | null {
  if (!Array.isArray(value) || value.length > max) return null;
  const copy: unknown[] = [];
  for (let index = 0; index < value.length; index += 1) {
    const descriptor = Object.getOwnPropertyDescriptor(value, String(index));
    if (!descriptor || !("value" in descriptor)) return null;
    copy.push(descriptor.value);
  }
  return copy;
}

/**
 * Counts recipients in Resend records created from `fromMs` through the
 * single `throughMs` snapshot. Unknown shape, authorization, order or
 * coverage never becomes zero.
 */
export async function resendUsageSince(fromMs: number, throughMs = Date.now()): Promise<ResendUsage> {
  const key = process.env.RESEND_READ_API_KEY?.trim() || process.env.RESEND_API_KEY?.trim();
  if (!key) return { ok: false, reason: "not_configured" };
  if (!Number.isSafeInteger(fromMs) || !Number.isSafeInteger(throughMs) ||
      fromMs < 0 || throughMs < fromMs) return { ok: false, reason: "unknown" };

  let after = "";
  let previousTime = Number.POSITIVE_INFINITY;
  let recipients = 0;
  let records = 0;
  const ids = new Set<string>();

  for (let pageNumber = 1; pageNumber <= MAX_PAGES; pageNumber += 1) {
    const query = new URLSearchParams({ limit: String(PAGE_LIMIT) });
    if (after) query.set("after", after);
    let response: Response;
    try {
      response = await timed(RESEND_TIMEOUT_MS, (signal) => fetch(`${RESEND_BASE}/emails?${query}`, {
        method: "GET",
        headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
        cache: "no-store",
        signal,
      }));
    } catch {
      return { ok: false, reason: "provider" };
    }
    if (response.status === 401 || response.status === 403) return { ok: false, reason: "unauthorized" };
    if (!response.ok) return { ok: false, reason: "provider" };

    let raw: unknown;
    try {
      raw = await response.json();
    } catch {
      return { ok: false, reason: "unknown" };
    }
    const page = dataRecord(raw);
    if (!page || page.object !== "list" || typeof page.has_more !== "boolean") {
      return { ok: false, reason: "unknown" };
    }
    const rows = ownArray(page.data, PAGE_LIMIT);
    if (!rows || page.has_more && rows.length === 0) return { ok: false, reason: "unknown" };

    let crossedWindow = false;
    for (const rawRow of rows) {
      const row = dataRecord(rawRow);
      const id = row?.id;
      const created = row?.created_at;
      const to = ownArray(row?.to, 100);
      if (!row || typeof id !== "string" || !ID.test(id) || ids.has(id) ||
          typeof created !== "string" || created.length > 64 || !to || to.length === 0 ||
          to.some((address) => typeof address !== "string" || address.length === 0 || address.length > 254)) {
        return { ok: false, reason: "unknown" };
      }
      const at = Date.parse(created);
      if (!Number.isSafeInteger(at) || at < 0 || at > previousTime) return { ok: false, reason: "unknown" };
      previousTime = at;
      ids.add(id);
      // Stable newest-first pagination may include a send created after the
      // caller took its upper-bound snapshot. Skip it and keep walking to the
      // exact window instead of turning concurrent delivery into false usage.
      if (at > throughMs) continue;
      if (at < fromMs) {
        crossedWindow = true;
        continue;
      }
      if (crossedWindow) return { ok: false, reason: "unknown" };
      recipients += to.length;
      records += 1;
      if (!Number.isSafeInteger(recipients)) return { ok: false, reason: "too_many" };
    }

    if (crossedWindow || page.has_more === false) {
      return {
        ok: true, recipients, records, pages: pageNumber,
        from: new Date(fromMs).toISOString(), through: new Date(throughMs).toISOString(),
      };
    }
    after = rows.length ? (dataRecord(rows[rows.length - 1])?.id as string) : "";
    if (!after) return { ok: false, reason: "unknown" };
  }
  return { ok: false, reason: "too_many" };
}


export type ResendUsageWindow = {
  used: number;
  limit: number | null;
  sent: number;
  received: number;
  resetsAt: string;
};

export type ResendAccountUsage =
  | { ok: true; daily: ResendUsageWindow; monthly: ResendUsageWindow }
  | { ok: false; reason: "not_configured" | "unauthorized" | "provider" | "unknown" };

function whole(value: unknown): number | null {
  return typeof value === "number" && Number.isSafeInteger(value) && value >= 0 ? value : null;
}

function usageWindow(value: unknown): ResendUsageWindow | null {
  const row = dataRecord(value);
  const used = whole(row?.used);
  const sent = whole(row?.sent);
  const received = whole(row?.received);
  const limit = row?.limit === null ? null : whole(row?.limit);
  const resetsAt = row?.resets_at;
  if (!row || used === null || sent === null || received === null || limit === null && row.limit !== null ||
      used !== sent + received || typeof resetsAt !== "string" || resetsAt.length > 64) return null;
  const reset = Date.parse(resetsAt);
  if (!Number.isSafeInteger(reset) || reset < 0 || new Date(reset).toISOString() !== resetsAt) return null;
  return { used, limit, sent, received, resetsAt };
}

/**
 * Reads Resend's authoritative daily and monthly account usage. This is a
 * comparison signal only: it requires a full-access read key and never grants
 * permission to send. The local atomic pre-send ceiling remains independent.
 */
export async function resendAccountUsage(): Promise<ResendAccountUsage> {
  const key = process.env.RESEND_READ_API_KEY?.trim() || process.env.RESEND_API_KEY?.trim();
  if (!key) return { ok: false, reason: "not_configured" };
  let response: Response;
  try {
    response = await timed(RESEND_TIMEOUT_MS, (signal) => fetch(`${RESEND_BASE}/usage`, {
      method: "GET",
      headers: { Authorization: `Bearer ${key}`, Accept: "application/json" },
      cache: "no-store",
      signal,
    }));
  } catch {
    return { ok: false, reason: "provider" };
  }
  if (response.status === 401 || response.status === 403) return { ok: false, reason: "unauthorized" };
  if (!response.ok) return { ok: false, reason: "provider" };
  let raw: unknown;
  try {
    raw = await response.json();
  } catch {
    return { ok: false, reason: "unknown" };
  }
  const account = dataRecord(raw);
  const emails = dataRecord(account?.emails);
  const daily = usageWindow(emails?.daily);
  const monthly = usageWindow(emails?.monthly);
  if (!account || account.object !== "usage" || !emails || !daily || !monthly) {
    return { ok: false, reason: "unknown" };
  }
  return { ok: true, daily, monthly };
}
