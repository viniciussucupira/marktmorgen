# Net profit floor: 60% for every customer

Owner requirement: the platform and each individual customer must retain at least 60% net profit after all applicable company AND personal owner taxes and every attributable cost, even at full simultaneous entitlement usage. No profitable average may compensate for a failing customer. USD is the accounting currency for this policy.

Business context confirmed by the owner: a single-member Delaware LLC is planned, not yet formed; the sole owner is Brazilian and resides in Brazil. Entity tax elections, actual operations, customer locations, nexus, owner taxation and compliance costs have not been established. Do not assume that a Delaware LLC means zero tax. The owner clarified that the 60% floor applies AFTER personal taxes attributable to this American business too, explicitly including personal taxes charged by the Brazilian government in relation to this American company, as well as any other applicable owner tax. Record company taxes and owner taxes separately, avoid double counting, and apply the same 60% combined floor to each plan/customer stress case and the company. Higher margins are allowed; there is no exception below 60%. An accountant familiar with both jurisdictions must establish the applicable tax treatment before financial approval.

## Definition

For the same customer, currency and assessment horizon:

- R = revenue actually collected and retained after discounts, credits, refunds and reversals, before taxes and costs. Do not count gross merchandise sales belonging to creators as platform revenue, uncollected commissions, future renewals, unpaid overages or refundable prepaid balances.
- C = all attributable costs, including company taxes AND owner personal taxes attributable to this business, payment/billing/FX fees, maximum simultaneous infrastructure/AI/email/storage/video consumption, support, acquisition/affiliate commissions, allocated fixed operating costs, accounting/compliance, disputes and the full trial/cancellation/data-retention lifecycle. Avoid double counting refunded principal in both reduced R and costs; nonreturned fees remain costs.
- Net margin = (R - C) / R. The exact acceptance condition is R > 0 and 5C <= 2R. Costs may be at most 40% of retained revenue. Costs are rounded up and spend ceilings down to integer cents.

Revenue after processor fees is not the denominator: fees and taxes are costs. This is stricter than the old contribution tests. Tax rates on profit cannot simply be added to revenue-based fee rates; supply tax amounts calculated for the actual structure and scenario. BRL obligations need an evidenced conservative USD conversion and FX costs before assessment.

## Current release blockers

The current offers are NOT certified against this rule. tests/plan-margin.test.ts still contains historical contribution floors of 15%, 30%, 40% and 45%, rough cost assumptions and risk allowances. Passing those tests does not establish 60% net margin. Their existing protection is retained until a fully evidenced replacement is ready; do not lower quotas or raise prices just to make incomplete financial assumptions pass.

Current code includes a 14-day trial, a first-charge full-refund window and post-payment data retention. A customer can therefore cause costs while retained revenue is zero. A positive 60% margin is mathematically impossible for that isolated outcome. Do not hide it in acquisition averages, predict a future renewal, or silently cancel refund/contractual/legal obligations. Redesign the prospective offer after determining legal obligations and verified cost coverage; existing entitlements must be honored.

Usage billed after consumption exposes the platform to collection failure. An invoice is not collected revenue. Before any claim of protection, costly overages need prepaid/confirmed funds or a separately evidenced loss-bounded mechanism. Account-level quotas alone do not protect against concurrent reservations, multiple stores, retries or provider price changes.

Fixed costs must be tested with the company serving only one customer, the minimum viable customer count and every customer using maximum entitlements together. Dividing costs by an optimistic future customer count is not a worst case. A small subscription may fail the single-customer-company scenario even when its own variable costs are low.

## Implemented assessment

lib/profit-policy.ts checks declared cost ceilings using exact integer arithmetic. Every cost category, including confirmed zero exposure, needs evidence. Company taxes use taxes; personal owner taxes use the separate mandatory ownerTaxes category. Both taxesConfirmed and ownerTaxesConfirmed must explicitly be true; missing or unknown personal taxation cannot pass. Unbounded entitlements, unconfirmed taxes, expired evidence, invalid money and overflow remain unverified. Zero retained revenue never receives a passing margin. Portfolio assessment requires both customer and company scenarios, confirmed population/lifecycle coverage, unique scenarios and the same currency/horizon; any individual failure blocks the portfolio.

This is a read-only assessment of supplied assumptions, NOT proof that supplier prices, tax calculations, coverage declarations or usage bounds are true. It does not enforce runtime spending, change subscriptions, charge customers, change contractual terms or certify the existing plans. The coverage declaration is a review attestation, not automatic discovery of missing customers or scenarios.

Run: node scripts/audit-profit.mjs <portfolio.json>

Exit 0 means all supplied, attested bounds meet the arithmetic rule; exit 1 means policy not proven; exit 2 means assessment could not run. No credentials are needed. Scenario results correspond to input order. Input shape:

- coverageConfirmed: true only after all customers and lifecycle scenarios were reviewed.
- scenarios: nonempty array, with scope (customer/company), reference, scenario, currency USD, period, retainedRevenueCents, fullEntitlementBoundConfirmed, taxesConfirmed, ownerTaxesConfirmed, validUntil (Unix seconds) and costs.
- costs: every key from PROFIT_COST_CATEGORIES, each with nonnegative safe-integer cents and a nonempty evidence reference. Amounts are worst-case ceilings for the same period, not average invoices.

