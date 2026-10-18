/**
 * Captions written by AI for a lesson's video (lib/auto-captions.ts, added 11
 * October 2026). What is checked:
 *
 *   - the price: since 18 October 2026 six dollars a minute for each
 *     language, minutes rounded up, never under $35, which keeps 60% at its
 *     dearest under the one receiving model (lib/receiving-costs.ts, held in
 *     tests/margin-alignment.test.ts), the card's fee included;
 *   - charged first, on an invoice of its own paid at once, and only then is
 *     the service asked; a declined card leaves nothing asked and nothing owed;
 *   - the service told the language spoken and those to translate into, and
 *     nothing else it charges for;
 *   - each language listed as it arrives; what never arrives refunded;
 *   - only languages the video has no captions in yet, one request at a time,
 *     only on a store with a plan.
 */
import { autoCaptionCents, CENTS_PER_MINUTE, GIVE_UP_HOURS, MIN_CENTS, readAutoAsk } from "@/lib/auto-captions-rules";
import { autoWriting, requestAutoCaptions, syncAutoCaptions } from "@/lib/auto-captions";
import { streamCaptions } from "@/lib/stream";
import { streamPath } from "@/lib/stream-rules";
import type { Store } from "@/lib/store";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { paidPeriod } from "./billing-period-fixture";

const VIDEO = "0b7c1d2e-3f40-4a5b-8c6d-7e8f9a0b1c2d";
const PATH = streamPath("a".repeat(32), "lesson000001", VIDEO);
let stripe: { path: string; body: URLSearchParams }[] = [];
const bunny: { method: string; path: string; body: unknown }[] = [];
let declineCard = false;
let serviceRefuses = false;
let delivered: string[] = [];

globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input));
  const method = init?.method ?? "GET";
  const json = (body: unknown, status = 200) => new Response(JSON.stringify(body), { status });
  if (url.hostname === "video.bunnycdn.com") {
    const path = url.pathname.replace(/^\/library\/\d+/, "") + url.search;
    bunny.push({ method, path, body: init?.body ? JSON.parse(String(init.body)) : undefined });
    if (path.includes("/transcribe")) return serviceRefuses ? json({ success: false, message: "no", statusCode: 400 }, 400) : json({ success: true, statusCode: 200 });
    return json({ guid: VIDEO, status: 4, captions: delivered.map((srclang) => ({ srclang, label: srclang })) });
  }
  const path = url.pathname.replace(/^\/v1/, "");
  const body = new URLSearchParams(String(init?.body ?? ""));
  stripe.push({ path: `${method} ${path}`, body });
  if (path.startsWith("/subscriptions/")) return json({ id: "sub_Store000001", default_payment_method: "pm_card_on_file" });
  if (path === "/invoices") return json({ id: "in_Captions00001", status: "draft" });
  if (path === "/invoiceitems") return json({ id: "ii_Captions0001" });
  if (path.endsWith("/finalize")) return json({ id: "in_Captions00001", status: "open" });
  if (path.endsWith("/pay")) return declineCard ? json({ error: { code: "card_declined", message: "Your card was declined." } }, 402) : json({ id: "in_Captions00001", status: "paid", payment_intent: "pi_Captions000001" });
  if (path.endsWith("/void")) return json({ id: "in_Captions00001", status: "void" });
  if (path === "/refunds") return json({ id: "re_1" });
  return json({});
}) as typeof fetch;

const store = {
  handle: "chef",
  subscriptionActive: true,
  subscriptionId: "sub_Store000001", period: paidPeriod(),
  stripeCustomerId: "cus_Store000001",
} as unknown as Store;

const stripePaths = () => stripe.map((s) => s.path);

