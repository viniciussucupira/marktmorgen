/**
 * Which channel brought a buyer, remembered across visits (added 11 October 2026).
 *
 * Until this, a sale was credited to the tags on the page it was bought from
 * and nothing else (lib/came-from.ts). Somebody who arrived from Instagram on
 * Monday and came back by typing the address on Friday was a "direct" sale,
 * and so was nearly everybody who came from Instagram or TikTok at all,
 * because their built-in browsers send no referrer to a checkout. The visits
 * were counted under the right name (lib/stats.ts) and the money was not.
 *
 * So the store remembers, for thirty days, the channel of the visitor's
 * latest visit that came from somewhere (not typed, not a bookmark) and of
 * the first one, in a cookie of its own on the store's address. At the
 * checkout the channel goes into the Stripe session's metadata, and into the
 * subscription's, so renewals are counted under it too — the record of the
 * channel lives where the record of the money lives, in the creator's own
 * Stripe account. Nothing is kept on our side and nobody is identified: the
 * cookie holds a word or two and two dates.
 *
 * The rule is "last channel that was not direct", the one most analytics
 * tools use by default, because it answers the question a creator asks —
 * what made this person buy — without letting a typed-in return visit erase
 * where they really came from. The first channel is kept beside it, so the
 * studio can also say where buyers first found the store.
 *
 * Where the law asks for consent before such a cookie (the same places the
 * ad pixels and the affiliate cookie ask first, lib/pixels.ts), it is not
 * set, and a browser sending Global Privacy Control never gets it either.
 * Those sales are credited exactly as before: by the page's own tags.
 *
 * Pure, so the proxy, the checkout and the tests share one reading of it.
 */
import { classifySource, isBot } from "@/lib/source-rules";
import { type CameFrom, cameFrom } from "@/lib/came-from";

/** How long after the latest visit from a channel a sale is still credited to it. */
export const CHANNEL_DAYS = 30;
export const CHANNEL_COOKIE_SECONDS = CHANNEL_DAYS * 24 * 60 * 60;
/** The first channel is forgotten after this long, so "first" never means "years ago". */
export const FIRST_CHANNEL_DAYS = 90;

/** A sale that came from nowhere the store could name. */
export const DIRECT = "direct";

export type Touch = { source: string; medium: string; campaign: string };

export type Channel = {
  last: string;
  medium: string;
  campaign: string;
  lastAt: number;
  first: string;
  firstAt: number;
};

export function channelCookieName(handle: string): string {
  return `nl_ch_${handle.replace(/[^a-z0-9._-]/g, "")}`;
}

function tidy(raw: string | null | undefined, max: number): string {
  return (raw ?? "").trim().toLowerCase().replace(/[^a-z0-9._-]/g, "").slice(0, max);
}

/**
 * The channel of one page request, or null when it came from nowhere nameable
 * (typed, bookmarked, from the store's own pages) or was not a person.
 */
export function touchFrom(input: { url: URL; referrer: string; userAgent: string; ownHost: string }): Touch | null {
  if (isBot(input.userAgent)) return null;
  const params = input.url.searchParams;
  const source = tidy(
    classifySource({ referrer: input.referrer, utm: params.get("utm_source") ?? "", userAgent: input.userAgent, ownHost: input.ownHost }),
    60,
  );
  if (!source || source === DIRECT) return null;
  return { source, medium: tidy(params.get("utm_medium"), 30), campaign: tidy(params.get("utm_campaign"), 40) };
}

/** What the cookie holds, or null when it is absent, broken, or older than the window. */
export function readChannelCookie(value: string | undefined, nowSeconds: number): Channel | null {
  if (!value) return null;
  const parts = value.split("~");
  if (parts.length !== 6) return null;
  const [last, medium, campaign, lastAtRaw, first, firstAtRaw] = parts;
  const lastAt = Number(lastAtRaw);
  const firstAt = Number(firstAtRaw);
  if (!last || !Number.isFinite(lastAt) || !Number.isFinite(firstAt)) return null;
  if (tidy(last, 60) !== last || tidy(first, 60) !== first) return null;
  if (nowSeconds - lastAt > CHANNEL_COOKIE_SECONDS || lastAt > nowSeconds + 300) return null;
  const firstFresh = first && nowSeconds - firstAt <= FIRST_CHANNEL_DAYS * 86400;
  return {
    last,
    medium: tidy(medium, 30),
    campaign: tidy(campaign, 40),
    lastAt,
    first: firstFresh ? first : last,
    firstAt: firstFresh ? firstAt : lastAt,
  };
}

/** The cookie after a visit from `touch`: the latest channel replaced, the first one kept. */
export function nextChannelCookie(existing: string | undefined, touch: Touch, nowSeconds: number): string {
  const at = Math.floor(nowSeconds);
  const before = readChannelCookie(existing, at);
  const first = before?.first ?? touch.source;
  const firstAt = before?.firstAt ?? at;
  return [touch.source, touch.medium, touch.campaign, at, first, firstAt].join("~");
}

/**
 * The channel a checkout is credited to, from the tags on the page the buyer
 * pressed the button on and the remembered channel. Tags the creator put on
 * that very page win, because they are the most specific thing there is;
 * otherwise the remembered channel; otherwise direct.
 */
export function channelForSale(page: CameFrom, remembered: Channel | null): {
  channel: string;
  first: string;
  medium: string;
  campaign: string;
} {
  if (page.source) {
    return { channel: page.source, first: remembered?.first || page.source, medium: page.medium, campaign: page.campaign };
  }
  if (remembered) {
    return { channel: remembered.last, first: remembered.first || remembered.last, medium: remembered.medium, campaign: remembered.campaign };
  }
  return { channel: DIRECT, first: DIRECT, medium: page.medium, campaign: page.campaign };
}

/** The Stripe metadata a checkout and its subscription carry for the channel. */
export function channelMetadata(sale: ReturnType<typeof channelForSale>): Record<string, string> {
  const meta: Record<string, string> = { channel: sale.channel, channel_first: sale.first };
  if (sale.medium) meta.channel_medium = sale.medium;
  if (sale.campaign) meta.channel_campaign = sale.campaign;
  return meta;
}

/**
 * The channel metadata for a checkout opened by this request: the tags on the
 * page the button was pressed on (its Referer), and the channel remembered in
 * this store's cookie. Every route that opens a checkout calls this, so a
 * product, a cart, a call, a package and a tip are credited the same way.
 */
export function channelOfRequest(
  request: { headers: Headers; cookies: { get(name: string): { value: string } | undefined } },
  handle: string,
  ownHost: string,
  nowSeconds = Date.now() / 1000,
): Record<string, string> {
  const page = cameFrom(request.headers.get("referer"), ownHost);
  const remembered = readChannelCookie(request.cookies.get(channelCookieName(handle))?.value, nowSeconds);
  return channelMetadata(channelForSale(page, remembered));
}
