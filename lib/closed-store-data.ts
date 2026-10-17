/**
 * A closed store's records in the database, deleted (added 18 October 2026).
 *
 * A store whose plan ended closes on its closing day (lib/plan-closing.ts):
 * its files that day, and, once its tax records are written
 * (lib/closing-archive.ts), every record it keeps here, so a store that pays
 * nothing stops costing anything. Before this, a closed store's records
 * stayed for ever, a little each month with no payment behind it, and
 * closed stores only ever add up.
 *
 * What goes, and what is kept, is said family by family in CLOSING
 * (lib/data-families.ts), and tests/closing-families.test.ts fails for a
 * family of tests/store-data-registry.ts that does not say. In order:
 *
 *   1. prepare: what is found only through the store's own record, while it
 *      can still be read (its team, its keys for the API, its webhooks, its
 *      email platform, its phones, its calendar hosts' claims, its PDFs'
 *      previews, and what each sale of the last fifteen months left under the
 *      sale's own reference, read back from its tax records); then the store
 *      record itself, its addresses held back from anyone else for a month.
 *      From then on no page, checkout or job finds the store, so nothing new
 *      is written for it.
 *   2. the walk: the whole database, a page at a time. A key of a family
 *      CLOSING says is erased, named by one of the store's own ids, is
 *      deleted, and what the family's follower finds through it first (the
 *      stop links its contacts were sent, the certificates its courses gave,
 *      its buyers' place in their library across stores...). A list of the
 *      company's that names stores loses this store's members. Nothing else
 *      is touched: a key that names no closing store is passed over, and a
 *      person's records across stores lose only this store's part.
 *   3. finish: the closing record says when, and its owner is emailed.
 *
 * Stores are deleted together: those that came due since the last walk
 * share the next one, so the database is read once a day at the most,
 * whatever number closes. Each step can be run again; the walk is resumable
 * from where it stopped, page by page, and a key already gone is passed over.
 *
 *   nl:closed:due     sorted set  a store's key -> when its records came due (ms)
 *   nl:closed:batch   hash        a store's key -> what the walk needs of it (JSON), while its walk runs
 *   nl:closed:walk    hash        cursor, started, finished
 *
 * What the walk costs is the company's, bounded by its schedule: one walk a
 * day at the most, WALK_COUNT keys a command (docs/funded-exposure-review.md).
 */
import { onAccount } from "@/lib/stripe-account";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { CLOSING, type Closing, closingFamilyOf } from "@/lib/data-families";
import { idsIn } from "@/lib/data-recount";
import { readAllListings } from "@/lib/catalog";
import { readCourses } from "@/lib/course";
import { readFlows } from "@/lib/flows";
import { type Store, accountStores, closeStoreRecord, saleHandles, storeFolder, storeForEmail, storeRef } from "@/lib/store";
import { domainKey } from "@/lib/domains";
import { dropTeam, memberStores, readTeam } from "@/lib/team";
import { hostCalendarKeys } from "@/lib/host-calendar";
import { revokeAllKeys } from "@/lib/api-keys";
import { forgetStoreWebhooks } from "@/lib/webhooks";
import { forgetStoreSync } from "@/lib/email-sync";
import { forgetStorePhones } from "@/lib/phone-alerts";
import { claimsKey, hostId } from "@/lib/host-claims";
import { MAX_PREVIEW_PAGES, previewKey } from "@/lib/pdf-preview";
import { copyKey, problemKey } from "@/lib/pdf-stamp";
import { giftKeys } from "@/lib/gifts";
import { groupKeys } from "@/lib/group-buy";
import { piKey as preorderPiKey } from "@/lib/preorders";
import { subKey as adsSubKey } from "@/lib/ad-events";
import { movedKey } from "@/lib/call-records";
import { confirmedKey } from "@/lib/calls";
import { doneKey as shippedKey } from "@/lib/shipments";
import { tokenKey as unsubTokenKey, parseContact } from "@/lib/contacts";
import { keyIndex as linkKeyIndex, linkKeyOf } from "@/lib/mail-clicks";
import { forgetLibraryPerson } from "@/lib/buyer-library";
import { unsubKey as communityUnsubKey } from "@/lib/community-mail";
import { tokenKey as chatTokenKey } from "@/lib/inbox";
import { linkKey as inviteLinkKey } from "@/lib/move-members";
import { linkKey as pitchStopKey } from "@/lib/outreach";
import { tokenKey as feedTokenKey } from "@/lib/podcast-access";
import { certKey } from "@/lib/certificate";
import { linkKey as shortLinkKey } from "@/lib/short-links";
import { lookupKey as shareLookupKey } from "@/lib/funnel-share-store";
import { broadcastKeys } from "@/lib/broadcasts";
import { paypalOrderKeys } from "@/lib/paypal-sales";
import { calendarKeys } from "@/lib/calendar-sync";
import { packageKeys } from "@/lib/call-packages";
import { emailsKey as affiliateEmailsKey } from "@/lib/affiliates";
import { forgetAffiliateStore } from "@/lib/affiliate-hub";
import { passKeyOfHash } from "@/lib/learn";
import { type RecordHands, R2_RECORDS, readMonths, recentMonths } from "@/lib/closing-archive";

