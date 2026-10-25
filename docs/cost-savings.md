# Registro permanente de custos e desperdícios

Origem: PV5(a),dono25/10/2026 16h34Fortaleza;complementoPV6,16h37. Registro inicial no mesmo PR1030. Posição de execução:AB(a)integral→363EI1somenteestudo→PV1–PV6→AB(b). Nenhum corte implementado/publicado por este documento. Estados abaixo descrevem investigação; não são declaraçãoVR de funcionalidade pronta.

## Critério de evidência

Por medida registrar: código/head; custo antes/depois por plano mensal,3meses quando aplicável,e anual,no pior mês100% direitos; fornecedor/plano/região/réplicas/armazenamento/transferência/falha;fonte oficial com data editorial quando disponível e data de consulta;medição/fatura quando exigida;limites/teto/reserva;resultado por meio/perfil/califórnia/imposto/período;CI completo e versão/fluxo/logs quando publicado. Desconhecido reprova,nunca zero. Nenhuma porcentagem estimada vira economia contabilizada. Regra60% por pagante/global após todos impostosBR/US/100%LLCfixosFX275. Maior preço pago e leitura fiscal mais onerosa permanecem.

## Inventário inicial — nenhuma economia contabilizada

| Medida | Estado de investigação | Código existente / vínculo | Antes e depois mensal/anual por plano | Evidência que falta |
|---|---|---|---|---|
| PV1: pagamento previamente financiado por vendas/transferência/débito/cartão elegível | Encontrado no pedido; na fila | platform-share.ts,share-settle.ts,receiving-costs.ts,opening.ts;AB(a) | Não recalculado; nenhum custo reduzido | Fluxo/créditos sem custódia,impostos,confirmação/reembolso e margem por perfil/meio/período |
| PV2: remessa apenas lucro/impostosBR e unidades por forma de pagamento | Encontrado no pedido; na fila | receiving-costs.ts,tests/margin-alignment-table.ts,docs/margin-alignment-2026-10-18.md | Não recalculado; manter premissas vigentes | Fontes fiscais/câmbio e alinhamento completo dos gates |
| PV3: SES,reservaResend,IA equivalente/cache/lote,CDN,armazenamento,avisos,VAT,arquivos frios | Encontrado no pedido; na fila | ses.ts,mail.ts,email.ts,ai-spend-policy.ts,spend-cost-table.ts;309EM1/317EU1 | Números fornecidos pelo dono não são medição validada; depois desconhecido | Fontes/qualidade/segurança/reserva/pior uso por plano e retenção intacta |
| PV4: contestação justificada e reservas por dados próprios | Encontrado no pedido; na fila | receiving-costs.ts e cobrança existente | Manter reservas vigentes; nenhuma redução | Regra contestação; amostra/método pré-definidos; dados reais suficientes depois de abrir |
| PV5: estudos infraUE/tax/câmbio/adquirência/fixos | Encontrado no pedido; na fila | FX275,317EU1,363EI1,tax-consultations.md | Desconhecido; nenhum fixo removido | Fonte completa/risco/capacidade/decisão do dono nos estudos(b)/(e);nenhum contato/envio |
| PV6(a): UpstashFixedUE | Em estudo documental inicial,sem operação | tests/traffic-cost.ts;PV5(b)/317EU1/FX275 | Modelo atual não alterado; conversão em fixo e base mínima não calculadas | Região/throughput simultâneo/capacidade/transferência/réplicas/SLA/degraus/teto/decisão |
| PV6(b): contagem em lote ou comando atômico | Encontrado:frontCount12/laterCount8 no código | tests/traffic-cost.ts e contadores reais a localizar antes de editar | Custo de56comandos/visita informado pelo dono a refazer; depois desconhecido | Prova de concorrência/instâncias/perda e nenhuma ultrapassagem de limite |
| PV6(c): memória por rota/instância compartilhada | Encontrado:VERCEL_FUNCTION_GB2 no código | lib/spend-cost-table.ts,tests/plan-cost-registry.ts | Nenhuma redução; necessidade e efeito financeiro não medidos | Opções oficiais,medição por rota/faturas reais;sem acesso não inventar dado |
| PV6(d): avisosGoogleCalendar/Graph com reconciliação | Encontrado no pedido; na fila | team-scheduling / mecanismos existentes a conferir | Leituras e renovação/recuperação não recontadas | Fonte oficial,perda/duplicação/expiração,conflitos,segurança e equivalência de velocidade |
| PV6(e): tarefas acordam somente com trabalho | Encontrado no pedido; na fila | vercel.json,filas existentes financiadasAB(a) | Custo fixo antes/depois desconhecido | Inventário real dos crons,teto/acordar/retry/entrega no prazo,sem migração |

