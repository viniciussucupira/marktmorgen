/**
 * The line a purchase's confirmation email carries when the buyer checked the
 * box to start during the cancellation period (lib/digital-consent.ts): the confirmation on a
 * durable medium that Directive 2011/83/EU asks for (art. 8(7)(b), art.
 * 16(m)(iii)). It quotes the sentence that was checked, its version and the
 * day, and says what follows for that order (see consentEmailLines). Read
 * from the order's own metadata, so the email says what the order holds and
 * nothing else; no yes on the order, no line.
 *
 * Every version ever shown is kept in WORDS_BY_VERSION, so an email sent just
 * after a change of words still quotes the words that buyer checked. When
 * EU_WITHDRAWAL_CONSENT_VERSION is bumped, the previous words move into it.
 */
import { readConsentMeta, EU_WITHDRAWAL_CONSENT_VERSION } from "@/lib/digital-consent";
import { DIGITAL_CONSENT_WORDS } from "@/lib/buyer-words/digital-consent";
import { speechFor } from "@/lib/buyer-words";
import { parseLanguage } from "@/lib/store-language";

const WORDS_BY_VERSION: Record<string, typeof DIGITAL_CONSENT_WORDS> = {
  // 2026-10-30.1 was never shown to a buyer (sales were closed) and kept no kind, so it is not quoted.
  [EU_WITHDRAWAL_CONSENT_VERSION]: DIGITAL_CONSENT_WORDS,
};

/**
 * The email's lines for the yes on this order, a blank line first; none when
 * the order has no yes this code can quote. Says only what is true of that
 * order: a membership keeps its 14 days at a proportional price; a pre-order
 * keeps the right until its release day (its metadata says "preorder"); any
 * other digital order was opened as soon as it was confirmed. An order that
 * also ships an item (metadata "ship") says that item keeps its own right.
 */
export function consentEmailLines(store: { language: unknown; currency: string }, meta: Record<string, string | undefined> | null | undefined): string[] {
  const consent = readConsentMeta(meta);
  if (!consent) return [];
  const words = WORDS_BY_VERSION[consent.version]?.[parseLanguage(store.language)];
  if (!words) return [];
  const day = speechFor(store.language, store.currency).date(consent.at * 1000);
  const sentence = words.box[consent.kind];
  const line =
    consent.kind === "membership"
      ? words.email.membership(sentence, consent.version, day)
      : meta?.preorder === "yes"
        ? words.email.release(sentence, consent.version, day)
        : words.email.now(sentence, consent.version, day);
  return ["", meta?.ship === "yes" ? `${line} ${words.email.shipped}` : line];
}