Required review scenarios include every plan monthly/yearly, all discounts/coupons/affiliate credits, 100% simultaneous consumption across all stores, provider fallback and price/FX stress, trial without conversion, full/partial refund, chargeback, failed collection, cancellation, paused/downgraded accounts, post-closure storage/deletion, minimum-price sales and any new feature/add-on. Evaluate annual and monthly horizons separately with correctly recognized costs and revenue; do not mix twelve months of revenue with one month of cost.

## Remaining implementation before enforcement

1. Establish the US/Brazil tax treatment, commercial refund obligations and total fixed/operating cost inventory; retain evidence with an expiry and owner for each bound.
2. Build an auditable per-customer cost/revenue ledger with reconciliation to provider invoices and received payments, consistent revenue recognition and complete fixed-cost allocation.
3. Price full entitlements against the worst bound plus a safety buffer above 60%; model the existing customer contracts separately from prospective offers. Commissions that may never be collected do not subsidize limits.
4. Reserve worst-case spending atomically before provider calls, with customer/store scope, idempotency, concurrent-work reservations and confirmed settlement. Unknown budget/price/payment state refuses new optional costly work; required delivery/auth/security operations need an already funded reserve.
5. Make prepayment/upgrade and disclosed quotas predictable; never silently withdraw an already sold entitlement to rescue an unprofitable plan. Keep legitimate refunds and statutory rights intact.
6. Wire verified approved offer configurations into acquisition/checkout, discounts, upgrades and feature release gates, then all costly execution paths. A cost change invalidates approval until re-evaluated. This integration is not present yet.
7. Monitor measured plus reserved plus remaining full-entitlement cost, reconcile tax estimates and provider bills, and test isolated clients as well as company totals. Owner-only financial alerts must not expose cost evidence to customers.

## Primary references consulted

- IRS: https://www.irs.gov/businesses/small-businesses-self-employed/single-member-limited-liability-companies — classification depends on elections; single ownership does not by itself establish the full tax result.
- IRS: https://www.irs.gov/instructions/i5472 — foreign-owned domestic disregarded entities have specific reporting rules when applicable.
- Receita Federal: https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/preenchimento/manual-mir/situacoes-especificas — Brazilian resident individuals and foreign controlled-entity income require separate analysis.
- Delaware statute: https://delcode.delaware.gov/title6/c018/sc011/index.html — LLC annual tax is a fixed cost to include when applicable, independently of federal classification.
- Stripe: https://support.stripe.com/questions/understanding-fees-for-refunded-payments — original payment processing/Connect/FX fees are not returned on refunds under its described terms; verify the actual contracted fee schedule.

These references identify questions and cost categories. They do not establish the planned LLC's effective tax rates or provide financial certification.

## Confirmed AI quota reservations

The counted writing path and affiliate kit now require complete numeric increment acknowledgements and confirmed expiry for every reserved counter before calling the provider. Invalid weights, malformed replies and lost reservation responses authorize no model work; uncertain reservations are neither blindly decremented nor retried. Confirmed over-limit reservations retain their existing release behavior.

This is quota confirmation, not a monetary spend ledger or a proof of the 60% floor. Failed model work still follows the existing returned-job policy, which can incur provider cost on repeated failures. Per-store quotas do not establish an account-wide/customer-wide monetary ceiling, provider model pricing is not bounded here, and usage billed later is still exposed to nonpayment. Those remain release blockers for any financial guarantee.

## Mandatory stress matrix

The CLI now uses assessProfitCoverage rather than the lower-level arithmetic portfolio assessor. In addition to coverageConfirmed, input needs a nonempty customers inventory of unique reference/plan/cycle records. Valid plans come from TIERS (creator, pro, scale); cycles are month and year. This inventory is still supplied and must be reconciled to billing; omitted actual customers cannot be discovered automatically.

Each of all six published plan/cycle combinations requires plan-scope rows with reference plan:cycle for full_entitlement, maximum_discount, refund, nonpayment, trial, cancellation and post_closure. Each declared customer requires the same seven customer-scope rows using its reference and matching plan/cycle. Company-scope single_customer_maximum_usage rows are required for each offer (reference offer:plan:cycle) and each actual customer (reference customer:reference). One company-scope all_customers_maximum_usage row uses reference company. Include plan and cycle on every plan-specific row. For one customer this is 57 distinct required combinations.

Missing combinations, duplicates, unregistered rows, mismatched terms and any failing numeric assessment block the matrix. The consolidated all-customers row must model maximum simultaneous use and all costs, not an average customer. The single-customer company rows include the fixed company costs when there is only that customer.

The matrix validates coverage identities and declared bounds, not accounting truth. A scenario name such as refund does not prove that refunds and retained revenue were actually calculated correctly. Full refunds or trials with zero retained revenue still fail; synthetic positive-revenue fixtures only test matrix behavior. No existing offer is certified, no runtime spending gate is added here, and previously passing CLI inputs without the complete matrix now fail. Run monthly/yearly recognition horizons separately while stress-testing each offer in the chosen horizon.