export const DUE_KEY = "nl:closed:due";
export const BATCH_KEY = "nl:closed:batch";
export const WALK_KEY = "nl:closed:walk";
/** Keys one SCAN of the walk asks for. */
export const WALK_COUNT = 1000;
/** The most pages of the database one run of the walk reads. */
export const WALK_PAGES_PER_RUN = 3_000;
/** A walk starts at most this often; stores that come due in between wait for the next. */
export const WALK_GAP_MS = 20 * 60 * 60 * 1000;
/** The most stores one walk deletes. */
export const BATCH_MAX = 200;

/** What the walk needs of a store, kept while its walk runs (the store record itself is gone by then). */
export type Batched = {
  ref: string;
  email: string;
  sid: string;
  statsId: string | null;
  name: string;
  handle: string;
  handles: string[];
  /** Every id the store's own keys are named by. */
  marks: string[];
  endedAt: number;
  at: number;
};

/** Every file-like record in what a store keeps: a path and the day it was added. */
function filesIn(value: unknown, out: { pathname: string; addedAt: string }[] = [], depth = 0): { pathname: string; addedAt: string }[] {
  if (!value || typeof value !== "object" || depth > 12) return out;
  if (Array.isArray(value)) {
    for (const item of value) filesIn(item, out, depth + 1);
    return out;
  }
  const row = value as Record<string, unknown>;
  if (typeof row.pathname === "string" && typeof row.addedAt === "string") out.push({ pathname: row.pathname, addedAt: row.addedAt });
  for (const item of Object.values(row)) if (item && typeof item === "object") filesIn(item, out, depth + 1);
  return out;
}

/**
 * The ids a store's own keys are named by: its own (store, stats, list,
 * calls, catalog, community, files' folder), and every id in what it is
 * made of (its products, sequences and courses: their ids, their videos,
 * their links). Its Stripe account's id only when no other store of its
 * owner sells through the same account. Never its plan's ids on our own
 * Stripe account, which name the company's records about its plan.
 */
export async function marksOf(store: Store): Promise<{ marks: string[]; files: { pathname: string; addedAt: string }[] }> {
  const listings = await readAllListings(store).catch(() => []);
  const flows = store.listId ? await readFlows(store.listId).catch(() => []) : [];
  const courseIds = listings.flatMap((l) => (l.course ? [l.course.id] : []));
  const courses = courseIds.length ? [...(await readCourses(courseIds).catch(() => new Map())).values()] : [];
  const own = [store.sid, store.statsId, store.listId, store.callsId, store.catalog?.id, store.community?.id, await storeFolder(storeRef(store)), store.photoId];
  const found = new Set<string>([...own.filter((id): id is string => typeof id === "string" && id.length >= 6), ...idsIn(JSON.stringify(store), JSON.stringify(listings), JSON.stringify(flows), JSON.stringify(courses))]);
  for (const id of [...courseIds, ...listings.flatMap((l) => (l.podcast ? [l.podcast.id] : [])), ...flows.map((f) => f.id)]) if (id) found.add(id);
  for (const ours of [store.stripeCustomerId, store.subscriptionId]) if (ours) found.delete(ours);
  if (store.stripeAccountId && (await sharedAccount(store))) found.delete(store.stripeAccountId);
  // The owner's address and the store's addresses are not ids: the walk matches them only where a family says so.
  found.delete(store.email);
  return { marks: [...found].sort(), files: filesIn([listings, courses]) };
}

