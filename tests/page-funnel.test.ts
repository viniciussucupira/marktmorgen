/**
 * Funnels of pages, added on 12 October 2026 (lib/page-funnel.ts,
 * lib/page-funnel-store.ts, app/[handle]/go/[funnel]/route.ts). What is
 * checked:
 *
 *   - what the studio sends is read strictly: a name, an address of its own,
 *     each page or product once, twenty steps and ten funnels at most, and
 *     the numbers start again only when the steps change;
 *   - a funnel's mark is read off a page's address, and only from our own host;
 *   - a step that cannot be shown is passed over, never a dead end, and a
 *     funnel that is off leads nowhere on;
 *   - each person is counted once a step, and the store's own people never;
 *   - the funnel's address sends a visitor to its first open step, with the
 *     mark and whatever the link carried.
 */
import { NextRequest } from "next/server";
import {
  MAX_FUNNEL_PAGES,
  MAX_PAGE_FUNNELS,
  type PageFunnelStep,
  funnelMark,
  markFromReferer,
  nextOpen,
  parsePageFunnels,
  productStepProblem,
  readFunnelInput,
  withMark,
} from "@/lib/page-funnel";
import {
  countFunnelDone,
  countFunnelStep,
  dropPageFunnel,
  funnelHere,
  funnelVisitor,
  readFunnelCounts,
  readPageFunnels,
  stepStates,
  writePageFunnel,
} from "@/lib/page-funnel-store";
import { addProduct, claimHandle, ensureStatsId, setProductHidden, setSitePages, storeForEmail } from "@/lib/store";
import { GET as goRoute } from "@/app/[handle]/go/[funnel]/route";
import { POST as hitRoute } from "@/app/api/store/hit/route";
import { SESSION_COOKIE, openSession } from "@/lib/auth";
import { funnelWords, FUNNEL_WORDS } from "@/lib/buyer-words/funnel";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { ROOM, roomOnly } from "./data-room";

process.env.NIMBUS_DATA_KEY = "a-local-key-for-tests-only-0123456789abcdef";

const OWNER = "chef@example.com";
const PHONE = "Mozilla/5.0 (iPhone; CPU iPhone OS 18_0 like Mac OS X) AppleWebKit/605.1.15 Mobile/15E148";
const NOW = 1_760_000_000;

