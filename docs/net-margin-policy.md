# Minimum net margin policy

> **TX vigente — dono, 27/10/2026, 12h34 Fortaleza.** As referências anteriores deste documento à regra 19, à leitura que dá mais imposto, ao ISS de 5% como certo ou a consultas tributárias ficam preservadas como histórico e são substituídas, nos pontos conflitantes, pela política TX de [AGENTS.md](../AGENTS.md). Nenhuma consulta será feita ou preparada para envio. As taxas de recebimento mais caras, SR, desconhecido reprova, reservas, exposição e custeio continuam obrigatórios. A [matriz TX1](tx-legal-source-review-2026-10-27.md) distingue fontes conferidas e lacunas; não certifica incidência zero. O código e os números antigos ainda não adaptados não provam a nova leitura; revisão e regeneração pertencem a TX2/TX5. Flags continuam false.
>
> **SV vigente — dono, 27/10/2026, 13h19 Fortaleza.** EU1 e SV1–SV5 ficam depois da abertura, com trabalho e provas preservados, sem novos PRs desses itens até lá. EU_HOSTING_CONFIRMED permanece false e não é condição de abertura por decisão do dono; a retirada técnica da dependência está em TX2. A conferência de DPF/SCC dos fornecedores atuais segue no Bloco de abertura, sem aceitar termos ou contratar.


