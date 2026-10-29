# Restart store source comparison

A restart's provider response is based on the store observed before awaiting Stripe. The existing Store writer now accepts an optional expected source, captured before waiting for its lock. Under that same lock and existing current-store read, it refuses a changed store ID, statistics ID, Stripe customer, subscription or active state before saving. Only the restart caller supplies this condition; other writers keep their behavior.

Two synthetic real-path races change the store while the fake provider response waits: a manually active different subscription, or a different customer on the inactive original. Both must preserve that intervening state, pause/year/due evidence and send no success/refusal notice. The earlier missing/corrupt/incomplete/thrown acknowledgment cases remain. No real account, payment or message.

Successful-path incremental Redis/provider commands and stored bytes are0 for all six monthly/annual contracts (69/690,449/4490,999/9990). Uses the existing lock/read; no key, TTL, ledger, job, dependency or provider. Retained obligation, indefinite retries, paid topology, fixed costs and tax totals remain unknown/rejected, not zero. MR/TX and100%FX275 apply, along with existing cash/reserve/rights and commercial gates.

This is a real source comparison before Store saving, not a full atomic funded ledger/pause generation CAS or provider no-double-charge guarantee. Coverage remains false/policies null, sales closed; no new entitlement, changed price/commission, certified margin or functional count. Full final-head suite and exact publication proof required after the predecessor restart ACK PR.
