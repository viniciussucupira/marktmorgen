/**
 * A cover made in the studio (added 11 October 2026), for a product that has
 * no picture yet, or one the creator would rather replace.
 *
 * Read before it was built: Stan's help center (October 11, 2026) has the
 * creator select an image of their own, 400 by 400, and makes none. A
 * product with a picture gets a card with a cover
 * on the store page and a picture when its link is shared; one without shows
 * a plain button. So this draws one, in the store's own color and letters,
 * from the words the creator chooses: the title, a short line above it (what
 * kind of thing it is) and a line under it.
 *
 * Six designs, each one only shapes and words, drawn in the creator's browser
 * on a canvas and sent through the same door as a picture they picked
 * themselves (components/product-image-editor.tsx): shrunk, checked by its
 * first bytes, kept in the store's picture folder. Nothing is downloaded from
 * anywhere to draw it, and no picture of anybody else is used.
 *
 * What is decided here, apart from the drawing, so it can be tested: which
 * line goes above the title, in the store's language; how big the title is
 * set so it fits; and colors whose words stay readable on whatever the
 * creator's color is (WCAG AA, 4.5 to 1, for every word on every design).
 *
 * Browser-safe.
 */
import { contrast, mix } from "@/lib/store-look";
import type { LanguageCode } from "@/lib/store-language";

/** The size a cover is drawn at: 4 to 5, the shape of a book and of a phone's card. */
export const COVER_WIDTH = 1200;
export const COVER_HEIGHT = 1500;

export const MAX_COVER_TITLE = 80;
export const MAX_COVER_LABEL = 32;
export const MAX_COVER_SUB = 120;

/** The least contrast any word on a cover has against what is behind it. */
export const COVER_MIN_CONTRAST = 4.5;

export const COVER_DESIGNS = [
  { id: "book", label: "Book" },
  { id: "glow", label: "Glow" },
  { id: "split", label: "Split" },
  { id: "frame", label: "Frame" },
  { id: "stripes", label: "Stripes" },
  { id: "dots", label: "Dots" },
] as const;

export type CoverDesign = (typeof COVER_DESIGNS)[number]["id"];

export function isCoverDesign(value: unknown): value is CoverDesign {
  return COVER_DESIGNS.some((design) => design.id === value);
}

export type CoverKind = "ebook" | "course" | "membership" | "call" | "podcast" | "bundle" | "download" | "none";

/** The line above the title, in each language a store speaks to its buyers in. */
const KIND_WORDS: Record<LanguageCode, Record<Exclude<CoverKind, "none">, string>> = {
  en: { ebook: "Ebook", course: "Online course", membership: "Membership", call: "1:1 session", podcast: "Private podcast", bundle: "Bundle", download: "Digital download" },
  es: { ebook: "Ebook", course: "Curso online", membership: "Membresía", call: "Sesión 1:1", podcast: "Podcast privado", bundle: "Pack", download: "Descarga digital" },
  fr: { ebook: "E-book", course: "Formation en ligne", membership: "Abonnement", call: "Séance individuelle", podcast: "Podcast privé", bundle: "Pack", download: "Fichier numérique" },
  de: { ebook: "E-Book", course: "Onlinekurs", membership: "Mitgliedschaft", call: "1:1-Sitzung", podcast: "Privater Podcast", bundle: "Paket", download: "Digitaler Download" },
  it: { ebook: "Ebook", course: "Corso online", membership: "Abbonamento", call: "Sessione 1:1", podcast: "Podcast privato", bundle: "Pacchetto", download: "Download digitale" },
  nl: { ebook: "E-book", course: "Online cursus", membership: "Lidmaatschap", call: "1-op-1-sessie", podcast: "Privépodcast", bundle: "Bundel", download: "Digitale download" },
  pt: { ebook: "E-book", course: "Curso online", membership: "Subscrição", call: "Sessão individual", podcast: "Podcast privado", bundle: "Pacote", download: "Ficheiro digital" },
};

