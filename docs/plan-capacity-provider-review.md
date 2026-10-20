# C2 — provider assumptions that still prevent capacity approval

Review date: 19 October 2026, Fortaleza. Source inspected at `9b6ebe211b477505a563b8ef9e0c014d3e9a1a16`. This supplements [the capacity precheck](plan-capacity-precheck.md); it does not replace the receiving model, registry, spend floor, tax review or company exposure review. Queue89 stays in progress. No capacity increase is admitted and no price, visible limit, runtime operation or gate changes here.

## File delivery has to be reviewed by provider path

| Observed code | Consequence for the cost review |
| --- | --- |
| `tests/plan-cost-registry.ts` sets `FILE_DELIVERY_PER_GB=0`. | A zero bandwidth rate for one provider is not a zero cost for every request or fallback. |
| `lib/vault-upload.ts` returns null when its door reports off; `lib/sold-file-upload.ts` then uses the host's file store. | The Blob fallback must have its own reviewed delivery envelope; do not assign R2's egress price to it. |
| `lib/vault.ts` signs direct GET URLs for the buyer. | Trace repeat uses of a still-valid URL, provider read operations and legacy object paths. A TTL bounds time, not the number of provider reads. No attack or real download was run. |
| `lib/delivery.ts` describes its allowance as observational and never refuses an already-purchased download. | Do not treat that allowance as a proven financial brake or silently remove the buyer's existing delivery rights. Fund the exposure before offering a new obligation. |
| `app/api/store/vault/route.ts` reserves upload/control budgets. | Upload admission is already metered; this finding does not assert that uploads are unbounded. Upload reservations alone are not evidence of a bounded later download envelope. |

[Cloudflare's current pricing](https://developers.cloudflare.com/r2/pricing/) distinguishes storage, write/list operations, read operations and retrieval. Its published Standard rates are $0.015/GB-month, $4.50/million Class A and $0.36/million Class B. Infrequent Access has different operation rates, a retrieval charge and minimum duration. Egress is uncharged; reads are still operations. Billing rounds to whole units. No free allowance is credited in this review. Bucket class/lifecycle and paid billing configuration were not inspected.

[Vercel Blob pricing](https://vercel.com/docs/vercel-blob/usage-and-pricing) lists storage, operations, data transfer, CDN requests and origin transfer. Its iad1 example uses $0.023/GB-month storage and $0.05/GB transfer; these are an example, not a verified maximum across applicable regions/contracts. Large objects can miss cache on every access. The actual storage region/contract and highest applicable paid rate remain unreviewed. No included quota is treated as zero cost.

These are source-supported reasons to keep approval unavailable, not a newly calculated total bill or a claim that a particular production bucket has a specific configuration.

## Email is not approved from one marginal rate

The registry's existing `PER_EMAIL=0.0009` remains a model assumption. `lib/email.ts` sends list and transactional mail through the /emails API and falls back from SES to Resend. SES availability must not be assumed to reduce the worst case.

[Resend's pricing FAQ](https://resend.com/pricing?product=transactional) says /emails recipients count against transactional usage, paid overages use1,000-email billing buckets, and subscriptions are monthly. Therefore review base subscription, domains, applicable paid/contract rates, rounding and company reserves together. A bucket's marginal price alone is not a certified all-in per-customer cost. The actual account's plan/overage configuration was not inspected. Sending to nobody and creating no account, this review changes no provider setting.

## What must be closed before admitting a larger capacity

- Map every upload, signed download, legacy Blob file, read/list and retrieval operation to its paid provider/class and enforced counter.
- Verify unit definitions against actual billed bytes. Current plan storage limits use powers of1024; do not silently label them decimal provider GB without checking.
- Price all six plan/payment cases at full simultaneous usage, including12 supplier months for an annual plan and all receiving/tax/reserve costs. Concurrent storage occupancy is not multiplied into a larger entitlement.
- Carry provider rounding, minimum charges, invoice overhead and non-paying/closing/legacy exposures into the reviewed company ceiling and minimum paying base; no averages or cross-subsidy can pass a failing customer.
- Enforce funded store/provider admission before creating a new paid obligation. Any different delivery architecture needs its own request/CPU/transfer/storage math and reservations first.
- Reconcile the registry/spend floor and global exposure evidence. Unknowns fail; do not use this document or passing tests to certify60%.

The configured most-tax reading already leaves less than60% even before non-tax costs. Resolving these additional unknowns cannot make that existing tax failure disappear. `PLANS_ON_SALE=false`, the commercial review and deemed-supplier gates remain unchanged.
