/**
 * Emails published on the store (Kajabi's "newsletters, by email and on the
 * web"; docs/zero-cost-value-2026-10-18.md, item 1; added 18 October 2026):
 * the rules, browser-safe.
 *
 * A creator may publish an email they already sent to their list as a page
 * of their store, at /@handle/letters/<id>, with a page listing every one
 * published. Only on purpose, one email at a time, and never by itself:
 * an email sent to some buyers only may hold what those buyers paid for, so
 * nothing is published that the creator did not choose, and the studio says
 * that anyone can read it once it is.
 *
 * What is published is a copy of the email's subject and words as they were
 * sent, written once when it is published: its links as the creator typed
 * them (not the tagged ones each reader's email carried), and nothing about
 * who received it. Taking it off deletes the copy.
 *
 * No new cost: the copy and its place in the list are counted in the store's
 * data room before they are written, and each page view is one of the
 * store's public requests, as every store page is.
 */

/** Emails a store keeps published at once. */
export const MAX_PUBLISHED_LETTERS = 200;
/** How long a published copy stays, from the day it was published; publishing again starts the days afresh. */
export const LETTER_KEEP_DAYS = 400;
/** A published email's id in its address: 20 hex characters, made from the email's own id and the store's, never the email's id itself. */
export const LETTER_ID = /^[0-9a-f]{20}$/;

export type Letter = {
  id: string;
  sid: string;
  subject: string;
  /** The email's words as sent (lib/mail-body.ts reads them). */
  body: string;
  /** When it went out, in milliseconds. */
  sentAt: number;
  publishedAt: number;
};

/** Whatever came back from storage, made safe to use; null when it is not a published email. */
export function parseLetter(raw: unknown): Letter | null {
  if (!raw || typeof raw !== "object") return null;
  const v = raw as Record<string, unknown>;
  if (typeof v.id !== "string" || !LETTER_ID.test(v.id) || typeof v.sid !== "string" || !v.sid) return null;
  if (typeof v.subject !== "string" || !v.subject.trim() || typeof v.body !== "string" || !v.body.trim()) return null;
  const num = (x: unknown) => (typeof x === "number" && Number.isFinite(x) ? x : 0);
  return { id: v.id, sid: v.sid.slice(0, 64), subject: v.subject.slice(0, 300), body: v.body, sentAt: num(v.sentAt), publishedAt: num(v.publishedAt) };
}

/** What the studio says before an email is published. */
export const PUBLISH_WARNING =
  "Anyone can read it once it is published, including people who are not on your list. Publish only an email whose words you would put on your store: an email sent to buyers of one product may hold what they paid for.";
