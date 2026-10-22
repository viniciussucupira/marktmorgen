/**
 * A physical order marked as shipped (lib/shipping.ts): the creator presses
 * "Mark as shipped" on the sale in the studio, with a tracking link if they
 * have one, and the buyer gets one email saying it is on its way.
 *
 * The order is read from the creator's own Stripe account before anything is
 * written, so only a paid checkout of this store that was shipped can be
 * marked, and the email goes to the address that paid, not one the studio
 * sends. Marking it twice sends nothing more.
 *
 *   nl:ship:done:<session>   when it was marked, and the tracking link (JSON), 400 days
 */
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { onAccount } from "@/lib/stripe-account";
import { sendEmail } from "@/lib/email";
import { fromCreator } from "@/lib/purchase-email";
import { saleHandles, type Store } from "@/lib/store";
import { isSettled } from "@/lib/instant-pay";
import { shippingWords } from "@/lib/buyer-words/shipping";
import { speech } from "@/lib/buyer-words";
import { shippingAddressOf, wasShipped } from "@/lib/shipping-address";

import { readTracking, readShippedRecord, type Shipped } from "@/lib/shipment-record";
export { readTracking };
export type { Shipped };

const SESSION = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;
const KEEP_SECONDS = 400 * 86_400;
export const doneKey = (session: string) => `nl:ship:done:${session}`;

/** When each of these orders was marked as shipped, by session id. */
export async function readShipped(sessions: string[]): Promise<Map<string, Shipped>> {
  const out = new Map<string, Shipped>();
  const ids = sessions.filter((id) => SESSION.test(id));
  if (!ids.length) return out;
  if (!isRedisConfigured()) throw new Error("Shipment status is unavailable");
  const rows = await redisPipeline(ids.map((id) => ["GET", doneKey(id)]));
  if (!Array.isArray(rows) || rows.length !== ids.length) {
    throw new Error("Shipment status reply is incomplete");
  }
  for (let i = 0; i < ids.length; i++) {
    const raw = rows[i];
    // Only an explicit missing key means the order has no shipment mark.
    if (raw === null) continue;
    if (typeof raw !== "string") throw new Error("Shipment status is unreadable");
    let value: Shipped | null;
    try {
      value = readShippedRecord(JSON.parse(raw));
    } catch {
      throw new Error("Shipment status is unreadable");
    }
    if (!value) throw new Error("Shipment status is unreadable");
    out.set(ids[i], value);
  }
  return out;
}

export type MarkResult = { ok: true; shipped: Shipped; emailed: boolean } | { ok: false; reason: "unknown" | "tracking" | "stripe" };

/** Marks a shipped order as sent and tells its buyer, once. */
export async function markShipped(store: Store, session: string, rawTracking: unknown, nowSeconds = Math.floor(Date.now() / 1000)): Promise<MarkResult> {
  if (!SESSION.test(session) || !store.stripeAccountId || !isRedisConfigured()) return { ok: false, reason: "unknown" };
  const tracking = readTracking(rawTracking);
  if (tracking === null) return { ok: false, reason: "tracking" };
  let row: Record<string, unknown>;
  try {
    row = await onAccount("GET", store.stripeAccountId, `/checkout/sessions/${encodeURIComponent(session)}`);
  } catch {
    return { ok: false, reason: "stripe" };
  }
  const meta = (row.metadata ?? {}) as Record<string, string>;
  if (!saleHandles(store).has(meta.store ?? "") || !wasShipped(row) || !isSettled(row as never)) return { ok: false, reason: "unknown" };
  const shipped: Shipped = { at: nowSeconds, tracking };
  // Taken first: two presses, two tabs, one email.
  let claimed: unknown;
  try {
    [claimed] = await redisPipeline([["SET", doneKey(session), JSON.stringify(shipped), "NX", "EX", KEEP_SECONDS]]);
  } catch { return { ok: false, reason: "unknown" }; }
  if (claimed === null) {
    try {
      const kept = (await readShipped([session])).get(session);
      return kept ? { ok: true, shipped: kept, emailed: false } : { ok: false, reason: "unknown" };
    } catch {
      // A claimed but unreadable record never grants another email.
      return { ok: false, reason: "unknown" };
    }
  }
  // Only an explicit storage acknowledgment grants the right to send.
  if (claimed !== "OK") return { ok: false, reason: "unknown" };
  const email = (row.customer_details as { email?: unknown } | null | undefined)?.email;
  if (typeof email !== "string" || !email.includes("@")) return { ok: true, shipped, emailed: false };
  const sw = shippingWords(store.language);
  const name = store.mail?.fromName || store.name;
  const title = (meta.title || "your order").slice(0, 200);
  const to = shippingAddressOf(row, speech(store).lang.locale);
  const text = [
    sw.shippedLead(title, name),
    ...(tracking ? ["", sw.track, tracking] : []),
    ...(to ? ["", sw.shippedTo, ...[to.name, ...to.lines].filter(Boolean)] : []),
    "",
    sw.shippedWhy(name),
  ].join("\n");
  const emailed = await sendEmail({ meter: { by: "order" },
    from: fromCreator(store),
    to: email,
    subject: sw.shippedSubject(title).slice(0, 200),
    text,
    replyTo: store.email,
    idempotencyKey: `nimbus-shipped:${session}`,
  }).catch(() => false);
  return { ok: true, shipped, emailed };
}
