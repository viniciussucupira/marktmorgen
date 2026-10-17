/**
 * A buyer's library (added 11 October 2026): everything an address bought
 * from any store on Marktmorgen, in one place, with no account.
 *
 * Each store already gives its buyers their purchases back by email
 * (lib/buyer-orders.ts): type the address you paid with, use the link that
 * arrives. A buyer of five creators had five stores to remember. Gumroad and
 * Kajabi each keep one library per buyer, and their apps are built on it; so
 * is the app this will be.
 *
 * What is kept is the least that can do it: for an address, read only as a
 * one-way hash of it, which stores it bought something from, by the store's
 * id. Not what, not when, not for how much: each store's own list is still
 * read from the creator's Stripe account when the buyer opens it, exactly as
 * before. The privacy page says so.
 *
 * Signing in is the same as a store's: the address is typed, and a link that
 * opens the library for a day is emailed to it. Nothing is sent to an address
 * that bought nothing, and the answer on the page is the same either way, so
 * the form cannot be used to learn who buys from whom.
 *
 *   nl:lib:<hash of the address>   the stores it bought from (a set of ids), kept 3 years after the last
 *   nl:lib:link:<hash of a token>  the address a library link was sent to, for a day
 */
import { storeForId } from "@/lib/store";
import { createHash, randomBytes } from "node:crypto";
import { EMAIL_PATTERN, MAX_EMAIL_LENGTH, normaliseEmail } from "@/lib/auth";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { withinLimit } from "@/lib/request-guard";
import { NIMBUS_FROM, isSenderConfigured, sendEmail } from "@/lib/email";

export const LIBRARY_LINK_SECONDS = 24 * 60 * 60;
export const LIBRARY_TOKEN = /^[0-9a-f]{64}$/;
/** The most stores one library lists. */
export const MAX_LIBRARY_STORES = 60;
const KEEP_SECONDS = 3 * 365 * 86_400;
const STORE_ID = /^[0-9a-f]{32}$/;

const sha = (value: string) => createHash("sha256").update(value).digest("hex");
const libraryKey = (email: string) => `nl:lib:${sha(`nimbus-lib:${normaliseEmail(email)}`).slice(0, 40)}`;
const linkKey = (token: string) => `nl:lib:link:${sha(`nimbus-lib-link:${token}`).slice(0, 40)}`;

/** Notes that these addresses bought something from the store with this id. Never throws. */
export async function rememberBuyers(sid: string, emails: string[]): Promise<void> {
  const wanted = emails.filter((email) => typeof email === "string" && EMAIL_PATTERN.test(normaliseEmail(email)));
  if (!STORE_ID.test(sid) || !wanted.length || !isRedisConfigured()) return;
  try {
    await redisPipeline(wanted.flatMap((email) => [["SADD", libraryKey(email), sid], ["EXPIRE", libraryKey(email), KEEP_SECONDS]]));
  } catch (error) {
    console.error("noting a buyer for their library failed", error);
  }
}

/** The ids of the stores an address bought from. */
export async function storesBoughtFrom(email: string): Promise<string[]> {
  if (!isRedisConfigured()) return [];
  const [ids] = await redisPipeline([["SMEMBERS", libraryKey(email)]]);
  return Array.isArray(ids) ? ids.filter((id): id is string => typeof id === "string" && STORE_ID.test(id)).slice(0, MAX_LIBRARY_STORES) : [];
}

export type LibraryRequest = "sent" | "email" | "limited" | "error";

/**
 * Emails a link that opens the library. "sent" whether or not the address
 * bought anything; nothing is sent to one that did not.
 */
export async function requestLibraryLink(input: { email: string; ip: string; origin: string }): Promise<LibraryRequest> {
  const raw = input.email.trim();
  if (!raw || raw.length > MAX_EMAIL_LENGTH || !EMAIL_PATTERN.test(raw)) return "email";
  if (!isRedisConfigured() || !isSenderConfigured()) return "error";
  const email = normaliseEmail(raw);
  if (!(await withinLimit("library-ip", input.ip, 10, 3_600))) return "limited";
  if (!(await withinLimit("library-address", sha(email), 5, 3_600))) return "limited";
  const stores = await storesBoughtFrom(email);
  if (!stores.length) return "sent";
  const token = randomBytes(32).toString("hex");
  await redisPipeline([["SET", linkKey(token), email, "EX", LIBRARY_LINK_SECONDS]]);
  const link = `${input.origin}/library?token=${token}`;
  // One of the access emails of the store the address bought from first in the list (lib/store-allowance-rules.ts).
  const charged = await storeForId(stores[0]).catch(() => null);
  if (!charged) return "error";
  const sent = await sendEmail({ meter: { by: "store", store: charged, kind: "transactional" },
    from: NIMBUS_FROM,
    to: email,
    subject: "Your purchases on Marktmorgen",
    text: [
      `Here is everything you bought from creators on Marktmorgen, from ${stores.length} ${stores.length === 1 ? "store" : "stores"}:`,
      "",
      link,
      "",
      "The link works for 24 hours. After that, ask for a new one at marktmorgen.com/library.",
      "",
      "If you did not ask for this, you can ignore it: nobody can open your library without this email.",
    ].join("\n"),
  });
  return sent ? "sent" : "error";
}

/** The address a live library link was sent to, or null. */
export async function libraryOwner(token: string): Promise<string | null> {
  if (!LIBRARY_TOKEN.test(token) || !isRedisConfigured()) return null;
  const [email] = await redisPipeline([["GET", linkKey(token)]]);
  return typeof email === "string" && email ? email : null;
}
