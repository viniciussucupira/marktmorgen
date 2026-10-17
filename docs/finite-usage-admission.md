# Finite counted-usage admission

This proposal removes the paid-plan bypass of the existing visit and watched-time thresholds. Prices, commissions and ten-month annual prices are unchanged. These thresholds are provisional operational limits, not approved resource-dollar budgets or proof of a 60% after-all-tax margin.

## Runtime behavior

- Paid Store, Studio and Scale public pages are checked at their existing 3,000, 10,000 and 50,000 recorded counted visits per UTC calendar month. Free trials retain 3,000 and setup/ended stores 500. A missing tier uses the smallest paid threshold. Monthly and annual billing use the same monthly thresholds.
- Paid and trial stream video require the existing finite threshold of 400 recorded watched hours per calendar month; setup/ended stores retain 10 hours. A null, omitted, invalid or unreadable stream allowance cannot mint a player token.
- Admission uses a strict two-counter traffic read. Missing acknowledgements, wrong result shapes, noncanonical numbers, unsafe integers, overflow, unavailable Redis or folder lookup errors pause public-page admission instead of treating failure as zero.
- An explicitly acknowledged null key retains the existing meter's unused-month interpretation. This is not protection against lost/deleted acknowledged keys; a reviewed persistent ledger still needs to replace that assumption.
- The visit threshold does not close existing orders or downloads. Course content remains available; new stream playback has its own threshold. Existing player and room grants can remain valid until expiry. Direct file video uses the separate download path.
- New room polling grants consult the same finite visit threshold, including paid stores. Owner and manual activity retain their existing separate behavior.

## Remaining financial work

Counted visits are deduplicated human activity, not HTTP requests, bytes, CPU or database operations. The traffic read and later count are not one atomic reservation, so concurrent admissions may exceed the threshold. Owner/bot activity and existing buyer paths also incur costs.

Watched-time metrics are delayed and do not measure all buffering, transfer, replay or encoding. A finite threshold is therefore not a hard provider-spend ceiling. The historical 400-hour and storage allowances still need reduction from a complete verified resource budget.

Historical usage settlement code and rates are retained for recorded liabilities; their presence does not authorize new unbounded overages. Customer-facing pages now disclose finite admission and pause behavior instead of promising that paid stores can always continue.

The commercial snapshot binds these admission semantics. Checkout remains closed while the real all-tax review, funded policies and supplier ceilings are missing. This change is not a production promotion.
