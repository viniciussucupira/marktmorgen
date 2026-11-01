# Ease patterns audit (487 [IT4])

The screen-by-screen audit that 487 [IT4] asks for: what was checked, what was found, and what was fixed. Each section names its date and method. A pattern not yet audited is listed as not audited, never as passing.

## Pattern 2: the right keyboard on a phone (1 November 2026)

**Method.** Every `<input>` in `app/` and `components/` was read by a script (type, `inputMode`, `autoComplete`, and the field's id, name, placeholder and label). Each flagged field was then read by hand.

**Found.**
- **Email fields:** 23. Four had no `autoComplete`, and all four hold someone else's address:
  - who a store moves to ("Move to", `app/studio/page.tsx`);
  - a deal's contact (`components/deals-board.tsx`, `components/form-response-deal.tsx`);
  - someone on the list (`components/workflow-tools.tsx`).

  Without `autoComplete="off"`, a browser offers the creator's own address in those fields.
- **Number fields:** about thirty `type="number"` fields hold counts (days, percent, people, keys). The numeric keyboard is right for them, so nothing changed.
- **Phone fields:** none were found without `type="tel"` or `autocomplete`.
- **Money fields:** the text fields whose names mention a price are headings or sentences ("The launch price ends in", "What is compared"), not amounts. The amounts already use `inputMode="decimal"`, or `numeric` for JPY, as the discount editor does.

**Fixed.**
- The three email fields in `components/` take `autoComplete="off"` and `spellCheck={false}`.
- "Move to" in `app/studio/page.tsx` waits, because the file is held by an open PR. `tests/email-field-keyboards.test.ts` names it as waiting.
- The test fails if any email field in the app gives no `autocomplete`.

## Not audited yet

These patterns of 487 [IT4] have not been audited:
1. Validation when the person leaves the field.
2. The most common value filled in, never the dearest.
3. Always-visible labels.
4. Empty screens with an action and a ready example.
5. Drafts saved by themselves.
6. A live phone preview beside each editor.
7. A "Check answers" summary before publishing or sending.
