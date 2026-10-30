# 414 [KX1] — Renewal, price and trial notices, cancellation and consent proof: legal matrix and code audit (30 Oct 2026)

Part 1 of queue item 414 [KX1]. **Research, not legal advice.** Nothing here
says that Marktmorgen, a creator or a store complies with any law. No code,
price, limit, commission, flag or gate changes in this PR; `PLANS_ON_SALE` and
`OPENING_REQUESTED` stay false. Implementation follows in later PRs, in the
order of section 4.

Main read: `c98eb4e281413ebe5811fb9cbfdb423639a59ea7`.

## 1. Sources read on 30 Oct 2026, and their standing

The build environment could not open the official pages
(leginfo.legislature.ca.gov, eur-lex.europa.eu, legislation.gov.uk) on this
day: the fetch was refused before it reached them. Where an official text was
not read, the row says **secondary** and the point stays at the **more
protective reading** until the official text is read and recorded. A
secondary source is never treated as the law (TX rule: unknown does not pass).

| # | Rule | What was read | Standing |
| --- | --- | --- | --- |
| S1 | US federal: Restore Online Shoppers' Confidence Act, 15 U.S.C. §8403 | US Code 2023 edition on govinfo.gov (official) | **Official, read.** |
| S2 | FTC Negative Option Rule ("click to cancel", 16 CFR Part 425 as amended 2024) | Latham & Watkins client alert of 11 Jul 2025 on *Custom Communications, Inc. v. FTC*, No. 24-3137 (8th Cir., 8 Jul 2025) | **Secondary.** Reports the amended rule vacated in its entirety. The FTC docket and any later rulemaking were not read. |
| S3 | California Automatic Renewal Law, Bus. & Prof. Code §17602 | california.public.law mirror, page marked "Verified: Oct. 26, 2026" (its source dates disagree) | **Secondary (unofficial mirror).** To be read on leginfo. |
| S4 | EU withdrawal function, Directive (EU) 2023/2673 inserting Art. 11a into Directive 2011/83/EU | Van Bael & Bellis note of 8 Jun 2026 | **Secondary.** Applies from 19 Jun 2026; EUR-Lex text not read. |
| S6 | Utah (from 1 Jan 2025), Minnesota (from 1 Jan 2025), Massachusetts 940 CMR 38.05 (from 2 Sep 2025) | Kelley Drye "Auto-renewal laws: 2025 round-up", 31 Mar 2025 | **Secondary.** Reported: Utah, notice 30–60 days before a renewal of a term over 45 days and 3 days before a trial ends; Minnesota, a written notice of the terms and how to end them at least once a calendar year, retention offers only with consent, simple online cancel where the site has account management; Massachusetts, notice 5–30 days before a renewal of a term over 31 days, and for shorter terms a pre-renewal notice or a receipt with every charge showing the amount and how to cancel, and cancellation through the same site or app used to sign up. |
| S5 | UK DMCC Act 2024, Part 4 Chapter 2 (subscription contracts) | Carson McDowell article of 3 Sep 2026 | **Secondary.** Reports commencement brought forward to January 2027; the secondary legislation on exit and notices is still to come. Other secondary pages of 2026 said "spring 2027", so the date itself is uncertain. |

Other US states with automatic-renewal laws (New York GBL §527-a, Colorado,
Virginia, Vermont, Oregon, Illinois, others) were **not read** in this part. Until each is read, the matrix applies the strictest window found
above to every buyer and plan, wherever they are.

## 2. The matrix: what each rule asks

Windows are before the event. "Strictest" is the window that satisfies every
row read so far.