async function main(): Promise<void> {
  redis.clear();

  part("What the studio sends");
  const steps: PageFunnelStep[] = [{ kind: "page", id: "abcdefghij" }, { kind: "product", id: "prod000001" }];
  const first = readFunnelInput({ name: "  Launch   week ", steps }, [], NOW);
  is("a name and its address made from it", first.ok ? [first.funnel.name, first.funnel.slug, first.funnel.on, first.funnel.since] : first, ["Launch week", "launch-week", true, NOW]);
  is("no name, no funnel", readFunnelInput({ name: " ", steps }, [], NOW), { ok: false, error: "name" });
  is("an address with anything but lowercase words and dashes is refused", readFunnelInput({ name: "A", slug: "Big Launch!", steps }, [], NOW), { ok: false, error: "slug" });
  const saved = first.ok ? first.funnel : (null as never);
  is("an address another funnel has is refused", readFunnelInput({ name: "Other", slug: "launch-week", steps }, [saved], NOW), { ok: false, error: "taken" });
  is("the same funnel keeps its own address", readFunnelInput({ id: saved.id, name: "Launch week", slug: "launch-week", steps }, [saved], NOW).ok, true);
  is("a page twice is refused, not quietly dropped", readFunnelInput({ name: "A", steps: [...steps, steps[0]] }, [], NOW), { ok: false, error: "steps" });
  is("a step of another kind is refused", readFunnelInput({ name: "A", steps: [{ kind: "video", id: "x" }] }, [], NOW), { ok: false, error: "steps" });
  const many = Array.from({ length: MAX_FUNNEL_PAGES + 1 }, (_, i) => ({ kind: "product", id: `prod${String(i).padStart(6, "0")}` }));
  is(`more than ${MAX_FUNNEL_PAGES} steps is refused`, readFunnelInput({ name: "A", steps: many }, [], NOW), { ok: false, error: "steps" });
  is(`${MAX_FUNNEL_PAGES} is fine`, readFunnelInput({ name: "A", steps: many.slice(0, MAX_FUNNEL_PAGES) }, [], NOW).ok, true);
  const ten = Array.from({ length: MAX_PAGE_FUNNELS }, (_, i) => ({ ...saved, id: `funnel${String(i).padStart(4, "0")}`, slug: `f-${i}` }));
  is(`an eleventh funnel is refused`, readFunnelInput({ name: "One more", steps }, ten, NOW), { ok: false, error: "full" });
  const renamed = readFunnelInput({ id: saved.id, name: "Renamed", slug: "launch-week", steps }, [saved], NOW + 500);
  is("renaming keeps its numbers", renamed.ok ? renamed.funnel.since : null, NOW);
  const reordered = readFunnelInput({ id: saved.id, name: "Launch week", slug: "launch-week", steps: [steps[1], steps[0]] }, [saved], NOW + 500);
  is("changing the steps starts them again", reordered.ok ? reordered.funnel.since : null, NOW + 500);
  is("stored funnels are read the same way, a broken one left out", parsePageFunnels([saved, { ...saved, id: "BAD" }, { ...saved, id: "zzzzzzzzzz" }]).map((f) => f.id), [saved.id]);

  part("The mark in a page's address");
  is("ten letters and digits, nothing else", [funnelMark("abcdefghij"), funnelMark("abc"), funnelMark(["abcdefghij"]), funnelMark("ABCDEFGHIJ")], ["abcdefghij", "", "abcdefghij", ""]);
  is("read off the page a form was sent from, on our own host only", [
    markFromReferer("https://marktmorgen.com/@chef/p/guide?f=abcdefghij&utm_source=x", "marktmorgen.com"),
    markFromReferer("https://evil.example/@chef/p/guide?f=abcdefghij", "marktmorgen.com"),
    markFromReferer("not an address", "marktmorgen.com"),
    markFromReferer(null, "marktmorgen.com"),
  ], ["abcdefghij", "", "", ""]);
  is("added to an address, keeping what is on it", [withMark("/@chef/about", "abcdefghij"), withMark("/@chef/p/x?gift=1#buy", "abcdefghij")], ["/@chef/about?f=abcdefghij", "/@chef/p/x?gift=1&f=abcdefghij#buy"]);
  is("the next step that can be shown, or none", [
    nextOpen({ steps: [steps[0], steps[1], steps[0]] }, 0, (s) => s.kind === "page"),
    nextOpen({ steps }, 1, () => true),
    nextOpen({ steps }, -1, () => true),
  ], [2, -1, 0]);
  is("a draft, a call or nothing cannot be a step that is shown", [productStepProblem(null), productStepProblem({ hidden: true }), productStepProblem({ hidden: false, call: {} }), productStepProblem({ hidden: false })], ["gone", "hidden", "call", null]);

  part("A funnel in a store");
  await claimHandle(OWNER, "chef", "Chef", "");
  await ensureStatsId(OWNER);
  const guide = await addProduct(OWNER, "Free Guide", "", "0", null);
  const course = await addProduct(OWNER, "Course", "", "99", null);
  const draft = await addProduct(OWNER, "Draft", "", "20", null);
  if (!guide.ok || !course.ok || !draft.ok) throw new Error("no product");
  await setProductHidden(OWNER, draft.product.id, true);
  await setSitePages(OWNER, [
    { id: "videopage1", slug: "video", title: "The video", nav: false, target: "", from: 0 },
    { id: "laterpage1", slug: "later", title: "Later", nav: false, target: "", from: -1 },
  ]);
  const store = (await storeForEmail(OWNER))!;
  const statsId = store.statsId!;
  const input = readFunnelInput(
    {
      name: "Launch",
      steps: [
        { kind: "product", id: guide.product.id },
        { kind: "page", id: "laterpage1" },
        { kind: "page", id: "videopage1" },
        { kind: "product", id: draft.product.id },
        { kind: "product", id: course.product.id },
      ],
    },
    [],
    NOW,
  );
  if (!input.ok) throw new Error("not read");
  const funnel = await writePageFunnel(statsId, input.funnel, [], ROOM);
  is("kept and read back", (await readPageFunnels(statsId)).map((f) => [f.name, f.slug, f.steps.length]), [["Launch", "launch", 5]]);
  const states = await stepStates(store, funnel);
  is("each step as the store stands: a page kept back and a draft are passed over", states.map((s) => [s.title, s.open, s.free, s.path]), [
    ["Free Guide", true, true, `/@chef/p/${(await import("@/lib/product-slug")).productSegment(guide.product)}`],
    ["Later", false, false, "/@chef/later"],
    ["The video", true, false, "/@chef/video"],
    ["Draft", false, false, null],
    ["Course", true, false, `/@chef/p/${(await import("@/lib/product-slug")).productSegment(course.product)}`],
  ]);
  const fromGuide = await funnelHere(store, funnel.id, "product", guide.product.id);
  is("after the free guide, the video page, past the page kept back", [fromGuide?.index, fromGuide?.next], [0, `/@chef/video?f=${funnel.id}`]);
  const fromVideo = await funnelHere(store, funnel.id, "page", "videopage1");
  is("after the video, the course, past the draft", fromVideo?.next?.endsWith(`?f=${funnel.id}`) && fromVideo.next.startsWith("/@chef/p/"), true);
  is("the last step leads nowhere on", (await funnelHere(store, funnel.id, "product", course.product.id))?.next, null);
  is("a page that is not a step is opened on its own", await funnelHere(store, funnel.id, "product", "nope000001"), null);
  is("a mark of no funnel is nothing", await funnelHere(store, "zzzzzzzzzz", "page", "videopage1"), null);
  await writePageFunnel(statsId, { ...funnel, on: false }, [funnel], ROOM);
  is("a funnel that is off leads nowhere on", await funnelHere(store, funnel.id, "page", "videopage1"), null);
  await writePageFunnel(statsId, funnel, [funnel], ROOM);

  part("Its address");
  const go = async (path: string) => {
    const response = await goRoute(new NextRequest(`https://marktmorgen.com${path}`), {
      params: Promise.resolve({ handle: "@chef", funnel: path.split("/go/")[1].split("?")[0] }),
    });
    return [response.status, response.headers.get("location")];
  };
  const guidePath = states[0].path!;
  is("to the first step, with the mark and what the link carried", await go("/@chef/go/launch?utm_source=newsletter&f=zzzzzzzzzz"), [307, `https://marktmorgen.com${guidePath}?f=${funnel.id}&utm_source=newsletter`]);
  is("an address no funnel has leads to the store", await go("/@chef/go/nothing"), [307, "https://marktmorgen.com/@chef"]);
  await writePageFunnel(statsId, { ...funnel, on: false }, [funnel], ROOM);
  is("an inactive funnel never redirects to a published product or page", await go("/@chef/go/launch"), [404, null]);
  const previousPipeline = redis.pipeline;
  let snapshotRead = false, readsAfterSnapshot = 0;
  try {
    redis.pipeline = async commands => {
      if (snapshotRead) readsAfterSnapshot += commands.length;
      const reply = await previousPipeline.call(redis, commands);
      if (commands.some(command => command[0] === "HVALS" && command[1] === "nl:pfunnels:" + statsId)) snapshotRead = true;
      return reply;
    };
    const inactive = await goRoute(new NextRequest("https://marktmorgen.com/@chef/go/launch?utm_source=newsletter&affiliate=someone&f=zzzzzzzzzz"), { params: Promise.resolve({ handle: "@chef", funnel: "launch" }) });
    is("inactive links do not forward tracking or affiliate queries and cannot be cached", [inactive.status, inactive.headers.get("location"), inactive.headers.get("cache-control")], [404, null, "no-store"]);
    is("inactive funnels require no step or product reads after the funnel lookup", [snapshotRead, readsAfterSnapshot], [true, 0]);
  } finally { redis.pipeline = previousPipeline; }
  const inactiveCustom = await goRoute(new NextRequest("https://courses.example.com/go/launch"), { params: Promise.resolve({ handle: "@chef", funnel: "launch" }) });
  is("the same inactive boundary applies to a custom-domain request", [inactiveCustom.status, inactiveCustom.headers.get("location")], [404, null]);
  await writePageFunnel(statsId, funnel, [funnel], ROOM);

  is("re-enabling restores the marked entry and query forwarding", await go("/@chef/go/launch?utm_source=reopened"), [307, `https://marktmorgen.com${guidePath}?f=${funnel.id}&utm_source=reopened`]);

  part("Counting each step");
  const visitorA = funnelVisitor(statsId, funnel.id, "203.0.113.9", PHONE);
  const visitorB = funnelVisitor(statsId, funnel.id, "203.0.113.10", PHONE);
  is("a person is a fingerprint for this funnel only", [visitorA === visitorB, visitorA === funnelVisitor(statsId, "zzzzzzzzzz", "203.0.113.9", PHONE), visitorA.length], [false, false, 24]);
  await countFunnelStep(statsId, funnel, 0, visitorA);
  await countFunnelStep(statsId, funnel, 0, visitorA);
  await countFunnelStep(statsId, funnel, 0, visitorB);
  await countFunnelDone(statsId, funnel, 0, visitorA);
  await countFunnelStep(statsId, funnel, 2, visitorA);
  is("each person once a step, and who signed up", (await readFunnelCounts(statsId, funnel)).map((c) => [c.seen, c.done]), [[2, 1], [0, 0], [1, 0], [0, 0], [0, 0]]);
  is("the counts begin again when the steps change", (await readFunnelCounts(statsId, { ...funnel, since: NOW + 1 }))[0], { seen: 0, done: 0 });

  const hit = (body: Record<string, string>, cookies = "") =>
    hitRoute(
      new NextRequest("https://marktmorgen.com/api/store/hit", {
        method: "POST",
        headers: { "user-agent": PHONE, "x-forwarded-for": "198.51.100.7", ...(cookies ? { cookie: cookies } : {}) },
        body: JSON.stringify(body),
      }),
    );
  await hit({ h: "chef", k: "f", f: funnel.id, t: "g", id: "videopage1" });
  await hit({ h: "chef", k: "f", f: funnel.id, t: "g", id: "videopage1" });
  await hit({ h: "chef", k: "f", f: funnel.id, t: "g", id: "notastep01" });
  await hit({ h: "chef", k: "f", f: funnel.id, t: "g", id: "videopage1" }, `${SESSION_COOKIE}=${await openSession(OWNER)}`);
  is("through the page's own beacon: once, not a page that is no step, and never the owner", (await readFunnelCounts(statsId, funnel))[2].seen, 2);

  part("Storage must confirm funnel mutations");
  const originalMutationPipeline = redis.pipeline;
  try {
    for (const replies of [[], [null], [undefined], [true], [false], [""], [2], [-1], [1.5], ["invalid"], [{ error: "unavailable" }], [1, 1]]) {
      redis.pipeline = async (commands) => (roomOnly(commands) ? originalMutationPipeline.call(redis, commands) : replies);
      let saveFailed = false;
      let removeFailed = false;
      try { await writePageFunnel(statsId, funnel, [funnel], ROOM); } catch { saveFailed = true; }
      try { await dropPageFunnel(statsId, funnel.id, ROOM); } catch { removeFailed = true; }
      is("unconfirmed save is rejected: " + JSON.stringify(replies), saveFailed, true);
      is("unconfirmed deletion is rejected: " + JSON.stringify(replies), removeFailed, true);
    }
    for (const reply of [0, 1, "0", "1"]) {
      redis.pipeline = async (commands) => (roomOnly(commands) ? originalMutationPipeline.call(redis, commands) : [reply]);
      let accepted = false;
      try { accepted = (await writePageFunnel(statsId, funnel, [funnel], ROOM)).id === funnel.id; } catch {}
      is("only an explicit successful atomic save is accepted " + JSON.stringify(reply), accepted, reply === 1);
      is("confirmed deletion interprets Redis acknowledgement " + JSON.stringify(reply), await dropPageFunnel(statsId, funnel.id, ROOM), reply === 1 || reply === "1");
    }
  } finally { redis.pipeline = originalMutationPipeline; }

  part("Removing one");
  is("gone, and a second removal finds nothing", [await dropPageFunnel(statsId, funnel.id, ROOM), await dropPageFunnel(statsId, funnel.id, ROOM)], [true, false]);
  is("and its address leads to the store", await go("/@chef/go/launch"), [307, "https://marktmorgen.com/@chef"]);

  part("An address reserved later");
  const { parseSitePages, slugProblem } = await import("@/lib/site-page-rules");
  is("a page that already had an address now reserved is kept, and a new page there is refused", [
    parseSitePages([{ id: "abcdefghij", slug: "go", title: "Go", nav: true, target: "", from: 0 }]).length,
    slugProblem("go", []),
  ], [1, "reserved"]);

  part("The words a visitor reads");
  is("every language says all of them", Object.values(FUNNEL_WORDS).every((w) => Object.keys(w).join() === Object.keys(funnelWords("en")).join() && Object.values(w).every((v) => typeof v === "string" && v.length > 0)), true);
  is("a store in German says it in German", funnelWords("de").skip, "Nein danke, weiter");

  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
