/**
 * Webhooks: telling the creator's other tools what happened in their store.
 *
 * A creator adds up to MAX_ENDPOINTS https addresses — a Zapier "Catch Hook",
 * a Make or n8n webhook, their own server — and picks which events each one
 * hears. When one of those things happens, a JSON message is POSTed to it:
 *
 *   sale.completed       a paid checkout on the store (any product, calls and
 *                        memberships included), or a one-click extra after it
 *   membership.started   a membership bought (not a payment plan)
 *   membership.canceled  a membership set to end, or ended
 *   lead.captured        someone confirmed their address for a free product
 *                        (the link in the email was used)
 *   list.joined          someone confirmed their address to join the store's
 *                        list, from its sign-up box, one of its forms or the
 *                        checkout script on the creator's own site
 *   call.booked          a call or a seat in a session booked and paid
 *   call.moved           a buyer moved their booking
 *   refund.issued        a refund made on the creator's Stripe account
 *
 * The first four about money are read from the creator's own Stripe account,
 * which is the ledger, by the five-minute job (watchStripe): its events are
 * walked from where the last run stopped, so a refund made in the Stripe
 * dashboard is noticed on the next run, within about five minutes. The other
 * three happen in our own code and are sent the moment they happen.
 *
 * Every event has an id made from what it is about — the checkout, the
 * subscription, the refund — so however many times the same thing is noticed
 * (the thanks page and the job, a run that repeats), it is sent once. Every
 * message is signed: the header Marktmorgen-Signature is "t=<seconds>,v1=<hex>",
 * where the hex is HMAC-SHA256 of "<seconds>.<body>" under the endpoint's
 * secret, which is shown to the creator once, when the endpoint is added. A
 * receiver checks the signature and that the time is recent, and uses the
 * event id to ignore a repeat.
 *
 * A message is tried at once, and when the endpoint does not answer 2xx, again
 * after RETRY_MINUTES (5 minutes, 15, 1 hour, 3, 12, 24): seven tries over
 * about forty hours, then it is marked failed. Retries ride the five-minute
 * job, a bounded number per run. Since 18 October 2026 every try, the first,
 * each retry and each test, is one of the store's webhook deliveries for its
 * month (lib/store-allowance-rules.ts), taken before the endpoint is called:
 * once they are used, a delivery is not tried, and is marked failed with the
 * reason, which the studio's log shows. The last LOG_SIZE deliveries of a store are
 * kept for its studio, with what the endpoint answered; each is kept for a
 * week at most. Every request goes through lib/safe-fetch.ts, so an endpoint
 * on a private network is refused, and none follows a redirect.
 *
 *   nl:hooks:cfg:<statsId>      { handle, endpoints, since }
 *   nl:hooks:stores             the stores that have any endpoint
 *   nl:hooks:evt:<event>        an event already sent, for thirty days
 *   nl:hooks:d:<delivery>       one delivery and how it went, for a week
 *   nl:hooks:log:<statsId>      the store's last deliveries, newest first
 *   nl:hooks:q                  deliveries waiting for a try, by when
 *   nl:hooks:anchor:<statsId>   the last Stripe event read for this store
 */
import { createHash, createHmac, randomBytes } from "node:crypto";
import { after } from "next/server";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { StripeError, onAccount } from "@/lib/stripe-account";
import { isSettled } from "@/lib/instant-pay";
import { SafeFetchError, checkUrl, problemWords, safeFetch } from "@/lib/safe-fetch";
import { type Store, storeForHandle, saleHandles } from "@/lib/store";
import { takeAllowance } from "@/lib/store-allowance";
import { reservePaidResourceWindow } from "@/lib/contract-resource-window";
import { readListing } from "@/lib/catalog";
import { SITE_URL } from "@/lib/site-url";
import { type BundleSlot, bumpsFromMeta, bundleFromMeta } from "@/lib/bundle-rules";

export const WEBHOOK_EVENTS = [
  "sale.completed",
  "membership.started",
  "membership.canceled",
  "lead.captured",
  "list.joined",
  "call.booked",
  "call.moved",
  "refund.issued",
  "sequence.step",
] as const;
export type WebhookEvent = (typeof WEBHOOK_EVENTS)[number];

/** Endpoints one store may have. */
export const MAX_ENDPOINTS = 5;
/** Deliveries a store's studio keeps. */
export const LOG_SIZE = 50;
/** Minutes to wait before each try after the first. */
export const RETRY_MINUTES = [5, 15, 60, 180, 720, 1440];
export const MAX_ATTEMPTS = RETRY_MINUTES.length + 1;
/** How long an endpoint has to answer one try. */
export const ATTEMPT_TIMEOUT_MS = 8_000;
/** The longest address accepted for an endpoint. */
export const MAX_ENDPOINT_URL = 1000;
/** Test messages one store may send in a minute. */
const TESTS_PER_MINUTE = 10;
/** Stripe events read per store per run, in pages of a hundred. */
const MAX_EVENT_PAGES = 3;
/** How far back a store's first run reads, in pages of a hundred events. */
const FIRST_RUN_PAGES = 10;
/** Deliveries retried in one run of the job, at most. */
const MAX_RETRIES_PER_RUN = 100;

const EVENT_SECONDS = 30 * 86400;
const DELIVERY_SECONDS = 7 * 86400;

type Endpoint = { id: string; url: string; secret: string; events: WebhookEvent[]; addedAt: string };
type Config = { handle: string; endpoints: Endpoint[]; since: number };

export type Delivery = {
  id: string;
  statsId: string;
  endpoint: string;
  eventId: string;
  type: WebhookEvent | "test";
  body: string;
  attempts: number;
  state: "queued" | "delivered" | "retrying" | "failed";
  /** When the next try is due, in milliseconds; 0 once there is none. */
  next: number;
  /** What the endpoint last answered: its status, or 0 when it did not answer. */
  lastStatus: number;
  lastError: string;
  lastAt: number;
  createdAt: number;
};

