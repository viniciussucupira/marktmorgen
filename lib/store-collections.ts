/**
 * Collections and picks that go together (added 17 October 2026): two ways a
 * creator says, in their own choice, which of their products belong
 * together. Rules the browser can read too; the store's record keeps the
 * collections and each product keeps its own picks (lib/store.ts,
 * lib/catalog.ts).
 *
 * A collection is a named group of the store's products with a page of its
 * own, /@handle/shop/<name>-<id>: "Beginner guides", "Everything for
 * weddings". Unlike a section (lib/store-sections.ts), which cuts the one
 * list of the store page, a product can be in several collections, and a
 * collection's page can be linked to on its own from a bio, an email or an
 * ad. Its products are the creator's, in the creator's order; the ones that
 * can go in a cart (lib/cart-rules.ts) can be added there one by one, or all
 * at once when they fit.
 *
 * "Goes well with" is a product's own short list of the creator's other
 * products, shown on its page and offered in the cart while it is in there.
 * It is said as what it is, the creator's pick, never as anything buyers did:
 * what buyers really bought together is said separately, counted from real
 * sales (lib/also-bought.ts). Nothing here counts, ranks or claims.
 *
 * Every list has a number it stops at, enforced where it is saved and again
 * where it is read, so a store record or a page never grows past it.
 */

/** The most collections one store may have. */
export const MAX_COLLECTIONS = 12;
/** The most products one collection may hold: one page of the store (lib/catalog.ts, STORE_PAGE_SIZE). */
export const MAX_COLLECTION_PRODUCTS = 24;
export const MAX_COLLECTION_TITLE = 60;
export const MAX_COLLECTION_BLURB = 200;
/** The most products one product may name as going well with it. */
export const MAX_PAIRS = 3;

export const COLLECTION_ID = /^[a-z0-9]{8}$/;
const PRODUCT_ID = /^[A-Za-z0-9_-]{1,64}$/;
const MAX_SLUG = 60;

export type Collection = {
  /** Its own id, kept for good: the end of its address, whatever its title becomes. */
  id: string;
  title: string;
  /** One or two lines of the creator's own, under the title; "" for none. */
  blurb: string;
  /** The store's products in it, in the creator's order, each once. */
  products: string[];
};

const oneLine = (value: unknown, max: number) =>
  typeof value === "string"
    ? value
        .replace(/[\u0000-\u001f\u007f\u2028\u2029]+/g, " ")
        .replace(/\s+/g, " ")
        .trim()
        .slice(0, max)
    : "";

/** Product ids as stored or sent: safe ones, each once, at most `max`, leaving out `except`. */
export function readProductIds(raw: unknown, max: number, except = ""): string[] {
  if (!Array.isArray(raw)) return [];
  const out: string[] = [];
  for (const id of raw) {
    if (typeof id !== "string" || !PRODUCT_ID.test(id) || id === except || out.includes(id)) continue;
    out.push(id);
    if (out.length >= max) break;
  }
  return out;
}

/** A new collection's id. */
export function newCollectionId(random: () => number = Math.random): string {
  const letters = "abcdefghijkmnpqrstuvwxyz23456789";
  let id = "";
  for (let i = 0; i < 8; i += 1) id += letters[Math.floor(random() * letters.length) % letters.length];
  return id;
}

/**
 * Collections as stored, made safe to use: each with an id, a title and at
 * least one product, ids unique, MAX_COLLECTIONS at most. One saved before
 * anything else checked it is read the same way.
 */
export function parseCollections(raw: unknown): Collection[] {
  if (!Array.isArray(raw)) return [];
  const out: Collection[] = [];
  for (const entry of raw) {
    if (!entry || typeof entry !== "object") continue;
    const value = entry as Record<string, unknown>;
    const id = typeof value.id === "string" && COLLECTION_ID.test(value.id) ? value.id : "";
    const title = oneLine(value.title, MAX_COLLECTION_TITLE);
    const products = readProductIds(value.products, MAX_COLLECTION_PRODUCTS);
    if (!id || !title || products.length === 0 || out.some((c) => c.id === id)) continue;
    out.push({ id, title, blurb: oneLine(value.blurb, MAX_COLLECTION_BLURB), products });
    if (out.length >= MAX_COLLECTIONS) break;
  }
  return out;
}

/** Why a set of collections sent by the studio cannot be saved, or null when it can. */
export type CollectionsProblem = "too_many" | "title" | "empty" | "too_big" | "unknown";

/**
 * Collections as the studio sends them, `[{ id?, title, blurb, products }]`:
 * all of them at once, in the order shown. A new one (no id, or one this
 * store does not have) is given an id; an existing one keeps its own, so its
 * address never changes. Refused as a whole rather than cut down, so the
 * studio never says "saved" about something that was not kept.
 */
