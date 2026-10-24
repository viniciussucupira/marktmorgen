# Host calendar automatic failure retries

AB(a), 24 October 2026. Host calendar configuration and busy-time readings are shared across stores for the same host. A failed provider read previously left a failure timestamp but deleted its in-flight lock; every subsequent booking-page view could immediately read the provider again while the last good reading was older than fifteen minutes.

Automatic refreshes now reuse the recorded failure for the existing fifteen-minute interval (`SYNC_SECONDS`). They retain the existing good-reading fallback until its original forty-five-minute stale boundary, then keep the host blocked. Failures never make a stale host available. At the exact retry boundary another read is permitted. Explicit `force` checks retain their separate funded studio admission and existing rate limit; source changes, opt-out, disconnect, booking writes/moves/refunds and stored identifiers are unchanged.

Synthetic integration assertions exercise repeated reads, the same host on another store, one millisecond before the boundary, and the exact boundary with a simulated Google 503. The existing positive reads, confirmed booking/move/refund and stale-host tests remain. Full remote suite on the new head is required; no real provider is called.

## Cost boundary and unresolved funding

This removes repeated sequential provider retries inside the failure interval without adding a key, command or retained field. Existing failure reads and fallback data are reused. This is not a complete attempt cap: explicit checks, concurrent callers that observed old state before acquiring the lock, source changes, multiple hosts, lock expiry, Redis failures and successful polling still need separately bounded accounting. The existing in-flight lock is retained; no promise of exactly one call per interval is made.

Fifteen minutes implies at most 96 spaced automatic failure opportunities per full day per unchanged host, or 2,976 in a 31-day month, under sequential successful persistence and no forced refresh. This is a conditional observation bound, not a provider bill ceiling or per-customer allocation. A host can belong to several stores, so attribution cannot simply charge the most recent viewing store. No unverified per-call provider/CPU/transfer/retention price is assumed zero. Monthly and annual worst cases must include all hosts, entitlement use, retained liabilities, manual checks, failures, highest paid rates, caps and funded reserve. All LLC fixed costs, including preserved Hazelsong residuals, belong to Marktmorgen under275[FX1]; the most onerous Brazilian/US tax reading remains binding.

Commercial policies remain null, coverage flags false and sales closed. This change does not certify 60% net margin, alter existing prices/visible limits or enable any provider configuration.
