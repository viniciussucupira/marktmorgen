/**
 * A store's own map and crawler rules (lib/store-sitemap.ts, added
 * 13 October 2026). What is checked:
 *
 *   - the map lists what the pages ask a search engine to keep, at the
 *     address each names as its own: products a visitor can see, pages that
 *     are out, the blog and its published posts — and nothing hidden;
 *   - on a creator's live domain the addresses are the domain's;
 *   - a store switched off after notices lists nothing and asks not to be read;
 *   - a creator's domain answers /sitemap.xml and /robots.txt with the
 *     store's, and the site keeps its own (proxy.ts).
 */
import { readFileSync } from "node:fs";
import { addProduct, claimHandle, ensureStatsId, setProductHidden, setSitePages, storeForEmail } from "@/lib/store";
import { savePost } from "@/lib/store-blog";
import { sitemapXml, storeRobots, storeSitemap } from "@/lib/store-sitemap";
import { SITE_URL } from "@/lib/site-url";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

let n = 0;
const nextId = () => (n++).toString(16).padStart(10, "0");

async function main(): Promise<void> {
  redis.clear();
  process.env.UPSTASH_REDIS_REST_URL ??= "http://stub";
  const OWNER = "map@example.com";
  await claimHandle(OWNER, "mapshop", "Map Shop", "");
  await ensureStatsId(OWNER);
  const shown = await addProduct(OWNER, "Rye Guide", "", "19", null);
  const kept = await addProduct(OWNER, "Secret Draft", "", "9", null);
  if (!shown.ok || !kept.ok) throw new Error("no products");
  await setProductHidden(OWNER, kept.product.id, true);
  await setSitePages(OWNER, [
    { id: "aaaaaaaaaa", slug: "about", title: "About", nav: true, target: "", from: 0 },
    { id: "bbbbbbbbbb", slug: "later", title: "Later", nav: false, target: "", from: -1 },
  ]);
  let store = (await storeForEmail(OWNER))!;
  await savePost(store.statsId, null, { title: "Rye for beginners", body: "Words.", product: null, draft: false }, nextId, 1_000);
  await savePost(store.statsId, null, { title: "Not yet", body: "Soon.", product: null, draft: true }, nextId, 2_000);

  part("What the map lists");
  const root = `${SITE_URL}/@mapshop`;
  const urls = (await storeSitemap(store, 1_800_000_000)).map((e) => e.url);
  is("the front page, the product a visitor sees, the page that is out, the blog and its post", urls, [
    root,
    `${root}/p/rye-guide-${shown.product.id}`,
    `${root}/about`,
    `${root}/blog`,
    `${root}/blog/rye-for-beginners-${"0".repeat(10)}`,
  ]);
  is("nothing hidden, nothing kept back, no draft", urls.some((u) => u.includes("secret") || u.includes("later") || u.includes("not-yet")), false);
  is("written as search engines read it, with what could break it escaped", sitemapXml([{ url: "https://x.example/a?b=1&c=2" }]).includes("<loc>https://x.example/a?b=1&amp;c=2</loc>"), true);

  part("On the creator's own domain");
  const owned = { ...store, tier: "pro" as const, subscriptionActive: true, domain: { name: "shop.example.com", liveAt: "2026-10-01", verifiedAt: "2026-10-01" } } as unknown as typeof store;
  const ownUrls = (await storeSitemap(owned, 1_800_000_000)).map((e) => e.url);
  is("the domain's own addresses, as the pages name them", [ownUrls[0], ownUrls[1]], ["https://shop.example.com/", `https://shop.example.com/p/rye-guide-${shown.product.id}`]);
  is("its rules point crawlers at its own map", storeRobots(owned).includes("Sitemap: https://shop.example.com/sitemap.xml"), true);

  part("Switched off after notices");
  store = { ...store, suspended: "2026-10-13" } as unknown as typeof store;
  is("lists nothing, and asks not to be read", [(await storeSitemap(store)).length, storeRobots(store)], [0, "User-agent: *\nDisallow: /\n"]);

  part("Who answers what");
  const proxy = readFileSync("proxy.ts", "utf8");
  is("a creator's domain answers both files with the store's, and the site keeps its own", [
    proxy.includes('"/sitemap.xml", "/robots.txt"]'),
    /if \(CRAWLER_FILES\.test\(request\.nextUrl\.pathname\)\) return NextResponse\.next\(\);/.test(proxy),
    proxy.includes("url.pathname = `/@${handle}${pathname}`;"),
  ], [true, true, true]);
  is("and names the store for the page that says it is not there, dropping one a visitor sent", [proxy.includes("headers.delete(STORE_HEADER);"), proxy.includes("headers.set(STORE_HEADER, handle);")], [true, true]);
  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
