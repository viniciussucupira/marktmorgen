# TX6/TX7 — Controles da plataforma e lacunas fiscais

Conferência em27/10/2026,15h22Fortaleza. Escopo: leitura estática da fonte canônica, sem execução do aplicativo, chamada aStripe, criação de conta, aceite, formulário ou submissão. Referência de código: mainc17a767e5acdf662932afe0800b677bf473317e9. Não é parecer conclusivo sobre incidência nem validação da conta real.

## Comportamento observado e implicação

| Área | Evidência no código | Limite da conclusão e próximo controle |
|---|---|---|
| Venda fechada | lib/opening.ts exige revisão comercial, taxGateValid, deemedSupplierReady e elegibilidadeStripe; OPENING_REQUESTEDfalse. DEEMED_SUPPLIER_RECORDS vazio. | A existência dos guardas não comprova todas as obrigações fiscais implementadas. Não marcar registros prontos por este levantamento. |
| Checkout do criador | app/api/store/checkout/route.ts usa canSellProduct. lib/store-checkout.ts monta sessão na conta do criador, valor/opção/bundle/recorrência e caminhos de retorno/entrega. | Conta do criador e redação contratual, isoladas, não provam exclusão de responsabilidade da plataforma. Revisar os poderes efetivos por fornecimento e todas as variantes de checkout. |
| Tributo opcional do criador | applyTax emlib/tax.ts habilitaStripeTax quando store.tax.enabled; configura inclusão ou acréscimo conforme a opção existente. | Não equivale à cobrança obrigatória da plataforma por jurisdição. Preservar o opt-in e preços do criador; construir controle separado baseado na obrigação legal conferida. |
| VAT e documentos | applyTaxDocuments oferece número fiscal e invoice quando o criador os habilita. O número pode ser verificado posteriormente pelo provedor. A recuperação de erro pode remover esses campos e repetir a tentativa. | Não usar mera coleta/formato como validação deVAT para reversecharge. Onde identificação/documento forem obrigatórios, a futura integração não pode autorizar a venda depois de perder o requisito. Não presumir obrigação universal nem alterar todos os opt-ins por esse achado. |
| Planos da plataforma | lib/billing.ts:createBillingCheckout monta sessão de assinatura onPlatform, com identidade do plano e metadados de custeio. Na construção inspecionada não foi encontrado o controle fiscal opcional das lojas. | Não confundir tributo da assinatura com tributo do que o criador vende. Verificar destino,tipo de comprador,tratamento aplicável e identidade daLLC real antes da abertura. |
| Identidade pública | app/terms/page.tsx eapp/privacy/page.tsx apresentam Solrenning como estúdio independente. A provaStripe atual énull; seu esquema futuro vincula conta/empresa por referências opacas. | Não inventar nome legal,endereço,jurisdição,número fiscal ou conta bancária. Referências opacas não autenticam por si só a identidade publicada ou os recibos. Verificar coerência entre site,termos,conta,cobrança e documentos reais. |
| Limites de incidência | lib/tax-threshold.ts calcula separadamente os dois limites pesquisados,com soma exata e reprovação de dados desconhecidos. | O helper não mantém histórico12meses,não classifica fornecedores,não reserva atomicamente e não registra/recolhe tributos. Essas integrações continuam pendentes. |
| Custo completo | lib/llc-fixed-costs.ts inclui categorias explícitas de conformidade e identidadeSR,com tetos desconhecidos. | Categoria não significa obrigação incondicional ou serviço pago obrigatório. Exigir aplicabilidade,custo mensal/anual,pior preço pago,tetos e reserva antes da operação. Desconhecido não ézero. |

## Fontes jurídicas e condição de uso

A [matrizTX1](tx-legal-source-review-2026-10-27.md) mantém fontes,divergências e lacunas por ponto. A [EMTA,seçãoIntermediationservice](https://www.emta.ee/en/node/67/chapter/1288), atualizada31/07/2026 e anteriormente conferida, distingue participação na prestação eletrônica,poderes de cobrança/entrega/condições e mero processamento; as regras de bens físicos são separadas. Isso não comprova os fatos específicos de cada produto doMarktmorgen.

O [comunicado37/23doTribunal](https://curia.europa.eu/jcms/upload/docs/application/pdf/2023-02/cp230037en.pdf),28/02/2023, confirma a identificação do casoFenix e relata o exame de validade doart9a. É comunicação de imprensa expressamente não vinculante,sem substituir o inteiro teor do acórdão ainda não recuperado pela rota oficial usada.

As [notasDG TAXUDde03/04/2014](https://vat-one-stop-shop.ec.europa.eu/document/download/78103105-cf0c-4949-9162-daab6f5d11d4_en?filename=explanatory_notes_2015_en_0.pdf),seções3.4.4–3.4.6,explicam a diferença entre processar pagamento e influir na cobrança/entrega. São orientação histórica não vinculante,não texto consolidado atual. Não usar a rota directcharge como conclusão jurídica automática nem aplicarart9a indiscriminadamente a serviços humanos,bens físicos ou outras jurisdições.

## Trabalho restante

1. Relacionar cada classe real de fornecimento e poderes exercidos,sem classificar por título de produto ou forma de pagamento.
2. Conferir enquadramento e fontes atuais por destino,com identificação do comprador e provas suficientes quando exigidas.
3. Construir contadores completos,reservas atômicas e tratamento antes do limite;resposta incerta de persistência não confirma admissão.
4. Vincular registro,cobrança,documentos fiscais,renovações,reembolsos e identidade real ao tratamento implementado. Testes sintéticos não autenticam registros reais.
5. Revisar custos completos e dados do dono pendentes. Não executar contas,aceites,contratações,contatos ou submissões. Os componentes e documentos explicitamente dependentes do dono permanecem delimitados nos respectivos registros,sem paralisar os outros trabalhos.

TX6/TX7globais não concluídos. Nenhuma promessa de isenção,lucro ou conformidade. Preços,limites visíveis,comissão,opt-ins,conteúdo dos criadores,Hazelsong,idiomas de compradores e identificadores persistidos preservados. NenhumaUIouoperação produtiva nova;pesquisa/CI100%FX275 e desconhecido nãozero. Contador254;este registro não confirma READY,domínio,versão ou publicação funcional.
