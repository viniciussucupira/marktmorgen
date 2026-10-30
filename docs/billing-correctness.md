# 569 [NC1] — Every path that charges money: inventory (30 Oct 2026)

Unit 1 of 569 [NC1] (owner's request of 30 Oct 2026, 16h33 Fortaleza: no wrong
or undue charge may ever reach a customer, everything automatic, no manual
work for the owner). This file is the inventory the item asks for in step 1.
It is a document only: it changes no code, no price, no limit and no flag.

**How it was made.** Read from the code on main (30 Oct 2026, about 20h55
Fortaleza) with grep and by reading the functions named below; nothing was
run against Stripe or PayPal. "Tests" names the test files that import or
mock the path; importing a module does not prove the Stripe write itself is
asserted, and where that was not checked the row says **unverified**. Line
numbers are approximate guides, not references to rely on after later edits.

**What this inventory does not yet show.** It does not prove any path
charges the right amount; that is units 2 to 6. A path marked "no key" is a
place where a repeated request could reach Stripe twice; whether that can
charge twice depends on the path (a second Checkout Session is not a charge
until the buyer pays it), and each is decided in unit 3.

## How Marktmorgen writes to Stripe

No Stripe SDK is used. Every write is a raw `fetch` through one of:

- `onPlatform` / `onPlatformAt` (`lib/billing.ts`): Marktmorgen's own
  (platform) account; optional `idempotencyKey`.
- `onAccount` (`lib/stripe-account.ts`): the creator's connected account
  (`Stripe-Account` header), direct charges; optional `idempotencyKey`.

No route receives Stripe webhook events: no `Stripe-Signature` /
`constructEvent` was found in `app/` or `lib/`. State is read back from Stripe
by cron routes (`app/api/cron/stripe-check`, `plans`, `reminders`, `closing`,
`shares`, `usage`, `monthly`, `weekly`). So "a webhook delivered twice" is not
a path today; "a cron run twice, or two runs at once" is.

## A. Marktmorgen charges the creator (platform account)

