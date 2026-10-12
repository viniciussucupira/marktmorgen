/**
 * A cart's checkout (the rules are in lib/cart-rules.ts): one plain payment
 * for several of a store's products, on the creator's own Stripe account,
 * like every other charge here (lib/store-checkout.ts).
 *
 * The first product is the order's product, and the others are named the
 * way products added at checkout always are (lib/bundle-rules.ts,
 * BUMP_KEYS), each with a bundle's list when it is one. So the thank-you
 * page, the emails, the list of purchases, downloads, courses, keys,
 * reviews, refunds and the creator's numbers hand each of them over and
 * count it exactly as they do a product ticked at checkout, with nothing new
 * to read.
 *
 * Each line is charged at its own price as the store shows it now: less the
 * store's sale on that product while it runs, or the fair price for the
 * buyer's country when that takes off more (lib/store-sale.ts,
 * lib/fair-price.ts). Taken off line by line, because a sale may be on some
 * products and not others; a discount code box is offered only when nothing
 * was taken off, as on any other checkout here.
 */
import type { Product, Store } from "@/lib/store";
import { KIND, readListings } from "@/lib/catalog";
import { BUMP_KEYS, MIN_BUNDLE_ITEMS, bundleMeta, deliverableItems } from "@/lib/bundle-rules";
import { type SaleCandidate, saleOff, salePrice } from "@/lib/store-sale";
import { fairOff } from "@/lib/fair-price";
import { commissionRate } from "@/lib/affiliate-setting";
import { applyTax, applyTaxDocuments, refusedTaxDocuments, withoutTaxDocuments } from "@/lib/tax";
import { inTheCurrencyShown, onlyInstantMethods } from "@/lib/instant-pay";
import { StripeError, onAccount } from "@/lib/stripe-account";
import { LANGUAGES } from "@/lib/store-language";
import { type CameFrom, hasSource } from "@/lib/came-from";
import { isHouseStore } from "@/lib/house-store";
import { MAX_CART, dealOff } from "@/lib/cart-rules";
import { applyRecovery, recoveryOn, refusedRecovery, withoutRecovery } from "@/lib/recovery-setting";
import { applyShare, leastPaid, linesTotal, shareBps } from "@/lib/platform-share";
import { codesMayTakeOff } from "@/lib/discount";

const DISPLAY_NAME = "branding_settings[display_name]";

/**
 * Whether a store offers a cart at all: two or more of its published products
 * could go in one, read from its own index without a single product read.
 */
export function offersCart(store: Store): boolean {
  const never = KIND.free | KIND.call | KIND.recurring | KIND.limited | KIND.hidden;
  let count = 0;
  for (const item of store.catalog.items) {
    if ((item.kind & KIND.paid) !== 0 && (item.kind & never) === 0 && item.options.length === 0) count += 1;
    if (count >= 2) return true;
  }
  return false;
}

/** What one product in a cart is charged, in the store currency's smallest unit, and what was taken off. */
export function cartPrice(store: Pick<Store, "sale" | "fair">, product: SaleCandidate, country: string, nowSeconds = Math.floor(Date.now() / 1000)): { cents: number; off: number } {
  const sale = saleOff(store.sale, product, nowSeconds);
  const fair = fairOff(store.fair, product, country);
  const off = Math.max(sale, fair);
  return { cents: salePrice(product.priceCents, off), off };
}

