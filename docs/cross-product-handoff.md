# Cross-product implementation handoff

## MR — Regra de margem vigente (27 de outubro de 2026)

Solicitação do dono (27/10/2026, 07h42, horário de Fortaleza). Registro464[MR1]; decisão vigente desde a solicitação, acima de instruções históricas incompatíveis. O texto do dono é preservado abaixo.

REGRA DE MARGEM (substitui a regra dos 60% por cliente e a regra dos 60% da empresa no pior caso):
1. Nenhum cliente pagante, considerado isoladamente e usando 100% de todos os direitos do plano e de cada complemento no pior mês, no mensal e no anual, pode dar prejuízo, depois de todos os custos e de todos os impostos, inclusive os brasileiros, com ISS de 5% sobre a receita, as taxas de recebimento mais caras de lib/receiving-costs.ts e as reservas de reembolso e de contestação. Isso é garantido pelo código, com tetos automáticos antes de cada gasto, sem o dono acompanhar painel nem agir à mão.
2. A empresa como um todo nunca pode dar prejuízo no pior caso: os custos fixos (100% do Marktmorgen, FX275) e as exposições financiadas (teste grátis, reembolso, inadimplência, retenção depois do cancelamento) são cobertos a partir de uma base mínima de clientes pagantes, calculada e mostrada; abaixo dela, os custos fixos ficam no menor valor possível.
3. Meta de 60%: a margem líquida da empresa, depois de todos os custos e impostos, é medida todo mês com os números reais e mostrada num relatório automático ao dono. Os 60% são a meta de lucro, não uma trava de venda.
4. Continuam valendo integralmente: a leitura que der MAIS imposto (docs/tax-uncertainty.md), o ISS de 5% como certo, "custo desconhecido reprova, nunca é zero", nenhuma cota grátis de fornecedor contada como zero, e o critério de lucro máximo nas decisões de preço e limites.

Aplicação técnica vinculante: por unidade, lucro líquido **maior que zero**, mantendo a folga já existente do spend floor, todos os direitos e complementos a100% no pior mês de cada intervalo mensal/anual. Comissão não pode subsidiar o resultado. Cada gasto exige teto automático/reserva anteriores; não depender de painel ou intervenção manual. Exposições financiadas continuam dentro de seu custeio/revisão e limites próprios. A empresa precisa da base mínima calculada para cobrir100% dos custos fixos FX275 e exposições; abaixo dela os custos fixos ficam no menor valor possível. Sem fonte/custo/teto de câmbio/cobertura/revisão, reprova: não inventar uma base finita.

A meta líquida de60% pertence ao relatório mensal **real da empresa**, sem dados pessoais; não é trava de venda por cliente nem global no pior caso. MR2 implementa o critério e o relatório; MR3 apresenta os resultados com os preços atuais. Este registro não calcula lucro, não preenche revisões e não demonstra que esses itens já funcionam.

Precedência completa: em AX274, FX275, VR, Pedidos repetidos, Hazelsong guardada, assistente da loja, documentos vinculados e comentários/testes/cálculos ainda antigos, qualquer instrução de60% como piso obrigatório remete a esta seção. Citações literais e decisões antigas ficam intactas como histórico. Custos da acessibilidade continuam variáveis por plano ou fixos na base mínima; a preservação da Hazelsong continua integral e seus custos residuais pagos pela LLC pertencem100%ao Marktmorgen. O assistente continuaUS$69,700respostas e com reserva própria; seus números de margem antigos não certificam a nova regra.

Continuam integralmente: leitura que der MAIS imposto em docs/tax-uncertainty.md, ISS5% como certo, taxas mais caras de lib/receiving-costs.ts, reservas de reembolso/contestação, exposição e custeio contratual, tax gate, art9a, revisão comercial e demais gates. Não usar cota grátis de fornecedor como custo zero. Nenhuma mudança de preço, limite visível, comissão, PLANS_ON_SALE ou OPENING_REQUESTED. Não criar conta, aceitar termos, contratar, pagar ou contatar terceiros; não apagar conteúdo nem qualquer coisa da Hazelsong. Somente testes sintéticos. Lucro máximo orienta decisões futuras; este pedido não autoriza preço novo.

VR: política documental vigente; código/calculadores/relatório ainda sujeitos a MR2, resultados ainda sujeitos a MR3. Não declarar lucro certificado, abertura ou disponibilidade ao cliente por esta inclusão.



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

