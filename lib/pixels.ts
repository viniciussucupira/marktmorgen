/**
 * The ad pixels a creator can put on their store: which ones, and what an id
 * for each is allowed to look like.
 *
 * An id ends up inside a script on a public page, so each one is held to the
 * exact shape its platform hands out. Nothing that could close a string or
 * open a tag can pass, whatever the studio sent.
 *
 * Pure, so the studio's form can use the same rules in the browser that the
 * server enforces.
 */

export type PixelKind = "meta" | "google" | "tiktok" | "pinterest";

export type Pixels = Record<PixelKind, string | null>;

export const NO_PIXELS: Pixels = { meta: null, google: null, tiktok: null, pinterest: null };

export const PIXEL_KINDS: PixelKind[] = ["meta", "google", "tiktok", "pinterest"];

export const PIXEL_INFO: Record<
  PixelKind,
  { name: string; label: string; example: string; where: string; pattern: RegExp }
> = {
  meta: {
    name: "Meta",
    label: "Meta Pixel ID",
    example: "123456789012345",
    where: "Meta Events Manager, under Data sources: the number under the pixel's name.",
    pattern: /^\d{10,20}$/,
  },
  google: {
    name: "Google",
    label: "Google tag ID",
    example: "G-AB12CD34EF",
    where: "Google Analytics or Google Ads, under the Google tag: it starts with G- or AW-.",
    pattern: /^(G|AW|GT|DC)-[A-Z0-9]{4,20}$/,
  },
  tiktok: {
    name: "TikTok",
    label: "TikTok Pixel ID",
    example: "C4ABCDEFGH1234567890",
    where: "TikTok Ads Manager, under Assets, Events, Web events: the ID next to the pixel.",
    pattern: /^[A-Z0-9]{15,25}$/,
  },
  pinterest: {
    name: "Pinterest",
    label: "Pinterest Tag ID",
    example: "2612345678901",
    where: "Pinterest Ads, under Conversions: the number of your tag.",
    pattern: /^\d{10,16}$/,
  },
};

/** Tidies what a person pasted: spaces around it, and letters in the case the platform uses. */
export function tidyPixelId(kind: PixelKind, raw: unknown): string {
  if (typeof raw !== "string") return "";
  const text = raw.trim();
  return kind === "google" || kind === "tiktok" ? text.toUpperCase() : text;
}

/**
 * Reads a set of ids sent from the studio.
 *
 * An empty field means that pixel is off. Any other value has to match its
 * platform's shape exactly, or the whole set is refused with the one at fault.
 */
export function readPixels(raw: unknown): { ok: true; pixels: Pixels } | { ok: false; bad: PixelKind } {
  const value = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const pixels: Pixels = { ...NO_PIXELS };
  for (const kind of PIXEL_KINDS) {
    const id = tidyPixelId(kind, value[kind]);
    if (!id) continue;
    if (!PIXEL_INFO[kind].pattern.test(id)) return { ok: false, bad: kind };
    pixels[kind] = id;
  }
  return { ok: true, pixels };
}

/** Whatever came back from storage, made safe to put on a page. */
export function parsePixels(raw: unknown): Pixels {
  const read = readPixels(raw);
  if (read.ok) return read.pixels;
  // A stored value that no longer passes is dropped on its own, not with the rest.
  const value = raw && typeof raw === "object" ? (raw as Record<string, unknown>) : {};
  const pixels: Pixels = { ...NO_PIXELS };
  for (const kind of PIXEL_KINDS) {
    const id = tidyPixelId(kind, value[kind]);
    if (id && PIXEL_INFO[kind].pattern.test(id)) pixels[kind] = id;
  }
  return pixels;
}

export function hasPixels(pixels: Pixels): boolean {
  return PIXEL_KINDS.some((kind) => pixels[kind] !== null);
}

/** "Meta, Google and TikTok". */
export function pixelNames(pixels: Pixels): string {
  const names = PIXEL_KINDS.filter((kind) => pixels[kind]).map((kind) => PIXEL_INFO[kind].name);
  if (names.length <= 1) return names.join("");
  return `${names.slice(0, -1).join(", ")} and ${names[names.length - 1]}`;
}

/**
 * Where a visitor has to say yes before an ad pixel may run: the European
 * Economic Area, the United Kingdom and Switzerland, whose cookie rules ask for
 * consent first, and Brazil, whose regulator reads its law the same way for
 * advertising cookies. Everywhere else the pixels run unless the browser sends
 * Global Privacy Control, which is the visitor saying no in advance.
 */
export const CONSENT_COUNTRIES = new Set([
  "AT", "BE", "BG", "HR", "CY", "CZ", "DK", "EE", "FI", "FR", "DE", "GR", "HU", "IE", "IT", "LV", "LT", "LU",
  "MT", "NL", "PL", "PT", "RO", "SK", "SI", "ES", "SE", "IS", "LI", "NO", "GB", "CH", "BR",
]);

/** Whether a visitor from this country is asked first. Unknown means ask. */
export function needsConsent(country: string | null | undefined): boolean {
  if (!country || !/^[A-Z]{2}$/.test(country)) return true;
  return CONSENT_COUNTRIES.has(country);
}

/** A browser-wide refusal wins over a previous per-store yes; unknown choices never become consent. */
export function pixelChoiceState(choice:unknown,askFirst:boolean,gpc:boolean):"on"|"off"|"ask"{
 if(gpc||choice==="no")return "off";
 if(choice==="yes")return "on";
 return askFirst?"ask":"on";
}
