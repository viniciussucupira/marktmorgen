# Contract cash reserve before a new obligation

New subscription checkout and plan-switch routes now require a single-use full-term cash grant before creating a charge or requesting a new plan. Recovery of an already active subscription and already collected legacy rights remains separate. Prices, commission rates and the annual ten-month price are unchanged; the annual benefit period is twelve months.

## Cash calculation

All amounts are USD cents. For each published tier/cycle the minimum grant reserve is:

refund principal + paid-period cost ceilings + paid-period tax ceiling + ceil((company monthly fixed costs + fixed taxes + funded exposure ceiling) × covered calendar months / reviewed paid base).

Refund principal is the full published subscription price. It is cash held for a possible return, not an invented operating expense or a change to the profit calculation. Already reserved liabilities are carried separately and cannot finance a new grant. The company pool must cover every funded grant in every tier/cycle plus those carried liabilities. The financial review must separately preserve the unchanged 60% paid-unit floor and minimum customer base. The complete prospective new trial cohort must appear in the exposure review.

The coverage horizon starts with all paid months at a conservative 31 days each, the source trial length and an independently reviewed liability tail. It adds the maximum source pause allowance until a finite fixed point is reached. The reviewed tail cannot be less than the source refund and closing periods combined; that floor is not a legal determination of when disputes or statutory obligations expire. Missing liability review is rejected. The date-bound supplier/liability review must cover the last permitted admission, an activation-day allowance and the full resulting horizon. Company cost shares use an upward bound on the number of touched calendar months, including partial months.

## Admission and provider reference

One non-expiring company Redis hash stores the exact review binding, carried cents, total reserved cents, finite tier/cycle grant slots, immutable grant receipts and one pending lock per store. Canonical own-data financial evidence is hashed with SHA-256 for the ledger binding. Accessors, inherited review objects, unsafe amounts, stale dates and changed evidence cannot fabricate approval. Lua checks every relevant value before writing. This path never initializes the pool, releases money, frees pending stores or resets an old receipt.

A committed grant has a five-minute submission deadline. Funded Checkout creation receives an explicit one-hour expiry and a reserve reference on both session and subscription metadata. Stripe documents Checkout expiration between 30 minutes and 24 hours; the application pins one hour. A funded plan change records a separate pending-grant reference before the change, preserving the active grant while payment is pending. Stripe documents pending-update expiry within 23 hours, or earlier at the applicable trial/period boundary. The quote includes an activation day rather than assuming every payment completes immediately. Source references: [Checkout expiration](https://docs.stripe.com/payments/checkout/managing-limited-inventory?payment-ui=stripe-hosted), [pending updates](https://docs.stripe.com/billing/subscriptions/pending-updates).

The billing payload guard rejects a mismatched store/plan, a grant below refund principal, a price differing from the published offer, or an expired submission window. Failed provider work or lost acknowledgements retain cash, slots and pending locks; a different nonce or plan choice cannot bypass the same store's pending obligation. Settling an abandoned or completed attempt requires authoritative provider reconciliation, not a timeout-based refund of reserved money.

## Release status

CURRENT_CONTRACT_FUNDING_POLICY remains null. No actual bank reserve, vendor invoice bound, statutory tail, retained paid base or all-tax margin is certified. The final opening guard also requires implemented lifecycle coverage: future resource allocations, automatic renewal admission and reserve settlement/reconciliation are explicitly false. New enrollment/switch guards alone cannot authorize recurring sales. Existing contracts require a funded migration; no rights or legal refunds may be forfeited to fit the model.

Tests use explicitly hypothetical financial data, mocked Stripe responses and disposable loopback Redis. The source Lua is executed against real Redis in CI. Bank-account reconciliation, whole-term provider capacity, live retained-base observation, renewals, legal/tax review and actual supplier ceilings remain unfinished.