> **Atualização MR, 27/10/2026 07h42 Fortaleza:** somente o piso histórico de 60% desta seção foi substituído pela [REGRA DE MARGEM vigente](../AGENTS.md#mr--regra-de-margem-vigente-27-de-outubro-de-2026). Os textos e números anteriores ficam como histórico, não como trava atual. Nenhum outro requisito, custo, imposto, teto, reserva ou gate é dispensado.


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

> **Atualização MR, 27/10/2026 07h42 Fortaleza:** somente o piso histórico de 60% desta seção foi substituído pela [REGRA DE MARGEM vigente](../AGENTS.md#mr--regra-de-margem-vigente-27-de-outubro-de-2026). Os textos e números anteriores ficam como histórico, não como trava atual. Nenhum outro requisito, custo, imposto, teto, reserva ou gate é dispensado.


The owner's words (Portuguese, verbatim):

> A Hazelsong e Marktmorgen devem ter margem de lucro líquido mínima de 60% após todos os impostos, inclusive aqueles cobrados pelo governo brasileiro em decorrência da existência de uma empresa americana, mesmo no pior cenário possível. A margem poderá ser superior a 60%, mas nunca inferior a esse percentual.
>
> Essa exigência deverá ser observada inclusive em relação a cada cliente individualmente. A empresa jamais poderá operar com prejuízo, seja de forma global, seja em relação a um cliente específico. Mesmo que um cliente utilize integralmente todos os benefícios, serviços ou direitos contratualmente previstos, a operação correspondente deverá permanecer lucrativa.
>
> A empresa será uma LLC americana de sócio único (eu próprio), constituída em Delaware. Sou brasileiro e residente no Brasil.

How it is applied, with the two decisions the owner made the same night when asked where the literal rule cannot be guaranteed by code:

1. **Every paying customer, alone, at full use of every entitlement, keeps at least 60% net after every cost and every tax**, US and Brazilian, including Brazilian taxes on the owner arising from the US LLC (until each doubt is closed by an official text or by an answer to a consultation (Receita or Fortaleza), recorded with its date and source (docs/tax-consultations.md), use the most expensive defensible assumption, never below the 27.5% stress rate). This is enforced in code before any cost is incurred; protections act on their own.
2. **Free accounts, free trials and refunds** (customers with no revenue) are kept, under an automatic cost ceiling so low that each paying customer covers, with the 60% still intact, the maximum cost of the free accounts counted against it (decision: "Teto mínimo pago pela empresa"). They are never unbounded and never waived.
3. **The company as a whole**: the code guarantees the per-customer floor; fixed costs (Delaware and California taxes, registered agent, the owner's INSS, domains, tools — shared 50/50 between the two products; no accountant since 18 Oct 2026) are covered from a computed minimum base of paying customers, which must be shown, with 60% consolidated at and above that base; fixed costs are kept as low as possible until then (decision: "Garantir a partir da base mínima").

Unknown taxes, unknown supplier costs and unenforced limits count as failing, never as zero. No guard, calculator or passing test certifies this rule by itself.

## Continuity record

The state at the end of 17 Oct 2026, what was recovered from Codex and what is still open: [docs/continuity-2026-10-17.md](continuity-2026-10-17.md).


## FX275 — All LLC fixed costs belong to Marktmorgen (22 October 2026)

> **Atualização MR, 27/10/2026 07h42 Fortaleza:** somente o piso histórico de 60% desta seção foi substituído pela [REGRA DE MARGEM vigente](../AGENTS.md#mr--regra-de-margem-vigente-27-de-outubro-de-2026). Os textos e números anteriores ficam como histórico, não como trava atual. Nenhum outro requisito, custo, imposto, teto, reserva ou gate é dispensado.


Owner decision,22/10/2026 at05:10 Fortaleza, verbatim: "esqueça Hazelsong". "A partir de agora, a Hazelsong não divide nenhum custo da empresa: todos os custos fixos da Solrenning LLC são atribuídos 100% ao Marktmorgen."

This dated decision supersedes every earlier 50/50 fixed-cost allocation above or in linked history. Earlier decisions and literal quotations remain as history, not current calculation instructions. Allocate each entire LLC fixed cost and fixed tax to Marktmorgen: Delaware, California annual tax and LLC fee, registered agent, owner's INSS, domains, tools, US business mailbox, EU GDPR Article27 and DSA Article13 representatives and UK GDPR Article27 representative. No Hazelsong revenue or contribution reduces these costs.

Every paying customer individually at full rights in the worst month and annual term, and the company as a whole, must keep at least60% net after all costs and US/Brazilian taxes. Use the most-tax reading in docs/tax-uncertainty.md. Unknown cost, tax, exchange-rate ceiling or supplier coverage fails; it never becomes zero. A public starting price or temporary discount is not a verified worst-case ceiling. Annual invoices need a reviewed reserve/accrual policy before monthly normalization. No finite minimum customer base or consolidated margin may be claimed while the complete review is missing or individual units fail.

FX275 does not authorize changing prices, visible limits, commission, PLANS_ON_SALE, the tax gate, Article9a or the commercial review, or relaxing any protection. No account, contract, signature, payment or supplier contact; synthetic tests only. Implementation and official dated cost evidence remain tracked in docs/codex-queue.md item275; this policy records the binding allocation, not completed recalculation or certified profitability.
