# Stripe platform eligibility — SR (27 October 2026)

> **TX vigente — dono, 27/10/2026, 12h34 Fortaleza.** As referências anteriores deste documento à regra 19, à leitura que dá mais imposto, ao ISS de 5% como certo ou a consultas tributárias ficam preservadas como histórico e são substituídas, nos pontos conflitantes, pela política TX de [AGENTS.md](../AGENTS.md). Nenhuma consulta será feita ou preparada para envio. As taxas de recebimento mais caras, SR, desconhecido reprova, reservas, exposição e custeio continuam obrigatórios. A [matriz TX1](tx-legal-source-review-2026-10-27.md) distingue fontes conferidas e lacunas; não certifica incidência zero. O código e os números antigos ainda não adaptados não provam a nova leitura; revisão e regeneração pertencem a TX2/TX5. Flags continuam false.
>
> **SV vigente — dono, 27/10/2026, 13h19 Fortaleza.** EU1 e SV1–SV5 ficam depois da abertura, com trabalho e provas preservados, sem novos PRs desses itens até lá. EU_HOSTING_CONFIRMED permanece false e não é condição de abertura por decisão do dono; a retirada técnica da dependência está em TX2. A conferência de DPF/SCC dos fornecedores atuais segue no Bloco de abertura, sem aceitar termos ou contratar.


Solicitação do dono (27/10/2026, 08h00, horário de Fortaleza).467[SR1], regra permanente em vigor desde a solicitação.

## Regra vigente

Quando respostas do Stripe se contradisserem, vale a resposta **menos favorável ao dono**, até que uma resposta posterior, completa e sem contradição, a substitua. Não escolher somente uma frase favorável, um formulário, uma configuração de API ou um resultado sintético.

## Respostas relatadas pelo dono e aplicação

| Ponto | Resposta anterior relatada | Resposta posterior relatada | Leitura vinculante atual |
| --- | --- | --- | --- |
| Plataforma brasileira conecta criadores fora do Brasil? | Suporte09/10/2026: somente contas no Brasil | Vendas19/10/2026: pode conectar contas no exterior | **Não. Conta BR conecta somente criadores BR.** |
| Conta US de LLC de sócio único residente no Brasil exige SSN ou ITIN? | Suporte11/10/2026: passaporte/CPF bastam, ITIN em geral não necessário | Vendas19/10/2026: exige SSN ou ITIN | **Exige SSN ou ITIN.** |
| Representante legal nos EUA e residência | Vendas19/10/2026: exige representante legal nos EUA | Sem resposta sobre necessidade de residência | **Exige representante residente nos EUA**, por leitura menos favorável, não por resposta expressa sobre residência. |
| Endereço nos EUA | Vendas19/10/2026: real, sem caixa postal | Nenhuma resposta posterior completa fornecida | **Endereço comercial real nos EUA, sem caixa postal.** |

Em27/10/2026 o dono informou ter enviado novo e-mail ao Stripe pedindo resposta única e definitiva sobre os quatro pontos. A resposta ainda não foi fornecida nesta conversa. Só substitui a leitura acima se posterior, completa e sem contradição; guardar data, prova e avaliação por ponto. Não presumir aprovação pelo silêncio.

Proveniência: relato direto do dono recebido no anexo f7d707c3-e3bf-4b2b-9a12-9e73f93db20f/Texto colado.txt, reproduzido integralmente na fila467–470 peloPR1090. Não acessamos os e-mails/formulários originais, não consultamos a conta Stripe e não contatamos suporte/vendas. As datas são as relatadas pelo dono. Esta tabela é política operacional conservadora, não certificação de lei, termos, elegibilidade ou aceite real do Stripe.

## Limites da configuração existente

A configuração de lib/stripe-connect.ts com dashboard completo e responsabilidades de taxas/perdas atribuídas ao Stripe descreve o payload da API. A lista COUNTRIES descreve a oferta/validação histórica do formulário; **nenhuma delas prova que a plataforma atual pode conectar esses países**. Testes com respostas sintéticas provam a construção de pedidos, sem abrir conta ou estabelecer aceite de país/empresa.

Para o planejamento atual, conta BR não habilita criadores no exterior. Não tratar passaporte/CPF isolados como dispensa de SSN/ITIN para a contaUS. Um registered agent deDelaware não é automaticamente representante legal residente aceito peloStripe. Um mailbox ou endereço virtual cotado não é prova de endereço comercial real aceito. Os três representantes GDPR/DSA deFX275 não substituem esse representanteStripe sem evidência. Não reutilizar preço de serviço distinto como preço comprovado do requisito.

## Dependências que continuam fechadas

468[SR2] deve acrescentar condição de abertura com conta Stripe de plataforma **em nome da empresa americana**, com data/prova de aptidão para conectar criadores nosEUA,Canadá,ReinoUnido eEuropa com cobranças diretas. Este documento não implementa essa condição e não confirma conta, aptidão ou país. PLANS_ON_SALE continua false; nenhuma outra condição enfraquece.

469[SR3] pesquisa somente fontes oficiais datadas paraW-7/ITIN, agente de aceitação se aplicável, representante residente aceito, endereço real e demais custos; soma mensal/anual100%MarktmorgenFX275 e recalcula base mínima. Não há orçamento oficial ou preço aprovado neste documento. Custos/aceite/cobertura desconhecidos reprovam, nunca são zero. O registro não torna obrigatório contratar um serviço opcional sem analisar a fonte e a necessidade.

470[SR4] fica em Depende do dono como roteiro em português: LLC→EIN→ITIN→representante/endereço→contaStripe, com documentos, prazos oficiais e custos deSR3. Só roteiro; nenhuma etapa executada.

## Margem, autorizações e VR

Aplica-se a [REGRA DE MARGEM MR](../AGENTS.md#mr--regra-de-margem-vigente-27-de-outubro-de-2026), não o piso revogado de60%. Cliente isolado100%direitos mensal/anual/complementos com lucro líquido positivo e folga do spend floor; empresa sem prejuízo a partir da base mínima com100%custosFX275 e exposições;60%meta da margem real mensal. ISS5%, leitura tributária mais onerosa, recebimento mais caro, reservas e custeio continuam. Sem preço novo, corte de limite, comissão, conta, termo, contrato, pagamento, terceiro, exclusão ou mudança de gate.

VR: registro documental de467[SR1] em andamento;468–470na fila. Passa a existir tabela datada e limite explícito para interpretar configuração/testes; nada novo disponível ao cliente. Não funcionam por este registro a nova condição de abertura, pesquisa de custos, base mínima, roteiro ou relatório de margem. Não verificados e-mails originais, resposta futura, conta/aceite real, fontes/prazos/preços oficiais e funcionamento comercial. Sem alegação de lucro certificado.

Custos incrementais de produção desta documentação/comentário: nenhuma chamada, serviço, dado persistido ou retenção adicional;Store mensal/anual0/0,Studio0/0,Scale0/0. Isso não é custo total zero deCI, hospedagem,LLC ou requisitosSR3. Todos os desconhecidos permanecem reprovados. Acessibilidade: Markdown com títulos/tabela/links e texto explícito, nenhuma tela;0→0passos/decisões do cliente;sem auditoria humana ou certificação.
