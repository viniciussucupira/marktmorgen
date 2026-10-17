/**
 * The sites a creator lets open their checkout and sign-up form in place
 * (added 17 October 2026, with the checkout script, lib/embed-sdk.ts).
 *
 * lib/embed-rules.ts gave a creator a card and a button to paste into their
 * own website. The checkout script goes one step further: a link on any page
 * of theirs (WordPress, Webflow, their own HTML) opens the product's card or
 * the sign-up form over that page, and the page is told what happened there,
 * so it can say thank you or move on. Telling a page anything is something
 * only the creator's own pages should get, so it is limited to the sites the
 * creator names here:
 *
 *   - Up to MAX_EMBED_SITES addresses per store, each an https origin
 *     ("https://www.example.com"): a scheme, a host and a port, nothing else.
 *     No wildcard, no path, no http: a page on plain http can be changed by
 *     anybody between it and the buyer, so it is not the creator's to vouch for.
 *   - A frame opened by the script works out which site it is on from the
 *     Referer the browser sends with it (the script asks for the origin with
 *     referrerpolicy="origin", and a web page cannot write that header). On a
 *     listed site it shows the card or the form and messages that one origin
 *     alone. Anywhere else, or with no Referer, it shows a plain link to the
 *     product's own page in a new tab, and messages nobody.
 *   - The address the buyer is sent back to after paying, or after signing up,
 *     must be on a listed site too, so the receipt page can never be used to
 *     send somebody to an address the creator did not name.
 *
 * Browser-safe: the studio checks what is typed with the same functions the
 * pages and the checkout use.
 */
import { AFFILIATE_CODE_PATTERN } from "./affiliate-setting";

/** Sites one store may name. */
export const MAX_EMBED_SITES = 10;

/** The longest return address kept with a checkout: Stripe keeps 500 characters a field, and the order's own fields need the rest. */
export const MAX_RETURN_URL = 300;

/** The longest origin accepted: "https://", a host of up to 253 characters and a port. */
const MAX_ORIGIN = 300;

/**
 * Frames and pages the script opens per connection per store in ten minutes.
 * Each open is one read of the store; a person opens a few. Past this the
 * frame shows the plain link instead, which costs nothing more.
 */
export const OPENS_PER_TEN_MINUTES = 30;

/** What the tags call the way in, beside the place name the creator picks (lib/embed-rules.ts EMBED_MEDIUM is the card's). */
export const SCRIPT_MEDIUM = "checkout-script";

/** The two ways a link with the script opens: over the page, or as a page of its own in the same tab. */
export const SCRIPT_MODES = ["overlay", "page"] as const;
export type ScriptMode = (typeof SCRIPT_MODES)[number];

/** The mode in a frame or page address (?mm=), or null for the plain card of lib/embed-rules.ts. */
export function scriptMode(raw: unknown): ScriptMode | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return value === "overlay" || value === "page" ? value : null;
}

/**
 * One site as the creator typed it, made into an origin, or null.
 *
 * "example.com", "https://Example.com/shop?x=1" and "https://example.com/"
 * are all "https://example.com". "http://example.com", "*.example.com", an
 * address with a user name in it, and anything that is not a host with a
 * dot in it are refused.
 */
