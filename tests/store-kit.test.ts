/**
 * The media kit (lib/store-kit.ts; added 9 October 2026). Checked: what is
 * kept is made safe — known places only, each once, numbers in range, prices
 * or "on request"; the day beside the numbers changes only when a number
 * does; the page shows only a kit with something in it; and the AI draft of
 * the introduction is given the creator's own numbers and told to use no
 * others.
 */
import { claimHandle, ensureStatsId, setKit, setSubscription, storeForEmail } from "@/lib/store";
import { MAX_KIT_AUDIENCE, MAX_KIT_COUNT, NO_KIT, combinedReach, kitShown, nextKit, parseKit } from "@/lib/store-kit";
import { writeKitPitch } from "@/lib/ai";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

type Sent = { system: string; messages: { content: string }[] };
const asked: Sent[] = [];
let reply = "";
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  if (url.hostname === "api.anthropic.com") {
    asked.push(JSON.parse(String(init?.body)) as Sent);
    return new Response(JSON.stringify({ content: [{ type: "text", text: reply }] }));
  }
  return new Response("{}", { status: 404 });
}) as typeof fetch;

async function main(): Promise<void> {
  redis.clear();
  process.env.ANTHROPIC_API_KEY = "sk-ant-test-only-a-stand-in-0123456789";

  part("A kept kit, made safe");
  const kept = parseKit({
    on: true,
    pitch: "  I cook.\r\n\r\n\r\n\r\nYou eat. ",
    audience: [
      { n: "instagram", count: 12_400, views: 3_000 },
      { n: "instagram", count: 9 },
      { n: "myspace", count: 10 },
      { n: "youtube", count: 0 },
      { n: "email", count: MAX_KIT_COUNT + 1 },
      { n: "tiktok", count: 50_000, views: -4 },
    ],
    facts: ["  68% in the US ", "68% in the US", ""],
    rates: [{ t: "One Reel", cents: 80_000 }, { t: "A mention", cents: null }, { t: "", cents: 5 }, { t: "Free", cents: 0 }],
    brands: ["Acme Pans", " Acme Pans ", "x".repeat(60)],
    stated: "2026-10-09",
  });
  is("the introduction tidied", kept.pitch, "I cook.\n\nYou eat.");
  is("known places only, each once, with a number in range", kept.audience, [
    { n: "instagram", count: 12_400, views: 3_000 },
    { n: "tiktok", count: 50_000, views: 0 },
  ]);
  is("lines kept once", kept.facts, ["68% in the US"]);
  is("a price, or on request", kept.rates, [{ t: "One Reel", cents: 80_000 }, { t: "A mention", cents: null }, { t: "Free", cents: null }]);
  is("brands as plain names, kept short", kept.brands, ["Acme Pans", "x".repeat(40)]);
  is("at most eight places", parseKit({ audience: ["instagram", "tiktok", "youtube", "x", "facebook", "linkedin", "threads", "pinterest", "twitch", "spotify"].map((n) => ({ n, count: 5 })) }).audience.length, MAX_KIT_AUDIENCE);
  is("nothing kept is the empty kit", parseKit(null), NO_KIT);

  part("The day beside the numbers");
  const first = nextKit({ on: true, audience: [{ n: "instagram", count: 100 }] }, NO_KIT, "2026-10-09");
  is("dated the day the numbers are first given", first.stated, "2026-10-09");
  is("kept when only the words change", nextKit({ on: true, pitch: "New words", audience: [{ n: "instagram", count: 100 }] }, first, "2026-11-20").stated, "2026-10-09");
  is("moved when a number changes", nextKit({ on: true, audience: [{ n: "instagram", count: 120 }] }, first, "2026-11-20").stated, "2026-11-20");
  is("and gone with the last number", nextKit({ on: true, pitch: "Hi" }, first, "2026-11-20").stated, "");

  part("What the page shows");
  is("only a kit that is on and has something in it", [kitShown({ ...NO_KIT, on: true }), kitShown({ ...NO_KIT, on: true, pitch: "Hi" }), kitShown({ ...NO_KIT, pitch: "Hi" })], [false, true, false]);
  is("the reach is the numbers added up", combinedReach(kept), 62_400);

  part("Kept on the store");
  const owner = "kit@example.com";
  await claimHandle(owner, "kitshop", "Kit Shop", "Weeknight recipes for busy parents.");
  await ensureStatsId(owner);
  await setKit(owner, { on: true, pitch: "Hello brands", audience: [{ n: "youtube", count: 5_000 }] }, "2026-10-09");
  const store = (await storeForEmail(owner))!;
  is("saved, and dated", [store.kit.on, store.kit.pitch, store.kit.stated], [true, "Hello brands", "2026-10-09"]);

  part("The introduction drafted with AI");
  await setSubscription(owner, { customerId: "cus_Kit00001", subscriptionId: "sub_Kit00001", active: true, tier: "pro" });
  reply = JSON.stringify({ pitches: ["I cook for parents.", "I cook for parents.", "Busy weeknights, solved."] });
  const drafted = await writeKitPitch((await storeForEmail(owner))!, { products: ["Meal Planner"], audience: ["YouTube: 5000"], facts: ["Most are 25 to 34"], notes: "" });
  is("three at most, each once", drafted.ok && drafted.value, ["I cook for parents.", "Busy weeknights, solved."]);
  is("given the creator's own numbers, and told to use no others", [
    asked[0].messages[0].content.includes("YouTube: 5000"),
    asked[0].messages[0].content.includes("Most are 25 to 34"),
    /Use ONLY the numbers given/.test(asked[0].system),
  ], [true, true, true]);
  is("nothing to write from, nothing asked", (await writeKitPitch({ ...(await storeForEmail(owner))!, bio: "" }, { products: [], audience: [], facts: [], notes: "" })).ok, false);
  done();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