/** Whether another store of the same owner sells through the same Stripe account: then its account's records are not this store's to delete. */
async function sharedAccount(store: Store): Promise<boolean> {
  const others = await accountStores(store.email).catch(() => null);
  if (!others) return true;
  return others.some((other) => other.sid !== store.sid && other.stripeAccountId === store.stripeAccountId);
}

/** Puts a store in line for the next walk. */
export async function markDue(ref: string, now = Date.now()): Promise<void> {
  await redisPipeline([["ZADD", DUE_KEY, "NX", now, ref]]);
}

/** Takes a store out of line: its plan was started again before its walk began. */
export async function unmarkDue(ref: string): Promise<void> {
  await redisPipeline([["ZREM", DUE_KEY, ref]]);
}

/**
 * What each sale of the store's last fifteen months left here under its own
 * reference, not the store's: a gift's and a group purchase's records, a
 * pre-order's payment, a membership's ad cookies, a shipment's link, a
 * call's moves and confirmation, a PayPal order, a buyer's stamped copy.
 * Found from the store's tax records, which hold every reference.
 */
export async function referencedKeys(store: Store, files: { pathname: string; addedAt: string }[], now: number, hands: RecordHands = R2_RECORDS): Promise<string[]> {
  const lines = hands.ready() ? await readMonths(store, recentMonths(now), hands) : [];
  const keys = new Set<string>();
  const pdfs = files.filter((f) => /\.pdf$/i.test(f.pathname));
  for (const line of lines) {
    const refs = [line.id, line.pi].filter((r): r is string => Boolean(r));
    for (const key of giftKeys(line.g ?? "", line.pi ?? "")) keys.add(key);
    for (const key of groupKeys(line.gr ?? "", line.pi ?? "")) keys.add(key);
    if (line.pi) keys.add(preorderPiKey(line.pi));
    if (line.sub) keys.add(adsSubKey(line.sub));
    if (line.k === "p") for (const key of paypalOrderKeys(line.id)) keys.add(key);
    else {
      keys.add(shippedKey(line.id));
      keys.add(movedKey(line.id));
      keys.add(confirmedKey(line.id));
    }
    for (const ref of refs) for (const file of pdfs) keys.add(copyKey(ref, file));
  }
  return [...keys];
}

/**
 * On a closing store's day, before its files go (lib/plan-closing.ts): what
 * its files and each of its sales left here under their own names, not the
 * store's, which only its products' files and its tax records can find: its
 * PDFs' previews and problem notes, and, for each sale of the last fifteen
 * months, a gift's or a group purchase's records, a pre-order's payment, a
 * membership's ad cookies, a shipment's link, a call's moves and
 * confirmation, a PayPal order and a buyer's stamped copies. Safe to run
 * again. Answers how many keys it deleted.
 */
export async function deleteSalesTraces(store: Store, now = Date.now(), hands: RecordHands = R2_RECORDS): Promise<number> {
  const { files } = await marksOf(store);
  const keys: string[] = [];
  for (const file of files.filter((f) => /\.pdf$/i.test(f.pathname))) {
    for (let pages = 1; pages <= MAX_PREVIEW_PAGES; pages += 1) keys.push(previewKey(file, pages));
    keys.push(problemKey(file.pathname));
  }
  keys.push(...(await referencedKeys(store, files, now, hands)));
  await del(keys);
  return keys.length;
}