const cfgKey = (statsId: string) => `nl:hooks:cfg:${statsId}`;
const STORES_KEY = "nl:hooks:stores";
const eventKey = (id: string) => `nl:hooks:evt:${id}`;
const deliveryKey = (id: string) => `nl:hooks:d:${id}`;
const logKey = (statsId: string) => `nl:hooks:log:${statsId}`;
export const QUEUE_KEY = "nl:hooks:q";
const anchorKey = (statsId: string) => `nl:hooks:anchor:${statsId}`;
const testsKey = (statsId: string) => `nl:rl:hooks:test:${statsId}`;
const POSITION_KEY = "nl:hooks:pos";

const ENDPOINT_ID_PATTERN = /^we_[0-9a-f]{16}$/;
const DELIVERY_ID_PATTERN = /^dlv_[0-9a-f]{24}$/;

function isEvent(value: unknown): value is WebhookEvent {
  return typeof value === "string" && (WEBHOOK_EVENTS as readonly string[]).includes(value);
}

function parseConfig(raw: unknown): Config | null {
  if (typeof raw !== "string" || !raw) return null;
  try {
    const value = JSON.parse(raw) as Partial<Config>;
    const endpoints = Array.isArray(value.endpoints)
      ? value.endpoints
          .filter((e): e is Endpoint => Boolean(e) && typeof e.id === "string" && ENDPOINT_ID_PATTERN.test(e.id) && typeof e.url === "string" && typeof e.secret === "string")
          .map((e) => ({ ...e, events: Array.isArray(e.events) ? e.events.filter(isEvent) : [] }))
      : [];
    return {
      handle: typeof value.handle === "string" ? value.handle : "",
      endpoints: endpoints.slice(0, MAX_ENDPOINTS),
      since: typeof value.since === "number" ? value.since : 0,
    };
  } catch {
    return null;
  }
}

function parseDelivery(raw: unknown): Delivery | null {
  if (typeof raw !== "string" || !raw) return null;
  try {
    const value = JSON.parse(raw) as Delivery;
    return typeof value.id === "string" && typeof value.body === "string" ? value : null;
  } catch {
    return null;
  }
}

async function readConfig(statsId: string): Promise<Config | null> {
  const [raw] = await redisPipeline([["GET", cfgKey(statsId)]]);
  return parseConfig(raw);
}

/** The source fields of a sale.completed message, read off the order's metadata; null where it carries none. */
export function sourceOf(meta: Record<string, string | undefined>): Record<string, string | null> {
  const field = (name: string) => (typeof meta[name] === "string" && meta[name] ? (meta[name] as string) : null);
  let site: string | null = null;
  const embed = field("embed_site");
  if (embed) {
    try {
      site = new URL(embed).origin;
    } catch {
      site = null;
    }
  }
  return {
    utm_source: field("utm_source"),
    utm_medium: field("utm_medium"),
    utm_campaign: field("utm_campaign"),
    utm_content: field("utm_content"),
    site,
  };
}

/** The id of an event, the same every time the same thing is noticed. */
export function eventIdFor(statsId: string, type: string, seed: string): string {
  return `evt_${createHash("sha256").update(`${statsId}|${type}|${seed}`).digest("hex").slice(0, 32)}`;
}

/** The signature header for one body at one moment. */
export function signature(secret: string, timestamp: number, body: string): string {
  const hex = createHmac("sha256", secret).update(`${timestamp}.${body}`).digest("hex");
  return `t=${timestamp},v1=${hex}`;
}

// ---- Sending ----------------------------------------------------------------

/** Test seams for the fetch; production passes nothing. */
export type SendHooks = { fetch?: Pick<Parameters<typeof safeFetch>[1], "resolve" | "agent"> };
let hooksForTests: SendHooks = {};
/** Lets a local check point deliveries at a stand-in. Never called by the app. */
export function setSendHooksForTests(hooks: SendHooks): void {
  hooksForTests = hooks;
}

/** One try of one delivery. Returns the delivery as it stands after it. */
/**
 * `store` is whose month the try is taken from, before the endpoint is
 * called; "taken" when the caller took it already (a test).
 */
async function attempt(delivery: Delivery, endpoint: Endpoint | undefined, store: Store | null | "taken", now = Date.now()): Promise<Delivery> {
  const next = { ...delivery, attempts: delivery.attempts + 1, lastAt: now };
  if (!endpoint) {
    return { ...next, state: "failed", next: 0, lastStatus: 0, lastError: "The endpoint was removed." };
  }
  if (!store) return { ...delivery, state: "failed", next: 0, lastAt: now, lastStatus: 0, lastError: "The store could not be found." };
  // One of the store's webhook deliveries for its month, before the endpoint is called.
  const taken = store === "taken" ? ({ ok: true } as const) : await takeAllowance(store, "webhook", 1, now);
  if (!taken.ok) {
    const retryIn = delivery.type === "test" ? undefined : RETRY_MINUTES[delivery.attempts];
    // A count that could not be made is tried again on the schedule; a month whose deliveries are used is not.
    if (taken.reason === "unknown" && retryIn !== undefined) return { ...delivery, state: "retrying", next: now + retryIn * 60_000, lastAt: now, lastStatus: 0, lastError: taken.message };
    return { ...delivery, state: "failed", next: 0, lastAt: now, lastStatus: 0, lastError: `Not sent. ${taken.message}` };
  }
  const timestamp = Math.floor(now / 1000);
  let status = 0;
  let error = "";
  try {
    const answer = await safeFetch(endpoint.url, {
      method: "POST",
      body: delivery.body,
      maxBytes: 16_384,
      timeoutMs: ATTEMPT_TIMEOUT_MS,
      headers: {
        "Content-Type": "application/json",
        "User-Agent": "Marktmorgen-Webhooks/1.0 (+https://marktmorgen.com)",
        "Marktmorgen-Event-Id": delivery.eventId,
        "Marktmorgen-Event-Type": delivery.type,
        "Marktmorgen-Delivery-Id": delivery.id,
        "Marktmorgen-Timestamp": String(timestamp),
        "Marktmorgen-Signature": signature(endpoint.secret, timestamp, delivery.body),
      },
      ...(hooksForTests.fetch ?? {}),
    });
    status = answer.status;
    if (status < 200 || status >= 300) error = `Answered ${status}.`;
  } catch (caught) {
    error = caught instanceof SafeFetchError ? problemWords(caught) : "The endpoint could not be reached.";
  }
  if (!error) return { ...next, state: "delivered", next: 0, lastStatus: status, lastError: "" };
  const retryIn = delivery.type === "test" ? undefined : RETRY_MINUTES[next.attempts - 1];
  if (retryIn === undefined) return { ...next, state: "failed", next: 0, lastStatus: status, lastError: error };
  return { ...next, state: "retrying", next: now + retryIn * 60_000, lastStatus: status, lastError: error };
}

