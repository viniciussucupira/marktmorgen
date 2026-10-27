# Company monthly margin report — MR2 calculation boundary

Owner27October2026 07:42Fortaleza,465[MR2]. This is an internal calculation unit, not completion of MR2 or an automatic report delivered to the owner.

## What the actual code does

lib/company-margin-report.ts uses the existing commercialProfitMix accounting validator, all nine revenue sources, full company fixed-cost reconciliation, all variable costs, taxes, refunds and reserves. It accepts only reconciled_actual inputs for the previous complete UTC calendar month. A forecast, annual snapshot, other month, missing source/category/evidence, unsafe amount or allocation mismatch produces unknown amounts, never an invented zero.

The net target is60% of actual company revenue, measured by an exact integer comparison. A positive month below60% is still a complete report and misses the target; target achievement never grants permission to sell. Zero and negative net remain visible. A zero-revenue month has no margin percentage or target assertion. Source evidence and supplied extra fields are not copied into output: only aggregate amounts, month, status and fixed target.

Tests/company-margin-report.test.ts calls this actual module and existing actual accounting validator, with synthetic records only. It checks every source/category missing, allocation mismatches, losses/zero revenue, calendar/year/leap boundaries, nonactual data, exact target edge, inaccessible getters, private-field exclusion and arithmetic overflow. These are accounting-boundary tests, not evidence of real invoices or taxes.

## What is not implemented or verified

No reconciled accounting dataset exists: CURRENT_COMMERCIAL_PROFIT_MIX_INPUT remainsnull. No provider ingestion, monthly scheduler, owner presentation/delivery, new write/key/retention/email, account or external call is enabled by this unit. The complete automatic owner report remains required by465[MR2]; do not call this available or delivered. Actual company margin and minimum paid base remain unknown, not zero.

This unit does not change the old60%sales-floor code yet: MR2 still must change all relevant unit/company-floor comparisons to positive net with existing spend-floor room, preserve every tax/reserve/gate, regenerate the alignment document from actual remote code and produce MR3current-price results. It cannot be used as the new financial approval.

## Costs and accessibility

Pure code with noIO or new caller: no new production operation, key, storage or retention for Store monthly/yearly0/0,Studio0/0,Scale0/0. ExistingCI/hosting/LLC costs and future scheduler/ingestion/owner-report costs are unknown, never treated aszero. Before any operational integration, price and cap its worst monthly/annual work and retention across all six contracts; fund it before spending.

No customer interface:0→0steps/decisions. Markdown headings and explicit gaps; no human audit, legal opinion, margin certification or accessibility certification. Prices/visible limits/commission,PLANS_ON_SALE,OPENING_REQUESTED,tax gate,art9a,exposure/cost funding and creator/Hazelsong content are unchanged.
