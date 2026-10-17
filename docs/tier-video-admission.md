# Provisional tiered video admission

New Stream player grants use recorded monthly watched-time thresholds: Store 4 hours, Studio 32 hours and Scale 64 hours. Trials have at most 1 hour, capped by the selected tier. Setup and ended stores have 15 minutes. All real store callers pass their tier through videoLimitFor. Missing tiers use Store; inherited object names cannot obtain another value. A downgrade keeps the same monthly watched counter and may pause immediately.

These are provisional engineering allocations. They replace the historical 400-hour admission threshold without changing subscription prices, commissions or historical invoice allowances. Historical billing still starts above 400 hours at its existing rate; it does not buy extra playback capacity. Notices distinguish paid, trial and setup states and never promise unlimited playback after a charge.

## Derivation and limits of the calculation

As an engineering allocation, choose the largest power-of-two number of hours within 4% of annual subscription revenue recognized monthly under a stated transfer model: 5.5 Mbps, one transfer per watched second, decimal GB and $0.06/GB (the highest published Standard CDN regional rate in the supplier register checked 2026-10-16). The modeled transfer is 2.475 GB/hour, or $0.1485/hour. This yields 4, 32 and 64 hours, modeled at $0.594, $4.752 and $9.504 respectively. The 4% share is a planning choice, not a tax rate or a completed cost allocation.

This model is NOT an upper bound on the real invoice. Encoded bitrate, prefetch, retries, replay, active player tokens, account network selection, storage replicas, transcoding, requests, compute, provider rounding and all taxes still need separate verified ceilings. The selected Bunny account contract has not been confirmed. Starting prices and free tiers are not assumed. Source for public regional pricing: https://bunny.net/pricing/cdn/.

The 1-hour trial and 15-minute setup thresholds are explicit reductions of acquisition/retention exposure; they are not profitable revenue-zero scenarios. Those cohorts still require separately reserved funding allocated to paid-customer costs and the company review, as authorized by the owner. Repeated free accounts and indefinite retention are not bounded by this watched-time change.

The meter is read about once an hour, and a previously issued player link can remain valid until its expiry. Raw video files use the separate download path. These limits alone do not prove an after-all-tax 60% margin. CURRENT_COMMERCIAL_MARGIN_REVIEW and supplier funding policies remain unapproved; no paid release is opened here.
