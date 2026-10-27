# AB(a) — Commercial review data boundary

> **MR vigente — dono27/10/2026 07h42 Fortaleza,464[MR1]:** [REGRA DE MARGEM](../AGENTS.md#mr--regra-de-margem-vigente-27-de-outubro-de-2026) substitui todos os pisos históricos de60% neste documento e suas referências. Exigir lucro líquido por unidade maior que zero no pior caso com a folga existente do spend floor,100% direitos mensal/anual e complementos; empresa sem prejuízo a partir de base mínima calculada com100%FX275 e exposições.60% é meta real mensal da empresa. Preservados ISS5%, leitura mais onerosa, recebimento mais caro, reservas/tetos/gates; desconhecido reprova, não é zero. Texto/citações/números antigos abaixo são histórico, não recalculados nem certificados. Código/relatório/regeneração pertencem a MR2; resultados atuais a MR3. Sem mudança de preços/limites/comissão/vendas.


Prepared October24,2026. This is one bounded part of the first opening-block item, not completion of that item or permission to open sales.

## Problem and change

The release calculator read review properties directly. A review assembled with inherited assertions or getters could be treated as reviewed data, and reading a getter could execute code or throw during a release decision. The launch function also read fundedExposure before passing the review into the already-canonical contract check. Reviews must be detached financial records, not executable assertions.

Both public entry points now use the existing contract financial canonicalizer before reading review fields. It permits plain own data (including null-prototype records), rejects accessors, JSON hooks, symbols, cycles, unsupported values and the existing depth/one-MiB limits, and produces a detached record. Source-evidence fields must also be nonempty strings: malformed JSON values fail closed rather than throwing when trim is called. The existing arithmetic then operates on that record. A false opening request and the absent real review fail before any policy evaluation. Contract coverage, exposure funding and every existing money/tax/rights criterion remain required.

No CURRENT_COMMERCIAL_MARGIN_REVIEW, CURRENT_EXPOSURE_BUDGET_POLICY or CURRENT_CONTRACT_FUNDING_POLICY is filled. No CONTRACT_ADMISSION_COVERAGE false entry becomes true. This cannot certify resource allocations, renewals or cash reconciliation; those remain AB(a), with settlement/reserve work tied to306SY2.

## Cost before implementation

For Store, Studio and Scale in monthly and annual intervals, this change adds no supplier operation, request, allocation, stored record, key, entitlement or paid asset. The actual null-review/false-request production path stops earlier. Complete candidate reviews are serialized within the same bounded financial representation already required by contractFundingConfiguration, with no duplicated normalization inside the calculator after the launch entry point. Existing operation and spending ceilings remain binding. Unknown bills and evidence are not assigned zero, and no60% net-margin claim is made. All LLC fixed costs remain entirely Marktmorgen's responsibility; Hazelsong is closed under the owner's decision.

## Validation and gaps

Synthetic tests keep complete plain/frozen/null-prototype financial fixtures assessable and reject inherited, executable, cyclic, symbolic and oversized inputs without invoking getters or JSON hooks. They preserve stale-terms and unknown-tax refusals and actual release-closed behavior. Full remote new-head verification is required; no local test execution or passing candidate result is claimed before it exists.

## Acessibilidade

No interface, public copy, media or creator content changes. The internal document uses headings and explicit scope. Functional and accessibility matrices remain required in the complete CI suite. Real assistive-technology review of this internal document and complete WCAG conformance are not claimed.


## DD — Net profit by source (owner decision, 24 October 2026, 23:53 Fortaleza)

The descriptive `commercialProfitMix` table in `lib/commercial-margin.ts` reports nine sources: plan subscriptions, add-ons, email packages, captions, network fees/sponsorship, paid recommendations, list validation, referral commissions and training. Each row requires explicit Marktmorgen revenue, variable costs, allocated LLC fixed costs, most onerous taxes, refunds and reserves in USD cents, plus dated evidence. Creator proceeds and unpaid card authorizations are not Marktmorgen revenue. Keep the forecast and reconciled actual accounts separate, with the same period and monthly or annual basis. Annual prepaid receipts require the approved recognition/liability policy, not immediate spendable profit. Evidence must explain recognition and prevent overlap between costs, refunds and reserves.

All LLC fixed costs (including Hazelsong) must be allocated exactly once across the nine sources for the same period. A mismatch makes the total and shares unknown. A missing source, amount, evidence or unsafe integer also leaves the total and every percentage unknown. An inactive source requires evidence of zero revenue and its allocated costs; closed sales alone do not establish zero costs. No reviewed forecast or reconciled actual dataset exists: CURRENT_COMMERCIAL_PROFIT_MIX_INPUT remains null.

For known records, net profit subtracts all six relevant monetary fields from revenue. Percentages use total NET profit as denominator, only when positive and complete. Negative source profits stay negative and may produce negative shares; other shares may exceed 100%. Shares truncate to one basis point, so rounding need not total 100%. Zero/negative total has no applicable percentage. Overflow fails closed.

This is a pure bounded accounting calculation, using the existing detached financial-data canonicalizer (depth/one-MiB limits), with nine rows and no provider calls, storage, reconciliation queries or paid resource allocation. It does not certify evidence, costs or the 60% rule. Operational collection/reporting costs remain unknown until measured and reserved before enabling them; no new supplier operation is added here. Synthetic tests cover category deductions, missing evidence/amounts, fixed cost mismatch, losses, zero denominator, overflow, executable data and unchanged closed-sale gates. Run the complete remote CI on the new head.

The report is deliberately outside commercialMarginReady/commercialPlansMayOpen. It never finances an individual customer using uncertain commissions, sponsorship or network receipts and cannot replace per-customer full-entitlement worst-month assessments, the global review, the most onerous Brazil/US taxes, all LLC costs, tax gate, article 9a, resource/renewal/settlement coverage or the owner's opening process. All current policies and commercial review remain absent; PLANS_ON_SALE remains false.
