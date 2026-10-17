/**
 * Sharing, copying and bringing in funnels (lib/funnel-bundle.ts), end to
 * end through the route against the in-memory Redis:
 *
 *   - a file is read strictly: format, version, size, kinds, fields, refs,
 *     scripts, pictures;
 *   - a share carries the words and the shape, never the sender's pictures,
 *     videos, about text, guarantee, deadlines, product ids or the code;
 *   - the receiver maps placeholders to their own products and gets a draft;
 *   - links are hashed at rest, revocable, expiring and capped per plan;
 *   - imports are capped per day, and every starter is a valid file.
 */
import { NextRequest } from "next/server";
import { BUNDLE_FORMAT, BUNDLE_SCHEMA, buildBundle, outlineOf, planImport, readBundle, type FunnelBundle } from "@/lib/funnel-bundle";
import { FUNNEL_STARTERS } from "@/lib/funnel-starters";
import { SHARE_LIMITS, codeFrom, shareLimitsFor } from "@/lib/funnel-share-rules";
import { readPageFunnels } from "@/lib/page-funnel-store";
import { readPage, writePage } from "@/lib/sales-page-store";
import { emptyBlock, parsePage, type PageBlock } from "@/lib/sales-page";
import { siteKey } from "@/lib/site-page-rules";
import { readForms } from "@/lib/form-store";
import { addProduct, claimHandle, ensureStatsId, storeForEmail } from "@/lib/store";
import { SESSION_COOKIE, openSession } from "@/lib/auth";
import { GET, POST } from "@/app/api/store/funnel-share/route";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { ROOM } from "./data-room";

const MAX = SHARE_LIMITS.scale.bundleBytes;
/** JSON with every object's keys in order, so two readings compare by what they hold. */
const canonical = (value: unknown): string =>
  JSON.stringify(value, (_key, v) => (v && typeof v === "object" && !Array.isArray(v) ? Object.fromEntries(Object.entries(v).sort(([a], [b]) => a.localeCompare(b))) : v));

