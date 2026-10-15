/**
 * Emails written and kept for later, before anyone sends them.
 *
 * A draft is what someone on a store's team who writes but does not send (an
 * Editor, lib/team-roles.ts) hands over: the subject, the text and who it is
 * meant for. The owner or an Admin opens it in the studio's email page, reads
 * it, and sends or schedules it themselves; sending takes the draft away.
 * Nothing in a draft ever reaches the list on its own.
 *
 *   nl:mail:drafts:<listId>   the store's drafts, one field each (a hash)
 *
 * Twenty at most per store, each as long as an email may be. Kept under the
 * store's list, like its broadcasts, so a new address or a new owner address
 * moves nothing.
 */
import { randomBytes } from "node:crypto";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { MAX_MAIL_BODY, MAX_SUBJECT } from "@/lib/mail";
import type { Store } from "@/lib/store";
import { hasProduct } from "@/lib/catalog";

/** A write may have happened even when its acknowledgement is lost. */
export class DraftWriteUnconfirmed extends Error {
  constructor() { super("Draft write could not be confirmed"); this.name = "DraftWriteUnconfirmed"; }
}

export const MAX_DRAFTS = 20;
export const DRAFT_ID = /^[0-9a-f]{16}$/;

export type Draft = {
  id: string;
  subject: string;
  body: string;
  /** Everyone who may be written to, or only those who got one product. */
  productId: string | null;
  /** Who last saved it: their sign-in address. */
  by: string;
  /** ISO time it was last saved. */
  savedAt: string;
};

const draftsKey = (listId: string) => `nl:mail:drafts:${listId}`;

function parse(raw: unknown): Draft | null {
  if (typeof raw !== "string") return null;
  try {
    const value = JSON.parse(raw) as Partial<Draft>;
    if (typeof value.id !== "string" || !DRAFT_ID.test(value.id)) return null;
    return {
      id: value.id,
      subject: typeof value.subject === "string" ? value.subject.slice(0, MAX_SUBJECT) : "",
      body: typeof value.body === "string" ? value.body.slice(0, MAX_MAIL_BODY) : "",
      productId: typeof value.productId === "string" && value.productId ? value.productId : null,
      by: typeof value.by === "string" ? value.by : "",
      savedAt: typeof value.savedAt === "string" ? value.savedAt : "",
    };
  } catch {
    return null;
  }
}

/** A store's drafts, the most recently saved first. */
export async function listDrafts(listId: string | null): Promise<Draft[]> {
  if (!listId || !isRedisConfigured()) return [];
  const [flat] = await redisPipeline([["HGETALL", draftsKey(listId)]]);
  const values = Array.isArray(flat) ? flat.filter((_, i) => i % 2 === 1) : [];
  return values
    .map(parse)
    .filter((d): d is Draft => d !== null)
    .sort((a, b) => b.savedAt.localeCompare(a.savedAt));
}

export type DraftResult =
  | { ok: true; draft: Draft }
  | { ok: false; reason: "subject" | "body" | "product" | "full" | "unknown" | "list" };

/**
 * Saves a draft: a new one without `id`, or over the one with it. The text is
 * trimmed to what an email may hold, and the product it is meant for has to
 * be one this store has.
 */
export async function saveDraft(
  store: Store,
  who: string,
  input: { id?: string; subject: string; body: string; productId: string },
): Promise<DraftResult> {
  if (!store.listId) return { ok: false, reason: "list" };
  const subject = input.subject.replace(/\s+/g, " ").trim().slice(0, MAX_SUBJECT);
  const body = input.body.trim().slice(0, MAX_MAIL_BODY);
  if (!subject) return { ok: false, reason: "subject" };
  if (!body) return { ok: false, reason: "body" };
  const productId = input.productId || null;
  if (productId && !hasProduct(store, productId)) return { ok: false, reason: "product" };

  const key = draftsKey(store.listId);
  let id = input.id ?? "";
  if (id) {
    if (!DRAFT_ID.test(id)) return { ok: false, reason: "unknown" };
    const [exists] = await redisPipeline([["HEXISTS", key, id]]);
    if (Number(exists) !== 1) return { ok: false, reason: "unknown" };
  } else {
    const [count] = await redisPipeline([["HLEN", key]]);
    if (Number(count) >= MAX_DRAFTS) return { ok: false, reason: "full" };
    id = randomBytes(8).toString("hex");
  }
  const draft: Draft = { id, subject, body, productId, by: who.toLowerCase(), savedAt: new Date().toISOString() };
  let acknowledgement: unknown;
  try {
    acknowledgement = await redisPipeline([["HSET", key, id, JSON.stringify(draft)]]);
  } catch {
    throw new DraftWriteUnconfirmed();
  }
  if (!Array.isArray(acknowledgement) || acknowledgement.length !== 1 || (acknowledgement[0] !== 0 && acknowledgement[0] !== 1)) throw new DraftWriteUnconfirmed();
  return { ok: true, draft };
}

/** Throws a draft away. True when there was one to throw away. */
export async function removeDraft(store: Store, id: string): Promise<boolean> {
  if (!store.listId || !DRAFT_ID.test(id)) return false;
  const [removed] = await redisPipeline([["HDEL", draftsKey(store.listId), id]]);
  return Number(removed) === 1;
}
