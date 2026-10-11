/**
 * Buyers a creator brought over from another platform: people who paid for a
 * course or a download somewhere else, and keep it here without paying again.
 *
 * Every other purchase on Marktmorgen is read from the creator's own Stripe account
 * (lib/buyer-orders.ts): Stripe is the ledger. These never went through Stripe
 * — nothing was charged, and no receipt exists — so they are the one kind of
 * purchase written down here, and they are always shown for what they are:
 * "Brought over from another platform", never as a sale. They are not counted
 * in the store's numbers, sent to webhooks, credited to affiliates or
 * reviewed, because none of those can be true of them.
 *
 * What one gives is what a purchase of that product gives on the list of
 * purchases (/orders): its file or its link, its course, and for a bundle each
 * of its products — and, when the product (or one in the bundle) opens the
 * store's community, the community (lib/community-access.ts). License keys
 * are not handed out for them: a buyer who had a key on the old platform
 * still has it there.
 *
 *   nl:imp:buy:<statsId>:<address hash>  product id -> { at, job, items }
 *
 * One entry per product and address, written only if there is none (HSETNX),
 * so importing the same file twice gives nobody anything twice.
 *
 * The same record carries two kinds of purchase that did not go through the
 * creator's Stripe either, told apart by `job`: "gift:<id>", a gift paid for
 * by someone else (lib/gifts.ts), and "paypal:<order>", a purchase paid into
 * the creator's own PayPal account (lib/paypal-sales.ts). Each is shown for
 * what it is on the list of purchases, never as brought over.
 */
import { rememberBuyers } from "@/lib/buyer-library";
import { createHash } from "node:crypto";
import { normaliseEmail } from "@/lib/auth";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import type { Store } from "@/lib/store";

/** One product one address was given. */
export type ImportedPurchase = {
  productId: string;
  /** When it was brought over, in seconds. */
  at: number;
  /** The import that brought it (lib/imports.ts). */
  job: string;
  /** For a bundle: the products it held when it was brought over. */
  items: string[] | null;
  /**
   * For a product with price options, given as a gift or as a place in a
   * purchase for several: the option that was paid for, which decides what
   * is handed over. Null otherwise.
   */
  option: string | null;
};

/** How imported purchases are named on the list of purchases: never a Stripe id. */
export const IMPORTED_REFERENCE = /^imp_[0-9a-f]{24}$/;

const sha = (value: string) => createHash("sha256").update(value).digest("hex");

/** The same address, however it was typed, as a key. */
export function addressHash(email: string): string {
  return sha(`nimbus-imported:${normaliseEmail(email)}`).slice(0, 32);
}

export const importedKey = (statsId: string, email: string) => `nl:imp:buy:${statsId}:${addressHash(email)}`;

/** The reference one imported purchase is known by on the list of purchases and in a download link. */
export function importedReference(statsId: string, email: string, productId: string): string {
  return `imp_${sha(`nimbus-imported-ref:${statsId}:${normaliseEmail(email)}:${productId}`).slice(0, 24)}`;
}

function parse(productId: string, raw: unknown): ImportedPurchase | null {
  if (typeof raw !== "string") return null;
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    const items = Array.isArray(value.items)
      ? value.items.filter((id): id is string => typeof id === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(id)).slice(0, 20)
      : [];
    return {
      productId,
      at: typeof value.at === "number" ? value.at : 0,
      job: typeof value.job === "string" ? value.job : "",
      items: items.length ? items : null,
      option: typeof value.option === "string" && /^[A-Za-z0-9_-]{1,64}$/.test(value.option) ? value.option : null,
    };
  } catch {
    return null;
  }
}

/** Reads a hash as Redis returns it, a flat list or an object. */
function pairs(raw: unknown): [string, unknown][] {
  if (Array.isArray(raw)) {
    const out: [string, unknown][] = [];
    for (let i = 0; i + 1 < raw.length; i += 2) out.push([String(raw[i]), raw[i + 1]]);
    return out;
  }
  if (raw && typeof raw === "object") return Object.entries(raw as Record<string, unknown>);
  return [];
}

/** The command that reads one address's imported purchases, for a caller's own pipeline. */
export function importedRead(store: Store, email: string): (string | number)[] | null {
  if (!store.pastBuyers || !store.statsId) return null;
  return ["HGETALL", importedKey(store.statsId, email)];
}

/** What such a read answered, as purchases. */
export function importedFrom(raw: unknown): ImportedPurchase[] {
  return pairs(raw)
    .map(([id, value]) => parse(id, value))
    .filter((p): p is ImportedPurchase => p !== null);
}

/** Everything this address was given here by an import; [] for a store that never imported buyers. */
export async function importedFor(store: Store, email: string): Promise<ImportedPurchase[]> {
  const read = importedRead(store, email);
  if (!read || !isRedisConfigured()) return [];
  const [raw] = await redisPipeline([read]);
  return importedFrom(raw);
}

/**
 * Gives many addresses their products in one round trip. Returns, for each
 * grant, whether it was new (false: that address already had that product).
 */
export async function grantImported(
  statsId: string,
  job: string,
  grants: { email: string; productId: string; items: string[] | null; option?: string | null }[],
  atSeconds = Math.floor(Date.now() / 1000),
  /** The store's own id, so each address finds the store in its library (lib/buyer-library.ts). */
  sid = "",
): Promise<boolean[]> {
  if (!grants.length || !isRedisConfigured()) return grants.map(() => false);
  if (sid) await rememberBuyers(sid, grants.map((g) => g.email));
  const answers = await redisPipeline(
    grants.map((g) => [
      "HSETNX",
      importedKey(statsId, g.email),
      g.productId,
      JSON.stringify({ at: atSeconds, job, items: g.items, ...(g.option ? { option: g.option } : {}) }),
    ]),
  );
  return answers.map((a) => Number(a) === 1);
}
