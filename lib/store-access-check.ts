/**
 * "Can everyone use your store?" in the studio: 98 [D2-COMPLIANCE-REVIEW]
 * unit 1 (AX274 Part A item 6: the studio warns about a picture with no
 * text alternative and offers the fix; it never changes the creator's
 * content on its own).
 *
 * Read only from the store's own record and the products it already carries
 * (the first page's, as the store coach reads them), so the studio asks
 * nothing more to show it. Pure, so it can be tested.
 *
 * What Marktmorgen already does on every store is said too, and only what
 * the code does: the consent box on every checkout that delivers digitally,
 * shown to every buyer (lib/digital-consent.ts, requireDigitalConsent), the button
 * colors moved until their words keep 7:1 (lib/store-look.ts, lookColours),
 * and the disclosure on every affiliate post our AI drafts
 * (lib/affiliate-kit-rules.ts, finishPost). Not a conformity claim: nothing
 * here says a store is accessible or lawful.
 */
import type { Store } from "@/lib/store";

export type AccessCheck = {
  /** Products on the store's first page whose picture has no description, by title. */
  pictures: { done: boolean; missing: string[] };
};

/** The check for a store with something on it; null for an empty one, which has its first steps first. */
export function accessCheck(store: Store): AccessCheck | null {
  const head = store.catalog.head.filter((p) => !p.hidden);
  if (head.length === 0) return null;
  const missing = head.filter((p) => p.image !== null && p.image.alt.trim().length === 0).map((p) => p.title);
  return { pictures: { done: missing.length === 0, missing } };
}

/** What every store gets without the creator doing anything, in plain words. */
export const ACCESS_DONE_FOR_YOU: readonly string[] = [
  "Every checkout that delivers something digital asks the buyer to agree that it starts at once, as the EU and the UK require before a buyer gives up the right to cancel.",
  "If a button color you pick is too light or too dark, we adjust it so the words on your buttons keep at least 7:1 contrast.",
  "Every post our AI drafts for your affiliates ends by saying that it is an affiliate link that earns them a commission.",
];