async function del(keys: string[]): Promise<void> {
  for (let i = 0; i < keys.length; i += 200) await redisPipeline([["DEL", ...keys.slice(i, i + 200)]]);
}

/**
 * The first step for one store, while its record can still be read: what
 * is found only through it, and then the record. Answers what the walk
 * needs of it. Safe to run again.
 */
export async function prepareStore(store: Store, now = Date.now()): Promise<Batched> {
  const ref = storeRef(store);
  const { marks } = await marksOf(store);
  const extra: string[] = [];
  // Its calendar hosts' claims, which are kept by the host, across the stores they serve.
  const team = store.sid ? await readTeam(store.sid).catch(() => ({ members: [], invites: [] })) : { members: [], invites: [] };
  const own = new Set(marks);
  for (const host of [store.email, ...team.members.map((m) => m.email)].map(hostId)) {
    let cursor = "0";
    for (let round = 0; round < 50; round += 1) {
      const [reply] = await redisPipeline([["HSCAN", claimsKey(host), cursor, "COUNT", 500]]);
      const [next, flat] = Array.isArray(reply) ? [String(reply[0]), (reply[1] as unknown[]).map(String)] : ["0", []];
      const mine: string[] = [];
      for (let i = 0; i + 1 < flat.length; i += 2) if (pieces(flat[i + 1]).some((part) => own.has(part))) mine.push(flat[i]);
      if (mine.length) await redisPipeline([["HDEL", claimsKey(host), ...mine]]);
      cursor = next;
      if (cursor === "0") break;
    }
  }
  // A host's own calendar is the host's, across the stores they serve: it goes with the last of them.
  for (const email of [store.email, ...team.members.map((m) => m.email)]) {
    const elsewhere = (await memberStores(email).catch(() => [{ store }])).some((m) => m.store.sid !== store.sid)
      || (await accountStores(email).catch(() => [store])).some((other) => other.sid !== store.sid);
    if (!elsewhere) extra.push(...hostCalendarKeys(hostId(email)));
  }
  await dropTeam(store);
  if (store.sid) await revokeAllKeys(store.sid);
  await forgetStoreWebhooks(store.statsId);
  await forgetStoreSync(store.statsId);
  await forgetStorePhones(store.statsId);
  if (store.domain?.name) extra.push(domainKey(store.domain.name));
  await del(extra);
  await closeStoreRecord(store);
  return {
    ref,
    email: store.email,
    sid: store.sid,
    statsId: store.statsId,
    name: store.name,
    handle: store.handle,
    handles: [...saleHandles(store)],
    marks,
    endedAt: Date.parse(store.planEndedAt) || now,
    at: now,
  };
}

/** Who owns a key: the closing store one of whose ids names it. */
type Owners = { byMark: Map<string, string>; byHandle: Map<string, string>; byRef: Map<string, string> };

function ownersOf(batch: Batched[]): Owners {
  const owners: Owners = { byMark: new Map(), byHandle: new Map(), byRef: new Map() };
  for (const entry of batch) {
    for (const mark of entry.marks) owners.byMark.set(mark, entry.ref);
    for (const handle of entry.handles) owners.byHandle.set(handle, entry.ref);
    owners.byRef.set(entry.ref, entry.ref);
  }
  return owners;
}

const pieces = (text: string) => text.split(/[:|,]/);

/** The closing store a key belongs to, if any: by an id in its name, or, for a family named by address, by an address. */
export function ownerOfKey(key: string, rule: Closing, owners: Owners): string | null {
  const parts = pieces(key);
  if (rule.how === "erase" && rule.by === "handle") {
    for (const part of parts) if (owners.byHandle.has(part)) return owners.byHandle.get(part)!;
    return null;
  }
  for (const part of parts) {
    if (owners.byMark.has(part)) return owners.byMark.get(part)!;
    if (owners.byRef.has(part)) return owners.byRef.get(part)!;
  }
  return null;
}

