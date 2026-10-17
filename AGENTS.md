<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


## Owner requirement: customer-level net margin

Every paying customer, taken one at a time and using every entitlement of its plan at the maximum in the worst month (commission on sales counted as zero), must meet a minimum 60% net margin after all applicable taxes and all variable costs. Do not use average customer consumption or cross-subsidies to pass an unprofitable customer. Include annual discounts and overages. Never count a supplier's free quota as zero cost; use the paid unit price at its most expensive tier. If a plan misses 60%, fix it by REDUCING that plan's limits, never by changing its price, and enforce the limits automatically with per-supplier spending ceilings: the owner will not watch dashboards or act on alerts.

The owner's own rule (16 Oct 2026) puts two things outside the per-customer unit, and both stay mandatory:

- **Fixed costs** (tool subscriptions, domains, the LLC's compliance costs, split 50/50 with Hazelsong) are computed separately as the minimum number of paying customers needed to cover them. The whole company must reach 60% after all US and Brazilian taxes in the worst case (everyone using everything at once); release needs that minimum base, never a smaller one.
- **Free trial, the money-back refund, non-payment and post-cancellation retention** are funded exposures: each has a calculated maximum cost, is kept low by limits, is bounded by occurrence caps and is paid from a reviewed company exposure ceiling added to the fixed costs above (docs/funded-exposure-review.md). They are never waived and never offset by another scope's profit.

Unknown taxes, unbounded costs and missing reviews do not count as zero: they keep release closed. Use 27.5% (the Brazilian individual top rate) as the minimum profit-tax stress rate until an accountant confirms a higher combined rate. Paid commercial release stays closed while the review in lib/commercial-margin.ts is absent or fails. Existing operating-margin tests are not proof of all-tax net margin. Do not claim that this requirement is satisfied merely because a guard or a calculator was added.

## Owner's margin rule, restated 17 Oct 2026 (binding for Hazelsong and Marktmorgen)

The owner's words (Portuguese, verbatim):

> A Hazelsong e Marktmorgen devem ter margem de lucro líquido mínima de 60% após todos os impostos, inclusive aqueles cobrados pelo governo brasileiro em decorrência da existência de uma empresa americana, mesmo no pior cenário possível. A margem poderá ser superior a 60%, mas nunca inferior a esse percentual.
>
> Essa exigência deverá ser observada inclusive em relação a cada cliente individualmente. A empresa jamais poderá operar com prejuízo, seja de forma global, seja em relação a um cliente específico. Mesmo que um cliente utilize integralmente todos os benefícios, serviços ou direitos contratualmente previstos, a operação correspondente deverá permanecer lucrativa.
>
> A empresa será uma LLC americana de sócio único (eu próprio), constituída em Delaware. Sou brasileiro e residente no Brasil.

How it is applied, with the two decisions the owner made the same night when asked where the literal rule cannot be guaranteed by code:

1. **Every paying customer, alone, at full use of every entitlement, keeps at least 60% net after every cost and every tax**, US and Brazilian, including Brazilian taxes on the owner arising from the US LLC (until an accountant confirms the actual treatment, use the most expensive defensible assumption, never below the 27.5% stress rate). This is enforced in code before any cost is incurred; protections act on their own.
2. **Free accounts, free trials and refunds** (customers with no revenue) are kept, under an automatic cost ceiling so low that each paying customer covers, with the 60% still intact, the maximum cost of the free accounts counted against it (decision: "Teto mínimo pago pela empresa"). They are never unbounded and never waived.
3. **The company as a whole**: the code guarantees the per-customer floor; fixed costs (Delaware tax, registered agent, accountant, domains, tools — shared 50/50 between the two products) are covered from a computed minimum base of paying customers, which must be shown, with 60% consolidated at and above that base; fixed costs are kept as low as possible until then (decision: "Garantir a partir da base mínima").

Unknown taxes, unknown supplier costs and unenforced limits count as failing, never as zero. No guard, calculator or passing test certifies this rule by itself.
