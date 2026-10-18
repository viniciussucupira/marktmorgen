/**
 * Where a store's Marktmorgen Path is kept (lib/path-rules.ts says what it
 * is): one small record, counted in the store's data room like everything
 * else it keeps (lib/store-data.ts, slot "path"), written only when it
 * changes.
 *
 *   nl:path:<sid>   JSON {
 *                     v: 1,
 *                     a: the four answers and the time zone (PathAnswers),
 *                     at: when the path began, in milliseconds,
 *                     c: the days the owner opened it, in their own days, the latest KEPT_CHECKINS,
 *                     b: the best level ever reached (never lowered), bAt: when,
 *                     m: the last reading of the money (lib/path-facts.ts), reused PATH_MONEY_SECONDS,
 *                     n: the last reading of the counts (visits, links, leads), reused as long
 *                   }
 *
 * Reading the money and the counts again costs PATH_READ_UNITS of the
 * store's studio requests (lib/studio-route.ts, countStudio), taken before
 * anything is read: up to six pages of the creator's Stripe account waited
 * on one after another and the numbers' all-time record. When the studio's
 * figure has no room for it, the path shows the last reading it kept, with
 * when it was read, and never pauses the studio for it.
 *
 * What is never kept: a mission marked done. Missions are read from the
 * store's facts every time (lib/path-facts.ts), so a refund takes a sale
 * back off and nothing here can say otherwise. The best level is the one
 * thing remembered, because a level reached is never taken away.
 *
 * The record is the owner's own: their goal, their words about what they
 * make, their time zone. It goes with the store (forgetPath, from the
 * store's deletion and its closing) and is in the account's own data
 * (lib/person-data.ts, "account"), never shown to anybody else.
 */
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import type { Store } from "@/lib/store";
import { dataBytes } from "@/lib/store-data-rules";
import { giveData, takeData } from "@/lib/store-data";
import { type PathAnswers, AUDIENCES, LEVELS, MINUTES, cleanLine, MAX_SKILLS, MAX_SUBJECT, localDay, validTimeZone, withCheckin, levelKept, type PathFacts } from "@/lib/path-rules";
import { type PathCounts, type PathMoney, PATH_REFUND_PAGES, PATH_SALE_PAGES, countsFresh, factsFrom, moneyFresh, readPathCounts, readPathMoney } from "@/lib/path-facts";
import { countStudio } from "@/lib/studio-route";
import { readGoal } from "@/lib/sales-goal-rules";
import { isCurrency } from "@/lib/money";

const key = (sid: string) => `nl:path:${sid}`;
/** The store's data room's slot for the record. */
export const PATH_SLOT = "path";
const SID = /^[0-9a-f]{32}$/;

export type PathRecord = {
  answers: PathAnswers;
  startedAt: number;
  checkins: string[];
  best: number;
  bestAt: number;
  money: PathMoney | null;
  counts: PathCounts | null;
};

/**
 * Studio requests one reading of the money and the counts takes: its
 * PATH_SALE_PAGES and PATH_REFUND_PAGES pages of Stripe, waited on one list
 * after the other at EXPORT_PAGE_SECONDS each (lib/store-export.ts), at the
 * studio request's 1.5 seconds; tests/plan-cost-registry.test.ts holds it.
 */
export const PATH_READ_UNITS = Math.ceil(((PATH_SALE_PAGES + PATH_REFUND_PAGES) * 2) / 1.5);

function parseCounts(raw: unknown): PathCounts | null {
  if (!raw || typeof raw !== "object") return null;
  const c = raw as Record<string, unknown>;
  const at = Number(c.at);
  const whole = (v: unknown) => (Number.isSafeInteger(Number(v)) && Number(v) >= 0 ? Number(v) : null);
  const [social, visitors, links, leads] = [whole(c.social), whole(c.visitors), whole(c.links), whole(c.leads)];
  if (!Number.isFinite(at) || at <= 0 || social === null || visitors === null || links === null || leads === null) return null;
  return { at, social, visitors, links, leads };
}

function parseMoney(raw: unknown): PathMoney | null {
  if (!raw || typeof raw !== "object") return null;
  const m = raw as Record<string, unknown>;
  const at = Number(m.at);
  const real = Number(m.real);
  const cents = m.cents === null ? null : Number(m.cents);
  if (!Number.isFinite(at) || at <= 0 || !Number.isSafeInteger(real) || real < 0) return null;
  if (cents !== null && (!Number.isSafeInteger(cents) || cents < 0)) return null;
  if (typeof m.currency !== "string" || !isCurrency(m.currency)) return null;
  return { at, test: m.test === true, real, cents, currency: m.currency };
}