/**
 * Tries a delivery that this caller has claimed (taken off the queue), and
 * writes down how it went, putting it back on the queue for its next try.
 */
async function runClaimed(statsId: string, id: string, now = Date.now()): Promise<Delivery | null> {
  const [raw] = await redisPipeline([["GET", deliveryKey(id)]]);
  const delivery = parseDelivery(raw);
  if (!delivery || delivery.state === "delivered" || delivery.state === "failed") {
    await redisPipeline([["ZREM", QUEUE_KEY, `${statsId}|${id}`]]);
    return delivery;
  }
  const config = await readConfig(delivery.statsId);
  const endpoint = config?.endpoints.find((e) => e.id === delivery.endpoint);
  const store = endpoint && config?.handle ? await storeForHandle(config.handle).catch(() => null) : null;
  const done = await attempt(delivery, endpoint, store && store.statsId === delivery.statsId ? store : null, now);
  const commands: (string | number)[][] = [["SET", deliveryKey(id), JSON.stringify(done), "EX", DELIVERY_SECONDS]];
  commands.push(
    done.state === "retrying" ? ["ZADD", QUEUE_KEY, done.next, `${statsId}|${id}`] : ["ZREM", QUEUE_KEY, `${statsId}|${id}`],
  );
  await redisPipeline(commands);
  return done;
}

/**
 * Takes an item that is due on the queue for a while (a lease) rather than
 * off it: a run that dies half way, a function cut off by its time limit,
 * leaves it to come back when the lease ends instead of losing it. Only one
 * caller at a time gets it.
 */
const LEASE_SCRIPT = [
  'local due = redis.call("ZSCORE", KEYS[1], ARGV[1])',
  "if not due or tonumber(due) > tonumber(ARGV[2]) then return 0 end",
  'redis.call("ZADD", KEYS[1], ARGV[3], ARGV[1])',
  "return 1",
].join("\n");
const LEASE_MS = 10 * 60 * 1000;

/** Takes a delivery that is due, for the length of a lease. Only the caller that took it tries it. */
async function claim(statsId: string, id: string, now = Date.now()): Promise<boolean> {
  const reply = await redisPipeline([["EVAL", LEASE_SCRIPT, 1, QUEUE_KEY, `${statsId}|${id}`, now, now + LEASE_MS]]);
  if (!Array.isArray(reply) || reply.length !== 1 || (reply[0] !== 0 && reply[0] !== 1)) {
    throw new Error("The webhook delivery lease was not acknowledged");
  }
  return reply[0] === 1;
}

/** Runs now, after the answer is sent when there is a request to wait for. */
function soon(task: () => Promise<unknown>): Promise<void> {
  try {
    after(() => task().catch((error) => console.error("a webhook delivery failed", error)));
    return Promise.resolve();
  } catch {
    // Outside a request (a script, a check): simply now.
    return task().then(
      () => undefined,
      (error) => console.error("a webhook delivery failed", error),
    );
  }
}

/**
 * Records that something happened, once, and sends it to every endpoint that
 * listens for it. `seed` names what it is about (a checkout, a refund), which
 * is what makes the event id the same however often it is noticed.
 */
export async function emitEvent(store: Store, type: WebhookEvent, seed: string, data: Record<string, unknown>, now = Date.now()): Promise<number> {
  if (!store.statsId || !isRedisConfigured()) return 0;
  const statsId = store.statsId;
  const config = await readConfig(statsId);
  const listening = config?.endpoints.filter((e) => e.events.includes(type)) ?? [];
  if (!listening.length) return 0;
  const eventId = eventIdFor(statsId, type, seed);
  const [fresh] = await redisPipeline([["SET", eventKey(eventId), "1", "NX", "EX", EVENT_SECONDS]]);
  if (fresh === null) return 0;

  const body = JSON.stringify({
    id: eventId,
    type,
    created: Math.floor(now / 1000),
    store: { handle: store.handle, name: store.name, url: `${SITE_URL}/@${store.handle}` },
    data,
  });
  const ids: string[] = [];
  const commands: (string | number)[][] = [];
  for (const endpoint of listening) {
    const id = `dlv_${randomBytes(12).toString("hex")}`;
    ids.push(id);
    const delivery: Delivery = {
      id,
      statsId,
      endpoint: endpoint.id,
      eventId,
      type,
      body,
      attempts: 0,
      state: "queued",
      // Due at once; if the try below never happens, the job finds it.
      next: now,
      lastStatus: 0,
      lastError: "",
      lastAt: 0,
      createdAt: now,
    };
    commands.push(["SET", deliveryKey(id), JSON.stringify(delivery), "EX", DELIVERY_SECONDS]);
    commands.push(["ZADD", QUEUE_KEY, now, `${statsId}|${id}`]);
    commands.push(["LPUSH", logKey(statsId), id]);
  }
  commands.push(["LTRIM", logKey(statsId), 0, LOG_SIZE - 1]);
  await redisPipeline(commands);
  await soon(async () => {
    for (const id of ids) if (await claim(statsId, id)) await runClaimed(statsId, id);
  });
  return ids.length;
}

