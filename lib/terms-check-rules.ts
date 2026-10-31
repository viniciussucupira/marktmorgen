/**
 * Warnings about the terms, refund policy and description a creator wrote or
 * pasted for a product (493 [DE2], the complement to 98
 * [D2-COMPLIANCE-REVIEW]), unit 1: the rule only. Nothing calls it yet; the
 * studio shows the warnings before a product is published, and applies a
 * suggested fix only when the creator approves it, in the next unit.
 *
 * Pure and fixed: no model, no request, nothing changed. Each warning carries
 * the passage it is about, the reason in plain words and a suggested fix. It
 * flags; it does not decide that a text is unlawful. What it looks for:
 *   - another company or site named in the text (a host that is not the
 *     creator's own, or a platform for selling creator products): terms
 *     copied from elsewhere often describe rules that do not apply here;
 *   - a price in the text that is not the price the page and checkout show;
 *   - "no refunds" or the like, when the product is sold where the checkout's
 *     immediate-access consent (item 91, lib/digital-consent.ts) does not
 *     apply to it: a buyer in the EU or the UK usually has 14 days to cancel,
 *     as the Help says (lib/help-content.ts, EU withdrawal);
 *   - a promise of earnings, income or results;
 *   - urgency or scarcity with no real deadline or stock limit behind it;
 *   - resale or private label rights, which the Terms allow only under a
 *     license the creator keeps (app/terms/page.tsx, "Content sold with
 *     resale rights").
 * A sentence that says the opposite is never warned, because the fix would
 * tell the creator to delete a protective sentence: a negation in the same
 * clause before the words ("No resale rights", "we do not guarantee any
 * income") or after them ("resale rights are not included"), and a refund
 * rule that keeps the 14 days ("no refunds after 30 days", or the text
 * saying buyers may cancel within 14 days). Ordinary product text is left
 * alone: well-known tools a product is made with or delivered on
 * (TOOL_HOSTS), a short domain ending only when written as an address
 * (with "https://", "www." or a path), the creator's own community or tip
 * page ("my Patreon"), amounts that are shipping, tax, a fee or a stated
 * value, and a countdown that is a product rather than a timer.
 * The text read is capped at MAX_TEXT characters and the warnings at
 * MAX_WARNINGS, so a pasted book costs a bounded amount of work.
 */

export const MAX_TEXT = 60_000;
export const MAX_WARNINGS = 30;
/** Characters shown on each side of a passage. */
const AROUND = 40;

export type TermsWarningKind = "other_company" | "price_mismatch" | "no_refunds" | "earnings_claim" | "false_urgency" | "resale_rights";

export type TermsWarning = { kind: TermsWarningKind; excerpt: string; why: string; fix: string };

export type TermsCheckInput = {
  /** The terms, refund policy and description, as the creator wrote them. */
  text: string;
  /** The creator's own hosts (their store address and any domain of theirs), without "www.". */
  ownHosts: readonly string[];
  /** The price the page and checkout show, in the smallest unit; null when the product is free or has several prices. */
  priceCents: number | null;
  /** The checkout's currency, lowercase. Only "usd" amounts written with "$" are compared. */
  currency: string;
  /** Whether the checkout's immediate-access consent (item 91) applies to this product (digital content, not a membership). */
  immediateAccessConsent: boolean;
  /** Whether the product has a real end date or sale deadline set in the studio. */
  realDeadline: boolean;
  /** Whether the product has a real stock or seat limit set in the studio. */
  realStockLimit: boolean;
  /** Whether the creator has said they hold a license to sell this content (the Terms' resale rule). */
  resaleLicense: boolean;
};

const OUR_HOSTS = new Set(["marktmorgen.com"]);

