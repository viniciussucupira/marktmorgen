/**
 * The creator's own public review page in the review-request email (added
 * 18 October 2026; HighLevel gap matrix H19, rank 1). HighLevel's review
 * requests can send people to a connected Google Business Profile or to a
 * custom link (docs/highlevel-gap-matrix.md, HL08). Here the one email that
 * asks a buyer for a review on the store (lib/review-requests.ts) can also
 * name, once and after the store's own link, the creator's page on one of a
 * few public review sites.
 *
 * What keeps it honest:
 *
 *   - It is in every review-request email the store sends, the same for
 *     everybody: never chosen by a rating, never only to buyers who seem
 *     happy. Choosing whom to ask by what they will say is what Google's
 *     contribution policy ("selectively solicit positive reviews",
 *     support.google.com/contributionpolicy/answer/7400114) and Trustpilot's
 *     guidelines for businesses ("Be selective with invitations") forbid.
 *   - Nothing is offered for it, as for the store's own review.
 *   - Only the sites listed here, on https, at their own domains: a link
 *     anywhere else in an email from the creator's name would be a way to
 *     send buyers somewhere they did not expect. Yelp is not listed: it asks
 *     businesses not to ask for reviews
 *     (yelp-support.com/article/Don-t-Ask-for-Reviews).
 *
 * Pure: imports nothing, so the studio's form and the server read one rule.
 */

export type ReviewSite = "google" | "trustpilot" | "facebook";

/** Each site, the name the email says, and the hosts its review pages are on. */
export const REVIEW_SITES: Record<ReviewSite, { name: string; hosts: readonly string[] }> = {
  google: { name: "Google", hosts: ["g.page", "search.google.com", "www.google.com", "google.com", "maps.app.goo.gl", "g.co"] },
  trustpilot: { name: "Trustpilot", hosts: ["www.trustpilot.com", "trustpilot.com", "uk.trustpilot.com", "de.trustpilot.com", "fr.trustpilot.com", "es.trustpilot.com", "it.trustpilot.com", "nl.trustpilot.com", "pt.trustpilot.com"] },
  facebook: { name: "Facebook", hosts: ["www.facebook.com", "facebook.com", "m.facebook.com"] },
};

/** The longest address kept. */
export const MAX_REVIEW_URL = 300;

export type ReviewElsewhere = { site: ReviewSite; url: string };

/**
 * A review page as typed or stored, or null when it is not one of the
 * sites above on https: no login in the address, no port, no fragment kept,
 * at most MAX_REVIEW_URL characters.
 */
export function parseReviewElsewhere(raw: unknown): ReviewElsewhere | null {
  if (typeof raw !== "string") return null;
  const typed = raw.trim();
  if (!typed || typed.length > MAX_REVIEW_URL || /\s/.test(typed)) return null;
  let url: URL;
  try {
    url = new URL(typed);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password || url.port) return null;
  const host = url.hostname.toLowerCase();
  const site = (Object.keys(REVIEW_SITES) as ReviewSite[]).find((key) => REVIEW_SITES[key].hosts.includes(host));
  if (!site) return null;
  // A Google address must be a place or a review page, not any search.
  if (site === "google" && (host === "www.google.com" || host === "google.com") && !url.pathname.startsWith("/maps")) return null;
  url.hash = "";
  const kept = url.toString();
  return kept.length <= MAX_REVIEW_URL ? { site, url: kept } : null;
}

/** What the studio says about it, beside the field. */
export const ELSEWHERE_NOTE =
  "Optional. Your page on Google, Trustpilot or Facebook. It goes in every review request, the same for every buyer, after the link to review on your store, never only to buyers who seem happy, and nothing is offered for it.";