/**
 * Tries every delivery that is due, for the five-minute job: at most
 * MAX_RETRIES_PER_RUN, ten at a time, and none started after the deadline.
 */
export async function deliverDue(deadline: number, now = Date.now()): Promise<{ tried: number; delivered: number }> {
  const counts = { tried: 0, delivered: 0 };
  if (!isRedisConfigured()) return counts;
  const reply = await redisPipeline([["ZRANGEBYSCORE", QUEUE_KEY, "-inf", now, "LIMIT", 0, MAX_RETRIES_PER_RUN]]);
  const due = Array.isArray(reply) && reply.length === 1 ? reply[0] : null;
  if (!Array.isArray(due) || due.length > MAX_RETRIES_PER_RUN || due.some(member => typeof member !== "string" || member.length === 0) || new Set(due).size !== due.length) {
    throw new Error("The webhook due queue is not a complete bounded observation");
  }
  const members = due as string[];
  for (let i = 0; i < members.length && Date.now() < deadline; i += 10) {
    await Promise.all(
      members.slice(i, i + 10).map(async (member) => {
        const [statsId, id] = member.split("|");
        if (!statsId || !DELIVERY_ID_PATTERN.test(id ?? "")) {
          await redisPipeline([["ZREM", QUEUE_KEY, member]]);
          return;
        }
        if (!(await claim(statsId, id, now))) return;
        counts.tried += 1;
        const done = await runClaimed(statsId, id).catch((error) => {
          console.error("a webhook retry failed", error);
          return null;
        });
        if (done?.state === "delivered") counts.delivered += 1;
      }),
    );
  }
  return counts;
}

// ---- The studio ---------------------------------------------------------------

export type EndpointView = { id: string; where: string; events: WebhookEvent[]; addedAt: string };
export type DeliveryView = Pick<Delivery, "id" | "eventId" | "type" | "state" | "attempts" | "next" | "lastStatus" | "lastError" | "lastAt" | "createdAt"> & {
  endpoint: string;
};
export type WebhooksView = { endpoints: EndpointView[]; log: DeliveryView[] };

/**
 * An endpoint's address as the studio shows it: the host and enough of the
 * path to tell two apart, never the whole of a secret-bearing path.
 */
export function shortAddress(url: string): string {
  try {
    const parsed = new URL(url);
    const path = parsed.pathname.replace(/\/+$/, "");
    const tail = path.length > 24 ? `${path.slice(0, 10)}…${path.slice(-6)}` : path;
    return `${parsed.host}${tail}`;
  } catch {
    return "an endpoint";
  }
}

export async function webhooksView(store: Store): Promise<WebhooksView> {
  if (!store.statsId || !isRedisConfigured()) return { endpoints: [], log: [] };
  const [rawConfig, rawLog] = await redisPipeline([
    ["GET", cfgKey(store.statsId)],
    ["LRANGE", logKey(store.statsId), 0, LOG_SIZE - 1],
  ]);
  const config = parseConfig(rawConfig);
  const ids = Array.isArray(rawLog) ? (rawLog as unknown[]).map(String).filter((id) => DELIVERY_ID_PATTERN.test(id)) : [];
  const deliveries = ids.length ? await redisPipeline(ids.map((id) => ["GET", deliveryKey(id)])) : [];
  const names = new Map((config?.endpoints ?? []).map((e) => [e.id, shortAddress(e.url)]));
  return {
    endpoints: (config?.endpoints ?? []).map((e) => ({ id: e.id, where: shortAddress(e.url), events: e.events, addedAt: e.addedAt })),
    log: deliveries
      .map(parseDelivery)
      .filter((d): d is Delivery => d !== null)
      .map((d) => ({
        id: d.id,
        eventId: d.eventId,
        type: d.type,
        state: d.state,
        attempts: d.attempts,
        next: d.next,
        lastStatus: d.lastStatus,
        lastError: d.lastError,
        lastAt: d.lastAt,
        createdAt: d.createdAt,
        endpoint: names.get(d.endpoint) ?? "a removed endpoint",
      })),
  };
}

/** Most messages recentMessages gives back. */
export const RECENT_MESSAGES_MAX = 10;

/**
 * The store's recent messages of one event, newest first, each once, as they
 * were sent: read from its last LOG_SIZE deliveries, each kept a week. What a
 * tool such as Zapier shows the creator as an example while they set a step
 * up, so it is only what already left the store; nothing new is read.
 */
export async function recentMessages(store: Store, type: WebhookEvent, limit = 3): Promise<Record<string, unknown>[]> {
  if (!store.statsId || !isRedisConfigured()) return [];
  const most = Math.max(1, Math.min(RECENT_MESSAGES_MAX, Math.floor(limit)));
  const [rawLog] = await redisPipeline([["LRANGE", logKey(store.statsId), 0, LOG_SIZE - 1]]);
  const ids = Array.isArray(rawLog) ? (rawLog as unknown[]).map(String).filter((id) => DELIVERY_ID_PATTERN.test(id)) : [];
  if (!ids.length) return [];
  const deliveries = (await redisPipeline(ids.map((id) => ["GET", deliveryKey(id)]))).map(parseDelivery);
  const seen = new Set<string>();
  const out: Record<string, unknown>[] = [];
  for (const delivery of deliveries) {
    if (!delivery || delivery.type !== type || delivery.statsId !== store.statsId || seen.has(delivery.eventId)) continue;
    seen.add(delivery.eventId);
    try {
      out.push(JSON.parse(delivery.body) as Record<string, unknown>);
    } catch {
      continue;
    }
    if (out.length >= most) break;
  }
  return out;
}