async function main(): Promise<void> {
  redis.clear();
  process.env.STRIPE_SECRET_KEY = "sk_test_captions_only_a_stand_in";
  process.env.BUNNY_STREAM_LIBRARY_ID = "12345";
  process.env.BUNNY_STREAM_API_KEY = "bunny-api-key-only-a-stand-in";
  process.env.BUNNY_STREAM_TOKEN_KEY = "bunny-token-key-only-a-stand-in";

  part("The price");
  is("six dollars a minute for each language, minutes rounded up", [autoCaptionCents(600, 1), autoCaptionCents(601, 2), autoCaptionCents(90 * 60, 3)], [6000, 13200, 162000]);
  is("never under the minimum; nothing for a video with no length", [autoCaptionCents(30, 1), autoCaptionCents(0, 1)], [MIN_CENTS, 0]);
  // At its dearest: ten cents a language, a dime more if the spoken one is counted apart, and the card's 2.9% and 30 cents.
  const worst = (minutes: number, languages: number) => minutes * (languages + 1) * 10 + autoCaptionCents(minutes * 60, languages) * 0.029 + 30;
  is("it pays for itself at its dearest, at every length from one minute to four hours, one language or three", Array.from({ length: 240 }, (_, i) => i + 1).every((m) => [1, 2, 3].every((n) => autoCaptionCents(m * 60, n) > worst(m, n))), true);
  is("languages: the spoken one first, each once, three at most, none it cannot do", [
    readAutoAsk("en", ["es", "en", "xx"])?.languages,
    readAutoAsk("en", ["es", "fr", "de"]),
    readAutoAsk("klingon", []),
  ], [["en", "es"], null, null]);
  is("the rate the page and the terms say", [CENTS_PER_MINUTE, MIN_CENTS], [600, 3500]);

  // A video the service has finished, ten minutes long.
  await redis.pipeline([["SET", `nl:stream:v:${VIDEO}`, JSON.stringify({ id: VIDEO, path: PATH, name: "Knife skills.mp4", type: "video/mp4", bytes: 1, state: "ready", at: Date.now(), seconds: 600, width: 1920, height: 1080, settled: true })]]);

  part("Charged first, then asked for");
  declineCard = true;
  const declined = await requestAutoCaptions(store, PATH, "en", ["es"]);
  is("a declined card: nothing asked of the service, and the invoice voided", [declined.ok ? "asked" : declined.reason, bunny.some((b) => b.path.includes("/transcribe")), stripePaths().some((p) => p.endsWith("/void"))], ["declined", false, true]);
  declineCard = false;
  stripe = [];
  const asked = await requestAutoCaptions(store, PATH, "en", ["es"]);
  const item = stripe.find((s) => s.path === "POST /invoiceitems")!;
  const invoice = stripe.find((s) => s.path === "POST /invoices")!;
  is("charged the price shown, on its own invoice, paid at once, before the service is asked", [
    asked.ok && asked.cents,
    item.body.get("amount"),
    invoice.body.get("pending_invoice_items_behavior"),
    invoice.body.get("default_payment_method"),
    stripePaths().filter((p) => p.endsWith("/finalize") || p.endsWith("/pay")).length,
  ], [12000, "12000", "exclude", "pm_card_on_file", 2]);
  const transcribe = bunny.find((b) => b.path.includes("/transcribe"))!;
  is("the service told the language spoken and the one to translate into, and nothing else it charges for", transcribe.body, {
    sourceLanguage: "en",
    targetLanguages: ["en", "es"],
    generateTitle: false,
    generateDescription: false,
    generateChapters: false,
    generateMoments: false,
  });
  is("the studio shows them as being written", (await autoWriting([PATH]))[PATH], ["en", "es"]);
  is("one request at a time", (await requestAutoCaptions(store, PATH, "fr", [])).ok ? "asked" : "refused", "refused");

  part("Listed as they arrive; what never does, refunded");
  delivered = ["en"];
  is("English first: listed, Spanish still on its way", [await syncAutoCaptions(VIDEO), (await streamCaptions([PATH]))[PATH]?.map((t) => t.lang), (await autoWriting([PATH]))[PATH]], ["waiting", ["en"], ["es"]]);
  stripe = [];
  const late = Date.now() + (GIVE_UP_HOURS + 1) * 3_600_000;
  is("Spanish never came: half refunded, and nothing more is waited for", [await syncAutoCaptions(VIDEO, late), stripe.find((s) => s.path === "POST /refunds")?.body.get("amount"), stripe.find((s) => s.path === "POST /refunds")?.body.get("payment_intent"), (await autoWriting([PATH]))[PATH]], ["done", "6000", "pi_Captions000001", undefined]);

  part("Only where it should");
  is("not again in a language it has", (await requestAutoCaptions(store, PATH, "en", [])).ok ? "asked" : "refused", "refused");
  is("not on a store with no plan", (await requestAutoCaptions({ ...store, subscriptionActive: false } as Store, PATH, "fr", [])).ok ? "asked" : "refused", "refused");
  serviceRefuses = true;
  stripe = [];
  const refused = await requestAutoCaptions(store, PATH, "fr", []);
  is("the service refusing: refunded in full at once", [refused.ok ? "asked" : refused.reason, stripe.filter((s) => s.path === "POST /refunds").length, stripe.find((s) => s.path === "POST /refunds")?.body.has("amount")], ["unavailable", 1, false]);
  serviceRefuses = false;
  await redis.pipeline([["SET", `nl:stream:v:${VIDEO}`, JSON.stringify({ id: VIDEO, path: PATH, name: "x", type: "", bytes: 1, state: "working", at: Date.now(), seconds: 0, width: 0, height: 0, settled: false })]]);
  is("not before the video is ready", (await requestAutoCaptions(store, PATH, "fr", [])).ok ? "asked" : "refused", "refused");

  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
