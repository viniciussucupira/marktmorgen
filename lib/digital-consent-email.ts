/**
 * The line a purchase's confirmation email carries when the buyer checked the
 * box to start access at once (lib/digital-consent.ts): the confirmation on a
 * durable medium that Directive 2011/83/EU asks for (art. 8(7)(b), art.
 * 16(m)(iii)). It quotes the sentence that was checked, its version and the
 * day, and says the right to cancel, where there was one, ended when access
 * started. Read from the order's own metadata, so the email says what the
 * order holds and nothing else; no yes on the order, no line.
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
  [EU_WITHDRAWAL_CONSENT_VERSION]: DIGITAL_CONSENT_WORDS,
};

/** The email's lines for the yes on this order, a blank line first; none when the order has no yes this code can quote. */
export function consentEmailLines(store: { language: unknown; currency: string }, meta: Record<string, string | undefined> | null | undefined): string[] {
  const consent = readConsentMeta(meta);
  if (!consent) return [];
  const words = WORDS_BY_VERSION[consent.version]?.[parseLanguage(store.language)];
  if (!words) return [];
  const day = speechFor(store.language, store.currency).date(consent.at * 1000);
  return ["", words.emailLine(words.box, consent.version, day)];
}