/** Whether a word is one of the events an endpoint can hear. */
export function isWebhookEvent(value: unknown): value is WebhookEvent {
  return isEvent(value);
}

export type AddEndpointResult =
  | { ok: true; secret: string; view: WebhooksView }
  | { ok: false; reason: "full" | "invalid" | "events" | "duplicate" | "unavailable"; message: string };

/**
 * Adds an endpoint. Its secret is made here and returned this once; the
 * studio never shows it again. The address is checked now (https, a public
 * host) and again at every send, since what a name points to can change.
 */
export async function addEndpoint(store: Store, rawUrl: string, events: unknown, now = Date.now()): Promise<AddEndpointResult> {
  if (!store.statsId) return { ok: false, reason: "invalid", message: "Open the studio once more and try again." };
  const chosen = Array.isArray(events) ? [...new Set(events.filter(isEvent))] : [];
  if (!chosen.length) return { ok: false, reason: "events", message: "Choose at least one event to send." };
  if (rawUrl.trim().length > MAX_ENDPOINT_URL) return { ok: false, reason: "invalid", message: "That address is too long." };
  let url: string;
  try {
    const parsed = checkUrl(rawUrl);
    if (/^webcals?:/i.test(rawUrl.trim())) throw new SafeFetchError("scheme", "Only https:// addresses are accepted.");
    url = parsed.toString();
  } catch (error) {
    return { ok: false, reason: "invalid", message: problemWords(error) };
  }
  const config = (await readConfig(store.statsId)) ?? { handle: store.handle, endpoints: [], since: Math.floor(now / 1000) };
  if (config.endpoints.length >= MAX_ENDPOINTS) return { ok: false, reason: "full", message: `A store can have ${MAX_ENDPOINTS} endpoints. Remove one first.` };
  if (config.endpoints.some((e) => e.url === url)) return { ok: false, reason: "duplicate", message: "That endpoint is already added." };
  // Adding an endpoint creates new future delivery work. Removing an existing
  // endpoint remains on its retained cleanup path below.
  if (store.period?.funded === true && !(await reservePaidResourceWindow(store))) {
    return { ok: false, reason: "unavailable", message: "The endpoint could not be added just now. Try again in a moment." };
  }
  const secret = `whsec_${randomBytes(24).toString("base64url")}`;
  const endpoint: Endpoint = { id: `we_${randomBytes(8).toString("hex")}`, url, secret, events: chosen, addedAt: new Date(now).toISOString() };
  // The Stripe pass starts from now for a store's first endpoint: nothing
  // that happened before it was added is sent to it.
  const next: Config = { handle: store.handle, endpoints: [...config.endpoints, endpoint], since: config.endpoints.length ? config.since : Math.floor(now / 1000) };
  await redisPipeline([
    ["SET", cfgKey(store.statsId), JSON.stringify(next)],
    ["SADD", STORES_KEY, store.statsId],
    ...(config.endpoints.length ? [] : [["DEL", anchorKey(store.statsId)]]),
  ]);
  return { ok: true, secret, view: await webhooksView(store) };
}

/** Changes which events an endpoint hears. */
export async function setEndpointEvents(store: Store, id: string, events: unknown): Promise<WebhooksView | "events" | "missing" | "unavailable"> {
  if (!store.statsId) return "missing";
  const chosen = Array.isArray(events) ? [...new Set(events.filter(isEvent))] : [];
  if (!chosen.length) return "events";
  const config = await readConfig(store.statsId);
  const endpoint = config?.endpoints.find((e) => e.id === id);
  if (!config || !endpoint) return "missing";
  // A subset removes future work; adding a new event creates a new obligation.
  // Keep retained event removal available without a fresh admission.
  if (chosen.some(event => !endpoint.events.includes(event)) && store.period?.funded === true && !(await reservePaidResourceWindow(store))) return "unavailable";
  const next: Config = { ...config, handle: store.handle, endpoints: config.endpoints.map((e) => (e.id === id ? { ...e, events: chosen } : e)) };
  await redisPipeline([["SET", cfgKey(store.statsId), JSON.stringify(next)]]);
  return webhooksView(store);
}

/** Removes an endpoint. Anything still waiting to be sent to it is dropped at its next try. */
export async function removeEndpoint(store: Store, id: string): Promise<WebhooksView> {
  if (!store.statsId) return { endpoints: [], log: [] };
  const config = await readConfig(store.statsId);
  if (config && config.endpoints.some((e) => e.id === id)) {
    const endpoints = config.endpoints.filter((e) => e.id !== id);
    await redisPipeline([
      ["SET", cfgKey(store.statsId), JSON.stringify({ ...config, handle: store.handle, endpoints })],
      ...(endpoints.length ? [] : [["SREM", STORES_KEY, store.statsId]]),
    ]);
  }
  return webhooksView(store);
}

/**
 * Sends one test message to one endpoint, now, and says how it went. Tried
 * once, never retried, and listed with the rest.
 */