/** The facts about a product that say what kind of thing it is. */
export type CoverProduct = {
  recurring?: unknown;
  call?: unknown;
  course?: unknown;
  podcast?: unknown;
  bundle?: unknown;
  shipping?: unknown;
  file?: { name?: string; contentType?: string } | null;
  link?: string | null;
};

/** What kind of thing a product is, for the line above its title. A product posted to the buyer says nothing: it is a thing, and the creator names it. */
export function coverKind(product: CoverProduct): CoverKind {
  if (product.shipping) return "none";
  if (product.course) return "course";
  if (product.podcast) return "podcast";
  if (product.recurring) return "membership";
  if (product.call) return "call";
  if (product.bundle) return "bundle";
  const file = product.file;
  if (file) {
    const name = (file.name ?? "").toLowerCase();
    if (file.contentType === "application/pdf" || file.contentType === "application/epub+zip" || /\.(pdf|epub)$/.test(name)) return "ebook";
    return "download";
  }
  return "none";
}

/** The line above the title, in the store's language; "" when the product's kind does not name itself. */
export function coverLabel(product: CoverProduct, language: LanguageCode): string {
  const kind = coverKind(product);
  return kind === "none" ? "" : (KIND_WORDS[language] ?? KIND_WORDS.en)[kind];
}

/** Words as typed, made safe to draw: one line, no control characters, at most `max` characters. */
export function coverText(raw: unknown, max: number): string {
  if (typeof raw !== "string") return "";
  return Array.from(raw.replace(/[\u0000-\u001f\u007f]/g, " ").replace(/\s+/g, " ").trim()).slice(0, max).join("");
}

/** How wide a run of text is at a size, as the canvas measures it. */
export type Measure = (text: string, size: number) => number;

export type FittedText = { size: number; lines: string[] };

/** Splits one word too wide for a line into pieces that each fit. */
function splitWord(word: string, size: number, width: number, measure: Measure): string[] {
  const pieces: string[] = [];
  let piece = "";
  for (const char of Array.from(word)) {
    if (piece && measure(`${piece}${char}`, size) > width) {
      pieces.push(piece);
      piece = char;
    } else {
      piece += char;
    }
  }
  if (piece) pieces.push(piece);
  return pieces;
}

/** Words set in lines no wider than `width`, a word moved whole to the next line, and only a word wider than a line broken. */
export function wrapText(text: string, size: number, width: number, measure: Measure): string[] {
  const lines: string[] = [];
  let line = "";
  for (const word of text.split(" ").filter(Boolean)) {
    const candidate = line ? `${line} ${word}` : word;
    if (measure(candidate, size) <= width) {
      line = candidate;
      continue;
    }
    if (line) lines.push(line);
    if (measure(word, size) <= width) {
      line = word;
    } else {
      const pieces = splitWord(word, size, width, measure);
      lines.push(...pieces.slice(0, -1));
      line = pieces.at(-1) ?? "";
    }
  }
  if (line) lines.push(line);
  return lines;
}

/**
 * The largest size, from `max` down to `min` in steps of 4, at which the
 * text fits in `maxLines` lines of `width`. When even the smallest does not,
 * the smallest is used and the last line ends with an ellipsis that fits.
 */
export function fitText(text: string, width: number, maxLines: number, max: number, min: number, measure: Measure): FittedText {
  for (let size = max; size >= min; size -= 4) {
    const lines = wrapText(text, size, width, measure);
    if (lines.length <= maxLines) return { size, lines };
  }
  const lines = wrapText(text, min, width, measure).slice(0, maxLines);
  if (lines.length) {
    let last = lines[lines.length - 1];
    while (last && measure(`${last}…`, min) > width) last = Array.from(last).slice(0, -1).join("").trimEnd();
    lines[lines.length - 1] = `${last}…`;
  }
  return { size: min, lines };
}

