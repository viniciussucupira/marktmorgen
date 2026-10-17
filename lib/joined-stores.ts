/**
 * The stores whose list an address joined by its own yes (added 17 October
 * 2026), under a one-way hash of the address, for lib/buyer-library.ts:
 * how a person asking to be deleted from every store is found in the stores
 * they joined without buying. Its own small module, so the list's code
 * (lib/contacts.ts) can note it without loading the library's.
 *
 *   nl:lib:joined:<hash of the address>   a set of store ids, kept 3 years after the last
 */
import { createHash } from "node:crypto";
import { EMAIL_PATTERN, normaliseEmail } from "@/lib/auth";

const KEEP_SECONDS = 3 * 365 * 86_400;
const STORE_ID = /^[0-9a-f]{32}$/;

export const joinedKey = (email: string) =>
  `nl:lib:joined:${createHash("sha256").update(`nimbus-lib-joined:${normaliseEmail(email)}`).digest("hex").slice(0, 40)}`;

/** Commands noting that this address joined the list of the store with this id. */
export function joinedCommands(sid: string | null | undefined, email: string): (string | number)[][] {
  if (!sid || !STORE_ID.test(sid) || !EMAIL_PATTERN.test(normaliseEmail(email))) return [];
  return [["SADD", joinedKey(email), sid], ["EXPIRE", joinedKey(email), KEEP_SECONDS]];
}