| Obligation | S1 ROSCA | S3 California | S4 EU | S5 UK | Strictest, applied until more is read |
| --- | --- | --- | --- | --- | --- |
| Clear disclosure of all material terms before billing details | Yes (§8403(1)) | Yes ((a)(1), acknowledgment (a)(3)) | General pre-contract info (Dir. 2011/83) | Pre-contract info | Show product, price, currency, frequency, that it renews until canceled, how to cancel, before the card is asked. |
| Express, affirmative consent to the recurring charge | "Express informed consent" (§8403(2)) | "Express affirmative consent" ((a)(4)) | — | Expected | A separate, unchecked consent to the renewal terms; payment refused without it. |
| Keep proof of consent | Implied by the burden of proof | Implied | — | — | Store text version, price, currency, frequency, time, channel, subscription id; keep per the owner's rule: 3 years or 1 year after the subscription ends, whichever is longer. |
| Notice before a free trial or promotional period of **more than 31 days** ends | — | 3–21 days ((b)(1)(A)) | — | Expected | 3–21 days. |
| Notice before an **annual** (or longer) term renews | — | 15–45 days ((b)(2)) | — | Expected (reminders) | **Conflict (S6):** California 15–45, Massachusetts 5–30, Utah 30–60 as reported; the only day all three allow is the 30th. Applied: send from 30 days (never earlier than the stricter maximum) and never report one sent inside the last 15 days as on time. **Depende do dono** once the official texts are read: whether Utah's minimum is met by a notice 29–30 days before. |
| Notice before each renewal of a term of 31 days or less (monthly) | — | — | — | — | Massachusetts as reported (S6): a pre-renewal notice or a receipt with every charge, with the amount and how to cancel. **Gap G11.** |
| Notice before a **price change** | — | 7–30 days ((g)(2)) | — | Expected | 7–30 days. |
| Annual reminder of the terms | — | Minnesota (S6): once a calendar year, terms and how to end them. California (h)(1)–(2): annual reminder with frequency and amount (scope to confirm on leginfo) | — | Expected | One reminder a year per subscription, with frequency and amount. |
| Online cancellation | "Simple mechanisms" (§8403(3)) | Exclusively online, at will, no obstructing step; prominent direct link or button ((d)(1)) | "Withdraw from contract here" + "confirm withdrawal", during the withdrawal period, acknowledgment on a durable medium (Art. 11a) | Easy exit (rules pending) | A direct cancel control in one press plus one confirmation, never a GET, no phone, email or new sign-up; an acknowledgment by email. |
| Save offers | — | Allowed only if the cancel control stays prominent, continuous and beside the offer ((e), (e)(2)) | — | — | The cancel control stays on the same screen as any offer, and declining is one press. |

## 3. What the code does today (audit of main)

Found by reading the code; file references are to main above.

**Marktmorgen's own plans**

- Notices: `lib/billing-reminders.ts`, sent by the daily cron
  `app/api/cron/reminders/route.ts`. Trial end: on the first daily run with
  at most 8 days left (`TRIAL_NOTICE_SECONDS`). Yearly renewal: on the first
  daily run with **at most 30 days** left (`YEAR_NOTICE_SECONDS`). Both are
  still sent down to 1 day before (`TOO_LATE_SECONDS`).
  **Gap G1:** neither has a floor (PR #1296 marks a late notice, keeps the 30-day start). A trial notice missed until fewer than 3
  days remain, or a renewal notice missed until fewer than 15, is sent late
  and looks on time; nothing records that the window was missed.
- No monthly notice or per-charge receipt from Marktmorgen (Massachusetts' rule for terms of 31 days or less, **gap G11**; Stripe's own receipts, if switched on, are not proof here), no price-change notice
  (**gap G2**), no annual reminder (**gap G3**), no notice for add-ons such as
  the Store assistant (**gap G4**, `isAddOn` skips them).
- Cancellation: `POST /api/billing/cancel` (`setCancelAtPeriodEnd`); the
  buttons are forms with `method="post"`. **Gap G5:** in the studio's paid
  view (`app/studio/page.tsx`) the cancel form sits closed inside a
  `<details>`, after the plan-switch options, so it is reachable but not a
  prominent direct control. There is no save offer today only because
  `PLAN_BREAKS_ENABLED` is false (`lib/plan-pause-rules.ts`); with it on,
  "Take a break instead" is a save offer shown before the cancel control,
  which must meet the same-screen rule before the flag is turned on. No
  emailed acknowledgment follows a cancellation.
- Consent: the plan checkout (`lib/billing.ts`) records no recurring-charge
  consent (**gap G6**).

**Buyers of creators' subscriptions and memberships** (direct charges on the
creator's Stripe account)

- No notice of any kind before a renewal, a trial end or a price change
  (**gap G7**). Creators' trials may last up to 90 days (`MAX_TRIAL_DAYS`,
  `lib/product-recurring.ts`), so the 3–21-day notice for trials over 31 days
  is owed on some of them. Only static words at checkout and on the thanks page
  (`lib/buyer-words/thanks.ts`).
