# Restart store source comparison

A restart's provider response is based on the store observed before awaiting Stripe. The existing Store writer now accepts an optional expected source, captured before waiting for its lock. Under that same lock and existing current-store read, it refuses a changed store ID, statistics ID, Stripe customer, subscription or active state before saving. Only the restart caller supplies this condition; other writers keep their behavior.

Three synthetic real-path races change the store while the fake provider response waits: a manually active different subscription, a different customer on the inactive original, or a different inactive subscription. The due worker also checks current subscription/customer against the retained pause before any provider call; repeated inactive mismatch cases assert zero additional provider reads or charge attempts. All must preserve that intervening state, pause/year/due evidence and send no success/refusal notice. The earlier missing/corrupt/incomplete/thrown acknowledgment cases remain. No real account, payment or message.

Successful-path incremental Redis/provider commands and stored bytes are0 for all six monthly/annual contracts (69/690,449/4490,999/9990). Uses the existing lock/read; no key, TTL, ledger, job, dependency or provider. Retained obligation, indefinite retries, paid topology, fixed costs and tax totals remain unknown/rejected, not zero. MR/TX and100%FX275 apply, along with existing cash/reserve/rights and commercial gates.

This is a real source comparison before Store saving, not a full atomic funded ledger/pause generation CAS or provider no-double-charge guarantee. Coverage remains false/policies null, sales closed; no new entitlement, changed price/commission, certified margin or functional count. Full final-head suite and exact publication proof required after the predecessor restart ACK PR.


## Same identity, changed plan — 28 October2026

The expected Store source now captures tier and billing cycle before waiting for the existing owner lock, in addition to identity/customer/subscription/active state. A restart refuses to overwrite a newer inactive plan with the same IDs. The due worker also compares the retained pause tier and requires its original monthly interval before any provider operation, so the next pass does not repeat a charge after a plan mismatch.

Two synthetic real-path cases change tier or interval while the fake provider answers. They require the newer state to remain untouched, exact pause/annual evidence and due ownership retained, no success/refusal email, and zero provider reads/charges on the next due pass. Existing three identity races and four missing/failed Store acknowledgment cases remain unchanged. Complete new-head CI is required; no real payment or message is performed.

No additional success-path command, key, persisted field, provider call, storage allocation or retention period is introduced for Store/Studio/Scale, monthly or yearly. This local comparison does not fund retained liability/retries or prove full cost/margin. No full funded Store/ledger atomic publication, generation cleanup or no-double-charge guarantee is claimed; pauseRestart coverage remains false and actual policies/reviews null. MR/TX/100%FX275 and prices/limits/commission/opening flags remain unchanged.
