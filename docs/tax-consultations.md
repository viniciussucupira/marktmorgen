# Tax consultations (18 Oct 2026)

Since 18 Oct 2026 the owner uses no accountant. A tax doubt in [tax-uncertainty.md](tax-uncertainty.md) is closed by an official text or by an answer to one of these consultations, recorded here with its date and source; until then the reading with more tax stays (rule 19). Every answer updates this file, [tax-uncertainty.md](tax-uncertainty.md) and `CONSULTATION_ANSWERS` in `lib/tax-gate.ts` (and Hazelsong's `CONSULTATION_ANSWERS` in `lib/owner-margin.ts`, because the consultations are the LLC's and the owner's, not one product's), and only then the reading it closes is changed and the margins recomputed.

The consultations are shared with Hazelsong: one LLC, one owner, one set of filings. Their drafts live in the Hazelsong repository and are not copied here, so there is one text to file:

- `docs/tax-consultations.md` in the Hazelsong repository: how the Receita consultation works (IN RFB 2.058/2021, read from a reproduction: free, before the LLC exists for a situation that has not happened yet, filed in e-CAC, one tax per consultation, refused if abstract or already settled, no fine on the matter until 30 days after the answer, 360 days under Lei 11.457/2007 art. 24).
- `docs/tax-consultations-receita-drafts.md` in the Hazelsong repository: consultations 1 (IRPF, Lei 14.754/2023), 2 (INSS) and 3 (IOF-câmbio), in Portuguese, with blank placeholders for the owner's identification.
- `docs/tax-consultations-fortaleza-draft.md` in the Hazelsong repository: consultation 4 (ISS, to SEFIN Fortaleza), to be filed only after the LLC exists and before the first sale.

## The four consultations

| # | To | Tax | Closes (tax-uncertainty.md) | Status | Answer |
| --- | --- | --- | --- | --- | --- |
| 1 | Receita Federal (Cosit) | IRPF, Lei 14.754/2023 | 5 (confirms), 6 (credit for US tax), 9 (later-year minimum tax) | Drafted 18 Oct 2026 (Hazelsong repository); not filed; needs the amendment below for Marktmorgen's share of sales | none |
| 2 | Receita Federal (Cosit) | INSS, contribuinte individual (Lei 8.212/1991) | 7 | Drafted 18 Oct 2026; not filed | none |
| 3 | Receita Federal (Cosit) | IOF-câmbio (Decreto 6.306/2007 art. 15-B) | 8 | Drafted 18 Oct 2026; not filed | none |
| 4 | Prefeitura de Fortaleza (SEFIN) | ISS (LC 116/2003; CTM, LC 159/2013) | 10 and 25 | Drafted 18 Oct 2026 for Hazelsong only; needs the amendment below before it is filed; to be filed only after the LLC exists and before the first sale (CTM art. 176 §2º, as amended by LC 430/2025) | none |

## What the drafts must also say for Marktmorgen

The drafts were written for the LLC with Hazelsong's facts in front. Marktmorgen differs in two facts that the consultations must state, or their answers would not cover it (IN RFB 2.058/2021 art. 20: an answer binds only for the facts as described). These are amendments for the owner to add to the Hazelsong drafts before filing; they are not filed and not sent anywhere.

**Consultation 1 (and 2 and 3, which repeat its items 1 to 6), item III.4 and III.6.** Item 6 says the LLC's revenue will be only subscriptions. Marktmorgen will also take a share of each sale its creators make (an application fee on the creator's own Stripe account, `lib/platform-share.ts`). Text to add, in Portuguese:

> III.4-A. Um dos dois serviços (Marktmorgen) é uma plataforma na qual criadores de conteúdo, pessoas físicas ou jurídicas estabelecidas fora do Brasil, montam lojas virtuais e vendem seus próprios produtos digitais, cursos, assinaturas de conteúdo, chamadas de vídeo e, eventualmente, produtos físicos. Cada venda é cobrada diretamente na conta Stripe do próprio criador; a LLC recebe a assinatura do criador e, em determinados planos, uma participação percentual em cada venda, retida pela Stripe como taxa de aplicação (application fee) e creditada na conta da LLC no exterior.
>
> III.6 (nova redação). A receita da LLC será composta exclusivamente das assinaturas mencionadas e das participações percentuais nas vendas descritas no item III.4-A, isto é, renda de atividade econômica própria, sem royalties, juros, dividendos, aluguéis ou aplicações financeiras relevantes. O valor das vendas dos criadores não é receita da LLC: é creditado na conta do criador.
>
> III.6-A. Pela legislação do imposto sobre o valor agregado da União Europeia e do Reino Unido, a LLC poderá ser considerada fornecedora, para fins exclusivamente desse imposto, das vendas eletrônicas feitas por meio da plataforma a consumidores europeus (Regulamento de Execução (UE) nº 282/2011, art. 9º-A), e deverá então recolher esse imposto, acrescido ao preço pago pelo comprador ou retido do repasse ao criador, a autoridades estrangeiras.

