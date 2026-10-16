# Minimum net margin policy

The owner's floor is 60% for every individual customer, including one customer using all included resources and the isolated-customer case carrying fixed business costs. It is not a blended gross or operating margin.

The conservative denominator in `assessCustomerWorstCase` is the platform's collected gross fee revenue, never the creator's sales volume. Deduct the maximum refundable amount, every explicit cost ceiling and the reviewed ceiling for all applicable taxes. Test the exact integer inequality `net * 10000 >= gross * 6000`; rounding a result up to 60% does not pass.

All cost categories must be supplied explicitly. Zero is allowed only as an explicit, reviewed ceiling. Missing values, unbounded costs, unreviewed taxes, uncollected revenue, zero revenue and a single failing scenario prevent commercial release. Monthly and annual plans, overages, trial, full refund, non-payment, closure and a single customer bearing fixed costs must all be evaluated separately. A profitable customer does not offset another's loss.

## Current status

There is no validated commercial review. Paid plans were already closed; they now also depend on the margin gate. New-plan checkout already reads that gate, and plan switching now reads it too. Cancellation and existing customer rights are unchanged.

The current prices, allowances, free trial, full first-payment refund and deferred overage collection have **not** been certified to meet the rule. Existing `tests/plan-margin.test.ts` measures estimated operating economics with lower floors and is not after-tax certification.

A free period with positive cost and no revenue is loss-making. A full refund after consumption may leave costs and no retained revenue. Deferred overages may never be collected. Merely increasing a subscription price or adding a reserve does not make those individual cases meet the owner's floor. The calculator is not a runtime prepaid usage ledger.

Tax status must be reviewed for the actual company and owner in every relevant jurisdiction; the legal label LLC does not establish zero tax. The review must supply evidence for tax ceilings, real vendor costs, enforced resource caps and prepaid usage, and include all fixed costs in the isolated-customer case. Do not insert a guessed tax percentage or assume future commissions cover a loss.

The price/rights snapshot binds a review to current plan prices, commission mode, trial/refund days and email allowances. Changes to other entitlements, suppliers, tax treatment or cost enforcement also require a fresh reviewed model and evidence; the snapshot alone is not exhaustive verification.
