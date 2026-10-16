# Locked-price margin arithmetic

The owner requires net profit / subscription revenue >= 60%, after all costs and taxes, with every included resource fully used and no creator sales. This arithmetic is not supplier-cost or tax certification.

Let P be subscription revenue excluding collected VAT/sales tax, K all pre-profit-tax costs, and t the combined effective profit-tax stress assumption. At t = 27.5%, (P-K) × 0.725 >= P × 0.60, so K <= P × 5/29. Higher applicable taxes reduce this ceiling.

| Plan | Billing | Collected subscription USD | Months covered | Maximum pre-profit-tax costs for paid period USD | Monthly equivalent USD |
|---|---|---:|---:|---:|---:|
| Store | Monthly | 22.00 | 1 | 3.793103 | 3.793103 |
| Store | Annual | 220.00 | 12 | 37.931034 | 3.160920 |
| Studio | Monthly | 149.00 | 1 | 25.689655 | 25.689655 |
| Studio | Annual | 1490.00 | 12 | 256.896552 | 21.408046 |
| Scale | Monthly | 349.00 | 1 | 60.172414 | 60.172414 |
| Scale | Annual | 3490.00 | 12 | 601.724138 | 50.143678 |

Displayed decimals are explanatory; runtime approval uses exact integer cents, a rounded-up tax floor and exact comparisons. The maximum cost includes payment fees, FX/remittance, infrastructure, resources, acquisition/referrals, support, disputes, retention and allocated overhead. It is not a resource-only allowance.

For a reviewed unit with period revenue P cents and net result N cents over M months, headroom H = 10000N - 6000P. For reviewed worst-month fixed expenses F cents, the minimum base is ceil(10000FM/H). Evaluate every plan/cycle and retain the largest result. If H is zero and F is positive, no finite base works. Missing costs or taxes produce no approved base. Fixed costs must not also be included in the unit scenario, or they would be double-counted.

Trials and guaranteed full refunds have separate funded acquisition exposure; their positive costs cannot be described as profitable zero-revenue customers. Existing commercial scenario requirements have not yet been reconciled with that authorized budget separation. No approved monetary policy or real minimum customer count exists yet. Checkout remains closed.
