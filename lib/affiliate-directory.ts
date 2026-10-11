/**
 * The affiliate directory (opened 11 October 2026): one page on
 * marktmorgen.com where people looking for something to promote find the
 * programs of the creators who said theirs may be listed
 * (lib/directory-index.ts keeps who said yes).
 *
 * What a row says is what an affiliate needs before applying, and nothing
 * that is not true of the program today: the store, the share of each sale,
 * how long after a click a sale still counts and which click wins, whether a
 * buyer stays theirs for later purchases, the day the creator pays and how
 * long a sale waits first, and the products that earn, each with what one
 * sale of it earns at today's price. Read from the store's own record, never
 * typed for the directory.
 *
 * What it never says. No earnings an affiliate "can make", no ranking for
 * money, no score whose formula is kept from the people ranked by it: the
 * order is written on the page (DIRECTORY_ORDER), and nobody can pay to be
 * placed higher.
 *
 * Who is in it. A store whose creator said yes, whose program is on with a
 * share above 0, that can take a card today (lib/store-checkout.ts,
 * canSell), and that has at least one product an affiliate earns on. The
 * demo store never: it is a made-up store, and a made-up program in a list of
 * real ones would be a lie to every affiliate who applied to it.
 *
 * Money. Marktmorgen does not pay affiliates and never holds a sale: every
 * creator pays their own affiliates on the day they promise, as their program
 * page says. The directory says so too.
 *
 *   nl:dir:page   the rows, as JSON, kept 10 minutes; dropped whenever a
 *                 creator saves their program, so taking a store out is
 *                 immediate
 */
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { type Store, storeForId } from "@/lib/store";
import { recordListings, type Listing } from "@/lib/catalog";
import { commissionOn, commissionRate } from "@/lib/affiliate-setting";
import { canSell } from "@/lib/store-checkout";
import { isHouseStore } from "@/lib/house-store";
import { imageUrl } from "@/lib/product-image";
import { DIRECTORY_CACHE, listedStores, wouldList } from "@/lib/directory-index";
import type { LanguageCode } from "@/lib/store-language";

/** Products shown under one program: the rest are on its store. */
export const PRODUCTS_PER_ROW = 4;

/** How long the rows are kept before they are read again. */
const KEEP_SECONDS = 600;

/** The most programs read for the page: far past what one page lists. */
const MAX_ROWS = 2_000;

export type DirectoryProduct = {
  id: string;
  title: string;
  priceCents: number;
  /** The share this product earns, in percent. */
  rate: number;
  /** What one sale earns at today's price, before any refund. */
  earnCents: number;
  /** The product's picture, small, when it has one. */
  image: string | null;
};

export type DirectoryRow = {
  handle: string;
  name: string;
  language: LanguageCode;
  currency: string;
  /** The store-wide share, and the highest any listed product earns. */
  percent: number;
  topRate: number;
  /** What the best-paying product shown earns on one sale. */
  topEarnCents: number;
  days: number;
  rule: "first" | "last";
  lifetime: boolean;
  payday: number;
  hold: number;
  /** Whether a buyer may join at once, without applying. */
  buyers: boolean;
  products: DirectoryProduct[];
  /** How many products earn in all, of which `products` shows the first few. */
  earning: number;
};

/** A product an affiliate earns on: paid, sold once (memberships and payment plans earn nothing), on the store, and not left out of the program. */
function earns(store: Store, listing: Listing): DirectoryProduct | null {
  if (listing.priceCents <= 0 || listing.hidden || listing.recurring || listing.plan) return null;
  const rate = commissionRate(store.affiliates, listing.id);
  if (rate <= 0) return null;
  const price = listing.options.length ? Math.min(...listing.options.map((option) => option.priceCents)) : listing.priceCents;
  if (!(price > 0)) return null;
  return {
    id: listing.id,
    title: listing.title,
    priceCents: price,
    rate,
    earnCents: commissionOn(price, rate),
    image: listing.image ? imageUrl(listing.image.small ? { path: listing.image.small.path } : listing.image) : null,
  };
}

/** The row a store gets, or null when it does not belong in the directory today. */
export function directoryRow(store: Store): DirectoryRow | null {
  if (!wouldList(store) || isHouseStore(store) || !canSell(store)) return null;
  const products = recordListings(store)
    .map((listing) => earns(store, listing))
    .filter((product): product is DirectoryProduct => product !== null);
  if (!products.length) return null;
  const best = products.reduce((top, product) => (product.earnCents > top.earnCents ? product : top), products[0]);
  const s = store.affiliates;
  return {
    handle: store.handle,
    name: store.name,
    language: store.language,
    currency: store.currency,
    percent: s.percent,
    topRate: Math.max(...products.map((product) => product.rate)),
    topEarnCents: best.earnCents,
    days: s.days,
    rule: s.rule,
    lifetime: s.lifetime,
    payday: s.payday,
    hold: s.hold,
    buyers: s.buyers,
    products: products.slice(0, PRODUCTS_PER_ROW),
    earning: products.length,
  };
}

/**
 * The order the page lists programs in, as the page states it: the highest
 * share first; then the store with more products that earn; then by name.
 * Nothing about who pays Marktmorgen what, and no score of our own.
 */
export const DIRECTORY_ORDER =
  "Programs are listed by the highest share of a sale they pay, then by how many of their products earn, then by name. Nobody can pay to be placed higher, and the plan a creator is on plays no part.";

export function sortRows(rows: DirectoryRow[]): DirectoryRow[] {
  return [...rows].sort((a, b) => b.topRate - a.topRate || b.earning - a.earning || a.name.localeCompare(b.name, "en"));
}

/** Every listed program, read from the stores themselves, kept a few minutes. */
export async function readDirectory(): Promise<DirectoryRow[]> {
  if (!isRedisConfigured()) return [];
  const [kept] = await redisPipeline([["GET", DIRECTORY_CACHE]]);
  if (typeof kept === "string") {
    try {
      const rows = JSON.parse(kept) as DirectoryRow[];
      if (Array.isArray(rows)) return rows;
    } catch {
      // Read again below.
    }
  }
  const sids: string[] = [];
  let cursor = "0";
  do {
    const page = await listedStores(cursor, 200);
    sids.push(...page.sids);
    cursor = page.next;
  } while (cursor !== "0" && sids.length < MAX_ROWS);
  const stores = await Promise.all(sids.slice(0, MAX_ROWS).map((sid) => storeForId(sid).catch(() => null)));
  const rows = sortRows(stores.map((store) => (store ? directoryRow(store) : null)).filter((row): row is DirectoryRow => row !== null));
  await redisPipeline([["SET", DIRECTORY_CACHE, JSON.stringify(rows), "EX", KEEP_SECONDS]]).catch(() => null);
  return rows;
}
