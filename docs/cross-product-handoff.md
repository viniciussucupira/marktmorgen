# Cross-product implementation handoff

Hazelsong and Marktmorgen are maintained independently. Read this repository's
AGENTS.md, CLAUDE.md and current feature documentation before changing code.
A conversation in ChatGPT or Claude is not automatically available to another
assistant; repository files and reviewed commits are the durable handoff.

## Before implementation

- Read the latest main branch, recent merged changes and open pull requests.
- Check whether the requested feature already exists and what was actually tested.
- Preserve concurrent work. Inspect overlapping files before integrating changes.
- Distinguish a proposed change, a tested commit, a merged change and a deployment.
- Verify the deployed commit before reporting that a change is live.
- Reuse compatible mechanisms, not product-specific prices or permissions.

## Shared company context

The intended company is Solrenning LLC, a Delaware single-member LLC with a
Brazilian-resident sole owner. Shared LLC fixed costs are allocated 50/50 between
the products; product-specific costs belong to their respective product.
An allocation is not proof of either product's profitability or the whole LLC's
profitability. Whole-company review needs both products' revenues and expenses.

The owner's required floor is 60% after all applicable taxes, including owner
taxes in Brazil. Missing tax treatment, unknown supplier costs and unenforced
allowances cannot establish compliance. Neither the LLC label nor a synthetic
test proves a tax exemption or a margin. Do not transfer a favorable result from
one product to the other.

Hazelsong's current model separates paid-unit variable costs from company
overhead, includes twenty fully used free accounts per payer, and uses at least
27.5% as a stress assumption, not an established applicable tax rate.
Marktmorgen has its own runtime review and required scenarios. Keep them intact:
this handoff does not remove its isolated-customer review or authorize opening
checkout. Resolve policy differences explicitly in the documented review;
never silently weaken a gate to make tests pass.

## Reusable engineering lessons

- Unknown usage or capacity is not zero. Refuse new costly work when the
  measurement or reservation cannot be verified.
- Reserve capacity before issuing concurrent upload authorizations. Expiring
  an application record does not prove that a provider stopped an upload.
- Reserve paid-provider exposure before dispatch; retries and partial failures
  must remain inside the funded bound.
- Keep original customer content intact. Show limitations before saving;
  do not silently rewrite or truncate testimonials to fit.
- Validate imported source data on the server for both preview and saving.
  A preview is not authorization to bypass current permissions or plan limits.
- Enforce consent at publication and retrieval, including withdrawal. Moderation
  approval and making a hosted page public are separate decisions.
- Preserve recovery, cancellation, export, withdrawal and deletion rights when
  expensive work or new commercial activity is paused.
- Use synthetic records and mocked providers for regression checks where
  possible. Do not send real messages or alter live customer records for a test.

## Communication and authorization

Public Hazelsong copy must use US English. Do not invent testimonials, revenue,
conversion results, competitor click counts or superiority claims. Source guides
are not automatic integrations; annual equivalents are not monthly billing.

Continue authorized, reversible implementation and keep progress reports short.
Do not purchase services, incur newly authorized charges, form a legal entity,
contact third parties or disclose protected access links without applicable
authorization. Do not copy account credentials, private links or secrets into
handoff files.

Report what changed, relevant validation, publication state and material
limitations. Keep remaining work explicit. A calculator, a guard or a passing
test suite never certifies the owner's commercial margin.

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
