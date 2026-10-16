# Monthly AI spending admission

Draft follow-up to #454. No customer price, commission, plan count or public allowance is changed. The provider-call API now requires a server-side Store, including visitor answers, store guides, inbox drafts, customer-voice analysis, numbers summaries, PDF reading, translations and affiliate posts.

Every provider call reserves a reviewed worst-case USD amount against the store and the company in one Redis Lua operation. Multiple calls in one job each reserve separately. Failed, rejected, lost and successful responses keep the full reservation. Job-count refunds do not refund money. There is no usage-estimate rebate and no retry inside this transport.

Amounts are safe integer microdollars (1 USD = 1,000,000 units), not floating-point dollars. Model ceilings and all tier allocations must be supplied by a dated monthly review. A review expires outside its UTC month. The monetary policy and reservation semantics are included in the commercial rights snapshot, so changing them invalidates an earlier commercial review.

## Current activation state

CURRENT_AI_SPEND_POLICY is null. Merging this draft would disable paid model calls and hide configured AI controls until an actual funded policy and ledger migration exist. This is intentional; no arbitrary budget is labeled financially safe. The studio's general availability and public plan prices are not changed here. This PR must not be presented as a usable funded AI offering.

A future activation must supply the reviewed monthly policy, fund the company budget including trial/acquisition exposure, and create the non-expiring monthly Redis hash with review equal to the policy reviewId and company equal to 0 before its first use. Application calls never initialize or reset the ledger. Do not recreate an existing month's ledger, change the review ID to discard usage, or delete customer fields. Missing, corrupt, expiring, wrong-type, unacknowledged or unreachable ledgers refuse spending. Production Redis must provide durable storage without eviction of these hashes. Persistent key loss is a separate infrastructure risk and cannot be solved by a task counter.

The review must bound each permitted model's full accepted request: context window, max output, PDF/image interpretation, applicable surcharges, provider taxes, exchange and remittance costs. Byte lengths and the token-count estimate are not billing guarantees. A fixed conservative maximum is reserved for each call; this may admit fewer calls than a typical-use estimate. The current official model documentation lists a 1M context window; the review must recheck the exact model/account terms instead of deriving a monetary maximum from characters divided by four.

Reservation month is the server's current UTC month, not a historical date supplied by a job. Calls in flight across a month boundary, provider settlement delays and costs outside this API require a separately funded exposure allowance in the company review. This draft does not provision a provider-account spending cap, establish actual vendor prices or certify overall net profit. Fixed business expenses, all US/Brazil tax treatment, the final allocations and the minimum customer base remain unresolved.

## Verification

12 admission/policy tests and 5 real askModel transport-path tests use a Redis contract double and mocked provider responses. The Lua is reviewed as source but has not been executed against production Redis. Existing writing regressions use an approving monetary-gate test double to isolate their content behavior. These tests are not a live-provider billing or full application build.

Official references checked 2026-10-16:
- [Redis atomic Lua execution](https://redis.io/docs/latest/develop/programmability/eval-intro/)
- [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Claude context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows)
- [Token counting is an estimate](https://platform.claude.com/docs/en/build-with-claude/token-counting)
