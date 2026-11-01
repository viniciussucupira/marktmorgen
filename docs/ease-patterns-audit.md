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

## Pattern 4: a label always visible (1 November 2026, first pass)

**Method.** The same script listed every text field with no `<label>` around it and no `htmlFor` pointing at it. Each one was read by hand. Fields whose `id` is computed, and whose label points at it, were false alarms.

**Found.** Two kinds of field had no visible label:
- **Placeholder only, or a label for screen readers only:**
  - the store address field on the home page (`components/home-claim.tsx`): its label is screen-reader only, and the visible text is the `marktmorgen.com/@` prefix and the example;
  - the podcast episode's title and notes (`components/podcast-editor.tsx`): an `aria-label` only.
- **`aria-label` only: 21 fields.** Read so far:
  - **A field in a visibly named list,** with the list's name shown above it and the label giving its position: the deal stages ("Stages, in order"), the quiz answers ("Answers — check the right…"), the creator's own leaving reasons.
  - **Read-only text to copy,** under a visible heading: the funnel's launch checklist, a short link, the campaign link, the store's share link.
  - **Not yet read in context:**
    - the quiz scoring categories;
    - the deal custom fields (their legend is screen-reader only);
    - the email designer's blocks;
    - the team event hosts;
    - the call editor's per-person fields;
    - the form options.

**Fixed.**
- The podcast episode's title and notes now have visible labels, "Episode title" and "Episode notes".
- The home page field changes the hero's look, so it waits for the home page work under 571 [VS1].

## Pattern 3: the common value filled in, never the dearest (1 November 2026)

**Method.** Every pre-chosen control in `app/` and `components/` was read: `defaultChecked`, checked radios, and the first state of each choice.

**Found.**
- **Buyer's checkout choices:**
  - "Pay in full" is chosen before a payment plan;
  - monthly is chosen before yearly on a membership;
  - no paid add-on box is checked before the buyer checks it.
- **The pricing page:** it opens on monthly (`components/pricing-cycle-controls.tsx`).
- **A product with several prices:** the option the creator marks "Recommended" is chosen first (`startingOption` in `lib/product-option.ts`), and otherwise the first option. When the creator marks the dearest one, the dearest is chosen first. It is labeled "Recommended" in plain sight, but the item's own words say never the dearest. Whether a creator's explicit recommendation is an exception is the owner's to decide. It is recorded under "Depende do dono" in the queue, and nothing was changed.

## Not audited yet

These patterns of 487 [IT4] have not been audited:
1. Validation when the person leaves the field.
2. The most common value filled in: the "Recommended" price option waits on the owner (see pattern 3).
3. Always-visible labels: the six fields not yet read in context, and the home page field (see pattern 4).
4. Empty screens with an action and a ready example.
5. Drafts saved by themselves.
6. A live phone preview beside each editor.
7. A "Check answers" summary before publishing or sending.