/** Whether a member of a company list names a closing store. */
function namesStore(member: string, owners: Owners): boolean {
  if (owners.byRef.has(member)) return true;
  return pieces(member).some((part) => owners.byMark.has(part) || owners.byRef.has(part));
}

/**
 * What a key of the store leads to that is named by a token, not by the
 * store, read from the key itself: each family's own record of it. The
 * keys found must be of a family whose rule names this one (`via`), or they
 * are not deleted.
 */
type Follower = { match: (key: string) => boolean; find: (key: string, entry: Batched) => Promise<string[]> };

async function scanAll(command: "HSCAN" | "SSCAN" | "ZSCAN", key: string, each: (flat: string[]) => Promise<void> | void): Promise<void> {
  let cursor = "0";
  for (let round = 0; round < 10_000; round += 1) {
    const [reply] = await redisPipeline([[command, key, cursor, "COUNT", 1000]]);
    if (!Array.isArray(reply) || reply.length < 2) return;
    cursor = String(reply[0]);
    await each(Array.isArray(reply[1]) ? (reply[1] as unknown[]).map(String) : []);
    if (cursor === "0") return;
  }
}

const json = (raw: string): Record<string, unknown> | null => {
  try {
    const value = JSON.parse(raw) as unknown;
    return value && typeof value === "object" ? (value as Record<string, unknown>) : null;
  } catch {
    return null;
  }
};
const fieldOf = (raw: string, name: string): string => {
  const value = json(raw)?.[name];
  return typeof value === "string" ? value : "";
};
async function typeOf(key: string): Promise<string> {
  const [raw] = await redisPipeline([["TYPE", key]]);
  return typeof raw === "string" ? raw : String((raw as { ok?: string } | null)?.ok ?? "none");
}
async function membersOf(key: string): Promise<string[]> {
  const type = await typeOf(key);
  const out: string[] = [];
  if (type === "set") await scanAll("SSCAN", key, (flat) => void out.push(...flat));
  else if (type === "zset") await scanAll("ZSCAN", key, (flat) => void out.push(...flat.filter((_, i) => i % 2 === 0)));
  else if (type === "list") {
    const [items] = await redisPipeline([["LRANGE", key, 0, 9_999]]);
    if (Array.isArray(items)) out.push(...items.map(String));
  } else if (type === "hash") await scanAll("HSCAN", key, (flat) => void out.push(...flat.filter((_, i) => i % 2 === 0)));
  return out;
}
/** A string key's value; "" for a key of another kind, which no follower reads as one. */
async function stringOf(key: string): Promise<string> {
  if ((await typeOf(key)) !== "string") return "";
  const [raw] = await redisPipeline([["GET", key]]);
  return typeof raw === "string" ? raw : "";
}
async function hashValues(key: string): Promise<[string, string][]> {
  const out: [string, string][] = [];
  if ((await typeOf(key)) !== "hash") return out;
  await scanAll("HSCAN", key, (flat) => {
    for (let i = 0; i + 1 < flat.length; i += 2) out.push([flat[i], flat[i + 1]]);
  });
  return out;
}

