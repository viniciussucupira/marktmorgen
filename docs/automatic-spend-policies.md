# Automatic AI and upload spend policies

Since 17 Oct 2026 the AI spend policy and the upload budget policy are computed in code. Nothing has to be reviewed, renewed or switched on each month. The exposure and contract funding policies stay null (see the end of this page).

## One source of rates

`lib/spend-cost-table.ts` holds every supplier rate behind both policies, with sources and the date they were read:

- Anthropic list prices (read 2026-10-17): Sonnet 5.5 $2 in / $10 out per million tokens across its 1M context; Haiku 5.5 $0.10 / $0.50 up to 100,000 prompt tokens and $0.50 / $2.50 for the whole request above that. The application does not send `inference_geo`, so the 1.1x US-only multiplier does not apply.
- A 10% allowance on top of every model charge for invoice taxes, currency exchange and card or remittance costs. This is a deliberately high allowance, not a measured rate.
- Hosting for each model call: 2 GB of function memory held for the whole 45-second model timeout, the call, one CPU-second and twenty database commands (the same Vercel and Upstash rates as `tests/traffic-cost.ts`).
- Cloudflare R2 Standard: $0.015 per GB-month, $4.50 per million Class A operations, $0.36 per million Class B.

`tests/spend-cost-table.test.ts` fails if `lib/answers-rules.ts`, `tests/traffic-cost.ts`, `docs/tier-storage-limits.md`, the model timeout or the default models in `lib/ai.ts` disagree with the table, or if a supported model has no rate.

## AI

**Hold per request.** `askModel` computes the most a request can cost from the request itself (`aiRequestHoldMicroUsd`): each UTF-8 byte of instructions and text counts as one input token (a token always covers at least one byte), plus 1,024 framing tokens and 32 per content block; an image adds 4,784 tokens (the largest the provider keeps after downscaling); a PDF is held at the whole 1M-token context window because its extracted text is not bounded by its size; every `max_tokens` output token is counted. The hold is reserved in the monthly ledger before the fetch. #468's rules are unchanged: failed, timed-out, lost and successful attempts keep their full reservation, retries reserve again, request bounds and the per-job call envelope still apply, and non-paying scopes still reserve their funded exposure first.

**Ceiling per plan.** A plan's monthly dollar ceiling is its writing jobs times the priced writing job plus its visitor answers times the priced answer:

- Priced writing job: one Sonnet 5.5 call with 12 KiB of input and 3,000 output tokens = $0.062699.
- Priced answer: one Haiku 5.5 call with 24 KiB of input and 400 output tokens = $0.003383.
- PDF reading: Haiku 5.5 at the full context window with 1,500 output tokens = $0.554467, so it takes `READ_PDF_JOBS` = 9 writing jobs on top of the page's own one.

| Plan | Writing jobs | Visitor answers | Monthly AI ceiling |
|---|---:|---:|---:|
| Store | 0 | 0 | $0 |
| Studio | 40 | 250 | $3.353710 |
| Scale | 80 | 400 | $6.369120 |
| Free trial, setup, ended | 0 | 0 | $0 (no allocation) |

A request larger than the priced unit sets aside more of the budget, so a store that makes many very long requests can reach its ceiling before its job count. The public copy says so.

`MARKTMORGEN_AI_SPEND_CEILING_PERCENT` (a whole number from 0 to 100) is optional and can only lower every ceiling; above 100 counts as 100 and anything else is ignored.

## Uploads

Each paid plan may authorize up to its whole storage allowance in new sold-file and lesson-file bytes a month (Store 8 GiB, Studio 64 GiB, Scale 128 GiB), with 50, 300 and 600 upload starts, and enough signing requests for every byte plus one more batch per start. Stored bytes are already paid for by the storage allowance, because admission counts every open reservation against it; what the allowance adds is provider operations and function time, priced by `uploadOperationsMicroUsd`: Store $0.0616, Studio $0.3923 and Scale $0.7848 a month at most. Trial, setup and ended stores have no allocation. Only the revocable R2 path is admitted, as before.

## The 60% floor, per plan

`tests/spend-floor.test.ts` adds, for each plan and billing cycle, Stripe's card and Billing fees, twelve (or one) full months of the per-plan worst case in `tests/plan-cost-model.ts` (storage at the dearest store, video, visits, orders, list email and receipts), the AI ceiling and the upload operations, and compares the sum with P x 5/29, the most a paid period may cost before a 27.5% tax and still keep 60%:

| Plan, cycle | Paid | Costs allowed | Stripe | Other per month | AI per month | Uploads per month | Total | Room |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| Store, month | $22 | $3.79 | $1.0920 | $2.3229 | $0 | $0.0616 | $3.4765 | $0.3135 |
| Store, year | $220 | $37.93 | $8.2200 | $2.3229 | $0 | $0.0616 | $36.8339 | $1.0961 |
| Studio, month | $149 | $25.68 | $5.6640 | $13.1207 | $3.3537 | $0.3923 | $22.5307 | $3.1493 |
| Studio, year | $1,490 | $256.89 | $53.9400 | $13.1207 | $3.3537 | $0.3923 | $256.3400 | $0.5500 |
| Scale, month | $349 | $60.17 | $12.8640 | $32.3542 | $6.3691 | $0.7848 | $52.3721 | $7.7979 |
| Scale, year | $3,490 | $601.72 | $125.9400 | $32.3542 | $6.3691 | $0.7848 | $600.0378 | $1.6822 |

The annual cycle binds. The allowances before this change (Store 100 jobs and 500 answers, Studio 400 and 2,000, Scale 1,000 and 6,000) could not fit, so they were lowered in code and on every public page; no price changed. Store, paid by the year, was $1.4239 short of the floor ($39.3539 against $37.93), $0.6850 of it before any AI or upload, because of its visits, orders and receipt allowances. On October 17, 2026 Store's covered orders went from 500 to 400 a month (`ORDERS_INCLUDED.creator`, which also sets the free trial's free-copy stop): $0.21 less a month at $0.0021 an order, with no price changed and every other plan's figures as they were. Orders were cut rather than visits because an order is counted only while no share of its sale is taken, 400 orders is far more than 3,000 visits sell at an ordinary conversion rate, and past it nothing is refused, only billed. The test now requires Store to pass on both cycles with at least $1 of room by the year and $0.25 by the month. Store still gets no AI.

## Ledgers

Both ledgers are one persistent hash per UTC month, `nl:ai-spend:v2:{YYYY-MM}` and `nl:upload-budget:v2:{YYYY-MM}`, each with an `:opened` marker in the same cluster slot. For the automatic policy, the first reservation of a month runs the opening script (`OPEN_AI_SPEND_LEDGER`, `OPEN_UPLOAD_BUDGET`) in the same pipeline as the unchanged reservation script:

- A missing ledger is created once, with zero counters and the funded allocation counts, and the marker is set. If the marker exists the ledger was lost: it is never recreated, and the month stays refused.
- A ledger written under any other review (a separately reviewed policy) is never touched.
- When the computed ceilings change (a deploy or the lowering setting), the policy binding is replaced and every spent amount and claimed allocation is carried; new allocation slots are what the new count leaves after those already claimed. Nothing is reset, refunded or expired.

Explicitly supplied policies keep #468's behavior exactly: their ledgers are never created by the request path. `scripts/test_spend_ledger_open_redis.py` runs both opening scripts and the reservation scripts against the loopback CI Redis.

## What stays null, and what is missing

`CURRENT_EXPOSURE_BUDGET_POLICY` and `CURRENT_CONTRACT_FUNDING_POLICY` stay null. They cannot be computed from code: the exposure policy needs an approved funded-exposure review (occurrence caps and full per-case cost and tax ceilings for trial, setup, refunds, non-payment, post-cancellation, pauses and accrued credits) and the amount of cash actually set aside with evidence of it; the contract policy also needs the company's fixed costs and taxes, the reviewed paying base, a liability tail and bank-backed reserves. Until the owner supplies those, free-trial, setup and ended stores get no AI and no new uploads, and the commercial review in `lib/commercial-margin.ts` stays null, so paid release stays closed.

The commercial gate's own AI coverage check (`aiEntitlementsFunded`) still requires every allowed call at the largest request; with dollar ceilings it does not pass. Reconciling it with the automatic ceilings is part of the owner's commercial review.

## Limitations

- Holds are hard bounds and often several times a request's real cost; with no refunds, the dollar ceilings are what limit use.
- A signed part URL can be replayed until it expires (one hour); each replay is a Class A operation not in the priced allowance, bounded only by the uploader's bandwidth.
- Paid standing includes a card in Stripe's past-due grace period, as before.
- A full loss of Redis data (ledger and marker together) would reopen a month at zero. An Anthropic workspace spend limit set once in the console would bound that case independently.
- The demo store is on Studio (`DEMO_STORE.tier` in lib/demo-seed.ts) so the public demo shows the AI features. It pays no subscription, so its usage is a company cost bounded by Studio's own automatic ceilings: at most $3.3537 of AI a month, plus Studio's visit allowance; it sends no email to anybody (lib/house-store.ts).
