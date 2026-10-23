/**
 * Captions written by AI for a lesson's video (lib/auto-captions-rules.ts
 * says what they cost, and why that way).
 *
 * Pressed in the studio: the price is charged on the card the plan is paid
 * with, then the video service is asked to write them. It answers on its own
 * time, a few minutes for most lessons; it is asked again until every
 * language asked for is there (and told by its announcement too,
 * app/api/stream/hook), and each language is listed for the lesson as it
 * arrives. What has not arrived after GIVE_UP_HOURS is refunded.
 *
 *   nl:stream:auto:<video>   what is being written, and the charge for it
 *   nl:stream:autoq          which videos to ask about, and when
 */
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { askStream, noteCaptionLanguages, streamCaptions, streamConfig, streamRecord } from "@/lib/stream";
import { readStreamPath, STREAM_ID_PATTERN } from "@/lib/stream-rules";
import { captionLabel } from "@/lib/captions";
import { chargeNow, isBillingConfigured, refundCharge } from "@/lib/billing";
import type { Store } from "@/lib/store";
import { GIVE_UP_HOURS, MAX_AUTO_MINUTES, autoCaptionCents, chargedMinutes, readAutoAsk } from "@/lib/auto-captions-rules";

const pendingKey = (id: string) => `nl:stream:auto:${id}`;
const QUEUE = "nl:stream:autoq";
const KEEP_SECONDS = 7 * 86_400;
const LOOK_FIRST_MS = 3 * 60_000;
const LOOK_AGAIN_MS = 10 * 60_000;

type Pending = {
  /** The languages asked for, the one spoken first. */
  langs: string[];
  /** Those the service has delivered. */
  got: string[];
  /** When it was asked, in ms. */
  at: number;
  cents: number;
  /** The payment it was charged with, for a refund. */
  pi: string;
  path: string;
};

function parsePending(raw: unknown): Pending | null {
  if (typeof raw !== "string" || !raw.startsWith("{")) return null;
  try {
    const value = JSON.parse(raw) as Partial<Pending>;
    if (!Array.isArray(value.langs) || typeof value.at !== "number" || typeof value.cents !== "number" || typeof value.pi !== "string" || typeof value.path !== "string") return null;
    return {
      langs: value.langs.filter((l): l is string => typeof l === "string"),
      got: Array.isArray(value.got) ? value.got.filter((l): l is string => typeof l === "string") : [],
      at: value.at,
      cents: value.cents,
      pi: value.pi,
      path: value.path,
    };
  } catch {
    return null;
  }
}

export type AutoAnswer =
  | { ok: true; writing: string[]; cents: number }
  | { ok: false; reason: "off" | "unknown" | "not_ready" | "language" | "long" | "busy" | "plan" | "card" | "declined" | "unavailable" };

/** What captions for this video cost, by how many languages: its length as charged. Null when it cannot have them yet. */
export async function autoQuote(pathname: string): Promise<{ minutes: number; seconds: number } | null> {
  const record = await streamRecord(pathname);
  if (!record || record.state !== "ready" || !record.seconds) return null;
  return { minutes: chargedMinutes(record.seconds), seconds: record.seconds };
}

/**
 * Charges for captions in the languages asked, and asks the service to write
 * them. Nothing is charged unless all of it can be asked for; a request the
 * service refuses is refunded at once.
 */
export async function requestAutoCaptions(store: Store, pathname: string, spoken: unknown, also: unknown, now = Date.now()): Promise<AutoAnswer> {
  if (!streamConfig() || !isRedisConfigured() || !isBillingConfigured()) return { ok: false, reason: "off" };
  const record = await streamRecord(pathname);
  if (!record) return { ok: false, reason: "unknown" };
  if (record.state !== "ready" || !record.seconds) return { ok: false, reason: "not_ready" };
  const minutes = chargedMinutes(record.seconds);
  if (minutes > MAX_AUTO_MINUTES) return { ok: false, reason: "long" };
  const already = ((await streamCaptions([pathname]))[pathname] ?? []).map((t) => t.lang);
  const asked = readAutoAsk(spoken, also, already);
  // A language it already has captions in is the creator's to replace by hand.
  if (!asked || asked.languages.some((lang) => already.includes(lang))) return { ok: false, reason: "language" };
  if (!store.subscriptionActive || !store.subscriptionId || !store.stripeCustomerId) return { ok: false, reason: "plan" };

  const key = pendingKey(record.id);
  const receipt = await redisPipeline([["SET", key, "charging", "NX", "EX", 300]]);
  // An uncertain claim must not authorize a charge or remove another request.
  if (!Array.isArray(receipt) || receipt.length !== 1) return { ok: false, reason: "unavailable" };
  if (receipt[0] === null) return { ok: false, reason: "busy" };
  if (receipt[0] !== "OK") return { ok: false, reason: "unavailable" };

  const cents = autoCaptionCents(record.seconds, asked.languages.length);
  const names = asked.languages.map((lang) => captionLabel(lang) ?? lang).join(", ");
  const sign = `captions:${record.id}:${now}`;
  const charged = await chargeNow({
    customerId: store.stripeCustomerId,
    subscriptionId: store.subscriptionId,
    cents,
    description: `AI captions for "${record.name}" (${minutes} min) in ${names}`,
    mark: sign,
    idempotencyKey: `nl-${sign}`,
  });
  if (!charged.ok) {
    await redisPipeline([["DEL", key]]);
    return { ok: false, reason: charged.reason === "error" ? "unavailable" : charged.reason };
  }

  const answer = await askStream("POST", `/videos/${record.id}/transcribe?force=true`, {
    sourceLanguage: asked.spoken,
    targetLanguages: asked.languages,
    generateTitle: false,
    generateDescription: false,
    generateChapters: false,
    generateMoments: false,
  });
  const success = (answer.data as { success?: unknown } | null)?.success;
  if (answer.status !== 200 || success === false) {
    console.error("the video service would not write captions", answer.status, answer.data);
    await refundCharge(charged.paymentIntent, null, `nl-${sign}:refund`);
    await redisPipeline([["DEL", key]]);
    return { ok: false, reason: "unavailable" };
  }
  const pending: Pending = { langs: asked.languages, got: [], at: now, cents, pi: charged.paymentIntent, path: pathname };
  await redisPipeline([
    ["SET", key, JSON.stringify(pending), "EX", KEEP_SECONDS],
    ["ZADD", QUEUE, now + LOOK_FIRST_MS, record.id],
  ]);
  return { ok: true, writing: asked.languages, cents };
}

