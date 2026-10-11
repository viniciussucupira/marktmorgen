/**
 * A purchase sent to Meta and TikTok from our server as well as from the
 * buyer's browser (added 11 October 2026): Meta's Conversions API and
 * TikTok's Events API.
 *
 * Why. A pixel runs in the browser, and a good part of browsers never let it
 * report: content blockers, Safari's tracking prevention, an in-app browser
 * that closes before the script loads. An ad the platform cannot see sell is
 * an ad it cannot learn from, so each sale costs the creator more. Triple
 * Whale (Sonar), Northbeam (Apex) and Hyros (Sync) all sell sending the
 * purchase from the server for this reason. Here it is part of the pixels.
 *
 * When, and only then:
 *
 *   - the creator has put that platform's pixel on their store AND pasted an
 *     access token for it, made in their own ad account (Meta Events
 *     Manager, TikTok Events Manager), which is sealed before it is kept
 *     (lib/secret-box.ts) and never shown again;
 *   - the buyer's browser fired the pixel's own purchase event, which it does
 *     only where the pixels are allowed to run — after a yes where the law
 *     asks first, and never for a browser that sends Global Privacy Control
 *     (components/store-pixels.tsx). That browser then asks this server to
 *     send the same purchase; a buyer who said no, or was never asked, is
 *     never sent from here either;
 *   - the order is a paid checkout of this store from the last day, checked
 *     with Stripe, and it is sent once.
 *
 * What is sent: the order's id (so the platform counts the browser's event
 * and this one as one purchase), its time, amount, currency and product, the
 * page, and to match it to an ad, the buyer's email address hashed with
 * SHA-256 as both platforms require, the network address and browser the
 * request came from, and the platforms' own first-party cookies when the
 * browser has them (_fbp, _fbc, _ttp, ttclid). Nothing else.
 *
 *   nl:adsrv:<statsId>          JSON { meta?: sealed token, tiktok?: sealed token, testCode? }
 *   nl:adsrv:last:<statsId>     JSON { at, meta?, tiktok? }: the last answers, for the studio
 *   nl:adsrv:sent:<session>     an order already sent (3 days)
 */
import { createHash } from "node:crypto";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { seal, unseal } from "@/lib/secret-box";
import { onAccount } from "@/lib/stripe-account";
import { type Store, saleHandles } from "@/lib/store";
import { toMajor } from "@/lib/money";

export const META_GRAPH_VERSION = "v25.0";
export type ServerPlatform = "meta" | "tiktok";
export const SERVER_PLATFORMS: ServerPlatform[] = ["meta", "tiktok"];

const configKey = (statsId: string) => `nl:adsrv:${statsId}`;
const lastKey = (statsId: string) => `nl:adsrv:last:${statsId}`;
const sentKey = (session: string) => `nl:adsrv:sent:${session}`;
const context = (statsId: string, platform: ServerPlatform) => `ads-server|${statsId}|${platform}`;
const SESSION = /^cs_(test|live)_[A-Za-z0-9]{10,200}$/;
/** Tokens are long strings of letters, digits and a few marks; anything else is not one. */
const TOKEN = /^[A-Za-z0-9._\-|]{20,600}$/;
const TEST_CODE = /^TEST[0-9]{3,10}$/;

type Stored = { meta?: string; tiktok?: string; testCode?: string };

export type ServerSetup = {
  /** Which platforms have a token kept, never the token. */
  on: Record<ServerPlatform, boolean>;
  /** Meta's test event code, while the creator is checking it in Events Manager. */
  testCode: string;
  /** The last answer each platform gave, for the studio to show. */
  last: { at: number; meta?: string; tiktok?: string } | null;
};

async function readStored(statsId: string): Promise<Stored> {
  if (!isRedisConfigured()) return {};
  const [raw] = await redisPipeline([["GET", configKey(statsId)]]);
  try {
    const parsed = typeof raw === "string" ? (JSON.parse(raw) as Stored) : {};
    return parsed && typeof parsed === "object" ? parsed : {};
  } catch {
    return {};
  }
}

