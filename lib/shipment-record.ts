/** Browser-safe validation shared by fulfillment storage and its confirmation UI. */
export type Shipped = { at: number; tracking: string };

/** An HTTPS tracking address of at most 500 characters, or no tracking link. */
export function readTracking(raw: unknown): string | null {
  const typed = typeof raw === "string" ? raw.trim() : "";
  if (!typed) return "";
  if (typed.length > 500) return null;
  try {
    const url = new URL(typed);
    return url.protocol === "https:" && url.hostname.includes(".") && !url.username && !url.password ? url.toString() : null;
  } catch {
    return null;
  }
}

/** Unknown storage is not evidence that an order was marked as shipped. */
export function readShippedRecord(raw: unknown): Shipped | null {
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const value = raw as Record<string, unknown>;
  if (!Object.hasOwn(value, "at") || !Object.hasOwn(value, "tracking")) return null;
  if (typeof value.at !== "number" || !Number.isSafeInteger(value.at) || value.at <= 0 || value.at > 8_640_000_000_000) return null;
  if (typeof value.tracking !== "string") return null;
  const tracking = readTracking(value.tracking);
  return tracking === null ? null : { at: value.at, tracking };
}

/** A successful HTTP response still needs explicit, consistent application proof. */
export function readShipmentConfirmation(raw: unknown, httpOk: boolean): { shipped: Shipped; emailed: boolean } | null {
  if (!httpOk || !raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const value = raw as Record<string, unknown>;
  if (!Object.hasOwn(value, "ok") || value.ok !== true || Object.hasOwn(value, "error")) return null;
  if (!Object.hasOwn(value, "emailed") || typeof value.emailed !== "boolean" || !Object.hasOwn(value, "shipped")) return null;
  const shipped = readShippedRecord(value.shipped);
  return shipped ? { shipped, emailed: value.emailed } : null;
}
