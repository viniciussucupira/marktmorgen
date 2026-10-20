# EU VAT retention funding: pre-implementation audit

Queue C-UE, review19October2026 in Fortaleza. This is a completed audit of retention timing, candidate paid rates and missing admission inputs. It is not an implemented or funded fiscal ledger, full cost quotation, jurisdiction registration, collection treatment or margin certification. Production operations and gates do not change.

## Retention is counted after the transaction year

The [European Commission's OSS records guidance](https://vat-one-stop-shop.ec.europa.eu/one-stop-shop/record-keeping-and-audits-oss_en), read directly during this audit, says records are retained for ten years from the end of the transaction year, even after leaving the scheme, and must be available electronically on request. Therefore budgeting only120months from each sale can underfund early-year sales.

Use132monthly storage charges as a conservative cohort ceiling before any tax record is created. Example: a supply in January2026 may require retention through the end of2036; the earliest ordinary deletion boundary would be1January2037, subject to a longer legal hold. This is a planning upper bound for storage charging, not permission to delete at a particular instant.

The implementation must store the validated fiscal supply date/year under the applicable jurisdiction's rules. Do not infer it from the buyer's browser clock, server current year or a later refund date. Define the timezone/year-boundary treatment before using a deletion schedule. Verify January/December and year-boundary cases, leap years, store closure, refunds/corrections and legal holds. An indefinite hold cannot be priced as an ordinary132month case; it requires its own funded treatment or refusal before admission.

## Candidate supplier rates and remaining verification

[Upstash Redis pricing](https://upstash.com/pricing/redis), read19October2026, lists candidate pay-as-you-go commands at$0.20/100,000, storage at$0.25/GB-month and transfer over its included quota at$0.03/GB. Storage counts replicas/regions; replicated writes can add billed work. This audit credits no free storage, commands, bandwidth or trial.

These are candidate pay-as-you-go rates, not proof of the most expensive rate applicable to the eventual configured service. Fixed/Enterprise products, options, region/copy count, provider invoice charges, currency and supported retention guarantees still need verification. No account was created, changed or queried.

The pricing page does not settle the byte definition of GB for this audit. Use1,000,000,000bytes per priced GB as the conservative planning denominator until settled; do not silently reuse the legacy registry's1,073,741,824byte divisor as a newly verified supplier fact. This audit changes neither legacy rates nor runtime reservations. Any broader unit-bound correction needs its own complete model recalculation, generated report and checks before claiming a margin.

## Funding formula before work

Let:
- B = a proved upper bound on all retained bytes per tax unit, including fields, encoded data, keys/indexes, allocator overhead and required evidence/invoice/correction material.
- R = the verified maximum billed storage-copy multiplier.
- N = the maximum admitted tax units left by one payment cohort, including its complete monthly or annual entitlement. Map order units, cart/bundle lines, calls, offers and recurring payments explicitly; one admitted order does not by itself prove one bounded tax row.
- W/Q/T = maximum replicated writes, reads and transferred bytes across creation, retries, refunds/corrections, closure, exports, audits and expiry, all bounded before the first operation.
- L =132monthly storage charges for the ordinary retention case, with longer holds handled separately.

For the candidate storage component only, in whole micro-USD rounded upward per tax unit:

`ceil(B * R * L * 250000 / 1000000000)`.

Full cohort funding is N times the storage unit plus proved command/transfer/compute/export/delete costs, retry/replay bounds, payment/FX/remittance/tax-money costs, provider invoice charges and applicable taxes. Use the most expensive applicable paid rates, independently bound each priced component and avoid overflow. Missing B/R/N/W/Q/T, a currency conversion or a legal-hold funding rule is failure, not zero. Reject before provider work or irrevocable records; a successful payment cannot be left without its mandatory record.

The cohort must carry its whole post-cancellation cost from the payment that caused it. Do not rely on a future subscription, future customers, uncollected sales commissions, a free quota, average consumption or deletion of mandatory records when the store closes. Annual cohorts carry all twelve entitlement windows, not one.

## Storage-only arithmetic example, not admission

For dimensional checking only, suppose B=8192bytes, R=1 and one such unit for each order. Those assumptions have NOT been established for an actual art63c record. Using the conservative decimal divisor and132charges gives271micro-USD per unit, rounded upward. Existing order entitlements from lib/order-rules.ts are200/450/1500 per billing window and are unchanged.

| Plan | Paid cycle | Illustrative units in cohort | Storage component only (USD) | Current M0 most-tax before | Actual future full-cost after |
| --- | --- | ---: | ---: | --- | --- |
| Store | month | 200 | 0.054200 | 12.09% | Unknown — fails admission |
| Store | year | 2400 | 0.650400 | 12.21% | Unknown — fails admission |
| Studio | month | 450 | 0.121950 | 12.14% | Unknown — fails admission |
| Studio | year | 5400 | 1.463400 | 12.02% | Unknown — fails admission |
| Scale | month | 1500 | 0.406500 | 12.17% | Unknown — fails admission |
| Scale | year | 18000 | 4.878000 | 12.02% | Unknown — fails admission |

The table omits no cost by pretending it is zero: other components and actual B/R/N/W/Q/T remain explicitly unknown and failed. Its storage amounts are not the actual feature's total or proof that a plan can fund it. The alternative sizing margins around60% do not replace M0's binding most-tax reading.

## Exact code gaps and acceptance criteria

The current read covers tax.ts, deemed-supplier.ts, tax-gate.ts, order-admission.ts, order-rules.ts, spend-cost-table.ts, exposure-budget-policy.ts, exposure-budget.ts and the thirteen checkout/settlement/deletion paths listed in the continuity audit. Current exposure funding policy is null; an empty treatment registry and commercial gates keep sales closed. Neither existing order capacity nor a normal store data room proves a separately owned ten-year fiscal ledger is funded.

Before activating record creation, implement a versioned schema with enforceable byte/cardinality bounds; a company-owned storage family outside closed-store deletion; reliable/idempotent write and correction admission; a reserve that remains funded after refunds, chargebacks and closure; bounded authenticated audit/export access without arbitrary scanning; and a lawful expiry/legal-hold process. Reserve the entire cohort case before work, retain holds after uncertain replies, and make concurrency share the same financial/byte ceiling. Never expire money commitments merely because a store closes.

Add the proved recurring and per-payment/post-closure costs to tests/plan-cost-registry.ts, tests/spend-floor.test.ts, company fixed/exposure minima and the shared receiving/margin model. Recompute every plan monthly/annual, simultaneous full use, no commission and the most-tax reading, with before/after USD and net percentages. Update the generated margin report and queue with actual proof. A missing fiscal/cost input must keep the opening gate false even if a different sizing test is green.

Synthetic checks must include concurrency and actual disposable Redis scripts where used, lost replies, replay, refunds/corrections, store deletion, January/December cohorts, large records, unknown currency/region/rates, reserve exhaustion and low-volume/global fixed-cost allocation. No live payment, authority submission, third-party message or account is authorized by this document.

## Present effect

Documentation only: no production function, paid call, stored tax record, retention schedule, rate, price, visible allowance or gate changes. Current costs and M0 remain before=after for all plans/intervals, with binding most-tax12.02–12.21% failing60%. Future tax retention is not admitted or counted as zero. Registration, collection, location evidence and complete retention implementation remain C-UE work.