const WHITE = "#ffffff";
const BLACK = "#000000";
const INK = "#16131f";
const PAPER = "#fbf8f3";

/** The color of words on a background: near-black or white, whichever reads better there. */
export function inkOn(background: string): string {
  return contrast(INK, background) >= contrast(WHITE, background) ? INK : WHITE;
}

/** The background moved toward black, a step at a time, until `ink` on it reaches the contrast every cover keeps. */
function darkenUntil(background: string, ink: string): string {
  for (let step = 0; step <= 40; step += 1) {
    const candidate = mix(background, BLACK, step / 40);
    if (contrast(candidate, ink) >= COVER_MIN_CONTRAST) return candidate;
  }
  return BLACK;
}

/** A color moved toward black until it reads on `background`, for words in the creator's color on paper or a tint. */
function readableOn(color: string, background: string): string {
  for (let step = 0; step <= 40; step += 1) {
    const candidate = mix(color, BLACK, step / 40);
    if (contrast(candidate, background) >= COVER_MIN_CONTRAST) return candidate;
  }
  return INK;
}

export type CoverColors = {
  /**
   * The creator's color as a ground for words, and those words: white on a
   * color dark enough for it, near-black on one light enough, and only when
   * neither reads, the color deepened as far as white needs.
   */
  solid: string;
  solidInk: string;
  /** Shapes drawn behind words on `solid`: darker under white words, lighter under dark ones, so they only ever add contrast. */
  solidShade: string;
  /** A darker band of it, for a book's spine and shadows. */
  spine: string;
  /** Almost black, tinted with the creator's color; and the words on it. */
  deep: string;
  deepInk: string;
  /**
   * The light behind words on `deep`: the creator's color, deepened where
   * white would not read on it. Both it and `deep` hold white words at 4.5
   * to 1, and so does every blend of the two, so a word over any part of the
   * glow still reads.
   */
  glow: string;
  /** Paper, and the words on it: the title in near-black, a line in the creator's color. */
  paper: string;
  paperInk: string;
  paperAccent: string;
  /** A light wash of the creator's color, and the words on it. */
  tint: string;
  tintInk: string;
  tintAccent: string;
  /** The creator's color as picked, for shapes that carry no words. */
  accent: string;
  /** A lighter step of it, for patterns. */
  light: string;
};

/** Every color a cover uses, from the store's color, with each word on it readable. */
export function coverColors(accent: string): CoverColors {
  const white = contrast(accent, WHITE) >= COVER_MIN_CONTRAST;
  const dark = !white && contrast(accent, INK) >= COVER_MIN_CONTRAST;
  const solid = white || dark ? accent : darkenUntil(accent, WHITE);
  const solidInk = dark ? INK : WHITE;
  // The glow behind white words on `deep` is always a color white reads on.
  const glow = contrast(accent, WHITE) >= COVER_MIN_CONTRAST ? accent : darkenUntil(accent, WHITE);
  const deep = mix(accent, "#07060d", 0.86);
  const tint = mix(accent, WHITE, 0.88);
  return {
    solid,
    solidInk,
    solidShade: dark ? mix(solid, WHITE, 0.35) : mix(solid, BLACK, 0.3),
    spine: mix(solid, BLACK, 0.3),
    deep,
    deepInk: WHITE,
    glow,
    paper: PAPER,
    paperInk: INK,
    paperAccent: readableOn(accent, PAPER),
    tint,
    tintInk: INK,
    tintAccent: readableOn(accent, tint),
    accent,
    light: mix(accent, WHITE, 0.35),
  };
}

/** A number from the words, so two products' covers of one design are not drawn the same. */
export function coverSeed(text: string): number {
  let hash = 2166136261;
  for (const char of text) {
    hash ^= char.codePointAt(0) ?? 0;
    hash = Math.imul(hash, 16777619) >>> 0;
  }
  return hash;
}
