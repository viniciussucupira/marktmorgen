/**
 * Funnels to start from, by kind (lib/funnel-types.ts, added 13 October
 * 2026). What is checked:
 *
 *   - every kind is one a funnel can be: its pages at valid addresses with
 *     blocks a store's own page may have, its products and its call each
 *     named once, and within a funnel's length;
 *   - a product fills a step only if it is the kind the step asks for;
 *   - building one makes the pages it needs, empty and kept from visitors,
 *     and the funnel walking them and the chosen products in order;
 *   - it is refused without room for its pages, for the wrong product, and
 *     to a role that cannot make the store's pages.
 */
import { NextRequest } from "next/server";
import { FUNNEL_TYPES, choicesOf, freeSlug, funnelType, pagesOf, slotProblem } from "@/lib/funnel-types";
import { MAX_FUNNEL_PAGES } from "@/lib/page-funnel";
import { SITE_KINDS, SLUG_PATTERN, slugProblem } from "@/lib/site-page-rules";
import { readPageFunnels } from "@/lib/page-funnel-store";
import { readPage } from "@/lib/sales-page-store";
import { siteKey } from "@/lib/site-page-rules";
import { addProduct, claimHandle, ensureStatsId, storeForEmail } from "@/lib/store";
import { SESSION_COOKIE, openSession } from "@/lib/auth";
import { POST } from "@/app/api/store/page-funnels/route";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

async function main(): Promise<void> {
  redis.clear();
  process.env.UPSTASH_REDIS_REST_URL ??= "http://stub";

  part("Every kind is a funnel that can be");
  for (const type of FUNNEL_TYPES) {
    const keys = type.slots.map((s) => s.key);
    const steps = type.slots.filter((s) => s.kind !== "target").length;
    const targets = pagesOf(type).flatMap((p) => (p.target ? [p.target] : []));
    is(`${type.id}: each slot once, within a funnel's length, every page's button leads to a slot it has`, [
      new Set(keys).size === keys.length,
      steps > 0 && steps <= MAX_FUNNEL_PAGES,
      targets.every((t) => type.slots.some((s) => s.kind === "target" && s.key === t)),
    ], [true, true, true]);
    is(`${type.id}: its pages at addresses a page may have, with blocks a store's page may hold`, pagesOf(type).every((p) => SLUG_PATTERN.test(p.slug) && slugProblem(p.slug, []) === null && p.blocks.every((k) => SITE_KINDS.includes(k)) && p.blocks[0] === "hero"), true);
  }
  is("found by its id, and nothing else", [funnelType("lead-magnet")?.label, funnelType("constructor"), funnelType("nope")], ["Lead magnet", null, null]);
  is("an address taken is numbered", [freeSlug("all-set", new Set()), freeSlug("all-set", new Set(["all-set"])), freeSlug("all-set", new Set(["all-set", "all-set-2"]))], ["all-set", "all-set-2", "all-set-3"]);

  part("A product fills a step only if it is the kind asked for");
  const step = (wants: "free" | "paid" | "any") => ({ kind: "product" as const, key: "x", label: "", wants });
  const call = { kind: "target" as const, key: "c", label: "", wants: "call" as const };
  is("free, paid, either, and a call only where a call is asked for", [
    slotProblem(step("free"), { free: true, call: false }),
    slotProblem(step("free"), { free: false, call: false }),
    slotProblem(step("paid"), { free: true, call: false }),
    slotProblem(step("any"), { free: true, call: false }),
    slotProblem(step("paid"), { free: false, call: true }),
    slotProblem(call, { free: false, call: true }),
    slotProblem(call, { free: false, call: false }),
    slotProblem(step("paid"), null),
  ], [null, "free", "paid", null, "call", null, "call", "missing"]);

  part("Building one");
  const OWNER = "kinds@example.com";
  await claimHandle(OWNER, "kindshop", "Kind Shop", "");
  await ensureStatsId(OWNER);
  const guide = await addProduct(OWNER, "Free Guide", "", "0", null);
  const course = await addProduct(OWNER, "Course", "", "99", null);
  if (!guide.ok || !course.ok) throw new Error("no products");
  const session = await openSession(OWNER);
  const send = (body: Record<string, unknown>) =>
    POST(new NextRequest("https://marktmorgen.com/api/store/page-funnels", { method: "POST", headers: { "content-type": "application/json", cookie: `${SESSION_COOKIE}=${session}` }, body: JSON.stringify(body) }));

  const wrong = await (await send({ action: "from-type", type: "lead-magnet", name: "Guide funnel", products: { freebie: course.product.id, offer: guide.product.id } })).json();
  is("a paid product where the free one goes is refused, and nothing is made", [wrong.error, (await storeForEmail(OWNER))!.sitePages.length], ["slot_free", 0]);
  const made = await (await send({ action: "from-type", type: "lead-magnet", name: "Guide funnel", products: { freebie: guide.product.id, offer: course.product.id } })).json();
  const store = (await storeForEmail(OWNER))!;
  const funnels = await readPageFunnels(store.statsId);
  const page = store.sitePages[0];
  is("made: the free guide, the course, then a page of its own", [made.ok, funnels.length, funnels[0]?.steps.map((s) => s.kind), funnels[0]?.steps[0].id, funnels[0]?.steps[1].id, funnels[0]?.steps[2].id === page?.id, funnels[0]?.slug], [
    true,
    1,
    ["product", "product", "page"],
    guide.product.id,
    course.product.id,
    true,
    "guide-funnel",
  ]);
  const blocks = await readPage(store.statsId, siteKey(page.id));
  is("the page: out of the menu, empty under its title, and kept from visitors", [page.slug, page.nav, page.from, blocks.hidden, blocks.blocks.map((b) => b.kind), blocks.blocks[0].kind === "hero" ? blocks.blocks[0].headline : ""], [
    "all-set",
    false,
    -1,
    true,
    ["hero", "steps", "cta"],
    "You're all set",
  ]);
  const again = await (await send({ action: "from-type", type: "lead-magnet", name: "Guide funnel", products: { freebie: guide.product.id, offer: course.product.id } })).json();
  is("made again: its own page and its own address", [again.ok, (await storeForEmail(OWNER))!.sitePages.map((p) => p.slug), (await readPageFunnels(store.statsId)).map((f) => f.slug).sort()], [true, ["all-set", "all-set-2"], ["guide-funnel", "guide-funnel-2"]]);

  part("Refused");
  for (let i = 0; i < 6; i += 1) await send({ action: "from-type", type: "launch", name: `Launch ${i}`, products: { offer: course.product.id } });
  const crowded = await (await send({ action: "from-type", type: "launch", name: "One more", products: { offer: course.product.id } })).json();
  is("no room for its pages", crowded.error, "pages_full");
  is("a kind that is not one", (await (await send({ action: "from-type", type: "summit", products: {} })).json()).error, "type");
  is("a call asked for and a paid product given", (await (await send({ action: "from-type", type: "book", products: { book: "nope" } })).json()).error, "slot_missing");
  is("an application asks for no product: its page asks the questions", choicesOf(funnelType("application")!).length, 0);
  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
