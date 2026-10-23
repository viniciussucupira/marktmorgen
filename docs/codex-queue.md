# Fila de trabalho do Codex — Marktmorgen

## Pedidos repetidos (23 de outubro de 2026)

Solicitação do dono (23/10/2026, 16h21, horário de Fortaleza). Regra permanente para todo pedido recebido a partir desta solicitação. Texto repetido não gera seção, número, item, commit ou implementação em dobro, nem altera a ordem. Esta regra entra em vigor imediatamente; o registro documental não adia sua aplicação.

1. Antes de gravar qualquer pedido, confira o main, os PRs abertos e os ramos codex/* recentes, e procure o pedido pelas suas marcas de identificação, nesta ordem:
(a) a linha "Solicitação do dono (data, hora, horário de Fortaleza)";
(b) o nome da seção (por exemplo, "SY — Lições da auditoria da Systeme.io (23/10/2026)");
(c) a etiqueta de cada item entre colchetes (por exemplo, [SY1], [EC1], [SY2]);
(d) o conteúdo, mesmo com redação um pouco diferente.

2. Se a solicitação já estiver gravada ou em gravação num PR aberto (mesma linha de data e hora, ou mesma seção, ou mesma etiqueta, com o mesmo conteúdo), trata-se de repetição: não crie seção, número nem item novo, não faça commit só por causa dela e não mude a ordem da fila. Apenas acrescente, na proveniência da seção já existente, uma linha curta: "Recebido novamente em DD/MM/AAAA HHhMM (Fortaleza); repetição sem mudança; nada alterado."

3. Se o texto repetido tiver alguma diferença em relação ao que já está gravado:
(a) com a mesma linha de data e hora: é o mesmo pedido; aplique somente a diferença ao item já existente, mantendo o número, a posição e o estado, e registre na proveniência o que mudou;
(b) com data e hora diferentes: a instrução de data e hora mais recente prevalece sobre a mais antiga naquilo em que divergirem; o que já estiver gravado e não divergir continua valendo;
(c) se não for possível saber com segurança qual vale, não aplique nenhuma das duas versões no ponto da divergência: registre a divergência em "Depende do dono", citando os dois trechos, e continue o restante do trabalho.

4. Um pedido sem nome de seção, como um complemento, é reconhecido pela linha de data e hora e pela etiqueta entre colchetes. Se mesmo assim houver dúvida, procure o conteúdo nos itens existentes antes de criar um novo.

5. Antes de implementar qualquer item, confira se ele já foi feito ou está em andamento noutro PR ou ramo; nunca implemente o mesmo item duas vezes.

6. Se, apesar disso, a mesma solicitação acabar gravada com dois números:
(a) mantenha o número menor como o válido;
(b) marque o maior como "Duplicado do item N; não executar";
(c) não renumere nenhum outro item.

7. Revisão única, agora: procure na fila atual (main e PRs abertos) solicitações gravadas mais de uma vez, a partir das marcas do passo 1, e aplique a elas os passos 2, 3 e 6. Registre o resultado da revisão na mesma PR, mesmo que nenhuma repetição seja encontrada.

8. Depois deste PR, volte a gravar os pedidos ainda não gravados, na ordem em que foram recebidos, aplicando esta regra a cada um. Os próximos esperados são: SY ("SY — Lições da auditoria da Systeme.io (23/10/2026)", item [SY1]), EC ("EC — Encerramento de loja justo com os compradores (23/10/2026)", item [EC1]) e o complemento de reserva de reembolso [SY2], solicitado às 16h04.


Aplicação ao estado encontrado: SY1, EC1 e SY2 já estavam em gravação no PR #851 quando esta regra foi recebida; devem permanecer no mesmo registro, sem recriação. A lista de próximos esperados do passo 8 descreve o pedido original, não autoriza duplicar esses registros já encontrados. A linha curta de nova recepção deve ser incorporada à proveniência existente no PR em gravação ou no próximo commit autorizado que já tenha outra alteração; não criar commit exclusivamente pela repetição sem mudança.

Esta regra não altera itens, preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a ou revisão comercial. A REGRA DOS 60% permanece por cliente pagante isolado, usando 100% dos direitos no pior mês, e globalmente, após todos os custos e impostos brasileiros/americanos; desconhecido reprova, não é zero, e a leitura mais onerosa continua obrigatória. Todos os custos fixos da LLC pertencem integralmente ao Marktmorgen (FX275). Proibido criar contas, aceitar termos, contratar serviços, pagar valores ou contatar terceiros por causa desta regra.

### Revisão única de pedidos repetidos — 23/10/2026

Revisados o main ae1f858f48d3127eef5a4fda547d13e58c326a37, os heads dos 12 PRs abertos (#851, #754, #752, #749, #748, #747, #745, #743, #742, #741, #740, #738) e as filas de 76 ramos codex/* cujo head foi datado desde 22/10/2026 00:00 UTC (21/10/2026 21h00 Fortaleza). As datas dos 407 heads codex/* foram consultadas para definir esse recorte; refs atualizadas novamente antes desta gravação, com apenas #851 alterado pela integração do main e relido. O PR #852, também lido durante a revisão, já foi incorporado e publicado como entrega 186.

Resultado: nenhuma solicitação duplicada com dois números foi identificada nas marcas de data/hora, nomes de seção, etiquetas e conteúdo examinados. Não houve número maior a marcar como duplicado nem renumeração. As cópias herdadas do mesmo item em snapshots de ramos não são novos pedidos. A repetição de SY2 na conversa corresponde ao mesmo pedido de 23/10/2026 16h04; somente um SY2 consta no PR #851, sem item/commit criado só pela repetição. Nesse PR, SY1=305, SY2=306 e EC1=307 aparecem uma vez cada; os números, posições e estados ficam preservados. O número original solicitado para EC era 306, mas o registro já em andamento documenta a atribuição 307 após a inserção adjacente de SY2; esta revisão não renumera itens.

Nenhuma divergência nova entre versões do mesmo pedido foi identificada nesta revisão que exigisse inclusão em “Depende do dono”. A verificação deve ser renovada antes de cada novo registro ou implementação, conforme a regra acima. Esta é uma revisão de identificação e proveniência, não uma declaração de que toda funcionalidade parecida é equivalente ou está pronta.

Registro documental sem recurso ativado, sem número de fila novo e sem incremento funcional. Custo incremental mensal/anual por Store, Studio e Scale: 0/0, pois não há nova operação ou fornecedor; faturas reais de CI e fornecedores continuam desconhecidas, nunca consideradas zero. Nenhuma certificação de margem.

### Entrega funcional 186 — confirmação de publicação

PR #852 incorporado em 23/10/2026 às 16:43:42 de Fortaleza, commit ae1f858f48d3127eef5a4fda547d13e58c326a37, head testado 02f61ae69cffc89335f45af7298f0328e778dbc4, árvore testada/prevista/incorporada 8f66671ee759bbae8493ad75862233adc406f301, suíte completa 22/22 aprovada. Publicação dpl_p2wzPn4XYeoa2xb3H4g4Cch3SWqZ READY em 23/10/2026 16:44:51.327 Fortaleza, SHA exato confirmado em marktmorgen.com; /, /platform, /pricing, /mission e /library responderam 200 com o mesmo identificador. TaxEditor mantém campos e Save indisponíveis até os handlers estarem prontos; opt-ins, configurações e travas preservados. Contador 185→186 após comprovação, próxima entrega 187. Sem novas chamadas, serviços ou direitos; custo operacional incremental mensal/anual 0/0 por plano, faturas reais desconhecidas não são zero. Nenhum teste real de conta privada ou alteração fiscal em produção; nenhum período sem erros de runtime declarado.

Estado registrado em19/10/2026, após mesclagens623–625 (horários exatos nas entradas). Esta é uma fila de execução e evidência, não uma promessa de resultado, conformidade AAA ou margem fiscal certificada. Código remoto é a fonte canônica. Não refazer trabalho do Claude.

## Continuidade técnica — histórico de pedidos legível (22/10/2026 UTC)

Histórico de falha preservado: PR780 head095c95720873d7a4a0e0827d72665a81f03b11ac, verify119589145289 falhou porque a configuração do teste usava a variável inexistente STRIPE_API, enquanto o adaptador lê STRIPE_CONNECT_API_BASE. O interceptador recusou a origem inesperada antes de qualquer rede; não houve acesso a fornecedor externo. Corrigido somente o nome/base do provedor sintético para127.0.0.1:4999, sem remover casos nem reduzir contagens/limiares. Novo head exige todos os checks completos; execução falha não aprovada.

Item205 em andamento: `listSales` tratava uma resposta Stripe sem `data` ou com `data` malformado como histórico vazio. Agora essas formas, linhas nulas/primitivas/arrays e um invólucro inválido retornam estado de erro antes das leituras subsequentes; somente um array explícito de registros pode sustentar a lista. Não se alteram IDs, títulos históricos, idiomas, preços, limites, permissões ou reservas de estoque. Testes sintéticos percorrem a função real com provedor local simulado, verificam ausência de leitura adicional após erro, histórico explicitamente vazio, pedido pago preservado e HTTP500. Verificação completa no novo head é obrigatória e está pendente; nada incorporado/publicado por esta entrada. A parte opcional de vendas após pagamento mantém seu comportamento anterior; não alegar que esta correção tornou toda a listagem integralmente verificável.

Reconciliação CI em22/10/202601:26:12.190Z:966execuções concluídas únicas,2850jobs,902658segundos registrados, nenhum tempo ausente entre os jobs incluídos; acréscimo108execuções/322jobs/116160segundos sobre858/2528/786498. Evidência local `work/marktmorgen-ci-cost-20261022-0125.json`; últimos200runs consultados, somente `codex/*` concluídos e não contabilizados. Duração não é fatura, execuções ativas/fora da janela e cobranças de fornecedores/deploy não estão incluídas. Custos monetários reais continuam desconhecidos, não zero, e os gates comerciais permanecem fechados. Correção não adiciona operações/tetos de fornecedor; incremento máximo mensal/anual0/0por plano, sem certificação de margem.

## Continuidade técnica — opções de preço (22/10/2026 UTC)

Entrega151 confirmada: PR777 merge91cb82fff5c93bc2f5a802865b6215980d4238b3 em21/10/2026 às22:12:41Fortaleza(22/10/202601:12:41Z),22/22headcfaec8bec60e774cb923e5b3dba4e91794105e7d,árvored00adc18389cbf6022c77208b99c05851fd2dd20prevista/real/testadaiguais. Produção dpl_E2F3dEvbwfgEXeMmXdZ5RtdkkSWA READY22/10/202601:13:56.464Z,domínioSHAexato,5rotas200mesmoDPL,error/fatal0somente01:09:56.860Z–01:14:56.859Z. Correçãofuncionalaberturapixelsaguardaclientepronto; provafrete390/1280econsentimento/GPCcompletospassaram,semcertificaçãoAAA/manual. Semnovoscomandos/tetos,incrementomáximomensal/anual0/0porplano,custosCI/deployreaisdesconhecidos. Contador151próxima152; registrar próxima mudança necessária dafila.

Item205 em andamento: a edição de tamanhos/versões aceitava qualquer `ok` verdadeiro mesmo com HTTP de erro, e Cancelar/Editar/Remover continuavam disponíveis durante uma gravação. Correção: exigir HTTP bem-sucedido e `ok: true` próprio sem erro contraditório; resposta inválida/perdida mantém o formulário e pede recarregar para conferir; um bloqueio síncrono impede gravações sobrepostas e um fieldset desabilita os controles até a resposta. O contrato atual da rota confirma apenas a gravação, não devolve o produto: não alegar verificação dos fatos persistidos ou prevenção de excesso de estoque. Teste sintético de respostas inválidas, herdadas, contraditórias e HTTP de erro incluído; CI completo remoto obrigatório no novo head, ainda pendente. Sem chamadas adicionais de fornecedor, mudança de preço/limite/opt-in ou ativação: incremento máximo mensal/anual por plano0/0; custos reais CI/deploy continuam desconhecidos, não zero. SKU histórico e reserva atômica continuam incompletos. Nenhuma nova entrega contada.

## Continuidade técnica — direção explícita dos preços (22/10/2026 UTC)

Item205 em andamento, branch independente da interface PR778: a rota de opções convertia direção ausente, desconhecida ou malformada em mover para baixo. Agora somente campos próprios exatamente `up` ou `down` são aceitos; o resto recebe400antes de `moveOption`, sem escrever nem apagar arquivos. Chamadas válidas, IDs, SKU, ordem existente e limites preservados. Testes sintéticos cobrem ausência, tipos errados, propriedades herdadas, caixa e espaços indevidos; CI completo remoto obrigatório, pendente. Não certifica estoque atômico nem SKU histórico. Sem nova operação de fornecedor; incremento máximo mensal/anual0/0por plano; custos reais de CI/deploy desconhecidos. Não é publicação confirmada.

Integração explícita em PR779: o novo head inclui o main bf4581189609d19455d98f4f4c38cd8bd4c6da62 (PR778 incorporado) e o head corrigido098185ea30895fae4b4bee7050b48af947d0d443 do PR780 como pais adicionais, preservando suas implementações/testes e históricos. Direção explícita e histórico legível passam a ser verificados juntos em todos os checks no novo head antes da incorporação. Nenhum check isolado ou head falho será usado para declarar conclusão. PR778 incorporado22/10/202601:50:48Z=21/10/202622:50:48Fortaleza,22/22 e árvoresd14e8673fdd1ef8f4f3e0d137621e9a6ea0c32a5iguais; produção ainda pendente ao registrar esta integração, contador151.

## Continuidade técnica — clareza do histórico recente (22/10/2026 UTC)

Entrega152 confirmada: PR778 mergebf4581189609d19455d98f4f4c38cd8bd4c6da62 em21/10/2026 às22:50:48Fortaleza(22/10/202601:50:48Z),22/22headc6bf4c6e9add6fb48c6d780084a9e39ab009a950,árvored14e8673fdd1ef8f4f3e0d137621e9a6ea0c32a5prevista/real/testadaiguais. Produçãodpl_GoY4Y8ocdKpfBYnFFWQQ3fBeM5yM READY2026-10-22T01:52:08.009Z,domínioSHAexato,5rotas200mesmoDPL,error/fatal0somente01:48:01.599Z–01:53:01.599Z. Opções de preço exigem confirmação explícita HTTP/oktrue, mantêm campos quando incerto e bloqueiam controles durantegravação; testes sintéticos e suítes completas passaram. Contrato confirma gravação somente, não fatos retornados nem estoque atômico. Semoperações/tetosnovos,incrementomáximomensal/anual0/0porplano,custosCI/deployreaisdesconhecidos. Contador152próxima153; anexar na próxima alteração necessária da fila sem reiniciar CI saudável apenas por documento.

Item205 e revisão de clareza/acessibilidade: a página do estúdio dizia “Nothing sold yet” para uma janela recente sem resultados, dizia que nada poderia ter vendido quando a configuração atual não permitia ler pedidos e apresentava a janela limitada como se não pudesse omitir nada. Agora explica que é uma visão recente, mantém o teto visível de25pedidos e aponta o painel Stripe como histórico completo; indisponibilidade não apaga o passado nem significa zero vendas. Erro de leitura é expresso como histórico não verificável. A seção de vendas passa a ter um headingh2 e região nomeada, preservando o anchorsales e todos os controles/IDs. Somente texto e semântica; não muda leitura, armazenamento, planos, opt-in ou conteúdo do criador. Não foram criados testes que espelhem textos; CI completo remoto e suítes de acessibilidade existentes são obrigatórios. Nenhuma publicação contada nesta preparação.

Sem operação/teto novo de fornecedor; incremento máximo mensal/anual0/0por plano. Custos reais de CI/deploy permanecem desconhecidos. SKU histórico e reserva de estoque atômica não são declarados completos.

## Falha de navegador corrigida — PR779 (22/10/2026 UTC)

Head93622ce72793a7c7ddbfacc4c7cc8ea8d445b2b6:21/22; Cross-browser WebKit119592939836 falhou em duas verificações do primeiro cenário de remessa390px. A entrada de rastreio foi preenchida antes da inicialização dos controles, voltou vazia e o POST carregou vazio. Mantidas todas as13situações da matriz,390/1280, igualdade dos valores enviados/retidos e bloqueios durante requisição. Correção funcional: input e botão da remessa ficam desabilitados até a interface estar pronta (`useSyncExternalStore`, snapshots estáveis) e uma trava síncrona impede submissões sobrepostas. Nenhum teste foi removido, limite relaxado ou job isolado reexecutado. Todos os checks devem rodar no novo head. O novo main do PR781 é incorporado explicitamente junto, preservando sua clareza/semântica e a prova152. PR781 já incorporado; publicação153 ainda não confirmada no momento deste registro.

## Continuidade técnica — estado de remessa verificável (22/10/2026 UTC)

Entrega154 confirmada: PR779 (inclui PR780 consolidado) mergea090982da06e4741010dce34720ab5e916c1c2b4 em21/10/2026 às23:50:52Fortaleza(22/10/202602:50:52Z),22/22head5dd1ad3f1ce66362c7b1c3ef645067db4f6978f9,árvore1939aa075669ac3a0fb38f0cf4dda2d5090d9eb6prevista/real/testadaiguais. Produçãodpl_HRVh4srPQHqduni7rvYyMV5MBwv9 READY2026-10-22T02:52:20.323Z,domínioSHAexato,5rotas200mesmoDPL,error/fatal0somente02:47:48.924Z–02:52:48.924Z. Rastreio aguarda inicialização e trava submissões sobrepostas; direção ambígua de preço é recusada antes de gravar; histórico ilegível não vira lista vazia. Verify119602234778,Fx119602234961,WK119602234823 passaram integralmente no novo head, mantendo13cenários390/1280 e valores exatos. Falhas anteriores preservadas. Semnovasoperações/tetos,incrementomáximomensal/anual0/0porplano,custosCI/deployreaisdesconhecidos; não certifica estoque atômico/SKU histórico. Contador154próxima155.

Item205: `readShipped` descartava respostas incompletas, tipos errados e registros ilegíveis como se não houvesse remessa; `listSales` também convertia falhas de leitura em mapa vazio, permitindo mostrar novamente “Mark as shipped” sem estado conhecido. Agora só a ausência explícita `null` significa não marcado. Falta de configuração, resposta sem uma linha por pedido, tipos não esperados, JSON inválido ou registro sem prova válida interrompem a leitura. O histórico mostra seu erro existente em vez de inventar ausência de envio; registros legíveis e ausências explícitas continuam válidos. Marcações ocupadas não ganham direito de enviar e-mail a partir de dados desconhecidos. Nenhum novo comando, tentativa, chave, TTL, mensagem ou pagamento foi acrescentado.

Testes sintéticos de lote/registro inválido, ausência explícita, registro preservado, zero retry e zero chamada de fornecedor; o teste real de `listSales` simula lote de remessa incompleto e exige erro antes da leitura extra. Sem redução de cobertura/limiares; todos os checks completos no novo head são obrigatórios. Incremento máximo mensal/anual de teto0/0por plano; faturas CI/deploy desconhecidas, não zero. SKU histórico e reserva atômica continuam incompletos. Nenhuma nova publicação contada nesta preparação.

## Continuidade técnica — compradores recentes sem falsas conclusões (22/10/2026 UTC)

Entrega153 confirmada: PR781 mergeb8fe97bc7974e65105d5bf1fd8085b65c22dca45 em21/10/2026 às23:22:02Fortaleza(22/10/202602:22:02Z),22/22head4c9dd56398f9ac981f31102f5118e0a7c3740f9e,árvore649e952702905cf1aaf9012ab535b2ac2b1cfb6dprevista/real/testadaiguais. Produçãodpl_3zRWNCiWGgWG94ttXtPoQZDV6T1Q READY2026-10-22T02:23:07.467Z,domínioSHAexato,5rotas200mesmoDPL,error/fatal0somente02:18:54.185Z–02:23:54.185Z. Histórico recente explica limite25 e indisponibilidade/erro/ausência sem alegar zero vendas passadas; seção nomeada e h2. Semoperações/tetosnovos;incrementomáximomensal/anual0/0porplano;custosCI/deployreaisdesconhecidos. Contador153próxima154. Registrar na próxima mudança necessária da fila sem reiniciar CI saudável só por documento.

Revisão página por página, compradores do estúdio: a lista filtra pedidos sem e-mail, deduplica os demais e lê somente a janela recente existente, mas dizia “Nobody has bought yet” quando não sobrava nenhuma linha. Agora explica o escopo recente com e-mail e o histórico completo no Stripe; ausência nesta janela não é declarada ausência de compras passadas. Falha é lista não verificável e configuração indisponível recebe explicação, em vez de desaparecer sem contexto. Reutiliza título/região existentes; preserva IDs, permissões, conteúdo dos criadores e idiomas de compradores. Não adiciona leituras, chamadas, retenção, mensagens ou mudanças de plano/opt-in. Somente clareza de estados já existentes, sem testes que espelhem texto; todos os checks completos remotos são exigidos antes de incorporar/publicar. Incremento máximo mensal/anual de teto0/0por plano; custos reais de CI/deploy desconhecidos, não zero. Não é publicação confirmada.

Entrega154 confirmada: PR779 (inclui PR780 consolidado) mergea090982da06e4741010dce34720ab5e916c1c2b4 em21/10/2026 às23:50:52Fortaleza(22/10/202602:50:52Z),22/22head5dd1ad3f1ce66362c7b1c3ef645067db4f6978f9,árvore1939aa075669ac3a0fb38f0cf4dda2d5090d9eb6prevista/real/testadaiguais. Produçãodpl_HRVh4srPQHqduni7rvYyMV5MBwv9 READY2026-10-22T02:52:20.323Z,domínioSHAexato,5rotas200mesmoDPL,error/fatal0somente02:47:48.924Z–02:52:48.924Z. Rastreio aguarda inicialização e trava submissões sobrepostas; direção ambígua de preço é recusada antes de gravar; histórico ilegível não vira lista vazia. Verify119602234778,Fx119602234961,WK119602234823 passaram integralmente no novo head, mantendo13cenários390/1280 e valores exatos. Falhas anteriores preservadas. Semnovasoperações/tetos,incrementomáximomensal/anual0/0porplano,custosCI/deployreaisdesconhecidos; não certifica estoque atômico/SKU histórico. Contador154próxima155.

Integração explícita PR782: novo head tem como pai adicional o main a090982da06e4741010dce34720ab5e916c1c2b4, preserva integralmente PR779/780 (direção explícita, histórico legível, tracking pronto), as implementações do Claude, as falhas e todas as provas históricas. Requer22checks completos neste novo head antes de incorporar; checks do antigo b309a25 não aprovam o conjunto. Nenhuma nova operação de fornecedor, e nenhum contador incrementado pela integração.

## Falha e consolidação preservadas — PR783 (22/10/2026 UTC)

Head53578f361239bf54ced83fed7d048c5d47f53fa7: verify119612797670 falhou porque o chamador `markShipped` deixava escapar a nova exceção de leitura quando uma marca NX já estava ocupada. Os48checks novos de leitura e28checks de histórico passaram, mas o teste de contrato existente em `tests/shipping.test.ts` corretamente exigiu retorno `unknown` sem outro e-mail. Corrigido o chamador para capturar a leitura desconhecida e preservar esse contrato. Nenhum caso ou limiar foi removido; os testes anteriores permanecem intactos. Novo head exige CI integral.

Auditoria externa: PR782 run39713901421/audit119611368126, headfd6dc81, recebeu503 do endpoint npm às02:59:16/03:04:16Z; PR783 audit119612797201 recebeu timeouts às03:04:17/03:09:17Z. O parser recusou os relatórios desconhecidos; nenhuma aprovação foi concedida. [Status oficial npm](https://status.npmjs.org/) consultado22/10/202603:12Z publicava incidente de instalação/publicação desde02:33Z, ainda investigado às02:37Z; “Security Audit” aparecia operacional, o que não comprova que os relatórios do CI foram obtidos. Nenhum gate ou timeout foi afrouxado. Sem rerun isolado de job: todas as verificações devem passar no novo head.

O trabalho do PR782 passa a ser consolidado neste PR783, como pai adicionalfd6dc81e52f3370d4d5487e2550b8066398f0306, mantendo a página de compradores e todos os históricos/provas. Nenhuma dessas mudanças é considerada incorporada/publicada só pela consolidação. Contador154 permanece. Custo incremental operacional continua0/0mensal/anual por plano, sem novos comandos ou mensagens; faturas CI/deploy desconhecidas.

## Proveniência e prioridade

- **P0:** pedido de excelência/acessibilidade de19/10/2026, anexo bcc471cb-e0ea-4bd0-9b09-26c1d19e0ed5. Hora original não fornecida no arquivo.
- **P1:** fila original dos15itens do Path, recebida em19/10/2026, anexo2d11ad05-7041-4ccd-b6db-6c572426242f. Hora original não fornecida no arquivo. O pedido mandava concluir primeiro PR611, já entregue.
- **P2:** nova fila completa e este arquivo, recebidos em19/10/2026 entre19:37e19:39 de Fortaleza, anexo0a25fef7-9d9d-40d9-96ec-0bbd342c282c. O cliente não forneceu segundo/hora exatos; esse intervalo vem da conversa, não é uma hora original inventada.
- **P3:** orientação de continuidade automática em19/10/2026, por volta de19:40 de Fortaleza (hora exata da mensagem não fornecida): avançar sem confirmação, começar próximo item em outra branch durante CI sem conflitos, pular dependências externas; após a fila, revisão contínua de excelência. Se um impedimento impossível de resolver autonomamente durar mais de1hora, registrar motivo/evidência, marcar aguardando o dono e avançar. Falha de teste por si só exige correção e nova verificação, não transferência ao dono.
- P2 substitui a antiga sequência direta do Path: inglês americano (B), fiscal (C), restante do Path (D), depois E–K. O item14 de tradução foi adiado. Quando P2 chegou, o PR619 já estava publicado e o PR620 já estava em validação: concluir620, incorporar esta fila em PR separado e continuar B. P3 autoriza preparar a próxima branch enquanto o CI de620 roda; não antecipar sua publicação.
- Antes de cada construção: ler AGENTS.md/CLAUDE.md/guia relevante do Next; conferir main/PRs abertos e implementação atual. Um estado a fazer não afirma que a capacidade inexiste: o levantamento fornecido será conferido no código antes de construir.
- Cada item em seu PR codex/*, com prova negativa e positiva pertinente, documentação/evidência e esta fila atualizada. Preservar trabalho em claude/*. Branches paralelas não editam os mesmos arquivos sem integração explícita. Corrigir testes e executar novamente a verificação completa do novo head; não substituir por rerun isolado.
- Avisos curtos ao terminar; não esperar resposta para avançar. Somente publicação confirmada no domínio/versão incrementa o contador de entregas. PR mesclado e publicação são evidências distintas. Hora de mesclagem só é preenchida após GitHub fornecê-la; nunca antecipar um feito ou inventar horário futuro.
- Mensagens/inscrições/aprovações externas, criação de conta e pagamentos reais continuam proibidos sem instrução explícita. Autorizar a fila não substitui as aprovações específicas que o próprio pedido reservou ao dono.

- **P4:** atualização do dono no anexo70946172-40e4-4720-9329-d64271855eb4/Texto colado.txt, lida em19/10/2026,22h de Fortaleza (aproximado; hora original não fornecida). Preservar números/estados/detalhes existentes e inserir C2/D2/E2/F2/H/I/J/X nos pontos indicados. O levantamento de Skool/Kit/Circle/Teachable/Substack foi informado como oficial e comparado com main em19/10; não é pesquisa refeita pelo agente. Conferir cada capacidade no código antes de construir. Não alterar preço sem aprovação. Padrão de excelência e honestidade transversal reforçado; testes reais de AT/usuários/dispositivos não realizados continuam como lacuna a registrar em accessibility-programme.md. Nenhuma alegação AAA/superioridade sem prova.
- IDs89–137 são novos e estão inseridos por seção; a ordem visual de execução prevalece, sem renumerar1–88. Juntar itens expressamente indicados (E11/E7/F5/H1/H2/I2), sem duplicar custo ou implementação. A expressão mínimo60% não certifica o M0 que ainda reprova.

## M0 — margem e custo antes/depois

Fonte: [conta gerada](margin-alignment-2026-10-18.md), [modelo de recebimento](../lib/receiving-costs.ts), [registro de custos](../tests/plan-cost-registry.ts) e [piso](../tests/spend-floor.test.ts). Valores do modelo no main f2d044c, não uma revisão fiscal independente. Comissão=zero, uso integral simultâneo no pior mês e intervalos completos. Franquias grátis de fornecedor não valem custo zero.

| Plano/intervalo | Preço atual | Leitura com mais imposto ANTES | DEPOIS de ação sem ampliar envelope | Leitura de dimensionamento antes/depois |
| --- | --- | --- | --- | --- |
| Store mensal | US$69 |12,09%|12,09%|60,31%|
| Store anual | US$690 |12,21%|12,21%|60,59%|
| Studio mensal | US$449 |12,14%|12,14%|60,38%|
| Studio anual | US$4.490 |12,02%|12,02%|60,06%|
| Scale mensal | US$999 |12,17%|12,17%|60,46%|
| Scale anual | US$9.990 |12,02%|12,02%|60,07%|

**A leitura vinculante reprova todos os planos: não há prova de60% após todos os impostos.** A leitura de dimensionamento não substitui a mais onerosa. PLANS_ON_SALE=false; revisão comercial, art.9a e demais gates continuam fechados. LLC/Stripe EUA são passos do dono, e não suficientes sozinhos para abrir.

Para qualquer recurso com custo novo: antes do código que incorra no custo, registrar unitário pago mais caro, franquia por plano, quantidade no pior caso, mensal/anual, todos os impostos e reservas, antes/depois e teto automático por loja/fornecedor reservado antes da chamada. Incluir plan-cost-registry e spend-floor. Sem cálculo/limite garantido, custo/imposto desconhecido **reprova**, nunca vira zero. Uma conta pendente é trabalho a fazer; não é uma aprovação de custo. Sem média de consumo nem subsídio entre clientes. Exposições gratuitas/reembolso/cancelamento e custos fixos/base mínima global continuam obrigatórios.

Não mudar preço sem aprovação do dono, não cortar limite visível, não baixar imposto/taxa, não enfraquecer gate para teste passar. Custo incremental zero de um download local não significa custo total zero do plano. M0 só pode ser reutilizada quando o envelope máximo do plano não aumenta; uma nova chamada/teto exige conta específica.

## Fila numerada

A ordem abaixo é de execução dos itens acionáveis. Itens feitos/aguardando/cancelados ficam na lista para conferência; ao encontrá-los, avançar para o próximo acionável. Estados não implicam prova ausente. Subdivisões futuras de auditoria devem receber novas entradas e PRs pequenos, preservando o histórico.

1. **[ATUAL-D6] Certificados privados por nível do Path: arquivo HTML acessível, valores desligados por padrão, dados do nível salvo no servidor a partir da própria loja.**
   - Pedido: P1 item6; P2 D6; datas/horas e grau de certeza em Proveniência.
   - Estado: **feito (PR #620, mesclado em 19/10 19:43, horário de Fortaleza; publicado como entrega41, versão da6924e, em19/10 19:44 de Fortaleza)**.
   - Custo e margem: Sem chamadas ou registros adicionais: geração local a partir da resposta já admitida. Documento <4KB; novo trecho renderizado <10KB. Matriz M0 antes=depois; a leitura fiscal vinculante reprova os planos.

2. **[FILA] Criar e manter este arquivo no repositório, com proveniência, ordem, custos, estados e histórico; incluir sua atualização no mesmo PR de cada próximo item.**
   - Pedido: P2 regras do arquivo; P3; datas/horas e grau de certeza em Proveniência.
   - Estado: **feito (PR #621, mesclado em 19/10 19:54, horário de Fortaleza)**.
   - Custo e margem: Somente documentação e teste de consistência; sem custo de execução em produção.

3. **[B1] Fixar inglês americano como idioma atual de site público, estúdio, Path e e-mails da plataforma; conteúdo dos criadores, citações em português e identificadores persistidos ficam intactos.**
   - Pedido: P2 B1; datas/horas e grau de certeza em Proveniência.
   - Estado: **feito (PR #622, mesclado em 19/10 19:57, horário de Fortaleza; entrega42 confirmada)**.
   - Custo e margem: Conferir configuração e textos existentes; nenhum serviço de tradução ou custo por visita autorizado.

4. **[B2] Revisar inglês americano página por página: mensagens, erros, estados vazios, e-mails, aria-label, alt e textos de testes; manter inventário de áreas e PRs pequenos, sem alterar significado.**
   - Pedido: P2 B2; datas/horas e grau de certeza em Proveniência.
   - Estado: **em andamento; áreas e lacunas em docs/us-english-audit.md; próxima revisão codex/safe-error-messages**. Posição vigente: OR: andamento prioritário preservado, antes de 273 [BK1] e 275 [FX1]; conferir o histórico de publicações e executar somente o remanescente acionável.
   - Histórico OR — estado anterior à atualização documental: - Estado: **em andamento; áreas e lacunas em docs/us-english-audit.md; próxima revisão codex/safe-error-messages**.
   - Custo e margem: Sem novo fornecedor; medir eventual mudança de payload dentro dos tetos existentes. M0 permanece referência, sem certificação fiscal.

140. **[B2-SAFE-ERROR-MESSAGES] Mensagens de erro inesperadas não são valores herdados**
   - Pedido: B2/P0/P4, revisão de estados de falha em formulários.
   - Estado: **em andamento; branch codex/safe-error-messages**. Posição vigente: OR: andamento prioritário preservado, antes de 273 [BK1] e 275 [FX1]; conferir o histórico de publicações e executar somente o remanescente acionável.
   - Histórico OR — estado anterior à atualização documental: - Estado: **em andamento; branch codex/safe-error-messages**.
   - Escopo: Login, alteração de endereço e configuração fiscal usam somente mensagens próprias da tabela local. Uma resposta com erro __proto__ ou constructor deve mostrar a explicação genérica existente, sem tratar um objeto/função herdado como texto. Não é alegação de poluição de protótipo; é proteção da interface contra resposta inesperada.
   - Prova: dois novos erros inesperados interceptados em cada formulário real390/1280, preservando casos de sucesso, recusa específica, HTTP, dados incompletos e controles pendentes. Total: login20, endereço22 e fiscal26 casos; nenhuma mensagem/gravação real. CI completo no novo head pendente.
   - Custo: fonte cliente+43caracteres em três componentes, sem nova operação/chamada/registro/serviço/franquia/preço/gate. M0 igual, ainda reprova60%; PLANS_ON_SALE=false.

141. **[B2-PAUSE-ACKNOWLEDGMENT] Confirmar a configuração de pausa sem prometer gravação incerta**
   - Pedido: B2/P0/P4, revisão de mensagens/estados de preferências de assinatura.
   - Estado: **em andamento; branch codex/pause-acknowledgment, após PR643**. Posição vigente: OR: andamento prioritário preservado, antes de 273 [BK1] e 275 [FX1]; conferir o histórico de publicações e executar somente o remanescente acionável.
   - Histórico OR — estado anterior à atualização documental: - Estado: **em andamento; branch codex/pause-acknowledgment, após PR643**.
   - Escopo: o servidor já devolve pause; o cliente exige HTTP bem-sucedido, ok booleano, ausência de erro e pause numérico igual ao escolhido. Bloquear seletor durante espera, anunciar aria-busy, recusar submissão duplicada e usar só mensagens próprias. Resposta incerta manda conferir a página; não afirma que nada mudou.
   - Prova:14respostas interceptadas por estado inicial em390/1280, com duas fixtures exclusivamente locais para ativar e desativar:56casos. Inclui valores ausentes/diferentes/em texto, HTTP, JSON inválido, erros herdados, perda de resposta, recusa conhecida e sucesso; nenhum POST de pausa chega ao servidor, nenhuma assinatura/cobrança real é alterada.
   - Custo: fonte cliente+323caracteres; mesmo POST/resposta existentes. Novas fixtures somente em desenvolvimento. Nenhuma chamada/gravação/provedor/franquia/preço/gate de produção novo; M0 igual e ainda reprova60%, PLANS_ON_SALE=false.

139. **[B2-CLAIM-ACKNOWLEDGMENT] Confirmação coerente ao criar outra loja**
   - Pedido: B2/P0/P4, revisão de mensagens/estados de formulários.
   - Estado: **feito; PR642 incorporado19/10/2026 às23:04:11Fortaleza, entrega57 confirmada**.
   - Escopo: HandleForm exige HTTP bem-sucedido, ok booleano, endereço normalizado igual ao pedido, identificador devolvido no formato já exigido pelo servidor e ausência de erro; nomes de erro desconhecidos não selecionam propriedades herdadas. Campos bloqueados durante confirmação. Resposta incerta manda conferir o estúdio antes de repetir; não afirma que nada foi criado. Identificadores persistidos e limite de cinco lojas preservados.
   - Prova planejada: doze respostas interceptadas na página real de nova loja em390/1280, valores/campos pendentes, erros, navegação somente após confirmação válida e viewport. Nenhuma criação de loja/conta chega ao servidor; resposta positiva aponta para a fixture sintética já existente. Primeiro cadastro usa o mesmo componente, mas este navegador cobre outra loja, sem alegar prova de todo onboarding.
   - Custo: mesmo POST existente, nenhuma operação, conta/provedor/mensagem/franquia/preço/gate nova; M0 não muda nem certifica60%, vendas permanecem fechadas.

138. **[P0-BUTTON-CONTRAST] Contraste do texto dos botões das lojas durante interação**
   - Pedido: P0/P4, excelência transversal; não é declaração de AAA do site inteiro.
   - Estado: **feito; PR640 incorporado19/10/2026 às22:58:07Fortaleza, entrega56 confirmada**.
   - Achado: branco sobre violeta #5a36ee tem contraste menor que7:1. O filtro de brilho/saturação ao apontar podia reduzir o contraste derivado. Ajustar preenchimento e texto juntos para7:1 e borda do botão contra o cartão para3:1, preservando a escolha persistida do criador. Manter realce pelo sombreado, sem filtro que altere o par de cores.
   - Prova: propriedades em quatro temas, predefinições e grade RGB; gradiente sem sobreposição; CSS real dos botões em estado normal/ponteiro/foco no navegador sintético. Os testes de foco existentes permanecem. Fotos/sobreposições translúcidas/outros estilos de texto e AT manual não são cobertos por esta prova.
   - Custo: função pura já existente, remove a segunda busca opcional de cor, no máximo quatro buscas de26passos em vez de cinco; fonte total menor, sem rede/registro/provedor/franquia/preço/gate novo. M0 antes=depois, leitura onerosa ainda reprova60%; PLANS_ON_SALE=false.

5. **[B3] Adicionar teste de texto da plataforma que recuse grafias britânicas comuns: colour, centre, organise, licence, cancelled, behaviour, afterwards e tick/untick; distinguir texto exibido de código, citações e dados.**
   - Pedido: P2 B3; datas/horas e grau de certeza em Proveniência.
   - Estado: **feito; PR #627 incorporado19/10/2026 20:46:10 de Fortaleza; entrega47 confirmada no domínio, versão8afa047, READY20:48:01**.
   - Evidência: [PR #627](https://github.com/viniciussucupira/marktmorgen/pull/627); Product39342585794/Redis/security39342585712 e navegador completos;8rotas com marcador exato; não declara B2 manual inteiro concluído.
   - Custo e margem: Teste de desenvolvimento; sem custo de produção.

6. **[B4] Escrever docs/site-languages.md: traduções completas no código após abertura/autorização; alemão, francês, holandês, espanhol e italiano; seletor sem bandeiras, hreflang e frases proibidas por idioma; estudo fiscal por país para japonês/coreano/chinês; futuro português do Brasil.**
   - Pedido: P2 B4; datas/horas e grau de certeza em Proveniência.
   - Estado: **feito; documento incorporado no PR #628 em19/10/2026 20:49:55 de Fortaleza**.
   - Evidência: [docs/site-languages.md](site-languages.md), [PR #628](https://github.com/viniciussucupira/marktmorgen/pull/628), commit `eb5b3167acee3a8f0f4ecbc50cd85103889d870a`; Product39342996924/security39342996915 completos. Documento apenas: não ativa traduções nem incrementa contador de entrega funcional.
   - Custo e margem: Só documento. Nenhuma tradução em tempo de requisição ou custo por visita; custo de conteúdo/manutenção e fiscalidade ainda precisam ser calculados.

7. **[C-UE] Construir tratamento de IVA europeu do art.9a em docs/eu-vat-article-9a.md: OSS não-UE desde a primeira venda, duas provas de localização coerentes (24b/24f), retenção art.63c por10anos; imposto no comprador ou repasse, nunca na comissão. Dividir em PRs por caminho de checkout e prova.**
   - Pedido: P2 C1/C2; datas/horas e grau de certeza em Proveniência.
   - Estado: **em andamento; auditoria de13caminhos e registro, primeiro endurecimento de data no PR #629; coleta/duas provas/retenção/OSS ainda não implementados**. Posição vigente: OR: permanece nos andamentos prioritários; se ainda incompleto, concluir também como primeiro do Bloco A, sem execução duplicada.
   - Histórico OR — estado anterior à atualização documental: - Estado: **em andamento; auditoria de13caminhos e registro, primeiro endurecimento de data no PR #629; coleta/duas provas/retenção/OSS ainda não implementados**.
   - Custo e margem: Custo de cálculo, registros10anos, evidências e operação ainda não calculado/integrado: calcular fornecedor pago mais caro, mensal/anual por plano, antes/depois; registrar no plan-cost-registry e spend-floor, reservar tetos antes do trabalho. Falta de conta é reprovação, não zero.

8. **[C-UK] Depois da UE, implementar tratamento do Reino Unido pela leitura com mais imposto, em todos os caminhos aplicáveis.**
   - Pedido: P2 C1/C2; datas/horas e grau de certeza em Proveniência.
   - Estado: **aguardando o dono no remanescente de registro e financiamento; implementação fiscal incompleta**. Posição vigente: OR: Bloco A, posição 2/8, após 275 [FX1] e antes de 206 [SH3]. A dependência externa não trava o próximo item.
   - Histórico de 23/10/2026, 07:15 Fortaleza — estado anterior preservado: - Estado: **a fazer**. Posição vigente: OR: Bloco A, posição 2/8, após 275 [FX1] e antes de 206 [SH3].
   - Evidência: HMRC exige registro da empresa estrangeira para serviços digitais tributáveis a consumidores britânicos e responsabiliza a plataforma conforme seu papel. Nenhum registro da LLC nem tratamento consta em `DEEMED_SUPPLIER_RECORDS`. O dono proibiu criar conta, aceitar termos ou fazer submissão externa; nenhuma dessas ações foi realizada. O registro não pode ser concluído por teste sintético. Custos completos de registro, declarações, recolhimento, retenção e reserva continuam desconhecidos, reprovados sob 60% líquido individual/global e 100% da LLC. A análise autônoma restante pode continuar; não se pede novamente autorização.
   - Fontes oficiais verificadas em 23/10/2026: https://www.gov.uk/guidance/the-vat-rules-if-you-supply-digital-services-to-private-consumers e https://www.gov.uk/charge-reclaim-record-vat/keeping-vat-records . Prazo britânico depende do regime: a orientação geral distingue seis anos de dez anos para OSS/MOSS; nenhum prazo europeu foi copiado automaticamente nem encurtado. Controle Stripe Tax do criador não satisfaz a obrigação da plataforma.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Ainda não calculado: orçamento por plano/intervalo e teto automático são pré-condições; não registrar tratamento como concluído antes de testes.

9. **[C-US] Depois do Reino Unido, implementar regras estaduais dos EUA de marketplace facilitator e registros necessários, por jurisdição e caminho de checkout.**
   - Pedido: P2 C1/C2; datas/horas e grau de certeza em Proveniência.
   - Estado: **aguardando o dono no remanescente de registros e financiamento; pesquisa e matriz por jurisdição incompletas**. Posição vigente: OR: Bloco A, posição 3/8, após 275 [FX1] e antes de 206 [SH3]. Dependências externas não travam 232 [CA1].
   - Histórico de 23/10/2026, 08:14 Fortaleza — estado anterior preservado: - Estado: **a fazer**. Posição vigente: OR: Bloco A, posição 3/8, após 275 [FX1] e antes de 206 [SH3].
   - Motivo e evidência: revisão iniciada em 23/10/2026 às 06:48:47 de Fortaleza; após mais de uma hora, permanecem ausentes registros da LLC, preços pagos mais onerosos de registro/declarações/recolhimento/retenção e reservas automáticas. Não é permitido criar conta ou submeter registro. NY exige certificado, declarações, recolhimento e identificação do vendedor; contratar terceiro para receber não é isenção automática. Fonte oficial consultada em 23/10: https://www.tax.ny.gov/pubs_and_bulls/publications/sales/marketplace.htm . Retenção depende da data da declaração e pode ser estendida por auditoria: https://www.tax.ny.gov/pubs_and_bulls/tg_bulletins/st/record-keeping_requirements_for_sales_tax_vendors.htm . A página antiga não substitui checagem da lei vigente. A matriz estadual continua incompleta; nenhuma alíquota, isenção ou registro foi implementado nem a leitura fiscal reduzida.
   - Califórnia: guia oficial https://cdtfa.ca.gov/industry/retailers-and-purchasers-of-digital-products/definitions.htm distingue categorias e mudança com vigência em 01/01/2027; não usar isenção atemporal nem classificar tudo como tributável apenas pelo nome digital. Link oficial do SB122 retornou 403 nesta leitura; texto primário ainda pendente. A coleta documental pode prosseguir, sem ativar operação. Custo desconhecido reprova o cálculo mensal/anual de todos os planos e a regra de 60% por cliente/global com 100% dos custos da LLC.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Ainda não calculado; leitura fiscal mais onerosa, custos de obrigação/registro e teto por fornecedor/loja precisam de prova antes de custo novo.

### C2 — Capacidade dos planos (novos IDs estáveis)

89. **[C2-CAPACITY] Calcular o máximo de cada franquia em cada plano e nos dois intervalos**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **em andamento; branch codex/capacity-precheck; pré-verificação matemática, auditoria completa de unitários/configuração ainda pendente**. Posição vigente: OR: andamento prioritário preservado, antes de 273 [BK1] e 275 [FX1]; conferir o histórico de publicações e executar somente o remanescente acionável.
   - Histórico OR — estado anterior à atualização documental: - Estado: **em andamento; branch codex/capacity-precheck; pré-verificação matemática, auditoria completa de unitários/configuração ainda pendente**.
   - Escopo e prova: Amplia I2 sem substituir seu número/estado. Conferir no código e calcular e-mails, ações de comunidade, visitas, pedidos, GB e horas de vídeo. Baseline fornecida: Store0e-mails/200ações/3.400visitas/200pedidos/5GB/4h; Studio7.000e-mails/1.000ações; Scale10.000e-mails/3.000ações. E-mail informado comoUS$0,90/mil em lib/plan.ts: verificar fornecedor/unidade mais cara. Comparação fornecida: Substack sem limite de envios, Kit grátis até10.000inscritos, Skool/Circle atividade de comunidade sem limite e Teachable alunos ilimitados/até1TB; são insumos do dono, não medição própria. Calcular máximo com60% ou mais no pior caso e comissão zero; subir somente onde ambos intervalos permitirem. Mudança de preço/pacote vai como proposta à seçãoI. M0 atual continua reprovada: nenhuma ampliação presumida.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

90. **[C2-EMAIL-HONESTY] Corrigir imediatamente a contradição pública sobre modelos de e-mail**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **concluído; PR637 incorporado em19/10/2026 às22:31:33Fortaleza; entrega54 verificada**.
   - Escopo e prova: Conferir os quatro modelos reais e o editor em lib/mail-body.ts/components/mail-designer.tsx. Em lib/feature-pages.ts, a seção de recursos anuncia quatro, mas a seção What it does not do yet ainda diz No templates. Corrigir a limitação para descrever o que existe e o que falta, com regressão na página real; sem prometer colunas ou capacidades ausentes.
   - Custo e margem: Texto dentro da página existente, sem novo envio/chamada/armazenamento/franquia. Medir payload; M0 antes=depois somente se o envelope não aumentar. Preços/limites/gates preservados, sem certificação de60%.

10. **[D7] Path para migração: produtos e páginas importados podem cumprir fatos correspondentes; importação nunca cria lead confirmado nem venda.**
   - Pedido: P1 item7; P2 D7; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 1/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Sem custo novo autorizado; conferir o código antes de construir.

11. **[D8] Resumo semanal factual no estúdio no fuso salvo do criador; e-mail somente se justificado, dentro da franquia e de mayNotify/margem de despacho.**
   - Pedido: P1 item8; P2 D8; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 2/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Leituras agregadas e eventual e-mail ainda não calculados; definir escopo/franquia/tetos e M0 antes/depois antes de adicionar custo.

12. **[D9] PayPal no dia7 e níveis somente com confirmação do servidor da própria loja, modo real e reembolsos descontados; não confundir com aprovação de PayPal como plataforma.**
   - Pedido: P1 item9; P2 D9; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 3/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Leituras PayPal, cache e custos ainda não calculados; nenhuma chamada sem admissão/teto. Não abrir integração pausada por aprovação ausente.

13. **[D10] Lead do Path apenas quando o endereço usa o link de confirmação, nunca só pelo envio da mensagem.**
   - Pedido: P1 item10; P2 D10; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 4/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Sem custo novo autorizado; conferir o código antes de construir.

14. **[D11] Selo Made with Marktmorgen opcional na loja, desligado por padrão e controlado pelo criador.**
   - Pedido: P1 item11; P2 D11; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 5/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Sem custo novo autorizado; conferir o código antes de construir.

15. **[D12] Painel privado do dono com ativação diária e tempo até primeira venda, apenas agregados sem identidades de criadores.**
   - Pedido: P1 item12; P2 D12; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 6/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Leitura/agregação/retenção ainda não calculadas; definir orçamento, tamanho mínimo de grupo e privacidade antes do código.

16. **[D13] Grupos opcionais de até6criadores por nicho/fuso aproximado, pseudônimos, check-in assíncrono só com missões, sem dinheiro; moderação, saída, exclusão e avisos com silêncio individual.**
   - Pedido: P1 item13; P2 D13; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 7/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Custos de moderação, registros, leitura e avisos ainda não calculados; franquias por plano, tetos automáticos e reserva antes de fornecedor obrigatórios. Nenhuma IA no trial.

17. **[D15] Executar testes reais do Path com NVDA, VoiceOver e TalkBack; registrar evidência e lacunas em docs/accessibility-programme.md, sem confundir axe/Playwright com leitor de tela.**
   - Pedido: P1 item15; P2 D15; datas/horas e grau de certeza em Proveniência.
   - Estado: **aguardando o dono; OR: junto ao plano do item 202, depende de pessoas e aparelhos reais para NVDA, VoiceOver e TalkBack; provas sintéticas não encerram este item**.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Sem fornecedor novo autorizado. Verificar disponibilidade operacional; se execução real depender de dispositivo/pessoa, registrar exatamente quem/o quê e seguir itens independentes.

### D2 — Diferenciais exclusivos (após o Path)

91. **[D2-EU-WITHDRAWAL] Consentimento europeu para entrega digital imediata**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco A, posição 5/8, após 275 [FX1] e antes de 206 [SH3].
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Urgente antes de venda digital a consumidor da UE. Conferir no EUR-Lex a Diretiva2011/83/UE arts.9,14,16 com a redação2019/2161. Consentimento expresso para entrega imediata e reconhecimento da perda do direito, texto versionado e horário guardados, confirmação no e-mail da compra. Atualizar Termos/reembolso/privacidade juntos. Cobrir os checkouts aplicáveis, sem inferir consentimento nem abrir vendas ou declarar conformidade antes de prova.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

92. **[D2-PREORDER-GOAL] Meta de pré-venda com reembolso automático**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 8/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Conferir/reaproveitar lib/preorders.ts. Criador define mínimo de pedidos e data; meta não atingida reembolsa automaticamente pela própria conta Stripe e avisa compradores. Contagem real de pedidos, sem urgência/escassez falsa. Antes de ligar, informar que o Stripe não devolve sua taxa. Orçar reembolsos, avisos, concorrência, retries/idempotência e retenção.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

93. **[D2-VERIFIED-SOCIAL] Prova social calculada e verificável**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 9/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Opt-in desligado por padrão. Números reais da conta Stripe e registros da própria loja: compradores e conclusão de cursos, reembolsos descontados, sem arredondar para cima. Selo Verified by Marktmorgen e página pública de verificação com escopo e data; nunca números editáveis/inventados nem certificação geral implícita.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

94. **[D2-BUYER-TRUST] Cartão de confiança factual para o comprador**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 10/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Sistema calcula política de reembolso, entregas recentes bem-sucedidas, tempo médio de resposta, idade da loja e identidade verificada pelo Stripe, somente quando comprováveis. Nada preenchido manualmente pelo criador como se fosse verificação; privacidade, períodos, amostra/indisponibilidade e custo de leitura precisam de definição.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

95. **[D2-DEMAND-RADAR] Radar mensal do que o público solicita**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 11/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: A partir das perguntas no assistente/chat, perguntas sem resposta, motivos de reembolso e waitlists da própria loja. Sugestão por IA somente quando o criador pedir, paga pela franquia com reserva. Definir consentimento, retenção, agregação e acesso; sem expor compradores ou dados de outra loja.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

96. **[D2-LESSON-DROPOFF] Mapa de abandono das aulas**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 12/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Mostrar em qual aula alunos param, cruzado com reembolsos e sugestões de melhoria. Conferir medição real do servidor e registros existentes, denominadores/janela e privacidade; não apresentar correlação como causa nem inventar conclusão/tempo assistido.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

97. **[D2-OPEN-EXIT] Saída com exportação aberta e redirecionamento por90dias**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 13/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Exportar produtos, arquivos, cursos, lista com consentimento e páginas em formatos abertos com um clique. Redirecionar links da loja90dias após saída, compromisso nos Termos somente depois de implementação/prova/funding. Orçar tamanho, storage/banda, limite de ocorrência e exposição pós-cancelamento antes da promessa; preservar direitos de exportação/exclusão.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

98. **[D2-COMPLIANCE-REVIEW] Checagem factual de conformidade da loja**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco A, posição 6/8, após 275 [FX1] e antes de 206 [SH3].
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Reunir arrependimento do item91, IVA da seçãoC, divulgação FTC automática nos links de afiliado e checagens de alt/contraste/legendas em páginas/arquivos do criador. Mostrar o que falta e como corrigir, com limites de verificação; não dizer AAA/conformidade legal por causa de uma nota ou teste automatizado.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

18. **[E1] Tutor por IA nas aulas, só conteúdo do curso, reaproveitando pool/heldToFacts e encaminhamento ao criador; add-on ou franquia, nunca trial.**
   - Pedido: P2 E1; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 14/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Pool/modelo ainda não dimensionados para esta finalidade; unitário mais caro, franquias/tetos e margens por plano/intervalo antes do código.

19. **[E2] Desafios na comunidade com início/fim, tarefas diárias, check-ins e pontos ligados a lib/community-points.ts.**
   - Pedido: P2 E2; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 15/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Calcular leituras/escritas, retenção e teto dentro das franquias antes de acrescentar custo.

20. **[E3] Criar rascunho de automação por IA a partir do objetivo; revisão humana antes de ligar; franquia de escrita existente.**
   - Pedido: P2 E3; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 16/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Calcular envelope de chamada, contador e hold prévio; não aumentar chamadas por job ou franquia sem análise.

21. **[E4] Coach de conteúdo por IA como add-on: reels/carrosséis/ideias/plano a partir dos próprios produtos/página/respostas; sem ler Instagram inicialmente; nunca trial.**
   - Pedido: P2 E4; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 17/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Preço proposto precisa de aprovação; dimensionar franquia/pool/tetos e60% na leitura mais onerosa mensal/anual antes de implementação que custe.

22. **[E5] Checkout escolhe idioma do navegador entre idiomas já oferecidos pela loja; preços em várias moedas definidos pelo criador, sem conversão automática.**
   - Pedido: P2 E5; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 18/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Conferir suporte atual primeiro; nenhum custo de câmbio permitido.

23. **[E6] Perguntas de telefone e checkbox no checkout.**
   - Pedido: P2 E6; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 19/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Conferir campos existentes; calcular bytes/validação nas franquias atuais, sem custo de fornecedor novo.

24. **[E7] Expiração de acesso a curso em data escolhida pelo criador e pontos por concluir aulas.**
   - Pedido: P2 E7; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 20/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Dimensionar leituras/escritas e recorrência dentro dos tetos antes de código com custo.

25. **[E8] Relatórios personalizados com envio agendado por e-mail dentro da franquia.**
   - Pedido: P2 E8; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 21/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Calcular consulta/agendamento/armazenamento/e-mails; teto e admissão por loja/fornecedor antes do envio.

26. **[E9] Explicações opcionais por IA nas revisões de página e funil, com checagens fixas autoritativas e franquia de IA.**
   - Pedido: P2 E9; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 22/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Orçar envelope, quota e hold antes do modelo; nunca no trial.

27. **[E10] Ações de escrita no MCP criam rascunhos de páginas/e-mails/produtos reutilizando lib/api-write.ts.**
   - Pedido: P2 E10; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 23/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Conferir capacidade e autorização atuais; orçar gravações/bytes nos tetos existentes.

28. **[E11] Edições pagas da newsletter restritas a membros.**
   - Pedido: P2 E11; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 24/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Orçar e-mails, direitos de acesso, registros e custos fiscais por checkout; não abrir vendas.

29. **[E12] Mais lugares na equipe da loja, hoje5, somente se custo quase zero e margem permitir.**
   - Pedido: P2 E12; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 25/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Quantificar pior caso por lugar, RBAC/retencão e tetos; aumento de limite só se ambos intervalos permitirem.

30. **[E13] Aviso ao sair do checkout, sem urgência falsa nem desconto inventado.**
   - Pedido: P2 E13; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 26/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Sem fornecedor novo; demonstrar acessibilidade e ausência de bloqueio/coerção antes de publicar.

31. **[E14] Completar preços por país sem nenhum preço deixar o plano abaixo do piso.**
   - Pedido: P2 E14; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco A, posição 8/8, após 275 [FX1] e antes de 206 [SH3].
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Proposta e conta primeiro; alteração de preço de plano exige aprovação explícita, sem usar preços para fazer teste passar.

### E2 — Novos ganhos rápidos (ordem aprovada P4)

99. **[E2-TAG-BROADCAST] Enviar e-mail a etiqueta ou segmento**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 27/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Conferir lib/broadcasts.ts e seleção atual: etiqueta/segmento além de todos/compradores/leads, sempre dentro da franquia e consentimento.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

100. **[E2-MEMBER-PUBLICATIONS] Posts e edições publicados só para membros**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 28/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Juntar a E11, sem duplicar implementação: blog e /letters restritos a quem tem produto escolhido, com arquivo de edições para membros. Autorização no servidor e retirada de acesso/refundos em todos os caminhos.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

101. **[E2-PUBLICATION-REACTIONS] Comentários e curtidas no blog e nas edições**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 29/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Reaproveitar lib/lesson-comments.ts com moderação, permissões, exclusão e tetos; não publicar contatos ou aumentar atividade fora da franquia.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

102. **[E2-COURSE-COMPLIANCE] Ordem de aulas e90% de vídeo medidos no servidor**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 30/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Conferir o que já existe. Pré-requisitos obrigatórios e regra assistir90% antes de liberar a próxima, sem aceitar afirmação arbitrária do navegador como prova. Considerar acessibilidade e alternativas equivalentes sem certificar presença fictícia.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

103. **[E2-LESSON-MEDIA] Áudio, PDF na aula e blocos de código/HTML**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 31/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Dentro do storage e demais limites existentes; PDF acessível, código legível por teclado/leitor e HTML isolado/sanitizado, sem script/conteúdo perigoso ou capacidade não comprovada.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

104. **[E2-MODULE-PUSH] Push quando um módulo do curso libera**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 32/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Conferir lib/web-push.ts; opt-in/dispositivos, retirada, fuso/silêncio e franquias existentes. Sem push real nos testes.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

105. **[E2-COURSE-AI-DRAFT] Rascunho de aulas e página de venda a partir do esboço**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 33/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: IA somente por pedido do criador, paga pela franquia com hold prévio; revisão humana, fatos próprios, sem ganho/depoimento/escassez inventados, nunca trial.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

106. **[E2-CHECKOUT-EXTRAS] Até10compras adicionais no checkout**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 34/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Hoje informado como3, Teachable10: conferir código. Aumento só com custo e60% nos dois intervalos, preço/total claro, nenhuma caixa pré-marcada e todas as combinações/caminhos fiscais testados.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

107. **[E2-BROADCAST-CONTENT-AB] A/B do conteúdo de envios de e-mail**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 35/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Além das sequências: seleção aleatória, denominadores, contagem factual de visitas/vendas, consentimento de cliques, nunca aberturas/pixels. Todos os envios dentro da franquia.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

108. **[E2-BLOG-RSS-MAIL] Enviar novos posts à lista por RSS**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 36/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Conferir publicações e filas existentes; envios automáticos só com configuração/consentimento, idempotência, limite de polling e franquia de e-mails.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

109. **[E2-EVENTS] Eventos recorrentes, waitlist, ingressos, cupons e presença pública**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 37/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Juntar a F5 ingressos presenciais/QR. Presença pode virar contato somente com consentimento pertinente; conferir recorrência/fuso/cancelamento/reembolso, capacidade real e permissões de publicação.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

110. **[E2-MEMBER-PROFILES] Campos de perfil, etiquetas, grupos de acesso e mapa de membros**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 38/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Conferir perfis atuais; controle do próprio membro, opt-in/localização aproximada, visibilidade, retirada/exclusão e acesso no servidor. Nada de endereço preciso público ou inferência de consentimento.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

111. **[E2-COMMUNITY-AUTOMATION] Gatilhos, webhooks e DM da comunidade**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 39/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Post publicado, membro entrou, presença confirmada e nível alcançado. Resposta automática por DM só autorizada/opt-in, dentro de tetos, sem duplicatas e sem mensagens reais no teste.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

112. **[E2-POINTS] Pontos por posts, comentários e aulas concluídas**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 40/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Juntar a E7 e lib/community-points.ts; níveis e limites definidos pelo criador, fatos válidos do servidor, antirrepetição e reversão pertinente, sem premiar eventos inventados.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

113. **[E2-COMMUNITY-MODERATION] Filtro de palavras e moderação automática de spam**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 41/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Conferir moderação atual; regras/limites, revisão/recursos, falsos positivos e privacidade. IA, se vier a ser proposta, exige pool/reserva/custo próprios e autorização do escopo.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

114. **[E2-AFFILIATE-TAX-FORMS] W-9/W-8BEN e exportação para1099**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco A, posição 7/8, após 275 [FX1] e antes de 206 [SH3].
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Conferir obrigações aplicáveis e implementação antes de construir. Números criptografados, acesso mínimo, gestão de chaves, retenção/exclusão, custo e exportação segura; nenhum documento real ou submissão fiscal nos testes.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

115. **[E2-FOUNDING-MEMBERS] Plano fundador de preço maior nas assinaturas**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 42/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Opção de preço do produto/membro definida pelo criador; não altera preço dos planos Marktmorgen, assinaturas existentes ou cobranças sem escolha. Conferir Stripe, avisos, direitos e custos fiscais.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

32. **[F1] Construtor de páginas mais livre, preservando acessibilidade, desempenho e honestidade.**
   - Pedido: P2 F1; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 43/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Dimensionar payload, storage, renderização e limites antes de expandir envelope.

33. **[F2] Podcast público Apple/Spotify e importação RSS de podcast existente.**
   - Pedido: P2 F2; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 44/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Preço pago mais caro de banda/storage/ingestão; teto de banda por plano, admissão e antes/depois mensal/anual antes de fornecedor.

34. **[F3] Portal individual de mentoria sobre chamadas/tarefas/notas existentes, resumo de sessão por IA medido/cobrado como legendas.**
   - Pedido: P2 F3; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 45/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Orçar direitos, registros e resumo por uso; preço novo em proposta para aprovação, não ativar cobrança.

35. **[F4] Mais idiomas de legenda e dublagem por IA, cobrados por uso, se fornecedor oferecer.**
   - Pedido: P2 F4; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 46/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Verificar capacidade oficial e custo mais caro por minuto/idioma; teto e reserva prévios; não prometer idioma sem prova.

36. **[F5] Ingressos presenciais e check-in por QR code.**
   - Pedido: P2 F5; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 47/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Orçar emissão/validação/offline/retenção/checkout fiscal e admissão antes de custo novo.

37. **[F6] Exportar vendas para Xero e QuickBooks.**
   - Pedido: P2 F6; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 48/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Conferir APIs/aprovações; orçar exportações/filas/retenção/tetos, sem criar conta nem solicitar aprovação.

38. **[F7] Comparar velocidade e uso móvel com ClickFunnels/Kajabi/Hotmart/Stan por medições reais e registrar o que não puder medir.**
   - Pedido: P2 F7; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 49/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Sem alegações comparativas antes de metodologia, ambiente e evidência reproduzível; custo de ferramentas precisa de aprovação se novo.

### F2 — Novos itens maiores (ordem aprovada P4)

116. **[F2-COMMUNITY-CHANNELS] Vários chats, grupos, reações e atualização ao vivo**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 50/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Conferir sala atual de polling5–30segundos. Orçar conexões, mensagens, concorrência, leitura e banda em uso integral; permissões entre grupos, moderação e acessibilidade.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

117. **[F2-COMMUNITY-MAIL] E-mails de resposta/menção e resumo periódico**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 51/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Só para quem optou por receber, dentro da franquia; agregação/fuso/silêncio, supressão/unsubscribe, teto automático, sem novo envio real.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

118. **[F2-READER-REFERRALS] Indicação de leitores/alunos com meses ou produto**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 52/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Recompensa por cupom na conta Stripe do criador, com teto de confirmações e antiabuso/idempotência. Nenhum dinheiro sob custódia do Marktmorgen; custo de e-mails e exposição de recompensa antes de ativar.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

119. **[F2-FREE-RECOMMENDATIONS] Recomendações gratuitas entre lojas**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 53/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Escolha transparente do criador na confirmação de inscrição, sem pagamento, sem inscrição automática em outra lista; versão paga fora do escopo, privacidade/consentimento e teto de leituras.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

120. **[F2-IMPORTS] Imports de Substack, Kit e Teachable**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 54/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Substack/Kit: inscritos e posts; Teachable: aulas, vídeos e provas. Dentro de importação/storage, validação do export real, consentimento, limites por arquivo, preview e isolamento. Teste sintético não é prova de export real.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

121. **[F2-SUBSCRIPTION-GIFTS] Presentes e grupo para assinaturas/membros**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 55/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Conferir suporte atual a pagamento único; orçar direitos recorrentes, cancelamento/reembolso, cobrança e convites com consentimento, sem duplicar lugares ou vender acesso não confirmado.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

122. **[F2-COMMUNITY-AI] Agente de comunidade com resumo/moderação**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 56/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Add-on pago proposto, com reserva antes do modelo, conteúdo da própria comunidade, privacidade/moderação humana, tetos e60% por unidade/intervalo. Preço proposto precisa do dono; nunca trial.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

123. **[F2-COMMUNITY-DIRECTORY] Diretório público e avaliações de comunidades**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 57/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Gratuito e opt-in somente com lojas suficientes, como diretório de afiliados; definir critério/base mínima, moderação, verificação de avaliações, exposição financiada e privacidade.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

124. **[F2-EDIT-SENT-LINKS] Editar destino de links de e-mail enviado**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 58/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Redirecionamento por link, com autorização, destinos seguros, história/retirada, retenção e custo de leitura/alteração. Preservar ausência de tracking de abertura e consentimento de cliques.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

125. **[F2-EMAIL-POLLS] Enquetes por clique em e-mail**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 59/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Consentimento explícito por clique, antiscanner, autenticação/antirrepetição, opção de retirada e privacidade; não inferir voto da mera abertura.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

126. **[F2-MULTIPLE-COMMUNITIES] Mais de uma comunidade por loja**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 60/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Conferir arquitetura atual; isolamento de membros, acessos, cotas, moderação, retenção, custos e sem reduzir direitos/limites existentes.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

39. **[G1] Documentar requisitos Meta para AutoDM, comentários, inbox Instagram/Messenger e WhatsApp; depois código pronto e desligado até aprovação.**
   - Pedido: P2 G1; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 61/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Documentar custo por mensagem/conversa conforme unidade oficial vigente, prazos e franquia/tetos que sustentem margem; nenhuma conta ou pedido de aprovação autorizado.

40. **[G2] Documentar e preparar agendamento de posts Meta/TikTok, desligado até aprovação.**
   - Pedido: P2 G2; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 62/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Calcular postagem/renovação/token/filas/franquia e teto antes de fornecedor; nenhuma solicitação de aprovação.

41. **[G3] Documentar Google Business Profile e preparar resposta a avaliações, desligada até aprovação.**
   - Pedido: P2 G3; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 63/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Calcular quotas, custos, aprovação e armazenamento; não pedir aprovação sem dono.

42. **[G4] Documentar e preparar criação de anúncios dentro do produto, desligada.**
   - Pedido: P2 G4; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 64/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Não criar campanhas, conta ou gasto de anúncio; separar verba do criador e todos os custos/obrigações antes de código.

43. **[G5] Manter PayPal plataforma e links Zoom prontos e desligados; auditar implementação já existente sem refazer.**
   - Pedido: P2 G5; datas/horas e grau de certeza em Proveniência.
   - Estado: **aguardando terceiros (PayPal e Zoom: aprovações; código existente deve continuar desligado, conferir evidência)**.
   - Custo e margem: aguardando terceiros (PayPal/Zoom: aprovação e requisitos externos; nenhuma solicitação autorizada).

44. **[H1] Aplicativo nativo iPhone/Android: App Store/Google Play, venda digital fora do app, anuidades/manutenção; avaliar manter PWA instalável.**
   - Pedido: P2 H1; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 65/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: SOMENTE DOCUMENTO agora. Custos/franquias e margens antes/depois por plano mensal/anual ainda não calculados; qualquer custo desconhecido reprova implementação. Sem conta, contrato ou fornecedor novo.

   - Ampliação P4 de H1: incluir aulas offline no celular (Teachable), como estudo documental, junto da avaliação de app/PWA; sem downloads offline/licenças/armazenamento novo agora.

45. **[H2] Transmissão ao vivo hospedada, preço por minuto e teto automático.**
   - Pedido: P2 H2; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 66/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: SOMENTE DOCUMENTO agora. Custos/franquias e margens antes/depois por plano mensal/anual ainda não calculados; qualquer custo desconhecido reprova implementação. Sem conta, contrato ou fornecedor novo.

   - Ampliação P4 de H2: incluir chamadas gravadas e transmissão própria com gravação e salas paralelas (Skool/Circle/Substack), juntas neste estudo. Continua somente documento; não reabre a implementação excluída em X6.

46. **[H3] Marketplace com produtos de todos os criadores: moderação, consumo e condição de muitas lojas antes de valer.**
   - Pedido: P2 H3; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 67/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: SOMENTE DOCUMENTO agora. Custos/franquias e margens antes/depois por plano mensal/anual ainda não calculados; qualquer custo desconhecido reprova implementação. Sem conta, contrato ou fornecedor novo.

47. **[H4] Compra de domínio dentro do produto.**
   - Pedido: P2 H4; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 68/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: SOMENTE DOCUMENTO agora. Custos/franquias e margens antes/depois por plano mensal/anual ainda não calculados; qualquer custo desconhecido reprova implementação. Sem conta, contrato ou fornecedor novo.

48. **[H5] SMS, ligações e atendente de voz por IA: preços mais caros, registro em operadoras, franquia/teto; nenhum código antes das vendas abrirem.**
   - Pedido: P2 H5; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 69/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: SOMENTE DOCUMENTO agora. Custos/franquias e margens antes/depois por plano mensal/anual ainda não calculados; qualquer custo desconhecido reprova implementação. Sem conta, contrato ou fornecedor novo.

49. **[H6] Compra com dois cartões: efeitos em reembolsos e disputas.**
   - Pedido: P2 H6; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 70/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: SOMENTE DOCUMENTO agora. Custos/franquias e margens antes/depois por plano mensal/anual ainda não calculados; qualquer custo desconhecido reprova implementação. Sem conta, contrato ou fornecedor novo.

127. **[H7-CUSTOM-CSS] Estudo de CSS personalizado, por último em H**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 71/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Somente documento: riscos às regras de design, contraste, foco, legibilidade, injeção/recursos externos, suporte, desempenho e orçamento; nenhuma liberação de CSS agora.
   - Custo e margem: SOMENTE DOCUMENTO. Nenhuma nova operação/conta/fornecedor. Custos futuros e limites ainda precisam do cálculo completo; desconhecido reprova.

50. **[I1] Escrever docs/packaging-vs-competitors.md comparando Store69/Studio449/Scale999 com os preços/fontes fornecidos de Stan/Kajabi/Hotmart/ClickFunnels/HighLevel, recurso por recurso.**
   - Pedido: P2 I1; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 72/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: SOMENTE PROPOSTA. Nenhum preço/pacote/limite/pagamento muda sem aprovação do dono; custo unitário pago mais caro, franquias/tetos e leitura fiscal mais onerosa antes/depois são obrigatórios. Enquanto M0 reprovar, não declarar proposta financeiramente aprovada.

   - Ampliação P4 de I1 (proposta, dados fornecidos em19/10/2026, não cotação própria): Skool HobbyUS$9/mês+10%+30¢ e ProUS$99+2,9%+30¢; Kit grátis até10.000inscritos, CreatorUS$33, ProUS$66, vendas3,5%+30¢; CircleUS$89/199/419 por mês no anual+2%/1%/0,5%; TeachableUS$39/89/189+7,5% no Starter; Substack10% das assinaturas+0,5% recorrente. Incluir domínio próprio no Store como proposta (Circle informado em todos os planos), sem ativar nem alterar preço/pacote. Conferir termos/unidade/cadência antes de comparação pública.

51. **[I2] Propor quantos e-mails Store pode incluir nos intervalos mensal/anual mantendo piso na leitura fiscal vinculante, sem reduzir limite visível.**
   - Pedido: P2 I2; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 73/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: SOMENTE PROPOSTA. Nenhum preço/pacote/limite/pagamento muda sem aprovação do dono; custo unitário pago mais caro, franquias/tetos e leitura fiscal mais onerosa antes/depois são obrigatórios. Enquanto M0 reprovar, não declarar proposta financeiramente aprovada.

   - Ampliação P4 de I2: incorporar a matriz completa da nova entrada89/C2; todo aumento exige60% nos dois intervalos sob a leitura vinculante. Quando depender de preço/pacote, somente proposta ao dono.

52. **[I3] Comparar indicação entre criadores já pronta/pausada (50% em crédito) com20% em dinheiro e propor após conta de margem.**
   - Pedido: P2 I3; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 74/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: SOMENTE PROPOSTA. Nenhum preço/pacote/limite/pagamento muda sem aprovação do dono; custo unitário pago mais caro, franquias/tetos e leitura fiscal mais onerosa antes/depois são obrigatórios. Enquanto M0 reprovar, não declarar proposta financeiramente aprovada.

53. **[J1] Criar matrizes Kajabi/Hotmart/Stan em .md e .json no formato HighLevel, usando levantamento oficial fornecido e conferindo cada capacidade no código; manter ClickFunnels/HighLevel atualizados em cada entrega.**
   - Pedido: P2 J1; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 75/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Documentação/teste; sem custo de fornecedor. Preços externos fornecidos são referência de19/10/2026, não cotação atual garantida.

### J1 — Matrizes adicionais do levantamento P4

128. **[J1-SKOOL] Matriz skool em Markdown e JSON**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 77/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Criar docs/skool-gap-matrix.md e docs/skool-gap-matrix.json, formato compatível com HighLevel; usar os itens/fontes P4, conferir main por capacidade antes de construir e separar existente/testado/publicado/pendente/fora de escopo. Sem tratar preço fornecido, teste sintético ou promessa de fornecedor como prova própria.
   - Custo e margem: Documentação/teste, sem fornecedor novo. Preços externos são pesquisa fornecida de19/10/2026; capacidade futura com custo depende da conta completa e reservas, não da matriz.

129. **[J1-KIT] Matriz kit em Markdown e JSON**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 78/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Criar docs/kit-gap-matrix.md e docs/kit-gap-matrix.json, formato compatível com HighLevel; usar os itens/fontes P4, conferir main por capacidade antes de construir e separar existente/testado/publicado/pendente/fora de escopo. Sem tratar preço fornecido, teste sintético ou promessa de fornecedor como prova própria.
   - Custo e margem: Documentação/teste, sem fornecedor novo. Preços externos são pesquisa fornecida de19/10/2026; capacidade futura com custo depende da conta completa e reservas, não da matriz.

130. **[J1-CIRCLE] Matriz circle em Markdown e JSON**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 79/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Criar docs/circle-gap-matrix.md e docs/circle-gap-matrix.json, formato compatível com HighLevel; usar os itens/fontes P4, conferir main por capacidade antes de construir e separar existente/testado/publicado/pendente/fora de escopo. Sem tratar preço fornecido, teste sintético ou promessa de fornecedor como prova própria.
   - Custo e margem: Documentação/teste, sem fornecedor novo. Preços externos são pesquisa fornecida de19/10/2026; capacidade futura com custo depende da conta completa e reservas, não da matriz.

131. **[J1-TEACHABLE] Matriz teachable em Markdown e JSON**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 80/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Criar docs/teachable-gap-matrix.md e docs/teachable-gap-matrix.json, formato compatível com HighLevel; usar os itens/fontes P4, conferir main por capacidade antes de construir e separar existente/testado/publicado/pendente/fora de escopo. Sem tratar preço fornecido, teste sintético ou promessa de fornecedor como prova própria.
   - Custo e margem: Documentação/teste, sem fornecedor novo. Preços externos são pesquisa fornecida de19/10/2026; capacidade futura com custo depende da conta completa e reservas, não da matriz.

132. **[J1-SUBSTACK] Matriz substack em Markdown e JSON**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 81/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Escopo e prova: Criar docs/substack-gap-matrix.md e docs/substack-gap-matrix.json, formato compatível com HighLevel; usar os itens/fontes P4, conferir main por capacidade antes de construir e separar existente/testado/publicado/pendente/fora de escopo. Sem tratar preço fornecido, teste sintético ou promessa de fornecedor como prova própria.
   - Custo e margem: Documentação/teste, sem fornecedor novo. Preços externos são pesquisa fornecida de19/10/2026; capacidade futura com custo depende da conta completa e reservas, não da matriz.

54. **[J2] Registrar diferenças favoráveis já existentes somente com prova no código: Stripe direto, domínio, lojas/equipe/opções, presentes/equipe/waitlist/pré-venda/avaliações, podcast privado/licenças/PDF/Discord/provas, ofertas/API/Zapier/e-mail/importação/A-B e recursos do plano69. Velocidade comparativa exige metodologia/evidência real.**
   - Pedido: P2 J2; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**. Posição vigente: OR: Bloco B, posição 76/81, após 272 [HM1] e antes das Partes B e C de 274 [AX1]; antes de começar, conferir sobreposição no código, na fila 203–275 e no já publicado; absorção somente com prova, parcial somente pela diferença.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Não repetir números PageSpeed fornecidos como medição própria ou alegar superioridade sem prova.

   - Ampliação P4 de J2: conferir e documentar 0% de comissão da plataforma frente às taxas fornecidas de Substack/Kit/Circle/SkoolHobby/TeachableStarter; conta Stripe/PayPal direta frente ao relato sobre Skool/Teachable;15moedas frente ao relato de dólar no Skool; e-mail sem pixel como vantagem de privacidade; API/webhooks em todos os planos; certificados/5lugares/API na entrada; loja com arquivos/chamadas/afiliados/funis/pausa/oferta antes de cancelar/oferta de volta em torno da comunidade. São hipóteses de comparação a provar, não anúncio de superioridade. Custos do processador e obrigações fiscais continuam existindo, vendas continuam fechadas.

55. **[K1] Validar importação ClickFunnels com exportação real.**
   - Pedido: P2 K1; datas/horas e grau de certeza em Proveniência.
   - Estado: **aguardando o dono (enviar arquivo real exportado do ClickFunnels)**.
   - Custo e margem: Não construir substituto fingindo ser exportação real; testes sintéticos continuam permitidos para regressões existentes.

56. **[K2] Previsão de receita.**
   - Pedido: P2 K2; datas/horas e grau de certeza em Proveniência.
   - Estado: **aguardando terceiros (dados reais suficientes de clientes; não inventar projeções)**.
   - Custo e margem: Nenhuma previsão/alegação de ganho; custo e validade do modelo ainda não aprovados.

57. **[K3-ZAPIER] Submeter app ao review do Zapier somente depois de vendas abertas e autorização explícita.**
   - Pedido: P2 K3; datas/horas e grau de certeza em Proveniência.
   - Estado: **aguardando o dono (abertura de vendas e autorização para submissão)**.
   - Custo e margem: Sem submissão, conta ou mensagem externa agora.

58. **[K3-LANG/PATH14] Tradução do site/Path: adiar item14 anterior; futuro alemão/francês/holandês/espanhol/italiano conforme documento B4, e português do Brasil quando autorizado.**
   - Pedido: P1 item14 adiado por P2 B1/B4/K3; datas/horas e grau de certeza em Proveniência.
   - Estado: **aguardando o dono (vendas abertas e autorização explícita para tradução)**.
   - Custo e margem: Nenhuma tradução em runtime; conteúdo/custo/manutenção devem ser analisados antes de implementar.

59. **[EXCELENCIA] Revisão contínua de todo site/estúdio por área após fila e como critério transversal em cada item: AAA como ponto de partida, teclado, baixa visão, audição, motor, cognição, dispositivos, navegadores e desempenho; referência GOV.UK/Apple; PRs pequenos e evidência em accessibility-programme.** ampliado pelo item 274 [AX1]
   - Pedido: P0; P2 padrão1–11; P3 regra4; datas/horas e grau de certeza em Proveniência.
   - Estado: **absorvido pelo item 274 [AX1]; OR: decisão expressa do dono de 22/10/2026 às 14h45 de Fortaleza; Parte A transversal e Partes B/C após o Bloco B**.
   - Histórico OR — estado anterior à atualização documental: - Estado: **a fazer**.
   - Custo e margem: Sem ferramenta, usuário contratado ou fornecedor novo sem orçamento. Registrar precisamente o que requer pessoas/dispositivos; não alegar AAA/superioridade sem evidência.

60. **[ABERTURA-DONO] Constituir LLC e obter conta Stripe dos EUA; decidir abertura comercial somente depois das demais provas fiscais/comerciais.**
   - Pedido: P2 C2; decisões fiscais anteriores; datas/horas e grau de certeza em Proveniência.
   - Estado: **aguardando o dono (LLC, conta Stripe dos EUA e autorização de abertura)**.
   - Custo e margem: Custos fixos/compliance e base mínima devem permanecer no modelo; nenhuma abertura automática ou aprovação presumida.

61. **[X1] Revenda para agências com marca branca e hospedagem WordPress: produto vende direto ao criador; WordPress usa script de checkout.**
   - Pedido: P2 fora do escopo; datas/horas e grau de certeza em Proveniência.
   - Estado: **cancelado (fora do escopo por decisão explícita do dono)**.
   - Custo e margem: Nenhum custo autorizado; manter motivo nas matrizes, não construir.

62. **[X2] Custódia do dinheiro do comprador, split garantido, garantia de comissão, saldo/cartão próprios e rede paga tipo Amplify.**
   - Pedido: P2 fora do escopo; datas/horas e grau de certeza em Proveniência.
   - Estado: **cancelado (fora do escopo por decisão explícita do dono)**.
   - Custo e margem: Nenhum custo autorizado; manter motivo nas matrizes, não construir.

63. **[X3] Pix, boleto, OXXO e Multibanco: confirmação posterior ao pagamento.**
   - Pedido: P2 fora do escopo; datas/horas e grau de certeza em Proveniência.
   - Estado: **cancelado (fora do escopo por decisão explícita do dono)**.
   - Custo e margem: Nenhum custo autorizado; manter motivo nas matrizes, não construir.

64. **[X4] Conversão automática de moeda: taxa adicional de Stripe.**
   - Pedido: P2 fora do escopo; datas/horas e grau de certeza em Proveniência.
   - Estado: **cancelado (fora do escopo por decisão explícita do dono)**.
   - Custo e margem: Nenhum custo autorizado; manter motivo nas matrizes, não construir.

65. **[X5] Atribuir crédito de afiliado dividido entre vários cliques.**
   - Pedido: P2 fora do escopo; datas/horas e grau de certeza em Proveniência.
   - Estado: **cancelado (fora do escopo por decisão explícita do dono)**.
   - Custo e margem: Nenhum custo autorizado; manter motivo nas matrizes, não construir.

66. **[X6] Sala de vídeo própria para200pessoas com salas paralelas.**
   - Pedido: P2 fora do escopo; datas/horas e grau de certeza em Proveniência.
   - Estado: **cancelado (fora do escopo por decisão explícita do dono)**.
   - Custo e margem: Nenhum custo autorizado; manter motivo nas matrizes, não construir.

67. **[X7] Conformidade HIPAA.**
   - Pedido: P2 fora do escopo; datas/horas e grau de certeza em Proveniência.
   - Estado: **cancelado (fora do escopo por decisão explícita do dono)**.
   - Custo e margem: Nenhum custo autorizado; manter motivo nas matrizes, não construir.

68. **[X8] Gestão de listagens locais.**
   - Pedido: P2 fora do escopo; datas/horas e grau de certeza em Proveniência.
   - Estado: **cancelado (fora do escopo por decisão explícita do dono)**.
   - Custo e margem: Nenhum custo autorizado; manter motivo nas matrizes, não construir.

### X — Acréscimos fora do escopo por P4

133. **[X9-OPEN-ENGAGEMENT] Pontuação por abertura de e-mail**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **cancelado (fora do escopo por decisão explícita do dono)**.
   - Escopo e prova: Excluída por contrariar a política de não rastrear aberturas. Não implementar pixel nem score de abertura.
   - Custo e margem: Nenhum custo/operação autorizado. Preservar a justificativa nas matrizes e os gates legais/comerciais existentes.

134. **[X10-PAID-RECOMMENDATIONS] Rede paga Kit e Growth Boost do Skool**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **cancelado (fora do escopo por decisão explícita do dono)**.
   - Escopo e prova: Excluídos por exigirem custódia/intermediação de dinheiro no modelo recusado. Não confundir com recomendações gratuitas F2.
   - Custo e margem: Nenhum custo/operação autorizado. Preservar a justificativa nas matrizes e os gates legais/comerciais existentes.

135. **[X11-SKOOL-GAMES] Concurso Skool Games**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **cancelado (fora do escopo por decisão explícita do dono)**.
   - Escopo e prova: Fora do escopo por decisão do dono; sem concurso, premiação ou gamificação de ganhos.
   - Custo e margem: Nenhum custo/operação autorizado. Preservar a justificativa nas matrizes e os gates legais/comerciais existentes.

136. **[X12-MOR-PRODUCT] Modelo comercial de vendedor responsável como Skool/Teachable**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **cancelado (fora do escopo por decisão explícita do dono)**.
   - Escopo e prova: Produto de custódia/MoR excluído; isso não é conclusão de isenção legal. IVA/art.9a/marketplace e demais obrigações continuam integralmente na seçãoC, mesmo com cobrança direta/sem segurar dinheiro. Não diminuir imposto nem abrir gates com essa exclusão.
   - Custo e margem: Nenhum custo/operação autorizado. Preservar a justificativa nas matrizes e os gates legais/comerciais existentes.

137. **[X13-SSO-WHITE-LABEL] SSO e marca branca**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **cancelado (fora do escopo por decisão explícita do dono)**.
   - Escopo e prova: Fora do escopo; marca branca para agências já consta de X1 e permanece excluída. Não refazer autorização, identidade ou revenda para simular esses produtos.
   - Custo e margem: Nenhum custo/operação autorizado. Preservar a justificativa nas matrizes e os gates legais/comerciais existentes.

69. **[PATH-FEITO-612] Align Path High Sun documentation and guard the display name**
   - Pedido: P1 itens1–5; P2 A/D; datas/horas e grau de certeza em Proveniência.
   - Estado: **feito (PR #612, mesclado em 19/10, 15:58, horário de Fortaleza)**.
   - Custo e margem: Implementação existente; não refazer. Custos/gates não foram reavaliados neste registro.
   - Evidência: [PR #612](https://github.com/viniciussucupira/marktmorgen/pull/612), commit `d31e7b30f9a4b587ad28cfac736859a44f7ee2c0`.

70. **[PATH-FEITO-613] Path: six post-sale missions from verified store facts**
   - Pedido: P1 itens1–5; P2 A/D; datas/horas e grau de certeza em Proveniência.
   - Estado: **feito (PR #613, mesclado em 19/10, 17:08, horário de Fortaleza)**.
   - Custo e margem: Implementação existente; não refazer. Custos/gates não foram reavaliados neste registro.
   - Evidência: [PR #613](https://github.com/viniciussucupira/marktmorgen/pull/613), commit `17fdabb5d8000179a83085248b00bf0283b55d42`.

71. **[PATH-FEITO-616] Welcome Path owners back with one factual ten-minute step**
   - Pedido: P1 itens1–5; P2 A/D; datas/horas e grau de certeza em Proveniência.
   - Estado: **feito (PR #616, mesclado em 19/10, 17:52, horário de Fortaleza)**.
   - Custo e margem: Implementação existente; não refazer. Custos/gates não foram reavaliados neste registro.
   - Evidência: [PR #616](https://github.com/viniciussucupira/marktmorgen/pull/616), commit `27d72325647b0fee7b083e10dddbea7956d60bb1`.

72. **[PATH-FEITO-617] Add fixed, private-review social post scripts to Path**
   - Pedido: P1 itens1–5; P2 A/D; datas/horas e grau de certeza em Proveniência.
   - Estado: **feito (PR #617, mesclado em 19/10, 18:21, horário de Fortaleza)**.
   - Custo e margem: Implementação existente; não refazer. Custos/gates não foram reavaliados neste registro.
   - Evidência: [PR #617](https://github.com/viniciussucupira/marktmorgen/pull/617), commit `0a8afb8cf73ff9e18d31bde8d91b88591673873e`.

73. **[PATH-FEITO-619] Path: optional paid wording with factual fallback and reserved AI costs**
   - Pedido: P1 itens1–5; P2 A/D; datas/horas e grau de certeza em Proveniência.
   - Estado: **feito (PR #619, mesclado em 19/10, 19:05, horário de Fortaleza)**.
   - Custo e margem: Um job existente, um pedido Haiku de até240tokens/240caracteres, hold monetário antes do provedor, sem trial e sem ampliar envelope/franquias. M0 antes=depois, sem certificação de60% na leitura vinculante.
   - Evidência: [PR #619](https://github.com/viniciussucupira/marktmorgen/pull/619), commit `f2d044c0458d2eeef32a501e114a5c48e79882e3`.

74. **[CLAUDE-614] Announce the site's own pages to IndexNow once each**
   - Pedido: P2 já feito pelo Claude; datas/horas e grau de certeza em Proveniência.
   - Estado: **feito pelo Claude (PR #614, mesclado em 19/10, 18:07, horário de Fortaleza)**.
   - Custo e margem: Implementação existente; não refazer. Custos/gates não foram reavaliados neste registro.
   - Evidência: [PR #614](https://github.com/viniciussucupira/marktmorgen/pull/614), commit `b6b3d18ee96d6099f2940392c60c378ffc67a52b`.

75. **[CLAUDE-615] Build the Marktmorgen app for Zapier on the public API**
   - Pedido: P2 já feito pelo Claude; datas/horas e grau de certeza em Proveniência.
   - Estado: **feito pelo Claude (PR #615, mesclado em 19/10, 17:59, horário de Fortaleza)**.
   - Custo e margem: Implementação existente; não refazer. Custos/gates não foram reavaliados neste registro.
   - Evidência: [PR #615](https://github.com/viniciussucupira/marktmorgen/pull/615), commit `a1e4d9ab15386e24de55bf6cc585f6217e10ea39`.

76. **[CLAUDE-618] Tell creators Alipay and WeChat Pay are not ones to count on yet**
   - Pedido: P2 já feito pelo Claude; datas/horas e grau de certeza em Proveniência.
   - Estado: **feito pelo Claude (PR #618, mesclado em 19/10, 18:42, horário de Fortaleza)**.
   - Custo e margem: Implementação existente; não refazer. Custos/gates não foram reavaliados neste registro.
   - Evidência: [PR #618](https://github.com/viniciussucupira/marktmorgen/pull/618), commit `a040d70756c5d64e756e0cf97e8c23e2284450d0`.

77. **[CLAUDE-BING] Cadastro no Bing Webmaster Tools informado pelo dono.**
   - Pedido: P2 já feito pelo Claude; datas/horas e grau de certeza em Proveniência.
   - Estado: **feito pelo Claude (sem PR informado; cadastro externo relatado pelo dono, não verificado por esta fila)**.
   - Custo e margem: Não refazer cadastro nem criar conta; nenhuma cobrança nova autorizada.


78. **[B2-PUBLIC] Primeira área pública: homepage, preços, missão e ajuda,18fontes revistas**
   - Pedido: P2 B2;19/10/2026, hora original não fornecida.
   - Estado: **feito (PR #623, mesclado em 19/10, 20:10, horário de Fortaleza; publicação confirmada)**.
   - Custo e margem: nenhum novo fornecedor/chamada/registro; envelope existente e M0 antes=depois, leitura vinculante ainda reprova60%.
   - Evidência: [PR #623](https://github.com/viniciussucupira/marktmorgen/pull/623), commit `aa669a9d9198e017c20426b1b2cc83be407eb2be`.

79. **[B2-LEGAL] Área legal e entrada de conta:12fontes e descrição de feedback na privacidade**
   - Pedido: P2 B2;19/10/2026, hora original não fornecida.
   - Estado: **feito (PR #624, mesclado em 19/10, 20:12, horário de Fortaleza; publicação confirmada)**.
   - Custo e margem: nenhum novo fornecedor/chamada/registro; envelope existente e M0 antes=depois, leitura vinculante ainda reprova60%.
   - Evidência: [PR #624](https://github.com/viniciussucupira/marktmorgen/pull/624), commit `437c2779350951f2ed98760df42d9fc43c208f7f`.

80. **[B2-SHARED] Documentos do estúdio e textos compartilhados de Meta/afiliados/recursos**
   - Pedido: P2 B2;19/10/2026, hora original não fornecida.
   - Estado: **feito (PR #625, mesclado em 19/10, 20:15, horário de Fortaleza; entrega45 confirmada, READY20:16:32)**.
   - Custo e margem: nenhum novo fornecedor/chamada/registro; envelope existente e M0 antes=depois, leitura vinculante ainda reprova60%.
   - Evidência: [PR #625](https://github.com/viniciussucupira/marktmorgen/pull/625), commit `9725e09b7198ae2f4f2eeea9f61bc230a30977bd`.

## Fontes do levantamento fornecidas pelo dono

Levantamento informado como feito em fontes oficiais em19/10/2026; não refeito para a criação desta fila. Conferir cada capacidade no código e guardar a prova nas matrizes, sem tratar preço/medição fornecida como medição própria.

Kajabi: https://kajabi.com/pricing ; https://kajabi.com/product/online-courses ; https://kajabi.com/product/communities ; https://kajabi.com/product/podcasts ; https://kajabi.com/product/coaching ; https://kajabi.com/product/backstage ; https://kajabi.com/product/expert-agents ; https://kajabi.com/features/branded-app

Hotmart: https://hotmart.com/en-us ; https://hotmart.com/en/pricing ; https://hotmart.com/en/members-area ; https://hotmart.com/en/affiliates ; https://hotmart.com/en/marketplace ; https://help.hotmart.com/en/article/215828158

Stan: https://stan.store/blog/stan-store-pricing ; https://stan.store/blog/stan-autodm

Comparações e lacunas existentes: [HighLevel](highlevel-gap-matrix.md), [ClickFunnels](clickfunnels-feature-audit.json). GOV.UK/Apple são referências de avaliação, não uma declaração de que Marktmorgen já os supera.

## Evidência e histórico anterior

O ledger operacional de publicações foi mantido na continuidade da conversa até esta fila. As40publicações confirmadas não são quarenta certificações de margem/AAA. Os PRs concluídos da fila Path e os do Claude acima têm metadados de mesclagem lidos do GitHub. PR611 e as correções anteriores de Path/foco/contraste/privacidade permanecem no histórico Git, não são reiniciadas pela fila nova. Uma auditoria de cobertura anterior de125templates/287componentes/312APIs tem lacunas reais por estado/dispositivo; consultar [programa de acessibilidade](accessibility-programme.md) e [inventário](accessibility-inventory.json), sem confundir inventário com aprovação.

Dados privados de criadores nunca são comparados/expostos entre lojas. Missão só fecha por fato próprio lido no servidor; IA nunca decide conclusão. Toda IA é opcional, paga pela franquia com reserva prévia, heldToFacts e fallback; nunca trial. Silêncio21:00–07:59 no fuso salvo e buffer de despacho seguem mayNotify; download/abertura explícitos podem ocorrer a qualquer hora. Sem promessa de ganho, pressão, testemunho falso ou superioridade sem evidência.

PR620: verificações completas do head edfd5c9 passaram (Product39335759627, Redis118344739064, security39335759520); downloads reais de arquivos sintéticos390/1280/teclado/A-AA/privacidade/nenhum POST/isolamento de dono passaram. Mesclado da6924e; publicação ainda precisa de READY, domínio/versão e logs antes da entrega41.

B1: raiz HTML en-US e política de escopo em platform-language-policy.md; sem tradução ou remoção de idiomas escolhidos nas lojas. Auditoria ortográfica exaustiva e guardas B2/B3 ainda não concluídas. PR621 da fila é dependência documental desta branch; não incorporá-la antes de621.

B2 primeira área:18fontes públicas/compartilhadas inspecionadas; ajustes pontuais em homepage/mission/help; cobertura e pendências em us-english-audit.md. Não representa revisão de todo o produto. CI/browser de texto real precisa passar antes da incorporação.

B2 segunda área:12fontes legais/entrada de conta inspecionadas, incluindo privacy/terms/refunds/signin; uma grafia exibida na descrição de feedback de cancelamento corrigida. Preservadas todas as declarações de IA e certificados. Auditoria de estúdio/e-mails ainda pendente; ver us-english-audit.md.

PR624 integra a correção de Pricing do PR623 após os dois testes completos identificarem o mesmo rótulo britânico herdado; preserva a revisão legal, os testes visíveis e o histórico de621/622. Nova verificação completa obrigatória, sem rerun isolado.

B2 próxima área: documentos do estúdio/entrada de conta e16componentes/catálogo de recursos lidos; corrigidos apenas textos exibidos de Meta, afiliação e explicações públicas. Identificadores/statuses legados preservados. Casos reais de navegador ampliados. Produtores de e-mail da plataforma e componentes ainda não revisados seguem em andamento; não antecipar B2 feito.

B2 composição/importação: correções pontuais de check marks/license em instruções do editor, razão de não copiar produto, modelo novo e erro interno, sem reescrever conteúdo já salvo. Verificação de navegador abre seletor real sem salvar ou chamar IA. O B2 completo segue em andamento; fontes restantes/e-mails mistos ainda pendentes.

B3 iniciado em paralelo ao CI da próxima área B2, conforme P3: parser só de desenvolvimento separa prosa exibida de comentários/imports/statuses e não executa código do produto. Fixtures positivas/negativas e varredura do corpus precisam passar; qualquer ocorrência é revisada antes da incorporação. Não declara B2 inteiro concluído. Dependência: integrar PR626 primeiro e manter correções de texto nos PRs de área.


81. **[B2-COMPOSER] Editor de páginas, importação e instruções de novos modelos**
   - Pedido: P2 B2;19/10/2026, hora original não fornecida.
   - Estado: **feito; entrega46 confirmada no domínio**.
   - Evidência: [PR #626](https://github.com/viniciussucupira/marktmorgen/pull/626), commit `c261e2380e6f6579748566be41a0bbee95cb4001`; incorporado19/10/2026 20:29:32 de Fortaleza, produção20:30:23.
   - Validação: Product39340663256/Redis/security39340663211 completos; editor real abre seletor e mostra check marks sem POST;7rotas do domínio com marcador exato; sem error/fatal23:26:43–23:31:43UTC. Escopo parcial B2; nomes técnicos e conteúdo salvo preservados.
   - Custo e margem: Sem chamadas, registros ou mensagens adicionais; M0 antes=depois, leitura mais onerosa ainda reprovada.


82. **[C-UE-RECORD] Recusar datas fiscais impossíveis no registro de tratamentos**
   - Pedido: P2 C-UE; endurecimento encontrado na auditoria de19/10/2026.
   - Estado: **feito; PR #629 incorporado19/10/2026 20:58:47 de Fortaleza, entrega48 confirmada, READY20:59:41, versão d627988**.
   - Verificação: Product39344101984/Redis/security39344102072 completos;7rotas de domínio com marcador exato, sem error/fatal23:55:47.963–00:00:47.963UTC. Data impossível recusada, registros reais vazios e vendas fechadas.
   - Evidência: lib/deemed-supplier.ts e tests/tax-gate.test.ts; não cria registro real nem implementa coleta/retenção/OSS.
   - Custo e margem: Apenas validação local constante do registro existente, sem chamada/registro/mensagem adicional. M0 antes=depois para todos os planos/intervalos; leitura mais onerosa ainda reprovada.


83. **[C-ANSWER-RECORD] Recusar datas impossíveis também nas respostas fiscais registradas**
   - Pedido: P2 C; mesma falha de normalização encontrada na auditoria de19/10/2026.
   - Estado: **feito; PR #630 incorporado19/10/2026 21:20:13 de Fortaleza, entrega49 confirmada, READY21:21:03, versão4af7f4b**.
   - Evidência: lib/tax-gate.ts e tests/tax-gate.test.ts; lista real de respostas continua vazia, sem protocolo, consulta enviada ou hipótese menos onerosa criada.
   - Custo e margem: Validação local limitada, sem chamadas/registros/mensagens adicionais; todos os custos/margens M0 antes=depois, leitura mais onerosa ainda reprovada.


Nota de validação do PR #630: a suíte completa encontrou um teste legado dependente do relógio real às23:59UTC. A regra existente preserva600segundos mínimos, mesmo quando o próximo dia+5min fica mais perto. Fixture agora fixa23:59:37 e testa antes/depois da meia-noite explicitamente; nenhuma espera/limite de produção foi reduzida. Suíte completa no novo head obrigatória.


Correção complementar da fixture #630: a execução integral mostrou que o relógio anterior controlava Date.now, mas a contagem diária também usa new Date() sem argumento. Ambos agora usam a mesma data sintética via Proxy da classe Date; construtores com argumentos, parse e UTC mantidos, Date original restaurada. Os testes de mínimo600segundos não foram reduzidos. Produção intocada; nova suíte integral obrigatória.


84. **[C-UE-TAX-SCOPE] Explicar o escopo dos controles fiscais da conta do criador**
   - Pedido: P2 C-UE; contradição encontrada na auditoria da interface em19/10/2026,21h de Fortaleza (aproximado).
   - Estado: **feito; PR #631 incorporado19/10/2026 21:26:19 de Fortaleza, entrega50 confirmada, READY21:27:13, versão5150f92**.
   - Evidência: components/tax-editor.tsx afirmava de forma absoluta que o criador era quem declarava/pagava; explicar que os controles da conta Stripe não resolvem as obrigações da plataforma, e que coleta/registros de IVA da plataforma ainda não estão construídos. Formulário referencia as explicações; valores/controles/pedidos de gravação preservados. Navegador sintético390/1280, texto real, referências acessíveis e nenhum POST.
   - Custo e margem: Apenas texto/atributos locais: fonte aumenta372caracteres, menos de1KB de conteúdo estático adicional dentro do envelope da página existente; sem leitura/chamada/registro/mensagem extra, sem ampliar limites. M0 antes=depois em todos os planos/intervalos; modelo mais oneroso ainda reprovado. Não é coleta/registro/parecer fiscal concluído.


85. **[C-UE-RETENTION-COST] Auditar prazo e pré-condições de financiamento da retenção fiscal**
   - Pedido: P2 C-UE/custos; auditoria em19/10/2026,21h de Fortaleza (aproximado).
   - Estado: **feito documental; PR #632 incorporado19/10/2026 21:29:03 de Fortaleza; Product39346869385/Redis/security39346869400 completos. Sem incremento de entrega funcional**.
   - Evidência: docs/eu-vat-retention-funding.md; fonte oficial da Comissão:10anos a partir do fim do ano da transação, teto conservador132meses. Preços PAYG oficiais lidos, divisor decimal conservador por unidade GB ainda não comprovada, cópias/limites/correções pendentes. Matriz mensal/anual por plano traz componente ilustrativo e custo total futuro desconhecido/reprovado.
   - Custo e margem: Documento apenas, sem criar operação/registro/agenda/limite. M0 atual antes=depois; não admite retenção nem declara60%. Conta completa/reservas automáticas permanecem obrigatórias antes de dados fiscais reais.


86. **[C-TAX-SAVE-CONFIRMATION] Confirmar os valores fiscais antes de anunciar salvamento**
   - Pedido: auditoria de usabilidade/fiscal autorizada,19/10/2026,21h de Fortaleza (aproximado).
   - Estado: **feito; PR #633 incorporado19/10/2026 21:53:43 de Fortaleza; entrega51 confirmada, READY21:54:36, versão6ae61fc; Product39349329266/Redis/security39349329333 completos**.
   - Evidência: TaxEditor exige HTTP de sucesso, ok booleano e os quatro valores retornados iguais ao pedido. Respostas incompletas, contraditórias ou perdidas deixam resultado desconhecido e orientam recarregar; controles ficam bloqueados durante confirmação. Onze cenários interceptados em390/1280; nenhum POST fiscal alcança o servidor no teste.
   - Custo e margem: Mesmo POST existente, sem fornecedor, armazenamento, mensagem, limite ou franquia adicional. Validação local limitada; M0 antes=depois em todos os planos/intervalos, leitura mais onerosa continua reprovada. Não conclui coleta/retenção fiscal nem abre vendas.


Validação633: primeira suíte integral encontrou apenas seletor de sucesso ambíguo entre a região acessível e sua cópia visual aria-hidden. Teste agora verifica ambas separadamente; casos negativos permanecem sem enfraquecimento. Correção somente de teste, nova suíte integral obrigatória.


87. **[B2-SIGNIN-ACKNOWLEDGMENT] Manter o endereço de acesso coerente com o pedido pendente**
   - Pedido: revisão contínua B2/usabilidade autorizada; achado19/10/2026,21h de Fortaleza (aproximado).
   - Estado: **feito; PR #634 incorporado19/10/2026 21:59:03 de Fortaleza; entrega52 confirmada, READY21:59:55, versão89b757e; Product39349828671/Redis/security39349828561 completos**.
   - Evidência: E-mail bloqueado durante envio; sucesso exige HTTP válido, ok booleano e ausência de erro contraditório. Oito respostas interceptadas em390/1280, endereço, reabertura após erro e cooldown existentes. Nenhum pedido chega ao endpoint de autenticação, nenhuma conta/e-mail real criado.
   - Custo e margem: Mesmo fluxo existente de autenticação, sem novo fornecedor/chamada/dado/teto; validação local constante e335caracteres adicionais de fonte. M0 antes=depois, modelo vinculante ainda reprova60%; PLANS_ON_SALE=false e regras fiscais preservadas.


Validação634: a execução integral antiga terminou com a mesma ambiguidade herdada no teste de633; os oito cenários próprios de acesso passaram em390/1280. Integrada a correção de633 por ancestralidade explícita, sem remover nenhum cenário; nova suíte completa no novo head obrigatória.


88. **[B2-ADDRESS-ACKNOWLEDGMENT] Confirmar endereço retornado e preservar o pedido pendente**
   - Pedido: revisão contínua B2/usabilidade autorizada; achado19/10/2026,21h de Fortaleza (aproximado).
   - Estado: **em andamento; branch codex/address-confirmation; depende explicitamente634; alterações próprias em RenameForm e suíte store-copy, sem editar SignInForm/agreements**. Posição vigente: OR: andamento prioritário preservado, antes de 273 [BK1] e 275 [FX1]; conferir o histórico de publicações e executar somente o remanescente acionável.
   - Histórico OR — estado anterior à atualização documental: - Estado: **em andamento; branch codex/address-confirmation; depende explicitamente634; alterações próprias em RenameForm e suíte store-copy, sem editar SignInForm/agreements**.
   - Evidência: A interface exigirá HTTP válido, ok booleano, ausência de erro e endereço normalizado igual ao solicitado; edição/cancelamento ficam bloqueados durante pedido. Campos passam a poder encolher no celular. Nove respostas interceptadas em390/1280; não renomeia nenhuma loja real. CI integral pendente.
   - Custo e margem: Validação local limitada dentro da página existente; sem chamada, armazenamento, mensagem ou franquia adicional. M0 antes=depois em todos os planos/intervalos, modelo vinculante continua reprovando60%; nenhum gate de vendas/fiscal alterado.


Validação635: execução integral39350012931 terminou com os nove contratos corretos em390/1280, mas oito estados abertos excediam a largura móvel. Formulário era um item flex sem largura limitada; agora ocupa a linha disponível com min-width zero, sem esconder conteúdo. Mantida a reprovação por rolagem lateral e adicionada geometria de diagnóstico; nova suíte integral obrigatória no novo head. Sem incorporação/publicação de635 até passar.


## Fontes adicionais fornecidas em P4 (pesquisa do dono,19/10/2026)

Skool: https://skool.com/pricing ; https://help.skool.com/article/86-subscriptions-faq ; https://help.skool.com/article/183-how-do-points-and-level-work ; https://help.skool.com/article/226-traffic-sources

Kit: https://kit.com/pricing ; https://kit.com/features ; https://help.kit.com/en/articles/4199324-kit-commerce-overview-faqs ; https://help.kit.com/en/articles/7240475-what-is-the-creator-network

Circle: https://circle.so/pricing ; https://circle.so/product-updates ; https://circle.so/payments ; https://circle.so/ai-agents

Teachable: https://teachable.com/pricing ; https://support.teachable.com/en/articles/11682463-course-compliance ; https://support.teachable.com/en/articles/11682550-comparing-teachable-gateways ; https://teachable.com/ai-hub

Substack: https://faq.substack.com/p/how-do-paid-subscriptions-on-substack ; https://on.substack.com/p/what-you-get-when-you-start-a-substack ; https://on.substack.com/p/subscriber-referrals

Direito de arrependimento: pedido de conferir EUR-Lex2011/83/UE arts.9/14/16 e2019/2161 antes da implementação. Nenhuma submissão/conta/mensagem/pagamento real autorizado pela atualização.


Validação636: a execução integral39351663737 terminou com seletor global de alerta ambíguo entre signin-error e o anunciador de rotas do Next. O teste agora procura o alerta dentro do formulário real; nenhuma asserção/cenário ou comportamento de produção foi removido. Novo head exige suíte integral. Atualização documental/teste, sem entrega funcional própria.

Publicação posterior à inserção da fila: item88/PR635 incorporado19/10/2026 22:12:37 de Fortaleza, entrega53 confirmada READY22:13:24, versão4eabb47; Product39351259991/Redis/security39351260069 completos, nove cenários390/1280 com largura correta, sete rotas do domínio exatas e sem error/fatal01:10:20.439–01:15:20.439UTC. O registro original do item88 acima foi preservado no acréscimo P4; esta evidência posterior registra sua conclusão.


Item90/P4: quatro modelos conferidos diretamente em MAIL_TEMPLATES (news/launch/welcome/spotlight) e no editor MailBodyEditor, sem reescrever conteúdo salvo ou enviar e-mail. Limitação pública corrigida para uma coluna, com quatro modelos/blocos disponíveis. Novo teste da página real390/1280 recusa a contradição e qualquer escritaAPI; suíte integral pendente. Fonte aumenta28caracteres, sem nova operação/franquia e M0 inalterado/reprovado. AGENTS/CLAUDE/cross-product-handoff lidos; guia local Next ausente, orientação oficial de Server/Client consultada, sem mudar fronteira ou introduzir import/runtime.


Validação637: a primeira execução integral39351868509/security39351868522 passou, inclusive página real /platform/email390/1280, descrição consistente, largura e nenhuma escritaAPI. Após concluir essa execução, integrada a correção de seletor de636 e sua fila atualizada; nova suíte completa obrigatória no novo head antes da incorporação/publicação.


Item89/C2: docs/plan-capacity-precheck.md deriva preços e36quantidades de seis casos plano/intervalo do código, com12janelas anuais e storage concorrente preservado. No modelo vigente, nem o contrafactual sem custo de uso passa: antes de todo custo não tributário, o teto é16,82% da receita do modelo, abaixo de60%. Contrafactual não é custo grátis nem proposta de cortar franquia. Nenhum máximo é aprovado (não equivale a máximo zero); taxas/fornecedores desconhecidos continuam reprovados. Validação canônica em CI pendente. Sem operação, preço, limite, registro de custo de produção ou gate alterado; revisar unitários pagos mais caros/configuração e I1/I2 permanece a fazer dentro do item89.


### B2 — confirmação de nome e descrição, continuação concreta

- PR638: pré-verificação de capacidade incorporada em19/10/2026 às22:34:17Fortaleza, commit fb14bca710f8809de26aae5ffc4220240a42697e. Product39353034782/Redis/security39353034928 completos passaram. Documentação/testes apenas; não incrementa entregas. Item89 permanece em andamento para cotejo de fontes/configurações; nenhum limite/preço/gate mudou.
- PR637: entrega54 READY em marktmorgen.com, commit50a4a7d59355445ac4d35a37eb7bfa6a5a1d683d, deploy dpl_5kCazfzFsf4zD9aPn9EsTbthpbHr. Product39352607910/Redis/security39352607823 passaram; página real390/1280,8rotas200 com versão exata, texto corrigido servido, sem error/fatal01:28:20.642–01:33:20.642UTC. Texto+28caracteres, sem operação paga nova.
- Estado B2: em andamento, branch codex/details-acknowledgment. Auditoria do editor de nome/descrição: exigir HTTP bem-sucedido, ok booleano, ausência de erro e os dois valores devolvidos iguais ao pedido normalizado pelas regras existentes do servidor. Resposta incerta não prova ausência de gravação. Bloquear campos/cancelamento durante salvamento e impedir salvamento enquanto a sugestão de texto já iniciada aguarda retorno. Preservar conteúdo dos criadores.
- Verificação: doze respostas interceptadas no formulário real em390/1280; nenhum POST de detalhes chega ao servidor, nenhum pedido de IA. Primeiro CI completo39354289467/segurança39354289225 passou. Revisão adicional confere normalização na ordem exata do servidor e recusa nomes herdados de erro como __proto__, com casos adicionais de array/erro desconhecido. Nova verificação completa no novo head pendente.
- Custo: mesmo POST e payload de servidor; apenas confirmação/local UI, sem nova leitura/gravação/provedor/franquia/preço. Fonte cliente cresce menos de1KB. M0 não muda, não certifica60%; PLANS_ON_SALE=false e gates preservados.

- PR640: primeiro head94cccc93b48ad0b0850a35c5ea6c8e052eeb13ca passou Product39354570541/Redis/segurança39354570545 completos, incluindo estados normal/ponteiro/foco nos40pares de temas/predefinições e propriedades de cores. Integração explícita da revisão final do PR639 em seguida; CI completo novamente no novo head. Critério de contraste de texto: https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html; prova restrita ao botão opaco, sem declaração geral de AAA.

### C2 — revisão de premissas por fornecedor, continuação do item89

- Estado: em andamento; branch codex/capacity-provider-assumptions. Relatório docs/plan-capacity-provider-review.md coteja código com fontes oficiais de R2, Blob e Resend lidas em19/10/2026. Não é aprovação de orçamento/configuração real nem proposta para cortar direitos de downloads já comprados.
- Achados: egress R2 gratuito não elimina operações de leitura; fallback de arquivos vendidos para Blob exige envelope próprio, sem reutilizar custo zero de R2. Reserva de upload existente não prova teto de usos posteriores da URL assinada. Classes, regiões/contratos, arredondamento e unidades ainda não verificados como máximo pago. /emails conta destinatários e overage por blocos; não usar apenas preço marginal como custo total.
- Custo: somente documentação, sem chamada/gravação/provedor/franquia/preço/gate de produção. Não incrementa entrega funcional. Item89 e M0 continuam reprovados/não aprovados; CI integral obrigatório da branch antes da incorporação.

### Incorporações e publicações verificadas55–57

- PR639: incorporado19/10/2026 às22:55:18Fortaleza, commitdd6bc839a523d8b28cb0c1e14f7e0c53da27191b. Entrega55, READY22:56:06, deploydpl_46c3fHHG8yWbQFi4DrgjXvNgYYK1; Product39355115740/Redis/segurança39355115737 completos,24casos de nome/descrição390/1280 interceptados,8rotas200/versão exata, sem error/fatal01:51:48.085–01:56:48.085UTC. Nenhuma loja real alterada; mesmo POST, fonte menor que1KB adicional.
- PR640: incorporado19/10/2026 às22:58:07Fortaleza, commitbc0f5bf89156aea3489a05c24a1c9fa1fb46d34c. Entrega56, READY22:59:38, deploydpl_8aKftShWSJsfULrACAKvV6vxZn2v; Product39355405788/Redis/segurança39355405818 completos,40pares de botão normal/ponteiro/foco7:1 e borda3:1, cores salvas preservadas, grade RGB e testes de foco existentes.9rotas200/exato e CSS servido novo, sem error/fatal01:55:27.251–02:00:27.251UTC. Fonte de produção total114caracteres menor, sem nova operação; não certifica AAA geral.
- PR641: relatório de premissas incorporado19/10/2026 às23:01:52Fortaleza, commitba84fc60f22218924715e95093bda73e9205ce53; Product39355538964/Redis/segurança39355538931 completos. Somente documentação, sem incrementar contador. Item89 continua em andamento, configurações/tarifas/tetos não aprovados.
- PR642: incorporado19/10/2026 às23:04:11Fortaleza, commit977b0c00fb52b845c75238d6396585ffd68568c9. Entrega57, READY23:05:08, deploydpl_9ybccusZPuWLVj32ZdHhTbxB3XcY; Product39355867711/Redis/segurança39355867680 completos,24casos da página de outra loja390/1280 interceptados,9rotas200/exato, sem error/fatal02:01:00.346–02:06:00.346UTC. Nenhuma loja/conta criada, sucesso navega à fixture existente; fonte+498caracteres, mesmo POST/limite de cinco lojas.
- As verificações de domínio foram em marktmorgen.com com SHA/alias/READY e marcador exatos antes de cada contador. Rotas privadas anônimas levam ao login; a prova autenticada é sintética. Custos/M0/gates/limites/preços preservados. Estados antigos em notas de preparação são históricos; esta seção registra o resultado posterior, sem apagar os ensaios.

- PR644, ensaio completo39357799943: compilação/regressões anteriores passaram; o navegador não encontrou PauseEditor porque as novas fixtures pagas não tinham período de cobrança válido para a admissão do estúdio. O código de studioView/countStudio/allowanceWindow preserva a recusa de janela desconhecida. Corrigido somente o setup local com paidPeriod() e validação de catálogo/estado/período; diagnóstico limitado de URL/página acrescentado para futuras falhas. Nenhum gate/teto de produção foi reduzido. Nova verificação completa no novo head, sem rerun isolado. A seção S solicitada no anexo524cc7f9 será acrescentada somente depois de concluir este item, preservando números/estados existentes.

- PR644, segundo ensaio completo39359031954: fixture com período válido alcançou o formulário; o teste parou no getByLabel com exact:true porque o label envolve também as opções do select. Seleção corrigida para papel acessível combobox e nome contendo Members may pause for; mesma verificação de valores/pending/erros/sucesso/viewport, nenhum cenário removido. Compilação, tipos, regressões e Redis/segurança passaram; nova execução integral obrigatória do novo head.

### PR644 — conclusão anterior à seção S

- Incorporado19/10/2026 às23:50:49Fortaleza, commitca31becced39e7e15ec7b8ff1746336ba6860861. Entrega59 confirmada em marktmorgen.com, READY19/10 às23:51:47Fortaleza, deploydpl_4jfhChFhdehLkGyF44fLVUDXpdu4; Product39360090491/verify118424006916/Redis118424007302/segurança39360090581 completos.56casos reais de formulário interceptados para ativar/desativar em390/1280;229bundles, lint/tipos/build/regressões/contratos/suíte de navegador verdes.9rotas200 com marcador exato, sem error/fatal02:47:54.198–02:52:54.194UTC. Sem assinatura/cobrança/email real, mesmo POST e gates preservados; M0 igual e ainda reprova60%. Preparações anteriores permanecem no histórico; item141 está concluído por esta evidência, sem reescrever seu estado antigo por pedido P5.

## S — Site de vendas do Marktmorgen (dono, 19/10/2026, 23h de Fortaleza)

Pedido P5: anexo524cc7f9-78af-42b5-ae37-4c05dc91a193/Texto colado.txt, lido19/10/2026 às23:19Fortaleza. O dono informa análise do Claude de dois PDFs Copilot "Blueprint Supremo" contra main977b0c00; PDFs não foram lidos pelo agente, e essa proveniência não equivale a dados concorrentes reconferidos. Após concluir o item atual141/PR644, executar S1–S12 nesta ordem, antes de retomar itens anteriores acionáveis. Os números, estados e conteúdos anteriores ficam preservados; anotações antigas de preparação continuam históricas.

### Regras comuns de S

- Inglês americano correto; descrever apenas capacidades existentes no main conferido antes de cada item. Preservar Claude, conteúdo dos criadores, idiomas de compradores e IDs persistidos. Não atribuir ao Marktmorgen app de loja de aplicativos nem usar a expressão vetada pelo dono.
- CTA principal "Start your store"; demonstração autoatendida em /demo; sem liderança "free"/"Create a free account", marcação de ligação ou Book a demo. USD; sem reais ou argumento de parcelamento.
- Nenhuma prova social, logo, métrica, resultado, urgência ou escassez inventada; sem promessa de receita/ROI ou superioridade sem evidência na própria página.
- Preços e limites próprios de lib/plan.ts/regras reais, nunca cópias manuais. Preços, limites visíveis, número de planos e gates preservados; PLANS_ON_SALE=false. A M0 vinculante continua reprovada, não certificada. Cálculo estático/no navegador não amplia envelope por cliente; novas operações exigem maior custo pago, uso integral mensal/anual por plano, impostos Brasil/EUA, reservas e teto automático antes da operação. Custo fixo de vídeo/banda também exige conta e teto; não instalar vídeo por padrão.
- Fatos concorrentes reconferidos em fonte oficial antes da publicação; fonte e data visíveis. Dados do anexo são ponto de partida do dono, não prova atual. Todas as comparações incluem "Where they are ahead" no mesmo tamanho do texto; taxas de processamento, condições regionais e lacunas não são omitidas.
- Nenhuma imagem repetida, inclusive miniaturas; foto de banco explicitamente não é cliente. Teclado, semântica/leitor de tela, contraste e390px sem overflow, sem declarar conformidade geral de AT/AAA.
- Páginas públicas novas no app/sitemap.ts; preservar IndexNow existente /api/cron/indexnow, sem mecanismo adicional. Testes sintéticos, sem pagamentos/mensagens/contas/submissões externas reais.
- Cada item: PR codex/* com escopo, lacunas, M0 antes/depois e custo; lint/typecheck/testes integrais no novo head. Documento ou PR pendente não é entrega funcional; só contar após READY, SHA e domínio exatos. Não esperar confirmação para o próximo item.

142. **[S1-COMPARISONS] Comparações oficiais e índice público**
   - Estado: **concluído; 15 comparações e índice publicados, entrega69, PR655, 20/10/2026 01:22:54 Fortaleza**.
   - Escopo: lib/site-pages.ts, seção proof, resumo curto, tabela com fontes/datas, citação literal curta apenas se útil, SEO "Marktmorgen vs Kajabi" e descrição "A Kajabi alternative where...", mesmo padrão adaptado aos demais. Índice ligado no menu/rodapé. Ordem: Kajabi, Skool, ClickFunnels, Circle, Kit, Whop, Hotmart, HighLevel; depois Teachable, Substack, Patreon, Linktree, Podia, Thinkific, Systeme.io.
   - Conferir cada lado no main: comissão zero, conta própria Stripe, produtos/cursos/comunidade/email/funis/CRM conforme limites/capacidades reais, sem declarar venda aberta. Não confundir pagamento direto com dispensa das obrigações fiscais de plataforma. Cada concorrente tem vantagens/lacunas verificadas e "Where they are ahead" do mesmo tamanho. ClickFunnels liga para /platform/move-from-clickfunnels e vice-versa, sem duplicar migração.
   - Prova: fontes oficiais datadas e condições de taxas, URLs/SEO/índice/nav/footer/sitemap, teclado/390px/contraste, testes de dados e de páginas reais. Sub-PR por concorrente pode registrar progresso; S1 só fica concluído com os15e índice. Custo: conteúdo estático, sem chamada paga por visita; M0 antes/depois igual se envelope não aumenta.

143. **[S2-PRICING] Página própria /pricing**
   - Estado: **concluído; PR656, entrega70, READY20/10/2026 02:13:44Fortaleza, commit02ea6ed454c405dd01aa4728340f4ce90ad0f753**.
   - Escopo: três planos mensal/anual diretamente de lib/plan.ts, todos os limites das respectivas regras, "0% of each sale" com taxa do processador explicada; assistente e legendas de IA com preços reais, FAQ e espaço integrado para S3. Home#pricing liga /pricing; indexável/sitemap.
   - Prova: preços/limites coincidem com fontes canônicas e gates fechados; navegação/semântica/390px. Custo: renderização estática, M0 igual sem novo envelope; S3 é o próximo incremento, não fingir calculadora pronta.

144. **[S3-TOOLS-CALCULATOR] One plan instead of several tools**
   - Estado: **concluído; entrega71 em produção confirmada, PR657 incorporado20/10/2026 02:39:00Fortaleza**.
   - Escopo: calculadora exclusivamente no navegador dentro de /pricing. Seleção de ferramentas e vendas mensais; assinaturas e comissões oficiais aplicáveis contra plano próprio com comissão zero. lib/competitor-prices.ts único, compartilhado com S1, com fonte/data por preço. Estimativa clara, processamento nos dois lados, sem promessa de resultado; não somar taxas inclusas duas vezes nem tratar taxa por transação como percentual sem quantidade.
   - Prova: preços próprios de lib/plan.ts, dados concorrentes sem fonte/data reprovam; condições/volumes/limites explícitos; entradas inválidas e nenhuma chamada de servidor. Custo: cálculo local, sem novo custo operacional por cálculo; M0 preservada.

145. **[S4-HOME-SALES] Página inicial com módulos reais**
   - Estado: **parcial implementado; capturas aguardando o dono por condição de faturamento não confirmada após mais de1hora; seguir S5**.
   - Escopo: manter "Your store. Your Stripe. Your money." e "See the live demo". Everything in one place: store page, courses, memberships, community, email, calls, funnels and sales pages, checkout, affiliates, CRM, insights, AI writing, Path, cada um com link e capacidade conferidos. Faixa para calculadora S3; capturas reais do estúdio da demo sem dados reais, únicas e com alt. Fecho honesto: um lugar para vender/ensinar/comunidade/email/chamadas, sem promessa de ganhos.
   - Prova: links/recursos/preços verdadeiros, screenshots sintéticos com origem e sem repetição, layout390px/teclado/contraste/performance. Vídeo só com custo fixo/teto aprovado antes; não é requisito para completar o item. M0/custos explicitados.

146. **[S5-PUBLIC-CRM] People, deals and pipelines**
   - Estado: **concluído; entrega73, PR659, incorporado2026-10-20 03:07:39Fortaleza, domínio/READY/versão confirmados**.
   - Escopo: página em lib/feature-pages.ts para capacidades reais de app/studio/deals e people; pipelineLimit e demais limites por plano de lib/crm-rules.ts. "What it does not do": sem SMS, WhatsApp ou telefone. Menu/homeS4/comparaçãoHighLevel ligados; sitemap.
   - Prova: regras por plano e permissões existentes, links, leitura acessível/390px. Custo: página estática, sem operação nova de CRM; M0 igual.

147. **[S6-FEATURE-MECHANISMS] Como cada recurso ajuda a vender ou reter**
   - Estado: **concluído; entrega74, PR660, incorporado2026-10-20 03:11:56Fortaleza, domínio/READY/versão confirmados**.
   - Escopo: bloco curto em cada página de lib/feature-pages.ts explicando mecanismo factual, por exemplo oferta no checkout e menor barreira inicial de assinatura, sem números/percentuais/promessas de resultado. Não afirmar integração/capacidade que não exista no main.
   - Prova: inventário completo de páginas/links, revisão US English, semântica/390px/contraste. Custo: texto estático, sem novo envelope, M0 igual.

148. **[S7-CREATOR-PAGES] Páginas por situação de criador**
   - Estado: **concluído; entrega75, PR661, incorporado2026-10-20 03:17:00Fortaleza, domínio/READY/versão confirmados**.
   - Escopo: course creators, community builders, newsletter writers, consultants and mentors, preservando coaches/cooks/fitness/designers. Padrão existente com ladder e foto única por página; situação descrita, nunca depoimento atribuído. Consultoria: chamadas pagas, pagamentos agendados Stripe, formulários, contratos assinados e lembretes apenas conforme código; sem argumento de parcelamento brasileiro.
   - Prova: capacidades e fontes próprias, imagens únicas/licença/aviso não-cliente, links reais/sitemap/teclado/390px/contraste. Sem novas operações, M0 igual.

149. **[S8-VERIFIED-SOCIAL-REFERENCE] Referência ao93, sem duplicação**
   - Estado: **aguardando o dono; condicionado à abertura comercial válida e primeiro caso real consentido; seguir para S9**.
   - Escopo: executar junto de93/D2-VERIFIED-SOCIAL, não construir segunda solução nem alterar seu estado anterior. Só lojas reais, consentimento escrito, fatos da conta Stripe, situação/ação/resultado medido/data. Até existir caso real, página e faixa ficam ausentes, sem X provisório.
   - Dependências: PLANS_ON_SALE continua false; exige todos os gates fiscais/comerciais/custos, não apenas ato manual de abertura. Nenhum contato ao criador/Stripe real autorizado neste trabalho. Custo de leitura/armazenamento/modelo/tetos reservado no93 antes de operar; desconhecido reprova. M0 não certificada.

150. **[S9-DECISION-BLOG] Posts úteis para decisão**
   - Estado: **concluído; entrega76, PR662, incorporado2026-10-20 03:19:57Fortaleza, domínio/READY/versão confirmados**.
   - Escopo: textos honestos como How much Kajabi costs in2026, Skool fees explained, Kajabi vs Teachable vs Marktmorgen, com fontes oficiais datadas e links para S1. Conferir posts/categorias atuais no main; criar categoria Courses/Community/Email/Sales apenas com primeiro post real.
   - Prova: nenhum dado inventado/desatualizado, condições de preço/taxa e limites visíveis, links/sitemap/SEO/390px/teclado. Custo: posts estáticos, nenhum pedido externo ao leitor; M0 igual. Depois seguir S10–S12 e a fila acionável sem confirmação.

151. **[S10-HOME-PRICING-FAQ] Perguntas factuais na home e /pricing**
   - Pedido: continuação direta do dono, S10–S12; horário exato da mensagem não fornecido, registro de leitura na continuidade.
   - Estado: **implementado e absorvido na versão publicada179; reconciliação documental23/10/2026**. FAQ6questões compartilhadaslib/home-faq.ts/decisionQuestions e lib/pricing-page-data.ts, native disclosures/evidence links. Head65d84a8fa7c3cdd03789684ee6e09de0ce44323f,22/22,verify120309909474 confirma testes reais390/1280 de conteúdo/link/foco/axe/fit e zeroAPIwrites. Publicação179exataREADY/domínio/5rotas comprovada abaixo. Não refazer, não contar entrega nova nem certificarAAA/AT/margem.
   - Histórico preservado antes da reconciliação:    - Estado: **em implementação; PR663, head d61038e passou completo; conflito do histórico da fila resolvido preservando main; nova suíte integral obrigatória**. Posição vigente: OR: andamento prioritário preservado, antes de 273 [BK1] e 275 [FX1]; conferir o histórico de publicações e executar somente o remanescente acionável.
   - Histórico OR — estado anterior à atualização documental: - Estado: **em implementação; PR663, head d61038e passou completo; conflito do histórico da fila resolvido preservando main; nova suíte integral obrigatória**.
   - Escopo: preservar perguntas existentes de lib/home-faq.ts; acrescentar How much does it cost? (lib/plan.ts), Is there a contract? Can I cancel anytime? (termos reais), Can I move from Kajabi, Stan or another platform? (contatos/produtos/compradores conforme importadores e /platform/switching-to-marktmorgen), Does it connect to my other tools? (Zapier/webhooks/API reais e /developers), Is there support, and how? (canal real sem SLA inventado), How long does it take to open a store? (somente passos/tempo demonstráveis, sem promessa).
   - Prova: conferir código/main e páginas antes de responder; preços sem duplicação, links, FAQ acessível,390px, lint/tipos/testes integrais. Custo/M0 antes/depois: texto e links no envelope existente; nova chamada/email/IA/banda exige registry/spend-floor, maior custo pago, impostos e teto automático antes. A leitura vinculante continua reprovada, não certificada; vendas fechadas.

152. **[S11-HOME-CTAS] Ações ao longo da home**
   - Pedido: mesma continuação direta S10–S12.
   - Estado: **implementado e absorvido na versão publicada179; reconciliação documental23/10/2026**. Cinco paresHomeActions emapp/page.tsx, Start your store /signin e See the live demo /demo, navegação por teclado e sem gravação. Head65d84a8fa7c3cdd03789684ee6e09de0ce44323f,22/22,verify120309909474 confirma testes reais390/1280 de conteúdo/link/foco/axe/fit e zeroAPIwrites. Publicação179exataREADY/domínio/5rotas comprovada abaixo. Não refazer, não contar entrega nova nem certificarAAA/AT/margem.
   - Histórico preservado antes da reconciliação:    - Estado: **em implementação; PR664/head e91c584 passou integral; integração explícita do pai atual exige novo CI completo**. Posição vigente: OR: andamento prioritário preservado, antes de 273 [BK1] e 275 [FX1]; conferir o histórico de publicações e executar somente o remanescente acionável.
   - Histórico OR — estado anterior à atualização documental: - Estado: **em implementação; PR664/head e91c584 passou integral; integração explícita do pai atual exige novo CI completo**.
   - Escopo: a cada uma ou duas seções, botão Start your store e segunda opção See the live demo, com destinos existentes e nomes consistentes. Sem free no CTA, Talk to an expert ou Book a demo; sem pop-up/urgência.
   - Prova: sequência real de seções, links, foco/teclado, nomes acessíveis e390px sem overflow. Sem telemetria/chamada/custo novo por inserir botões; registrar M0 antes/depois, não mudar preço/limite/gate nem afirmar60% fiscal comprovado.

153. **[S12-HOME-PATH] Jornada factual do Marktmorgen Path na home**
   - Pedido: mesma continuação direta S10–S12.
   - Estado: **implementado e absorvido na versão publicada179; reconciliação documental23/10/2026**. PATH_HOME_STEPS emlib/path-home.ts deriva sete missões reais de dayMissions, distingue What you do/What Marktmorgen checks, sem promessa de venda ou prova de entrega inexistente. Head65d84a8fa7c3cdd03789684ee6e09de0ce44323f,22/22,verify120309909474 confirma testes reais390/1280 de conteúdo/link/foco/axe/fit e zeroAPIwrites. Publicação179exataREADY/domínio/5rotas comprovada abaixo. Não refazer, não contar entrega nova nem certificarAAA/AT/margem.
   - Histórico preservado antes da reconciliação:    - Estado: **em implementação; PR665/head7c77a6b passou integral; integração explícita do pai atual exige novo CI completo**. Posição vigente: OR: andamento prioritário preservado, antes de 273 [BK1] e 275 [FX1]; conferir o histórico de publicações e executar somente o remanescente acionável.
   - Histórico OR — estado anterior à atualização documental: - Estado: **em implementação; PR665/head7c77a6b passou integral; integração explícita do pai atual exige novo CI completo**.
   - Escopo: seção com passos reais e nomes do código atual, ligada a /platform/path. Cada passo distingue o que o criador faz e o que o produto faz por ele. Não prometer resultado, scale your business, conclusão por clique ou função ausente.
   - Prova: passos/nomes/estados conferidos no main, narrativa US English, link/teclado/390px/contraste, lint/tipos/testes integrais. Texto estático sem novo fato consultado em servidor; eventual operação nova só com conta/teto prévios. M0 antes/depois registrada; piso obrigatório60% não é certificação do modelo atual, vendas continuam fechadas.

### S1 — primeiro incremento: Kajabi e índice

- Base explícita: PR645/head5a69f922aa47e916d0e617da2ee1196d5d55630c, após644publicado59. Main conferido antes da construção: ca31becced39e7e15ec7b8ff1746336ba6860861. Os141itens anteriores permanecem intactos; somente o novo142passa a em andamento.
- Implementação: /proof/kajabi e /proof/comparisons no catálogo de proof existente, índice no menu/rodapé, SEO por página e inclusão automática pelo PAGES do sitemap existente. lib/competitor-prices.ts guarda preços USD e fontes/datas, sem chamada ao leitor. Fontes oficiais Kajabi pricing/standardtrial/brandedapp lidas19/10/2026; não confundir tarifas regionais/gateway com taxa universal nem anúncio anual com cobrança mensal.
- Honestidade: vantagens Kajabi de email e apps com o mesmo corpo de texto, planos próprios/limites de suas regras, comissão do código, gates fechados. Não repetir a lacuna antiga de Zoom: já existe automação de reuniões no main, com disponibilidade condicionada. Nenhuma alegação de dispensa fiscal por pagamento direto.
- Prova adicionada: integridade de fontes/datas/preços, dados próprios canônicos e sitemap; páginas reais390/1280, fontes/SEO/índice, tamanho igual de texto, axe/viewport e ação de teclado, sem APIwrite. CI completo pendente; não é entrega contada.
- Custo/M0 antes/depois: conteúdo pré-renderizável em mecanismo existente, nenhum endpoint/provedor/email/IA/storagewrite novo, nenhuma ampliação de teto/plano; navigation cliente cresce cerca de185caracteres. Preços/franquias/gates preservados. A M0 vinculante permanece12,02–12,21% (reprovação, não60%certificado); não abrir vendas. Restam14concorrentes para concluirS1, na ordem do dono.

### S1 — segundo incremento: Skool

- Branch codex/skool-comparison parte explicitamente do head287245b680502bb5637a1ae6f17124ada8870170 do PR646, sem editar sua branch durante CI. PR645já incorporado em20/10/2026 às00:03:10Fortaleza,9032b652e022448ccfc2be4c70958e0545e7eb8c; Product39361390807/Redis118428150300/segurança39361390858 completos, documentação sem contador funcional.
- /proof/skool e índice atualizado, com fontes oficiais reconferidas20/10/2026. Diferenciar mensalidade e taxa de pagamento; Growth Boost30% adicional/recorrente de membros atribuídos não é omitido. FAQ oficial deixa a faixa exata deUS$900ambígua: registrar a lacuna, sem inventar cálculo. Preço anual não verificado fica null, nunca zero; nenhum número deduzido vira cobrança oficial.
- Vantagens factuais: descoberta com critérios, chamada nativa e webinarPro; sem promessa de distribuição, capacidade10milnão verificada ou taxa fiscal universal. Pagamento direto próprio não dispensa dever fiscal; vendas permanecem fechadas.
- Prova: fontes/datas e nulidade de preço desconhecido, sincronização de preços próprios, sitemap/index; suite real390/1280 estendida sem remover Kajabi/índice, tamanho de letra, axe/overflow e teclado. CI integral pendente. S1 segue em andamento,13concorrentes restantes.
- Custo/M0: conteúdo estático sobre infraestrutura existente, sem nova chamada/provedor/email/IA/gravação de produção e sem mudar cotas/preços/gates. Nenhum JS cliente novo além do índice já existente; M0 antes/depois igual,12,02–12,21%vinculante continua reprovação; não declarar60%após impostos como comprovado.

- PR647, primeiro CI39362397939: lint/tipos/build/Redis/segurança39362398080 e todo conteúdo/links/teclado de Kajabi/Skool passaram. Falha única: color-contrast no aviso do índice390px, medido durante a transição de opacity650ms após scroll. O teste agora espera cada seção atingir opacity1 antes da leitura de contraste normal; mantém as mesmas regras axe, todos os nós e cenários. Nenhuma cor/gate/limite de produção foi alterado ou teste de contraste removido; nova verificação integral do head corrigido.

### S1 — terceiro incremento: ClickFunnels

- Branch codex/clickfunnels-comparison parte explicitamente do PR647/head086d91445c43a7fbeccc2d76d19ee2eb44c8a223. Nenhuma edição concorrente das branches646/647. PR646incorporado20/10/2026 às00:10:03Fortaleza,133cadd7f6201d5784bffc809b114b1ce255588f; Product39361865716/Redis118429656923/segurança39361865784 completos. Publicação funcional só após domínio/versão READY, sem antecipar contador.
- Página /proof/clickfunnels, índice e ligação nas duas direções com /platform/move-from-clickfunnels, cujo guia/limites/blocos originais ficam intactos; só acrescentada referência ao final. Nenhum segundo importador ou guia duplicado.
- Fontes oficiais20/10: pricing help atualizado12/10confirma97/197/297mensais,970/1970/2970anuais,Dominate5997anual semcompra mensal. Processador cobra seus serviços; ClickFunnels não adiciona taxa de Stripe. Page split-test oficial permite uma variante por etapa, diferente da afirmação multivariante do levantamento do dono; não a repetir. Testes de página inteira existem dos dois lados; não anunciar isso como lacuna própria. Vantagens descritas somente em editor/templates, franquia de email e disponibilidade paga, sem promessa de resultado. Teste próprio foi conferido em headline-test-rules/sales-page.
- Provas novas: cobrança anual-only com null mensal, preços próprios e links recíprocos/sitemap; navegador390/1280 estende comparação sem remover anteriores. CI completo obrigatório no headfinal. S1 segue em andamento,12concorrentes por fazer.
- Custo/M0 antes/depois: conteúdo estático, referência de migração sem executá-la, nenhum provedor/API/email/IA/write novo, sem ampliar teto. Preços/limites/gates preservados;12,02–12,21%na leitura fiscal vinculante segue reprovação, nunca60%certificado. Vendas fechadas.

- Publicação60 do PR646 confirmada: READY dpl_6cn3mkhXZhNjVrB8WH9XFGcd23mZ em20/10/2026 às00:11:00Fortaleza, SHA133cadd7f6201d5784bffc809b114b1ce255588f e alias marktmorgen.com,11rotas200/marcadorexato, conteúdo de Kajabi/índice conferido, sem error/fatal03:07:21.119–03:12:21.119UTC. Só então contador59→60. S1continua em andamento.


### S1 — quarto incremento: Circle

- Continuação da ordem aprovada, em branch codex/circle-comparison sobre o head explícito7ba32f42d453331dc42a1e44fb36eb9b11674725 do PR648 enquanto647/648terminam CI; nenhuma edição concorrente dessas branches. Main consultado133cadd7f6201d5784bffc809b114b1ce255588f. S1continua em andamento, nenhum item anterior renumerado.
- Fontes oficiais Circle pricing, paywall transaction fees, live overview e messaging lidas20/10/2026. A página pública apresenta89/199/419USD como equivalentes mensais anuais; cobranças mensais e fatura anual exata não verificadas permanecemnull, não0 nem multiplicação de valor possivelmente arredondado. Pluscotação. Taxas2/1/1/.5 e Stripe/Billingseparadas.
- Preservação Claude: community-chat.ts e community-dm.ts já implementam sala com consultas periódicas e mensagens privadas textuais; não alegar ausência de chat. Diferenças comprovadas Circle: grupos/multimídia, live/recordingnativo, appscomuns/Plusbranded. Nenhuma implementação nova nesses módulos.
- Página/proof/circle no catálogo/sitemap existente, linknoíndice, título/descrição próprios, fontesdatadas, vantagens do concorrente mesmo tamanho, CTAexistente epaidclosed. Dadoscentraisdistinguem annualEquivalentMonthlyCents de annualCents. Testes de unknowns/canonicalprices/sitemap e navegador390/1280/axe/teclado/nãoescrita adicionados à suiteintegra.
- M0 antes/depois: mesmo envelope estático e distribuição existentes; sem dependência/endpoint/chamada ao provedor/email/IA/storagewrite/telemetria nova; nenhum aumento de franquia/preço/limite/gate. A leitura fiscal vinculante continua12,02–12,21%, reprovada contra60%, não certificada; PLANS_ON_SALE=false. Não contar PR/documento como entrega; aguardar suitecompleta+READY/domínio/SHA.


### S1 — prova final Skool, entrega61

- PR647head086d91445c43a7fbeccc2d76d19ee2eb44c8a223 passou suiteintegra39363385353(verify118434486655/Redis118434486450) e segurança39363385355. Incorporado20/10/2026 00:24:46Fortaleza, merge5ecc38e4dd633140d23928c3408f935fdf4205a1.
- Produçãodpl_6Mhqwxg6vP7LxXsno8FGiDjiWaewREADY20/10/2026 00:25:34Fortaleza, SHAexato/domainaliasmarktmorgen.com. Dozerotas200commarcador deploymentexato; título/source/paidclosed/índiceSkoolconfirmados. Semerror/fatal03:21:41.050–03:26:41.050UTC. Contador60→61apósprova, próximo62.
- Falhainicialdecontrastepegouopacidadetransitória; headcorrigidoaguardacada seção totalmente pintada, semsuprimiraxe. M0igual/reprovada, vendasfechadas. S1segundode15, aindaemandamento.

### S1 — quinto incremento: Kit

- Branchcodex/kit-comparison encadeada no head6498ae6fb16e0bc039d205f2cb0409fbc8d9e7c6805 enquanto648/649rodam, main5ecc38e4dd633140d23928c3408f935fdf4205a1conferido. Nenhuma edição da mesma branch em paralelo.
- Fontes oficiais Kit pricing/recommendations/newsletter-sponsorships lidas20/10/2026. Preço pagoescopo1000subscribers; Creator390USDano exato, Pro66equivalentemensalanual e593primeiroanopromocional. Renovaçãoanualexata/mensaispagos nãoverificadosnull; nãoinventarrecorrênciado desconto. Free0real. Commerce3,5%+.30incluiprocessamento, parcelaKit.6% não é taxaextra.
- Preserva email existenteClaude: templates, sequências, IF/ELSEeações existem; nãoinventarlacuna. Diferençaprova: teste própriocorposnão, apenasassunto; KitProcorpo, recomendações/patrocínios. Capacidadedesubscritoresnãoéfranquiadeenvios.
- Provasadicionadas: fontes/datas/unknowns/inclusivefee/canonicalownpricing/email/sitemap, navegadorreal390/1280metadados/axe/textoequivalente/teclado/noAPIwrites; suitecompletanonovoheadnecessária.
- M0antes/depois: mesmoenvelopeestático, nenhumanovadependência/endpoint/provedor/email/IA/storagewrite/telemetria, nenhumlimite/preço/gateafrouxado. Leituralíquidaonerosa12,02–12,21%continuareprovadaante60%,não certificada;PLANS_ON_SALE=false. NãocontarPRpendentecomofuncional.


### S1 — prova final ClickFunnels, entrega62

- PR648head7ba32f42d453331dc42a1e44fb36eb9b11674725 passou Product39363480658(verify118434795621/Redis118434795794) e segurança39363480625completos. Incorporado20/10/2026 00:29:05Fortaleza, mergebef945b72b5342f1e49e8e8c1994d5856f5e894f.
- Produçãodpl_EkDzsET2Vu5P4L5UsyG1whxtKEQcREADY00:30:04Fortaleza, SHAexato/aliasmarktmorgen.com.14rotas200marcadordeploymentexato; título/source/paidclosedCF e ambas ligações guiaexistentecomparação confirmadas. Semerror/fatal03:26:10.480–03:31:10.480UTC. Contador61→62apósprova, próximo63. S1terceirode15, nãofinalizado.
- Preservados variantesdepáginainteiraClaude e guiaimportador, semafirmarlacunahHeadline-only. M0igualreprovada;vendasfechadas.

### S1 — sexto incremento: Whop

- Branchcodex/whop-comparison sobreheade375c28284fc0d57b8107b3051d098a5b989b86f(PR650) enquanto649/650terminamCI. Mainbef945b72b5342f1e49e8e8c1994d5856f5e894fconsultado;nenhumaediçãoconcorrentedessasbranches.
- FontesoficiaisWhopnetwork/pricing e Discover lidas20/10/2026. Standardsemassinaturamensal; cartão doméstico2,7%+.30, internacional+1,5%,FX+1%, orchestration.8/Billing.5/taxremit2condicionais, tudohabilitado6%+.30antesextras. NãoimporStripeoutra veznemusar3%antigo. Parcelaespecíficaplataforma inconnunull,nãozero; nãoinventartrial.
- PayoutACH2.50/instant4%+2.50distintosdecadacompra, diretóriorealsemgarantiadetráfego; semalegarisençãofiscaluniversalouMoRcertificado. App-getredirectretornouhome; nãousadocomoprovanativastorelisting.
- Dadosestáticoscomfontesdatadas, /proof/whop/índice/sitemapexistente, vantagensmesmocorpo, testesfeescondicionais/null/canonicalownpricinge390/1280metadados/axe/teclado/noAPIwrites. Suiteintegralnovohadantesdeincorporar.
- M0antes/depois: envelopeestáticoexistente, semnovaoperação/endpoint/dependência/provedor/email/IA/storagewrite/telemetria; preços/limites/gatesiguais. M0onerosa12,02–12,21%falha60%,não certificada; PLANS_ON_SALE=false. Não contarpendente/documentocomoentrega.


### S1 — sétimo incremento: Hotmart

- Branchcodex/hotmart-comparison sobreheadd2282fa36d7c0eb4121cb405398c07238101ced9PR651 enquanto pais649/650/651rodam. Mainbef945b72b5342f1e49e8e8c1994d5856f5e894fconsultado;sem edição concorrente dospais.
- Fontesoficiaispricing, política inglesa21/09/2026 e artigoatualizadofees lidas20/10/2026. USDcompra+comissão:acima15USD9,9%+1.00,até15USD9,9%+.10. Não usar .50antigo: restafraseconflitanteartigo, mas tabelaatual/FAQPlayer/políticaexplicam1.00desde21/09. Não somarPlayerlegado. MoR/isencãouniversalnãoprometidos; entidadelocal/produto/residênciaafetamimpostos.
- Assinaturamensal/anual0comprovadapricing, nãohátrialinventado. Appcomprador/offlineeafiliadossãofunçõesdocumentadas; nãoprometer tráfego. Própriospreços/taxascanônicos/gatespreservados. Fontescontasdatadas, sitemapviaPAGESexistente, vantagensmesmocorpoe390/1280axe/teclado/metadata/noAPIwrites; testesnovosbandas/conflito/Player/nopaymenttrial.
- M0antes/depois: mesmoenvelopeestático;semnovaoperação/dependência/endpoint/provedor/email/IA/storagewrite/telemetria, sem franquia/preço/gatealterado. Leituraonerosa12,02–12,21%reprovadaante60%;vendasfechadasPLANS_ON_SALE=false. Exige CI completo finalhead/READY/domínio/SHAantesdecontar/publicar.


### S1 — oitavo incremento: HighLevel

- Branchcodex/highlevel-comparison sobreheada7c17e0b9afdc1d08123057aea2eee963627e3bePR652, main7d8fff4e79982eb5eac6d49b831562758b992786consultado. Pais650/651/652CI e649aguardaprovaprodução; nãocontarincorporaçãosemREADY/domínio/SHA.
- Pricing/guideoficiaisHighLevellidos20/10/2026:97/297/497USDmês;970/2970/4970anoexatos. Starter3subaccounts, Unlimited/Prosemcapdecontasnãoequivaleconsumográtis. Telefone/SMS/email/IAusageextra, SaaSModePro. Taxauniversalpagamentonãoverificadanull.
- CRMprópriojapossui campos/deals/pipelines/IFELSEClaude, fonte lib/crm-rules.tsconsultada. Texto delimitedpipelines usa pipelineLimitWords canônico, nãonúmeroendurado. Nãoequivalerlojaasubaccount,nãoprometernativoSMS/WhatsApp/voz,SocialourevendaSaaS.
- Página/índice/sitemap,fontesdatadas,custosexplícitos, vantagensmesmocorpoe390/1280axe/metadata/teclado/noAPIwrites. TestesCRMcapscanonical/unknownfees/subscriptions e suitecompletanofinalheadobrigatórios.
- M0antes/depois: mesmomecanismoestático; nenhumnovocanal/operação/provedor/email/IA/storagewrite/dependência/telemetria. Nenhumapreço/franquia/gatealterado; M0onerosa12,02–12,21%continuafalha60%,nãocertificada; PLANS_ON_SALE=false. PáginaCRMdedicadaS5permaneceposterior, nãofingirconclusãoduplicada.


### S1 — prova final Circle, entrega63

- PR649head8ae6fb16e0bc039d205f2cb0409fbc8d9e7c6805 passou Product39364211790(verify118437145001/Redis118437145249) e segurança39364211735completos. Incorporado20/10/2026 00:36:23Fortaleza, merge7d8fff4e79982eb5eac6d49b831562758b992786.
- Produçãodpl_Ago96HJXiMNMYP1NEDHYyMWU2pEZREADY00:37:10Fortaleza,SHAexato/aliasmarktmorgen.com,14rotas200marcadordeploymentexato, Circletitle/source/paidclosed/índiceconfirmados. Semerror/fatal03:33:32.279–03:38:32.279UTC. Contador62→63apósprova, próximo64.
- ChatClaudeexistente preservado, preçosmensais/faturaanualnãoverificadosnullseparadosequivalenteanual. M0igualfalha/vendasfechadas. S1quartode15emandamento.

### S1 — nono incremento: Teachable

- Branchcodex/teachable-comparison sobrehead3f64290b0407cc29fcfae2753cbd68ca97e64b95PR653;main7d8fff4e79982eb5eac6d49b831562758b992786consultado. Pais650/651/652/653emCI,nãoeditaressasbranchesemparalelo.
- Fontesoficiaispricing/feesbundleslidas20/10/2026:mensais39/89/189USD, equivalentesanuais29/69/139semfaturaanualexatainventada; feesStarter7,5%,Builder/Growth0%separadosprocessing/bundles. Trial7dias, catálogos5/10/50atuais, não1antigo. OwnMAX_PRODUCTS/planpricescanônicos,limitesupload/storage/deliverycontinuam.
- Preservacursos/quizzes/certificadosClaude,nãoinventarlacuna. Appsalunos/Custommigrationassistancedocumentadoscomescopo,semserviçofictíciopróprio. Página/índice/sitemap,fontesdatadas, vantagensmesmocorpo e testespreços/caps/unknownfee/390/1280axe/keyboard/noAPIwrites, suiteintegralnovofinalhead.
- M0antes/depois: mesmoenvelopeestático;semnovaoperação/dependência/endpoint/provedor/email/IA/storagewrite/telemetria,nenhumpreço/limite/gatealterado. M0onerosa12,02–12,21%falha60%,não certificada;vendasfechadasPLANS_ON_SALE=false. PublicaçãosóapósCIcompleto+READY/domínio/versão.


### S1 — Kit publicado, entrega 64

- PR650, head e375c28284fc0d57b8107b3051d098a5b989b86f: Product 39364559256 (verify 118438288415, Redis 118438288188) e segurança 39364559252 completos e verdes.
- Incorporado em 20/10/2026 às 00:41:26 de Fortaleza; merge badadc90a80c1f47ad9655ecd8ec532d9a3d836c. Produção dpl_25xJBAkdXcWyik5NCnQZTt538kzU READY às 00:43:02, com SHA exato e alias marktmorgen.com.
- Quinze rotas responderam 200 com marcador exato dessa implantação; título, fonte, fechamento das vendas e link do índice de Kit confirmados. Sem error/fatal entre 03:39:55.529 e 03:44:55.529 UTC. Contador 63→64 somente após essa prova; próxima entrega 65.
- Preço promocional não tratado como renovação; taxa inclusiva sem processamento duplicado. M0 permanece reprovada contra o mínimo de 60%; vendas fechadas. S1: quinto de quinze, ainda em andamento.

### S1 — correção de espera do navegador Whop

- Primeirohead651d2282fa36d7c0eb4121cb405398c07238101ced9 falhouverify118439360770noProduct39364893214. Lint/regressões/tipos/build/acordos/Redispassaram; testeparouemgoto/proof/kajabi(legado)aguardandonetworkidle60s, apóspassaríndice390axe/keyboard. NãoéprovadefalhaWhopnemlicençaparaapagarassert.
- Corrigir esperadenavegação de páginaspúblicas para domcontentloaded+H1realvisível. Todasfontes/títulos/descrições/paidclosed/vantagens/axe/overflow/teclado/noAPIwrites eesperadepinturapermanecem. Não aumentar timeout, não suprimiraxe/rota/erros. Suitecompletanovofinalheadobrigatória; semrerunisolado. Propagarfixaosdescendentesapósruncompletoatualdeterminar, antesdeincorporar.
- Nenhummudançaprodução/custo/preço/limite/gate;M0igualreprovada60,vendasfechadas.

- Propagação no PR654: depois de o Product39365615875/verify118441669129 terminar, incorporar pai653corrigido571ce044150735da5e833fedcee4e21a75cf3176 com ambos os pais, preservando todas as páginas e provas. Log confirmou timeout de60segundos aguardando networkidle em /proof/kit depois de as páginas anteriores passarem; novo CI completo obrigatório no head corrigido, sem concluir por rerun isolado.


### S1 — seis comparações finais em um incremento

- Base: head corrigido 27030ea4ee2144c73b60cd8964fb43b52e033211 do PR654. A correção de espera dos pais651–653 permanece; nenhum job isolado ou head anterior certifica este conjunto.
- Ordem preservada no índice: Substack, Patreon, Linktree, Podia, Thinkific e Systeme.io depois das nove anteriores. Cada página tem SEO próprio, tabela, vantagens com o mesmo corpo, fontes oficiais lidas em20/10/2026, limites e CTA existente. Módulo estático compartilha a estrutura e lê preços próprios canônicos.
- Substack: share10%, Stripe e Billing separados, recorteUS e diferenças iOS/domínio; não afirmar que só Marktmorgen usa Stripe. Patreon: padrão10% pós4/8/2025, com legacy contínuo distinto.
- Linktree: pricing mensal8/15/35 e equivalentes anuais6/12/30; fatura anual exata não inferida. Pricing Pro0% e feature page Pro9% contraditórios: platformFeeBps permanece null. Não escolher9% ou0% como universal. Payout parceiro.25 não é fee de compra direta; selling documentado para Pro/Premium elegíveis.
- Podia: faturas anuais504/1008/1800USD exatas, mensal não verificado null; Mover5%, demais0% de plataforma, processing separado, catálogo50/150/unlimited e migration help. Contatos não equivalem a envios.
- Thinkific: mensal54/109/219, equivalentes anuais40/82/164 sem fatura inventada; gateway externo5/2/1 apenas no escopoFAQ; Thinkific Payments não cobra esse gateway fee, mas processing continua separado. Cursos unlimited, downloads Basic5, branded199extra/selectPlus, trial30.
- Systeme.io: mensal0/17/47/97 e plataforma0% comprovados no FAQ, processing separado. Anual pago não inferido de two months free. Free2k contacts/3funnels/1course; unlimited emails e evergreen Webinar documentados, sem equiparar a calls agendadas.
- Provas adicionadas: todas as fontes aninhadas, preços próprios em cada página, cohorts/unknowns/fees condicionais,15 comparações na ordem e sitemap existente; navegador390/1280 para índice e15 páginas com SEO/fonte/paidclosed, texto de vantagens equivalente, axe, overflow, teclado e ausência de APIwrites. Todos os testes anteriores e a espera de pintura permanecem.
- S1 continua em andamento até os pais e estas seis páginas passarem suite completa e estiverem READY no domínio com SHA exato. Um único deploy destas seis conta uma entrega funcional, não seis; PR pendente/documento não conta.
- M0 antes/depois: mesmo envelope estático e controles de custo; sem endpoint, dependência, provedor, email, IA, storagewrite ou telemetria novos, nem ampliação de franquia/preço/limite/gate. Banda/custo/imposto desconhecido continua reprovação, não zero. Modelo oneroso12,02–12,21% permanece abaixo60%; vendas fechadas, PLANS_ON_SALE=false, sem certificação fiscal ou de margem.


### S1 — correção da tipagem das seis últimas comparações

- Head inicial6553e2a3eccc474c5255715b20f1b777941d90f41ca: Product39367250412, verify118446785948 falhou em TypeScript após lint, regressões e229bundles verdes. Redis e segurança passaram.
- Causa: Detail.rows foi declarado string[][], amplo demais para a tabela existente, que exige tuplas de exatamente três células. Corrigir para [string,string,string][] sem cast, any, supressão ou mudança no tipo/base existente. Dados e comportamento permanecem os mesmos; cada linha agora é verificada em compilação.
- Novo head exige CI completo incluindo navegador; não concluir por typecheck isolado ou por testes do head anterior. Custo/M0/PLANS_ON_SALE/preços/limites/gates inalterados; S1 ainda em andamento.


### S1 concluído — produção e verificação integral
{
  "number": 69,
  "pr": 655,
  "queueItem": 142,
  "feature": "Final six sourced comparisons: Substack, Patreon, Linktree, Podia, Thinkific, Systeme.io; all15 S1 comparisons published",
  "head": "5ef9e996b5739ee56b37dcbf2a75e8a8271758f0",
  "commit": "df67aa025f0b17aacc5eddac0462ff1134331a98",
  "deployment": "dpl_DAYPFVD7C1Uhw71BzAHGjxqn6K7o",
  "readyUTC": "2026-10-20T04:22:54.280Z",
  "readyFortaleza": "2026-10-20 01:22:54",
  "mergedUTC": "2026-10-20T04:21:54Z",
  "mergedFortaleza": "2026-10-20 01:21:54",
  "run": 39367979460,
  "securityRun": 39367979463,
  "validation": "Full corrected-head verify118449081110/Redis118449080832/security success: lint, regressions, typecheck/build, wholebrowser, index+15comparisons at390/1280 with axe/keyboard/overflow/noAPIwrites. READY exactSHA and marktmorgen.com alias;25routes200exactdeploymentmarker, all15actualtitles/closed-sale copy. Noerror/fatal04:19:34.386–04:24:34.386UTC.",
  "limitations": "Unknown Linktree fee remains unknown; legacy cohorts, annual equivalents vs invoice, country/provider fee scopes explicit. Existingstaticenvelope unchanged, no provider operation/cap/price/gate changes. Binding M0 12.02–12.21% remains below60%; PLANS_ON_SALE=false. S1 complete; S2 pricing inprogress."
}

### S2 — preços, limites e condições canônicos
- Nova página /pricing renderizada no servidor, três planos com mensal/anual de plan.ts, tabelas semânticas e listas móveis, FAQ nativo operável por teclado, preços reais dos adicionais e link para comparações. Home, menu, rodapé e sitemap apontam para a página. Calculadora S3 ainda não implementada; nenhum resultado simulado.
- API não foi falsamente restringida ao Studio; permissões e unidades existentes continuam. Delivery200GB não é descrito como bloqueio de download pago. UTC day/calendar/billing-month são distinguidos. Conteúdo/idiomas/IDs e regras operacionais permanecem.
- M0 antes/depois: mesmo modelo de custos/franquias/preços; nenhuma operação paga, email, IA ou provedor novo, nenhuma ampliação de limites nem dependência. Renderização estática no envelope existente; banda ou impostos desconhecidos continuam reprovação. Leitura vinculante12,02–12,21% segue abaixo60%, PLANS_ON_SALE=false. Esta alteração não certifica60% nem abre venda. Suite integral, typecheck, lint e navegador requeridos antes de publicação.

### S2 — correção após verificação completa inicial
- Product39369571852 verify118454148405: testes de preços novos passaram; suíte completa detectou2arquivos com falha: inventário de acessibilidade não listava a nova página e fee-words exigiu texto centralizado. Redis passou. Registrar a página como revisãoAAA não concluída; não remover o teste nem declarar conformidade global. Centralizar cada plano com planShareWords e cabeçalho com feeWords, mantendo a diferença entre oferta publicada e cobrança habilitada. Corrigir também destino/foco do skip link #content e cobrir por teclado. Novo head recebe suíte completa, sem reexecutar somente um job.

- Product39370331078 verify118456593166: lint/regressões/types/build/Redis passaram, navegador detectou18falhas porque next.config.ts ainda redirecionava /pricing para home/#pricing. Remover somente /pricing dos sources e apontar aliases /price,/prices,/plans à rota nova. Cobrir configuração e URL real no navegador; manter todas as18asserções e repetir suíte inteira. Não publicar rota que ainda redireciona.

- Product39371460847 verify118460042973: rota real, preços, comparação, teclado,axe/overflow e tipos passaram;2asserções contavam duas cópias legítimas do aviso fechado (header visível + resposta FAQ). Escopar a verificação ao aviso visível de main/header, sem apagar FAQ/aviso e sem mudar PLANS_ON_SALE. Nova suíte integral no novo head; não concluir por reexecução de job.


### S2 — publicação funcional confirmada70
{
  "number": 70,
  "pr": 656,
  "queueItem": 143,
  "feature": "Dedicated /pricing with canonical monthly/annual plans, actual allowances, add-on prices, processing separation and cancellation/refund FAQ; home/nav/footer/sitemap and legacy price aliases connected",
  "head": "94a0a0919fe1a03abd460524e5963879282638a0",
  "commit": "02ea6ed454c405dd01aa4728340f4ce90ad0f753",
  "deployment": "dpl_7sHcWYGSC7mfEwNZTx9gT31JM9k7",
  "readyUTC": "2026-10-20T05:13:44.994Z",
  "readyFortaleza": "2026-10-20 02:13:44",
  "mergedUTC": "2026-10-20T05:10:55Z",
  "mergedFortaleza": "2026-10-20 02:10:55",
  "run": 39372504529,
  "verify": 118463290595,
  "redis": 118463290915,
  "securityRun": 39372504540,
  "validation": "Complete corrected-head CI passed lint/regressions/typecheck/build/client bundles/whole browser, pricing390/1280, real route, header closure, all6prices, native FAQ keyboard, skip-content focus, scoped axe, fit, no API writes; Redis/security passed. READY exactSHA+marktmorgen.com alias;14routes200exactDPL incl3legacyaliases and actualprices/addons/limits/closure. Noerror/fatal05:09:55.475–05:14:55.475UTC.",
  "limitations": "No calculator published yet (S3 pending). No provider operation/new allowance/price/gate; existing static envelope and M0 binding12.02–12.21% below60% unchanged. PLANS_ON_SALE=false; no margin/fiscal/AAA certification."
}

### S3 — calculadora local e correções
- PR657/head iniciald0ddb442639cf9ac22e7be8f9227ae52943a24e8: Product39369964688 verify118455370270 falhou em lint por apóstrofo JSX não escapado; Redis e segurança passaram. Reescrever frase e usar feeWords central; incorporar correções de S2 e registrar componente no inventário sem declararAAA. Nova suíte completa obrigatória.
- Cálculo exclusivamente no navegador, com fonte/data canônicas; faturas anuais desconhecidas, conflitos e bandas por pagamento não viram zero. Volume e quantidade distintos; processamento em ambos os lados, Kit/Whop inclusivo apenas uma vez; outros custos exigem valor explícito inclusive zero verificado. Nenhum total comparativo antes de condições e taxas completos. Testes sintéticos de valores inválidos, fontes, custos fixos por pagamento, annual/unknown e interações reais sem requestsAPI.
- M0 antes/depois segue mesmo modelo e envelope estático, sem operação paga/dependência/limite novo.12,02–12,21% vinculante abaixo60%; desconhecido reprova; venda fechada, preços/limites/gates preservados. Nenhuma promessa de ganho, equivalência funcional ou certificação fiscal.

- Verificação39370350533 verify118456653258 encontrou ausência de aviso de nova aba em fontes externas. Acrescentar NewTab existente ao próprio link, mantendo a navegação e os idiomas existentes; não suprimir regra nem criar tradução. Testes do cálculo passaram. Nova verificação completa no head corrigido obrigatória.

- Herdar correção S2 do redirect legado de /pricing (af5365b); /price,/prices,/plans apontam à página real. A calculadora só pode ser validada na rota de verdade; repetir suíte completa e exigir URL /pricing no browser.

- Revisão de S3: decidir explicitamente se gateway adicional de Kajabi/Thinkific se aplica ao país/provedor e se Billing recorrente publicado de Substack é separado ou já incluído na cotação digitada. Sem confirmação, paymentCents/total ficam null, não zero. Taxas aplicáveis são somadas uma vez pelos dados oficiais existentes; outros custos não podem repeti-las. Skool Hobby inclusivo10%+valorfixo agora é calculado uma vez; Pro continua bloqueado por bandas/limite exato não verificado. Novos testes unitários e browser para Billing separado/inclusivo e gateway condicional; novo CI integral necessário.

- Herdar teste S2 do aviso visível em main/header, preservando a cópia legítima no FAQ. Closure não pode ser inferida de contagem global de texto; rota real e visibilidade são verificadas no browser. Todo head final continua exigindo suíte completa.

- Rótulos dos selects passam a htmlFor/id separados das opções, com nomes acessíveis estáveis; sem relaxar seletores exatos. Volume/quantidade incoerentes, condições não revistas e overflow não produzem paymentquote/total. Confirmação explicita base de vendas usada para percentuais; bases diferentes ficam sem cotação confirmada, não inferidas. Testes adicionais de números extremos e labels; nenhuma operação/preço/franquia alterada.


### S4 — módulos reais e prova visual do estúdio
- Seção14módulos com links e capacidades existentes, headline/demo preservados, faixa de calculadora S3. Corrigidas ausência falsa de Zoom e promessa de email em minutos. CRM usa comparação pública HighLevel enquanto S5 prepara página própria; não criar link morto.
- Capturas somente do app real em127.0.0.1, fixture isolada HarborKitchen a partir de DEMO_STORE/DEMO_PRODUCT/DEMO_EXTRAS/DEMO_PAGE, sem conta externa, dados reais, pagamentos, email, fotos remotas ou submissão. Capturas distintas store/sales-page1280x820, teto140000bytes por JPEG, origem/log/commit a registrar antes de incluir em produção. Não publicar imagens ausentes nem substituí-las por desenho que finja screenshot.
- Antes de servir: imagens serão embutidas em HTML estático existente (dataURI), sem novos pedidosCDN/transformação/endpoint/provedor; confirmar build estático e teto total280000bytes. Modelo vigente FlatRateCDN2USD/milhão de pedidos já inclui bytes; delta de pedidos0 no mesmo documento. Se a condição de faturamento não for confirmada ou houver função/egress novo, isso é custo desconhecido/reprovação, nunca zero, e ativos não são publicados. Cálculo não certifica margem; M0vinculante12,02–12,21% permanece abaixo60%, venda fechada. Imagens/custo/prova final ainda pendentes neste head.

- Herdar correção S3 de NewTab no link de fonte, sem mudar idiomas; novo CI integral de S4 inclui o head corrigido pai. Tipar as seções de links do teste de home sem ampliar a união de TopicPage.

- S4/Product39371000713 verify118458675571 falhou em lint por nome de variável module no teste; renomear para capability sem alterar regra. Conferir Path pela rota própria existente (não faz parte de PAGES) e desativar prefetch dos14novoslinks e da calculadora para não introduzir pedidos ao apenas percorrer a seção. Herdar correções S3 NewTab e S2 rota real/pricing. Novo CI completo obrigatório.

- Product39371518289 verify118460224197: lint/regressões passaram; typecheck encontrou acesso indevido a title no Item compacto do catálogo. A fixture passa a usar o ID retornado por addProduct e conferir a presença desse ID, sem mudar modelo/IDs de produção nem fazer cast. Herdar também guarda de taxas condicionais S3 e aviso S2 visível; novo CI completo requerido. Imagens ainda não publicadas; API de cobrança histórica não confirmou configuraçãoFlatRate e navegador de leitura falhou duas vezes por timeout.

- Product39373093473 verify118465167117: tipos/regressões e os15comparativos passaram; captura recusou localhost porque o guard aceitava só127.0.0.1. Aceitar somente HTTP com porta explícita e hosts locais localhost/127.0.0.1, nunca produção; fixture continua isolada. Corrigir também a mesma ausência falsa de Zoom no FAQ reutilizado pelo HTML/schema e ler catálogo por MAX_PRODUCTS; expansão de perguntas S10 continua posterior. Nenhum email, arquivo, conta ou integração externa real acionado. Nova suíte integral requerida.


### Entrega71 — publicação funcional confirmada
```json
{
  "number": 71,
  "pr": 657,
  "queueItem": 144,
  "feature": "Local tool-stack calculator on /pricing with official price dates, monthly/annual selection, applicable processing quotes and explicit unknown fees; no invented savings or feature equivalence",
  "head": "d05effbb0f4bf76d488e608061778b1074a18f49",
  "commit": "1f1f4f93a35c6565266a3008077185b2c2e387a9",
  "deployment": "dpl_EMpxPLvY5MHAWc8eTvkQpmah24nH",
  "readyUTC": "2026-10-20T05:40:08.127Z",
  "readyFortaleza": "2026-10-20 02:40:08",
  "mergedUTC": "2026-10-20T05:39:00Z",
  "mergedFortaleza": "2026-10-20 02:39:00",
  "run": 39374412805,
  "verify": 118469201235,
  "redis": 118469201023,
  "securityRun": 39374412828,
  "validation": "Complete final-head CI successful: lint, regression tests, typecheck/build, whole synthetic browser flow, calculator390/1280 keyboard/axe/fit/no API writes, inclusive fee counting, Substack recurring fee and unconfirmed estimates. READY exactSHA+marktmorgen.com alias;13routes200exactDPL including pricing aliases. Actual calculator heading and all4control IDs present. Noerror/fatal05:36:22.448–05:41:22.448UTC.",
  "limitations": "Browser-local arithmetic; no new provider operation/allowance/price/gate. Binding M0 remains12.02–12.21%, fails required60%; PLANS_ON_SALE=false. No margin/fiscal/AAA certification."
}
```

### S4 — verificação e bloqueio específico dos ativos visuais
- Head4edb692/Product39374567301, verify118469693032, Redis118469692712 e segurança39374567174 passaram integralmente. Capturas reais sintéticas produzidas e revistas: store69756bytes, sales-page82191bytes, distintas1280x820, sem dados reais. Módulos/links/FAQ podem avançar como entrega parcial; imagens permanecem ausentes.
- Desde04:38UTC até05:43UTC houve investigação do custo: modelo vigente condiciona bytes inclusos aFlatRateCDN; leitura de cobrança histórica não prova preço máximo nem configuração, e leitura do painel falhou duas vezes por timeout. Sem essa condição confirmada, banda é desconhecida/reprovação, nunca0. Ativos não serão servidos. Pendência específica aguardando o dono; nenhuma permissão de nova conta/custo/upgrade foi inferida, nada cancelado. M0 permanece reprovada, vendas fechadas. Seguir demais itens sem esperar resposta.


### S5 — página pública de CRM
- People, deals and pipelines usa lib/crm-rules e record-space para2/5/10pipelines, campos/stages/deals e limites compartilhados. Registro de valor não é previsão. Campos/etapas privados para a equipe, email/workflows condicionados a opt-in, permissões e franquias; não prometer SMS/WhatsApp/telefone ou agênciaSaaS. Navegação e HighLevel ligados à página; sitemap vem de PAGES. HomeS4 será ligado ao publicar a página e preservar o head final de S4.
- Testes de fatos/caps por plano, sitemap e links recíprocos; leitura390/1280,axe,teclado e nenhuma APIwrite. Conteúdo estático no renderer existente, sem endpoint/execuçãoCRM/dependência/imagem paga/operação nova, sem preço/limite/gate novo. M0 antes/depois mesmo modelo;12,02–12,21% vinculante abaixo60%, desconhecido reprova, PLANS_ON_SALE=false. Nenhuma certificação fiscal/margem; versão final exige CI completo.

- Product39371589383 verify118460446530: lint/regressões passaram; TypeScript detectou inferência autorreferente de row no teste da tabela. Declarar matched como tupla exata [string,string,string]|undefined e callback cells, sem any/cast/supressão nem mudança do contrato. S6 herdou o mesmo erro em39371922139/118461472562; propagar correção e todos os guards/avisos atuais de S2/S3, exigir nova suíte integral em ambos.

- Integração explícita dos módulosS4 com a páginaCRM; homeagoraaponta/platform/crm. Preserva fixture/capturas somenteemCI ependência específica de banda dasimagens aguardandoo dono; nenhumativo novo servido. Herda entrega71 eexigenovasuíteintegral nestehead, semreutilizarsuíteantigaparadeclararconclusão.


### S6 — mecanismos factuais de uso em38páginas
- Bloco curto distinto em cada uma das34páginas de recursos e4páginas existentes de criadores de lib/feature-pages.ts. Inventário por slug verificável, sem órfão ou mudança de IDs/conteúdo dos criadores. Descreve escolha do comprador, confirmação de pagamento, acesso, consentimento e registros; sem números/percentuais/promessa de resultado, integração nova ou previsão de receita. Reutiliza renderer e preserva todos os blocos anteriores.
- Dados estáticos, helper puro sem mutação das páginas base e type-only import para evitar ciclo em runtime. Nenhum endpoint/provedor/email/IA/operação/franquia/dependência/imagem nova. M0 antes/depois mesmo envelope;12,02–12,21% vinculante abaixo60%, desconhecido reprova, venda fechada. CI integral e leitura390/1280/axe do novo bloco nas38URLs exigidos; não é certificaçãoAAA.

- Herdar correção tipada do teste CRM (d899caf) e todos os guards de taxas/aviso visível das basesS2/S3. Falha herdada em39371922139/118461472562 não é tratada como sucesso nem corrigida por rerun isolado; este head requer nova execução integral.

- Product39373120622 verify118465254513: lint/tipos/regressões passaram, navegador parou no teste PathWording já existente na segunda largura antes dos novos38casos. Evidência: botão SSR visível podia receber Enter antes da hidratação; ReactDOM19.2.8 instalado atribui onclick na hidratação (fonte primária react-dom-client.production.js). Esperar esse manipulador DOM real e armar a resposta POST antes do mesmo Enter, mantendo exatamente2requests fake, payload, foco,axe e recusa monetária real. Nenhum sleep, aumento do timeout de resposta, provider real ou mudança no componente/gate de produção. Nova suíte integral obrigatória.

- Integração com homeS4/CRMS5 e históricoentrega71 preservados; novoheadrequerCIintegral. CapturascontinuamsóemCI,bandaaguardandoo dono,semimagemservida.


### S7 — quatro situações de criadores, sem depoimentos inventados
- Acrescenta course-creators, community-builders, newsletter-writers e consultants-and-mentors preservando as quatro páginas anteriores. Ladder com ações reais, newsletter com opt-in e sem equivalência inventada de paywall; consultoria com data de vencimento distinta de débito automático e registro de assinatura sem garantia jurídica.
- Quatro fotografias diferentes, fonte/autoria/licença verificadas em20/10/2026 em docs/creator-photographs-2026-10-20.md. Mesmo host direto já existente, sem API de imagens, otimizador, nova conta, integração ou operação por cliente. Exemplos não representam clientes nem loja publicada; preços dos produtos são escolhas do criador, não promessas.
- M0 antes/depois: mesmo envelope vinculante12,02–12,21%, abaixo do mínimo60%; desconhecidos reprovam e vendas continuam fechadas. Não altera preço/franquia/gate. Cobertura dos mecanismos42páginas, sitemap, navegação, imagens e leitura390/1280/axe exigidas no head final.


### S9 — três artigos de decisão e categorias com conteúdo real
- Fontes primárias relidas20/10/2026: Kajabi pricing; Skool pricing e paymentFAQ; Teachable pricing e understand-your-transaction-fees-and-bundles. Três artigos sobre custoKajabi2026, taxasSkool e escolhaKajabi/Teachable/Marktmorgen. Links de fonte e páginasS1; preços datados conferidos contra lib/competitor-prices.ts. Não inferir fatura anual de equivalente; bandaSkool900desconhecida; gatewayTeachableUS separado; vendasMarktmorgenfechadas. Nenhuma promessa de ganho/economia/equivalência total.
- Preserva nove posts/categorias anteriores; Courses eCommunity só entram com seu primeiro artigo. Email/Sales ausentes enquanto sem post. BlogBlock links renderizado semanticamente, sem fetch externo, analytics novo, imagem nova ou operação por leitor. M0antes/depois mesmoenvelope12,02–12,21%reprovado sob60%;gates/preços/franquiasinalterados. ExigeCIintegarl,SEO/sitemap/390/1280/filtros/teclado/axe/nenhum requestexterno.

- Product39376699290/verify118476334404 falhou no guard de inglês americano pela grafia centre na nova prosa. Corrigir para center e personalized, sem alterar política/idioma nem suprimir o teste. Nova suíte integral no head corrigido obrigatória.

- Revisão tipada de S9: a prova negativa de categoria ainda não criada usa ReadonlySet<string>, sem comparar literais fora da união, sem cast/any/supressão nem enfraquecer verificação. Nova suíte integral obrigatória.


### Publicações funcionais confirmadas72–76

```json
{
  "number": 72,
  "pr": 658,
  "queueItem": 145,
  "feature": "Home now shows fourteen factual modules and calculator discovery, and corrects stale Zoom and email-delivery claims. Partial S4: screenshot serving remains awaiting owner, not published.",
  "head": "d5d1639796286898f15ee06e8445ae3d90ef7807",
  "commit": "6df7d8b50c5917caef88e527de72bda9db6db9aa",
  "deployment": "dpl_6chNGb6kkBAo1tJb7EusyT1dp6gt",
  "readyUTC": "2026-10-20T05:56:53.803Z",
  "readyFortaleza": "2026-10-20 02:56:53",
  "mergedUTC": "2026-10-20T05:55:10Z",
  "mergedFortaleza": "2026-10-20 02:55:10",
  "run": 39376337744,
  "verify": 118475214085,
  "redis": 118475213947,
  "securityRun": 39376337732,
  "validation": "Complete final-head CI passed lint, typecheck/build, regressions, whole synthetic browser including home390/1280 focus/axe/fit/noAPIwrites and real isolated studio captures. READY exactSHA+marktmorgen.com alias;10routes200sameDPL;all14module labels+calculator link and corrected claims present. No screenshots served. Noerror/fatal05:53:22.184–05:58:22.184UTC.",
  "limitations": "Two captures reviewed,69756/82191bytes; image bandwidth billing setting unconfirmed after>1h, so assets held and S4 remains partial/awaiting owner for assets. No new provider operation or price/allowance/gate. Binding M0 remains12.02–12.21%,fails60%;PLANS_ON_SALE=false;no fiscal/margin/AAA certification."
}
```

```json
{
  "number": 73,
  "pr": 659,
  "queueItem": 146,
  "feature": "Public /platform/crm explains people, deals and pipelines with canonical2/5/10pipeline limits, shared record-space ceilings, consent boundaries and actual home/menu/HighLevel/sitemap discovery",
  "head": "5488b650b41eedd1950d75ff84ad3bf120c7726e",
  "commit": "5253f69124a99251e183a634051b88615f7f075e",
  "deployment": "dpl_BQ1reNJUemNeEUces7WRCXYWWMbK",
  "readyUTC": "2026-10-20T06:09:24.468Z",
  "readyFortaleza": "2026-10-20 03:09:24",
  "mergedUTC": "2026-10-20T06:07:39Z",
  "mergedFortaleza": "2026-10-20 03:07:39",
  "run": 39377432627,
  "verify": 118478617948,
  "redis": 118478618078,
  "securityRun": 39377432578,
  "validation": "Full final-head CI passed lint/regressions/typecheck/build/whole synthetic browser, CRM390/1280 keyboard/axe/fit/noAPIwrites, actual home link and shared data limits. READY exactSHA+marktmorgen.com alias;8HTMLroutes200exactDPL plus sitemap200;real CRM plan rows2/5/10,home+HighLevel links,scope+closure present. Noerror/fatal06:06:06.772–06:11:06.772UTC.",
  "limitations": "No new CRM operation/provider/allowance/price/gate; recorded deal values not forecasts; no SMS/WhatsApp/phone sending or SaaS agency equivalence. Binding M0 unchanged12.02–12.21%,fails60%;sales closed. S4 screenshot assets still held for unconfirmed bandwidth billing condition;no fiscal/margin/AAA certification."
}
```

```json
{
  "number": 74,
  "pr": 660,
  "queueItem": 147,
  "feature": "Distinct factual usage mechanisms added to all38existing feature and creator pages, explaining concrete choices, access, consent and recorded facts without earnings promises",
  "head": "cf20f30878bb57c1b68a9f7a9c2c310e8df95240",
  "commit": "c7370298f145a4682726b95b3872b0c675b8d2f6",
  "deployment": "dpl_33HUnPi5srY9UXAfhpEa8kRVBkDf",
  "readyUTC": "2026-10-20T06:12:58.827Z",
  "readyFortaleza": "2026-10-20 03:12:58",
  "mergedUTC": "2026-10-20T06:11:56Z",
  "mergedFortaleza": "2026-10-20 03:11:56",
  "run": 39377503548,
  "verify": 118478832774,
  "redis": 118478833263,
  "securityRun": 39377503389,
  "validation": "Full final-head CI passed lint/typecheck/build/regressions/whole synthetic browser, all38mechanism blocks390/1280 focus/axe/fit/noAPIwrites; existing Path wording keyboard test waits actual hydration and retains original monetary refusals. READY exactSHA+marktmorgen.com alias;all38actual URLs200sameDPL+newblock, plus home/signin/Path200sameDPL. Noerror/fatal06:11:29.577–06:16:29.577UTC.",
  "limitations": "Static descriptions only; no new provider/data/message operation, price/allowance/gate or persisted identifier change. Binding M0 unchanged12.02–12.21%,fails60%;PLANS_ON_SALE=false;no fiscal/margin/AAA certification. S4 screenshot serving still awaits confirmed bandwidth billing condition."
}
```

```json
{
  "number": 75,
  "pr": 661,
  "queueItem": 148,
  "feature": "Four concrete creator pages for course creators, community builders, newsletter writers and consultants/mentors, with canonical capabilities, example offer ladders, distinct licensed photos and clear non-customer disclosures; existing four creator pages preserved",
  "head": "b5db45ffa40189afcb8d892ae2104c32ff5eb586",
  "commit": "aecffafd5f86e247a6dd439369ace9a77e90a4a1",
  "deployment": "dpl_3yyhwpuNRZDtnfcrvEpALUfuHkXM",
  "readyUTC": "2026-10-20T06:17:59.525Z",
  "readyFortaleza": "2026-10-20 03:17:59",
  "mergedUTC": "2026-10-20T06:17:00Z",
  "mergedFortaleza": "2026-10-20 03:17:00",
  "run": 39377534521,
  "verify": 118478930078,
  "redis": 118478930269,
  "securityRun": 39377534481,
  "validation": "Full final-head CI passed lint/regressions/typecheck/build/whole synthetic browser,42mechanism coverage;fournewpages390/1280 actual unique photos/naturalWidth/directhost/nooptimizer,fullmainaxe,fit,keyboard,demo,noAPIwrites. READY exactSHA+marktmorgen.com alias;12HTMLroutes200sameDPL includingnew4andpreserved4 plus sitemap200;realphotoIDs/disclosures/demo/indexingconfirmed. Noerror/fatal06:14:21.544–06:19:21.544UTC.",
  "limitations": "Illustrative structures, not customers/live stores/testimonials. Newsletter not paid-publication paywall equivalence; invoice due date not automatic debit; signature record not legal guarantee. Existing direct photo host, no new provider account/API/optimizer operation or plan allowance/price/gate. Binding M0 unchanged12.02–12.21%,fails60%;sales closed;no fiscal/margin/AAA certification. S4 screenshot billing condition still unconfirmed."
}
```

```json
{
  "number": 76,
  "pr": 662,
  "queueItem": 150,
  "feature": "Three sourced decision articles: Kajabi costs2026, Skool fees and Kajabi/Teachable/Marktmorgen selection; actual Courses/Community categories, dated primary sources, payment conditions and comparison links",
  "head": "a7a7f7127576ce2902d935904da90f295942092c",
  "commit": "b5feb22242ff6000899ab61b1f21d3d3d8b1ce05",
  "deployment": "dpl_94GUPsX6m7f9NKzKvTYyZcXzaHCC",
  "readyUTC": "2026-10-20T06:21:37.374Z",
  "readyFortaleza": "2026-10-20 03:21:37",
  "mergedUTC": "2026-10-20T06:19:57Z",
  "mergedFortaleza": "2026-10-20 03:19:57",
  "run": 39377979090,
  "verify": 118480351108,
  "redis": 118480351402,
  "securityRun": 39377978959,
  "validation": "Full corrected final-head CI passed lint/regressions/typecheck/build/whole synthetic browser,3articles390/1280 metadata/canonical/source links/keyboard/axe/fit/category filtering,no API writes or external reader requests. READY exactSHA+marktmorgen.com alias;9HTMLroutes200sameDPL plus sitemap200;actual article sources/date/canonical/limits links/indexingconfirmed. Noerror/fatal06:19:16.766–06:24:16.766UTC.",
  "limitations": "Dated sources read20Oct2026; annual equivalents not verified invoices; unresolved Skool900boundary stays unknown; TeachableUSgateway fee separate; no earnings/savings/equivalence promise. Nineolderarticles preserved; no emptyEmail/Sales category, new provider/image/operation/price/allowance/gate. Binding M0 unchanged12.02–12.21%,fails60%;salesclosed,no fiscal/margin/AAA certification. S8 awaits real consented case and valid opening;S4 screenshots held."
}
```


### S10 — seis perguntas de decisão na home e no pricing
- Preços e nomes vêm de lib/plan.ts. Renovação/cancelamento/refundo conforme Terms/Refunds; CSV de contatos consentidos/produtos emrascunho/compradores, com limites de conteúdo e assinatura explícitos; webhooksZapier sem appnativo eAPIcomchavesescopadas/tetos; suporte inglês por email existente semSLA; sem prazo inventado de montagem. Links para fontes próprias, sem fetch/prefetch adicional, mensagem real ou nova operação.
- Uma função compartilhada alimenta ambasas páginas e o mesmo texto da home continua noFAQschema. Cinco perguntas anteriores preservadas, incluindo correção factualZoomS4. M0antes/depois mesmo envelope12,02–12,21%, abaixo60%;desconhecidoreprova;vendasfechadas;preços/limites/gatesinalterados. Testes sintéticos de fonte depreços, igualdade, links, teclado eaxe390/1280 exigidos noheadfinal.

- Revisão de estilo: novas respostas usam center, conforme guard de inglês americano do produto; sem mudar idiomas ou relaxar testes. Novo head requer suíte integral.

- Revisão tipada de S9: a prova negativa de categoria ainda não criada usa ReadonlySet<string>, sem comparar literais fora da união, sem cast/any/supressão nem enfraquecer verificação. Nova suíte integral obrigatória.

- S10/Product39377984156/verify118480407335: novosFAQs antes dosanterioresquebraramaguardadeaberturacomercialnaprimeirapergunta ebuscafactualStan. Preservaros5FAQsoriginaisnaordem eacrescentaros6depois,conformepedido; nenhumaasserçãosuprimida. Novasuítecompletanoheadcorrigidoobrigatória.

- FAQ headad7661e: lint/regressões/tipos/build passaram; os6FAQsna home390abriram comlinks/foco corretos. NavegadorparounaguardadeanimaçãodaintroforadavistaporterroladoaoúltimoFAQ. Rolarcada .revealrealàvistaantesdeesperaropacidade,comooutrasverificações;nenhumsleep/timeoutmaior/regraoucenárioremovidos. Novasuíteintegralobrigatória.

- d61038e/Product39379613964 verify118485462476,Redis118485462168,segurança39379613965 verdes; ambosFAQs390/1280/teclado/links/axe passaram. Incorporaçãorecusada405porconflitodafila apósS9. Integrarmaincanônicoehistóricossemreset/descarte;mesmocódigo funcional, novoheadexigeCIintegral,nãoreusarverificaçãovelha.


### S11 — ações de criação e demo em quatro pontos intermediários
- Start your store eSee the live demo após provas, situações, módulos eplanos, preservando topo/fecho. Pares sem pop-up, promessa de gratuidade, especialista ouagendamento. hrefs/signin e/demoexistentes;prefetchfalse,semtelemetria/endpoint/assetnovo. FocoTabentreopções,layout390/1280eaxeexigidos. M0antes/depois mesmoenvelope12,02–12,21%reprovado sob60%;gates/vendasfechadasinalterados.

- Head e91c584/Product39379619872,verify118485481773,Redis118485481908,segurança39379619891 passaram. Integrarúltimo headPR663comopai,mesmos4pares/baselines,semperderhistóricocanônico. Nova suíteintegralobrigatória.


### S12 — sete missões reais do Path na home
- Títulos/IDs/ordem lidos de dayMissions(NO_FACTS) em lib/path-rules.ts, sem duplicar nomes e semlerstore. Cadaetapa distingue ação do criador de checagem registrada; testecheckoutnãoverificaacesso/entrega,lojalivenãofazautocompra,leadnãoéconsentimentodemarketing,estornototalremoveconclusão,nenhumavenda/prazogarantidos. Lembretes/compartilhamentoopt-in e disponibilidadepagamentosemantém. Linkreal/platform/path.
- UmparadicionalStartyourstore/demoapósPathmantémintervalosdeatéduasseções. Semasset/endpoint/provedor/operaçãonovos,prefetchfalse. M0antes/depoismesmoenvelope12,02–12,21%reprovadosob60%;gates/preços/limitesinalterados,vendasfechadas. Testescanônicos/roles/390/1280/foco/axe/semwritesexigidosnoheadfinal.

- Head7c77a6b/Product39379624206 verify118485495851,Redis118485496028,segurança39379624198 verdes. Preservar7missões/5pares eúltimoPR664comopai;filaehistóricoscanônicossemperda. Nova suíteintegralobrigatóriaantesdeincorporar,nãocontarcabeçalhoverdeanteriorcomoconclusãodonovo.

154. **[B2-CONTACT-ACKNOWLEDGMENT] Confirmar a configuração do formulário de contato sem confundir com publicação**
   - Pedido: continuaçãoB2/P0/P3 após implementaçõesS; nenhum número/estado anterior alterado.
   - Estado: **concluído; PR666 incorporado20/10/2026 04:18:34 Fortaleza; publicação funcional80 confirmada**.
   - Escopo: comparar HTTP/okbooleano/ausênciadeerro/snapshotcontact já devolvido pelo servidor com parseJoin canônico; bloquearcampos enquantoespera,aria-busy,semduplosenvios;perdaderespostamandaconferirsemalegarnadamudou. Sucessoconfirmaconfiguração,nãovisibilidadedependente deemail/plano. Conteúdodocriador/idiomaspreservados.
   - Prova:14respostasinterceptadasem390/1280,28casos,normalizaçãocanônica,HTTP/truthy/contradição/objetosinválidos/errosherdados/perda/sucesso;nenhumPOSTdecontatochegaaoservidor,nenhummensagemoucontareal. Suíteintegralnocabeçalfinalobrigatória.
   - Custo: fontecliente+599caracteres,mesmoPOST/resposta/parseJoinexistentes,semnovaoperação/fornecedor/franquia/preço/gate. M0antes/depois12,02–12,21%,reprova60%;vendasfechadas.

- Integração explícita com mainc7370298f145a4682726b95b3872b0c675b8d2f6 preserva CRM eS6,resolveconflitodedocumentação semdescartar histórico. Alerta decontatousa danger-text existente para contraste7:1 emfundosclaros,comaxe-enhancedrealnoalertaeprovanãoincompleta. EscoponãocertificaAAAgeral. Novasuíteintegralnoheadfinal.

- Diagnóstico CI39382404775: o endereço longo no parágrafo do media kit fazia document.scrollWidth436 na janela390. Correção localizada break-words no próprio parágrafo, sem ocultar overflow e sem reduzir verificações; nova suíte integral obrigatória.

### Publicação funcional79 — S12
```json
{
  "number": 79,
  "pr": 665,
  "queueItem": 153,
  "feature": "Home page explains the seven actual Path missions, creator actions and fact checks, with a fifth intermediate self-service action pair",
  "head": "09f3f611937807fb7306f831cb70774e65d2d5c7",
  "commit": "51bdab96065a566ee396d61420540bfa8fa4c4c9",
  "deployment": "dpl_8gRANbeubAz9aJug26MxiagTWhR9",
  "readyUTC": "2026-10-20T06:55:56.911Z",
  "readyFortaleza": "2026-10-20 03:55:56",
  "mergedUTC": "2026-10-20T06:55:06Z",
  "mergedFortaleza": "2026-10-20 03:55:06",
  "run": 39381233699,
  "verify": 118490569308,
  "redis": 118490568978,
  "securityRun": 39381233529,
  "validation": "Full final-head CI passed lint, regressions, typecheck, build, Redis, security and synthetic browser: seven canonical missions, roles, Path link, five CTA groups, keyboard, axe and fit at390/1280. READY exactSHA and marktmorgen.com alias confirmed; six routes200sameDPL and live home content confirmed. Noerror/fatal06:59:16.460–07:04:16.460UTC.",
  "limitations": "Static factual content; no new endpoint/provider operation or outcome guarantee. Existing opt-in, prices, limits and fiscal gates preserved. Binding M0 unchanged12.02–12.21%,fails60%;PLANS_ON_SALE=false;no margin certification."
}
```

155. **[B2-RECOVERY-ACKNOWLEDGMENT] Confirmar preferências de lembrete sem alterar consentimento**
   - Pedido: continuaçãoB2/P0/P3, apósSacionáveis; preservar estados/IDsanteriores.
   - Estado: **concluído; PR667 incorporado20/10/2026 04:24:41 Fortaleza; publicação funcional81 confirmada**.
   - Escopo: respostaHTTP/okbooleano/semcontradição eRecoverySettingcomenabled/addresscanônicos easksbooleano. asksseguepaísdaStripejádecididopeloservidor,nãopreferênciainventadadocliente. Bloquearcamposduranteespera,aria-busy,semduplosenvios;errodesconhecidosóusaentradaspróprias,perdaderespostamandaconferirsemalegarnadamudou. Nãoalterar política/envio/opt-in/tetos.
   - Prova:16respostasinterceptadas×2larguras×2flagsdeconta,64casos,semPOSTreal/SMTP/provider/assinatura. IncluiHTTP,truthey,camposdivergentes,flaginválida,JSONinválido,errosherdados,perda,recusaconhecidaesucessocanônico. Suíteintegralobrigatórianoheadfinal.
   - Custo: fontecliente+656caracteres,mesmoPOST/resposta/parseRecovery;semnovafranquia/operação/fornecedor/preço/gate. M0antes/depois12,02–12,21%,reprova60%;vendasfechadas.

156. **[B2-SOCIAL-PROFILE-ACKNOWLEDGMENT] Confirmar perfis canônicos, ordem e remoção sem perder o rascunho**
   - Pedido: continuaçãoB2/P0/P3, publicar apósS e154/155; números/estadosanteriorespreservados.
   - Estado: **concluído; PR668 incorporado20/10/2026 04:27:15 Fortaleza; publicação funcional82 confirmada**.
   - Escopo: HTTP/okbooleano/semcontradição earrayexatocomparseSocials,mesmaordem/URLs/canonicalização/remoçãovazia. Nenhumaentrada inválida édeclaradasalva. Bloquearcampos,reordenar/remover/adicionar/cancelarduranteespera;errosherdadosnãoescolhempropriedades;índicesrejeitadosinteirosválidos;incertezamandaconferir. Alerta/errodecampousadanger-text existente;conteúdooriginalpreservado.
   - Prova:18respostaspara2perfis+6pararemoçãovazia em390/1280=48casos,semPOSTrealouaberturadeperfil/remotemensagem/conta. Incluiordem,rede,URL,contagem,HTTP/truthy,JSON/errosherdados/perda/índicesinválidos,acessibilidadecontrast-enhancedrealdoalerta. Suíteintegralobrigatórianoheadfinal.
   - Custo: fontecliente+1198caracteres,mesmoPOST/resposta/parseSocials;semnovaoperação/fornecedor/franquia/preço/gate. M0antes/depois12,02–12,21%,reprova60%;vendasfechadas.


157. **[B2-SIGNUP-SETTING-ACKNOWLEDGMENT] Confirmar configuração de inscrição sem prometer publicação**
   - Estado: **concluído; PR669 incorporado20/10/2026 04:30:29 Fortaleza; publicação funcional83 confirmada**.
   - Escopo: sucesso apenas com HTTP válido, ok booleano, sem erro contraditório e snapshot join canônico já retornado; bloquear campos enquanto salva, anunciar aria-busy e preservar rascunho. Incerteza pede recarregar para conferir. Confirmação dupla, disponibilidade por plano/email, idiomas e conteúdo preservados.
   - Prova: 14 respostas interceptadas em390/1280,28casos; nenhuma inscrição, conta, mensagem ou POST real; contraste real do alerta e largura integral mantidos. CI integral obrigatório no head final.
   - Custo: +592caracteres cliente, mesmo POST/resposta/parseJoin; nenhuma operação ou fornecedor novo. M0 antes/depois12,02–12,21%, reprova60%; PLANS_ON_SALE=false, preços/limites/gates preservados.


### Publicação funcional80 — confirmação de contato e largura móvel
```json
{
  "number": 80,
  "pr": 666,
  "queueItem": 154,
  "feature": "Contact editor confirms canonical saved settings, locks pending fields and gives honest uncertainty; long media-kit address wraps on mobile",
  "head": "b35f3653b1bf5961088a8317025295997423d84d",
  "commit": "9849f0b03610892dc468c181ee777b31444940c5",
  "deployment": "dpl_H15K6dpXTgiE9ehthQh2eND9hSNh",
  "readyUTC": "2026-10-20T07:19:31.161Z",
  "readyFortaleza": "2026-10-20 04:19:31",
  "mergedUTC": "2026-10-20T07:18:34Z",
  "mergedFortaleza": "2026-10-20 04:18:34",
  "run": 39384360673,
  "verify": 118500526220,
  "redis": 118500526528,
  "securityRun": 39384360628,
  "validation": "Full final-head CI lint/regressions/typecheck/build/security/Redis and complete synthetic browser passed, including28intercepted contact responses at390/1280, pending locks, canonical values, draft retention, actual enhanced alert contrast and unchanged global fit guard. READY exactSHA+marktmorgen.com alias;6routes200sameDPL including studio anonymous sign-in redirect. No private production writes/accounts/messages. Noerror/fatal07:15:49.307–07:20:49.307UTC.",
  "limitations": "Client+599characters, existing request/response/parser;localized12character wrapping class, no new provider/price/allowance/gate. BindingM0 unchanged12.02–12.21%,fails60%;sales closed,no margin certification."
}
```

### Publicação funcional81
```json
{
  "number": 81,
  "pr": 667,
  "queueItem": 155,
  "feature": "Recovery settings confirm canonical saved preference and server-owned consent flag, lock pending edits and preserve honest uncertainty",
  "head": "feee65dbc692b7bb325dfd218de6e768e61633ec",
  "commit": "21be41488c6e76e9c08cdcebec5b96b8aa8eff03",
  "deployment": "dpl_2E2Sfc8HU5F3Jt4trvGcS7cus5mY",
  "readyUTC": "2026-10-20T07:25:39.502Z",
  "readyFortaleza": "2026-10-20 04:25:39",
  "mergedUTC": "2026-10-20T07:24:41Z",
  "mergedFortaleza": "2026-10-20 04:24:41",
  "run": 39384589896,
  "verify": 118501283729,
  "redis": 118501283822,
  "securityRun": 39384589930,
  "validation": "Full final-head CI lint/regressions/typecheck/build/security/Redis and complete synthetic browser passed,64intercepted recovery replies across390/1280 and both server consent flags. Pending locks, canonical enabled/address, boolean asks, refusal draft retention and global fit. READY exactSHA+marktmorgen.com alias;6routes200sameDPL, anonymous studio correctly redirects signin. No production private writes, accounts, payments or emails. Noerror/fatal07:21:46.878–07:26:46.878UTC.",
  "limitations": "Client+656characters, existing POST/response/parseRecovery, no new provider operations/prices/allowances/gates. Consent, timing, recipient/spend limits unchanged. BindingM0 12.02–12.21%fails60%;sales closed."
}
```

### Publicação funcional82
```json
{
  "number": 82,
  "pr": 668,
  "queueItem": 156,
  "feature": "Social profile editor confirms exact canonical networks, URLs and order, deliberate removal and preserved drafts on uncertain replies",
  "head": "3ec4d4e275242898bec62cedd60e1541397fa620",
  "commit": "de0deb03fa859d4fad7a023793fb53eda002f436",
  "deployment": "dpl_EjzWSDEFvba6AzgKUsMoYrDkTCVx",
  "readyUTC": "2026-10-20T07:28:13.429Z",
  "readyFortaleza": "2026-10-20 04:28:13",
  "mergedUTC": "2026-10-20T07:27:15Z",
  "mergedFortaleza": "2026-10-20 04:27:15",
  "run": 39384647340,
  "verify": 118501475212,
  "redis": 118501475610,
  "securityRun": 39384647286,
  "validation": "Full final-head CI lint/regressions/typecheck/build/security/Redis and synthetic browser passed,48intercepted social replies at390/1280 including empty removal, canonical order/URLs, pending control locks, row-index validation, enhanced alert contrast and global mobile fit. READY exactSHA+marktmorgen.com alias;6routes200sameDPL, anonymous studio signin redirect expected. No production private writes, profile requests or accounts/messages. Noerror/fatal07:24:18.925–07:29:18.925UTC.",
  "limitations": "Client+1198characters, existing parseSocials/POST/response, no new provider/price/allowance/gate. BindingM0 remains12.02–12.21%,fails60%;salesclosed,no certification."
}
```

### Publicação funcional83
```json
{
  "number": 83,
  "pr": 669,
  "queueItem": 157,
  "feature": "Email sign-up editor confirms canonical saved settings, locks pending fields and preserves drafts after uncertain replies without claiming public availability",
  "head": "cb9c3c9bd37641d48f983dedd32feedcfc9288ff",
  "commit": "1799593c0a059036b4bb92b225d12ca8ccbb8ad9",
  "deployment": "dpl_DMo5F4WLrypzqGnGkVEV6csyA1wG",
  "readyUTC": "2026-10-20T07:31:30.925Z",
  "readyFortaleza": "2026-10-20 04:31:30",
  "mergedUTC": "2026-10-20T07:30:29Z",
  "mergedFortaleza": "2026-10-20 04:30:29",
  "run": 39384827452,
  "verify": 118502064187,
  "redis": 118502063870,
  "securityRun": 39384827319,
  "validation": "Full final-head CI lint/regressions/typecheck/build/security/Redis and synthetic browser passed,28intercepted signup-setting replies at390/1280; canonical saved fields,pending locks,draft retention,real enhanced alert contrast and global fit. READY exactSHA+marktmorgen.com alias;6routes200sameDPL including anonymous studio signin redirect. No production private write,email,signup,account or payment. Noerror/fatal07:27:23.981–07:32:23.981UTC.",
  "limitations": "Client+592characters, existing parseJoin/POST/response,no new provider/price/allowance/gate. Double opt-in,plan/mail availability,creator text and buyer languages unchanged. BindingM0 12.02–12.21%fails60%;salesclosed."
}
```

## HT — Lições da auditoria da Hotmart (20/10/2026)

### HT0 — Correções do dono (20/10/2026)

Pedido direto do dono nesta conversa,20/10/2026. Esta correção prevalece sobre a classificação anterior desta seção e sobre referências históricas posteriores que a descreviam integralmente bloqueada. O horário original da mensagem não foi informado; o horário real de aplicação é registrado no item182 ao fim do arquivo. Os antigos itens [H1], [H2], [H3] etc. da fila original permanecem intactos.

**CORREÇÃO 1 — Renomear a seção e os IDs, para evitar conflito.**
A fila já tinha itens [H1], [H2], [H3] etc. (app nativo, transmissão ao vivo, marketplace). Renomeie o título da seção para "## HT — Lições da auditoria da Hotmart (20/10/2026)" e os subtítulos "### H1 —" a "### H17 —" para "### HT1 —" a "### HT17 —", na mesma ordem e sem alterar o conteúdo. Não altere os itens [H1], [H2], [H3] antigos. Atualize todas as referências a "H1–H17" escritas depois de20/10/2026 04:15 (por exemplo, nas linhas "Origem" dos itens158a179) para "HT1–HT17". As menções aos nomes antigos neste parágrafo são a própria instrução de renomeação, não IDs ativos.

**CORREÇÃO 2 — Separar o que depende do gate de margem.**
O gate M0 (margem pela leitura com mais imposto) controla a ABERTURA DAS VENDAS, e não a edição de páginas e textos. Um item sem nenhum custo variável por cliente não altera a margem de nenhum plano. Portanto, substitua o "Estado" de cada item da seção HT conforme abaixo:

a) LIBERADOS (sem custo variável por cliente; apenas texto, página, layout ou leitura de dados já existentes): HT1, HT2, HT3, HT4, HT6, HT7, HT8, HT9, HT12, HT15, HT16 e HT17. Novo estado: "liberado; sem custo variável; não depende do gate M0".
HT5 também fica liberado, desde que reaproveite o rascunho de loja por IA já existente, com o mesmo pool, os mesmos tetos e a mesma reserva de custo, sem nenhuma chamada de IA nova nem custo novo.

b) CONDICIONADOS ao cálculo de margem do próprio item (pela leitura de dimensionamento, com o mesmo método usado no add-on do Store assistant): HT10 (somente se exigir custo novo de fornecedor), HT11, HT13 e HT14. Novo estado: "condicionado ao cálculo de custo no pior caso por cliente". Antes de implementar qualquer um deles, calcule e registre esse custo. Se a margem mínima de60% não for mantida em todos os planos e intervalos, registre o motivo e não o implemente.

c) Nenhum item da seção HT pode colocar nada à venda, alterar PLANS_ON_SALE ou afirmar no site algo que não exista no código. A loja continua fechada até que todos os gates passem.

**Regra de margem preservada:** todo cliente pagante isoladamente, usando100% dos direitos do plano no pior mês, deve manter lucro líquido MÍNIMO de60% após todos os custos e impostos, inclusive brasileiros;60% é piso, não teto. Sem alterar preços, reduzir limites visíveis, ativar comissão ou afrouxar PLANS_ON_SALE, tax gate, art.9a ou revisão comercial. Custo desconhecido reprova; novo custo exige cálculo e reserva/tetos antes da operação. A liberação de edições sem custo novo não certifica margem de vendas.

**Ordem vigente:** concluir o item em andamento e PRs708,709,710; executar HT0; depois HT1,HT2,HT3,HT4,HT5,HT6,HT7,HT8,HT9,HT12,HT15,HT16,HT17; depois calcular HT10,HT11,HT13,HT14 e implementar somente os que atendam ao piso. Só então retomar novas revisões B2. Ao começar cada HT, acrescentar registro próprio no fim com próximo número livre, estado, commit, testes e publicação.180[B2-180] e181[B2-181] já existiam antes deste pedido; são preservados, e HT0 recebe182. Registros anteriores de gate permanecem históricos; esta classificação é a vigente.

Pedido do dono recebido20/10/2026; proveniência: attachment a64d5c80-7b29-4ff0-a7cd-9a03478b9fbf/Texto colado.txt. Executar depois de todos os itens acima, sem interromper154–157. Nenhum número ou estado anterior foi alterado.

REGRA DE MARGEM (obrigatória em todos os itens): todo cliente pagante, considerado isoladamente e usando 100% de todos os direitos do plano no pior mês, deve manter margem de lucro líquido MÍNIMA de 60% após todos os custos e todos os impostos, inclusive os brasileiros. Os 60% são o piso: a margem pode ser maior, nunca menor. Nenhum item pode alterar preços, reduzir limites visíveis, ativar comissão (COMMISSION_LIVE permanece false) nem afrouxar qualquer gate (tax gate, art. 9a e revisão comercial). Todo recurso com IA deve reservar o custo antes da chamada, ter teto de entrada e de saída e recorrer a uma versão sem IA quando o pool se esgotar. Se um item não couber na margem, registre esse fato no próprio item e não o implemente.


**Gate vinculante atual para abertura das vendas:** M0 mais oneroso12,02–12,21%, abaixo de60%; PLANS_ON_SALE=false e COMMISSION_LIVE=false, com tax gate, art.9a e revisão comercial preservados. Isso não impede editar texto, página ou layout sem custo variável por cliente. A classificação vigente é a correção HT0 acima: itens liberados sem custo novo; itens condicionados exigem cálculo próprio no pior caso por cliente, plano e intervalo, pelo método de dimensionamento do add-on do Store assistant, mantendo piso líquido de60% após todos os custos/impostos. Custo desconhecido reprova; registrar motivo e não implementar item que não caiba. Sem alegar margem certificada. A auditoria externa continua contexto do dono, não prova independente: verificar fontes oficiais e código antes de alegações públicas.

REGRAS DE EXECUÇÃO PARA CADA ITEM
1. Antes de programar, verifique no repositório (lib/, app/, components/ e docs/) se o recurso já existe. Se existir, aprimore-o; nunca crie um segundo.
2. As páginas só podem mencionar recursos que existam no código e funcionem hoje.
3. Todo texto público deve estar em inglês americano.
4. Crie testes para cada alteração; a suíte inteira deve continuar passando.
5. Atualize a documentação do recurso e registre, no item da fila, o que foi feito e o commit correspondente.


### HT1 — Hero orientado a resultado. Reescreva o hero da home (app/page.tsx) para vender o resultado do criador, e não a ferramenta: headline com benefício econômico direto e subheadline no formato "estado atual → estado desejado" (da primeira venda ao negócio completo), sem jargão. Mantenha o pilar "Your store. Your Stripe. Your money." como diferencial. Use um único CTA dominante (Lei de Hick), com botão grande e repetido ao longo da página (Lei de Fitts).

- Estado: **liberado; sem custo variável; não depende do gate M0**.
- Evidência de conclusão: data Fortaleza, commit, documentação, testes e CI integral no head final — pendentes.


### HT2 — Página "How it works" organizada pela jornada. Crie ou reorganize uma página de soluções que siga a sequência mental do criador: Create → Charge → Deliver → Sell more → Automate → Grow. Em cada etapa, apresente os recursos reais do Marktmorgen que a resolvem, com link para a respectiva página de recurso já existente em lib/feature-pages.ts.

- Estado: **liberado; sem custo variável; não depende do gate M0**.
- Evidência de conclusão: data Fortaleza, commit, documentação, testes e CI integral no head final — pendentes.


### HT3 — Página de preços que vende valor antes do preço. Na seção #pricing e na página de preços, apresente, antes do preço, o catálogo de recursos organizado por benefício: Checkout, Upsells, Affiliates, Funnels, Email automation, Community, Courses, Video calls, Analytics e CRM. Use o contraste honesto com a Hotmart: ela cobra um percentual sobre cada venda, que cresce à medida que o criador cresce; o Marktmorgen fica com 0% das vendas e cobra um preço fixo. Pode-se incluir uma calculadora do tipo "what a % fee would cost you at X in sales", desde que as taxas dos concorrentes provenham de fonte pública citada, com data. Não altere nenhum preço.

- Estado: **liberado; sem custo variável; não depende do gate M0**.
- Evidência de conclusão: data Fortaleza, commit, documentação, testes e CI integral no head final — pendentes.


### HT4 — Página de comparação "Marktmorgen vs Hotmart", em inglês e voltada ao público internacional, no mesmo padrão das páginas de prova já existentes (compare, gumroad e beacons, em lib/site-pages.ts). Compare: taxa por venda versus preço fixo; prazo de recebimento (o dinheiro vai diretamente para a conta Stripe do criador); white-label e domínio próprio; dependência de ecossistema. Use somente fatos verificáveis, com fonte e data, e nenhuma alegação de superioridade sem prova.

- Estado: **liberado; sem custo variável; não depende do gate M0**.
- Evidência de conclusão: data Fortaleza, commit, documentação, testes e CI integral no head final — pendentes.


### HT5 — Ativação "do prompt à loja pronta". O rascunho da loja gerado por IA já existe. Transforme-o no caminho principal do onboarding: o criador descreve em uma frase o que vende e recebe nome, bio, perguntas frequentes e até três produtos em rascunho; em seguida, segue um checklist guiado até a PRIMEIRA OFERTA PUBLICADA (reaproveite funnel-launch-checklist e store-guide). Meça o time-to-value (do cadastro à primeira oferta publicada) e mostre o progresso ao criador. Mantenha a regra atual: nada é colocado à venda sem que o criador o publique.

- Estado: **liberado; sem custo variável; não depende do gate M0**.
- Condição expressa de HT5: reaproveitar somente o rascunho de loja por IA já existente, com o mesmo pool, tetos e reserva de custo, sem chamada de IA nova nem custo novo.
- Evidência de conclusão: data Fortaleza, commit, documentação, testes e CI integral no head final — pendentes.


### HT6 — Reversão de risco e cadastro sem fricção. Revise o fluxo de cadastro: use o menor número possível de campos e não exija cartão para começar, se o modelo atual de teste gratuito permitir. O CTA deve informar exatamente o que acontece ("Start your store" ou "Try it free for X days", se isso for verdade). O texto sobre o que é gratuito e o que é pago deve ser honesto e seguir o padrão Pieter Levels: primeiro o preço mensal; o gratuito, apenas como complemento.

- Estado: **liberado; sem custo variável; não depende do gate M0**.
- Evidência de conclusão: data Fortaleza, commit, documentação, testes e CI integral no head final — pendentes.


### HT7 — Vitrine de criadores com prova real. Prepare a seção e a página de vitrine de lojas reais, com autorização expressa de cada criador, registrada com data. Até que exista a primeira loja real autorizada, a seção deve exibir apenas a loja de demonstração, identificada como demo. Nunca use nome, foto ou resultado de criador sem autorização; nunca invente nada.

- Estado: **liberado; sem custo variável; não depende do gate M0**.
- Evidência de conclusão: data Fortaleza, commit, documentação, testes e CI integral no head final — pendentes.


### HT8 — Prova social quantitativa honesta. Prepare contadores da plataforma (lojas criadas, vendas processadas e criadores ativos) alimentados por dados reais. Cada contador deve permanecer OCULTO até atingir um limiar mínimo configurado e deve exibir a data da contagem. É proibido: arredondar números para cima, usar "+X" sem base e exibir notificações de "pessoas vendo agora" ou de "compras recentes" que não sejam reais e auditáveis (a Hotmart faz isso no checkout; nós não copiaremos essa prática). Se lib/recent-sales.ts já faz isso de forma honesta, apenas revise-o.

- Estado: **liberado; sem custo variável; não depende do gate M0**.
- Evidência de conclusão: data Fortaleza, commit, documentação, testes e CI integral no head final — pendentes.


### HT9 — Alavancas de receita visíveis para o criador. Order bump, upsell, downsell, bundles, recuperação de checkout e "next offer" já existem. Crie no studio uma tela "Grow your sales" (ou aprimore app/grow-sales) que mostre cada alavanca, indique se está ativada e informe quanto ela realmente gerou naquela loja (apenas dados medidos; nenhuma estimativa apresentada como fato). Ative por padrão as alavancas que não têm custo variável e que são opcionais para o comprador.

- Estado: **liberado; sem custo variável; não depende do gate M0**.
- Evidência de conclusão: data Fortaleza, commit, documentação, testes e CI integral no head final — pendentes.


### HT10 — Central de pixels e atribuição. lib/pixels.ts e o módulo de atribuição já existem. Garanta uma central única (Meta, Google e TikTok) que respeite o consentimento e um painel de atribuição simples por canal. Não deve haver custo novo de fornecedor; se houver, ele entra no cálculo da margem.

- Estado: **condicionado ao cálculo de custo no pior caso por cliente**.
- Condição expressa de HT10: o cálculo é exigido somente se houver custo novo de fornecedor; sem custo novo, preservar o fluxo existente e os controles de consentimento.
- Evidência de conclusão: data Fortaleza, commit, documentação, testes e CI integral no head final — pendentes.


### HT11 — Comunidade de criadores do Marktmorgen por estágio. Avalie a criação de um espaço para os criadores clientes, organizado por estágio (Starting, First sales, Growing), e não por faturamento declarado, e só o implemente se a margem permitir, com custo zero ou limitado. Reaproveite a comunidade e o acesso ao Discord já existentes. Objetivo: pertencimento e retenção, sem promessa de resultado.

- Estado: **condicionado ao cálculo de custo no pior caso por cliente**.
- Evidência de conclusão: data Fortaleza, commit, documentação, testes e CI integral no head final — pendentes.


### HT12 — Educação gratuita como canal de aquisição (SEO de intenção). Use o blog e o learn.ts já existentes. Crie um cluster de guias evergreen em inglês sobre venda de produtos digitais, cursos, memberships, chamadas pagas e afiliados, cada um com perguntas frequentes em dados estruturados (schema FAQPage), links internos para as páginas de recurso e um CTA para começar. Não produza conteúdo raso nem repetido.

- Estado: **liberado; sem custo variável; não depende do gate M0**.
- Evidência de conclusão: data Fortaleza, commit, documentação, testes e CI integral no head final — pendentes.


### HT13 — Tutor ou assistente do aluno. Verifique o que lib/answers-rules.ts já faz. Se fizer sentido, ofereça ao criador um assistente que responda às dúvidas dos alunos exclusivamente com base no conteúdo do curso, no mesmo padrão do Store assistant: rótulo de IA desenhado pela página, resposta restrita aos fatos, encaminhamento ao criador, pool reservado e teto de custo. Implemente-o somente se couber na margem; caso contrário, registre o motivo e não o implemente.

- Estado: **condicionado ao cálculo de custo no pior caso por cliente**.
- Evidência de conclusão: data Fortaleza, commit, documentação, testes e CI integral no head final — pendentes.


### HT14 — Copiloto de preço e de funil. O funil com IA já existe. Acrescente uma sugestão de preço e de estrutura de oferta baseada apenas nos dados da própria loja e em regras declaradas, sempre como sugestão que o criador aceita ou recusa, com a justificativa exibida. Não apresente projeções do tipo "você venderá X".

- Estado: **condicionado ao cálculo de custo no pior caso por cliente**.
- Evidência de conclusão: data Fortaleza, commit, documentação, testes e CI integral no head final — pendentes.


### HT15 — Biblioteca de modelos. Reúna em um único lugar os modelos de página, funil, e-mail e sequência que já existem (funnel-starters, mail-starters e saved-blocks), com pré-visualização, filtros por objetivo e opção "usar este modelo" em um clique.

- Estado: **liberado; sem custo variável; não depende do gate M0**.
- Evidência de conclusão: data Fortaleza, commit, documentação, testes e CI integral no head final — pendentes.


### HT16 — Design premium e confiança. Revise a home, a página de preços e as páginas de recurso quanto aos seguintes pontos: espaço em branco generoso; hierarquia "benefício → prova → CTA" em cada seção; cards limpos; mockups reais do produto (capturas do próprio Marktmorgen, sem nenhuma imagem repetida); e sinais de confiança verdadeiros (pagamento direto na conta Stripe do criador, exportação dos dados, cancelamento simples e política de reembolso). Core Web Vitals no celular: LCP inferior a 2,5 s, INP inferior a 200 ms e CLS inferior a 0,1; meça antes e depois.

- Estado: **liberado; sem custo variável; não depende do gate M0**.
- Evidência de conclusão: data Fortaleza, commit, documentação, testes e CI integral no head final — pendentes.


### HT17 — Tom de voz de parceiro. Padronize a microcopy do site e do studio com tom de parceiro e mentor: frases curtas, orientadas à ação, sem linguagem corporativa e sem promessa de resultado garantido.

- Estado: **liberado; sem custo variável; não depende do gate M0**.
- Evidência de conclusão: data Fortaleza, commit, documentação, testes e CI integral no head final — pendentes.


PRÁTICAS DA HOTMART QUE NÃO DEVEM SER COPIADAS (registre-as na seção, para que nenhuma delas seja implementada no futuro)
- Notificações de "X pessoas vendo agora" ou de "compras recentes" sem dados reais e auditáveis.
- Urgência ou escassez artificial e contadores falsos.
- Números da plataforma sem base (por exemplo, "+250 mil" ou "4,9 com 350 mil avaliações") enquanto não tivermos os nossos, reais.
- Nomes ou resultados de criadores sem autorização.
- Modelo de cobrança por percentual sobre a venda (já está decidido: 0% de comissão).


Ao concluir cada item: registrar data, commit e testes; seguir ao próximo. Dados de cadastro/contadores e atribuição exigem minimização e consentimento; ativação por padrão emHT9 não substitui o opt-in já exigido. HT1 mantém a proibição vigente de promessas de ganhos/resultado garantido. Capturas e mediçõesHT16 seguem também os gates de banda/custos, sem certificar Core Web Vitals com dados insuficientes.


## Continuação da revisão de excelência após os itens acionáveis

158. **[B2-WELCOME-VIDEO-ACKNOWLEDGMENT] Confirmar configuração do vídeo sem perder o endereço digitado**
   - Estado: **concluído; PR671 incorporado20/10/2026 04:53:09 Fortaleza; publicação funcional84 confirmada**.
   - Origem: revisão B2 do editor existente, sem implementar recurso HT condicionado à margem. HT1–HT17 continuam no lugar e sob o gate fiscal.
   - Escopo: comparar HTTP, ok booleano, ausência de erro contraditório e provider/id/hash canônicos já devolvidos por /api/store/intro; remoção exige null confirmado. Bloquear entrada durante espera, aria-busy, mensagem honesta e contraste do alerta. Não abrir vídeo nem chamar fornecedor; idiomas/conteúdo preservados.
   - Prova:72respostas interceptadas,12variantes×3provedores×390/1280, incluindo hash Vimeo, JSON inválido, contradição, perda, campos divergentes e sucesso; global fit mantido. Remoção null não está coberta pela matriz atual e não será alegada como testada. Nenhuma conta, vídeo remoto ou POST real.
   - Custo: cliente+798caracteres, mesma operação/resposta/parser, sem fornecedor/franquia/preço/gate novo. M0 antes/depois12,02–12,21%reprova60%;vendas fechadas e nenhuma certificação fiscal.


159. **[B2-SUPPORT-SETTING-ACKNOWLEDGMENT] Confirmar configuração e valores de apoio sem alegar publicação**
   - Estado: **concluído; PR672 incorporado20/10/2026 04:57:39 Fortaleza; publicação funcional85 confirmada**.
   - Escopo: reusar parseTips/readTipAmount e snapshot existente; comparar HTTP,okbooleano,ausência de erro,on/heading/line e valores na mesma ordem. Campos bloqueados/aria-busy; índices de erro inteiros válidos; preservar rascunho e mensagem honesta. Sem alterar operação de pagamento,impostos,limites,consentimento ou disponibilidade.
   - Prova:34respostas sintéticas em390/1280 com requisições interceptadas; padrão USD confirmado em lib/money.ts/store.ts e fixture sem troca de moeda. Valores,ordem,índices,JSON/perda/contradição,campos pendentes,contraste e largura. Nenhum checkout/conta/mensagem/pagamento real. Verificação completa obrigatória.
   - Custo: cliente+1221caracteres,mesmaoperação/resposta/parser,semfornecedor/franquia/preço/gate novo.M0antes/depois12,02–12,21%reprova60%;vendas fechadas. Revisão B2 existente; não implementação deH.


### Publicações funcionais84–85 — verificação e custos
```json
{
  "number": 84,
  "pr": 671,
  "queueItem": 158,
  "feature": "Welcome-video editor confirms canonical provider, id and Vimeo hash before reporting saved settings; pending input locked and uncertainty preserves draft",
  "head": "279e29ce39c708f501f26626e0e677e990e6a17a",
  "commit": "0dad0238d40c58b47684e5195a0fa3661f0fda6b",
  "deployment": "dpl_JDwZhsSJcFAt6tmDXB8WiC3cp1wf",
  "readyUTC": "2026-10-20T07:54:09.927Z",
  "readyFortaleza": "2026-10-20 04:54:09",
  "mergedUTC": "2026-10-20T07:53:09Z",
  "mergedFortaleza": "2026-10-20 04:53:09",
  "run": 39387565039,
  "verify": 118510962096,
  "redis": 118510961678,
  "securityRun": 39387565552,
  "validation": "Full final-head CI lint/regressions/typecheck/build/security/Redis and synthetic browser passed72intercepted provider cases acrossYouTube/Vimeo/Loom and390/1280,hash/identity/HTTP/JSON/lostreply checks,pending lock,draft,actual alert contrast,globalfit. READY exactSHA/domainalias,6routes200sameDPL. No production private write/account/payment or external video opens. Noerror/fatal07:49:55.019–07:54:55.019UTC.",
  "limitations": "Removal-null logic not browser-covered; no claim of tested removal. Client+798characters,sameparser/request/response,no newprovider/price/allowance/gate. BindingM0 12.02–12.21%fails60%;salesclosed."
}
```

```json
{
  "number": 85,
  "pr": 672,
  "queueItem": 159,
  "feature": "Support settings confirm canonical saved amounts and order, lock pending fields and preserve drafts without claiming public availability",
  "head": "27eed319309207627f8fccfabb872f8ebb08aaa5",
  "commit": "aec20253827c53b5dc712ec8ed7a57da517e9715",
  "deployment": "dpl_FLvjKjaJuBfisTVKVQy2BPTa19f6",
  "readyUTC": "2026-10-20T07:58:33.668Z",
  "readyFortaleza": "2026-10-20 04:58:33",
  "mergedUTC": "2026-10-20T07:57:39Z",
  "mergedFortaleza": "2026-10-20 04:57:39",
  "run": 39388241653,
  "verify": 118513226829,
  "redis": 118513226686,
  "securityRun": 39388241646,
  "validation": "Full final-head CI lint/regressions/typecheck/build/security/Redis and synthetic browser passed34intercepted replies at390/1280:canonical saved amounts/order,pending locks,draft retention,invalid rejected indexes,real enhanced alert contrast,globalfit. READY exactSHA/domainalias,6routes200sameDPL,anonymous studio signinredirect expected. No production privatewrite/account/payment/checkout/email. Noerror/fatal07:54:24.922–07:59:24.922UTC.",
  "limitations": "Client+1221characters,sameparseTips/readTipAmount/POST/response,no newprovider/price/allowance/gate. Payment/fiscal/Stripeavailability unchanged. BindingM0 12.02–12.21%fails60%;salesclosed."
}
```


160. **[B2-STORE-FAQ-ACKNOWLEDGMENT] Confirmar lista canônica de perguntas e evitar corrida de edição**
   - Estado: **concluído; PR674 incorporado20/10/2026 05:22:36 Fortaleza; publicação funcional86 confirmada**.
   - Escopo: manual save só confirma HTTP/okbooleano/semcontradição e lista exata parseFaq,ordem/perguntas/respostas. Bloquear edição,reordenar,remover,adicionar,rascunhar enquanto salva, e salvar enquanto rascunha; aria-busy; incerteza pede conferir sem alegar nada mudou. Requisição de IA,pool/reserva/tetos/gates intactos.
   - Prova:30respostas manuais interceptadas em390/1280,normalização/ordem/lista/campos/perda/JSON/contradição,draftpreservado,controlesbloqueados,larguraglobal;nenhuma chamada deIAou gravação real. Remoção vazia e conclusão real deIA não estão cobertas nesta matriz.
   - Custo:cliente+802caracteres,mesmoPOST/snapshot/parseFaq;nenhumfornecedor/franquia/preço/gate novo.M0antes/depois12,02–12,21%reprova60%;vendas fechadas. Correção B2, não featureH.


### Publicação funcional86 — perguntas da loja
```json
{
  "number": 86,
  "pr": 674,
  "queueItem": 160,
  "feature": "Store questions require exact canonical saved list and order, lock racing edits/save/draft and preserve honest uncertainty",
  "head": "88209def578339ff85986314840dc71e0f7a4917",
  "commit": "7d89e212909c90f184d8aafb3ff053e9cf013b27",
  "deployment": "dpl_F2Kb3EZj2Msw9FHBhwaAhRU54K4y",
  "readyUTC": "2026-10-20T08:23:36.001Z",
  "readyFortaleza": "2026-10-20 05:23:36",
  "mergedUTC": "2026-10-20T08:22:36Z",
  "mergedFortaleza": "2026-10-20 05:22:36",
  "run": 39390863658,
  "verify": 118521765554,
  "redis": 118521765240,
  "securityRun": 39390863679,
  "validation": "Full final-head CI lint/regressions/typecheck/build/security/Redis and synthetic browser passed30intercepted manual replies at390/1280:canonical text/order,pending locks,draft retention,globalfit;AIrequests countedzero. READY exactSHA/domainalias;6routes200sameDPL,anonymous studio signinredirect expected. No productionprivatewrite/account/payment/email/AIcall. Noerror/fatal08:19:49.262–08:24:49.262UTC.",
  "limitations": "Emptyremoval andcompletedAIdraftnotcovered. Client+802characters,sameparseFaq/request/snapshot;AIrequest/reservation/pool/capsunchanged,no newprovider/price/allowance/gate. BindingM0 12.02–12.21%fails60%;salesclosed."
}
```


161. **[B2-PDF-PREVIEW-ACKNOWLEDGMENT] Confirmar páginas de prévia sem prometer disponibilidade**
   - Estado: **concluído; PR676 incorporado20/10/2026 05:50:10 Fortaleza; publicação funcional87 confirmada**.
   - Escopo: resposta POST usa id/preview do result.product já retornado pelo setter, sem leitura adicional; cliente exige HTTP/okbooleano/semcontradição/id/páginas exatos,aria-busy,duploenvio bloqueado,incerteza honesta. Sucesso confirma configuração, não geração/disponibilidade.
   - Prova:24respostas interceptadas em390/1280 com fixturegrowthPDFexistente de metadados;nenhumGETdeprévia/download/geração/upload/pagamento/conta real. Off e geração real não são alegados como cobertos pela matriz. Verificação completa obrigatória.
   - Custo:cliente+259caracteres,resposta+54caracteres de fonte,campos já retornados;nenhuma operação/leitura/fornecedor/franquia/preço/gate novo. TetosPDF/free-download/spendexistentes preservados.M0antes/depois12,02–12,21%reprova60%;vendas fechadas.


### Publicação funcional87 — confirmação da prévia
```json
{
  "number": 87,
  "pr": 676,
  "queueItem": 161,
  "feature": "PDF preview control confirms exact saved product/pages and honest uncertainty without claiming file generation or public availability",
  "head": "37aec1554e1e626da37f3a00a17deedef916759e",
  "commit": "177ecb7898727187a7708675ba9cd5c7687ad8be",
  "deployment": "dpl_Ei9d3tAb8NLb6b93nYtut9rSNoGm",
  "readyUTC": "2026-10-20T08:51:06.881Z",
  "readyFortaleza": "2026-10-20 05:51:06",
  "mergedUTC": "2026-10-20T08:50:10Z",
  "mergedFortaleza": "2026-10-20 05:50:10",
  "run": 39394157956,
  "verify": 118532617897,
  "redis": 118532618109,
  "securityRun": 39394157972,
  "validation": "Full final-head CI lint/regressions/typecheck/build/security/Redis and synthetic browser passed24intercepted replies at390/1280:HTTP/boolean/id/pages/JSON/lostresponse checks,pendinglock,globalfit;zeroPDFGET. READY exactSHA/domainalias;6routes200sameDPL,anonymous studio signinredirect expected. No productionprivatewrite/account/payment/PDFgeneration/download. Noerror/fatal08:47:21.689–08:52:21.689UTC.",
  "limitations": "Off andactualgenerationnotbrowsercovered. Client+259characters,route+54sourcecharacters;id/pagesfromexistingresult.product,no newread/provider/operation/price/allowance/gate. ExistingPDF/free-downloadlimitsunchanged. BindingM0 12.02–12.21%fails60%;salesclosed."
}
```


162. **[B2-PDF-STAMP-ACKNOWLEDGMENT] Confirmar configuração de marcação sem prometer que todo PDF será marcado**
   - Estado: **concluído; PR678 incorporado20/10/2026 06:14:38 Fortaleza; publicação funcional88 confirmada**.
   - Escopo: retornoPOST id/on a partir de result.product existente;clienteexigeHTTP/okbooleano/semcontradição/id/onexatos,erroapenaspropriedadespróprias,aria-busy e semduploenvio. Sucesso confirma configuração; fallback por tamanho/senha/arquivo permanece. GETnotas/efeito existente intactos.
   - Prova:26respostas interceptadas em390/1280 comgrowthPDFmetadata,zeroGETdecarimbo,semgeração/download/upload/pagamento real. Off e processamento real não cobertos;verificação integral obrigatória.
   - Custo:cliente+416caracteres,rota+49caracteresdefonte,camposjáretornados;nenhuma nova leitura/operação/fornecedor/franquia/preço/gate.M0antes/depois12,02–12,21%reprova60%;vendasfechadas.


### Publicação funcional88 — confirmação de marcação
```json
{
  "number": 88,
  "pr": 678,
  "queueItem": 162,
  "feature": "PDF marking control confirms exact saved product/on setting and own error messages without promising every file will be stamped",
  "head": "6932186b3fe3a8de014b16003dd7173316c58cba",
  "commit": "2f4cc2193627b624a4c04fe1688f602e8ee2833a",
  "deployment": "dpl_FyxN7Ns49pmffebZ8xFshDKVKtRP",
  "readyUTC": "2026-10-20T09:16:10.516Z",
  "readyFortaleza": "2026-10-20 06:16:10",
  "mergedUTC": "2026-10-20T09:14:38Z",
  "mergedFortaleza": "2026-10-20 06:14:38",
  "run": 39397125501,
  "verify": 118542494111,
  "redis": 118542494618,
  "securityRun": 39397125574,
  "validation": "Full final-head CI lint/regressions/typecheck/build/security/Redis and synthetic browser passed26intercepted replies at390/1280:HTTP/boolean/id/on/JSON/lostresponse/inheritederror checks,pendinglock,globalfit;zero stampGET. READY exactSHA/domainalias;6routes200sameDPL,anonymous studio signinredirect expected. No productionprivatewrite/account/payment/PDFprocessing/download. Noerror/fatal09:11:53.980–09:16:53.980UTC.",
  "limitations": "Off andactualprocessingnotbrowsercovered. Client+416characters,route+49sourcecharacters;id/onfromexistingresult.product,no newread/provider/operation/price/allowance/gate. ExistingGET/effect,size/password/unreadablefallbackunchanged. BindingM0 12.02–12.21%fails60%;salesclosed."
}
```


163. **[B2-MEMBER-NUDGE-ACKNOWLEDGMENT] Confirmar configuração de retorno sem prometer envio**
   - Estado: **concluído; PR680 incorporado20/10/2026 06:42:37 Fortaleza; publicação funcional89 confirmada**.
   - Escopo: parseNudge/snapshotexistentes,HTTP/okbooleano/semcontradição/on/addresscanônicos;bloquearcampos,aria-busy,semduploenvio;errosapenaspróprios;incertezahonesta e sucesso deconfiguração. Nãoalterarenvio/destinatários/consentimento/horários/limites/spend.
   - Prova:28respostasinterceptadas em390/1280 reutilizandopauseFixtures[0]recorrente,semnova conta;campos/errosherdados/JSON/perda/contradição/recusaconhecida/sucesso/globalfit;nenhumPOSTrealouemail. Desativação/envio realnãoalegadoscomocobertos;suíteintegralobrigatória.
   - Custo:cliente+613caracteres,mesmaoperação/resposta/parser;nenhumfornecedor/franquia/preço/gate novo.M0antes/depois12,02–12,21%reprova60%;vendasfechadas.


### Publicação funcional89 — confirmação de retorno
```json
{
  "number": 89,
  "pr": 680,
  "queueItem": 163,
  "feature": "Member return email settings confirm canonical saved on/address, lock pending fields and own error mapping without claiming delivery",
  "head": "b619469789e7393576c46ef5aee2a96a0fb4d908",
  "commit": "6ae2eda4a76b235546bf3737087f9e008013fd7f",
  "deployment": "dpl_EMNyWpRudZLy74xnvjtR57wmkrQ6",
  "readyUTC": "2026-10-20T09:43:36.160Z",
  "readyFortaleza": "2026-10-20 06:43:36",
  "mergedUTC": "2026-10-20T09:42:37Z",
  "mergedFortaleza": "2026-10-20 06:42:37",
  "run": 39400383090,
  "verify": 118553321574,
  "redis": 118553321434,
  "securityRun": 39400382746,
  "validation": "Full final-head CI lint/regressions/typecheck/build/security/Redis and synthetic browser passed28intercepted replies at390/1280:canonical on/address,HTTP/boolean/JSON/lostresponse/inheritederror,pendinglock,draft/globalfit;existingrecurringfixture,no newaccount. READY exactSHA/domainalias;6routes200sameDPL,anonymousstudio signinredirect expected. No productionprivatewrite/account/payment/email/provider call. Noerror/fatal09:39:53.996–09:44:53.996UTC.",
  "limitations": "Disableandrealemailnotbrowsercovered. Client+613characters,sameparseNudge/request/snapshot,no newprovider/operation/price/allowance/gate. Consent/recipients/schedule/spendunchanged. BindingM0 12.02–12.21%fails60%;salesclosed."
}
```


164. **[B2-164] Confirm the browser visit-exclusion setting accurately.**
- Estado: **Concluído e publicado na entrega 90**.
- Existing device setting must require successful HTTP, boolean confirmation, no contradictory error and the exact requested boolean before changing its displayed state. Pending controls lock and announce busy; uncertain replies request reloading to check.
- Synthetic intercepted cases cover both directions at 390/1280; no real cookie or account writes. Preserve cookie scope/expiry, stats permission and all limits. Same existing operation, no new provider or recurring cost; source +430 characters is not a bundled-byte measurement. Binding M0 remains 12.02–12.21%, fails 60%; sales closed and Hotmart features gated. Full final-head CI required before incorporation.


165. **[B2-165] Confirm after-payment note saves and removals accurately.**
- Estado: **Concluído e publicado na entrega 91**.
- Require successful HTTP, strict boolean confirmation, no contradictory error and the matching canonical note; removals require explicit null. Lock all fields while pending and preserve the creator draft on uncertain replies. Reuse existing note parsers and existing response; no additional data/provider operation.
- Synthetic intercepted save/removal cases at 390/1280; full final-head CI pending. Preserve creator content, all note limits and delivery behavior. Client source +728 characters is not bundled size; existing M0 12.02–12.21% still fails60%, sales and Hotmart features remain gated.


### Verified functional publication 90

```json
{
  "number": 90,
  "pr": 682,
  "url": "https://github.com/viniciussucupira/marktmorgen/pull/682",
  "head": "5f1e3b3c699811c67475d252e567e79f691d26c2",
  "sha": "749a7caa5422a17600724f5933cbc2ce05507d0c",
  "deployment": "dpl_8sJ1xBJZFRtQyfsE5azGTocgLZ4s",
  "domain": "marktmorgen.com",
  "mergedAt": "2026-10-20T10:09:38Z",
  "mergedFortaleza": "2026-10-20 07:09:38",
  "readyAt": "2026-10-20T10:10:34.969Z",
  "tests": {
    "product": 39403803309,
    "verify": 118564721529,
    "redis": 118564721842,
    "security": 39403803323,
    "syntheticCases": 40
  },
  "live": [
    {
      "path": "/",
      "status": 200,
      "marker": "dpl_8sJ1xBJZFRtQyfsE5azGTocgLZ4s"
    },
    {
      "path": "/signin",
      "status": 200,
      "marker": "dpl_8sJ1xBJZFRtQyfsE5azGTocgLZ4s"
    },
    {
      "path": "/studio",
      "status": 200,
      "marker": "dpl_8sJ1xBJZFRtQyfsE5azGTocgLZ4s"
    },
    {
      "path": "/platform/path",
      "status": 200,
      "marker": "dpl_8sJ1xBJZFRtQyfsE5azGTocgLZ4s"
    },
    {
      "path": "/pricing",
      "status": 200,
      "marker": "dpl_8sJ1xBJZFRtQyfsE5azGTocgLZ4s"
    },
    {
      "path": "/privacy",
      "status": 200,
      "marker": "dpl_8sJ1xBJZFRtQyfsE5azGTocgLZ4s"
    }
  ],
  "runtime": "No error/fatal logs 2026-10-20T10:06:18.479Z–2026-10-20T10:11:18.479Z",
  "changes": "Exact acknowledged browser visit-exclusion setting; strict HTTP/boolean/error/on confirmation, pending lock/busy and honest uncertainty.",
  "costs": "Same existing operation, cookie scope/expiry and limits; source+430 characters not measured bundle bytes; binding M0 12.02–12.21% still fails60%; sales remain closed."
}
```


166. **[B2-166] Confirm existing buyer-language settings accurately.**
- Estado: **Concluído e publicado na entrega 92**.
- Require successful HTTP, strict boolean confirmation, no error and the exact supported selected language. Lock the selector while pending and retain the draft on uncertainty. Preserve existing en/es/fr/de/it/nl/pt identifiers and creator content; no platform translation, new buyer language, AI call or gate activation.
- Synthetic26 intercepted cases at390/1280, full final-head CI pending. Existing settings operation only; client source+260 characters is not measured bundle size. M0 12.02–12.21% still fails60%; sales closed and future translations remain deferred under docs/site-languages.md.


#### B2-166 verification repair
Full run39407143422 failed pricing FAQ mobile axe target-size; all26 language cases passed. Fix FAQ summaries/links to at least44px high and separate wrapping footer links; retain axe checks and add explicit actual target-height checks plus diagnostic selectors. Full new-head CI required; no isolated rerun or accessibility certification. No new operation, plan limit or price.


### Verified functional publication 91

Prior run39404559381 failed four synthetic contradictory-response wording checks. Corrected client handling and reran the entire Product/Redis/security verification on the new head; no isolated rerun was used.

```json
{
  "number": 91,
  "pr": 683,
  "head": "b7e18d02f755645e7b7375c42a49b935fb790fba",
  "sha": "ffbeee19487f417bd97373546c6e31a521bbb52e",
  "deployment": "dpl_CMoS2rcjD6XGxR5XwwdQiVQmnTGZ",
  "domain": "marktmorgen.com",
  "mergedAt": "2026-10-20T10:34:46Z",
  "mergedFortaleza": "2026-10-20 07:34:46",
  "readyAt": "2026-10-20T10:35:37.183Z",
  "tests": {
    "product": 39406820644,
    "verify": 118574655031,
    "redis": 118574655306,
    "security": 39406820676,
    "syntheticCases": 44
  },
  "live": [
    {
      "path": "/",
      "status": 200,
      "marker": "dpl_CMoS2rcjD6XGxR5XwwdQiVQmnTGZ"
    },
    {
      "path": "/signin",
      "status": 200,
      "marker": "dpl_CMoS2rcjD6XGxR5XwwdQiVQmnTGZ"
    },
    {
      "path": "/studio",
      "status": 200,
      "marker": "dpl_CMoS2rcjD6XGxR5XwwdQiVQmnTGZ"
    },
    {
      "path": "/platform/path",
      "status": 200,
      "marker": "dpl_CMoS2rcjD6XGxR5XwwdQiVQmnTGZ"
    },
    {
      "path": "/pricing",
      "status": 200,
      "marker": "dpl_CMoS2rcjD6XGxR5XwwdQiVQmnTGZ"
    },
    {
      "path": "/privacy",
      "status": 200,
      "marker": "dpl_CMoS2rcjD6XGxR5XwwdQiVQmnTGZ"
    }
  ],
  "runtime": "No error/fatal logs 2026-10-20T10:31:09.995Z–2026-10-20T10:36:09.995Z",
  "changes": "Canonical note save and explicit-null removal confirmation; all fields locked while pending; creator draft preserved and honest uncertainty.",
  "costs": "Existing storage/provider operations and limits unchanged; no delivery operation added. Binding M0 still12.02–12.21%, fails60%, sales closed.",
  "failedPriorRun": 39404559381
}
```


167. **[B2-167] Confirm saved appearance choices accurately.**
- Estado: **Concluído e publicado na entrega 93**.
- Require successful HTTP, boolean confirmation, no contradictory error and exact saved theme/accent/badge/sold/font/backdrop. Lock appearance fields and Undo while pending; preserve draft on uncertainty. Existing response already returns look, no additional read or provider operation. Keep photo processing/requests, branding permission, counted-proof opt-in and contrast transforms unchanged.
- Synthetic32 intercepted appearance replies at390/1280, no photo operation; full final-head CI pending. Source+1086 characters is not a bundle measurement. M0 12.02–12.21% still fails60%; sales remain closed.


### Verified functional publications 92 and 93

Pricing FAQ repair history: run39407143422 caught mobile target-size;39409356932 caught summary label alignment;39410000127 caught expanded-indicator overflow. Corrections retained axe,44px actual target checks and fit checks; full final-head Product/Redis/security reruns passed. No isolated rerun or accessibility certification.

```json
[
  {
    "number": 92,
    "pr": 685,
    "head": "df9b88af6e4fbe4682e5ae22d438bc63475cda53",
    "sha": "766a81b34b9c8e813d39f11efb79d0d94ffe66dd",
    "deployment": "dpl_26FjeFB6q51kRKsy2focZrZr1wwb",
    "domain": "marktmorgen.com",
    "mergedAt": "2026-10-20T11:19:13Z",
    "mergedFortaleza": "2026-10-20 08:19:13",
    "readyAt": "2026-10-20T11:20:15.074Z",
    "tests": {
      "product": 39411931649,
      "verify": 118591544237,
      "redis": 118591544671,
      "security": 39411931821,
      "languageCases": 26,
      "faq": "axe,44px target-height and fit pass on home/pricing at390/1280"
    },
    "live": [
      {
        "path": "/",
        "status": 200,
        "marker": "dpl_26FjeFB6q51kRKsy2focZrZr1wwb"
      },
      {
        "path": "/signin",
        "status": 200,
        "marker": "dpl_26FjeFB6q51kRKsy2focZrZr1wwb"
      },
      {
        "path": "/studio",
        "status": 200,
        "marker": "dpl_26FjeFB6q51kRKsy2focZrZr1wwb"
      },
      {
        "path": "/platform/path",
        "status": 200,
        "marker": "dpl_26FjeFB6q51kRKsy2focZrZr1wwb"
      },
      {
        "path": "/pricing",
        "status": 200,
        "marker": "dpl_26FjeFB6q51kRKsy2focZrZr1wwb"
      },
      {
        "path": "/privacy",
        "status": 200,
        "marker": "dpl_26FjeFB6q51kRKsy2focZrZr1wwb"
      }
    ],
    "runtime": "No error/fatal logs 2026-10-20T11:16:15.177Z–2026-10-20T11:21:15.177Z",
    "changes": "Exact existing buyer-language confirmation and pending lock; pricing FAQ44px centered targets, separated footer links and bounded plus/minus disclosure.",
    "costs": "Same operations and existing language identifiers; no translation activation/provider call added; binding M0 still12.02–12.21%, fails60%, sales closed.",
    "priorFailedRuns": [
      39407143422,
      39409356932,
      39410000127
    ]
  },
  {
    "number": 93,
    "pr": 687,
    "head": "d8aa3a0f0f4716a3364228fedfe83e4fb4317e07",
    "sha": "016df7653695057bbfaa72b38ed4ba46cae72ee7",
    "deployment": "dpl_3pifn61QfKyir2BHXNNbweyzrnig",
    "domain": "marktmorgen.com",
    "mergedAt": "2026-10-20T11:21:53Z",
    "mergedFortaleza": "2026-10-20 08:21:53",
    "readyAt": "2026-10-20T11:23:26.743Z",
    "tests": {
      "product": 39412001904,
      "verify": 118591880785,
      "redis": 118591881216,
      "security": 39412002017,
      "syntheticCases": 32,
      "photoOperations": 0
    },
    "live": [
      {
        "path": "/",
        "status": 200,
        "marker": "dpl_3pifn61QfKyir2BHXNNbweyzrnig"
      },
      {
        "path": "/signin",
        "status": 200,
        "marker": "dpl_3pifn61QfKyir2BHXNNbweyzrnig"
      },
      {
        "path": "/studio",
        "status": 200,
        "marker": "dpl_3pifn61QfKyir2BHXNNbweyzrnig"
      },
      {
        "path": "/platform/path",
        "status": 200,
        "marker": "dpl_3pifn61QfKyir2BHXNNbweyzrnig"
      },
      {
        "path": "/pricing",
        "status": 200,
        "marker": "dpl_3pifn61QfKyir2BHXNNbweyzrnig"
      },
      {
        "path": "/privacy",
        "status": 200,
        "marker": "dpl_3pifn61QfKyir2BHXNNbweyzrnig"
      }
    ],
    "runtime": "No error/fatal logs 2026-10-20T11:19:00.840Z–2026-10-20T11:24:00.840Z",
    "changes": "Exact canonical appearance confirmation; six saved fields, pending controls/Undo locked, draft preserved on uncertainty.",
    "costs": "Existing appearance operation only; no extra read/provider/photo operation, permissions and limits unchanged; source+1086 characters not bundled size. M0 still12.02–12.21%, fails60%, sales closed."
  }
]
```


168. **[B2-168] Confirm store sections and news saves/removals accurately.**
- Estado: **Publicado — entrega94**.
- Require successful HTTP, strict boolean confirmation, no error and exact canonical section/news snapshots. Preserve legacy response count/on fields and add snapshots from the existing setter result, without an additional read. Pending controls lock and announce busy; uncertainty preserves creator drafts and confirms settings rather than public availability.
- Synthetic96 intercepted save/removal cases at390/1280; full final-head CI pending. Sections remain capped20/title60 and news120characters, same product IDs/permissions. Response snapshots bounded by existing caps, below existing40KB studio request sizing; no new operation/provider/paid unit or recurring cost. Client source growth is not measured bundle cost; binding M0 remains12.02–12.21%, fails60%; sales closed.


169. **[B2-169] Confirm collection content and persistent identifiers accurately.**
- Estado: **Publicado — entrega95**.
- Require successful HTTP, strict confirmation, no contradictory error and matching canonical collections/order. Existing IDs must match; new server IDs must be valid, unique and not reuse existing IDs. No browser ID is created for storage. Lock pending controls, retain uncertain drafts, update saved baseline after confirmation and confirm settings rather than public visibility. Wrap long collection addresses without hiding content.
- Synthetic84 intercepted create/edit/removal replies at390/1280; full final-head CI pending. Existing snapshot and parser, same operation/provider cost;12collections/24products/title60/blurb200 caps preserved. M0 remains12.02–12.21%, fails60%; sales closed.


170. **[B2-170] Confirm creator product picks accurately.**
- Estado: **Publicado — entrega96**.
- Require successful HTTP, strict confirmation, no error, matching product id and exact ordered pairs from the existing setter result. Add only the product id to the existing pairs response, no extra read. Lock pending selections, retain uncertain drafts and confirm settings rather than public availability. Preserve MAX_PAIRS3, identifiers and creator-attribution copy; no buyer/sales evidence is manufactured.
- Synthetic48 intercepted save/removal cases at390/1280; full final-head CI pending. Same operation/provider unit and visible caps, bounded response64-byte id plus3existing product ids; no new recurring cost. Source+634client characters not measured bundle size; M0 remains12.02–12.21%, fails60%, sales closed.


### Registro de publicações funcionais94–95 — 2026-10-20 (Fortaleza)

- **94 — PR#689**, incorporado às08:49:09; merge `ac522e01b741e5e12579729194cf2ff59f04cc47`. Seções e notícias validam snapshots canônicos antes de confirmar, bloqueiam controles pendentes e preservam rascunhos incertos. CI completo no head `4430c6096d8dd74b3aab442c25cb9499e279c557`: Product39415463727, verify118603369720, Redis118603369300 e security39415463644 aprovados, incluindo96 casos sintéticos de gravação/remoção em390/1280. READY às08:50:27.069, domínio marktmorgen.com, deployment `dpl_GQLppzHUJk8CAAUrPTijYGqjE47M`; seis rotas retornaram200 com esse identificador. Nenhum log error/fatal na janela11:46:13.926–11:51:13.926UTC.
- **95 — PR#690**, incorporado às08:51:41; merge `5a173ac3e581f92e39d3f5af8f110d93e950626a`. Coleções validam conteúdo/ordem e IDs persistentes, atualizam o baseline somente após confirmação e quebram endereços longos. CI completo no head `57c0d0640ab7119572aab2e478bece65b5f4a265`: Product39415926743, verify118604795201, Redis118604795371 e security39415926759 aprovados, incluindo84 casos sintéticos de criação/edição/remoção em390/1280. READY às08:52:43.525, domínio marktmorgen.com, deployment `dpl_HSh3UrVJmvCXQMKCefU2fFzpoPV5`; seis rotas retornaram200 com esse identificador. Nenhum log error/fatal na janela11:50:47.367–11:55:47.367UTC.
- Rotas verificadas em ambas: `/`, `/signin`, `/studio` (redirecionamento anônimo esperado), `/platform/path`, `/pricing`, `/privacy`. Fluxos privados foram verificados sinteticamente no CI, sem gravações autenticadas em produção. Sem certificação geral de acessibilidade ou margem.
- Custos94/95: nenhum novo provedor, operação, unidade paga ou custo recorrente; snapshots limitados pelos tetos existentes e derivados do resultado já obtido. Preços, limites, permissões, opt-in, conteúdo/idiomas/IDs e controles fiscais preservados. `PLANS_ON_SALE=false`, `COMMISSION_LIVE=false`; M0 vinculante12.02–12.21% continua reprovado para60%. Desconhecido não foi tratado como zero. Este registro documental não incrementa o contador.
- PR#691 (B2-170) permanece aguardando CI completo;48 casos previstos não são declarados aprovados antes do resultado. Registro empilhado nesse head para preservar a fila; incorporar somente após o PR#691 passar e ser incorporado. Tentativas de anexação de PRs ao chat encontram limite de100identidades; links e histórico são preservados, sem excluir anexos antigos.


171. **[B2-171] Confirm existing course/podcast enable acknowledgments before navigation.**
- Estado: **Publicado — entrega97**.
- Existing controls must require successful HTTP, strict boolean confirmation, no contradictory error and a valid32hex server course/podcast identity before navigation. Pending guard and own-property error lookup preserve honest uncertainty. No server operation or entitlement is added, no gated HT feature is activated.
- Synthetic48 intercepted replies planned at390/1280, including valid navigation and uncertain/invalid replies remaining in studio. Full final-head CI pending. Same request/response/provider/limits; no recurring cost or paid unit. Binding M0 remains12.02–12.21%, fails60%; sales closed. Existing creator content and persisted identifiers preserved.


172. **[B2-172] Confirm existing cart deal settings accurately.**
- Estado: **Publicado — entrega98**.
- Require successful HTTP, strict confirmation, no contradictory error and exact existing deal snapshot. Lock pending checkbox/minimum/percentage, preserve uncertain drafts, and confirm settings without claiming live checkout charges. Same request and setter response, no additional read or checkout operation.
- Synthetic52 intercepted on/off replies at390/1280 planned; full final-head CI pending. Preserve percentage5–50, minimum2/3/4 and MAX_CART4, prices, permissions and opt-in. No new provider/paid unit/recurring cost. Binding M0 remains12.02–12.21%, fails60%; sales closed. No HT feature activated.


### Histórico de verificação da pilha691–694 — 2026-10-20

- PR#691, head inicial `e424f83075ceca799bbc7aee6046e15ade854028`: Product39417616258/verify118610363512 falhou às09:02:10Fortaleza. Evidência: timeout de30s no localizador `getByLabel('Pick 1', exact:true)` ao buscar uma opção, em `tests/e2e/pairs-acknowledgment.mjs:29`, antes da primeira requisição dos novos casos. Redis/security passaram, mas isso não aprova o head nem os48casos.
- Corrigido o localizador dentro do editor de recomendações, verificando três seletores e usando o primeiro controle diretamente. Novo head691 `4e34f1fd316284a96777ebe39f4f6070bb231ecc`; correção incorporada com parentes reais aos heads692 `b1610415b30b4e5204640ed0f4f6df45078fe3b3`,693 `91731a4b9c355961e8dd37b6be0ad018af49ba79` e694 `5aeaeec1132b53af16926ee82f725bf211993a8f`, preservando as alterações de cada PR. Todos exigem CI completo no novo head; nenhum job isolado é usado como aprovação. Este registro cria outro head documental no694, também sujeito a verificações completas.
- PRs pendentes: [691](https://github.com/viniciussucupira/marktmorgen/pull/691), [692](https://github.com/viniciussucupira/marktmorgen/pull/692), [693](https://github.com/viniciussucupira/marktmorgen/pull/693), [694](https://github.com/viniciussucupira/marktmorgen/pull/694). Nenhum foi contabilizado como publicação funcional. Produção permanece na entrega95 confirmada; próximos números dependem de READY, domínio, SHA e verificações ao vivo.


173. **[B2-173] Confirm existing exit offer settings accurately.**
- Estado: **Publicado — entrega99**.
- Require successful HTTP, strict confirmation, no contradictory error and exact existing exitOffer id/null snapshot. Lock pending selection, preserve uncertain drafts and advance saved baseline only after confirmation. Confirm settings without claiming public delivery. Reuse existing setter response; no new operation.
- Synthetic44 intercepted enable/removal replies at390/1280 planned; full final-head CI pending. Free-published-product requirement, monthly frequency, desktop timing, unchecked email consent, page permission, prices and all identifiers/content preserved. No visitor/email/payment write in tests. No provider/paid unit/recurring cost added; binding M0 remains12.02–12.21%, fails60%; sales closed, no HT activation.


- **Histórico CI694 — 2026-10-20 09:19:37Fortaleza:** Product39419766746/verify118617602063 falhou ao localizar o mínimo do carrinho por texto exato do label. Evidência: timeout30s em `checkCartAcknowledgment:29`, antes dos novos casos. Corrigida a seleção para os IDs explícitos existentes `deal-min`/`deal-percent`, mantendo conteúdo e comportamento do produto. Redis/security passaram, mas não aprovam esse head. Correção propagada ao695; ambos exigem CI completo nos novos heads. Nenhuma publicação contabilizada.


- **Histórico CI693 — 2026-10-20 09:22:59Fortaleza:** Product39419542924/verify118616870620 falhou em quatro asserções de navegação confirmada (curso/podcast em390/1280); os48envios foram interceptados. O teste aguardava o evento de requisição e consultava o contador antes de o interceptador executar. Corrigido para aguardar a resposta sintética do destino antes da asserção, preservando todas as recusas e comportamento do produto. Correção propagada aos694/695, exigindo CI completo em cada novo head; nenhum job isolado aprova a alteração.


### Publicação funcional96 — 2026-10-20 (Fortaleza)

- **PR#691 incorporado às09:23:53**, merge `cc4c4d1e70848a4719c69863b4cc30a57287426f`, head corrigido `4e34f1fd316284a96777ebe39f4f6070bb231ecc`. Recomendações do criador validam HTTP, confirmação estrita, produto e ordem dos IDs; bloqueiam controles pendentes, preservam rascunhos incertos e confirmam configurações sem fabricar prova de compradores.
- CI completo aprovado: Product39419486390, verify118616577235, Redis118616576882, security39419486266. **48casos sintéticos interceptados** (gravação/remoção em390/1280) aprovados após a correção do localizador documentada acima; a falha anterior permanece no histórico e não aprovou nada.
- READY às09:24:54.127, domínio marktmorgen.com, deployment `dpl_7RQoAiaPfNv9AZPDN1mCjy2R6YSS`, SHA exato do merge. `/`, `/signin`, `/studio` (redirecionamento anônimo esperado), `/platform/path`, `/pricing`, `/privacy` retornaram200 com o mesmo deployment. Nenhum log error/fatal na janela12:20:47.559–12:25:47.559UTC. Fluxo privado verificado somente em testes sintéticos; sem gravação autenticada em produção.
- Custos: mesma requisição e resultado do setter, resposta limitada ao ID e MAX_PAIRS3; nenhuma leitura adicional, provedor, unidade paga ou custo recorrente. Preços, limites, conteúdo/idiomas/IDs, permissões/opt-in e controles fiscais preservados. PLANS_ON_SALE=false e COMMISSION_LIVE=false. M0 vinculante12.02–12.21% continua reprovado para60%; desconhecido não é zero, sem certificação de margem/acessibilidade.
- **PR#692 documental incorporado às09:26:17**, merge `93ec939794d79f3533183a67d08ef99cf7b6d3a0`, head `b1610415b30b4e5204640ed0f4f6df45078fe3b3`; Product39419537108/verify118616842418/Redis118616842611/security39419537668 aprovados. Registra94/95 e não incrementa o contador. Este registro96 está empilhado no695 para preservar correções e histórico; incorporar somente após693–695 passarem em todos os checks dos heads finais e serem incorporados.


- **Histórico CI695 — 2026-10-20 09:41:35Fortaleza:** Product39422031603/verify118625221987 falhou por timeout ao encontrar o editor da oferta, antes dos44novos casos. O teste reutilizava o dono alterado pela suíte de cópia. Substituído por fixture local sintética isolada com produto gratuito e sessão próprios, sem conta externa, pagamento ou mensagem. Fixture de demonstração e testes anteriores preservados. Correção propagada ao696; ambos exigem CI completo nos novos heads, sem contabilizar entrega.


### Publicações funcionais97–98 — 2026-10-20 (Fortaleza)

- **97 — PR#693 incorporado às09:43:54**, merge `e9d8f37e83c8ed0e466c6de6b587885506b31118`, head `53af2f7a54160fa903151dfd50cff2ffe883ca2e`. Controles existentes de curso/podcast exigem HTTP bem-sucedido, true estrito, ausência de erro e identidade válida antes de navegar; orientação honesta em incerteza, sem nova operação ou direito. Product39422009014/verify118625038444/Redis118625038721/security39422011866 aprovados no head final, incluindo48casos sintéticos interceptados em390/1280. READY às09:45:17.183, deployment `dpl_6Bod5XLuKYwHwdipmKEVGqzd61hT`, domínio marktmorgen.com e SHA exato. Seis rotas200 com o mesmo identificador; nenhum log error/fatal na janela12:40:52.524–12:45:52.524UTC.
- **98 — PR#694 incorporado às09:46:18**, merge `14e80c33bd44a7bae0e108d0acf0b23ca1cb05ab`, head `c88cae6a5a9e65172a87dec19eb3de098d9c1a5a`. Desconto de carrinho valida snapshot exato, bloqueia campos pendentes e preserva rascunhos incertos; confirma configurações sem alegar cobrança pública. Product39422021091/verify118625199863/Redis118625199507/security39422021082 aprovados, incluindo52casos sintéticos interceptados em390/1280. READY às09:47:20.495, deployment `dpl_AwC8jA5aJhgJXbpGSVZEkhMYDUqH`, domínio marktmorgen.com e SHA exato. Seis rotas200 com o mesmo identificador; nenhum log error/fatal na janela12:43:54.266–12:48:54.266UTC.
- Rotas: `/`, `/signin`, `/studio` (redirecionamento anônimo esperado), `/platform/path`, `/pricing`, `/privacy`. Fluxos privados testados sinteticamente no CI; sem gravação autenticada ou pagamento em produção. As falhas de localizadores/sincronização anteriores continuam no histórico; foram corrigidas com verificação completa dos novos heads, sem aprovação por job isolado.
- Custos97/98: mesmas requisições e resultados já existentes, nenhuma operação/leitura/provedor/unidade paga/custo recorrente adicional. Desconto5–50%, mínimo2/3/4 e MAX_CART4 preservados, assim como preços, idiomas/conteúdo/IDs, permissões, opt-in e controles fiscais. PLANS_ON_SALE=false e COMMISSION_LIVE=false. M0 vinculante12.02–12.21% continua reprovado para60%; desconhecido não é zero. Sem certificação geral de margem/acessibilidade nem ativação de HT.
- Registro documental empilhado no696 para preservar o histórico e a fixture corrigida do695; incorporar somente após695/696 passarem nos checks completos dos heads finais e serem incorporados. Não conta como nova publicação funcional.


### Publicação funcional99 — 2026-10-20 (Fortaleza)

- **PR#695 incorporado às10:01:36**, merge `8ee3fba1af59e3a939cecc9bad6ae6d5e9d5c88c`, head corrigido `0c496a301c19988877c5a64925869cec55f27eb2`. Oferta de saída exige HTTP bem-sucedido, true estrito, ausência de erro e snapshot exato do produto/null; bloqueia seleção pendente, preserva rascunho incerto e atualiza baseline somente após confirmação. Usa o mesmo resultado do setter; nenhuma operação adicional.
- CI completo aprovado: Product39424410479/verify118633188534/Redis118633188890/security39424410648, incluindo **44casos sintéticos interceptados** de ativação/remoção em390/1280, com fixture local isolada e sem conta externa, mensagem ou pagamento. A falha anterior do fixture compartilhado está preservada acima e não aprovou nada.
- READY às10:02:32.168, domínio marktmorgen.com, deployment `dpl_HWg3tX5bVprxWjQU9HFkffFvD337`, SHA exato do merge. `/`, `/signin`, `/studio` (redirecionamento anônimo esperado), `/platform/path`, `/pricing`, `/privacy` retornaram200 com o mesmo deployment. Nenhum log error/fatal na janela12:58:51.751–13:03:51.751UTC. Fluxo privado verificado apenas sinteticamente no CI, sem gravação autenticada em produção.
- Custos99: mesma requisição e snapshot existente, nenhuma leitura/provedor/unidade paga/custo recorrente adicional; exigência de produto gratuito publicado, frequência mensal, contexto desktop, consentimento de email desmarcado e permissão page preservados. Preços, limites, conteúdo/idiomas/IDs, opt-in e controles fiscais inalterados. PLANS_ON_SALE=false, COMMISSION_LIVE=false; M0 vinculante12.02–12.21% continua reprovado para60%. Desconhecido não é zero; sem certificação geral ou HT ativado.
- **PR#696 documental incorporado às10:04:16**, merge `306e3bfc25feafc4a7b046d5faf6c812e4b424b3`, head `44d1c439841452fd61566854860ac7d42ec5933f`; Product39424420869/verify118633337049/Redis118633336821/security39424420844 aprovados, incluindo44casos da fixture corrigida. Registra96 e não incrementa contador. Este registro99 está empilhado no697, aguardando checks completos e incorporação desse PR; documento não é entrega funcional.


174. **[B2-174] Confirm existing page-part ordering accurately.**
- Estado: **Publicado — entrega100**.
- Require successful HTTP, strict confirmation, no contradictory error and the exact returned order before confirming save/reset. Reuse existing bounded setter snapshot; no new read or operation. Lock and announce pending controls, preserve uncertain draft order and only advance local saved baseline after confirmation. Confirm settings rather than public visibility.
- Synthetic48 intercepted move-save/usual-reset cases planned at390/1280; full final-head CI pending. Preserve all eight persisted part IDs, usual-order and search-first behavior, creator content, page permissions and visible limits. No provider/paid unit/recurring cost added. M0 remains12.02–12.21%, fails60%; sales closed and no HT activated.


### Publicação funcional100 — 2026-10-20 (Fortaleza)

- **PR#699 incorporado às10:25:06**, merge `ae095dfdd9f939927af247321fb7e156295cc4bf`, head `3aa59c45281263cc053b22cef53279dae63a369d`. Salvar/restaurar a ordem da página exige HTTP bem-sucedido, true estrito, ausência de erro e snapshot exato; mantém rascunho incerto, bloqueia controles pendentes e avança baseline somente após confirmação. Mensagem confirma configuração, sem alegar visibilidade pública.
- CI completo aprovado: Product39427724429/verify118644396730/Redis118644396950/security39427724297, incluindo48casos sintéticos interceptados (mover/salvar e restaurar padrão em390/1280). Nenhuma gravação autenticada em produção; oito IDs persistidos, conteúdo, ordem padrão, precedência dos resultados de busca e permissões preservados.
- READY às10:26:34.335, domínio marktmorgen.com, deployment `dpl_EuJMzQw6H4QjHAV6QZZvhPRMQ4SV`, SHA exato do merge. `/`, `/signin`, `/studio` (redirecionamento anônimo esperado), `/platform/path`, `/pricing`, `/privacy` retornaram200 com esse deployment. Nenhum log error/fatal na janela13:22:22.657–13:27:22.657UTC. Fluxo privado verificado somente sinteticamente no CI.
- Custos100: mesmo snapshot limitado do setter, nenhuma leitura/requisição/provedor/unidade paga/custo recorrente adicional. Preços, limites, idiomas/conteúdo/IDs, permissões, opt-in e controles fiscais preservados. PLANS_ON_SALE=false, COMMISSION_LIVE=false; M0 vinculante12.02–12.21% continua reprovado para60%. Desconhecido não é zero; sem certificação geral de margem/acessibilidade ou HT ativado.
- **PR#697 documental incorporado às10:10:16**, merge `3684a5367529349e29324e6eaa8a77a33b56022f`, head `e77d2ea5ed0a038df85888142f90e920ea5edd96`; Product39425357044/verify118636429019/Redis118636429300/security39425357239 aprovados. **PR#698 documental incorporado às10:24:47**, merge `d055b55795c847da1fa2fb74894df05c0078fe1c`, head `d41e8b8b4a8f28f3cc7839912fc68830b9d1a1a6`; Product39427475120/verify118643550999/Redis118643551516/security39427475081 aprovados. Ambos registram entregas anteriores e não incrementam contador. Este registro100 também é documental.


175. **[B2-175] Confirm existing membership tier settings accurately.**
- Estado: **Publicado — entrega101**.
- Require successful HTTP, strict confirmation, no contradictory error and exact ordered tier IDs from the existing setter response. Lock pending selections, announce busy, preserve uncertain drafts and saved on/off status, and confirm settings without asserting live member switches. No new read, switch, payment, email or operation.
- Synthetic44 intercepted enable/disable replies plus single-selection refusal planned at390/1280, using an isolated local fixture with2memberships; full final-head CI pending. MIN_TIERS2/MAX_TIERS6, eligibility, product IDs/prices, entitlements and existing member-switch mechanics unchanged. No provider/paid unit/recurring cost added; M0 remains12.02–12.21%, fails60%; sales closed, no HT activation.


### Publicação funcional101 — 2026-10-20 (Fortaleza)

- **PR#701 incorporado às10:50:18**, merge `35f03221f1c89650575cc934a4c3cf91c2b582d1`, head `ecbc6d801a2e54da73c74eb68647999bafd8e56f`. Configurações existentes de níveis exigem HTTP bem-sucedido, true estrito, ausência de erro e IDs ordenados exatos; bloqueiam seleções pendentes, preservam rascunho/status salvos em incerteza e confirmam configurações sem alegar troca real de membro.
- CI completo aprovado: Product39431068827/verify118655957361/Redis118655957022/security39431068446, incluindo44casos sintéticos interceptados de ativação/desativação em390/1280 e recusa de seleção única. Fixture local isolada, sem chamada de Stripe, troca de membro, email ou pagamento; MIN_TIERS2/MAX_TIERS6, elegibilidade, preços/IDs e direitos preservados.
- READY às10:51:14.417, domínio marktmorgen.com, deployment `dpl_3Z4kgFHhBpG2bMEgcAyKhhq8f4vd`, SHA exato do merge. `/`, `/signin`, `/studio` (redirecionamento anônimo esperado), `/platform/path`, `/pricing`, `/privacy` retornaram200 com esse deployment. Nenhum log error/fatal na janela13:47:01.216–13:52:01.216UTC. Fluxo privado verificado somente sinteticamente no CI, sem gravação autenticada em produção.
- Custos101: mesma requisição/snapshot de configurações, nenhuma leitura/troca/email/pagamento/provedor/unidade paga/custo recorrente adicional. Preços, limites, conteúdo/idiomas/IDs, permissões/opt-in e controles fiscais preservados. PLANS_ON_SALE=false, COMMISSION_LIVE=false; M0 vinculante12.02–12.21% continua reprovado para60%. Desconhecido não é zero; sem certificação geral de margem/acessibilidade ou HT ativado.
- **PR#700 documental incorporado às10:44:46**, merge `07890e4148d9dd4a2213360da0f0e45b70d78d1b`, head `4fb9a6a1ac08bb506026239658ad35dd44c9c949`; Product39430751532/verify118654883245/Redis118654882762/security39430751442 aprovados. Registra100 e não incrementa contador. Este registro101 também é documental.


176. **[B2-176] Confirm existing failed-payment reminder settings accurately.**
- Estado: **Publicado — entrega102**.
- Require successful HTTP, strict confirmation, no contradictory error and exact reminder-count/card-notice snapshot from the existing setter result. Lock pending controls, announce busy and update local saved baseline only after confirmation. Preserve uncertain drafts and avoid claiming that nothing changed after an uncertain write.
- Synthetic48 intercepted settings replies planned at390/1280 for2/3reminders and card notice off/on, reusing the isolated local recurring fixture; full final-head CI pending. No email, Stripe/card mutation or payment occurs. Existing1–3reminder bounds,0/3/7day cadence,10day card horizon, eligibility/stop rules, permissions and costs unchanged. No new provider/paid unit/operation; M0 remains12.02–12.21%, fails60%; sales closed, HT gates preserved.


### Publicação funcional102 — 2026-10-20 (Fortaleza)

- **PR#703 incorporado às11:11:46**, merge `658f001a6f388cc09214410228f44d56b5ee440d`, head `f2963b92d65dc204bb056489249e4d9ab8de4cf2`. Configurações existentes de lembretes exigem HTTP bem-sucedido, true estrito, ausência de erro e snapshot exato de quantidade/cardNotice; bloqueiam campos pendentes e atualizam baseline somente após confirmação. Preservam rascunhos incertos e não afirmam que nada mudou após resposta incerta.
- CI completo aprovado: Product39434615235/verify118668222573/Redis118668222956/security39434615398, incluindo48casos sintéticos interceptados em390/1280. Fixture recorrente local isolada, sem email, alteração de cartão/Stripe ou pagamento. Limites1–3, cadência0/3/7dias, horizonte10dias, elegibilidade e regras de interrupção preservados.
- READY às11:12:44.221, domínio marktmorgen.com, deployment `dpl_HnmCj2amYAmbtc7j27egBjxZxHao`, SHA exato do merge. `/`, `/signin`, `/studio` (redirecionamento anônimo esperado), `/platform/path`, `/pricing`, `/privacy` retornaram200 com esse deployment. Nenhum log error/fatal na janela14:09:26.102–14:14:26.102UTC. Fluxo privado verificado somente sinteticamente no CI, sem gravação autenticada em produção.
- Custos102: mesma requisição/snapshot do setter, nenhuma leitura/email/cartão/pagamento/provedor/unidade paga/custo recorrente adicional. Preços, limites, idiomas/conteúdo/IDs, permissões/opt-in e controles fiscais preservados. PLANS_ON_SALE=false, COMMISSION_LIVE=false; M0 vinculante12.02–12.21% continua reprovado para60%. Desconhecido não é zero; sem certificação geral de margem/acessibilidade ou HT ativado.
- **PR#702 documental incorporado às11:10:45**, merge `87baaad2d491e6292c165bc1865e8f5e032a9546`, head `911b41ec357125058c4d594725a2b71d08e61e74`; Product39434338023/verify118667270828/Redis118667270253/security39434338149 aprovados. Registra101 e não incrementa contador. Este registro102 também é documental.


177. **[B2-177] Confirm existing yearly offer email settings accurately.**
- Estado: **Publicado — entrega103**.
- Require successful HTTP, strict confirmation, no contradictory error and exact canonical on/address snapshot from existing setter. Reuse browser-safe parseYearlyAsk normalization; lock pending controls and only update saved status/address after confirmation. Preserve uncertain creator drafts; confirm settings without claiming delivery or that nothing changed after uncertainty.
- Synthetic48 intercepted on/off replies planned at390/1280 using isolated recurring fixture and synthetic French address; full final-head CI pending. No email, yearly price, member switch, Stripe or payment operation occurs. Existing opt-in/list exclusion, once-per-membership cadence, eligibility/affiliate/cost rules and300character cap unchanged. No new provider/paid unit/operation; M0 remains12.02–12.21%, fails60%; sales closed, HT gates preserved.


### Publicação funcional103 — 2026-10-20 (Fortaleza)

- **PR#705 incorporado às11:38:08**, merge `b94eef4a60c2e74d598792e2ff01242a82e82d4f`, head `ad27ce86cf52ab64d6e315d3c349e5b38621b15b`. Oferta anual existente exige HTTP bem-sucedido, true estrito, ausência de erro e snapshot canônico exato on/address. Bloqueia campos pendentes, atualiza status/endereço salvos somente após confirmação e preserva rascunhos incertos; confirma configurações sem alegar entrega de email.
- CI completo aprovado: Product39437950639/verify118679892692/Redis118679892402/security39437950979, incluindo48casos sintéticos interceptados em390/1280 com endereço francês sintético. Sem email, preço anual, troca de membro, Stripe ou pagamento; opt-in, exclusão da lista, cadência uma vez por assinatura, elegibilidade e limite300caracteres preservados.
- READY às11:39:09.857, domínio marktmorgen.com, deployment `dpl_7Hda5pZFex3evGJzMB7y54sBAdQi`, SHA exato do merge. /, /signin, /studio (redirecionamento anônimo esperado), /platform/path, /pricing e /privacy retornaram200 com esse deployment. Nenhum log error/fatal na janela14:36:53.998–14:41:53.998UTC. Fluxo privado somente sintético no CI, sem gravação autenticada em produção.
- Custos103: mesma requisição/snapshot existente, nenhuma leitura/email/troca/pagamento/provedor/unidade paga/custo recorrente adicional. Preços, limites, conteúdo/idiomas/IDs, permissões/opt-in e controles fiscais preservados. PLANS_ON_SALE=false, COMMISSION_LIVE=false; M0 vinculante12.02–12.21% continua reprovado para60%. Desconhecido não é zero; sem certificação geral ou HT ativado.
- **PR#704 documental incorporado às11:35:50**, merge `a8215c4e8428582fb246be52f91dc570b18f7f70`, head `12e7147870844e7052b0d6126a54b8ccdc0fef72`; Product39437659387/verify118678862784/Redis118678862428/security39437659419 aprovados. Registra102 e não incrementa contador. Este registro103 também é documental.


178. **[B2-178] Confirm existing read-only numbers links accurately.**
- Estado: **Publicado — entrega104**.
- Require successful HTTP, strict true, no contradictory error, canonical label/revenue choice, valid existing20character ID, exact canonical URL and exact server-created lifetime (using the existing record creation time, independent of the creator device clock) before displaying a created link or clearing drafts. Removal confirms the existing requested ID in the same response; no extra read/write. Lock and announce pending controls; preserve uncertain label/password/choices and instruct reload before retry.
- Synthetic94 intercepted creation/revocation replies at390/1280 planned, with isolated local link fixture; full final-head CI pending. No link opened, password sent, third-party message, real account or payment. Existing5live-link cap,7/30/90days,8–100password bounds,300opens/day, read-only scope/revenue opt-in and settings permissions unchanged. No new provider/unit/operation/cost; M0 binding12.02–12.21% fails60%; sales and HT gates closed.


179. **[B2-179] Confirm existing session package settings accurately.**
- Estado: **Publicado — entrega105**.
- Require successful HTTP, strict true, no contradictory error and exact sessions/priceCents/days or explicit null from the existing setter response. Lock and announce pending controls, retain creator drafts and saved summary on uncertainty, and confirm settings without claiming checkout availability. No route change, new booking/payment or additional operation.
- Synthetic48 intercepted save/stop replies planned at390/1280 with isolated local weekly-call fixture. No real booking, account, message or payment. Existing2–20sessions, allowed use periods, prices/currency and already-bought session entitlements unchanged. No new provider/unit/cost; binding M0 still fails60%; PLANS_ON_SALE=false, COMMISSION_LIVE=false, HT gates closed.


180. **[B2-180] Confirm existing cancellation-question settings and retain reason IDs.**
- Estado: **Publicado — entrega106**.
- Require successful HTTP, strict true, no contradictory error and exact canonical on/reasons/creator words, valid unique own-reason IDs and unchanged previously persisted IDs. Adopt newly assigned IDs only after confirmed save, so the next save reuses the same counted reasons. Pending fields lock and announce busy; uncertain drafts and saved status remain; confirmation describes settings only.
- Synthetic58 intercepted enable/disable replies at390/1280 planned, including refusal to replace a known persisted ID. Existing mandatory other-reason choice,3custom reasons/80characters, opt-in, immediate cancellation route, entitlements, language/content and permissions unchanged. No real member cancellation, Stripe, message, account or payment; no extra read/write/provider/cost. M0 binding12.02–12.21% fails60%; sales and HT gates closed.


181. **[B2-181] Confirm existing checkout website allowlist accurately.**
- Estado: **Publicado — entrega107**.
- Require successful HTTP, strict true, no contradictory error and exact ordered canonical origins from the existing setter snapshot. Preserve raw uncertain drafts and saved allowlist baseline, lock the pending website list and announce busy/error. Confirm settings without claiming an actual checkout. The separate code generator keeps using the last confirmed list.
- Synthetic48 intercepted save/clear replies planned at390/1280 with existing isolated demo fixture; no listed website visited, checkout opened, signup submitted, third-party message, account or payment. Existing10origin cap, HTTPS-only parsing, strict origin/return-address permissions, buyer opt-in and visible limits unchanged. No new request/read/provider/unit/cost; binding M0 fails60%, sales and HT gates closed.


### Publicação funcional104 — 2026-10-20 (Fortaleza)

- **PR#707 incorporado às12:09:56**, merge `78e1d23da2c9f29af55a606c46d31f42b031a533`, head `9210720950381f7f62c4657a94fbe326afaf612f`. Links de números exigem HTTP bem-sucedido, true estrito, ausência de erro, ID válido, endereço canônico e label/receita/validade exatos; usam o horário já existente do servidor para validar duração sem depender do relógio do criador. Revogação confirma o ID solicitado na mesma resposta. Campos pendentes bloqueados; rascunhos/senha preservados em incerteza, com orientação de recarregar antes de repetir.
- CI completo aprovado: Product39442697854/verify118697230944/Redis118697230395/security39442697859, incluindo94casos sintéticos interceptados em390/1280. Sem abrir link, enviar senha/mensagem, conta ou pagamento real. Mantidos5links vivos,7/30/90dias, senhas8–100caracteres,300aberturas/dia, escopo somente leitura, receita apenas por opção e permissão settings.
- READY às12:10:56.798, domínio marktmorgen.com, deployment `dpl_2DRL2AzrREfvZbTJHgjBU1yMt3jA`, SHA exato do merge. /, /signin, /studio (redirecionamento anônimo esperado), /platform/path, /pricing e /privacy retornaram200 com esse deployment. Nenhum log error/fatal na janela15:06:37.224–15:11:37.224UTC. Fluxos privados apenas sintéticos no CI, sem gravação autenticada em produção.
- Custos104: mesmas operações/respostas limitadas já existentes; apenas metadado do registro já criado, sem nova leitura/chamada/provedor/unidade paga/custo recorrente. Preços, limites, idiomas/conteúdo/IDs, permissões/opt-in e controles fiscais preservados. PLANS_ON_SALE=false, COMMISSION_LIVE=false; M0 vinculante12.02–12.21% reprova60%. Desconhecido não é zero; sem certificação geral ou ativação de HT.
- **PR#706 documental incorporado às12:02:47**, merge `d2812b1ea60b1a5f7b27f20a27bb047d52d59c18`, head `af0ed88530ddec12170ebee1cd54a1b5396571c6`; Product39441741219/verify118693079154/Redis118693080798/security39441741299 aprovados. Registra103 e não incrementa contador. Este registro104 é documental, empilhado após710; não antecipar incorporação de708/709/710 ou contar documento como publicação funcional.


### Publicação funcional105 — 2026-10-20 (Fortaleza)

- **PR#708 incorporado às12:18:09**, merge `d61c3d7fa07278bfb696164ad29b0a656a4cba46`, head `ce6be80406c09474db933d1ec73dc112b0c9215d`. Pacotes existentes validam HTTP, confirmação estrita e snapshot exato de sessões/preço/prazo ou null; campos pendentes bloqueados, rascunhos e resumo salvos preservados em incerteza. Não altera preços reais ou sessões já compradas.
- CI completo aprovado: Product39444088624/verify118701444575/Redis118701444984/security39444087718, incluindo48casos sintéticos interceptados em390/1280. Sem mensagem a terceiros, conta, pagamento, checkout/cancelamento real ou gravação autenticada em produção.
- READY às12:19:11.549, domínio marktmorgen.com, deployment `dpl_3Kr7AVc5Yv7YWZhGcJ8tUYkwhYuH`, SHA exato. /, /signin, /studio (redirecionamento anônimo esperado), /platform/path, /pricing e /privacy retornaram200 com o mesmo deployment. Nenhum log error/fatal na janela2026-10-20T15:15:00.023Z → 2026-10-20T15:20:00.023Z. Fluxos privados somente sintéticos no CI.
- Custos105: mesmas operações/respostas limitadas já existentes, sem nova leitura/chamada/provedor/unidade paga/custo recorrente. Preços, limites, conteúdo/idiomas/IDs, permissões/opt-in, HTTPS/origens e direitos preservados. PLANS_ON_SALE=false, COMMISSION_LIVE=false; M0 vinculante12.02–12.21% continua reprovando abertura das vendas. Sem certificar margem geral. A classificação HT vigente consta em HT0 acima.


### Publicação funcional106 — 2026-10-20 (Fortaleza)

- **PR#709 incorporado às12:20:35**, merge `9fa40d3d12a25a042f8b0c15e41f2b123698336b`, head `47459d914a0ef064806ccb84cb90a664ba83a3d7`. Pergunta de cancelamento valida snapshot canônico e retém IDs atribuídos aos motivos do criador para salvamentos seguintes, sem substituir IDs conhecidos. Campos pendentes bloqueados; status e texto do criador preservados em incerteza. Sem cancelamento real ou alteração do caminho imediato de saída.
- CI completo aprovado: Product39444104330/verify118701495772/Redis118701496668/security39444104762, incluindo58casos sintéticos interceptados em390/1280. Sem mensagem a terceiros, conta, pagamento, checkout/cancelamento real ou gravação autenticada em produção.
- READY às12:21:28.037, domínio marktmorgen.com, deployment `dpl_BXp9otMt6kjtXTFw3Us6aMYkhBW7`, SHA exato. /, /signin, /studio (redirecionamento anônimo esperado), /platform/path, /pricing e /privacy retornaram200 com o mesmo deployment. Nenhum log error/fatal na janela2026-10-20T15:17:36.874Z → 2026-10-20T15:22:36.874Z. Fluxos privados somente sintéticos no CI.
- Custos106: mesmas operações/respostas limitadas já existentes, sem nova leitura/chamada/provedor/unidade paga/custo recorrente. Preços, limites, conteúdo/idiomas/IDs, permissões/opt-in, HTTPS/origens e direitos preservados. PLANS_ON_SALE=false, COMMISSION_LIVE=false; M0 vinculante12.02–12.21% continua reprovando abertura das vendas. Sem certificar margem geral. A classificação HT vigente consta em HT0 acima.


### Publicação funcional107 — 2026-10-20 (Fortaleza)

- **PR#710 incorporado às12:29:25**, merge `9b73b2f343bc28f3cf8233c345d01d13cb79cc95`, head `84ff6537fc3d133744b20c26ff8af183abd4a5c2`. Lista de sites do checkout valida exatamente as origens canônicas retornadas, mantém baseline salvo e rascunho incerto e bloqueia edição pendente. Gerador separado continua usando a lista confirmada; nenhuma promessa de checkout disponível ou visita aos sites.
- CI completo aprovado: Product39445553214/verify118706514838/Redis118706514432/security39445553199, incluindo48casos sintéticos interceptados em390/1280. Sem mensagem a terceiros, conta, pagamento, checkout/cancelamento real ou gravação autenticada em produção.
- READY às12:30:21.277, domínio marktmorgen.com, deployment `dpl_DBRMZ5U43YdQLN6GqrnuxctKT51q`, SHA exato. /, /signin, /studio (redirecionamento anônimo esperado), /platform/path, /pricing e /privacy retornaram200 com o mesmo deployment. Nenhum log error/fatal na janela2026-10-20T15:26:34.927Z → 2026-10-20T15:31:34.927Z. Fluxos privados somente sintéticos no CI.
- Custos107: mesmas operações/respostas limitadas já existentes, sem nova leitura/chamada/provedor/unidade paga/custo recorrente. Preços, limites, conteúdo/idiomas/IDs, permissões/opt-in, HTTPS/origens e direitos preservados. PLANS_ON_SALE=false, COMMISSION_LIVE=false; M0 vinculante12.02–12.21% continua reprovando abertura das vendas. Sem certificar margem geral. A classificação HT vigente consta em HT0 acima.

- **PR#711 documental incorporado às12:32:14**, merge `c7e5a802fe4ef750a9b8f946cd6213badc4e2630`, head `13bc4f43365f509a29ce5898b33d063c3cc3f9e8`; Product39446304453/verify118709017805/Redis118709017451/security39446304536 aprovados. Registra104, sem incrementar contador funcional.

182. **[HT0] Renomear a seção da Hotmart e separar os itens sem custo do gate de margem**
- Estado: **implementado e absorvido na versão179; reconciliação documental23/10/2026**. SeçãoHT,HT0imediatamenteabaixo e HT1–HT17naordem conferidos na fonte canônica, histórico preservado. Head65d84a8fa7c3cdd03789684ee6e09de0ce44323f,22/22,verify120309909474;READY/domínio/SHAexato/5rotas comprovados na entrega179. Não repetir código nem contar entrega nova; custos/documentos históricos não certificam60%ouAAA e gates permanecem fechados.
- Histórico preservado antes desta reconciliação: - Estado: **Implementado; aguardando verificação integral e incorporação documental**. Posição vigente: OR: andamento prioritário preservado, antes de 273 [BK1] e 275 [FX1]; conferir o histórico de publicações e executar somente o remanescente acionável.
   - Histórico OR — estado anterior à atualização documental: - Estado: **Implementado; aguardando verificação integral e incorporação documental**.
- Preparação iniciada em20/10/2026 às12:32:40 de Fortaleza (15:32:40UTC). Pedido direto do dono lido nesta conversa; hora original da mensagem não fornecida. Os números180[B2-180] e181[B2-181] já estavam ocupados antes desse pedido e foram preservados;182 era o próximo livre.
- Commit-base conferido: `c7e5a802fe4ef750a9b8f946cd6213badc4e2630`. Commit das alterações HT0: `d4f1bb01bd4a46d5d3394d6775c8936b38b14b34` (criado em2026-10-20 12:34:08 de Fortaleza).
- Alterações: seção no mesmo lugar entre publicação83 e continuação B2, renomeada H→HT;17subtítulos HT1–HT17 na mesma ordem e com textos preservados; subseção HT0 imediatamente abaixo do título e antes de Pedido do dono recebido. Referências posteriores da Hotmart passam a HT; os antigos [H1]/[H2]/[H3] e o prefixo histórico anterior à seção ficam intactos.
- Estados conforme pedido: liberados HT1/2/3/4/6/7/8/9/12/15/16/17; HT5 liberado somente com rascunho/pool/tetos/reserva existentes, sem nova chamada IA/custo. HT10 (se custo novo de fornecedor), HT11,HT13,HT14 condicionados a cálculo próprio no pior caso por cliente, plano e intervalo, pelo método de dimensionamento do add-on Store assistant e piso líquido mínimo60% após todos os custos/impostos; desconhecido reprova, item que não caiba não é implementado.
- M0 mais oneroso governa abertura das vendas, não edições sem custo variável. Nenhuma venda, preço, limite visível, comissão, PLANS_ON_SALE, tax gate, art.9a ou revisão comercial alterados. Nenhuma alegação pública de recurso inexistente ou margem certificada. Documentação apenas, sem custo novo ou incremento do contador funcional107.
- Verificações de integridade do texto em memória:17estados classificados, ordem/corpo das tarefas preservados, prefixo histórico e IDs antigos intactos. CI integral do head final pendente; incorporação e testes efetivos serão registrados após confirmação.
- Próxima execução: HT1,HT2,HT3,HT4,HT5,HT6,HT7,HT8,HT9,HT12,HT15,HT16,HT17; depois cálculos HT10/HT11/HT13/HT14; somente então novos B2. Cada HT iniciado recebe registro próprio ao fim com próximo número livre, commit, testes e publicação.


183. **[HT1] Hero orientado ao resultado do criador**
- Estado: **Publicado como funcional108; CI integral e produção exata confirmados**.
- Início:20/10/2026 às12:36:27 de Fortaleza, após conclusão/publicação dos PRs708/709/710 e implementação documental HT0 no PR712. Base conferida `586e6df03f485e6e0fee68e8a8a86db4b9d1aa9c`; commit de implementação: `04b77e0f1088ef0087ac8d5b388023ead2083321` (criado em2026-10-20 12:38:35 de Fortaleza).
- Reutiliza a home e HomeActions existentes, sem criar segundo mecanismo. Headline em inglês americano orientada ao trabalho/negócio do criador, subheadline primeira venda→próximas ofertas, pilar exato “Your store. Your Stripe. Your money.” preservado. Um CTA dominante para /signin; demo como link secundário; mesmo CTA grande repetido pela página. Sem promessa de ganhos, vendas garantidas ou recurso inexistente.
- Texto e hierarquia apenas: mesmas rotas, nenhuma chamada IA/provedor, leitura de dados, imagem, armazenamento, pool ou operação nova; nenhum custo variável por cliente adicional. Todos os preços/limites, PLANS_ON_SALE=false, comissão, tax gate, art.9a e revisão comercial preservados; aviso de venda fechada permanece visível. Não certifica margem de vendas.
- Teste sintético de navegador planejado em390/1280: CTA dominante único, destino/repetição/tamanho, ordem de teclado e navegação local para cadastro sem submissão/criação de conta, aviso de vendas fechadas, ausência de API write, largura e axe. Suite/compilação/segurança/Redis completas exigidas no head final; publicação só após READY/domínio/SHA exato.
- Documentação: docs/ht1-home-hero.md. Próximo item: HT2; nenhum B2 novo antes da sequência HT aprovada.

- Histórico de HT1: head `fb2aab77bdead03f6cb212ae13a09d6b5c75d26e`, Product39450325455/verify118723113197 reprovou em tap-targets.test.ts: link secundário com min-h-11 precisava declarar alinhamento vertical. Corrigido com inline-flex/items-center; nenhuma aprovação anterior presumida. Verificação completa obrigatória no novo head, sem rerun isolado.


184. **[HT2] Jornada do criador na página de recursos existente**
- Estado: **Publicado como funcional109; CI integral e produção exata confirmados**.
- Registro:20/10/2026 às12:41:40 de Fortaleza. Base conferida `fb2aab77bdead03f6cb212ae13a09d6b5c75d26e`; commit de implementação: `ecb387de5484b68d56d7be6462bc54c17abf45e5` (criado em2026-10-20 12:42:33 de Fortaleza).
- Reorganiza /platform, sem segunda página paralela: Create→Charge→Deliver→Sell more→Automate→Grow,18links para recursos reais já existentes em lib/feature-pages.ts, catálogo/âncora e escolhas por criador preservados. Texto em inglês americano, sem previsão de vendas; requisitos de Stripe, disponibilidade, plano, consentimento, custos e domínio visíveis nas páginas vinculadas. Aviso explícito de venda fechada enquanto PLANS_ON_SALE=false.
- Dados estáticos/texto/layout somente; mesmas rotas/assets/serviços, sem nova leitura de conta/provedor, armazenamento, IA, email ou operação. Links de recurso sem prefetch. Sem custo variável adicional por cliente; nenhum preço/limite, comissão, permissão ou gate fiscal/comercial/vendas alterado. Não certifica margem.
- Testes: resolução de todos os slugs contra as páginas existentes e ordem das seis etapas; navegador local sintético em390/1280 com GET200 dos destinos, teclado/alvos, catálogo/âncora, largura, axe e nenhuma API write. Sem cadastro, conta, checkout, mensagem ou pagamento real. CI integral no head final e publicação READY/domínio/SHA exato pendentes.
- Documentação: docs/ht2-creator-journey.md. Próximo item: HT3; nenhum B2 novo antes da ordem HT aprovada.

- Verificação HT2: CI integral39451679128 no head `54865f3c02c18bb1f77a866a2e4b1e6ca195c709` reprovou o salto para o catálogo nas duas larguras. O salto usa agora âncora HTML nativa, alvo com margem de rolagem e teste aguarda a navegação e confirma foco no título. Todos os heads derivados exigem CI integral novo; nenhum job isolado declara conclusão.


185. **[HT3] Valor antes do preço e comparação honesta do modelo de taxas**
- Estado: **Publicado — publicação funcional110 confirmada**.
- Registro:20/10/2026 às12:48:20 de Fortaleza. Base conferida `54865f3c02c18bb1f77a866a2e4b1e6ca195c709`; commit de implementação: `440f43d01e961e2b93f435fb23cd8e92d20926ac` (criado em2026-10-20 12:49:13 de Fortaleza).
- Home #pricing e /pricing reutilizam um componente estático único, com Checkout, Upsells, Affiliates, Funnels, Email automation, Community, Courses, Video calls, Analytics e CRM antes dos preços. Cada grupo aponta a recurso real já existente; nenhum recurso é ativado. Preços/limites/termos anuais/add-ons preservados.
- Reutiliza COMPETITOR_PRICES.hotmart, feeWords e a ToolsCalculator existente, sem segundo modelo/calculadora. Fontes oficiais rechecadas20/10: https://hotmart.com/en/pricing ; https://hotmart.com/en/legal/payments-policy (versão21/09/2026, seção5/tabelas); help oficial208298448. Política/tabela/FAQ atuais usam taxa fixaUSD1,00 para faixa geral; trecho antigo do help ainda mencionaUSD0,50. Escopo/limiares/moedas/custos extras e necessidade de orçamento aplicável permanecem explícitos; nenhuma promessa de custo total menor, ganhos ou margem certificada.
- Texto/layout/dados estáticos, mesmas páginas/rotas/assets, sem nova chamada de provedor/IA, leitura de conta, gravação ou operação. Nenhum custo variável adicional por cliente introduzido. Vendas continuam fechadas; nenhum preço/limite visível, comissão, permissão, consentimento, PLANS_ON_SALE, tax gate, art.9a ou revisão comercial alterado.
- Testes: categorias resolvidas a páginas reais e fonte/escopo datados existentes; navegador sintético390/1280 nas duas rotas verifica posição antes dos preços, links/teclado/alvos, fontes/condições/aviso fechado/calculadora, largura, axe e nenhuma API write. Sem pagamento, cadastro, conta, checkout, mensagem ou submissão externa. CI integral do head final e publicação exata pendentes.
- Documentação: docs/ht3-pricing-value.md. Próximo item: HT4; novos B2 permanecem depois da sequência HT.

- Verificação HT3: CI integral39451939003 no head `6dfd61c1a9b0e3189a0929ebea7107cbebb5b83a` reprovou o inventário de acessibilidade porque o componente compartilhado novo não estava listado. Registro adicionado a docs/accessibility-inventory.json; exige nova execução integral no novo head, sem rerun isolado. HT0 incorporado via PR712, merge `7e5b166093cbcb9737b6900f8abcde2285eb1902`, em20/10/2026 às12:55:08 de Fortaleza; Product39449636974, verify118720699159, Redis118720696721 e security39449637090 aprovados. Alteração documental, sem incrementar publicação funcional.

186. **[HT4] Completar a comparação existente com a Hotmart**
- Estado: **Publicado — publicação funcional111 confirmada**.
- Registro:20/10/2026 às12:56:49 de Fortaleza. Base conferida `e19fc44a46ac799088bb70ad05631c081675789d`; commit de implementação: `b1277da95f9586100d11dffa65d8f7f2ce707fef` (criado em2026-10-20T15:57:28Z, UTC; Fortaleza UTC−3).
- A página existente /proof/hotmart recebe comparação de prazos de saque, marca/domínio e dependências do ecossistema. Preserva preços canônicos, taxas e ressalvas existentes, vantagens reais da Hotmart, SEO, rota e inventário de comparações; nenhuma página duplicada.
- Fontes oficiais lidas20/10: política/taxas já registradas, artigo Hotmart360028608652 sobre disponibilidade de comissões, página oficial Club update-your-members-area e docs.stripe.com/payouts. Saque internacional pode começar em15 dias corridos, sujeito à garantia/elegibilidade; não confundir com BRL ou prometer saque imediato/mais rápido no Stripe. Hotmart Club tem personalização visual/domínio; não alegar ausência ou white-label completo. Domínio Marktmorgen segue configuração existente, plano, DNS e certificado.
- Somente conteúdo estático e links; sem novo fornecedor, chamada de IA/provedor, leitura de conta ou custo variável por cliente. PLANS_ON_SALE=false, preços/limites, comissão, permissões/opt-in, tax gate, art.9a e revisão comercial preservados. Nenhuma promessa de ganhos, custo total menor ou margem certificada.
- Testes: tradeoffs e links resolvidos contra páginas reais; navegador sintético390/1280 com texto/ressalvas/fontes, largura, axe e nenhuma API write. CI integral no novo head e publicação READY/domínio/SHA exato pendentes. Nenhuma conta, pagamento, mensagem ou submissão externa.
- Documentação: docs/ht4-hotmart-comparison.md. Próximo itemHT5, apenas reaproveitando o rascunho de IA existente com mesmo pool/tetos/reserva e nenhuma chamada nova; B2 continua depois da sequência HT.

187. **[HT5] Reaproveitar o rascunho existente e guiar até a primeira oferta publicada**
- Estado: **Publicado — publicação funcional112 confirmada**.
- Registro:20/10/2026 às13:04:00 de Fortaleza. Base conferida `8fdb7d499120e7de70bd05dcfedbe67ea49f98f4`; commit de implementação: `483bfb8d79ded92c62f3efa67e9dcf59ac5c9b71` (criado em2026-10-20T16:04:43Z; Fortaleza UTC−3).
- O mesmo rascunho aparece antes do checklist, com nome atual preservado, bio/FAQ e até3 produtos propostos revisados pelo criador. Mesma elegibilidade, rota, operação, pool, teto2500 e reserva; nenhuma chamada automática ou geração adicional. Nome continua sob controle do criador em Store details.
- Corrige a janela add-then-hide: os produtos do setup passam a nascer ocultos na gravação existente, eliminando uma gravação posterior. Nada é publicado automaticamente. Checklist existente orienta preparo e publicação explícita e reutiliza funnel-launch-checklist com rótulos de loja. StoreCoach preservado; store-guide é a operação de IA do comprador e não é chamada/ativada no onboarding.
- Novas lojas registram a primeira publicação explícita na mesma mutação limitada/lock existente, sem novo comando Redis, tabela, job, chamada ou gravação de visita; campos limitados pelo mesmo MAX_STORE_BYTES/reserva. Progresso e minutos são exibidos. Limite de evidência: mede cadastro da loja, explicitamente não um login anterior; o código existente não guarda data original de cadastro da conta. Lojas antigas/datas desconhecidas permanecem desconhecidas, sem backfill inventado; republicar não reinicia o marco.
- Sem custo variável novo: mesma reserva/limites de dados e IA; uma gravação removida do setup. Nenhum preço, limite visível, PLANS_ON_SALE=false, comissão, permissão/opt-in, tax gate, art.9a, revisão comercial ou idioma alterado. Publicação de cartão não abre checkout nem certifica margem.
- Testes sintéticos: criação já oculta, primeira publicação/manual/republicação, datas inválidas/históricas, nenhum fornecedor; navegador390/1280 com fixture isolada, resposta da única solicitação manual existente interceptada, checklist/progresso/preview/axe/largura. Nenhuma conta ou pagamento real, mensagem, IA real ou submissão externa. CI integral e publicação exata pendentes.

- Correção de verificação HT5: Product39454894591/verify118739058968 reprovou o alinhamento explícito do controle de abrir o checklist. O summary recebeu flex/items-center e indicador visual de expansão, mantendo44px e teclado nativo. Exige novo CI integral em cada head derivado, sem rerun isolado.

- Verificação posterior HT5: Product39456167133/verify118743492412 reprovou contraste do hero em390 durante a entrada animada; os mesmos casos nos headsHT2/3/4/6 passaram. O teste agora aguarda fontes e término das animações finitas antes do axe/captura, sem desativar regras de contraste. Exige CI integral no novo head e nos derivados integrados; não é rerun isolado.
- Documentação: docs/ht5-store-activation.md. Próximo itemHT6; B2 continua depois de todos os HT liberados/condicionados.

188. **[HT6] Esclarecer cadastro sem cartão, preços mensais e elegibilidade do teste**
- Estado: **Publicado; verificação integral e READY/domínio/SHA confirmados abaixo**.
- Registro:20/10/2026 às13:10:00 de Fortaleza. Base conferida `8af68eadf24ef80262471d3842c0078a8a390b22`; commit de implementação: `19b7368b4b1a4bbb604e8c7a1a8e9f3abee7979b` (criado em2026-10-20T16:10:27Z; Fortaleza UTC−3).
- Formulário existente já exige somente email visível, sem senha/cartão, com proteção antibot, passkeys, termos e privacidade preservados. CTA Email me a link descreve a ação real. Nenhum campo/request novo.
- /signin para novos criadores mostra primeiro os preços mensais canônicos de todos os planos e só depois o complemento de setup sem cartão. Pedir link não contrata/cobra. Com vendas fechadas, setup não é teste ativo/plano pago gratuito. Se os gates abrirem futuramente, o teste é qualificado à primeira loja elegível; lojas adicionais/retornantes não recebem promessa genérica. Escolha anual/mensal recebida e login retornante preservados.
- Texto/layout somente; nenhuma nova operação, email, conta, armazenamento, chamada ou custo variável por cliente. Preços/limites, PLANS_ON_SALE=false, comissão, permissões/opt-in, tax gate, art.9a e revisão comercial inalterados.
- Navegador sintético390/1280 verifica preços canônicos, um campo humano/email, ausência cartão/senha, CTA/avisos, ordem do preço, login retornante, axe/largura e nenhuma submissão. Sem email, conta, pagamento, mensagem ou submissão externa. CI integral e publicação READY/domínio/SHA exato pendentes.
- Documentação: docs/ht6-signup-clarity.md. PróximoHT7; nenhum B2 à frente dos HT.

### Publicação funcional108

HT1/PR713 incorporado em20/10/2026 às13:09:39 de Fortaleza; READY em13:11:16. Home destaca o negócio do criador, mantém o pilar Your store. Your Stripe. Your money., CTA principal e demo secundária. Versão exata `571c6cd4daf51162ec61ea0a4ead0b7b24ccbd90`, deployment `dpl_41YdBAiNcyCSpoM7kr4puoeJZb2E`, domínio marktmorgen.com confirmado. Product39451674299, verify118727821763, Redis118727822457 e security39451674487 passaram no head corrigido;56 verificações específicas, revisão visual390/1280, seis rotas200 com mesmo marcador e nenhum erro/fatal na janela16:07:01.641–16:12:01.641UTC. Nenhum custo variável novo ou gate alterado. Contador108, próximo109.

```json
{
  "number": 108,
  "pr": 713,
  "item": 183,
  "head": "1d5feb0852d3bd0244eeb4467eb61315f67d1a12",
  "sha": "571c6cd4daf51162ec61ea0a4ead0b7b24ccbd90",
  "mergedAt": "2026-10-20T16:09:39Z",
  "mergedFortaleza": "2026-10-20 13:09:39",
  "readyAt": "2026-10-20T16:11:16.455Z",
  "readyFortaleza": "2026-10-20 13:11:16",
  "domain": "marktmorgen.com",
  "deploymentId": "dpl_41YdBAiNcyCSpoM7kr4puoeJZb2E",
  "cases": 56,
  "ci": {
    "product": 39451674299,
    "verify": 118727821763,
    "redis": 118727822457,
    "security": 39451674487
  },
  "routes": [
    {
      "path": "/",
      "status": 200,
      "dpl": "dpl_41YdBAiNcyCSpoM7kr4puoeJZb2E"
    },
    {
      "path": "/signin",
      "status": 200,
      "dpl": "dpl_41YdBAiNcyCSpoM7kr4puoeJZb2E"
    },
    {
      "path": "/studio",
      "status": 200,
      "dpl": "dpl_41YdBAiNcyCSpoM7kr4puoeJZb2E"
    },
    {
      "path": "/platform/path",
      "status": 200,
      "dpl": "dpl_41YdBAiNcyCSpoM7kr4puoeJZb2E"
    },
    {
      "path": "/pricing",
      "status": 200,
      "dpl": "dpl_41YdBAiNcyCSpoM7kr4puoeJZb2E"
    },
    {
      "path": "/privacy",
      "status": 200,
      "dpl": "dpl_41YdBAiNcyCSpoM7kr4puoeJZb2E"
    }
  ],
  "runtimeErrors": 0,
  "runtimeWindow": "2026-10-20T16:07:01.641Z → 2026-10-20T16:12:01.641Z",
  "cost": "Static existing home hero; no variable client/provider/AI cost. Prices/limits/consent/sales/tax/art9a/commercial gates unchanged.",
  "visual": "390/1280 CI hero captures visually reviewed",
  "notified": true
}
```

189. **[HT7] Vitrine com autorização datada e somente demo enquanto não houver permissão real**
- Estado: **Publicado; verificação integral e READY/domínio/SHA confirmados abaixo**.
- Registro:20/10/2026 às13:15:00 de Fortaleza. Base conferida `3fdac83c8b70726342035f1c1915a34d4c8916ac`; commit de implementação: `fa47ee1c416fd607345833c45f3e3bc092c3c24e` (criado em2026-10-20T16:15:40Z; Fortaleza UTC−3).
- Home e /proof/creator-showcase reutilizam um registro estático de permissões revisadas. Nenhuma autorização real encontrada: somente Harbor Kitchen, explicitamente demo fictícia, sem foto/resultado/depoimento de cliente adicionado.
- Uma futura entrada real exige autorização expressa no escopo public-showcase, datas de concessão/registro e referência de evidência. Ausente, revogada, inválida, futura ou fora do escopo fica oculta; a data autorizada aparece, a referência privada não. Nenhuma inferência de resultado financeiro.
- Componente compartilhado incluído no inventário de acessibilidade; mesma infraestrutura/template/sitemap, sem nova leitura de conta, operação, fornecedor, foto/asset, armazenamento, mensagem ou custo variável por cliente. PLANS_ON_SALE=false, preços/limites, comissão, opt-in, tax gate, art.9a e revisão comercial inalterados.
- Testes: registro real vazio/demo; permissões sintéticas válidas e ausentes/revogadas/inválidas/futuras/fora do escopo. Navegador390/1280 verifica descoberta home/página, rótulo/link/data da demo, teclado/alvos, ausência de resultados inventados, axe/largura/nenhuma API write. CI integral e publicação exata pendentes. Nenhum contato, conta, pagamento ou submissão externa.
- Documentação: docs/ht7-creator-showcase.md. PróximoHT8; B2 fica depois da sequência HT.

190. **[HT8] Preparar contadores reais ocultos e corrigir datas não comprovadas de compras recentes**
- Estado: **Publicado; verificação integral e READY/domínio/SHA confirmados abaixo**.
- Registro:20/10/2026 às13:19:59 de Fortaleza. Base conferida `d6780f8f4afab4f6c3f7dd1c5829d248843b7de3`; commit de implementação: `2011d6a8d6a20eb864dc4cd43b883914978088ea` (criado em2026-10-20T16:20:29Z; Fortaleza UTC−3).
- Sem conjunto global auditado disponível: snapshot nulo e todos os contadores permanecem ausentes, nunca zero inventado. Preparados limiares configuráveis separados100lojas/1000vendas liquidadas/50criadores ativos30dias, contagem inteira exata e data visível. Evidência real/live, exclusão demo/teste, fonte, definição/janela e data válidas são obrigatórias; desconhecido, abaixo do limiar, fracionário, futuro ou desatualizado permanece oculto. Nenhum "+X", arredondamento para cima ou "vendo agora".
- Dados futuros somente a partir de exportações operacionais existentes auditadas/deduplicadas, com definição e evidência registradas, sem scan de contas em página pública ou nova operação agendada.
- Revisão recent-sales: eventos liquidados/live/opt-in, sem identidade,7dias/3cards/sem loop e verificação de reembolsos com cache5min preservados. Remove fallback de data ausente para "agora"; bloqueia timestamps/valores inválidos, registros futuros e produtos ocultos/removidos em cache usando catálogo já carregado. Nenhuma consulta Redis/provedor adicional.
- Mesmo orçamento/caps/cache/opt-in/idiomas e operações existentes; sem custo variável novo, fornecedor, conta, IA ou armazenamento extra. Preços/limites, PLANS_ON_SALE=false, comissão, tax gate, art.9a e revisão comercial preservados.
- Testes sintéticos: limiar/exato/nulo/fonte/datas; eventos sem data/futuros/cache/produto oculto e nenhuma chamada adicional. Navegador390/1280 confirma contadores reais desconhecidos ausentes e nenhuma write/notificação fictícia. CI integral/publicação exata pendentes. Nenhum pagamento, conta, mensagem ou submissão externa.
- Documentação: docs/ht8-platform-proof.md. PróximoHT9; B2 depois da sequência HT.

191. **[HT9] Reunir alavancas e evidência de pagamentos no studio sem estimativas**
- Estado: **Publicado; verificação integral e READY/domínio/SHA confirmados abaixo**.
- Registro:20/10/2026 às13:25:17 de Fortaleza. Base conferida `664147426333d0f87ab2fd4f9ec20c2b214d27c0`; commit de implementação: `12b37c83d560cc241c3b45842bf0e3fe3ed29e9b` (criado em2026-10-20T16:26:13Z; Fortaleza UTC−3).
- /studio/growth aponta, para quem pode ler estatísticas, à seção Grow your sales do studio. Seis alavancas com estado salvo/limitação da configuração e links existentes: order bump, upsell, downsell, bundles, checkout recovery e next offer. Mesma Store e leitura financeira já carregadas; nenhuma query Redis/provedor extra.
- Leitura dos últimos30dias UTC na moeda da loja, sem conversão ou projeção. Bump/bundle/recovery identificados mostram pagamentos brutos inteiros associados, explicitamente não receita separada do extra/efeito causal. Pagamentos depois do checkout incluem upsells e downsells; metadados atuais não distinguem receita histórica de downsell. Downsell-only e next-offer-only permanecem desconhecidos, nunca0inventado. Sem tags ou leitura parcial não certifica valor. Linhas podem se sobrepor/não somar; reembolsos, taxas, impostos e custos não são lucro medido.
- Disponibilidade padrão sem custo já existe para ofertas opcionais configuradas com produtos/termos reais; não há switch global novo, produto/preço a inventar. Aceite do comprador continua explícito. Conteúdo/opt-outs/permissões existentes preservados. Recovery tem email/consentimento/custos e next offer tem add-on/leituras/IA/reserva: nenhum é ativado automaticamente, custo desconhecido não é zero.
- Nenhuma nova operação, envio, conta, armazenamento, fornecedor, IA ou custo variável por cliente. Preços/limites, PLANS_ON_SALE=false, comissão, tax gate, art.9a e revisão comercial preservados.
- Testes sintéticos: pagamentos etiquetados/moeda/atribuição ausente/leitura parcial e estado imutável; navegador390/1280 verifica6linhas/ressalvas/sem controles de ativação/sem writes/teclado/axe/largura. Componente incluído no inventário. CI integral e publicação exata pendentes; nenhum pagamento, conta, mensagem ou submissão externa.
- Documentação: docs/ht9-sales-levers.md. PróximoHT12, seguidoHT15/16/17; só então custosHT10/11/13/14 e depoisB2.

### Publicação funcional109

HT2/PR714 incorporado em20/10/2026 às13:32:08 de Fortaleza. READY em13:33:12.648, versão `653b978ef808ba7cf1b00f23c7e3fa3ec8f92f0a`, deployment `dpl_NfPvNmWG8sC4aQPScPRMz9hwP2Ci`, domínio marktmorgen.com confirmado. Jornada6etapas em /platform, recursos reais e catálogo preservados, âncora nativa/foco corrigidos. Product39454833261, verify118738836351, Redis118738836809, security39454833211;170verificações específicas aprovadas no head corrigido. Sete rotas200 com marcador igual e nenhum erro/fatal em16:28:52.620–16:33:52.620UTC. Sem custo variável adicional ou alteração de gates. Contador109, próximo110.

```json
{
  "number": 109,
  "pr": 714,
  "item": 184,
  "head": "87e4e2fdfa492f65f51f9d457e38d92eb06e3ae7",
  "sha": "653b978ef808ba7cf1b00f23c7e3fa3ec8f92f0a",
  "mergedAt": "2026-10-20T16:32:08Z",
  "mergedFortaleza": "2026-10-20 13:32:08",
  "readyAt": "2026-10-20T16:33:12.648Z",
  "domain": "marktmorgen.com",
  "deploymentId": "dpl_NfPvNmWG8sC4aQPScPRMz9hwP2Ci",
  "cases": 170,
  "ci": {
    "product": 39454833261,
    "verify": 118738836351,
    "redis": 118738836809,
    "security": 39454833211
  },
  "routes": [
    {
      "path": "/",
      "status": 200,
      "dpl": "dpl_NfPvNmWG8sC4aQPScPRMz9hwP2Ci"
    },
    {
      "path": "/signin",
      "status": 200,
      "dpl": "dpl_NfPvNmWG8sC4aQPScPRMz9hwP2Ci"
    },
    {
      "path": "/studio",
      "status": 200,
      "dpl": "dpl_NfPvNmWG8sC4aQPScPRMz9hwP2Ci"
    },
    {
      "path": "/platform/path",
      "status": 200,
      "dpl": "dpl_NfPvNmWG8sC4aQPScPRMz9hwP2Ci"
    },
    {
      "path": "/pricing",
      "status": 200,
      "dpl": "dpl_NfPvNmWG8sC4aQPScPRMz9hwP2Ci"
    },
    {
      "path": "/privacy",
      "status": 200,
      "dpl": "dpl_NfPvNmWG8sC4aQPScPRMz9hwP2Ci"
    },
    {
      "path": "/platform",
      "status": 200,
      "dpl": "dpl_NfPvNmWG8sC4aQPScPRMz9hwP2Ci"
    }
  ],
  "runtimeErrors": 0,
  "runtimeWindow": "2026-10-20T16:28:52.620Z → 2026-10-20T16:33:52.620Z",
  "cost": "Static existing platform journey; no provider/account operation or new variable client cost. All sales/tax/art9a/commercial/prices/limits unchanged.",
  "notified": true
}
```

192. **[HT12] Cluster evergreen de guias práticos com FAQ visível e dados estruturados**
- Estado: **Publicado; verificação integral e READY/domínio/SHA confirmados abaixo**.
- Registro:20/10/2026 às13:35:31 de Fortaleza. Base conferida `275ef11290de759759efbb2fb5832120ff294bc9`; commit de implementação: `f27debb5147fec8a5824b7446b768ab6768e3af9` (criado em2026-10-20T16:35:30Z; Fortaleza UTC−3).
- Reutiliza journal/blog estático, template, sitemap e capas existentes. Quatro guias distintos: cursos, memberships, sessões pagas e programas de afiliados; URL e corpo anterior do guia de arquivo digital preservados e aprofundados. Cada guia tem escopo/entrega/aceite/testes específicos, links de recursos reais, interligação do cluster e CTA existente, sem promessas de demanda/ganhos/margem.
- FAQPage usa exatamente as3perguntas/respostas visíveis de cada um dos5guias, junto do BlogPosting existente; nenhuma promessa de rich result ou conteúdo apenas no schema. Índice facilita encontrar o cluster.
- CTA do blog qualifica teste da primeira loja elegível e respeita vendas fechadas; preparar loja não é teste ativo. learn.ts foi lido: é acesso/progresso de aluno pago, não CMS público de educação; apenas seu comportamento real informa o guia, sem alterar acesso/idiomas/identificadores.
- Somente conteúdo/template estático; sem nova operação, IA, email, conta, armazenamento, fornecedor ou custo variável por cliente. Preços/limites, PLANS_ON_SALE=false, comissão, opt-in, tax gate, art.9a e revisão comercial preservados.
- Testes: URLs únicas/conteúdo substantivo/FAQ/links reais; navegador390/1280 nos5guias comparaFAQvisível/schema, navegação/CTA/avisofechado/axe/largura/nenhuma write. CI integral e publicação READY/domínio/SHA exato pendentes; nenhum pagamento, conta, mensagem ou submissão externa.
- Documentação: docs/ht12-evergreen-guides.md. PróximoHT15, depoisHT16/17, custosHT10/11/13/14 e só depoisB2.


#### HT12 — correção de verificação integral (2026-10-20T16:52:29Z)

O CI integral do head d8b5f7c2bc0162f776da886429deb5d05759f7ad encontrou uma ocorrência de “afterwards” no guia de sessões, incompatível com o padrão en-US vigente. Corrigida para “afterward” no commit f23e100193e76839dc9c8bb9c8faafe10fbf2a81. Product checks 39459453441 / verify 118754920432: falhou; Redis e Dependency security passaram. Nova verificação integral obrigatória no novo head; nenhum job isolado reexecutado para declarar conclusão. Sem mudança de custos, preços, limites ou gates; publicação permanece pendente.


### Publicação funcional110

- Item 185; PR #715; incorporação em Fortaleza: 2026-10-20 13:34:10 (UTC−3). Head verificado `6579085b13fae9f93685639dc156b3eeeac14e43`; versão exata publicada `cf2c5a0b92f45186d73c816bf3c661e179ef0da8`.
- READY 2026-10-20T16:35:12.467Z; domínio marktmorgen.com confirmado no alias e nas rotas; deployment `dpl_F7618e1MiUQGq6H3RSoQu4ovaP8Z`. 6 rotas HTTP200 na mesma versão; 138 verificações específicas sintéticas aprovadas. Product checks 39454883085, verify 118739147060, Redis 118739146674 e Dependency security 39454883042: aprovados no head completo.
- Runtime: zero erros/fatais no intervalo 2026-10-20T16:31:36.317Z → 2026-10-20T16:36:36.317Z. Custos: sem nova operação/fornecedor ou custo variável; preços, limites, opt-in e gates fiscais/comerciais preservados. PLANS_ON_SALE=false, margem global não certificada. Contador incrementado somente após essas provas; aviso 110 já enviado.


### Publicação funcional111

- Item 186; PR #716; incorporação em Fortaleza: 2026-10-20 13:36:57 (UTC−3). Head verificado `45bb035291c19399e86ace7920ab94cafc8bfd05`; versão exata publicada `f9bca29fe6386648f76351de70955d4a93f7aa89`.
- READY 2026-10-20T16:38:13.894Z; domínio marktmorgen.com confirmado no alias e nas rotas; deployment `dpl_7Vx2JdDbxt5Uc6DyqUjTPe5LF6R1`. 7 rotas HTTP200 na mesma versão; 34 verificações específicas sintéticas aprovadas. Product checks 39454886874, verify 118739165109, Redis 118739164818 e Dependency security 39454887142: aprovados no head completo.
- Runtime: zero erros/fatais no intervalo 2026-10-20T16:35:33.246Z → 2026-10-20T16:40:33.245Z. Custos: sem nova operação/fornecedor ou custo variável; preços, limites, opt-in e gates fiscais/comerciais preservados. PLANS_ON_SALE=false, margem global não certificada. Contador incrementado somente após essas provas; aviso 111 já enviado.


193. **[HT15] Reunir os modelos existentes numa biblioteca com filtros, prévia e uso em rascunho**

- Estado: **Publicado; verificação integral e READY/domínio/SHA confirmados abaixo**.
- Registro:20/10/2026 às13:56:53 de Fortaleza. Base remota conferida `47f19942b46348ae36e0d61cce059cc8a5bc0f4c`; implementação `c488f4c03f38634c078331600575f8e957c17b70` (2026-10-20T16:56:53Z).
- Biblioteca privada em Growth reúne definições existentes de páginas, funnel-starters, mail-starters, layouts de email e saved-blocks; filtros por objetivo/tipo/texto e prévias locais. Sessões salvas só lidas por botão explícito na API privada existente; falha continua desconhecida, nunca vazia por suposição.
- Usar abre rascunho não salvo no editor existente, sequência pausada ou preview de setup existente do funil; não grava/importa/publica/ativa/envia automaticamente. Páginas, testes, variantes, textos dos criadores, idiomas e IDs persistidos preservados. Sequência existente no mesmo trigger não é substituída; gatilhos, limites, revisão e consentimento existentes mantidos.
- Sem chamada de IA ou fornecedor novo, novo pool/teto/reserva, job ou armazenamento. Operações explícitas existentes continuam sujeitas às quotas atuais. Nenhuma mudança de preço, limite visível, comissão, PLANS_ON_SALE=false, tax gate, art.9a ou revisão comercial. Piso líquido de60% continua obrigatório por cliente no pior cenário e global, todos os impostos; não há declaração de margem certificada ou vendas abertas.
- Testes adicionados: catálogo/filtros/destinos canônicos; fixture sintética isolada com página vazia e página existente; navegador390/1280 verifica filtros/prévias/leitura privada explícita, rascunho de página, conteúdo salvo preservado, placeholders de email, sequência pausada, largura/axe e nenhuma write. CI integral no head final obrigatório; publicação só conta após READY/domínio/SHA. Nenhuma conta real, pagamento, mensagem ou submissão externa.
- Proveniência: docs/ht15-template-library.md. PróximoHT16/17, depois cálculosHT10/11/13/14; nenhum B2 novo à frente.


#### Correção de regressões públicas compartilhadas — 2026-10-20 17:01:00 UTC

As execuções integrais identificaram contraste durante entrada animada no template público (Hotmart/mostruário) e, emHT7, contagem que incluía o CTA geral da demo além do único criador fictício. Removida a animação de opacidade da primeira dobra das páginas de tópico, mantendo conteúdo visível desde o início; auditoria AA preservada e diagnóstico detalhado adicionado. O teste deHT7 conta o registro na seção de listagens, separado dos CTAs de navegação. Sem exclusão de regra de contraste. CI completo obrigatório no novo head; nenhuma publicação contabilizada enquanto pendente. Sem novas operações, custos, preços, limites ou gates alterados.


194. **[HT16] Mostrar o studio real, esclarecer confiança e medir renderização móvel antes/depois**

- Estado: **Publicado; verificação integral e READY/domínio/SHA confirmados abaixo**.
- Registro em Fortaleza:2026-10-20 14:09:21.000 (UTC−3); implementação `9d13587ac912d35c6784ebf600966fcc789ab266` (2026-10-20T17:09:21Z); base remota `36219ed767b8d7ec128d23475c603653f759968a` conferida.
- Home com cards de categoria limpos e espaçosos, sem8fotos de banco; duas capturas distintas do próprio app com fixture fictícia, data e legenda honesta, sem imagem repetida ou cliente/resultado implícito. Capturas revisadas visualmente: studio/checklist e editor de página; origem verify118743492412/head6e145f31243af004b1feece62cbbb52f7ef7eb2d. Benefício, evidência e CTA existente agrupados. Conteúdo principal visível desde o início, sem entrada por opacidade.
- Home, preços e recursos compartilham sinais verdadeiros: conta Stripe própria e condições de payout/taxas, exportação dos registros autorizados, cancelamento pelo Account e política de reembolso da plataforma, separada do reembolso do produto do criador. Links aos termos/código existente, nenhuma promessa de ganhos ou vendas abertas.
- Pixels JPEG estáticos inline, dimensões1280×820, carregamento/decodificação preguiçoso, cada<140KB; sem nova requisição de imagem, otimização, host externo, evento analítico, fornecedor, IA, job operacional ou operação variável por cliente.219mil caracteres codificados/164KB decodificados; páginas públicas estáticas, sem importar imagens nos fluxos pagos de loja/comprador. Limites e cobrança vigente de host/CDN continuam vinculantes; não declarar banda grátis nem margem certificada.
- Matriz sintética isolada constrói baseline publicadof9bca29fe6386648f76351de70955d4a93f7aa89 e candidato exato, mesmo servidor local;3amostras/3páginas390×844, CPU4×,150ms,1,6Mbps, cache frio. Registra LCP/CLS/ponteiro→pintura e EventTiming; metasLCP<2,5s/CLS<0,1/interação<200ms, falha do candidato bloqueia conclusão. Proxy sintético não é INP real/p75/certificação Core Web Vitals; desconhecido não é zero. Resultados antes/depois a registrar após CI.
- Testes navegador390/1280: quatro termos/destinos reais, largura/axe, dois JPEGs únicos decodificados, rótulos sintéticos, zero write. Suíte inteira/lint/build/tipos/Redis/security e medições obrigatórios no novo head. Sem conta real, pagamento, mensagem ou submissão externa.
- PLANS_ON_SALE=false, preços/limites/opt-in/comissão/tax gate/art.9a/revisão comercial preservados;60% líquido por cliente no pior mês e global após todos os impostos permanece obrigatório. Evidência docs/ht16-public-design.md. PróximoHT17; depois custosHT10/11/13/14; nenhum B2 novo.


195. **[HT17] Dar um próximo passo claro aos textos compartilhados do site e do studio**

- Estado: **Publicado; verificação integral e READY/domínio/SHA confirmados abaixo**.
- Registro em Fortaleza:2026-10-20 14:12:43.000 (UTC−3); implementação `e168a4071963102057805cb4d8a593db9dbddc42` (2026-10-20T17:12:43Z); base remota `ea90ac789031f02b9661b9509cbfef973557e444` conferida.
- Registro existenteSTUDIO_MESSAGES revisado para permissão/recuperação/acesso, espaço de arquivo e de registros, upload interrompido, cota horária e indisponibilidade. Frases curtas em inglês americano: o que aconteceu, o que revisar/tentar, condição real. Sem censurar a pessoa nem sugerir aumento de plano indisponível. Todos os códigos persistidos de erro permanecem iguais; recusa não vira sucesso.
- Página de erro global mantém referência e retry/navegação, sem prometer retorno “shortly”.404 pede conferir o endereço e oferece Home/Help, sem inventar por que a loja sumiu. Introduções compartilhadas de recurso/Growth orientam a ação sem prometer venda ou resultado. Passe em templates compartilhados; conteúdo de criadores, emails/sequências, idiomas de compradores e IDs não foram reescritos.
- Testes: chaves de recusa preservadas, próxima ação e sem falso sucesso; boundary real renderizado com referência/retry; navegador390/1280 no404 verifica título, destinos, ausência de motivo inventado, status/largura/axe e zero write. Suíte inteira, build/tipos/lint, Redis/security e medições herdadas deHT16 obrigatórios no head final; READY/domínio/SHA antes de contar publicação.
- Nenhuma nova IA, fornecedor, operação variável, conta, pagamento, mensagem ou submissão externa. PLANS_ON_SALE=false, comissão, preços/limites, permissões/opt-in, tax gate/art.9a/revisão comercial preservados. Piso líquido60% por cliente usando100% no pior mês e global após todos os impostos Brasil/EUA continua obrigatório, sem certificação de margem.
- Documentação: docs/ht17-partner-copy.md. Próximos: cálculos própriosHT10,HT11,HT13,HT14, nessa ordem; implementar somente o que couber. Novas revisõesB2 só depois.


#### HT15 — verificação de identificador da biblioteca privada

Product checks39462624653/verify118766157526 aprovou regressões mas recusou o build: statsId pode ser null em loja sem histórico. A biblioteca agora só lê uma seção salva quando o identificador existe; ausência preserva a página e apresenta estado não confirmado, sem ler outra loja nem inventar seção vazia. CI integral novamente obrigatório no novo head; sem reexecução isolada ou publicação contada.


196. **[HT10] Unir navegação de pixels e atribuição preservando consentimento e custo existente**

- Estado: **implementado e absorvido na versão179; reconciliação documental23/10/2026**. Fonte e teste real publicados179 conferidos: centralpixels/atribuição, consentimento/GPC,retornoestrito,390/1280;6gravaçõesinterceptadas. Head65d84a8fa7c3cdd03789684ee6e09de0ce44323f,22/22,verify120309909474;READY/domínio/SHAexato/5rotas comprovados na entrega179. Não repetir código nem contar entrega nova; custos/documentos históricos não certificam60%ouAAA e gates permanecem fechados.
- Histórico preservado antes desta reconciliação: - Estado: **Cálculo próprio registrado antes da implementação; implementado; CI integral e publicação pendentes**. Posição vigente: OR: andamento prioritário preservado, antes de 273 [BK1] e 275 [FX1]; conferir o histórico de publicações e executar somente o remanescente acionável.
   - Histórico OR — estado anterior à atualização documental: - Estado: **Cálculo próprio registrado antes da implementação; implementado; CI integral e publicação pendentes**.
- Registro UTC:2026-10-20 17:16:50 UTC; Fortaleza UTC−3. Base canônica da sequência conferida `98690ce0ca790bc8ab691e2721890362a4f1b57d`. Revisão antes de código em docs/ht10-cost-review.md.
- Escopo autorizado sem custo novo: configuraçõesMeta/Google/TikTok/Pinterest e atribuição por canal já existem; apenas navegação entre elas, explicação visível de consentimento/GPC e confirmação local estrita do retorno das duas gravações existentes. Nenhuma nova operação, endpoint, provider/IA, pixel/evento, job, retenção ou direito de uso; mesmo custo nos tetos atuais. Não iniciar anúncios nem conectar conta.
- Custo adicional de fornecedor por cliente no pior mês:US$0/mês eUS$0/ano em Store/Studio/Scale, ambos intervalos. Leitura de dimensionamento existente, com todos custos/impostos/reservas e maior taxa por cobrança, permanece60,31/60,59/60,38/60,06/60,46/60,07% nos6cenários (Store mês/ano, Studio mês/ano, Scale mês/ano), sem preço/limite/receita nova. Não confundir com gateM0: leitura tributária mais onerosa continua12,02–12,21%, reprovada para vendas. Desconhecido reprova; operação nova exige cálculo antes de uso.
- PLANS_ON_SALE=false, comissão, preços/limites, permissões/opt-in/GPC, tax gate/art.9a/revisão comercial preservados. Cálculo é de delta zero sob os contadores existentes, não certificação de margem global nem abertura de vendas. Testes/commit funcional/publicação pendentes; nenhum contador incrementado por este registro.


#### HT10 — implementação após cálculo próprio

- Cálculo prévio `eca67f388ea9b6df86f6109e3ab399617f5899d6`; implementação `9e515fa272b878ca08a371e80fd0edf52b77c380` (2026-10-20T17:23:01Z; Fortaleza 2026-10-20 14:23:01.000,UTC−3). Mesmo número de operações/custos/tetos existentes; nenhum custo novo de fornecedor.
- Centro existente ligaPixel IDs↔Numbers/atribuição conforme papel. Consentimento/GlobalPrivacyControl visíveis antes da edição. Confirmação dos saves exigeHTTPok, booleanotrue, ausência de erro contraditório, pixels canônicos completos iguais ao pedido e janela exata válida. Inputs bloqueados durante gravação, rascunhos não confirmados preservados; texto do relatório só usa janela confirmada, com retry explícito.
- Bug de consentimento corrigido: antigo “yes” salvo não prevalece mais sobreGPC; navegador mantémoff e apaga cookie de consentimento servidor. allowedBy também recusaSec-GPC:1 com cookieyesantigo, antes de reter contexto/enviar evento. Mesmo ask-first das regiões/countrydesconhecido, nenhuma permissão/opt-in relaxado; requisições evitadas não geram novo custo.
- Testes hostis/unitários de resposta, todas janelas, matrizGPC/escolha/região e servidor; navegador390/1280 nos formulários existentes com gravações interceptadas, erros/rascunhos preservados, confirmação exata, links/consentimento/axe/largura; loja sintética comyesantigo+GPC deve fazerzerochamadas a fornecedor ou eventos. CI integral e evidência de produção pendentes. Docs/ht10-pixels-attribution.md. PróximoHT11,HT13,HT14; nenhum B2 novo.


#### Contraste do corpo de páginas de tópico — 2026-10-20 17:24:39 UTC

Diagnóstico detalhado deHT7 identificou que os blocos .reveal do corpo ainda estavam em transição de opacidade (texto efetivo#888c91/#979a9e em fundo#f7f5f0; contraste2,59–3,10:1). O cabeçalho já estava estático. Removidas também as classes de reveal dos blocos desse template: conteúdo legível e opaco desde o início, incluindo navegação entre páginas. Sem aguardar artificialmente para esconder falha, sem desativar regraAA. Execuções anteriores39462581781/39462582467/39462598661/39462608086 reprovadas ficam históricas; nova suíte integral obrigatória em cada head corrigido. Sem nova operação/custo ou gates alterados.


### Publicação funcional112

- Item187/HT5, PR717 incorporado emFortaleza 2026-10-20 14:21:34 (UTC−3); head completo `954e08b179c617857f469c8a8820c8514d2ae773`; versão exata `867e2d662deea90815301d1cf3ac0fd0d35e47b9`.
- READY 2026-10-20T17:24:31.031Z; domíniomarktmorgen.com confirmado noalias; deployment `dpl_6mGWc4g3TKNuPFo95VM2bSSmbrxz`.6rotasHTTP200 na mesma versão;26verificações específicas HT5, regressões/build/lint/rotas, Redis e segurança aprovados. Product checks39462549165, verify118765470574, Redis118765470018, Dependency security39462548934.
- Runtime:zeroerros/fatais no intervalo 2026-10-20T17:21:11.802Z → 2026-10-20T17:26:11.802Z. Rascunho de IA existente/manual, mesmos pool/tetos/reserva, sem operação automática nova; checklist e tempo até primeira oferta usam gravação existente. Nomes/conteúdo e todos gates preservados, vendas fechadas. Contador112 incrementado apenas após essas provas; aviso112 já enviado.


197. **[HT11] Avaliar o custo da comunidade de clientes por estágio antes de abrir o espaço**

- Estado: **Avaliação concluída; reprovado por custo desconhecido; não implementado; aguardando dono para escopo/teto/reserva de operação**.
- Registro UTC:2026-10-20 17:30:22 UTC; Fortaleza UTC−3. Repositório e custos revistos antes de qualquer operação: comunidade/Discord existentes pertencem ao criador e aos compradores de seus produtos; não há destinoMarktmorgen validado nem mapa de acessoStarting/First sales/Growing para clientes. Bot existente não lê/escreve mensagens. Nenhum espaço, canal, papel, conta ou convite criado.
- docs/ht11-community-cost-review.md registra os6cenários: custo incremental de operação/moderação/suporte/manutenção/retencão/notificações e reserva é desconhecido em cada plano/intervalo; lucro líquido depois do item é desconhecido e portanto reprovado, nunca zero. Custo de assinatura de fornecedor zero não prova operação sem custo. Não emprestar teto da comunidade vendida por outro criador nem compensar um cliente com outro.
- Método: uso100%/pior mês/12janelas anuais, maior taxa e reservas/impostos do dimensionamentoStore assistant; ausência de custo/teto bloqueia este item por si, separadamente doM0 mais oneroso para vendas. Comunidade por estágio continua apenas requisito futuro, sem classificação por faturamento declarado ou promessa de resultado. Código/comunidades/permissões/idiomas existentes preservados.
- Sem operação/teste externo real, nova cobrança, fornecedor, IA, mensagem, conta ou submissão. PLANS_ON_SALE=false, comissão, preços/limites/opt-in e gates fiscais/comerciais inalterados. Revisão documental/fullCI do head final pendente; documento não conta publicação. SeguirHT13 eHT14 sem aguardar.

- Commit da avaliaçãoHT11: `eb0415faddb561c3f8c5ffd9bd4cc3ec283fa057`, criado2026-10-20T17:30:24Z; FortalezaUTC−3. Não houve implementação operacional nem alteração de direito.

198. **[HT13] Calcular o custo e verificar fontes privadas antes de oferecer tutor de aluno**

- Estado: **Avaliação concluída; custo completo/teto de recuperação de curso desconhecido; reprovado; tutor não implementado; aguardando dono para escopo/reserva precificados**.
- Fontes: answers-rules/answers atuais respondem pré-compra com fatos públicos; não carregam lições nem provam acesso ao curso. Store0/Studio250/Scale400 respostas incluídas já são direitos existentes no pior mês; não podem financiar tutor novo quando100%já é usado. Store assistant é add-on separado, não autorização implícita de novas leituras privadas/transcrição.
- Referência de dimensionamento, não oferta/limite novo:700respostas adicionais×US$0,003539 dáUS$2,4773, arredondado conservadoramenteUS$2,48/mês eUS$29,76/ano, antes de recuperação/acesso/transcrição. Com custos/taxas/reservas e27,5% de imposto de lucro do dimensionamento existente, líquido de referência:Store mês57,71%, ano57,47%;Studio mês59,99%, ano59,59%;Scale mês60,29%, ano59,86%. Cinco de6já ficam abaixo de60%; os custos completos desconhecidos reprovam todos. Valores usam linhas em centavos da tabela vigente; não são cotação de um tutor ou certificação tributária.
- docs/ht13-student-tutor-cost-review.md registra ausência de método revisado para todos bytes/leituras/permissões/revalidação/cache/retenção e fontes autorizadas por curso. Vídeo sem transcrição existente não autoriza operação nova de legenda nem resposta por conhecimento geral. Não reduzir limites visíveis, inventar cota minúscula para forçar aprovação, mudar preço ou consumir reserva de outro direito/cliente.
- Tutor novo, endpoint, toggle, chamadas e alegações públicas não implementados. Q&A público, Store assistant, encaminhamento e acesso do aluno existentes preservados; futuro design exige custo por plano/intervalo e reserva antes de operar, fonte exclusiva do curso, rótulo desenhado pela página e fallback ao criador. M0 mais oneroso continua vinculante para vendas, separadamente desta reprovação própria.
- Nenhuma conta real, pagamento, fornecedor/IA novo, mensagem, submissão externa ou tradução ativada. PLANS_ON_SALE=false, comissão, preços/limites/permissões/opt-in/tax gate/art.9a/revisão comercial intactos. Commit da avaliação e CI integral do head final registrados a seguir; documento não conta publicação. SeguirHT14;B2 só depois.

- Commit da avaliaçãoHT13: `c3ea20f2d81f0c9eedbee819dfcf9dc618a01eca`, criado2026-10-20T17:31:03Z; FortalezaUTC−3. Exige nova revisão de custos antes de futura implementação; nenhuma chamada de teste ao modelo.


#### Janela da verificação integral —20/10/2026

HT6/Product checks39462558715/verify118765503722 foi cancelado pelo limite de25minutos, ainda executando os testes de navegador, sem conclusão integral. A suíte cresceu; limite do verify ajustado para35minutos, mantendo todos os casos/asserts e os demais jobs. Nenhuma reexecução isolada ou redução de cobertura. Nova execução integral no novo head é obrigatória antes de incorporar. Ajuste apenas do limite da execução de desenvolvimento, sem operação/direito/custo variável do cliente, preço ou gate modificado.


199. **[HT14] Sugerir preço e estrutura de oferta com regras locais e dados já lidos da própria loja**

- Estado: **implementado e absorvido na versão179; reconciliação documental23/10/2026**. Fonte e teste real publicados179 conferidos: planejadorlocal com regra declarada, aceitaçãoeditávelnãosalva/recusa,semIA/ativação/gravação,390/1280. Head65d84a8fa7c3cdd03789684ee6e09de0ce44323f,22/22,verify120309909474;READY/domínio/SHAexato/5rotas comprovados na entrega179. Não repetir código nem contar entrega nova; custos/documentos históricos não certificam60%ouAAA e gates permanecem fechados.
- Histórico preservado antes desta reconciliação: - Estado: **Cálculo próprio registrado antes do código; implementado; CI integral e publicação pendentes**. Posição vigente: OR: andamento prioritário preservado, antes de 273 [BK1] e 275 [FX1]; conferir o histórico de publicações e executar somente o remanescente acionável.
   - Histórico OR — estado anterior à atualização documental: - Estado: **Cálculo próprio registrado antes do código; implementado; CI integral e publicação pendentes**.
- Registro UTC:2026-10-20 17:34:21 UTC; FortalezaUTC−3. Base remota conferida `2f29aaf4a936dde7b085815246761674fdd9183e`; docs/ht14-cost-review.md define escopo antes de operação.
- Reutilizar leitura de cards/índices/candidatos/permissões do editor de funis já existente. Planejador determinístico local: preço observado da própria categoria/loja (ou preço atual quando não há comparação), regra/amostra exibidas, estrutura suportada com condições atuais. Aceitar/recusar apenas plano local não salvo/editável; não mudar preço/funil nem salvar/publicar/ativar/enviar automaticamente. Sem previsão de vendas, demanda ou lucro.
- Nenhuma chamada IA nova, histórico/API/read/write/provedor/retencão/job/cota nova. FunilIA existente e pool/tetos/reserva intactos. Custo incremental explícitoUS$0/mês eUS$0/ano nos6cenários em100%dosdireitos/pior mês; dimensionamento com maior recebimento/taxas/reservas/impostos permanece60,31/60,59%Store,60,38/60,06%Studio,60,46/60,07%Scale (mês/ano). Custo/demanda desconhecidos não viramzero nem projeção; operação fora desse escopo exige cálculo antes de uso.
- M0 mais oneroso reprovado continua controlando abertura de vendas. PLANS_ON_SALE=false, comissão, preços/limites, opt-in/permissões, tax gate/art.9a/revisão comercial preservados. Nenhum pagamento/conta/mensagem/submissão externa. Commit do cálculo registrado a seguir; código/testes/produção pendentes. Novas revisõesB2 só após esta sequênciaHT.


#### HT14 — implementação após cálculo prévio

- Cálculo `413a2b676cc52d6cb0bb530ccd9706fb3959e1b0` precede código; implementação `3161f951a0e2d7ee14b71f15ace5a9d600f9f387` (2026-10-20T17:38:02Z; Fortaleza2026-10-20 14:38:02.000,UTC−3). Custo extra de fornecedor/operação permanecezero nos6cenários; nenhuma IA, leitura/gravação/histórico nova ou cota alterada.
- Planejador por regras locais no editor existente de funis usa somente cards/índice/candidatos já lidos. Preço de referência é o menor valor central observado nos outros produtos publicados elegíveis da mesma categoria geral; sem amostra, preserva preço atual. Regra/amostra/faixa/limitações visíveis; nenhum benchmark/projeção de venda/lucro. Rascunhos, opções, bundles, calls, recorrências e preços inválidos não contaminam a comparação.
- Estrutura sugere revisar página/checkout/entrega; oferta extra somente quando candidatos já elegíveis e configuraçãoStripe/tax atual permitem, com recusa do comprador. Gates indisponíveis explícitos. Aceitar gera texto local editável não salvo protegido pelo leave guard; recusar/descartar/cópia explícita não mudam preço ou funil. FluxoIA existente preservado, não há gerador duplicado nem chamada automática.
- Testes: preço observado/categoria, menor central real, comparáveis ausentes, exclusões, dados imutáveis, permissões e gates; navegador390/1280 aceita/recusa/edita/descarta plano, verifica regra/gates/largura/axe/zeroPOST/IA. Suíte integral no head final obrigatória; READY/domínio/SHA antes de entrega funcional. Docs/ht14-offer-planning.md.
- PLANS_ON_SALE=false, comissão/preços/limites/opt-in/idiomas/conteúdo/IDs/pool/tetos/reserva e gates fiscais/comerciais intactos. Piso60% líquido por cliente/global continua obrigatório. Nenhum pagamento, conta, mensagem ou submissão externa. B2 só após sequênciaHT e verificações/publicações pendentes.


#### HT16 — medidas reais e correção de estabilidade/FAQ

Baseline antes (f9bca29fe6386648f76351de70955d4a93f7aa89), run39467038220/job118781215518:9amostras390×844/CPU4×/150ms/1,6Mbps/cachefrio registradas; homeLCP1156–1948ms, interação216–368ms; preçosCLS atingiu0,1318. CandidatoHT16/run39467038220/job118781215637 teve9amostras sob metas (homeLCP628–812ms/interação56–144ms, preçosCLS0, recursoCLS≤0,0555), mas descendentesHT17/HT13 tiveram oscilaçãoCLS0,1318 e interação200ms, portanto não basta um passe para concluir. Nenhuma amostra falha foi apagada ou tratada comozero.

Fontes principaisGeist/Instrument usamdisplayoptional para impedir troca tardia durante página fria; faces escolhidas pelo criador permanecem como estavam. FAQ passa a disclosure nativo, mantendo perguntas/respostas/links/teclado e dispensando renderização React para abrir. Mesmas metas estritasLCP<2500/CLS<0,1/interação<200; nova coleta inclui fontes de layout-shift para diagnosticar eventual falha. Baseline imutável completo salvo emtests/fixtures/mobile-render-before.json comSHA/run/job; não reconstruir baseline inalterado a cadaPR. Candidato e suíte completa continuam obrigatórios em cada novohead. Proxy sintético não é INP real/p75/certificaçãoCWV. Sem novos requests/fornecedor/custo operacional de cliente ou gates alterados.


#### HT16 — conteúdo da home opaco e estável durante leitura/interação

Após displayoptional, todas as27amostras coletadas deHT16/HT17/HT13 mostraramCLS0 nas3rotas; entretanto primeiro clique frio da home ainda chegou264–272ms emHT13/HT14, e esses jobs foram reprovados. Conteúdo da home agora permanece visível sem transição de opacidade por scroll; observador React duplicado removido dessa página e regra escopada cobre seus componentes filhos. Mesma marca/layout/links/planos/limites, sem tocar temas do criador. Nenhuma exclusão de amostra/regra ou relaxamento de200ms; nova verificação integral no novohead. Histórico e baseline preservados emdocs/ht16-public-design.md.


#### HT15 — rótulos explícitos dos filtros da biblioteca

Product checks39467027754/verify118781108709 passou build/regressões, mas navegador expirou procurando o rótulo exatoGoal. Cada filtro novo agora usa label/htmlFor e id explícitos separados das opções, mantendo nome acessível curto e inequívoco. Mesmo ajuste nos novos campos do planejadorHT14. Não afrouxar seletor nem ignorar etapa: filtros, teclado/AA e suíte integral devem passar no novohead. Nenhuma operação/custo/permissão/identificador persistido alterado.


#### HT16 — aguardar carregamento real da captura lazy antes de decodificar

O verify118791813859 deHT17 encontrou EncodingError ao chamar decode imediatamente depois de rolar até uma imagem lazy. O teste passa a esperar, por no máximo10segundos, o carregamento real com complete e naturalWidth positivo antes de decodificar; mantém verificação das duas capturas distintas, dimensões1280×820, pixels decodificáveis e acessibilidade. Não altera imagens/atributos lazy/limites nem descarta falha: toda a suíte deve passar no novohead. Sem operação/custo variável de cliente, preço ou gate alterado.


### Publicação funcional113

Item188/PR718 incorporado em2026-10-20 14:56:03 de Fortaleza. Commit testado `a9a67a28147d33d60a0de457782d07048609994b`; versão incorporada `c20edc97865898ff7e42ae0de1c6bf669405f58a`, árvore idêntica à verificada. READY em`2026-10-20T17:57:45.208Z`, domínio`marktmorgen.com`, deployment`dpl_ByuUqrxxRbhiT16u8mcMKu417bxz`.

CI integral Product checks39466966305 (verify118780763532, Redis118780763289), Dependency security39466966363: aprovados; 32 verificações específicas. 6 rotas responderam200 com o mesmo deployment; logs error/fatal sem registros na janela2026-10-20T17:54:54.976Z → 2026-10-20T17:59:54.976Z. Prova autenticada limitada à fixture sintética do CI, sem conta/pagamento real.

Custo incremental: Static signup clarity using canonical plan prices, same single email form and setup/trial gates; no new variable client/provider operation. Piso líquido60% por cliente no pior mês/100% dos direitos e global, todos os impostosBrasil/EUA, continua obrigatório; desconhecido reprova. M0 pela leitura mais onerosa continua reprovado; PLANS_ON_SALE=false, comissão, preços/limites, tax gate, art.9a e revisão comercial preservados. Nenhuma certificação de margem ou abertura das vendas.


### Publicação funcional114

Item189/PR719 incorporado em2026-10-20 15:00:54 de Fortaleza. Commit testado `fb830f118f7efabf77313ffbab2436bbefff20b2`; versão incorporada `a74a6cadcbd02eec8fe41bf6df02a46eca9f48b0`, árvore idêntica à verificada. READY em`2026-10-20T18:02:03.076Z`, domínio`marktmorgen.com`, deployment`dpl_41B1PhrjfWmURHM9vhxjHxH7vqUV`.

CI integral Product checks39466983143 (verify118780950669, Redis118780951171), Dependency security39466983051: aprovados; 26 verificações específicas. 7 rotas responderam200 com o mesmo deployment; logs error/fatal sem registros na janela2026-10-20T17:58:18.600Z → 2026-10-20T18:03:18.600Z. Prova autenticada limitada à fixture sintética do CI, sem conta/pagamento real.

Custo incremental: Existing static site/template/permission registry only, demo clearly fictional; no new provider/customer operation, image, permission use or outcome claim. Piso líquido60% por cliente no pior mês/100% dos direitos e global, todos os impostosBrasil/EUA, continua obrigatório; desconhecido reprova. M0 pela leitura mais onerosa continua reprovado; PLANS_ON_SALE=false, comissão, preços/limites, tax gate, art.9a e revisão comercial preservados. Nenhuma certificação de margem ou abertura das vendas.


### Publicação funcional115

Item190/PR720 incorporado em2026-10-20 15:07:24 de Fortaleza. Commit testado `e1000dd9e431af0dafe7971b3a8e23927fd2004b`; versão incorporada `43c9ea81d77c6e06455be01538b13483854e8f46`, árvore idêntica à verificada. READY em`2026-10-20T18:08:28.624Z`, domínio`marktmorgen.com`, deployment`dpl_7YB7ipwnYUDQR9d6TGnXWLuho7ou`.

CI integral Product checks39466987941 (verify118780975734, Redis118780976047), Dependency security39466988069: aprovados; 6 verificações específicas. 6 rotas responderam200 com o mesmo deployment; logs error/fatal sem registros na janela2026-10-20T18:03:58.063Z → 2026-10-20T18:08:58.063Z. Prova autenticada limitada à fixture sintética do CI, sem conta/pagamento real.

Custo incremental: No added provider operation or customer cost; existing sales feed validation and static unaudited aggregate omission. Piso líquido60% por cliente no pior mês/100% dos direitos e global, todos os impostosBrasil/EUA, continua obrigatório; desconhecido reprova. M0 pela leitura mais onerosa continua reprovado; PLANS_ON_SALE=false, comissão, preços/limites, tax gate, art.9a e revisão comercial preservados. Nenhuma certificação de margem ou abertura das vendas.


### Publicação funcional116

Item191/PR721 incorporado em2026-10-20 15:09:30 de Fortaleza. Commit testado `5bfbbd501950c7ac5c5e6e262f613902d1ba4eab`; versão incorporada `4e1ffceda46b449b539251eae3392ed0e2d747cf`, árvore idêntica à verificada. READY em`2026-10-20T18:10:58.257Z`, domínio`marktmorgen.com`, deployment`dpl_6vUCDNzJE9vtLWzxUaxN6TzLVsuH`.

CI integral Product checks39467000958 (verify118781013863, Redis118781013464), Dependency security39467000779: aprovados; 26 verificações específicas. 6 rotas responderam200 com o mesmo deployment; logs error/fatal sem registros na janela2026-10-20T18:07:50.381Z → 2026-10-20T18:12:50.381Z. Prova autenticada limitada à fixture sintética do CI, sem conta/pagamento real.

Custo incremental: Existing own-payment read and configuration only; no extra provider operation/query/activation or cost. Piso líquido60% por cliente no pior mês/100% dos direitos e global, todos os impostosBrasil/EUA, continua obrigatório; desconhecido reprova. M0 pela leitura mais onerosa continua reprovado; PLANS_ON_SALE=false, comissão, preços/limites, tax gate, art.9a e revisão comercial preservados. Nenhuma certificação de margem ou abertura das vendas.


### Publicação funcional117

Item192/PR722 incorporado em2026-10-20 15:13:26 de Fortaleza. Commit testado `e01a31d7d42dc4ec37581246623982eeeb220206`; versão incorporada `ea82a992a5f531b7a1e2c6a352a50681163b2bb3`, árvore idêntica à verificada. READY em`2026-10-20T18:15:12.268Z`, domínio`marktmorgen.com`, deployment`dpl_Hhz6W2qLQQqQ76R1uzN9fD1Wp2Fm`.

CI integral Product checks39467010347 (verify118781050338, Redis118781050839), Dependency security39467010349: aprovados; 94 verificações específicas. 12 rotas responderam200 com o mesmo deployment; logs error/fatal sem registros na janela2026-10-20T18:11:19.355Z → 2026-10-20T18:16:19.355Z. Prova autenticada limitada à fixture sintética do CI, sem conta/pagamento real.

Custo incremental: Static guides/templates/schema only; existing assets/sitemap; no new AI/provider/customer operation or cost. Piso líquido60% por cliente no pior mês/100% dos direitos e global, todos os impostosBrasil/EUA, continua obrigatório; desconhecido reprova. M0 pela leitura mais onerosa continua reprovado; PLANS_ON_SALE=false, comissão, preços/limites, tax gate, art.9a e revisão comercial preservados. Nenhuma certificação de margem ou abertura das vendas.


#### HT15 — conferir conteúdo preservado no painel aberto e distinguir consulta de destinatários

verify118791597731 executou filtros/prévias/AA e identificou duas expectativas incorretas: o hero salvo começa recolhido (seu input não existe até abrir) e o composer existente consulta destinatários por POST action=count. O teste abre o próprio bloco antes de conferir o texto exato do criador; intercepta e conta exatamente as duas consultas conhecidas de destinatários, sem executá-las fora da fixture. Qualquer outro POST/write continua abortado e reprova, com método/caminho de diagnóstico; salvar/enviar/publicar/IA continuam zero. Nenhuma regra de preservação ou mutação é dispensada. Suíte integral obrigatória no novohead; sem custo/limite/preço/gate alterado.


#### HT10 — nome acessível dos IDs separado da ajuda

Os verifies118803842951/118803901027/118804022774 expiraram procurando o nome exatoMeta Pixel ID. O label implícito incluía também todo o texto de ajuda, alterando o nome acessível. Os quatro campos agora têm label/htmlFor/id explícitos; a ajuda permanece via aria-describedby. Nenhum seletor foi afrouxado, nenhuma verificação removida e IDs de pixel/consentimento persistidos não mudam. CI integral no novohead obrigatório; sem nova operação/custo/limite/preço/gate.


#### HT16/HT14 — isolar layout dos cartões ao expandir benefícios

O novo mobile118813573960/HT14 mediu224ms na primeira interação da home (LCP752ms/CLS0); a amostra reprova e não é descartada. O primeiro disclosure medido é a lista de benefícios do cartão de plano. Os cartões recebem contain:layout, sem corte de pintura/overflow nem tamanho presumido: o conteúdo e as alturas continuam naturais, mas o navegador pode limitar o trabalho interno ao cartão. Diagnóstico de EventTiming passa a incluir tempos de entrada/processamento e long tasks; mesmos3cliques/3amostras/3rotas e limiaresLCP<2500/CLS<0,1/interação<200. Nenhuma espera nova, exclusão ou certificaçãoINP real. Toda a suíte no novohead é obrigatória; zero operação/custo novo e preços/limites/gates preservados.


#### HT16/HT14 — preparar formatação estática dos planos antes da interação

A contenção não bastou: mobile118816830403 mediu264ms no primeiro clique da home. EventTiming mostrou pointerdown com33,7ms de espera e125,4ms de processamento; long task de240ms sobre a interação. Mantida a reprovação integral. A renderização dos cartões repetia Number.toLocaleString para dezenas de preços/limites. Agora dois Intl.NumberFormat imutáveis, com a mesma locale e opções originais, são reutilizados, e as figuras canônicas dos três planos são calculadas uma vez no módulo. Preços, strings resultantes, limites, mensal/anual, detalhes nativos e sua ordem permanecem; nenhuma espera/amostra removida ou limiar alterado. Nova suíte completa e medições estritas obrigatórias. Sem IO/fornecedor/operação/direito/custo novo; M0 e todos os gates intactos.


#### HT16/HT14 — animar wrapper HTML do ícone

A rotação decorativa do disclosure de benefícios passa doSVG para um wrapper HTML inline-flex (mesmo ícone/tamanho/200ms/estado visual), conforme revisão React: permite composição da transformação sem animar o próprio vetor. Texto/nome acessível, limites e ordem permanecem. Faz parte da correção em verificação; não altera o teste/limiar, e a suíte completa no novohead continua obrigatória. Sem operação/custo/gate novo.


#### HT10 — distinguir beacon de visita e evento publicitário com payload estrito

verifies118813493380/118813533888 passaram salvamento/AA/atribuição e bloqueio de fornecedor/GPC, mas o teste contavaPOST/api/store/hit como evento publicitário. StoreBeacon e a rota hit foram lidos: esse contador interno já existe, não define cookie nem encaminha anúncios. Agora o teste intercepta exatamente umPOST dessa rota com h=templatelibraryfixture/k=v e somente os campos string já emitidos (h/k/r/u/m/g), devolvendo204 sem executar a gravação. /api/store/ads-event continua exigido emzero, qualquer outra write reprova e nenhum fornecedor externo é chamado. A fixtureGPC inclui também Sec-GPC:1, além do sinalnavigator e do yes antigo, para coerência cliente/servidor. Não altera código de consentimento/analytics de produção nem dispensa controle: testes sintéticos e suíte completa no novohead obrigatórios. Sem custo/operação/direito/gate novo.


### Publicação funcional118

Item193/PR723 incorporado em2026-10-20 15:38:25 de Fortaleza. Commit testado`81694d7deb02cb8f0c66b2e8644a6be339c69a12`; versão`9083909109d09a13dbf77414d00ef09698ba0a3e`, árvore idêntica à verificada. READY`2026-10-20T18:39:46.049Z`, domínio`marktmorgen.com`, deployment`dpl_CmhAHeywCthRZ6XvFtE9XdhUwhMP`.

Product checks39473475144 (verify118803298119, Redis118803297697), Dependency security39473475151: aprovados; 32 verificações específicas. 6 rotas confirmadas com o mesmo deployment (404 sintético esperado quando aplicável). Logs error/fatal sem registros na janela2026-10-20T18:35:15.483Z → 2026-10-20T18:40:15.483Z. Autenticação/erros e writes exercidos somente em fixtures sintéticas, sem conta/pagamento/mensagem real.



Custo incremental/escopo: Existing canonical templates/editors and explicit saved-section read; no new AI/provider allowance or operation. Recipient counting remains existing read action. No automatic save/send/publish. Piso líquido60% por cliente100%dos direitos no pior mês e global, todos os impostosBrasil/EUA, continua obrigatório; desconhecido reprova. M0 mais oneroso segue reprovado; vendas/PLANS_ON_SALE=false, comissão, preços/limites, tax gate, art.9a e revisão comercial intactos.


### Publicação funcional119

Item194/PR724 incorporado em2026-10-20 15:40:40 de Fortaleza. Commit testado`fa46dbf0fd1a1ce507d00f949ef10edd28a5df2e`; versão`3ebd1dfb83e04740cdaf0f3dfa04b13da28dc144`, árvore idêntica à verificada. READY`2026-10-20T18:41:48.706Z`, domínio`marktmorgen.com`, deployment`dpl_5Xd6cUTJEkDymUhcj24zrxKAJwZD`.

Product checks39473574271 (verify118803791089, Redis118803791172, mobile118803790666), Dependency security39473574342: aprovados; 62 verificações específicas. 7 rotas confirmadas com o mesmo deployment (404 sintético esperado quando aplicável). Logs error/fatal sem registros na janela2026-10-20T18:39:25.887Z → 2026-10-20T18:44:25.887Z. Autenticação/erros e writes exercidos somente em fixtures sintéticas, sem conta/pagamento/mensagem real.

Móvel no head exato: 9 amostras, LCPmáx832ms/CLS0/interaçãomáx88ms. Laboratório, não INP real/certificaçãoCWV. Synthetic final-head lab sample only; no field INP/CWV certificate. Later HT14 first-home224ms failure retained and under separate strict full-head correction.

Custo incremental/escopo: Static actual synthetic captures, policy links, opaque reading/native FAQ/fonts; no added image/provider/AI/customer operation or new rights. All financial/sales gates unchanged. Piso líquido60% por cliente100%dos direitos no pior mês e global, todos os impostosBrasil/EUA, continua obrigatório; desconhecido reprova. M0 mais oneroso segue reprovado; vendas/PLANS_ON_SALE=false, comissão, preços/limites, tax gate, art.9a e revisão comercial intactos.


### Publicação funcional120

Item195/PR725 incorporado em2026-10-20 15:45:07 de Fortaleza. Commit testado`e273347a3d11602e45dfd409b49ac916953f7fa3`; versão`657e75d05945a07d98e8cd27a4bdb96edd9a854b`, árvore idêntica à verificada. READY`2026-10-20T18:46:30.640Z`, domínio`marktmorgen.com`, deployment`dpl_iEhX5i4kmcG5MyWRGJ29rEHxLfDA`.

Product checks39473551632 (verify118803691463, Redis118803690520, mobile118803691035), Dependency security39473551392: aprovados; 18 verificações específicas. 7 rotas confirmadas com o mesmo deployment (404 sintético esperado quando aplicável). Logs error/fatal sem registros na janela2026-10-20T18:42:16.251Z → 2026-10-20T18:47:16.251Z. Autenticação/erros e writes exercidos somente em fixtures sintéticas, sem conta/pagamento/mensagem real.

Móvel no head exato: 9 amostras, LCPmáx1052ms/CLS0/interaçãomáx152ms. Laboratório, não INP real/certificaçãoCWV. Actual error-boundary render exercised in isolated CI, no deliberate production error; mobile lab proxy is not field INP certification.

Custo incremental/escopo: Shared microcopy only; persisted refusal keys, creator text, buyer languages, quotas, permissions and all gates preserved; no added provider/AI/customer operation. Piso líquido60% por cliente100%dos direitos no pior mês e global, todos os impostosBrasil/EUA, continua obrigatório; desconhecido reprova. M0 mais oneroso segue reprovado; vendas/PLANS_ON_SALE=false, comissão, preços/limites, tax gate, art.9a e revisão comercial intactos.


#### HT10 — aguardar relatório confirmado, não só limpar o alerta

verify118824851029 reprovou somente HT10 matching window confirmed1280: save limpa o alerta ao iniciar a tentativa, antes do fetch terminar; desaparecer o erro não é confirmação. O teste agora aguarda o próprio texto within the60daysbefore do relatório antes da mesma asserção estrita. Falha/mismatch continuam reprovando, sem sleep artificial, resposta real, seletor afrouxado ou assert removido. GPC/zero ads/visita interna exata/zero write inesperada passaram. Nova suíte completa no novohead é obrigatória, sem operação/custo/preço/limite/gate alterado.


200. **[B2-200] Explicar tentativas de título sem prometer uso gratuito**

Pedido: revisão em andamento antes do pedido P0 de 20/10/2026; registro em 20/10/2026 16:51 de Fortaleza.

Estado: concluído; PR729 incorporado em20/10/2026 17:25:41 de Fortaleza, publicação123 confirmada. Implementação inicial preservada no histórico; head integralmente testado b21710d58b1b4a346cd6c79a47e2c4c55770b30a.

Escopo e prova: o editor conserva o rascunho quando não confirma um título e explica que tentativas iniciadas contam na franquia. Mensagem anunciada por status acessível. Mesma chamada, reserva, tetos e tratamento de respostas; remove a afirmação incorreta “nothing was counted”. Verificação completa no novo head obrigatória.

Custo e margem: apenas texto e status, sem operação ou custo variável novo. Piso líquido mínimo60% por cliente a100% dos direitos no pior mês e global após todos os custos/impostos Brasil/EUA permanece obrigatório. M0 e vendas fechadas, preços, limites, comissão e gates intactos.

201. **[P0-BROWSERS-DEVICES] Testar o site e o studio em outros navegadores e aparelhos**

Pedido: P0, pedido de excelência/acessibilidade de 19/10/2026; acrescentado por pedido do dono em 20/10/2026, às16:51 de Fortaleza.

Estado: em andamento; lacuna automatizada de criação inicial/publicação reconciliada no PR828, merge253c41a69398cf5719d46d935e75a417ec7ec5c0 em23/10/2026 às04:24:43Fortaleza,22/22 e árvores iguais. tests/e2e/accessibility-signup-actions.mjs já executa claim local real e recarga pública anônima em3motores/25casos cada; run39910764633 comprova75casos/375auditorias/0falhas. Não repetir essa cobertura nem afirmar que continua ausente. Lacunas manuais/aparelhos/AT/zoom real400%/BotID e incompletosaxe continuam abertas, aguardando o dono conforme inventário docs/accessibility-browsers-devices.md; qualquer outra lacuna automatizável deve ser comparada com as matrizes atuais antes de encerrar201. Sem certificaçãoAAA. Prioridade OR preservada.

Histórico preservado antes desta reconciliação: Estado: em andamento. Entrega129 incorporou correções e matrizes sintéticas após22checks completos no head06b7637; não encerra201. Ações atuais comprovam criar/publicar produto em loja sintética já criada, mas ainda falta a prova matricial da criação do endereço e publicação inicial da primeira loja após cadastro. Essa parte é acionável autonomamente e será a próxima correção de cobertura. Lacunas manuais de aparelhos/AT/zoom real400% permanecem aguardando o dono, registradas há mais de uma hora; reflow320 não equivale a zoom real400%, nem LinuxWebKit a Safari físico. Inventário/custos emdocs/accessibility-browsers-devices.md. Não é certificação AAA; não marcar201 inteiro como dependência do dono enquanto houver trabalho autônomo. Posição vigente: OR: andamento prioritário preservado, antes de 273 [BK1] e 275 [FX1]; conferir o histórico de publicações e executar somente o remanescente acionável.
   - Histórico OR — estado anterior à atualização documental: Estado: em andamento. Entrega129 incorporou correções e matrizes sintéticas após22checks completos no head06b7637; não encerra201. Ações atuais comprovam criar/publicar produto em loja sintética já criada, mas ainda falta a prova matricial da criação do endereço e publicação inicial da primeira loja após cadastro. Essa parte é acionável autonomamente e será a próxima correção de cobertura. Lacunas manuais de aparelhos/AT/zoom real400% permanecem aguardando o dono, registradas há mais de uma hora; reflow320 não equivale a zoom real400%, nem LinuxWebKit a Safari físico. Inventário/custos emdocs/accessibility-browsers-devices.md. Não é certificação AAA; não marcar201 inteiro como dependência do dono enquanto houver trabalho autônomo.

Escopo e prova: acrescentar Firefox e WebKit (Safari) aos testes Playwright existentes, sem serviço pago; se a instalação não for possível, registrar motivo exato e requisitos. Exercitar home, preços, cadastro, criação de produto, publicação da loja, página da loja, checkout e área do comprador nas larguras320,390,768,1280 e1920px: axe incluindo regras AAA, teclado, zoom400% com reflow, espaçamento WCAG1.4.12, movimento reduzido e alto contraste. Corrigir falhas em PRs pequenos com prova de falha antes e aprovação depois. Inventariar lacunas de aparelhos reais (iPhone, Android, Windows/Edge, tablets), custos de aparelhos ou nuvem como BrowserStack/Sauce Labs com fonte oficial e data. Não contratar, criar conta nem realizar submissão externa. Ao concluir registrar data/hora Fortaleza, commits, testes, publicação e lacunas; evidência sintética não equivale a aparelho real.

Custo e margem: calcular minutos de CI e qualquer outro custo. Testes não têm custo por cliente; eventual custo fixo novo entra nos custos fixos da empresa, nunca em preços ou limites. Não contratar serviço. Mínimo60% líquido por cliente isolado com100% dos direitos no pior mês e no consolidado, após todos os custos/impostos inclusive brasileiros; desconhecido reprova. PLANS_ON_SALE, tax gate, art.9a, revisão comercial, preços, limites e comissão intactos.

202. **[P0-REAL-PEOPLE] Planejar testes com pessoas reais com deficiência e calcular o custo**

Pedido: P0, pedido de excelência/acessibilidade de 19/10/2026; acrescentado por pedido do dono em 20/10/2026, às16:51 de Fortaleza.

Estado: plano e cálculo condicional preparados no PR741, integrados ao head77c64d6/PR742; suíte completa e incorporação ainda pendentes. Preparação documental independente enquanto201 roda; incorporação final e conclusão202 devem preservar a prioridade da cobertura autônoma201, cujas lacunas de publicação inicial ainda estão abertas. Fontes oficiais consultadas21/10/2026, protocolo18participantes por rodada/seis perfis/duas rodadas, custos públicos mínimos separados de cotações completas desconhecidas e fórmula de financiamento60%. Não houve contratação, conta, contato ou teste humano. Contratação/recrutamento dependem exclusivamente do dono; desconhecido não vale zero. Posição vigente: OR: andamento prioritário preservado, antes de 273 [BK1] e 275 [FX1]; conferir o histórico de publicações e executar somente o remanescente acionável.
   - Histórico OR — estado anterior à atualização documental: Estado: plano e cálculo condicional preparados no PR741, integrados ao head77c64d6/PR742; suíte completa e incorporação ainda pendentes. Preparação documental independente enquanto201 roda; incorporação final e conclusão202 devem preservar a prioridade da cobertura autônoma201, cujas lacunas de publicação inicial ainda estão abertas. Fontes oficiais consultadas21/10/2026, protocolo18participantes por rodada/seis perfis/duas rodadas, custos públicos mínimos separados de cotações completas desconhecidas e fórmula de financiamento60%. Não houve contratação, conta, contato ou teste humano. Contratação/recrutamento dependem exclusivamente do dono; desconhecido não vale zero.

Escopo e prova: pesquisar somente fontes oficiais datadas sobre testes com cegos/leitores de tela, baixa visão, surdos, deficiência motora, neurodivergentes e idosos; custos por sessão e rodada de recrutamento/serviços, por exemplo Fable, AbilityNet, UserTesting e Access Works. Criar docs/accessibility-real-people-plan.md com perfis, mínimo de participantes por perfil, tarefas de cadastro/criar produto/publicar loja/comprar/baixar produto, roteiro, medidas, proteção e consentimento dos dados e custo total por rodada. Calcular impacto nos custos fixos e número mínimo de clientes pagantes para preservar60% no consolidado. Nenhuma contratação, conta, contato com pessoas/empresas ou recrutamento. Ao concluir registrar data/hora Fortaleza, commits, testes, publicação e lacunas; plano não representa testes com pessoas realizados.

Custo e margem: nenhum gasto autorizado; apenas calcular e registrar. Custo desconhecido ou sob consulta não vale zero. Mínimo60% líquido por cliente isolado com100% dos direitos no pior mês e no consolidado após todos os custos/impostos inclusive brasileiros. Não alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art.9a ou revisão comercial.


#### B2-200 — corrigir a regressão móvel antes da conclusão

20/10/2026 16:59 Fortaleza: mobile118850448202 reprovou a primeira amostra fria da home no head145d59a81ac417f20cb6c9cefebf57dbc692780f: LCP2936ms e interação448ms (demais oito amostras preservadas). Sem excluir amostra ou mudar limiar: FAQ nativo e faixa CSS estática saem do módulo cliente para componente de servidor, com o mesmo conteúdo/markup/comportamento. Reduz código e execução do cliente na home. Nova suíte completa obrigatória no novohead; não é entrega ainda. Sem serviço, operação, preço, limite ou gate alterado. P0s201/202 continuam antes de qualquer novo B2.


### Publicação funcional121

Item196/PR726 incorporado em2026-10-20 16:35:15 de Fortaleza. Head testado `29a240e18bd5e7fd35e0341a62f4b2bee50ab2bf`; versão `c52c70f08037fd2c180569782e98acc0bb4e748b`, árvore idêntica à verificada. READY `2026-10-20T19:37:12.852Z`, domínio marktmorgen.com, deployment `dpl_E3Dqe8yv39iy686orEFx8xDZ1cLZ`.

CI completo aprovado: {"product":39482139984,"verify":118833735036,"redis":118833734875,"mobile":118833734449,"security":39482139975}. 6 rotas com o mesmo deployment; runtime error/fatal zero somente na janela 2026-10-20T19:32:55.874Z → 2026-10-20T19:37:55.874Z. Medição móvel sintética: {"samples":9,"lcpMax":908,"clsMax":0,"interactionMax":104,"fieldINP":null}. Não é INP real/certificação CWV.

Custo/escopo: Own cost review committed before code: zero incremental supplier/read/write/model entitlement in all6 plan/interval cases, existing counters/reserves unchanged; most-tax M0 stays failed. No sale opening.. Piso líquido mínimo60% por cliente100% dos direitos no pior mês e global, após todos os custos e impostos Brasil/EUA, obrigatório; desconhecido reprova. M0 mais oneroso, PLANS_ON_SALE=false, comissão, preços, limites, permissões e todos os gates preservados.


### Publicação funcional122

Item199/PR728 incorporado em2026-10-20 16:39:39 de Fortaleza. Head testado `c0def34523d30289be3ee7e733405683c79751a9`; versão `7002c8835a12a4fee76780d1cf31b5bacec68240`, árvore idêntica à verificada. READY `2026-10-20T19:40:43.848Z`, domínio marktmorgen.com, deployment `dpl_zWqSgmGSRTybihJ4K4X7jWnd6Uov`.

CI completo aprovado: {"product":39482166907,"verify":118833227853,"redis":118833228144,"mobile":118833227589,"security":39482166896}. 8 rotas com o mesmo deployment; runtime error/fatal zero somente na janela 2026-10-20T19:36:47.629Z → 2026-10-20T19:41:47.629Z. Medição móvel sintética: {"samples":9,"lcpMax":700,"clsMax":0,"interactionMax":64,"fieldINP":null}. Não é INP real/certificação CWV.

Custo/escopo: Own six-scenario cost decision before code: deterministic planner reuses already-read catalog, no extra AI/provider/query/write/job/budget. Accept/reject/edit stays local unsaved; prices/rights/gates unchanged; M0 most-tax sales gate remains failed.. Piso líquido mínimo60% por cliente100% dos direitos no pior mês e global, após todos os custos e impostos Brasil/EUA, obrigatório; desconhecido reprova. M0 mais oneroso, PLANS_ON_SALE=false, comissão, preços, limites, permissões e todos os gates preservados.


### Publicação funcional123

Item200/PR729 incorporado em2026-10-20 17:25:41 de Fortaleza. Head testado `b21710d58b1b4a346cd6c79a47e2c4c55770b30a`; versão `3e56a89c3943f4545aae004c75a63820f42beb46`, árvore idêntica à verificada. READY `2026-10-20T20:26:57.457Z`, domínio marktmorgen.com, deployment `dpl_FVF8sD5qNx1RDHNBXcYT59dpQxoj`.

CI completo aprovado: {"product":39489155558,"security":39489155836,"verify":118857331098,"redis":118857330724,"mobile":118857331064}. 6 rotas com o mesmo deployment; runtime error/fatal zero somente na janela 2026-10-20T20:22:50.682Z → 2026-10-20T20:27:50.682Z. Medição móvel sintética: {"samples":9,"maxLCP":952,"maxCLS":0,"maxInteraction":104,"fieldINP":null}. Não é INP real/certificação CWV.

Custo/escopo: No new customer/provider/AI operation, rights, prices or limits. Existing public standard CI; no paid service/account. All financial and sales gates unchanged.. Piso líquido mínimo60% por cliente100% dos direitos no pior mês e global, após todos os custos e impostos Brasil/EUA, obrigatório; desconhecido reprova. M0 mais oneroso, PLANS_ON_SALE=false, comissão, preços, limites, permissões e todos os gates preservados.


#### HT11/HT13 — registro de custo incorporado, sem implantação das funcionalidades

PR727 incorporado em20/10/2026 16:38:48 de Fortaleza, versão9446c5c42209cc5038c984eaafe6e5b51aa762f4, head974259fdda495ca6019da36629a70b7eb0726d6f integralmente verificado. Comunidade compartilhada/novo tutor permanecem não implementados: custos completos desconhecidos reprovam todos os cenários; aguardam custos limitados/revisão do dono. Documentos docs/ht11-community-cost-review.md e docs/ht13-student-tutor-cost-review.md. PR documental não incrementou contador.

#### P0-BROWSERS-DEVICES — etapa inicial de compatibilidade

20/10/2026 17:29 Fortaleza: nova matriz Linux Firefox/WebKit com Playwright-core1.56.1 já fixado no projeto, instalações e dependências apenas no CI remoto. O harness existente inteiro recebe E2E_BROWSER e registra motor/versão; Firefox/WebKit indisponível reprova, nunca usa Chrome como substituto. Chromium e todas as verificações anteriores permanecem. Ainda não cobre todas as oito jornadas×cinco larguras×todos os modos AAA do pedido: esta etapa não encerra201. Correções e verificação completa no novohead são obrigatórias.

Custo: até2×45=90minutos Linux adicionais por execução (teto, não consumo observado); repositório público com runners padrão gratuitos conforme fonte oficial consultada20/10/2026. Sem runner maior, artefato ou serviço pago novo; custo variável por cliente zero. Consumo real será registrado após execução. Eventual mudança de elegibilidade/custo fixo exige novo cálculo antes de operar; não alterar preços/limites/gates. Fontes e lacunas em docs/accessibility-browsers-devices.md.


#### P0-BROWSERS-DEVICES — primeiras falhas reais e correções

20/10/2026 17:36 Fortaleza: CI39492672679 no head5e1532292c6caeae28d4ed41ecf87171acf4b232 instalou e lançou Firefox142.0.1/WebKit26.0. Firefox118869615732 reprovou consentimento restaurado após reload; input de participação ganha autocomplete=off, mantendo estado inicial falso e exigência de consentimento explícito. [Documentação oficial Mozilla, consultada20/10/2026](https://developer.mozilla.org/en-US/docs/Web/HTML/Reference/Elements/input/checkbox) descreve persistência dinâmica do checked no Firefox e controle por autocomplete. Nenhum consentimento é inferido ou gravado automaticamente.

A leitura de nome da loja no teste usava innerText de select nativo, que Firefox não expõe como Chromium; agora lê o texto real das opções e mantém a exigência de Second Coaching. Não altera o seletor de produção nem remove a asserção.

WebKit118869615761 expirou na primeira ação de lembrete, antes do retorno de quiet hours. Botão passa a iniciar desabilitado na renderização do servidor e só habilita quando o cliente está pronto, por snapshot de hidratação; o handler também recusa ação antes desse estado. Mesma permissão, single-flight, cotas, horário silencioso e custo. Nova suíte completa em Chromium/Firefox/WebKit, Redis, mobile e segurança obrigatória no novohead; não reexecutar job isolado nem contar publicação antes da prova.


#### P0201 — WebKit ainda reprovado, diagnóstico sem afrouxar teste

20/10/2026 17:42 Fortaleza: WebKit118872840013 repetiu o timeout da primeira mensagem quiet no head9a6ca8758d2c86f175cf1665848ee2ad04bf6338. A hipótese de ação antes da hidratação não explica sozinha a falha; não declarar corrigida. O teste agora registra, somente quando essa mesma asserção estrita falha, contador de requests, status de transporte, texto do status, estado do botão e erros da página. Sem remover espera/asserção, trocar motor ou aumentar timeout; nova suíte inteira no novohead obrigatória. Consentimento e demais gates preservados.


#### P0201 — evidência do transporte WebKit e isolamento dos mocks

20/10/2026 17:47 Fortaleza: WebKit118875445640 no heade98a70db7a70f8431ee156531019d131e7130dbd registrou requests=0 no interceptor, response200 e mensagem real de devices0, sem erro de página. Portanto o botão funcionou; o mock409quiet não foi usado. StudioApp registra /studio-sw.js e há fetch handler nesse worker. A [documentação oficial Playwright](https://playwright.dev/docs/network), consultada20/10/2026, recomenda serviceWorkers:block para mocks por route que não interceptam requisições de páginas controladas por worker. Os três contextos do harness agora bloqueiam workers apenas no teste, com asserção explícita de controlador ausente antes do cenário sintético. Mantém todos os contadores, replies, quiet409, single-flight, consentimento e limites; não altera SW/app/PWA de produção nem afirma que push/offline foram validados. Nova suíte completa no novohead obrigatória. A hipótese anterior de hidratação não é tratada como causa comprovada.


#### P0201 — mocks alcançados no WebKit; concluir leituras antes de navegação/fechamento

20/10/2026 17:53 Fortaleza: WebKit118878095443 no head3eabe24937e901bda39656864cd60983699a5f3e passou reminder e answers nas duas larguras, e todos os cenários de consentimento/saída do board. O assert final de zero pageerrors reprovou duas leituras RSC de prefetch (/studio e /studio/phone) encerradas durante navegação/fechamento do contexto; log do servidor também registrou destination stream closed early. O teste agora aguarda networkidle antes dos reloads explícitos, da confirmação que provoca reload e do fechamento após sucesso, mantendo a coleta de todos os pageerrors e o mesmo assert vazio. Não ignora erro por regex, não aumenta timeout, não remove cenário/asserção ou altera código do app. Hipótese de aborto de leitura em teardown deve ser confirmada pelo novo CI integral, sem declarar passa antecipadamente.


#### P0201 — WebKit avançou; medir falhas de pintura e isolar contextos auxiliares

20/10/2026 18:02 Fortaleza: WebKit118880654986 no headbe741c0f5e7443dd862767f32dca20e9fd22f102 passou a seção do board após concluir leituras antes de navegar/fechar. Detectou31 falhas de placeholder/foco/forced-colors e interrompeu em path-return.mjs após um mock de details em contexto auxiliar com worker permitido. A fábrica de contextos do harness agora aplica serviceWorkers:block também aos helpers, preservando a suíte inteira e o app/SW de produção.

Antes de mudar CSS ou presumir suporte de emulação, registram-se cor/opacidade computadas do placeholder, pixels reais versus área mínima, estilos do foco e correspondência real de forced-colors. As asserções originais, controles negativos, thresholds e zero pageerrors permanecem. Resultados não são dispensa de AAA ou teste em aparelho real. Nova suíte completa obrigatória no novohead; publicação não confirmada.


#### P0201 — correções de pintura baseadas em pixels WebKit

20/10/2026 18:11 Fortaleza: job118885614124 mediu698pixels de foco3:1 para mínimo702 em links sociais arredondados; outline social passa a4px, sem reduzir área/contraste exigidos. Selects nativos reportavam outline3px mas pintavam0pixels e descartavam box-shadow no WebKit. Controles select.field/st-field de seleção única passam a aparência CSS com seta em currentColor; mantêm o elemento nativo, opções, valores, teclado e nomes acessíveis. Não muda conteúdo, identificadores, limites, permissões ou operações. Nova suíte inteira deve comprovar pintura e ausência de regressões.

Outros achados continuam abertos: WebKit relata placeholder como cor do input inclusive no controle negativo; forced-colors media ativa, mas propriedade forcedColorAdjust ausente. Não presumir falha visual nem dispensar critério: ampliar evidência por pintura e suporte da API antes de ajustar o teste. Móvel118885613625 reprovou primeira interação da home248ms, preservada para correção e verificação completa posterior; nenhum head reprovado será incorporado.

Em paralelo sem conflito, PR731/branch codex/p0-201-public-access-matrix adiciona225casos reais de páginas públicas, sem editar arquivos desta branch:75/motor, cinco larguras e cinco modos. Teto adicional90min Linux/execução, elegibilidade pública atual USD0 cobrado, sem serviço/cliente/operação novo. Não encerra201 nem adianta202/B2.


#### P0201 — contraste de placeholder medido na pintura real

20/10/2026 18:15 Fortaleza: WebKit relatou rgb(17,24,39), a cor do input, no pseudo-elemento de sign-in, e ratio17,07 mesmo após injetar o placeholder antigo desbotado. A leitura computada não distinguia o controle negativo. O guard passa a comparar screenshots do mesmo campo sem foco, com e sem somente o texto de placeholder, para isolar os pixels reais dos glifos. Exige pelo menos20pixels alterados, razão mínima7:1 e pelo menos8pixels de núcleo com essa razão; borda, ícones e caret não entram como texto. Restaura imediatamente o atributo; nenhuma gravação/post é feita. Continua exigindo opacidade1, placeholder mostrado e rejeição do controle antigo com ratio<7; ausência de glifos reprova, nunca vira aprovação por campo vazio. Não baixa contraste nem elimina controle negativo/temas/larguras. Nova suíte integral no novohead obrigatória; resultado e conformidade ainda pendentes.


Leitura de forced-color-adjust passa pela API CSS getPropertyValue, com CSS.supports registrado, em vez de presumir propriedade camelCase exposta no WebKit. Continua exigindo valor auto, mídia ativa, outline e pixels reais: não converte ausência em auto nem ignora falha. Verificação completa no novohead obrigatória.


### Item201 — continuidade da verificação (20/10/2026 18:24 Fortaleza)

No head `db7efae4c0e1c227d777a1234f935eec829c8968`, Firefox confirmou contraste real do placeholder e rejeitou o controle negativo desbotado, mas o job118891303465 falhou nos focos em alto contraste e no download do certificado. Permanecem abertos, sem redução de critérios. A falha anterior de growth/contact por prefetch RSC interrompido recebe espera de rede ociosa antes de navegação/reload/fechamento sintéticos; a coleta e a exigência de zero erros permanecem integrais. Nova execução completa obrigatória no novo head; nenhum merge/publicação neste registro. Custo variável por cliente: nenhum; CI padrão público já previsto, minutos efetivos pendentes de consolidação. Gates, preços e limites preservados.

Certificado privado: controles de escolha, consentimento e download aguardam a hidratação do manipulador; preferência monetária usa autocomplete off. A regressão SSR exige botão desabilitado antes da hidratação (falha no código anterior), e a jornada existente mantém download real por Enter nas duas larguras. O timeout Firefox continua apenas hipótese de interação antes da hidratação até a prova no CI completo; não declarado resolvido. Sem escrita de servidor ou custo novo.

Foco: WebKit confirmou que engrossar só a borda preta não aumenta os698 pixels da banda branca no fundo escuro (mínimo702); a banda branca passa a4px, com deslocamento correspondente. Alto contraste usa CanvasText, cor de texto do sistema, em vez de Highlight azul que não alcançou3:1 no Firefox. Nenhum limiar reduzido. WebKit informa CSS.supports(forced-color-adjust)=false: lacuna de suporte deve ficar explícita, sem inventar valor auto. Matriz pública do PR731 passou225casos nos três motores; incompletos e jornadas autenticadas continuam abertos. Sem publicação neste registro.

Medição de foco: estilos calculados passam a ser lidos depois da captura que conclui transições finitas, correspondendo ao estado pintado medido. Todos os controles continuam exigindo área mínima, contraste3:1, borda sólida e sombra ausente no alto contraste. Declaração forced-color-adjust só exige auto quando suportada; WebKit sem suporte exige valor vazio e registra FIELD_FOCUS_OPEN_GAP, sem alegar auto ou validação real do sistema. Certificado aguarda botão realmente habilitado antes de Enter, com timeout30s e download/conteúdo/zero escritas preservados. Nova verificação completa, sem publicação nem conclusão do201.


### Publicação funcional124

Item201 permanece em andamento. PR#731 incorporado em20/10/2026 às18:35:44 Fortaleza; head verificado `97085c90b21354ec29e510d90842b9a0bbf1ebca`, merge `4704f434632af93651a037cdc5d69963f7ea98bf`, árvores idênticas. Produção READY às18:36:40.209 Fortaleza, domínio `marktmorgen.com` ligado exatamente ao merge, deployment `dpl_74bxw9mLcxx478cEeZm44J8SGiVN`. Home, signin, studio anônimo (entrada esperada), Path, preços e privacidade responderam200 no mesmo deployment; marcação publicada confirmou as correções.

Mudanças: três textos pequenos públicos com contraste reforçado; cadastro permite quebra e encolhimento com espaçamento ampliado em320px sem esconder conteúdo. Preços, limites, conteúdo e gates preservados. Product39499142087, segurança39499141879 e matriz pública39499141618 aprovados no head exato.225casos (75 por Chromium/Firefox/WebKit), zero violações automáticas;175registros por caso de incompletos/lacunas continuam abertos, sem alegação de conformidade integral. Laboratório móvel:9amostras, máximo LCP1216ms, CLS0 e interação96ms, sem certificação INP de campo. Erros/fatais de runtime:0 somente na janela21:32:12.504–21:37:12.504UTC. Custo variável novo: nenhum; CI público Linux padrão, sem compra/conta/serviço novo. Item201 e PR730 continuam,202 depois, nenhum B2 novo à frente.

Item201, continuidade20/10/2026: WebKit no headccb7711 aprovou os controles quantitativos positivos de foco e placeholder; ausência de suporte forced-color-adjust registrada sem fingir auto. A primeira gravação sintética de Company deixou1campo não salvo após POST, causando timeout do estado confirmado. O teste agora exige o estado visual de alteração antes do Tab, aguarda rede ociosa antes da entrada e registra pedido/resposta/valor sintéticos se continuar falhando; nenhuma conclusão de causa/fix ainda. Sem reduzir assertivas. PR#732 amplia150casos autenticados; primeiro head teve36falhas Chromium e13Firefox, incluindo CSP rolável sem foco, contraste do status e overflow. Correções CSP/status submetidas no headad708798; overflow permanece aberto. Custos fixos de CI incluem falhas/cancelamentos; nenhum custo por cliente ou compra nova. Toda nova alteração exigeCIcompleto.

Item201: WebKit job118907556999 no heade9485f2 confirmou a gravação real/reload/recusa/retry/incerteza de contato nas duas larguras. Próxima falha: page.goto cancelado em path-return linha53, após o toast do DetailsForm que chama router.refresh(). O teste aguarda rede ociosa após esse toast e antes da navegação seguinte, preservando a prova de que resposta interceptada não conclui a missão e somente persistência real muda o foco. Não ignora erros nem muda timeouts/limiares. Nova execução completa obrigatória. Publicação permanece124.

Item201: WebKit no head3501f9 avançou pela persistência real do retorno, mas revelou overflow do calculador de custos após selecionar Billing separado (390px) e botão Intro ainda desabilitado após fill. Calculador limita fieldsets/controles e colunas a mínimo0, sem alterar fórmulas, preços, dados ou tratamento de desconhecido; mantém teste de largura e acrescenta diagnóstico se falhar. Intro aguarda rede ociosa e mensagem real de vídeo reconhecido após entrada antes do clique, preservando12cenários/3provedores/2larguras e todos osPOSTs interceptados. NovoCIcompleto; sem conclusão antecipada ou nova publicação.


### Publicação funcional125

Item201 segue em andamento. PR#732 incorporado em20/10/2026 às19:26:26 Fortaleza, head verificado `09a63a48431a823f7133484cd6091c33c978dcd3`, merge `6d66283672775ab1d8f492357d7ab5a3114d4579`, árvores idênticas. READY às19:27:40.453 Fortaleza, domínio `marktmorgen.com` na versão exata, deployment `dpl_HQi1Auj72oKuC9AvsLjQiEkWUemw`. Sete rotas baseline responderam200 no mesmo deployment; studio e editor anônimos levaram à entrada esperada. Fluxos privados comprovados somente peloCI sintético, sem conta real.

Mudanças: região rolável de diretivasCSP acessível por teclado/nome; contraste do status de página; reflow do checklist/URL longa, gasto, promoção e campo de notas ao lado de datas nativas, sem esconder conteúdo nem alterar identificadores/valores/limites. Product39505689751, segurança39505689796, matriz pública39505689746 e studio39505689696 aprovados no head exato:225casos públicos e150autenticados somente de leitura, três motores.142registros por caso de incompletos/manuais do studio permanecem abertos; sem alegação de conformidade integral ou zoom/aparelho real. Erros/fatais:0 apenas na janela22:23:40.975–22:28:40.975UTC. Custo variável novo: nenhum; nenhum serviço/conta/contratação. CI Linux padrão público continua com elegibilidade atual sem cobrança incremental; teto adicional90minutos/execução e falhas/cancelamentos contabilizáveis. Gates e piso60%preservados. Criação/publicação/checkout/comprador e demais lacunas do201 ainda abertos;202depois e nenhumB2àfrente.

Item201, após integração da publicação125: casos de PDF aguardam rede ociosa antes de abrir detalhes; links dos números aguardam também o router.refresh após respostas confirmadas antes do próximo cenário. Todos os cenários e requisições exigidos permanecem. Calculador Firefox reportou scroll502/client348 sem descendente pintado fora da caixa: diagnóstico acrescenta largura da raiz e controles nativos antes de atribuir causa ou mudar guardas. AlturaFAQ WebKit em1280 recebe dimensões e estilos exatos nas falhas; critério44px permanece. Nova execução completa obrigatória; nenhuma falha dispensada nem nova publicação.

Item201: no heade8e640, job118924958225, o Path voltou a cancelar goto apenas46ms após resposta do save; networkidle ainda descrevia a rede anterior antes de React iniciar refresh. A correção espera explicitamente o GET RSC de /studio sem prefetch, exige respostaOK e término do corpo, e só então rede ociosa/navegação. Não captura/ignora cancelamento nem remove a prova de persistência real. PR#733 separado adiciona75casos sintéticos de criação/reload/publicação manual/loja local, sem checkout/email/IA; tetoCIadicional120min/run,120R/mês1440R/ano, elegibilidade pública padrão atual sem cobrança incremental. Ainda sem resultados e sem conclusão do201. Publicação permanece125.


### P0-201 — verificação completa de 20/10/2026, 19:54 Fortaleza

Head 2bec53d0: matriz pública passou; studio Chromium/Firefox passaram, WebKit 50 casos/1 falha (320px com espaçamento: scroll355/client320, nenhum elemento geométrico excedente). Product WebKit falhou: calculadora scroll502/client348 sem elemento excedente; Save sites desabilitado antes do pedido. Mantidas as falhas e limites originais. Próxima correção limita e permite quebra das legendas longas da calculadora; diagnóstico inclui overflow interno, inclusive caixas anônimas/texto, e o teste de allowlist aguarda hidratação/rede antes de abrir os controles. Hipóteses ainda dependem do CI completo no novo head; nenhuma certificação, incorporação ou publicação. Sem custo novo de operação; incluir minutos falhos/cancelados no total do CI. PLANS_ON_SALE=false e gates comerciais/fiscais preservados.


### P0-201 — evidência e correção, 20/10/2026, 20:09 Fortaleza

Head9f0bb45e: Firefox calculadora passou em390/1280 após limitar/quebrar legendas, sem alterar valores ou limites. FAQ falhou porque alvos44px computados mediram43.999969/43.999996px: aumenta-se altura mínima real para48px; assertion44px preservada. Numbers remove/null não enviou pedido após missing: causa ainda aberta, teste passa a ativação real por foco+Enter e registra estado/botões/foco em falha, mantendo todos os casos e pedidos/payloads/locks/recusas. Studio três motores passou; mobile eRedis passaram; Product completo permanece sem aprovação. Novo head exige todos os workflows completos; nada incorporado/publicado. Sem custo operacional novo e sem mudanças nos gates.


### P0-201 — diagnóstico 20/10/2026, 20:20 Fortaleza

Head40fb: WebKit público75casos/1falha target-size no CTA Start your store a320; ambos CTAs iniciais passam a inline-flex/min48px. Calculadora: seletor Billing appearance none ainda propagou scroll436/client274 ao pai; limitar overflow somente no próprio select nativo, mantendo opção/valor/teclado e popup nativo, sem cortar seção/página ou mudar fórmula. Recovery falhou ao marcar checkbox durante início domcontentloaded; aguarda rede/hidratação antes de abrir controles, mantendo setChecked e todos os payloads/recusas. Script RSC pageerror continua aberto. Studio3motores/mobile/Redis passaram mas não substituem Product completo. Falhas anteriores preservadas, novo head exige CI integral. Custos de runs cancelados/falhos incluídos em auditoria local detalhada, sem custos operacionais novos.


### P0-201 — 20/10/2026, 20:38:17 Fortaleza

Headf59cca: Firefox Product completo passou (job118944158967); público3motores, Studio Chromium/Firefox, mobile eRedis passaram. WebKit Product falhou em390 por reminder-fit (correção compartilhada de cabeçalho/Studio em PR733 ainda não integrada) e primeiro movimento da ordem não observado antes do Save. Teste de ordem passa a aguardar rede/hidratação antes de abrir detalhes e a sequência exata movida antes de verificar/salvar; todos os24pedidos interceptados, payloads, locks e recusas mantidos. Studio WebKit permanece1falha320 spacing; nenhuma publicação/incorporação. Novo head exige CI completo.

Auditoria de duração às23:18:42Z:90runs concluídos das branches730/733,256jobs,59368segundos somados (989,47minutos), incluindo sucesso/falha/cancelamento. São tempos de jobs, não valor de fatura; excluem runs ainda ativos e branches anteriores731/732, portanto subtotal histórico e não total final. Evidência por job preservada na continuidade. Nenhum novo serviço pago/operação por cliente; margem60% mais onerosa continua não certificada e custos desconhecidos não são zero.


### P0-201 — sincronização dos cenários de confirmação (2026-10-20 23:57:40 UTC)

Head9cd: Firefox completo passou novamente; WebKit passou movimento inicial da ordem, mas parou no checkbox inicial de cart-deal (clique antes de estado confirmado), após reminder-fit390 ainda aberto e dependente das correções733. Para corrigir a preparação comum em vez de avançar uma falha inicial por vez, os34helpers acknowledgment aguardam networkidle em suas navegações, em vez de apenas domcontentloaded. Mudança mecânica do estado de espera; permanecem todos os cenários, quantidades, payloads, recusas, locks, pageerrors e limites de largura. Não há escrita nova, retry de job isolado ou execução local. Novo head exige CI integral. Custos cancelados/falhos preservados no subtotal histórico e futura atualização; sem serviço pago novo.


###201 — diagnóstico Chromium/RSC e WebKit,20/10/2026 Fortaleza

PR730 head291cc: Firefox118956071355 passou completo; WebKit118956071405 terminou com31assertions reprovadas:28ajustes de lembrete390, script com prefetch /studio/phone abortado e erros globais RSC. As34preparações de acknowledgment avançaram sem falha inicial de controle. verify118956071434 atingiu35min logo após “details RSC refresh responds”; não é sucesso. Pathreturn passa a limite30s por ação e60s na conclusão do RSC, timeout reprova; script aguarda idle após redimensionamento antes de navegar. Não remove erros, regras ou cenários, não amplia teto. Layout compartilhado dependePR733; nova CI completa exigida. PR733d3b: Firefox/WebKit25/0,Chromium cancelado40min; novo c8e559 aguarda CI completa após limites/diagnóstico. Sem entrega funcional nova; contador125/próxima126 mantido. Custos incluem cancelados, subtotal989,47min histórico não é total atual nem fatura certificada. Nenhum serviço/operacão real;PLANS_ON_SALE=false e controles60% preservados.


###201 — leitura efetiva do RSC,20/10/2026 Fortaleza

PR7308dc9cada verify118978511034 falhou no limite60s de Response.finished; Firefox118978511353 passou,WebKit118978511403 terminou30assertions reprovadas incluindo lembrete390,HT10beacon e erros RSC acumulados. PR73348d3f8 já passou Chromium118985684113 após trocar conclusão instrumentada por corpo fetch real clonado e completamente lido no navegador; Firefox118985684364 também passou,WebKit/CI integral ainda pendentes. Pathreturn usa a mesma prova completa,não vazia,sem erro,60s, antes de navegar, preservando confirmação falsa versus persistência real,isolamento e zero conclusão manual. Não ignora stream pendente nem remove assertions; nenhum request extra/serviço novo. Novo CI integral obrigatório. Contador125/próxima126 mantido atéREADY+domínio+SHA.


###Entrega funcional126 —PR733,20/10/2026 Fortaleza

Incorporado em23:02:23Fortaleza (2026-10-21T02:02:23Z),mergeed622e1d92866a639a99d5906f55056790c061bc; árvore15af49d9c24aba9b98c2ad2cd3bdef620fbc56d5 idêntica ao headf5ff1d504ccaf0518b0f299cc334d775804299f4 integralmente aprovado. READY2026-10-21T02:03:27.794Z,dpl_nUyMec9DXJCZDCb4NYrTfkDBsDYe,domíniomarktmorgen.com confirmouSHA exato; sete rotas200 com mesmo deployment, incluindoPricing com novos alvos48px. Studio privado redireciona visitante para entrada; ações privadas comprovadas somente noCI sintético. Runtime semerror/fatal somente na janela01:59:14.984–02:04:14.984Z,sem promessa de ausência futura.

Funcional: grade/seletores nativos doStudio contêm títulos longos em telas estreitas e espaçamento; campos compartilháveis quebramlinhas; detalhes fechados deixam de expandir layout; controles de edição/remover eCTA/FAQPricing48px. Preços,IDs,conteúdo,flags,optin econtroles fiscais/custos preservados. Product39528716793 (verify118989652677,Redis118989652912,mobile118989652893),segurança39528716826,public39528716734 225casos,studio39528716869 150casos,ações39528716759 75casos,todosaprovados. Matriz nova comprova criação local,reload,publicação explícita eproduto visível; não checkout/buyer/contareal. Histórico anterior de falhas/cancelamentos mantido. Contador126,próxima127. Item201permanece aberto.

Custos: nenhum provedor/serviço novo nem custo variável porcliente. CIação teto120min/execução,120Rmensal/1440Ranual;subtotal histórico989,47min/90runs nãoé total final. Durações posteriores/canceladas devem ser reconciliadas; custo desconhecido nãoézero e não há fatura/margemcertificada. Meta60%individual/global,leitura mais onerosa,reprovação fiscal ePLANS_ON_SALE=false preservados.

PR730 integra agora exatamente os11arquivos doPR733 mais este registro, mantendo seus demais arquivos e histórico,com commit de dois pais e novaCI completa. PR730fc9d3f teveverify/Firefox aprovados eWebKit31falhas (lembrete390,HT10beacon,HT15leitura tardia,errosRSC); correções compartilhadas integradas não significam aprovação antecipada. Próximos achados precisamcorreção eCI integral.


###201 — HT10 payload real e HT15 leituras explícitas,20/10/2026 Fortaleza

WebKitfc9d3f: HT10beacon não expunha Blob no route; teste agora captura cópia do corpo sendBeacon real no navegador antes de chamar método nativo. SomentePOSTlocal/store/hit doframe/@templatelibraryfixture noWebKit com metadata ausente usa captura; h/k/chaves/tipos continuam todos validados,zeroeventosads ezeroescritas inesperadas mantidos. Não aceita corpo desconhecido nem executaestatísticas; nada muda no produto/optin. HT15esperado2/obtido1 era navegação antes da leitura de destinatários: registra waitForResponse count antes das duas navegações e aguarda cada resposta exata,sem diminuir contagem2/limites. NovoCI integral,sem rerun isolado; demais falhasRSC permanecem abertas. CustosfixosCI históricos mantidos,nenhumserviçonovo;entrega126 já confirmada,próxima127.


###201/B2-200 — reduzir trabalho fora da tela após reprovação móvel,20/10/2026 Fortaleza

Head1f8ab84 mobile118998070721 reprovou Home sample1: interação200ms,metaestrita<200,LCP772ms/CLS0;outras8amostraspassaram. Evento ocorreu junto de longtask166ms; não se elimina amostra nem relaxa gate, e não se declara causa exclusiva. Revisão identificou HeroFlow com timer5s ativo mesmo fora da tela/enquanto abaoculta. Agora IntersectionObserver+visibilitychange pausam esse timer fora da área visível/abaoculta e retomam ao voltar;conteúdo e escolha manual/reducedmotion preservados,sem gatilho comercial/custo. É redução concreta de trabalho desnecessário,hipótese de contribuição à primeira interação; exige suíte integral/móvel no novohead e conservaoutlier248ms histórico. Item203Teams permanece ao fim; ordem depois202 eativos,sem bloqueio.


###201 — navegação sem interromper leituraRSC,20/10/2026 Fortaleza

Head5d209df: verify/Firefox/mobile aprovados; WebKit119000075245 reprovou26assertions:24“reminder settings fit”390 no helperDunning,script/globalRSCerrors. HT10beacon eHT15leituras passaram após correção. O helperDunning abre todos os details deStudio; porisso a largura é da página completa com todos painéis expandidos, não diagnóstico exclusivo deDunning. Novo diagnóstico preserva assertion e identifica geometrias/scroll interno dessa situação. Contextos da suíte agora aguardam networkidle e leitura completa deRSCantes de navegação direta,resize e pageclose,sem filtrar pageerrors ou retirar respostas do relatório; impede que próprio teste interrompa prefetch/RSC pendente. Métodos nativos permanecem e controles/POSTs/contagens não mudam. Corpo é lido por clone local,sem rede extra; falha deespera continua reprovação. NovoCI integral exigido,nenhum provedor/custo variável novo. Histórico200ms/248ms mantido; item203Teams continua ao fim,sem antecipação.


###201 — aguardar somenteRSC,20/10/2026 Fortaleza

Headfb9b4ee verify119005919880 expôs incompatibilidade da nova espera global networkidle com a página deexperimentos que faz leituras recorrentes: após falha503 validada390,resize ficou60s aguardando toda rede. A preparação de navegação/resize/fechamento passa a exigir apenas leiturasRSC completadas e conjunto estável200ms,com mesmo timeout60s. Leituras periódicas deAPI não são respostasRSC pendentes e continuam sujeitas às suas assertions. Nenhum pageerror,caso,contagem ou limiar deproduto é removido. Esse ajuste corrige a espera adicionada noheadanterior,sem declarar as falhasWebKit resolvidas; diagnóstico expandedStudio preservado. CI integral novo obrigatório;sem novo provedor/custo porcliente. Item203preservadoao fim.


### Item201 — correção após head90613a7 e integração explícita de735

WebKit119014702042 terminou com25falhas:24fitreminders390 e3errosRSC acumulados em umaassertiva. O diagnóstico inicial não registrouoverflow antes de escolher2/3emails; após seleção, todos24casos390falharam e1280passou. O select nativoDunning passa ao mesmo padrão limitado/appearance-none comchevron decorativo dos seletores já corrigidos, preservando opções,teclado,POST,locks e confirmação. Diagnóstico apósseleção registra medidas reais; nenhum limite de teste reduzido.

A barreira deRSC já aplicada agoto/resize/close não cobria3reloads reais do owner. Reload agora também aguarda leitura dos corposRSC pendentes, commesmo timeout60s; erros de página continuam reprovando e recebem URL/stack para localizar qualquer falha restante. Verify eFirefox906passaram;mobile906falhou240ms,sem exclusão de amostras.

Integração explícita do head73546afa12:prefetch dos3CTAs deplanos desativado,diagLongAnimationFrames e substituição exclusiva219OP5 preservados. Mobile119019895934 no46afa12 passou9amostras:home64/40/40ms,pricing32/32/32ms,salespages32/32/32ms;LCP564–744ms,CLS0. Isso não certificaINPdecampo nem apaga falhas240/272ms. Novohead exige suíteintegral; sem entrega antecipada.

Custos reconciliados em21/10/2026~03h28UTC:231execuçõesconcluídas/653jobs/178442segundos=2974,03job-min, incluindo falhas/cancelamentos, dados anteriores730/733 e acréscimos730/734/735. Execuçõesativas/pendentes,branches731/732efaturareal não incluídas;custosdesconhecidos nãozero. Evidência localmarktmorgen-ci-cost-20261021-0328.json. Nenhum custo variável/provedor/operação/comercial novo.


### Entrega127 — publicação funcional confirmada, PR730

Incorporação real21/10/2026 00:51:39Fortaleza(03:51:39Z),merge6425aed18058f20d79b15902ebb5824e6ab87b6d;headverificadoa7b7ec00554bdca522bcafb2aa46b76d6400763c,árvoreidêntica14fdbe3a9f9457d1c9388c7a150442dc20ec7f2c. As16verificações passaram noheadcompleto,sem rerunisolado:verify,Redis,mobile,Firefox/WebKitsuíteinteira,segurança,matrizespublic225/studio150/ações75echeckpreview.

VercelREADY21/10/2026 00:52:38.597Fortaleza(03:52:38.597Z),dpl_4CQ172fei1TJHZfJ3mdw9W88cdZ3,marktmorgen.comassociado a6425aedexato. Probes/,/pricing,/signin,/studio,/studio/pages,/platform/path,/privacy responderam200com mesmoDPL;rotasprivadas semsessão são redirecionamentos anônimos,nãoprova deaçãoautenticada emprodução. Runtimeerror/fatal0 somente janela03:48:42.775–03:53:42.775UTC. Contador127,próximo128,avisadoapósconfirmação. Correções concretas:Pathpersistência/retorno,seletores/layoutStudio/foco/contraste,calculadora/Pricing estreitos,pausaHeroFlow fora da tela/aba eCTAplanos semprefetch especulativo.

Custos históricos231execuçõesconcluídas/653jobs/178442segundos, incluindo falhas/cancelados; posteriores/ativas e fatura excluídos,desconhecido nãozero. Nenhumprovedor/operação/custo variável novo,gates/preços/limites/comissão/optinpreservados ePLANS_ON_SALE=false. Não certificaAAAglobal,INPdecampo ou60%apósleiturafiscalmais onerosa. Item201continua:734a877384 cadastro75jornadas/225auditoriaspassou nas3engines,masaguarda suíteintegral;736corrigebanner/reflowbiblioteca eaguarda novoheadintegral. Checkout/Stripehospedado,entregaexterna,zoomreal400%,aparelhos/AT/manualscroll não declarados concluídos. Itens203–219incluindonovoOP5agorapreservados emmain,continuam nafilasemativação.


### Suíte integral do comprador — isolamento da agenda sintética

Headd56550b:matrizcomprador75jornadas/375auditoriaspassou nas3engines,masverify119029961232 reprovoutests/team-scheduling.test.ts:busycalendar expected[true,true,false],got[false,true,true]. O helperweekdayAt arredonda finsdesemana: numaquarta-feira,days3e5 caem na mesma segunda às10h, repetindoS emB; amboshosts já haviam sido ocupados no cenárioanterior, e oproduto corretamente recusou novo hold. Falha defixturedependente dodia,semrelação com regra depermissão/agendaalterada.

O cenárioGoogle usaagora13h, separado dosholds10h/11h; assert explícita exigeBdistintodeS/G. Mantidos busy real, dono livre, recusaMaya,cap/permissões/scopes/estorno e todos os demaisoráculos. Sem alterar produção nem descartar falha. Nova suítecompleta no novoheadobrigatória;rerunisoladonãoresolve. Integração explícita da seçãoHL220–230 do737 nafilaaoEOF, preservando203–219 eprova127; itensfuturosdesligados/nãoiniciados.


### Matriz pública — teclado, cabeçalho e geometria estável

No0a957ea, WebKit119033252671 reprovou1/75casos:pricing390/baseline,target-size em.bg-neutral-950; oCTAjátemmin48px. A matriz fazia10Tabs reais e depoisaxe sem restaurar origem, misturando geometria de alvo fora da tela com estado de rolagem criado por teclado; não há prova capturada de dimensão menorque48px. Falha preservada,semexcluir regra/amostra.

O produto ganha scroll-padding-top5rem para destinos de teclado/âncora ficarem abaixo do cabeçalho sticky64px. A prova de teclado agora também exige centro do alvo realmente visível/desobstruído por hit-test no estado de rolagem real,com espera limitada5s e semforçar foco. Depois, a avaliaçãoaxe integral voltaàorigem estável200ms,como asmatrizesStudio/ações,sem esconderheader ou alterar CSS para auditoria. Isso separa duas medições e fortalece oteste deoclusão em vez de ignorá-lo. Manualscroll/AT/zoomreal continuam lacunas. Nova suítecompleta noheadcorrigido obrigatória; não é alegação antecipada de correção.


### Entrega128 — cadastro e links informativos publicados

PR734incorporado21/10/2026 01:11:03Fortaleza(04:11:03Z),merge2439929afa780929eaefd508196047ca0a35abb9;headverificadoa877384d51ab784255cca92cd37944a85b2de64a,árvoreb525467c4f217bf94d6eca47308cb765c0573a32idêntica. As19verificaçõespassaram, incluindo cadastro75jornadas/225auditoriasnas3engines,verify,Firefox/WebKit,mobile,Redis,segurança eoutrasmatrizes. Rodapé eTerms/Privacy do cadastro evitam prefetch especulativo,preservandoURLs/texto/consentimento/teclado.

READY21/10/2026 01:11:55.470Fortaleza(04:11:55.470Z),marktmorgen.com versãoexata2439929,dpl_A7PG69tBwdBkP868tUKuBX9tBZe9. Probes/,/signin,/signin/confirm,/pricing,/library,/privacy,/refunds200mesmoDPL,sem criar conta/mensagem/operação real;confirmaçãosemtoken é apenasleitura,fluxoautenticado testado localmente. Runtimeerror/fatal0 sójanela04:07:50.978–04:12:50.978UTC. Contador128,próximo129,avisadoapósconfirmação. Sem novo provedor/custo variável;CIcadastroteto90job-min/run,apuração completa/fatura continuamobrigatórias,desconhecido nãozero. Gates/preços/limites/optin/fiscal preservados,vendasfechadas. SemcertificarAAA/INPdecampo/margemfiscal60%.


### Geometria de foco em links multilinha

C876d675PublicFirefox119035858315 falhou2/75casos,signin320e390baseline, no novo hit-test de5s. A implementação usava o centro da caixa que une todas as linhas de um linkinline; esse ponto pode ser espaço vazio entre fragmentos,mesmo que cada fragmento seja clicável. A checagem passa a exigir centro visível/desobstruído de **cada**getClientRects comárea, mantendo timeout5s, foco real e todos os10Tabs. Não se usaum ponto arbitrário da união nem ignora timeout. Uma falha restante agora registra índiceTab,tag/classes,scroll e todos osfragmentos/hit-test,semHTML/hrefs/tokens. Causa específica de cada timeout depende dessa prova; sem declarar correção antes doCI. Scrollpaddingproduto eorigem estávelaxe mantidos,sem baixar regra/limiar ou filtrarcaso. Suíteinteira obrigatória no novohead.


### P0-201 — estabilização do scroll após navegação real por teclado (21/10/2026)

Head2d791: Public Chromium119037760183 falhou11/75 por timeout10s ao exigir origem estável após Tab; Firefox/WebKit passaram. O hit-test dos fragmentos não foi a falha observada. O navegador pode continuar o scroll suave iniciado pelo foco após o pedido de retorno à origem. O harness agora aguarda primeiro200ms sem mudança real de scroll, com limite10s, e só então pede origem instantânea; mantém a exigência de origem0,0 estável200ms, todos os10Tabs, hit-tests e regras axe. Sem reduzir critérios, ignorar casos ou reexecutar job isolado: suíte completa no novo head. Sem novo provedor/custo operacional; minutos CI continuam custo fixo da empresa com fatura desconhecida não considerada zero.


### P0-201 — diagnóstico explícito da origem de scroll (21/10/2026)

Headb7a5: Chromium público passou; Firefox119039947008 falhou1/75 em/signin1280baseline por timeout10s, sem diagnóstico de foco. Os dois waits de scroll usavam a mesma mensagem e não permitem distinguir estabilização do teclado de retorno à origem. Acrescentado diagnóstico por etapa, posição real, estado do relógio e elemento ativo, sem conteúdo pessoal. Nenhum timeout, limiar, caso ou regra alterado; investigação continua com suíte completa no novo head. Não declarado concluído nem publicado.

### P0-201 — custos de verificação reconciliados (21/10/2026)

Recorte ampliado:310execuções concluídas,892jobs,252137segundos (4202,28job-min), incluindo falhas e cancelamentos. Evidência localmarktmorgen-ci-cost-20261021-0443.json preserva IDs/durações, base0328 e acréscimos concluídos730/734/735/736/737. Execuções ativas/posteriores e branches não listadas, inclusive738/739, não incluídas. Duração não equivale à fatura: custo efetivamente faturado continua desconhecido e não vale zero. CI é custo fixo da empresa; nenhum serviço/uso variável/preço/limite/gate alterado.


### P0-201 — causas observadas no head documental integrado (21/10/2026)

PR7390364816: Public Firefox119044516710 identificou audit-origin comscrollY714/BODY/scroll-behavior smooth após pedido instantâneo. O harness mantém o teclado real e todos os hit-tests; somente na auditoria posterior força temporariamente scroll-behavior:auto!important e pede retornoauto, exige origem0,0 estável200ms e restaura o estilo original depois deaxe. Nenhum scroll de teclado normalizado nem critério relaxado. Signup WebKit119044516508 fez75auditorias mas falhou1/25 por RSC abortado das rotas home e/signin/lost. Links informativos restantes da página de entrada (home/demo/recuperação) recebem prefetch=false; URLs, conteúdo, consentimento e ações permanecem. Sem filtro de erros. Correção em739 para preservar a execução saudável de736; suíte completa no novo head obrigatória antes de qualquer incorporação. Nenhum novo provedor/custo variável/preço/limite/gate.


### Publicação funcional129 — P0-201

PR739 incorporado em21/10/2026,02:29:01 Fortaleza (2026-10-21T05:29:01Z). Head verificado06b7637082e09b182b4955c109b97e21f0915eeb; versão3853a06de9b0a9c8d23c9b8bc0b43343a3709769; árvore85a472f31dd0a681028faf364feafd9eaf4ee8cc idêntica ao head aprovado. READY2026-10-21T05:29:58.662Z,dpl_79Jd65WZhX16mhL4zp351gof9tNf; domíniomarktmorgen.com confirmouSHA exato. Sete rotas200 com mesmo deployment:/,/library,/signin,/signin/confirm,/pricing,/privacy,/refunds. Provas de produção somente leitura, sem conta/pagamento/mensagem.

22/22checks aprovados no novo head, incluindoverify119049870480,Firefox119049870647,WebKit119049870458,mobile119049870248,Redis119049870656; produto39547729723, segurança39547729777, públicas39547729698, Studio39547730164, ações39547729679, cadastro39547729808, comprador39547729730. Matrizes sintéticas:225casos públicos,150Studio,75ações de produto,75cadastros/225auditorias,75compras/375auditorias, sem falhas nosjobs aprovados. Nove amostras móveis:LCPmáx728ms,CLS0,interação sintética máx80ms; não é INP de campo. Runtimeerror/fatal zero apenas na janela2026-10-21T05:26:07.204Z→05:31:07.204Z.

Mudanças: landmarkbanner na biblioteca e reflow320px/text-spacing com links quebráveis; scrollpadding do foco; links informativos do cadastro sem prefetch especulativo. Auditoria pública preserva10Tabs/hit-tests e origem estável com auto temporário somente após teclado, restaurado depois; fixture de calendário sem colisão de horários. Preços/limites/idiomas/IDs/consentimento/gates preservados,PLANS_ON_SALE=false; sem promessa de ganho ou margem certificada.

Custos fixosCI reconciliados emmarktmorgen-ci-cost-20261021-0512.json:371runs concluídos,1069jobs,306695segundos (5111,58job-min), incluindo falhas/cancelamentos; ativos/posteriores e faturas/provedores não incluídos. Fatura desconhecida nãozero. Nenhum novo provedor/custo variável/operação comercial. Contador129,próximo130, após READY/domínio/versão exatos. Item201 mantém lacunas manuais e a prova autônoma da publicação inicial abertas, não certificação AAA.


### P0-201 — prova da primeira loja após cadastro (21/10/2026)

A matriz de cadastro anterior terminava no Studio vazio; a matriz de produto usa loja semeada e não fecha essa lacuna. Novo head estende os25casos por motor atéPOST real local/api/store/claim, confirmahandle/SID, aguardaStudio criado, ativa pelo teclado o link real da loja, remove sessão e recarrega como visitante anônimo. Exige200 e nome real apósreload. Cinco estados auditados porcaso (125por motor/375total pretendidos), antes de declarar aprovação. TrêsPOSTs permitidos porcaso; visitas sintéticas exatas interceptadas sem gravação de estatísticas, com lacuna WebKit de payload declarada. GPC sintético impede publicidade. Mesmos cinco modos/larguras, fakeinbox/Redis e HTTPSlocal; nada real. Suíte completa obrigatória. Custo fixoCI dentro do teto existente3x30min,90Rmensal/1080Ranual, sem novo provedor/custo variável/gates. Item201 permanece em andamento até fechar esta prova autônoma e registrar as lacunas restantes.


### P0-201 — correção do retorno à loja nas compras (21/10/2026)

- Head f43eb7162b06f9f20703891b90bc513177dcf7f7 reprovou Buyer WebKit, job119058888135/run39550670710:25casos/125auditorias,1falha em320px/text-spacing na etapa buyer-orders. O erro foi o prefetch RSC de /@localshop abortado durante a navegação; não houve violação axe/overflow nesse diagnóstico. Nenhum erro foi filtrado ou descartado.
- O link de retorno da página de compras agora solicita a loja somente ao ser acionado (`prefetch={false}`), preservando destino, texto, idiomas, autorização e compras. Evita a requisição especulativa desnecessária; navegação real continua exigida pelos testes.
- Verificação: nova execução completa de todos os checks no novo head, sem repetir apenas o job reprovado. Não incorporado/publicado até aprovação integral. Matrizes de cadastro/primeira loja ainda sem resultado conclusivo;201 continua em andamento. Sem novo serviço/custo variável, preços/limites e gates inalterados; CI é custo fixo, fatura efetiva desconhecida não é zero.

### P0-201 — diagnóstico da atualização após criar a primeira loja (21/10/2026)

- Os três engines do headf43eb7 concluíram cadastro com10jornadas de primeira loja comprovadas por engine, mas15/25casos por engine falharam a partir de768px ao aguardar o título do Studio após claim200. Chromium:95auditorias/25casos/15falhas, job119058888046; Firefox119058888214 e WebKit119058888249 também reprovados. Isso não é prova de publicação integral nem falha de acessibilidade automaticamente atribuível ao layout.
- Acrescentado diagnóstico estritamente sintético e limitado de caminho, títulos, texto visível e erros do servidor para identificar o estado real que substituiu o Studio. Mantidos todos os asserts, limites,25casos, regras e recusas; nenhum timeout foi ampliado, erro filtrado ou resultado relaxado. Nova verificação completa no novo head.201 segue ativo; sem incorporação/publicação/contador.

### P0-201 — isolamento correto da matriz de primeira loja (21/10/2026)

- Leitura da causa emlib/free-pool-rules.ts e lib/free-pool.ts: FREE_POOL_BASE_STORES=10, sem pagantes a11ªloja sem plano é recusada antes de operações custosas. Os25cenários compartilhavam uma única base falsa e esgotavam corretamente esse teto após10sucessos. A recusa não autoriza ampliar limite, simular pagamento ou remover o gate.
- Cada cenário viewport/modo agora reinicia apenas os serviços locais falsos com uma base em memória vazia, como uma instalação isolada. O app e todos os gates continuam reais; cadastro, sessão, claim, reload anônimo, asserts e25cenários/375auditorias pretendidas permanecem. Nenhuma conta/loja real é criada, nenhum teto produtivo é alterado; testes existentes de pool continuam obrigatórios na suíte completa. Diagnósticos limitados preservados. Nova execução completa no novo head;201não concluído até passar. Custo de CI continua fixo no teto do job existente; fatura desconhecida não é zero.

### P0-201 — correção da montagem do script sintético (21/10/2026)

- Heade620bc3 reprovou signup com ReferenceError:viewportWidth: uma edição deste agente gravou sequências literais de quebra de linha no comentário e deixou a declaração da variável comentada. Corrigida a montagem com quebras reais, sem alterar a lógica, os gates ou relaxar assertions. Nenhum resultado desse head conta como aprovação.
- ProductFirefox job119064131486 também abortou com assertion interna de Playwright FrameManager.frameAttached/FFPage._onFrameAttached ao criar produto; evidência preservada, sem suprimir erro. A nova execução é integral no novo head e exigirá investigar qualquer recorrência; não reexecutar somente o job.

###203 — estado de autorização selado, ainda desligado (21/10/2026)

- BasePR746 incorporadaàs03:59:46Fortaleza/06:59:46Z, merge40436f92f80e89b9189ead31978a9c34ec92cd12 após22checks noheadfcb3ff1, árvoreb1d063ff9f55df6be095a9212e9b5f5672e7dbc9 igual à testada/incorporada. Política e transporteGraphpreparados; nenhumproviderofertado/callback/conta/operaçãoMicrosoftativados. Não é entrega funcional;contador130inalterado.
- Próximaetapa: helperpurodeestadoaleatório/nonce/PKCES256, envelopeAES256GCMdoexistingsecretbox vinculadoàloja/sessão/ator/estado,TTL600s, recusadealteração/troca/expiração. Testes sintéticos; não simulamprova deOIDC/GETDEL/rechecagemdepermissão ainda ausentes. Tudo isso permanece obrigatório antes de callback/conexão/reservas.203em andamento;custosdesconhecidosreprovam,TEAMS_APPROVED=false e todos os gates preservados. PedidosWH/KJ/CIcontinuampreservados emPR747–749, não descartados por esta branchbaseada emmain.

### Desempenho móvel — remover trabalho do menu fechado (21/10/2026)

-750head30b10fd6reprovouMobilejob119086310213: amostra1da home224ms, limite200ms;9amostras preservadas, sem descarte/outlier/relaxamento. LCPmáx944ms,CLS0nessarodada. Alvo:summarynativodalistadepreços,scroll22890, não o menu móvel. Longframe205,3ms incluiReactpointerdown92,1ms ewindowonclick25,3ms; não é certificaçãoINPde campo.
- SiteNav mantinha listenerglobaldeclickeagendavasetOpenMenu(null) mesmo com painel já fechado. O listener agora existe apenas enquanto há paineldesktopaberto; clicarfora ainda fecha,Escape/scroll/menu móvel preservados. Isso remove trabalho identificado, mas não declara resolvidotodocustodehidratação; novasuítecompleta/9amostras no novohead devem comprovar. Mesmoslimiares,semocultarcomponentes ou atrasar interação no teste. Sem mudança depreços/limites/gates,PLANS_ON_SALE=false.

###203 — registro de armazenamento do estado pendente (21/10/2026)

-751head088d7e9ereprovouverify119087461499porque a nova família nl:teams:state:não estava notests/store-data-registry.ts. Os testesfuncionaisdeestadoatômico passaram, mas isso não aprova suíte. Corrigido: envelope seladolimitado2048bytes e registroconservador4096bytes porunidadeintegraçãoreservada,TTL600s; precifica-se o pioruso100%/retenção pelo registroexistente. Nenhumaexceçãonoteste, custoignorado ou tetoalterado. Conexãoprodutiva segueinativa atéorçamento/autorização/OIDC/revisãotributáriacompletos;desconhecidoreprova.
- Mesmoh eadWebKit119087461495tambémreprovou emstore-copy.mjs:417aguardandoWhat do you want to do?; evidênciapreservada, semsuprimir/relaxar. Novoheadintegra correçãoSiteNavde750 e exigeverificaçãocompleta;não repetirapenasjob. Ainda nãoé203completo/novaentrega.

### Entrega130 — primeira loja comprovada e retorno às compras (21/10/2026)

- PR744 incorporado21/10/2026às03:23:43Fortaleza (06:23:43Z), mergef46bb5f974f5ed6252c5f138bb06bfd6966934e9.22checks aprovados nohead08b948a34b0d2b3d8961b2bc1079e871b5cacfde; árvore05425522dd8791484d5008aaa4d33b991fb1b7d2 igual à prevista e incorporada.
- READY06:24:36.395Z, domínio marktmorgen.com confirmado na versão exataf46bb5f; deploymentdpl_AWTgxAeFXAEsWA1atuvnmXDrNrKA. Sete GETs/,/library,/signin,/signin/confirm,/pricing,/privacy,/refunds:200com mesmo deployment. Runtimeerror/fatal0somente na janela06:20:28.459–06:25:28.459Z.
- Mudança funcional: link de retorno da página de compras só busca a loja quando acionado, evitando RSC especulativo desnecessário; destino, idioma, acesso e compras preservados. Matriz de cadastro/claimreal/Studio/linkreal/removersessão/reloadpúblicoanônimo:75casos/375auditorias,0falhas nos3engines. Cada cenário usa base falsa isolada; teto real10lojas sem plano intacto. Histórico de reprovações preservado acima; não houve relaxamento de assert/regra nem repetição isolada para aprovação.
-201: lacuna autônoma de primeira loja fechada. Restam aparelhos/AT/zoomreal400% e revisão manual, aguardando o dono conforme evidência anterior; testes sintéticos não são certificaçãoAAA.202: plano de pesquisa incorporado emdocs/accessibility-real-people-plan.md; não houve recrutamento, estudo com pessoas, contato ou gasto. Seguir203acionável, sem ativação.
- Contador130confirmado; próximo131. Custos fixos de CI: evidência localwork/marktmorgen-ci-cost-744-20261021-0604.json com30execuções concluídas/88jobs/19522segundos, subconjunto separado sem soma aos totais anteriores; exclui posteriores/emcurso/fatura. Fatura desconhecida não é zero. Nenhum novo provedor/custo variável produtivo; preços/limites/permissões/gates preservados,PLANS_ON_SALE=false. Leitura fiscal mais onerosa e meta60% continuam vinculantes, sem margem certificada.

### Verificação das filas745/747 — falhas preservadas e diagnóstico (21/10/2026)

-745head7136c25: Firefoxfullsuite job119069477911 reprovou emtests/e2e/package-acknowledgment.mjs:38: espera30s pela requisição após save/missing/1280.747head826594b: ProductFirefox job119074226785 abortou no primeirocreate com assertion internaPlaywright FrameManager.frameAttached/FFPage._onFrameAttached. São reprovações; nenhum desses heads será incorporado como aprovado. Entrega130 permanece nohead anteriormente validado por22checks.
- Acrescentado diagnóstico limitado do editor sintético de pacote no ponto de falha: caminho,contador de requisições,estadoopen/busy,botões/campos e aviso. Erro original relançado,release sempre executado,mesmoscenários/timeouts/asserts/recusas; sem ignorar erro ou reexecutar sójob. Nova execução completa no novohead. Diagnóstico não é correção conclusiva nem entrega funcional.

## 203 — Teams automático para chamadas pagas (execução futura)

203. [TEAMS] Links automáticos do Microsoft Teams para as chamadas pagas, construídos agora e DESLIGADOS

Pedido: dono, 20/10/2026, 23h03 de Fortaleza.

Objetivo: oferecer ao criador, ao lado do Google Meet e do Zoom, a criação automática de uma reunião do Microsoft Teams para cada chamada vendida. O recurso é útil sobretudo para coaches, consultores e mentores cujos clientes são empresas que só usam o Teams.

Fatos já verificados (confira cada um deles nas fontes oficiais da Microsoft antes de construir e registre as fontes com a data da consulta):
1. A criação automática de reuniões do Teams pela API só funciona com contas pagas do Microsoft 365 de empresa ou de escola. Contas pessoais gratuitas (outlook.com, hotmail.com e live.com) não conseguem criá-las.
2. Para que usuários de outras empresas possam autorizar o aplicativo, a Microsoft exige a "publisher verification". Ela depende de uma conta verificada no Microsoft AI Cloud Partner Program, e essa verificação exige uma empresa legalmente registrada. Portanto, ela só será possível depois que a LLC de Delaware existir.
3. A Microsoft não cobra pela verificação do editor, e a conta de parceiro é gratuita.

Escopo:
1. Reutilize o mecanismo que já existe para o Google Meet e para o Zoom (lib/meet-providers.ts, lib/meet-connect.ts, lib/meet-links.ts, lib/call-meetings.ts, lib/host-calendar.ts e os demais módulos relacionados), sem duplicar a lógica, e acrescente o provedor "teams".
2. Use o Microsoft identity platform (OAuth 2.0, aplicativo multilocatário e endpoint "organizations", que aceita apenas contas de empresa ou de escola) e o Microsoft Graph. Para cada agendamento, crie um evento no calendário principal do criador, com o comprador como convidado e com reunião do Teams (isOnlineMeeting = true e onlineMeetingProvider = "teamsForBusiness"). Mova o evento quando o comprador remarcar a chamada e apague-o após o reembolso total. Altere apenas os eventos que o próprio Marktmorgen criou.
3. Peça o menor conjunto de permissões que funcione (por exemplo, openid, email, offline_access e Calendars.ReadWrite). Confirme na documentação oficial se essas permissões bastam e não peça a permissão OnlineMeetings.ReadWrite, a menos que ela seja necessária. Se fizer sentido, use a mesma conexão para ler os horários ocupados do calendário do Outlook do criador, com as mesmas regras de escolha de calendário que valem para o Google.
4. No momento da conexão, ofereça um botão de teste semelhante ao que já existe para o Zoom. Se a conta for pessoal ou não tiver licença do Teams, recuse a conexão com uma mensagem clara, em inglês americano, e indique o Google Meet como alternativa. Nunca falhe em silêncio no momento de um agendamento: se não houver link do Teams, aplique o mesmo comportamento seguro que já existe para os outros provedores.
5. Guarde os tokens com a mesma proteção aplicada aos tokens do Google. Ao desconectar, apague os tokens. Uma revogação feita na Microsoft deve ser detectada e tratada.
6. Crie no código o interruptor TEAMS_APPROVED = false, no mesmo padrão de ZOOM_APPROVED em lib/meet-providers.ts. Enquanto ele for false, nenhuma página poderá oferecer o Teams ao criador, nenhuma página pública poderá apresentá-lo como disponível e nenhuma chamada poderá ser feita à Microsoft. Os testes devem falhar se qualquer uma dessas coisas acontecer.
7. Prepare, sem publicá-lo enquanto o interruptor estiver desligado, o texto da política de privacidade e dos termos de uso que menciona a Microsoft como fornecedora. Esse texto deve entrar em vigor quando o interruptor for ligado.
8. Crie o arquivo docs/microsoft-teams.md com o desenho da solução, as fontes oficiais e os passos que só o dono poderá executar depois de abrir a LLC: criar o locatário do Microsoft Entra; registrar o aplicativo multilocatário, com o domínio de editor marktmorgen.com e o endereço de retorno; criar e verificar a conta no Partner Center em nome da LLC; concluir a publisher verification; e, por último, ligar o interruptor. Indique também os nomes das variáveis de ambiente que ele deverá cadastrar na Vercel.
9. Verifique, com fontes oficiais datadas, quais concorrentes oferecem o Teams nas chamadas agendadas (Calendly, Kajabi, Stan, Hotmart, Teachable e os demais da lista dos 30 concorrentes) e registre essa comparação. Não afirme superioridade sem fonte.
10. Aplique as mesmas exigências de acessibilidade (WCAG 2.2 AAA como ponto de partida) e de inglês americano que valem para as demais telas do studio.
11. Faça os testes somente com o Graph simulado: nenhuma chamada real à Microsoft, nenhum e-mail real e nenhuma alteração em registros reais de clientes.

É proibido, neste item: registrar aplicativo no Microsoft Entra, criar conta no Partner Center ou na Microsoft, aceitar termos, pedir verificação ou ligar o interruptor. Tudo isso depende do dono e da existência da LLC.

Custo e margem: confirme na documentação oficial que as chamadas do Graph utilizadas não são cobradas (consulte a lista de APIs medidas da Microsoft) e registre a fonte. Some ao registro de custos por plano o custo dos comandos do Upstash e qualquer outro custo por agendamento. Custo desconhecido não pode ser considerado zero. A margem líquida mínima é de 60% (ela pode ser maior, mas nunca menor) por cliente isolado, com 100% dos direitos usados no pior mês, e também no consolidado, depois de todos os custos e de todos os impostos, inclusive os brasileiros. Não altere preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a nem a revisão comercial.

Estado inicial: na fila. Ao concluir o item, registre o commit, o resultado da suíte completa e a publicação, e altere o estado para "pronto e desligado, aguardando a LLC e a verificação da Microsoft".

**Estado: na fila.** Ordem: depois do item202 [P0-REAL-PEOPLE] e de todos os itens já em andamento; não bloqueia nenhum outro item. Esta entrada foi acrescentada ao fim do arquivo, preservando a ordem e o histórico. Proveniência integral: pedido direto do dono,20/10/2026,23h03Fortaleza, anexo3b412ee8-c4d7-4231-919b-2c9b2d11e8aa/Texto colado.txt. Fatos listados no pedido são requisitos a conferir nas fontes oficiais durante a execução, não conclusões já verificadas por este registro. Não iniciar cadastro, chamada real, aceite, verificação, custo ou ativação por causa desta inclusão. Resultado futuro exigido: commit, suíte completa, publicação e estado “pronto e desligado, aguardando a LLC e a verificação da Microsoft”. Posição vigente: OR: andamento prioritário preservado, antes de 273 [BK1] e 275 [FX1]; conferir o histórico de publicações e executar somente o remanescente acionável.
   - Histórico OR — estado anterior à atualização documental: **Estado: na fila.** Ordem: depois do item202 [P0-REAL-PEOPLE] e de todos os itens já em andamento; não bloqueia nenhum outro item. Esta entrada foi acrescentada ao fim do arquivo, preservando a ordem e o histórico. Proveniência integral: pedido direto do dono,20/10/2026,23h03Fortaleza, anexo3b412ee8-c4d7-4231-919b-2c9b2d11e8aa/Texto colado.txt. Fatos listados no pedido são requisitos a conferir nas fontes oficiais durante a execução, não conclusões já verificadas por este registro. Não iniciar cadastro, chamada real, aceite, verificação, custo ou ativação por causa desta inclusão. Resultado futuro exigido: commit, suíte completa, publicação e estado “pronto e desligado, aguardando a LLC e a verificação da Microsoft”.


## SH — Superar a Shopify no mercado dos criadores (20/10/2026)

Pedido: dono, 20/10/2026, 23h49 de Fortaleza: "quero superar a Shopify no mercado dos criadores e onde mais você achar bom que possa aumentar o meu lucro com segurança".

Contexto já levantado (confira cada fato nas fontes oficiais antes de construir e registre as fontes com a data da consulta):
- Planos da Shopify em 2026: Starter US$ 5, Basic US$ 39, Grow US$ 105 e Advanced US$ 399 por mês, além de 2,5% a 2,9% + 30¢ por venda com cartão online.
- No Shopify Editions Summer '26 (junho de 2026), a Shopify ligou por padrão a venda por agentes de IA: o Universal Commerce Protocol, criado com o Google, leva os produtos ao ChatGPT, ao Copilot, ao Google AI Mode, ao Gemini e ao app Shop, onde o agente encontra o produto e conclui a compra.
- O Marktmorgen já tem, sem aplicativo de terceiros, cursos, assinaturas, comunidade, chamadas pagas, afiliados, e-mail, funis, oferta extra no checkout, recuperação de checkout, assistente de IA, servidor MCP (que hoje só lê os números da loja para o criador), API pública com webhooks, blog, teste A/B de títulos, vários idiomas, equipe com permissões e 0% de comissão.
- O produto enviado pelo correio tem hoje um preço só, sem opções, frete por região e envio marcado à mão; a página do recurso diz "No print-on-demand". A loja cobra numa moeda só.

Regras que valem para TODOS os itens desta seção:
1. Antes de construir, verifique no código o que já existe e reutilize os mecanismos compatíveis, sem refazer nem duplicar.
2. Margem líquida mínima de 60% (ela pode ser maior, mas nunca menor) por cliente isolado, com 100% dos direitos usados no pior mês, e também no consolidado, depois de todos os custos e de todos os impostos, inclusive os brasileiros. Custo desconhecido não pode ser considerado zero. Nenhum custo de fornecedor pode recair sobre a plataforma sem teto automático; o custo que for do criador (etiqueta de frete, impressão sob demanda, taxa de conversão de moeda, entre outros) deve ser cobrado diretamente na conta do próprio criador, nunca na do Marktmorgen.
3. Impostos: aplique a leitura que der MAIS imposto (docs/tax-uncertainty.md). Qualquer item que envolva venda de bens físicos deve passar pela análise de plataforma intermediária e de fornecedor presumido para bens (lei americana de marketplace facilitator, art. 14a da Diretiva do IVA da União Europeia e regras do Reino Unido), registrada em docs/eu-vat-article-9a.md e em lib/deemed-supplier.ts. Enquanto essa análise não estiver completa, o recurso fica desligado.
4. Cada recurso novo nasce com um interruptor no código, desligado, no mesmo padrão de ZOOM_APPROVED. Enquanto ele estiver desligado, nenhuma página poderá oferecer o recurso nem apresentá-lo como disponível, e os testes devem falhar se isso acontecer.
5. É proibido: criar contas em fornecedores, aceitar termos, contratar serviço, pedir aprovação a terceiros, ligar interruptores, alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a ou a revisão comercial. Tudo isso depende do dono.
6. Faça os testes somente com fornecedores simulados: nenhuma chamada real, nenhum e-mail real e nenhuma alteração em registros reais de clientes.
7. Todo texto público em inglês americano, com as exigências de acessibilidade em vigor (WCAG 2.2 AAA como ponto de partida). Não invente depoimentos, números, escassez nem urgência, e não afirme superioridade sobre a Shopify ou sobre qualquer concorrente sem fonte oficial datada.
8. Ao concluir cada item, registre o commit, o resultado da suíte completa e a publicação, e deixe o estado como "pronto e desligado, aguardando o dono" quando houver interruptor.

204. [SH1] Venda por agentes de IA (ChatGPT, Google AI Mode, Gemini e outros)

Estado: OR: andamento prioritário preservado, antes de 273 [BK1] e 275 [FX1]; conferir o histórico de publicações e executar somente o remanescente acionável. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Estude, nas fontes oficiais, os protocolos de compra por agentes que estejam em vigor (o Universal Commerce Protocol, o protocolo de comércio da OpenAI, o que a Stripe oferece para pagamentos iniciados por agentes e o que o Google exige). Em seguida, construa para cada loja um catálogo legível por máquina, apenas com dados publicados pelo criador (nome, descrição, preço, moeda, disponibilidade, termos e política de reembolso), e, se os protocolos permitirem, a conclusão da compra pelo agente com pagamento direto na conta Stripe do criador, como já acontece no checkout. O criador decide se a loja participa; o padrão é desligado. Nada de dado pessoal no catálogo. Registre em docs/agentic-commerce.md o desenho, as fontes, os custos e os passos que só o dono pode executar.

205. [SH2] Produtos de marca do criador com tamanhos e cores

Estado: OR: andamento prioritário preservado, antes de 273 [BK1] e 275 [FX1]; conferir o histórico de publicações e executar somente o remanescente acionável. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Permita opções (por exemplo, tamanho e cor) nos produtos enviados pelo correio, com preço, estoque e código próprios para cada combinação, estoque baixado de forma atômica na compra e nunca vendido abaixo de zero. Acrescente o código de rastreio informado pelo criador, o aviso de envio ao comprador e um fluxo de devolução simples, com prazo e condições definidos pelo criador e coerentes com a política de reembolso. Não altere as regras atuais de frete por região sem necessidade. Verifique o efeito nos custos por plano (armazenamento, comandos e e-mails) e mantenha os limites visíveis.

206. [SH3] Impressão sob demanda (Printful, Printify ou equivalentes)

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Estude as APIs oficiais e os termos de uso dos principais fornecedores de impressão sob demanda. Construa a ligação com a conta do PRÓPRIO criador (OAuth ou chave do criador, guardada com a mesma proteção dos demais tokens), o envio automático do pedido pago ao fornecedor, a atualização do rastreio e o tratamento de falhas sem perder pedidos. O fornecedor cobra o criador diretamente; o Marktmorgen nunca paga nem adianta valores. Depende do item 205 e da regra 3 (impostos sobre bens físicos). Corrija o texto "No print-on-demand" somente quando o interruptor for ligado.

207. [SH4] Catálogo nos canais de venda

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Gere, para cada loja que o criador escolher, os feeds de produtos aceitos pelo Google Merchant Center, pelo catálogo da Meta (Instagram e Facebook), pelo Pinterest e, se os termos permitirem, pelo TikTok Shop e pelo YouTube Shopping, com endereço próprio que o criador cola em cada canal. Somente dados publicados; preço e disponibilidade sempre iguais aos da loja. Calcule o custo de leitura desses endereços pelos canais (requisições e comandos) e coloque teto automático.

208. [SH5] Preço na moeda do comprador

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Estude, nas fontes oficiais da Stripe, a conversão automática de preço no checkout (por exemplo, o Adaptive Pricing) com cobranças diretas em contas Standard conectadas: quem paga a taxa de conversão, em que países funciona e como os reembolsos ficam. Construa somente se a taxa recair sobre o comprador ou sobre o criador, nunca sobre a plataforma, e se o criador puder ligar e desligar. Se a resposta depender da Stripe, acrescente a pergunta à cobrança diária que o dono já faz à Stripe, sem enviar nada por conta própria.

209. [SH6] Cartão-presente e crédito na loja (primeiro o estudo, depois a decisão)

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Estude a legislação aplicável (Credit CARD Act e leis estaduais americanas de saldo não reclamado, regras da União Europeia, do Reino Unido e do Canadá) e registre em docs/gift-cards-study.md o que seria exigido, os riscos e os custos. Não construa nada neste item: a construção depende da decisão do dono, a partir desse estudo.

210. [SH7] Importação de lojas da Shopify

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Verifique os importadores que já existem e acrescente a importação a partir dos arquivos de exportação da Shopify (produtos, opções, imagens, coleções e clientes com consentimento comprovado para receber e-mail), com pré-visualização, validação no servidor e respeito aos limites do plano, como já se exige dos outros importadores. Clientes sem consentimento comprovado entram somente como compradores, nunca na lista de e-mails.

211. [SH8] Compra com um toque e conta do comprador

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Verifique se o Link, o Apple Pay e o Google Pay estão disponíveis no checkout com cobrança direta na conta do criador e se a biblioteca do comprador reúne as compras feitas em todas as lojas Marktmorgen. Corrija o que faltar, sem custo novo para a plataforma.

212. [SH9] Assistente que executa tarefas do criador (comparação com o Sidekick da Shopify)

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Compare o que o Sidekick da Shopify faz com o que o assistente e as ferramentas de IA do Marktmorgen já fazem. Proponha, em docs/creator-copilot.md, as tarefas que o criador poderia pedir em linguagem natural, sempre com confirmação antes de qualquer alteração. Construa somente o que couber nos orçamentos de IA que já existem (reserva antes da chamada, teto automático e margem de 60%).

213. [SH10] Página honesta "Marktmorgen vs Shopify para criadores"

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Crie uma página de comparação, em inglês americano, somente com fatos verificáveis e fontes oficiais datadas: o que cada plataforma inclui sem aplicativo pago, preços, taxas por venda e o que cada uma não faz. Publique-a apenas com o que estiver no ar e ligado; recursos desligados não aparecem. Siga as regras de SEO e de design já adotadas no site.

214. [SH11] Proposta de complementos pagos que aumentem o lucro com segurança

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Com base no código de margem que já existe (lib/receiving-costs.ts e tests/margin-alignment-table.ts), calcule quais dos recursos acima poderiam ser vendidos como complementos pagos, no mesmo padrão do Store assistant, com o preço mínimo que mantém 60% em cada unidade, isoladamente, no pior caso. Registre o cálculo em docs/addon-proposals-2026-10-20.md como PROPOSTA: nenhum preço, limite ou interruptor muda sem a decisão do dono.

Estado inicial de todos os itens: na fila.

**Ordem vinculante:** depois do item203 [TEAMS] e de todos os itens já em andamento; não bloqueia nenhum outro. Todos permanecem **na fila**. Inclusão exclusivamente de planejamento futuro, sem implementação, contratação, conta, aceite, mensagem, aprovação ou ativação. O contexto e os fatos do pedido serão conferidos em fontes oficiais datadas antes de construir; esta inclusão não os apresenta como verificados.

**Proveniência:** pedido direto do dono,20/10/2026,23h49Fortaleza; anexo51862cf3-939a-48bf-89cb-c226aa2d05cc/Texto colado.txt. Escopo integral e restrições preservados. Gift cards é somente estudo; complementos são somente proposta; Teams203 anterior permanece integralmente preservado. Recursos novos somente construídos quando chegar sua vez e com gates desligados, custos conhecidos/tetos/reserva e leitura fiscal mais onerosa; nenhuma mudança comercial autorizada por esta inclusão.


## OP — Novas oportunidades de lucro a partir da análise da Shopify (20/10/2026)

Pedido: dono, 20/10/2026, 23h58 de Fortaleza: "tem como pegar mais oportunidade de construção de lucro para mim?", a partir dos pontos fracos da Shopify (produto digital, curso e comunidade dependem de aplicativos pagos; o custo total sobe com aplicativos e taxas; o suporte é genérico; a configuração é complexa para o criador individual).

Valem para estes itens todas as regras da seção SH (itens 204 a 214), sem exceção: verificar e reutilizar o que já existe; margem líquida mínima de 60% (ela pode ser maior, mas nunca menor) por cliente isolado, com 100% dos direitos usados no pior mês, e também no consolidado, depois de todos os custos e de todos os impostos, inclusive os brasileiros; custo desconhecido não pode ser considerado zero; leitura que der MAIS imposto; interruptor no código, desligado; proibição de criar contas, pagar taxas, aceitar termos, pedir aprovações, ligar interruptores e alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a ou a revisão comercial; testes somente com fornecedores simulados; inglês americano, acessibilidade e nenhuma afirmação sem fonte oficial datada.

215. [OP1] Aplicativo do Marktmorgen na Shopify App Store

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Estude, nas fontes oficiais da Shopify (shopify.dev), os requisitos para publicar um aplicativo público: conta de parceiro, possibilidade de registro por pessoa física ou exigência de empresa, taxa única de registro (hoje US$ 19), participação da Shopify na receita (hoje 0% sobre o primeiro US$ 1 milhão de receita bruta acumulada na vida e 15% acima disso, contando a partir de 01/01/2025), obrigatoriedade da Shopify Billing API, revisão do aplicativo, requisitos de privacidade e de dados (incluindo os webhooks obrigatórios de dados pessoais) e quem recolhe os impostos sobre a cobrança. Em seguida, desenhe em docs/shopify-app.md um aplicativo que leve aos lojistas da Shopify os cursos, as assinaturas, a comunidade e as chamadas pagas do Marktmorgen, reutilizando o motor existente. Calcule o preço mínimo de cada plano do aplicativo que mantém 60% no pior caso, já com os 15% da Shopify e com a leitura que der mais imposto, e registre-o como PROPOSTA. Construa somente a parte que não depende de conta nem de aprovação, desligada. Os passos que só o dono pode executar (criar a conta de parceiro, pagar o registro, aceitar os termos e enviar para revisão) devem ficar listados no documento.

216. [OP2] Programa de indicação do próprio Marktmorgen

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Verifique o que já existe (lib/affiliate-setting.ts menciona um diretório de programas de afiliados "if one ever opens"). Construa um programa em que um criador indica outro e recebe crédito na própria mensalidade somente depois que o indicado pagar, com o crédito limitado de modo que cada cliente, isoladamente, mantenha 60% no pior caso. Nada de dinheiro em espécie, pagamento por cadastro sem compra ou recompensa por autoindicação. Proteja contra fraude (mesma pessoa, mesmo cartão, mesmo dispositivo). Desligado até a decisão do dono.

217. [OP3] Aplicativos oficiais no Zapier e no Make

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Estude os requisitos oficiais para publicar um aplicativo público no Zapier e no Make (custos, revisão, termos e exigência de empresa). Construa, sobre a API v1 e os webhooks que já existem, as definições dos gatilhos e das ações (por exemplo, nova venda, novo comprador, novo membro, novo agendamento, criar cupom), com testes simulados. Não publique nada: registre em docs/zapier-make.md os passos que só o dono pode executar.

218. [OP4] Calculadora pública "quanto custa a sua Shopify com aplicativos"

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Crie, em inglês americano, uma calculadora pública que some a mensalidade da Shopify, os aplicativos de curso, comunidade, assinatura, e-mail e agendamento mais usados e as taxas por venda, e compare a soma com o plano do Marktmorgen que entrega o mesmo. Use somente preços de fontes oficiais, com a data da consulta exibida na página e uma rotina que acuse preços com mais de 90 dias sem revisão. Nada de valores inventados ou de afirmação de superioridade sem fonte. Siga as regras de SEO e de design já adotadas no site e mostre apenas recursos que estejam ligados.

219. [OP5] Loja completa montada pela IA a partir do que o criador já tem: muito superior à de todos os concorrentes e extremamente fácil de usar

Pedido: dono, 21/10/2026, 00h12, 00h16 e 00h19 de Fortaleza: "quero coisa super excelente, melhor que todos os concorrentes e que aumente o meu lucro" e "compare com HighLevel, Hotmart, ClickFunnels, Kajabi, Shopify e outros; faça muito mais superior, infinitamente superior e fácil de usar, super fácil".

Onde a loja é montada: no próprio Marktmorgen, no studio do criador, inteiramente como rascunho oculto. Ela só vai ao ar (em marktmorgen.com/@nome ou no domínio próprio do criador) depois que ele aprovar. Nada é alterado no Instagram, no Linktree, na Shopify nem em qualquer outro site.

Concorrentes (levantamento de 21/10/2026; confira cada fato nas fontes oficiais e registre-as com a data da consulta):
- HighLevel (Funnels & Websites AI): começa por perguntas guiadas, por texto livre ou por um link ou imagem usados apenas como referência; gera página de funil ou site com textos, imagens e SEO; permite edição por conversa e continua a geração se o navegador for fechado. Não monta produtos, checkout nem e-mails, e o link não importa conteúdo.
- ClickFunnels AI (beta): começa pela descrição do negócio, em modo rápido ou em modo pesquisa (avatar do cliente e tipo de funil); gera páginas do funil, textos e imagens. O anúncio não menciona produtos nem e-mails.
- Kajabi Cofounder: conversa no painel e, opcionalmente, analisa a presença on-line do criador a partir do e-mail dele; gera rascunhos de cursos, ofertas, páginas e e-mails e um plano de 3 a 6 passos. Não publica, não cria imagens e não monta automações: segundo o próprio Kajabi, o criador constrói, configura e publica tudo.
- Hotmart: o Launchpad (beta desde 10/09/2026) cria aplicativos e páginas a partir de texto. No Hotmart Pages, a página de vendas com IA (artigo da Central de Ajuda lido em 21/10/2026) exige um produto já cadastrado e aprovado; o produtor escolhe um modelo, o produto e a oferta, e a IA gera a estrutura inicial de UMA página de vendas (títulos, textos e seções), revisada em cinco etapas (cores, apresentação do produto, descrição com vídeo opcional, autor e oferta), com edição manual ou nova geração por IA. Garantia, parcelamento e perguntas frequentes são configurados depois, à mão, no editor, e a própria Hotmart avisa que a página "não substitui a revisão manual". Não monta a loja, os produtos, o checkout nem os e-mails.
- Shopify: gera uma vitrine a partir de palavras-chave, que o lojista ajusta à mão no editor; o foco é produto físico.
- Wix (por conversa) e Squarespace Blueprint (5 passos guiados): geram sites completos, não lojas de criador.
- Stan: a IA dela (Stanley) ajuda a criar posts para redes sociais; não foi encontrado construtor de loja.
- Beacons: tem configuração guiada por IA, sem detalhes publicados.
Verifique também Systeme.io, Kartra, Teachable, Thinkific, Podia, Gumroad, Whop e os demais da lista dos 30 concorrentes. Registre a comparação completa em docs/ai-store-builder.md.

O Marktmorgen já tem writeStoreSetup (lib/ai.ts, lib/store-setup.ts e components/store-setup-ai.tsx), que gera, a partir de algumas frases, três opções de apresentação, até três produtos em rascunho e as perguntas frequentes. Reutilize esse mecanismo, os importadores de lib/imports.ts, os modelos de funil e de e-mail e o Marktmorgen Path; não duplique a lógica.

Objetivo: ser, comprovadamente, o único construtor que (1) começa pelo conteúdo real que o criador já tem, (2) entrega o negócio inteiro pronto para vender, e não só páginas ou textos, (3) exige uma única aprovação para publicar e (4) é o mais fácil de usar, com a facilidade medida.

Escopo:
1. Entradas: um único campo, "Paste your link or tell us what you sell", e o botão "Continue with Instagram". Aceite o Instagram somente pelo login oficial do próprio criador, por meio da API oficial da Meta (verifique nas regras da Meta quais contas são aceitas, como a conta profissional, e quais dados podem ser lidos); o endereço público da página do criador no Linktree, na Stan, na Beacons, na Gumroad, na Shopify, no YouTube ou no site próprio; e o texto colado por ele. Antes de ler qualquer site, verifique os termos de uso e o robots.txt; onde a leitura automática não for permitida, aceite somente o texto colado ou o arquivo de exportação oficial do criador. Leia apenas páginas do próprio criador, com a declaração dele de que são dele.
2. Perguntas: no máximo 3, respondidas com botões, e somente quando faltar algo indispensável.
3. Saída: o negócio completo em rascunho, com:
   - o nome e três opções de apresentação;
   - cores e estilo derivados da foto ou do logotipo enviados pelo criador;
   - os produtos que ele já vende, com os preços que ele já pratica (sem preço inventado: na falta dele, o campo fica vazio);
   - o checkout com a sugestão de oferta extra;
   - um brinde gratuito em troca do e-mail, quando fizer sentido;
   - a sequência de e-mails de boas-vindas;
   - as perguntas frequentes e a escolha da política de reembolso;
   - os primeiros passos do Marktmorgen Path até a primeira venda;
   - a loja já traduzida para os idiomas que o criador escolher, entre os que o site já oferece.
4. Montagem: o progresso real aparece passo a passo, sem barra falsa. A montagem continua se o criador fechar o navegador, e ele é avisado quando terminar.
5. Revisão: prévia na largura de celular, ao lado da página antiga do criador. Cada parte tem os botões "Keep", "Change" e "Remove". "Change" aceita edição à mão ou um pedido em linguagem natural (por exemplo, "make it warmer" ou "change the course price"). Ofereça "Undo" em tudo e histórico de versões.
6. Publicação: um único botão, "Publish my store", que mostra o que ainda falta (por exemplo, ligar o Stripe ou enviar o arquivo do produto) e leva direto a cada etapa. Nada é publicado, e nenhum e-mail é enviado, sem a aprovação explícita do criador.
7. Facilidade medida: meça, em testes automatizados com fornecedores simulados, o tempo e o número de cliques desde o envio das fontes até a loja pronta para revisão e até a publicação, e registre os resultados. Inclua estes fluxos no plano de testes com pessoas reais do item 202. Nenhuma página pública pode afirmar que o recurso é mais rápido ou mais fácil que o de um concorrente sem uma comparação medida e registrada; a expressão "in minutes", ou qualquer número de minutos, só pode aparecer se a medição comprovar.
8. Honestidade: nenhum depoimento, número de seguidores, alunos ou compradores, resultado, garantia, prazo, bônus, escassez ou urgência que o criador não tenha publicado. Todo texto da IA passa pelos filtros que já existem (honesty e heldToFacts, ou equivalentes).
9. Lucro: o objetivo é que mais criadores terminem a loja durante o teste grátis e passem a pagar, e que a loja já nasça com lista de e-mails e oferta extra, para que o criador venda mais e cancele menos. Quando o rascunho usar um recurso que só existe num plano acima do atual, a loja deve informar isso com clareza e honestidade, sem pressão.
10. Custo: cada chamada à IA é reservada antes, com teto automático, dentro dos orçamentos de IA que já existem; as leituras de páginas têm limite por loja e por dia. A margem líquida mínima é de 60% (ela pode ser maior, mas nunca menor) por cliente isolado, com 100% dos direitos usados no pior mês, e também no consolidado, depois de todos os custos e de todos os impostos, inclusive os brasileiros. Custo desconhecido não pode ser considerado zero.
11. Privacidade: guarde apenas o que entrar na loja aprovada; o restante do que foi lido é apagado logo após a revisão. A política de privacidade deve dizer isso, e o texto entra em vigor junto com o recurso.
12. Interruptor no código, desligado, no mesmo padrão de ZOOM_APPROVED. É proibido criar contas, registrar aplicativo na Meta, aceitar termos, pedir aprovações ou ligar o interruptor: isso depende do dono.
13. Inglês americano e as mesmas exigências de acessibilidade (WCAG 2.2 AAA como ponto de partida) das demais telas, incluindo uso completo por teclado e por leitor de tela. Testes somente com fornecedores e páginas simulados.

Estado: na fila. Ao concluir, registre o commit, o resultado da suíte completa e a publicação, e altere o estado para "pronto e desligado, aguardando o dono". Posição vigente: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B.
   - Histórico OR — estado anterior à atualização documental: Estado: na fila. Ao concluir, registre o commit, o resultado da suíte completa e a publicação, e altere o estado para "pronto e desligado, aguardando o dono".

Estado inicial de todos os itens: na fila.

**Ordem vinculante:** depois do item214 [SH11] e de todos os trabalhos já em andamento; não bloqueia nenhum outro. Itens215–219: **na fila**. Os itens203–214 e todo o histórico anterior permanecem integralmente preservados. A implementação atual continua prioritária.

**Proveniência:** pedido direto do dono,20/10/2026,23h58Fortaleza; anexo3cf3422c-a75f-41f6-a483-ebb523fa8b91/Texto colado.txt. Inclusão de escopo futuro; preços, taxas, requisitos e comparações descritos no pedido exigem conferência oficial datada quando cada item for executado e não são apresentados aqui como fatos verificados. Nenhuma conta, aceite, pagamento, publicação externa, ativação ou mudança comercial nesta inclusão. OP1 preços somente PROPOSTA; OP3 sem publicar integrações; OP5 exige revisão e confirmação do criador antes de qualquer publicação.


## HL — Lições da auditoria da HighLevel (21/10/2026)

Pedido: dono, 21/10/2026, 00h56 de Fortaleza: gerar coisas boas no Marktmorgen a partir de uma auditoria pública da HighLevel feita pelo Copilot.

Lição principal da auditoria: a HighLevel não cresceu por ter mais recursos, e sim porque transformou produto, educação, comunidade, certificação e afiliados num único sistema de aquisição de clientes. Os recursos de produto citados na auditoria já existem no Marktmorgen ou já estão na fila (oferta extra, oferta depois do pagamento, combos, assinaturas, comunidade, afiliados do criador, recuperação de checkout, pixels e atribuição, biblioteca de modelos, páginas "vs", importação, assistente de IA e montagem da loja por IA); a comparação recurso por recurso já está em docs/highlevel-gap-matrix.md. NÃO duplique nada disso: verifique o que existe e acrescente somente o que falta. Fatos da auditoria a conferir nas fontes oficiais, com a data da consulta: teste grátis de 14 dias; planos de US$ 97, US$ 297 (o mais popular) e US$ 497; programa de afiliados com 40% de comissão recorrente; Academy com cursos, eventos, certificações e comunidade.

Regras que valem para TODOS os itens desta seção (as mesmas da seção SH):
1. Verifique e reutilize o que já existe, sem refazer nem duplicar.
2. Margem líquida mínima de 60% (ela pode ser maior, mas nunca menor) por cliente isolado, com 100% dos direitos usados no pior mês, e também no consolidado, depois de todos os custos e de todos os impostos, inclusive os brasileiros. Toda comissão, crédito ou prêmio pago por um cliente indicado é custo variável desse cliente e entra no cálculo dele. Custo desconhecido não pode ser considerado zero.
3. Leitura que der MAIS imposto (docs/tax-uncertainty.md), inclusive para pagamentos a afiliados e parceiros no exterior.
4. Cada recurso nasce com um interruptor no código, desligado, no mesmo padrão de ZOOM_APPROVED; os testes devem falhar se uma página o oferecer enquanto estiver desligado.
5. É proibido criar contas, aceitar termos, contratar serviço, pagar qualquer valor, publicar fora do site, pedir aprovações, ligar interruptores e alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a ou a revisão comercial. Tudo isso depende do dono.
6. Testes somente com fornecedores simulados: nenhuma chamada real, nenhum e-mail real e nenhum registro real de cliente alterado.
7. Inglês americano e as exigências de acessibilidade em vigor (WCAG 2.2 AAA como ponto de partida). Nada de depoimento, número, resultado, escassez ou urgência inventados, nem promessa de ganho garantido; nenhuma afirmação sobre concorrente sem fonte oficial datada.
8. Ao concluir cada item, registre o commit, o resultado da suíte completa e a publicação, e deixe o estado como "pronto e desligado, aguardando o dono" quando houver interruptor.

220. [HL1] Programa de afiliados do próprio Marktmorgen, com comissão recorrente

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Construa um programa em que qualquer pessoa (cliente ou não) divulga o Marktmorgen e recebe comissão recorrente sobre as mensalidades pagas pelos clientes que indicar. Calcule, com lib/receiving-costs.ts e tests/margin-alignment-table.ts, a maior comissão que ainda mantém 60% em cada plano e intervalo, isoladamente, no pior caso, e registre-a como PROPOSTA em docs/marktmorgen-affiliates.md; nenhuma porcentagem entra em vigor sem a decisão do dono. A comissão só é devida depois que o cliente pagar e que o prazo de reembolso de 30 dias terminar, e é estornada em caso de reembolso ou de contestação. Proteja contra fraude e autoindicação (mesma pessoa, cartão, dispositivo ou endereço). Estude, nas fontes oficiais, como pagar afiliados no exterior (PayPal, Stripe ou outro), os formulários fiscais exigidos (por exemplo, W-8BEN e W-9) e os custos de cada pagamento. Coordene com o item 216 [OP2] (crédito para clientes que indicam), sem duplicar a lógica, e reutilize os mecanismos de afiliados dos criadores que já existem.

221. [HL2] Marktmorgen Academy, como canal de aquisição

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Crie uma academia gratuita para criadores, hospedada numa loja do próprio Marktmorgen, usando os recursos de curso e de comunidade da plataforma (para que ela também sirva de demonstração ao vivo). Prepare a estrutura e o roteiro dos primeiros cursos (por exemplo, "how to sell your first digital product", "pricing your course", "building an email list"), escritos com base em fatos verificáveis e no que a plataforma realmente faz, sem promessa de ganho. A inscrição pede consentimento explícito para receber e-mails. Cada aula tem página própria, otimizada para busca. Calcule o custo de vídeo, armazenamento e e-mails da academia e coloque teto automático; esse custo entra nos custos fixos da empresa.

222. [HL3] Certificação "Marktmorgen Certified"

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Verifique o que lib/path-certificate.ts já faz. Ofereça um certificado gratuito, com página pública verificável e link permanente, a quem concluir a academia e passar numa avaliação, e um selo opcional para o perfil do criador. O certificado atesta somente o conhecimento avaliado, nunca resultados de vendas. Sem custo novo para a plataforma.

223. [HL4] Programa de parceiros e especialistas ("Marktmorgen Experts")

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Permita que freelancers e agências que montam lojas para criadores administrem várias lojas, sempre com a autorização de cada criador, usando os papéis e permissões de equipe que já existem. Crie um diretório público de especialistas verificados, em que só aparece quem concluir a certificação do item 222, com informações fornecidas pelo próprio especialista e sem avaliações inventadas. Os especialistas podem participar do programa de afiliados do item 220. Não inclua revenda com marca própria (white label), que está fora do plano.

224. [HL5] Mensagem de resultado e narrativa de substituição de ferramentas

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Revise os títulos e subtítulos da página inicial, da página de preços e das páginas de recursos para que falem do resultado que o criador busca (por exemplo, vender o primeiro produto ou não perder compradores fora do horário), e não só da lista de recursos, sempre sem promessa de resultado garantido e somente com recursos que existem e estão ligados. Mostre, com fatos verificáveis, quais ferramentas separadas o Marktmorgen substitui (loja, cursos, comunidade, agendamento, e-mail, afiliados e funis), com um único login. Mantenha uma chamada para ação dominante por página e destaque, na página de preços, o plano mais indicado, sem alterar preços nem limites. Coordene com os itens HT16 e HT17, sem duplicar o que eles já fizeram, e meça o desempenho antes e depois.

225. [HL6] Calculadora de custo da pilha de ferramentas

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Amplie a calculadora do item 218 [OP4] (que compara apenas com a Shopify) para uma única ferramenta pública que some o que o criador paga hoje em ferramentas separadas (por exemplo, Kajabi, Teachable, Skool, Circle, Linktree, Stan, Calendly, Kit, Mailchimp, ClickFunnels, HighLevel e Shopify com aplicativos) e compare a soma com o plano do Marktmorgen que entrega o mesmo. Use somente preços de fontes oficiais, com a data da consulta exibida e uma rotina que acuse preços com mais de 90 dias sem revisão. Não crie calculadora de "quanto você vai ganhar": nada de projeção de receita.

226. [HL7] Painéis de valor do comprador ao longo do tempo (LTV) e de coortes para o criador

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Verifique o que os relatórios e lib/stats já mostram. Acrescente, a partir dos dados que a loja já guarda, o valor médio gerado por comprador ao longo do tempo e a retenção por coorte de mês de compra (especialmente para assinaturas e comunidades), com explicação simples de cada número. Calcule o custo de leitura e de armazenamento e mantenha os limites do plano.

227. [HL8] Automação recomendada a partir de um objetivo

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Na matriz docs/highlevel-gap-matrix.md, o item H22 (Workflow AI) está como lacuna. Permita que o criador descreva um objetivo em linguagem natural (por exemplo, "lembrar quem não terminou a compra" ou "dar boas-vindas a novos membros") e receba uma proposta de automação montada somente com os blocos que já existem, explicada passo a passo. Nada é ligado sem a confirmação dele. A chamada à IA é reservada antes, com teto automático, dentro dos orçamentos de IA que já existem.

228. [HL9] Agendador de posts nas redes sociais (primeiro o estudo)

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Na mesma matriz, o item H14 (planejador de redes sociais) está como lacuna. Estude, nas fontes oficiais, as APIs, as revisões de aplicativo, os termos e os custos do Instagram, do Facebook, do TikTok, do YouTube, do Pinterest, do LinkedIn e do X para agendar e publicar posts com a conta do próprio criador, e registre em docs/social-scheduler-study.md o que seria possível, o que exige aprovação e quanto custaria. Construa somente o que couber na margem, sem depender de aprovação, e desligado; o restante depende da decisão do dono.

229. [HL10] Biblioteca de casos reais e pedidos de avaliação

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Verifique o que já existe sobre casos e vitrines. Prepare uma biblioteca pública de casos que só aceite lojas reais, com autorização escrita do criador e com números conferidos nos dados da própria loja; enquanto não houver casos reais, a página não é publicada. Prepare também, desligado, o convite para que clientes reais avaliem o Marktmorgen no G2, no Capterra ou no Trustpilot, sem recompensa condicionada a avaliação positiva e respeitando as regras de cada site.

230. [HL11] Páginas por nicho de criador, com conteúdo útil e único

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Verifique as páginas que já existem em app/for. Amplie-as para os nichos mais valiosos (por exemplo, coaches, professores de ioga, fotógrafos, músicos e consultores), cada uma com conteúdo realmente útil e diferente (exemplos de produtos, preços praticados no nicho com fonte, passos de montagem e perguntas frequentes), e não páginas repetidas com o nome do nicho trocado, para cumprir as políticas do Google contra conteúdo produzido em escala sem valor. Siga as regras de SEO e de design já adotadas no site.

Estado inicial de todos os itens: na fila.

**Ordem vinculante e estado:** itens220–230 **na fila**, depois do219[OP5] e de todos os trabalhos já em andamento; não bloqueiam nenhum outro. Nenhuma implementação ou ativação nesta inclusão. Reutilizar o que existe e coordenarHL1/OP2,HL5/HT16–HT17 eHL6/OP4, sem duplicação.

**Proveniência:** pedido direto do dono,21/10/2026,00h56Fortaleza; anexo289c4b29-4eea-4510-a5fa-bf8cc5fe0293/Texto colado.txt, com auditoria pública atribuída pelo dono aoCopilot. Valores, fatos, interpretações e lacunas do levantamento são escopo a conferir em fontes oficiais datadas durante a execução, não afirmações verificadas por esta inclusão. Todos os itens203–219 e o texto integral mais recente deOP5 permanecem preservados. Nenhuma conta, contato, aceite, pagamento, aprovação, publicação externa, operação real, mudança de preço/limite/comissão/gate ou contratação autorizada. Margem mínima60% por cliente isolado100%direitos/pior-mês e consolidado após todosos custos/impostosBrasil/EUA; comissões/créditos/prêmios são custos variáveis do cliente indicado; desconhecido reprova, leitura fiscal mais onerosa vinculante. Novos recursos desligados até decisão do dono, com testes que impeçam oferta pública enquanto desligados.


## EQ — Venda de cursos dos criadores para equipes de empresas (21/10/2026)

### 231. [EQ1] Venda de cursos para equipes de empresas, 100% autoatendida

**Estado:** na fila. **Ordem:** depois do item230 [HL11] e de todos os trabalhos em andamento; não bloqueia nenhum outro item. Implementação futura, sem iniciar este recurso nesta inclusão. Posição vigente: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B.
   - Histórico OR — estado anterior à atualização documental: **Estado:** na fila. **Ordem:** depois do item230 [HL11] e de todos os trabalhos em andamento; não bloqueia nenhum outro item. Implementação futura, sem iniciar este recurso nesta inclusão.

Pedido: dono, 21/10/2026, 01h24 de Fortaleza. Da análise da Coursera (segmento de empresas: US$ 140,0 milhões de receita no 2º trimestre de 2026, segundo o Form 8-K da Coursera na SEC), aproveitar apenas a venda de cursos para equipes de empresas, sem copiar a assinatura de catálogo (Coursera Plus), que exigiria que o Marktmorgen recebesse o dinheiro dos alunos e o repartisse entre os criadores, contra a decisão do dono de 29/09/2026 de nunca movimentar dinheiro de terceiros.

231. [EQ1] Venda de cursos para equipes de empresas, 100% autoatendida

O que já existe e deve ser reutilizado, sem duplicar: a compra para várias pessoas, de 2 a 200 vagas (lib/group-buy.ts e lib/group-rules.ts); o campo de número de IVA e as faturas para compradores empresariais (lib/tax.ts e a página de checkout); os presentes (lib/gifts.ts); os cursos com provas e certificados; as assinaturas; e os papéis de equipe. Verifique o que cada um faz antes de construir.

Escopo:
1. Preço por quantidade: o criador pode definir faixas de desconto por número de vagas (por exemplo, 5% a partir de 10 vagas e 15% a partir de 50), exibidas com clareza na página do produto antes do pagamento.
2. Assinatura por vaga: além da compra única, o criador pode vender acesso anual ou mensal por vaga, cobrado na conta Stripe dele com a quantidade de vagas da assinatura. O comprador aumenta ou diminui o número de vagas sozinho, vendo antes o valor exato calculado pela Stripe.
3. Painel do responsável pela equipe: quem comprou vê as vagas usadas e as livres, convida pessoas por e-mail, transfere uma vaga ainda não usada, compra mais vagas pelo mesmo preço e acompanha o progresso de cada pessoa (aulas concluídas, provas e certificados), com exportação em planilha. Uma vaga já usada só pode ser transferida se o criador permitir.
4. Entrada pelo domínio da empresa: o responsável pode permitir que qualquer pessoa com e-mail confirmado do domínio da empresa (por exemplo, @empresa.com) ocupe uma vaga livre, até o limite comprado.
5. Pagamento por fatura: o criador pode permitir que a empresa pague por fatura emitida na conta Stripe dele (Stripe Invoicing, com prazo definido pelo criador). O acesso só é liberado quando a fatura for paga, salvo se o criador escolher liberar antes, e o risco de falta de pagamento é do criador, nunca do Marktmorgen. Gere automaticamente um orçamento em PDF para a empresa aprovar internamente, sem ligação nem reunião.
6. Página "For teams": uma seção opcional na loja do criador, em inglês americano, explicando como a equipe compra e usa o curso, sem números de clientes, logotipos ou depoimentos que o criador não tenha comprovado.
7. Privacidade: cada pessoa da equipe é informada, antes de começar, de que o responsável vê o progresso dela. A política de privacidade e os termos devem dizer isso, e os textos entram em vigor junto com o recurso.
8. Estudo, sem construir: verifique se vale exportar os cursos em SCORM ou xAPI para o sistema de treinamento da empresa (LMS), e registre o resultado em docs/team-sales.md com custos e riscos de cópia do conteúdo.

Custo e margem: cada vaga ocupada conta como pedido da loja, e cada convite conta como e-mail da loja, dentro dos limites do plano que já existem. Calcule o custo de leitura do painel, de armazenamento e dos PDFs, e coloque teto automático. A margem líquida mínima é de 60% (ela pode ser maior, mas nunca menor) por cliente isolado, com 100% dos direitos usados no pior mês, e também no consolidado, depois de todos os custos e de todos os impostos, inclusive os brasileiros; use a leitura que der MAIS imposto, inclusive para vendas a empresas no exterior. Custo desconhecido não pode ser considerado zero.

Regras: interruptor no código, desligado, no mesmo padrão de ZOOM_APPROVED; os testes devem falhar se alguma página oferecer o recurso enquanto ele estiver desligado. É proibido criar contas, aceitar termos, contratar serviço, ligar o interruptor e alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a ou a revisão comercial. Testes somente com a Stripe simulada: nenhuma cobrança real, nenhum e-mail real e nenhum registro real de cliente alterado. Inglês americano e as exigências de acessibilidade em vigor (WCAG 2.2 AAA como ponto de partida).

Estado: na fila. Ao concluir, registre o commit, o resultado da suíte completa e a publicação, e altere o estado para "pronto e desligado, aguardando o dono".

**Proveniência:** instrução direta do dono,21/10/2026,01h24 Fortaleza; anexo fd80d5da-05d5-4aa5-a0e5-3d91f657de74/Texto colado.txt. Escopo preservado integralmente acima. A receita da Coursera/SEC é contexto atribuído ao pedido e exige verificação oficial datada durante a execução; não é fato conferido nesta inclusão. Preservados integralmente os itens203–230 e a revisão mais recente do OP5. Sem nova despesa operacional; custos futuros exigem cálculo e tetos antes da operação. Commit, suíte completa e publicação serão registrados quando executado; esta inclusão documental não é entrega funcional.


## CA — Nenhum calote dos criadores (21/10/2026)

### 232. [CA1] Fechamento de toda possibilidade de calote dos criadores ao Marktmorgen

**Estado:** na fila. **Ordem:** depois do item231 [EQ1] e de todos os trabalhos em andamento; não bloqueia nenhum outro. Escopo futuro, sem iniciar a implementação nesta inclusão. Posição vigente: OR: Bloco A, posição 4/8, após 275 [FX1] e antes de 206 [SH3]; antecipado da posição histórica após 231 [EQ1], sem repetir no trecho 206–272.
   - Histórico OR — estado anterior à atualização documental: **Estado:** na fila. **Ordem:** depois do item231 [EQ1] e de todos os trabalhos em andamento; não bloqueia nenhum outro. Escopo futuro, sem iniciar a implementação nesta inclusão.

Pedido: dono, 21/10/2026, 01h26, 01h28 e 01h32 de Fortaleza: "eu vou querer ter modelo em que não tem como levar calote dos criadores" e "veja como faz Stan, Hotmart".

Comparação (confira cada fato nas fontes oficiais e registre-as com a data da consulta): a Hotmart é intermediária, recebe o pagamento do comprador, desconta a própria taxa antes de liberar o saldo ao produtor, estorna do saldo as comissões de vendas contestadas e, acima de 0,9% de contestações por região, retém parte do saldo por até 90 dias e pode pausar vendas (Central de Ajuda Hotmart, cláusula 11.3.1 dos Termos de Uso). A Stan cria e administra as contas Stripe dos criadores, controla o saldo e pode suspender a conta. O Kajabi tenta cobrar o cartão de novo, depois suspende o painel e, por fim, cancela a conta e tira o site do ar. O Marktmorgen é diferente por decisão do dono de 29/09/2026: cada criador recebe na própria conta Stripe, e o Marktmorgen nunca movimenta o dinheiro dele.

Já confirmado em 21/10/2026, na documentação oficial da Stripe e no código: lib/stripe-connect.ts cria cada conta de criador com dashboard "full", fees_collector "stripe" e losses_collector "stripe". Pela documentação da Stripe (docs.stripe.com/connect/disputes, docs.stripe.com/connect/risk-management e docs.stripe.com/connect/account-balances), nas cobranças diretas o valor contestado e o reembolso saem da conta do criador; com fees_collector "stripe", a taxa de contestação é paga pelo criador; e com losses_collector "stripe", é a Stripe, e não a plataforma, que cobre as perdas por saldo negativo do criador. Portanto, o Marktmorgen não responde pelo prejuízo dos criadores com os compradores deles. O único calote possível é o criador não pagar ao próprio Marktmorgen (mensalidade, complementos ou uso extra).

232. [CA1] Fechamento de toda possibilidade de calote dos criadores ao Marktmorgen

Escopo:
1. Proteja a configuração já confirmada: acrescente um teste que falhe se lib/stripe-connect.ts deixar de criar as contas com dashboard "full", fees_collector "stripe" e losses_collector "stripe", ou se qualquer cobrança de venda deixar de ser cobrança direta na conta do criador. Registre a confirmação, com as fontes e a data, em docs/no-creator-default.md.
2. Liste em docs/no-creator-default.md TODA cobrança que o Marktmorgen faz ao criador (planos mensais e anuais, Store assistant, legendas por IA, pacotes de uso e qualquer outra) e, para cada uma, se ela é paga ANTES ou DEPOIS do uso.
3. Nenhum uso pago depois: verifique cada chamada de addToNextInvoice (lib/billing.ts) e qualquer outra cobrança posterior. Todo uso além da franquia passa a ser vendido somente como crédito pré-pago, consumido antes de o custo ocorrer e bloqueado quando o crédito acaba (regra do dono de 18/10/2026: "primeiro o cliente paga, depois recebe"). Se alguma cobrança posterior for indispensável, demonstre que ela tem teto automático inferior ao que já foi pago e registre a justificativa.
4. Teste grátis: confirme que ele exige cartão confirmado na Stripe no início e que o custo máximo dele continua dentro do teto de exposição já revisado (docs/funded-exposure-review.md).
5. Cobrança recusada: no primeiro dia em que uma renovação falhar, todo recurso que gera custo para o Marktmorgen (IA, e-mails além da franquia, vídeo, armazenamento novo, envios) para automaticamente. A loja continua no ar apenas para que os compradores recebam o que já pagaram ao criador, nada é apagado, e o criador vê com clareza o que fazer para regularizar. Defina, com base nos custos, o prazo máximo até a suspensão do painel e o prazo até o fechamento da loja, sempre preservando os direitos de exportação e de exclusão.
6. Contestação do pagamento pelo criador: ao receber da Stripe o aviso de contestação de uma cobrança do Marktmorgen, suspenda na hora os recursos cobertos por ela, aplique a regra que já existe para o Store assistant (nunca mais vender o complemento contestado à mesma loja) e registre o caso. Contestação perdida pelo Marktmorgen entra como custo no pior caso.
7. Reembolso de 30 dias: confirme que o reembolso da garantia nunca devolve mais do que foi pago e que o custo já consumido até o pedido está dentro do teto de exposição.
8. Testes automatizados, somente com a Stripe simulada, que falhem se: algum custo puder ocorrer antes do pagamento correspondente; algum recurso que gera custo continuar ativo depois de uma cobrança recusada ou contestada; ou algum uso for cobrado depois de consumido sem teto demonstrado.

Custo e margem: margem líquida mínima de 60% (ela pode ser maior, mas nunca menor) por cliente isolado, com 100% dos direitos usados no pior mês, e também no consolidado, depois de todos os custos e de todos os impostos, inclusive os brasileiros; use a leitura que der MAIS imposto. Custo desconhecido não pode ser considerado zero.

Regras: é proibido criar contas, aceitar termos, contratar serviço e alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a ou a revisão comercial. Testes somente com fornecedores simulados: nenhuma cobrança real, nenhum e-mail real e nenhum registro real de cliente alterado. Textos ao criador em inglês americano, claros, sem ameaça nem linguagem enganosa, e com as exigências de acessibilidade em vigor. Atualize os termos de uso e a política de reembolso quando o comportamento mudar, e os textos entram em vigor junto com o recurso.

Estado: na fila. Ao concluir, registre o commit, o resultado da suíte completa e a publicação.

**Proveniência:** instrução direta do dono,21/10/2026,01h26/01h28/01h32 Fortaleza; anexo429ce754-8927-43eb-bf5f-99a2b9903fac/Texto colado.txt. Pedido integral preservado acima. Afirmações sobre concorrentes, Stripe e configuração do código são atribuídas ao pedido; conferir fontes oficiais datadas e código vigente durante a execução, sem transformar a intenção de eliminar calote em promessa absoluta ou certificação jurídica/financeira. Preservados203–231 e OP5 vigente. Nenhuma operação real, contratação, ativação ou mudança comercial nesta inclusão. Custos futuros exigem análise e tetos antes de operar; desconhecido reprova. Esta inclusão documental não é entrega funcional.


## SK — Lições da auditoria da Skool (21/10/2026)

**Estado inicial:** todos os itens233–237 na fila. **Ordem:** depois do item232 [CA1] e de todos os trabalhos em andamento; não bloqueiam outros itens. Implementação futura.

Pedido: dono, 21/10/2026, 01h49 de Fortaleza: gerar coisas boas no Marktmorgen a partir de uma auditoria pública da Skool feita pelo Copilot.

Lição principal da auditoria: a Skool não venceu por ter mais recursos, e sim por transformar a comunidade em canal de aquisição: cada comunidade pública vira uma página de vendas indexada pelo Google, os membros descobrem outras comunidades com um único perfil, e a própria Skool mantém uma comunidade de donos de comunidade. Fatos da auditoria a conferir nas fontes oficiais, com a data da consulta: planos Hobby (US$ 9 por mês, 10% por venda) e Pro (US$ 99 por mês, 2,9% por venda); teste grátis de 14 dias; afiliados com 40% da mensalidade; páginas públicas de comunidade com membros, preço, avaliações, dono, atividade e ranking; e, segundo relatos públicos, cursos sem provas robustas nem certificados nativos e sem oferta extra no checkout, oferta depois do pagamento ou funis.

O que já existe no Marktmorgen e NÃO deve ser refeito (verifique antes): comunidade com pontos, os mesmos 9 níveis da Skool (lib/community-levels.ts e lib/community-points.ts), ranking, curso liberado por nível, eventos, chat, mensagens diretas, enquetes, busca protegida por permissão (lib/community-search.ts e lib/community-found.ts), anúncios por e-mail aos membros que pediram (lib/community-mail.ts), notificações, vitrine de criadores só com autorização registrada (lib/creator-showcase.ts), diretório de programas de afiliados (lib/affiliate-directory.ts e lib/directory-index.ts), provas e certificados, oferta extra, oferta depois do pagamento, combos e funis. Também não entram nesta seção: o programa de afiliados do Marktmorgen (item 220 [HL1]), a academia e a comunidade para criadores (item 221 [HL2]), o teste grátis sem cartão (contraria o item 232 [CA1]) e a redução do número de planos (contraria a decisão do dono de 18/10/2026 de não mudar o número de planos).

Regras: valem para estes itens todas as regras da seção SH (itens 204 a 214), sem exceção: verificar e reutilizar o que já existe; margem líquida mínima de 60% (ela pode ser maior, mas nunca menor) por cliente isolado, com 100% dos direitos usados no pior mês, e também no consolidado, depois de todos os custos e de todos os impostos, inclusive os brasileiros; custo desconhecido não pode ser considerado zero; leitura que der MAIS imposto; interruptor no código, desligado; proibição de criar contas, pagar qualquer valor, aceitar termos, pedir aprovações, ligar interruptores e alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a ou a revisão comercial; testes somente com fornecedores simulados; inglês americano, acessibilidade (WCAG 2.2 AAA como ponto de partida) e nenhuma afirmação sem fonte oficial datada. Todo número exibido ao público (membros, atividade, avaliações) tem de ser real, lido dos dados da própria loja, nunca arredondado para cima, estimado ou inventado.

233. [SK1] Página pública de cada comunidade, como página de vendas indexada

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Verifique o que um visitante que não é membro vê hoje em /@nome/community. Crie, com a autorização do criador (desligada por padrão), uma página pública "About" para cada comunidade, com a descrição escrita pelo criador, o preço, o que o membro recebe (cursos, eventos, níveis e o que cada nível libera), o número real de membros, a atividade real dos últimos 30 dias, as avaliações reais de membros e o criador, além do botão de entrada no checkout que já existe. Nenhum conteúdo pago aparece (nem títulos de aulas, como já protege lib/community-found.ts), nenhum membro aparece sem ter escolhido aparecer, e números pequenos são mostrados como são. A página segue as regras de SEO, dados estruturados e design já adotadas. Calcule o custo de leitura por visita e coloque cache e teto automático.

234. [SK2] Descoberta de lojas e comunidades

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Crie uma página pública de descoberta em que o comprador encontra lojas e comunidades Marktmorgen por tema, idioma e preço, somente das lojas cujo criador autorizou a listagem (desligada por padrão), no mesmo padrão de índice mantido por consentimento de lib/directory-index.ts, sem varrer a base a cada visita. A ordem é explicada na própria página e baseada apenas em critérios declarados (por exemplo, avaliações reais e atividade real), sem posição paga e sem manipulação. Defina e aplique regras de conteúdo para a listagem (nada ilegal, nada adulto, nada enganoso), com denúncia pelo visitante e remoção automática da listagem em caso de violação comprovada. Calcule o custo do índice, das leituras e da moderação, e coloque teto automático.

235. [SK3] Perfil único do membro em todas as comunidades Marktmorgen

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Verifique o que a biblioteca do comprador e o perfil de membro já fazem. Permita que uma pessoa use um único perfil (nome, foto e apresentação) em todas as comunidades Marktmorgen de que participa, e veja num só lugar as comunidades, os eventos e as notificações. Cada criador continua vendo apenas os dados dos próprios membros, o perfil não revela a uma comunidade de quais outras a pessoa participa, e a pessoa pode usar um perfil diferente em cada comunidade se preferir. A política de privacidade deve dizer isso, e o texto entra em vigor junto com o recurso.

236. [SK4] Desafio de crescimento para criadores, inspirado no Skool Games (primeiro o estudo)

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Estude, nas fontes oficiais, como funciona o Skool Games e as leis aplicáveis a concursos e prêmios nos EUA, no Canadá, no Reino Unido e na União Europeia. Registre em docs/creator-challenge-study.md uma proposta de desafio que premie progresso real e verificado nos dados da loja (por exemplo, a primeira venda ou os primeiros dez membros), com prêmios que não sejam dinheiro (por exemplo, destaque na vitrine e na descoberta, com autorização, e um selo), sem exigência de compra, com regras públicas e sem números inventados. O custo dos prêmios entra nos custos fixos da empresa. Não construa nada: a construção depende da decisão do dono, a partir desse estudo.

237. [SK5] Página honesta "Marktmorgen vs Skool"

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Crie, em inglês americano, uma página de comparação somente com fatos verificáveis e fontes oficiais datadas: o que cada plataforma inclui, preços, taxas por venda e o que cada uma não faz. Destaque, se confirmado nas fontes oficiais da Skool, que o Marktmorgen une a comunidade com recursos de venda (provas e certificados, oferta extra no checkout, oferta depois do pagamento, combos, funis e loja completa), sempre mostrando apenas recursos que estejam no ar e ligados. Siga o padrão do item 213 [SH10] e coordene com o item 224 [HL5], para que a mensagem "comunidade e vendas num só lugar" seja a mesma em todo o site.

Estado inicial de todos os itens: na fila.

**Proveniência:** instrução direta do dono,21/10/2026,01h49 Fortaleza; anexo b0d9e270-db61-43f4-9a0c-3981edb918f1/Texto colado.txt. Pedido integral preservado acima, incluindo exclusões e regras SH204–214. A auditoria do Copilot e fatos sobre Skool são contexto atribuído ao pedido; verificar nas fontes oficiais datadas durante a execução, sem tratá-los como fatos já conferidos. Preservados203–232 e OP5 vigente. SK4 é somente estudo, sem construção; nenhum recurso, gasto, conta, contato, aprovação, ativação ou mudança comercial nesta inclusão. Estado de cada um233[SK1],234[SK2],235[SK3],236[SK4],237[SK5]: na fila. Inclusão documental não é entrega funcional.


## CF — Lições da auditoria do ClickFunnels (21/10/2026)

**Estado inicial:** todos os itens238–243 na fila. **Ordem:** depois do item237 [SK5] e de todos os trabalhos em andamento; não bloqueiam outros itens. Escopo futuro.

Pedido: dono, 21/10/2026, 02h00 de Fortaleza: gerar coisas boas no Marktmorgen a partir de uma auditoria pública do ClickFunnels feita pelo Copilot.

Lição principal da auditoria: o ClickFunnels cresceu com quatro pilares: narrativa de transformação, afiliados com 30% recorrente, SEO de comparação e de intenção comercial (páginas "Kajabi vs ClickFunnels", "alternativas" e preços) e foco no aumento da receita do cliente. Fatos a conferir nas fontes oficiais, com a data da consulta: planos Launch, Scale ("Most Popular"), Optimize e Dominate; desconto anual com a economia explícita; teste grátis; garantia de 30 dias; cotas de palavras de IA por plano; campo de e-mail na primeira tela da página inicial; vídeos nas páginas de produto.

O que já existe ou já está na fila e NÃO deve ser refeito (verifique antes): a paridade com o ClickFunnels (docs/clickfunnels-feature-audit.json e docs/clickfunnels-implementation-baseline.md); funis, oferta extra, oferta depois do pagamento, combos, assinaturas, comunidade, cursos, agendamento, e-mail, automações, afiliados dos criadores, recuperação de checkout, API e webhooks; os modelos de funil por objetivo (lib/funnel-starter-catalog.ts); o cálculo da economia anual (lib/plan.ts); as comparações já publicadas no blog (lib/blog.ts, por exemplo "Kajabi vs Teachable vs Marktmorgen: what to check" e "how-marktmorgen-compares-with-stan"); os importadores (lib/imports.ts) e o item 210 [SH7]; as páginas de comparação dos itens 213 [SH10] e 237 [SK5]; a mensagem de resultado do item 224 [HL5]; a calculadora do item 225 [HL6]; os afiliados, a academia, a certificação e os parceiros dos itens 220 a 223; e o painel de valor do comprador do item 226 [HL7]. Também não entram: calculadora de "potencial de receita" ou página de preços com "ROI estimado" (seriam projeções de ganho); escassez como "Unlimited Funnels Limited Time"; e contadores como "100K+ users" sem dado real.

Regras: valem para estes itens todas as regras da seção SH (itens 204 a 214), sem exceção: verificar e reutilizar o que já existe; margem líquida mínima de 60% (ela pode ser maior, mas nunca menor) por cliente isolado, com 100% dos direitos usados no pior mês, e também no consolidado, depois de todos os custos e de todos os impostos, inclusive os brasileiros; custo desconhecido não pode ser considerado zero; leitura que der MAIS imposto; interruptor no código, desligado, quando o item criar recurso novo para os criadores; proibição de criar contas, pagar qualquer valor, aceitar termos, pedir aprovações, ligar interruptores e alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a ou a revisão comercial; testes somente com fornecedores simulados; inglês americano, acessibilidade (WCAG 2.2 AAA como ponto de partida) e nenhuma afirmação sem fonte oficial datada. Nenhuma página pública pode mostrar recurso desligado.

238. [CF1] Programa único de páginas de comparação e de alternativas

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Reúna num único modelo, reutilizado em todas as páginas, as comparações dos itens 213 [SH10] e 237 [SK5] e as que já existem no blog, e amplie-o para os principais concorrentes da lista dos 30 (por exemplo, Kajabi, ClickFunnels, Stan, Hotmart, Teachable, Thinkific, Gumroad, Circle, Skool, Linktree, Beacons, Podia, Systeme.io, Kartra, HighLevel e Shopify). Para cada concorrente, crie uma página "Marktmorgen vs [concorrente]" e uma página "[concorrente] alternatives", ambas com fatos verificáveis, fontes oficiais com a data da consulta, o que cada plataforma faz e não faz, preços e taxas por venda, e uma rotina que acuse fatos com mais de 90 dias sem revisão. Cada página tem conteúdo realmente útil e diferente, em cumprimento às políticas do Google contra conteúdo produzido em escala sem valor. Nada de afirmação de superioridade sem fonte, de depoimento ou de número inventado.

239. [CF2] Guias oficiais de migração por plataforma

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Crie, para cada plataforma de origem que os importadores aceitam (por exemplo, Stan, Gumroad, Kajabi, Teachable, Mailchimp, Shopify e ClickFunnels), uma página "Move from [plataforma] to Marktmorgen" que explique, passo a passo e com base no que o código realmente faz, como exportar os dados na plataforma de origem, o que entra no Marktmorgen (produtos, contatos com consentimento, membros e compras anteriores), o que não entra e o que o criador precisa refazer. Verifique nas fontes oficiais de cada plataforma como a exportação funciona hoje e registre a data. Nenhuma migração manual feita pelo dono: tudo autoatendido.

240. [CF3] Início pelo e-mail na página inicial e boletim do Marktmorgen

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Na primeira tela da página inicial, ofereça um campo de e-mail que inicia o cadastro pelo mesmo link de acesso que já existe, com a proteção contra robôs que já existe (Vercel BotID). Se a pessoa não concluir o cadastro, envie no máximo um lembrete, e somente se ela tiver marcado uma caixa, desmarcada por padrão, pedindo esse lembrete. Ofereça também, separadamente e com outra caixa desmarcada por padrão, um boletim do Marktmorgen para criadores, com conteúdo útil e verificável (ligado à academia do item 221 [HL2]), link de cancelamento em um clique e o endereço postal exigido por lei. Cumpra a lei americana CAN-SPAM, o GDPR, a lei canadense CASL e as regras do Reino Unido. O custo desses e-mails entra nos custos fixos da empresa e tem teto automático. Meça a conversão do cadastro antes e depois.

241. [CF4] Vídeos curtos e reais do produto nas páginas de recursos

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Grave, por automação de navegador sobre a loja de demonstração (Harbor Kitchen, rotulada como fictícia), vídeos curtos de tela que mostrem cada recurso principal funcionando de verdade, sem atores, sem números inventados e sem recursos desligados. Cada vídeo tem legenda e transcrição em texto, carrega somente quando necessário (sem prejudicar o LCP) e respeita a regra de nenhuma imagem repetida no site. Hospede-os no fornecedor de vídeo que já existe, calcule o custo de armazenamento e de entrega, e coloque teto automático; esse custo entra nos custos fixos da empresa.

242. [CF5] Modelos de funil por nicho de criador

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Amplie os modelos de funil por objetivo (lib/funnel-starter-catalog.ts) com versões por nicho (por exemplo, coach, professor de ioga, fotógrafo, músico, consultor e educador), com textos de exemplo honestos, sem resultados, números ou depoimentos inventados. Coordene com a biblioteca de modelos do item HT15 e com as páginas por nicho do item 230 [HL11], para que cada nicho tenha o mesmo conjunto coerente de modelos, páginas e exemplos.

243. [CF6] Economia anual explícita e plano recomendado na página de preços

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Verifique se a página de preços mostra, para cada plano, a economia exata do pagamento anual em relação a doze pagamentos mensais, calculada a partir de lib/plan.ts (o ano equivale a dez mensalidades), e corrija o que faltar. Destaque o plano mais indicado com o rótulo "Recommended", e nunca com "Most Popular" enquanto não houver dados reais de clientes que o comprovem. Não altere preços, limites, nomes nem número de planos. Coordene com o item 224 [HL5].

Estado inicial de todos os itens: na fila.

**Proveniência:** instrução direta do dono,21/10/2026,02h00 Fortaleza; anexo588f3e4e-f3c9-45e4-85c8-8717da7565b2/Texto colado.txt. Pedido integral preservado acima, incluindo exclusões e regras SH204–214. Auditoria do Copilot e alegações sobre ClickFunnels são contexto atribuído ao pedido, a conferir em fontes oficiais datadas durante a execução. Preservados203–237 e OP5 vigente. Nenhuma conta, gasto, contato, aceite, aprovação, envio, publicação externa, ativação ou mudança comercial nesta inclusão. Estado de cada um238[CF1],239[CF2],240[CF3],241[CF4],242[CF5],243[CF6]: na fila. Inclusão documental não é entrega funcional.


## SP — Lições da segunda auditoria da Shopify (21/10/2026)

**Estado inicial:** todos os itens244–247 na fila. **Ordem:** depois do item243 [CF6] e de todos os trabalhos em andamento; não bloqueiam outros itens. Escopo futuro.

Pedido: dono, 21/10/2026, 02h19 de Fortaleza: gerar coisas boas no Marktmorgen a partir de uma segunda auditoria pública da Shopify feita pelo Copilot.

Lição principal da auditoria: a Shopify vende uma narrativa de crescimento ("você pode começar sozinho hoje e se tornar uma marca global amanhã sem trocar de plataforma") e atrai visitantes com conteúdo, ferramentas e provas. Fatos a conferir nas fontes oficiais, com a data da consulta: "Be the next household name" e "Sell everywhere people shop" na página inicial; "Try 3 days free, then $1/month for 3 months" na página de preços; mais de 600 estudos de caso públicos; páginas de comparação como /compare/shopify-vs-woocommerce; Shopify Academy; mais de 21.000 aplicativos.

O que já existe ou já está na fila e NÃO deve ser refeito (verifique antes): venda por agentes de IA (204 [SH1]); produtos físicos com opções, impressão sob demanda, canais de venda e moeda do comprador (205 a 208); importação de lojas da Shopify (210 [SH7]); compra com um toque (211 [SH8]); assistente que executa tarefas (212 [SH9]); comparações e alternativas (213 [SH10] e 238 [CF1]); aplicativo na Shopify App Store e no Zapier e no Make (215 [OP1] e 217 [OP3]); loja montada pela IA (219 [OP5]); afiliados, academia, certificação e parceiros (220 a 223); mensagem de resultado (224 [HL5]); calculadora de custo da pilha (225 [HL6]); casos reais (229 [HL10]); páginas por nicho (230 [HL11]); guias de migração (239 [CF2]); e, já no código, combos, oferta extra, oferta depois do pagamento, assinaturas, recuperação de checkout, comunidade e a oferta do próximo produto pelo Store assistant. Também não entram: o teste grátis sem cartão (contraria o item 232 [CA1]); comparações entre criadores, que dependem de dados reais que ainda não existem; um aplicativo nativo de celular (decisão já explicada no blog, "why-we-skipped-the-app-stores"); e qualquer título que prometa transformação financeira ou que o criador vai "viver da audiência", porque seria promessa de resultado.

Regras: valem para estes itens todas as regras da seção SH (itens 204 a 214), sem exceção: verificar e reutilizar o que já existe; margem líquida mínima de 60% (ela pode ser maior, mas nunca menor) por cliente isolado, com 100% dos direitos usados no pior mês, e também no consolidado, depois de todos os custos e de todos os impostos, inclusive os brasileiros; custo desconhecido não pode ser considerado zero; leitura que der MAIS imposto; interruptor no código, desligado, quando o item criar recurso novo; proibição de criar contas, pagar qualquer valor, aceitar termos, pedir aprovações, ligar interruptores e alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a ou a revisão comercial; testes somente com fornecedores simulados; inglês americano, acessibilidade (WCAG 2.2 AAA como ponto de partida) e nenhuma afirmação sem fonte oficial datada. Nenhuma página pública pode mostrar recurso desligado.

244. [SP1] Central de ferramentas gratuitas para criadores, sem cadastro

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Crie uma seção pública de ferramentas gratuitas, cada uma com página própria otimizada para busca e com uma chamada discreta para abrir a loja no Marktmorgen. Exemplos: quanto sobra de uma venda depois das taxas da Stripe; preço final com IVA ou imposto sobre vendas incluído; quanto o comprador economiza no plano anual; desconto por quantidade para equipes; código QR do link da loja; redimensionador de imagens para a página de produto; e verificador do tamanho de títulos e descrições. Faça os cálculos e o processamento no próprio navegador do visitante, sempre que possível, para não haver custo de servidor; quando houver, calcule-o e coloque teto automático. Todas as taxas e regras usadas vêm de fontes oficiais com a data da consulta, com uma rotina que acuse dados com mais de 90 dias sem revisão. Não crie geradores de documentos jurídicos (termos de uso ou políticas), nem ferramentas que projetem ganhos; se alguma ferramenta usar IA, ela segue a reserva antes da chamada e o teto dos orçamentos de IA que já existem. Nenhum dado digitado pelo visitante é guardado.

245. [SP2] Página "Grow without switching"

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Crie, em inglês americano, uma página que mostre como o criador começa no plano Store e cresce para o Studio e o Scale sem trocar de ferramenta, usando somente os preços e os limites reais de lib/plan.ts: o que cada plano acrescenta, que a troca de plano é feita pelo próprio criador, que os dados e os compradores continuam com ele (a conta Stripe é dele, e há exportação dos dados) e que não há perda de nada ao subir de plano. Nada de promessa de ganho ou de "marca global". Não altere preços, limites, nomes nem número de planos. Coordene com o item 224 [HL5] e com a página de preços.

246. [SP3] Estudo: teste pago de US$ 1 em comparação com o teste grátis com cartão

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Estude, nas fontes oficiais, como funciona o "3 days free, then $1/month for 3 months" da Shopify, e compare, para o Marktmorgen, o teste grátis atual de 14 dias com cartão com um período de entrada pago de valor simbólico (por exemplo, US$ 1). Calcule, com lib/receiving-costs.ts e a revisão de exposição (docs/funded-exposure-review.md), o custo máximo de cada opção no pior caso, inclusive o uso integral dos direitos durante o período, as taxas por cobrança, as contestações e o efeito sobre fraudes e calotes. Um período de entrada que não cubra 60% por si só tem de ser tratado como exposição com teto e limite de ocorrências, como o teste grátis. Registre o estudo em docs/paid-intro-study.md como PROPOSTA: nenhum preço, período ou interruptor muda sem a decisão do dono.

247. [SP4] Página de status e página de segurança

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Crie uma página pública de status que mostre a disponibilidade real do site, do checkout e dos e-mails, medida pelas verificações automáticas que já existem (por exemplo, a verificação diária de e-mail) e por verificações novas de baixo custo, com o histórico real de incidentes, sem arredondar para cima. Crie também uma página de segurança que liste apenas práticas reais e verificáveis no código (por exemplo, pagamentos processados pela Stripe na conta do próprio criador, sem que o Marktmorgen guarde dados de cartão; proteção contra robôs; exportação e exclusão de dados; e formas de entrar na conta), sem selos ou certificações que o Marktmorgen não tenha. Calcule o custo das verificações e coloque teto automático; esse custo entra nos custos fixos da empresa.

Estado inicial de todos os itens: na fila.

**Proveniência:** instrução direta do dono,21/10/2026,02h19 Fortaleza; anexo fb518c89-252d-4be2-94ce-d54974d767a6/Texto colado.txt. Pedido integral preservado acima, incluindo exclusões e regras SH204–214. Auditoria do Copilot e alegações sobre Shopify são contexto atribuído ao pedido; conferir fontes oficiais datadas durante a execução, sem tratá-los como fatos já verificados. Preservados203–243 e OP5 vigente. SP3 é estudo/PROPOSTA somente, sem alteração de preço/período/interruptor. Nenhuma conta, contato, gasto, aceite, aprovação, envio, operação real, ativação ou mudança comercial nesta inclusão. Estado de cada um244[SP1],245[SP2],246[SP3],247[SP4]: na fila. Inclusão documental não é entrega funcional.


## ST — Lições da auditoria da Stan (21/10/2026)

Pedido do dono em21/10/2026,02h58Fortaleza. Proveniência: attachment7164ac2c-d383-4672-b556-3858dc0caf75/Texto colado.txt. Ordem: depois de247[SP4] e dos itens em andamento; não bloqueiam outros. Itens248[ST1],249[ST2],250[ST3],251[ST4]: **na fila**. Sem execução/ativação nesta inclusão. Preservados integralmente203–247 e o trabalho atual201/202. Alegações da auditoria são dados a verificar em fontes oficiais datadas, não fatos certificados.

### Pedido integral e regras vinculantes

NÃO PARE o que você está fazendo agora: conclua normalmente a tarefa atual. Em seguida, COLOQUE NA FILA, PARA FAZER DEPOIS, os itens abaixo, na ordem em que estão. Eles devem ser incluídos em docs/codex-queue.md, no fim do arquivo, depois de tudo o que já existe, numa seção nova chamada "ST — Lições da auditoria da Stan (21/10/2026)". Essa seção deve vir depois do item 247 [SP4]. Se as seções anteriores ainda não estiverem no ramo principal quando você fizer a inclusão, coloque a nova seção depois do último item existente e preserve os itens 203 a 247 dos pedidos de mudança abertos. Numere os itens a partir de 248, na ordem abaixo; se algum desses números já estiver em uso, use os próximos números livres. Ordem de execução: depois do item 247 e de todos os itens que já estão em andamento. Estes itens não bloqueiam nenhum outro.

Pedido: dono, 21/10/2026, 02h58 de Fortaleza: gerar coisas boas no Marktmorgen a partir de uma auditoria pública da Stan feita pelo Copilot.

Lição principal da auditoria: a Stan ocupa a posição de "a forma mais fácil de ganhar dinheiro como criador", com loja tudo em um, pouco atrito, prova social de criadores conhecidos e SEO de comparações e alternativas. Os pontos fracos apontados são a dependência do tráfego das redes sociais (as lojas quase não são encontradas pelo Google), cursos mais simples que os do Kajabi e do Teachable, personalização limitada e muitos recursos que geram venda presos ao plano de US$ 99. Fatos a conferir nas fontes oficiais, com a data da consulta: planos Creator (US$ 29 por mês ou US$ 300 por ano) e Creator Pro (US$ 99 por mês ou US$ 948 por ano); teste grátis de 14 dias; indicação com 20% recorrente; e, no Creator Pro, e-mail, funis, afiliados, oferta depois do pagamento, oferta extra, cupons e parcelamento.

O que já existe ou já está na fila e NÃO deve ser refeito (verifique antes): oferta depois do pagamento e oferta alternativa após recusa (lib/funnel.ts e lib/clickfunnels-funnel.ts); Klarna e Afterpay pela conta Stripe do criador; turmas e liberação gradual das aulas; provas e certificados; mapa do site e dados estruturados das lojas; respostas automáticas no Instagram (item 39 [G1]); páginas "vs" e de alternativas (238 [CF1]); modelos por nicho (242 [CF5]); afiliados e indicação (220 [HL1] e 216 [OP2]); casos reais e vitrine com autorização (229 [HL10]); calculadoras (225 [HL6] e 244 [SP1]); loja montada pela IA (219 [OP5]); e CRM, e-mail, automações, pixels e atribuição, que já estão no código. Também não entram: títulos como "the easiest way to make money online" ou qualquer outro que prometa ganho; prova social com número de seguidores de criadores que não sejam clientes reais com autorização escrita; e ofertas de "quantidade limitada" que não correspondam a um estoque real.

Regras: valem para estes itens todas as regras da seção SH (itens 204 a 214), sem exceção: verificar e reutilizar o que já existe; margem líquida mínima de 60% (ela pode ser maior, mas nunca menor) por cliente isolado, com 100% dos direitos usados no pior mês, e também no consolidado, depois de todos os custos e de todos os impostos, inclusive os brasileiros; custo desconhecido não pode ser considerado zero; leitura que der MAIS imposto; interruptor no código, desligado, quando o item criar recurso novo; proibição de criar contas, pagar qualquer valor, aceitar termos, pedir aprovações, ligar interruptores e alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a ou a revisão comercial; testes somente com fornecedores simulados; inglês americano, acessibilidade (WCAG 2.2 AAA como ponto de partida) e nenhuma afirmação sem fonte oficial datada. Nenhuma página pública pode mostrar recurso desligado.

248. [ST1] Lojas dos criadores encontradas no Google

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Audite o que as lojas já fazem para os buscadores (mapas do site, dados estruturados, títulos e descrições, endereços, velocidade, domínio próprio e o blog da loja) e corrija o que faltar. Acrescente ao studio uma lista de verificação de SEO por loja, por produto e por página, com explicação simples de cada ponto, e campos próprios para título e descrição de busca em cada produto e página. Ofereça ao criador um guia passo a passo para verificar o próprio domínio no Google Search Console. Meça, com dados reais e sem promessas de posição no Google, a nota de desempenho das lojas no celular. Calcule o custo de leitura por visitas de robôs de busca e mantenha os tetos que já existem.

249. [ST2] Trilhas de aprendizado

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Permita que o criador organize vários cursos numa trilha, em ordem, com pré-requisitos (por exemplo, o curso 2 abre quando o curso 1 é concluído), progresso visível ao aluno e certificado da trilha completa, reutilizando os cursos, as turmas, a liberação gradual, as provas e os certificados que já existem. A trilha pode ser vendida sozinha, dentro de uma assinatura ou de um combo, sempre com cobrança na conta Stripe do criador. Calcule o custo de leitura e de armazenamento e mantenha os limites do plano.

250. [ST3] Proposta: mais valor sem custo no plano Store

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Liste todos os recursos que hoje ficam só nos planos Studio e Scale e, para cada um, calcule com lib/receiving-costs.ts e o registro de custos por plano se ele tem custo variável para o Marktmorgen. Para os que não têm custo, analise o efeito de oferecê-los também no plano Store: maior conversão e menos cancelamentos, de um lado, e menos motivos para subir de plano, de outro. Siga a regra do dono de 18/10/2026 ("oferecer o ultra máximo de coisas que os clientes percebem como alto valor e que não têm custo para ele"), sem perder lucro. Registre a análise em docs/store-plan-value-proposal.md como PROPOSTA: nenhum recurso, preço ou limite muda sem a decisão do dono.

251. [ST4] Do cadastro à loja pronta para vender, medido

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Meça, em testes automatizados com fornecedores simulados, o tempo e o número de passos desde o cadastro até a loja publicada com um primeiro produto e o checkout pronto, e registre os resultados. Remova os passos que não forem indispensáveis, sem tirar nenhuma proteção (consentimentos, verificações e avisos legais), e coordene com o Marktmorgen Path e com o item 219 [OP5]. Nenhuma página pública pode citar tempo ou facilidade sem a medição registrada.

Estado inicial de todos os itens: na fila.

Registro: inclusão somente documental. ST3 é PROPOSTA sem alterar recursos/preços/limites; todos os gates SH continuam vinculantes, desconhecido reprova, sem promessa de ganhos, sem operação/conta/pagamento/mensagem externa. Não é entrega funcional.


## WH — Lições da auditoria da Whop (21/10/2026)

Pedido do dono21/10/2026,03h21Fortaleza. Proveniência: attachment17bd39ba-cf6a-4b29-933a-b4cdeadf5393/Texto colado.txt. Ordem: após251[ST4] e todos os itens em andamento; não bloqueia outros.252[WH1],253[WH2],254[WH3],255[WH4]: **na fila**.203–251 preservados integralmente. WH1 é estudo apenas; nenhuma construção sem decisão do dono. A consideração adicional de spam/qualidade na execução de234 fica registrada aqui sem modificar seu texto original.

### Pedido integral e regras vinculantes

NÃO PARE o que você está fazendo agora: conclua normalmente a tarefa atual. Em seguida, COLOQUE NA FILA, PARA FAZER DEPOIS, os itens abaixo, na ordem em que estão. Eles devem ser incluídos em docs/codex-queue.md, no fim do arquivo, depois de tudo o que já existe, numa seção nova chamada "WH — Lições da auditoria da Whop (21/10/2026)". Essa seção deve vir depois do item 251 [ST4]. Se as seções anteriores ainda não estiverem no ramo principal quando você fizer a inclusão, coloque a nova seção depois do último item existente e preserve os itens 203 a 251 dos pedidos de mudança abertos. Numere os itens a partir de 252, na ordem abaixo; se algum desses números já estiver em uso, use os próximos números livres. Ordem de execução: depois do item 251 e de todos os itens que já estão em andamento. Estes itens não bloqueiam nenhum outro.

Pedido: dono, 21/10/2026, 03h21 de Fortaleza: gerar coisas boas no Marktmorgen a partir de uma auditoria pública da Whop feita pelo Copilot.

Lição principal da auditoria: a Whop cresce com quatro ciclos: criador, produto e vitrine (Whop Discover); cliente, afiliado e novo cliente; criador, conteúdo, busca e novo criador; e o Content Rewards, em que o criador paga outras pessoas por visualizações de vídeos curtos que divulgam o produto dele, transformando usuários em canal de aquisição. Fatos a conferir nas fontes oficiais, com a data da consulta: "Pay-as-you-go. No setup fees, no monthly costs." e 2,7% + US$ 0,30 por transação com cartão; Whop Discover; Content Rewards e Whop Clips; página de preços que detalha cada taxa (fraude, saques, contestações, 3DS e ACH); API, SDKs em TypeScript, Python, Ruby, Rust e Go, e ambiente de testes (sandbox); e, segundo avaliações públicas, spam e qualidade irregular das ofertas na vitrine.

O que já existe ou já está na fila e NÃO deve ser refeito (verifique antes): assinaturas semanais, mensais e anuais, com teste grátis, níveis e pausa; lista de espera (modelo de funil "launch-waitlist") e pré-venda; formas de pagamento escolhidas pelo criador na própria conta Stripe, inclusive Klarna, Afterpay, iDEAL, Bancontact, Apple Pay, Google Pay e Link, com exclusão das que demoram dias para confirmar (lib/payment-methods.ts e lib/instant-pay.ts); recuperação de cartão recusado; combos, oferta extra, oferta depois do pagamento e oferta do próximo produto; comunidade com pontos e níveis; API v1, webhooks e servidor MCP; descoberta de lojas e comunidades (234 [SK2]); afiliados e indicação (220 [HL1] e 216 [OP2]); páginas "vs" e de alternativas (238 [CF1]); academia (221 [HL2]); e painéis de valor do comprador e de coortes (226 [HL7]). Também não entram: o modelo sem mensalidade, só com porcentagem por venda (um criador sem vendas usaria tudo sem pagar nada, contra a margem mínima de 60% por cliente); o cadastro sem cartão (contraria o item 232 [CA1]); e comparações entre criadores, que dependem de dados reais que ainda não existem. Ao executar o item 234 [SK2], considere também as reclamações públicas sobre spam e qualidade irregular na vitrine da Whop, sem alterar o texto daquele item.

Regras: valem para estes itens todas as regras da seção SH (itens 204 a 214), sem exceção: verificar e reutilizar o que já existe; margem líquida mínima de 60% (ela pode ser maior, mas nunca menor) por cliente isolado, com 100% dos direitos usados no pior mês, e também no consolidado, depois de todos os custos e de todos os impostos, inclusive os brasileiros; custo desconhecido não pode ser considerado zero; leitura que der MAIS imposto; interruptor no código, desligado, quando o item criar recurso novo; proibição de criar contas, pagar qualquer valor, aceitar termos, pedir aprovações, ligar interruptores e alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a ou a revisão comercial; testes somente com fornecedores simulados; inglês americano, acessibilidade (WCAG 2.2 AAA como ponto de partida) e nenhuma afirmação sem fonte oficial datada. Nenhuma página pública pode mostrar recurso desligado. O Marktmorgen nunca movimenta dinheiro de terceiros (decisão do dono de 29/09/2026).

252. [WH1] Recompensas por conteúdo, no padrão do Content Rewards da Whop (primeiro o estudo)

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Estude, nas fontes oficiais, como funcionam o Content Rewards e o Whop Clips: quem paga, quanto se paga por mil visualizações, como as visualizações são verificadas, como se combate a fraude (visualizações compradas ou de robôs) e como as pessoas recebem. Estude também, nas fontes oficiais, o que exigem as regras de publicidade (por exemplo, as orientações da FTC sobre divulgação de conteúdo patrocinado, as regras do Reino Unido e da União Europeia), os termos do TikTok, do Instagram, do YouTube e do X sobre conteúdo pago, e a leitura de visualizações pelas APIs oficiais dessas redes. Desenhe em docs/content-rewards-study.md uma versão para o Marktmorgen em que o criador define a campanha e o orçamento, o pagamento sai da conta do próprio criador, como já acontece nos pagamentos a parceiros pelo PayPal do próprio criador (lib/paypal-payouts.ts), e o Marktmorgen nunca recebe nem guarda o dinheiro. Todo conteúdo pago deve trazer a identificação de publicidade exigida. Avalie também, separadamente, um programa do próprio Marktmorgen para divulgar a plataforma, cujo custo entraria nos custos fixos. Não construa nada: a construção depende da decisão do dono, a partir desse estudo.

253. [WH2] Página completa e transparente de taxas

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Crie, em inglês americano, uma página pública que mostre, com fontes oficiais e a data da consulta, todas as taxas envolvidas numa venda pelo Marktmorgen: o preço do plano; os 0% do Marktmorgen sobre as vendas; as taxas da Stripe na conta do criador, por país, para cartão doméstico e internacional, conversão de moeda, contestação e saque; as taxas das formas de pagamento como Klarna e Afterpay; e quem paga cada uma. Inclua um exemplo calculado de uma venda, sem projeção de ganho, e uma rotina que acuse dados com mais de 90 dias sem revisão. Coordene com as ferramentas do item 244 [SP1] e com a página de preços.

254. [WH3] Selo honesto de verificação do criador

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Mostre, na loja e na página pública da comunidade, um selo que diga somente o que é verdade e verificável: por exemplo, que a conta de pagamentos do criador foi verificada pela Stripe (lida da própria conta, sem guardar documentos) e há quanto tempo a loja está aberta no Marktmorgen. O selo some automaticamente quando a condição deixar de valer. Verifique, nas regras oficiais de uso da marca da Stripe, se o nome ou o logotipo podem ser usados e de que forma; se não puderem, use apenas texto descritivo, sem logotipo. Nada de selo de "top seller", número de vendas ou avaliações que não sejam reais.

255. [WH4] Kit do desenvolvedor: especificação OpenAPI, SDK em TypeScript e loja de testes

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Publique, a partir da API v1 que já existe, uma especificação OpenAPI completa e gerada a partir do código (para que nunca fique desatualizada), um SDK oficial em TypeScript gerado dessa especificação, e uma loja de testes com dados fictícios, claramente rotulada, em que desenvolvedores e as integrações do item 217 [OP3] possam testar sem tocar em dados reais. Calcule o custo das requisições de teste e coloque teto automático. Não publique pacotes em registros externos (como o npm), que exigem conta: deixe tudo pronto e liste em docs/developer-kit.md os passos que só o dono pode executar.

Estado inicial de todos os itens: na fila.

Registro: somente inclusão documental; fatos da auditoria requerem fontes oficiais datadas. Todas as regras SH e a proibição de movimentar dinheiro de terceiros permanecem vinculantes. Sem conta, pagamento, aceite, aprovação, mensagem, ativação ou mudança comercial. Não é entrega funcional.


## KJ — Lições da auditoria do Kajabi (21/10/2026)

Pedido do dono21/10/2026,03h29Fortaleza. Proveniência: attachment906b58e3-1a38-4228-acbb-c22a3a7912d1/Texto colado.txt. Ordem: após255[WH4] e todos os itens em andamento, sem bloquear outros.256[KJ1],257[KJ2],258[KJ3],259[KJ4],260[KJ5],261[KJ6],262[KJ7]: **na fila**. Preservados integralmente203–255. KJ6éPROPOSTA sem mudança comercial;KJ7estudoapenas;KJ2exigeestudoecompatibilidade antes de construir. Alegações da auditoria requerem verificação oficial datada.

### Pedido integral e regras vinculantes

NÃO PARE o que você está fazendo agora: conclua normalmente a tarefa atual. Em seguida, COLOQUE NA FILA, PARA FAZER DEPOIS, os itens abaixo, na ordem em que estão. Eles devem ser incluídos em docs/codex-queue.md, no fim do arquivo, depois de tudo o que já existe, numa seção nova chamada "KJ — Lições da auditoria do Kajabi (21/10/2026)". Essa seção deve vir depois do item 255 [WH4]. Se as seções anteriores ainda não estiverem no ramo principal quando você fizer a inclusão, coloque a nova seção depois do último item existente e preserve os itens 203 a 255 dos pedidos de mudança abertos. Numere os itens a partir de 256, na ordem abaixo; se algum desses números já estiver em uso, use os próximos números livres. Ordem de execução: depois do item 255 e de todos os itens que já estão em andamento. Estes itens não bloqueiam nenhum outro.

Pedido: dono, 21/10/2026, 03h29 de Fortaleza: gerar coisas boas no Marktmorgen a partir de uma auditoria pública do Kajabi feita pelo Copilot.

Lição principal da auditoria: o Kajabi vende identidade e negócio ("Turn what you know into what you're known for", "The Operating System for Human Expertise"), ataca a pilha de ferramentas separadas ("All-in-one. Because six separate tools isn't a business plan"), mostra o produto funcionando ("See exactly how it works") e está virando uma plataforma com IA em tudo. Fatos a conferir nas fontes oficiais, com a data da consulta: "No hidden fees. No revenue sharing."; planos Basic, Growth ("Most Popular") e Pro; Enhanced Checkout com design próprio, conteúdo adicional e depoimentos (help.kajabi.com); e os cinco produtos de IA anunciados em 19/05/2026: Cofounder (estrategista de negócio), Expert Agents (assistentes treinados no conteúdo publicado do criador, que respondem a membros e visitantes; US$ 79 por agente por mês após 30/09/2026, com 1.000 mensagens e 250 créditos de IA por mês, segundo a Central de Ajuda do Kajabi), Backstage (programas personalizados para cada cliente a partir do conteúdo existente), Amplify (divulgação para os contatos da rede do Kajabi) e MCP (operar o Kajabi por ferramentas de IA, "from a sentence to launch").

O que já existe ou já está na fila e NÃO deve ser refeito (verifique antes): loja de demonstração real com checkout em modo de teste (app/demo); oferta extra, oferta depois do pagamento, combos, assinaturas, comunidade com pontos e níveis, e-mail, automações, funis, afiliados e diretório de programas de afiliados; servidor MCP de leitura (app/api/mcp e lib/mcp-tools.ts); Store assistant (lib/store-assistant*.ts); tutor do aluno (HT13); trilhas de aprendizado (249 [ST2]); loja montada pela IA (219 [OP5]); assistente que executa tarefas (212 [SH9]); páginas por nicho (230 [HL11]); comparações e alternativas (238 [CF1]); guias de migração (239 [CF2]); modelos por nicho (242 [CF5]); calculadora da pilha de ferramentas (225 [HL6]); casos reais (229 [HL10]); descoberta de lojas (234 [SK2]); e o rótulo "Recommended" em vez de "Most Popular" (243 [CF6]). Também não entram: Pix e parcelamento brasileiro (o público-alvo é EUA, Europa e Canadá); cobrança por porcentagem das vendas no lugar de limites (contraria a margem mínima por cliente); aplicativo nativo com marca própria (decisão já explicada no blog, "why-we-skipped-the-app-stores"); números agregados como "$12B+ earned by creators" enquanto não houver dados reais; e qualquer título que prometa resultado.

Regras: valem para estes itens todas as regras da seção SH (itens 204 a 214), sem exceção: verificar e reutilizar o que já existe; margem líquida mínima de 60% (ela pode ser maior, mas nunca menor) por cliente isolado, com 100% dos direitos usados no pior mês, e também no consolidado, depois de todos os custos e de todos os impostos, inclusive os brasileiros; custo desconhecido não pode ser considerado zero; leitura que der MAIS imposto; interruptor no código, desligado, quando o item criar recurso novo; proibição de criar contas, pagar qualquer valor, aceitar termos, pedir aprovações, ligar interruptores e alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a ou a revisão comercial; testes somente com fornecedores simulados; inglês americano, acessibilidade (WCAG 2.2 AAA como ponto de partida) e nenhuma afirmação sem fonte oficial datada. Nenhuma página pública pode mostrar recurso desligado. Toda chamada de IA é reservada antes, com teto automático, dentro dos orçamentos de IA que já existem.

256. [KJ1] Demonstração interativa do studio, sem cadastro

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Crie uma demonstração do studio (o painel do criador) que qualquer visitante abre sem cadastro, sobre a loja de demonstração rotulada como fictícia, para ver na prática como se cria um produto, uma página, uma oferta extra, uma assinatura e um e-mail. Tudo o que o visitante fizer é temporário, isolado dos dados reais, sem enviar e-mail, sem cobrar e sem chamar a IA de verdade (as respostas de IA, se mostradas, são exemplos fixos e rotulados como exemplos). Ao final, um botão leva ao cadastro. Proteja contra robôs com a proteção que já existe, coloque teto automático para o custo das sessões e meça a conversão.

257. [KJ2] Página de checkout com o conteúdo do criador

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Estude, nas fontes oficiais da Stripe, o Embedded Checkout (ou outra forma oficial) com cobrança direta na conta Standard do criador, para que o pagamento aconteça numa página do próprio Marktmorgen. Ao redor do formulário de pagamento, o criador poderia mostrar o resumo do que o comprador recebe, a garantia, a política de reembolso e somente avaliações reais do produto, sem contagem regressiva, escassez ou depoimento inventado. Confirme que o pagamento continua sendo na conta do criador, que as formas de pagamento continuam sendo as que ele ligou, e o efeito sobre segurança (PCI), impostos e oferta extra. Registre o estudo em docs/checkout-page-study.md e construa somente se for compatível com tudo isso, com interruptor desligado e medição da conversão antes e depois.

258. [KJ3] MCP com ações, sempre com confirmação

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Amplie o servidor MCP que hoje só lê os números da loja para que o assistente de IA do próprio criador (Claude, ChatGPT ou outro) possa também preparar ações: criar um produto em rascunho, rascunhar uma página, rascunhar um e-mail ou uma sequência, montar um funil a partir de um modelo e sugerir um cupom. Nada é publicado, enviado, cobrado ou apagado pelo MCP: toda ação fica em rascunho até o criador confirmar no studio. Use chaves de acesso com permissões separadas para leitura e para rascunho, que o criador pode revogar a qualquer momento, e aplique os mesmos limites do plano e os mesmos filtros de honestidade da IA que já existem.

259. [KJ4] Plano de estudo personalizado para cada aluno, inspirado no Backstage

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Permita que o criador ofereça, num curso ou numa trilha, um plano de estudo personalizado: o aluno responde a poucas perguntas (objetivo, nível e tempo disponível) e recebe uma ordem sugerida das aulas e das práticas, usando somente o conteúdo que o criador já publicou e que o aluno comprou. O plano é sugestão, não promessa de resultado, e o criador pode revisar o modelo de perguntas. Coordene com o tutor do aluno (HT13) e com as trilhas (249 [ST2]), sem duplicar. Calcule o custo de IA por aluno, coloque teto automático e verifique se o recurso deve ser incluído num plano ou vendido como complemento, sempre mantendo os 60%.

260. [KJ5] Importador de cursos

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Verifique, nas fontes oficiais do Kajabi, do Teachable, do Thinkific e do Podia, o que cada um permite exportar dos cursos (estrutura, textos, arquivos e vídeos) e em que formato. Construa um importador que traga, a partir desses arquivos de exportação ou de arquivos enviados pelo próprio criador, a estrutura do curso, os módulos, as aulas, os textos e os arquivos, com pré-visualização, validação no servidor e respeito aos limites do plano (armazenamento e horas de vídeo), como já se exige dos outros importadores. Nunca leia áreas protegidas por login de outra plataforma nem copie conteúdo que o criador não tenha declarado como dele. Coordene com os guias de migração do item 239 [CF2].

261. [KJ6] Proposta: o Store assistant em comparação com os Expert Agents

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Compare, com fontes oficiais datadas, o Store assistant (US$ 69 por mês, 700 respostas) com os Expert Agents do Kajabi (US$ 79 por agente por mês após 30/09/2026, 1.000 mensagens e 250 créditos de IA) e com o assistente de IA da Hotmart, em preço, número de respostas, funções (vendas, suporte e tutor) e honestidade (rótulo de IA, respostas presas aos fatos e passagem para o criador). Calcule, com o código de margem que já existe, se o número de respostas do Store assistant pode ser aumentado mantendo os 60% e a folga exigida (regra: um limite visível só pode ser aumentado onde a margem permitir). Registre o resultado em docs/assistant-vs-expert-agents.md como PROPOSTA: nenhum preço, limite ou interruptor muda sem a decisão do dono.

262. [KJ7] Estudo: divulgação entre lojas, com consentimento, inspirada no Amplify

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Estude, nas fontes oficiais, como funciona o Amplify do Kajabi (quem recebe os anúncios, com que consentimento, quem paga e como a receita é dividida) e o que as leis de privacidade e de e-mail exigem (GDPR, CAN-SPAM, CASL e as regras do Reino Unido) para que um criador alcance compradores de outras lojas. Registre em docs/cross-store-promotion-study.md se existe uma forma legal e honesta para o Marktmorgen, por exemplo, somente para compradores que tenham pedido expressamente recomendações de outras lojas, e quanto custaria. Não construa nada: a construção depende da decisão do dono, a partir desse estudo.

Estado inicial de todos os itens: na fila.

Registro: somente inclusão documental; sem duplicação dos itens indicados, sem conta, gasto, aceite, aprovação, mensagem, operação real ou ativação. Todos os gates SH e reserva antecipada/tetos da IA existentes permanecem vinculantes. Não é entrega funcional.


## CI — Lições da auditoria da Circle (21/10/2026)

Pedido do dono21/10/2026,03h46Fortaleza. Proveniência: attachmenta38be427-3b9d-4171-93dd-4eaff13a822e/Texto colado.txt. Ordem: após262[KJ7] e todos os itens em andamento; não bloqueiam outros.263[CI1],264[CI2],265[CI3],266[CI4]: **na fila**.203–262preservados integralmente. Todas as alegações da auditoria serão verificadas nas fontes oficiais datadas ao executar.

### Pedido integral e regras vinculantes

NÃO PARE o que você está fazendo agora: conclua normalmente a tarefa atual. Em seguida, COLOQUE NA FILA, PARA FAZER DEPOIS, os itens abaixo, na ordem em que estão. Eles devem ser incluídos em docs/codex-queue.md, no fim do arquivo, depois de tudo o que já existe, numa seção nova chamada "CI — Lições da auditoria da Circle (21/10/2026)". Essa seção deve vir depois do item 262 [KJ7]. Se as seções anteriores ainda não estiverem no ramo principal quando você fizer a inclusão, coloque a nova seção depois do último item existente e preserve os itens 203 a 262 dos pedidos de mudança abertos. Numere os itens a partir de 263, na ordem abaixo; se algum desses números já estiver em uso, use os próximos números livres. Ordem de execução: depois do item 262 e de todos os itens que já estão em andamento. Estes itens não bloqueiam nenhum outro.

Pedido: dono, 21/10/2026, 03h46 de Fortaleza: gerar coisas boas no Marktmorgen a partir de uma auditoria pública da Circle feita pelo Copilot.

Lição principal da auditoria: a Circle se apresenta como a casa do negócio digital ("Circle is the home for your digital business", "You don't need another tool. You need a platform."), domina o SEO de comparações e alternativas, usa uma calculadora de preços gratuita como isca e amplia a receita com módulos (Email Hub, créditos de IA, aplicativos com marca própria). Segundo a auditoria, a Circle dá menos destaque ao checkout, às ofertas extras e à otimização da venda direta. Fatos a conferir nas fontes oficiais, com a data da consulta: planos Professional, Business ("MOST POPULAR"), Scale e Circle Plus; teste grátis de 14 dias; Pricing Calculator (circle.so/pricing-calculator); página de comparações (circle.so/compare); e os recursos de IA Circle AI, AI Agents, AI Moderation, AI Inbox, AI Workflows e AI Summaries.

O que já existe ou já está na fila e NÃO deve ser refeito (verifique antes): comunidade com eventos, chat, mensagens diretas, enquetes, pontos e níveis; moderação manual com denúncias, fila de moderação e silenciar ou remover membro (lib/community.ts, lib/community-chat.ts e lib/community-dm.ts); caixa de entrada da loja (lib/inbox.ts) e a passagem de conversas do Store assistant para o criador; anúncios por e-mail aos membros que pediram (lib/community-mail.ts); e-mail, automações, cursos e assinaturas; comparações e alternativas (238 [CF1]); loja montada pela IA (219 [OP5]); assistente que executa tarefas (212 [SH9]); MCP com ações (258 [KJ3]); automação recomendada a partir de um objetivo (227 [HL8]); guias de migração e importador de cursos (239 [CF2] e 260 [KJ5]); academia (221 [HL2]); casos reais (229 [HL10]); descoberta de lojas (234 [SK2]); ferramentas gratuitas (244 [SP1]); e plano recomendado na página de preços (243 [CF6]). Também não entram: o teste grátis sem cartão (contraria o item 232 [CA1]); parede de criadores famosos que não sejam clientes reais com autorização escrita; aplicativo nativo com marca própria (decisão já explicada no blog, "why-we-skipped-the-app-stores"); frases que não se podem comprovar, como "The first and last platform you'll ever need"; calculadora de retorno estimado; e relatórios anuais de tendências, que dependem de dados reais que ainda não existem.

Regras: valem para estes itens todas as regras da seção SH (itens 204 a 214), sem exceção: verificar e reutilizar o que já existe; margem líquida mínima de 60% (ela pode ser maior, mas nunca menor) por cliente isolado, com 100% dos direitos usados no pior mês, e também no consolidado, depois de todos os custos e de todos os impostos, inclusive os brasileiros; custo desconhecido não pode ser considerado zero; leitura que der MAIS imposto; interruptor no código, desligado, quando o item criar recurso novo; proibição de criar contas, pagar qualquer valor, aceitar termos, pedir aprovações, ligar interruptores e alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a ou a revisão comercial; testes somente com fornecedores simulados; inglês americano, acessibilidade (WCAG 2.2 AAA como ponto de partida) e nenhuma afirmação sem fonte oficial datada. Nenhuma página pública pode mostrar recurso desligado. Toda chamada de IA é reservada antes, com teto automático, dentro dos orçamentos de IA que já existem, com o rótulo de IA desenhado pela página e nunca pelo modelo. O texto dos membros enviado à IA é tratado como dado, nunca como instrução, com as mesmas proteções contra injeção de comandos do Store assistant.

263. [CI1] Moderação assistida por IA na comunidade

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Acrescente à moderação que já existe uma verificação por IA das publicações, dos comentários e das mensagens do chat, que apenas aponta ao criador o que parece spam, golpe, assédio ou conteúdo proibido pelas regras da plataforma, com o motivo explicado. A decisão de esconder, remover ou silenciar continua sendo do criador; a única exceção automática é segurar para revisão, sem apagar, uma publicação com link que corresponda claramente a spam conhecido. O membro afetado é informado e pode pedir revisão. A política de privacidade e as regras da comunidade devem dizer isso, e os textos entram em vigor junto com o recurso. Calcule o custo de IA por publicação, coloque teto automático por loja e por mês e, quando o teto for atingido, volte apenas à moderação manual, sem bloquear a comunidade.

264. [CI2] Resumo semanal da comunidade

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Permita que o criador ofereça aos membros um resumo semanal da comunidade (as discussões principais, os eventos que vêm e o que foi publicado), enviado por e-mail somente aos membros que marcarem uma caixa, desmarcada por padrão, pedindo esse resumo. Cada resumo inclui apenas o que aquele membro tem permissão para ver, usando as mesmas verificações de acesso da busca (lib/community-found.ts), traz o rótulo de IA desenhado pela página e um link de cancelamento em um clique, e conta na franquia de e-mails do plano. O criador pode revisar e aprovar o resumo antes do envio, se preferir. Calcule o custo de IA e de e-mail por membro e coloque teto automático.

265. [CI3] Caixa de entrada com resumo, triagem e rascunho de resposta por IA

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Na caixa de entrada da loja (lib/inbox.ts), acrescente, para cada conversa, um resumo curto, uma classificação (por exemplo, dúvida antes da compra, problema de acesso, pedido de reembolso ou outro) e um rascunho de resposta escrito somente com os fatos publicados da loja, com os mesmos filtros do Store assistant (heldToFacts). Nada é enviado sem que o criador revise e clique em enviar. Pedidos de reembolso e reclamações nunca recebem resposta automática. Calcule o custo de IA por conversa e coloque teto automático por loja e por mês.

266. [CI4] Calculadora "Which plan fits you"

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Crie uma calculadora pública, sem cadastro, em que o criador informa o que pretende vender e a escala do negócio (por exemplo, número de produtos, de membros, de e-mails por mês, de horas de vídeo e de visitas) e recebe o plano do Marktmorgen que atende a essas necessidades, calculado somente a partir dos limites reais de lib/plan.ts, com a explicação de cada limite e o preço mensal e anual. Nada de projeção de ganho ou de economia que não seja calculada a partir de fontes oficiais. Faça os cálculos no navegador do visitante, sem custo de servidor. Coordene com as ferramentas do item 244 [SP1], com a calculadora do item 225 [HL6] e com a página de preços.

Estado inicial de todos os itens: na fila.

Registro: somente inclusão documental. Consentimento separado/desmarcado, acesso por membro, revisão humana, reserva antecipada e tetos de IA/e-mail, rótulo desenhado pela página, defesa contra injeção e todos os gates SH permanecem vinculantes. Sem conta, gasto, aceite, aprovação, operação externa ou ativação; nenhuma entrega funcional nesta inclusão.


## KT — Lições da auditoria da Kit (21/10/2026)

Pedido do dono21/10/2026,04h06Fortaleza. Proveniência: attachment2bc3c81c-55c6-48c1-ab60-8d9233cf7e04/Texto colado.txt. Ordem: após266[CI4] e todos os itens em andamento; sem bloquear outros.267[KT1],268[KT2],269[KT3]: **na fila**. Preservados203–266integralmente. A consideração adicional das recomendações consentidas da Kit no estudo262 fica registrada aqui sem alterar o texto original de262. Alegações da auditoria requerem fontes oficiais datadas.

### Pedido integral e regras vinculantes

NÃO PARE o que você está fazendo agora: conclua normalmente a tarefa atual. Em seguida, COLOQUE NA FILA, PARA FAZER DEPOIS, os itens abaixo, na ordem em que estão. Eles devem ser incluídos em docs/codex-queue.md, no fim do arquivo, depois de tudo o que já existe, numa seção nova chamada "KT — Lições da auditoria da Kit (21/10/2026)". Essa seção deve vir depois do item 266 [CI4]. Se as seções anteriores ainda não estiverem no ramo principal quando você fizer a inclusão, coloque a nova seção depois do último item existente e preserve os itens 203 a 266 dos pedidos de mudança abertos. Numere os itens a partir de 267, na ordem abaixo; se algum desses números já estiver em uso, use os próximos números livres. Ordem de execução: depois do item 266 e de todos os itens que já estão em andamento. Estes itens não bloqueiam nenhum outro.

Pedido: dono, 21/10/2026, 04h06 de Fortaleza: gerar coisas boas no Marktmorgen a partir de uma auditoria pública da Kit (ex-ConvertKit) feita pelo Copilot.

Lição principal da auditoria: a Kit não se vende como ferramenta de e-mail, e sim como plataforma para quem é dono de um negócio de criador ("The email platform for creator business owners", "Turn your audience insights into revenue"); cresce com plano gratuito, teste sem cartão, migração incluída e comparações ("Substack is built for publishing. Kit is built for business."); apresenta os planos como estágios do criador (Starting out, Growing creators e Scaling creators); e tem um sistema de indicação para a newsletter (SparkLoop) e o enriquecimento de dados dos assinantes (Subscriber Signals). Segundo a auditoria, o checkout e as vendas não são o centro da Kit. Fatos a conferir nas fontes oficiais, com a data da consulta: planos Free, Creator e Pro; "Save 17% yearly"; "14-day free trial", "No credit card required" e "Migration included"; o sistema de indicação de newsletter; o Subscriber Signals; e o Kit MCP.

O que já existe ou já está na fila e NÃO deve ser refeito (verifique antes): e-mails em massa com segmentos e etiquetas (lib/broadcasts.ts), automações e formulários (lib/forms.ts); sincronização com Kit, Mailchimp e Beehiiv (lib/email-sync.ts e lib/email-platforms.ts); lista de clientes que aceitaram contato para anúncios na Meta e no TikTok (lib/ad-audience.ts); produtos digitais, assinaturas, oferta extra, oferta depois do pagamento, combos, recuperação de checkout e afiliados; servidor MCP (com ações no item 258 [KJ3]); comparações e alternativas (238 [CF1]); guias de migração e importador de cursos (239 [CF2] e 260 [KJ5]); páginas por nicho (230 [HL11]); academia (221 [HL2]); casos reais (229 [HL10]); painéis de valor do comprador e de coortes (226 [HL7]); e automação recomendada a partir de um objetivo (227 [HL8]). Também não entram: plano gratuito (contraria a decisão do dono de 18/10/2026 de não mudar o número de planos e a margem mínima por cliente); teste grátis sem cartão (contraria o item 232 [CA1]); migração feita à mão pelo dono ("concierge"), pois tudo deve ser autoatendido; prova social com celebridades que não sejam clientes reais com autorização escrita; desconto promocional mantido em destaque de forma permanente, como "25% OFF PRO ANNUAL", que viraria urgência falsa; enriquecimento de dados de assinantes com informações de terceiros, que contraria a privacidade; calculadora de receita potencial; e consultoria feita à mão para grandes criadores. Ao executar o estudo do item 262 [KJ7] (divulgação entre lojas), considere também, sem alterar o texto daquele item, o modelo de recomendações entre criadores da Kit, em que um criador recomenda outros no momento da inscrição, sempre com o consentimento de quem se inscreve.

Regras: valem para estes itens todas as regras da seção SH (itens 204 a 214), sem exceção: verificar e reutilizar o que já existe; margem líquida mínima de 60% (ela pode ser maior, mas nunca menor) por cliente isolado, com 100% dos direitos usados no pior mês, e também no consolidado, depois de todos os custos e de todos os impostos, inclusive os brasileiros; custo desconhecido não pode ser considerado zero; leitura que der MAIS imposto; interruptor no código, desligado, quando o item criar recurso novo; proibição de criar contas, pagar qualquer valor, aceitar termos, pedir aprovações, ligar interruptores e alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a ou a revisão comercial; testes somente com fornecedores simulados; inglês americano, acessibilidade (WCAG 2.2 AAA como ponto de partida) e nenhuma afirmação sem fonte oficial datada. Nenhuma página pública pode mostrar recurso desligado.

267. [KT1] Indicação entre os seguidores do criador, com prêmios do próprio criador

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Permita que o criador ofereça aos inscritos na lista dele um link pessoal de indicação: quando amigos se inscrevem por esse link e confirmam o endereço, quem indicou avança em marcos definidos pelo criador (por exemplo, 3 indicações liberam um guia gratuito e 10 liberam um desconto num produto). Os prêmios são somente produtos, acessos ou cupons do próprio criador, entregues pelos mecanismos que já existem, sem dinheiro e sem custo novo para o Marktmorgen. Conte apenas inscrições com endereço confirmado (dupla confirmação), recuse autoindicação e endereços descartáveis, e proteja contra robôs com a proteção que já existe. Cada pessoa indicada dá o próprio consentimento para receber e-mails; quem indicou nunca recebe o endereço de quem foi indicado. Os e-mails de confirmação e de marcos contam na franquia de e-mails do plano. A política de privacidade e os termos devem dizer isso, e os textos entram em vigor junto com o recurso.

268. [KT2] Pontuação de interesse dos contatos, somente com dados do próprio criador

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Mostre ao criador, na lista de contatos, uma pontuação simples de interesse de cada contato, calculada somente com dados que a própria loja já tem e que o contato gerou ao se relacionar com ela (por exemplo, cliques em e-mails, visitas a páginas de produto quando houver consentimento, inscrição em brinde, compras anteriores e participação na comunidade), com a explicação de como cada ponto é ganho. Não use a abertura de e-mails como sinal principal (a proteção de privacidade do Apple Mail a torna pouco confiável), não compre nem busque dados de terceiros e não exiba nada que identifique o contato além do que ele mesmo forneceu. Permita criar segmentos a partir da pontuação. Calcule o custo de leitura e de armazenamento e mantenha os limites do plano. A política de privacidade deve dizer isso, e o texto entra em vigor junto com o recurso.

269. [KT3] Planos descritos pelo estágio do criador

Estado: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B. Registro de posição; os estados e provas históricos abaixo permanecem válidos.
Na página de preços e na página do item 245 [SP2], descreva cada plano pelo estágio do criador para quem ele foi pensado (por exemplo, Store para quem está começando, Studio para quem está crescendo e Scale para quem está ampliando o negócio), com os limites reais de lib/plan.ts ao lado, sem prometer resultado. Não altere preços, limites, nomes nem número de planos. Coordene com os itens 224 [HL5], 243 [CF6] e 266 [CI4], para que a mesma descrição apareça em todos os lugares.

Estado inicial de todos os itens: na fila.

Registro: somente inclusão documental. Dupla confirmação, privacidade das indicações, ausência de dinheiro e dados de terceiros, franquias reais de e-mail/armazenamento e todos os gates SH permanecem vinculantes. Sem conta, gasto, aceite, aprovação, operação externa, ativação ou mudança de preços/limites/nomes/número de planos. Não é entrega funcional.

### Registro operacional — 21/10/2026, 04h37 de Fortaleza

- Reconciliação de CI concluído: 537 execuções únicas, 1.561 jobs, 449.820 segundos (7.497 minutos de jobs). Acrescentadas 166 execuções/492 jobs/143.125 segundos à evidência anterior de 371 execuções, deduplicando por ID. Falhas e cancelamentos incluídos; execuções ativas/posteriores e execuções antigas fora do escopo continuam excluídas. Não somar novamente o delta separado do PR744, pois há sobreposição de IDs. Fonte local: `work/marktmorgen-ci-cost-20261021-0732.json`, preservada na continuidade. Duração não é fatura: custo faturado desconhecido continua desconhecido, nunca zero.
- Item203 permanece incompleto e desligado. PR751 corrigiu custeio e ciclo de exclusão do estado temporário, head95b6fac4c0a33cff3bb5ccf5d7ec2d7cff809660; suíte completa em andamento. A correção de navegação do PR750 passou no teste móvel, mas a suíte Firefox de9a3eb92f7d76917e5420fb33b21e371bf531472a reprovou HT2 por `target-size` em1280; nenhum critério removido. PR754 acrescenta identificação do alvo e geometria, sem afrouxar o teste; não é correção comprovada nem entrega funcional.
- Contador funcional permanece130, próximo131. Nenhuma incorporação/publicação nova declarada; preços, franquias, opt-in, PLANS_ON_SALE=false, comissão desligada e gates fiscais/comerciais preservados.

### Entrega funcional131 — produção confirmada em21/10/2026

PR751 incorporado em `2026-10-21T07:54:08Z` (**04h54m08s de Fortaleza**), commit `68c58efae971535befb8b49750c241fe7ccd311d`. As22 verificações passaram no head `95b6fac4c0a33cff3bb5ccf5d7ec2d7cff809660`; árvore prevista e efetiva iguais à testada: `75c3b7fe5806e052ee6aa87473ba2795a9ceb244`.

Mudança funcional: o SiteNav só acompanha cliques externos enquanto um painel está aberto, evitando trabalho desnecessário nos cliques das demais partes da página quando o menu já está fechado. Teste móvel e matrizes completas Chromium/Firefox/WebKit passaram sem descartar amostras ou reduzir critérios. A falha anterior de HT2 permanece no histórico; o head corrigido foi verificado integralmente.

Produção **READY** em `2026-10-21T07:55:00.476Z`, domínio `marktmorgen.com`, versão exata acima, deployment `dpl_CJBF7mTssFqA3YDjxecvYNMDmF9T`. Rotas `/`, `/platform`, `/pricing`, `/mission`, `/library`: HTTP200, todas identificando esse deployment. Logs error/fatal: nenhum no intervalo limitado `07:50:43.937Z–07:55:43.937Z`; não é garantia além desse intervalo.

Contador131 confirmado; próximo132. Os helpers de autorização do item203 também foram incorporados, mas **Teams continua desligado, sem conexão real e incompleto**: não é anunciado como recurso entregue. Sem novos pedidos de rede/armazenamento na correção de navegação; custeio do estado Teams permanece condicionado à integração real dos limites. Fatura de CI desconhecida não é zero. PLANS_ON_SALE=false, preços, limites, comissão desligada, consentimentos e gates fiscais/comerciais preservados. Pedidos252–270 continuam preservados nesta fila, pendentes de incorporação própria.

### Entrega funcional132 — produção confirmada em21/10/2026

PR755 incorporado às **05h27m31s de Fortaleza** (`2026-10-21T08:27:31Z`), commit `b3336be9a65542ffafec594f8b8996a6db155662`.22checks passaram no head `2073d49c74b71c9cc2972ebe7502eb7ec5f38eb4`; árvores prevista/efetiva iguais à testada `752f98cf86972517f25e91a4fe7d19a35b2845b7`. As três prévias do Studio (cadastro, apoio e contato) agora têm `role=group` compatível com o rótulo Preview. Preservados conteúdo dos criadores, amostras no idioma da loja, layout e salvamento. Os25casos Firefox não apresentam mais os três alvos antigos em `aria-prohibited-attr`; achados distintos e lacunas manuais continuam abertos, sem certificação AAA.

**READY** em `2026-10-21T08:28:30.520Z`, domínio `marktmorgen.com`, versão exata acima, deployment `dpl_6SicPfCwV4CJSG3RGAvLwQPLoefy`. Rotas `/`, `/platform`, `/pricing`, `/mission`, `/library`: HTTP200 com esse deployment. Logs error/fatal: nenhum apenas no intervalo `08:24:19.141Z–08:29:19.140Z`. Contador132, próximo133. Sem custo variável novo; fatura CI desconhecida não é zero.

Estado posterior: a fila consolidada de705e reprovou no WebKit público, job119111608666, `/pricing`390baseline, Tab10: cartão focado abaixo da viewport após5segundos (top911,78; altura206; viewport900; scrollY439). CSS do novo head torna rolagem nativa imediata durante `:focus-visible`, sem alterar eventos Tab, prazo, critérios ou contorno de foco. Hipótese de interferência de smooth scroll ainda exige nova verificação completa; não é correção comprovada. O mesmo pacote incorpora o ajuste de clareza/semântica de progresso do PR756 e todos os pedidos203–270. Nada desses ajustes pendentes incrementa o contador. Teams203 continua desligado/incompleto; preços, franquias, consentimentos e gates preservados.

### Registro de falha HT10 e sincronização do teste

A suíte completa WebKit de `76f4f3bb43db6f9e2da607d7248d7a6b748a4035`, job119121200592, reprovou em `08:46:06Z`: o teste HT10 em1280 leu zero visitas interceptadas onde exigia exatamente uma. Os controles GPC (recusa, limpeza do sim anterior, zero pedidos/eventos publicitários e zero escrita inesperada) passaram. A mensagem de GPC e o beacon sem cookies vêm de componentes com efeitos independentes; a presença da mensagem não comprova que a interceptação assíncrona do beacon terminou.

O novo head arma a espera da resposta204 da rota local estritamente validada **antes** de navegar e aguarda essa confirmação antes de ler a contagem. Continuam obrigatórios exatamente um beacon com campos permitidos, GPC prioritário, zero anúncios/eventos/escritas inesperadas. Sem mudar StoreBeacon, StorePixels, consentimentos, prazo padrão, cenários ou critérios. Não é reexecução isolada: nova suíte completa obrigatória; nenhuma entrega ou aprovação inferida do head reprovado.


### Registro operacional — publicação funcional 133 e Teams 203 (21/10/2026)

PR #753 incorporado em 21/10/2026 às 06:18:03 de Fortaleza (09:18:03Z), commit `423e3c783ddc6ce652c4809e81e82e402d961f32`. Head verificado `92fbf3e702f1c4e81148d57a198a724a0936753f`: 22/22 checks aprovados; árvore prevista e incorporada iguais à testada (`cd6bba017530492078e97b1f07fc3f0a4bfca1cf`). Publicação 133 READY às 09:19:09.782Z, domínio marktmorgen.com confirmado na versão exata, deployment `dpl_91aoyvk5DhE9y3fAuNpsRnz7iBPr`; /, /platform, /pricing, /mission e /library responderam 200 com o mesmo deployment. Logs error/fatal: zero somente na janela 09:14:40.275Z–09:19:40.275Z. Correções funcionais: rolagem nativa por teclado imediata e progresso de configuração com linguagem factual e semântica acessível. Testes sintéticos; nenhuma certificação AAA ou de margem.

PR #757: permissões e reservas de custo do Teams exigem confirmação booleana literal true; respostas desconhecidas e falhas de consulta recusam antes da operação. Cobertura sintética de respostas malformadas e consumo único. O head inicial falhou no TypeScript TS7022; corrigido com anotação explícita, sem remover asserções. Integração com a publicação 133 exige verificação completa no novo head. Teams continua incompleto, desconectado e com TEAMS_APPROVED=false; esta proteção inativa não é entrega funcional.

Custos CI: reconciliação local marktmorgen-ci-cost-20261021-0855.json cobre 636 execuções completas únicas, 1.862 jobs, 558.191 segundos; 99 execuções/301 jobs/108.371 segundos adicionais observados em relação ao snapshot 0732, sem somar novamente deltas sobrepostos. Duração não equivale a cobrança; fatura efetiva desconhecida, nunca zero. Sem novo provedor, dependência, armazenamento ou operação de produção nesta alteração. Todos os gates SH, PLANS_ON_SALE=false, preços, limites, opt-in e controles fiscais permanecem vinculantes.


### SH1/204 — catálogo interno em implementação (21/10/2026)

Projeção pura por lista explícita de campos públicos e testes sintéticos de privacidade, consentimento, disponibilidade desconhecida e URLs preparados. Sem endpoint, importação externa, checkout por agente ou integração ativada; AGENTIC_COMMERCE_APPROVED=false. Desenho, fontes oficiais consultadas em 21/10 e pendências em docs/agentic-commerce.md. Custos operacionais desconhecidos reprovam; sem novos custos de provedor nesta função pura. Item 204 continua incompleto. PR #757 incorporado às 06:47:58 de Fortaleza (09:47:58Z), commit 29e785f25d28323385d8e97a81d7ac9fbf26e8fe, 22/22 checks completos, árvore testada igual à incorporada; Teams permanece incompleto/desligado e não incrementa entrega funcional. Contador133 preservado.


### Registro operacional — publicação 134 e adaptador SH1/204 (21/10/2026)

PR #758 incorporado às 07:29:57 de Fortaleza (10:29:57Z), commit5b1bbec1154e1bd0a630d669a86ec49c6250ef21; head79946d54b3a5d8d7491aaea7e855ef7c5e3c3262 aprovado em22/22 checks, árvore prevista/incorporada igual à testada86209aebd1d76b9d2ba5de3045d02fb0e329c911. Publicação134 READY em21/10/2026 às10:31:01.242Z, marktmorgen.com na versão exata, deployment dpl_Cvc3V3YMpwr9U8U7dupFrzKYoBeZ. Cinco rotas /, /platform, /pricing, /mission e /library retornaram200 com esse deployment; zero error/fatal somente na janela10:27:06.944Z–10:32:06.943Z. Falha móvel anterior208ms preservada; correção por isolamento de hidratação da seção de planos passou as9amostras, com120/48/64ms na home e limite200ms inalterado. Nenhuma amostra descartada ou job isolado reexecutado.

Próximo incremento204: adaptador interno de lote parcial ACP2026-04-17, fonte canônica fixada7fdd78df677a94dce04c770644b0fbbb1401272b. Lista explícita de campos, IDs exportados com escopo da loja sem mudar IDs persistidos, limites24entradas/64.000bytes UTF-8, políticas HTTPS e estoque desconhecido recusado. Testes somente fictícios; sem endpoint/upload externo/checkout/ativação. Item204 incompleto, AGENTIC_COMMERCE_APPROVED=false. Custos operacionais desconhecidos continuam reprovando; função pura sem provedor, rede, armazenamento ou dependência nova. CI permanece custo da empresa com fatura desconhecida, não zero. SH/preços/limites/PLANS_ON_SALE/tax gate/art.9a/opt-in preservados.


### SH2/205 — reutilização de envio e proteção de confirmação (21/10/2026)

Frete regional, opções de preço e rastreio já existem; não serão refeitos. Revisão encontrou que markShipped prosseguia para e-mail após resposta de gravação diferente de null sem exigir confirmação OK. Correção exige OK literal antes do envio; falha de transporte ou confirmação desconhecida retorna erro existente e não envia. URLs de rastreio com credenciais são recusadas. Testes simulados cobrem respostas malformadas, falha de armazenamento, zero e-mails nesses casos e preservam o envio normal único. Nenhuma mensagem real, conta, pagamento ou operação externa. Sem novo provedor, dependência, armazenamento ou preço/limite; CI é custo da empresa, fatura desconhecida não é zero. Item205 continua incompleto quanto a SKU/estoque por combinação e devoluções; controles fiscais e SH preservados.

PR #759 incorporado em21/10/2026 às08:01:05 de Fortaleza (11:01:05Z), commitfb3aa98b2f9d6316cd554d5a4c3fa18eaabad2d1; headccd8ee400f2b69104ba308d5235595c9757da8fd aprovado22/22, árvore prevista/incorporada igual à testadacb6ca340a89b682c5c32cb35fa9feae23be6b281. Adaptador interno sem rota ou ativação, não é entrega funcional; contador134 preservado. READY e domínio na versão exata confirmados, deploymentdpl_FC29r8Y3KTTwsEGPogs6LuejPqUj.


### Registro operacional — publicação135 e aquisição de travas (21/10/2026)

PR #760 incorporado em21/10/2026 às08:25:07 de Fortaleza (11:25:07Z), commite71be3e865ef939c8f798a8f1e8eb616face2d55; head52320202ae992ea533f54d131a01ee9ebc170ea8 aprovado22/22, árvore prevista/incorporada igual à testada93afd54d47e64dca2e6c64f56f19cad64ded9c37. Publicação135 READY às11:26:19.264Z, domínio marktmorgen.com na versão exata, deploymentdpl_GYpyQYcsGDWGBwkpmNMWaztL8tdt. /, /platform, /pricing, /mission e /library responderam200 no mesmo deployment. Zero error/fatal somente na janela11:22:39.358Z–11:27:39.358Z. Aviso de envio exige OK de gravação; respostas desconhecidas/falha de armazenamento não enviam; rastreio não aceita credenciais. Testes fictícios, nenhum e-mail real.

Próxima proteção205: takeLock compartilhado e trava de estoque exigem confirmação OK literal; resposta desconhecida não autoriza propriedade nem abertura de checkout. Contenção null mantém comportamento existente. Testes simulados verificam rejeição, aquisição/liberação normal e zero abertura no estoque com respostas malformadas. Sem novos comandos/provedor/armazenamento/dependências ou alterações de preços/limites. CI segue custo da empresa com fatura desconhecida, não zero. Auditoria de expiração/fencing, leituras de estoque malformadas, variantes/SKU e devoluções permanece pendente; não declarar item205 completo ou atomicidade certificada. Gates SH/fiscais/opt-in preservados.


### Registro operacional — publicação 136 e leitura de estoque (21/10/2026)

PR #761 incorporado em 21/10/2026 às 09:03:04 de Fortaleza (12:03:04Z), commit `873d508c0d2c8a9cc52da5ca4672d8a1ec1ddf1a`; head `ae2ef1cb3170f7e9cd97ae781e6f457111ba0afb` aprovado em 22/22 checks. Árvore prevista/incorporada igual à testada `03390da998f447edd826acd687f1910e2bc1e941`. Publicação 136 READY às 12:04:13.316Z, domínio marktmorgen.com na versão exata, deployment `dpl_799ZqExQoa63HPAxFunZMZd7ApkC`. Cinco rotas /, /platform, /pricing, /mission e /library responderam 200 no mesmo deployment. Zero error/fatal somente na janela 11:59:45.258Z–12:04:45.258Z. Respostas desconhecidas não adquirem trava nem abrem checkout. Falha inicial TS7022 no teste corrigida com tipo explícito; verificação completa repetida no novo head, sem job isolado.

Próxima correção 205: leitura de holds inválida ou desconhecida não equivale a conjunto vazio. Respostas não-array, pares incompletos, IDs duplicados e registros JSON inválidos recusam antes de abrir checkout, com erro sanitizado. Testes fictícios cobrem respostas malformadas e zero aberturas, preservando estoque realmente vazio e hold pago. Sem novo comando, armazenamento, provedor ou dependência; fatura CI desconhecida, nunca zero. Preços, limites visíveis, conteúdo/idiomas/IDs, opt-in, PLANS_ON_SALE e gates fiscais/SH preservados. Expiração/fencing, SKU/estoque por combinação e devoluções continuam pendentes; item 205 não concluído.

Registro de investigação do PR #762 em 21/10/2026: o head 11308a3237d282228083da2cd248fa455e305728 falhou em Product action AAA Firefox (job 119212334545), após iniciar Firefox 142.0.1, passar a auditoria inicial e anexar um frame blank durante a criação sintética. A falha final é a asserção interna FrameManager.frameAttached, não apenas o erro DNS anterior de download. Diagnóstico limitado registra criação/inserção de iframe e pilha, sem remover cenário, frame, asserção ou navegador. Os relatos oficiais Playwright #22590/#23638 são antigos e não provam correção para esta execução; não foi adotada atualização especulativa. O novo head exige CI completo e não autoriza incorporação até solução e sucesso integral. Sem custo operacional novo; CI é custo da empresa, fatura desconhecida não equivale a zero. Contador permanece 136, próximo 137.

Correção concreta em verificação: prévia do cartão incorporado passa a abrir por botão explícito Show card preview, com estado expandido e controle persistente para ocultar; não carrega iframe nem inicia medição ao criar o primeiro produto. O fluxo sintético mantém criação, reload, publicação e vitrine, acrescentando abertura explícita e leitura da prévia antes das alterações de visibilidade; instrumentação temporária de createElement removida. O diagnóstico identificou BuyButtonEditor e a URL /embed da própria loja; o sucesso com instrumentação não foi considerado correção por si só. Para a amostra móvel inicial da home (208ms, limite 200ms, LCP1468ms, CLS0), limites e nove amostras preservados; cada cartão de plano ganha boundary de hidratação independente, mantendo conteúdo, preços e alternância mensal/anual. Checklist React aplicado: hooks no topo, efeito e timer limitado somente com prévia aberta, botão nativo com estado acessível, sem novos serviços. Reconciliação CI às12:24:20Z:714 execuções concluídas únicas,2094 jobs,633909 segundos por timestamps; delta78/232/75718 desde08:55, sem sobreposição. Fatura real permanece desconhecida, não zero; execuções ativas/posteriores e antigas não listadas excluídas. Ainda sem incorporação, nova execução completa obrigatória.

Integração para validação completa no PR #763: preserva os commits do PR #762 e acrescenta confirmação estrita de EVAL/renovação/escrita e ausência conhecida em lib/redis-lock.ts. O teste de fallback anterior falhou no job119218492159 por tratar EXISTS=0 como desconhecido, embora seja a ausência válida; loops de respostas de escrita e existência foram separados, preservando asserções e o caso normal com0. A falha Firefox do head antigo também exige incorporar a prévia sob demanda e o teste explícito. O novo head integrado deve passar integralmente, sem reexecutar job isolado. PR #762 passa a ser antecedente preservado; não incorporar ambos separadamente nem contar entrega duplicada. Fallback continua não atômico; item205 e gates permanecem incompletos. Sem novo comando/custo de operação; CI/fatura desconhecida não é zero.

Entrega funcional137 confirmada: PR #763, incluindo commits preservados do #762;22/22 verificações no head a4296ae89dbad9d69897d1814c4dab435a85d369, árvore db74ccfbc0c0c1c5ed688b17dd1731d82d06f9f6 igual antes/depois da incorporação. Merge e921d41f481497ef067f0e7e73b4127a9eca65f5 em21/10/2026 às10:12:01Fortaleza (13:12:01Z);READY13:13:04.611Z, marktmorgen.com versão exata, deployment dpl_3gtta1H47NvDcteeCV8G67kaV1oY. Cinco rotas /,/platform,/pricing,/mission,/library retornaram200 e mesmo deployment. Zero error/fatal somente na janela13:08:48.240Z–13:13:48.240Z deste deployment, sem garantia fora dela. Contador137, próximo138. Estoque/leases recusam respostas desconhecidas; prévia incorporada sob demanda com controle acessível; hidratação por cartão de plano. Falhas anteriores preservadas; nenhuma certificação AAA/dispositivo/INP de campo ou conclusão do item205. Sem comandos/dependências/provedor/armazenamento novo; custo real CI desconhecido, não zero.

Próxima correção do item205 em implementação: resposta desconhecida ou complete/unpaid da consulta do checkout não libera unidade. Somente expired explícito remove hold; pago continua vendido. Testes sintéticos substituem fetch e armazenamento integralmente; sem operação externa real e sem acréscimo de consultas/escritas máximas. CI remoto completo obrigatório antes de incorporação.

Entrega funcional138: PR #764, head72abcbfe8acdef0f413103d10370d540a541ea82, árvore1d8d50e4c1006eb93d7917267f1d56506eb3dadc igual antes/depois da incorporação;22/22 verificações. Merge52f16e038aec80352d74bdc5a8481518cd6cbeb9 em21/10/2026 às10:41:30Fortaleza (13:41:30Z). READY13:42:29.896Z, domínio marktmorgen.com na versão exata, deploymentdpl_431BPLYYpXuyRmZh1evMY2fG6FGa, cinco rotas/,/platform,/pricing,/mission,/library com200 e mesmo deployment. Zero error/fatal somente na janela13:38:49.318Z–13:43:49.318Z desse deployment. Respostas desconhecidas/complete-unpaid mantêm hold; só expired explícito libera unidade não paga. Contador138, próximo139; item205 incompleto. Sem consultas/comandos/armazenamento/dependências novos; faturaCI desconhecida não é zero.

Próxima correção205: produto limitado não pode abrir checkout sem identificador de estoque ou armazenamento configurado; indisponibilidade retorna busy e leitura não apresenta estoque integral como conhecido. Produto sem limite mantém fluxo existente. Testes sintéticos cobrem recusa antes de qualquer comando/open e caminho ilimitado normal. Sem novos comandos ou custo operacional; CI remoto completo obrigatório. Auditoria de lease/SKU continua em aberto e não foi certificada.

Entrega funcional139: PR #765;22/22 verificações no headde4f1bb7424a03da432c79461b7ef6caecd6fe5f; árvored280ab046a2364c9fe5e53977552d249ba4b74e1 igual antes/depois da incorporação. Merge520bb7a37674c8a0888faaa96b18d59480e71f3f em21/10/2026 às11:11:08Fortaleza (14:11:08Z). READY14:12:23.917Z, marktmorgen.com versão exata, deploymentdpl_8VuKLJwL1wDhW8yrmkihcA6r241F. Cinco rotas/,/platform,/pricing,/mission,/library retornaram200 e mesmo deployment; zero error/fatal somente na janela14:08:19.629Z–14:13:19.629Z. Produto limitado recusa estoque/configuração indisponível; ilimitado preservado. Contador139, próximo140; item205 incompleto. Sem comandos/provedor/armazenamento/dependências adicionais; faturaCI desconhecida não é zero.

Próxima correção205: não devolver checkout limitado como sucesso sem confirmação numérica0/1 de HSET da reserva. Respostas desconhecidas retornam busy; testes sintéticos mantêm os dois retornos normais e cobrem malformados, sem realizar pagamento ou consulta externa real. Sem comando extra ou custo de operação novo; CI completo obrigatório. A criação simulada precede a escrita, portanto isto não certifica atomicidade do lease nem resolve sua duração/ownership; a auditoria continua aberta.

Entrega funcional140: PR #766,22/22 verificações no head17b2414fb649dc0e7df8fa5092e55a6e9e8b64ca, árvore819664075d35201e88fd7e90a0371907229a209e igual antes/depois da incorporação. Merge3a65ae41057e48275443033b34567d50ae65e7a0 em21/10/2026 às11:36:36Fortaleza (14:36:36Z). READY do deployment final16:09:46.821Z, marktmorgen.com versão exata, dpl_FTUQvnVafkd3e81Li39cyyf96wYp; cinco rotas/,/platform,/pricing,/mission,/library200 e mesmo deployment. Zero error/fatal somente16:05:34.553Z–16:10:34.553Z. Uma checagem durante troca de alias mostrou IDs mistos e/mission404; repetição completa confirmou estabilidade. Publicação automática tardia dpl_ay2q92PMmAENcTctURUoo9ZtyA9F e build manual de recuperação compartilham o mesmoSHA: dois custos de build devem ser reconciliados, uma única entrega140. Rejeição inicial de catálogo do conector recuperada antes da criação. Fatura real CI/build desconhecida, não zero. Checkout limitado exige confirmação numérica0/1 da gravação da reserva. Contador140, próximo141.

Item205, SKU de produto físico em implementação: reutiliza ShippingEditor, rota e setter existentes; referência opcional de até64 unidadesUTF16, preservando caixa/Unicode e IDs de produto/preços. Cliente antigo que omite SKU preserva o valor; vazio explícito limpa; inválido recusa sem alterar envio; metadado opcional corrompido não transforma produto físico em digital. Testes de persistência, versões/preços, recusa e limpeza, sem fornecedor real. Não implementa ainda SKU/estoque por variante nem lease atômico.

Custo marginal máximo da referência: nenhum novo comando, chave, índice, consulta, tarefa, fornecedor ou dependência; SKU cabe dentro do limite existente MAX_PRODUCT_BYTES=256000, que continua aplicado a cada gravação, e não aumenta qualquer teto dos planos. Store69/690,Studio449/4490,Scale999/9990: acréscimo de teto mensal/anual de comandos0/0 e bytes0/0 em cada plano; isso não afirma fatura ou média reais iguais a zero. Sem mudança de preço/limite/reserva existente ou abertura de gate. O custo base, impostosBR/EUA e margem60% seguem na leitura mais onerosa; desconhecido reprova e PLANS_ON_SALE=false permanece.

Auditoria de lease205 aberta: valor constante1,expiração15s eDEL incondicional exigem correção com propriedade/fencing; fallbackGET+DEL não é atômico. Fontes oficiais consultadas21/10/2026: https://upstash.com/pricing/redis e https://upstash.com/blog/lua-scripting-on-upstash-redis-atomic-operations-over-http (23/06/2026). PAYG0.20USD/100milcomandos,storage0.25USD/GB,banda0.03USD/GB após franquia; franquia gratuita não presumida. Contagem faturada de comandos internosLua e reserva por plano ainda não demonstradas; nenhuma operação paga adicional ativada nem garantia de não sobre-venda certificada.

### PR 767 — mobile failure and correction candidate (2026-10-21)

Head `3ee5934217d3d6537236a85db9e83b8f9414e746`, job `119338097317`: first home sample interaction 248 ms exceeds unchanged 200 ms gate; LCP 960 ms, CLS 0. Other eight samples passed interaction at 32–80 ms. The document pointerdown handler spent 134.7 ms hydrating when the native plan-perks summary was pressed. Candidate correction gives the initially closed itemized list its own Suspense boundary, inside each existing card boundary, so pressing the summary need not hydrate every hidden perk first. All wording, limits, prices, native keyboard behavior and existing measurements remain. This is a diagnosis/candidate, not a passing performance claim. Full remote verification is required on the new head; no isolated job rerun or discarded sample. No added runtime service, dependency, request or storage; monthly/annual incremental operation ceilings remain unchanged for all plans, actual invoices/taxes unknown and opening remains closed.

### PR 767 — Firefox journey target correction candidate (2026-10-21)

Corrected head `e3f12155a263c5fe801161c73ce94313043bb72d`: all nine unchanged mobile samples pass (home interaction144/56/64ms, pricing32/32/32ms, sales32/40/32ms; CLS0), but full Firefox job `119342999492` fails HT2 journey accessibility1280: course link partially obscured, safe height13.6px despite44px layout height. Audit runs after keyboard/anchor navigation with sticky navigation present. Candidate adds128px scroll margin to existing journey links so focus/scroll-into-view can place the whole target below the sticky header. No wording, route, IDs, prices, limits or test expectations changed. Full verification required again on the new head; no isolated rerun or AAA certification. CSS-only change adds no runtime requests, provider, dependency or cost ceiling; invoices remain unknown rather than zero, paid opening stays closed.

### Item 205 — physical variant SKU implementation and PR 767 verification (2026-10-21)

PR767 merged as `10adc57805149352a770dcc9986d5c1754bf9a4f` at2026-10-21T17:13:24Z /14:13:24 Fortaleza after22/22 checks on `ae6caf2cc9ecb9d6b2375d25bde7f22da73e1108`; predicted and actual tree `3d1492ef2c9dda1ef1b848af77547eaf8e3cee9b` match. Shipping42checks pass. Latest mobile home120/72/80ms, pricing40/40/40ms, sales40/48/40ms; all9CLS0 and unchanged200ms gate. Firefox HT2 passes390/1280 after scroll-margin correction; original failures retained. Delivery141 confirmed: automatic production `dpl_ArXUnrD28n9aWbScvp7DGvAZVVWg` READY2026-10-21T17:15:22.998Z /14:15:22.998Fortaleza, exact SHA `10adc57805149352a770dcc9986d5c1754bf9a4f` on marktmorgen.com. `/`, `/platform`, `/pricing`, `/mission`, `/library` all200 with that same DPL. Error/fatal logs0 only for2026-10-21T17:12:20.754Z→17:17:20.754Z on this deployment. Count140→141,next142; one automatic production build, actual invoice unknown. Published base physical SKU and two public-page fixes, no completion claim for variant stock or item205.

Next implementation on `codex/physical-variant-sku`: optional64character SKU per physical size/version in the existing option editor/API/store/schema. Adds preserve case/Unicode, existing edits without the field preserve it, explicitempty clears it, invalid input refuses the whole write, malformed optional stored metadata keeps the option, digital options reject physical SKU. IDs, prices and checkout choice remain server-owned and unchanged. No per-variant stock quantity or atomic inventory guarantee is claimed; item205 remains incomplete. Synthetic shipping integration covers these paths; full remote new-head CI required, no local execution.

Cost admission: same existing256000byte product cap and50option cap, no increased plan storage ceiling, no new key/index/provider/dependency/commands. Store69/690,Studio449/4490,Scale999/9990 remain; maximum incremental monthly/annual command/storage ceilings0/0 for each plan, not actualinvoice0. Extra optional metadata occupies the already capped record. PLANS_ON_SALE=false; unknown base invoices and Brazil/US taxes still fail opening, per-client100%rights worstmonth and global60%net rules unchanged.

CI duration reconciliation: evidence `work/marktmorgen-ci-cost-20261021-1710.json` contains781uniquecompletedruns,2297jobs,708238seconds,0unknownjobdurations; delta67runs/203jobs/74329seconds from1223record. Deduplicated latest100canonicalruns against714priorruns, includes failed/canceled, excludes active/unlisted/later runs. Duration is not a paid invoice; actualcharges remain unknown, not zero. Both delivery140 builds remain chargeable provenance pending invoice reconciliation.

### Entrega funcional142 — SKU por variante física (21/10/2026)

PR768 incorporado em2026-10-21T17:43:40Z /14:43:40Fortaleza como `ed74dff71459da67395c0d135738171c9901674d`, após22/22 verificações no head `a8be195ccfb2ad724694783d2f7c752a1363d90d`. Árvores prevista e real `4c0cfe157df5a8ecf58d5f63e50da46a0acd136a` idênticas. Publicação automática `dpl_AVC2YzgGTEe5T55vv2hxrLYtUEGt` READY2026-10-21T17:45:28.276Z /14:45:28.276Fortaleza, domínio marktmorgen.com na versão exata. Cinco rotas `/`, `/platform`, `/pricing`, `/mission`, `/library` HTTP200 e mesmoDPL. Logs error/fatal0 somente na janela2026-10-21T17:42:02.407Z→17:47:02.407Z desta publicação. Contador141→142, próximo143; aviso142 já enviado.

Inclui SKU opcional por tamanho/versão física no editor/API/registro, preservação deIDs/caixa/Unicode/edições antigas, limpeza explícita e recusa integral de entrada inválida/SKU em opção digital. Sem novaschaves/índices/comandos/fornecedores/dependências ou tetos de registro/plano; custos reais de fatura/impostos seguem desconhecidos, nãozero. Quantidades porvariante e reserva atômica continuam incompletas noitem205; nenhuma certificação de margem/AAA/INP de campo. Esta seçãoSEO posterior somente registra o pedido do dono, sem iniciar a auditoria ou alterar a entrega142.

### PR769 — Buyer WebKit prefetch failure and correction candidate (21/10/2026)

Integrated head `bb8f1bdc790eb698aa557eca60749dd1d0fa726e`, Buyer action WebKit job119385412412:25cases125audits,1failure at320px text-spacing, observed inbuyer-orders. Pageerror contains canceled/access-control RSC fetches for `/mission` twice and `/` once;foreign0, only the expected synthetic checkoutPOST. These errors are accumulated over the library journey, so the final phase does not prove orders page origin. The library renders SiteNav; its always-visible preview/mission and home/logo links still automatically prefetched those exact destinations. Candidate sets prefetch=false on those two links, preserving click navigation, labels, URLs and keyboard behavior while avoiding speculative marketing fetches during buyer recovery. Tests retain every case/assertion and error capture; no ignored errors, no rerun-only approval. Full remote CI required on new head. This runtime correction changes PR769 from documentation-only to mixed runtime+queue; count only after22checks and exact production proof. No new requests/provider/dependency or cost ceiling; two speculative fetches removed, actual invoice/cost unknown notzero; all commercial/tax/opt-in/language gates preserved.

### Item205 — confirmação de envio baseada em evidência; prova da entrega143 (21/10/2026)

Implementação em `codex/shipment-confirmation-proof`: claimNX ocupado sem registro anterior legível deixa de fabricar sucesso; leitura deenvio exige timestamp inteiro seguro positivo representável emDate e trackingHTTPS sem credenciais ou vazio, com shape explícito. Parser compartilhado puro/browser-safe preserva regras deURL existentes; UI requer HTTPok, ok===true, registroválido, emailedboolean e ausência deerrorcontraditório. Texto não afirma que comprador foi avisado quando emailnãofoiconfirmado. Nenhum envio adicional, nenhuma tentativa deresend, nenhuma chamada/chave/TTL/fornecedor/dependênciateto nova. Testes sintéticos exercitam markShipped real com claimsocupados e leituras ausentes/corrompidas, preservação do registroanterior e zeroemailsnovos; provasdeUI recusam repliesdesconhecidas/contraditórias. FullremoteCI no novohead obrigatória, sem execuçãolocal ou fornecedorreal.

Custeio: mesmos comandos existentes SET+GET no claimocupado, mesmoGET aoStripe e contrato deemailonce; Store69/690,Studio449/4490,Scale999/9990 preservados. Incremento máximo deoperações/registro por plano mensal/anual0/0, nãofatura0; todas as faturas/impostos desconhecidos seguemreprovados paraabertura. PLANS_ON_SALE=false e limites/opt-in/idiomas/IDs/taxgate/art.9a/comissão preservados. Item205 ainda incompleto; esta correção não atesta estoqueatômico.

Reservaowned/atômica doestoque: aguardando odono somente quanto a custeioespecífico dofornecedor/reservaoperacional. Evidência deauditoria desde2026-10-21T16:12Z (>2h): lockconstante1/15s e DELincondicional; checkoutantesdeHSET podepermanecerpagável semreserva confirmada; fallbackGET+DEL nãoéatômico. Fontes oficiais Upstash pricing/redis,docs/redis/features/restapi,blog/lua-scripting-on-upstash-redis-atomic-operations-over-http nãoresolveram cobrança denestedLua/contrato efetivo; desconhecido nãoézero. Nãoativar novasoperações sem cálculo porplano/teto/reserva. Avançam correções deenvio semnovoscustos; não tratar o defeito deconcorrência como resolvido.

Entrega143 já publicada/avisada: PR769 merge `ab77e69f83800c0accf2932cca9913c7869c1f46` em2026-10-21T18:22:45Z /15:22:45Fortaleza, headvalidado `851c8876086cb206b3fbeeaa3fef132ebd0bd972`,22/22checks, árvoreprevista/real `85010eb43ea890ff384342f3874e4cc8f1ea45f8`. DPL `dpl_E1urrjcKrZWYqQTmMvC8WuUJZeL2` READY2026-10-21T18:23:50.047Z /15:23:50.047Fortaleza; marktmorgen.com naversãoexata, cinco rotas `/`,`/platform`,`/pricing`,`/mission`,`/library`200mesmoDPL. Error/fatal0 apenas18:19:25.350Z→18:24:25.350Z. Contador142→143,próximo144. Funcional: navegação home/mission semprefetchespeculativo durantebiblioteca; SEO271/Gmail072 são fila, nãoauditoriaexecutada nem outraentrega.

### Correção da verificação integral do PR770 — 21/10/2026

O head46adc59e178f40a86bbd48c1cb4442d0410a2be6 teve21/22 verificações aprovadas e falhou no WebKit (job119409056229): HT2,1280px, target-size do link Course access com11,8px visíveis durante a navegação suave ao catálogo. O teste aguardava hash/foco, que mudam antes do término da animação, e auditava o caminho intermediário sob o cabeçalho. A correção aguarda oito quadros consecutivos estáveis, com o destino inteiro visível e abaixo dos64px do cabeçalho, com prazo5s e nova asserção obrigatória; mantém a animação real, todos os nós/regras e o limite24px. Nenhuma regra ignorada nem rerun isolado: verificação completa no novo head. Sem alteração de chamadas, preços, limites, permissões, provedores ou custo operacional mensal/anual por plano (incremento0/0); custo efetivo de CI continua desconhecido, não zero. Não é publicação.

### Entrega144 confirmada e continuação do item205 — 21/10/2026

PR770 incorporado em21/10/2026 às16:25:11 de Fortaleza (19:25:11Z), merge c5d59a624a7a53b64e89b339b85fba776e3c2f8f, após22/22 verificações completas no head e6ccfa2cdd278b6f2cb90cf0c300d4a690027a39. Árvore prevista e real a8b9619a224fc8f79fb1ddde77ac8fd4f49d844c iguais à testada. Produção dpl_7yubkA2i85Jb2AWHaimjabYTeii6 READY19:26:44.837Z, domínio marktmorgen.com no SHA exato e cinco rotas /,/platform,/pricing,/mission,/library HTTP200 com o mesmo deployment. Janela delimitada19:22:15.097Z–19:27:15.097Z sem logs error/fatal; não é prova ilimitada. Entrega144 já avisada; próxima145. Registro de envio exige evidência válida; claim ocupado ilegível não fabrica sucesso; UI distingue e-mail novo confirmado de ausência dessa confirmação. Falha WebKit anterior e correção da espera da animação permanecem acima no histórico.

Continuação concreta: enquanto a confirmação de envio está pendente, travar também o campo de tracking e anunciar aria-busy no formulário; se a resposta se perder, orientar conferir o estado antes de repetir. Nova matriz sintética no navegador em390/1280 cobre respostas contraditórias/inválidas, HTTP500, JSON inválido, resposta perdida, recusas e confirmação com/sem e-mail. Todos os POSTs interceptados; fixture só no serviço local, sem checkout ou pagamento submetido nem e-mail real. Verificação completa remota obrigatória; sem execução local.

Custos: mesmos comandos, fornecedores, chaves, TTLs e limites; nenhum aumento de teto operacional mensal/anual por plano (incremento0/0, não fatura zero). CI e publicação efetivos têm custos ainda desconhecidos. PLANS_ON_SALE=false, preços, limites visíveis, opt-in e gates fiscais permanecem. SKU histórico por pedido segue em auditoria de envelope de campos/bytes antes de qualquer nova operação; não inferir custo zero só de não adicionar chamadas. Quantidades por variante e reserva atômica continuam não concluídas.

### Correção integral após falha do comprador no WebKit — PR771

Head51e9d41c916f8e0a3a58d30b77cfb4fdac606f51, job119440695820:25casos/125auditorias, uma falha no320px baseline por duas requisições especulativas /privacy?_rsc com erro de access-control/cancelamento acumulado na navegação; foreign=0 e somente os POSTs sintéticos esperados de checkout/library. O link /privacy#library da biblioteca ainda iniciava prefetch automático (o rodapé já não o fazia). Desativado apenas esse prefetch; href, clique, foco e conteúdo preservados. Não ignorar pageerrors nem retirar casos: verificação completa de novo head, sem rerun isolado. Sem chamada adicional, fornecedor ou teto novo; custos efetivos de CI desconhecidos.

### Fixture de pedidos existentes corrigida — PR771

A verificação integral do head a0c895165c449cea8bf5022617056d5632a76253 falhou no job119443885469 antes de qualquer POST de envio: campo de tracking ausente. O harness configurava somente STRIPE_DEMO_SECRET_KEY; listSales exige platformKey configurada e devolvia unavailable antes de ler a venda sintética. Acrescentada somente no processo de teste a chave falsa sk_test_local_only_a_stand_in_0000; STRIPE_CONNECT_API_BASE continua no serviço127.0.0.1. Nenhuma chave real, mudança do gate de produção ou submissão externa. A matriz agora também exige explicitamente a linha sintética antes de operar os controles. Exigir novamente todos os checks no novo head, sem remover casos.

### Nova verificação integral — recusa contraditória e evidência de operações no teste

Head7d2beff76aad59a2d3fb8033742b709e2c3f3325, job119453402625: a fixture passou a mostrar o pedido e executar os controles. Uma resposta contraditória com ok=true/error=unknown era recusada corretamente, porém a UI exibia o motivo específico em vez da incerteza; agora motivo específico exige ok=false exato. A matriz mira o texto no live region do toast, evitando ambiguidade com a cópia visual aria-hidden, sem deixar de verificar o texto anunciado. O teste fiscal detectou dois POSTs após configurar a chave falsa no harness; causa ainda não estabelecida, mantém a asserção zero, bloqueia operações não-GET em /api e registra os caminhos para diagnóstico. Não marcar resolvido até evidência completa. Nova execução integral obrigatória; sem redução de regras, casos ou exigências.

### Causa confirmada dos POSTs e correção — PR771

Job119463059222, head32d687b3737006211394cbe2571220575a7e5ce1: TAX_SCOPE_UNEXPECTED_WRITES mostrou /api/store/discount duas vezes (uma por viewport). DiscountEditor executava action=list no useEffect ao montar; esse endpoint também reconcilia o bit hasDiscounts, portanto abrir configurações podia causar escrita e chamada a Stripe. Agora requer Load discount codes explícito, depois Refresh discount codes, com botão bloqueado e aria-busy enquanto aguarda. Criar/desativar códigos continua na ação do dono. A asserção fiscal zeroPOST permanece; acrescentada prova positiva de que uma ação explícita manda exatamente {action:list} uma vez e exibe estado carregado. Sem novas chamadas/fornecedores/tetos: remove trabalho automático, reutiliza operação existente.

A matriz de envio já confirmou os casos negativos e confirmação sem e-mail; falhava na segunda confirmação porque page.goto da mesma URL com fragmento preservava o estado concluído. Cada caso agora usa parâmetro sintético distinto, forçando uma nova leitura real; nenhum caso removido. Verificação integral no novo head é obrigatória, sem rerun isolado.

Apuração de CI em21/10/2026 às20:16:12.911Z:858execuções concluídas únicas,2528jobs,786498segundos,0durações desconhecidas; delta77execuções/231jobs/78260segundos desde a evidência781/2297/708238. Inclui falhas/cancelamentos, exclui ativos/posteriores/não listados; duração não é fatura, cobrança real desconhecida. Arquivo local marktmorgen-ci-cost-20261021-2020.json e continuidade preservam evidência. Gates fiscais/comerciais e limites permanecem.

### Entrega145 confirmada e validação das respostas de desconto — 21/10/2026

PR771 incorporado em21/10/2026 às18:03:14 de Fortaleza (21:03:14Z), merge1495002f30fc5b265733dc34ef88de71675ced7e, após22/22 checks no headc06d59e80e6c0a7dcf1f5e140f08a13960101eda; árvores prevista/real/testada f464116b4b95c67a97ec26e598c1b9722be373a8 iguais. Produção dpl_J6w83rG4S5wThJKgzmUDfYWKAgjr READY21:04:22.125Z, marktmorgen.com no SHA exato, cinco rotas /,/platform,/pricing,/mission,/library HTTP200 com mesmo deployment. Logs error/fatal ausentes somente na janela delimitada20:59:57.794Z–21:04:57.794Z. Entrega145 avisada, próxima146. Carregamento de descontos agora explícito; campo de envio bloqueado durante confirmação; respostas perdidas/contraditórias incertas; prefetch de privacidade da biblioteca desativado. Todas as falhas/correções anteriores preservadas acima.

Próxima correção concreta: DiscountEditor.send aceitava ok truthy sem HTTP bem-sucedido e convertia codes ausente em lista vazia, além de indexar erros herdados. Novo leitor compartilhado exige HTTPok, ok=true exato, codes=array de registros próprios válidos e sem erro contraditório/IDs duplicados; preserva identificadores, grafia dos códigos do criador, percentuais fracionários e códigos externos sem detalhes. Lista ilegível não apaga a lista conhecida nem confirma sucesso. Motivos específicos só com ok=false e propriedades próprias, transporte desconhecido orienta conferir antes de repetir. Testes negativos/positivos do leitor e matriz real de navegador390/1280 com todos os POSTs interceptados; nenhum código enviado ao Stripe, cobrança ou e-mail real. Verificação completa remota antes de incorporar; execução local não usada.

Custos operacionais: mesmas chamadas, fornecedores, chaves, TTLs e limites; máximo mensal/anual incremental por plano0/0, não fatura0. Preços Store69/690,Studio449/4490,Scale999/9990 e limites visíveis/opt-in/idiomas/IDs preservados. PLANS_ON_SALE=false e gates fiscais/margem/comissão permanecem. Item205 SKU histórico/quantidades por variante/reserva atômica continuam incompletos; esta correção não certifica margem ou atomicidade.

### Leitura da lista de descontos do provedor — correção independente

Auditoria após a entrega145: listCodes convertia data ausente/não-array em [] com state=ok e descartava silenciosamente linhas semID/código. A rota usa essa lista para reconciliar hasDiscounts, portanto uma resposta ilegível podia esconder o campo de código no checkout. Próxima correção em branch própria: exigir data próprio=array e todas as linhas legíveis comIDs únicos antes de permitir reconciliação. Lista vazia explícita continua válida; IDs/grafia/percentuais do criador preservados. Testes substituem fetch integralmente, exigem origem127.0.0.1 e cobrem resposta ilegível, linha parcial, duplicatas, vazio explícito, registro válido e erroHTTP. Nenhuma requisição/fornecedor/chave/TTL/teto novo; incremento máximo operacional mensal/anual por plano0/0, não fatura0. Sem Stripe real, conta, pagamento ou e-mail. CI remoto completo necessário; PR772 de confirmação no navegador continua independente e deve ser integrado explicitamente antes da incorporação se main avançar. Gates/preços/limites/opt-in preservados.

Verificação PR773 em 2026-10-21: o job119493398832 reprovou somente a comparação do objeto válido porque o helper de testes compara JSON com ordem de propriedades; valores e preservação estavam corretos. Corrigida a asserção com igualdade profunda estrutural, mantendo todos os casos e campos. Nova verificação completa obrigatória no novo head; nenhum job isolado reexecutado. Sem publicação ou incremento do contador.

Integração explícita do PR772 incorporado em21/10/2026 às18:31:37 de Fortaleza (21:31:37Z), mergefb43f43cd5e91535e9d06bc0cde1f377e6261515, com22/22 checks e árvore real igual à testada a9e0eb972c8c90712a68a039ad0f1b5ba13f3b93. PR773 preserva as duas correções e exige nova verificação integral no head combinado. Publicação ainda em confirmação; contador145 inalterado.

Entrega146 confirmada: PR772 incorporado21/10/2026 às18:31:37Fortaleza (21:31:37Z), mergefb43f43cd5e91535e9d06bc0cde1f377e6261515,22/22 checks no head8fc22af1136125d006322fa9d650ad0c044d0229, árvore prevista/real/testada a9e0eb972c8c90712a68a039ad0f1b5ba13f3b93 iguais. Produção dpl_Aqojs139N48dpb1YgsHzbFRnPCD8 READY21:32:41.807Z, domínio marktmorgen.com no SHA exato, cinco rotas200/mesmoDPL; logs error/fatal0 somente na janela21:28:15.584Z–21:33:15.584Z. Confirmação de descontos exige resposta legível/HTTPválido antes de substituir códigos conhecidos; testes sintéticos390/1280 e suitecompleta. Sem incremento operacional mensal/anual por plano; cobrança realCI/deploy desconhecida, não zero. Contador146, próxima147. Publicação anunciada; próxima atualização de fila deve preservar esta evidência.

Entrega147: PR773 merge2cc72957b9a388b0dfe0d7d785017ac62c17feae em21/10/2026 às19:00:03Fortaleza (22:00:03Z),22/22 no head combinado4139dd066f13e0d01e3d26ded70c3c6b98e915fc, árvore954f9f2c67b4a0a1be8d9a49deb73a444270c902 prevista/real/testada iguais. Produção dpl_HzYSw7c9KgB8K4HNMY3P1iT5BqcF READY22:01:24.774Z; domínio exato e5rotas200mesmoDPL; error/fatal0somente21:57:19.256Z–22:02:19.256Z. Resposta parcial/ilegível do provedor não desliga campo de desconto; vazio explícito válido, grafia/IDs preservados. Incremento teto operacional mensal/anual0/0porplano; CI/deploy reais desconhecidos. Contador147próxima148. Registrar na próxima mudança necessária da fila, sem reiniciar CI saudável só por documento.

### Confirmação da desativação de códigos — próxima correção concreta

stopCode considerava qualquer respostaHTTP2xx prova de desativação, mesmo semID/active ou com outro código. Exigir ID próprio igual ao solicitado, active próprio=false booleano e ausência de error contraditório antes de confirmar. Respostas parciais/ilegíveis permanecem erro; sem nova chamada ou repetição automática. Testes sintéticos cobrem nove respostas inválidas, confirmação exata e HTTP500, verificando método/corpo/alvo e uma chamada por tentativa. PreservaIDs, grafia, opt-in, preços, limites e PLANS_ON_SALE=false. Sem mudança de fornecedor/chaves/TTL/tetos e incremento máximo operacional mensal/anual por plano0/0; custos reaisCI/deploy desconhecidos, não zero. Verificação remota integral obrigatória, sem execução local.

### Verificação integral PR774 — hidratação do carregamento explícito

Job119512455236 no head143290c9385af409e03bfbfa696584274133b211:21/22 checks aprovados; WebKit aguardou KEPT20 após o primeiro clique em Load discount codes390px, sem chegar à matriz negativa. Os demais navegadores passaram. O botão era habilitado no HTML antes de o componente montar seus handlers; agora permanece desabilitado até o efeito local de montagem, sem requisição automática ou retry. A matriz permanece inteira e a nova versão exige novamente todos os checks; se falhar, investigar evidência adicional em vez de declarar causa encerrada. Sem publicação/contador ou aumento de chamadas/tetos.

PR774, job119524421731: lint recusou setState síncrono no efeito de montagem. Substituído pelo contrato SSR/client de useSyncExternalStore, com funções estáveis e sem escrita em efeito. Gate de hidratação preservado; nova verificação integral em novo head, sem supressão da regra ou rerun isolado.

### Confirmação das configurações de frete — continuação205

ShippingEditor aceitava ok truthy semHTTPválido nem evidência do produto/frete e dizia Nothing was saved após perda de resposta. Agora exige confirmação própria/exata e frete normalizado igual ao enviado (ou null explícito ao parar), preserva escolhas e orienta conferir o estado quando incerto. Campos, cancelamento e troca ficam bloqueados enquanto há envio; formulário anuncia aria-busy. Testes puros cobrem corpo incompleto/contraditório, produto divergente, valor/SKU divergente,HTTPfalho, sucesso e remoção explícita. Sem nova chamada, fornecedor, chave,TTL ou teto; incremento máximo operacional mensal/anual por plano0/0, custos reaisCI/deploy desconhecidos. Preserva preços/limites/opt-in/gates eSKUUnicodeIDs. Branch independente de774, deve integrar774 explicitamente se main avançar e repetirCIcompleto. Nenhuma operação real/conta/pagamento/email/teste local. Ainda não é entrega funcional.

Integração explícita do PR774 merge d654f8d2290ef572c7afebbb8cd4d56c8d8fc58d em21/10/2026 às20:02:37Fortaleza (23:02:37Z),22/22 checks no head156860f95303695ec99fd6fd5ebb3fea4cbedec8; árvore prevista/real/testada36306c3a93984fd32745416fdd416b39e24d50ae iguais. Todas as correções e históricos de falha preservados; PR775 exige nova verificação integral no head combinado. Publicação774 ainda em confirmação, contador147.

Entrega148 confirmada: PR774 merge d654f8d2290ef572c7afebbb8cd4d56c8d8fc58d em21/10/2026 às20:02:37Fortaleza(23:02:37Z),22/22checks no head156860f95303695ec99fd6fd5ebb3fea4cbedec8, árvore36306c3a93984fd32745416fdd416b39e24d50ae prevista/real/testada iguais. Produção dpl_4L61LVkXeTVQG1WtFzfeTdC55FzG READY23:03:48.884Z, domínio marktmorgen.com SHAexato,5rotas200mesmoDPL; error/fatal0 somente22:59:25.730Z–23:04:25.729Z. Desativação exigeIDigual/activefalse; botãoLoadaguarda hidratação. Histórico de falhas preservado. Incrementotetooperacionalmensal/anual0/0porplano,custosreaisCI/deploydesconhecidos. Contador148,próxima149; registrar próxima mudança necessária da fila semreiniciarCI saudável só por documento.

Entrega149 confirmada: PR775 merge d1d3656b350cd7d11552fd396ec357e62602321a em21/10/2026 às20:30:43Fortaleza(23:30:43Z),22/22 no head integrado6e9a40241820b211446550dd57a09946f06acd8d; árvore20a2225fc30995b44f913920932c75edf4f5b151 prevista/real/testada iguais. Produção dpl_AgmDF6Z9xsF35syvErz6QNPHBzjH READY23:31:48.939Z, domínioSHAexato,5rotas200mesmoDPL; error/fatal0somente23:27:55.595Z–23:32:55.595Z. Frete salvo exigeproduto/fatosiguais; incerteza preservaescolhas; bloqueiocampos/cancelamento pendente. Incrementotetomensal/anual0/0porplano,custosreaisCI/deploydesconhecidos. Contador149próxima150; registrar na próxima mudança necessária da fila.

### Frete gratuito só por instrução explícita — continuação205

A rota de frete convertia price ausente/não-string em texto vazio e depois zero: corpo parcial com região podia substituir cobrança existente por frete grátis. Novo leitor exige objeto/campo próprio price string no limite12 e região própria reconhecida; null explícito continua removendo frete, vazio/0 explícitos continuam grátis. SKU omitido mantém compatibilidade de preservação; vazio explícito limpa; Unicode/IDs preservados. Leitura falha antes de setProductShipping, sem comando/chamada extra. Testes sintéticos de corpos incompletos, tipos inválidos, destinos, valores pagos/grátis, remoção eSKU. Mesmo limite8kdaAPI,mesmaschaves/TTL/fornecedores/tetos: incremento máximo operacional mensal/anual0/0porplano; custosCI/deployreaisdesconhecidos,nãozero. Todos os gates/preços/limites/opt-in preservados. CIremotocompleto obrigatório, sem testes locais ou submissão externa.

Entrega150 confirmada: PR776 merge8f436801eaec0c948e7998ddaf02e56ea35c1164 em21/10/2026 às21:02:36Fortaleza(22/10/202600:02:36Z),22/22head9f6ca911966a33cbca418ce4e170e88b0092a2d0; árvore005690cefa81a7930bfb0419ec8e4326266b1a64 prevista/real/testada iguais. Produção dpl_EWZwRhU9CUAX1bUiDoLyJWZFkwsu READY22/10/202600:03:45.323Z,domínioSHAexato,5rotas200mesmoDPL,error/fatal0somente00:00:27.961Z–00:05:27.961Z. Corpo incompleto não transforma frete existente emzero; preço/destino explícitos, grátis/null/SKUomitidocompatíveis. Semnovoscomandos/tetos,incrementomáximomensal/anual0/0porplano,custosreaisCI/deploydesconhecidos. Contador150próxima151; próxima mudança necessária da fila preserva evidência.

### Prova sintética do editor de frete em navegadores

Matriz adicional no navegador390/1280 usa uma loja/produto físicos locais exclusivos, sem alterar fixtures de conteúdo dos criadores. Intercepta todoPOST, segura a resposta para conferir aria-busy/campos eCancelbloqueados e testaHTTP500,oktruthy,produtodiferente,frete0divergente,camposausentes,errocontraditório,JSONinválido,respostaperdida econfirmaçãoexata. VerificaSKU/preço preservados,nenhumaescritaalheia eumaúnicachamadaporcaso. Nenhumaoperaçãoexterna/pagamento/email. É prova adicional daentrega149,não nova entrega funcional. Mesmoslimites/custosoperacionais; CIrealdesconhecido,nãozero. Verificação remota completa exigida.

### Falha WebKit PR777 antes da matriz de frete

Job119559473143 no head339221736df63b8fb87031f79885f20d4424d72a: checkPixelAttributionCenter clicou Change pixels390px, mas formulário Meta Pixel ID não apareceu. Esse botão também era habilitado noHTMLantesdoshandlersclientes. Agora usa o mesmo snapshot estável SSR/client de prontidão que já passou no editor de descontos, sem efeito comsetState/requisição/retry. Provas completas de pixels/consentimento/GPC e frete permanecem; nova verificação integral em novo head. Diagnóstico será confirmado pelo resultado, não assumido concluído. O escopo agora inclui correção funcional do botão de pixels; só contar entrega apósCI/produção/domínio exatos, nunca pelos testes adicionados. Sem novo fornecedor/chamada/teto ou ativação de pixels/consentimento.

PR777 job119565105241: a matriz chegou ao formulário de frete, mas o seletor de teste getByLabel Ships to exact não encontrou o select aninhado em label com opções textuais. Usar o único combobox do formulário já delimitado peloSKU/produto, preservando escolha na e todas as asserções/casos. Sem alteração da interface/regra, sem redução de cobertura; nova verificação completa em novo head, não rerun isolado. Falha original dos pixels permanece no histórico.

## SEO — Visibilidade do Marktmorgen no Google (21/10/2026)

271. [SEO1] Auditar, corrigir e melhorar presença orgânica na busca do Google

Estado: na fila, para depois dos trabalhos atuais e dos itens já aprovados, incluindo270[GR1]; não interrompe PR768 ou outra implementação em curso. A posição desta seção antes deGR preserva a seçãoGR no fim físico do arquivo; não antecipa a ordem de execução. Posição vigente: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B.
   - Histórico OR — estado anterior à atualização documental: Estado: na fila, para depois dos trabalhos atuais e dos itens já aprovados, incluindo270[GR1]; não interrompe PR768 ou outra implementação em curso. A posição desta seção antes deGR preserva a seçãoGR no fim físico do arquivo; não antecipa a ordem de execução.

Pedido integral mais recente do dono: "não para o que está fazendo. acrescenta na fila para fazer depois. vc fazer as verificações para corrigir e melhorar para o marktmorgen aparecer na primeira colocação na busca no google"

Orientação adicional do dono (21/10/2026), preservada integralmente: "não para o que está fazendo. acrescenta na fila para fazer depois. o gmail 072 está aberto no chrome. vc leia. assuntos relacionados a google, uso o gmail 072". Usar a conta identificada pelo dono como Gmail072 para assuntos Google/Search Console e para ler as mensagens relacionadas, após confirmar a identidade da conta no Chrome. O apelido072 não permite inferir o endereço completo. A leitura foi tentada agora: inventário do Chrome não respondeu em duas chamadas; o conector Gmail disponível confirmou outra conta, por isso nenhuma mensagem dessa outra conta foi lida. Leitura do Gmail072 pendente por indisponibilidade do acesso aoChrome; não declarar que mensagens foram lidas. Preservar esta preferência na continuidade; não enviar mensagens, criar contas ou fazer submissões externas por esta orientação. A implementação atual continua sem alteração.

Objetivo: buscar a primeira colocação para consultas relevantes ao Marktmorgen, distinguindo busca pela marca de consultas competitivas por solução. Tratar como objetivo de melhoria mensurável, nunca promessa ou garantia de posição, prazo, tráfego, vendas ou ganhos. Definir consultas, país, idioma e dispositivo com evidência do público e dos registros disponíveis; conservar os idiomas existentes e os gates de docs/site-languages.md.

Execução futura: verificar e reutilizar auditorias, sitemap, robots, metadados, dados estruturados e páginas existentes antes de criar algo. Consultar documentação oficial atual e datada do Google Search Central. Auditar rastreamento e indexabilidade por página (status HTTP, robots.txt, noindex, canonicals, sitemap, redirects, duplicação e páginas órfãs), títulos e descrições, estrutura de headings, conteúdo útil e original alinhado à intenção, links internos, dados estruturados verdadeiros, navegação móvel, acessibilidade, velocidade e Core Web Vitals. Distinguir testes sintéticos de métricas reais de campo. Usar Search Console apenas se já houver acesso autorizado; ausência de dados não vira aprovação nem zero. Registrar achados, prioridade e evidências; implementar correções concretas, testes e comparação antes/depois, página por página, seguindo os gates completos de publicação.

Critério de acompanhamento: registrar data, consultas, páginas, país/dispositivo e origem das evidências; acompanhar indexação, impressões, cliques, CTR e posição quando houver dados reais disponíveis, considerando a variabilidade dos resultados. Sem alegar posição atual ou evolução sem medição. Reutilizar itens230[HL11],238[CF1],248 e guias existentes para evitar páginas repetidas; não inventar depoimentos, avaliações ou recursos ainda desligados.

Restrições preservadas: nenhum anúncio pago, compra/troca de links, cloaking, conteúdo em massa para manipular busca, contas novas, aceite de termos, contato a terceiros ou submissão externa por causa deste pedido. Nenhuma nova tradução ativada. Não alterar preços, limites, permissões/opt-in, PLANS_ON_SALE=false, comissão, tax gate, art.9a ou revisão comercial. Ferramenta/fornecedor com custo novo exige cálculo mensal/anual por plano, maior preço pago, tetos e reserva antes de operar;60%líquido por cliente isolado no pior mês com100%dos direitos e global após todos os custos/impostos Brasil/EUA, leitura mais onerosa, desconhecido reprova. Implementações e testes somente dentro do escopo já autorizado. Este registro é inclusão na fila, não entrega funcional nem início da auditoria SEO.

## GR — Lições da auditoria do Gumroad (21/10/2026)

Proveniência: pedido direto do dono nesta conversa, 21/10/2026, 04h13 de Fortaleza. Ordem: depois do item 269 [KT3] e de todos os itens já em andamento; não bloqueia nenhum outro item. Itens 203–269 dos pedidos abertos preservados integralmente na ancestralidade desta fila. As afirmações sobre Gumroad abaixo são insumos da auditoria, ainda sujeitas a conferência oficial datada antes de qualquer uso público.

### Pedido integral do dono

NÃO PARE o que você está fazendo agora: conclua normalmente a tarefa atual. Em seguida, COLOQUE NA FILA, PARA FAZER DEPOIS, o item abaixo. Ele deve ser incluído em docs/codex-queue.md, no fim do arquivo, depois de tudo o que já existe, numa seção nova chamada "GR — Lições da auditoria do Gumroad (21/10/2026)". Essa seção deve vir depois do item 269 [KT3]. Se as seções anteriores ainda não estiverem no ramo principal quando você fizer a inclusão, coloque a nova seção depois do último item existente e preserve os itens 203 a 269 dos pedidos de mudança abertos. Use o número 270; se ele já estiver em uso, use o próximo número livre. Ordem de execução: depois do item 269 e de todos os itens que já estão em andamento. Este item não bloqueia nenhum outro.

Pedido: dono, 21/10/2026, 04h13 de Fortaleza: gerar coisas boas no Marktmorgen a partir de uma auditoria pública do Gumroad feita pelo Copilot.

Lição principal da auditoria: o Gumroad vence pela clareza ("Go from 0 to $1", "Anyone can earn their first dollar online", "Built for new beginnings"), com um fluxo de quatro passos (abrir conta, adicionar produto, começar a vender e repetir), cadastro curtíssimo e preço só por transação (10% + US$ 0,50 por venda direta e 30% nas vendas pela vitrine Discover, segundo a auditoria; confira nas fontes oficiais, com a data da consulta). Os pontos fracos apontados são a taxa alta, a personalização limitada e a falta de funis, de automações profundas e de CRM robusto.

O que já existe ou já está na fila e NÃO deve ser refeito (verifique antes): "pague quanto quiser"; chaves de licença para software (app/api/store/keys e app/api/store/licence); assinaturas com níveis e teste grátis; oferta depois do pagamento, oferta extra, combos e recomendação do próximo produto; afiliados; recuperação de checkout; webhooks, API e várias moedas; o artigo do blog "what-selling-on-gumroad-costs"; a página inicial orientada ao resultado e a jornada do criador (HT1 e HT2, já publicadas); loja montada pela IA (219 [OP5]); MCP com ações (258 [KJ3]); guias de migração (239 [CF2]); páginas por nicho (230 [HL11]); comparações e alternativas (238 [CF1]); academia (221 [HL2]); casos reais (229 [HL10]); descoberta de lojas (234 [SK2]); calculadoras (225 [HL6] e 244 [SP1]); e pontuação de interesse dos contatos (268 [KT2]). Também não entram: conta gratuita sem mensalidade e preço só por porcentagem (contrariam a margem mínima por cliente e a decisão do dono de 18/10/2026 sobre preços e planos); comissão sobre vendas vindas da descoberta de lojas (a comissão continua desligada); o Marktmorgen como vendedor responsável pelos impostos (merchant of record), porque contraria a decisão do dono de 29/09/2026 de nunca movimentar dinheiro de terceiros; números agregados como "earned last week" sem dados reais e sem contexto; e casos excepcionais apresentados como resultado típico.

Regras: valem para este item todas as regras da seção SH (itens 204 a 214), sem exceção: verificar e reutilizar o que já existe; margem líquida mínima de 60% (ela pode ser maior, mas nunca menor) por cliente isolado, com 100% dos direitos usados no pior mês, e também no consolidado, depois de todos os custos e de todos os impostos, inclusive os brasileiros; custo desconhecido não pode ser considerado zero; leitura que der MAIS imposto; interruptor no código, desligado; proibição de criar contas, pagar qualquer valor, aceitar termos, pedir aprovações, ligar interruptores e alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a ou a revisão comercial; testes somente com fornecedores simulados; inglês americano, acessibilidade (WCAG 2.2 AAA como ponto de partida) e nenhuma afirmação sem fonte oficial datada. Nenhuma página pública pode mostrar recurso desligado.

270. [GR1] Segmentação RFM dos compradores
Calcule, para cada comprador da loja, os três indicadores clássicos da segmentação RFM a partir dos dados que a loja já lê da conta Stripe do criador e das compras importadas: quão recente foi a última compra (recência), quantas vezes comprou (frequência) e quanto gastou no total (valor). Mostre ao criador grupos prontos e explicados em linguagem simples (por exemplo, "melhores clientes", "clientes fiéis", "compraram uma vez", "em risco de não voltar" e "não compram há muito tempo"), com o critério de cada grupo visível, e permita usar cada grupo como segmento nos e-mails em massa e nas automações que já existem, somente para quem aceitou receber contato. Nada de dados de terceiros, nada de previsão de gasto futuro apresentada como certeza. Coordene com a pontuação de interesse do item 268 [KT2] e com os painéis do item 226 [HL7], sem duplicar cálculos. Calcule o custo de leitura e de armazenamento, atualize os indicadores em lotes com teto automático e mantenha os limites do plano.

Estado: na fila. Posição vigente: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B.
   - Histórico OR — estado anterior à atualização documental: Estado: na fila.

Registro: item 270 [GR1] na fila; somente inclusão documental, sem implementação ou ativação de RFM. Reutilização dos itens 268 [KT2] e 226 [HL7], consentimento de contato, critérios explicados, lotes com teto e custeio de leitura/armazenamento por plano são obrigatórios. Todos os gates SH permanecem vinculantes. Não é entrega funcional.


### PR 783 — bloqueio externo superior a uma hora — 22/10/2026 01:00 Fortaleza

Estado: aguardando o dono, conforme regra de bloqueio superior a uma hora; causa externa npm, sem necessidade de nova autorização comercial. Primeiro bloqueio observado em 22/10/2026 02:59:16 UTC (21/10 23:59:16 Fortaleza). Head f6a89a8dc07cf01379abadef1c817e26ae01d181: 21 de 22 verificações aprovadas; audit 119617546588 reprovado por timeout do endpoint de advisory bulk em 03:20:26 UTC, seguido de recusa correta do relatório indisponível pelo parser. Falhas anteriores e correções permanecem no histórico. Nenhuma incorporação ou entrega 155.

Evidência externa: https://status.npmjs.org/ registra incidente Degraded Package Install and Publishing, identificado às 03:07 UTC, ainda sem resolução confirmada na consulta de 03:57 UTC. O indicador Security Audit operacional não comprova recuperação do endpoint que falhou. Não reduzir gates, não tratar desconhecido como aprovado e não repetir apenas um job. Este registro cria novo head com verificação integral; se a indisponibilidade persistir, preservar o PR e avançar em trabalho independente, evitando novas execuções repetitivas sem evidência de recuperação.

Custos: reconciliação de 03:18:54 UTC registrou 1034 execuções codex/* concluídas únicas, 3058 jobs, 996252 segundos, zero durações desconhecidas; incremento sobre 01:26:12 UTC de 68 execuções, 208 jobs e 93594 segundos. Duração não é fatura; custos efetivos de CI e publicação continuam desconhecidos, não zero. Sem certificação de margem. Registro local marktmorgen-ci-cost-20261022-0318.json. Nenhuma operação comercial nova. Pedido HM1 preservado para inclusão após conclusão da tarefa atual, conforme ordem direta do dono.


### Entrega 155 — confirmação posterior ao bloqueio do PR783

PR783 incorporado em 22/10/2026 01:21:48 Fortaleza (04:21:48 UTC), commit a7d70c8696a3976eb59f3e5f5e5ed45bb4c5c61c, árvore b1a41d44630452c7cd29bc622594eeffbe87eccd igual à árvore testada e prevista. As22 verificações completas passaram no head68c00c288ed2835e6e0a5bc7e7f3f63452501563, incluindo auditoria antes indisponível. Produção READY em04:23:22.106 UTC, dpl_8SXTDCaYAto9LB1TxeP4R8GkrJ6d; marktmorgen.com aponta à versão exata, cinco rotas /,/platform,/pricing,/mission,/library HTTP200 e mesmo deployment. Zero logs error/fatal apenas na janela04:19:09.471–04:24:09.471UTC. Leitura estrita de remessas, retorno unknown para claim ilegível sem outro email, erro honesto no histórico e escopo da lista recente de compradores publicados. Bloqueio histórico preservado e superado por esta execução; nenhuma certificação de margem ou de resolução geral do incidente npm. Sem novas operações/chaves/TTL/mensagens; faturas reais de CI/deploy desconhecidas, não zero.

### Revisão independente — PR784

Correção da leitura de avaliações do Studio: dados indisponíveis/incompletos não provam ausência ou fila vista; página vazia fora do intervalo preserva o total. Testes sintéticos do leitor real, registros parciais, índice inválido, avaliação válida e paginação. Nenhuma operação/chave/TTL/mensagem adicional. Verificação integral no novo head combinado obrigatória; PR pendente não é entrega funcional.


## HM — Lições da segunda auditoria da Hotmart (22/10/2026)

Ordem de execução: depois do item270 [GR1] e de todos os itens já em andamento. Este item não bloqueia nenhum outro. O número271 já pertence a [SEO1]; por isso o próximo número livre,272, foi usado, conforme autorização do dono. A seção HT (182–199), os itens203–271 e as entregas anteriores ficam preservados.

Pedido: dono, 22/10/2026, 00h07 e 00h10 de Fortaleza: gerar coisas boas no Marktmorgen a partir de uma segunda auditoria pública da Hotmart feita pelo Copilot, com a regra dos 60% expressa. A primeira auditoria da Hotmart já está na seção HT (itens 182 a 199) e não deve ser refeita.

REGRA DOS 60% (OBRIGATÓRIA E ACIMA DE QUALQUER OUTRA CONSIDERAÇÃO DESTE ITEM): todo cliente pagante, considerado isoladamente e usando 100% de todos os direitos do plano no pior mês, deve manter margem de lucro líquido MÍNIMA de 60%, depois de todos os custos e de todos os impostos, inclusive os brasileiros decorrentes da LLC americana. Os 60% são o piso: a margem pode ser maior, mas nunca menor. A mesma regra vale para a empresa como um todo. Custo desconhecido, imposto desconhecido ou limite que não age sozinho conta como reprovação, nunca como zero. Use sempre a leitura tributária que der MAIS imposto (docs/tax-uncertainty.md). Se o recurso não couber nos 60%, ele não é construído, ou é reduzido até caber, sem alterar preços nem cortar limites visíveis sem a decisão do dono. Nenhuma calculadora, verificação ou teste aprovado certifica sozinho essa regra.

Lição principal da auditoria: a Hotmart cresce como ecossistema, com entrada sem risco ("só pago quando vendo"), afiliados, aumento da conversão (checkout, oferta depois do pagamento e recuperação), área de membros com comunidade e aplicativo com aulas sem internet, educação contínua e narrativa de criadores de sucesso. Fatos a conferir nas fontes oficiais, com a data da consulta: "No monthly or annual fees."; Checkout Builder com oferta extra, janela de saída e idioma e moeda automáticos; Hotmart Sales Funnels; Hotmart Club com aplicativo e consumo sem internet; Launchpad; tutor com IA; e venda em 188 países.

O que já existe ou já está na fila e NÃO deve ser refeito (verifique antes): toda a seção HT; oferta extra, oferta de saída (components/exit-offer-editor.tsx), oferta depois do pagamento e oferta alternativa após recusa; assinaturas com teste grátis; recuperação de checkout e de cartão recusado; vários idiomas para o comprador; comunidade; afiliados e sócios com divisão de receita paga pelo próprio criador (lib/partner-invites.ts e o módulo de afiliados); aplicativo instalável pelo navegador (components/install-app.tsx); ingressos presenciais com check-in por QR (itens 36 [F5] e 109 [E2-EVENTS]); loja montada pela IA (219 [OP5]); tutor do aluno (HT13); academia e parceiros (221 [HL2] e 223 [HL4]); moeda do comprador (208 [SH5]); páginas por nicho e casos reais (230 [HL11] e 229 [HL10]); e comparações (238 [CF1]). Também não entram: conta gratuita sem mensalidade e cobrança só por porcentagem das vendas (contrariam a regra dos 60% por cliente e a decisão do dono de 18/10/2026 sobre preços e planos); divisão automática do dinheiro da venda entre coprodutores (exigiria que o Marktmorgen recebesse e repassasse o dinheiro, contra a decisão do dono de 29/09/2026); números agregados como "+R$50 bilhões faturado" sem dados reais; prova social com especialistas famosos que não sejam clientes reais com autorização escrita; aplicativo nativo com marca própria (decisão já explicada no blog, "why-we-skipped-the-app-stores"); e programas VIP ou comunidades presenciais feitos à mão pelo dono.

Regras: valem para este item todas as regras da seção SH (itens 204 a 214), sem exceção: verificar e reutilizar o que já existe; a REGRA DOS 60% acima; leitura que der MAIS imposto; interruptor no código, desligado; proibição de criar contas, pagar qualquer valor, aceitar termos, pedir aprovações, ligar interruptores e alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a ou a revisão comercial; testes somente com fornecedores simulados; inglês americano, acessibilidade (WCAG 2.2 AAA como ponto de partida) e nenhuma afirmação sem fonte oficial datada. Nenhuma página pública pode mostrar recurso desligado.

272. [HM1] Aulas disponíveis sem internet no aplicativo instalável
Permita que o comprador de um curso salve aulas no aplicativo instalável que já existe para estudá-las sem internet, começando pelo que é seguro e barato: textos das aulas, PDFs e materiais que o criador marcar como disponíveis sem internet. O acesso salvo continua respeitando a compra (se a compra for reembolsada, a assinatura terminar ou o acesso for retirado, o conteúdo salvo é apagado na próxima vez em que o aplicativo se conectar) e cada arquivo leva a marca do comprador já usada nas entregas, quando houver. Estude separadamente, nas fontes oficiais do fornecedor de vídeo que já existe e dos navegadores (limites de armazenamento do Cache API, Safari no iPhone e Chrome no Android), se é possível salvar vídeos para assistir sem internet com proteção contra cópia e custo controlado, e registre o resultado em docs/offline-lessons-study.md. Corrija a frase da página de comparação (lib/site-pages.ts) somente quando o recurso estiver ligado.
Custo e margem (REGRA DOS 60%): antes de escrever o código, calcule e registre o custo máximo, no pior caso, de cada cliente que use o recurso ao máximo: entrega dos arquivos salvos (cada download conta nos limites de banda e de entrega do plano), armazenamento, leituras e qualquer outro custo do fornecedor de vídeo ou de arquivos, com as taxas de recebimento de lib/receiving-costs.ts e a leitura que der mais imposto. Demonstre, para cada plano e intervalo (mensal e anual), que o cliente isolado continua com margem líquida de no mínimo 60% depois de todos os custos e impostos, inclusive os brasileiros, e coloque teto automático que bloqueie novos downloads antes de qualquer custo passar desse limite. Vídeo sem internet só é construído se for seguro e se o mesmo cálculo comprovar os 60%. Se o cálculo não fechar, registre o motivo e não implemente.

Estado: na fila. Posição vigente: OR: após o Bloco A, na ordem já existente entre 206 [SH3] e 272 [HM1]; 232 [CA1] foi antecipado e não se repete; antes do Bloco B.
   - Histórico OR — estado anterior à atualização documental: Estado: na fila.

Registro: inclusão documental de272 [HM1] para execução posterior. Pedido do dono recebido em22/10/2026, origem `b370da14-f087-418c-b205-a8761ca0daea/Texto colado.txt`; texto integral e proveniência preservados na continuidade. Fatos da auditoria ainda precisam de verificação oficial datada na execução. Nenhum estudo, implementação, ativação, promessa comercial ou novo custo do recurso offline foi iniciado por esta inclusão. Antes de qualquer código, o cálculo máximo mensal/anual por plano, todos os custos/impostos, recebimento, tetos anteriores ao gasto e a margem líquida mínima de60% por cliente isolado e global são condições obrigatórias; desconhecido reprova. Vídeo offline só avança se segurança e cálculo forem comprovados. Não é entrega funcional.


## BK — Backup diário automático (22/10/2026)

Inclusão por pedido direto do dono, após concluir entrega155. Posição física ao fim, depois de HM272 e tudo existente. Prioridade de execução sobre recursos novos ainda não iniciados a partir203; preserva itens em andamento e não altera suas autorizações. Número273 é o próximo livre; nenhuma renumeração.

Pedido: dono, 22/10/2026, 00h46 de Fortaleza: "fazer backup do que precisa uma vez por dia". O dono removeu as tarefas agendadas do Claude, inclusive a que conferia o backup. O backup do notebook do dono é feito por um programa no próprio Windows dele e não faz parte deste item; este item cuida do que existe só na nuvem.

REGRA DOS 60% (OBRIGATÓRIA): todo cliente pagante, considerado isoladamente e usando 100% de todos os direitos do plano no pior mês, deve manter margem de lucro líquido MÍNIMA de 60%, depois de todos os custos e de todos os impostos, inclusive os brasileiros; a margem pode ser maior, mas nunca menor, e a mesma regra vale para a empresa como um todo. O custo do backup dos dados de cada loja (armazenamento, operações e transferência) é custo variável DESSE cliente e entra no cálculo dele, no pior caso, com o maior volume de dados que o plano permite; o custo do backup dos repositórios e da configuração entra nos custos fixos da empresa. Custo desconhecido não pode ser considerado zero. Use a leitura que der MAIS imposto (docs/tax-uncertainty.md). Se o backup não couber nos 60%, reduza o que é guardado, a frequência ou o prazo de retenção até caber, sem alterar preços nem cortar limites visíveis.

273. [BK1] Backup diário automático dos dados de produção e dos repositórios

Escopo:
1. Inventário: liste em docs/backup.md tudo o que existe só na nuvem e se perderia sem backup: os dados do Upstash Redis (lojas, produtos, pedidos, contatos, comunidades, configurações e filas), os arquivos guardados no Cloudflare R2 e na Vercel Blob, a configuração do Amazon SES em infra/, a lista de variáveis de ambiente da Vercel (somente os NOMES, nunca os valores) e os repositórios marktmorgen, kudobox (Hazelsong) e solrenning. Para cada um, diga se já tem cópia em outro lugar e o que falta.
2. Backup diário dos dados do Redis: uma vez por dia, por um job automático que já exista ou por um novo job de cron na Vercel (sem gastar minutos do GitHub Actions, cuja franquia está esgotada até 01/11/2026), exporte todas as chaves do Marktmorgen em lotes com teto de comandos, comprima, CRIPTOGRAFE com uma chave guardada apenas como variável de ambiente e grave num bucket separado do Cloudflare R2, que não seja o mesmo dos arquivos vendidos. Confira, depois de gravar, que o arquivo abre, descriptografa e tem o número esperado de chaves; se a conferência falhar, o job registra a falha e tenta de novo no dia seguinte, sem apagar o backup anterior.
3. Cópia diária dos arquivos: confira, uma vez por dia, se cada arquivo vendido ou enviado pelos criadores tem cópia fora do lugar principal; se o fornecedor já garantir durabilidade e o custo de uma segunda cópia não couber nos 60%, registre isso e não duplique.
4. Cópia extra dos repositórios: uma vez por dia, grave no mesmo bucket de backup um arquivo git bundle do ramo principal de cada repositório (marktmorgen, kudobox e solrenning), para que o código sobreviva mesmo à perda da conta do GitHub.
5. Retenção: guarde os backups diários dos últimos 30 dias, os semanais dos últimos 3 meses e apague o resto automaticamente. Ajuste esses prazos se o custo não couber nos 60%.
6. Privacidade: os backups contêm dados pessoais de criadores e compradores. Eles ficam criptografados, com acesso restrito, e o prazo de retenção é o informado na política de privacidade; um pedido de exclusão é cumprido nos dados ativos de imediato e desaparece dos backups quando o prazo de retenção acabar. Atualize a política de privacidade para dizer isso, e o texto entra em vigor junto com o recurso.
7. Restauração testada: escreva em docs/backup.md o passo a passo para restaurar tudo a partir de um backup, e um teste automatizado que restaure um backup sintético num banco simulado e confira que os dados voltam iguais. Um backup que nunca foi restaurado em teste não conta como backup.
8. Aviso automático: se o backup de um dia falhar e o do dia seguinte também, registre a falha de forma visível no relatório que já existe de verificações diárias, sem depender de o dono olhar painel.
9. Custo: calcule e registre o custo máximo mensal de cada parte (operações do Redis, armazenamento e operações do R2, execução das funções da Vercel), coloque teto automático em cada uma e mostre que a regra dos 60% continua valendo por cliente e para a empresa.

É proibido neste item: criar contas, criar buckets, criar chaves de acesso, aceitar termos ou contratar serviço; tudo isso depende do dono. Liste em docs/backup.md, passo a passo, exatamente o que o dono precisa fazer (por exemplo, criar o bucket de backup no Cloudflare R2, criar uma chave de acesso que só possa gravar nesse bucket e cadastrar na Vercel as variáveis de ambiente com os nomes que você definir), e deixe o job pronto e desligado até essas variáveis existirem. Nunca grave segredos, chaves ou valores de variáveis no repositório, nos registros ou nos backups em texto aberto. Testes somente com fornecedores simulados.

Estado: na fila, com prioridade sobre os recursos novos ainda não iniciados. Ao concluir, registre o commit, o resultado da suíte completa e a publicação, e altere o estado para "pronto e desligado, aguardando os passos do dono". Posição vigente: OR: prioridade já definida 1/2, após os andamentos e antes do Bloco A; remanescente aguardando o dono conforme evidência histórica de bloqueio por mais de uma hora; não trava os seguintes.
   - Histórico OR — estado anterior à atualização documental: Estado: na fila, com prioridade sobre os recursos novos ainda não iniciados. Ao concluir, registre o commit, o resultado da suíte completa e a publicação, e altere o estado para "pronto e desligado, aguardando os passos do dono".


### BK273 prerequisite — offline encrypted restore codec

Inventory and cost/tax failure documented in docs/backup.md. Offline-only bounded AES256GCM/gzip codec plus synthetic in-memory restore tests prepared; no cron/provider adapter/bucket/key/environment lookup or active privacy change. Full BK1 remains incomplete, not pronto e desligado: daily export, exact Redis restore, repository bundles, retention/reporting and funded caps remain missing. No production backup exists from this change. No functional delivery count for a codec/document alone. Actual CI costs unknown, not zero.


PR785 falhas preservadas: verify119647705153 detectou filtro de namespace ausente do registro, corrigido por entrada sem chave/escrita. Depois WebKit119649672108 no heada65d84fed5163fde3d454407827cf3ea28a7537b detectou segundo clique Edit name and description antes de hidratação, sem campo One line about it. DetailsForm agora mantém esse controle indisponível até hidratação via useSyncExternalStore, sem alterar roteiro, timeout ou asserções. Exigir suíte completa no novo head. Nenhum backup ativo ou entrega funcional por codec apenas.


### BK273 — synthetic verified object roundtrip prerequisite

Create-only injected storage, unique object identities, bounded authenticated read-back and exact snapshot comparison, prior object retained on failure; synthetic only, no real provider adapter/cron/credentials/retention action. Full CI pending; not BK1 completion or functional delivery. Delivery157 proof: PR785 merged22October02:34:54Fortaleza,4722c925e366f9b8cbe3b0446c522c8f7a54bb98,tree0dc54c9916e5cbe929cb049abc00fdb8f6330ac3 equals tested;22/22 checks passed, READY05:36:14.905UTC,dpl_939vCypcyPaQTPioAJbjrx2MrNpR,domain exactSHA,five routes200sameDPL; error/fatal0 only05:32:02.147–05:37:02.147UTC. Functional scope was DetailsForm hydration fix; backup remains incomplete. Actual CI/deploy cost unknown, not zero.


### Revisão da leitura de cobranças — preservação de referências

listRequests não deve transformar índice/resposta incompleta em ausência nem remover referências de registros ilegíveis ou de outro sid/id. Limpeza limitada a null explícito após resposta MGET completa; erro vira null e página mostra indisponibilidade, sem formulário de envio baseado em lista desconhecida. Testes sintéticos do leitor real para índices inválidos, duplicados, registros parciais, identidades erradas, próprio válido e expiração confirmada. Nenhuma nova operação/chave/TTL/mensagem; chamadas existentes preservadas. openCount/admissão concorrente e parseRequest financeiro não certificados por esta mudança; permanecem revisão separada.

BK273: aguardando o dono após mais de1hora de bloqueio observado04:52:23.603UTC. MOST_TAX_READING7818bps sobre lucro e demais custos impede60% mesmo sem custo operacional. Credenciais/bucket independentes não provisionados e criação pelo agente proibida; não ativar por mera presença de variáveis. Codec PR785 incorporado; roundtrip sintético PR786 pendente. Backup diário incompleto, não pronto e desligado. Evidências em docs/backup.md e continuidade. Avançar itens acionáveis sem reduzir impostos/gates. Faturas reais CI/deploy desconhecidas, não zero.


PR786 incorporado em22/10/2026 03:11:21 Fortaleza (06:11:21UTC), commit58f14c23db3f4cddd750b2b0d96e20b9f8752811, árvore f7ea72988840eb984559cc2eb2b3113064d75d6b igual à testada e prevista;22 verificações completas aprovadas no heada0e54af8dd1b75aa7497cd597f230c8b8c029051. Roundtrip sintético interno, sem ativação nem incremento funcional. Integração explícita de main no PR787 exige suíte completa no novo head. Histórico e bloqueio BK273 preservados; custo efetivo de CI/deploy desconhecido, não zero.


### Payment request action receipt review

Client now requires successful HTTP and own explicit ok:true. Create also requires a valid persisted request ID; create/remind require an explicit boolean sent receipt. Malformed or ambiguous replies preserve form values and cannot claim sent/canceled/deleted. Unknown-result copy asks to reload before retrying, without claiming nothing was sent. Synthetic parser tests cover HTTP errors with success bodies, invalid/missing/inherited receipts and true/false send outcomes; full CI required before incorporation. Separate component/helper files avoid PR787 reader edits. No new supplier call, email, key, TTL or visible limit; actual CI/deploy cost remains unknown, not zero. No certification of backend admission, locks or tax/margin.


PR788 incorporado22/10/2026 03:38:22Fortaleza(06:38:22UTC),a7cb4270054a51572d91e30a4c5f9eebfd277fed,árvore ad8d0bef4b86281a954e701e991b956b673735a0 igual à testada e prevista;22verificações completas no head2b20e8b2de36b715a95b1d51ea005fe5cd1b2b06. Publicação funcional ainda depende de READY/domínio/versão exata; contador não incrementado aqui. Integração no PR787 exige nova suíte completa, sem reutilizar aprovação anterior. CI/deploy custos efetivos desconhecidos, não zero.


### Open payment request counts — unknown is not zero

openCount requires exactly two nonnegative safe-integer Redis results, including cleanup acknowledgement and count; no coercion or zero fallback on unavailable service/identity. The Requests page withholds its form and shows unavailable status on an unknown count. settleStoreList keeps sweep membership on unknown counts; only verified zero permits its existing SREM. Synthetic real count/settlement tests cover null/partial/coerced/negative/fractional replies and verified zero/nonzero; full CI required. No new commands, keys, TTLs or messages. createRequest person cleanup/count admission and write acknowledgements remain separate unresolved review; this does not certify them. Actual CI/deploy expenses unknown, not zero.

Entrega159 confirmada: PR787 incorporado22/10/2026 04:02:17Fortaleza,commit e25bacb7ef0be7ac37848e87a172e2ab8cb9e20f,tree c762ac90314125070d02ce930d554f903dca78ed igual à testada e prevista;22/22checks no headefd309f76a392f1f9507818a76997e9955c0cc76. READY07:03:32.586UTC,dpl_ADEmQSY4TGJ2oCXVQyxESEhKxLUr,marktmorgen.comSHAexato,cinco rotas200mesmoDPL;error/fatal0 somente06:59:10.769–07:04:10.769UTC. Leitura estrita de cobranças e aviso de indisponibilidade publicados. Custos efetivosCI/deploy desconhecidos, não zero. Contador159,próxima160;sem certificação de margem.


### Entrega160 — confirmação da tarefa anterior ao pedido AX274

PR791 incorporado22/10/2026 04:35:00Fortaleza(07:35:00UTC),commit e91aeb85dcb695c0ec85b7c9a4145c58ef4ed7ca,árvore11ff31230fbb75bfb75ef3b995b6e617ab1db9c0 igual à testada e prevista;22verificações completas no head5a1ba29bbc588f30d95708b4138e6a88a5623b92. READY07:36:09.138UTC,dpl_5qBh7s9ZYWNcSXVz3gBuRqBcmPCF,marktmorgen.comSHAexato,cinco rotas200mesmoDPL. Error/fatal0 somente07:31:43.170–07:36:43.170UTC. Contagem desconhecida não vira zero,Studio mostra indisponibilidade e índice de acompanhamento fica preservado sem zero comprovado. Custos efetivosCI/deploy desconhecidos,não zero;sem nova operação/chave/TTL/mensagem. Contador160,próxima161.




### Agreement page — unknown lists remain unknown

Agreements Studio no longer renders an empty list/send form when either agreement or payment request reading returns null. It shows an accessible unavailable notice and asks to reload. Known-empty lists keep their original form. This addresses page fallback only; agreement-store parser/index cleanup remains a separate finding and is not certified. No provider operation, message, key, TTL or visible limit added. Full CI required; actual CI/deploy expenses unknown, not zero.

Entrega158 confirmada: PR788 incorporado22/10/2026 03:38:22Fortaleza,commit a7cb4270054a51572d91e30a4c5f9eebfd277fed,tree ad8d0bef4b86281a954e701e991b956b673735a0 igual à testada/prevista;22/22 verificações no head2b20e8b2de36b715a95b1d51ea005fe5cd1b2b06. READY06:39:16.130UTC,dpl_G4RbHRxMNjuoskH5muYV11oST2sz,marktmorgen.com versão exata,cinco rotas200mesmoDPL. Error/fatal0 somente06:35:11.558–06:40:11.558UTC. Confirmações estritas de ações de cobrança publicadas; nenhum novo custo operacional, faturasCI/deploy desconhecidas, não zero. Contador158,próxima159; nenhuma margem certificada.


### Agreement records — preserve references on unreadable storage

listAgreements now requires exact bounded unique valid index and complete MGET response. Invalid JSON, mismatched store/id and incomplete replies return unavailable with no index cleanup, including mixed absent and unreadable records. Only explicit null in a complete, otherwise verified result permits existing bounded ZREM. Synthetic tests call the real reader with simulated Redis; no external service. No new keys/TTL/provider calls/messages, no signature/financial-parser certification. Full CI required; actual CI/deploy expense unknown, not zero. Agreement-page unavailable notice remains separate PR789.


PR787 incorporado22/10/2026 04:02:17Fortaleza(07:02:17UTC),commit e25bacb7ef0be7ac37848e87a172e2ab8cb9e20f,árvore c762ac90314125070d02ce930d554f903dca78ed igual à testada e prevista;22/22verificações no headefd309f76a392f1f9507818a76997e9955c0cc76. Produção ainda não confirmada, sem incremento aqui. PR789 integra main e código/testes do PR790 num head com suíte completa nova obrigatória. Não usar checks antigos. Nenhum novo custo operacional, CI/deploy real desconhecido, não zero.


PR789 auditoria indisponível: head3ad0cf894c498b6e33fcef8cc977b7cec6b73737,job119687697209,07:08:22UTC: npm produção POST registry.npmjs.org/-/npm/v1/security/advisories/bulk HTTP503;8testes do parser passaram,mas parser recusou aprovação. Não alterar gate/nem rerodar job isolado. Evidência independente posterior: PR791audit119688858111 passou07:10:59UTC,produção high/critical0 e5achadosdevretidos na cadeia já revisada,sem alegar ausência completa de vulnerabilidades ou recuperação global. Este registro cria novo head e exige suíte completa de22checks;aprovação do outroPR não substitui auditoria própria. CustosCI/deploy reais desconhecidos,não zero.


PR789 Mobile render119691251480 falhou no head79720b93a4b070ec46e342cd82ccdceff37df685: homepage amostra1,proxy interação208ms acima200ms;demais8amostras passaram. Fonte mediu pointerdown no summary nativo de benefícios,React hidratação fI44.6ms dentroframe168.6ms,semCLS(0),LCP816ms. Correção: boundary Suspense pequeno em torno apenas do summary,separado do cartão e lista longa já isolada;sem remover benefícios,preços,interações ou mudar budgets/amostras/roteiro. Exigir suíte completa no novo head; nenhum job isolado. Não certificar INPde campo. Falha npm503 anterior preservada; custosCI/deploy desconhecidos,não zero.


Integração posterior à regra AX274: PR792 incorporado22/10/2026 05:03:41Fortaleza,398a9249c5c4b7840f0db39425885cc45070d4cc,22/22checks no head79b6af9b54e78a85902d948908395c21116d14ab,árvore6818bc7773db8e4088072b17cf2465944a4de437 igual à testada/prevista. AGENTS Parte A em vigor;B/C seguem na fila. Integração preserva regra,anotação59,AXfisicamenteúltimo e contadores/entrega160. PR789head anterior dd5fb883c1dd069064350fbc64d108e5790eefd0 passou22checks,Mobile119693208999 após correção:homepage88/72/64ms,demais6amostras32–56ms,CLS0,todosgatespassaram;isso não aprova novohead nem certificaINPde campo. Nova suíte completa obrigatória apósmain atual,sem jobisolado,sem novos custos operacionais;faturasCI/deploy desconhecidas,não zero.

## AX — Excelência máxima de acessibilidade em todo o site (22/10/2026)

Pedido do dono, 22/10/2026, 04h28 e 04h30 de Fortaleza: tudo o que você fizer tem de ser feito com excelência de acessibilidade, respeitando todas as regulações governamentais de acessibilidade; todas as páginas, subpáginas e tudo no site têm de ter acessibilidade no grau máximo, superando muito o que é exigido. Isto é uma regra permanente, e não uma tarefa única.

REGRA DOS 60% (OBRIGATÓRIA): todo cliente pagante, considerado isoladamente e usando 100% de todos os direitos do plano no pior mês, deve manter margem de lucro líquido MÍNIMA de 60%, depois de todos os custos e de todos os impostos, inclusive os brasileiros; a margem pode ser maior, mas nunca menor, e a mesma regra vale para a empresa como um todo. Todo custo que a acessibilidade criar entra no cálculo: o que variar por cliente (por exemplo, legendas automáticas, transcrições, descrições de áudio ou textos alternativos gerados por IA) entra no pior caso de cada plano, com teto automático antes do gasto; o que for fixo (ferramentas, auditorias, intérpretes de língua de sinais, testes com pessoas) entra nos custos fixos e na base mínima de clientes pagantes. Custo desconhecido não pode ser considerado zero. Use a leitura que der MAIS imposto (docs/tax-uncertainty.md). Nenhum preço muda e nenhum limite visível é cortado por causa deste item.

274. [AX1] Acessibilidade no grau máximo em todas as páginas, subpáginas e em tudo o que o Marktmorgen entrega, acima de todas as regulações governamentais

PARTE A — Regra permanente (gravar já em AGENTS.md, no mesmo PR que inclui este item na fila, porque vale para todo trabalho a partir de agora):
1. Grau obrigatório: WCAG 2.2 nível AAA em TODOS os critérios aplicáveis, em todas as páginas, subpáginas e estados do site. O nível AA é apenas o mínimo legal, nunca a meta. Onde um critério AAA for tecnicamente impossível num caso concreto, registre o caso, o motivo e a alternativa equivalente oferecida em docs/accessibility-programme.md; a impossibilidade nunca pode ser presumida, precisa ser demonstrada.
2. Além do WCAG, para superar o exigido, aplique também: as orientações do W3C para deficiências cognitivas e de aprendizagem (Making Content Usable for People with Cognitive and Learning Disabilities); os padrões do WAI-ARIA Authoring Practices Guide para todo componente interativo; a ATAG 2.0, partes A e B, no estúdio, porque o estúdio é uma ferramenta de criação e precisa ajudar o criador a produzir conteúdo acessível; todos os capítulos aplicáveis da EN 301 549 em vigor, inclusive documentação e suporte; os critérios de desempenho funcional da Section 508; o EPUB Accessibility 1.1 para livros digitais; o PDF/UA para PDFs; e os resultados do rascunho do WCAG 3.0 como camada extra, sem tratá-lo como norma em vigor. Referências de qualidade: GOV.UK Design System e Apple Human Interface Guidelines.
3. Nenhuma mudança é considerada pronta sem acessibilidade: tela nova, texto, componente, e-mail, PDF, vídeo, formulário, mensagem de erro, API pública ou documentação. Cada PR deve trazer uma seção "Acessibilidade" dizendo quais critérios foram conferidos, como, com que resultado e o que ficou de fora.
4. Critérios AAA que devem ser cumpridos explicitamente em todo o site, além de todos os de nível A e AA:
- Visão: contraste de 7:1 para texto (1.4.6) e de 3:1 para componentes e gráficos; nenhuma imagem de texto (1.4.9); apresentação visual ajustável, com largura de linha de até 80 caracteres, sem texto justificado, espaçamento de linha de pelo menos 1,5 e redimensionamento a 200% sem rolagem horizontal (1.4.8); foco destacado (2.4.13); alvos de pelo menos 44 × 44 px (2.5.5); reflow em 320 px; zoom de 400%; espaçamento de texto ajustável (1.4.12); modo escuro; alto contraste (forced-colors); nunca informação só por cor.
- Audição e mídia (em todo vídeo e áudio do próprio Marktmorgen): legendas, transcrição completa, audiodescrição estendida (1.2.7), alternativa em texto da mídia (1.2.8), interpretação em língua de sinais (1.2.6) nos vídeos institucionais e de ajuda, e alternativa para áudio ao vivo (1.2.9). Para a mídia dos criadores, ofereça as ferramentas e os avisos da Parte B; nunca gere custo sem teto.
- Tempo e movimento: nenhum limite de tempo (2.2.3); interrupções adiáveis (2.2.4); nova autenticação sem perda de dados (2.2.5); aviso de inatividade que possa causar perda de dados (2.2.6); nada piscando, em nenhuma frequência (2.3.2); animação de interação desativável e respeito a prefers-reduced-motion (2.3.3).
- Navegação e entendimento: indicação de onde a pessoa está, como trilha de navegação (2.4.8); propósito de cada link compreensível pelo próprio texto do link (2.4.9); títulos de seção em todo conteúdo (2.4.10); mudança de contexto só quando a pessoa pedir (3.2.5); ajuda sensível ao contexto (3.3.5); prevenção de erro em todo envio de dados, com revisão, correção ou desfazer (3.3.6); ajuda sempre no mesmo lugar (3.2.6); nada de redigitar dados já informados (3.3.7); login acessível sem teste cognitivo de nenhum tipo, nem reconhecimento de objetos (3.3.9); uso livre de mouse, toque, teclado e voz ao mesmo tempo (2.5.6); alternativa a arrastar (2.5.7).
- Linguagem: todo texto do próprio Marktmorgen em inglês americano simples, no nível de leitura do ensino fundamental final (3.1.5) ou com versão simplificada; glossário para termos incomuns (3.1.3); expansão de abreviações (3.1.4); pronúncia onde ela mudar o sentido (3.1.6); idioma da página e de cada trecho marcado (lang) em todos os idiomas do site.
- Leitores de tela e teclado: HTML semântico; nomes, funções e estados corretos; títulos em hierarquia; regiões nomeadas; avisos dinâmicos em regiões ao vivo; tudo operável só por teclado, em ordem lógica, sem armadilha de foco; link para pular ao conteúdo em toda página.
- Desempenho: uso aceitável em celular simples e em rede lenta, porque lentidão também exclui pessoas.
5. Abrangência total, sem nenhuma exceção: todas as páginas e subpáginas do site público, do estúdio do criador, da área do comprador, do checkout, do checkout embutido no site do criador, dos widgets, das páginas de loja, dos cursos, da comunidade, dos podcasts, da central de ajuda, das páginas legais e das páginas de erro, em todos os estados (vazio, carregando, erro, sucesso, aberto, fechado, desativado) e em todos os modais, menus e avisos. Também os e-mails transacionais e de marketing (HTML acessível e versão em texto), os PDFs gerados (recibos, faturas e certificados como PDF marcado, no padrão PDF/UA), os arquivos de exportação, a documentação da API e do MCP e as respostas do assistente de IA.
6. O que o criador configura: temas, cores, fontes e blocos personalizados não podem gerar uma loja inacessível. Antes de publicar, o estúdio avisa automaticamente sobre contraste abaixo de 7:1, imagem sem texto alternativo, vídeo sem legenda ou transcrição, título fora de ordem e link sem propósito claro, e oferece a correção com um clique. Nunca altere o conteúdo do criador sem que ele aprove.
7. Proibições: nunca instalar "widget" ou "overlay" de acessibilidade (botões que prometem tornar o site acessível sozinhos), porque não garantem conformidade e já geraram punição por propaganda enganosa (verifique, com fonte oficial datada, a decisão da FTC sobre a accessiBe). Nunca escrever "fully accessible", "ADA compliant", "WCAG AAA certified", "the most accessible platform" ou qualquer selo ou comparação de superioridade sem auditoria completa e fonte que o comprovem. Testes automáticos não equivalem a conformidade.

PARTE B — Regulações governamentais (fazer depois, na ordem da fila):
1. Crie docs/accessibility-legal-matrix.md com uma linha por regulação: o que exige, se e como se aplica ao Marktmorgen (como plataforma) e aos criadores (como vendedores), a norma técnica exigida, os prazos, as penalidades, quanto o Marktmorgen supera a exigência e o estado atual no código, com a fonte oficial e a data de consulta. Inclua pelo menos:
- EUA: ADA Title III (sem regulamento de sites para empresas privadas até hoje; diretrizes do DOJ; acordos e decisões judiciais costumam exigir WCAG 2.1 ou 2.2 AA); o regulamento do Title II do DOJ como referência técnica (WCAG 2.1 AA, com os prazos adiados em 2026); a Section 508 (preparar ACR/VPAT completo, útil também para vender a empresas e universidades); a CVAA (verificar se o chat ao vivo, a sala da comunidade e as chamadas pagas são "advanced communications services"); as regras de legendas da FCC (verificar se se aplicam); e as leis estaduais, como a Unruh Act da Califórnia e as de Nova York.
- União Europeia: European Accessibility Act (Diretiva (UE) 2019/882), aplicável desde 28/06/2025 a serviços de comércio eletrônico e a livros digitais, com as leis nacionais de transposição dos principais mercados (por exemplo, BFSG na Alemanha e as da França, Países Baixos, Irlanda, Espanha e Itália); a norma EN 301 549 na versão em vigor (verifique se já há versão que incorpora o WCAG 2.2); a exigência de informar a acessibilidade do serviço (Anexo V); e a isenção de microempresas para serviços. Mesmo que o Marktmorgen esteja isento por ser microempresa, cumpra tudo como se não estivesse, e registre a isenção apenas como informação.
- Reino Unido: Equality Act 2010 (ajustes razoáveis).
- Canadá: Accessible Canada Act, AODA de Ontário (Integrated Accessibility Standards) e as regras de Quebec.
- Brasil: Lei Brasileira de Inclusão (Lei 13.146/2015, art. 63), eMAG e ABNT NBR 17225.
- Outros mercados relevantes: Disability Discrimination Act 1992 (Austrália), JIS X 8341-3 (Japão) e IS 5568 (Israel).
2. Declaração de acessibilidade: crie a página pública /accessibility, em inglês americano, honesta, com as normas adotadas, o que já foi testado e como, as lacunas conhecidas, a data da última revisão e um canal de contato (support@marktmorgen.com) com prazo de resposta que o dono possa cumprir sem trabalho manual extra. Ligue-a no rodapé de todas as páginas e cumpra o que o European Accessibility Act exige sobre a informação de acessibilidade do serviço.
3. Ferramentas para os criadores superarem as leis deles: texto alternativo assistido, verificação de contraste do tema, aviso de vídeo sem legenda, legendas e transcrições com teto automático, orientação para PDF e EPUB acessíveis e um modelo de declaração de acessibilidade da loja do criador. Toda ajuda por IA respeita a regra dos 60% e tem teto automático.

PARTE C — Prova e testes:
1. Cobertura de 100% das páginas: o CI gera, a partir do código, a lista de todas as rotas, páginas e subpáginas (app/ inteiro, inclusive rotas dinâmicas, com dados sintéticos) e falha se alguma não tiver registro de auditoria com o estado de cada critério AAA em docs/accessibility-inventory.json. Página nova sem auditoria não pode ser mesclada.
2. Testes automáticos (sem serviço pago): axe com todas as regras AA e AAA, Playwright em Chromium, Firefox e WebKit, nas larguras 320, 390, 768, 1280 e 1920 px, com teclado, reflow, zoom de 200% e 400%, espaçamento de texto, movimento reduzido, alto contraste e modo escuro, em todas as páginas e em todas as jornadas: cadastro, criação de produto, publicação da loja, página da loja, checkout, área do comprador, download, curso, comunidade e e-mails. Uma regressão de acessibilidade bloqueia a mesclagem.
3. Verificações que o axe não faz: nível de leitura dos textos, presença de legenda, transcrição e audiodescrição nas mídias do Marktmorgen, PDFs validados contra o PDF/UA e livros digitais contra o EPUB Accessibility, com ferramentas gratuitas.
4. Leitores de tela reais (NVDA, JAWS, VoiceOver e TalkBack), aparelhos reais e testes com pessoas com deficiência: siga o plano de docs/accessibility-real-people-plan.md (item 202); registre o que ainda não foi feito como lacuna, nunca como aprovado. Automação não equivale a leitor de tela nem a teste com pessoas.

É proibido neste item: criar contas, aceitar termos, contratar serviço, pagar qualquer valor, contatar pessoas ou empresas, recrutar participantes e alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a ou a revisão comercial. Testes somente com fornecedores simulados: nenhum e-mail real, nenhuma cobrança real e nenhum registro real de cliente alterado. Nenhuma afirmação sobre lei ou norma sem fonte oficial datada; onde a lei ou a norma tiver mais de uma leitura, siga a que exigir MAIS acessibilidade. Todo texto público em inglês americano. PRs pequenos, um assunto por PR, cada um com prova de falha antes e aprovação depois.

Estado: Parte A em vigor a partir da inclusão (regra gravada em AGENTS.md); Partes B e C na fila. Ao concluir cada parte, registre data e hora de Fortaleza, commits, resultado da suíte completa, publicação e lacunas. Posição vigente: OR: Parte A continua em vigor para tudo; Partes B e C por último, após todo o Bloco B.
   - Histórico OR — estado anterior à atualização documental: Estado: Parte A em vigor a partir da inclusão (regra gravada em AGENTS.md); Partes B e C na fila. Ao concluir cada parte, registre data e hora de Fortaleza, commits, resultado da suíte completa, publicação e lacunas.

Registro de inclusão: pedido integral do dono em22/10/2026, origem `022c8b9f-5470-4d4b-9d5d-88f91dd023fa/Texto colado.txt`, preservado na continuidade. Incluído após concluir a tarefa dos contadores (entrega160). Parte A registrada no mesmo PR em AGENTS.md; Partes B e C permanecem na fila, reaproveitando201/202 e o programa, inventário, matrizes e testes existentes. Não houve execução antecipada das Partes B/C, contratação, contato externo, ativação comercial ou certificação. Alegações jurídicas e versões normativas no pedido são requisitos de pesquisa do dono, ainda a verificar em fontes oficiais datadas; não são conclusões verificadas por esta inclusão. Custo desconhecido reprova,não zero; preços e limites visíveis preservados. Inclusão documental não é entrega funcional nem prova de conformidade.


Registro de publicação — entrega161: PR789 incorporado em `6ac7106278bdb78bbb5f306a1b5ab7ba9cbc69fc`, 22/10/2026 às05:44:30 de Fortaleza; head `1facb1d255ec3f79c195e661119fc68ee9e10ca2`,22/22checks aprovados, árvore testada/incorporada `4005a2a592e5376f9f4670c5d020d95d044017a7`. Produção READY `dpl_4tzYTPF9LS8Z2gP7roKJMotzZh1f` em08:45:42.541Z; marktmorgen.com na versão exata, /,/platform,/pricing,/mission,/library HTTP200 no mesmo deployment. Leitura de acordos preserva referências em respostas desconhecidas/estrangeiras; página mostra indisponibilidade; summary nativo de preços com fronteira de hidratação própria. Sem novos comandos, chaves, TTLs ou mensagens de fornecedor. Fatura de CI/deploy desconhecida, nunca zero; não certifica margem nem conformidade integral. Logs error/fatal: nenhum somente na janela08:41:42.463–08:46:42.463Z.


Falha de verificação preservada — PR794 head`48ddb6c9797632554b86f6009d5e5481704a8bd5`, job119729213675/run39750391633,22/10/2026 05:50:02Fortaleza: home sample2 interaction-to-paint296ms>200ms; samples1/3 144/56ms, demais seis32ms; LCP e CLS aprovados. Diff somente documental. Evidência detalhada: pointerdown4377.5ms iniciou processamento4622.5ms (245ms de espera), handler0.9ms; frame4375.2–4643.2ms com scripts[] e blockingDuration0; única LongTask2635.1ms,110ms, anterior à interação. Portanto esta captura não demonstra trabalho JavaScript longo ou hidratação como causa; não há base para alterar arbitrariamente o produto nem certificar falha de infraestrutura. Correção deste registro separa espera observada de causa não estabelecida. Orçamento200ms e teste intactos, sem esperas artificiais; novo head exige toda a suíte completa. Não reexecutar só o job nem incorporar o head reprovado.


### Payment request person references — prove absence before cleanup

Before: createRequest treated every EXISTS result other than numeric1 as missing and converted unverified SMEMBERS to empty, potentially clearing a person's cap references. Now require exact member array, unique valid IDs and one explicit numeric0/1 per existence check; unknown returns unavailable before reservations, and only verified0 permits existing SREM. Synthetic real createRequest tests cover malformed membership/existence, live/absent references and verified-empty admission path; full CI required. No extra supplier commands, keys, TTLs or emails. Count-coercion admission and write acknowledgements remain unresolved, not certified. Existing unavailable message/HTTP refusal is retained. Accessibility: no UI/creator content change; failed proof uses existing refusal rather than false success. No all-AAA/assistive-tech/legal certification. Actual CI/deploy cost unknown,not zero.

PR793 verify119714278670 falhou08:15:59UTC no heade371eac71d60867f862c74071b2e4186f1df00c7:48checks novos,17falhas porque fixture cus_person_proof/sub_person_proof foi recusada pelo validador de IDs e createRequest retornouopen antes das leituras. Corrigidos apenas IDs sintéticos paraalphanumeric,mais guardas explícitas de assinatura ativa e limitepositivo antes da injeção de falhas. Asserções originais preservadas,não relaxadas;nenhuma mudança de gate/produção por esta correção de fixture. Exigir suíte completa no novohead,sem jobisolado. FaturasCI/deploy desconhecidas,não zero.

PR793 integração explícita do head documental FX794`17942c056848058c257d776db7b028080d47744b`, preservando a entrega161 e FX275 no fim. Aprovação22/22do head anterior2587c46 não autoriza esta nova árvore: exigir toda a suíte no novo head. Sem nova entrega até READY/domínio/versão exata.


Entrega162 confirmada: PR793 incorporado22/10/2026 06:21:31Fortaleza,commit03bdf3f85b3c6866ab70ba108ad6000704546228,head62f5da873ccddd3596916a21ad9f93b84e367336,22/22checks,árvore5a1ea67b8a5a05b0e751a8dc9b9fc182d5b659d5 testada/prevista/incorporada. READY09:22:28.506Z,dpl_Dkj8yo7n1mBukFozttbzFZmnFAMK,marktmorgen.comSHAexato,cinco rotas200mesmoDPL;error/fatal0 somente09:18:08.817–09:23:08.817Z. Referências por pessoa preservadas em respostas desconhecidas deSMEMBERS/EXISTS;somente0numérico comprovado permite limpeza existente. Nenhum novo comando/chave/TTL/mensagem;faturasCI/deploy desconhecidas,não zero. Não certifica admissão atômica,writeacks ou margem. FX275 incluído integralmente na fila pelo mesmo head integrado,sem utilizar checks parciais do PR794.


## FX — Custos fixos 100% no Marktmorgen (22/10/2026)

Decisão do dono, 22/10/2026, 05h10 de Fortaleza: "esqueça Hazelsong". A partir de agora, a Hazelsong não divide nenhum custo da empresa: todos os custos fixos da Solrenning LLC são atribuídos 100% ao Marktmorgen.

REGRA DOS 60% (OBRIGATÓRIA): todo cliente pagante, considerado isoladamente e usando 100% de todos os direitos do plano no pior mês, deve manter margem de lucro líquido MÍNIMA de 60%, depois de todos os custos e de todos os impostos, inclusive os brasileiros; a margem pode ser maior, mas nunca menor, e a mesma regra vale para a empresa como um todo. Custo desconhecido não pode ser considerado zero. Use a leitura que der MAIS imposto (docs/tax-uncertainty.md).

275. [FX1] Atribuir 100% dos custos fixos da LLC ao Marktmorgen

1. Atualize AGENTS.md, CLAUDE.md e docs/cross-product-handoff.md: onde hoje se diz que os custos fixos da LLC são divididos 50/50 com a Hazelsong, passe a dizer que são 100% do Marktmorgen, citando esta decisão com data e hora. Preserve o texto literal do dono e o histórico; acrescente a decisão nova em vez de apagar as antigas.
2. Atualize todo código, teste, script e documento que calcule custos fixos ou a base mínima de clientes pagantes com a divisão 50/50 (procure por "50/50", "Hazelsong", "half", "share" e pelos nomes das constantes usadas), para que cada custo fixo da LLC entre inteiro no Marktmorgen. Isso inclui os impostos e taxas de Delaware e da Califórnia, o agente registrado, o INSS do dono, os domínios, as ferramentas, a caixa de correspondência comercial nos EUA (Stable: 3 meses grátis pelo Atlas e depois US$ 49/mês, ou US$ 24,50/mês se o desconto de startup for confirmado por fonte oficial datada; até essa confirmação, use US$ 49/mês) e os representantes exigidos na União Europeia (GDPR art. 27 e Digital Services Act art. 13) e no Reino Unido (UK GDPR art. 27), com o custo de cada um por fonte oficial datada; sem preço oficial, o custo é desconhecido e reprova.
3. Recalcule e registre a nova base mínima de clientes pagantes e a margem consolidada nos documentos gerados (regenere os que têm script, como docs/margin-alignment-2026-10-18.md, e confira que os testes de documento desatualizado passam).
4. Os testes devem falhar se algum cálculo voltar a dividir custos fixos com a Hazelsong.

É proibido neste item: alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a ou a revisão comercial, e afrouxar qualquer trava para compensar o custo maior. Nada é contratado, assinado ou pago. Testes somente com fornecedores simulados.

Estado: na fila, com prioridade. Ao concluir, registre data e hora de Fortaleza, commits, a nova base mínima, o resultado da suíte completa e a publicação. Posição vigente: OR: prioridade já definida 2/2, após os andamentos e antes do Bloco A; remanescente aguardando o dono conforme evidência histórica de bloqueio por mais de uma hora; não trava os seguintes.
   - Histórico OR — estado anterior à atualização documental: Estado: na fila, com prioridade. Ao concluir, registre data e hora de Fortaleza, commits, a nova base mínima, o resultado da suíte completa e a publicação.

Proveniência: pedido direto do dono nesta conversa; decisão de22/10/2026 às05h10 de Fortaleza, texto literal preservado acima e na continuidade. Incluído após concluir a tarefa em andamento (entrega161), fisicamente depois de todo o histórico e do item274[AX1]. Prioridade sobre recursos novos ainda não iniciados; preserva trabalhos já iniciados. A decisão de atribuição100% é vinculante; a implementação, pesquisa oficial datada, recálculo e suíte completa são trabalho futuro deste item, ainda não concluído. Valores e exigências descritos pelo dono são requisitos de verificação, não novas conclusões jurídicas ou preços oficialmente confirmados por esta inclusão. Nenhuma contratação, assinatura, pagamento, ativação ou mudança de preços/limites/gates. Inclusão documental não incrementa entrega funcional.


Andamento FX275 —22/10/2026: decisão100% anexada emAGENTS/CLAUDE/handoff preservando histórico; registro de custos integrais e testes de cada delta sem divisão; fontes oficiais datadas emdocs/llc-fixed-costs-2026-10-22.md; status gerado de custos totais desconhecidos, base mínima não estabelecida e margem consolidada não aprovada. Comercial review continua null; mais clientes não reparam falha individual da leitura mais onerosa. Documentação de INSS/Delaware/California inteira substitui alocação histórica,sem alterar leitura fiscal/gates. Valores Stable atuais distinguem59mensal e49equivalente anual;descontos não assumidos. Evidência de contratos,câmbio,taxas,reservas,domínios/ferramentas incompleta continua reprovando,não zero. Implementação em verificação,não conclusão nem entrega funcional. Nenhuma contratação,assinatura,pagamento,contato externo ou alteração de preços/limites/flags.


Registro FX275 — PR795 incorporado22/10/2026 07:00:57Fortaleza(10:00:57UTC),commitbad74b1f14c2c435626bee546564fd0c8e19c3fd,head515f535737a9c23fd4ff690b6f8856b747eec217,árvore09c90e8a2f2bf2172f51dcbd7b6e16aee67153ef prevista/testada/incorporada;22/22checks completos aprovados, incluindo regressões de custo integral e documento gerado atualizado. ProduçãoREADY10:01:54.015Z,dpl_AL1nCcjgGfVTRXHCVGNSCQ9UGtcy,marktmorgen.comSHAexato,cinco rotasHTTP200mesmoDPL;error/fatal0somente09:58:15.180–10:03:15.180Z. Mudança interna de registro/cálculo/documentação: contador funcional permanece162,próxima163. FaturaCI/deploy desconhecida,nunca zero.

Estado FX275: atribuição100% implementada e publicada; inventário operacional completo e tetos fiscais/cambiais/reservas ainda não comprovados. Nova base mínima: não estabelecida; margem consolidada: não aprovada. Não declarar o item integralmente concluído nem60%certificado. Lacunas desde09:26UTC: fornecedor/contrato aplicável aos representantes e serviços, cobertura/taxas/FX, domínios/ferramentas completos e reserva; nenhuma cotação/conta/contrato solicitada. Prosseguir somente no que puder ser verificado sem atos proibidos; desconhecido reprova. Histórico literal permanece preservado.


Atualização22/10/2026 07:27Fortaleza(10:27UTC): remanescente FX275 **aguardando o dono**, sem bloquear próximos itens acionáveis. A atribuição100% e os testes já foram incorporados/publicados peloPR795; provas noPR796,22/22checks,merge4cbeb772e62f5fbbe2372898b3400ef193bab83d às07:26:29Fortaleza. O impedimento de evidência operacional persiste desde09:26UTC (>1hora): inventário completo de assinaturas/domínios e condições aplicáveis dos fornecedores, limites de cobertura, taxas/câmbio e reservas não comprovados. PrighterDSA exige contato,que este item proíbe; Stablecobra3USDpor correspondência além30/mês ou360/ano e postagemextra,sem teto completo aprovado; desconto50%por1ano,extensão dependecontato. Fontes oficiais consultadas22/10: https://prighter.com/digital-governance/eu-dsa e https://www.usestable.com/pricing . Nenhum contato/contrato/conta/pagamento realizado. Para fechar o remanescente, o dono precisa fornecer inventário e evidência dos custos/condições/reservas aplicáveis; não há autorização implícita para contratar. Custo desconhecido continua reprovando,base mínima não estabelecida,margem consolidada não aprovada; nenhuma trava é afrouxada. Prosseguir nos itens acionáveis conforme instrução permanente, mantendo este histórico e sem declararFX275integralmente concluído.


### Agreement action receipts — explicit confirmation only

Existing studio client accepted bodyoktrue onHTTPerror and missing email outcomes;unknownsave could falsely sayNothingwassent. Agreement-specific parser requiresHTTPsuccess,ownoktrue,validownidforcreate/revise,andexplicitownsentbooleanforcreate/revise/resend/copy. Unknown result preservescreatorform and asksreload before retry;successful explicitfalse keeps existing saved/emailfailuremessage. Readversionpayload validation remains separate unresolved review,as dobackend writeacks/signature/admission. Synthetic parser tests cover errorHTTP,malformed/inheritedreceipts,missingids/sendoutcomes and validtrue/false. FullCIrequired;no newprovidercommands/keys/TTLs/messages/prices/rights. ActualCI/deployinvoiceunknownnotzero;no margin orAAA certification.


### Agreement editor reads — validate before replacing a draft

22/10/2026: correction implemented on independent codex/agreement-editor-read-shape afterPR798incorporation. Read receipt alone did not validate version; truthy malformed version could overwrite draft fields or crash line rendering. Complete own-field validation now precedes every editor setter: expected latestversion/fingerprint, boundedtitle/body/lines, exactstringquantities andcurrencyamounts/total. Invalid/incomplete/stale payload keeps currentform andreports existing readerror. Acceptedcreatorstrings remain exactly unchanged; no invented defaults or silent truncatedlines. Parser synthetic tests include inherited/missingfields, sparse/malformedlines, staleversions, JPYscale andamountbounds. Full exact-headCI stillrequired; not published or certified. No added providercalls/keys/TTLs/emails, no price/limits/permissions/gatechanges; actualCI/deploycostunknownnotzero. AX274errorprevention applies; automatedchecks cannot certifyallAAA or realassistivetechnology. PR798merge2fea4d635491a14772fde1ea434bfc15e9623024 at07:59:58Fortaleza,22/22andpredicted/tested/actualtree9616ed1f9e669af339e0a9e6c9efe863f7585b1f; productionconfirmationpending,deliverycounter162unchanged.


Entrega funcional163 — PR798 incorporado22/10/2026 07:59:58Fortaleza(10:59:58UTC),commit2fea4d635491a14772fde1ea434bfc15e9623024,head418cf9dba55a9a7270144a6d8de29110c3fd665c,árvore9616ed1f9e669af339e0a9e6c9efe863f7585b1f prevista/testada/incorporada idêntica;22/22checks aprovados. ProduçãoREADY2026-10-22T11:00:56.594Z,dpl_4JBR23QfCcc97cxALk36UhsoVDac,marktmorgen.comSHAexato;cinco rotasHTTP200mesmoDPL. Error/fatal0apenas10:57:16.549–11:02:16.549UTC. Ações deagreements exigemHTTPsuccess e recibo explícito completo;resultado desconhecido mantémrascunho e orientarecarregar. Sem novos comandos/keys/TTLs/emails; faturaCI/deploydesconhecida,não zero. Leitura deversão é próxima correçãoPR799;writeacks/signature/admission continuam fora da certificação. Contador163,próxima164.


PR799 verification interruption22/10/2026: head820202f47a11d7c4ad4ce83a79fbbd7e23672253,Buyer actionAAAwebkit run39767648381/job119787095411 concludedcancelled at11:33:18UTC. Log at11:33:14.490Zreports25cases/125audits/failed0;cleanupfollows. Cancellation cause not established; passing inner summary does not override cancelledjob. No failed product assertion identified; do not invent product fix or count suitecomplete. Preserve standards/thresholds; complete freshheadverification required, no isolatedjobrerun. Actual CIcostunknownnotzero;publication counter163unchanged.


Entrega funcional164 confirmada: {"number":164,"pr":799,"commit":"436047686d5926dac3d5850b190344112a91f6ff","head":"00e9ed397daba5aa7476f623a2fb81341568e659","tree":"97cf657bd883645f419ea54f0d7822684c9fc78f","mergedAt":"2026-10-22T14:27:01Z","mergedAtFortaleza":"2026-10-22 11:27:01","deploymentId":"dpl_AEEPQcBQjyHj5gHKoDqjmPkDky7g","readyAt":"2026-10-22T14:27:42.440Z","domain":"marktmorgen.com","state":"READY","checks":22,"routes":["/","/platform","/pricing","/mission","/library"],"routeStatus":200,"scope":"Validate complete current agreement version, exact fingerprint and bounded currency lines before replacing editor state; unknown preserves draft.","cost":"No added provider calls/keys/TTLs/messages; actual CI/deploy invoice unknown, not zero."}. Histórico do cancelamento anterior preservado;22/22checks completos no novohead,árvoreprevista/testada/incorporadaidêntica. Nenhuma certificação integralAAA/margem. Próxima165.


PR800 verification interruption: head e5acf06494dd857d6f051402a60b8d20a73f4fbf; Studio AAA (webkit), run39796047055/job119883454985 cancelled2026-10-22T14:59:25Z during Ubuntu browser dependency downloads. Log shows libplacebo338 download ignored after delay and liblapack3 download before cancellation; no product assertion reached in this excerpt, cancellation cause unconfirmed. Do not count partial checks as complete. Preserve all gates and thresholds; full fresh-head CI required, no isolated rerun. Actual CI invoice unknown, not zero. Published functional164 unchanged.


CI environment repair22/10/2026: repeated30-minute WebKit dependency-install cancellations (Studiojob119883454985/run39796047055 andBuyerjob119900795040/run39800859312),lastlogUbuntu packages beforecancel,not productassertion. Buyer/Studio matrices now use official mcr.microsoft.com/playwright:v1.56.1-noble with preinstalledbrowsers/OSlibraries,matching existingexactplaywright-core1.56.1; mismatch fails beforebuild. Official https://playwright.dev/docs/docker and https://playwright.dev/docs/ci checked22Oct2026. All3engines,30minutecaps,testscripts/assertions/thresholds remain;no isolatedrerun,no passingclaimuntilcompletefreshheadCI. No new paidservice/account/runtimeexpense;GitHubhostedrunnerunchanged,actualCIinvoiceunknownnotzero;no claimofcostsavings orapprovedmargin. InternalCIrepair doesnotincrementfunctional165. FullAAA/realATnotcertified.


CI repair verification84bc2429600d892d3d127db4e38345b8a439490c: BuyerFirefox119919689323 andStudioFirefox119919689029 failedbeforetests; Firefox reports currentroot user mismatches mountedhome ownedbypwuser. Container now explicitly runs as pwuser to match that ownership; no HOMEoverride, no sandboxdisable, no test/threshold removal. Complete freshheadCI required; previousfailure retained, no isolatedrerun. No newpublication or functionalcounterincrement.


CI repair scope extension22Oct2026 13:09Fortaleza: exactheadb16d3a3ba5ae5c5322909aab617d1c0055c23708 passed21/22, including all Buyer/Studio engines after pwuser correction. Remaining PublicWebKit job119922569193/run39806742439 still installing OS dependencies since15:40:17UTC; build/product assertions not started at16:09UTC. Extend the same exact1.56.1 official container and package-version guard to Public matrix; preserve all engines, five widths, access modes, scripts, assertions, thresholds and30minute cap. Previoushead is not approved or complete; newhead needs entire fresh suite, never isolated rerun. No functional change/counter increment; invoice unknown,not zero, no savings/margin claim.


Agreement editor motion audit22Oct2026: loading a new version forced smooth scrolling regardless of reduced-motion preference. Change the existing requested return to the editor to instant scrolling, avoiding interaction-triggered scroll animation for everyone, including reduced-motion users and when CSS scroll-behavior is smooth. Creator text, identifiers, focus, labels, read validation and server operations remain unchanged. AX274 motion requirement applies; source review proves removal of forced smooth behavior, complete remote CI still required; no manual real-AT or all-AAA certification. No additional provider request, service or runtime spend; actual CI/deploy invoice unknown,not zero. Branch based on PR800 CI repair head for compatible verification; neither pending PR is a functional delivery before exact production confirmation.


Agreement person references audit22Oct2026: createAgreement formerly coerced unverified SMEMBERS to empty and any non-1 EXISTS to missing before SREM. Require exact single membership array, unique valid IDs and one numeric0/1 per existence read; unknown refuses before admission writes, only explicit0 permits existing cleanup. Synthetic actual-createAgreement tests cover malformed/duplicate/missing membership and existence, live/absent references and verified-empty admission. No extra supplier commands, keys, TTLs or emails; unknown uses existing unavailable refusal. Count/admission/write acknowledgements remain unresolved,not certified. AX274 error prevention applies without newUI; full remote exact-head CI required, no localpass or AAA/margin certification. ActualCI/deployinvoiceunknownnotzero. Based on pending801/800, merge prerequisites in order; not a functional delivery until verifiedproduction.


PR802 verification failure preserved: head622dfd1d49d0cabe5f41be96eb0130b9918b5fe0, Cross-browserFirefox job119942893146/run39812691249,16:22:41UTC22Oct2026. path-return.mjs first mocked edit timed out30s filling One line about it after Edit name and description click. DetailsForm already disables opener until hydrated; evidence does not establish cause or justify arbitrary product change. Add failure-only synthetic diagnostics: URL, details DOM, pageerrors and RSCbody completion metadata, then rethrow original failure. No retry, timeout increase, sleep, skip or assertion removal; entire fresh-head suite required. Diagnostic success alone will not certify a causal product fix. No local tests or publication; costunknownnotzero.



PR800 internal CI repair incorporated22Oct2026 13:42:55Fortaleza,commit50813efb8c2d5f457b30fbeb1a917d08cb09a666,head9ffce596509d1aa5bf66528f737453cd00dfac5f,all22checks,tree3cd68f68e886288dacba542993da7b1f215d6d3c predicted/tested/actualequal. Production READY dpl_GbPQREsF2zRj38Tuzxkpz6CHTmxf at2026-10-22T16:45:06.248Z,marktmorgen.comexactSHA andfive routes200sameDPL. InternalCIchange,no functionalincrement;164unchanged,actualinvoiceunknownnotzero.

PR801 interruption7053d89b21f65d2fb001ed1ebd5a6d5c63716695: SignupWebKit job119940005061 cancelled16:42:01UTC. Detailed stages: OS/browser install16:12:10–16:38:18 (>26minutes),builduntil16:40:01,syntheticmatrix16:40:01–cancel. Thus only~2minutesremained forproductchecks; not an assertionpass or provenproductfailure. Apply the alreadyverified exact1.56.1 official container/pwuser/packageguard to Signup, retaining disposablelocalHTTPScertificate,all3engines,5widths,accessmodes,30mincap andeveryassertion. FreshcompleteheadCIrequired,no isolatedrerun;no savings/marginclaim,newpaidserviceorfunctionalcount.


PR802 mobile verification failure preserved: headedf5664d94379e648b21e44bfab910acade9fad8,job119948307617,22Oct2026 16:29:44UTC,home sample1interaction216ms>200;otherhome88/64,allotherrouteinteraction<=64,LCP/CLS pass. Firstpointerdowninputdelay134.7ms,handler20.6ms;frame188.8msblocking138.6,delegatedReactpointerdown16ms/pointerout15.9ms,forcedlayout0. SummaryalreadyhasindependentSuspenseboundary; cause not established, do not claim a product performance fix or relax200ms. Diagnostic head also passed Cross-browserFirefox, but originaltimeoutcause remains unknown,notcertifiedfixed. Incorporate prerequisite801 signup environment repair and800proof preservingbothhistories; whole newheadCIrequired, no isolatedrerun or partialpass. Actualinvoiceunknownnotzero.


PR802 Firefox failure reproduced on1ddc5fc5038dc47583a835ab6eba785f6a7df8f5,job119959680527,16:57:37UTC: second edit afternavigation timedout; captured ownstoreURL,errors[],enabled opener stillclosed. Earlier claim initialhydration alone insufficient; exactframeworkcauseunknown. Replace JS-only DetailsForm opener with native details/summary and pre-rendered labeledform; browser controls expansion directly, Save/Cancel explicitlyclose, closedformvalues follow refreshedprops. Existing validation/errors/suppliercalls unchanged. Path regression still requires singleaction then openstate, originalfill/save/refresh/serverpersistence assertions,30stimeout andall widths preserved; diagnosticcapture retained. No retries/sleeps/skips ortestweakening. FullfreshheadCIrequired; no completeAAA/AT certification, no additionalservice/providerexpense,actualCIinvoiceunknownnotzero. Prior mobile216msfailure remains recorded,not claimedfixed bynativeeditorchange.


PR802 product-matrix failure4b88582418f047be3c39211c4d236703d19c1b60 preserved: WebKitjob119964812491,22Oct2026 17:06:38UTC,768pxtext-spacing,product-title-newfilltimeout30s;25cases1failure. Add opener was server-rendered enabled while its only opening behavior needsReact. Disable that action until its own useSyncExternalStore hydration snapshot is ready (SSRfalse/clienttrue); retainfullcap,clickhandler,labels,existingmatrixclickandfillassertions,allwidths/modes and30stimeout. This closes a demonstrated code-level readiness gap; the prior capturedtimeoutalone doesnotprove exclusivecause. Entire freshheadCIrequired,no isolatedrerun/retry/sleep/skip. Native details editor correction retained. No new providerrequest/service/costpolicy;actualCIinvoiceunknownnotzero, no completeAAA/AT/margincertification.


PR802 buildfailure61613551bf26c2b6477de9f91c08637bfc43652b,Firefoxjob119970776843,17:14:11UTC: TS2304editorReadyoutofscope atproduct-editor2235. Agent placed readinesshook atfirstuseStudioStore inanothercomponent. Correctedbinding toProductEditorownscope,removedunusedwrongbinding; guard andalltestassertionsunchanged. FullnewheadCIrequired,no isolatedrerun;previousfailurepreserved. This isimplementationerror correction,not supplier/infra blame;no publication orfunctionalcount.


PR801 WebKit failure84f8bcec302e7d7fdf2696e36f884b9dd2cccbf8,job119958896523,17:18:05UTC: final no-page-threw assertion caught Fetch API access-control failure on background /studio/funnels?_rsc=VbcVg8WGOR-oAnYL; all preceding checks passed, not a fullpass. StudioTools defaulted to automatic viewport/hover prefetch for private routes. Disable automatic prefetch for tool links; real link navigation, labels, URLs, keyboard behavior and all assertions unchanged. InstalledNext16.3.8Linkguide confirms AppRouterfalse disablesviewportandhoverprefetch; noerrorfilter/testskip/retry/sleep. This removes unsolicited privatepagework, not a claim of exclusiveframeworkcause or measuredcostsavings. FullfreshheadCIrequired. No new suppliercost/service/permission/visiblelimit;actualinvoiceunknownnotzero;AAA/AT/legal/margincertificationnotclaimed.


PR802 regression4d7d0b785fe807c13042cd192b9b8ad526526504,Firefoxjob119972150935,17:29:26UTC: Path native editor regression passed, later details-acknowledgment still queried obsoletebuttonrole and expectedfieldremoval. Update selectors toactualnative summary; excludeeditorfromtestsetupwhichopensalldisclosures, assertoneclickopens; matchingconfirmationmustsetnativeopenfalseANDhidefields. Keepallpending/refusal/value/AIrequestassertions andtimeouts unchanged. ExistingAIbrowserflowselectorupdatedlikewise. Testsemantics trackintentionalpersistentnativeform,not skip/weakenbehavior. Integrate801prefetchfixexplicitparentandhistory; fullfreshhead22required,no isolatedrerun;costunknownnotzero.


PR802 security failure48d114150b278f711738d364a53731106c8ee336,auditjob119980794003,17:32:23UTC22Oct2026: high/criticalproductionfinding detected,existinggenericexception hidpackagename/advisory. Keepidenticalrejectconditionanddevelopmentexceptionexpiry; includeonlyblockedpackage,severity,range,viaadvisoryandfixAvailableinerrorforactionableevidence. Noignore/allowlistchange/gaterelaxation;fullfreshheadCIrequired. Publicsearch candidateGHSA-h694-7cp9-m8p3 officiallymoderateandpatched16.3.8,so doesnotidentifythishigh/criticalfinding; do not assumeorupdatepackageblindly. Exactfindingawaitslog,publicationblocked,invoiceunknownnotzero.


Security remediation preparation22Oct2026: exactaudit identifiesnext16.3.8criticalGHSA-2464-fhr4-w9xwandhighGHSA-p3m5-59mp-jv5r,reviewedGitHubadvisoriesupdatedtoday,affected<=16.4.0,patched16.4.1;currentstable16.4.2officialrelease15Octincludespatch. Prepare16.4.2Next+eslintconfig lock ondisposableCIrunner usingnpm package-lock-only ignore-scripts,read-onlycredentials,5mincap; emitpublicpackage-onlydelta forreview/commit,no realprovider/account/submission. Temporarypreparationjobnotapproval; originalauditstillrejectsunpatchedcommittedtree. Removehelperaftercommittinggeneratedlock; fullfreshheadCIandruntimechecksmandatory. No localprocess,dependencyexceptionrelaxation,newserviceorfunctionalcount;actualrunnerinvoiceunknownnotzero.


Security updateprepared22Oct2026 fromsuccessfulreadonlyCIjob119983869856: npm-generated19lockentrydelta reviewed,Next/env/SWC/eslintplugin/config16.4.2,rootmanifestandoptionalTailwindWASIdependencycompletion6entries;existingSharp0.35.5retained. Manifest+lockcommittedtogether,temporarypreparationworkflowremoved. Exactdevelopmentonlyreviewupdatesonlyeslintconfig/pluginpins16.3.8→16.4.2afterreviewinggenerateddev:trueentriesandsamefast-glob→micromatch→braceschain;sameadvisoryGHSA-vfj7-8cjw-p6xm,strictdevclassification/runtimeforbiddenchain,allproductionhigh/criticalrefusal,and18Novexpiryunchanged;no newexception/expiryextension. GHSA-2464-fhr4-w9xwandGHSA-p3m5-59mp-jv5r officialGitHubadvisoriesupdated22Octaffected<=16.4.0patched16.4.1;16.4.2release15Octchecked. All22freshheadchecks,generateddocsconsistency,build/runtime-tracesandbrowserflowsrequired;no securitypassorpublicationclaimeduntilresults. No newservice/providercost;actualCIinvoiceunknownnotzero;flags/prices/limitsunchanged.


### Fechamento da tarefa anterior à reorganização OR — entrega funcional 165

PR #802 incorporado em 22/10/2026 às 15:09:38 de Fortaleza, commit `5270327c3d09e02bcef2a6b65224c9561ec8c3a9`. Head `19e605d6d667cb71757031f0330e5bb739e86c0f`: 22/22 verificações completas aprovadas e árvore testada/incorporada idêntica `bde8f7e45198ee068269ca6750d003c12e0f4f83`. Next.js 16.4.2, confirmação de referências de acordos e edição nativa dos detalhes, prontidão do editor e navegação privada sem prefetch. Deployment `dpl_FKY8uw13CoK7TM4cLzSJBJmRZmM4` READY às 15:12:33.140 de Fortaleza, versão exata em marktmorgen.com; /, /platform, /pricing, /mission e /library responderam 200 com o mesmo deployment. Contador 165, próximo 166. Não houve varredura de logs de runtime nesta entrega; não afirmar zero erros. Custos efetivamente faturados de CI/deploy ainda desconhecidos, nunca zero; nenhuma margem certificada ou gate aberto. Tarefa atual concluída antes de iniciar OR.


### Incorporação do PR #804 e atualização da base documental OR — 22/10/2026

PR #804 incorporado às 16:08:53 de Fortaleza (19:08:53Z), commit `ed12137b2356ea271c76a34d8a55acff0f22bab5`. Head `b90a9493a0db627d1b6d172349e79c4412c4dbd3` passou 22/22 verificações; árvore testada/prevista/incorporada idêntica `896f4bec139a4755ab8f3af87fd3cd725e42e020`. createAgreement só confirma salvamento com dois retornos OK; resposta incerta preserva referências e reserva. Links restantes da home deixam de antecipar rotas, preservando nomes e destinos. Testes sintéticos incluem recibos ausentes/parciais/extras/esparsos/inválidos e sucesso confirmado.

Falha histórica mantida: head c17bc2a, job120007453626, 18:28:37Z, primeira interação da home272ms acima do teto200ms; demais amostras80/88ms e CLS0. Documento registra inputdelay105,1ms e processamento94,7ms; causa exclusiva não demonstrada. Correção e suíte completa no novo head, sem reexecução isolada nem alteração de teto/amostragem. Publicação do804 ainda em verificação; não incrementar contador até READY/domínio/SHA e rotas confirmados.

O head documental anterior do PR #803 (`5d16c5800ac80667ed21be740b14ec5b0d5c7534`) tinha21/22 sucessos formais e WebKit ainda em execução, embora o log de encerramento fosse de18:46:44Z; isso não foi tratado como aprovação. Nova base inclui explicitamente o main incorporado804; o diff do PR OR continua somente documental. A nova árvore exige suíte integral própria. Não atribuir a espera a uma falha global do GitHub: status oficial consultado19:02Z dizia Actions operacional; incidente anterior não prova a causa atual.

Custos: sem comando/chave/TTL/provedor/direito novo; máximo mensal/anual incremental por plano0/0 dentro do envelope existente, não fatura zero. Custos efetivos CI/deploy e tributos desconhecidos seguem reprovados; nenhuma certificação60%, preço/limite/gate alterado. Sem mensagem/pagamento/fornecedor real nos testes. PRs #805 (frete) e #806 (ambiente) permanecem independentes, sem incorporar seus recursos neste PR documental.


Confirmação posterior da entrega funcional166 — verificada em22/10/2026 às16:11:02 de Fortaleza: deployment `dpl_HdG5CgojcvZg5fiEYkZ3PrXGvzKq` READY às16:09:58.937 de Fortaleza (19:09:58.937Z); marktmorgen.com aponta exatamente ao commit `ed12137b2356ea271c76a34d8a55acff0f22bab5`. /, /platform, /pricing, /mission e /library responderam200 com o mesmo deployment. Após22/22 verificações e igualdade da árvore testada/prevista/incorporada, contador165→166 uma única vez; próximo167. Nenhuma varredura de logs de runtime nesta entrega; não afirmar zero erros. FaturasCI/deploy desconhecidas, nãozero; nenhum gate aberto. O registro anterior de publicação pendente fica preservado como estado daquele momento.


### Entrega funcional167 confirmada — frete físico e ambiente de testes (22/10/2026)

PR #805 incorporado às16:34:41 de Fortaleza (19:34:41Z), commit `b45c321dbf4b869877d90a33b9b44c39588545e6`; head `3b0b274762d4852ce2e87dae26194ecd0ef2d1d0`,22/22 verificações e árvore testada/prevista/incorporada idêntica `700d194975f1e1eef5e22558e011e53be424b025`. Preserva explicitamente o commit do PR #806 e o main804, sem aprovar checks parciais de nenhum ancestral. #806 incorporado por essa ancestralidade, sem publicação/contador separado.

Quantia de frete armazenada exige número seguro; null/boolean/string não viram frete grátis. Produto com frete físico não verificável é recusado integralmente na leitura, preservando o registro bruto do criador; não vira digital. Zero numérico explícito, produtos digitais antigos sem frete, SKU opcional corrompido, preços, IDs e idiomas preservados. Integração sintética cobre malformados e caminhos normais, sem fornecedor/pagamento/mensagem reais. Quantidades por variante e reserva atômica do item205 continuam pendentes, não certificadas.

Ambiente do produto usa a mesma imagem oficial Playwright1.56.1noble/pwuser e verificação exata da versão já usada nas outras matrizes; remove instalação repetida de browser/apt. Três motores, cinco larguras, modos, todas as asserções e teto40min mantidos. Testes automáticos não certificam AAA nem testes reais de AT.

Deployment `dpl_Dw4TghB4EP32fAxgKhkkFQzhMC5s` READY às16:36:43.978 de Fortaleza (19:36:43.978Z), marktmorgen.com no SHA exato acima; /, /platform, /pricing, /mission e /library retornaram200 com o mesmo deployment. Contador166→167 uma única vez; próximo168. Nenhuma varredura de logs de runtime: não afirmar zero erros.

Custo operacional incremental máximo mensal/anual por plano0/0 no envelope existente, sem novo comando/chave/TTL/provedor/franquia; isso não é fatura zero. Custos reais CI/deploy/impostos desconhecidos continuam reprovados, nenhuma margem60% certificada. PLANS_ON_SALE=false, preços, limites visíveis, comissão, opt-in, tax gate, art.9a e revisão comercial preservados.

PR #803 permanece exclusivamente documental; sua base agora incorpora explicitamente main805 e exige suíte integral no novo head, sem reutilizar17/22 do head anterior77c17bba. PR #807 (admissão estrita de acordos) preservado em branch sem conflito; atualizado com o mesmo main805 e CI integral pendente, sem alegação de atomicidade. A seção OR continua no fim e a ordem do dono não muda por este registro.

### Entrega funcional168 — preparação independente da página inicial (22/10/2026)

PR #808 incorporado às17:41:38 de Fortaleza(20:41:38Z), commit `6e959aa0c667572a091fd4603f05239f549eeab9`,head `f31596916e280841037c2548d43d5b48b2d529c4`;22/22 verificações formais, árvores testada/prevista/real idênticas `e78fdf67ac14d9ae2d5a78ed2209038432dcba32`. Demonstrações independentes HeroFlow,StudioScreens,FeatureVisual,CreatorShowcase em fronteiras Suspense separadas; três links restantes no rodapé/hero sem pré-carregamento automático. Conteúdo, preços, limites e controles nativos preservados.

Histórico obrigatório: Mobile job120053081786 no head3d139277 falhou em200ms na primeira interação da home. Correção de prefetch sozinha no head5149310/job120057051782 não bastou:224ms,137.5ms de espera pela thread e6.4ms de processamento. Novas fronteiras independentes corrigem trabalho de preparação concorrente; causa histórica exclusiva não certificada. Nenhum limiar, amostra, espera ou asserção alterado. No head final job120061823429:home144/80/64ms;pricing64/40/48ms;sales-pages64/56/64ms,CLS0nas9amostras,LCPmáximo1128ms. Laboratório sintético não é INP de campo nem certificaçãoAAA.

Firefox/WebKit completos usam imagem oficialPlaywright1.56.1noble/pwuser e guarda de versão; remove instalação repetida de apt/browser,preserva dois motores,teste completo,build,asserções e45min. Testes com fornecedores simulados. Sem novo comando/chave/TTL/franquia/provedor operacional; incremento máximo mensal/anual por plano0/0no envelope existente não é fatura0. CI/deploy/impostos efetivos desconhecidos reprovam; margem60% não certificada. Todos os gates permanecem fechados.

Deployment `dpl_Hh3umpUjKk8qCGDQfEdUDkzWqXPq` READY às17:42:30.556 de Fortaleza(20:42:30.556Z);marktmorgen.com no SHA exato acima. /,/platform,/pricing,/mission,/library retornaram200 com mesmoDPL,verificado20:43Z. Contador167→168uma vez;próximo169. Logs de runtime não varridos,não afirmar zeroerros.

PR #807 permanece independente: falha signupFirefox120043124951 no heada45,25casos/121auditorias,1falha1280baseline,formSending e resposta ausente30s. Diagnóstico identificou dependência externa do desafio no fixture local; scriptGET exato agora simulado localmente,sem alterar BotIDprodução. Firefoxcorrigido25casos/125auditorias/0falhas,25provas de desafio local,1emailcapturado/caso,confirmação explícita e loja anônima reais no fixture. Nenhuma conta/mensagem externa. Head807 atualizado com main808exige todos22checks,sem reutilizar21/22anteriores. ORjáconcluída não é reaberta.

### Entrega funcional169 — admissão de acordos verificada (22/10/2026)

PR #807 incorporado em22/10/2026 às18:11:31 deFortaleza(21:11:31Z),commit `6ca2f78e629c6dd6af32c17180921c8d4b01bfe9`,head `4c253ada534eb5d6f44a5165ab3c1143748c53fe`;22/22verificações completas. Árvores testada/prevista/real idênticas `547e51f9b1ba414a68078393eeb699d777425f6e`. createAgreement exige sete respostas inteiras seguras não negativas e recibos explícitos de índices/expiração, contagens positivas antes da reserva/gravação; desconhecido recusa e preserva referências incertas. Limites conhecidos e compensação existentes preservados. Integração sintética cobre formatos/slotsmalformados, ausentes, extras, esparsos, zeros inválidos, salvamento confirmado e ambos limites. Não certifica atomicidade, serialização ou retenção futura.

Falha signupFirefoxheada45/job120043124951 e diagnóstico ficam preservados no registro168. Desafio do fornecedor no fixture local agora respondido localmente noGETexato,sem alterar BotIDprodução; nenhum email/conta/cliente/pagamento real. Todos22checks no headfinal,não reexecução isolada.

Deployment `dpl_FVVVxGnmaGE4kAVNt184VkTbAzNA` READY às18:12:27.315deFortaleza(21:12:27.315Z);marktmorgen.com no SHAexato acima. /,/platform,/pricing,/mission,/library retornaram200 com mesmoDPL. Contador168→169uma vez;próximo170. Logs de runtime não varridos,não afirmar zeroerros.

Sem novo comando/chave/TTL/provedor/franquia; incremento máximo operacional mensal/anual porplano0/0no envelope existente não é fatura0. CI/deploy/impostos efetivos desconhecidos continuam reprovados,60%não certificado. Preços,limitesvisíveis,comissão,opt-in,conteúdodoscriadores,idiomas/IDs,gatesvenda/tax/art9a/revisãocomercial preservados. PR #809somentedocumentalH3/SF preservado; sua integração do main807 exige suítecompleta nova,21/22anterioresnãoaprovação.

### Registro operacional — publicação 170 (22/10/2026)

PR #810 incorporado em22/10/2026 às19h03min29s de Fortaleza (22:03:29Z), commit `bfc4d675c450c83f76b9e18876a0d6de9ec9adf1`. Head testado `d16aa4048c3ca09b83dc7d73f4f0bbd56e7cdff4`: suíte completa22/22 aprovada, árvores testada/prevista/incorporada idênticas `3ac11dc24f99cabe1b3844e904ba98e29b0fabc8`; nenhuma reexecução isolada usada como conclusão.

`markShipped` exige exatamente uma resposta para o único SET NX: resposta externa malformada não autoriza e-mail, releitura, exclusão ou repetição. Testes sintéticos integram respostas malformadas, caminho normal e pedido já marcado. Controles do quadro Mission aguardam os manipuladores do cliente antes de aceitar entrada; consentimento e proteção contra ações simultâneas preservados. A falha anterior do navegador no head690558e foi corrigida e a suíte completa passou no novo head; não se afirma causa histórica exclusiva. Item205 continua incompleto quanto a estoque/quantidades por variante e reserva atômica.

Publicação `dpl_DwEbVxaYfCB5KUXB32gpXvTinRjv` READY às19h05min06,423s de Fortaleza (22:05:06.423Z), domínio `marktmorgen.com` confirmado no commit exato; `/`, `/platform`, `/pricing`, `/mission` e `/library` responderam200 com o mesmo identificador de publicação. Contador169→170 uma única vez; próxima entrega funcional171. Logs de execução não foram inspecionados; não há afirmação de zero erros em produção.

Custos incrementais máximos mensais/anuais por Store, Studio e Scale:0/0, sem novas operações pagas, chaves, retenção ou direitos. Esse incremento não declara faturas existentes iguais a zero: custos reais CI/publicação/provedores continuam desconhecidos e reprovam onde necessários. Todos os custos fixos LLC permanecem100%Marktmorgen; leitura fiscal mais onerosa e margem mínima60% por cliente isolado e global mantidas, sem certificação. PLANS_ON_SALE=false, preços, limites, idiomas, identificadores, permissões e gates preservados. H3276–280 e SF281 permanecem na fila com suas posições aprovadas.

### Registro operacional — publicação 171 (22/10/2026)

PR #812 incorporado às19h53min29s de Fortaleza (22:53:29Z), commit `1eacbc27a8314a00036f33fd5399dd629e75e214`; head `3c7059e20bad821cb8bb1cd8b142bbb6f2fcf2d7`, suíte completa22/22 aprovada, árvores testada/prevista/incorporada idênticas `689087cd4b4978b91f7f116e2328a578d3a27748`. Após falha de compilação TS7022 no teste novo (head2cbc6f1, job120117006426), anotação explícita corrigida; integração no headc1a7b223 encontrou aquisição separada em withStockHold (job120118225927), corrigida no código sem retirar teste. Integração posterior da main811 preservada e suíte completa passou no novo head, sem aprovação por reexecução isolada.

`takeLock` e a aquisição separada do estoque exigem uma resposta externa com exatamente um elemento para o único SET NX. Respostas malformadas não concedem trabalho, checkout, repetição ou exclusão de trava incerta. Teste sintético cobre aquisição direta e withStockHold real, sem chamada ao fornecedor, sem checkout aberto e com apenas um SET em cada recusa; caminho normal de aquisição/liberação mantido. Item205 continua incompleto quanto a estoque/quantidades por variante e reserva atômica; não há certificação do mecanismo de expiração/fencing existente.

Publicação `dpl_95u8WJv8GMWu4dMGKnFJzim4rzXV` READY às19h54min48,988s de Fortaleza (22:54:48.988Z), domínio `marktmorgen.com` no commit exato; `/`, `/platform`, `/pricing`, `/mission` e `/library` responderam200 com o mesmo identificador. Contador170→171 uma vez; próxima172. Logs de execução não inspecionados; nenhuma afirmação de zero erros em produção. Prova documental da entrega170 incorporada pelo PR811 às19h28min30s de Fortaleza, commit `7e09c73a7bcfeaf1342d5f91917a0aae6d9ec78a`,22/22 e árvores iguais, sem incremento funcional.

Custos máximos incrementais mensais/anuais Store, Studio e Scale:0/0 cada, sem operação paga, chave, retenção ou direito novo. Faturas existentes CI/publicação/provedores desconhecidas não equivalem a zero; LLC100%Marktmorgen e leitura fiscal mais onerosa mantidas. Margem mínima60% individual com todos os direitos no pior mês e global permanece obrigatória e não certificada. Preços, limites, PLANS_ON_SALE=false, permissões, idiomas, IDs persistidos e gates fiscais/comerciais preservados. H3276–280/SF281 continuam na fila nas posições aprovadas.

### Registro operacional — publicação 172 (22/10/2026)

PR #814 incorporado às20h51min01s de Fortaleza (23:51:01Z), commit `b57f3af5dd61afe2d409558aabdef716329f1c22`; head `5c6134083a6c1b4e651ef8e8f516d0e371373c39`, suíte completa22/22 aprovada, árvores testada/prevista/incorporada iguais `24d046b44e4ed2294c286b35345e5763a1fab26e`. HGETALL do estoque exige exatamente uma resposta externa antes de validar entradas: leitura desconhecida não anuncia disponibilidade nem abre checkout. Integração sintética stockLeft/withStockHold mantém vazio/ocupado válidos e confirma ausência de checkout/escrita de reserva em resposta malformada. Estoque por variante/reserva atômica do205 continuam incompletos.

Histórico preservado: Mobile job120145086526, head8fa189f, home primeira interação344ms acima do limite200 (LCP1072,CLS0; demais oito amostras passaram). Trabalho React178,7ms e observer26,3ms próximo ao toque, sem causa histórica exclusiva provada; BuyerPath ganhou Suspense próprio e seu linkdemo prefetchfalse. No headc9a4b5b, BuyerAAAWebKit job120147077622 reprovou1280/reduced-motion ao navegar biblioteca→pedidos, erros de acesso em pré-carregamentos/signin?_rsc e/signin?to=login&_rsc; quatro links SiteNavlogin/start passaram a prefetchfalse. Nenhum conteúdo, href, preço, controle, limite200ms, amostra ou assertiva retirado; suíte completa passou no novo head, sem aprovação por reexecução isolada. Medição sintética local não certifica INP de campo, dispositivos/AT ou AAA manual.

Publicação `dpl_G75KpWSv4FDRfdSrb6E9VonU1AwN` READY às20h52min08,633s de Fortaleza (23:52:08.633Z), domínio `marktmorgen.com` no commit exato. `/`, `/platform`, `/pricing`, `/mission` e `/library`:200 e mesmo identificador. Contador171→172 uma vez; próxima173. Logs de execução não inspecionados, sem afirmação de zero erros. PR813 documental incorporado às20h18min29s de Fortaleza, commit `4f9a5b520191c050216e716ce142834d8e874228`,22/22/árvores iguais, sem incremento funcional.

Custos máximos incrementais mensais/anuais Store,Studio,Scale:0/0 cada, sem operações pagas/chaves/retenção/direitos/dependências novos. Faturas existentes CI/publicação/provedores desconhecidas não são zero;100%LLCMarktmorgen, leitura fiscal mais onerosa e mínimo60% individual/global com direitos integrais no pior mês preservados e não certificados. PLANS_ON_SALE=false, preços, limites, idiomas, IDs, opt-in e gates mantidos; H3276–280 eSF281 continuam nas posições aprovadas.

## Entrega funcional 173 — confirmação de estoque e editor de pixels (22/10/2026)

PR [816](https://github.com/viniciussucupira/marktmorgen/pull/816), head testado `7fd1010805f796d040d6ff87b2140abbe06612bf`; 22/22 verificações completas aprovadas. Árvore testada, prevista e incorporada `9c19f38545cb4e1129f17742245c63abf4203a96`. Incorporação real `8b4485ade28445bfa40e2605bb04864a2e522880` em **22/10/2026 22:03:34 Fortaleza** (23/10 01:03:34Z).

Publicação **173**: `dpl_4s3pEMazkTnKDCziMtBNPPNiPgCB`, READY em **22/10/2026 22:04:49.469 Fortaleza**, domínio `marktmorgen.com` confirmou o SHA exato; /, /platform, /pricing, /mission e /library responderam 200 com o mesmo identificador. Contador 172→173 uma vez; próxima funcional174. Logs de execução não foram consultados; nenhuma afirmação de zero erros.

Alterações: confirmação do HSET de reserva exige array externo com exatamente um recibo numérico0/1; 12 respostas externas malformadas exercitam withStockHold real em testes sintéticos, sem repetir operações. Editor de pixels usa details/summary nativo com papel explícito de botão; formulário permanece desabilitado até hidratação, salvamento protegido e confirmação estrita/consentimento/GPC preservados. Não conclui atomicidade por variante ou proteção contra expiração de lock do205.

Falhas preservadas: head8fb3856e1160d42a8eedc3facdfb7b8aed78f1eb, WebKit job120158033405, 22/10 21:15:17Fortaleza: após Change pixels, Meta Pixel ID não apareceu em30s na largura1280;390 passou, causa exclusiva histórica não comprovada. Correção nativa no head a966905543daf4a1d539e9ec3280c79ad6dd30da expôs diferença de papel do summary em WebKit390: job120167088480,22/10 21:36:24.959Fortaleza, locator do botão não encontrado. Papel explícito corrigido no head final; suíte inteira22/22, sem alterar seletores, tempos ou limites.

Custo incremental máximo mensal/anual: Store0/0, Studio0/0, Scale0/0; sem operação paga, chave, TTL, dependência ou direito adicional. Faturas reais de CI/deploy/provedores desconhecidas, não zero.100%LLC atribuídos ao Marktmorgen; leitura fiscal Brasil/EUA mais onerosa,60% por cliente e global vinculantes e não certificados. PLANS_ON_SALE=false, preços, limites, opt-ins e demais gates preservados. Apenas dados/provedores sintéticos; nenhuma mensagem/pagamento/conta externos. Histórico e ordem OR/H3/SF preservados.

## OR — Posição dos pendentes antigos de 19/10/2026 (22/10/2026)

Decisão do dono: 22/10/2026, 14h45 de Fortaleza. Registro documental preparado em 22/10/2026 às 15:18:31 de Fortaleza, após concluir a entrega 165. Esta seção prevalece sobre posições antigas incompatíveis; preserva o histórico e não cria itens nem números.

### Pedido integral preservado

NÃO PARE o que você está fazendo agora: conclua normalmente a tarefa atual. Em seguida, COLOQUE NA FILA, PARA FAZER DEPOIS, a reorganização abaixo. Registre-a em docs/codex-queue.md, no fim do arquivo, depois de tudo o que já existe, numa seção nova chamada "OR — Posição dos pendentes antigos de 19/10/2026 (22/10/2026)", e atualize a linha "Estado" de cada item citado com a nova posição, preservando todo o histórico. Esta reorganização não cria itens novos nem usa números novos: ela só define quando entram itens que já estão na fila.

Decisão do dono, 22/10/2026, 14h45 de Fortaleza: os itens antigos de 19/10/2026 que estão "a fazer" sem posição definida passam a ter a ordem abaixo. A prioridade é, primeiro, o que é necessário para abrir as vendas com segurança e para nunca ter prejuízo; depois, o resto.

REGRA DOS 60% (OBRIGATÓRIA): todo cliente pagante, considerado isoladamente e usando 100% de todos os direitos do plano no pior mês, deve manter margem de lucro líquido MÍNIMA de 60%, depois de todos os custos e de todos os impostos, inclusive os brasileiros; a margem pode ser maior, mas nunca menor, e a mesma regra vale para a empresa como um todo. Custo desconhecido não pode ser considerado zero. Use a leitura que der MAIS imposto (docs/tax-uncertainty.md). Vale para cada item abaixo, antes de qualquer código.

ORDEM DE EXECUÇÃO

1. O que já está em andamento continua primeiro, sem interrupção (hoje: 205 [SH2], 204 [SH1], 203 [TEAMS], 7 [C-UE], 89 [C2-CAPACITY], 4/140/141/88 [B2], 151 a 153 [S10 a S12], 201, 202, HT0, HT10 e HT14).

2. Em seguida, os itens com prioridade já definida: 273 [BK1] e 275 [FX1].

3. BLOCO A — logo depois de 275 [FX1] e antes de 206 [SH3], nesta ordem:
- 7 [C-UE]: concluir, se ainda não estiver concluído.
- 8 [C-UK]: tratamento fiscal do Reino Unido.
- 9 [C-US]: regras estaduais de marketplace facilitator dos EUA.
- 232 [CA1]: fechamento de toda possibilidade de calote dos criadores (antecipado, porque protege contra prejuízo).
- 91 [D2-EU-WITHDRAWAL]: consentimento europeu para entrega digital imediata.
- 98 [D2-COMPLIANCE-REVIEW]: checagem factual de conformidade da loja.
- 114 [E2-AFFILIATE-TAX-FORMS]: formulários W-9/W-8BEN e exportação para 1099.
- 31 [E14]: preços por país sem nenhum preço abaixo do piso do plano.

4. Depois do Bloco A, a fila segue como está: 206 [SH3] até 272 [HM1].

5. BLOCO B — depois de 272 [HM1] e antes das Partes B e C de 274 [AX1], na ordem original dos números: 10 a 16 [D7 a D13], 92 a 97 [D2], 18 a 30 [E1 a E13], 99 a 113 e 115 [E2], 32 a 38 [F1 a F7], 116 a 126 [F2], 39 a 42 [G1 a G4], 44 a 49 [H1 a H6], 127 [H7-CUSTOM-CSS], 50 a 54 [I1 a I3, J1, J2] e 128 a 132 [J1].

6. Por último, as Partes B e C de 274 [AX1]. A Parte A continua em vigor para tudo.

REGRAS DA REORGANIZAÇÃO
- Antes de começar cada item do Bloco B, confira no código e na fila se um item mais novo (203 a 275) ou algo já publicado faz a mesma coisa. Exemplos a conferir: 120 [F2-IMPORTS] com 210 [SH7] e 260 [KJ5]; 52 [I3] com 216 [OP2] e 220 [HL1]; 112 [E2-POINTS] com os pontos já existentes da comunidade; 113 [E2-COMMUNITY-MODERATION] e 122 [F2-COMMUNITY-AI] com 263 [CI1]; 25 [E8] com 226 [HL7]; 109 [E2-EVENTS] e 36 [F5] entre si; 40 [G2] com 228 [HL9]; 27 [E10] com 258 [KJ3]. Se estiver totalmente coberto, marque o item antigo como "absorvido pelo item N", com a prova; se estiver só em parte, faça apenas a diferença.
- 59 [EXCELENCIA] passa a ter o estado "absorvido pelo item 274 [AX1]".
- 17 [D15] (testes reais com NVDA, VoiceOver e TalkBack) passa a ter o estado "aguardando o dono", junto com o plano do item 202, porque depende de pessoas e aparelhos reais.
- Os itens que já dependem do dono ou de terceiros (43, 55, 56, 57, 58, 60, 145, 149, 197 e 198) não mudam de estado.
- Um item que dependa de aprovação externa, conta, pagamento ou da LLC não trava os seguintes: registre o motivo, marque "aguardando o dono" e passe ao próximo.

É proibido nesta reorganização: criar contas, aceitar termos, contratar serviço, pagar qualquer valor e alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a ou a revisão comercial. Testes somente com fornecedores simulados.

Estado: reorganização documental a fazer logo após a tarefa atual, num PR próprio. Ao concluir, registre data e hora de Fortaleza, o commit e a lista final da ordem de execução.

### Ordem final operacional

- Andamentos prioritários: 205, 204, 203, 7, 89, 4/140/141/88, 151–153, 201, 202, HT0 (182), HT10 (196), HT14 (199). Conferir publicações existentes e trabalhar apenas o remanescente; as dependências humanas não travam o trabalho autônomo.
- Prioridades seguintes: 273 [BK1], 275 [FX1]. Permanecem aguardando o dono nos remanescentes já comprovados no histórico; pular enquanto a dependência persistir.
- Bloco A: 7 (somente se incompleto), 8, 9, 232, 91, 98, 114, 31.
- Depois: 206–272 na ordem existente, sem repetir 232, antecipado ao Bloco A.
- Bloco B: 10 → 11 → 12 → 13 → 14 → 15 → 16 → 92 → 93 → 94 → 95 → 96 → 97 → 18 → 19 → 20 → 21 → 22 → 23 → 24 → 25 → 26 → 27 → 28 → 29 → 30 → 99 → 100 → 101 → 102 → 103 → 104 → 105 → 106 → 107 → 108 → 109 → 110 → 111 → 112 → 113 → 115 → 32 → 33 → 34 → 35 → 36 → 37 → 38 → 116 → 117 → 118 → 119 → 120 → 121 → 122 → 123 → 124 → 125 → 126 → 39 → 40 → 41 → 42 → 44 → 45 → 46 → 47 → 48 → 49 → 127 → 50 → 51 → 52 → 53 → 54 → 128 → 129 → 130 → 131 → 132. A sequência dos grupos do pedido foi preservada, sem ordenar todos os grupos globalmente pelo número.
- Por último: 274 [AX1], Partes B e C; Parte A vigente em todos os itens.

59 [EXCELENCIA] absorvido pelo 274 por decisão expressa; isso não declara concluídas as Partes B/C. 17 [D15] aguardando o dono junto ao plano 202; nenhum teste real de tecnologia assistiva é alegado. Estados dos itens 43, 55, 56, 57, 58, 60, 145, 149, 197 e 198 preservados literalmente.

Antes de cada item, inclusive antes de código: margem líquida mínima de 60% por cliente isolado usando 100% dos direitos no pior mês e também globalmente, após todos os custos e impostos brasileiros e americanos, pela leitura mais onerosa de docs/tax-uncertainty.md. Desconhecido reprova. Custos novos exigem cálculo mensal/anual por plano, maior preço pago, tetos e reserva. O registro da regra não certifica a margem atual.

Bloco B exige comparar código, fila 203–275 e entregas antes de iniciar; os exemplos do pedido são verificações pendentes, sem absorção presumida. Cobertura total exige prova e estado “absorvido pelo item N”; cobertura parcial autoriza somente a diferença. Aprovação externa, conta, pagamento ou LLC: registrar motivo, marcar aguardando o dono e seguir.

Estado OR: reorganização documental implementada em PR próprio; incorporação depende das verificações completas do novo head. Somente docs/codex-queue.md é alterado. Sem nova operação de fornecedor, conta, termo, contratação, pagamento ou teste real; preços, limites, comissão, PLANS_ON_SALE=false, tax gate, art. 9a e revisão comercial preservados. CI/deploy efetivamente faturados não reconciliados; desconhecido não é zero. Não conta como entrega funcional.

Registro de implementação documental: 22/10/2026 às 15:19:57 de Fortaleza, PR #803, commit `017502c1586023eeb81c801ecb473ddcb4f6787b`; a ordem final acima está registrada. Incorporação ainda pendente da suíte integral no head final; este horário é do registro/abertura do PR, não de incorporação.


Conclusão e incorporação OR — 22/10/2026 às 17:10:03 de Fortaleza (20:10:03Z): PR #803 incorporado no commit `ed897dd2d455f12cd3488d18b40add843d00df45`, head `0748a4dad5be87e5d7d67c154f6664659bef511d`,22/22 verificações formais completas com sucesso. Árvores testada, prevista e real idênticas `dcc43d37a25f4b9d42ffd9742f585901e793bbf7`; diff exclusivamente docs/codex-queue.md. Ordem final operacional acima vigente, histórico e pedido integral preservados. Estados59absorvido274 e17aguardandoodono, dez itens protegidos sem mudança; nenhuma nova numeração. O registro anterior de incorporação pendente descreve aquele momento e permanece como histórico. Contador funcional167 inalterado, próximo168. Nenhum gate/preço/limite/comissão/opt-in alterado; custo real CI/deploy desconhecido não vira zero, margem60% não certificada.


**Registro da incorporação documental H3/SF — 22/10/2026, 18h42min34s (Fortaleza).** PR #809 incorporado no commit `d47e94d46e98de97886fc9a6f957c3cf3887521b`, após 22/22 verificações aprovadas no head `cb9bb39dcbb7f3ca2f7b041ae33bcd57dcb94931`; árvores testada, prevista e incorporada idênticas (`05e3dedac5b63d79136a49bf900190473ec111cd`). Alteração apenas documental: H3 276–280 e SF1 281 permanecem na fila; SF1 executa logo após 248 [ST1], sem bloquear outros itens. Nenhuma implementação dessas funcionalidades ou entrega funcional contabilizada; contador169, próxima170. Custos reais de CI/publicação desconhecidos não equivalem a zero; margem de60% não certificada.

## H3 — Lições da terceira auditoria da Hotmart (22/10/2026)

Registro documental após conclusão e publicação da tarefa atual na entrega168. Proveniência: pedido do dono de22/10/2026 às15h18 de Fortaleza, auditoria elaborada comGemini; não é fonte factual validada sobreHotmart. Somente fila, sem implementação dos recursos. Próximos números livres276–280 conferidos na fonte canônica; a sequência operacional permanece depois de tudo o que já existia, inclusive OR e AX274B/C.

NÃO PARE o que você está fazendo agora: conclua normalmente a tarefa atual. Em seguida, COLOQUE NA FILA, PARA FAZER DEPOIS, os itens abaixo, na ordem em que estão. Eles devem ser incluídos em docs/codex-queue.md, no fim do arquivo, depois de tudo o que já existe, numa seção nova chamada "H3 — Lições da terceira auditoria da Hotmart (22/10/2026)". Use os próximos números livres depois do último item da fila (hoje, a partir de 276). Ordem de execução: depois de tudo o que já está na fila, inclusive da reorganização "OR" e das Partes B e C do item 274 [AX1]; estes itens não bloqueiam nenhum outro.

Solicitação do dono (22/10/2026, 15h18, horário de Fortaleza): incorporar ao Marktmorgen as melhorias identificadas na terceira auditoria estratégica da Hotmart (hotmart.com), elaborada com o Gemini. Antes de cada item, verifique o código e a fila e implemente apenas o que ainda não existir. Os fatos que a auditoria atribui à Hotmart devem ser confirmados em fonte oficial datada antes de qualquer uso, e os números da Hotmart jamais podem ser apresentados como resultados do Marktmorgen.

REGRA DOS 60% (OBRIGATÓRIA): todo cliente pagante, considerado isoladamente e usando 100% de todos os direitos do plano no pior mês, deve manter margem de lucro líquido MÍNIMA de 60%, depois de todos os custos e de todos os impostos, inclusive os brasileiros; a margem pode ser maior, mas nunca menor, e a mesma regra vale para a empresa como um todo. Antes de qualquer código, calcule o custo máximo mensal e anual de cada item por plano, com teto automático aplicado antes do gasto. Custo desconhecido não pode ser considerado zero. Use a leitura que resultar em MAIS imposto (docs/tax-uncertainty.md). Desde 22/10/2026, todos os custos fixos da LLC são atribuídos integralmente ao Marktmorgen (item 275 [FX1]).

276. [H3-1] Entrar com o Google
   - Estado: **na fila**. Posição: depois de todos os itens existentes, inclusive OR e 274 [AX1] Partes B/C; executar H3-1 a H3-5 nesta ordem. Não bloqueia outros itens.

Hoje o acesso é feito por link enviado por e-mail e por chave de acesso (passkey). Acrescente a opção "Continue with Google" no cadastro e no login, reaproveitando lib/auth.ts e o mecanismo de sessões existente, com os escopos openid e email apenas, sem acesso a nenhum outro dado da conta Google. A conta Marktmorgen é vinculada ao e-mail verificado pelo Google; um e-mail não verificado jamais abre sessão. Mantenha os limites de tentativas, a recuperação de acesso e a opção "Log out of all devices". Construa o recurso com o interruptor GOOGLE_SIGNIN_APPROVED = false, no mesmo padrão de ZOOM_APPROVED, e descreva em docs/google-signin.md, passo a passo, o que o dono precisa fazer no Google Cloud (projeto nimbus-labs-509912, conta 072), sem executar nenhuma ação lá. Entrar com a Apple: somente estudo, porque exige o Apple Developer Program (US$ 99 por ano), que é custo fixo da LLC e depende da aprovação do dono. Atualize a política de privacidade junto com o recurso.

277. [H3-2] Velocidade do checkout medida
   - Estado: **na fila**. Posição: depois de todos os itens existentes, inclusive OR e 274 [AX1] Partes B/C; executar H3-1 a H3-5 nesta ordem. Não bloqueia outros itens.

Meça, em celular simulado e com rede lenta, o tempo entre o clique em comprar e o momento em que a página de pagamento está pronta para receber os dados, em todos os caminhos de compra (página do produto, link de checkout e checkout embutido no site do criador). Crie um teste com limite máximo de tempo (orçamento de desempenho) que faça o CI falhar sempre que houver piora. Corrija o que estiver sob o controle do código do Marktmorgen, por exemplo a pré-conexão aos domínios do Stripe e a redução do processamento anterior ao redirecionamento. A parte servida pelo Stripe não está sob o controle do Marktmorgen: registre-a como tal, sem prometer tempo. Nenhuma afirmação pública de velocidade sem medição registrada.

278. [H3-3] Um link por vídeo curto, com as vendas que cada vídeo gerou
   - Estado: **na fila**. Posição: depois de todos os itens existentes, inclusive OR e 274 [AX1] Partes B/C; executar H3-1 a H3-5 nesta ordem. Não bloqueia outros itens.

A auditoria aponta como lacuna da Hotmart a atribuição de ponta a ponta entre o vídeo curto (TikTok, Reels e Shorts) e a venda. Verifique os links curtos com QR code e a atribuição por canal que já existem e implemente apenas a diferença: o criador cria, com um clique, um link para cada vídeo, identificado pelo nome do vídeo, e vê, por vídeo, as visitas, as compras e a receita, com atribuição por último clique, a partir dos dados que a loja já registra. Não rastreie a pessoa entre sites nem leia dados das contas do TikTok ou do Instagram. Respeite o consentimento e o sinal GPC já implementados. Os números exibidos são sempre os dados reais da loja, nunca estimados nem arredondados para cima.

279. [H3-4] Ações em lote na lista de alunos
   - Estado: **na fila**. Posição: depois de todos os itens existentes, inclusive OR e 274 [AX1] Partes B/C; executar H3-1 a H3-5 nesta ordem. Não bloqueia outros itens.

Verifique o que já existe na lista de pessoas e de alunos do estúdio e complete: filtros por curso, progresso, último acesso e assinatura; seleção de várias pessoas; ações em lote para liberar acesso, retirar acesso, adicionar etiqueta e exportar. O reembolso continua individual, com confirmação, nunca em lote. Toda ação em lote informa antes quantas pessoas serão afetadas, pede confirmação e pode ser desfeita quando a natureza da ação permitir. As ações em lote não podem gerar e-mails, chamadas a fornecedores ou gravações acima da franquia do plano; o teto é verificado antes da execução.

280. [H3-5] Vídeos curtos de ajuda gravados automaticamente
   - Estado: **na fila**. Posição: depois de todos os itens existentes, inclusive OR e 274 [AX1] Partes B/C; executar H3-1 a H3-5 nesta ordem. Não bloqueia outros itens.

Amplie o item 241 [CF4] para a central de ajuda: para cada tarefa principal do estúdio (criar a loja, criar um produto, publicar, conectar o Stripe, criar um curso e enviar um e-mail), grave automaticamente, com o Playwright, em uma loja sintética e sem dados reais, um vídeo curto de até 60 segundos. Cada vídeo tem legendas, transcrição completa e audiodescrição quando necessária, conforme a Parte A do item 274 [AX1]. O CI grava os vídeos de novo sempre que a tela correspondente mudar, para que nenhum vídeo mostre uma tela desatualizada. Calcule o custo de armazenamento e de entrega dos vídeos como custo fixo, com teto.

Regras para todos os itens: interruptor no código, desligado, sempre que o recurso depender de aprovação externa. É proibido criar contas, aceitar termos, contratar serviços, pagar qualquer valor, solicitar aprovações e alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a ou a revisão comercial. Testes somente com fornecedores simulados: nenhum e-mail real, nenhuma cobrança real e nenhum registro real de cliente alterado. Todo texto público em inglês americano, com a acessibilidade exigida pela Parte A do item 274 [AX1]. Nada de depoimentos, números, resultados, escassez ou urgência inventados, nem afirmação de superioridade sobre a Hotmart ou sobre qualquer outro concorrente sem fonte oficial datada.

Estado inicial de todos os itens: na fila. Ao concluir cada um, registre a data e a hora de Fortaleza, o commit, o resultado da suíte completa e a publicação.

Os preços/requisitos de terceiros mencionados no pedido são insumos do dono, a verificar em fonte oficial datada antes de uso ou código; nenhum fato competitivo ou custo foi certificado neste registro. Os gates de margem/custo/aprovação continuam fechados. Para cada conclusão futura: data e hora deFortaleza,commit,suítecompleta,publicação exata. Este registro documental não é entrega funcional.


## SF — Lições da terceira auditoria da Shopify (22/10/2026)

Registro documental posterior ao registroH3 acima; número281, próximo livre após280. Localização física ao fim do arquivo não muda a posição operacional: **logo após248[ST1]**, complementando sem repetir; não bloqueia qualquer outro item. Proveniência: decisão direta do dono de22/10/2026 às17h41deFortaleza. Sem implementaçãoSF e sem certificar afirmações sobreShopify ou métricas de campo.

NÃO PARE o que você está fazendo agora: conclua normalmente a tarefa atual. Em seguida, COLOQUE NA FILA, PARA FAZER DEPOIS, o item abaixo. Ele deve ser incluído em docs/codex-queue.md, no fim do arquivo, depois de tudo o que já existe, numa seção nova chamada "SF — Lições da terceira auditoria da Shopify (22/10/2026)". Use o próximo número livre depois do último item da fila (se a seção H3 já estiver incluída, 281). Ordem de execução: logo depois do item 248 [ST1], porque o complementa; não bloqueia nenhum outro item.

Solicitação do dono (22/10/2026, 17h41, horário de Fortaleza): incorporar ao Marktmorgen as melhorias identificadas na terceira auditoria estratégica da Shopify (shopify.com) que ainda não existam no código nem na fila. Os fatos que a auditoria atribui à Shopify devem ser confirmados em fonte oficial datada antes de qualquer uso, e os números da Shopify jamais podem ser apresentados como resultados do Marktmorgen.

REGRA DOS 60% (OBRIGATÓRIA): todo cliente pagante, considerado isoladamente e usando 100% de todos os direitos do plano no pior mês, deve manter margem de lucro líquido MÍNIMA de 60%, depois de todos os custos e de todos os impostos, inclusive os brasileiros; a margem pode ser maior, mas nunca menor, e a mesma regra vale para a empresa como um todo. Antes de qualquer código, calcule o custo máximo mensal e anual do item, com teto automático aplicado antes do gasto. Custo desconhecido não pode ser considerado zero. Use a leitura que resultar em MAIS imposto (docs/tax-uncertainty.md). Desde 22/10/2026, todos os custos fixos da LLC são atribuídos integralmente ao Marktmorgen (item 275 [FX1]).

281. [SF1] Orçamento de desempenho das lojas dos criadores no celular
   - Estado: **na fila**. Posição: logo depois de248[ST1], sem bloquear outros itens; conferir código/fila e fazer apenas a diferença.

Hoje o teste tests/e2e/mobile-render.mjs mede o desempenho no celular apenas em "/", "/pricing" e "/platform/sales-pages". Estenda a mesma medição, com as mesmas condições de rede lenta e de aparelho simulado, às páginas dos criadores: página da loja, página de produto, página de venda, página de comunidade, página de curso para o aluno e checkout embutido no site do criador. Use lojas sintéticas que representem o pior caso permitido pelo plano mais alto (número máximo de produtos, imagens, vídeos, blocos e idiomas), em todos os temas e predefinições visuais existentes, inclusive o modo escuro. Defina limites para LCP, INP e CLS conforme os valores "bons" publicados pelo Google (web.dev, com data de consulta) e faça o CI falhar sempre que um limite for ultrapassado ou houver piora em relação à medição anterior. Corrija o que causar falha, sem retirar conteúdo do criador nem cortar limites visíveis. Este item complementa o 248 [ST1], que mede a nota das lojas e cria a lista de verificação de SEO: não repita o que o 248 já fizer. Nenhuma afirmação pública de velocidade sem medição registrada.

Regras: é proibido criar contas, aceitar termos, contratar serviços, pagar qualquer valor, solicitar aprovações e alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a ou a revisão comercial. Testes somente com dados sintéticos e fornecedores simulados: nenhum e-mail real, nenhuma cobrança real e nenhum registro real de cliente alterado. Todo texto público em inglês americano, com a acessibilidade exigida pela Parte A do item 274 [AX1].

Estado inicial: na fila. Ao concluir, registre a data e a hora de Fortaleza, o commit, o resultado da suíte completa e a publicação.

Limites e metodologia Google deverão ser consultados emweb.dev e datados antes de implementação. Medição sintética e proxy de interação de laboratório não podem ser apresentados comoINP de campo ou certificaçãoCoreWebVitals. Nenhuma redução de conteúdo/franquia, mudança de preços/gates, conta/termo/contratação/pagamento/aprovação externa autorizada. Custo desconhecido reprova, incluindoCI,armazenamento/entrega e100%LLCatribuído aoMarktmorgen; registro não certifica margem60%.


## Entrega funcional174 — estoque persistido e interação móvel (22/10/2026)

PR818; head `a487a9226b1d0b504abf7c93bc4b250c947f718c`; suíte completa22/22 aprovada. Árvore testada/prevista/incorporada `30991a14d566b00256cdbddea1ea7d3aa17e2c36`; incorporação real `373bce7437e9b4e291ae1bc863de704f5b61181d` em22/10/2026 **23:02:20Fortaleza**. READY `dpl_DcKiMkGjK64BLEcKwUkY8rKVktGd` em **23:03:30.141Fortaleza**; marktmorgen.com confirmou SHA exato; /,/platform,/pricing,/mission,/library200 com o mesmo deployment. Contador173→174 uma vez; próxima175.

parseProduct recusa estoque explícito malformado em vez de convertê-lo em ilimitado, preservando ausência/null e limites numéricos/textuais válidos sem reescrever registros. Regressão sintética cobre tipos/faixas inválidos, formas válidas e dados originais. Homepage SiteNav/SiteFooter em limites de hidratação independentes, conteúdo/controles/SSR preservados. Falha anterior: head ef9dfff78c35791405778e91ebd1409ef83152e0, job120189366511,22/10 **22:33:28Fortaleza**: primeira interação móvel da home200ms, reprovação contra<200; LCP892/CLS0, demais amostras48/32. Trabalho longo coincidiu com interação no summary nativo; causa exclusiva histórica não comprovada. Correção seguida de22/22 no head final; nenhum limite, timeout ou asserção relaxado, nenhum job isolado usado como aprovação. Medição sintética não é INP de campo.

Custo incremental máximo mensal/anual Store0/0,Studio0/0,Scale0/0; sem operação paga/chave/TTL/dependência/direito adicional. Faturas reais CI/deploy/provedores desconhecidas, não zero.100%LLCMarktmorgen, leitura fiscal mais onerosa Brasil/EUA e60% individual/global vinculantes e não certificados; gates/preços/limites/opt-ins preservados.205 atomicidade por variante permanece incompleto. Logs de execução não consultados, sem afirmação de zero erros. Prova documental não incrementa contador.


## Entrega funcional175 — erros legíveis e cabeçalho estável (23/10/2026)

PR821, head `c984bced475a9a14c87c8bb9ea6ea794843977cc`,22/22 verificações completas aprovadas; árvore testada/prevista/incorporada `8aecf71cf950e899afdf3cf4ce4a195729fbaaef`. Incorporação real `aeabb1cf35a10817c8c56db747b00ce329135123` em **23/10/2026 00:28:25Fortaleza**. READY `dpl_DWwKkuCDjLPciyoCdW33eFDVt4rr` em **00:29:09.972Fortaleza**; marktmorgen.com confirmou SHAexato; /,/platform,/pricing,/mission,/library200mesmoDPL. Contador174→175uma vez,próxima176.

PixelEditor usa somente mensagens próprias da tabela para respostas inesperadas __proto__/constructor, preserva explicação existente,rascunho/repetição/confirmação estrita/consentimento/GPC. Fluxo real sintético390/1280 cobre ambos, texto exato e contagens de operações interceptadas, mantendo sucesso/refusa/atribuição anteriores. Não é alegação de poluição de protótipo. Cabeçalho da home deixa de usar fallback de streaming vazio; rodapé conserva limite independente, conteúdo/controles preservados.

Falha anterior preservada: headbe5bb5b39821da118abbaa62ace39626a9a50dc1, Mobilejob120215285610,23/10 **00:00:50Fortaleza**. Homeamostra2CLS0.7909138033175356 em801.9ms: mainy0→138.625 quando chega cabeçalho. OutrasCLS0,todas9interações passaram(home128/48/48). Correção seguida de suíte completa22/22 no novo head, sem relaxar testes,limiares,timeout ou rerunisolado. Medição de laboratório não certifica INP/CWVdecampo.

Custo incremental máximo mensal/anual Store0/0,Studio0/0,Scale0/0; semoperação paga/chave/TTL/dependência/direito adicional. Faturas reaisCI/deploy/provedoresdesconhecidas,nãozero.100%LLCMarktmorgen,leitura fiscal maisonerosa Brasil/EUA e60%individual/global vinculantes,não certificados. PLANS_ON_SALE=false,preços,limites,opt-ins e gatespreservados. Logsdeexecuçãonãoconsultados,semalegaçãodezeroerros. Registrodocumentalnãoincrementa contador;HG/SXordem e estadospreservados.

## HG — Lições da segunda auditoria da HighLevel (22/10/2026)

**Solicitação do dono:**22/10/2026,19h34Fortaleza; segunda auditoria estratégica da HighLevel (gohighlevel.com), elaborada com o Gemini. Inclusão feita após concluir normalmente a tarefa atual (PR818, entrega174). **Ordem de execução:** depois de tudo o que já existe na fila; estes itens não bloqueiam nenhum outro. Antes de cada item, conferir código e fila e implementar somente a diferença ainda inexistente. Os fatos atribuídos à HighLevel exigem confirmação em fonte oficial datada antes de qualquer uso; seus números jamais serão apresentados como resultados do Marktmorgen. Esta inclusão não verifica nem publica tais fatos.

**Regra obrigatória dos60%:** cada cliente pagante, isoladamente, usando100% de todos os direitos do plano no pior mês, e a empresa como um todo devem manter lucro líquido mínimo de60%, depois de todos os custos e impostos, inclusive brasileiros; pode ser maior, nunca menor. Antes de qualquer código, calcular o custo máximo mensal e anual de cada item por plano, com teto automático aplicado antes do gasto. Custo desconhecido não é zero. Usar a leitura que resultar em MAIS imposto de docs/tax-uncertainty.md. Desde22/10/2026, todos os custos fixos da LLC são integralmente do Marktmorgen, conforme275[FX1]. Nenhuma margem é certificada por este registro.

282. [HG1] Relatório de taxas e de valor líquido de cada venda

Estado: na fila.

Verificar os números existentes em lib/stats.ts e implementar apenas a diferença. Acrescentar ao estúdio relatório por venda e por mês com valor bruto, taxa do Stripe, taxa do Stripe Tax, reembolsos, contestações, comissão do Marktmorgen (0% enquanto COMMISSION_LIVE=false) e valor líquido recebido pelo criador, lido somente das transações do saldo da própria conta Stripe do criador, sem escrita. Exportação CSV. Valores em cada moeda recebida, sem conversão inventada. Dado ilegível ou indisponível é informado como indisponível, nunca zero. Leituras com cache e teto por plano, verificados antes da consulta.

283. [HG2] E-mail no aniversário da compra e em datas definidas pelo criador

Estado: na fila.

Permitir programação automática no aniversário da compra de um produto (por exemplo, um ano depois da compra de um curso, para nova edição ou conteúdo complementar) e em datas definidas pelo criador para a loja. Enviar somente a contatos que consentiram em novidades (news igual a yes), no máximo uma vez por contato por data, dentro da franquia de e-mails do plano verificada antes do envio, com descadastro em um clique. Não coletar data de nascimento: usar somente a data da compra já registrada, evitando dado pessoal desnecessário e risco de dados de menores. Nenhuma urgência, escassez ou desconto que o criador não tenha publicado.

284. [HG3] Depoimento em vídeo do comprador

Estado: na fila.

Ampliar avaliações existentes (lib/reviews.ts e lib/review-requests.ts) para vídeo curto de até60segundos gravado ou enviado pelo comprador depois da compra. Consentimento expresso e separado para publicação, guardando texto e data; retirada a qualquer momento com remoção imediata da página. Criador aprova cada vídeo antes de publicar e nunca pode editá-lo ou cortá-lo para mudar o sentido. Cada vídeo publicado tem legendas e transcrição completa conforme ParteA do274[AX1]. Armazenamento e entrega pelo fornecedor de vídeo já usado, contados na franquia de vídeo do plano; tamanho e quantidade limitados antes do envio. Exclusão imediata a pedido da pessoa. Atualizar política de privacidade e termos junto com o recurso.

**Regras comuns:** proibido criar contas, aceitar termos, contratar serviços, pagar qualquer valor, solicitar aprovações ou alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art.9a ou revisão comercial. Testes somente com fornecedores simulados: nenhum e-mail real, cobrança real ou registro real de cliente alterado. Todo texto público em inglês americano, com acessibilidade da ParteA do274[AX1]. Nada de depoimentos, números, resultados, escassez ou urgência inventados; nenhuma superioridade sobre HighLevel ou outro concorrente sem fonte oficial datada. Estado inicial de todos: **na fila**. Ao concluir cada um, registrar data/hora de Fortaleza, commit, resultado da suíte completa e publicação. Registrar a proveniência na continuidade e na fila; esta inclusão não implementa os recursos.


## SX — Lições da segunda auditoria da Skool (22/10/2026)

**Solicitação do dono:**22/10/2026,22h58Fortaleza; segunda auditoria estratégica da Skool (skool.com). Incluída após concluir a inclusão HG. **Execução:** depois de tudo o que já está na fila; não bloqueia nenhum outro item. Antes de cada item, verificar código e fila e implementar somente a diferença inexistente. Fatos atribuídos à Skool exigem confirmação em fonte oficial datada antes de qualquer uso; seus números jamais serão resultados do Marktmorgen. Esta inclusão não verifica tais fatos.

**Regra obrigatória dos60%:** cada cliente pagante isoladamente, com100% dos direitos do plano no pior mês, e a empresa como um todo devem manter lucro líquido mínimo de60% após todos os custos e impostos, inclusive brasileiros; maior é permitido, menor nunca. Antes de qualquer código, calcular o custo máximo mensal e anual por plano com teto automático antes do gasto. Desconhecido não é zero. Usar a leitura de MAIS imposto de docs/tax-uncertainty.md. Desde22/10/2026,100% dos custos fixos da LLC pertencem ao Marktmorgen (275[FX1]). Nenhuma margem é certificada por este registro.

285. [SX1] Pesquisa de satisfação ao concluir um curso

Estado: na fila.

Verificar lib/course-finish.ts e reaproveitar lib/forms.ts: pesquisa curta e opcional na própria tela de conclusão, nota0a10 com a pergunta pública exata **“How likely are you to recommend this course to a friend?”** e campo livre opcional. Criador vê média, distribuição das notas e comentários somente dos próprios alunos. Envio por e-mail apenas a quem consentiu em novidades, no máximo uma vez por aluno por curso e dentro da franquia de e-mails verificada antes do envio. O pedido de avaliação pública existente nunca depende da nota da pesquisa: proibido pedir avaliação pública só a quem deu nota alta ou filtrar negativas. Notas jamais publicadas como prova social sem consentimento expresso; todos os números exibidos são reais.

286. [SX2] Sugestões de temas para posts na comunidade, por IA

Estado: na fila.

Acrescentar ao estúdio, na comunidade, lista semanal de até cinco sugestões de temas geradas somente do conteúdo da própria loja e comunidade: temas dos cursos, perguntas sem resposta e eventos marcados, sem ler dados externos. Criador revisa, edita e publica; nada automático. Rótulo desenhado pela página informa que foram geradas por IA. Cada chamada usa o modelo mais barato vigente (verificado antes de implementar), limita entrada/saída, reserva antes da chamada o custo de orçamento próprio por loja e mês e acerta pelo consumo cobrado. Orçamento esgotado impede geração e é informado no estúdio. Coordenar com21[E4], coach de conteúdo por IA, e264[CI2], resumo semanal da comunidade, sem duplicação.

**Regras comuns:** proibido criar contas, aceitar termos, contratar serviços, pagar valores, solicitar aprovações ou alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art.9a ou revisão comercial. Somente fornecedores simulados em testes: nenhum e-mail real, cobrança real ou registro real de cliente alterado. Texto público em inglês americano e acessibilidade da ParteA do274[AX1]. Nenhum depoimento, número, resultado, escassez ou urgência inventado; nenhuma superioridade sobre Skool ou concorrente sem fonte oficial datada. Estado inicial de ambos: **na fila**. Ao concluir cada um, registrar data/hora de Fortaleza, commit, resultado da suíte completa e publicação. Proveniência preservada na continuidade e fila; nenhum recurso SX implementado por esta inclusão.


### Entrega funcional176 — confirmação de reenvio e menu móvel

PR823, testado891c607cdbb6b92bde2203df286982483c90225a;22/22 verificações aprovadas. Árvore testada, prevista e incorporada9aa54a89f7c04b4c0543bb9a00e558433218d4a4; incorporação ebe02eb055a5bf3beeecd4671c023a099c2d22d3 em23/10/2026 às02:18:42 Fortaleza. Produção READY dpl_8ifS9u78zXcdYicStnujbaE8dXWR em02:19:40.607 Fortaleza, domínio marktmorgen.com no commit exato; /,/platform,/pricing,/mission,/library retornaram200 com o mesmo deployment. Contador175→176 uma vez; próxima177. Logs de runtime não consultados; não há afirmação de zero erros.

Reenvio exige HTTP bem-sucedido, ok booleano exato e ausência de erro contraditório; nomes inesperados usam apenas mensagens próprias. Resposta ambígua/perdida pede conferir antes de tentar novamente; sucesso confirma aceitação para envio, sem alegar entrega.30 cenários sintéticos a390/1280 interceptam todos os POSTs, incluindo erros herdados, falhas, respostas contraditórias e sucesso, com teclado, bloqueio/busy, alertas e contraste real. Menu móvel fechado mantém contêiner/aria-controls e monta seus links/ícones somente quando aberto; testes preservam foco, Escape, rolagem e navegação. Conteúdo, links, direitos e identificadores mantidos.

Falhas preservadas: head ae7768f1d4c3e37157ef47cc6953d685bb7f325b, job120229351688,23/10 às00:51:02 Fortaleza, interação móvel280ms contra<200ms, LCP2188ms/CLS0; corrigida montagem inicial do menu sem alterar limites. Trace correlaciona trabalho React, não comprova causa exclusiva/INP de campo. Na validação seguinte, job120232212640 em01:18:08 e job120238035432 em01:34:32 expuseram referência do novo teste presa ao nome antigo durante Sending…; marcador estável no contêiner corrigiu a cadeia. Job120243052485 em01:52:59 executou todos os30 cenários, mas28 expectativas contavam a região de anúncios vazia como mensagem: exigência corrigida para conteúdo vazio, preservando nó acessível e todas as verificações. Cada novo head exigiu suíte completa; nenhum job isolado, limite/timeout relaxado ou asserção removida.

Cálculo pré-código do incremento máximo mensal/anual: Store$0/$0, Studio$0/$0, Scale$0/$0, por validar a mesma resposta e reduzir renderização oculta, sem nova operação, franquia, dependência, envio ou armazenamento. Faturas reais de CI/deploy/fornecedores continuam desconhecidas, nunca zero.100% dos custos fixos LLC seguem Marktmorgen; leitura mais onerosa e piso60% individual/global não certificados. PLANS_ON_SALE=false, preços, limites, comissão, opt-ins e gates fiscais/comerciais preservados.


## Continuidade técnica — entrega177 e nomes dos planos (23/10/2026 UTC)

Entrega177 confirmada: PR826 merge498d0c3d850d04cd598665c6b899088232114ebb em23/10/2026 às03:47:13Fortaleza(06:47:13Z),22/22headdb916f1bc78c3347043eb65d9abc51903457e55c,árvore4b33a716b84f61ccec945b08919d9007192d42d7testada/prevista/real iguais. Produçãodpl_8vPKKLFXWPJRR4bgYHBJD5n23T97 READY2026-10-23T06:48:03.421Z,domínio marktmorgen.com SHAexato e5rotas200mesmoDPL. Menu troca a alegação obsoleta de três preços por Several prices; máximo50inalterado. Falha móvel anterior preservada na continuidade; suíte integral aprovada no novo head. Sem certificaçãoAAA/INPcampo/margem nem alegação de logs sem erros.

Próxima revisão de clareza: menu ainda chama de Pro as opções de e-mail/domínio, enquanto lib/plan.ts e páginas dessas funções usam Studio. Corrigir apenas os dois rótulos públicos, preservando identificador pro, preços, limites, permissões, opt-in e gates. Suíte22completa obrigatória no novo head antes de incorporar/publicar; ajuste ainda não é entrega178. Sem nova chamada, armazenamento ou fornecedor: incremento máximo mensal/anual0/0porStore/Studio/Scale. FaturasCI/deploy reais desconhecidas,nãozero; leitura fiscal mais onerosa e100%LLC vinculantes,60%individual/global não certificado,PLANS_ON_SALE=false e demais gates mantidos.


## Falha preservada — PR827 (23/10/2026 UTC)

Head1477c8a0bcd1f1d003aea672d63ac2e800edf4dd, WebKit job120283281987 em23/10/2026 às04:07:32.507Fortaleza: formulário Meta Pixel ID não ficou acessível após ativar Change pixels; timeout30s. Texto do menu não prova causa. O summary nativo não expunha a prontidão já usada pelo fieldset. Correção torna essa prontidão explícita com aria-disabled e recusa ativação antes da inicialização; teste aguarda esse estado real, abre por Enter e exige details.open antes das verificações existentes. Não aumenta timeout, remove cenário, repete clique nem enfraquece limites. Nova suíte22completa obrigatória; nenhuma publicação178 confirmada. Mesmas operações e incremento máximo mensal/anual0/0por plano; faturas desconhecidas,nãozero,demais gates preservados.

## Continuidade técnica — entrega178 e revisão201 (23/10/2026 UTC)

Entrega178 confirmada: PR827 merge1a907f0e8babaaa9258f16daf64a204f66149daa em23/10/2026 às04:53:08Fortaleza,22/22head499fd5a90a42ae6de0372d57f6bc94badeb75cbc,árvore64581270284198812a02d811ee6729f419412d0dtestada/prevista/real iguais. Produçãodpl_3WQnay9ew1Rv9PPxtueFMgeyV2d4 READY2026-10-23T07:53:58.154Z,marktmorgen.com SHAexato e5rotas200mesmoDPL. NomesStudio no menu e prontidão do controle de pixels explícita, testeEnter/details.open preservando respostas/consentimento. Falha anterior e integraçãoPR828 preservadas. Sem certificaçãoAAA/INPcampo/margem nem alegação de logs zerados.

RevisãoB2/151: FAQ compartilhada home/preços usa grafia britânica instalment na resposta de contrato. Trocar somente por installment em inglês americano, sem mudar o significado contratual. Item201 reconciliado com prova já existente, preservando estados históricos e lacunas manuais; nenhuma matriz duplicada. Suíte22completa obrigatória neste novo head antes de incorporar/publicar. Sem operação/fornecedor/armazenamento novo: incremento máximo mensal/anual0/0porStore/Studio/Scale. Custos reaisCI/deploy desconhecidos,nãozero; leitura mais onerosa e100%LLC vinculantes,60%individual/global não certificado,preços/limites/opt-in/gates inalterados.

## Falha móvel preservada — PR829 (23/10/2026 UTC)

Head482ceeb806f406f3d1562e2984e75b3dc7ea69dd,job120306932148,23/10/2026 às05:00:31.801Fortaleza: primeira interação fria da home280ms contra teto estrito<200,LCP1264ms/CLS0; outras8interações32–56ms/todasCLS0. Alvo: summary nativo de detalhes dos planos. Traço contém69.2ms em document.ontransitionrun junto da interação; causalidade exclusiva não comprovada. Retirar a transição decorativa200ms do ícone desse controle, preservando rotação instantânea, estado visual aberto/fechado, semântica nativa, teclado, conteúdo e todos os limiares/casos. Não adicionar espera nem rerunisolado; nova suíte22completa obrigatória. Sem publicação179confirmada. Nenhuma nova operação/fornecedor; incremento mensal/anual0/0por plano, custos reais desconhecidos,nãozero,gates inalterados.

## Continuidade técnica — entrega179 e reconciliação151–153 (23/10/2026 UTC)

Entrega179 confirmada: PR829 mergebcf8b21fb4777a971f66189bd2543ca43549cfcd em23/10/2026 às05:29:12Fortaleza,22/22head65d84a8fa7c3cdd03789684ee6e09de0ce44323f,árvored121ef442f7fa5b23a8269e7ed8e3a9f48797c03testada/prevista/real iguais. Produçãodpl_D9ARZGwcRGgkRqzDXwKLCANJQCSG READY2026-10-23T08:29:52.708Z,marktmorgen.com SHAexato e5rotas200mesmoDPL. Inglês americano na FAQ e ícone dos detalhes dos planos sem transição decorativa200ms, comportamento nativo/conteúdo preservados. Falha móvel anterior registrada, sem causa exclusiva alegada, limiares/casos mantidos. Item201reconciliado sem encerrar lacunas manuais.

151–153já existem no código e nos testes atuais, agora reconciliados sem implementação duplicada: verify120309909474 confirma390/1280as seis decisões daFAQhome/preços com links/foco/axe/fit; cinco pares de ações intermediárias; sete missõesPathcom papéis distintos e link. Leitura semAPIwrites. Histórico de estados anteriores preservado. Aprovação automática não certificaAAA/aparelhos/AT/INPcampo/margem. Reconciliação documental apenas, contador179próxima180. Sem operação/fornecedor/teto novo: incremento máximo mensal/anual0/0porStore/Studio/Scale; faturas reaisCI/deploy desconhecidas,nãozero,leitura mais onerosa e100%LLC vinculantes,gates preservados.

### Precisão do estado de Stripe Tax — revisão de 23/10/2026, 06:35 Fortaleza

Correção em implementação, ainda sem publicação: uma resposta HTTP bem-sucedida com estado fiscal ausente, desconhecido ou malformado não comprova configuração pendente. `lib/tax.ts` deve manter `unknown` nesses casos; apenas `active` confirma prontidão e apenas `pending` confirma configuração incompleta. A rota existente mantém a gravação bloqueada quando o estado não é `active`. Cobertura sintética da função real inclui respostas escalares, nula, lista, objeto sem estado, erro em HTTP 200 e estado desconhecido, preservando os testes de checkout e os estados válidos.

Escopo: precisão da configuração Stripe Tax do criador, sem concluir A7/EU ou A8/UK, sem registro fiscal, submissão externa ou mudança de art. 9a, `tax-gate`, preços, limites, opt-in ou `PLANS_ON_SALE=false`. Envelope incremental antes do código: Store, Studio e Scale = 0 mensal / 0 anual; nenhuma nova chamada, repetição, persistência, fornecedor ou serviço. Mantida a única consulta existente. Tetos e reservas vigentes não mudam. Faturas reais e custos completos de retenção, registro e recolhimento continuam desconhecidos e reprovados; nenhuma certificação de 60% líquido sob a leitura mais onerosa e 100% da LLC. Exige suíte completa no novo head antes de incorporar; contador permanece 179, próximo 180.

### Publicação funcional 180 — precisão do estado de Stripe Tax

PR #832: https://github.com/viniciussucupira/marktmorgen/pull/832 . Head testado `b5d96d38939a800459c7586e44095875cc33eee6`; 22/22 verificações completas aprovadas. Árvore testada, prevista e incorporada idêntica: `23646f11c04c744625cc853fc299938d69119643`. Incorporação real em 23/10/2026 às 07:12:45 de Fortaleza; commit `83e57c6b9492f77a94cb86eab6472959d8fd843b`. Publicação `dpl_HnuWw2xYi7NYgYcKHsVzE6f9j7qH`, READY às 07:14:24.302 de Fortaleza. Domínio `marktmorgen.com` confirmou esse commit; `/`, `/platform`, `/pricing`, `/mission` e `/library` responderam 200 com a mesma publicação antes de incrementar 179→180. Próxima entrega funcional: 181.

Respostas HTTP 200 sem estado reconhecido permanecem `unknown`; apenas `pending` indica configuração incompleta. Dez casos malformados e `pending` sem detalhes passaram contra a função real no job 120346326633; estados válidos e testes existentes preservados. Nenhum fornecedor real foi chamado pelos novos casos. Custo incremental mensal/anual: Store 0/0, Studio 0/0, Scale 0/0, sem nova chamada, repetição, escrita, serviço ou franquia. Faturas reais continuam desconhecidas, não zero. Leitura mais onerosa, 100% da LLC e regra de 60% individual/global permanecem vinculantes e sem certificação. Não conclui A7/A8, não abre vendas, não muda preços/limites/opt-in/art. 9a/tax gate. Não foi consultado log de execução em produção nem alegada janela sem erros.

### Stream — validação de confirmação e falha preservada, 23/10/2026, 07:41 Fortaleza

PR #834 em diagnóstico, sem incorporação nem entrega funcional. Head rejeitado `4d274110eeef85a3dbb47d893bef8c9eb2004d02`: job WebKit Product action AAA 120367736913 falhou em 23/10/2026 às 07:37:20.657 de Fortaleza no caso 1280/text-spacing; após clicar em “Add something to sell”, `#product-title-new` não apareceu em 30 segundos. Matriz: 25 casos, uma falha, 72 lacunas declaradas. Causa ainda não comprovada. Não reexecutar só o job nem afrouxar casos, espera, limites ou asserções.

A correção Stream exige resposta exatamente `["OK"]` para a tentativa existente SET NX EX30 antes da consulta ao fornecedor; 11 respostas malformadas/negativas são simuladas na função real, sem consulta ou repetição. Custo incremental mensal/anual por Store/Studio/Scale: 0/0 em cada, sem novo comando, chave, TTL, serviço, franquia ou fornecedor. Faturas reais desconhecidas, não zero; nenhuma certificação de 60% líquido. O novo head integra o main documental #833 e acrescenta diagnóstico limitado da abertura do formulário, mantendo todos os casos e operações sintéticas; instrumentação não é prova de correção da falha. Exige suíte completa no novo head e diagnóstico antes de declarar conclusão. Contador 180, próximo 181; vendas e gates preservados.

### Publicação funcional 181 — confirmação antes da consulta de vídeo

PR #834: https://github.com/viniciussucupira/marktmorgen/pull/834 . Head final `4a145a9d9da3a1763bb069b2c2f139d8e022f8d7`, 22/22 verificações completas aprovadas. Árvore testada, prevista e incorporada: `5b2edfe35f2952fa4e6f1b974e6119288f196c01`. Incorporação real em 23/10/2026 às 08:11:01 de Fortaleza; commit `e54f822a4ab797e933943d296db78a25fc29e4d5`. Publicação `dpl_6ASRDPAsHsD8qjP8xgxhefmStc2h`, READY às 08:12:20.498 de Fortaleza; domínio `marktmorgen.com` confirmou o commit e as cinco rotas `/`, `/platform`, `/pricing`, `/mission`, `/library` responderam 200 com a mesma publicação antes de incrementar 180→181. Próxima entrega: 182.

Onze respostas malformadas/negativas ao SET NX EX30 não autorizam consulta ao fornecedor nem repetição; job 120372656187 comprovou os casos na função real. O cenário WebKit 1280/text-spacing antes falho passou com criação, recarga, publicação explícita e três escritas locais esperadas; job 120372165932, 25 casos, zero falhas, 75 lacunas abertas. A causa intermitente anterior não foi comprovada; instrumentação não é declarada correção dela. Falha anterior e diagnóstico permanecem no histórico. Nenhuma asserção, cenário ou limite de tempo foi afrouxado; não houve reexecução isolada.

Custo incremental mensal/anual Store 0/0, Studio 0/0, Scale 0/0: mesmo comando/chave/TTL e nenhuma nova chamada, serviço ou franquia. Faturas reais desconhecidas, não zero. Leitura mais onerosa e 100% da LLC preservados, sem certificação de 60% líquido individual/global, AAA ou teto de bytes. Não conclui 232 nem abre vendas. Logs de execução em produção não foram consultados; nenhuma janela sem erros é alegada.

### CA232 — configuração Connect documentada e testada (PR #836)

Incorporado em 23/10/2026 às 09:09:17 Fortaleza: merge `8745a9b0d9f912807db52cfc57ac46257c6ac5b7`, head testado `4535859fe735d539c61b4c2c53db53bbdcbf9994`, árvore testada/predita/real `2763eaea329da2b448449b180cf9b73361f1920d`, 22/22 verificações completas. O job 120395568523 confirmou em 08:46:50 Fortaleza a configuração real interceptada em todos os países oferecidos: dashboard full, fees_collector stripe e losses_collector stripe, versão fixada, requisição de criação na plataforma e recusa de países inválidos sem requisição. Evidência datada em `docs/no-creator-default.md`; não prova todas as vendas via direct charge nem elimina exposição a inadimplência, reembolso ou disputa. Apenas testes/documentação, sem alteração funcional e sem incrementar o contador 181. Custo incremental mensal/anual US$0/US$0 por Store/Studio/Scale; nenhuma conta ou cobrança real, operação de fornecedor ou serviço adicional. Faturas reais continuam desconhecidas, não zero; CA232 e margem líquida de 60% sob leitura mais onerosa/100% LLC não concluídos.

### CA232 — confirmação de exclusividade antes da cobrança de legendas (PR #837; publicação ainda pendente)

Em 23/10/2026, 08:59 Fortaleza, o head `4117fb026f3d04a46c1ebfb1828c75d5d6e9ab81` passou nas 22/22 verificações completas. `requestAutoCaptions` só prossegue para a cobrança existente e transcrição quando a resposta do SET NX EX 300 é exatamente uma lista com um único `OK`. Resposta incerta recusa sem cobrança, transcrição, repetição ou remoção da chave possivelmente adquirida. Onze casos sintéticos da função real simulam a gravação seguida de resposta malformada; job 120393280806, 08:39:22 Fortaleza, confirmou os onze. Casos anteriores de pagamento, recusa, concorrência e reembolso preservados. Não conclui CA232 integralmente.

Histórico preservado: head `90f5ce81643cc2012d370807083266b6ae4b8969`, job 120387732072, falhou em 23/10 às 08:29:16.410 Fortaleza: WebKit, 1280, text-spacing, abertura do formulário de produto não disponibilizou `product-title-new` em 30 segundos; 25 casos, 1 falha, 72 lacunas. Diagnóstico registrou URL de Studio, um botão habilitado, nenhum erro de página, zero campos de título e respostas RSC de pages/reviews. A correção de runtime desativa somente o prefetch dessas duas entradas de StudioTools, preservando navegação e todas as ações/limiares. A causalidade exclusiva da falha anterior permanece sem prova. O head intermediário `af14a46f868e9fd46b966613eb9560d04dd7385e`, job 120391692477, falhou em 08:35:16.504 Fortaleza por TS2322: boolean inferido no lugar de literal false; corrigido com `false as const` nas duas entradas e nova execução completa. Nenhum head falho foi incorporado e nenhum job foi reexecutado isoladamente.

No head corrigido, o job WebKit 120392766958 confirmou o cenário antes falho em 08:41:10.120 Fortaleza, com criação, recarga, publicação manual e vitrine na fixture descartável; resumo 08:42:12.414: 25 casos, zero falhas, 75 lacunas abertas. Isso não certifica AAA, dispositivos reais, tecnologia assistiva, zoom real de 400%, margem ou ausência de erros em produção. A integração à main vigente e verificação completa do novo head continuam obrigatórias antes da incorporação/publicação; contador permanece 181, próximo 182.

Custo incremental máximo mensal/anual Store US$0/US$0, Studio US$0/US$0 e Scale US$0/US$0: mesmas operações existentes e TTL, sem serviço, chave, franquia, dependência ou operação paga adicional; duas buscas especulativas evitadas. Faturas reais de fornecedor/CI/deploy e exposição completa de CA232 continuam desconhecidas, nunca zero. Leitura tributária mais onerosa, 100% LLC Marktmorgen, reserva/tetos e meta líquida de 60% individual/global permanecem vinculantes e não certificados; preços, permissões, identificadores, idiomas e PLANS_ON_SALE=false preservados.

### Entrega funcional 182 — confirmação de cobrança de legendas publicada

PR #837 incorporado em 23/10/2026 às 09:36:17 Fortaleza; head testado `d173efb5ae0ffd1f208fed66aa17575a4facc197`, 22/22 verificações completas; árvore testada/predita/real `a843b09d2babb0ce1c3600526cad30177d1b4978`. Merge `37e10ed3cf60e1faabc3d605f3780a5859a789ce`, deployment `dpl_DDZXsQry3Wq7H4osTKgWtQcTnrxF`, READY 09:37:06.646 Fortaleza. Domínio marktmorgen.com confirmado nesse SHA e deployment; /, /platform, /pricing, /mission e /library retornaram 200 com o mesmo identificador. Só então contador 181→182, próximo 183.

Legendas automáticas só autorizam a cobrança existente e transcrição após resposta exata de exclusividade, uma única entrada OK; respostas incertas não cobram, não consultam o provedor, não repetem nem apagam a chave possivelmente adquirida. Onze casos da função real cobrem respostas malformadas, preservando os cenários anteriores. Duas entradas do Studio deixam de antecipar navegação, reduzindo buscas especulativas. Histórico de falhas e limites de causalidade preservados acima. Sem certificação integral de CA232/AAA/margem. Incremento mensal/anual por Store/Studio/Scale US$0/US$0, mesmas operações/TTL e nenhum serviço adicional; faturas reais desconhecidas, nunca zero. Leitura mais onerosa/100% LLC e meta líquida 60% individual/global continuam vinculantes e não certificadas; vendas fechadas, preços, limites e direitos preservados.

### CA232 — prova sintética do pagamento de apoio na conta conectada (PR #838)

Incorporado em 23/10/2026 às 10:05:18 Fortaleza: merge `7fdb3ff52fc63271c4025224d2a90079932322a0`, head `a08a141c08f14b0964169e06eb74ab99053e5e63`, árvore testada/predita/real `aa5dd6ed1b0ad5b2b55907ff27a907519839df7b`, 22/22 verificações completas. O teste da função real createTipCheckout agora verifica Stripe-Account do criador, credencial sintética da plataforma atuando na conta conectada e ausência de campos destination/transfer/on_behalf_of. Casos anteriores de valor, idioma, metadados, titularidade e retorno pago preservados. Requisições totalmente interceptadas, sem conta ou pagamento real. Apenas teste e registro da entrega 182, sem incremento funcional; próximo 183. Prova parcial de CA232, não de todas as vendas ou eliminação de exposição. Incremento mensal/anual Store, Studio e Scale US$0/US$0, sem operação paga/serviço/franquia adicional; faturas reais desconhecidas, nunca zero. Leitura mais onerosa/100% LLC e 60% líquido individual/global continuam vinculantes e não certificados.

### CA232 — prova sintética da conta conectada em pacotes (PR #839)

Incorporado em 23/10/2026 às 10:33:49 Fortaleza: merge `3034a113ddfe7c7fd6b7235208aed24dfd764349`, head `0b9f5c4c021d00cbd594376c5b1f8f24f60bbfaf`, árvore testada/predita/real `d71f68bf0e24c913e50c46f748eeebf8f2ca1b37`, 22/22 verificações completas. Teste da função packageCheckout confirma Stripe-Account do criador, credencial sintética da plataforma atuando nessa conta e ausência de destination/transfer/on_behalf_of; casos anteriores de compra, sessões, titularidade, expiração, reembolso e cupom preservados. Requisições interceptadas; nenhuma conta, mensagem ou cobrança real. Somente teste/documentação, contador funcional 182 e próximo 183. Prova parcial, não conclusão de CA232 nem eliminação de exposição. Incremento mensal/anual Store/Studio/Scale US$0/US$0, sem operação paga/serviço/franquia adicional; faturas reais desconhecidas, nunca zero. Leitura mais onerosa/100% LLC e 60% individual/global permanecem vinculantes e não certificados.

### CA232 — conta conectada nas solicitações de pagamento (PR #840)

Incorporado em 23/10/2026 às 10:59:23 Fortaleza: merge `926cb9cb71eb2c2eaaf773ced12017a57528c22c`, head `fb2f278f575bfa6e1d2ee70ebac761c594ea2d03`, árvore testada/predita/real `ad06646b9b1565b8432a62ba63184a371f24bdf0`, 22/22 verificações completas. Teste da solicitação real confirma Stripe-Account do criador, credencial sintética da plataforma atuando nessa conta e ausência de destination/transfer/on_behalf_of. Fluxos anteriores de valores, imposto, admissão, titularidade, repetição, retorno pago, reembolso, lembretes e exclusão preservados. Requisições interceptadas; nenhuma conta, mensagem ou cobrança real. Só teste/documentação, contador funcional 182 e próximo 183. Prova parcial de CA232, sem eliminar exposição. Incremento mensal/anual Store/Studio/Scale US$0/US$0, sem operação paga/serviço/franquia adicional; faturas reais desconhecidas, nunca zero. Leitura mais onerosa/100% LLC e 60% individual/global permanecem vinculantes e não certificados.

### CA232 — conta conectada em produto, adicional, assinatura e carrinho (PR #841)

Incorporado em 23/10/2026 às 11:24:53 Fortaleza: merge `16c5cc70c41bd1cced9a75a54c5470e8ca4f359a`, head `73a1121ed624ac04d4419cba956625ab9f6586b1`, árvore testada/predita/real `3cf2c731bee574e28fd99c1b61790877ea8b4b61`, 22/22 verificações completas. Cada checkout real interceptado do cenário de produto, adicional, assinatura e carrinho agora prova Stripe-Account do criador, credencial sintética da plataforma nessa conta e ausência de destination/transfer/on_behalf_of. Variantes existentes sem imposto e com imposto exclusivo/inclusivo, preço e moeda preservadas. Sem conta, mensagem ou pagamento real. Apenas teste/documentação; contador funcional 182 e próximo 183. Prova parcial de CA232, sem eliminar exposição de financiamento/disputa/reembolso. Incremento mensal/anual Store/Studio/Scale US$0/US$0, sem operação paga/serviço/franquia adicional; faturas reais desconhecidas, nunca zero. Leitura mais onerosa/100% LLC e 60% individual/global permanecem vinculantes e não certificados.

### CA232 — checkout de chamadas na conta de cada criador (PR #842)

Incorporado em 23/10/2026 às 11:55:20 Fortaleza: merge `cac5fe7746e52270930f4d707e5c6b14be715d6a`, head `85cd791ddd41eea3fd51aefc6ee0b0cb7339603b`, árvore testada/predita/real `92849cb3228991defd20b044a9cf1dd95ecf27e6`, 22/22 verificações completas. Cada checkout novo da função holdAndCheckout nas fixtures existentes de agendamento prova Stripe-Account da própria loja, credencial sintética da plataforma nessa conta e ausência de destination/transfer/on_behalf_of. Casos anteriores preservados; nenhum gate Teams ativado e nenhuma conta, mensagem, pagamento ou submissão de calendário real. Não prova todas as variantes nem elimina exposição. Teste/documentação apenas: contador funcional 182, próximo 183. Incremento mensal/anual Store/Studio/Scale US$0/US$0; sem operação paga/serviço/franquia adicional; faturas reais desconhecidas, nunca zero. Leitura mais onerosa/100% LLC e 60% individual/global permanecem vinculantes e não certificados.

### Falha de validação e correção de prontidão do editor de sites — PR #843

Head `636273abf5bdb026c9ad2a0fd46553b0413ff3df` rejeitado: job WebKit 120483764151 falhou em 23/10/2026 às 12:10:14.853 Fortaleza, timeout de 30 segundos em Save sites, que permaneceu desabilitado; tests/e2e/sites-acknowledgment.mjs:35. Sem incorporação e sem reexecução isolada. A análise identificou textarea renderizada no servidor já habilitada antes dos handlers de React; networkidle não prova prontidão de hidratação. Isso é consistente com o texto alterado no DOM sem atualizar o estado do editor, mas não certifica causalidade exclusiva sem trace.

Correção de runtime: textarea de sites e botão de salvar aguardam prontidão do cliente por useSyncExternalStore; save também exige prontidão. Não altera parse, confirmação canônica, rascunho, preços, permissões ou requests. Todos os cenários, timeouts e asserções existentes preservados; novo head exige 22 verificações completas. Incremento mensal/anual Store/Studio/Scale US$0/US$0; sem serviço, operação paga, chave ou TTL novo. Faturas reais desconhecidas, nunca zero; margem de 60% mais onerosa/100% LLC não certificada. Publicação funcional só após READY/domínio/SHA exatos; contador permanece 182, próximo 183.

## CA232 — Regressão sintética de suspensão do assistente (23/10/2026, 12:36 Fortaleza)

Implementação de teste da rotina real syncAssistant: estados past_due/unpaid/canceled persistem suspensão e impedem invocação do modelo; disputa confirmada persiste bloqueio, solicita encerramento e recusa recompra. Todas as respostas Stripe/modelo são interceptadas; nenhuma conta, cobrança ou mensagem real. CI completo pendente no novo head. Cobertura parcial: três faturas recentes não provam todo o histórico; recibos desconhecidos e financiamento por invoice exigem revisão própria. Não certifica margem nem elimina perdas.

Custo incremental Store/Studio/Scale mensal/anual: 0/0; somente teste, sem nova operação de produção, serviço, teto, preço ou permissão. Faturas reais CI/deploy/provedores desconhecidas, não zero; leitura fiscal mais onerosa e meta 60% continuam vinculantes. PR843 segue independente, aguardando validação; contador funcional permanece 182, próximo183.

PR843 incorporado em 23/10/2026 às 12:40:26 Fortaleza: merge `4b5e8493aa09c010b25669c11c6944d79438d8df`, head testado `f2d2643d0ccdba3aad6088d5be6f1e0843af8e07`, 22/22 aprovados e árvore testada/predita/incorporada `dad40ee13510c43028184235a6e9e8f793a8cf8e`. Correção de prontidão da hidratação e consolidação das provas de direct charge. Domínio ainda na versão anterior; entrega183 não contabilizada até READY/exata versão/rotas. Histórico da falha anterior preservado. PR844 integra este main e exige nova execução completa no head integrado.

## Entrega funcional183 — publicação confirmada (23/10/2026)

PR843 incorporado às 12:40:26 Fortaleza; READY às 12:41:24.269 Fortaleza. Domínio marktmorgen.com na versão exata `4b5e8493aa09c010b25669c11c6944d79438d8df`, deployment `dpl_53Sw5qCC18VqACSRTZmQqwYY1jJL`; /, /platform, /pricing, /mission e /library retornaram200 com este mesmo deployment. Head testado `f2d2643d0ccdba3aad6088d5be6f1e0843af8e07`, 22/22 aprovados, árvores testada/predita/incorporada iguais. Campo de sites e salvamento aguardam prontidão da hidratação; rascunho, confirmação canônica e permissões preservados. Contador182→183 uma vez; próximo184. Custo incremental mensal/anual por Store/Studio/Scale0/0, sem serviço/operação adicional; faturas reais desconhecidas, não zero, margem60% não certificada. Histórico da falha anterior permanece acima. PR844 é regressão de teste sem entrega funcional própria; nova execução completa exigida após este registro.

## CA232 — Assistente sem renovação presumida (23/10/2026, 12:44 Fortaleza)

Correção concreta: período expirado não cria mais um pool31dias apenas porque renews=true. A admissão do assistente fecha no fim registrado e reabre com período atualizado; nenhum novo request de fornecedor. Regressão percorre instante exato e quatro pontos após vencimento, pela rotina real askAssistant, verificando nenhuma chamada ao modelo e nenhum pool novo. Período vigente preservado. PR844 continua independente (suspensão por estado conhecido/disputa), sujeito à integração e nova validação completa.

Escopo parcial: status active/período atualizado ainda não prova recibo de invoice quitada; disputa histórica, funding/reserva e reembolsos continuam pendentes em CA232. Não altera acesso a conteúdo comprado, preços, limites, opt-in ou gates de venda. Custo incremental Store/Studio/Scale mensal/anual0/0, nenhuma operação/serviço adicional; faturas reais desconhecidas, não zero; leitura mais onerosa100%LLC e meta60% não certificada. CI completo22 exigido no novo head; entrega funcional só após READY/domínio/versão, próximo184. Prova da entrega183 está no PR844.

PR844 incorporado em23/10/2026 às13:09:53 Fortaleza: merge `b1d829e1582ba985350219818345f2b36c62036b`, head `4f19071961380b7c371a53f029f47fc084b34210`, 22/22 aprovados; árvores testada/predita/incorporada `aa81343733b1a0d6452b9bb815971edf247d1c10`. Job verify120506940626 confirmou às12:44:53 Fortaleza suspensão real por past_due/unpaid/canceled, bloqueio de modelo e disputa confirmada/encerramento/recusa recompra. Apenas teste/documentação; contador183 preservado, próximo184. PR845 integra este main e exige22 verificações completas no novo head.

## Entrega funcional184 — publicação confirmada (23/10/2026)

PR845 incorporado às13:33:25 Fortaleza, merge `3a6d0f97000ec986179363cbd7791bb13043825d`; READY às13:34:41.463 Fortaleza, domínio marktmorgen.com versão exata deste merge, deployment `dpl_3CtokDmNpG1T76o6A9WiB2QdGEpk`. /, /platform, /pricing, /mission e /library retornaram200 com o mesmo deployment. Head `b262b7b08c72ab04c99b65834c7d4136dc6eb725` passou22/22; árvores testada/predita/incorporada `9fe06631e80d6dca1c1e3aa4dc0a42ecd136c903`. Assistente fecha admissão no fim do período registrado e não presume novo pool31dias. Job verify120520354001 confirmou casos às13:14:56 Fortaleza; acesso pago de compradores preservado. Contador183→184 uma vez; próximo185. Custo incremental Store/Studio/Scale mensal/anual0/0 sem nova operação/serviço; faturas reais desconhecidas, não zero; CA232 e meta60% continuam incompletos.

Proveniência consolidada em docs/no-creator-default.md para PR844/845 e lacunas de recibo/reembolso das legendas. RefundCharge aceita HTTP-success sem prova de recibo e chamadores apagam pendência mesmo se falhar; não declarar reembolso concluído nem acrescentar retries/polling/retenção sem custos/tetos/reserva. Revisão sem execução real. Este registro/documentação não é entrega funcional adicional; CI completo pendente no novo head.

## PR846 — falha móvel preservada e reparo de isolamento (23/10/2026)

Head `40531e63b13eef26cd798f88aed9f4e4d8c0d82b` reprovado: Mobile render candidate job120533296662, 13:39:54.077 Fortaleza; home amostra1,390px, CPU4x/rede fria, interação408ms contra teto200ms, LCP820ms/CLS0. Outras amostras home56/40ms; pricing32ms; sales-pages32/32/40ms. Trace registra React document.ontoggle88ms antes de task391ms e segundo clique no summary da lista de benefícios; causa exclusiva não demonstrada. Não incorporar head falho, repetir só job ou aumentar teto.

Fonte: summary e ul já possuem Suspense individuais, mas evento toggle nativo tem details como alvo fora dessas duas fronteiras. Reparo: envolver também o details inteiro em fronteira própria, mantendo as duas internas, todos os itens, textos, preços, IDs e comportamento nativo; evita escalada de hidratação pelo alvo toggle até o restante do card/preços. Hipótese consistente com trace, não causalidade exclusiva provada. Teste móvel e todos os seus cenários/limiares inalterados. Nova execução22 completa exigida. Custo incremental Store/Studio/Scale mensal/anual0/0, sem operação/serviço/retention adicional; custos reais desconhecidos, não zero; meta60% não certificada. Agora PR846 contém reparo funcional, candidato185 apenas após READY/domínio/versão/rotas; documentação isolada não incrementa contador184.

## Entrega funcional185 — publicação confirmada (23/10/2026)

PR846 incorporado às14:10:57 Fortaleza, merge `1d09bb3ff0ca2b8845d838deb348cc78853d2645`; READY às14:11:48.071 Fortaleza, domínio marktmorgen.com versão exata deste merge e deployment `dpl_F3BYyE9gLSnju6xGyYZTUzP6jdKZ`. /, /platform, /pricing, /mission e /library200 no mesmo deployment. Head `997b5e3f252edadc971bc2e5c051c7407537e05f` passou22/22; árvores testada/predita/incorporada `95947796c9b09c00e04e13e52220145415dc3632`. Details de preços isolado na própria fronteira de hidratação; conteúdo/comportamento nativo preservado. Nove medições móveis frias aprovadas: home144/72/96ms, pricing64/40/48ms, sales-pages32/64/64ms, CLS0; proxy sintético, não fieldINP/p75 nem prova de causa exclusiva. Falha408ms anterior permanece no histórico. Contador184→185 uma vez; próximo186. Custo incremental mensal/anual por Store/Studio/Scale0/0 sem nova operação/serviço; custos reais desconhecidos, não zero; margem60% não certificada. Após concluir este trabalho, inclusão documental H5 abaixo no fim da fila; nenhum recurso H5 implementado.

## CA232 — Comprovação de pagamento antes de legendas (23/10/2026)

Regressão sintética adicional do caminho real requestAutoCaptions→chargeNow: onze recibos de pagamento ausentes/incompletos ou status não pago recusam a operação, sem chamada ao fornecedor, um único pay e uma tentativa de void, sem pendência de transcrição criada. Casos de cobrança válida, recusa, exclusividade, entrega parcial e reembolso já existentes preservados. Não prova recebimento líquido, autorização de estorno, reserva de contestação nem todas as cobranças do criador; CA232 permanece parcial. Nenhuma operação real.

Somente teste: custo incremental de produção Store/Studio/Scale mensal/anual0/0, sem novo request/serviço/preço/permissão; custos reais CI/provedor desconhecidos, não zero; margem60% não certificada. CI completo22 exigido, sem entrega funcional adicional; contador185 permanece. Registro H5 em PR847 continua separado e sem implementação de recurso.

PR847 incorporado em23/10/2026 às14:39:57 Fortaleza, merge `cf01b92d37cd746141fa69a9dc257991e5ce0631`, head `a1f25feaf6e47308e46887ab7e12e7ad0d76e4ab`, 22/22 aprovados; árvores testada/predita/incorporada `cbe2f032b3b67beea1f222be216737a2aef51dd6`. H5 registrado no fim apósSQ8, itens298/299 na fila, nenhum recurso implementado; contador185 preservado. PR848 incorpora este main e exige nova suíte completa22 no head integrado. Novas notas de continuidade entram antesH4; H5 permanece no fim físico.

## PR848 — regressão de pagamento incorporada (23/10/2026)

Incorporação às15:08:31 Fortaleza, merge `bcc4178a688d03ad074520d053e9a60a785a2a49`; head `40ffc0297ea163b48a12c67f53b3afa27660c14d`, 22/22 aprovados; árvores testada/predita/incorporada `375ed03427f28b42f4add561432757264f8e3f66`. Onze recibos de pagamento ausentes/incompletos ou não pagos recusam legendas no caminho real sem chamada ao fornecedor, com tentativa única de pay/void; verify final confirmou às14:43:34 Fortaleza. Prova parcial, não recebimento líquido/reserva/estorno confirmado. Somente testes/documentação, contador185 permanece, próximo186. Custo incremental mensal/anual Store/Studio/Scale0/0, sem operação de produção; custos reais desconhecidos, não zero; meta60% não certificada. Concluída a tarefa corrente, registro documental9A apósH5 abaixo; nenhum tratamento fiscal implementado e nenhuma trava alterada.

## PR849 — falha Firefox e correção de sequenciamento do teste (23/10/2026)

Head `64b22e72bfa5b4cea3b11305c22d4b66156e759e` reprovado no job120576836109 às15:23:33.491 Fortaleza: shipment-acknowledgment, cenário missing email status/1280, click de Mark as shipped excedeu30s após localizar botão visível/habilitado/estável. HTTPfailure/truthy-confirmation anteriores passaram. MarkShipped já bloqueia campo/botão até hidratar; log não prova falha de hidratação nem causa exclusiva.

O teste mantinha a resposta POST presa até terminar await click; o clique pode esperar efeitos do envio no Firefox. Correção de sequenciamento: iniciar click, aguardar o POST real, verificar valores/travas/aria-busy enquanto resposta permanece presa, liberar em finally e só então aguardar a conclusão do mesmo click. Permanecem todos os cenários, timeouts30s/15s, contagens exatas, controles e confirmações/recusas; nenhuma asserção reduzida, nenhum retry isolado. Nova execução22 completa no head corrigido. Somente teste/documentação, sem alteração de produto ou incremento funcional; custo incremental Store/Studio/Scale mensal/anual0/0, custos reais desconhecidos, não zero. GH continua pendente até concluir tarefa corrente9A.


### Incorporação documental 9A — PR #849 (23/10/2026)

Incorporado em 23/10/2026 às 15:53:30 de Fortaleza; commit 856cd0bb69d172efc0a5bf00fa950ebd91800d75, head testado 2b6d36fa084ceb954a72b8e58480eb5ffccaeb49. Suíte completa: 22/22 verificações aprovadas; árvore testada, prevista e incorporada 0eae1747836f208f39d3ab76a1f6dfcfc3c94eab. Histórico da falha Firefox e correção do sequenciamento do teste preservados acima. Itens 300–303 continuam na fila; nenhuma funcionalidade 9A ativada. Sem incremento do contador funcional (185). Custo incremental mensal/anual por Store, Studio e Scale: 0/0; faturas reais de CI e fornecedores desconhecidas, não consideradas zero; nenhuma certificação de margem de 60%.


### Incorporação documental GH — PR #850 (23/10/2026)

Incorporado em 23/10/2026 às 16:18:47 de Fortaleza; commit 0842056c87b9c463a772cbdfc7977fa3f4ce6537, head testado 2177e72d92fccfb0e2e059c7f6137b0f593799ca. Suíte completa 22/22 aprovada; árvore testada, prevista e incorporada fc963f78a891c7437d0cf6194296d8e7cc7b29a0. GH1 (304) permanece na fila, sem implementação nem ativação. Registro documental sem incremento funcional (185). Custo incremental mensal/anual Store, Studio e Scale 0/0; faturas reais desconhecidas não são zero, e isto não certifica margem.


### Correção dos controles fiscais — PR #852 (23/10/2026)

Incorporado em 23/10/2026 às 16:43:42 de Fortaleza; commit ae1f858f48d3127eef5a4fda547d13e58c326a37, head testado 02f61ae69cffc89335f45af7298f0328e778dbc4. Suíte completa 22/22; árvore testada, prevista e incorporada 8f66671ee759bbae8493ad75862233adc406f301. TaxEditor só habilita controles após seus handlers estarem prontos, mantendo configurações, opt-ins e travas. Publicação ainda aguardando comprovação de READY, domínio e versão exata; nenhum incremento funcional antecipado. Custo incremental mensal/anual 0/0 por plano, sem novas operações; custos reais desconhecidos não são zero.


### Histórico de falha e sequenciamento do teste — PR #851

Head aa45ca46ee14b687e0f738057486111094ad102a: job WebKit 120620572055 falhou em 23/10/2026 17:05:02.742 Fortaleza, tax-scope.mjs:37, timeout de 30s esperando “Refresh discount codes”. Leitura dos textos fiscais em 390/1280 e ausência de gravações passaram; o log não registrou a asserção do POST simulado de listagem. DiscountEditor já possui readiness via useSyncExternalStore; nenhuma falha desse guard ou causa exclusiva foi provada.

O teste lia texto deliberadamente após domcontentloaded e abria details antes da etapa separada de interação. A correção do sequenciamento espera a navegação ficar ociosa antes dessa interação e exige observar o POST real com {action:"list"}, mantendo o clique, confirmação visual, contagem única e bloqueio de qualquer escrita não simulada. Acrescentado diagnóstico limitado em falha. Nenhum timeout, cenário ou limiar relaxado; nenhuma mudança no produto ou chamada real. Causa exclusiva da falha não afirmada. Novo head exige suíte completa 22/22; não reexecutar apenas o job falho nem aprovar o head anterior.


### Regra permanente contra repetição — PR #853 incorporado

Incorporado em 23/10/2026 17:15:29 Fortaleza, commit 17e12a5b1f629f5cab76ef498545c80abec6ce07, head f5b7fb69d6752211d8a3b973d71c715d8618acc6, árvore testada/prevista/incorporada 97f85b929521cd78bf95fe9651d163dbfb252126, suíte completa 22/22 aprovada. AGENTS.md e início desta fila contêm a regra e a revisão única. Nenhum item duplicado ou renumerado; registro documental sem incremento do contador 186. A confirmação da entrega 186 no início desta fila atualiza o estado histórico “publicação pendente” registrado para #852. Faturas reais desconhecidas continuam não sendo zero.


### Falha móvel e particionamento da hidratação — PR #851

Head e6a90b2bad96a17c8864c8642a3e60226ef3cad8, job 120635155141: primeira amostra da home em 23/10/2026 17:19:52.674 Fortaleza mediu LCP2604ms e interação216ms, ambos reprovados, CLS0. Outras amostras home712/56 e624/40; pricing616/32,616/48,616/32; sales-pages612/32,612/32,628/32. Laboratório frio390px, CPU4x, latência150ms,1.6Mbps, terceiros bloqueados, zero escritasAPI. Proxy sintético, não INP de campo ou p75 certificado.

Trace registra tarefa React589ms antes da interação e117ms sobreposta ao primeiro pointer, no summary nativo das vantagens do plano (scrollY22890); não prova causa exclusiva. Particionadas as seções abaixo do hero e a prova da plataforma em boundaries Suspense próprias, preservando conteúdo SSR, hero, conteúdo dos criadores, preços, limites, direitos e controles nativos. Nenhum novo pedido ou operação paga: custo incremental mensal/anual0/0 por plano; faturas reais desconhecidas não são zero. Novo head exige os mesmos9ensaios e suíte22completa; nenhum limiar, cenário, alvo ou cache relaxado. Não aprovar nem reexecutar isoladamente o head reprovado.


### Falha de foco Firefox e links nativos — PR #851

Head4ddeaa26f45177b0192d065a16bfacc958979020: jobFirefox120638387882 reprovou em23/10/2026 17:42:00.838Fortaleza “HT3 feature keyboard //390”, primeiro link de recurso da seção PricingValue na home: esperadofoco true, obtidofalse; demaislinks e alvos passaram. Origemtests/e2e/pricing-value.mjs, não o teste separado home-modules. As sequências fiscais/descontos e nenhum erro de página passaram, mas o head integral não foi aprovado.

No mesmo head, mobilejob120638388006 passou9amostras: home992/168,596/48,596/56; pricing628/40,600/40,604/32; sales-pages612/32,604/32,628/32 (LCPms/interaçãoms), CLS0 em todas. Evidência parcial, não aprovação do head ou certificaçãoINP/p75.

PricingValue é uma seção estática; seuslinks agora são âncoras nativas com os mesmoshrefs, textos, nomes acessíveis e alvos, removendo a navegação de cliente nesseslinks. Nenhum teste de foco, alvo ou limite foi alterado. O sintoma não prova causa exclusiva de hidratação; correção será avaliada pela suíte inteira e9ensaios idênticos no novohead. ChecklistReact aplicado: servidor permanece servidor, semestado/efeito/request extra, keysestáveis e sem mudança de conteúdo. Custo incremental mensal/anual0/0 porplano, semfornecedor/operaçãonova, faturas reais desconhecidas não são zero. Não reexecutarjobisolado nemmesclarheadfalho.


### PR #851 incorporado e publicação funcional 187 confirmada — 23/10/2026

Incorporado em 23/10/2026 às 18h17m37s (Fortaleza), commit `30dc47816dd204687cf4c6de1fe8d8d9abfcd26b`, head testado `9c9d9da7c423eed27a514dd55ba30422fce713df`, árvore testada e incorporada `3dc0865dbbd5a74cfa8ed430590874d2c60b507d`. Suíte completa: 22/22 verificações aprovadas no novo head após as correções; nenhuma reexecução isolada usada como conclusão. As falhas anteriores e suas evidências ficam preservadas abaixo. Página inicial: seções abaixo do hero isoladas por Suspense; PricingValue usa links HTML nativos com destinos e nomes preservados. O teste fiscal observa o POST simulado explícito de descontos. SY1/SY2/EC1 apenas registrados, sem implementação dessas funcionalidades.

Produção: READY em 23/10/2026 às 18h18m29,911s (Fortaleza), domínio `marktmorgen.com`, versão exata `30dc47816dd204687cf4c6de1fe8d8d9abfcd26b`, deployment `dpl_671tcEAd9rnpK7fB4tJ5YGV2vQrg`; `/`, `/platform`, `/pricing`, `/mission` e `/library` responderam 200 com esse mesmo deployment antes de incrementar 186→187. Nove amostras móveis sintéticas frias: LCP máximo 1148 ms, interação até pintura máxima 136 ms, CLS 0 e zero escritas de API; não equivalem a INP de campo nem certificação p75. Incremento operacional mensal/anual: Store 0/0, Studio 0/0, Scale 0/0; nenhuma nova operação paga. Faturas reais de CI/fornecedores desconhecidas não viram zero; nenhuma certificação da margem de 60%. Gates, preços, limites, conteúdo, identificadores e idiomas preservados.

### Falha de auditoria de dependências e correção — PR #854 (23/10/2026)

O head documental `a0f0e6fcb7de0322de9bb9840c2e529041efeb7c` falhou no job audit 120663109757 às 18h22m24,726s de Fortaleza (21:22:24.726 UTC): Zod vulnerável na cadeia de produção `@vercel/blob → @vercel/oidc → @vercel/cli-config` (4.1.11) e cópia de desenvolvimento 4.4.3. Nenhuma exploração observada ou alegada. Fonte oficial consultada em 23/10/2026: [GHSA-mrhx-c7xc-m3w5](https://github.com/advisories/GHSA-mrhx-c7xc-m3w5), atualizada em 23/10/2026, aponta versões inferiores a 4.6.6; [release oficial 4.6.6](https://github.com/colinhacks/zod/releases/tag/v4.6.6), publicada em 11/10/2026, inclui o reparo de limites de coleções antes de analisar elementos. Metadados e integridade SHA512 da versão 4.6.6 lidos diretamente no [registro npm](https://registry.npmjs.org/zod/4.6.6), sem executar scripts locais.

Correção: override explícito de Zod 4.6.6 e ambas as entradas travadas atualizadas com tarball/integridade oficiais, sem downgrade de Blob, lista de exceções ou redução do critério da auditoria. Instalação limpa, auditoria e suíte completa dos 22 checks devem passar no novo head; não basta reexecutar apenas audit. Incremento operacional mensal/anual antes do código: Store 0/0, Studio 0/0 e Scale 0/0, sem fornecedor ou operação nova. Faturas reais desconhecidas não contam como zero e nenhuma margem de 60% é certificada. TC1 permanece apenas na fila, após EC307, sem implementação de sugestões de e-mail. Gates, direitos e preços permanecem preservados.

### Integridade das referências fiscais — PR #856, falha preservada e correção (23/10/2026)

Parte do item303 [9A-4], sem criar registro fiscal ou alterar gate: teste de CI verifica arquivos reais de implementação e arquivos de teste executados automaticamente que os referenciem. Casos sintéticos rejeitam arquivo ausente, diretório, caminho inseguro e teste alheio à implementação. A lista real continua vazia; nomes de arquivos e testes passando não certificam tratamento legal nem cobertura de todos os caminhos. Referências implementedIn/evidence desse verificador usam caminhos do repositório separados por espaço ou vírgula; explicações humanas ficam no teste/documentação correspondente. Nenhuma jurisdição foi registrada ou liberada.

O head inicial `1b1da7df551dbab17658947445c52eb037d347b9` falhou no lint do job verify 120668922031 em 23/10/2026 às 18h37m47,435s de Fortaleza (21:37:47.435 UTC): identificador local `module` proibido por @next/next/no-assign-module-variable. Correção: renomeado para `sourceModule`, sem desligar a regra ou alterar asserções. Verificação completa dos 22 checks obrigatória no novo head; não reexecutar somente o job. Nenhuma incorporação ou entrega funcional por esse teste/documento.

Antes do código: incremento operacional mensal/anual Store 0/0, Studio 0/0, Scale 0/0; verificação de arquivos somente em CI, sem nova operação, fornecedor, retenção ou direito em produção. Faturas reais desconhecidas não viram zero; nenhuma certificação da margem de60%. PR #856 depende da incorporação do reparo de segurança #854; arquivos próprios não conflitam com o reparo de recibos #855. O remanescente de303 (matriz por jurisdição, registros de collect e recusa de checkout) permanece incompleto.

### Publicação funcional 188 e incorporação dos recibos — 23/10/2026

PR #854 incorporado em 23/10/2026 às 18h46m59s (Fortaleza), commit `8ae48627a267ad70c31660102a9878225b0b6036`, head testado `c8f30439b8084909aa880b27d0a51431e048ad2a`, árvore testada/predita/incorporada `732de0fafaf45349b1884ba211c67522f2faf5ae`, suíte completa 22/22. Correção efetiva da dependência Zod 4.6.6, sem afrouxar auditoria. TC1 registrado documentalmente uma vez como308 após EC307, sem implementar sugestões de e-mail.

Entrega188: READY em 23/10/2026 às 18h47m41,737s (Fortaleza), domínio `marktmorgen.com`, versão exata `8ae48627a267ad70c31660102a9878225b0b6036`, deployment `dpl_8x7Etsaq3xryZCEcPgf7bSm5Gu9k`. `/`, `/platform`, `/pricing`, `/mission` e `/library` responderam200 com o mesmo deployment antes de incrementar187→188. Nove amostras móveis frias: LCP máximo1020ms, interação até pintura máxima136ms, CLS0, zero escritas de API; prova sintética, não INP de campo ou certificação p75. Faturas reais desconhecidas não viram zero; incremento operacional mensal/anual Store0/0, Studio0/0 e Scale0/0; nenhum fornecedor ou operação nova, nenhuma certificação de margem de60%.

PR #855 incorporado em 23/10/2026 às 18h55m30s (Fortaleza), commit `6768e1722d140fa72a0f3f38d8b52a89e64ed20c`, head testado `83369ffe97f9036d5ecb62909bf44fc23d1375d5`, árvore testada/predita/incorporada `56a1124c56c86a471347e11f1d5f8e698daec4ad`, suíte completa22/22. `refundCharge` exige recibo succeeded correspondente ao PaymentIntent, USD e valor positivo seguro; valor parcial deve coincidir. Valor de entrada inválido não faz requisição. O teste real do helper, com fornecedor simulado, aprovou96 verificações (job120665417345 às18h31m09s Fortaleza). Nove amostras móveis: LCP máximo756ms, interação máxima96ms, CLS0, zero escritas de API. Não há reembolso real nem prova de liquidação bancária; os chamadores de legendas ainda ignoram o booleano, e recuperação durável permanece incompleta. Mesmos limites de custo incremental0/0 e faturas desconhecidas; gates, preços e direitos preservados.

Estado de publicação do PR #855 no momento deste registro (23/10/2026,18h57 Fortaleza): aguardando confirmação READY/domínio/versão exata; contador permanece188. A confirmação efetiva posterior deve ser acrescentada ao histórico, sem transformar esta espera em entrega. O PR #856 integra agora o main real acima, preserva todas as alterações e exige nova suíte completa no novo head; resultados parciais anteriores não o concluem.

### Entrega funcional189 confirmada e continuidade do teste gratuito — 23/10/2026

A espera de publicação do PR #855 registrada acima é histórica. Confirmação posterior efetiva: READY em 23/10/2026 às 18h57m19,918s de Fortaleza, domínio `marktmorgen.com`, versão exata `6768e1722d140fa72a0f3f38d8b52a89e64ed20c`, deployment `dpl_Eoi4g78urqM2xRkqR6WVVTHuhUcX`. `/`, `/platform`, `/pricing`, `/mission` e `/library` responderam200 com esse mesmo deployment antes de incrementar188→189. PR855:22/22 verificações,96 testes sintéticos de recibos, nove amostras frias com LCP máximo756ms/interação máxima96ms/CLS0/zero escritas. Não equivale a liquidação bancária, recuperação durável das legendas ou certificação de margem/acessibilidade/INP de campo. O helper não autoriza nova chave de idempotência quando a confirmação é desconhecida.

PR #857 — continuação parcial do item232[CA1], política explícita de coleta no Checkout: payment_method_collection=always em todas as tentativas existentes; apenas trial elegível recebe missing_payment_method=cancel no fim do período. Duração do teste gratuito, preço, regras de retorno/loja adicional, autenticação anual, referências de financiamento e opções de pagamento preservados. Fonte oficial da Stripe consultada em23/10/2026: https://github.com/stripe/stripe-node/blob/master/src/resources/Checkout/Sessions.ts . O SDK documenta always como padrão e os comportamentos cancel/create_invoice/pause; nenhuma migração para a nova API de trial offers. Isso verifica construção da requisição, não confirmação independente de cartão nem teto de exposição completamente financiado.

Testes sintéticos do helper real cobrem todos os planos/ciclos, preço e cliente obsoletos e ausência de novo trial para retorno/loja adicional; não há conta, cobrança ou submissão real. Custo incremental antes do código: Store mensal/anual0/0, Studio0/0, Scale0/0; apenas campos das requisições existentes e limitadas, sem nova operação paga, armazenamento, retenção, serviço ou direito. Faturas reais desconhecidas não são zero e o piso líquido de60% por cliente/global após todos os impostos e100% dos custos da LLC não é certificado. Vendas permanecem fechadas.

Estado: PR857 implementado, integrado ao head do PR856 para preservar as verificações de evidências e evitar sobreposição de arquivos; incorporar856 primeiro. Ambos continuam exigindo22 checks completos no próprio head e árvore incorporada idêntica à testada. Resultados parciais de heads anteriores não concluem o novo head. O teste/documento do PR856 não é entrega funcional.

### Confirmação de devolução de taxa — continuação parcial232[CA1], 23/10/2026

Implementação na branch `codex/fee-refund-receipt-confirmation`, sobre o head do PR857 e com incorporação de856/857 antes dela. `settleFee` não soma valores devolvidos por mero HTTP200: exige objeto fee_refund com identificador, taxa, moeda e valor exato correspondentes. Moeda desconhecida e valor calculado inseguro recusam mutação. Recibo desconhecido entra no contador de falhas já existente; qualquer falha impede complete=true. Não há nova tentativa, armazenamento ou consulta, nem mudança de comissão, preço, permissão ou direitos. A fonte oficial https://docs.stripe.com/api/fee_refunds/object foi conferida em23/10/2026; o objeto não tem campo status.

Testes sintéticos exercitam o helper e a agregação reais, respostas corretas/expandidas/malformadas, contador de falhas sem valores inventados e chave de idempotência original; a fixture antiga recebe os campos oficiais, com asserções preservadas. Antes do código, incremento operacional mensal/anual Store0/0, Studio0/0 e Scale0/0, mesmas requisições limitadas ou menos; sem novo fornecedor, serviço, retenção ou operação paga. Custos reais desconhecidos não são zero; regra dos60% com leitura mais onerosa e100% dos custos da LLC preservada, sem certificação. Recuperação durável, liquidação bancária e o restante de232 continuam incompletos; vendas e comissão permanecem desligadas. Estado: implementado, aguardando suíte completa22/22 no próprio head e árvore incorporada idêntica à testada; nenhuma entrega funcional contada antecipadamente.

### PR #856 — falha Firefox em leitura durante streaming (23/10/2026, 19h21 Fortaleza)

Head ed3f5a6af9c68962e71ac66eea101f397753863b rejeitado: job 120677290109 terminou em 23/10/2026 19:21:47.761 Fortaleza com duas falhas: texto US-English da home (19:06:05.489) e foco do primeiro link HT3 na home a 390 px (19:17:37.883). Nenhum erro de página registrado. A fonte mantém o texto e links nativos; ambos os testes liam logo em domcontentloaded, enquanto as seções da home agora usam Suspense. Isso permite observar conteúdo parcial e substituição durante hidratação; causa exclusiva do foco ainda não demonstrada.

Correção limitada ao preparo da leitura dos dois testes: aguardar networkidle antes das mesmas verificações de texto/foco, sem mudar expectativas, rotas, larguras, casos, limites ou tempos máximos. Suíte completa de 22 verificações obrigatória no novo head; nenhum rerun isolado autoriza conclusão. Sem alteração de runtime, preços, direitos ou gates; incremento mensal/anual por Store/Studio/Scale 0/0, sem novo fornecedor/operação. Faturas reais de CI continuam desconhecidas, não zero; nenhuma certificação de margem ou acessibilidade. PRs 857/858 precisam incorporar esta correção antes da conclusão. EM1 preservado na continuidade para inclusão documental após concluir a tarefa corrente, conforme pedido expresso; nenhuma implementação EM agora.

## H4 — Lições da quarta auditoria da Hotmart (23/10/2026)

Solicitação do dono (23/10/2026,01h13, Fortaleza): incorporar as melhorias da quarta auditoria estratégica da Hotmart (hotmart.com) que ainda não existam no código nem na fila. Antes de cada item, verificar código e fila e implementar apenas a diferença. Fatos atribuídos à Hotmart exigem confirmação em fonte oficial datada antes de qualquer uso; números da Hotmart jamais podem ser apresentados como resultados do Marktmorgen.

**Ordem:** depois de tudo o que já está na fila, incluindo HG/SX; itens não bloqueiam nenhum outro. Todos começam **na fila**. Registro solicitado após concluir a tarefa corrente, respeitado após a publicação176; recursos H4 não implementados por esta inclusão.

**REGRA DOS 60% (OBRIGATÓRIA):** todo cliente pagante, considerado isoladamente e usando100% de todos os direitos do plano no pior mês, deve manter margem de lucro líquido MÍNIMA de60%, depois de todos os custos e todos os impostos, inclusive brasileiros; a margem pode ser maior, nunca menor, e a mesma regra vale para a empresa como um todo. Antes de qualquer código, calcular o custo máximo mensal e anual de cada item por plano, com teto automático aplicado antes do gasto. Custo desconhecido não é zero. Usar a leitura que resultar em MAIS imposto em docs/tax-uncertainty.md. Desde22/10/2026,100% dos custos fixos da LLC pertencem ao Marktmorgen (275[FX1]).

287. [H4-1] Gatilho de automação por progresso no curso

Estado: na fila.

Hoje as sequências (lib/flows.ts) podem começar quando o aluno inicia ou conclui um curso, mas não quando ele atinge uma parte dele. Acrescentar o gatilho "reached a share of the course", com percentuais definidos pelo criador (por exemplo,25%,50% ou80% das aulas concluídas), para que possa apresentar, por exemplo, uma mentoria a quem chegou a80%. Usar somente progresso medido no servidor: aulas marcadas como concluídas, provas aprovadas e trabalhos aprovados. Coordenar com102[E2-COURSE-COMPLIANCE], que mede no servidor a ordem das aulas e90% do vídeo, sem duplicar. Cada aluno dispara cada percentual uma única vez por curso. Mensagens somente a quem consentiu em receber novidades, dentro da franquia de e-mails do plano, verificada antes do envio.

288. [H4-2] Resumo em texto de cada aula, por IA

Estado: na fila.

Gerar resumo curto somente da transcrição já existente de cada aula em vídeo ou áudio, exibido abaixo da aula sob rótulo desenhado pela página indicando geração por IA. Criador revisa e aprova cada resumo antes de publicar, pode editar ou desligar; nada publicado sem aprovação. Gerar uma única vez por versão da aula e guardar, nunca a cada visualização. Usar o modelo mais barato vigente, verificado antes de implementar, com limites de entrada/saída; reservar antes de cada chamada o custo de orçamento próprio por loja e mês e acertar pelo consumo cobrado. Orçamento esgotado impede resumos novos e o estúdio informa isso. Usar somente conteúdo da própria aula, sem acrescentar fatos, números ou promessas. Atender também às orientações para deficiências cognitivas da ParteA do274[AX1].

289. [H4-3] Resumo semanal de progresso enviado ao aluno

Estado: na fila.

Oferecer ao aluno, por escolha dele e desligado por padrão, e-mail semanal com progresso nos cursos da loja: aulas concluídas na semana, próxima aula e eventos marcados na comunidade. Criador pode desativar a opção para a loja. Envio dentro da franquia de e-mails do plano verificada antes do envio, com descadastro em um clique; semana sem novidade não gera e-mail. Coordenar com11[D8], resumo semanal ao criador, e lembretes existentes a membros parados, sem duplicar mensagens para a mesma pessoa na mesma semana.

**Regras comuns:** proibido criar contas, aceitar termos, contratar serviços, pagar valores, solicitar aprovações ou alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art.9a ou revisão comercial. Somente fornecedores simulados: nenhum e-mail real, cobrança real ou registro real de cliente alterado. Texto público em inglês americano e acessibilidade da ParteA do274[AX1]. Nenhum depoimento, número, resultado, escassez ou urgência inventado, nem superioridade sobre Hotmart ou outro concorrente sem fonte oficial datada. Ao concluir cada item, registrar data/hora de Fortaleza, commit, resultado da suíte completa e publicação. Proveniência preservada na continuidade e fila; nenhum fato da auditoria foi tratado como confirmado por este registro.


## SQ — Lições da quarta auditoria da Shopify (23/10/2026)

**Ordem:** após todos os itens anteriores, incluindo H4; estes itens não bloqueiam nenhum outro. Inclusão documental após concluir a tarefa corrente; nenhum recurso SQ implementado agora.

Solicitação do dono (23/10/2026, 02h11, horário de Fortaleza): incorporar ao Marktmorgen as melhorias identificadas na quarta auditoria estratégica da Shopify (shopify.com) que ainda não existam no código nem na fila. Antes de cada item, verifique o código e a fila e implemente apenas a diferença. Os fatos que a auditoria atribui à Shopify devem ser confirmados em fonte oficial datada antes de qualquer uso, e os números da Shopify jamais podem ser apresentados como resultados do Marktmorgen.

REGRA DOS 60% (OBRIGATÓRIA): todo cliente pagante, considerado isoladamente e usando 100% de todos os direitos do plano no pior mês, deve manter margem de lucro líquido MÍNIMA de 60%, depois de todos os custos e de todos os impostos, inclusive os brasileiros; a margem pode ser maior, mas nunca menor, e a mesma regra vale para a empresa como um todo. Antes de qualquer código, calcule o custo máximo mensal e anual de cada item por plano, com teto automático aplicado antes do gasto. Custo desconhecido não pode ser considerado zero. Use a leitura que resultar em MAIS imposto (docs/tax-uncertainty.md). Desde 22/10/2026, todos os custos fixos da LLC são atribuídos integralmente ao Marktmorgen (item 275 [FX1]).

290. [SQ1] Notas privadas do aluno em cada aula

Estado: na fila.

Permita que o aluno escreva notas privadas em cada aula, visíveis somente para ele, nunca para o criador nem para outros alunos. As notas ficam guardadas por aluno e por aula, podem ser exportadas pelo aluno em arquivo de texto e são apagadas de imediato quando a pessoa pede a exclusão dos seus dados (lib/person-data.ts). Defina um limite de tamanho por nota e de quantidade por aluno, verificado antes de gravar, e inclua o armazenamento no cálculo do pior caso do plano. Atualize a política de privacidade junto com o recurso.

291. [SQ2] Busca dentro do curso

Estado: na fila.

Acrescente, na área do aluno, uma busca dentro do curso que procure nos títulos e nas descrições das aulas e nas transcrições que já existirem, e leve o aluno ao ponto exato da aula correspondente. Sem IA: a busca usa um índice simples, montado quando a aula é publicada ou alterada, nunca a cada pesquisa. Limite o número de pesquisas por aluno e por minuto e inclua as leituras no cálculo do pior caso do plano.

292. [SQ3] Fatos verificáveis na página do curso

Estado: na fila.

Mostre na página de venda e na página do curso, calculados pelo código e nunca digitados pelo criador: a duração total real do conteúdo (soma das durações dos vídeos e áudios), o número de aulas e a data real da última atualização do conteúdo, por exemplo "Last updated October 2026". Quando um dado não puder ser calculado, ele não aparece. O criador pode ocultar cada informação, mas não pode alterá-la.

293. [SQ4] Publicação agendada de posts e avisos na comunidade

Estado: na fila.

Permita que o criador escreva um post ou um aviso na comunidade e escolha a data e a hora da publicação, no fuso horário salvo da loja. Antes da hora, o criador pode editar ou cancelar. A publicação respeita as regras e os limites atuais de posts, e os avisos por e-mail ou notificação ficam dentro da franquia do plano, verificada no momento da publicação, não no agendamento.

294. [SQ5] Duplicar curso, arquivar curso e escolher a página depois da compra

Estado: na fila.

Verifique o que já existe e implemente apenas a diferença: (a) duplicar um curso, com aulas e configurações, para criar uma nova turma sem copiar alunos, notas, comentários nem progresso; (b) arquivar um curso, retirando-o da venda sem apagar o acesso de quem já comprou nem os dados dos alunos; (c) escolher, por produto, a página para onde o comprador vai depois do pagamento, somente entre páginas da própria loja ou do domínio próprio verificado do criador, para não permitir redirecionamento aberto.

Regras para todos os itens: é proibido criar contas, aceitar termos, contratar serviços, pagar qualquer valor, solicitar aprovações e alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a ou a revisão comercial. Testes somente com fornecedores simulados: nenhum e-mail real, nenhuma cobrança real e nenhum registro real de cliente alterado. Todo texto público em inglês americano, com a acessibilidade exigida pela Parte A do item 274 [AX1]. Nada de depoimentos, números, resultados, escassez ou urgência inventados, nem afirmação de superioridade sobre a Shopify ou sobre qualquer outro concorrente sem fonte oficial datada.

Estado inicial de todos os itens: na fila. Ao concluir cada um, registre a data e a hora de Fortaleza, o commit, o resultado da suíte completa e a publicação.


**Complementos SQ solicitados pelo dono:** SQ6 em23/10/2026 às02h22 Fortaleza; SQ7/SQ8 às02h29 Fortaleza. Incluídos depois de concluir PR824, logo após SQ5 nesta mesma seção, sem mudar a ordem anterior. Execução depois de tudo o que já está na fila; não bloqueiam outros itens. Antes de cada recurso, comparar código/fila e implementar somente a diferença; regras comuns e proveniência SQ acima permanecem vinculantes.

295. [SQ6] Modo foco na aula

Estado: na fila.

Acrescentar à página da aula botão "Focus mode" que esconde navegação lateral, lista de aulas e demais elementos ao redor do vídeo ou texto da aula, deixando visíveis somente conteúdo, controles do player e botão claro para sair. Ligar/desligar por teclado e leitor de tela, mantendo foco do teclado no lugar correto ao entrar e sair. Nenhuma animação quando "reduzir movimento" estiver ativa. Lembrar escolha somente no próprio navegador do aluno. Atender às orientações W3C para deficiências cognitivas e de aprendizagem da ParteA do274[AX1]. Sem custo variável por cliente e nenhuma chamada a fornecedor.

296. [SQ7] Avaliação rápida de cada aula

Estado: na fila.

Ao final de cada aula, oferecer avaliação opcional de1 a5, com comentário também opcional. Criador vê por aula média, distribuição das notas e comentários, ao lado do mapa de abandono96[D2-LESSON-DROPOFF], sem duplicar o que ele mostrar. Cada aluno avalia cada aula uma vez e pode mudar a nota. Avaliações privadas: jamais aparecem como prova social nem para outros alunos. Incluir armazenamento no cálculo do pior caso do plano.

297. [SQ8] Respostas das provas gravadas automaticamente

Estado: na fila.

Verificar o que já existe nas provas e trabalhos e implementar apenas a diferença. Gravar automaticamente as respostas de prova em andamento à medida que o aluno responde, para que nada se perca ao sair da página, fechar navegador ou perder conexão; oferecer continuar de onde parou ao voltar. Gravação somente da própria pessoa, apagada quando a prova é enviada ou quando a pessoa pede exclusão dos dados. Atender à prevenção de perda de dados da ParteA do274[AX1].

**Margem e custos dos complementos:** cada cliente pagante individualmente, usando100% de todos os direitos do plano no pior mês, mantém no mínimo60% de lucro líquido após todos os custos/impostos, inclusive brasileiros, e a mesma regra vale globalmente; pode ser maior, nunca menor. Antes de qualquer código, calcular máximo mensal/anual por item/plano, com teto automático antes do gasto. Custo desconhecido nunca é zero. Manter leitura mais onerosa de docs/tax-uncertainty.md e100% dos custos fixos LLC no Marktmorgen275[FX1]. A ausência de chamadas a fornecedor em SQ6 não certifica margem global nem permite zerar custos fixos desconhecidos.

**Regras dos complementos:** proibido alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art.9a ou revisão comercial. Texto público em inglês americano, acessibilidade ParteA do274[AX1]. Testes somente com fornecedores simulados; preservar proibições comuns SQ de conta, termos, contratação, pagamento, solicitação de aprovação e alteração real de cliente/envio/cobrança. Estado inicial de todos: na fila. Ao concluir cada um, registrar data/hora de Fortaleza, commit, resultado da suíte completa e publicação. Inclusão documental apenas: nenhum recurso SQ6/SQ7/SQ8 implementado agora.

## H5 — Lições da quinta auditoria da Hotmart (23/10/2026)

**Ordem:** após todos os itens anteriores, incluindo H4 e SQ; estes itens não bloqueiam nenhum outro. Inclusão documental após concluir a tarefa corrente PR846/entrega185; nenhum recurso H5 implementado agora. Numeração298/299 conferida livre no main `1d09bb3ff0ca2b8845d838deb348cc78853d2645` e nos11 PRs abertos em23/10/2026. Antes de executar cada item, verificar novamente código/fila e implementar somente a diferença.

Solicitação do dono (23/10/2026, 13h35, horário de Fortaleza): incorporar ao Marktmorgen as melhorias identificadas na quinta auditoria estratégica da Hotmart (hotmart.com) que ainda não existam no código nem na fila. Antes de cada item, verifique o código e a fila e implemente apenas a diferença. Os fatos que a auditoria atribui à Hotmart devem ser confirmados em fonte oficial datada antes de qualquer uso, e os números da Hotmart jamais podem ser apresentados como resultados do Marktmorgen.

REGRA DOS 60% (OBRIGATÓRIA): todo cliente pagante, considerado isoladamente e usando 100% de todos os direitos do plano no pior mês, deve manter margem de lucro líquido MÍNIMA de 60%, depois de todos os custos e de todos os impostos, inclusive os brasileiros; a margem pode ser maior, mas nunca menor, e a mesma regra vale para a empresa como um todo. Antes de qualquer código, calcule o custo máximo mensal e anual de cada item por plano, com teto automático aplicado antes do gasto. Custo desconhecido não pode ser considerado zero. Use a leitura que resultar em MAIS imposto (docs/tax-uncertainty.md). Desde 22/10/2026, todos os custos fixos da LLC são atribuídos integralmente ao Marktmorgen (item 275 [FX1]).

298. [H5-1] Aulas do curso em áudio, no feed privado do aluno

Estado: na fila.

Permita que o criador anexe, a cada aula, uma versão em áudio enviada por ele, e que o aluno receba as aulas que tiverem áudio num feed privado de podcast, para ouvir no aplicativo de podcast que já usa. Reaproveite o mecanismo de feed privado que já existe para os podcasts (lib/podcast-access.ts: token próprio por endereço e produto, limite de montagens por dia, exclusão junto com a pessoa) e implemente apenas a diferença. Sem conversão de vídeo em áudio no servidor e sem IA: se, no futuro, se quiser extrair o áudio do vídeo automaticamente, isso será um item novo, que só pode ser feito depois de comprovar o preço do fornecedor em fonte oficial datada; enquanto o preço for desconhecido, o recurso fica desligado. O áudio enviado conta no armazenamento do plano, e a entrega pelo feed conta na franquia de transmissão do plano, verificada antes de entregar. Nenhum limite visível novo é criado e nenhum é cortado. O acesso ao feed termina, sem demora, em reembolso, cancelamento, contestação de pagamento ou fim do acesso ao curso, como já acontece nos podcasts privados. Cada episódio leva o título da aula, o idioma marcado e um link para a transcrição ou para o texto da aula, quando existirem. Recurso desligado por padrão, ligado pelo criador em cada curso. Atualize a política de privacidade e os termos junto com o recurso, se o que eles dizem sobre os feeds privados mudar.

299. [H5-2] Próximo produto sugerido ao concluir o curso

Estado: na fila.

Na tela que o aluno vê ao concluir o curso, e, se o criador quiser, ao final de no máximo uma aula escolhida por ele, mostre um único produto do próprio criador, escolhido pelo criador nas configurações do curso. Hoje lib/course-finish.ts só inicia as sequências de e-mail para quem consentiu; a página não mostra nada. O produto deve estar à venda hoje, com o preço e os termos publicados. Aplique as mesmas exclusões de lib/next-offer-rules.ts: nunca o curso concluído, nada que a pessoa já tenha comprado (informação desconhecida significa não mostrar nada), nenhum rascunho, nenhum produto limitado e nenhum pacote que contenha algo já comprado. Sem chamada à IA, sem desconto, contagem regressiva, escassez, número de compradores ou depoimento. Somente texto e imagem, sem vídeo e sem reprodução automática. O aviso nunca tira o foco do aluno nem muda de página sozinho (3.2.5), pode ser dispensado e não volta depois de dispensado. Não envia e-mail próprio: e-mails continuam somente pelas sequências existentes, com o consentimento já exigido. Sem custo variável por cliente além das leituras da página, que entram no cálculo do pior caso do plano.

Regras para todos os itens: é proibido criar contas, aceitar termos, contratar serviços, pagar qualquer valor, solicitar aprovações e alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a ou a revisão comercial. Testes somente com fornecedores simulados: nenhum e-mail real, nenhuma cobrança real e nenhum registro real de cliente alterado. Todo texto público em inglês americano, com a acessibilidade exigida pela Parte A do item 274 [AX1]. Nada de depoimentos, números, resultados, escassez ou urgência inventados, nem afirmação de superioridade sobre a Hotmart ou sobre qualquer outro concorrente sem fonte oficial datada.

Estado inicial de todos os itens: na fila. Ao concluir cada um, registre a data e a hora de Fortaleza, o commit, o resultado da suíte completa e a publicação.

## 9A — Tratamento correto do art. 9a e das regras equivalentes (23/10/2026)

**Ordem de execução:** estes itens são parte da mesma frente dos itens7[C-UE],8[C-UK] e9[C-US] e são executados no Bloco A, logo depois do item9[C-US], antes de206[SH3]. Não refazer o que7,8 e9 já fizeram: verificar código/fila e implementar somente a diferença. Posição documental: fim do arquivo, depoisH5; esta posição não reduz a prioridade de execução definida pelo dono. Inclusão documental após concluir PR848; nada implementado agora. Numeração300–303 conferida livre no main `bcc4178a688d03ad074520d053e9a60a785a2a49` e nos11 PRs abertos antes de gravar.

Solicitação do dono (23/10/2026, 14h35, horário de Fortaleza): fazer o tratamento correto do art. 9a do Regulamento de Execução (UE) nº 282/2011 e das regras equivalentes do Reino Unido, dos estados americanos e de outros países, de modo que a trava deemedSupplierReady() (lib/deemed-supplier.ts) só fique verdadeira de forma legítima, isto é, quando cada jurisdição tiver o seu tratamento construído, testado e registrado. É proibido incluir em DEEMED_SUPPLIER_RECORDS qualquer registro de tratamento que não esteja construído e testado, e é proibido afrouxar a trava para ela passar.

O que a trava NÃO resolve sozinha: PLANS_ON_SALE (lib/opening.ts) depende também de taxGateValid() e de commercialPlansMayOpen(OPENING_REQUESTED). Estes itens não alteram o tax gate, a leitura MOST_TAX_READING, a revisão comercial nem OPENING_REQUESTED. Mesmo com os quatro itens prontos, as vendas continuam fechadas enquanto as outras travas falharem.

REGRA DOS 60% (OBRIGATÓRIA): todo cliente pagante, considerado isoladamente e usando 100% de todos os direitos do plano no pior mês, deve manter margem de lucro líquido MÍNIMA de 60%, depois de todos os custos e de todos os impostos, inclusive os brasileiros; a margem pode ser maior, mas nunca menor, e a mesma regra vale para a empresa como um todo. Antes de qualquer código, calcule o custo máximo mensal e anual de cada item por plano, com teto automático aplicado antes do gasto, e registre-o no modelo único de recebimento (lib/receiving-costs.ts), em tests/plan-cost-registry.ts e no spend floor. Custo desconhecido não pode ser considerado zero. Use a leitura que resultar em MAIS imposto (docs/tax-uncertainty.md, questões 20 e 23 a 27). Desde 22/10/2026, todos os custos fixos da LLC são atribuídos integralmente ao Marktmorgen (item 275 [FX1]): registros, declarações, conversão de moeda e transferências de imposto que forem fixos entram nos custos fixos e na base mínima de clientes.

300. [9A-1] Recusa automática, antes da cobrança, dos compradores de cada jurisdição ainda sem tratamento

Estado: na fila.

Construa e teste o tratamento "refuse-consumers", que já existe no tipo DeemedSupplierRecord mas não tem código. Para cada jurisdição (UE, Reino Unido, cada estado americano e cada outro país) que não tiver a cobrança do imposto construída e registrada, a loja recusa a compra ANTES de qualquer cobrança, em todos os caminhos de checkout listados em docs/eu-vat-article-9a.md: produtos digitais, carrinho, ofertas, cursos, podcasts privados, assinaturas e comunidades, gorjetas, solicitações de pagamento e, pela leitura com mais imposto, chamadas; produtos físicos enviados à UE e ao Reino Unido também ficam recusados até a análise do art. 14a da Diretiva e das regras britânicas de mercadorias. A recusa vale para consumidores e empresas, até que a cobrança com autoliquidação para empresas (VIES) esteja construída no item 302. Use todas as provas de localização disponíveis sem custo novo: o país e a região informados pelo comprador, o endereço de cobrança, o país do cartão (verifique na documentação oficial e datada do Stripe como obtê-lo antes de confirmar a cobrança na conta conectada; se não for possível antes da cobrança, essa prova não é usada para liberar, e nunca se cobra para depois reembolsar) e o país do IP fornecido pela hospedagem. Basta UMA prova apontar para uma jurisdição recusada para a compra ser recusada; prova ausente ou ilegível também recusa. Na UE, recuse todos os Estados-Membros da mesma forma, nunca uns sim e outros não, e confira com fonte oficial datada o Regulamento (UE) 2018/302 (geobloqueio) antes de concluir. O aviso aparece na página do produto antes de a pessoa iniciar a compra, em inglês americano simples, sem culpar o comprador e dizendo que a compra ainda não está disponível no país dele; nenhum dado pessoal da recusa é guardado, apenas contagens anônimas por jurisdição. O estúdio mostra ao criador, em linguagem simples, em quais países e estados os compradores dele ainda não podem comprar e por quê.

301. [9A-2] Limite de faturamento por estado americano e por país, com parada automática antes do limite

Estado: na fila.

Hoje a trava trata os EUA e os "outros países" como um bloco único e a leitura com mais imposto supõe obrigação em toda parte. Pesquise, somente em fontes oficiais datadas, para cada um dos 50 estados americanos, o Distrito de Colúmbia e Porto Rico, e para cada país com regra de plataforma ou de serviço digital vendido do exterior (comece por Canadá, Austrália, Nova Zelândia, Noruega, Suíça, Japão, Singapura, Índia e Coreia do Sul): se o produto digital ou o serviço eletrônico é tributado; se a plataforma é tratada como facilitadora ou fornecedora presumida; qual é o limite de faturamento ou de número de transações a partir do qual surge a obrigação de registrar e recolher; qual é o período de contagem; e o que entra na contagem. Acrescente ao tipo DeemedSupplierRecord um tratamento novo, "threshold-stop", válido somente onde a fonte oficial disser com clareza que abaixo do limite não há obrigação. Nesse tratamento, um contador único da plataforma inteira (todas as lojas somadas), na moeda do limite e com a taxa de câmbio mais desfavorável, soma cada venda com a reserva feita ANTES da cobrança, de forma atômica, e as compras daquela jurisdição passam a ser recusadas, sozinhas, ao atingir 80% do limite. Na contagem, use sempre a leitura mais rigorosa: período mais curto ou mais longo, o que chegar antes ao limite; valor bruto com imposto e frete; transações e valores, o que vier primeiro; reembolsos não descontam. Se as provas de localização apontarem para mais de uma jurisdição, a venda conta em todas. Contador ilegível, fonte ausente, leitura duvidosa ou jurisdição não pesquisada significam recusa (item 300), nunca liberação. Estados sem imposto sobre vendas são registrados com a sua fonte. Cada jurisdição tem a sua linha na tabela, com fonte, data de leitura, limite, período e tratamento; uma jurisdição sem linha fica recusada. Atualize docs/tax-uncertainty.md (questões 23 e 24) e deemedSupplierProblems() para exigir a tabela completa. Inclua as leituras e gravações do contador no custo por venda do modelo de recebimento.

302. [9A-3] Cobrança do IVA da UE e do Reino Unido pronta e desligada, aguardando o registro

Estado: na fila.

Complete, dentro dos itens 7 [C-UE] e 8 [C-UK] e sem duplicá-los, a cobrança como fornecedor presumido, deixando tudo pronto e DESLIGADO: o imposto somado ao preço do comprador ou retido do repasse ao criador pela taxa de aplicação, nunca da comissão (inclusive no plano sem comissão); a retirada da linha de imposto do Stripe Tax do próprio criador para consumidores da UE e do Reino Unido, para não haver imposto em dobro; a autoliquidação para empresas com número de IVA conferido no VIES (e, no Reino Unido, pela verificação oficial do número britânico); o recibo que identifica o fornecedor como o art. 9a exige; as duas provas de localização não contraditórias (arts. 24b e 24f); o registro de cada venda exigido pelo art. 63c, guardado por 10 anos com o mínimo de dados e com a base legal indicada na política de privacidade; e a geração do arquivo da declaração trimestral do OSS não-UE e da declaração britânica, para o dono enviar. A conversão do dinheiro do imposto e as tarifas de transferência são retidas junto com o imposto, do lado do criador, nunca da comissão. Enquanto o dono não informar o Estado-Membro de identificação do OSS e o número de registro britânico, a UE e o Reino Unido ficam com o tratamento "refuse-consumers" do item 300; a mudança para "collect" só acontece com o número informado pelo dono e com os testes passando. A questão 25 (ISS de Fortaleza sobre essas vendas) continua na leitura com mais imposto, 5%, até haver resposta oficial registrada em docs/tax-consultations.md.

303. [9A-4] Termos, privacidade e testes que impedem registro falso

Estado: na fila.

Atualize os termos de uso, a política de privacidade e a página de impostos para dizer com honestidade que, para o IVA da UE e do Reino Unido e onde a lei de um estado ou país assim o determinar, o Marktmorgen é tratado como fornecedor ou facilitador para fins de imposto, sem mudar quem é o vendedor para os demais fins, e quais países e estados ainda não podem comprar; nenhuma página pode dizer que o Marktmorgen ou o criador está em conformidade. Acrescente testes que falham se: houver em DEEMED_SUPPLIER_RECORDS um registro cujo arquivo indicado em implementedIn não exista ou não tenha teste; houver registro "collect" sem número de registro informado pelo dono; houver jurisdição sem linha na tabela do item 301; uma compra de jurisdição recusada chegar a criar cobrança em qualquer caminho de checkout; ou um contador ilegível liberar uma venda.

Regras para todos os itens: é proibido criar contas, aceitar termos, registrar a LLC em qualquer órgão de impostos, contratar serviços, pagar qualquer valor, contatar terceiros, solicitar aprovações e alterar preços, limites visíveis, comissão, o tax gate, a leitura MOST_TAX_READING, OPENING_REQUESTED ou a revisão comercial. PLANS_ON_SALE só pode mudar como consequência legítima das travas, nunca editado à mão. Testes somente com fornecedores simulados: nenhum e-mail real, nenhuma cobrança real e nenhum registro real de cliente alterado. Todo texto público em inglês americano, com a acessibilidade exigida pela Parte A do item 274 [AX1]. Cada fonte legal citada com endereço oficial e data de leitura; isto é pesquisa, não parecer, e nenhuma página afirma conformidade.

Estado inicial de todos os itens: na fila. Ao concluir cada um, registre a data e a hora de Fortaleza, o commit, o resultado da suíte completa e a publicação, e deixe o estado como "pronto e desligado, aguardando o dono" onde houver dependência de registro.

## GH — Lições da terceira auditoria da HighLevel (23/10/2026)

Registro documental solicitado pelo dono; número 304 conferido livre no main e nos heads dos 11 PRs abertos antes da gravação. Ordem: após todos os itens anteriores, incluindo H5 e 9A; não bloqueia outros itens. Nenhuma implementação agora. O texto abaixo preserva integralmente a solicitação e suas condições; as afirmações sobre fornecedores e requisitos legais serão verificadas em fontes oficiais datadas antes do uso ou implementação.

NÃO PARE O QUE ESTÁ FAZENDO. COLOQUE NA FILA, PARA FAZER DEPOIS.

Local exato: no fim de docs/codex-queue.md, numa seção nova chamada "GH — Lições da terceira auditoria da HighLevel (23/10/2026)", depois da seção 9A (itens 300 a 303, PR #849). Use o número 304. Antes de gravar, confira no main e nos PRs abertos se esse número continua livre; se não estiver, use o próximo livre e mantenha a ordem.

**Ordem:** após todos os itens anteriores, incluindo H5 e 9A; este item não bloqueia nenhum outro. Inclusão documental após concluir a tarefa corrente; nada implementado agora.

Solicitação do dono (23/10/2026, 15h14, horário de Fortaleza): incorporar ao Marktmorgen as melhorias identificadas na terceira auditoria estratégica da HighLevel (gohighlevel.com) que ainda não existam no código nem na fila. Antes do item, verifique o código e a fila e implemente apenas a diferença. Os fatos que a auditoria atribui à HighLevel devem ser confirmados em fonte oficial datada antes de qualquer uso, e os números da HighLevel jamais podem ser apresentados como resultados do Marktmorgen.

REGRA DOS 60% (OBRIGATÓRIA): todo cliente pagante, considerado isoladamente e usando 100% de todos os direitos do plano no pior mês, deve manter margem de lucro líquido MÍNIMA de 60%, depois de todos os custos e de todos os impostos, inclusive os brasileiros; a margem pode ser maior, mas nunca menor, e a mesma regra vale para a empresa como um todo. Antes de qualquer código, calcule o custo máximo mensal e anual do item por plano, com teto automático aplicado antes do gasto. Custo desconhecido não pode ser considerado zero. Use a leitura que resultar em MAIS imposto (docs/tax-uncertainty.md). Desde 22/10/2026, todos os custos fixos da LLC são atribuídos integralmente ao Marktmorgen (item 275 [FX1]).

304. [GH1] Taxa de adesão opcional nas assinaturas dos criadores

Estado: na fila.

Hoje uma assinatura (lib/product-recurring.ts) pode ter teste grátis e número fixo de pagamentos, mas não uma taxa de adesão. Permita que o criador acrescente, a cada assinatura, uma taxa única opcional cobrada uma só vez, junto com o primeiro pagamento, na conta Stripe do próprio criador, como cobrança direta, exatamente como o restante da assinatura. Antes de construir, confirme na documentação oficial e datada do Stripe como uma cobrança única se comporta no checkout de assinatura com e sem teste grátis; se a taxa for cobrada no início mesmo durante o teste, a página deve dizer isso com essas palavras. A taxa aparece com a mesma clareza do preço recorrente, ao lado dele, na página do produto, no checkout, no recibo e no e-mail de confirmação, por exemplo "$29/month + $50 one-time joining fee", e o total da primeira cobrança é mostrado antes do pagamento, como exigem as leis americanas de renovação automática e as regras de informação ao consumidor da UE e do Reino Unido. Nunca é cobrada de novo: nem na renovação, nem na troca de plano (lib/move-members.ts), nem na volta depois de uma pausa; quem cancela e volta a assinar paga de novo somente se a página tiver dito isso antes. Reembolso da taxa segue a política de reembolso que o criador publicou, mostrada antes do pagamento; se ele não tiver publicado nenhuma, a taxa não pode ser ativada. Desligada por padrão, ligada pelo criador em cada assinatura. A taxa entra no mesmo tratamento fiscal de todas as vendas (itens 7, 8, 9 e 300 a 303) e no cálculo do pior caso, com os custos por venda que já existem; nenhum custo novo de fornecedor.

Regras para o item: é proibido criar contas, aceitar termos, contratar serviços, pagar qualquer valor, solicitar aprovações e alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a ou a revisão comercial. Testes somente com fornecedores simulados: nenhum e-mail real, nenhuma cobrança real e nenhum registro real de cliente alterado. Todo texto público em inglês americano, com a acessibilidade exigida pela Parte A do item 274 [AX1]. Nada de depoimentos, números, resultados, escassez ou urgência inventados, nem afirmação de superioridade sobre a HighLevel ou sobre qualquer outro concorrente sem fonte oficial datada.

Estado inicial: na fila. Ao concluir, registre a data e a hora de Fortaleza, o commit, o resultado da suíte completa e a publicação.

## SY — Lições da auditoria da Systeme.io (23/10/2026)

Inclusão exclusivamente documental após concluir PR #850. Números 305–307 conferidos livres no main e nos heads dos 11 PRs abertos antes da gravação. Numeração aplicada pela ordem de leitura mais recente: 305 [SY1], 306 [SY2] imediatamente após SY1 na mesma seção, e 307 [EC1] na seção EC seguinte. O pedido EC originalmente indicava 306; foi usado o próximo livre para manter a sequência após a inserção de SY2, sem perder seu conteúdo. As referências a 305 [SY1] continuam válidas. Textos originais integrais ficam na continuidade, com proveniência e horário declarados pelo dono.

Ordem de execução: SY1 e SY2 juntos, antes de abrir vendas, sem bloquear outros itens; EC1 no Bloco A logo após este conjunto SY, também antes de abrir vendas. A instrução posterior EC/SY2 de preparo anterior à abertura é preservada junto da ordem original SY1 após itens anteriores, incluindo 9A e GH. Nada implementado ou ativado neste registro; comparação de código e fila antes da futura implementação, somente diferenças. Afirmações do briefing sobre código, fornecedores ou direito são requisitos a conferir em fonte oficial datada, não certificação.

NÃO PARE O QUE ESTÁ FAZENDO. COLOQUE NA FILA, PARA FAZER DEPOIS.

Local exato: no fim de docs/codex-queue.md, numa seção nova chamada "SY — Lições da auditoria da Systeme.io (23/10/2026)", depois da seção GH (item 304). Use o número 305. Antes de gravar, confira no main e nos PRs abertos se esse número continua livre; se não estiver, use o próximo livre e mantenha a ordem.

**Ordem:** após todos os itens anteriores, incluindo 9A e GH; este item não bloqueia nenhum outro. Inclusão documental após concluir a tarefa corrente; nada implementado agora.

Solicitação do dono (23/10/2026, 15h48, horário de Fortaleza): incorporar ao Marktmorgen as melhorias identificadas na auditoria estratégica da Systeme.io (systeme.io) que ainda não existam no código nem na fila. Antes do item, verifique o código e a fila e implemente apenas a diferença. Os fatos que a auditoria atribui à Systeme.io devem ser confirmados em fonte oficial datada antes de qualquer uso, e os números da Systeme.io jamais podem ser apresentados como resultados do Marktmorgen.

REGRA DOS 60% (OBRIGATÓRIA): todo cliente pagante, considerado isoladamente e usando 100% de todos os direitos do plano no pior mês, deve manter margem de lucro líquido MÍNIMA de 60%, depois de todos os custos e de todos os impostos, inclusive os brasileiros; a margem pode ser maior, mas nunca menor, e a mesma regra vale para a empresa como um todo. Antes de qualquer código, calcule o custo máximo mensal e anual do item por plano, com teto automático aplicado antes do gasto. Custo desconhecido não pode ser considerado zero. Use a leitura que resultar em MAIS imposto (docs/tax-uncertainty.md). Desde 22/10/2026, todos os custos fixos da LLC são atribuídos integralmente ao Marktmorgen (item 275 [FX1]).

305. [SY1] Reembolso do plano em autoatendimento, sem trabalho manual do dono

Estado: na fila.

Objetivo: cumprir sozinho, pelo código, a garantia que já está publicada, para que o dono não precise ler e-mails nem fazer reembolsos à mão.

Situação atual: a política (lib/plan.ts, REFUND_DAYS = 30; app/refunds/page.tsx; termos) promete o primeiro pagamento devolvido por inteiro quando pedido em até 30 dias e, no plano anual, a devolução dos meses ainda não iniciados, menos a tarifa do cartão retida pelo Stripe. Hoje o pedido é feito por e-mail.

O que construir:
1. Na área de cobrança do estúdio, somente para o dono da loja, um botão "Refund my payment", visível apenas enquanto a pessoa tiver direito a ele, com o valor exato que será devolvido, calculado pelo código pela mesma regra publicada, e a data em que o acesso termina.
2. Uma tela de revisão antes de confirmar (critério 3.3.6 da Parte A do item 274 [AX1]): o valor, o que acontece com a loja e com os dados (as regras atuais de encerramento, lib/plan-closing-rules.ts e lib/closed-store-data.ts) e um botão para voltar sem fazer nada. Nenhuma pergunta de motivo obrigatória: a política diz "No reason is required".
3. Ao confirmar: o reembolso é feito no Stripe da plataforma pelo valor calculado, a assinatura é encerrada e a loja segue as regras de encerramento que já existem. Um e-mail de confirmação com o valor e a data é enviado dentro dos limites de e-mail do próprio Marktmorgen. A operação é idempotente: um segundo clique, um pedido repetido ou uma falha de rede nunca devolvem duas vezes.
4. Proteção contra abuso, usando somente a regra já publicada: o reembolso integral vale uma única vez por pessoa (mesmo e-mail, mesma conta, mesma impressão digital do cartão no Stripe ou mesma loja), como a política e o comentário de REFUND_DAYS já dizem. Um caso fora da regra mostra, em linguagem simples, por que não há direito e como falar com o suporte; nunca mostra um botão que falharia.
5. O complemento da loja (o assistente, lib/assistant-billing.ts) segue a política dele que está em CURRENT_COMMERCIAL_TERMS.storeAssistant; não amplie nem reduza o que ela promete.
6. Pagamento contestado no cartão: o botão não aparece enquanto a contestação estiver aberta, para não devolver em dobro.

Custos e margem: o reembolso faz parte da exposição já revisada em docs/funded-exposure-review.md (reembolso integral, com limite de ocorrências). Use os números dessa revisão, inclua a tarifa do cartão que o Stripe não devolve e as chamadas ao Stripe, e nunca negue um reembolso que a política publicada promete. Se o teto revisado não cobrir o pior caso, a revisão comercial deve reprovar, como já acontece; não mude a política para caber.

Textos: atualize juntos a política de reembolso, os termos e a ajuda (lib/help-content.ts) para dizer que o pedido é feito no estúdio, mantendo o e-mail como alternativa para quem não conseguir usar o botão.

Testes: somente com o Stripe simulado. Precisam falhar se: o valor calculado divergir da política publicada; um segundo pedido devolver de novo; o botão aparecer fora do prazo, para quem já recebeu reembolso integral ou durante uma contestação; ou o reembolso acontecer sem a tela de revisão.

Regras para o item: é proibido criar contas, aceitar termos, contratar serviços, pagar qualquer valor, fazer reembolso real, solicitar aprovações e alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a, REFUND_DAYS, a política de reembolso em substância ou a revisão comercial. Testes somente com fornecedores simulados: nenhum e-mail real, nenhuma cobrança ou devolução real e nenhum registro real de cliente alterado. Todo texto público em inglês americano, com a acessibilidade exigida pela Parte A do item 274 [AX1]. Nada de depoimentos, números, resultados, escassez ou urgência inventados, nem afirmação de superioridade sobre a Systeme.io ou sobre qualquer outro concorrente sem fonte oficial datada.

Estado inicial: na fila. Ao concluir, registre a data e a hora de Fortaleza, o commit, o resultado da suíte completa e a publicação, e deixe o estado como "pronto e desligado, aguardando o dono" enquanto as vendas estiverem fechadas.

NÃO PARE O QUE ESTÁ FAZENDO. COLOQUE NA FILA, PARA FAZER DEPOIS.

Local exato: em docs/codex-queue.md, logo depois do item 305 [SY1], como item novo com o próximo número livre (confira no main e nos PRs abertos antes de gravar), na mesma seção SY. Execução junto com o item 305, antes de as vendas abrirem; não bloqueia outros itens. Inclusão documental após concluir a tarefa corrente; nada implementado agora.

Solicitação do dono (23/10/2026, 16h04, horário de Fortaleza): garantir que todo reembolso prometido pela política dos planos tenha dinheiro real na conta Stripe da plataforma no momento em que for pedido, sem que o dono precise acompanhar saldo, painel ou alerta.

REGRA DOS 60% (OBRIGATÓRIA): todo cliente pagante, considerado isoladamente e usando 100% de todos os direitos do plano no pior mês, deve manter margem de lucro líquido MÍNIMA de 60%, depois de todos os custos e de todos os impostos, inclusive os brasileiros; a margem pode ser maior, mas nunca menor, e a mesma regra vale para a empresa como um todo. Custo desconhecido não pode ser considerado zero. Use a leitura que resultar em MAIS imposto (docs/tax-uncertainty.md). Desde 22/10/2026, todos os custos fixos da LLC são atribuídos integralmente ao Marktmorgen (item 275 [FX1]).

306. [SY2] Reserva de reembolso em dinheiro real no Stripe

Estado: na fila.

Situação atual: lib/contract-funding-rules.ts reserva contabilmente o principal reembolsável, mas CONTRACT_ADMISSION_COVERAGE.settlementAndReserveReconciliation é false: a reserva não é conferida contra o saldo real. Os repasses automáticos do Stripe enviam todo o saldo ao banco, e um reembolso sem saldo fica pendente até o Stripe debitar o banco ou receber fundos (fontes oficiais: docs.stripe.com/payouts/minimum-balances-for-automatic-payouts e support.stripe.com/questions/pending-refunds-due-to-insufficient-stripe-balance; registre a data de leitura).

O que construir:
1. Reserva calculada pelo código, a cada venda, reembolso e renovação: a soma dos primeiros pagamentos ainda dentro de REFUND_DAYS e dos meses não iniciados de todos os planos anuais, pelas mesmas regras da política publicada, mais as tarifas e reservas de contestação de lib/receiving-costs.ts. Esta é a política de reserva das faturas anuais exigida pelo FX275; registre-a por escrito na revisão comercial.
2. Repasses pelo código: com o calendário de repasses do Stripe em modo manual, uma rotina diária cria pela API, para a conta bancária da plataforma, somente o valor do saldo disponível que exceder a reserva. Confirme na documentação oficial e datada do Stripe o modo manual e a API de repasses para a conta da plataforma. Nunca repassa quando não consegue ler o saldo ou calcular a reserva.
3. Trava automática: se o saldo real do Stripe ficar abaixo da reserva, novas assinaturas e trocas para planos mais caros são recusadas até o saldo voltar a cobri-la; renovações, cancelamentos e reembolsos continuam funcionando. A trava faz parte da revisão comercial e de PLANS_ON_SALE como condição a mais, nunca a menos.
4. Reembolso pendente: se um reembolso do item 305 ficar pendente no Stripe, o estúdio mostra "Refund pending" com a explicação em linguagem simples, e a rotina diária confere até ele sair; nunca há segundo reembolso.
5. A mudança para repasse manual é uma configuração da conta da plataforma: o código não a altera sozinho; registre em "Depende do dono" o passo exato no painel do Stripe e mantenha a trava fechada enquanto o modo manual não for confirmado pela API.

Testes somente com o Stripe simulado, que falham se: um repasse deixar o saldo abaixo da reserva; uma venda nova for aceita com saldo abaixo da reserva; a reserva divergir da política publicada; ou um reembolso pendente gerar segundo reembolso.

Regras: é proibido criar contas, aceitar termos, alterar configurações reais do Stripe, fazer repasse ou reembolso real, solicitar aprovações e alterar preços, limites visíveis, comissão, REFUND_DAYS, a política de reembolso, tax gate, art. 9a ou a revisão comercial, salvo para acrescentar esta trava. Todo texto público em inglês americano, com a acessibilidade exigida pela Parte A do item 274 [AX1].

Estado inicial: na fila. Ao concluir, registre a data e a hora de Fortaleza, o commit, o resultado da suíte completa e a publicação, e deixe o estado como "pronto e desligado, aguardando o dono".

## EC — Encerramento de loja justo com os compradores (23/10/2026)

Item atribuído: 307 [EC1], por inserção de 306 [SY2] imediatamente após SY1 conforme pedido posterior. A ordem do Bloco A e todos os requisitos originais permanecem; abaixo, o cabeçalho do item usa o número atribuído, e a indicação original de 306 no texto de localização permanece como proveniência.

NÃO PARE O QUE ESTÁ FAZENDO. COLOQUE NA FILA, PARA FAZER DEPOIS.

Local exato: no fim de docs/codex-queue.md, numa seção nova chamada "EC — Encerramento de loja justo com os compradores (23/10/2026)", depois da seção SY (item 305). Use o número 306. Antes de gravar, confira no main e nos PRs abertos se esse número continua livre; se não estiver, use o próximo livre e mantenha a ordem.

**Ordem:** no Bloco A, logo depois do item 305 [SY1], porque o reembolso em autoatendimento leva ao encerramento da loja e os dois precisam estar corretos antes de as vendas abrirem. Inclusão documental após concluir a tarefa corrente; nada implementado agora.

Solicitação do dono (23/10/2026, 15h58, horário de Fortaleza): corrigir o encerramento de uma loja (lib/plan-closing.ts, lib/closed-store-data.ts, termos) para que quem comprou do criador nunca pague por algo que não vai receber, seja avisado diretamente antes de perder o acesso e saiba, antes de comprar, o que acontece se a loja fechar. Manter o encerramento em 30 dias e a exclusão dos dados, que existem para não haver custo sem pagamento.

REGRA DOS 60% (OBRIGATÓRIA): todo cliente pagante, considerado isoladamente e usando 100% de todos os direitos do plano no pior mês, deve manter margem de lucro líquido MÍNIMA de 60%, depois de todos os custos e de todos os impostos, inclusive os brasileiros; a margem pode ser maior, mas nunca menor, e a mesma regra vale para a empresa como um todo. Antes de qualquer código, calcule o custo máximo de cada parte deste item por loja que encerra, inclua-o no custo de encerramento (tests/plan-cost-registry.ts, closure, e docs/funded-exposure-review.md, retenção após o cancelamento), com teto automático aplicado antes do gasto. Custo desconhecido não pode ser considerado zero. Use a leitura que resultar em MAIS imposto (docs/tax-uncertainty.md). Desde 22/10/2026, todos os custos fixos da LLC são atribuídos integralmente ao Marktmorgen (item 275 [FX1]).

307. [EC1] Encerramento de loja justo com os compradores

Estado: na fila.

Falhas encontradas no código atual:
(a) durante os CLOSING_DAYS entre o fim do plano e o encerramento, as assinaturas e os planos de pagamento dos membros continuam renovando na conta Stripe do criador; no dia do encerramento, stopRenewals apenas marca cancel_at_period_end, mas o conteúdo é apagado nesse mesmo dia, então um membro pode pagar por um período inteiro, inclusive anual, que não receberá;
(b) os avisos de encerramento vão somente ao criador; os compradores não são avisados pelo Marktmorgen;
(c) antes da compra, o comprador não é informado de que o acesso depende de a loja continuar aberta.

O que construir, implementando apenas a diferença:
1. Antes da compra: uma frase fixa, desenhada pelo código e nunca editável pelo criador, no checkout e no recibo de cursos, downloads, podcasts privados, comunidades e assinaturas, em inglês americano simples, dizendo que o acesso é fornecido pela loja no Marktmorgen e que, se a loja fechar, o comprador será avisado por e-mail com pelo menos 7 dias para baixar o que for baixável. Atualize os termos e a política de privacidade junto.
2. No dia em que o plano termina (e não no dia do encerramento): nenhuma nova cobrança de membro acontece até o encerramento. Verifique na documentação oficial e datada do Stripe o mecanismo correto para suspender a cobrança mantendo a assinatura (por exemplo, pause_collection com invoices anuladas) em contas conectadas; os membros continuam com acesso até o encerramento sem pagar. Se o criador assinar de novo antes do encerramento, a cobrança é retomada exatamente como estava, sem cobrança retroativa. Falha ao suspender uma assinatura é registrada e tentada de novo pela rotina diária, nunca ignorada.
3. No encerramento: as assinaturas e os planos de pagamento terminam de fato, imediatamente, e não no fim do período.
4. Tempo pago e não usado: na tela de revisão do reembolso do item 305 [SY1], em cada aviso de encerramento e no estúdio, mostre ao criador quantos membros pagaram por tempo que vai além da data de encerramento e a soma desse tempo não usado, calculada pelo código. Ofereça um botão que devolve a cada um, a partir da conta Stripe do próprio criador, a parte proporcional não usada, com tela de revisão antes de confirmar e operação idempotente. A devolução é decisão do criador, como os termos já dizem; confirme na documentação oficial do Stripe que a plataforma pode criar esse reembolso na conta conectada a pedido do criador e trate saldo insuficiente com mensagem clara, nunca com dívida da plataforma.
5. Aviso direto aos compradores: 7 dias antes do encerramento, um único e-mail de serviço (não de marketing, sem oferta) a cada comprador que ainda tenha acesso, com o nome da loja, a data do encerramento, o que pode ser baixado até lá (arquivos, episódios, certificados, os próprios trabalhos entregues) e o contato que o criador publicou. Se o criador assinar de novo depois do aviso, um segundo e-mail curto diz que a loja continua. Enviado por remetente do próprio Marktmorgen, com o endereço postal exigido por lei, dentro de um teto por loja calculado no custo de encerramento.
6. O estúdio e os avisos ao criador passam a dizer que os compradores serão avisados e quando.

Testes somente com Stripe e e-mail simulados, que falham se: um membro for cobrado entre o fim do plano e o encerramento; uma assinatura continuar ativa depois do encerramento; o valor não usado divergir do cálculo proporcional; um reembolso for feito duas vezes; o comprador não receber o aviso de 7 dias; ou a frase fixa faltar em algum caminho de checkout listado acima.

Regras para o item: é proibido criar contas, aceitar termos, contratar serviços, pagar qualquer valor, fazer reembolso real, solicitar aprovações e alterar preços, limites visíveis, comissão, CLOSING_DAYS, PLANS_ON_SALE, tax gate, art. 9a ou a revisão comercial. Nenhum e-mail real, nenhuma cobrança ou devolução real e nenhum registro real de cliente alterado. Todo texto público em inglês americano, com a acessibilidade exigida pela Parte A do item 274 [AX1]. Nada de escassez, urgência ou números inventados.

Estado inicial: na fila. Ao concluir, registre a data e a hora de Fortaleza, o commit, o resultado da suíte completa e a publicação.

## TC — Lições da auditoria da ThriveCart (23/10/2026)

**Ordem:** após todos os itens anteriores; este item não bloqueia nenhum outro. Inclusão documental após concluir a tarefa corrente; nada implementado agora.

Proveniência: pedido integral do dono recebido nesta conversa em 23/10/2026 às 16h42 (Fortaleza). Registro após a conclusão da entrega 187. Antes desta gravação, main, todos os 11 PRs abertos e os 408 heads codex/* foram atualizados; a auditoria das 76 branches recentes foi reutilizada pelos SHAs imutáveis e comparada com os heads atuais; os únicos heads alterado ou novo desde aquela listagem são 851 e 853, cujas filas foram relidas. Nenhuma seção TC, etiqueta TC1 ou ocupação do número 308 encontrada no escopo conferido; número 308 mantido, após EC307. A situação atual e o custo zero abaixo são o briefing do dono, a verificar no código e no orçamento antes da execução; não são certificação de implementação, custo total ou margem. Conferir novamente main/PRs/branches antes de implementar e executar apenas a diferença. Nenhum fato competitivo foi usado como afirmação pública neste registro.

Solicitação do dono (23/10/2026, 16h42, horário de Fortaleza): incorporar ao Marktmorgen as melhorias identificadas na auditoria estratégica da ThriveCart (thrivecart.com) que ainda não existam no código nem na fila. Antes do item, verifique o código e a fila e implemente apenas a diferença. Os fatos que a auditoria atribui à ThriveCart devem ser confirmados em fonte oficial datada antes de qualquer uso, e os números da ThriveCart jamais podem ser apresentados como resultados do Marktmorgen.

REGRA DOS 60% (OBRIGATÓRIA): todo cliente pagante, considerado isoladamente e usando 100% de todos os direitos do plano no pior mês, deve manter margem de lucro líquido MÍNIMA de 60%, depois de todos os custos e de todos os impostos, inclusive os brasileiros; a margem pode ser maior, mas nunca menor, e a mesma regra vale para a empresa como um todo. Antes de qualquer código, calcule o custo máximo mensal e anual do item por plano, com teto automático aplicado antes do gasto. Custo desconhecido não pode ser considerado zero. Use a leitura que resultar em MAIS imposto (docs/tax-uncertainty.md). Desde 22/10/2026, todos os custos fixos da LLC são atribuídos integralmente ao Marktmorgen (item 275 [FX1]).

308. [TC1] Sugestão de correção para e-mail digitado errado

Estado: na fila.

Objetivo: evitar que um comprador ou um criador perca o produto, o link de acesso ou o contato por ter digitado o e-mail com erro, como "maria@gmial.com" ou "joao@hotmail.con".

Situação atual: nenhum campo de e-mail das páginas do próprio Marktmorgen sugere correção.

Onde aplicar: em todos os campos de e-mail desenhados pelo Marktmorgen. Isso inclui o cadastro e o acesso do criador, os formulários das lojas, os produtos gratuitos, a lista de espera, o boletim, o contato, o pedido de afiliado, a gestão da assinatura pelo membro, a consulta de pedidos pelo comprador e a caixa de lembrete do checkout (lib/assistant-reminder*.ts). O campo de e-mail da página de pagamento do Stripe fica de fora, porque não é desenhado pelo Marktmorgen.

Como funciona:
1. A verificação acontece no próprio navegador, sem nenhuma chamada a servidor ou fornecedor, comparando o domínio digitado com uma lista embutida dos provedores de e-mail mais usados nos EUA, no Canadá, no Reino Unido e na União Europeia, e com os finais de domínio mais comuns (.com, .net, .org, .co.uk, .ca, .de, .fr e outros), por distância de edição pequena.
2. Quando houver um provável erro, aparece abaixo do campo, depois que a pessoa sai dele ou tenta enviar, a frase "Did you mean maria@gmail.com?" com um botão que preenche a sugestão. A pessoa pode ignorar e manter o que digitou; nada é corrigido sozinho, nada é bloqueado e o envio continua possível.
3. Acessibilidade (Parte A do item 274 [AX1]): a sugestão é anunciada em região ao vivo educada (aria-live="polite"), ligada ao campo por aria-describedby, sem tirar o foco do campo; o botão tem nome acessível completo, alvo de pelo menos 44 × 44 px, funciona por teclado, toque e voz, e respeita alto contraste e modo escuro. Nada pisca nem se move.
4. Idiomas: a frase sai em todos os idiomas de comprador que as lojas já têm (lib/buyer-words), sem acrescentar idiomas novos.
5. Privacidade: nenhum e-mail digitado é guardado, registrado ou enviado por causa da sugestão. Atualize a política de privacidade somente se algo nela precisar mudar.

Custo: zero por cliente, sem fornecedor; o tamanho da lista embutida entra no orçamento de desempenho das páginas (itens 277 e 281).

Testes: que a sugestão aparece para erros comuns de domínio e de final, não aparece para endereços corretos nem para domínios próprios desconhecidos, nunca altera o campo sem o clique, é anunciada a leitores de tela, funciona só com teclado e não faz nenhuma chamada de rede.

Regras para o item: é proibido criar contas, aceitar termos, contratar serviços, pagar qualquer valor, solicitar aprovações e alterar preços, limites visíveis, comissão, PLANS_ON_SALE, tax gate, art. 9a ou a revisão comercial. Testes somente com fornecedores simulados: nenhum e-mail real, nenhuma cobrança real e nenhum registro real de cliente alterado. Todo texto público em inglês americano, com a acessibilidade exigida pela Parte A do item 274 [AX1]. Nada de depoimentos, números, resultados, escassez ou urgência inventados, nem afirmação de superioridade sobre a ThriveCart ou sobre qualquer outro concorrente sem fonte oficial datada.

Estado inicial: na fila. Ao concluir, registre a data e a hora de Fortaleza, o commit, o resultado da suíte completa e a publicação.

## EM — Envios para a lista pelo fornecedor mais barato (23/10/2026)

Ordem: após todos os itens anteriores; este item não bloqueia nenhum outro. Inclusão documental após concluir a tarefa corrente; nada implementado agora.

Solicitação do dono (23/10/2026, 18h58, horário de Fortaleza): fazer com que os e-mails enviados para a lista dos criadores (boletins, campanhas e sequências) usem somente o fornecedor mais barato, para que o pior caso de custo desses envios seja calculado pelo preço dele, e, com isso, aumentar os limites de envio dos planos onde a margem de 60% se mantiver.

REGRA DOS 60% (OBRIGATÓRIA): todo cliente pagante, considerado isoladamente e usando 100% de todos os direitos do plano no pior mês, deve manter margem de lucro líquido MÍNIMA de 60%, depois de todos os custos e de todos os impostos, inclusive os brasileiros; a margem pode ser maior, mas nunca menor, e a mesma regra vale para a empresa como um todo. Antes de qualquer código, calcule o custo máximo mensal e anual do item por plano, com teto automático aplicado antes do gasto. Custo desconhecido não pode ser considerado zero. Nunca conte a cota gratuita de um fornecedor como custo zero; use o preço pago mais caro. Use a leitura que resultar em MAIS imposto (docs/tax-uncertainty.md). Desde 22/10/2026, todos os custos fixos da LLC são atribuídos integralmente ao Marktmorgen (item 275 [FX1]).

309. [EM1] E-mails para a lista somente pela Amazon SES, com fila de espera, e limites de envio maiores

Estado: na fila.

Situação atual:
- lib/email.ts envia cada e-mail pela Amazon SES (US$ 0,10 por mil, lib/ses.ts) sempre que a conta permite e, quando a Amazon não aceita, envia o mesmo e-mail na hora pelo Resend, que custa US$ 0,90 por mil acima do plano.
- Como qualquer e-mail pode cair no Resend, os limites de e-mails para a lista em lib/plan.ts (PRO_MONTHLY_EMAILS = 7.000 e SCALE_MONTHLY_EMAILS = 10.000) foram calculados ao preço do Resend.
- Observado pelo dono no console da Amazon em 23/10/2026, às 18h53: a conta "Marktmorgen" (553015629483), na região us-east-1, tem o SES liberado para produção, com cota de 50.000 e-mails por 24 horas e 14 por segundo; os domínios marktmorgen.com e mail.marktmorgen.com estão verificados; o status da conta é "Íntegro".
- Não verificado: se as quatro configurações AWS_SES_* de lib/ses.ts estão definidas na produção. Confirme isso sem expor nenhum valor e sem alterar configurações; se faltarem, registre em "Depende do dono" o passo exato.

O que construir, implementando apenas a diferença:
1. Separar os e-mails em duas classes, definidas no código e cobertas por teste:
(a) e-mails de serviço: links de acesso, recibos, entrega de produtos, avisos de cobrança, de reembolso e de encerramento de loja, e qualquer e-mail exigido por lei ou pelos termos;
(b) e-mails para a lista: campanhas, boletins, sequências e automações de marketing enviados pelo criador aos contatos dele.
2. Os e-mails de serviço continuam como hoje: Amazon primeiro e Resend em seguida, na hora.
3. Os e-mails para a lista nunca saem pelo Resend. Se a Amazon não aceitar (conta em análise, pausada, cota do dia usada ou sem resposta), eles esperam numa fila durável e são tentados de novo sozinhos, respeitando a cota e a taxa por segundo lidas da Amazon. Cada e-mail sai no máximo uma vez, usando a marca de lote que já existe (nl:ses:did). Se um envio continuar parado por mais de 72 horas, o criador é avisado no estúdio, em linguagem simples, e pode cancelar o envio; nada é descartado em silêncio.
4. Capacidade total: a cota da Amazon é da plataforma inteira. Calcule, a partir da cota lida da Amazon, quantos e-mails para a lista por mês a plataforma consegue entregar, e garanta que a soma dos limites de todas as lojas pagantes nunca passe de uma fração segura dessa capacidade. Se uma nova assinatura ou troca de plano fizesse a soma passar dessa fração, ela é recusada sozinha até a cota aumentar; a Amazon aumenta a cota por conta própria conforme a conta envia bem, e o pedido de aumento manual fica em "Depende do dono". Nunca venda um limite que a plataforma não consiga entregar.
5. Custo do pior caso dos e-mails para a lista, a partir de fontes oficiais datadas (aws.amazon.com/ses/pricing e a página de preços do Amazon SNS), sem contar cota gratuita:
- US$ 0,10 por mil e-mails;
- os dados enviados por gigabyte, pelo tamanho máximo de e-mail que o código permite;
- as notificações de devolução e de reclamação pelo SNS;
- qualquer recurso pago que o código use, como o VDM ou um IP dedicado.
O plano Pro do Resend continua nos custos fixos, e os e-mails de serviço continuam contados ao preço do Resend no pior caso de cada plano.
6. Com o novo custo, refaça o cálculo de cada plano nos dois intervalos (tests/plan-cost-registry.ts, tests/spend-floor.test.ts, tests/margin-alignment-table.ts e scripts/margin-alignment.mjs). Aumente os limites de e-mails para a lista do Studio e do Scale até o maior valor redondo que mantém 60% nos dois intervalos com a folga do spend floor, e avalie se o Store pode passar a ter um limite de e-mails para a lista com a mesma regra. Atualize lib/plan.ts, docs/value-presentation-2026-10-18.md e docs/margin-alignment-2026-10-18.md. As páginas de preços e as comparações leem os números do código.
7. As proteções de entregabilidade continuam como estão: lib/mail-health.ts (2% de devoluções e 0,08% de reclamações por loja), descadastro em um clique e endereço postal.

Testes somente com Amazon e Resend simulados, que falham se:
- um e-mail para a lista sair pelo Resend;
- um e-mail para a lista esperando na fila for enviado duas vezes ou descartado sem aviso;
- um e-mail de serviço deixar de cair no Resend quando a Amazon falhar;
- o custo dos e-mails para a lista divergir do preço oficial registrado;
- algum plano ficar abaixo de 60% em qualquer intervalo;
- uma venda for aceita quando a soma dos limites passar da capacidade segura.

Regras para o item: é proibido criar contas, aceitar termos, contratar serviços, pagar qualquer valor, alterar configurações reais da Amazon, do Resend ou da Vercel, pedir aumento de cota, enviar e-mails reais, solicitar aprovações e alterar preços, comissão, PLANS_ON_SALE, tax gate, art. 9a ou a revisão comercial. Limites visíveis só podem subir, nunca descer. Todo texto público em inglês americano, com a acessibilidade exigida pela Parte A do item 274 [AX1]. Nenhuma página pode prometer envios "sem limite".

Estado inicial: na fila. Ao concluir, registre a data e a hora de Fortaleza, o commit, o resultado da suíte completa e a publicação.

Proveniência do registro: pedido integral recebido pelo anexo Texto colado.txt; a tarefa corrente PR #856 foi incorporada em 23/10/2026 19:52:35 (Fortaleza), commit c21b47474d28b44e5fe3520f1d37691e4f002641, com 22/22 verificações e igualdade das árvores testada, prevista e incorporada. Sem entrega funcional ou incremento do contador. Conferidos main, 13 PRs abertos e 413 refs codex/* (três heads alterados desde auditoria anterior relidos; demais SHAs imutáveis já auditados): EM1 ausente e 309 livre. As informações de conta, preços e capacidade acima são observações/briefing do dono, ainda não verificações independentes de produção ou fontes oficiais para implementação. Antes de implementar, verificar fontes datadas, custos máximos mensais/anuais por plano, capacidade global, tetos e reserva; desconhecido reprova. Este registro documental não altera configurações nem envia mensagens; incremento operacional por plano mensal/anual 0/0, faturas reais de CI desconhecidas, não zero; margem de 60% não certificada.