export function parseEmbedSite(raw: unknown): string | null {
  if (typeof raw !== "string") return null;
  let text = raw.trim();
  if (!text || text.length > MAX_ORIGIN || /[\s*]/.test(text)) return null;
  if (!/^[a-z][a-z0-9+.-]*:\/\//i.test(text)) text = `https://${text}`;
  let url: URL;
  try {
    url = new URL(text);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password) return null;
  const host = url.hostname.toLowerCase();
  // A name with a dot, not a bare word or a number address of this machine.
  if (!host.includes(".") || host.endsWith(".") || host === "localhost" || /^\[|^\d+(\.\d+){3}$/.test(host)) return null;
  return url.origin.toLowerCase();
}

/** A store's saved list: valid origins, each once, in the order given, at most MAX_EMBED_SITES. */
export function parseEmbedSites(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  const seen: string[] = [];
  for (const item of value) {
    const site = parseEmbedSite(item);
    if (site && !seen.includes(site)) seen.push(site);
    if (seen.length >= MAX_EMBED_SITES) break;
  }
  return seen;
}

/**
 * What the creator typed, checked as a whole: the list to save, or the first
 * line that cannot be one. More than MAX_EMBED_SITES is refused, not cut, so
 * nobody finds a site quietly missing.
 */
export function readEmbedSites(value: unknown): { ok: true; sites: string[] } | { ok: false; reason: "invalid" | "too_many"; line?: string } {
  const lines = Array.isArray(value) ? value : typeof value === "string" ? value.split(/[\n,]+/) : null;
  if (!lines) return { ok: false, reason: "invalid" };
  const sites: string[] = [];
  for (const line of lines) {
    if (typeof line !== "string") return { ok: false, reason: "invalid" };
    if (!line.trim()) continue;
    const site = parseEmbedSite(line);
    if (!site) return { ok: false, reason: "invalid", line: line.trim().slice(0, 80) };
    if (!sites.includes(site)) sites.push(site);
  }
  if (sites.length > MAX_EMBED_SITES) return { ok: false, reason: "too_many" };
  return { ok: true, sites };
}

/** The origin of a Referer, when it is a listed site; null when it is not, or there is none. */
export function listedSite(sites: readonly string[], referer: string | null | undefined): string | null {
  if (!referer || !sites.length) return null;
  try {
    const origin = new URL(referer).origin.toLowerCase();
    return sites.includes(origin) ? origin : null;
  } catch {
    return null;
  }
}

/** A return address, when it is an https address on a listed site and short enough to keep; its fragment is dropped. */
export function listedReturn(sites: readonly string[], raw: unknown): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  if (typeof value !== "string" || !value || value.length > MAX_RETURN_URL * 2) return null;
  let url: URL;
  try {
    url = new URL(value);
  } catch {
    return null;
  }
  if (url.protocol !== "https:" || url.username || url.password || !sites.includes(url.origin.toLowerCase())) return null;
  url.hash = "";
  const href = url.href;
  return href.length <= MAX_RETURN_URL ? href : null;
}

/** An affiliate's code passed on the script's link (?via=), when it has the shape of one. */
export function scriptVia(raw: unknown): string | null {
  const value = Array.isArray(raw) ? raw[0] : raw;
  const code = typeof value === "string" ? value.trim().toLowerCase() : "";
  return AFFILIATE_CODE_PATTERN.test(code) ? code : null;
}

type UtmTag = "utm_source" | "utm_medium" | "utm_campaign" | "utm_content";

/** The longest campaign and content tags kept, as lib/came-from.ts keeps them. */
export const MAX_CAMPAIGN = 40;

function tag(raw: unknown, max: number): string {
  const value = Array.isArray(raw) ? raw[0] : raw;
  return typeof value === "string" ? value.trim().toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9._-]/g, "").slice(0, max) : "";
}

/** The utm tags of a script link, cleaned as the sales report keeps them; the medium is the script's own when none was given. */
export function scriptTags(query: Record<string, unknown>): Record<UtmTag, string> {
  return {
    utm_source: tag(query.utm_source, 30) || "website",
    utm_medium: tag(query.utm_medium, 30) || SCRIPT_MEDIUM,
    utm_campaign: tag(query.utm_campaign, MAX_CAMPAIGN),
    utm_content: tag(query.utm_content, MAX_CAMPAIGN),
  };
}

/** An address with those tags (the empty ones left out) and any other fields given. */
export function withTags(url: string, tags: Record<string, string>, more: Record<string, string | null | undefined> = {}): string {
  const params = new URLSearchParams();
  for (const [name, value] of Object.entries({ ...tags, ...more })) if (value) params.set(name, value);
  const query = params.toString();
  if (!query) return url;
  return `${url}${url.includes("?") ? "&" : "?"}${query}`;
}

/**
 * The mark the receipt page adds to the address it sends a buyer back to, so
 * the script on that page can say a purchase was made: the product and the
 * order's id, which is the id of the sale.completed webhook for the same
 * order (lib/webhooks.ts eventIdFor), so a page and a server can match them.
 * Neither is a secret, and neither opens anything: anybody can type the
 * mark, which is why a page must never hand anything over because of it.
 */
export const PURCHASE_MARK = "mm-purchase";
export const PURCHASE_MARK_PATTERN = /^#mm-purchase=([a-z0-9]{6,40})\.(evt_[0-9a-f]{32})$/;

export function purchaseReturn(back: string, productId: string, orderId: string): string | null {
  if (!/^[a-z0-9]{6,40}$/.test(productId) || !/^evt_[0-9a-f]{32}$/.test(orderId)) return null;
  const at = back.indexOf("#");
  return `${at >= 0 ? back.slice(0, at) : back}#${PURCHASE_MARK}=${productId}.${orderId}`;
}

/** The kinds of message a frame sends the page that opened it (lib/embed-sdk.ts turns each into an event). */
export const FRAME_MESSAGES = ["ready", "checkout", "optin", "close"] as const;
export type FrameMessage = (typeof FRAME_MESSAGES)[number];
