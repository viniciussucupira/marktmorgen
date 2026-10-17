/**
 * The stores whose list an address joined by its own yes (added 17 October
 * 2026), under a one-way hash of the address, for lib/buyer-library.ts:
 * how a person asking to be deleted from every store is found in the stores
 * they joined without buying. Its own small module, so the list's code
 * (lib/contacts.ts) can note it without loading the library's.
 *
 *   nl:lib:joined:<quarter>:<hash of the address>   a set of store ids, until QUARTERS_KEPT quarters from the one written in
 *   nl:lib:joined:<hash of the address>             the same, as it was kept until 18 October 2026: read, never written again
 *
 * A person's records across stores, the stores they bought from
 * (lib/buyer-library.ts) and the lists they joined, are kept by the quarter
 * a store was noted in, and each quarter's set ends on a set day (added 18
 * October 2026). Until then each was one set whose life every new store
 * started again, so a store that closed stayed in it for as long as the
 * person kept buying anywhere: for ever, with nobody paying for it. Now a
 * store noted in a quarter is in it for at least three years after, however
 * often the person is seen since, and a store that closed is in it for no
 * longer than that: nothing is taken out of a person's records when a store
 * closes, buyer by buyer (lib/closed-store-data.ts), because what names it
 * there points at nothing once it is gone, is never shown, and runs out by
 * itself. What that costs is priced with the order that wrote it
 * (tests/plan-cost-registry.ts, ORDER_COST).
 */
import { createHash } from "node:crypto";
import { EMAIL_PATTERN, normaliseEmail } from "@/lib/auth";

const STORE_ID = /^[0-9a-f]{32}$/;

/** Quarters a store noted for a person is kept in their records: the one it was noted in and twelve after, so at least three years. */
export const QUARTERS_KEPT = 13;
/** The most months a store noted for a person is kept: QUARTERS_KEPT quarters. */
export const PERSON_RECORD_MONTHS = QUARTERS_KEPT * 3;

/** The quarter a moment is in, counted from the year 0: 2026's last is 8107. */
export function quarterOf(ms: number): number {
  const at = new Date(ms);
  return at.getUTCFullYear() * 4 + Math.floor(at.getUTCMonth() / 3);
}

/** When a quarter begins, in ms. */
export function quarterStart(quarter: number): number {
  return Date.UTC(Math.floor(quarter / 4), (quarter % 4) * 3, 1);
}

/** A quarter's name in a key: "2026q4". */
const quarterName = (quarter: number) => `${Math.floor(quarter / 4)}q${(quarter % 4) + 1}`;

/** The hash a person's records are kept under, by what they are ("lib", "lib-joined"). */
const personHash = (salt: string, email: string) => createHash("sha256").update(`${salt}:${normaliseEmail(email)}`).digest("hex").slice(0, 40);

/**
 * Every key a person's record of one kind can be in at `now`: the one it was
 * kept in until 18 October 2026, and each quarter's still kept.
 */
export function personKeys(prefix: string, salt: string, email: string, now = Date.now()): string[] {
  const hash = personHash(salt, email);
  const quarter = quarterOf(now);
  const out = [`${prefix}${hash}`];
  for (let q = quarter - QUARTERS_KEPT + 1; q <= quarter; q += 1) out.push(`${prefix}${quarterName(q)}:${hash}`);
  return out;
}

/** Commands noting a store in a person's record of one kind: this quarter's set, ended on its day. */
export function personWrite(prefix: string, salt: string, email: string, sid: string, now = Date.now()): (string | number)[][] {
  const quarter = quarterOf(now);
  const key = `${prefix}${quarterName(quarter)}:${personHash(salt, email)}`;
  return [["SADD", key, sid], ["EXPIREAT", key, Math.floor(quarterStart(quarter + QUARTERS_KEPT) / 1000)]];
}

const JOINED = "nl:lib:joined:";
const JOINED_SALT = "nimbus-lib-joined";

/** Every key the stores an address joined the list of can be in. */
export const joinedKeys = (email: string, now = Date.now()) => personKeys(JOINED, JOINED_SALT, email, now);

/** Commands noting that this address joined the list of the store with this id. */
export function joinedCommands(sid: string | null | undefined, email: string, now = Date.now()): (string | number)[][] {
  if (!sid || !STORE_ID.test(sid) || !EMAIL_PATTERN.test(normaliseEmail(email))) return [];
  return personWrite(JOINED, JOINED_SALT, email, sid, now);
}
