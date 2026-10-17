/**
 * The Store assistant's second function (added 17 October 2026): after a
 * purchase, ONE next product from the same creator, on the page after paying
 * and, when the creator allows it and the buyer agreed to hear from them, in
 * the order's own confirmation email (no email of its own). Rules the
 * browser can read too; what reads, asks the model and keeps is
 * lib/next-offer.ts.
 *
 * Measured before it was built (17 October 2026, official pages): Kajabi,
 * Stan, Gumroad and Thinkific offer one-click upsells or order bumps the
 * creator sets by hand, and nothing that picks among the creator's own
 * products when they set none; ClickFunnels' store suggests from
 * collections the creator builds (audit F13); HighLevel's upsell is one
 * step the creator chains (H13). Here the creator's own choices come first,
 * the model is asked only when the creator made none, and the buyer never
 * sees a product they already own.
 *
 * What is chosen, in this order, and why (nextChoice):
 *
 *   1. what the creator says "goes well with" the product bought (its picks);
 *   2. what the product offers after paying (its funnel), at its own price,
 *      when the buyer did not turn it down;
 *   3. what it offers in a box at checkout, when the buyer did not tick it;
 *   4. the other products of a collection it is in;
 *   5. otherwise the store's products in the creator's order: here, and only
 *      here, the model may choose among them (modelAddsValue), because the
 *      creator said nothing about which follows which.
 *
 * Only a product the store lists and sells today, at its published price, on
 * its own page; never the one just bought, anything in this order, anything
 * the buyer turned down after paying, a product with a limited number for
 * sale, a bundle that holds something the buyer has, or anything this
 * address bought here before (read from the creator's own Stripe account and
 * the purchases the creator brought over). When what the buyer owns cannot
 * be read, nothing is offered.
 *
 * What keeps it honest: the card shows the product's own title, published
 * price and the creator's own summary; when the model chose it, it says
 * "AI suggestion", drawn by the page, never written by the model, and the one
 * sentence of why the model may add is shown only when it says nothing the
 * creator's words do not (heldToFacts): no figure, deal, code, link or
 * pressure word. No discount, no countdown, no "only N left", no review.
 * The buyer can dismiss it; it is never shown while an offer after paying
 * (lib/upsell.ts) is waiting on an answer, and it links to the product's own
 * page, where buying is an ordinary checkout.
 *
 * What it costs: a choice with the model is one reply of the add-on's month,
 * reserved exactly like a chat message (ASSISTANT_POOL, the same worst
 * cost) before the model is asked, settled at what it billed, given back
 * when nothing was billed; when the month's replies are used, the choice is
 * the rule above with no model at all. The reading around it (the order's
 * products, what the buyer owns) is NEXT_OFFER_REQUEST_UNITS of the store's
 * public requests (lib/traffic.ts), priced as later pages in
 * tests/plan-cost-registry.ts. One choice per order: kept for
 * NEXT_OFFER_KEEP_SECONDS, so the page opened again, and its email, cost
 * nothing more.
 */
import type { Listing } from "@/lib/store";
import { ASSISTANT_FACTS_BYTES, ASSISTANT_OUTPUT_TOKENS, ASSISTANT_PRODUCTS, MAX_ASSISTANT_REPLY } from "@/lib/store-assistant-rules";
import { MIN_BUNDLE_ITEMS } from "@/lib/bundle-rules";

/** What the creator sets in the studio: whether the next product is suggested at all, and whether the confirmation email carries it too. */
export type NextOfferSetting = { on: boolean; email: boolean };
export const NO_NEXT_OFFER: NextOfferSetting = { on: false, email: false };

/** The setting as stored or sent. Off on every store written before it existed; the email only with the page. */
export function parseNextOffer(raw: unknown): NextOfferSetting {
  if (!raw || typeof raw !== "object") return { ...NO_NEXT_OFFER };
  const value = raw as Record<string, unknown>;
  const on = value.on === true;
  return { on, email: on && value.email === true };
}

/** Products of the store, in the creator's order, read as candidates: at most what the assistant reads (ASSISTANT_PRODUCTS). */
export const NEXT_OFFER_PRODUCTS = 16;
/** The most products of the creator's own choices read besides: picks, offers after paying, boxes at checkout. */
export const NEXT_OFFER_CHOICES = 8;
/** The model is asked only when it has at least this many to choose between. */
export const NEXT_OFFER_MODEL_MIN = 2;
/** The facts the model reads, at most: the assistant's own cap. */
export const NEXT_OFFER_FACTS_BYTES = ASSISTANT_FACTS_BYTES;
/** The longest answer the model may write: a number and one sentence. */
export const NEXT_OFFER_OUTPUT_TOKENS = 120;
/** The longest sentence of why that is shown. */
export const MAX_NEXT_OFFER_REASON = 200;
/** How long one order's choice is kept: the three days its page after paying works, so the page and its email agree. */
export const NEXT_OFFER_KEEP_SECONDS = 3 * 86_400;
/** The model is given this long; the page shows the creator's choice past it. */
export const NEXT_OFFER_TIMEOUT_MS = 8_000;
/** Public requests of the store's window one choice counts as (lib/traffic.ts): its reads and its calls to Stripe, priced in tests/plan-cost-registry.ts. */
export const NEXT_OFFER_REQUEST_UNITS = 6;
/** Database commands one choice makes at the most, besides the model call's own: a review ceiling under the assistant's per-reply figure (ASSISTANT_MESSAGE_COMMANDS). */
export const NEXT_OFFER_COMMANDS = 40;