| Path | Where | When | Amount | Idempotency key on the write | Consent recorded before | Tests today |
| --- | --- | --- | --- | --- | --- | --- |
| Plan checkout, monthly or yearly | `createBillingCheckout` (`lib/billing.ts` ~304; `/checkout/sessions` ~369 and its retry ~387); route `app/api/billing/checkout` | When the creator completes Stripe Checkout (subscription mode) | `PLAN_PRICES[tier][cycle]` (`lib/plan.ts`) via `ensurePrice` (a Stripe price is used only when its amount matches), or inline `price_data`; no coupons | **No key** (a Checkout Session, not a charge) | Stripe's page only; a stored record of the creator's consent to the recurrence: **not found** | `billing-trial-policy` asserts the session body for every tier and cycle: the published amount (inline and through the catalog price), USD, no promotion codes, and both one-time fallbacks; `contract-billing-metadata`, `approved-plan-pricing`, `contract-routes` import it |
| Free trial | Same checkout, `trialOffered` (`trial_period_days` = `TRIAL_DAYS`, 14; `missing_payment_method=cancel`) | When the trial ends | As the plan | As the plan | As the plan; the trial-end notice is 414 [KX1] (PR #1296, open) | `billing-trial-policy`, `trial-nudges` |
| Plan change with proration | `switchPlan` (`lib/billing.ts` ~1136; subscription updates with `proration_behavior=always_invoice`, `payment_behavior=pending_if_incomplete`); route `app/api/billing/switch` | At once, an invoice for the prorated difference | Stripe's proration between `lib/plan.ts` prices | **No key** on any of its writes | The page states the cost first; no stored record found | `plan-scale`, `contract-billing-metadata` import it |
| Cancel / undo cancel | `setCancelAtPeriodEnd`; route `app/api/billing/cancel` | Stops future charges | — | No key | — | `billing-cancellation-observation` |
| Pause and restart | `lib/plan-pause.ts` (Codex's AV1 step-3 file; not edited here) → `restartPlan` (`lib/billing.ts` ~727) | At the end of the pause, on the saved card | The paused tier's price | Yes: `restart:<subscription>:<until>`, or the funding grant's key | The pause record; its wording **unverified** | `plan-pause`, `billing-resume-unknown-route`, `restart-recovery-ack`, `contract-restart-activation`, `pause-stopped-undo-cost` |
| Reactivation | Same checkout route; a lapsed subscription is first ended (`endLapsed`, DELETE) | As the plan checkout | As the plan | No key (DELETE) | As the plan | Partly `closing-plan-routes` (**unverified**) |
| Failed payment and retries | No code charges again; Stripe's own retries apply. `sendFailedPlanNotices` (`lib/billing-reminders.ts`) emails the creator; `keepCardThatPays` sets a default card | Only a card change | — | No key on the card change; the email uses a Redis claim | — | `plan-payment-failed`, `payment-recovery` |
| Store assistant add-on | `createAssistantCheckout` (`lib/assistant-billing.ts` ~99); stop/start `setAssistantStop`, `syncAssistant`; a disputed add-on is deleted | At checkout, then monthly | `ASSISTANT_PRICE_CENTS` ($69) | **No key** | Checkout page only | `store-assistant`, `assistant-subscription-sync` import it; `createAssistantCheckout` itself: **no test found** |
| AI captions (one-off) | `chargeNow` (`lib/billing.ts` ~1536) from `lib/auto-captions.ts`: invoice, item, finalize, pay; void on failure | At once, before the work runs | `autoCaptionCents` ($6 a minute a language, at least $35) | Yes on invoice, item, finalize and pay (`nl-captions:<id>:<at>:…`); **no key** on the void | The creator is shown the price; a stored record: **unverified** | `auto-captions` (through a fetch mock); `chargeNow` by name: **no test found** |
| AI captions refund | `refundCharge` (`lib/billing.ts` ~1605) | When the service refuses or captions partly fail | Full, or the languages not delivered | Yes | — | `refund-receipt`, `auto-captions` |
| Usage lines (traffic, email and the like) | `carryOut` (`lib/usage-billing.ts`) → `addToNextInvoice`; `billAddedLinesMonthly` | On the next invoice | The metered difference | Yes on the line (`nl-<meter>:…`, and the line is looked for first); **no key** on `billAddedLinesMonthly` | **Not found** | `traffic` imports it; `addToNextInvoice`: **no test found** |
| Refunds on a store's closing (creator's plan) | `lib/closing-plan-guard.ts` (refund, expire sessions, void and delete invoices, delete subscription) | Automatic, in the closing period | What was paid since the start of the closing day | Yes on refund, expire and void; **no key** on the subscription and invoice DELETEs | Terms and the closing notice (307 [EC1]) | `closing-plan-guard`, `closing-plan-routes`, `plan-closing` |
| Refund of a platform share | `lib/share-settle.ts` (`/application_fees/<id>/refunds`) | After a refunded sale that carried a share (`COMMISSION_LIVE` is false today) | The share's part | Yes | — | `fee-refund-receipt`, `platform-share` |

## B. Creators' store sales (the creator's own Stripe account, direct charges)

| Path | Where | When | Amount | Idempotency key | Consent recorded before | Tests today |
| --- | --- | --- | --- | --- | --- | --- |
| One-off, gift, preorder, team purchase, order bumps, payment plan, membership | `createCheckout` (`lib/store-checkout.ts`, `/checkout/sessions` ~739) | When the buyer pays; a preorder is paid at once | The product's or option's price, bumps as extra lines, pay-what-you-want through a creator price; one discount (winback, welcome, intro, fair, sale or code); membership trial days | **No key** (a session) | Digital-content consent (`CONSENT_META`, `requireDigitalConsent`) on the session and the payment or subscription; for gift, preorder, team purchase, membership and payment plan: **not found** beyond that | `gifts`, `group-buy`, `preorders`, `digital-consent`, `several-bumps`, `payment-plan-end`, `checkout-tax-journey`, `offer-journeys`, `fair-price`, `code-link`, `affiliate-recurring`, `membership-numbers` |
| Cart checkout | `lib/cart-checkout.ts` (~194) | When the buyer pays | Sum of the lines | **No key** | Digital consent | `cart`, `cart-bundle`, `cart-reminder` |
| Post-purchase offer | `lib/upsell.ts` (`/payment_intents`, off-session, ~379) | At once, when the buyer accepts | The step's price | Yes: `nimbus-upsell:<session>[:<slot>]` | Each offer's own button consent (`CONSENT_META`); refused without it | `upsell-journey`, `offer-journeys` |
| Tips | `lib/store-tip-checkout.ts` | At checkout | What the tipper picks | **No key** | **Not found** | `store-tips` |
| Payment requests | `lib/payment-requests.ts` | At checkout | The request's amount | **No key** (session and expire) | **Not found** | `payment-requests` |
| Calls and call packages | `lib/calls.ts`, `lib/call-packages.ts` | At checkout | The call's or package's price | **No key** on the sessions | **Not found** | `call-packages`, `call-reminder`, `team-scheduling` |
| Card update that pays an open invoice | `lib/card-update.ts` | When a member updates the card | The open invoice | Yes on the pay (`nimbus-card-pay:<invoice>:<method>`); no key on the others | The member's choice | `payment-recovery` |
| Member tier switch / switch to yearly | `lib/tier-switch.ts`, `lib/yearly-switch.ts` (`always_invoice`) | At once | Prorated | **No key** | A confirmation: **unverified** | `tiers`, `yearly-switch`, `yearly-price`, `yearly-offer` |
| Member pause and resume | `lib/membership-pause.ts` | Resume charges on the normal cycle | — | **No key** | **Unverified** | `membership-pause` |
| Billing portal | `lib/membership-manage.ts` | Changes the buyer makes in Stripe's portal | — | — | — | `membership-numbers` (**unverified**) |
| Coupons and promotion codes | `app/api/store/sale`, `lib/discount.ts`, `lib/intro-coupon.ts`, `lib/save-offer-coupon.ts`, `lib/fair-coupon.ts`, `lib/call-packages.ts` | — (they lower charges) | Percent or amount | **No key** | — | `discount-*`; intro, fair and save-offer coupons and pay-what-you-want: **no test found** |
| Store closing: holds, refunds, ending subscriptions | `lib/closing-holds.ts`, `lib/closing-refunds.ts` (`closing-refund:<invoice>`), `lib/closed-store-data.ts` (`closed-now:<id>`) | Automatic, by the 307 [EC1] rules | Unused paid time | Yes on all | Terms and closing notices (307 [EC1]) | `store-closing-fair`, `closing-plan-guard`, `closing-plan-routes`, `closing-families`, `closing-cost` |
| Share adjustments on member subscriptions | `lib/share-settle.ts` (~253) | After refunds | The share | **No key** | — | `platform-share` |
| PayPal sale | `lib/paypal-sales.ts` (capture; `PayPal-Request-Id` when a request id is passed) | When the order is captured | The product's price from the store record, checked against the capture (`matches`) | `PayPal-Request-Id` where passed; every caller: **unverified** | Digital consent from the form | `paypal-sales`, `paypal-numbers`, `digital-consent` |

## Gaps this item closes (units 2 to 7)

1. **Consent records (unit 2 and 414 [KX1]).** No stored record of the
   creator's consent to a plan's recurrence, a plan change or an add-on was
   found; on the store side, consent is recorded for digital delivery only,
   not specifically for memberships, payment plans, gifts, preorders or team
   purchases. Step 2 requires a record with the text's version and time
   before each such charge.
2. **Amounts (unit 2), already held by tests.** Checked on 30 Oct 2026
   (21h05 Fortaleza): the plan checkout sends the published amount for every
   tier and cycle (`billing-trial-policy`); a store checkout sends the
   product's own price with the discount as a separate coupon or promotion
   code that Stripe takes off (`store-sale`: "the price sent is the
   product's; Stripe takes the sale off"; `intro-price`, `fair-price`,
   `code-link`, `offer-journeys`), and bumps, carts, gifts, team purchases,
   tips, payment requests and call packages assert their line amounts
   (`several-bumps`, `cart`, `gifts`, `group-buy`, `store-tips`,
   `payment-requests`, `call-packages`). So unit 2 needs no new rule before a
   charge. What is not held anywhere is the check AFTER the charge: that
   what Stripe actually charged (net of the discount, in the currency shown)
   equals what was sent. That is units 5 and 6. The proration of
   `switchPlan`, `tier-switch` and `yearly-switch` is Stripe's and is
   compared there too.
3. **Idempotency (unit 3).** Writes with no key: every Checkout Session
   (plan, assistant, store, cart, calls, packages, tips, payment requests),
   the subscription updates of `switchPlan`, `tier-switch`, `yearly-switch`,
   `membership-pause` and `share-settle`, `billAddedLinesMonthly`,
   `keepCardThatPays`, subscription and invoice DELETEs, the captions void,
   and coupon creation. Each gets a key derived from what it acts on, so a
   retry or a second run reaches Stripe as the same request.
4. **After an end (unit 4).** Charges after a cancellation, a store's
   closing or a trial's end are stopped by Stripe's own state and by 307
   [EC1]'s guards; open invoices after a plan pause belong to Codex's step-3
   files and are asked of Codex, not edited here.
5. **No daily check exists (units 5 and 6).** Nothing compares the charges of
   the last 48 hours with what the rules expected, and nothing refunds a
   difference on its own outside the store-closing and captions paths.
6. **Tests missing:** `chargeNow` and `createAssistantCheckout` by name,
   `addToNextInvoice`, the pause route, intro, fair and save-offer coupons,
   pay-what-you-want.
7. **Texts (unit 7).** Terms, Refunds and Privacy say nothing yet about a
   daily check or automatic refunds; nothing is promised until the code does
   it (VR).

Nothing here changes a price, a visible limit, the commission,
`PLANS_ON_SALE`, `OPENING_REQUESTED`, the tax gate, Article 9a, the
commercial review or `stripePlatformEligibilityReady`.
