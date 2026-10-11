/**
 * A store's own pages (lib/site-page-rules.ts, added 11 October 2026). What
 * is checked:
 *
 *   - no page can take an address a store already uses for something else,
 *     now or once added: every folder under app/[handle] is reserved;
 *   - addresses are made from titles, cleaned, and kept once each;
 *   - the menu shows a page only while it is out, and knows that from the
 *     store's record alone;
 *   - a store's domain reads one word as one of its pages, but never the
 *     site's own pages;
 *   - a page whose buttons led to a product that is removed leads to the
 *     store instead, and one cannot be made to lead to a product the store
 *     does not have.
 */
import { readdirSync } from "node:fs";
import { join } from "node:path";
import { MAX_SITE_PAGES, RESERVED_SLUGS, SITE_KINDS, isOwnPagePath, outFrom, pageOut, parseSitePages, slugFrom, slugProblem } from "@/lib/site-page-rules";
import { addProduct, claimHandle, removeProduct, setSitePages, storeForEmail } from "@/lib/store";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

const page = (over: Record<string, unknown> = {}) => ({ id: "aaaaaaaaaa", slug: "about", title: "About", nav: true, target: "", from: 0, ...over });

async function main(): Promise<void> {
  redis.clear();

  part("Addresses");
  const folders = readdirSync(join(process.cwd(), "app/[handle]"), { withFileTypes: true }).filter((d) => d.isDirectory() && !d.name.startsWith("[")).map((d) => d.name);
  is("every page a store already has is an address a page cannot take", folders.filter((name) => !RESERVED_SLUGS.has(name)), []);
  is("made from a title", [slugFrom("About me!"), slugFrom("Café & Coaching"), slugFrom("   ")], ["about-me", "cafe-coaching", ""]);
  is("only lowercase words with dashes, nothing reserved, each once", [
    slugProblem("about", []),
    slugProblem("About", []),
    slugProblem("p", []),
    slugProblem("blog", []),
    slugProblem("about", [page()]),
    slugProblem("about", [page()], "aaaaaaaaaa"),
  ], [null, "slug", "reserved", "reserved", "taken", null]);
  is("a stored list is cleaned: a bad address, a repeat, more than the most", [
    parseSitePages([page(), page({ id: "bbbbbbbbbb" }), page({ id: "cccccccccc", slug: "Bad Slug" })]).length,
    parseSitePages(Array.from({ length: 15 }, (_, i) => page({ id: `p${String(i).padStart(9, "0")}`, slug: `page-${i}` }))).length,
  ], [1, MAX_SITE_PAGES]);
  is("only blocks that mean something without a product of the page's own", ["reviews", "guarantee", "inside", "bonuses", "compare", "facts"].some((k) => (SITE_KINDS as readonly string[]).includes(k)), false);

  part("The menu");
  const now = 1_800_000_000;
  is("out now, out later, not out", [pageOut({ from: 0 }, now), pageOut({ from: now + 60 }, now), pageOut({ from: now - 60 }, now), pageOut({ from: -1 }, now)], [true, false, true, false]);
  is("when a page is out, from its blocks", [
    outFrom({ blocks: [1], hidden: false, showFrom: 0 }),
    outFrom({ blocks: [], hidden: false, showFrom: 0 }),
    outFrom({ blocks: [1], hidden: true, showFrom: 0 }),
    outFrom({ blocks: [1], hidden: true, showFrom: now }),
  ], [0, -1, -1, now]);

  part("On the store's own domain");
  is("one word or words with dashes is a page; the site's own pages and the store's other parts are not", [
    isOwnPagePath("/about"),
    isOwnPagePath("/work-with-me"),
    isOwnPagePath("/privacy"),
    isOwnPagePath("/studio"),
    isOwnPagePath("/p"),
    isOwnPagePath("/about/team"),
    isOwnPagePath("/About"),
  ], [true, true, false, false, false, false, false]);

  part("Buttons that lead to a product");
  const OWNER = "pages@example.com";
  await claimHandle(OWNER, "pagesshop", "Pages Shop", "");
  const made = await addProduct(OWNER, "Meal Plan", "", "19", null);
  if (!made.ok) throw new Error("no product");
  is("not to a product the store does not have", (await setSitePages(OWNER, [page({ target: "nosuchproduct" })])).ok, false);
  is("to one it has", (await setSitePages(OWNER, [page({ target: made.product.id })])).ok, true);
  is("and the store is given the id its pages' blocks are kept under", Boolean((await storeForEmail(OWNER))?.statsId), true);
  await removeProduct(OWNER, made.product.id);
  is("the product removed, the page leads to the store", (await storeForEmail(OWNER))?.sitePages[0]?.target, "");

  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