## Fonte oficial inicial: Upstash

Consultado25/10/2026:https://upstash.com/pricing/redis. Preço por comandoUS$0,20/100mil;Fixed não cobra por contagem de comandos,mas limita dados,transferência e operações/s. Inclui custos adicionais por região,extras de disponibilidade e condições deupgrade/limites. Não é prova de zero custo marginal da arquitetura completa. Datas editoriais exatas e contratação real não presumidas;nenhuma conta/plano/recurso criado. Tabela fornecida pelo dono e custoUS$0,00026/visita são entradas a recalcular,não resultados certificados. Nenhuma redução no modelo aplicada.

## Histórico e próximos registros

25/10/2026: criado inventário documental PV1–PV6 noPR1030,sem implementação nem economia medida. Quando houver mudança funcional publicada,recalcular automaticamente perfis atendidos e cliente mais oneroso por plano/período/meio; registrar somente resultados produzidos pelo código e seus limites. Até lá,contagem de novos perfis atendidos é desconhecida,não zero nem positiva inventada.

Preços/limites/garantia/prazos/travas preservados. Sem contatos,contratos,pagamentos,migrações,contas ou termos. Somente testes sintéticos. AX274/VR integrais; pesquisas reais202 são lacuna. Criar este registro não exige nem autoriza execução antecipada dePV.

## Complemento PV7 — dono25/10/2026 16h43Fortaleza

PV6járegistradoantes,no mesmoPR1030. PV7 seguePV6 na mesma seção,sem número global. Estado:encontrado no pedido,na fila;não implementado/publicado.

| Medida | Código/vínculo | Antes/depois porplano mensal/anual | Prova pendente |
|---|---|---|---|
| PV7(a)esperas externas emfila/funções por tempo detrabalho | wait emtests/plan-cost-registry.ts;webhooks/integrações existentes | Antes2GB8–10sinformadopelodono a refazer;depoisdesconhecido | Medição real,custos fila/retry,prazos,idempotência/efeitos,AB(a) |
| PV7(b)cachecurtoloja/sessão/papel | UNIT_COST.studio eautorização existentes | StudioUS$0,39/20comandos+leiturainformado,a refazer;depoisdesconhecido | Invalidaçãoimediata,revogação,multi-instância/isolaçãoloja,comandos reais |
| PV7(c)cacheinstruçõesperguntas | ANSWER_REFERENCE24KB/ANSWER_MICRO_USD | Antes/depoisnão recalculados | FonteAnthropicdatada,custo leitura/escrita/miss,invalidação e qualidade |
| PV7(d)vídeocompatível/antecipação | hourCost/FETCHED_AHEAD | StudioUS$0,46/1,25informados,a refazer;depoisdesconhecido | Qualidademáxima/horaspreservadas,aparelhos,medição,codificação/armazenamento |
| PV7(e)imagensmodernas | Upload/imagens/AX274 existentes | Antes/depoisdesconhecidos | Originalaprovado/preservado,alt text,conversão/transferência/cópia,celularsimples |

Constataçõesdo dono sobre linhasStudiojáabrangidas:e-mail6,30;IA3,35;visitas2,64;pedidos0,95;armazenamento0,92;agendas0,63;automações0,48;uploads0,36dólares/mês. Não somadas/reclassificadas nemusadaspara baixar custo neste registro. Fontes/medições pendentes;não há economia comprovada. Nenhum original alterado/apagado,nenhumcacheativado,nenhum dadoentrelojas,nenhum fornecedor/serviço realalterado.

Cadaeconomia exige fonteoficialdatada OU medição registrada conformePV7,teste de qualidade/velocidade,limitespreservados,cálculo60%porcliente/globalapóstodosimpostos/fixosLLC. Nenhum resultado de perfil atendido inventado. Histórico:PV7adicionadonomesmoPR1030apósPV6;exigirverificaçãocompletanonovohead,VR/AX274integrais.

## Complemento PV8 — dono25/10/2026 16h47Fortaleza

PV1–PV7 járegistrados no mesmoPR1030;PV8nãogera númeroglobal/seçãoPVnova. Estado:nafila;autorizadaexecuçãoantecipada(a)–(c)apósregistro,seminterromperAB(a). Nenhumaeconomiaimplementadaporescrito.

