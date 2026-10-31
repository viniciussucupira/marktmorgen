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
  /\bko-fi\b/i,
  /\bpatreon\b/i,
  /\bskool\b/i,
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

const URGENCY_TIME = /\b(limited time|ends (?:today|tonight|soon|at midnight)|today only|last chance|price (?:goes|will go) up|countdown|act now|hurry)\b/gi;
const URGENCY_STOCK = /\b(only \d+ (?:left|spots?|seats?|copies|places)|limited (?:spots|seats|copies|places)|selling fast|almost sold out)\b/gi;

const RESALE = /\b(resell(?:ing)? rights?|resale rights?|master resell(?:ing)? rights?|PLR|private label rights?|white[- ]label rights?)\b/gi;

const MONEY = /\$\s?(\d{1,3}(?:,\d{3})+|\d+)(?:\.(\d{2}))?(?!\d)/g;
const PRICE_WORD = /\b(price|priced|costs?|pay|paying|only|just|for)\b/i;

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
    if (m[0].includes("@") || text[(m.index ?? 0) - 1] === "@") continue;
    if (ownsHost(m[1], own)) continue;
    add("other_company", m.index ?? 0, m[0].length,
      `This names ${bareHost(m[1])}, which is not your site. Terms copied from another site may describe rules that do not apply to this store.`,
      "Remove the other site, or replace it with your store's own address.");
  }
  for (const pattern of PLATFORMS) {
    const m = pattern.exec(text);
    if (!m) continue;
    add("other_company", m.index, m[0].length,
      `This names ${m[0]}, another company. Terms written for another platform may describe rules that do not apply here.`,
      "Remove the other company's name, and check that each rule describes how this store works.");
  }

  if (input.currency === "usd" && input.priceCents !== null && Number.isSafeInteger(input.priceCents)) {
    for (const m of text.matchAll(MONEY)) {
      const index = m.index ?? 0;
      const around = text.slice(Math.max(0, index - AROUND), index + m[0].length + AROUND);
      if (!PRICE_WORD.test(around)) continue;
      const cents = Number(m[1].replace(/,/g, "")) * 100 + (m[2] ? Number(m[2]) : 0);
      if (cents === input.priceCents) continue;
      add("price_mismatch", index, m[0].length,
        `This says ${m[0].replace(/\s/g, "")}, but the page and checkout show ${formatUsd(input.priceCents)}. A buyer may expect the price written here.`,
        `Change it to ${formatUsd(input.priceCents)}, or remove the amount.`);
    }
  }

  if (!input.immediateAccessConsent) {
    for (const m of text.matchAll(NO_REFUNDS)) {
      add("no_refunds", m.index ?? 0, m[0].length,
        "In the EU, the UK and some other places, a buyer online usually has 14 days to cancel. The checkout's agreement to start access at once does not cover this product, so this sentence may not hold for those buyers.",
        "Say that buyers in the EU and the UK can cancel within 14 days, or remove this sentence.");
    }
  }

  for (const pattern of EARNINGS) {
    for (const m of text.matchAll(pattern)) {
      add("earnings_claim", m.index ?? 0, m[0].length,
        "This promises earnings, income or results. A promise like this needs proof that typical buyers get it, and results depend on the buyer.",
        "Describe what the product contains and teaches, without promising a result.");
    }
  }

  if (!input.realDeadline) {
    for (const m of text.matchAll(URGENCY_TIME)) {
      add("false_urgency", m.index ?? 0, m[0].length,
        "This says time is running out, but no end date or sale deadline is set for this product.",
        "Set a real end date in the studio, or remove this sentence.");
    }
  }
  if (!input.realStockLimit) {
    for (const m of text.matchAll(URGENCY_STOCK)) {
      add("false_urgency", m.index ?? 0, m[0].length,
        "This says few are left, but no stock or seat limit is set for this product.",
        "Set a real limit in the studio, or remove this sentence.");
    }
  }

  if (!input.resaleLicense) {
    for (const m of text.matchAll(RESALE)) {
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
