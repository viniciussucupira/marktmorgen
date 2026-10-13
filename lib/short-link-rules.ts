/**
 * The rules of short links for posts (lib/short-links.ts keeps them): what a
 * link's name, place and destination may be, and where it sends the person.
 * Pure, so the studio's page and the server read them the same way.
 */
import { POST_PLACES } from "@/lib/share-links";
import { SITE_URL } from "@/lib/site-url";

/** The letters a code is made of: none of 0, o, 1, l or i, which are misread from a slide or a flyer. */
export const CODE_LETTERS = "abcdefghjkmnpqrstuvwxyz23456789";
export const CODE = /^[abcdefghjkmnpqrstuvwxyz23456789]{6}$/;
export const MAX_LINKS = 100;
/** A post's name as the numbers count a utm_campaign (lib/source-rules.ts, cleanTag): thirty characters. */
export const MAX_NAME = 30;
/** How long the CDN keeps a link's answer. */
export const CACHE_SECONDS = 300;

export type LinkTarget = { kind: "store" } | { kind: "product"; id: string };

export type ShortLink = {
  code: string;
  /** The post's name, its utm_campaign: "october-reel". */
  name: string;
  /** Where it was posted, its utm_source: "instagram". */
  place: string;
  target: LinkTarget;
  made: number;
};

/** The short address of a link. */
export const shortUrl = (code: string) => `${SITE_URL}/l/${code}`;

/** A post's name as it is counted, or empty. Pure. */
export function linkName(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw
    .normalize("NFKD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9._-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, MAX_NAME)
    .replace(/-+$/, "");
}

/** Where it was posted, from the places offered; "other" for anything else. Pure. */
export function linkPlace(raw: unknown): string {
  return typeof raw === "string" && POST_PLACES.some((p) => p.place === raw) ? raw : "other";
}

/** Where a link goes, made whole, or null. `isProduct` says whether the store has that product. Pure. */
export function readTarget(raw: unknown, isProduct: (id: string) => boolean): LinkTarget | null {
  if (!raw || typeof raw !== "object") return null;
  const v = raw as Record<string, unknown>;
  if (v.kind === "store") return { kind: "store" };
  if (v.kind === "product" && typeof v.id === "string" && v.id.length <= 64 && isProduct(v.id)) return { kind: "product", id: v.id };
  return null;
}

/**
 * Where a link sends the person: the store's address (its own domain when it
 * has one) and the page, tagged with where it was posted and the post's name.
 * Pure.
 */
export function landingUrl(base: string, link: Pick<ShortLink, "name" | "place" | "target">): string {
  const page = link.target.kind === "product" ? `${base}/p/${encodeURIComponent(link.target.id)}` : base;
  const params = new URLSearchParams({ utm_source: link.place, utm_medium: "post", utm_campaign: link.name });
  return `${page}?${params.toString()}`;
}
