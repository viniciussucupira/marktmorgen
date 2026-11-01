# Store test mode (443 [TS1], with 444 [TS2])

Design written by Claude 2 on 1 November 2026, from the code on main. Nothing is built by this document. It records what test mode can reuse, the choice it needs about Stripe accounts, the gaps as units, and what depends on the owner, so nothing is built twice.

## What the item asks

- **(a) Switch and selling.** Every creator, with or without a paid plan, can switch "Test mode" on and off in their own store. While it is on, the store sells only in Stripe's test mode (test card 4242 4242 4242 4242), with the same checkout, delivery, emails, orders, refunds and reports as a real store. No real money moves and no real card is taken.
- **(b) Honesty.** The store says it is a test store, with no charge, before any payment form. No test sale counts in public numbers, platform statistics, reviews or buyer counts.
- **(c) No abuse.** Purchase and delivery emails go only to addresses the creator has verified. Test orders stay apart and marked as tests after test mode is switched off.
- **(d) Cost.** A funded exposure with automatic daily and monthly ceilings on orders, emails, files and AI calls, computed first. Unknown fails.
- **444 [TS2].** The creator in test mode can go through the plan subscription screen of any plan, in Stripe's test mode, with no charge and no paid right switched on. PLANS_ON_SALE and every gate stay as they are.

## What already exists (reuse, do not rebuild)

| Piece | Where | What it does today |
| --- | --- | --- |
| A store that sells in Stripe's test mode | `sellsInTestMode` in `lib/stripe-connect.ts`, read by the store page, the product page, the embed, payment requests and the Path (`lib/path-facts.ts`) | True for the demo's account, or when the whole site runs on a test key. The pages already show a "rehearsal" notice before paying |
| A key that can only ever be a test key | `demoKey()` in `lib/demo-account.ts`, `keyFor(account)` in `lib/stripe-account.ts` | Every request on a creator's account passes through `keyFor`. The demo's account is signed only with a key that must start with `sk_test_`/`rk_test_`, so a live key is refused |
| A store that writes to no buyer | `isHouseStore` (31 places: checkout, cart, thanks page, inbox, assistant, reminders, benchmarks…) | The demo sends no buyer email and stays out of shared numbers |
| Paying nothing, bounded | `lib/free-pool.ts`, `lib/free-pool-rules.ts`, `NON_PAYING_ALLOWANCES`, `nonPayingWorst` in `tests/plan-cost-registry.ts`, docs/funded-exposure-review.md | A store without a paid plan holds one of the month's shared places before it costs anything. It has small figures of its own (visits, orders, emails, studio and API) priced in its worst window, with ten base places in the company's fixed costs |
| Confirming an address | the sign-in link and the recovery address (`lib/recovery-address.ts`, a code emailed and typed) | One-time codes or links that prove an inbox |
| What Stripe offers for tests | docs.stripe.com/connect/testing, read on 1 November 2026 | "You can create multiple test accounts" through the Accounts API or the Dashboard, with test values for onboarding (`000000000` for an ID number, `address_full_match`, the date of birth `1901-01-01`, the SMS code `000-000`), and "Sandboxes might not enforce some capabilities" |

## The one choice: whose Stripe account a test sale is made on

Account ids look the same in test and in live mode, and `keyFor` decides the key from the id alone. So the store has to say which account is its test account.

- **A. Every test store charges the demo's account.** It is the least work, but the creator would see an account that is not theirs. Their test buyers' names and addresses would sit beside every other store's on one account, which is read with one key. Reports read from the account would have to be filtered by store on every read. **Not chosen.**
- **B. Each store gets a test account of its own** (recommended). It is created with the platform's **test** key, and the creator goes through Stripe's onboarding in test mode with Stripe's own test values, exactly as they will for real. Its id is kept beside the live one (`testStripeAccountId`). `keyFor` signs it only with a test key, as it does for the demo. What the creator sees is then what a real creator sees, onboarding included, and nothing is shared between stores.

B needs a second platform key that is a test key, kept apart from the live one (a `STRIPE_TEST_SECRET_KEY`, refused unless it starts with `sk_test_`/`rk_test_`, like `demoKey`). Setting it in Vercel is the owner's, not an agent's (see below).

## Gaps against the item (each a unit, tests first)

1. **The switch, off in the code.** `STORE_TEST_MODE_ON = false`, in the pattern of `ZOOM_APPROVED`, until the exposure review of unit 7 passes. A store field `testMode`, changed only by the owner of the store (team roles), with the time it changed.
2. **The test account (B).** "Set up test payments" in the studio creates the test account with the test key and opens Stripe's test onboarding. `keyFor` learns the store's test account. A live key on it is refused, with tests that a live key never signs it.
3. **Selling in test mode.** While `testMode` is on, every checkout path of the store charges the test account. These paths already call `sellsInTestMode` or `keyFor`: product, cart, embed, payment request, tip, booking and subscription. `sellsInTestMode(store)` becomes true for it. Every order made there carries `test: true`, written where the order is written, never inferred later.
4. **Honesty and counts (b).** The rehearsal notice already shown before paying says "This store is in test mode. Nothing is charged". No test order counts in public numbers, reviews, buyer counts, benchmarks (`lib/benchmarks.ts` already leaves the demo out), the Path's money, affiliates' commissions or the company's numbers. Each reader that counts orders filters `test`, with a test per reader.
5. **Emails only to verified addresses (c).** The creator confirms up to a few test buyer addresses (the sign-in address already counts) by a code, as the recovery address does. In test mode, a purchase or delivery email to any other address is not sent, and the thanks page says why. Reminders, the list, the assistant and the inbox stay closed in test mode, as they are for the demo (`isHouseStore`'s places, read through one shared check, not 31 copies).
6. **Switching off (c).** Test orders stay, marked and apart: a "Test orders" view, never in the real list or exports unless asked. The test account is kept for the next test. Switching off never touches real orders.
7. **Cost (d).** A store in test mode without a paid plan already holds a free-pool place and its `NON_PAYING_ALLOWANCES`. Test orders, test emails, file deliveries and AI calls count against those same figures, by day and by month, reserved before they happen. A paid store in test mode counts them against its plan's own figures. The worst window of a test store is added to `nonPayingWorst`; if it grows, the free share in every paid plan grows with it. The review in docs/funded-exposure-review.md gets a test-mode line. Unknown fails, and `STORE_TEST_MODE_ON` stays false until then.
8. **444 [TS2], the plan screen.** In test mode, "Try the plan checkout" opens the platform's subscription checkout for any plan, on the platform's test key. It shows the same screen and payment methods, with no charge, and a webhook-free reading that switches no right on: the store's plan stays exactly what it was. With PLANS_ON_SALE false, the real subscription stays impossible. Tests: a test subscription never changes `planOf`, the limits or any gate.

## What depends on the owner

- **The test key.** Create a restricted or secret **test** key in the platform's Stripe account and set it in Vercel as `STRIPE_TEST_SECRET_KEY`. Agents create no key and touch no Stripe setting.
- **Turning it on.** `STORE_TEST_MODE_ON` changes to true only after unit 7's numbers are in the exposure review, in a reviewed PR.
- **How many confirmed test addresses** a store may have (proposed: three, besides the sign-in address).

## Accessibility for every unit

Each unit's PR carries its own Acessibilidade section (AX274). The switch is a real control with its state said in words. The test-mode notice is text, not color alone, and is placed before every payment form. The "Test orders" view keeps the order list's own structure.