And one more question for consultation 1, section V:

> 6. O imposto sobre o valor agregado estrangeiro descrito no item III.6-A, cobrado do comprador ou retido do criador e recolhido pela LLC à autoridade estrangeira, integra a receita ou o lucro da LLC para fins do art. 5º da Lei nº 14.754/2023, ou deve ser excluído como valor recebido por conta de terceiros?

**Consultation 4 (Fortaleza), sections II and IV.** The draft describes only Hazelsong's service. Text to add, in Portuguese:

> 5-A. A Sociedade explorará também uma segunda plataforma (Marktmorgen), na qual criadores de conteúdo estabelecidos fora do Brasil montam lojas virtuais e vendem seus próprios produtos. Cada venda é cobrada diretamente na conta Stripe do criador, que é o vendedor perante o comprador nos Termos de Uso; a Sociedade recebe a assinatura do criador (US$ 22,00, US$ 149,00 ou US$ 349,00 por mês) e, nos planos que a preveem, uma participação de até 6,25% do valor de cada venda, retida como taxa de aplicação. Pela legislação europeia e britânica do imposto sobre o valor agregado, a Sociedade poderá ser considerada fornecedora, exclusivamente para fins desse imposto, das vendas eletrônicas a consumidores europeus feitas por meio da plataforma.
>
> 14 (f) Se, havendo incidência do ISSQN sobre os serviços da segunda plataforma, a base de cálculo é (i) apenas o valor das assinaturas e das participações recebidas pela Sociedade, ou (ii) também o valor integral das vendas dos criadores que a legislação estrangeira do imposto sobre o valor agregado considere fornecidas pela Sociedade; e em qual subitem da lista anexa à LC 116/2003 se enquadra a participação nas vendas (10.05 ou outro).

## What each answer would change

- **1 answered "credit allowed"**: no effect while EU hosting removes US tax; with US tax, the Brazilian tax would be reduced by it.
- **1, question 6, answered "excluded"**: confirms that the VAT money of [eu-vat-article-9a.md](eu-vat-article-9a.md) is not the LLC's profit; the reading already treats it so for profit, and nothing in the margin changes.
- **2 answered "LLC profit is not salário-de-contribuição"**: the INSS fixed cost ($4,520.30 a year, half Marktmorgen's) leaves the minimum paid base.
- **3 answered "zero rate"**: IOF 0.38% of profit leaves the after-design reading.
- **4 answered "ISS not due"**: ISS leaves the after-design reading, and question 25 closes with it.
- **4, question (f), answered "(i) only the Sociedade's own receipts"**: question 25 closes; ISS stays at 5% of Marktmorgen's own revenue (question 10) until the rest of consultation 4 is answered.

## Answers received

None yet. Each answer is recorded here as: consultation number, authority, date of the answer, its number or protocol, the link or document, and the reading it closes; and in `CONSULTATION_ANSWERS` (`lib/tax-gate.ts`) with the same fields.


## Evidence-date validation19October2026

The answer registry now rejects impossible calendar dates, including February31 and non-leap February29, instead of accepting JavaScript's normalization into a later month. Valid leap days remain valid. This is structural evidence validation, not an authority/source verification or an answer to a consultation. No consultation was filed, no message sent, no actual answer added and no question closed. The most-tax reading and closed sales gate remain unchanged.

Synthetic tests exercise invalid/valid calendar boundaries against the actual consultationProblems function and show that the actual answer list stays empty. No added provider, database, storage or message operation, price, allowance or entitlement; only bounded local date validation. M0 before/after is unchanged for every plan and billing interval, and the binding most-tax model still fails60%.