| Medida | Evidência inicial / antes | Depois e prova pendente |
|---|---|---|
| PV8(a)documentalCIleve | Donorelata24jobs/153min,20–25mindeespera,PRdocsrodatudo;product-checks.ymllido | Amedir;classificaçãodearquivosestrita/testada,fallbackcompletaseincerto,nenhumcódigo/config/teste/dependênciaomitido |
| PV8(b)maincomárvoreidênticacompletamenteaprovada | DonorelataexecuçãoduplicadaPR/main | Amedir;provaexataárvore/head/todoschecks;semprovaexecutarcompleta |
| PV8(c)matrizporimpacto | Donorelata8workflowss emmesmaesteira | Amedir;mapadedependênciastestado,completadiáriaeantesdetodaprodução,gateexatoVercel/GitHub |
| PV8(d)custoprivado/executorfixo | Donorelata1856execuções/27h;tarifasoficiaispendentes | Calcularminutos/máquina/planoseFX275;opçãoDependedodono,nãoprivatizar |
| PV8(e)previewdocumentalignorado | Tempoatualbuildnãoextraído | RecursooficialVercel,tempoantes/depois;execuçãonaposiçãoPV |
| PV8(f)repetiçãotestegrátis | Exposiçãoatualafere funded-exposure-review.md | Limiteslegaissemcartão/semfalsobloqueio;custosrecalculados |
| PV8(g)gratuitasparadasemfrioUE | Prazo/avisos/restauronãodefinidos | Estudo/tetoseprovasvoltaimediata,semapagar,prazosexistentespreservados |

Minutos/valoresfornecidospelodono sãohipótesesdocumentadasatéextraçãoderegistros. Semconta/fatura oufonte nãoinventar custoGitHubprivado,economiapositiva ougratuidadeilimitada. FontesoficiaisdatadasGitHubbilling/Actions/paths/reusableworkflowseVercelignoredbuilda conferirduranteimplementação.

Coberturacompletaeheadexatoantesdequalquerproduçãosãovinculantes. PRsdocumentaispodemtergateleveapenasquandoalteraremexclusivamentedocs/.md,s emcódigo/testes/config/dependências. Nada de publicar código semtestecompleto,nemusarárvoreparecida/comparação textualcomoidentidade. Qualquerincerteza→completa. Nãoexecutarworkflowdadoexternocomsegredos.

Histórico:PV8adicionadonomesmoPR1030depoisdePV6/PV7;estudos(a)-(c)podemcomeçarapósregistro;primeiraleituradeworkflowrealiniciada,nenhumworkflowalteradoainda. DemaisitensPV8nafilaapósAB(a)/EI1conformePV. Nenhumcusto/modelo/reserva/visibilidade/dadocriadoralterado. Pessoasreais202eVRnãoaprovadosporotimizaçãoCI.


### PV8(a): incorporação técnica em 25/10/2026, 17:51:29 Fortaleza

PR #1031 incorporado por `0eb0d1fedf85c221a87a164fd6c8f6272aa5bc80`, após 32 verificações completas aprovadas no head `f53f067babf56e4a6a41a97389ef55e39e0ca619`; árvore `a54e7d3324ef300bc3291c1153387bf064f15d8b` idêntica à testada. Classificação conservadora de documentação regular Markdown nos oito workflows; código, testes, configuração, políticas e evidência desconhecida executam cobertura completa. Main continua completo. PV8(b)/(c) permanecem pendentes. Publicação técnica ainda não confirmada nesta anotação; não é entrega funcional, contador preservado.

Antes: cerca de 153 minutos agregados segundo medição do dono, ainda não reproduzida independentemente. Depois: oito verificações curtas Linux previstas para PRs exclusivamente de Markdown elegível; economia observada e valores mensais/anuais ainda desconhecidos. Execuções completas recebem oito jobs leves adicionais; nenhum desconto no modelo de custos. Fonte oficial consultada em 25/10/2026: https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-jobs-with-conditions . Nomes de checks únicos conforme https://vercel.com/docs/deployment-checks . Falha de configuração inicial corrigida; teste estrutural verifica condições apenas em jobs, uma condição por job e nomes únicos. Falha WebKit do PR1030 registrada separadamente; ajuste aguarda suíte completa na árvore combinada com main.


### PV8(a): confirmação da publicação técnica e registro da seção PV

Em 25/10/2026, PR #1031 incorporado às 17:51:29 Fortaleza por `0eb0d1fedf85c221a87a164fd6c8f6272aa5bc80`; 32/32 verificações completas aprovadas na árvore `a54e7d3324ef300bc3291c1153387bf064f15d8b`. Publicação `dpl_A6PtgA6Gs1rFDry8smCSnpxXeXVA` READY às 17:52:14.528 Fortaleza, domínio marktmorgen.com e SHA exato confirmados.