export function readCollectionsInput(
  raw: unknown,
  current: Collection[],
  hasProduct: (id: string) => boolean,
  random: () => number = Math.random,
): { ok: true; collections: Collection[] } | { ok: false; reason: CollectionsProblem } {
  if (!Array.isArray(raw)) return { ok: false, reason: "unknown" };
  if (raw.length > MAX_COLLECTIONS) return { ok: false, reason: "too_many" };
  const out: Collection[] = [];
  for (const entry of raw) {
    const value = entry && typeof entry === "object" ? (entry as Record<string, unknown>) : {};
    const title = oneLine(value.title, MAX_COLLECTION_TITLE + 1);
    if (!title || title.length > MAX_COLLECTION_TITLE) return { ok: false, reason: "title" };
    if (!Array.isArray(value.products) || value.products.length === 0) return { ok: false, reason: "empty" };
    if (value.products.length > MAX_COLLECTION_PRODUCTS) return { ok: false, reason: "too_big" };
    const products = readProductIds(value.products, MAX_COLLECTION_PRODUCTS);
    if (products.length !== value.products.length || products.some((id) => !hasProduct(id))) return { ok: false, reason: "unknown" };
    const asked = typeof value.id === "string" ? value.id : "";
    let id = current.some((c) => c.id === asked) && !out.some((c) => c.id === asked) ? asked : "";
    // A new one never takes an id this store has or had in this list.
    for (let tries = 0; !id && tries < 20; tries += 1) {
      const fresh = newCollectionId(random);
      if (!out.some((c) => c.id === fresh) && !current.some((c) => c.id === fresh)) id = fresh;
    }
    if (!id) return { ok: false, reason: "unknown" };
    out.push({ id, title, blurb: oneLine(value.blurb, MAX_COLLECTION_BLURB), products });
  }
  return { ok: true, collections: out };
}

/** The collections with a product taken out; one left with nothing in it goes. */
export function collectionsWithout(collections: Collection[], removed: string): Collection[] {
  return collections.flatMap((c) => {
    if (!c.products.includes(removed)) return [c];
    const products = c.products.filter((id) => id !== removed);
    return products.length ? [{ ...c, products }] : [];
  });
}

/** The words of a title an address can carry: "Guides & recipes" is "guides-and-recipes". */
function slugOf(title: string): string {
  return title
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/ß/g, "ss")
    .replace(/&/g, " and ")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_SLUG)
    .replace(/-+$/g, "");
}

/** The last part of a collection's address: its title's words and its id. */
export function collectionSegment(collection: Pick<Collection, "id" | "title">): string {
  const slug = slugOf(collection.title);
  return slug ? `${slug}-${collection.id}` : collection.id;
}

/** The collection an address names, by the id at its end, whatever words come before it. */
export function collectionInSegment(segment: string, collections: Collection[]): Collection | null {
  const value = segment.toLowerCase();
  const id = COLLECTION_ID.test(value) ? value : /-([a-z0-9]{8})$/.exec(value)?.[1] ?? "";
  return id ? (collections.find((c) => c.id === id) ?? null) : null;
}

/** A product as the store's index lists it: its id, and whether it is a draft. */
export type Listed = { id: string; hidden: boolean };

/**
 * The published products of a collection, in its order: a draft or a product
 * no longer in the store is left out, so a collection never shows a product
 * a visitor could not open.
 */
export function shownProducts(collection: Collection, items: Listed[]): string[] {
  const published = new Set(items.filter((item) => !item.hidden).map((item) => item.id));
  return collection.products.filter((id) => published.has(id));
}

/** The collections worth a link: those with at least one published product, with how many. */
export function shownCollections(collections: Collection[], items: Listed[]): { collection: Collection; count: number }[] {
  return collections.flatMap((collection) => {
    const count = shownProducts(collection, items).length;
    return count > 0 ? [{ collection, count }] : [];
  });
}

/** The collections a product is in, in the store's order. */
export function collectionsOf(collections: Collection[], productId: string): Collection[] {
  return collections.filter((c) => c.products.includes(productId));
}

/** A product's picks as stored: other products' ids, each once, MAX_PAIRS at most. */
export function parsePairs(raw: unknown, self = ""): string[] {
  return readProductIds(raw, MAX_PAIRS, self);
}

/**
 * The picks of everything in a cart that could be added to it, in order:
 * each product's own picks in the order the creator set them, the first
 * product's first, leaving out what is already in the cart and anything
 * named twice. Each comes with the product that named it.
 */
export function cartPicks(inCart: { id: string; pairs?: string[] }[], exclude: Iterable<string>): { id: string; with: string }[] {
  const skip = new Set(exclude);
  for (const item of inCart) skip.add(item.id);
  const out: { id: string; with: string }[] = [];
  for (const item of inCart) {
    for (const id of item.pairs ?? []) {
      if (skip.has(id)) continue;
      skip.add(id);
      out.push({ id, with: item.id });
    }
  }
  return out;
}
