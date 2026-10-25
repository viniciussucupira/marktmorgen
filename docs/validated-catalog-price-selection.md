# Confirm price evidence before selecting a catalog ID

ensurePrice previously accepted a catalog row by amount, USD and interval, without the interval count, and cached a newly created price by ID alone. A monthly lookup could therefore select a two-month charge, or an incomplete creation response could authorize a later subscription request before the response guard noticed a discrepancy.

One shared observation check now requires a nonempty ID, the unchanged PLAN_PRICES amount, USD, the requested month/year interval and count1 for both existing and newly created rows. Creation explicitly requests count1. Unconfirmed new-price responses throw and are not cached. Existing checkout inline fallback remains unchanged; no price IDs are manually configured and legacy subscription interpretation is preserved.

Synthetic catalog cases cover doubled interval replacement, explicit one-interval creation, partial/contradictory creation refusal without cache pollution, later confirmed recovery, valid-existing reuse and both cache paths. Existing funded switch metadata fixtures now include the provider's interval count; the pause fixture's price creation response echoes the requested fields. These fixture corrections preserve all behavioral assertions and legacy source prices.

There is no additional request for a valid catalog price. Invalid listed evidence uses the existing product/price replacement path; the full worst-case fallback work still has costs. Comparisons, bytes and retries are unmeasured, not zero or savings. This is catalog validation, not payment/funding/reconciliation proof. Published prices, visible limits, sales and financial/tax gates remain unchanged.
