/**
 * The buyer's yes to start access at once (lib/digital-consent.ts), as a test
 * gives it where a real buyer checks the box: today's version, a fixed time.
 * Used by the journeys that open a checkout for something handed over
 * digitally; tests/digital-consent.test.ts checks what happens without it.
 */
import { CONSENT_FIELD, CONSENT_VERSION_FIELD, EU_WITHDRAWAL_CONSENT_VERSION, type DigitalConsent } from "@/lib/digital-consent";

export const TEST_CONSENT: DigitalConsent = { version: EU_WITHDRAWAL_CONSENT_VERSION, at: 1_790_000_000 };

/** The two fields the box sends, for a test that posts a form. */
export function withConsent<T extends { set: (name: string, value: string) => void }>(form: T): T {
  form.set(CONSENT_FIELD, "yes");
  form.set(CONSENT_VERSION_FIELD, EU_WITHDRAWAL_CONSENT_VERSION);
  return form;
}
