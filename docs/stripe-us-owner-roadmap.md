# SR4 — Roteiro da empresa e da plataforma StripeUS

Item470[SR4], solicitação do dono27/10/2026 08h00 Fortaleza. Fontes oficiais conferidas em27/10/2026. **Depende do dono; somente roteiro, nenhuma etapa executada.** Não é ordem para abrir empresa, criar conta, enviar formulário/documento, aceitar termos, contratar, pagar ou contatar qualquer pessoa.

A sequência solicitada é LLC→EIN→ITIN→representante/endereço→Stripe. A etapaEIN não comprova ITIN nem elegibilidadeStripe. Cada avanço futuro exige a documentação verdadeira do dono e os custos/tetos/reservas previamente revistos,100%FX275. A [regraSR](stripe-platform-eligibility.md) mais desfavorável permanece até resposta posterior completa e sem contradição.

## 1. LLC — antes de pedir o EIN

O dono precisaria confirmar a entidade, nome legal e registered agent com endereço físico emDelaware, preparar o Certificate of Formation e guardar a prova de formação efetiva. A reserva de nome é opcional; não criar gasto por ela automaticamente. Registered agent não prova endereço operacional ou representante aceitos peloStripe. [Processo oficial deDelaware](https://corp.delaware.gov/howtoform/).

Prazo: o processamento normal varia com o volume; não há prazo fixo garantido nesta pesquisa. Urgência tem taxa adicional e não foi escolhida. [FAQ oficial](https://corp.delaware.gov/faqs/).

Custo: tarifa integral de formação, eventuais cópias/envio e teto do agente ainda precisam ser confirmados para a operação concreta; não assumir total zero ou usar apenas preço inicial de anúncio. O imposto anualLLC é **US$400**, já registrado em lib/llc-fixed-costs.ts, sem rateio por parte do ano e com vencimento1ºjunho para o ano anterior. Para uma entidade ativa em2026, financiar a obrigação de2026 antes do vencimento2027, além das demais obrigações. [Instruções atuais](https://corp.delaware.gov/alt-entitytaxinstructions/).

Há páginas oficiais ainda mostrandoUS$300. A [HB400](https://legis.delaware.gov/BillDetail?LegislationId=143069), assinada21/05/2026, e [lei85:273, seção23](https://legis.delaware.gov/json/BillDetail/GenerateHtmlDocumentSessionLaw?docTypeId=13&sessionLawId=143069&sessionLawName=chp273), alteram a taxa para400 com vigência anual desde01/01/2026. Não reduzir o custo por texto antigo; nenhuma correção duplicada do código foi feita.

## 2. EIN — após a formação efetiva

Documento: FormSS-4 com nome legal conforme formação, responsável verdadeiro e assinatura aplicável. O IRS orienta formar a entidade antes. EIN direto doIRS é gratuito; isso não transforma preparo, fax/envio ou trabalho de agente em custo zero. Prazo indicado: fax cerca4dias úteis, correio cerca4semanas, sujeito a processamento e correções. Rota internacional depende do local principal do negócio; não usar o cadastro onlineUS por endereço fictício. [EIN oficial](https://www.irs.gov/businesses/employer-identification-number).

O responsável doEIN é quem controla a entidade e seus bens; nominee não pode substituí-lo. As [instruçõesSS-4, revisão12/2025](https://www.irs.gov/instructions/iss4) tratam da entrada foreign/N/A quando o responsável não tem e não é elegível aSSN/ITIN. Isso exige enquadramento verdadeiro, não dispensa oITIN queSRexige paraStripe. Guardar confirmaçãoIRS; não preencher, assinar, enviar ou pedir outroEIN por este roteiro.

## 3. ITIN — somente com fundamento tributário comprovado

O dono precisaria verificar elegibilidade, prepararW-7, declaração federal ou exceção documentada e provas de identidade/condição estrangeira. Apenas precisar doStripe não comprova finalidade tributária elegível. [InstruçõesW-7, revisão12/2024](https://www.irs.gov/instructions/iw7).

PrazoIRSusual7semanas;9–11do exterior/temporada fiscal, sem garantia e sem incluir preparo/agendamento. CAApode autenticar a maior parte dos documentos; AA não tem a mesma autenticação. Honorários variam e o teto não está estabelecido. [Aplicação](https://www.irs.gov/tin/itin/how-to-apply-for-an-itin), [agentes oficiais](https://www.irs.gov/tin/itin/itin-acceptance-agents). Não enviar passaporte, CPF,SSN/ITIN ou outros dados pessoais ao repositório; não coletados aqui.

## 4. Representante residente e endereço comercial real nosEUA

Antes de contratar, o dono precisaria de confirmaçãoStripe completa aplicável à suaLLC/plataforma: pessoa residenteUS com poderes reais aceitos e endereço comercial real aceito,semcaixapostal. Contrato, poderes, documentos exigidos, escopo, recorrência, impostos e teto de custo devem ser revistos. Não basta alugar nome, caixa postal, registered agent ou representanteGDPR/DSA.

Não foi comprovado fornecedor aceito, preço máximo ou prazo de aceite. São **desconhecidos**. As respostas relatadas pelo dono continuam sobSR e o novoemail ainda não tem resposta fornecida. [PesquisaSR3](stripe-us-requirements-cost-evidence.md). Nenhuma mensagem ou solicitação de cotação foi enviada.

## 5. PlataformaStripe em nome da empresaUS

Só após documentos verdadeiros e requisitos anteriores comprovados, o dono poderia decidir abrir a conta da empresa. Constituição/EIN/ITIN/endereço não garantem aceite. Não criar conta ou aceitar contrato por este documento.

Prova exigida antes da abertura comercial: conta ativa de plataforma daempresaUS e elegibilidade explícita para conectar criadoresEUA,Canadá,ReinoUnido eEuropa emcobrançasdiretas, com data/prova e vínculo à mesma conta/empresa. ListaCOUNTRIES, fixture de teste ou promessa genérica não é comprovação. [Registro técnicoSR2](https://github.com/viniciussucupira/marktmorgen/blob/b3dc112dfe40b774a3bb0825cba0a4e912e71854/docs/stripe-platform-opening-gate.md) descreve o PR1095; sua condição foi incorporada no PR1095 em27/10/2026 12h07:14Fortaleza, após31checks eVercel aprovados. A revisão real continua null e a abertura fechada. Não preencher revisão real com dado sintético.

Prazo e custo de verificação/representante/endereço/aceite não estão comprovados. Taxas de recebimento continuam pelo cenário mais caro do modelo único; nenhum novo preço foi sugerido. Sem teste de pagamento real, submissão ou contato.

## Antes de qualquer operação e estado atual

| Parte | Estado |
| --- | --- |
| LLC,SS-4/EIN,W-7/ITIN | Depende do dono; nenhuma execução ou documento pessoal verificado |
| Representante/endereço/conta aceita | Desconhecidos; não contratados nem comprovados |
| Custeio100%FX275 mensal/anual | Revisão completa ausente; não há total ou base mínima finita certificados |
| Preços e direitos | Preservados69/449/999,anuais690/4490/9990,assistente69; nenhum corte ou preço novo |
| Vendas | PLANS_ON_SALE=false eOPENING_REQUESTED=false; demais travas fiscais/comerciais intactas |
| Relatório mensal realMR2 | Dataset reconciliado e operação automática incompletos; meta60%não é trava de venda |

Financiamento: considerar desembolso inicial, todos os custos recorrentes, câmbio máximo, maior preço pago, impostosBrasil/EUA,ISS5%, reservas e exposições. Obrigações anuais exigem reserva integral antes de vencimento; dividir por12 não demonstra caixa suficiente. ReutilizarSR3/FX275 para os seis contratos. A companhia não pode usar Hazelsong como subsídio, nem apagar seus recursos. Custo desconhecido reprova.

Funciona neste item: roteiro datado e fontes com passos de prova, custos/prazos conhecidos separados das lacunas. Não funciona ainda: empresa/identificações/representante/endereço/conta operacional demonstrados por este roteiro. Não verificado: documentação real do dono, elegibilidade tributária, contratos, custo integral e aceiteStripe. Não há certificação de lucro, jurídica ou de acessibilidade.

Acessibilidade: títulos e uma decisão por etapa futura; nenhuma tela do cliente ou passo executado,0→0ações produtivas. Sem novoIO/chave/serviço/retenção. Pesquisa/CI são custos fixos reais não presumidoszero. Nenhuma conta/assinatura/contratação/pagamento/contato. Documento não é entrega funcional; contador254.
