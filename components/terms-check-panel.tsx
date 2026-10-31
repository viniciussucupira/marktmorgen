"use client";

import { type TermsCheckInput, type TermsWarningKind, checkCreatorTerms, replaceWords, withoutSentence } from "@/lib/terms-check-rules";

/** What each kind of warning is called, in plain words. */
const TITLES: Record<TermsWarningKind, string> = {
  other_company: "Names another company or site",
  price_mismatch: "A different price",
  no_refunds: "No refunds",
  earnings_claim: "A promise of earnings or results",
  false_urgency: "Urgency with nothing real behind it",
  resale_rights: "Resale rights",
};

/**
 * The warnings on what a creator wrote for a product (493 [DE2] unit 2),
 * shown under the text while they write it, before they save. It flags; it
 * changes nothing by itself: each fix is applied only when the creator
 * presses its button, and they still choose to save. Pure and in the
 * browser (lib/terms-check-rules.ts): no request, no model, no cost.
 */
export function TermsCheckPanel({ id, input, onChange }: { id: string; input: TermsCheckInput; onChange: (text: string) => void }) {
  const warnings = checkCreatorTerms(input);
  if (!warnings.length) return null;
  const heading = `terms-check-${id}`;
  return (
    <section aria-labelledby={heading} className="notice notice-warn mt-3" data-terms-check="">
      <h3 id={heading} className="font-semibold text-ink">
        {warnings.length === 1 ? "One thing to check before you save" : `${warnings.length} things to check before you save`}
      </h3>
      <p className="mt-1 text-sm text-ink-soft">These are suggestions, not legal advice. Nothing changes unless you press a button below and then save.</p>
      <ul className="mt-3 space-y-4">
        {warnings.map((w) => {
          const words = input.text.slice(w.at, w.at + w.length);
          return (
            <li key={`${w.kind}:${w.at}`} className="text-sm">
              <p className="font-semibold text-ink">{TITLES[w.kind]}</p>
              <p className="mt-1 text-ink-soft">
                <span className="sr-only">Your words: </span>
                <q>{w.excerpt}</q>
              </p>
              <p className="mt-1 text-ink-soft">{w.why}</p>
              <p className="mt-1 text-ink">{w.fix}</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {w.replacement ? (
                  <button type="button" className="btn btn-secondary btn-sm" onClick={() => onChange(replaceWords(input.text, w.at, w.length, words, w.replacement!))}>
                    {`Change ${words.replace(/\s/g, "")} to ${w.replacement}`}
                  </button>
                ) : null}
                <button type="button" className="btn btn-secondary btn-sm" onClick={() => onChange(withoutSentence(input.text, w.at))}>
                  Remove this sentence
                </button>
              </div>
            </li>
          );
        })}
      </ul>
      <p className="sr-only" aria-live="polite">{`${warnings.length} things to check in the description.`}</p>
    </section>
  );
}
