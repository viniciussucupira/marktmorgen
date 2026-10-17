/**
 * Where to find the links a store emailed one person (added 17 October 2026).
 *
 * A link in an email — to stop a kind of email, confirm a waitlist, leave a
 * review, take a place in a group — is kept under its own random token, and
 * its record names the address it was sent to. Nothing leads from the
 * address to the token, which is the point of a token, and also why
 * deleting a person could not find them. So each such record, as it is
 * made, is noted here too, under a one-way fingerprint of the store and the
 * address, for longer than the longest of them lives:
 *
 *   nl:erase:ix:<statsId>:<fingerprint>   set   the keys of the records made for that address
 *
 * Deleting the person (lib/person-erasure.ts) deletes every key in it, and it.
 */
import { createHash } from "node:crypto";
import { normaliseEmail } from "@/lib/auth";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";

type Command = (string | number)[];

/** How long a set is kept after its latest record: longer than the longest record noted (a stop link, 400 days). */
export const INDEX_SECONDS = 401 * 86_400;

const indexKey = (statsId: string, email: string) =>
  `nl:erase:ix:${statsId}:${createHash("sha256").update(`nimbus-erase-ix:${statsId}:${normaliseEmail(email)}`).digest("hex").slice(0, 32)}`;

/**
 * Commands that note a record made for this address, to send with the
 * command that writes it. A store with no stats id notes nothing: it has
 * none of these records.
 */
export function noteForErasure(statsId: string | null | undefined, email: string, key: string): Command[] {
  if (!statsId || !email || !key) return [];
  const index = indexKey(statsId, email);
  return [["SADD", index, key], ["EXPIRE", index, INDEX_SECONDS]];
}

/** Deletes every record noted for this address in this store, and the note itself. */
export async function forgetNoted(statsId: string | null | undefined, email: string): Promise<number> {
  if (!statsId || !isRedisConfigured()) return 0;
  const index = indexKey(statsId, email);
  const [raw] = await redisPipeline([["SMEMBERS", index]]);
  const keys = (Array.isArray(raw) ? raw : []).map(String).filter((k) => k.startsWith("nl:"));
  const [gone] = await redisPipeline([["DEL", index, ...keys]]);
  return Math.max(0, (Number(gone) || 0) - 1);
}