async function main() {
  part("Every starter is a valid file of its own format");
  for (const starter of FUNNEL_STARTERS) {
    const read = readBundle(starter.bundle, { maxBytes: SHARE_LIMITS.creator.bundleBytes });
    is(`${starter.id}: read strictly, nothing dropped`, [read.ok, read.ok ? canonical(read.bundle) === canonical(starter.bundle) : false], [true, true]);
    const words = JSON.stringify(starter.bundle).toLowerCase();
    is(`${starter.id}: no invented results, urgency or superlatives`, /guarantee[ds]? results|\d+%|limited time|only \d+ left|best-selling|#1|testimonial/.test(words), false);
  }

  part("A file is read strictly");
  const base = structuredClone(FUNNEL_STARTERS[0].bundle) as FunnelBundle;
  const withChange = (change: (b: Record<string, unknown>) => void) => {
    const copy = structuredClone(base) as unknown as Record<string, unknown>;
    change(copy);
    return readBundle(copy, { maxBytes: MAX });
  };
  const err = (r: ReturnType<typeof readBundle>) => (r.ok ? "ok" : r.error);
  is("another format", err(withChange((b) => (b.format = "other"))), "format");
  is("a later schema version", err(withChange((b) => (b.schema = BUNDLE_SCHEMA + 1))), "newer");
  is("an earlier or missing version", err(withChange((b) => delete b.schema)), "format");
  is("a field the format does not have", err(withChange((b) => (b.owner = "x"))), "shape");
  is("a script in any text", err(withChange((b) => ((b.pages as { blocks: { headline?: string }[] }[])[0].blocks[0].headline = "<script>alert(1)</script>"))), "unsafe");
  is("a javascript: address", err(withChange((b) => ((b.pages as { blocks: { sub?: string }[] }[])[0].blocks[0].sub = "javascript:alert(1)"))), "unsafe");
  is("an event handler", err(withChange((b) => ((b.pages as { title: string }[])[0].title = "x onload=y"))), "unsafe");
  is("a block a store's own page cannot hold", err(withChange((b) => (b.pages as { blocks: unknown[] }[])[0].blocks.push({ id: "zz01", kind: "reviews", heading: "Reviews", first: [] }))), "kind");
  is("a field a block does not have", err(withChange((b) => (((b.pages as { blocks: Record<string, unknown>[] }[])[0].blocks[1]).style = "color:red"))), "shape");
  is("a picture from the sender's storage", err(withChange((b) => (b.pages as { blocks: unknown[] }[])[0].blocks.push({ id: "zz02", kind: "pictures", heading: "", items: [{ path: `images/${"a".repeat(24)}/${"b".repeat(32)}.webp`, width: 10, height: 10, alt: "", caption: "" }] }))), "pictures");
  is("a countdown in a shared file", err(withChange((b) => (b.pages as { blocks: unknown[] }[])[0].blocks.push({ id: "zz03", kind: "countdown", heading: "", until: 2_000_000_000, note: "" }))), "kind");
  is("a step naming a page that is not there", err(withChange((b) => (b.steps as unknown[]).push({ kind: "page", ref: "p9" }))), "steps");
  is("a product nothing uses", err(withChange((b) => (b.products as unknown[]).push({ ref: "x9", label: "Spare", wants: "paid" }))), "products");
  is("a second hero, which a page would drop", err(withChange((b) => (b.pages as { blocks: unknown[] }[])[0].blocks.push({ id: "zz04", kind: "hero", headline: "Again", sub: "", media: "none", video: null }))), "blocks");
  is("a list item a page would drop", err(withChange((b) => (((b.pages as { blocks: { items?: unknown[] }[] }[])[0].blocks[1]).items = ["ok", ""]))), "blocks");
  is("larger than the plan allows", readBundle(base, { maxBytes: 100 }).ok, false);
  is("not JSON", err(readBundle("{not json", { maxBytes: MAX })), "format");

  part("What a share leaves out");
  const video = { provider: "youtube" as const, id: "dQw4w9WgXcQ", hash: "" };
  const pageBlocks: PageBlock[] = [
    { ...(emptyBlock("hero") as Extract<PageBlock, { kind: "hero" }>), headline: "My launch", media: "video", video },
    { ...(emptyBlock("video") as Extract<PageBlock, { kind: "video" }>), video },
    { ...(emptyBlock("bio") as Extract<PageBlock, { kind: "bio" }>), body: "I am the sender." },
    { ...(emptyBlock("countdown") as Extract<PageBlock, { kind: "countdown" }>), until: 2_000_000_000 },
    { ...(emptyBlock("quotes") as Extract<PageBlock, { kind: "quotes" }>), items: [{ text: "Great", name: "A", url: "https://example.com/post" }] },
    { ...(emptyBlock("product") as Extract<PageBlock, { kind: "product" }>), product: "senderprod01" },
    { ...(emptyBlock("text") as Extract<PageBlock, { kind: "text" }>), heading: "Why", body: "Because." },
  ];
  const source = {
    name: "Launch",
    steps: [{ kind: "page" as const, id: "page000001" }, { kind: "product" as const, id: "senderprod01" }],
    pages: new Map([["page000001", { meta: { id: "page000001", slug: "launch", title: "Launch", nav: true, target: "senderprod01", from: 0 }, page: parsePage({ blocks: pageBlocks }) }]]),
    forms: new Map(),
    products: new Map([["senderprod01", { title: "The Course", free: false, call: false }]]),
  };
  const shared = buildBundle(source, "share");
  const json = JSON.stringify(shared.bundle);
  is("no product id, video or about text of the sender", [json.includes("senderprod01"), json.includes("dQw4w9WgXcQ"), json.includes("I am the sender"), json.includes("example.com")], [false, false, false, false]);
  is("what was left out is counted", [shared.left.videos, shared.left.bios, shared.left.countdowns, shared.left.quotes], [2, 1, 1, 1]);
  is("the product is a placeholder used by the step, the card and the button", [shared.bundle.products, shared.bundle.steps, shared.bundle.pages[0].target], [[{ ref: "x1", label: "The Course", wants: "paid" }], [{ kind: "page", ref: "p1" }, { kind: "product", ref: "x1" }], "x1"]);
  is("the shared file passes its own strict reading", readBundle(shared.bundle, { maxBytes: MAX }).ok, true);
  const own = buildBundle(source, "own");
  is("a copy inside the store keeps the words, videos and deadline", [JSON.stringify(own.bundle).includes("dQw4w9WgXcQ"), own.left.countdowns, own.productIds.x1], [true, 0, "senderprod01"]);
  is("a copy is read as the store's own", readBundle(own.bundle, { maxBytes: MAX, own: true }).ok, true);

  part("The plan before anything is made");
  const outline = outlineOf(shared.bundle);
  const receiver = [{ id: "mine000001", title: "My Course", free: false, call: false, draft: false }, { id: "mine000002", title: "My Call", free: false, call: true, draft: false }];
  const room = { pagesLeft: 10, funnelsLeft: 10, formsLeft: 20 };
  is("unmapped: allowed, its step left out", [planImport(outline, receiver, room, {}).ok, planImport(outline, receiver, room, {}).steps], [true, 1]);
  is("a call cannot be a step", planImport(outline, receiver, room, { x1: "mine000002" }).ok, false);
  is("a product of another store is refused", planImport(outline, receiver, room, { x1: "notmine" }).ok, false);
  is("no room for its pages", planImport(outline, receiver, { ...room, pagesLeft: 0 }, { x1: "mine000001" }).ok, false);
  is("what to fill in is listed", outlineOf(shared.bundle).fill.some((line) => line.includes("a video") && line.includes("your about text")), true);

  part("Sharing between two stores");
  const SENDER = "sender@example.com";
  const RECEIVER = "receiver@example.com";
  await claimHandle(SENDER, "sendershop", "Sender Shop", "");
  await ensureStatsId(SENDER);
  await claimHandle(RECEIVER, "receivershop", "Receiver Shop", "");
  await ensureStatsId(RECEIVER);
  const senderFree = await addProduct(SENDER, "Sender Guide", "", "0", null);
  const senderPaid = await addProduct(SENDER, "Sender Course", "", "49", null);
  const mineFree = await addProduct(RECEIVER, "My Guide", "", "0", null);
  const minePaid = await addProduct(RECEIVER, "My Course", "", "99", null);
  if (!senderFree.ok || !senderPaid.ok || !mineFree.ok || !minePaid.ok) throw new Error("no products");
  const sessions: Record<string, string> = { [SENDER]: await openSession(SENDER), [RECEIVER]: await openSession(RECEIVER) };
  const send = async (who: string, body: Record<string, unknown>) =>
    (await POST(new NextRequest("https://marktmorgen.com/api/store/funnel-share", { method: "POST", headers: { "content-type": "application/json", cookie: `${SESSION_COOKIE}=${sessions[who]}` }, body: JSON.stringify(body) }))).json();

  // The sender brings in a starter, writes into it, and shares it.
  const starter = await send(SENDER, { action: "import", starter: "guide-signup", products: { x1: senderFree.product.id, x2: senderPaid.product.id } });
  let senderStore = (await storeForEmail(SENDER))!;
  const senderFunnel = (await readPageFunnels(senderStore.statsId))[0];
  is("a starter becomes a draft funnel: off, its pages kept back and out of the menu", [starter.ok, senderFunnel?.on, senderStore.sitePages.map((p) => [p.slug, p.nav, p.from])], [true, false, [["free-guide", false, -1], ["what-happens-next", false, -1]]]);
  const landing = senderStore.sitePages[0];
  const written = await readPage(senderStore.statsId, siteKey(landing.id));
  is("its words arrive as written, with the button to the chosen product", [written.hidden, written.blocks[0].kind === "hero" ? written.blocks[0].headline : "", landing.target], [true, "A free guide to [your topic]", senderFree.product.id]);
  await writePage(senderStore.statsId!, siteKey(landing.id), { ...written, blocks: written.blocks.map((b) => (b.kind === "bio" ? { ...b, body: "Sender's own story." } : b)) }, ROOM);

  const sentToRedis: string[] = [];
  const pipeline = redis.pipeline.bind(redis);
  redis.pipeline = async (commands) => {
    sentToRedis.push(JSON.stringify(commands));
    return pipeline(commands);
  };
  const made = await send(SENDER, { action: "share", funnel: senderFunnel.id, days: 7 });
  redis.pipeline = pipeline;
  is("a share link is made, its code shown once", [made.ok, typeof made.code === "string" && /^mmf_[0-9a-f]{32}$/.test(made.code), String(made.link).includes("/studio/funnels#import=mmf_")], [true, true, true]);
  is("what it leaves out is said", made.left, ["Your about text is left out: the receiver writes their own."]);
  is("the code is never written to the database, only its fingerprint", [sentToRedis.some((sent) => sent.includes(made.code)), redis.keys().some((key) => key.startsWith("nl:fshare:") && key.length === "nl:fshare:".length + 64)], [false, true]);
  is("the code is read from the link it came in", codeFrom(made.link), made.code);

  const preview = await send(RECEIVER, { action: "preview", code: made.link });
  is("the receiver sees who shared it and what it holds, never the words", [preview.ok, preview.from, preview.outline.steps.length, JSON.stringify(preview).includes("Sender's own story")], [true, "Sender Shop", 4, false]);
  is("the preview lists the receiver's own products to choose from", preview.products.map((p: { title: string }) => p.title).sort(), ["My Course", "My Guide"]);
  const brought = await send(RECEIVER, { action: "import", code: made.code, products: { x1: mineFree.product.id, x2: minePaid.product.id } });
  const receiverStore = (await storeForEmail(RECEIVER))!;
  const theirs = (await readPageFunnels(receiverStore.statsId))[0];
  const theirPage = await readPage(receiverStore.statsId, siteKey(receiverStore.sitePages[0].id));
  is("imported as a draft walking the receiver's own products", [brought.ok, theirs?.on, theirs?.steps.filter((s) => s.kind === "product").map((s) => s.id), receiverStore.sitePages[0].target], [true, false, [mineFree.product.id, minePaid.product.id], mineFree.product.id]);
  is("the sender's about text did not come across", theirPage.blocks.find((b) => b.kind === "bio")?.kind === "bio" ? (theirPage.blocks.find((b) => b.kind === "bio") as { body: string }).body : null, "");
  is("nothing of the sender's store id is in the receiver's pages", JSON.stringify(theirPage).includes(senderStore.statsId!), false);

  part("Links are revocable, expiring and capped");
  const revoked = await send(SENDER, { action: "revoke", id: made.share.id });
  is("revoked: the link stops working at once", [revoked.ok, (await send(RECEIVER, { action: "preview", code: made.code })).error], [true, "code_gone"]);
  const limit = shareLimitsFor(senderStore).shares;
  const links: { code: string }[] = [];
  for (let i = 0; i < limit; i += 1) links.push(await send(SENDER, { action: "share", funnel: senderFunnel.id, days: 7 }));
  is(`a Store plan holds ${limit} links at once`, (await send(SENDER, { action: "share", funnel: senderFunnel.id, days: 7 })).error, "shares_full");
  is("a length of time that is not offered", (await send(SENDER, { action: "share", funnel: senderFunnel.id, days: 3 })).error, "days");
  redis.advance(8 * 86_400 * 1000);
  is("after its days the link no longer opens", (await send(RECEIVER, { action: "preview", code: links[0].code })).error, "code_gone");
  is("and no longer counts against the store's links", (await send(SENDER, { action: "share", funnel: senderFunnel.id, days: 30 })).ok, true);

  part("A copy inside the store, a file and the daily cap");
  const copy = await send(SENDER, { action: "clone", funnel: senderFunnel.id });
  senderStore = (await storeForEmail(SENDER))!;
  const copied = (await readPageFunnels(senderStore.statsId)).find((f) => f.name.startsWith("Copy of"));
  const copiedLanding = senderStore.sitePages.find((p) => p.slug === "free-guide-2");
  is("a copy is made with its own pages, keeping the store's own words and products", [copy.ok, copied?.on, copied?.steps.filter((s) => s.kind === "product").map((s) => s.id), Boolean(copiedLanding)], [true, false, [senderFree.product.id, senderPaid.product.id], true]);
  const copiedBio = (await readPage(senderStore.statsId, siteKey(copiedLanding!.id))).blocks.find((b) => b.kind === "bio") as { body: string } | undefined;
  is("the copy keeps the about text: it is the same store", copiedBio?.body, "Sender's own story.");

  const exported = await GET(new NextRequest(`https://marktmorgen.com/api/store/funnel-share?export=${senderFunnel.id}`, { headers: { cookie: `${SESSION_COOKIE}=${sessions[SENDER]}` } }));
  const file = await exported.json();
  is("the file downloads as an attachment in the versioned format", [exported.headers.get("content-disposition")?.startsWith("attachment"), file.format, file.schema, JSON.stringify(file).includes(senderFree.product.id)], [true, BUNDLE_FORMAT, BUNDLE_SCHEMA, false]);
  const fromFile = await send(RECEIVER, { action: "preview", bundle: file });
  is("a file is previewed like a link", [fromFile.ok, fromFile.outline.name], [true, "Free guide"]);
  const tampered = await send(RECEIVER, { action: "preview", bundle: { ...file, pages: [{ ...file.pages[0], title: "<iframe src=x>" }, ...file.pages.slice(1)] } });
  is("a tampered file is refused", tampered.error, "bundle_unsafe");

  const formsBefore = (await readForms((await storeForEmail(RECEIVER))!.statsId)).length;
  const application = await send(RECEIVER, { action: "import", starter: "coaching-application", products: {} });
  is("a starter with a form makes the form too, its answers empty", [application.ok, (await readForms((await storeForEmail(RECEIVER))!.statsId)).length - formsBefore], [true, 1]);
  // Imports are counted per store per calendar month, failed attempts included.
  const fresh = "counted@example.com";
  await claimHandle(fresh, "countedshop", "Counted", "");
  await ensureStatsId(fresh);
  sessions[fresh] = await openSession(fresh);
  let attempts = 0;
  let last: { ok?: boolean; error?: string } = {};
  while (attempts < SHARE_LIMITS.creator.importsPerMonth + 3) {
    last = await send(fresh, { action: "import", starter: "coaching-application", products: {} });
    if (last.error === "imports_full") break;
    attempts += 1;
  }
  is("imports stop at the plan's monthly number, failed attempts counted", [last.error, attempts], ["imports_full", SHARE_LIMITS.creator.importsPerMonth]);
  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
