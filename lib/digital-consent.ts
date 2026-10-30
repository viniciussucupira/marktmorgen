/**
 * The buyer's yes before digital content is handed over at once, and what is
 * kept of it (queue item 91 [D2-EU-WITHDRAWAL], 30 October 2026).
 *
 * The law, read on 30 October 2026 in Directive 2011/83/EU as amended by
 * Directive (EU) 2019/2161 (art. 4(11)–(12) of 2019/2161 and arts. 6(1)(k),
 * 8(2) and 8(7) of 2011/83, from the adopted text reproduced on
 * legislation.gov.uk; EUR-Lex's own article text could not be fetched): a
 * consumer who buys digital content that is not supplied on a tangible
 * medium has 14 days to withdraw (art. 9, not reread that day), and loses
 * that right once performance has begun only where, for a contract with an
 * obligation to pay, (i) they gave prior express consent to begin during the
 * withdrawal period, (ii) they acknowledged that they thereby lose the right,
 * and (iii) the trader confirmed it on a durable medium under art. 8(7)
 * (art. 16(m)). Without those, they owe nothing for what they used
 * (art. 14(4)(b)). The United Kingdom's rules are read the same way here;
 * their own text was not read on that date.
 *
 * Here, the creator is the trader (app/terms, section 3); the store's
 * checkout asks on the creator's behalf, the same way for every buyer:
 *
 *   - one unchecked box before paying, on every form that pays for something
 *     handed over digitally (deliversDigitally), with one sentence that holds
 *     both the consent and the acknowledgement, in the store's language
 *     (lib/buyer-words/digital-consent.ts). Shown to every buyer, because the
 *     page cannot know who has the right; the note under it says it is for
 *     buyers who have that right where they live, so nobody is told they had
 *     a right they did not have;
 *   - the server refuses to open the payment without it (consentFromForm,
 *     requireDigitalConsent): a forged form, a page from before the words
 *     changed (another version) or a missing box opens nothing and charges
 *     nothing;
 *   - each one-click offer after paying is its own contract, so it asks
 *     again, on its own button (lib/upsell.ts). Consent given for one order
 *     is never read as consent for another;
 *   - what is kept is "yes", the version of the sentence and the time, on the
 *     order itself in the creator's own Stripe account (CONSENT_META): no new
 *     personal data, no cookie, nothing kept by us;
 *   - the confirmation email (the durable medium) quotes the sentence, its
 *     version and the day, and says the right to cancel ended when access
 *     started (lib/purchase-email.ts and the receipts it calls on).
 *
 * A physical product with nothing digital in it is not asked; neither is a
 * booked call (a service, through its own door) nor anything free.
 *
 * Browser-safe: plain data and small functions, nothing from the server.
 */

/**
 * The version of the sentence the buyer checks, in every language. Bumped
 * whenever the words change in any language, with CONSENT_WORDS_FINGERPRINT
 * (tests/digital-consent.test.ts fails when the words change and it does not).
 */
export const EU_WITHDRAWAL_CONSENT_VERSION = "2026-10-30.1";

/**
 * The SHA-256, in hex, of every language's sentence joined by "\n" in the
 * order en, es, fr, de, it, nl, pt. Not read at run time: it is what ties the
 * version to the exact words, held by tests/digital-consent.test.ts.
 */
export const CONSENT_WORDS_FINGERPRINT = "cef78f566e8c4b23118f09da94eca09795c90c53fb2d0b9e324e9ec4f4594024";

/** The checkbox's name and value, and the hidden field with the version the page showed. */
export const CONSENT_FIELD = "dc";
export const CONSENT_VERSION_FIELD = "dc_v";

/** The metadata key on the order (Stripe checkout session, payment, PayPal order record). */
export const CONSENT_META = "dc";

/** The buyer's yes, as it is kept: the version of the sentence and the time, in seconds. */
export type DigitalConsent = { version: string; at: number };

/** Thrown where a charge is built without the yes it needs: nothing is opened and nothing is charged. */
export class DigitalConsentMissing extends Error {
  constructor() {
    super("Immediate digital delivery needs the buyer's consent first");
    this.name = "DigitalConsentMissing";
  }
}

/** What deciding whether a product hands something over digitally reads. */
export type DeliveryCandidate = {
  call?: unknown;
  course?: unknown;
  podcast?: unknown;
  bundle?: readonly string[] | null;
  recurring?: unknown;
  shipping?: unknown;
  file?: unknown;
  link?: unknown;
  options?: readonly { id: string; file?: unknown; link?: unknown }[];
};

/**
 * Whether buying this product hands over digital content (a file, a link, a
 * course, a private podcast, a bundle of products, a membership's content).
 * A product the creator ships, with no file or link on it or on the option
 * bought, is the only paid product here that does not; a call is a service.
 * An option id that names nothing is read as the product's every option, so
 * a doubt asks rather than skips.
 */
export function deliversDigitally(product: DeliveryCandidate, optionId: string | null = null): boolean {
  if (product.call) return false;
  if (product.course || product.podcast || product.recurring) return true;
  if (Array.isArray(product.bundle) && product.bundle.length > 0) return true;
  if (!product.shipping) return true;
  if (present(product.file) || present(product.link)) return true;
  const options = product.options ?? [];
  const chosen = optionId ? options.filter((option) => option.id === optionId) : [];
  return (chosen.length ? chosen : options).some((option) => present(option.file) || present(option.link));
}

function present(value: unknown): boolean {
  return value !== null && value !== undefined && value !== "";
}

/**
 * The yes a form carries: only the checked box, sent with the version this
 * code shows today. Anything else, an old page included, is no yes.
 */
export function consentFromForm(form: Pick<FormData, "get">, nowSeconds = Math.floor(Date.now() / 1000)): DigitalConsent | null {
  if (form.get(CONSENT_FIELD) !== "yes") return null;
  if (form.get(CONSENT_VERSION_FIELD) !== EU_WITHDRAWAL_CONSENT_VERSION) return null;
  return { version: EU_WITHDRAWAL_CONSENT_VERSION, at: Math.floor(nowSeconds) };
}

/** A yes that can be kept: today's version and a real time. */
export function validConsent(consent: DigitalConsent | null | undefined): consent is DigitalConsent {
  return Boolean(consent && consent.version === EU_WITHDRAWAL_CONSENT_VERSION && Number.isSafeInteger(consent.at) && consent.at > 1_600_000_000);
}

/** Refuses, before anything is opened, a charge that needs the yes and does not have it. */
export function requireDigitalConsent(needed: boolean, consent: DigitalConsent | null | undefined): void {
  if (needed && !validConsent(consent)) throw new DigitalConsentMissing();
}

/** The value kept under CONSENT_META: "yes:<version>:<seconds>", 27 characters. */
export function consentMetaValue(consent: DigitalConsent): string {
  return `yes:${consent.version}:${consent.at}`;
}

const META_VALUE = /^yes:([0-9]{4}-[0-9]{2}-[0-9]{2}\.[0-9]{1,3}):([0-9]{10})$/;

/** The yes read back from an order's metadata, or null when it has none (or one this code did not write). */
export function readConsentMeta(meta: Record<string, string | undefined> | null | undefined): DigitalConsent | null {
  const raw = meta?.[CONSENT_META];
  if (typeof raw !== "string") return null;
  const found = META_VALUE.exec(raw);
  if (!found) return null;
  return { version: found[1], at: Number(found[2]) };
}