export const FOLLOWERS: Readonly<Record<string, Follower>> = {
  // The list: each contact's stop link and the key its links carry, and, across stores, their library of this store.
  "nl:store:leads:": {
    match: (key) => /^nl:store:leads:[0-9a-f]{32}$/.test(key),
    find: async (key, entry) => {
      const out: string[] = [];
      for (const [email, raw] of await hashValues(key)) {
        const token = parseContact(raw)?.t;
        if (token) out.push(unsubTokenKey(token), linkKeyIndex(linkKeyOf(token)));
        if (entry.sid) await forgetLibraryPerson(entry.sid, email);
      }
      return out;
    },
  },
  // A community's members: the link in their announcements that stops them.
  "nl:cm:": {
    match: (key) => /^nl:cm:[^:]+:m$/.test(key),
    find: async (key) => (await hashValues(key)).map(([, raw]) => fieldOf(raw, "t")).filter(Boolean).map(communityUnsubKey),
  },
  // A conversation in the inbox: what its visitor's chat opens.
  "nl:inbox:": {
    match: (key) => /^nl:inbox:[^:]+:c:[^:]+$/.test(key),
    find: async (key) => {
      const token = fieldOf(await stringOf(key), "token");
      return token ? [chatTokenKey(token)] : [];
    },
  },
  // Members invited over from another platform: each invite's link.
  "nl:mv:": {
    match: (key) => /^nl:mv:[^:]+$/.test(key),
    find: async (key) => (await hashValues(key)).map(([, raw]) => fieldOf(raw, "t")).filter(Boolean).map(inviteLinkKey),
  },
  // Pitches: the stop link in each one's footer.
  "nl:outreach:": {
    match: (key) => /^nl:outreach:[^:]+:pitches$/.test(key),
    find: async (key) => (await hashValues(key)).map(([, raw]) => fieldOf(raw, "stop")).filter(Boolean).map(pitchStopKey),
  },
  // A listener's private feed: the token it opens by.
  "nl:pod:by:": {
    match: () => true,
    find: async (key) => {
      const token = await stringOf(key);
      return token ? [feedTokenKey(token)] : [];
    },
  },
  // The records made for one address: every link the store emailed them.
  "nl:erase:ix:": {
    match: () => true,
    find: async (key) => (await membersOf(key)).filter((k) => k.startsWith("nl:")),
  },
  // A course's certificates, kept by their own id.
  "nl:course:": {
    match: (key) => /:certs:all$/.test(key),
    find: async (key) => (await membersOf(key)).filter((id) => /^[A-Za-z0-9_-]{6,64}$/.test(id)).map(certKey),
  },
  "nl:slink:store:": {
    match: () => true,
    find: async (key) => (await membersOf(key)).filter((code) => /^[A-Za-z0-9_-]{1,64}$/.test(code)).map(shortLinkKey),
  },
  "nl:fshares:": {
    match: () => true,
    find: async (key) => (await hashValues(key)).map(([, raw]) => fieldOf(raw, "hash")).filter((h) => /^[0-9a-f]{16,64}$/.test(h)).map(shareLookupKey),
  },
  "nl:mail:bcs:": {
    match: () => true,
    find: async (key) => (await membersOf(key)).filter((id) => /^[A-Za-z0-9_-]{6,64}$/.test(id)).flatMap(broadcastKeys),
  },
  "nl:ppsell:sales:": {
    match: () => true,
    find: async (key) => (await membersOf(key)).flatMap(paypalOrderKeys),
  },
  "nl:cal:cfg:": {
    match: () => true,
    find: async (key) => {
      const raw = await stringOf(key);
      return raw ? calendarKeys(json(raw)) : [];
    },
  },
  "nl:learn:passes:": {
    match: () => true,
    find: async (key) => (await membersOf(key)).filter((h) => /^[0-9a-f]{64}$/.test(h)).map(passKeyOfHash),
  },
  "nl:pkg:s:": {
    match: () => true,
    find: async (key) => {
      const out: string[] = [];
      for (const checkout of await membersOf(key)) out.push(...packageKeys(checkout, fieldOf(await stringOf(packageKeys(checkout, "")[0]), "token")));
      return out;
    },
  },
  // Its affiliates: across stores, the hub of their programs loses this one.
  "nl:aff:": {
    match: (key) => /:emails$/.test(key),
    find: async (key, entry) => {
      if (key !== affiliateEmailsKey(entry.statsId ?? "")) return [];
      for (const email of await membersOf(key)) await forgetAffiliateStore(entry.sid, email);
      return [];
    },
  },
};

/** Whether a key found by a follower of `family` is one it may delete: of a family whose rule names `family`. */
export function followable(found: string, family: string): boolean {
  const rule = CLOSING[closingFamilyOf(found)];
  return Boolean(rule && rule.how === "token" && rule.via === family);
}