/** A record as kept, made safe: null for anything that is not one. Pure. */
export function parsePath(raw: unknown): PathRecord | null {
  if (typeof raw !== "string" || !raw) return null;
  let value: Record<string, unknown>;
  try {
    value = JSON.parse(raw) as Record<string, unknown>;
  } catch {
    return null;
  }
  if (!value || value.v !== 1 || !value.a || typeof value.a !== "object") return null;
  const a = value.a as Record<string, unknown>;
  const minutes = Number(a.minutes);
  const goal = readGoal(a.goalCents ?? 0);
  if (!MINUTES.includes(minutes as PathAnswers["minutes"]) || goal === null) return null;
  if (typeof a.audience !== "string" || !(AUDIENCES as readonly string[]).includes(a.audience)) return null;
  const startedAt = Number(value.at);
  if (!Number.isFinite(startedAt) || startedAt <= 0) return null;
  const best = Number(value.b);
  return {
    answers: {
      goalCents: goal,
      goalCurrency: typeof a.goalCurrency === "string" && isCurrency(a.goalCurrency) ? a.goalCurrency : "usd",
      skills: cleanLine(a.skills, MAX_SKILLS),
      subject: cleanLine(a.subject, MAX_SUBJECT),
      minutes: minutes as PathAnswers["minutes"],
      audience: a.audience as PathAnswers["audience"],
      timeZone: validTimeZone(a.timeZone) ? a.timeZone : "UTC",
    },
    startedAt,
    checkins: Array.isArray(value.c) ? value.c.filter((d): d is string => typeof d === "string" && /^\d{4}-\d{2}-\d{2}$/.test(d)).slice(-60) : [],
    best: Number.isInteger(best) && best >= -1 && best < LEVELS.length ? best : -1,
    bestAt: Number(value.bAt) > 0 ? Number(value.bAt) : 0,
    money: parseMoney(value.m),
    counts: parseCounts(value.n),
  };
}

/** The record as it is written. Pure. */
export function pathJson(record: PathRecord): string {
  return JSON.stringify({ v: 1, a: record.answers, at: record.startedAt, c: record.checkins, b: record.best, bAt: record.bestAt, m: record.money, n: record.counts });
}

/** The store's path, or null when it has not begun one (or nothing can be read). */
export async function readPath(store: Pick<Store, "sid">): Promise<PathRecord | null> {
  if (!SID.test(store.sid) || !isRedisConfigured()) return null;
  const [raw] = await redisPipeline([["GET", key(store.sid)]]);
  return parsePath(raw);
}

/**
 * Writes the record, its room taken first (set, so a record rewritten never
 * grows the room by more than it weighs). False when the room is full or
 * cannot be counted: nothing is written then.
 */
async function writePath(store: Store, record: PathRecord, now: number): Promise<boolean> {
  if (!SID.test(store.sid) || !isRedisConfigured()) return false;
  const json = pathJson(record);
  const taken = await takeData(store, [{ slot: PATH_SLOT, bytes: dataBytes(json), set: true }], now);
  if (!taken.ok) return false;
  await redisPipeline([["SET", key(store.sid), json]]);
  return true;
}

/**
 * Begins the path, or changes its answers: the day it began is kept when it
 * already had one, and so is everything it remembered.
 */
export async function startPath(store: Store, answers: PathAnswers, now = Date.now()): Promise<{ ok: true; record: PathRecord } | { ok: false; reason: "full" | "unavailable" }> {
  if (!SID.test(store.sid) || !isRedisConfigured()) return { ok: false, reason: "unavailable" };
  const before = await readPath(store);
  const record: PathRecord = before
    ? { ...before, answers }
    : { answers, startedAt: now, checkins: [localDay(answers.timeZone, now)], best: -1, bestAt: 0, money: null, counts: null };
  return (await writePath(store, record, now)) ? { ok: true, record } : { ok: false, reason: "full" };
}

/** Takes a reading's studio requests; false when the studio's figure has no room for it (the kept reading is shown then). */
export type Charge = (units: number) => Promise<boolean>;
export const chargeStudio = (store: Store): Charge => async (units) => (await countStudio(store, null, units).catch(() => ({ ok: false as const }))).ok;

/**
 * What the owner opening their path records: today among the days they
 * showed up, the money and the counts read again when the last reading is
 * stale (and its studio requests are taken), and the level kept if a higher
 * one is reached. Written once, only when something changed. Answers the
 * record as it now stands and the facts read from it.
 */
export async function visitPath(store: Store, record: PathRecord, now = Date.now(), charge: Charge = chargeStudio(store)): Promise<{ record: PathRecord; facts: PathFacts }> {
  let { money, counts } = record;
  let changed = false;
  if (!moneyFresh(money, store, now) || !countsFresh(counts, now)) {
    if (await charge(PATH_READ_UNITS)) {
      const [readMoney, readCounts] = await Promise.all([readPathMoney(store, now).catch(() => null), readPathCounts(store, now)]);
      if (readMoney) money = readMoney;
      if (readCounts) counts = readCounts;
      changed = Boolean(readMoney || readCounts);
    }
  }
  const read = factsFrom(store, counts, money);
  const today = localDay(record.answers.timeZone, now);
  const checkins = withCheckin(record.checkins, today);
  if (checkins.length !== record.checkins.length || checkins[checkins.length - 1] !== record.checkins[record.checkins.length - 1]) changed = true;
  const best = levelKept(record.best, read);
  const next: PathRecord = { ...record, checkins, money, counts, best, bestAt: best > record.best ? now : record.bestAt };
  if (best !== record.best) changed = true;
  if (changed) await writePath(store, next, now).catch((error) => console.error("keeping a store's path failed", store.handle, error));
  return { record: next, facts: read };
}

/** Forgets the store's path: from its deletion and its closing. Safe to call twice. */
export async function forgetPath(store: Store): Promise<void> {
  if (!SID.test(store.sid) || !isRedisConfigured()) return;
  await redisPipeline([["DEL", key(store.sid)]]);
  await giveData(store, [{ slot: PATH_SLOT, bytes: 0, set: true }]);
}