> **MR vigente — dono27/10/2026 07h42 Fortaleza,464[MR1]:** [REGRA DE MARGEM](../AGENTS.md#mr--regra-de-margem-vigente-27-de-outubro-de-2026) substitui todos os pisos históricos de60% neste documento e suas referências. Exigir lucro líquido por unidade maior que zero no pior caso com a folga existente do spend floor,100% direitos mensal/anual e complementos; empresa sem prejuízo a partir de base mínima calculada com100%FX275 e exposições.60% é meta real mensal da empresa. Preservados ISS5%, leitura mais onerosa, recebimento mais caro, reservas/tetos/gates; desconhecido reprova, não é zero. Texto/citações/números antigos abaixo são histórico, não recalculados nem certificados. Código/relatório/regeneração pertencem a MR2; resultados atuais a MR3. Sem mudança de preços/limites/comissão/vendas.


The owner's floor is 60% for every individual paying customer using all included resources. It is not a blended gross or operating margin.

**Current rule (16 Oct 2026, the owner's own wording, see AGENTS.md):** fixed costs are computed separately as the minimum number of paying customers needed to cover them, and the trial, refund, non-payment and post-cancellation cases are funded exposures with calculated maxima and occurrence caps (docs/funded-exposure-review.md). Where the paragraphs below still mention one isolated customer carrying all fixed costs or each free/refund case earning 60% on its own, that is the earlier, stricter wording, replaced by this rule; it never relaxes the per-customer 60% test or the company-wide 60% at the minimum base.

The conservative denominator in `assessCustomerWorstCase` is the platform's collected gross fee revenue, never the creator's sales volume. Deduct the maximum refundable amount, every explicit cost ceiling and the reviewed ceiling for all applicable taxes. Test the exact integer inequality `net * 10000 >= gross * 6000`; rounding a result up to 60% does not pass.

All cost categories must be supplied explicitly. Zero is allowed only as an explicit, reviewed ceiling. Missing values, unbounded costs, unreviewed taxes, uncollected revenue, zero revenue and a single failing scenario prevent commercial release. Monthly and annual plans, overages, trial, full refund, non-payment, closure and a single customer bearing fixed costs must all be evaluated separately. A profitable customer does not offset another's loss.

## Current status

There is no validated commercial review. Paid plans were already closed; they now also depend on the margin gate. New-plan checkout already reads that gate, and plan switching now reads it too. Cancellation and existing customer rights are unchanged.

The current prices, allowances, free trial and full first-payment refund have **not** been certified (since 17 October 2026 no visit or order past a plan is sold or billed: public pages rest and a paid store's new orders are admitted only within its figure) to meet the rule. Existing `tests/plan-margin.test.ts` measures estimated operating economics with lower floors and is not after-tax certification.

A free period with positive cost and no revenue is loss-making. A full refund after consumption may leave costs and no retained revenue. Deferred overages may never be collected. Merely increasing a subscription price or adding a reserve does not make those individual cases meet the owner's floor. The calculator is not a runtime prepaid usage ledger.

Tax status must be reviewed for the actual company and owner in every relevant jurisdiction; the legal label LLC does not establish zero tax. The review must supply evidence for tax ceilings, real vendor costs, enforced resource caps and prepaid usage, and include all fixed costs in the isolated-customer case. Do not insert a guessed tax percentage or assume future commissions cover a loss.

The price/rights snapshot now binds a review to operational and published prices, commission publication/collection/proof, the margin floor and required scenarios, trial/refund days, email/contact limits, AI allowances, storage/file ceilings, video allowances and overages, traffic/live-room allowances and overages, order allowances and overages, and pause/closure retention terms. It reads the same client-safe constants as those features. A change to a captured condition invalidates an earlier review automatically. Other entitlements, supplier prices, tax treatment and enforcement changes still require a fresh reviewed model and evidence; the snapshot is not exhaustive verification or a prepaid usage ledger.

## Storage measurement safeguard

New uploads require a complete, valid measurement of file storage and lesson video storage. Provider errors, unknown sizes, repeated files/cursors and pagination exhaustion cannot create apparent free space. Upload doors return a temporary provider-unavailable response instead of a quota-full response. Confirmed empty storage still permits uploads. Existing content and downloads are not removed by this check.

This is not a prepaid ledger or a proof of the 60% floor. Concurrent uploads, outstanding upload tokens, recurring storage costs, free entitlements and deferred consumption billing still require funded limits. A successful size measurement alone does not certify a customer or a plan.

## Company and owner scope

The intended company is a Delaware single-member LLC; its sole owner is Brazilian and resides in Brazil. The owner's requirement covers all applicable US and Brazilian taxes, including taxes attributable to the owner under the actual structure. No exemption or rate is inferred from these facts. The review must demonstrate both the consolidated company's minimum 60% after-tax net margin and every individual customer's minimum, with full entitlements consumed. The `company_all_costs` scenario is mandatory in addition to the isolated-customer scenario; a consolidated profit never offsets a failing customer.

## Per-upload capacity

A newly authorized file must fit entirely in the confirmed remaining storage, including on paid plans. The fallback Blob token and its URL options use the same maximum: the lesser of the per-file limit and confirmed remaining bytes. Invalid or unavailable capacity cannot authorize an upload. Existing files are not deleted by this rule.

This closes the single-upload overshoot only. Concurrent requests may still read the same remaining capacity; outstanding authorizations and multipart uploads still need a reservation lifecycle backed by provider-confirmed completion or cancellation. No expiry timer alone proves that a provider stopped an upload. These safeguards do not certify the 60% after-tax margin.

Video admission currently checks declared source bytes. The application's video-upload signature does not bind that byte count, and encoded variants may require additional storage. This admission check is not provider-enforced video capacity or a verified worst-case cost ceiling. These gaps must be resolved before commercial margin certification.

## Approved published offer

The owner's approved menu is Store: USD 22/month plus 6.25% of sales; Studio: USD 149/month plus 2.75%; Scale: USD 349/month plus 0%. Annual subscriptions cost ten monthly payments: USD 220, USD 1,490 and USD 3,490. The sales percentage is unchanged on annual billing.

Publication is separate from activation. Public quotes use `PUBLISHED_PLAN_PRICES` and published commission wording. Existing subscription-only prices and actual fee collection retain their operational configuration. Publishing this menu does not reprice a subscription, enable application fees or open commercial checkout. Launch requires both the margin review and proven commission collection. Neither these prices nor projected commissions certify the owner's minimum 60% after-tax net margin.

## Base-plan revenue ceilings

The six full-usage subscription scenarios must use collected platform revenue no higher than the approved subscription price for that tier and billing period. Annual scenarios use the actual ten-month annual price, not twelve monthly payments. A hypothetical review cannot create extra revenue, assume a creator's sales volume, or count hoped-for commissions or overages to cover the base plan's worst case. Lower collections still have to pass the same 60% rule after refunds, costs and taxes.

This bounds the model's revenue input; it does not establish real collections or make free periods, refunds, unpaid overages or isolated-customer fixed costs profitable. Those scenarios and their evidence remain mandatory. No validated real review exists, and paid activation remains closed.