/** Takes a closing store's members out of one of the company's lists. */
async function pruneIndex(key: string, owners: Owners): Promise<number> {
  const type = await typeOf(key);
  const gone: string[] = [];
  if (type === "set") await scanAll("SSCAN", key, (flat) => void gone.push(...flat.filter((m) => namesStore(m, owners))));
  else if (type === "zset") await scanAll("ZSCAN", key, (flat) => void gone.push(...flat.filter((m, i) => i % 2 === 0 && namesStore(m, owners))));
  else if (type === "hash") await scanAll("HSCAN", key, (flat) => void gone.push(...flat.filter((m, i) => i % 2 === 0 && namesStore(m, owners))));
  else return 0;
  for (let i = 0; i < gone.length; i += 200) {
    const some = gone.slice(i, i + 200);
    await redisPipeline([[type === "set" ? "SREM" : type === "zset" ? "ZREM" : "HDEL", key, ...some]]);
  }
  return gone.length;
}

export type WalkReport = { started: boolean; stores: number; pages: number; deleted: number; pruned: number; finished: number; done: boolean };

/**
 * One page of the walk: deletes what belongs to the closing stores, and
 * takes them out of the company's lists. Answers how many keys it deleted
 * and took members from.
 */
export async function walkPage(keys: string[], batch: Map<string, Batched>, owners: Owners): Promise<{ deleted: number; pruned: number }> {
  const doomed = new Set<string>();
  let pruned = 0;
  for (const key of keys) {
    const family = closingFamilyOf(key);
    const rule = family ? CLOSING[family] : null;
    if (!rule) continue;
    if (rule.how === "index") {
      pruned += await pruneIndex(key, owners);
      continue;
    }
    if (rule.how !== "erase" && rule.how !== "archive") continue;
    const owner = ownerOfKey(key, rule, owners);
    if (!owner) continue;
    const follower = FOLLOWERS[family];
    if (follower?.match(key)) {
      const entry = batch.get(owner)!;
      for (const found of await follower.find(key, entry)) if (followable(found, family)) doomed.add(found);
    }
    doomed.add(key);
  }
  await del([...doomed]);
  return { deleted: doomed.size, pruned };
}

async function readBatch(): Promise<Map<string, Batched>> {
  const [flat] = await redisPipeline([["HGETALL", BATCH_KEY]]);
  const list = Array.isArray(flat) ? (flat as string[]) : flat && typeof flat === "object" ? Object.entries(flat as Record<string, string>).flat() : [];
  const out = new Map<string, Batched>();
  for (let i = 0; i + 1 < list.length; i += 2) {
    const value = json(String(list[i + 1])) as Batched | null;
    if (value && Array.isArray(value.marks)) out.set(String(list[i]), value);
  }
  return out;
}

/** What the closing job does when a store's records are gone: told by the caller (lib/plan-closing.ts), which writes it down and emails the owner. */
export type Finisher = (entry: Batched, now: number) => Promise<void>;

/**
 * One run: starts a walk when stores are due and none ran in the last
 * WALK_GAP_MS, carries one on to where it stops, and finishes its stores.
 * Bounded by `deadline` and WALK_PAGES_PER_RUN.
 */