- Cancellation: an emailed one-hour link to `app/[handle]/manage`, whose
  Cancel is a POST to `app/api/store/manage/cancel` that opens Stripe's
  portal with `subscription_cancel` at period end. A one-time coupon offer is
  added in Stripe's flow (`lib/membership-manage.ts`, `lib/save-offer.ts`),
  and the manage page keeps its own Cancel button. **To confirm (G8):** that
  Stripe's retention screen keeps the cancel button beside the coupon offer
  in the sense of §17602(e)(2); no emailed acknowledgment of the
  cancellation from Marktmorgen (Stripe's own email, if enabled on the
  creator's account, is the creator's setting and is not proof here).
- **Gap G10:** where a store has no manage page (`canManage(store)` false),
  the thanks page tells the buyer to cancel by replying to the order email
  (`renewsForReply`, `renewsUntilReply` in `lib/buyer-words/thanks.ts`): an
  email-only path that the strictest row rules out.
- Consent: the EU digital-withdrawal consent (`lib/digital-consent.ts`) is a
  different consent; it stores version, kind and time but not the renewal
  terms, the price or the text. **Gap G9:** no specific consent to the
  recurring charge, and no proof record with terms and price.

## 4. Order of the next PRs (each with tests that fail on the wrong behavior)

1. **Consent proof (G6, G9).** One unchecked "I agree to be charged
   <amount> every <period> until I cancel" consent, versioned, refused
   server-side without it, for buyers and plans; proof record (text hash and
   version, amount, currency, frequency, time, channel, subscription id, no
   extra personal data) kept 3 years or 1 year after the end, whichever is
   longer. Prerequisite: the storage cost of the record per plan at full use,
   with its cap, before it is written (MR rule).
2. **Notice windows (G1–G4).** One pure rule module with the strictest
   windows of section 2, a `missed` state that is recorded instead of a late
   notice dressed as on time, idempotency per subscription, event and window
   version; reuse `lib/billing-reminders.ts`.
3. **Buyer notices (G7).** The same rules for creators' subscriptions, from
   Marktmorgen's own polling of the creator's Stripe account, paid from a
   measured cap per store before the obligation is taken on; a failed send is
   recorded as not sent, never as sent.
4. **Cancellation (G5, G8, G10)**, and the per-charge receipt or notice of G11. A direct cancel control in every state, POST
   only, one confirmation, emailed acknowledgment; the coupon offer only with
   the cancel control on the same screen.
5. **Matrix completion.** Read on the official sites, with dates: leginfo
   §17602 and §17601, EUR-Lex 2023/2673, the UK regulations once made, and
   the other states' laws; record any divergence in "Depende do dono".

Every new email is owner-side or buyer-side transactional mail and must be
priced in `lib/cost-table.ts`-style worst cases per plan (monthly and annual,
100% use) before it is switched on; unknown cost is not zero.

## 5. What this part does not do

No code, no email, no Stripe call, no account, no contact with any authority
or third party. No figure or sentence in the product changes.