PR #1030 incorporado às 18:20:30 Fortaleza por `5aefdbdbfd3c73933291428053521436382ce562`; 32/32 verificações completas aprovadas no head `b736f8a39073d398fa2f896d12e524ca4827342a`, árvore `15a06ed1ea7c5dc8ebf042123a5b7ba5b5d881e7` idêntica à incorporada. Publicação `dpl_GdeQb7gjGVoMHBNSeCZ99HmpLrWs` READY às 18:21:21.469 Fortaleza. Confirmados domínio marktmorgen.com, SHA exato e HTTP 200 com data-dpl-id exato em /, /platform, /pricing, /mission e /library. Registros PV1–PV8 preservados; isso não implementa integralmente PV. Ajuste do teste de template preserva exigência de conteúdo e aguarda o GET existente iniciado pelo useEffect do editor, sem sleeps ou repetição de clique.

Estado PV8(a): incorporado e publicado tecnicamente; redução efetiva de minutos para PR apenas documental ainda a medir na primeira execução elegível. PV8(b)/(c) pendentes. Antes: aproximadamente 153 minutos agregados segundo o dono; depois: desconhecido até medição. Nenhum desconto de custo aplicado, nem certificação de margem; oito verificações Linux adicionais nas execuções completas permanecem custo real. Estas incorporações de documentação, testes e esteira não são entrega funcional; contador 254 preservado, próximo 255 apenas com os critérios VR cumpridos. Sem alteração de preço, limite, imposto, reserva ou PLANS_ON_SALE.


### PV8(a): primeira medição documental real — 25/10/2026

PR #1032, head `c6405b35f337b5b87349ac2a93b52325f1506995`: somente docs/codex-queue.md e docs/cost-savings.md modificados. Os oito workflows rodaram nove regressões de classificação cada, todos aprovados, e comprovaram `Full coverage required: false`. Onze definições de jobs pesados foram omitidas antes da expansão das matrizes, evitando os 23 jobs pesados que seriam expandidos; não se trata de 23 testes executados ou de prova completa reutilizável.

GitHub Actions jobs API, consultada em 25/10/2026, mostra oito jobs Ubuntu de 9, 8, 8, 8, 9, 8, 7 e 8 segundos: 65 segundos agregados (1,0833 minuto), contra aproximadamente 153 minutos agregados antes segundo a medição informada pelo dono. Não são amostras pareadas independentes; não extrapolar economia mensal/anual ou valores faturados. Reserva conservadora com arredondamento separado para cada job: oito minutos Linux por PR documental, ainda sem converter em custo contratado. Repositório público permanece público. Main continua com cobertura completa e esta medida adiciona oito classificadores às execuções completas.

Evidência auditável dos jobs: https://github.com/viniciussucupira/marktmorgen/actions/runs/40235526796 e os outros sete workflows associados ao mesmo head. Esta medição é anexada em novo commit documental; a classificação desse novo head também deve passar antes da incorporação. Nenhum custo de produto, preço, limite, imposto, taxa, reserva ou gate foi reduzido.


### PV8(b): reutilização de prova integral da mesma árvore — em andamento

Implementação em revisão: no push main de merge com dois pais, comparar árvore local com a do head incorporado; consultar os oito workflows pull_request desse head, identificados por path, repositório, origem e resultado. Cada execução passa a registrar no nome `PV8 source <github.sha>` o commit de merge realmente usado pelo checkout padrão do PR. Resolver esse commit pelo GitHub, exigir árvore idêntica e segundo pai igual ao head testado, e exigir todos os 23 jobs pesados e oito classificadores iniciados, concluídos e aprovados. Ausência, árvore diferente, execução parcial, cancelada, skipped, nova tentativa pendente, dados truncados, erro de API ou origem diferente executam suíte completa. Resultados documentais de PV8(a) nunca aprovam reutilização completa. Sem artefatos novos ou fornecedor novo; token somente leitura de Actions e conteúdo, sem chamadas mutantes.

Antes: push main repetia os 23 jobs pesados mesmo com árvore integralmente testada em PR. Depois esperado: oito provas leves quando todas as condições forem demonstradas; minutos, requisições, economia observada e totais mensais/anuais ainda desconhecidos. Cada prova consulta até dez recursos GitHub com respostas limitadas a 2 MB, timeout de 10 segundos por leitura e job de cinco minutos; qualquer insuficiência retorna à cobertura completa. Nenhum desconto no modelo ou certificação de margem. Alteração do mecanismo recebe suíte completa no PR; produção só pode usar cobertura integral da mesma árvore. PV8(c), diário e mapas de dependências continuam pendentes.

Fontes oficiais consultadas em 25/10/2026: https://docs.github.com/en/actions/reference/workflows-and-actions/events-that-trigger-workflows (github.sha em PR identifica merge testado); https://docs.github.com/en/rest/actions/workflow-runs (origem e identidade das execuções); https://docs.github.com/en/rest/actions/workflow-jobs (jobs da tentativa mais recente). A evidência do nome da execução é combinada com Git e jobs reais; nome ou status isolado não é aprovação.