export async function sendTest(store: Store, id: string, now = Date.now()): Promise<{ ok: true; delivery: Delivery; view: WebhooksView } | { ok: false; reason: "missing" | "limited" | "unavailable" } | { ok: false; reason: "used"; message: string }> {
  if (!store.statsId) return { ok: false, reason: "missing" };
  const statsId = store.statsId;
  const config = await readConfig(statsId);
  const endpoint = config?.endpoints.find((e) => e.id === id);
  if (!endpoint) return { ok: false, reason: "missing" };
  const [, count] = await redisPipeline([
    ["SET", testsKey(statsId), "0", "EX", 60, "NX"],
    ["INCR", testsKey(statsId)],
  ]);
  if (Number(count) > TESTS_PER_MINUTE) return { ok: false, reason: "limited" };
  // This is new, manually requested work, not an already queued delivery.
  if (store.period?.funded === true && !await reservePaidResourceWindow(store)) return { ok: false, reason: "unavailable" };
  // A test is one of the store's webhook deliveries too: refused, it is not made at all.
  const taken = await takeAllowance(store, "webhook", 1, now);
  if (!taken.ok) return { ok: false, reason: "used", message: taken.message };
  const eventId = eventIdFor(statsId, "test", randomBytes(8).toString("hex"));
  const body = JSON.stringify({
    id: eventId,
    type: "test",
    created: Math.floor(now / 1000),
    store: { handle: store.handle, name: store.name, url: `${SITE_URL}/@${store.handle}` },
    data: { message: "A test from your Marktmorgen studio. Nothing happened in your store." },
  });
  const delivery: Delivery = {
    id: `dlv_${randomBytes(12).toString("hex")}`,
    statsId,
    endpoint: endpoint.id,
    eventId,
    type: "test",
    body,
    attempts: 0,
    state: "queued",
    next: 0,
    lastStatus: 0,
    lastError: "",
    lastAt: 0,
    createdAt: now,
  };
  const done = await attempt(delivery, endpoint, "taken", now);
  await redisPipeline([
    ["SET", deliveryKey(done.id), JSON.stringify(done), "EX", DELIVERY_SECONDS],
    ["LPUSH", logKey(statsId), done.id],
    ["LTRIM", logKey(statsId), 0, LOG_SIZE - 1],
  ]);
  return { ok: true, delivery: done, view: await webhooksView(store) };
}

// ---- Reading Stripe for what happened there ---------------------------------

type StripeEvent = { id?: unknown; type?: unknown; created?: unknown; data?: { object?: Record<string, unknown>; previous_attributes?: Record<string, unknown> } };

const STRIPE_TYPES = [
  "checkout.session.completed",
  "payment_intent.succeeded",
  "customer.subscription.updated",
  "customer.subscription.deleted",
  "charge.refunded",
];

/** Which of the Stripe-read events an endpoint of this store listens for. */
function wantsStripe(config: Config): boolean {
  return config.endpoints.some((e) => e.events.some((t) => t === "sale.completed" || t === "membership.started" || t === "membership.canceled" || t === "refund.issued"));
}

const iso = (seconds: unknown) => (typeof seconds === "number" && seconds > 0 ? new Date(seconds * 1000).toISOString() : null);
const str = (value: unknown) => (typeof value === "string" && value ? value : null);
const num = (value: unknown) => (typeof value === "number" && Number.isFinite(value) ? value : 0);

