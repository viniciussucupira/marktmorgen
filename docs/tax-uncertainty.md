# Tax uncertainty: always the hypothesis with MORE tax (owner's rule 19, 17 Oct 2026)

The owner's words (Portuguese, verbatim):

> 19. REGRA PARA A INCERTEZA Onde a legislação deixar dúvida ou houver mais de uma interpretação, use a hipótese que der MAIS imposto, para nunca superestimar o meu lucro, e liste essas dúvidas no fim, para eu confirmar com um contador antes de abrir a empresa.

Binding for Hazelsong and Marktmorgen, together with the 60% rule (AGENTS.md / CLAUDE.md, "Owner's margin rule, restated 17 Oct 2026").

## What it means for the code

1. Every margin model, review and gate uses, for each open question below, the reading that yields MORE tax. A favorable reading may be used only after the owner records an accountant's written confirmation of it (date, who, what), never on a guess.
2. Under the most-tax reading of today's open questions the 60% floor is not reachable at ANY limit: with no cost at all, VAT inside the price (up to 27%), the most expensive payment fee (6.6% + $0.30), US federal tax on effectively connected income (up to 37%), Brazilian income tax with no credit for the US tax (27.5%) and IOF on bringing the money home leave roughly 0.79 × 0.93 × 0.63 × 0.725 × 0.965 ≈ 32% of revenue. So paid sales stay closed in both products until the doubts are resolved by an accountant. This is the honest result of the rule, not a defect to be worked around: never lower the tax assumption, raise a price, or loosen a gate to make a test pass.
3. Limits are still sized so every plan meets 60% at the most favorable reading the owner may later confirm (27.5% combined, no VAT inside the price), so that confirmation is the only thing left to open sales. Each plan keeps the per-customer, worst-month, full-entitlement test.

## Open questions to confirm with an accountant before forming the LLC

Each line: the question, then the reading used until it is confirmed.

1. **US: is the LLC's income "effectively connected" with a US trade or business** (US servers, US payment processor, Delaware entity, owner working from Brazil, no US office or staff)? Used: yes, taxed to the owner as a nonresident at graduated federal rates up to 37%.
2. **US states: income-tax nexus in any state** where customers are? Used: yes, at the highest applicable state rate, until confirmed none applies.
3. **US/EU/UK sales tax and VAT on the subscription**: who collects it (merchant of record or us), and are published prices tax-inclusive? Used: tax-inclusive, at the highest rate a buyer's country charges (27%), unless the payment provider adds it on top as merchant of record.
4. **US withholding** on any payment to the owner (30% FDAP) — does any apply? Used: yes where a doubt remains.
5. **Brazil, Lei 14.754/2023: is the single-member LLC treated as a transparent entity or as a controlled company abroad**, and is its profit taxed on 31 Dec whether or not distributed? Used: whichever gives more tax in the year (27.5% progressive as the owner's own income, taxed in the year earned).
6. **Brazil: credit for the US tax** (reciprocity with the US, no treaty). Used: no credit — both taxes are paid in full.
7. **Brazil: INSS** on the owner's income from the LLC as an individual providing services. Used: due, at the contribuinte individual rate up to the ceiling.
8. **Brazil: IOF on currency exchange** when money comes from the US account to Brazil (and on paying US suppliers with a Brazilian card). Used: the highest rate in force for that operation.
9. **Brazil: minimum tax on high incomes and on dividends** (law of 2025 on income above the yearly threshold). Used: applies.
10. **Brazil: ISS or any municipal tax** on services the owner performs from Fortaleza. Used: due at the highest Fortaleza rate.
11. **Delaware and US compliance**: annual LLC tax, registered agent, Form 5472/1120 pro-forma and its penalty exposure. Used: all due every year; they are fixed costs covered by the computed minimum base, never per customer.
12. **Brazil: carnê-leão vs. annual adjustment and exchange-rate conversion date**. Used: the date and rate that give more tax.
13. **How long must the LLC keep each order's records, and which ones**, for US federal and state tax, EU/UK VAT where it is collected, and Brazilian tax on the owner? Read (18 October 2026): Marktmorgen is not the seller of record. Each sale is the creator's, made on the creator's own connected Stripe account, which holds every sale, refund and payout; those are the creator's records as the seller, and the creator is offered the whole store as one file, its orders as a spreadsheet among it, in each of the three notices before a store closes. Marktmorgen's own tax and accounting records are its own income: each store's subscription invoices and any platform fee on a sale, which live on Marktmorgen's own Stripe account (invoices, application fees, payouts) and its billing records. The code holds no ledger of that income outside Stripe: what it keeps of billing in the database are working marks (a use-based line being added, the rate last written on a store's memberships) that the invoices themselves supersede. So a closed store's per-sale rows are not archived: they are deleted with the store, and nothing of the store's sales is copied to R2 or anywhere else (lib/closed-store-data.ts). Used, under rule 19, for Marktmorgen's own records only: the more cautious reading, the longest common period, 7 years from the end of the year of each invoice or fee, kept where they already are, on Marktmorgen's Stripe account, which is not deleted when a store closes. To confirm with an accountant: that a platform which is not the seller of record has no duty to keep its sellers' per-sale rows (US marketplace-facilitator rules, EU/UK VAT for electronically supplied services through a platform, and Brazil); that 7 years from the end of the year covers every place for Marktmorgen's own invoices and fees; and that Stripe's own retention of them is acceptable as the record, or whether the LLC must export and keep its own copy.

When an accountant answers, record the answer, the date and the professional here, change the reading used, and only then recompute; until then nothing here is advice and nothing here is a finding.
