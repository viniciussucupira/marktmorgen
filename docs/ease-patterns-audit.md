# Ease patterns audit (487 [IT4])

The screen-by-screen audit that 487 [IT4] asks for: what was checked, what was found, and what was fixed. Each section names its date and method. A pattern not yet audited is listed as not audited, never as passing.

## Pattern 2: the right keyboard on a phone (1 November 2026)

**Method.** Every `<input>` and `<EmailField>` in `app/` and `components/` was read by a script (type, `inputMode`, `autoComplete`, and the field's id, name, placeholder and label). Each flagged field was then read by hand. An independent review re-counted them with a parser that respects braces.

**Found.**
- **Email fields:** 25 `<input>` fields (23 with `type="email"` written out, 2 with the type chosen in code; those 2 already set `autoComplete`), plus 17 `<EmailField>` uses, each already naming its `autoComplete`. Four `<input>` fields had none, and all four hold someone else's address:
  - who a store moves to ("Move to", `app/studio/page.tsx`);
  - a deal's contact (`components/deals-board.tsx`, `components/form-response-deal.tsx`);
  - someone on the list (`components/workflow-tools.tsx`).

  Without `autoComplete="off"`, a browser is asked to offer the creator's own address there. "off" asks it not to; some browsers may still offer it, so this reduces the mistake rather than ruling it out.
- **Number fields:** about thirty `type="number"` fields. Most hold counts (days, percent, people, keys). The monthly goal in `components/path-onboarding.tsx` is an amount, and the dynamic fields in `components/person-fields.tsx` and `components/email-studio.tsx` hold the creator's own numbers. All of them already open the number keyboard, and the amount already sets its `inputMode`. Nothing changed.
- **Phone fields:** the app has none.
- **Money fields:** the text fields whose names mention a price are headings or sentences ("The launch price ends in", "What is compared"), not amounts. The amounts already use `inputMode="decimal"`, or `numeric` for JPY, as the discount editor does.

**Fixed.**
- The three email fields in `components/` take `autoComplete="off"`, as the other fields for someone else's address already do (for example the gift recipient in `components/store-product.tsx`).
- "Move to" in `app/studio/page.tsx` waits, because the file is held by an open PR. `tests/email-field-keyboards.test.ts` names it as waiting.
- The test fails if any email field in the app, `<input>` or `<EmailField>`, gives no `autocomplete`. It extracts whole tags and recognizes a type chosen in code.

## Not audited yet

These patterns of 487 [IT4] have not been audited:
1. Validation when the person leaves the field.
2. The most common value filled in, never the dearest.
3. Always-visible labels.
4. Empty screens with an action and a ready example.
5. Drafts saved by themselves.
6. A live phone preview beside each editor.
7. A "Check answers" summary before publishing or sending.
