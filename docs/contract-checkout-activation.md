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
