/**
 * 248 [ST1]: "Can people find your store?" in the studio
 * (lib/store-search-check.ts). Checked: the store's description, whether it
 * is open to search engines, the first-page products with no summary named
 * with where to fix them, a hidden one never named, one whose card is not
 * carried counted as unchecked, and what the studio says, which never
 * promises a place in results.
 */
import { renderToStaticMarkup } from "react-dom/server";
import { StoreSearchCheck } from "@/components/store-search-check";
import { addProduct, claimHandle, ensureStatsId, storeForEmail, updateDetails, type Store } from "@/lib/store";
import { KIND } from "@/lib/catalog";
import { SEARCH_DONE_FOR_YOU, searchCheck } from "@/lib/store-search-check";
import { readFileSync } from "node:fs";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

async function main(): Promise<void> {
  redis.clear();
  const owner = "search-check@example.com";
  await claimHandle(owner, "searchcheckshop", "Search Check Shop", "");
  await ensureStatsId(owner);
  const check = async () => searchCheck((await storeForEmail(owner))!);

  part("An empty store");
  is("kept out of results, no description yet", [(await check()).indexed, (await check()).description], [false, false]);

  part("Products and the description");
  const bread = await addProduct(owner, "Bread Book", "", "19", null);
  const cake = await addProduct(owner, "Cake Course", "Ten lessons on cakes.", "49", null);
  if (!bread.ok || !cake.ok) throw new Error("No synthetic products");
  is("open to search engines once it has a product", (await check()).indexed, true);
  is("the product with no summary is named, the other is not", (await check()).summaries, { missing: ["Bread Book"], unchecked: 0 });
  await updateDetails(owner, "Search Check Shop", "Bread and cakes for home bakers.");
  is("the line under the name is its description", (await check()).description, true);
  const stored = (await storeForEmail(owner))!;
  const hidden: Store = { ...stored, catalog: { ...stored.catalog, items: stored.catalog.items.map((item) => (item.id === bread.product.id ? { ...item, kind: item.kind | KIND.hidden } : item)) } };
  is("a hidden product is not on the page, so not named", searchCheck(hidden).summaries.missing, []);
  const notCarried: Store = { ...stored, catalog: { ...stored.catalog, head: stored.catalog.head.filter((l) => l.id !== bread.product.id) } };
  is("a first-page product whose card is not carried is unchecked, never called fine", searchCheck(notCarried).summaries, { missing: [], unchecked: 1 });
  is("a suspended store is not open to search engines", searchCheck({ ...stored, suspended: "2026-11-01" }).indexed, false);

  part("What the studio shows");
  const shown = renderToStaticMarkup(StoreSearchCheck({ check: { description: false, indexed: true, summaries: { missing: ["Bread & Co"], unchecked: 0 }, ownDomain: false } }));
  is("a heading, the missing description with where to write it, the product named with where to fix it", [shown.includes("Can people find your store?"), shown.includes('href="#details"'), shown.includes("Bread &amp; Co"), shown.includes('href="#products"')], [true, true, true, true]);
  is("never a promise about results", [/rank|top of google|first page of google|guarantee/i.test(shown), shown.includes("nobody can promise that")], [false, true]);
  const fine = renderToStaticMarkup(StoreSearchCheck({ check: { description: true, indexed: true, summaries: { missing: [], unchecked: 0 }, ownDomain: false } }));
  is("all done: said so", [fine.includes('data-search-description="yes"'), fine.includes('data-search-summaries="done"')], [true, true]);

  part("What is done for every store is what the code does");
  const productPage = readFileSync("app/[handle]/p/[product]/page.tsx", "utf8");
  const storePage = readFileSync("app/[handle]/page.tsx", "utf8");
  is("each line is backed: a per-store sitemap, product data with the offer only when sellable, FAQ and blog data, the own domain as canonical", [
    readFileSync("app/[handle]/store-sitemap/route.ts", "utf8").length > 0,
    /selling && canSellProduct\(store, product\)/.test(productPage),
    /faqData\(store\.faq\)/.test(storePage),
    readFileSync("app/[handle]/blog/[post]/page.tsx", "utf8").includes('"BlogPosting"'),
    /alternates: \{ canonical: ownDomain \}/.test(storePage),
  ], [true, true, true, true, true]);
  is("four lines, plain words", SEARCH_DONE_FOR_YOU.length, 4);
  done();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
