/**
 * A web address checked when the person leaves its field (487 [IT4],
 * pattern 1; added 1 November 2026), by the server's own reading (readLink
 * in lib/product-link.ts), so the field never passes what the save refuses.
 *
 * The usual slip is the missing "https://": then the address is offered back
 * with it, but only when that makes it one the server keeps. An http://
 * address is offered back as https://. Anything else gets the server's own
 * words, and nothing is offered. An empty field is fine: these fields are
 * optional, and the save says so when one is not.
 *
 * Browser-safe: plain functions.
 */
import { LINK_PROBLEMS, readLink } from "@/lib/product-link";

export const NEEDS_HTTPS = "This address needs https:// at the start.";

export function linkOnLeave(raw: string): { problem: string | null; fix: string | null } {
  const typed = (raw ?? "").trim();
  if (!typed) return { problem: null, fix: null };
  const read = readLink(typed);
  if (read.ok) return { problem: null, fix: null };
  const hasScheme = /^[a-z][a-z0-9+.-]*:\/\//i.test(typed);
  // Only an address with no scheme, or with http://, is tried with https://.
  if (!hasScheme || /^http:\/\//i.test(typed)) {
    const withHttps = readLink(`https://${typed.replace(/^http:\/\//i, "")}`);
    if (withHttps.ok) return { problem: NEEDS_HTTPS, fix: withHttps.url };
    // With no scheme typed, why the address itself is refused, not that a scheme is missing.
    if (!hasScheme) return { problem: LINK_PROBLEMS[withHttps.reason], fix: null };
  }
  return { problem: LINK_PROBLEMS[read.reason], fix: null };
}