/** Opens one checkout for every product in a cart, in its order. The caller has checked each can go in one. */
export async function createCartCheckout(
  store: Store,
  products: Product[],
  origin: string,
  extras: {
    country?: string;
    cameFrom?: CameFrom;
    /**
     * The channel this sale is credited to, as Stripe metadata
     * (lib/visit-channel.ts channelMetadata): the page's own tags, else the
     * channel remembered for this visitor, else direct. Written on the session.
     */
    channel?: Record<string, string>;
    /** The affiliate whose link the buyer followed, still inside the store's window (lib/affiliates.ts). */
    via?: { aff: string; rate: number; own?: number | null } | null;
  } = {},
): Promise<{ url: string; id: string }> {
  if (!store.stripeAccountId) throw new Error("This store has no account");
  if (products.length === 0 || products.length > MAX_CART) throw new Error("A cart holds one to four products");

  const country = extras.country ?? "";
  const body = new URLSearchParams({
    mode: "payment",
    locale: LANGUAGES[store.language].stripe,
    "metadata[store]": store.handle,
    "metadata[product]": products[0].id,
    "metadata[cart]": "yes",
    "metadata[title]": products.map((p) => p.title).join(" + ").slice(0, 480),
    "payment_intent_data[metadata][store]": store.handle,
    "payment_intent_data[metadata][product]": products[0].id,
    "payment_intent_data[metadata][cart]": "yes",
    success_url: `${origin}/@${store.handle}/thanks?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${origin}/@${store.handle}`,
  });

  // The store's deal for buying more (lib/cart-rules.ts): every line that much cheaper again.
  const deal = dealOff(store.cartDeal, products.length);
  if (deal > 0) body.set("metadata[cart_deal]", String(deal));
  let discounted = deal > 0;
  const lines: { key: string | null; cents: number; id: string }[] = [];
  for (const [i, product] of products.entries()) {
    const key = i === 0 ? null : BUMP_KEYS[i - 1];
    // A bundle's list is written onto the order as it is now, as for any bundle sold.
    if (product.bundle) {
      const items = deliverableItems(product, await readListings(store, product.bundle));
      if (items.length < MIN_BUNDLE_ITEMS) throw new Error("A bundle in the cart holds too little right now");
      for (const [name, value] of Object.entries(bundleMeta(key ? `${key}_bundle` : "bundle", items.map((p) => p.id)))) body.set(`metadata[${name}]`, value);
    }
    const shown = cartPrice(store, product, country);
    const cents = salePrice(shown.cents, deal);
    const off = shown.off;
    if (off > 0) discounted = true;
    body.set(`line_items[${i}][quantity]`, "1");
    body.set(`line_items[${i}][price_data][currency]`, store.currency);
    body.set(`line_items[${i}][price_data][unit_amount]`, String(cents));
    body.set(`line_items[${i}][price_data][product_data][name]`, product.title);
    if (product.summary) body.set(`line_items[${i}][price_data][product_data][description]`, product.summary);
    if (key) {
      body.set(`metadata[${key}]`, product.id);
      body.set(`payment_intent_data[metadata][${key}]`, product.id);
      // What it was charged, which an affiliate's share is weighed by (lib/affiliates.ts).
      body.set(`metadata[${key}_cents]`, String(cents));
    }
    lines.push({ key, cents, id: product.id });
  }

  // Sent by an affiliate: who, and each product's share as it is today.
  if (extras.via) {
    const own = extras.via.own ?? null;
    const rates = lines.map((line) => commissionRate(store.affiliates, line.id, own));
    if (rates.some((rate) => rate > 0)) {
      body.set("metadata[via]", extras.via.aff);
      body.set("metadata[via_rate]", String(rates[0]));
      body.set("payment_intent_data[metadata][via]", extras.via.aff);
      lines.forEach((line, i) => {
        if (line.key) body.set(`metadata[${line.key}_rate]`, String(rates[i]));
      });
    }
  }
  for (const [key, value] of Object.entries(extras.channel ?? {})) body.set(`metadata[${key}]`, value);
  if (extras.cameFrom && hasSource(extras.cameFrom)) {
    if (extras.cameFrom.source) body.set("metadata[utm_source]", extras.cameFrom.source);
    if (extras.cameFrom.medium) body.set("metadata[utm_medium]", extras.cameFrom.medium);
    if (extras.cameFrom.campaign) body.set("metadata[utm_campaign]", extras.cameFrom.campaign);
  }
  // One discount at a time, as everywhere here: a code box only when nothing was taken off already.
  const box = !discounted && store.hasDiscounts;
  if (box) body.set("allow_promotion_codes", "true");
  // The share of the sale, when the store's plan has one (lib/platform-share.ts):
  // the lines are already at the price the store set, and a code typed in the
  // box may take off as much as the largest the store has.
  const mayComeOff = box && shareBps(store) > 0 ? await codesMayTakeOff(store.stripeAccountId, store.currency) : [];
  applyShare(body, store, { recurring: false, least: leastPaid(linesTotal(body).cents, mayComeOff) });

  applyTax(store, body);
  applyTaxDocuments(store, body, false);
  onlyInstantMethods(body);
  inTheCurrencyShown(body);
  // A store with reminders on (lib/checkout-recovery.ts): Stripe asks for
  // consent where it offers to, and the way back leads to a page that offers
  // one reminder of the whole cart, which the buyer asks for themselves.
  const recovering = recoveryOn(store);
  if (recovering && store.recovery.asks) applyRecovery(body);
  if (recovering) body.set("cancel_url", `${origin}/@${store.handle}/left?cart=${products.map((p) => encodeURIComponent(p.id)).join(",")}`);
  let asking = recovering && store.recovery.asks;
  let named = isHouseStore(store);
  if (named) body.set(DISPLAY_NAME, store.name);
  let documents = store.tax.ids || store.tax.invoices;

  for (;;) {
    try {
      const session = await onAccount("POST", store.stripeAccountId, "/checkout/sessions", body);
      if (typeof session.url !== "string" || !session.url || typeof session.id !== "string") throw new Error("Stripe did not return a checkout URL");
      return { url: session.url, id: session.id };
    } catch (error) {
      if (named && error instanceof StripeError && error.status === 400) {
        body.delete(DISPLAY_NAME);
        named = false;
        continue;
      }
      if (asking && refusedRecovery(error)) {
        // Stripe decides which accounts it asks for consent for: refused, the cart still sells.
        console.error("cart checkout refused the reminder fields; opened without them", error);
        withoutRecovery(body);
        asking = false;
        continue;
      }
      if (documents && refusedTaxDocuments(error)) {
        withoutTaxDocuments(body);
        documents = false;
        continue;
      }
      throw error;
    }
  }
}