export async function eraseClosed(deadline: number, finish: Finisher, now = Date.now()): Promise<WalkReport> {
  const report: WalkReport = { started: false, stores: 0, pages: 0, deleted: 0, pruned: 0, finished: 0, done: false };
  if (!isRedisConfigured()) return report;
  const [rawState] = await redisPipeline([["HMGET", WALK_KEY, "cursor", "started", "phase"]]);
  const [cursorRaw, startedRaw, phaseRaw] = Array.isArray(rawState) ? rawState.map((v) => (typeof v === "string" ? v : "")) : ["", "", ""];
  let phase = phaseRaw || "idle";
  let cursor = cursorRaw || "0";

  if (phase === "idle" || phase === "") {
    const started = Number(startedRaw) || 0;
    if (now - started < WALK_GAP_MS) return { ...report, done: true };
    const [due] = await redisPipeline([["ZRANGEBYSCORE", DUE_KEY, "-inf", now, "LIMIT", 0, BATCH_MAX]]);
    const refs = Array.isArray(due) ? (due as unknown[]).map(String) : [];
    if (!refs.length) return { ...report, done: true };
    for (const ref of refs) {
      if (Date.now() > deadline) break;
      const store = await storeForEmail(ref).catch(() => null);
      if (store) {
        const entry = await prepareStore(store, now);
        await redisPipeline([["HSET", BATCH_KEY, ref, JSON.stringify(entry)]]);
        report.stores += 1;
      }
      await redisPipeline([["ZREM", DUE_KEY, ref]]);
    }
    const [count] = await redisPipeline([["HLEN", BATCH_KEY]]);
    if (!Number(count)) return { ...report, done: true };
    await redisPipeline([["HSET", WALK_KEY, "phase", "walk", "cursor", "0", "started", now]]);
    phase = "walk";
    cursor = "0";
    report.started = true;
  }

  const batch = await readBatch();
  const owners = ownersOf([...batch.values()]);
  while (phase === "walk" && Date.now() < deadline && report.pages < WALK_PAGES_PER_RUN) {
    const [reply] = await redisPipeline([["SCAN", cursor, "MATCH", "nl:*", "COUNT", WALK_COUNT]]);
    if (!Array.isArray(reply) || reply.length < 2) break;
    const next = String(reply[0]);
    const keys = Array.isArray(reply[1]) ? (reply[1] as unknown[]).map(String) : [];
    const done = await walkPage(keys, batch, owners);
    report.deleted += done.deleted;
    report.pruned += done.pruned;
    report.pages += 1;
    cursor = next;
    await redisPipeline([["HSET", WALK_KEY, "cursor", cursor, ...(cursor === "0" ? ["phase", "finish"] : [])]]);
    if (cursor === "0") phase = "finish";
  }

  if (phase === "finish") {
    for (const [ref, entry] of batch) {
      if (Date.now() > deadline) return report;
      await finish(entry, now);
      await redisPipeline([["HDEL", BATCH_KEY, ref]]);
      report.finished += 1;
    }
    await redisPipeline([["HSET", WALK_KEY, "phase", "idle", "cursor", "0", "finished", now]]);
    report.done = true;
  }
  return report;
}

/**
 * Stops the renewals of every membership and payment plan the store sold,
 * on the creator's own Stripe account: once the store is closed nothing it
 * sold can be reached, so nothing it sold may be charged again. Each ends at
 * the end of the period already paid, and the creator decides any refund.
 * Bounded by `until`; answers whether every one was reached.
 */
export async function stopRenewals(store: Store, until: number): Promise<{ done: boolean; stopped: number; subs: string[] }> {
  const account = store.stripeAccountId;
  const out = { done: true, stopped: 0, subs: [] as string[] };
  if (!account) return out;
  for (const handle of saleHandles(store)) {
    let page = "";
    for (let round = 0; round < 50; round += 1) {
      if (Date.now() > until) return { ...out, done: false };
      const query = encodeURIComponent(`metadata['store']:'${handle}'`);
      const found = (await onAccount("GET", account, `/subscriptions/search?limit=100&query=${query}${page ? `&page=${encodeURIComponent(page)}` : ""}`)) as Record<string, unknown>;
      const rows = Array.isArray(found.data) ? (found.data as Record<string, unknown>[]) : [];
      for (const sub of rows) {
        const id = typeof sub.id === "string" ? sub.id : "";
        const status = typeof sub.status === "string" ? sub.status : "";
        if (!id || ["canceled", "incomplete_expired"].includes(status)) continue;
        out.subs.push(id);
        if (sub.cancel_at_period_end === true) continue;
        await onAccount("POST", account, `/subscriptions/${encodeURIComponent(id)}`, new URLSearchParams({ cancel_at_period_end: "true", "metadata[store_closed]": "yes" }), undefined, `closed:${id}`);
        out.stopped += 1;
      }
      page = typeof found.next_page === "string" ? found.next_page : "";
      if (found.has_more !== true || !page) break;
    }
  }
  return out;
}

