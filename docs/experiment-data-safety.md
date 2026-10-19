# A/B decision data safety

Malformed, unavailable, unsafe or inconsistent counts must not retire a version.
This change adds an explicit unavailable state before every decision, chance or
duration calculation. Nonfinite, negative, fractional and unsafe counts, invalid
allocation/time inputs, conversions above views, missing paid-sale money moments
and inconsistent squared sums fail closed. The statistical boundary, sample floors,
refund waiting period and declared measure remain unchanged.

The database parser distinguishes an empty hash (a new test with genuine zeros)
from failed or malformed replies. Lazily unwritten fields still default to zero.
Provided invalid values are never silently replaced with zero. Database outages
return a flagged unavailable reading; the owner API responds503 with no-store.
The public page and checkout already use the shared winner function, so they keep
normal test allocation rather than promoting a version from that reading.

The editor now shows separate loading and unavailable statuses, with no fabricated
zero tally, confidence or winner. Product/test keys remount results when the saved
test changes, preventing stale results being shown for another test. Reload retries
the existing request. No new database/provider/AI requests, keys, prices, allowances
or commercial/fiscal gate changes are added.

Synthetic validation covers invalid data and parser cases, actual adapter read
failure, valid winners and UI notices. The browser fixture seeds a corrupted test
only in its disposable database, checks actual503 and the visible warning at390/1280,
runs scoped accessibility checks and exercises recovery with a synthetic valid reply.
No real payment or message is used.

This continues the source-based comparison of experiment tools:
https://support.myclickfunnels.com/docs/managing-ab-split-testing-in-funnel-steps/

Known separate work: noteTestSales currently claims deduplication before its metrics
write, so a lost write can omit a sale. That requires a separate atomic-write change
and real Redis concurrency/failure coverage. Refunds are still not subtracted per
version and remain disclosed; no change here certifies financial margin or causal lift.
