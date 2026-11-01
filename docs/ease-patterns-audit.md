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
  - **A field in a visibly named list,** with the list's name shown above it and the label giving its position: the deal stages ("Stages, in order"), the quiz answers ("Answers — check the right…"), the creator's own leaving reasons. The deal stages' "What stage N means" `<select>` also has only an `aria-label`. Its list name is a paragraph, not a legend, so it is counted with the six still to read.
  - **Read-only text to copy,** under its visible name or heading: the funnel's launch checklist, a short link, the campaign link, the store's share link.
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

## Pattern 6: drafts saved by themselves, nothing lost (1 November 2026, first pass)

**Method.** Each studio editor was searched for saving on its own (a timer or a save on leaving a field) and for the leave guard (`components/leave-guard.ts`), which asks before a page with unsaved changes is left.

**Found.**
- **Saves on its own:** none of the editors read.
- **Asks before leaving with unsaved changes:** the page editor, the email studio, the funnel editors and the forms editor.
- **Neither:** the product editor, the blog editor, the course editor, the email designer, the quiz editor and the FAQ editor. Unsaved text in them is lost to one click away.

**Fixed.**
- The blog editor asks before leaving with an unsaved post. A post can be long, and nothing else kept it. Once saved, its changes are guarded again.
- The FAQ editor asks too, using its own measure of unsaved answers, which includes answers drafted by the writing help.

- The quiz editor asks while a quiz is open and differs from what was opened. A quiz opened and left untouched never asks. The assignment editor beside it asks the same way.
- After a confirmed save, the blog and FAQ editors compare against what was saved until the page brings it back, so nothing saved reads as unsaved, and anything typed after the save is still guarded and kept.
- The product form asks the same way, when adding or editing. A long description that is read after the form opens counts as part of what was opened.
- In the course editor, a module asks when its name or its days changed. A lesson asks when its name, link, preview or text changed, and while a video or file is still uploading. After a save, both take back what the server kept, so a name it tidied never reads as unsaved, except a field typed in while it was saving, which keeps what was typed. They also ask while a save is still going, since the course shares one busy state.
- The email designer needed nothing of its own. Every change in it goes into the email it sits in, and both of those (the email composer and a sequence step) already ask before leaving.

**Still to do.**
- Saving by itself with "Saving…" and "Saved" shown. That writes to the server on its own, so it needs its own request ceiling per plan first.

## Pattern 1: checked when the person leaves the field (1 November 2026, first pass)

**Method.** Every `onBlur` in `components/` was read, and every `type="url"` field was listed.

**Found.**
- **Already checked on leaving:** email fields (`components/email-field.tsx`, the "Did you mean …?" line, 17 uses) and the sign-in field (`components/signin-form.tsx`). A custom field (`components/person-fields.tsx`) saves when it is left. A page's address (`components/site-pages-editor.tsx`) is tidied when it is left.
- **Web addresses:** 13 files have `type="url"` fields. All of them are checked only when the form is sent, so a missing `https://` shows up only after pressing Save.

**Fixed.**
- `components/url-field.tsx` checks a web address when the person leaves the field, never while they are typing, using the server's own reading (`readLink` in `lib/product-link.ts`). If the address only lacks `https://`, or has `http://`, it offers the corrected address in one press. Anything else gets the server's own words. It is also said when the form is sent. While the person types, a message only goes away, once the address is right; a new one waits for the next leave, so nothing is announced at every key. After the one-press fix, the focus goes back to the field. An address too long is said, never cut. The message is tied to the field for screen readers.
- The lesson link in the course editor uses it, with its label now tied to the field by id, so does the link a product sends its buyer to, and so does a store link, each with its help tied to it. All three routes now refuse a link that is too long instead of cutting it.
- The field takes the reading of its own server. A call's two meeting links and a community event's link use `cleanRoom` (`lib/call-setup.ts`), which now refuses a link over 500 characters instead of cutting it.

**Still to do.**
- The same field in the other 8 files: host calendar, webhook editor, mark shipped, chat summary, report form, page editor, calendar editor and review studio. Each is read first: their routes do not use the product-link reading, so each needs the reading its own server applies. The webhook editor and both calendar editors are read by `checkUrl` in `lib/safe-fetch.ts`, which also imports the server's DNS and network modules. Those fields can be checked in the browser only after the pure part of `checkUrl` is moved into a browser-safe module, and that module guards every request the server sends out, so it gets its own unit and review. The tracking link (mark shipped) waits: its files are held by an open PR. The chat summary, report form, page editor and review studio are read next, one by one.

## Not audited yet

These patterns of 487 [IT4] have not been audited:
1. Validation when the person leaves the field: first pass done (see pattern 1).
2. The most common value filled in: the "Recommended" price option waits on the owner (see pattern 3).
3. Always-visible labels: the six fields not yet read in context, and the home page field (see pattern 4).
4. Empty screens with an action and a ready example.
5. Drafts saved by themselves: first pass done (see pattern 6); saving on its own not yet built.
6. A live phone preview beside each editor.
7. A "Check answers" summary before publishing or sending.