/** Turns one Stripe event of this store into ours, if it is one we send. */
async function fromStripe(store: Store, event: StripeEvent, lookups: { left: number }): Promise<void> {
  const object = event.data?.object ?? {};
  const previous = event.data?.previous_attributes ?? {};
  const handles = saleHandles(store);
  let meta = (object.metadata ?? {}) as Record<string, string>;
  const product = async (id: string | undefined) => {
    const found = id ? await readListing(store, id) : null;
    return { id: id ?? null, title: found?.title ?? meta.title ?? null };
  };
  const created = typeof event.created === "number" ? event.created * 1000 : Date.now();

  if (event.type === "checkout.session.completed") {
    if (!handles.has(meta.store ?? "") || !isSettled(object)) return;
    const session = str(object.id);
    if (!session) return;
    const details = (object.customer_details ?? {}) as { email?: unknown; name?: unknown };
    const buyer = { email: str(details.email) ?? str(object.customer_email), name: str(details.name) };
    const membership = object.mode === "subscription" && meta.kind !== "plan";
    const kind = meta.kind === "call" ? "call" : meta.kind === "plan" ? "payment_plan" : membership ? "membership" : "one_time";
    const totals = (object.total_details ?? {}) as { amount_discount?: unknown };
    // A bundle names every product it handed over, from the list on the order.
    const inside = async (slot: BundleSlot) => {
      const ids = bundleFromMeta(meta, slot);
      return ids.length ? Promise.all(ids.map((id) => product(id))) : null;
    };
    await emitEvent(store, "sale.completed", session, {
      checkout_session: session,
      kind,
      product: await product(meta.product),
      option: meta.option ?? null,
      bundle_items: await inside("bundle"),
      // Every product ticked at checkout, in the order of its boxes; the first
      // also under its old name, which integrations built before there could
      // be several still read.
      ...(await (async () => {
        const ticked = await Promise.all(bumpsFromMeta(meta).map(async ({ key, id }) => ({ ...(await product(id)), bundle_items: await inside(`${key}_bundle`) })));
        return { order_bump: ticked[0] ?? null, order_bumps: ticked };
      })()),
      amount_cents: num(object.amount_total),
      discount_cents: num(totals.amount_discount),
      currency: str(object.currency) ?? "usd",
      buyer,
      paid_at: iso(event.created),
      // Where the sale came from, as the checkout wrote it on the order: the
      // utm tags of the page the button was on, and the creator's own site it
      // was bought on through the checkout script (lib/embed-sites.ts).
      source: sourceOf(meta),
    }, created);
    if (membership) {
      await emitEvent(store, "membership.started", str(object.subscription) ?? session, {
        subscription: str(object.subscription),
        checkout_session: session,
        product: await product(meta.product),
        amount_cents: num(object.amount_total),
        currency: str(object.currency) ?? "usd",
        trial_days: Number(meta.trial_days) || 0,
        payments: Number(meta.ends_after) || null,
        buyer,
      }, created);
    }
    return;
  }

  if (event.type === "payment_intent.succeeded") {
    if (meta.kind !== "upsell" || !handles.has(meta.store ?? "")) return;
    const intent = str(object.id);
    if (!intent) return;
    await emitEvent(store, "sale.completed", intent, {
      payment_intent: intent,
      kind: "upsell",
      product: await product(meta.product),
      bundle_items: bundleFromMeta(meta, "bundle").length ? await Promise.all(bundleFromMeta(meta, "bundle").map((id) => product(id))) : null,
      after_checkout: meta.parent ?? null,
      // Which offer of the funnel was taken: its id and its place (1 to 5).
      // An offer charged before this was recorded carries its id only when
      // it was not the first, and the first is always number 1.
      funnel_step: {
        id: meta.step_id || meta.step || null,
        number: Number(meta.step_number) || (meta.step ? null : 1),
      },
      amount_cents: num(object.amount),
      discount_cents: 0,
      currency: str(object.currency) ?? "usd",
      buyer: { email: str(object.receipt_email), name: null },
      paid_at: iso(event.created),
    }, created);
    return;
  }

  if (event.type === "customer.subscription.updated" || event.type === "customer.subscription.deleted") {
    if (!handles.has(meta.store ?? "") || meta.kind === "plan") return;
    const id = str(object.id);
    if (!id) return;
    const ended = event.type === "customer.subscription.deleted";
    if (!ended) {
      // Only the change that sets an end. A membership with a set number of
      // payments is given its end when it is bought; that is not a cancellation.
      const ending = object.cancel_at_period_end === true || num(object.cancel_at) > 0;
      const wasEnding = previous.cancel_at_period_end === true || num(previous.cancel_at) > 0;
      const changed = "cancel_at_period_end" in previous || "cancel_at" in previous;
      if (!ending || wasEnding || !changed || meta.ends_after) return;
    }
    const item = ((object.items as { data?: { current_period_end?: unknown }[] } | undefined)?.data ?? [])[0];
    const endsAt = num(object.cancel_at) || num(object.current_period_end) || num(item?.current_period_end);
    const details = (object.cancellation_details ?? {}) as { reason?: unknown };
    let email: string | null = null;
    const customer = str(object.customer);
    if (customer && lookups.left > 0 && store.stripeAccountId) {
      lookups.left -= 1;
      try {
        email = str((await onAccount("GET", store.stripeAccountId, `/customers/${encodeURIComponent(customer)}`)).email);
      } catch {
        email = null;
      }
    }
    await emitEvent(store, "membership.canceled", `${id}|${num(object.canceled_at) || num(object.cancel_at) || num(event.created)}`, {
      subscription: id,
      product: await product(meta.product),
      status: ended ? "ended" : "ending",
      ends_at: ended ? iso(object.ended_at) ?? iso(event.created) : iso(endsAt),
      reason: ended && meta.ends_after ? "completed" : str(details.reason) ?? "cancellation_requested",
      buyer: { email, customer },
    }, created);
    return;
  }

  if (event.type === "charge.refunded") {
    const charge = str(object.id);
    if (!charge) return;
    const intent = str(object.payment_intent);
    // A charge made by a checkout carries the store in its own metadata; one
    // that does not is asked about through its payment, a bounded number of
    // times per run.
    if (!meta.store && intent && lookups.left > 0 && store.stripeAccountId) {
      lookups.left -= 1;
      try {
        meta = ((await onAccount("GET", store.stripeAccountId, `/payment_intents/${encodeURIComponent(intent)}`)).metadata ?? {}) as Record<string, string>;
      } catch {
        return;
      }
    }
    if (!handles.has(meta.store ?? "")) return;
    const total = num(object.amount_refunded);
    const before = num(previous.amount_refunded);
    const billing = (object.billing_details ?? {}) as { email?: unknown; name?: unknown };
    await emitEvent(store, "refund.issued", `${charge}|${total}`, {
      charge,
      payment_intent: intent,
      product: await product(meta.product),
      amount_refunded_cents: Math.max(0, total - before),
      total_refunded_cents: total,
      amount_cents: num(object.amount),
      fully_refunded: object.refunded === true,
      currency: str(object.currency) ?? "usd",
      buyer: { email: str(billing.email) ?? str(object.receipt_email), name: str(billing.name) },
      refunded_at: iso(event.created),
    }, created);
  }
}

/** A partial or malformed observation must not advance past unseen events. */
function stripeEventPage(value: unknown): StripeEvent[] {
  const invalid = () => new Error("Stripe events are not a complete bounded page");
  if (!value || typeof value !== "object" || Array.isArray(value)) throw invalid();
  const page = value as Record<string, unknown>;
  if (!Array.isArray(page.data) || page.data.length > 100 || typeof page.has_more !== "boolean" ||
      (page.has_more && !page.data.length)) throw invalid();
  const ids = new Set<string>();
  for (const row of page.data) {
    if (!row || typeof row !== "object" || Array.isArray(row) ||
        typeof row.id !== "string" || !/^evt_[A-Za-z0-9]+$/.test(row.id) || ids.has(row.id)) throw invalid();
    ids.add(row.id);
  }
  return page.data as StripeEvent[];
}

