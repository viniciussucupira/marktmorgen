/**
 * "Can people find your store?" in the studio (248 [ST1]): what a search
 * engine is given for the store and its first page of products, read only
 * from the store's own record (the same the store page is drawn from), so
 * the studio asks nothing more to show it. Pure, so it can be tested.
 *
 * Each point is what the code does with the creator's words, never a promise
 * about a place in search results:
 *   - the store's description is the line under its name (store.bio); with
 *     none, search engines get a generic sentence (app/[handle]/page.tsx);
 *   - a store with nothing on it is kept out of search results until it has
 *     a product or a link (its robots "index" is off);
 *   - a product's description is its sales page's search description, else
 *     its one-line summary; with neither, a generic sentence
 *     (app/[handle]/p/[product]/page.tsx). Only the summary is in the record,
 *     so a product without one is listed to check, not called wrong: its
 *     sales page may have its own search description.
 */
import { KIND, STORE_PAGE_SIZE } from "@/lib/catalog";
import type { Store } from "@/lib/store";
import { isHeader } from "@/lib/store-link";

export type SearchCheck = {
  /** The line under the store's name, which is its search description. */
  description: boolean;
  /** Whether the store is shown to search engines at all: it has a product or a link. */
  indexed: boolean;
  /** Visible products on the first page with no one-line summary, by title; and those whose card is not carried. */
  summaries: { missing: string[]; unchecked: number };
  /** Whether the store is on a domain of its own that is live. */
  ownDomain: boolean;
};

export function searchCheck(store: Store): SearchCheck {
  const first = store.catalog.items.filter((item) => (item.kind & KIND.hidden) === 0).slice(0, STORE_PAGE_SIZE);
  const links = store.links.filter((link) => !isHeader(link));
  const cards = new Map(store.catalog.head.map((listing) => [listing.id, listing]));
  const missing: string[] = [];
  let unchecked = 0;
  for (const item of first) {
    const card = cards.get(item.id);
    if (!card) unchecked += 1;
    else if (!card.hidden && card.summary.trim().length === 0) missing.push(card.title);
  }
  return {
    description: store.bio.trim().length > 0,
    indexed: !store.suspended && (first.length > 0 || links.length > 0),
    summaries: { missing, unchecked },
    ownDomain: Boolean(store.domain?.liveAt),
  };
}

/** What every store gets for search engines without the creator doing anything, in plain words. */
export const SEARCH_DONE_FOR_YOU: readonly string[] = [
  "A map of your store's pages for search engines, updated as you add products.",
  "Each product page tells search engines its name, picture and, once it can be bought, its price.",
  "Your store's questions and answers, and your blog posts, are marked so search engines can read them.",
  "On a domain of your own, search engines are told it is the main address of your store.",
];