/** Tools a creator's product is made with or delivered on: naming one is not terms copied from another site. */
const TOOL_HOSTS: readonly string[] = [
  "canva.com", "notion.so", "notion.site", "notion.com", "zoom.us", "zoom.com", "youtube.com", "youtu.be", "vimeo.com", "loom.com",
  "google.com", "dropbox.com", "figma.com", "airtable.com", "trello.com", "miro.com", "calendly.com", "discord.com", "discord.gg",
  "slack.com", "github.com", "instagram.com", "tiktok.com", "facebook.com", "x.com", "twitter.com", "linkedin.com", "pinterest.com",
  "spotify.com", "apple.com", "microsoft.com", "adobe.com", "wikipedia.org",
];
/** Endings that are also short words or abbreviations: a site only when written as an address. */
const SHORT_ENDINGS = new Set(["so", "me", "ai", "us", "de", "fr", "ca", "co", "uk", "eu", "app"]);

/** Platforms that sell creator products: naming one in terms usually means the text came from there. */
const PLATFORMS: readonly RegExp[] = [
  /\bgumroad\b/i,
  /\bkajabi\b/i,
  /\bteachable\b/i,
  /\bthinkific\b/i,
  /\bpodia\b/i,
  /\bpayhip\b/i,
  /\bstan store\b/i,
  /\bstan\.store\b/i,
  /\bsysteme\.io\b/i,
  /\bclickfunnels\b/i,
  /\bsellfy\b/i,
  /\blemon squeezy\b/i,
];

const HOST = /\b(?:https?:\/\/)?((?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+(?:com|net|org|io|co|store|shop|app|me|so|ai|uk|de|fr|ca|us|eu))\b/gi;

const NO_REFUNDS = /\b(no refunds?|non[- ]?refundable|all sales (?:are )?final|refunds? (?:are|is|will) not (?:be )?(?:offered|available|accepted|given|issued|possible))\b/gi;

const EARNINGS: readonly RegExp[] = [
  /\bguarantee[ds]? (?:\w+ ){0,2}(?:income|results|sales|profits?|returns|earnings|clients)\b/gi,
  /\b(?:earn|make|made|making)\s+(?:up to\s+|over\s+)?\$\s?\d[\d,]*(?:k\b)?/gi,
  /\bget rich\b/gi,
  /\bpassive income\b/gi,
  /\bfinancial freedom\b/gi,
  /\breplace your (?:job|income|salary)\b/gi,
  /\b(?:six|seven)[- ]figures?\b/gi,
];

const URGENCY_TIME = /\b(limited time|ends (?:today|tonight|soon|at midnight)|today only|last chance|price (?:goes|will go) up|before the timer (?:runs out|ends)|act now|hurry)\b/gi;
const URGENCY_STOCK = /\b(only \d+ (?:left|spots?|seats?|copies|places)|limited (?:spots|seats|copies|places)|selling fast|almost sold out)\b/gi;

const RESALE = /\b(resell(?:ing)? rights?|resale rights?|master resell(?:ing)? rights?|PLR|private label rights?|white[- ]label rights?)\b/gi;

const MONEY = /\$\s?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{2}))?(?!\d)/g;
/** A word saying what follows is the price, just before the amount. */
const PRICE_WORD = /\b(price|priced|costs?|pay|paying|only|just|for)\b[^.!?;\n$]{0,12}$/i;
/** An amount that is not the product's price: shipping, tax, a fee, a stated value, a saving. */
const NOT_PRICE_BEFORE = /\b(shipping|delivery|postage|tax|taxes|fees?|save|saving|savings|worth|valued at|refunds?|deposit|tip|bonus)\b[^.!?;\n$]{0,16}$/i;
const NOT_PRICE_AFTER = /^\S*\s*(?:\)|,)?\s*(value|worth|off|discount|shipping|tax|fee|deposit|bonus)\b/i;

