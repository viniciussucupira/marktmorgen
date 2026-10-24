# Exact restart response identity

A successful provider response must still match the customer, tier and monthly cycle requested by the paused creator, with no trial. Previously, any active subscription parsed by the shared observation helper could be returned for store activation. Restart now refuses mismatched observations before that write.

Synthetic responses cover another customer, another tier, a yearly plan and a trial. Each leaves the store inactive, retains the pause under existing uncertain-outcome handling, sends no success/no-charge notice, and makes only the existing provider attempt. Normal legacy restart and manual restart cases remain.

This response guard is not a durable restart protocol. It does not reconcile an uncertain charge, persist a pre-charge intent or fix a null store acknowledgement; those remain AB(a) work. It adds comparisons only: no new provider or Redis operations, sends, persisted keys or fields. Incremental CPU and bytes are unmeasured, not zero. Sales, financial coverage and the tax gate remain closed.
