# Monthly AI spending admission

Draft follow-up to #454. No customer price, commission, plan count or public allowance is changed. The provider-call API now requires a server-side Store, including visitor answers, store guides, inbox drafts, customer-voice analysis, numbers summaries, PDF reading, translations and affiliate posts.

Every provider call reserves a reviewed worst-case USD amount against the store and the company in one Redis Lua operation. Multiple calls in one job each reserve separately. Failed, rejected, lost and successful responses keep the full reservation. Job-count refunds do not refund money. There is no usage-estimate rebate and no retry inside this transport.

Amounts are safe integer microdollars (1 USD = 1,000,000 units), not floating-point dollars. Model ceilings and all tier allocations must be supplied by a dated monthly review. A review expires outside its UTC month. The monetary policy and reservation semantics are included in the commercial rights snapshot, so changing them invalidates an earlier commercial review.

## Current activation state

CURRENT_AI_SPEND_POLICY is null. Merging this draft would disable paid model calls and hide configured AI controls until an actual funded policy and ledger migration exist. This is intentional; no arbitrary budget is labeled financially safe. The studio's general availability and public plan prices are not changed here. This PR must not be presented as a usable funded AI offering.

A future activation must supply the reviewed monthly policy, fund the company budget including trial/acquisition exposure, and create the non-expiring monthly Redis hash with review equal to the policy reviewId, policy equal to aiSpendPolicySnapshot(policy), company equal to 0, and slots:<tier> equal to the reviewed fundedStores count for every tier before its first use. Application calls never initialize or reset the ledger. A changed monetary ceiling, evidence, model allocation or schema invalidates the existing binding even when reviewId is unchanged. Existing counters must be preserved in any reviewed migration; a missing binding refuses new spending. Do not recreate an existing month's ledger, change the review ID to discard usage, or delete customer fields. Missing, corrupt, expiring, wrong-type, unacknowledged or unreachable ledgers refuse spending. Production Redis must provide durable storage without eviction of these hashes. Persistent key loss is a separate infrastructure risk and cannot be solved by a task counter.

The review must bound each permitted model's full accepted request: context window, max output, PDF/image interpretation, applicable surcharges, provider taxes, exchange and remittance costs. Byte lengths and the token-count estimate are not billing guarantees. A fixed conservative maximum is reserved for each call; this may admit fewer calls than a typical-use estimate. The current official model documentation lists a 1M context window; the review must recheck the exact model/account terms instead of deriving a monetary maximum from characters divided by four.

Reservation month is the server's current UTC month, not a historical date supplied by a job. Calls in flight across a month boundary, provider settlement delays and costs outside this API require a separately funded exposure allowance in the company review. This draft does not provision a provider-account spending cap, establish actual vendor prices or certify overall net profit. Fixed business expenses, all US/Brazil tax treatment, the final allocations and the minimum customer base remain unresolved.

## Verification

22 admission/policy tests and 6 real askModel transport-path tests use a Redis contract double and mocked provider responses. The actual application Lua is also exercised by scripts/test_ai_spend_redis.py against the disposable local Redis in CI: concurrent company bounds, store ceilings, changed or missing policy bindings, inconsistent/corrupt counters and unavailable ledgers. Production Redis remains untested. Existing writing regressions use an approving monetary-gate test double to isolate their content behavior. These tests are not a live-provider billing or full application build.

Official references checked 2026-10-16:
- [Redis atomic Lua execution](https://redis.io/docs/latest/develop/programmability/eval-intro/)
- [Claude pricing](https://platform.claude.com/docs/en/about-claude/pricing)
- [Claude context windows](https://platform.claude.com/docs/en/build-with-claude/context-windows)
- [Token counting is an estimate](https://platform.claude.com/docs/en/build-with-claude/token-counting)

## Simultaneous store allocations

The policy must fund every admitted store at its full tier ceiling: the sum of fundedStores[tier] times storeMicroUsd[tier] cannot exceed companyMicroUsd. Values are checked with integer arithmetic. The canonical policy binding includes both ceilings and all funded store counts.

A store's first successful reservation atomically takes one funded slot for its tier, and binds subsequent requests to that allocation without reusing the slot. No script resets counters or refunds spent provider exposure. Missing/invalid slot metadata, an existing allocation without its used counter, or a changed tier refuses the request. A reviewed migration must preserve used amounts and obligations when a trial or plan changes tier; changing tier is not a fresh budget.

These AI admission slots do not themselves admit a paid subscription. Future commercial enrollment must provision funded capacity for the complete promised benefits before a contract is offered. Existing customer obligations, other resources and all taxes still require review; no policy is active and this does not establish the 60% net margin.

Paid tiers, active trials, setup accounts and ended subscriptions have separate scopes. A setup/ended account cannot consume paid slots. Zero acquisition allowances explicitly disable those calls; unknown allocations do not become free spending. No production policy has been supplied.

## Commercial review binding

The commercial gate also requires a current, valid AI policy and enough funded paid-tier allocations for the reviewed possible plan mix. Each paid customer's declared AI cost must cover the entire configured monthly ceiling; annual cases include twelve full monthly allocations even though annual revenue is only ten monthly prices. Microdollars are aggregated before rounding upward to cents. Zero paid-tier capacity cannot stand in for funding included AI.

These checks bind the supplied budget to the cost model. They do not establish supplier price accuracy, maximum requests per promised AI job, future funding migrations, customer enrollment reservations, existing rights, refunds or all applicable taxes. The production funding policy and commercial review remain null; paid release stays closed.

## Full entitlement coverage before commercial release

The commercial gate additionally requires each funded scope to cover all accepted writing and visitor calls, at the most expensive reviewed model request ceiling: `(2 × writing jobs + visitor attempts) × maximum reviewed request cost`. Current call envelopes are Store 700, Studio 2,800, Scale 8,000, and trial 140. Setup and ended scopes conservatively use the largest retained plan envelope (8,000 calls). A scope with no funded slots authorizes no spending. These counts are not vendor prices or financial certification. A shared asynchronous call counter enforces two provider attempts per reserved writing job. Concurrent and nested helpers share the counter, cannot switch stores or renew it, and cannot spend after the outer job completes. Standalone visitor dispatch receives one attempt. Each attempted dispatch consumes its local slot before financial reservation, with no refund after failure. Independent audit is still required whenever dispatch paths change.

The ledger policy snapshot now binds this request and entitlement envelope, so old funding cannot silently approve changed rights. Existing paid/allocation counters and separately funded acquisition scopes remain intact. Actual policies and the commercial review remain null.
