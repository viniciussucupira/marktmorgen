# Creator payment default review — CA232

> **Atualização SR,27/10/2026 08h00 Fortaleza:** [Elegibilidade da plataforma Stripe](stripe-platform-eligibility.md) fixa a resposta menos favorável. Conta BR só conecta BR; planejamentoUS exigeSSN/ITIN,representante residente,endereço comercial real semcaixapostal. Payload/testes abaixo são histórico de transporte, não aceiteStripe nem prova de elegibilidade internacional. [MR](../AGENTS.md#mr--regra-de-margem-vigente-27-de-outubro-de-2026) substitui o piso60%histórico, preservando impostos/reservas/gates;MR2ainda precisa alterar os cálculos.

Reviewed 23 October 2026. This is a partial implementation record. It does not establish that every default, dispute, operating cost or tax risk is eliminated. Sales remain closed and the most-tax review remains binding.

## Account creation configuration

The actual `createConnectedAccount` function in `lib/stripe-connect.ts` sends `dashboard: "full"`, `defaults.responsibilities.fees_collector: "stripe"` and `losses_collector: "stripe"`, with merchant card-payments capability and API version `2026-08-26.dahlia`. The creator's supplied country is validated against the existing offered list.

`tests/connect-configuration.test.ts` intercepts every fetch, rejects any unexpected URL, exercises the actual function for every offered country, and asserts the complete account-creation payload and headers. Unapproved countries must make no request. All calls are synthetic: no account is created, no terms accepted and no provider contacted. PR #836 incorporated this regression after all 22 checks passed, including full validation after integration with the then-current main branch.

Stripe-owned reference checked on 23 October 2026: [Accounts v2 account types](https://github.com/stripe/ai/blob/main/providers/claude/plugin/skills/connect-recommend/references/account-types.md). Its full-dashboard SaaS example uses these fee/loss responsibilities. This code/reference comparison does not establish that every possible platform charge or liability is borne by Stripe, nor does it verify live account approval or terms.

## Verified checkout transport coverage

The following actual-function journeys intercept outgoing requests and assert the creator's `Stripe-Account`, the platform test credential acting on that connected account, and absence of destination/transfer/on-behalf-of routing fields. Each PR passed all 22 checks on its incorporated head; these are synthetic transport proofs, not live provider acceptance or liability decisions.

| Journey | Test | Incorporated PR | Merge time, Fortaleza, 23 October 2026 |
| --- | --- | --- | --- |
| Support payment | `tests/store-tips.test.ts` | #838 | 10:05:18 |
| Call package | `tests/call-packages.test.ts` | #839 | 10:33:49 |
| Payment request | `tests/payment-requests.test.ts` | #840 | 10:59:23 |
| Product, bump, membership and cart, with existing tax variants | `tests/checkout-tax-journey.test.ts` | #841 | 11:24:53 |
| Booking checkout through existing isolated host-booking fixtures | `tests/team-scheduling.test.ts` | #842 | 11:55:20 |

The booking proof checks every new checkout emitted by `holdAndCheckout` within those fixtures against its own store. It does not activate Teams, establish coverage for every booking variant or prove every platform payment path is connected-account commerce. Existing payment, tax, price, ownership, refund, permissions and booking assertions remain in place. No real account, payment, email or calendar submission was made.

## Assistant suspension and recorded-period admission

PR #844 incorporated actual `syncAssistant` regression coverage at 13:09:53 Fortaleza on 23 October 2026. Synthetic `past_due`, `unpaid` and `canceled` provider replies persist an inactive add-on and prevent model invocation. A confirmed dispute persists suspension, requests termination and refuses repurchase. This does not prove detection at the first failure in real time: the existing refresh schedule remains, and the dispute lookup covers only three recent invoices.

PR #845 incorporated the runtime correction at 13:33:25 Fortaleza. An expired renewing snapshot no longer invents a new 31-day AI pool during a two-day grace period. The actual `askAssistant` path is closed at the exact recorded end and four later points: no model call, no allowance and no speculative pool. Current recorded admission and an updated actual period remain usable. Final integrated head `b262b7b08c72ab04c99b65834c7d4136dc6eb725` passed all 22 checks; verify job 120520354001 logged the renewal cases at 13:14:56 Fortaleza.

These are partial admission controls. A subscription's active status or updated period is not independent proof of a paid invoice, settled funds or a funded dispute/refund reserve. Purchased buyer content and creator records are preserved.

## Caption refund evidence still required

Source review of `lib/billing.ts` and `lib/auto-captions.ts` found that `refundCharge` accepts an HTTP-success reply without validating the refund receipt, while caption callers ignore its boolean and remove the pending record even if the refund failed. The transcription submission accepts HTTP 200 unless `success` is explicitly false; a missing acknowledgment is not confirmation of acceptance.

No refund completion, loss elimination or automatic recovery is claimed from this review. A repair must preserve evidence of uncertain refunds and avoid duplicate charges/transcriptions; additional retries, retention or polling require priced bounds and funding before operation. No real refund or provider submission was made.

## Remaining scope

Account configuration and the listed checkout transport journeys now have regression evidence. Exhaustive proof for every sales/recovery path, the complete creator-charge inventory, paid-before-use credit admission, trial funding, first-failure suspension, disputes and guarantee exposure remain incomplete.

Existing review found `addToNextInvoice` in `lib/billing.ts` called by `lib/usage-billing.ts`. Historical video invoice allowances and unfinished invoice records must be distinguished from current tier playback admission; their presence alone does not prove every current playback creates a postpaid charge. Raw-file access, player-token lifetime and physical supplier-byte costs require their separate lifecycle review. Preserve creator records and purchased buyer access.

## Cost envelope before the regression

Incremental production operation cost for this test/documentation change is Store 0 monthly / 0 annual, Studio 0 / 0, Scale 0 / 0. No runtime request, retry, key, retention, supplier, service, allowance, price or visible limit is added. Existing automatic caps and reserves are unchanged. Actual CI, deployment and supplier invoices are unknown, never zero.

The complete CA232 implementation still requires maximum paid unit prices, worst-month full use for each plan and billing interval, all Brazil/US taxes, 100% of LLC costs, prepaid and disputed-payment reserves, and at least 60% net margin per customer and globally. Unknown costs fail approval. This partial configuration test certifies none of those conditions.

## Refund receipt confirmation — bounded partial repair

Official Stripe references read on 23 October 2026: [Refund object](https://docs.stripe.com/api/refunds/object) and [refund processing](https://docs.stripe.com/refunds). A refund can be pending, require action, succeed, fail or be canceled; HTTP success is not proof that money was returned. Insufficient available balance can leave a card refund pending. The original receiving fees and existing exposure reserve remain applicable.

`refundCharge` now reports true only for a succeeded refund object with a valid refund identifier, the requested PaymentIntent (including an expanded matching identifier), USD, and a positive safe integer amount. A requested partial amount must match exactly; a full-refund request omits amount as before. Invalid requested amounts make no provider request. This validates the receipt, not independent settlement at the recipient bank or the original full charge amount.

`tests/refund-receipt.test.ts` exercises the actual helper with every outgoing request intercepted. It checks full and partial requests, expanded intents, pending/failed/canceled/unknown replies, missing or mismatched receipt fields, unsafe amounts, provider refusal and invalid input. Each valid input makes only the existing single POST with the same platform scope, API version and idempotency key; no retry or additional lookup is added. A false result must not be retried under a fresh key.

This is not complete caption-refund recovery: existing captions callers still ignore the boolean and pending-record deletion remains unresolved. No new retry, polling or retention has been admitted without priced bounds. No refund completion, immediate reconciliation or total CA232 protection is claimed. Incremental runtime operations and storage are unchanged (Store/Studio/Scale 0 monthly / 0 annual); actual invoices remain unknown, never zero, and no all-tax margin is certified. Complete CI on this new head is required before incorporation.

## Explicit collection policy for the existing trial

Official Stripe SDK API declarations read on 23 October 2026: [Checkout Session creation](https://github.com/stripe/stripe-node/blob/master/src/resources/Checkout/Sessions.ts). They document payment_method_collection=always as the subscription Checkout default, while if_required can skip collection when nothing is due, and support trial_settings.end_behavior.missing_payment_method=cancel. No new trial-offer API or billing-version migration is introduced.

The existing platform checkout now sends always explicitly. Eligible trials retain their published duration and request cancellation at trial end if the payment method is missing, rather than permitting an uncollected post-trial invoice. Existing extra-store and returning-customer trial restrictions, annual authentication setting, price list, funding references and the bounded customer/price fallback are preserved. Both fallback attempts keep the collection policy.

`tests/billing-trial-policy.test.ts` intercepts every request and exercises every existing plan/cycle, stale customer and price fallbacks, and returning/additional-store cases through the actual helper. This confirms request construction, not independent confirmation of a card, provider acceptance, available cash or a completely funded trial. Payment-method choices are unchanged. The actual exposure/commercial review remains incomplete and sales remain closed.

Before code: incremental runtime monthly/annual Store 0/0, Studio 0/0, Scale 0/0. Only fields on existing requests change; no new provider call, service, storage, retention, trial duration or entitlement is added. Actual invoices remain unknown, never zero. No minimum paid base or all-tax net margin is certified. Complete validation on the new head is required before incorporation.

## Application fee refund receipt confirmation

Official Stripe [Application Fee Refund object](https://docs.stripe.com/api/fee_refunds/object), read 23 October 2026, defines a fee_refund identifier, amount, currency and application fee reference; unlike a payment Refund, this object has no status field. `settleFee` must receive a matching object/identifier, fee (including expanded identifiers), exact safe integer amount and known fee currency before the amount contributes to gaveBack/cents. Unknown fee currency and unsafe calculated amount refuse mutation. An unconfirmed reply throws into the existing failure counter; a run with any failed operation now reports complete=false. The existing request, idempotency key, deadlines and pagination bounds stay in place.

`tests/fee-refund-receipt.test.ts` exercises both the actual helper and actual daily aggregation against intercepted Stripe responses. It verifies correct platform/connected-account scopes, successful/expanded receipts, malformed and mismatched bodies, no retries, visible failure without invented returned amounts, no mutation for unsafe input and COMMISSION_LIVE=false. The existing share fixture now returns the documented receipt fields; all its prior behavior assertions remain.

This changes truthful reporting and bounded validation, not commission rates or release permission. It does not create a durable refund case, prove bank settlement, reconcile every old event or fund existing obligations. Existing owed refunds are not denied to meet a budget. No real fee or refund was submitted. Runtime incremental monthly/annual Store 0/0, Studio 0/0, Scale 0/0: same or fewer bounded provider operations and no new storage, retention or retry. Actual invoices and complete all-tax exposure remain unknown and cannot be treated as zero or certified at 60%.

## Caption refunds kept until Stripe confirms them — CA232 unit 1 (30 October 2026)

The gap recorded above ("captions callers still ignore the boolean and pending-record deletion remains unresolved") is closed in `lib/auto-captions.ts`. A caption refund that `refundCharge` does not confirm as succeeded (pending, requires action, failed, canceled, refused, timed out or unreadable) no longer deletes the request's record: it is kept with what is owed (`owed`, 400 days) and the video stays queued. Each later look first reads Stripe's own list of the payment's refunds (`refundsOnIntent`, `GET /v1/refunds?payment_intent=…&limit=100`, a list Stripe returns newest first and filters by PaymentIntent; refund `status` is one of `pending`, `requires_action`, `succeeded`, `failed` or `canceled`: [List all refunds](https://docs.stripe.com/api/refunds/list.md) and [The Refund object](https://docs.stripe.com/api/refunds/object?lang=go), read 30 October 2026). Enough succeeded: done. One pending or waiting for an action: wait. None in flight and not enough returned: ask for exactly what is left, under the first key while Stripe lists nothing, otherwise a key built from what Stripe listed, so two looks at once ask for the same refund and the same money is never returned twice. An unreadable or incomplete list (`has_more`) asks for nothing.

Bounds: at most `REFUND_LOOKS_MAX` (40) looks, 10 minutes apart and doubling to six hours (about ten days), inside the five-minute job's existing time budget and its 30 videos a run. Then the record is kept, marked stuck, taken out of the queue and never refunded by guesswork; an owed record that cannot be read is treated the same way. While a refund is owed, no new caption request is charged for that video. The course's studio page tells whoever may see the plan's card which refunds are not confirmed yet, and which have stopped being checked, with the support address; the Terms say a refund counts as made only once Stripe confirms it.

`tests/auto-captions.test.ts` models a Stripe that answers pending, failed and 500, replays idempotency keys, lists refunds, and fails to list them (500 and `has_more`). Mutations that delete the record on an unconfirmed refund, ignore a pending refund, reuse the first key after a failed one, or count any listed amount as enough each make it fail.

Cost per plan and interval (Store, Studio, Scale; monthly and annual): no new supplier, service or paid operation. Each owed refund adds at most 40 list reads and 40 refund requests on Stripe's API (no per-call price on Stripe's pricing page for these reads; not counted as zero) and one Redis record of under 1 KB for at most 400 days, only when a refund was not confirmed; the captions price already funds its own refund. Sales remain closed; nothing here certifies margin, settlement at the bank or complete CA232 protection. Units 2 to 6 of CA232 remain.
