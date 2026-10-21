/**
 * Limited quantities: how many are left, and never selling one more.
 *
 * Every checkout for a limited product holds one unit for as long as that
 * checkout can be paid — about half an hour, the least Stripe allows — and the
 * unit is either paid for or handed back. A hold whose time is up is checked
 * against the creator's Stripe account before it is let go, so a buyer who
 * paid and closed the tab before coming back still counts as sold.
 *
 * The number a buyer sees is therefore the real number: units nobody has
 * paid for or is paying for right now.
 */
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { HOLD_SECONDS, onAccount } from "@/lib/stripe-account";
import { isSettled } from "@/lib/instant-pay";
import { limitedStock } from "@/lib/product-extras";
import type { Listing, Store } from "@/lib/store";

const HOLD_MS = HOLD_SECONDS * 1000;
const MAX_CHECKS = 5;

type Entry = { until: number; paid?: boolean };

const stockKey = (id: string, productId: string) => `nl:stock:${id}:${productId}`;
const lockKey = (id: string, productId: string) => `nl:stock:lock:${id}:${productId}`;

async function readEntries(store: Store, product: Listing): Promise<Map<string, Entry>> {
  const [raw] = await redisPipeline([["HGETALL", stockKey(store.statsId!, product.id)]]);
  if (!Array.isArray(raw) || raw.length % 2 !== 0) throw new Error("Stock reading unavailable");
  const entries = new Map<string, Entry>();
  for (let i = 0; i < raw.length; i += 2) {
    const session = raw[i], encoded = raw[i + 1];
    if (typeof session !== "string" || !session || typeof encoded !== "string" || entries.has(session)) throw new Error("Stock reading unavailable");
    let value: unknown;
    try { value = JSON.parse(encoded); } catch { throw new Error("Stock reading unavailable"); }
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Stock reading unavailable");
    const entry = value as Partial<Entry>;
    if (!Number.isSafeInteger(entry.until) || (entry.until as number) < 0 || (entry.paid !== undefined && typeof entry.paid !== "boolean")) throw new Error("Stock reading unavailable");
    entries.set(session, { until: entry.until as number, ...(entry.paid !== undefined ? { paid: entry.paid } : {}) });
  }
  return entries;
}

/**
 * Units left of a limited product, or null when it is not limited.
 *
 * Holds that ran out are settled on the way: paid ones become sales, the rest
 * are handed back. When Stripe cannot be asked, a hold stays counted — the
 * safe way to be wrong is to show one unit too few, never to sell one too many.
 */
export async function stockLeft(store: Store, product: Listing, now = Date.now()): Promise<number | null> {
  const limit = limitedStock(product);
  if (limit === null) return null;
  if (!store.statsId || !isRedisConfigured()) throw new Error("Stock reading unavailable");
  const entries = await readEntries(store, product);
  let used = 0;
  let checks = 0;
  const writes: (string | number)[][] = [];
  for (const [session, entry] of entries) {
    if (entry.paid || entry.until > now) {
      used += 1;
      continue;
    }
    if (checks >= MAX_CHECKS || !store.stripeAccountId) {
      used += 1;
      continue;
    }
    checks += 1;
    try {
      const found = await onAccount("GET", store.stripeAccountId, `/checkout/sessions/${encodeURIComponent(session)}`);
      if (isSettled(found)) {
        writes.push(["HSET", stockKey(store.statsId, product.id), session, JSON.stringify({ until: 0, paid: true })]);
        used += 1;
      } else if (found.status === "expired") {
        writes.push(["HDEL", stockKey(store.statsId, product.id), session]);
      } else {
        // An unknown or completed-but-unsettled response is not proof that
        // this unit can be sold again.
        used += 1;
      }
    } catch {
      used += 1;
    }
  }
  if (writes.length) await redisPipeline(writes).catch(() => {});
  return Math.max(0, limit - used);
}

export type StockHold<T> = { ok: true; value: T } | { ok: false; reason: "soldout" | "busy" };

/**
 * Opens a checkout for a limited product only if a unit is free, and holds
 * that unit for it. Two buyers pressing buy for the last unit at the same
 * instant cannot both get a checkout: the count and the hold happen under one
 * short lock. `open` is told whether a unit is held, so the checkout it makes
 * closes before the hold runs out.
 */
export async function withStockHold<T extends { id: string }>(
  store: Store,
  product: Listing,
  open: (held: boolean) => Promise<T>,
): Promise<StockHold<T>> {
  if (limitedStock(product) === null) {
    return { ok: true, value: await open(false) };
  }
  if (!store.statsId || !isRedisConfigured()) return { ok: false, reason: "busy" };
  const lock = lockKey(store.statsId, product.id);
  let locked = false;
  for (let attempt = 0; attempt < 6 && !locked; attempt += 1) {
    const [got] = await redisPipeline([["SET", lock, "1", "NX", "EX", 15]]);
    if (got !== null && got !== "OK") return { ok: false, reason: "busy" };
    locked = got === "OK";
    if (!locked) await new Promise((resolve) => setTimeout(resolve, 250));
  }
  if (!locked) return { ok: false, reason: "busy" };
  try {
    const left = await stockLeft(store, product, Date.now());
    if (left !== null && left <= 0) return { ok: false, reason: "soldout" };
    const value = await open(true);
    // Counted from after the checkout exists, so the hold outlasts it.
    await redisPipeline([
      ["HSET", stockKey(store.statsId, product.id), value.id, JSON.stringify({ until: Date.now() + HOLD_MS })],
    ]);
    return { ok: true, value };
  } finally {
    await redisPipeline([["DEL", lock]]).catch(() => {});
  }
}

/** Marks a limited product's checkout as sold, once the buyer is back. */
export async function confirmStock(store: Store, product: Listing, session: string): Promise<void> {
  if (limitedStock(product) === null || !store.statsId || !isRedisConfigured()) return;
  await redisPipeline([
    ["HSET", stockKey(store.statsId, product.id), session, JSON.stringify({ until: 0, paid: true })],
  ]);
}

/**
 * Hands back the unit a buyer was holding when they go back from Stripe's
 * page and press buy again: the old checkout is closed at Stripe first, so it
 * can never be paid as well. A paid checkout cannot be closed, and stays sold.
 */
export async function releaseStockHold(store: Store, product: Listing, session: string): Promise<void> {
  if (limitedStock(product) === null || !store.statsId || !store.stripeAccountId || !isRedisConfigured()) return;
  if (!/^cs_(test|live)_[A-Za-z0-9]{8,200}$/.test(session)) return;
  const entries = await readEntries(store, product);
  const entry = entries.get(session);
  if (!entry || entry.paid) return;
  try {
    const closed = await onAccount(
      "POST",
      store.stripeAccountId,
      `/checkout/sessions/${encodeURIComponent(session)}/expire`,
      new URLSearchParams(),
    );
    if (closed.status !== "expired") return;
  } catch {
    return;
  }
  await redisPipeline([["HDEL", stockKey(store.statsId, product.id), session]]);
}
