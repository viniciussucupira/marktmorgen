# Creator payment default review — CA232

Reviewed 23 October 2026. This is a partial implementation record. It does not establish that every default, dispute, operating cost or tax risk is eliminated. Sales remain closed and the most-tax review remains binding.

## Account creation configuration

The actual `createConnectedAccount` function in `lib/stripe-connect.ts` sends `dashboard: "full"`, `defaults.responsibilities.fees_collector: "stripe"` and `losses_collector: "stripe"`, with merchant card-payments capability and API version `2026-08-26.dahlia`. The creator's supplied country is validated against the existing offered list.

`tests/connect-configuration.test.ts` intercepts every fetch, rejects any unexpected URL, exercises the actual function for every offered country, and asserts the complete account-creation payload and headers. Unapproved countries must make no request. All calls are synthetic: no account is created, no terms accepted and no provider contacted. Full CI is required before this pending regression is treated as incorporated evidence.

Stripe-owned reference checked on 23 October 2026: [Accounts v2 account types](https://github.com/stripe/ai/blob/main/providers/claude/plugin/skills/connect-recommend/references/account-types.md). Its full-dashboard SaaS example uses these fee/loss responsibilities. This code/reference comparison does not establish that every possible platform charge or liability is borne by Stripe, nor does it verify live account approval or terms.

## Remaining scope

The new regression protects account creation only. Exhaustive direct-charge proof for each sales path, the complete creator-charge inventory, paid-before-use credit admission, trial funding, first-failure suspension, disputes and guarantee exposure remain incomplete.

Existing review found `addToNextInvoice` in `lib/billing.ts` called by `lib/usage-billing.ts`. Historical video invoice allowances and unfinished invoice records must be distinguished from current tier playback admission; their presence alone does not prove every current playback creates a postpaid charge. Raw-file access, player-token lifetime and physical supplier-byte costs require their separate lifecycle review. Preserve creator records and purchased buyer access.

## Cost envelope before the regression

Incremental production operation cost for this test/documentation change is Store 0 monthly / 0 annual, Studio 0 / 0, Scale 0 / 0. No runtime request, retry, key, retention, supplier, service, allowance, price or visible limit is added. Existing automatic caps and reserves are unchanged. Actual CI, deployment and supplier invoices are unknown, never zero.

The complete CA232 implementation still requires maximum paid unit prices, worst-month full use for each plan and billing interval, all Brazil/US taxes, 100% of LLC costs, prepaid and disputed-payment reserves, and at least 60% net margin per customer and globally. Unknown costs fail approval. This partial configuration test certifies none of those conditions.