/** One store: its Stripe events since the last one read, oldest first. */
async function watchStore(store: Store, statsId: string, config: Config): Promise<number> {
  const account = store.stripeAccountId as string;
  const types = STRIPE_TYPES.map((t, i) => `types[${i}]=${encodeURIComponent(t)}`).join("&");
  const [anchorRaw] = await redisPipeline([["GET", anchorKey(statsId)]]);
  const anchor = typeof anchorRaw === "string" && /^evt_[A-Za-z0-9]+$/.test(anchorRaw) ? anchorRaw : "";
  const lookups = { left: 10 };
  let handled = 0;
  const send = async (rows: StripeEvent[]) => {
    // Stripe lists newest first; they are sent in the order they happened.
    for (const event of [...rows].reverse()) {
      await fromStripe(store, event, lookups);
      handled += 1;
    }
  };

  if (!anchor) {
    // The first run, or an anchor Stripe no longer has: collect bounded pages
    // going back in time, then send them oldest first. History beyond the
    // first-run page cap still needs a separate durable continuation.
    const pages: StripeEvent[][] = [];
    let older = "";
    for (let page = 0; page < FIRST_RUN_PAGES; page += 1) {
      const list = await onAccount(
        "GET",
        account,
        `/events?limit=100&${types}&created[gte]=${Math.max(config.since - 60, 0)}${older ? `&starting_after=${encodeURIComponent(older)}` : ""}`,
      );
      const rows = stripeEventPage(list);
      if (!rows.length) break;
      pages.push(rows);
      const last = str(rows[rows.length - 1].id);
      if (list.has_more !== true || !last) break;
      older = last;
      if (page === FIRST_RUN_PAGES - 1) console.error("a store has more Stripe events than one first run reads; the oldest are left", store.handle);
    }
    if (!pages.length) return 0;
    for (const rows of [...pages].reverse()) await send(rows);
    const newest = str(pages[0][0].id);
    if (newest) await redisPipeline([["SET", anchorKey(statsId), newest, "EX", 30 * 86400]]);
    return handled;
  }

  let after = anchor;
  for (let page = 0; page < MAX_EVENT_PAGES; page += 1) {
    // The hundred events just after the anchor.
    let list: Record<string, unknown>;
    try {
      list = await onAccount("GET", account, `/events?limit=100&${types}&ending_before=${encodeURIComponent(after)}`);
    } catch (error) {
      // Stripe keeps events for thirty days: an anchor it no longer knows is
      // let go of, and the store is read again from as far back as Stripe
      // goes (what was sent already is not sent twice, lib/webhooks.ts
      // emitEvent). Any other failure leaves the anchor for the next run.
      if (error instanceof StripeError && (error.status === 400 || error.status === 404)) {
        await redisPipeline([["DEL", anchorKey(statsId)]]);
        const since = Math.max(config.since, Math.floor(Date.now() / 1000) - 29 * 86400);
        return handled + (await watchStore(store, statsId, { ...config, since }));
      }
      throw error;
    }
    const rows = stripeEventPage(list);
    if (!rows.length) break;
    await send(rows);
    const newest = str(rows[0].id);
    if (newest) {
      after = newest;
      await redisPipeline([["SET", anchorKey(statsId), after, "EX", 30 * 86400]]);
    }
    if (list.has_more !== true) break;
  }
  return handled;
}

/**
 * The five-minute job's pass over Stripe for every store with an endpoint
 * that wants what Stripe knows, until the deadline, carrying on next run
 * from the store after the last one it reached.
 */
export async function watchStripe(deadline: number): Promise<{ stores: number; events: number }> {
  const counts = { stores: 0, events: 0 };
  if (!isRedisConfigured()) return counts;
  const [members, saved] = await redisPipeline([["SMEMBERS", STORES_KEY], ["GET", POSITION_KEY]]);
  const ids = (Array.isArray(members) ? (members as unknown[]).map(String) : []).sort();
  if (!ids.length) return counts;
  const start = Math.max(0, ids.findIndex((id) => id > (typeof saved === "string" ? saved : "")));
  for (let n = 0; n < ids.length && Date.now() < deadline; n += 1) {
    const statsId = ids[(start + n) % ids.length];
    await redisPipeline([["SET", POSITION_KEY, statsId]]);
    const config = await readConfig(statsId);
    if (!config || !config.endpoints.length) {
      await redisPipeline([["SREM", STORES_KEY, statsId]]);
      continue;
    }
    if (!wantsStripe(config)) continue;
    const store = await storeForHandle(config.handle).catch(() => null);
    if (!store || store.statsId !== statsId || !store.stripeAccountId) continue;
    counts.stores += 1;
    try {
      counts.events += await watchStore(store, statsId, config);
    } catch (error) {
      console.error("reading a store's Stripe events failed", store.handle, error);
    }
  }
  return counts;
}

/**
 * Forgets everything a deleted store kept here (added 17 October 2026): its
 * endpoints with their addresses and signing secrets, its place in the
 * five-minute job, its Stripe anchor and its delivery log with the bodies
 * of what was sent. Deliveries still waiting are dropped from the queue, so
 * nothing more is sent anywhere on its behalf. Safe to call twice.
 */
export async function forgetStoreWebhooks(statsId: string | null): Promise<void> {
  if (!statsId || !isRedisConfigured()) return;
  const [rawLog] = await redisPipeline([["LRANGE", logKey(statsId), 0, -1]]);
  const ids = Array.isArray(rawLog) ? (rawLog as unknown[]).map(String).filter((id) => DELIVERY_ID_PATTERN.test(id)) : [];
  await redisPipeline([
    ["DEL", cfgKey(statsId)],
    ["SREM", STORES_KEY, statsId],
    ["DEL", anchorKey(statsId)],
    ["DEL", logKey(statsId)],
    ...ids.flatMap((id) => [
      ["DEL", deliveryKey(id)],
      ["ZREM", QUEUE_KEY, `${statsId}|${id}`],
    ]),
  ]);
}

/** Keeps the handle the job looks a store up by current, from the studio. */
export async function keepHandle(store: Store): Promise<void> {
  if (!store.statsId || !isRedisConfigured()) return;
  const config = await readConfig(store.statsId);
  if (config && config.handle !== store.handle) {
    await redisPipeline([["SET", cfgKey(store.statsId), JSON.stringify({ ...config, handle: store.handle })]]);
  }
}
