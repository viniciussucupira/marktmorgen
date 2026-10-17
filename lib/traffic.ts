/**
 * How many visits a store had this month.
 *
 * lib/traffic-rules.ts says what a visit is and why it is the measure a
 * plan covers and a bill is made from. This file keeps it.
 *
 *   nl:traffic:day:<folder>:<day>    who came that day, each once
 *   nl:traffic:n:<folder>:<month>    visits, added up, that month
 *   nl:traffic:x:<folder>:<month>    the live room, in hundredths of a visit
 *   nl:traffic:folders:<month>       the stores that had any, that month
 *
 * A page of a store says it was opened (app/api/store/hit). The visitor is
 * reduced to a few letters made from the day, the store and the address
 * they came from (visitorAddress), and put in the day's set. The set
 * answers whether they were already in it; only somebody new to the day
 * adds a visit to the month. The letters are made with a key of our own and
 * cannot be turned back into an address, and the set is gone two days
 * later: what is kept is a count.
 *
 * Counted exactly, by a set and not by an estimate, because a bill is made
 * from it.
 *
 * What this errs toward. Everybody behind one address, a household or an
 * office, is one visit a day. A count that cannot be written is not made.
 * A robot that says it is one, and the store's owner, are never counted
 * (lib/visit.ts). Every one of those is in the creator's favor, which is
 * the way round a figure that is billed from has to err.
 */
import { createHash, createHmac } from "node:crypto";
import { monthKey, rememberFolderOwner } from "@/lib/delivery";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { deriveKey } from "@/lib/secret-box";
import { type Store, storeFolder, storeRef } from "@/lib/store";
import { PARTS_PER_VISIT, publicVisitLimit, visitLimitFor, visitorAddress } from "@/lib/traffic-rules";

const dayKey = (folder: string, day: string) => `nl:traffic:day:${folder}:${day}`;
const countKey = (folder: string, month: string) => `nl:traffic:n:${folder}:${month}`;
const partsKey = (folder: string, month: string) => `nl:traffic:x:${folder}:${month}`;
const foldersKey = (month: string) => `nl:traffic:folders:${month}`;

/** A day's set is kept until the day after it is over, and a little longer. */
const DAY_KEEP_SECONDS = 2 * 24 * 60 * 60;
/** A month's figures are kept long enough to be billed, asked about and answered for. */
const KEEP_SECONDS = 400 * 24 * 60 * 60;

const FOLDER_PATTERN = /^[0-9a-f]{32}$/;

/**
 * The few letters a visitor is kept as for a day. Made with a key only this
 * deployment has (lib/secret-box.ts), so that somebody who read the set
 * could not find an address in it by trying every address there is.
 */
function fingerprint(of: string): string {
  const key = deriveKey("traffic-visitor");
  const made = key ? createHmac("sha256", key).update(of) : createHash("sha256").update(of);
  return made.digest("hex").slice(0, 16);
}

/**
 * What is written beside a month's count: how long it is kept, and that the
 * store had visits that month, which is what the daily job reads to bill
 * (lib/usage-billing.ts). Written with the month's first visit, and again at
 * every hundredth, so that one write lost to a bad moment mends itself long
 * before a bill could be made from the count: no plan covers fewer than a
 * hundred visits.
 */
async function markMonth(folder: string, month: string, owner: string | null): Promise<void> {
  await redisPipeline([
    ["EXPIRE", countKey(folder, month), KEEP_SECONDS],
    ["EXPIRE", partsKey(folder, month), KEEP_SECONDS],
    ["SADD", foldersKey(month), folder],
    ["EXPIRE", foldersKey(month), KEEP_SECONDS],
  ]);
  // Whose folder this is, for the daily job that bills and writes
  // (lib/usage-billing.ts, storeOf).
  if (owner) await rememberFolderOwner(folder, owner);
}

/** One person, on one day, for one store: adds a visit to the month if they are new to today. */
async function countOnce(folder: string, owner: string | null, who: string, now: number): Promise<boolean> {
  const day = new Date(now).toISOString().slice(0, 10);
  const [fresh] = await redisPipeline([["SADD", dayKey(folder, day), fingerprint(`${day}|${folder}|${who}`)]]);
  if (Number(fresh) !== 1) return false;
  const month = monthKey(new Date(now));
  const [count] = await redisPipeline([
    ["INCR", countKey(folder, month)],
    ["EXPIRE", dayKey(folder, day), DAY_KEEP_SECONDS],
  ]);
  const n = Number(count);
  if (n === 1 || n % 100 === 0) await markMonth(folder, month, owner);
  return true;
}

/**
 * Somebody opened a page of this store. Adds a visit to the month if they
 * are new to today; answers whether they were.
 *
 * Never throws: a count that cannot be written must not cost anybody the
 * page they opened.
 */
export async function recordVisit(store: Store, ip: string, now = Date.now()): Promise<boolean> {
  if (!isRedisConfigured()) return false;
  try {
    return await countOnce(await storeFolder(storeRef(store)), storeRef(store), visitorAddress(ip), now);
  } catch (error) {
    console.error("could not count a visit to a store", error);
    return false;
  }
}