export async function serverSetup(statsId: string | null): Promise<ServerSetup> {
  if (!statsId || !isRedisConfigured()) return { on: { meta: false, tiktok: false }, testCode: "", last: null };
  const [raw, lastRaw] = await redisPipeline([["GET", configKey(statsId)], ["GET", lastKey(statsId)]]);
  let stored: Stored = {};
  let last: ServerSetup["last"] = null;
  try {
    stored = typeof raw === "string" ? (JSON.parse(raw) as Stored) : {};
  } catch {
    stored = {};
  }
  try {
    last = typeof lastRaw === "string" ? (JSON.parse(lastRaw) as ServerSetup["last"]) : null;
  } catch {
    last = null;
  }
  return { on: { meta: Boolean(stored.meta), tiktok: Boolean(stored.tiktok) }, testCode: stored.testCode ?? "", last };
}

/**
 * Keeps a platform's token, sealed, or forgets it (`token` empty). A token
 * that does not look like one is refused, so a pasted pixel id or a sentence
 * is said to be wrong at once rather than failing at the first sale.
 */
export async function setServerToken(statsId: string, platform: ServerPlatform, token: unknown): Promise<"saved" | "removed" | "invalid"> {
  const text = typeof token === "string" ? token.trim() : "";
  const stored = await readStored(statsId);
  if (!text) {
    delete stored[platform];
    await redisPipeline([["SET", configKey(statsId), JSON.stringify(stored)]]);
    return "removed";
  }
  if (!TOKEN.test(text)) return "invalid";
  stored[platform] = seal(text, context(statsId, platform));
  await redisPipeline([["SET", configKey(statsId), JSON.stringify(stored)]]);
  return "saved";
}

/** Meta's test event code, while the creator checks the events arrive (Events Manager, Test events); empty to stop. */
export async function setTestCode(statsId: string, code: unknown): Promise<boolean> {
  const text = typeof code === "string" ? code.trim().toUpperCase() : "";
  if (text && !TEST_CODE.test(text)) return false;
  const stored = await readStored(statsId);
  if (text) stored.testCode = text;
  else delete stored.testCode;
  await redisPipeline([["SET", configKey(statsId), JSON.stringify(stored)]]);
  return true;
}

/** What a purchase is sent with: the request the buyer's browser made, and its own cookies. */
export type BuyerRequest = { ip: string; userAgent: string; url: string; cookies: Record<string, string> };

export const sha256 = (text: string) => createHash("sha256").update(text.trim().toLowerCase()).digest("hex");

/** Meta's event, as its Conversions API takes it. Pure, so the test reads exactly what is sent. */
export function metaEvent(order: { id: string; created: number; cents: number; currency: string; product: string; email: string | null }, buyer: BuyerRequest) {
  const user: Record<string, unknown> = { client_ip_address: buyer.ip, client_user_agent: buyer.userAgent };
  if (order.email) user.em = [sha256(order.email)];
  if (buyer.cookies._fbp) user.fbp = buyer.cookies._fbp;
  if (buyer.cookies._fbc) user.fbc = buyer.cookies._fbc;
  return {
    event_name: "Purchase",
    event_time: order.created,
    event_id: order.id,
    action_source: "website",
    event_source_url: buyer.url,
    user_data: user,
    custom_data: { currency: order.currency.toUpperCase(), value: toMajor(order.cents, order.currency), content_ids: [order.product], content_type: "product" },
  };
}

/** TikTok's event, as its Events API takes it. Pure, like metaEvent. */
export function tiktokEvent(order: { id: string; created: number; cents: number; currency: string; product: string; email: string | null }, buyer: BuyerRequest) {
  const user: Record<string, unknown> = { ip: buyer.ip, user_agent: buyer.userAgent };
  if (order.email) user.email = sha256(order.email);
  if (buyer.cookies._ttp) user.ttp = buyer.cookies._ttp;
  if (buyer.cookies.ttclid) user.ttclid = buyer.cookies.ttclid;
  return {
    event: "CompletePayment",
    event_time: order.created,
    event_id: order.id,
    user,
    page: { url: buyer.url },
    properties: {
      currency: order.currency.toUpperCase(),
      value: toMajor(order.cents, order.currency),
      contents: [{ content_id: order.product, content_type: "product", quantity: 1 }],
    },
  };
}

