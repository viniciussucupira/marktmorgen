# Monthly sold-file upload admission

This change covers the R2 sold-file route, its signing requests, the direct Blob fallback and the direct Bunny lesson-upload route. It does not cover every image, attachment, import or other resource in the product.

Each reviewed monthly policy specifies whole-number upload starts, authorized source bytes and upload-control requests for Store, Studio, Scale, trial, setup and ended stores. It also specifies allocation counts and company ceilings. Exact integer checks require the company pool to cover every allocated store at every maximum simultaneously. Impossible combinations of file counts, byte volume and signing capacity are rejected.

One persistent Redis hash binds the complete policy snapshot, company counters, available allocation slots and per-store counters. A store is identified by its immutable stats ID. The reservation occurs before provider authorization or storage measurement. Opening an upload consumes one start, its full authorized byte size and one control request; requesting part links consumes a control request. Deleting a file, aborting, provider failure, timeout and a lost acknowledgement do not refund these monthly reservations. A tier change requires a reviewed transition that carries the counters; it cannot silently reset them.

The request path never creates a missing ledger. A reviewed funding migration must provide the exact policy snapshot, zero initial company counters and the allocation slots before any admission. Do not recreate an already used missing ledger with zero counters: restore trusted state or keep new admissions paused. Current-month ledgers must not expire. A bounded historical retention and archival procedure still needs implementation and tax-record review.

Completing or canceling an existing grant remains accessible when new admissions are paused or a month changes. The cost review must reserve the full completion/cancellation liability and month-boundary carryover for every open session. This counter is not permission to omit cleanup costs.

Only revocable R2 multipart authorization is currently admitted by this guard. Direct Bunny and Blob grants remain unavailable because those paths do not establish the same binding used by this review. The existing studio fallback can upload a lesson video as a file to R2; this does not provide Bunny transcoding. Existing stored content and playback are not deleted or newly restricted by this change.

Numerical allowances and paused availability are shown from the same policy on the pricing cards. The policy is also bound into the commercial terms. Commercial review cannot pass with an expired or missing upload policy, or insufficient allocation capacity for any possible plan mix of its reviewed paid base. Since 17 Oct 2026 the paid-plan allowances are computed in code from the published storage limits and the cost table, and each month's ledger is opened once automatically; trial, setup and ended stores have none ([automatic spend policies](automatic-spend-policies.md)). No prices, commissions or plan count changed.

## Limits of the evidence

Sixteen reservation tests and eight endpoint tests use synthetic limits, a Redis contract double and mocked providers. They do not execute the production Lua against a real Redis server or exercise paid provider accounts. Supplier replay charges, multipart-operation costs, encoded video expansion, transfer bytes, other upload paths, retention, all taxes and the real minimum customer base remain unresolved. This is not a supplier-dollar ceiling or certification of the required 60% net margin.

## Actual Redis concurrency coverage

The product-checks workflow runs `scripts/test_upload_budget_redis.py` against its isolated Redis service on loopback port 16379. It extracts the exact static application Lua, exercises 64 concurrent starts and allocation claims, exact control exhaustion, lost-reply retention, corrupt counters, policy mismatches, tier changes, expiring ledgers, wrong types and absent ledgers. Denied operations must preserve hash contents. Keys use a random test-only prefix and cleanup touches only those keys. No application credentials or production Redis configuration are read.

The TypeScript tests additionally cover policy validation, REST acknowledgement shape and provider-route admission. Running those mocks is not evidence that the Redis integration job passed; record the actual CI result separately.