/** Why a product was chosen, said in the studio and kept with the choice. */
export type NextReason = "pick" | "funnel" | "bump" | "collection" | "order" | "ai";

/** What was chosen for an order: a product, by whom, and the model's sentence when it gave one that held. */
export type NextChoice = { productId: string; reason: NextReason; why: string };

/**
 * Whether a product may be offered next at all, before ownership: on sale
 * today in the store's own listing, at one published price or more, with no
 * limited number (whose remaining count is not said here), and not a bundle
 * the buyer builds or one holding anything they have.
 */
export function offerable(product: Listing, owned: ReadonlySet<string>, sellable: (product: Listing) => boolean): boolean {
  if (product.hidden || owned.has(product.id)) return false;
  if (product.stock !== null) return false;
  if (product.bundle && (product.pick || product.bundle.length < MIN_BUNDLE_ITEMS || product.bundle.some((id) => owned.has(id)))) return false;
  return sellable(product);
}

/**
 * The creator's own choice for an order, in the order above, or null when
 * nothing may be offered. `candidates` are listings the store lists, in its
 * order; `known` finds any listing read. Pure.
 */
export function nextChoice(input: {
  /** The product bought first, then what came with it. */
  bought: Listing[];
  /** What the first product offers after paying, in its steps' order (lib/funnel.ts). */
  funnelTargets: string[];
  /** The store's collections, as stored. */
  collections: { products: string[] }[];
  candidates: Listing[];
  known: Map<string, Listing>;
  owned: ReadonlySet<string>;
  /** Turned down after paying, in this order. */
  declined: ReadonlySet<string>;
  sellable: (product: Listing) => boolean;
}): { choice: NextChoice; ranked: Listing[] } | null {
  const { bought, owned, known } = input;
  const ok = (id: string) => {
    const p = known.get(id);
    return p && !input.declined.has(id) && offerable(p, owned, input.sellable) ? p : null;
  };
  const first = (reason: NextReason, ids: string[]) => {
    for (const id of ids) {
      const p = ok(id);
      if (p) return { productId: p.id, reason, why: "" } satisfies NextChoice;
    }
    return null;
  };
  const ranked = input.candidates.filter((p) => ok(p.id));
  const chosen =
    first("pick", bought.flatMap((p) => p.pairs ?? [])) ??
    first("funnel", input.funnelTargets) ??
    first("bump", bought.flatMap((p) => p.bumps.map((b) => b.productId))) ??
    first("collection", input.collections.filter((c) => bought.some((p) => c.products.includes(p.id))).flatMap((c) => c.products)) ??
    (ranked[0] ? ({ productId: ranked[0].id, reason: "order", why: "" } satisfies NextChoice) : null);
  return chosen ? { choice: chosen, ranked } : null;
}

/** Whether the model can add anything: the creator made no choice for this product, and there are several to choose between. */
export function modelAddsValue(choice: NextChoice, ranked: Listing[]): boolean {
  return choice.reason === "order" && ranked.length >= NEXT_OFFER_MODEL_MIN;
}

/** The model's sentence of why, as shown: one line, bounded; "" when there is none. */
export function readReason(raw: unknown): string {
  if (typeof raw !== "string") return "";
  const text = raw.replace(/[\u0000-\u001f\u007f]+/g, " ").replace(/\s+/g, " ").trim();
  return text.length > MAX_NEXT_OFFER_REASON ? "" : text.slice(0, MAX_ASSISTANT_REPLY);
}

/**
 * Whether a choice stays inside what one reply of the assistant is priced at
 * (assistantMessageWorstMicroUsd): no more products read than a chat message
 * reads, no longer an answer, no more commands. Held in tests/next-offer.test.ts.
 */
export function withinAssistantReply(commandsPerReply: number): boolean {
  return NEXT_OFFER_PRODUCTS + NEXT_OFFER_CHOICES <= ASSISTANT_PRODUCTS && NEXT_OFFER_OUTPUT_TOKENS <= ASSISTANT_OUTPUT_TOKENS && NEXT_OFFER_COMMANDS <= commandsPerReply;
}