export type SendResult = "sent" | "already" | "off" | "invalid";

/**
 * Sends one paid order of this store to each platform with a pixel and a
 * token, once. Called by the buyer's own browser after its pixels fired, so
 * it carries their request.
 */
export async function sendServerPurchase(store: Store, sessionId: unknown, buyer: BuyerRequest, now = Date.now()): Promise<SendResult> {
  if (typeof sessionId !== "string" || !SESSION.test(sessionId)) return "invalid";
  if (!store.statsId || !store.stripeAccountId || !isRedisConfigured()) return "off";
  const stored = await readStored(store.statsId);
  const platforms = SERVER_PLATFORMS.filter((p) => stored[p] && store.pixels[p]);
  if (!platforms.length) return "off";
  let session: Record<string, unknown>;
  try {
    session = (await onAccount("GET", store.stripeAccountId, `/checkout/sessions/${encodeURIComponent(sessionId)}`)) as Record<string, unknown>;
  } catch {
    return "invalid";
  }
  const meta = (session.metadata ?? {}) as Record<string, string>;
  const created = typeof session.created === "number" ? session.created : 0;
  if (session.status !== "complete" || session.payment_status !== "paid" || !saleHandles(store).has(meta.store ?? "") || created < now / 1000 - 86400) {
    return "invalid";
  }
  const [claimed] = await redisPipeline([["SET", sentKey(sessionId), "1", "NX", "EX", 3 * 86400]]);
  if (claimed === null) return "already";
  const details = (session.customer_details ?? {}) as { email?: unknown };
  const order = {
    id: sessionId,
    created,
    cents: typeof session.amount_total === "number" ? session.amount_total : 0,
    currency: typeof session.currency === "string" ? session.currency : store.currency,
    product: meta.product ?? "",
    email: typeof details.email === "string" ? details.email : typeof session.customer_email === "string" ? session.customer_email : null,
  };
  const answers: Record<string, string> = {};
  await Promise.all(
    platforms.map(async (platform) => {
      const opened = unseal(stored[platform] as string, context(store.statsId as string, platform));
      if (!opened.ok) {
        answers[platform] = "Your token could not be read; paste it again.";
        return;
      }
      try {
        const response =
          platform === "meta"
            ? await fetch(`https://graph.facebook.com/${META_GRAPH_VERSION}/${store.pixels.meta}/events`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  data: [metaEvent(order, buyer)],
                  access_token: opened.value,
                  ...(stored.testCode ? { test_event_code: stored.testCode } : {}),
                }),
                signal: AbortSignal.timeout(8_000),
              })
            : await fetch("https://business-api.tiktok.com/open_api/v1.3/event/track/", {
                method: "POST",
                headers: { "Content-Type": "application/json", "Access-Token": opened.value },
                body: JSON.stringify({ event_source: "web", event_source_id: store.pixels.tiktok, data: [tiktokEvent(order, buyer)] }),
                signal: AbortSignal.timeout(8_000),
              });
        const body = (await response.json().catch(() => ({}))) as { error?: { message?: string }; code?: number; message?: string };
        const failed = !response.ok || (platform === "tiktok" && typeof body.code === "number" && body.code !== 0);
        answers[platform] = failed ? `Refused: ${String(body.error?.message ?? body.message ?? response.status).slice(0, 160)}` : "Received";
      } catch {
        answers[platform] = "Did not answer";
      }
    }),
  );
  await redisPipeline([["SET", lastKey(store.statsId), JSON.stringify({ at: now, ...answers }), "EX", 90 * 86400]]);
  return "sent";
}
