/**
 * Earlier versions of a sales page (lib/sales-page-store.ts, added
 * 8 October 2026). Kajabi, Hotmart Pages, Stan and Gumroad save a page over
 * itself: a save that went wrong cannot be taken back. What is checked:
 *
 *   - each save keeps the page as it was, newest first, five at most, and a
 *     save that changes nothing keeps nothing;
 *   - the list is forgotten 30 days after the last save, and with the product;
 *   - a version brought back keeps only the pictures the page still keeps,
 *     and says how many it lost, since a picture taken off a page is deleted.
 */
import { keepPictures, parsePage } from "@/lib/sales-page";
import { MAX_VERSIONS, dropPage, readVersions, writePage } from "@/lib/sales-page-store";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { ROOM } from "./data-room";

const STATS = "s".repeat(16);
const page = (headline: string, more: Record<string, unknown> = {}) =>
  parsePage({ blocks: [{ id: "hero0001", kind: "hero", headline, sub: "", media: "none", video: null }], ...more });

async function main(): Promise<void> {
  redis.clear();

  part("What each save keeps");
  is("a page never saved has none", await readVersions(STATS, "p1"), []);
  await writePage(STATS, "p1", page("First"), ROOM);
  is("the first save has nothing before it", (await readVersions(STATS, "p1")).length, 0);
  await writePage(STATS, "p1", page("Second", { style: "bands" }), ROOM);
  const one = await readVersions(STATS, "p1");
  is("the second keeps the first, read back whole", [one.length, one[0]?.page.blocks[0]?.kind === "hero" ? one[0].page.blocks[0].headline : "", one[0]?.page.style], [1, "First", "plain"]);
  is("with when it was saved over", typeof one[0]?.at === "number" && one[0].at > 0, true);
  await writePage(STATS, "p1", page("Second", { style: "bands" }), ROOM);
  is("a save that changes nothing keeps nothing", (await readVersions(STATS, "p1")).length, 1);
  for (const word of ["Third", "Fourth", "Fifth", "Sixth", "Seventh"]) await writePage(STATS, "p1", page(word), ROOM);
  const all = await readVersions(STATS, "p1");
  const heads = all.map((v) => (v.page.blocks[0]?.kind === "hero" ? v.page.blocks[0].headline : ""));
  is(`${MAX_VERSIONS} at most, newest first`, heads, ["Sixth", "Fifth", "Fourth", "Third", "Second"]);

  part("How long they are kept");
  const ttl = (await redis.pipeline([["TTL", `nl:product:pages:${STATS}:p1`]]))[0];
  // Since 18 October 2026 kept as long as the page is, counted in the store's data room (lib/store-data.ts).
  is("kept as long as the page is", ttl, -1);
  is("another product's page keeps its own", await readVersions(STATS, "p2"), []);
  await dropPage(STATS, "p1", ROOM);
  is("and they go with the product", await readVersions(STATS, "p1"), []);

  part("Pictures, when a version comes back");
  const FOLDER = "a".repeat(24);
  const path = (n: number) => `images/${FOLDER}/${String(n).padStart(32, "0")}.webp`;
  const pic = (n: number) => ({ path: path(n), width: 1200, height: 800, alt: "A page", caption: "" });
  const old = parsePage({
    blocks: [
      { id: "pics0001", kind: "pictures", heading: "Inside", items: [pic(1), pic(2)] },
      { id: "feat0001", kind: "feature", heading: "Why", body: "Because.", picture: pic(3), side: "left" },
    ],
  });
  const back = keepPictures(old, new Set([path(2)]));
  is("only the pictures still kept", back.page.blocks[0].kind === "pictures" ? back.page.blocks[0].items.map((p) => p.path) : [], [path(2)]);
  is("words beside a deleted picture stay, without it", back.page.blocks[1].kind === "feature" ? [back.page.blocks[1].body, back.page.blocks[1].picture] : [], ["Because.", null]);
  is("and how many were lost is said", back.dropped, 2);
  is("nothing lost when every picture is kept", keepPictures(old, new Set([path(1), path(2), path(3)])).dropped, 0);

  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