/** A word that says the opposite, in the clause before the words. */
const NEGATION = /\b(no|not|never|nor|without|cannot|can't|don't|doesn't|won't|isn't|aren't|didn't|neither|none|excludes?|excluding|make no|makes no)\b/i;
/** A negation in the clause after the words ("resale rights are not included"). */
const NEGATED_AFTER = /^[^.!?;:,\n]{0,30}?\b(?:not (?:included|granted|given|allowed|permitted|offered|transferable|available)|prohibited|forbidden|excluded)\b/i;
/** The text keeps a buyer's 14 days: "cancel within 14 days", "a 14-day refund". */
const KEEPS_14_DAYS = /\b(?:cancel|withdraw|refund|return)\w*\b[^.!?\n]{0,60}?\bwithin (?:(\d+)|fourteen|thirty|30|sixty)[- ]days?\b|\b(?:(\d+)|fourteen|thirty|sixty)[- ]days? (?:money[- ]back|refund|return|cooling[- ]off|right to cancel)/i;
const AFTER_DAYS = /^[^.!?;\n]{0,40}?\bafter (?:(\d+)|fourteen|thirty|sixty) days\b/i;

/** The clause the words are in, before them (back to . ! ? ; : , or a new line), at most its last six words. */
function negatedBefore(text: string, index: number): boolean {
  const before = text.slice(Math.max(0, index - 120), index).replace(/\u2019/g, "'");
  const clause = before.split(/[.!?;:,\n]/).pop() ?? "";
  return NEGATION.test(clause.trim().split(/\s+/).slice(-6).join(" "));
}
function negated(text: string, index: number, length: number): boolean {
  return negatedBefore(text, index) || NEGATED_AFTER.test(text.slice(index + length, index + length + 60).replace(/\u2019/g, "'"));
}
const daysOf = (m: RegExpMatchArray | RegExpExecArray | null): number => {
  if (!m) return 0;
  const n = m.slice(1).find((g) => g !== undefined);
  if (n) return Number(n);
  return /fourteen/i.test(m[0]) ? 14 : /sixty/i.test(m[0]) ? 60 : 30;
};

function excerptAt(text: string, index: number, length: number): string {
  const start = Math.max(0, index - AROUND);
  const end = Math.min(text.length, index + length + AROUND);
  return `${start > 0 ? "…" : ""}${text.slice(start, end).replace(/\s+/g, " ").trim()}${end < text.length ? "…" : ""}`;
}

function bareHost(host: string): string {
  return host.toLowerCase().replace(/^www\./, "");
}

function ownsHost(host: string, own: Set<string>): boolean {
  const h = bareHost(host);
  for (const o of own) if (h === o || h.endsWith(`.${o}`)) return true;
  return false;
}

export function checkCreatorTerms(input: TermsCheckInput): TermsWarning[] {
  const text = typeof input.text === "string" ? input.text.slice(0, MAX_TEXT) : "";
  const out: TermsWarning[] = [];
  const seen = new Set<string>();
  const add = (kind: TermsWarningKind, index: number, length: number, why: string, fix: string) => {
    const key = `${kind}:${text.slice(index, index + length).toLowerCase()}`;
    if (seen.has(key) || out.length >= MAX_WARNINGS) return;
    seen.add(key);
    out.push({ kind, excerpt: excerptAt(text, index, length), why, fix });
  };
  const own = new Set([...input.ownHosts.map(bareHost), ...OUR_HOSTS]);

  for (const m of text.matchAll(HOST)) {
    const at = m.index ?? 0;
    if (m[0].includes("@") || text[at - 1] === "@") continue;
    // Written in capitals ("it.So"), a sentence run together, not an address.
    if (m[1] !== m[1].toLowerCase() && !/^https?:\/\//i.test(m[0])) continue;
    const ending = m[1].toLowerCase().split(".").pop() ?? "";
    const asAddress = /^https?:\/\//i.test(m[0]) || /^www\./i.test(m[1]) || text[at + m[0].length] === "/";
    if (SHORT_ENDINGS.has(ending) && !asAddress) continue;
    if (ownsHost(m[1], own) || ownsHost(m[1], new Set(TOOL_HOSTS))) continue;
    add("other_company", m.index ?? 0, m[0].length,
      `This names ${bareHost(m[1])}, which is not your site. Terms copied from another site may describe rules that do not apply to this store.`,
      "Remove the other site, or replace it with your store's own address.");
  }
  for (const pattern of PLATFORMS) {
    const m = pattern.exec(text);
    if (!m) continue;
    // The creator's own page there, or a line saying the store is not that company.
    if (/\b(my|our)\s+$/i.test(text.slice(Math.max(0, m.index - 12), m.index)) || negatedBefore(text, m.index)) continue;
    add("other_company", m.index, m[0].length,
      `This names ${m[0]}, another company. Terms written for another platform may describe rules that do not apply here.`,
      "Remove the other company's name, and check that each rule describes how this store works.");
  }

  if (input.currency === "usd" && input.priceCents !== null && Number.isSafeInteger(input.priceCents)) {
    for (const m of text.matchAll(MONEY)) {
      const index = m.index ?? 0;
      const before = text.slice(Math.max(0, index - 30), index);
      const after = text.slice(index + m[0].length, index + m[0].length + 20);
      if (!PRICE_WORD.test(before) || NOT_PRICE_BEFORE.test(before) || NOT_PRICE_AFTER.test(after)) continue;
      const cents = Number(m[1].replace(/,/g, "")) * 100 + (m[2] ? Number(m[2]) : 0);
      if (cents === input.priceCents) continue;
      add("price_mismatch", index, m[0].length,
        `This says ${m[0].replace(/\s/g, "")}, but the page and checkout show ${formatUsd(input.priceCents)}. A buyer may expect the price written here.`,
        `Change it to ${formatUsd(input.priceCents)}, or remove the amount.`);
    }
  }

  // The text itself keeps the 14 days somewhere: a "no refunds" beside it is the rule after them.
  if (!input.immediateAccessConsent && daysOf(KEEPS_14_DAYS.exec(text)) < 14) {
    for (const m of text.matchAll(NO_REFUNDS)) {
      const after = AFTER_DAYS.exec(text.slice((m.index ?? 0) + m[0].length));
      if (after && daysOf(after) >= 14) continue;
      add("no_refunds", m.index ?? 0, m[0].length,
        "In the EU, the UK and some other places, a buyer online usually has 14 days to cancel. The checkout's agreement to start access at once does not cover this product, so this sentence may not hold for those buyers.",
        "Say that buyers in the EU and the UK can cancel within 14 days, or remove this sentence.");
    }
  }

  for (const pattern of EARNINGS) {
    for (const m of text.matchAll(pattern)) {
      if (negated(text, m.index ?? 0, m[0].length)) continue;
      add("earnings_claim", m.index ?? 0, m[0].length,
        "This promises earnings, income or results. A promise like this needs proof that typical buyers get it, and results depend on the buyer.",
        "Describe what the product contains and teaches, without promising a result.");
    }
  }

  if (!input.realDeadline) {
    for (const m of text.matchAll(URGENCY_TIME)) {
      if (negated(text, m.index ?? 0, m[0].length)) continue;
      add("false_urgency", m.index ?? 0, m[0].length,
        "This says time is running out, but no end date or sale deadline is set for this product.",
        "Set a real end date in the studio, or remove this sentence.");
    }
  }
  if (!input.realStockLimit) {
    for (const m of text.matchAll(URGENCY_STOCK)) {
      if (negated(text, m.index ?? 0, m[0].length)) continue;
      add("false_urgency", m.index ?? 0, m[0].length,
        "This says few are left, but no stock or seat limit is set for this product.",
        "Set a real limit in the studio, or remove this sentence.");
    }
  }

  if (!input.resaleLicense) {
    for (const m of text.matchAll(RESALE)) {
      if (negated(text, m.index ?? 0, m[0].length)) continue;
      add("resale_rights", m.index ?? 0, m[0].length,
        "This mentions resale or private label rights. Our Terms allow selling such content only under a license that lets you sell it this way, which you keep and show on request.",
        "Confirm in the studio that you hold that license, or remove this sentence.");
    }
  }
  return out;
}

function formatUsd(cents: number): string {
  const dollars = Math.floor(cents / 100);
  const rest = cents % 100;
  return `$${dollars.toLocaleString("en-US")}${rest ? `.${String(rest).padStart(2, "0")}` : ""}`;
}
