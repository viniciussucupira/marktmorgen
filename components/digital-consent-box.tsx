import { digitalConsentWords } from "@/lib/buyer-words/digital-consent";
import { CONSENT_FIELD, CONSENT_VERSION_FIELD, EU_WITHDRAWAL_CONSENT_VERSION } from "@/lib/digital-consent";

/**
 * The box a buyer checks before paying for something handed over digitally
 * at once (lib/digital-consent.ts): a real checkbox with its visible label,
 * never checked for them, and required, so the browser itself stops the form
 * and says why, with JavaScript or without. The server checks it again
 * whatever the browser did.
 *
 * The whole label is the target (at least 44 px high); the note under it is
 * tied to the box by aria-describedby. When the server refused a payment for
 * want of it (`refused`), the box is marked invalid and the reason is said in
 * text beside it, announced as an alert, with the way to fix it. No hooks, so
 * the product's buy box, the cart and the offers after paying all draw it.
 */
export function DigitalConsentBox({
  id,
  lang,
  refused = false,
  required = true,
  className = "",
}: {
  id: string;
  lang: string;
  refused?: boolean;
  /** False only where nothing but a product added at checkout is opened at once: the server then asks for it only if that is checked. */
  required?: boolean;
  className?: string;
}) {
  const c = digitalConsentWords(lang);
  const noteId = `${id}-note`;
  const errorId = `${id}-error`;
  return (
    <div className={`text-sm ${className}`} data-digital-consent="">
      {refused ? (
        <p id={errorId} className="st-note mb-2 font-semibold" role="alert">
          {c.needed}
        </p>
      ) : null}
      <label htmlFor={id} className="flex min-h-11 cursor-pointer items-start gap-3 py-1" style={{ color: "var(--st-text)" }}>
        <input
          id={id}
          type="checkbox"
          name={CONSENT_FIELD}
          value="yes"
          required={required}
          aria-describedby={refused ? `${errorId} ${noteId}` : noteId}
          aria-invalid={refused ? true : undefined}
          className="mt-0.5 h-5 w-5 shrink-0"
        />
        <span>{c.box}</span>
      </label>
      <input type="hidden" name={CONSENT_VERSION_FIELD} value={EU_WITHDRAWAL_CONSENT_VERSION} />
      <p id={noteId} className="st-muted mt-1 text-xs">
        {required ? c.note : c.noteAdded}
      </p>
    </div>
  );
}
