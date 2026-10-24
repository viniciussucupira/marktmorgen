# AB(a): funded checkout activation

This is a step within the commercial opening item, not completion of its resource, renewal or cash-reconciliation coverage.

## Boundary

A funded Checkout return now reuses its existing subscription read to confirm the provider subscription/customer/store, identical funding references, one USD price at the published amount and a single monthly or annual interval. Before returning active rights it asks the permanent contract ledger to bind the reserved checkout receipt to that one subscription. Metadata alone cannot authorize it.

The Lua operation validates the immutable receipt and its policy/review/store/plan/charge, company cash/carry state, a consumed grant slot and creation/activation/liability horizon. It records an immutable activation and active-store binding, removing only the pending lock. It never reduces reserved money, replenishes a slot, removes the original receipt or initializes a missing pool. Repeated observations are accepted only for the identical active binding; a lost acknowledgement preserves the committed binding. The caller validates the returned activation deadline again after acknowledgement. Initial trial and paid-period bounds cannot silently turn this checkout receipt into a later renewal.

## Remaining work

This does not activate switch or renewal grants, reconcile bank/Stripe available cash, migrate legacy rights, allocate all supplier resources for future months, or recover an expired policy after an ambiguous payment. Such cases must be reconciled without forfeiting paid rights or refunds. The legacy observation path is preserved and remains an explicit release prerequisite. The activation protocol is included in schema2 of CONTRACT_FUNDING_RULES, so the commercial terms snapshot and exact ledger policy binding change with it; an old review or ledger cannot silently authorize the new protocol. The persisted ledger key and identifiers are preserved, and any future migration must retain existing obligations. All three unfinished CONTRACT_ADMISSION_COVERAGE entries remain false. Actual review and funding policies remain null and sales stay closed.

## Cost and release prerequisites before implementation

All three plans, monthly and annual: no new Stripe request, charge, refund, payout, email or paid asset is introduced. The existing funded-checkout subscription GET is reused. At most one additional bounded Redis EVAL is proposed per funded return, with two small immutable ledger fields and a pending-field deletion. The real null policy refuses before this operation; no funded checkout can currently be sold.

For a future live policy, total return attempts must be bounded by the existing store/API admission ceilings and the operation/storage lifetime must be included at the highest paid provider prices in the per-plan monthly and annual cost review. That incremental active-path amount has not yet been measured or certified and is not assigned zero. Until the complete supplier/financial review and lifecycle are proved, the existing null policies and false coverage prevent opening. No60% all-tax margin claim or cost reduction is made. All LLC fixed costs remain Marktmorgen's.

## Synthetic verification

TypeScript tests cover receipt binding, idempotent repeats, lost acknowledgements, cross-store/subscription/plan rejection, stale periods, switches, corrupt ledgers, malformed acknowledgements and executable inputs. Billing tests verify owned provider data reaches activation, failed activation returns no new rights, and the subscription GET is reused without a provider write. The existing dedicated loopback Redis CI job executes both production Lua scripts, including64 concurrent duplicates and pre-write failure checks. Full exact-head CI is required; no local test result is claimed.

No user interface, creator content, language or persisted identifier is changed. This internal document does not certify accessibility or legal compliance.

## Verification history

Head69fddf8585a422e6fc40b3227ad6078b05c8ac57 failed the disposable Redis job120790193362 at2026-10-24T05:27:32.915Z while comparing raw HGETALL arrays after a refused activation. The source returns0 before all writes on that path; the assertion relied on Redis hash iteration order, which is not a stable record order. The revised test compares all sorted field/value pairs, retaining every field and value and the unchanged-state requirement. The actual source Lua still runs; no refusal assertion or production guard is removed. Full verification on the new head is required, not a single-job retry.

## Command-cost audit, accessed October24,2026

One EVAL request is not one billed command: the official [Upstash command-cost examples](https://upstash.com/docs/redis/sdks/ratelimit-ts/costs) include EVAL and its internal commands and describe replicated-write costs. Static enumeration of this activation script gives at most13 internal calls plus EVAL,14 executions; this is not an INFO-commandstats measurement. The existing ESSENTIAL_PER_DAY=10 and32 touched UTC days bound one store to320 essential attempts in a worst month, shared with the other essential actions.

At the [published paid command rate](https://upstash.com/pricing/redis) of0.20USD per100,000 commands, a single primary with no read replicas would give the following conditional command-only arithmetic, identically for Store, Studio and Scale in both billing intervals:14×10×32×2/1,000,000=0.00896USD per worst month, and12 such months=0.10752USD. No free quota is used. This is not a total-cost estimate or proof of actual provider topology. Replication, full-route command headroom, transfer, CPU/wall time, ledger storage lifetime and actual invoices remain unproved and are not assigned zero. No existing cost ceiling is reduced. The actual null policies and false coverage still block release.

These official pages were read on October24,2026; a publication date was not established. Future verification can use the official [Redis INFO commandstats fields](https://redis.io/docs/latest/commands/info/) in disposable CI, without calling a real supplier.

## Complete activation identity

An identical retry must preserve not only the grant/subscription/creation identity but also its initial trial-or-paid phase and exact period boundaries. Changing an anchor or phase cannot reuse this activation to reset allowances. Transitioning a trial to paid rights, a switch, renewal or pause remains a separate funded lifecycle; this initial-checkout operation does not authorize those transitions. Existing paid rights/refunds must be preserved during their later reconciliation.

## Session and subscription metadata must agree

A return cannot classify a subscription as legacy using Checkout Session metadata alone. If either funding field exists on the subscription but is absent from the session, the return refuses adoption. Partial references and mismatched references also refuse before activation. Only two provider records with no funding markers keep the historical legacy path; migration of that path is still unfinished and no coverage flag is enabled.

This check reuses the existing subscription GET: two provider reads for the return, no new provider writes, Redis calls, persistent fields, entitlements or supplier requests. The existing cost ceilings remain binding; this is not evidence that unknown bills are zero. Synthetic tests include stripped/partial session metadata, an ordinary unmarked legacy observation, a missing subscription and provider unavailability. A failed provider read grants no rights. Full remote CI on the new head is required.