/** The languages the service lists captions in, from its answer about a video. */
function deliveredIn(data: unknown): string[] {
  const list = (data as { captions?: unknown } | null)?.captions;
  if (!Array.isArray(list)) return [];
  return list.flatMap((c) => {
    const lang = (c as { srclang?: unknown } | null)?.srclang;
    return typeof lang === "string" ? [lang.toLowerCase().slice(0, 2)] : [];
  });
}

/**
 * Asks the service what it has written for one video, lists each language as
 * it arrives, and settles the request once it is all there, or refunds what
 * is not after GIVE_UP_HOURS.
 */
export async function syncAutoCaptions(id: string, now = Date.now()): Promise<"done" | "waiting" | "none"> {
  if (!STREAM_ID_PATTERN.test(id) || !isRedisConfigured()) return "none";
  const key = pendingKey(id);
  const [raw] = await redisPipeline([["GET", key]]);
  const pending = parsePending(raw);
  if (!pending) {
    if (raw !== "charging") await redisPipeline([["ZREM", QUEUE, id]]);
    return "none";
  }
  const answer = await askStream("GET", `/videos/${id}`);
  if (answer.status === 404) {
    // The video is gone, deleted with its lesson: what was not written is given back.
    await settle(id, pending, pending.got);
    return "done";
  }
  if (answer.status !== 200) {
    await redisPipeline([["ZADD", QUEUE, now + LOOK_AGAIN_MS, id]]);
    return "waiting";
  }
  const there = deliveredIn(answer.data);
  const got = pending.langs.filter((lang) => there.includes(lang));
  const fresh = got.filter((lang) => !pending.got.includes(lang));
  if (fresh.length) await noteCaptionLanguages(id, fresh);
  if (got.length === pending.langs.length || now - pending.at > GIVE_UP_HOURS * 3_600_000) {
    await settle(id, pending, got);
    return "done";
  }
  await redisPipeline([
    ["SET", key, JSON.stringify({ ...pending, got }), "EX", KEEP_SECONDS],
    ["ZADD", QUEUE, now + LOOK_AGAIN_MS, id],
  ]);
  return "waiting";
}

/** The request is over: a refund for each language that never came, and nothing kept. */
async function settle(id: string, pending: Pending, got: string[]): Promise<void> {
  const missing = pending.langs.length - got.length;
  if (missing > 0) {
    const cents = got.length === 0 ? null : Math.floor((pending.cents * missing) / pending.langs.length);
    if (cents === null || cents > 0) await refundCharge(pending.pi, cents, `nl-captions:${id}:${pending.at}:refund`);
  }
  await redisPipeline([["DEL", pendingKey(id)], ["ZREM", QUEUE, id]]);
}

/** The five-minute job's part: every video whose captions are due a look, until `deadline`. */
export async function sweepAutoCaptions(deadline: number, now = Date.now()): Promise<{ looked: number; done: number }> {
  const counts = { looked: 0, done: 0 };
  if (!isRedisConfigured() || !streamConfig()) return counts;
  const [due] = await redisPipeline([["ZRANGEBYSCORE", QUEUE, 0, now, "LIMIT", 0, 30]]);
  for (const id of Array.isArray(due) ? due : []) {
    if (Date.now() > deadline || typeof id !== "string") break;
    counts.looked += 1;
    if ((await syncAutoCaptions(id, now)) === "done") counts.done += 1;
  }
  return counts;
}

/** The languages still being written for each of these videos, by path. Videos with none are left out. */
export async function autoWriting(pathnames: string[]): Promise<Record<string, string[]>> {
  const wanted = pathnames.flatMap((path) => {
    const parts = readStreamPath(path);
    return parts ? [{ path, id: parts.id }] : [];
  });
  if (!wanted.length || !isRedisConfigured()) return {};
  const rows = await redisPipeline(wanted.map(({ id }) => ["GET", pendingKey(id)]));
  const out: Record<string, string[]> = {};
  wanted.forEach(({ path }, i) => {
    const pending = parsePending(rows[i]);
    const left = pending ? pending.langs.filter((lang) => !pending.got.includes(lang)) : [];
    if (left.length) out[path] = left;
  });
  return out;
}