/**
 * A subscriber's podcast app asked for its feed (lib/podcast-access.ts): one
 * visit for that subscriber that day, however often the app asks. Told
 * apart by the feed and not by an address, because many apps ask from their
 * maker's servers and a thousand subscribers would be one address.
 */
export async function recordListener(store: Store, feed: string, now = Date.now()): Promise<boolean> {
  if (!isRedisConfigured() || !feed) return false;
  try {
    return await countOnce(await storeFolder(storeRef(store)), storeRef(store), `feed:${feed}`, now);
  } catch (error) {
    console.error("could not count a podcast subscriber's day", error);
    return false;
  }
}

/**
 * Adds hundredths of a visit to a store's month: the live room, by the ten
 * minutes it is open for one member (lib/chat-grant.ts). Answers the
 * month's hundredths after it, or null when it could not be written.
 */
export async function recordParts(folder: string, owner: string | null, parts: number, now = Date.now()): Promise<number | null> {
  if (!isRedisConfigured() || !FOLDER_PATTERN.test(folder) || !Number.isInteger(parts) || parts <= 0) return null;
  try {
    const month = monthKey(new Date(now));
    const [total] = await redisPipeline([["INCRBY", partsKey(folder, month), parts]]);
    const held = Number(total);
    // The same mending as a visit's: with the first, and each time a
    // hundred visits' worth has been added.
    const step = 100 * PARTS_PER_VISIT;
    if (held === parts || Math.floor(held / step) !== Math.floor((held - parts) / step)) await markMonth(folder, month, owner);
    return held;
  } catch (error) {
    console.error("could not count the live room toward a store's visits", error);
    return null;
  }
}

/** A month of a store, taken apart: people who came, and the live room in hundredths of a visit. */
export type Traffic = { people: number; parts: number; visits: number };

export async function trafficIn(folder: string, month = monthKey()): Promise<Traffic> {
  if (!isRedisConfigured() || !folder) return { people: 0, parts: 0, visits: 0 };
  try {
    const [raw] = await redisPipeline([["MGET", countKey(folder, month), partsKey(folder, month)]]);
    const [n, x] = Array.isArray(raw) ? raw : [];
    const whole = (value: unknown) => (Number.isFinite(Number(value)) && Number(value) > 0 ? Math.floor(Number(value)) : 0);
    const people = whole(n);
    const parts = whole(x);
    return { people, parts, visits: people + Math.floor(parts / PARTS_PER_VISIT) };
  } catch (error) {
    console.error("could not read a store's visits", error);
    return { people: 0, parts: 0, visits: 0 };
  }
}

/**
 * The visits a store had in a month ("2026-10"); this month by default.
 * People who came, and the live room's hundredths made into whole visits.
 */
export async function visitsIn(folder: string, month = monthKey()): Promise<number> {
  return (await trafficIn(folder, month)).visits;
}

/** The stores that had any visit in a month. */
export async function visitedFolders(month = monthKey()): Promise<string[]> {
  if (!isRedisConfigured()) return [];
  const [raw] = await redisPipeline([["SMEMBERS", foldersKey(month)]]);
  return Array.isArray(raw) ? raw.filter((f): f is string => typeof f === "string" && FOLDER_PATTERN.test(f)).sort() : [];
}

/** Strict admission read. Display/billing fallbacks must never authorize new work.
 * A null key is the existing meter's unused-month representation; this does
 * not establish freshness or defend against acknowledged counter deletion.
 */
export async function trafficForAdmission(folder: string, month = monthKey()): Promise<Traffic | null> {
  if (!isRedisConfigured() || !FOLDER_PATTERN.test(folder) || !/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) return null;
  try {
    const results = await redisPipeline([["MGET", countKey(folder, month), partsKey(folder, month)]]);
    if (results.length !== 1 || !Array.isArray(results[0]) || results[0].length !== 2) return null;
    const values: number[] = [];
    for (const raw of results[0]) {
      if (raw === null) { values.push(0); continue; }
      if ((typeof raw !== "string" && typeof raw !== "number") || (typeof raw === "string" && !/^(0|[1-9][0-9]*)$/.test(raw))) return null;
      const value = Number(raw);
      if (!Number.isSafeInteger(value) || value < 0) return null;
      values.push(value);
    }
    const [people, parts] = values;
    const visits = people + Math.floor(parts / PARTS_PER_VISIT);
    return Number.isSafeInteger(visits) ? { people, parts, visits } : null;
  } catch { return null; }
}

/** Finite plan threshold. Unknown measurements pause new page/room admission.
 * Counted visits are not an atomic request reservation or a supplier-byte cap.
 * `who` is "public" for the store's own pages, which rest at publicVisitLimit,
 * and "buyer" for what buyers already have (courses, the community and its
 * room, a private podcast), which rests at the whole month's figure
 * (lib/traffic-rules.ts).
 */
export async function isResting(store: Store, now = Date.now(), who: "public" | "buyer" = "public"): Promise<boolean> {
  try {
    const month = visitLimitFor(store, now / 1000);
    const limit = who === "buyer" ? month : publicVisitLimit(month);
    if (!Number.isSafeInteger(limit) || limit < 0) return true;
    const traffic = await trafficForAdmission(await storeFolder(storeRef(store)), monthKey(new Date(now)));
    return traffic === null || traffic.visits >= limit;
  } catch { return true; }
}
