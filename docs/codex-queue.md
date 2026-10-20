# Fila de trabalho do Codex — Marktmorgen

Estado registrado em19/10/2026, após mesclagens623–625 (horários exatos nas entradas). Esta é uma fila de execução e evidência, não uma promessa de resultado, conformidade AAA ou margem fiscal certificada. Código remoto é a fonte canônica. Não refazer trabalho do Claude.

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
   - Estado: **em andamento; áreas e lacunas em docs/us-english-audit.md; próxima revisão codex/safe-error-messages**.
   - Custo e margem: Sem novo fornecedor; medir eventual mudança de payload dentro dos tetos existentes. M0 permanece referência, sem certificação fiscal.

140. **[B2-SAFE-ERROR-MESSAGES] Mensagens de erro inesperadas não são valores herdados**
   - Pedido: B2/P0/P4, revisão de estados de falha em formulários.
   - Estado: **em andamento; branch codex/safe-error-messages**.
   - Escopo: Login, alteração de endereço e configuração fiscal usam somente mensagens próprias da tabela local. Uma resposta com erro __proto__ ou constructor deve mostrar a explicação genérica existente, sem tratar um objeto/função herdado como texto. Não é alegação de poluição de protótipo; é proteção da interface contra resposta inesperada.
   - Prova: dois novos erros inesperados interceptados em cada formulário real390/1280, preservando casos de sucesso, recusa específica, HTTP, dados incompletos e controles pendentes. Total: login20, endereço22 e fiscal26 casos; nenhuma mensagem/gravação real. CI completo no novo head pendente.
   - Custo: fonte cliente+43caracteres em três componentes, sem nova operação/chamada/registro/serviço/franquia/preço/gate. M0 igual, ainda reprova60%; PLANS_ON_SALE=false.

141. **[B2-PAUSE-ACKNOWLEDGMENT] Confirmar a configuração de pausa sem prometer gravação incerta**
   - Pedido: B2/P0/P4, revisão de mensagens/estados de preferências de assinatura.
   - Estado: **em andamento; branch codex/pause-acknowledgment, após PR643**.
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
   - Estado: **em andamento; auditoria de13caminhos e registro, primeiro endurecimento de data no PR #629; coleta/duas provas/retenção/OSS ainda não implementados**.
   - Custo e margem: Custo de cálculo, registros10anos, evidências e operação ainda não calculado/integrado: calcular fornecedor pago mais caro, mensal/anual por plano, antes/depois; registrar no plan-cost-registry e spend-floor, reservar tetos antes do trabalho. Falta de conta é reprovação, não zero.

8. **[C-UK] Depois da UE, implementar tratamento do Reino Unido pela leitura com mais imposto, em todos os caminhos aplicáveis.**
   - Pedido: P2 C1/C2; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Ainda não calculado: orçamento por plano/intervalo e teto automático são pré-condições; não registrar tratamento como concluído antes de testes.

9. **[C-US] Depois do Reino Unido, implementar regras estaduais dos EUA de marketplace facilitator e registros necessários, por jurisdição e caminho de checkout.**
   - Pedido: P2 C1/C2; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Ainda não calculado; leitura fiscal mais onerosa, custos de obrigação/registro e teto por fornecedor/loja precisam de prova antes de custo novo.

### C2 — Capacidade dos planos (novos IDs estáveis)

89. **[C2-CAPACITY] Calcular o máximo de cada franquia em cada plano e nos dois intervalos**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **em andamento; branch codex/capacity-precheck; pré-verificação matemática, auditoria completa de unitários/configuração ainda pendente**.
   - Escopo e prova: Amplia I2 sem substituir seu número/estado. Conferir no código e calcular e-mails, ações de comunidade, visitas, pedidos, GB e horas de vídeo. Baseline fornecida: Store0e-mails/200ações/3.400visitas/200pedidos/5GB/4h; Studio7.000e-mails/1.000ações; Scale10.000e-mails/3.000ações. E-mail informado comoUS$0,90/mil em lib/plan.ts: verificar fornecedor/unidade mais cara. Comparação fornecida: Substack sem limite de envios, Kit grátis até10.000inscritos, Skool/Circle atividade de comunidade sem limite e Teachable alunos ilimitados/até1TB; são insumos do dono, não medição própria. Calcular máximo com60% ou mais no pior caso e comissão zero; subir somente onde ambos intervalos permitirem. Mudança de preço/pacote vai como proposta à seçãoI. M0 atual continua reprovada: nenhuma ampliação presumida.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

90. **[C2-EMAIL-HONESTY] Corrigir imediatamente a contradição pública sobre modelos de e-mail**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **concluído; PR637 incorporado em19/10/2026 às22:31:33Fortaleza; entrega54 verificada**.
   - Escopo e prova: Conferir os quatro modelos reais e o editor em lib/mail-body.ts/components/mail-designer.tsx. Em lib/feature-pages.ts, a seção de recursos anuncia quatro, mas a seção What it does not do yet ainda diz No templates. Corrigir a limitação para descrever o que existe e o que falta, com regressão na página real; sem prometer colunas ou capacidades ausentes.
   - Custo e margem: Texto dentro da página existente, sem novo envio/chamada/armazenamento/franquia. Medir payload; M0 antes=depois somente se o envelope não aumentar. Preços/limites/gates preservados, sem certificação de60%.

10. **[D7] Path para migração: produtos e páginas importados podem cumprir fatos correspondentes; importação nunca cria lead confirmado nem venda.**
   - Pedido: P1 item7; P2 D7; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Sem custo novo autorizado; conferir o código antes de construir.

11. **[D8] Resumo semanal factual no estúdio no fuso salvo do criador; e-mail somente se justificado, dentro da franquia e de mayNotify/margem de despacho.**
   - Pedido: P1 item8; P2 D8; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Leituras agregadas e eventual e-mail ainda não calculados; definir escopo/franquia/tetos e M0 antes/depois antes de adicionar custo.

12. **[D9] PayPal no dia7 e níveis somente com confirmação do servidor da própria loja, modo real e reembolsos descontados; não confundir com aprovação de PayPal como plataforma.**
   - Pedido: P1 item9; P2 D9; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Leituras PayPal, cache e custos ainda não calculados; nenhuma chamada sem admissão/teto. Não abrir integração pausada por aprovação ausente.

13. **[D10] Lead do Path apenas quando o endereço usa o link de confirmação, nunca só pelo envio da mensagem.**
   - Pedido: P1 item10; P2 D10; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Sem custo novo autorizado; conferir o código antes de construir.

14. **[D11] Selo Made with Marktmorgen opcional na loja, desligado por padrão e controlado pelo criador.**
   - Pedido: P1 item11; P2 D11; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Sem custo novo autorizado; conferir o código antes de construir.

15. **[D12] Painel privado do dono com ativação diária e tempo até primeira venda, apenas agregados sem identidades de criadores.**
   - Pedido: P1 item12; P2 D12; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Leitura/agregação/retenção ainda não calculadas; definir orçamento, tamanho mínimo de grupo e privacidade antes do código.

16. **[D13] Grupos opcionais de até6criadores por nicho/fuso aproximado, pseudônimos, check-in assíncrono só com missões, sem dinheiro; moderação, saída, exclusão e avisos com silêncio individual.**
   - Pedido: P1 item13; P2 D13; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Custos de moderação, registros, leitura e avisos ainda não calculados; franquias por plano, tetos automáticos e reserva antes de fornecedor obrigatórios. Nenhuma IA no trial.

17. **[D15] Executar testes reais do Path com NVDA, VoiceOver e TalkBack; registrar evidência e lacunas em docs/accessibility-programme.md, sem confundir axe/Playwright com leitor de tela.**
   - Pedido: P1 item15; P2 D15; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Sem fornecedor novo autorizado. Verificar disponibilidade operacional; se execução real depender de dispositivo/pessoa, registrar exatamente quem/o quê e seguir itens independentes.

### D2 — Diferenciais exclusivos (após o Path)

91. **[D2-EU-WITHDRAWAL] Consentimento europeu para entrega digital imediata**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Urgente antes de venda digital a consumidor da UE. Conferir no EUR-Lex a Diretiva2011/83/UE arts.9,14,16 com a redação2019/2161. Consentimento expresso para entrega imediata e reconhecimento da perda do direito, texto versionado e horário guardados, confirmação no e-mail da compra. Atualizar Termos/reembolso/privacidade juntos. Cobrir os checkouts aplicáveis, sem inferir consentimento nem abrir vendas ou declarar conformidade antes de prova.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

92. **[D2-PREORDER-GOAL] Meta de pré-venda com reembolso automático**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Conferir/reaproveitar lib/preorders.ts. Criador define mínimo de pedidos e data; meta não atingida reembolsa automaticamente pela própria conta Stripe e avisa compradores. Contagem real de pedidos, sem urgência/escassez falsa. Antes de ligar, informar que o Stripe não devolve sua taxa. Orçar reembolsos, avisos, concorrência, retries/idempotência e retenção.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

93. **[D2-VERIFIED-SOCIAL] Prova social calculada e verificável**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Opt-in desligado por padrão. Números reais da conta Stripe e registros da própria loja: compradores e conclusão de cursos, reembolsos descontados, sem arredondar para cima. Selo Verified by Marktmorgen e página pública de verificação com escopo e data; nunca números editáveis/inventados nem certificação geral implícita.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

94. **[D2-BUYER-TRUST] Cartão de confiança factual para o comprador**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Sistema calcula política de reembolso, entregas recentes bem-sucedidas, tempo médio de resposta, idade da loja e identidade verificada pelo Stripe, somente quando comprováveis. Nada preenchido manualmente pelo criador como se fosse verificação; privacidade, períodos, amostra/indisponibilidade e custo de leitura precisam de definição.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

95. **[D2-DEMAND-RADAR] Radar mensal do que o público solicita**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: A partir das perguntas no assistente/chat, perguntas sem resposta, motivos de reembolso e waitlists da própria loja. Sugestão por IA somente quando o criador pedir, paga pela franquia com reserva. Definir consentimento, retenção, agregação e acesso; sem expor compradores ou dados de outra loja.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

96. **[D2-LESSON-DROPOFF] Mapa de abandono das aulas**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Mostrar em qual aula alunos param, cruzado com reembolsos e sugestões de melhoria. Conferir medição real do servidor e registros existentes, denominadores/janela e privacidade; não apresentar correlação como causa nem inventar conclusão/tempo assistido.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

97. **[D2-OPEN-EXIT] Saída com exportação aberta e redirecionamento por90dias**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Exportar produtos, arquivos, cursos, lista com consentimento e páginas em formatos abertos com um clique. Redirecionar links da loja90dias após saída, compromisso nos Termos somente depois de implementação/prova/funding. Orçar tamanho, storage/banda, limite de ocorrência e exposição pós-cancelamento antes da promessa; preservar direitos de exportação/exclusão.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

98. **[D2-COMPLIANCE-REVIEW] Checagem factual de conformidade da loja**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Reunir arrependimento do item91, IVA da seçãoC, divulgação FTC automática nos links de afiliado e checagens de alt/contraste/legendas em páginas/arquivos do criador. Mostrar o que falta e como corrigir, com limites de verificação; não dizer AAA/conformidade legal por causa de uma nota ou teste automatizado.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

18. **[E1] Tutor por IA nas aulas, só conteúdo do curso, reaproveitando pool/heldToFacts e encaminhamento ao criador; add-on ou franquia, nunca trial.**
   - Pedido: P2 E1; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Pool/modelo ainda não dimensionados para esta finalidade; unitário mais caro, franquias/tetos e margens por plano/intervalo antes do código.

19. **[E2] Desafios na comunidade com início/fim, tarefas diárias, check-ins e pontos ligados a lib/community-points.ts.**
   - Pedido: P2 E2; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Calcular leituras/escritas, retenção e teto dentro das franquias antes de acrescentar custo.

20. **[E3] Criar rascunho de automação por IA a partir do objetivo; revisão humana antes de ligar; franquia de escrita existente.**
   - Pedido: P2 E3; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Calcular envelope de chamada, contador e hold prévio; não aumentar chamadas por job ou franquia sem análise.

21. **[E4] Coach de conteúdo por IA como add-on: reels/carrosséis/ideias/plano a partir dos próprios produtos/página/respostas; sem ler Instagram inicialmente; nunca trial.**
   - Pedido: P2 E4; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Preço proposto precisa de aprovação; dimensionar franquia/pool/tetos e60% na leitura mais onerosa mensal/anual antes de implementação que custe.

22. **[E5] Checkout escolhe idioma do navegador entre idiomas já oferecidos pela loja; preços em várias moedas definidos pelo criador, sem conversão automática.**
   - Pedido: P2 E5; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Conferir suporte atual primeiro; nenhum custo de câmbio permitido.

23. **[E6] Perguntas de telefone e checkbox no checkout.**
   - Pedido: P2 E6; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Conferir campos existentes; calcular bytes/validação nas franquias atuais, sem custo de fornecedor novo.

24. **[E7] Expiração de acesso a curso em data escolhida pelo criador e pontos por concluir aulas.**
   - Pedido: P2 E7; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Dimensionar leituras/escritas e recorrência dentro dos tetos antes de código com custo.

25. **[E8] Relatórios personalizados com envio agendado por e-mail dentro da franquia.**
   - Pedido: P2 E8; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Calcular consulta/agendamento/armazenamento/e-mails; teto e admissão por loja/fornecedor antes do envio.

26. **[E9] Explicações opcionais por IA nas revisões de página e funil, com checagens fixas autoritativas e franquia de IA.**
   - Pedido: P2 E9; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Orçar envelope, quota e hold antes do modelo; nunca no trial.

27. **[E10] Ações de escrita no MCP criam rascunhos de páginas/e-mails/produtos reutilizando lib/api-write.ts.**
   - Pedido: P2 E10; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Conferir capacidade e autorização atuais; orçar gravações/bytes nos tetos existentes.

28. **[E11] Edições pagas da newsletter restritas a membros.**
   - Pedido: P2 E11; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Orçar e-mails, direitos de acesso, registros e custos fiscais por checkout; não abrir vendas.

29. **[E12] Mais lugares na equipe da loja, hoje5, somente se custo quase zero e margem permitir.**
   - Pedido: P2 E12; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Quantificar pior caso por lugar, RBAC/retencão e tetos; aumento de limite só se ambos intervalos permitirem.

30. **[E13] Aviso ao sair do checkout, sem urgência falsa nem desconto inventado.**
   - Pedido: P2 E13; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Sem fornecedor novo; demonstrar acessibilidade e ausência de bloqueio/coerção antes de publicar.

31. **[E14] Completar preços por país sem nenhum preço deixar o plano abaixo do piso.**
   - Pedido: P2 E14; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Proposta e conta primeiro; alteração de preço de plano exige aprovação explícita, sem usar preços para fazer teste passar.

### E2 — Novos ganhos rápidos (ordem aprovada P4)

99. **[E2-TAG-BROADCAST] Enviar e-mail a etiqueta ou segmento**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Conferir lib/broadcasts.ts e seleção atual: etiqueta/segmento além de todos/compradores/leads, sempre dentro da franquia e consentimento.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

100. **[E2-MEMBER-PUBLICATIONS] Posts e edições publicados só para membros**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Juntar a E11, sem duplicar implementação: blog e /letters restritos a quem tem produto escolhido, com arquivo de edições para membros. Autorização no servidor e retirada de acesso/refundos em todos os caminhos.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

101. **[E2-PUBLICATION-REACTIONS] Comentários e curtidas no blog e nas edições**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Reaproveitar lib/lesson-comments.ts com moderação, permissões, exclusão e tetos; não publicar contatos ou aumentar atividade fora da franquia.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

102. **[E2-COURSE-COMPLIANCE] Ordem de aulas e90% de vídeo medidos no servidor**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Conferir o que já existe. Pré-requisitos obrigatórios e regra assistir90% antes de liberar a próxima, sem aceitar afirmação arbitrária do navegador como prova. Considerar acessibilidade e alternativas equivalentes sem certificar presença fictícia.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

103. **[E2-LESSON-MEDIA] Áudio, PDF na aula e blocos de código/HTML**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Dentro do storage e demais limites existentes; PDF acessível, código legível por teclado/leitor e HTML isolado/sanitizado, sem script/conteúdo perigoso ou capacidade não comprovada.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

104. **[E2-MODULE-PUSH] Push quando um módulo do curso libera**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Conferir lib/web-push.ts; opt-in/dispositivos, retirada, fuso/silêncio e franquias existentes. Sem push real nos testes.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

105. **[E2-COURSE-AI-DRAFT] Rascunho de aulas e página de venda a partir do esboço**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: IA somente por pedido do criador, paga pela franquia com hold prévio; revisão humana, fatos próprios, sem ganho/depoimento/escassez inventados, nunca trial.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

106. **[E2-CHECKOUT-EXTRAS] Até10compras adicionais no checkout**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Hoje informado como3, Teachable10: conferir código. Aumento só com custo e60% nos dois intervalos, preço/total claro, nenhuma caixa pré-marcada e todas as combinações/caminhos fiscais testados.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

107. **[E2-BROADCAST-CONTENT-AB] A/B do conteúdo de envios de e-mail**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Além das sequências: seleção aleatória, denominadores, contagem factual de visitas/vendas, consentimento de cliques, nunca aberturas/pixels. Todos os envios dentro da franquia.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

108. **[E2-BLOG-RSS-MAIL] Enviar novos posts à lista por RSS**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Conferir publicações e filas existentes; envios automáticos só com configuração/consentimento, idempotência, limite de polling e franquia de e-mails.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

109. **[E2-EVENTS] Eventos recorrentes, waitlist, ingressos, cupons e presença pública**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Juntar a F5 ingressos presenciais/QR. Presença pode virar contato somente com consentimento pertinente; conferir recorrência/fuso/cancelamento/reembolso, capacidade real e permissões de publicação.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

110. **[E2-MEMBER-PROFILES] Campos de perfil, etiquetas, grupos de acesso e mapa de membros**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Conferir perfis atuais; controle do próprio membro, opt-in/localização aproximada, visibilidade, retirada/exclusão e acesso no servidor. Nada de endereço preciso público ou inferência de consentimento.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

111. **[E2-COMMUNITY-AUTOMATION] Gatilhos, webhooks e DM da comunidade**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Post publicado, membro entrou, presença confirmada e nível alcançado. Resposta automática por DM só autorizada/opt-in, dentro de tetos, sem duplicatas e sem mensagens reais no teste.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

112. **[E2-POINTS] Pontos por posts, comentários e aulas concluídas**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Juntar a E7 e lib/community-points.ts; níveis e limites definidos pelo criador, fatos válidos do servidor, antirrepetição e reversão pertinente, sem premiar eventos inventados.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

113. **[E2-COMMUNITY-MODERATION] Filtro de palavras e moderação automática de spam**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Conferir moderação atual; regras/limites, revisão/recursos, falsos positivos e privacidade. IA, se vier a ser proposta, exige pool/reserva/custo próprios e autorização do escopo.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

114. **[E2-AFFILIATE-TAX-FORMS] W-9/W-8BEN e exportação para1099**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Conferir obrigações aplicáveis e implementação antes de construir. Números criptografados, acesso mínimo, gestão de chaves, retenção/exclusão, custo e exportação segura; nenhum documento real ou submissão fiscal nos testes.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

115. **[E2-FOUNDING-MEMBERS] Plano fundador de preço maior nas assinaturas**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Opção de preço do produto/membro definida pelo criador; não altera preço dos planos Marktmorgen, assinaturas existentes ou cobranças sem escolha. Conferir Stripe, avisos, direitos e custos fiscais.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

32. **[F1] Construtor de páginas mais livre, preservando acessibilidade, desempenho e honestidade.**
   - Pedido: P2 F1; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Dimensionar payload, storage, renderização e limites antes de expandir envelope.

33. **[F2] Podcast público Apple/Spotify e importação RSS de podcast existente.**
   - Pedido: P2 F2; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Preço pago mais caro de banda/storage/ingestão; teto de banda por plano, admissão e antes/depois mensal/anual antes de fornecedor.

34. **[F3] Portal individual de mentoria sobre chamadas/tarefas/notas existentes, resumo de sessão por IA medido/cobrado como legendas.**
   - Pedido: P2 F3; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Orçar direitos, registros e resumo por uso; preço novo em proposta para aprovação, não ativar cobrança.

35. **[F4] Mais idiomas de legenda e dublagem por IA, cobrados por uso, se fornecedor oferecer.**
   - Pedido: P2 F4; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Verificar capacidade oficial e custo mais caro por minuto/idioma; teto e reserva prévios; não prometer idioma sem prova.

36. **[F5] Ingressos presenciais e check-in por QR code.**
   - Pedido: P2 F5; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Orçar emissão/validação/offline/retenção/checkout fiscal e admissão antes de custo novo.

37. **[F6] Exportar vendas para Xero e QuickBooks.**
   - Pedido: P2 F6; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Conferir APIs/aprovações; orçar exportações/filas/retenção/tetos, sem criar conta nem solicitar aprovação.

38. **[F7] Comparar velocidade e uso móvel com ClickFunnels/Kajabi/Hotmart/Stan por medições reais e registrar o que não puder medir.**
   - Pedido: P2 F7; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Sem alegações comparativas antes de metodologia, ambiente e evidência reproduzível; custo de ferramentas precisa de aprovação se novo.

### F2 — Novos itens maiores (ordem aprovada P4)

116. **[F2-COMMUNITY-CHANNELS] Vários chats, grupos, reações e atualização ao vivo**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Conferir sala atual de polling5–30segundos. Orçar conexões, mensagens, concorrência, leitura e banda em uso integral; permissões entre grupos, moderação e acessibilidade.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

117. **[F2-COMMUNITY-MAIL] E-mails de resposta/menção e resumo periódico**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Só para quem optou por receber, dentro da franquia; agregação/fuso/silêncio, supressão/unsubscribe, teto automático, sem novo envio real.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

118. **[F2-READER-REFERRALS] Indicação de leitores/alunos com meses ou produto**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Recompensa por cupom na conta Stripe do criador, com teto de confirmações e antiabuso/idempotência. Nenhum dinheiro sob custódia do Marktmorgen; custo de e-mails e exposição de recompensa antes de ativar.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

119. **[F2-FREE-RECOMMENDATIONS] Recomendações gratuitas entre lojas**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Escolha transparente do criador na confirmação de inscrição, sem pagamento, sem inscrição automática em outra lista; versão paga fora do escopo, privacidade/consentimento e teto de leituras.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

120. **[F2-IMPORTS] Imports de Substack, Kit e Teachable**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Substack/Kit: inscritos e posts; Teachable: aulas, vídeos e provas. Dentro de importação/storage, validação do export real, consentimento, limites por arquivo, preview e isolamento. Teste sintético não é prova de export real.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

121. **[F2-SUBSCRIPTION-GIFTS] Presentes e grupo para assinaturas/membros**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Conferir suporte atual a pagamento único; orçar direitos recorrentes, cancelamento/reembolso, cobrança e convites com consentimento, sem duplicar lugares ou vender acesso não confirmado.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

122. **[F2-COMMUNITY-AI] Agente de comunidade com resumo/moderação**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Add-on pago proposto, com reserva antes do modelo, conteúdo da própria comunidade, privacidade/moderação humana, tetos e60% por unidade/intervalo. Preço proposto precisa do dono; nunca trial.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

123. **[F2-COMMUNITY-DIRECTORY] Diretório público e avaliações de comunidades**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Gratuito e opt-in somente com lojas suficientes, como diretório de afiliados; definir critério/base mínima, moderação, verificação de avaliações, exposição financiada e privacidade.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

124. **[F2-EDIT-SENT-LINKS] Editar destino de links de e-mail enviado**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Redirecionamento por link, com autorização, destinos seguros, história/retirada, retenção e custo de leitura/alteração. Preservar ausência de tracking de abertura e consentimento de cliques.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

125. **[F2-EMAIL-POLLS] Enquetes por clique em e-mail**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Consentimento explícito por clique, antiscanner, autenticação/antirrepetição, opção de retirada e privacidade; não inferir voto da mera abertura.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

126. **[F2-MULTIPLE-COMMUNITIES] Mais de uma comunidade por loja**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Conferir arquitetura atual; isolamento de membros, acessos, cotas, moderação, retenção, custos e sem reduzir direitos/limites existentes.
   - Custo e margem: Antes de construir: conferir capacidade existente no main e preservar Claude. Custo unitário pago mais caro, uso integral simultâneo por plano mensal/anual, taxas de receiving-costs e leitura fiscal mais onerosa (nunca abaixo de27,5%); teto por fornecedor/loja e reserva antes da operação, plan-cost-registry/spend-floor. Desconhecido reprova; sem cortar limite visível, mudar preço ou afrouxar gates.

39. **[G1] Documentar requisitos Meta para AutoDM, comentários, inbox Instagram/Messenger e WhatsApp; depois código pronto e desligado até aprovação.**
   - Pedido: P2 G1; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Documentar custo por mensagem/conversa conforme unidade oficial vigente, prazos e franquia/tetos que sustentem margem; nenhuma conta ou pedido de aprovação autorizado.

40. **[G2] Documentar e preparar agendamento de posts Meta/TikTok, desligado até aprovação.**
   - Pedido: P2 G2; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Calcular postagem/renovação/token/filas/franquia e teto antes de fornecedor; nenhuma solicitação de aprovação.

41. **[G3] Documentar Google Business Profile e preparar resposta a avaliações, desligada até aprovação.**
   - Pedido: P2 G3; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Calcular quotas, custos, aprovação e armazenamento; não pedir aprovação sem dono.

42. **[G4] Documentar e preparar criação de anúncios dentro do produto, desligada.**
   - Pedido: P2 G4; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Não criar campanhas, conta ou gasto de anúncio; separar verba do criador e todos os custos/obrigações antes de código.

43. **[G5] Manter PayPal plataforma e links Zoom prontos e desligados; auditar implementação já existente sem refazer.**
   - Pedido: P2 G5; datas/horas e grau de certeza em Proveniência.
   - Estado: **aguardando terceiros (PayPal e Zoom: aprovações; código existente deve continuar desligado, conferir evidência)**.
   - Custo e margem: aguardando terceiros (PayPal/Zoom: aprovação e requisitos externos; nenhuma solicitação autorizada).

44. **[H1] Aplicativo nativo iPhone/Android: App Store/Google Play, venda digital fora do app, anuidades/manutenção; avaliar manter PWA instalável.**
   - Pedido: P2 H1; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: SOMENTE DOCUMENTO agora. Custos/franquias e margens antes/depois por plano mensal/anual ainda não calculados; qualquer custo desconhecido reprova implementação. Sem conta, contrato ou fornecedor novo.

   - Ampliação P4 de H1: incluir aulas offline no celular (Teachable), como estudo documental, junto da avaliação de app/PWA; sem downloads offline/licenças/armazenamento novo agora.

45. **[H2] Transmissão ao vivo hospedada, preço por minuto e teto automático.**
   - Pedido: P2 H2; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: SOMENTE DOCUMENTO agora. Custos/franquias e margens antes/depois por plano mensal/anual ainda não calculados; qualquer custo desconhecido reprova implementação. Sem conta, contrato ou fornecedor novo.

   - Ampliação P4 de H2: incluir chamadas gravadas e transmissão própria com gravação e salas paralelas (Skool/Circle/Substack), juntas neste estudo. Continua somente documento; não reabre a implementação excluída em X6.

46. **[H3] Marketplace com produtos de todos os criadores: moderação, consumo e condição de muitas lojas antes de valer.**
   - Pedido: P2 H3; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: SOMENTE DOCUMENTO agora. Custos/franquias e margens antes/depois por plano mensal/anual ainda não calculados; qualquer custo desconhecido reprova implementação. Sem conta, contrato ou fornecedor novo.

47. **[H4] Compra de domínio dentro do produto.**
   - Pedido: P2 H4; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: SOMENTE DOCUMENTO agora. Custos/franquias e margens antes/depois por plano mensal/anual ainda não calculados; qualquer custo desconhecido reprova implementação. Sem conta, contrato ou fornecedor novo.

48. **[H5] SMS, ligações e atendente de voz por IA: preços mais caros, registro em operadoras, franquia/teto; nenhum código antes das vendas abrirem.**
   - Pedido: P2 H5; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: SOMENTE DOCUMENTO agora. Custos/franquias e margens antes/depois por plano mensal/anual ainda não calculados; qualquer custo desconhecido reprova implementação. Sem conta, contrato ou fornecedor novo.

49. **[H6] Compra com dois cartões: efeitos em reembolsos e disputas.**
   - Pedido: P2 H6; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: SOMENTE DOCUMENTO agora. Custos/franquias e margens antes/depois por plano mensal/anual ainda não calculados; qualquer custo desconhecido reprova implementação. Sem conta, contrato ou fornecedor novo.

127. **[H7-CUSTOM-CSS] Estudo de CSS personalizado, por último em H**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Somente documento: riscos às regras de design, contraste, foco, legibilidade, injeção/recursos externos, suporte, desempenho e orçamento; nenhuma liberação de CSS agora.
   - Custo e margem: SOMENTE DOCUMENTO. Nenhuma nova operação/conta/fornecedor. Custos futuros e limites ainda precisam do cálculo completo; desconhecido reprova.

50. **[I1] Escrever docs/packaging-vs-competitors.md comparando Store69/Studio449/Scale999 com os preços/fontes fornecidos de Stan/Kajabi/Hotmart/ClickFunnels/HighLevel, recurso por recurso.**
   - Pedido: P2 I1; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: SOMENTE PROPOSTA. Nenhum preço/pacote/limite/pagamento muda sem aprovação do dono; custo unitário pago mais caro, franquias/tetos e leitura fiscal mais onerosa antes/depois são obrigatórios. Enquanto M0 reprovar, não declarar proposta financeiramente aprovada.

   - Ampliação P4 de I1 (proposta, dados fornecidos em19/10/2026, não cotação própria): Skool HobbyUS$9/mês+10%+30¢ e ProUS$99+2,9%+30¢; Kit grátis até10.000inscritos, CreatorUS$33, ProUS$66, vendas3,5%+30¢; CircleUS$89/199/419 por mês no anual+2%/1%/0,5%; TeachableUS$39/89/189+7,5% no Starter; Substack10% das assinaturas+0,5% recorrente. Incluir domínio próprio no Store como proposta (Circle informado em todos os planos), sem ativar nem alterar preço/pacote. Conferir termos/unidade/cadência antes de comparação pública.

51. **[I2] Propor quantos e-mails Store pode incluir nos intervalos mensal/anual mantendo piso na leitura fiscal vinculante, sem reduzir limite visível.**
   - Pedido: P2 I2; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: SOMENTE PROPOSTA. Nenhum preço/pacote/limite/pagamento muda sem aprovação do dono; custo unitário pago mais caro, franquias/tetos e leitura fiscal mais onerosa antes/depois são obrigatórios. Enquanto M0 reprovar, não declarar proposta financeiramente aprovada.

   - Ampliação P4 de I2: incorporar a matriz completa da nova entrada89/C2; todo aumento exige60% nos dois intervalos sob a leitura vinculante. Quando depender de preço/pacote, somente proposta ao dono.

52. **[I3] Comparar indicação entre criadores já pronta/pausada (50% em crédito) com20% em dinheiro e propor após conta de margem.**
   - Pedido: P2 I3; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: SOMENTE PROPOSTA. Nenhum preço/pacote/limite/pagamento muda sem aprovação do dono; custo unitário pago mais caro, franquias/tetos e leitura fiscal mais onerosa antes/depois são obrigatórios. Enquanto M0 reprovar, não declarar proposta financeiramente aprovada.

53. **[J1] Criar matrizes Kajabi/Hotmart/Stan em .md e .json no formato HighLevel, usando levantamento oficial fornecido e conferindo cada capacidade no código; manter ClickFunnels/HighLevel atualizados em cada entrega.**
   - Pedido: P2 J1; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Documentação/teste; sem custo de fornecedor. Preços externos fornecidos são referência de19/10/2026, não cotação atual garantida.

### J1 — Matrizes adicionais do levantamento P4

128. **[J1-SKOOL] Matriz skool em Markdown e JSON**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Criar docs/skool-gap-matrix.md e docs/skool-gap-matrix.json, formato compatível com HighLevel; usar os itens/fontes P4, conferir main por capacidade antes de construir e separar existente/testado/publicado/pendente/fora de escopo. Sem tratar preço fornecido, teste sintético ou promessa de fornecedor como prova própria.
   - Custo e margem: Documentação/teste, sem fornecedor novo. Preços externos são pesquisa fornecida de19/10/2026; capacidade futura com custo depende da conta completa e reservas, não da matriz.

129. **[J1-KIT] Matriz kit em Markdown e JSON**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Criar docs/kit-gap-matrix.md e docs/kit-gap-matrix.json, formato compatível com HighLevel; usar os itens/fontes P4, conferir main por capacidade antes de construir e separar existente/testado/publicado/pendente/fora de escopo. Sem tratar preço fornecido, teste sintético ou promessa de fornecedor como prova própria.
   - Custo e margem: Documentação/teste, sem fornecedor novo. Preços externos são pesquisa fornecida de19/10/2026; capacidade futura com custo depende da conta completa e reservas, não da matriz.

130. **[J1-CIRCLE] Matriz circle em Markdown e JSON**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Criar docs/circle-gap-matrix.md e docs/circle-gap-matrix.json, formato compatível com HighLevel; usar os itens/fontes P4, conferir main por capacidade antes de construir e separar existente/testado/publicado/pendente/fora de escopo. Sem tratar preço fornecido, teste sintético ou promessa de fornecedor como prova própria.
   - Custo e margem: Documentação/teste, sem fornecedor novo. Preços externos são pesquisa fornecida de19/10/2026; capacidade futura com custo depende da conta completa e reservas, não da matriz.

131. **[J1-TEACHABLE] Matriz teachable em Markdown e JSON**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Criar docs/teachable-gap-matrix.md e docs/teachable-gap-matrix.json, formato compatível com HighLevel; usar os itens/fontes P4, conferir main por capacidade antes de construir e separar existente/testado/publicado/pendente/fora de escopo. Sem tratar preço fornecido, teste sintético ou promessa de fornecedor como prova própria.
   - Custo e margem: Documentação/teste, sem fornecedor novo. Preços externos são pesquisa fornecida de19/10/2026; capacidade futura com custo depende da conta completa e reservas, não da matriz.

132. **[J1-SUBSTACK] Matriz substack em Markdown e JSON**
   - Pedido: P4, atualização70946172-40e4-4720-9329-d64271855eb4;19/10/2026, hora original não fornecida.
   - Estado: **a fazer**.
   - Escopo e prova: Criar docs/substack-gap-matrix.md e docs/substack-gap-matrix.json, formato compatível com HighLevel; usar os itens/fontes P4, conferir main por capacidade antes de construir e separar existente/testado/publicado/pendente/fora de escopo. Sem tratar preço fornecido, teste sintético ou promessa de fornecedor como prova própria.
   - Custo e margem: Documentação/teste, sem fornecedor novo. Preços externos são pesquisa fornecida de19/10/2026; capacidade futura com custo depende da conta completa e reservas, não da matriz.

54. **[J2] Registrar diferenças favoráveis já existentes somente com prova no código: Stripe direto, domínio, lojas/equipe/opções, presentes/equipe/waitlist/pré-venda/avaliações, podcast privado/licenças/PDF/Discord/provas, ofertas/API/Zapier/e-mail/importação/A-B e recursos do plano69. Velocidade comparativa exige metodologia/evidência real.**
   - Pedido: P2 J2; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
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

59. **[EXCELENCIA] Revisão contínua de todo site/estúdio por área após fila e como critério transversal em cada item: AAA como ponto de partida, teclado, baixa visão, audição, motor, cognição, dispositivos, navegadores e desempenho; referência GOV.UK/Apple; PRs pequenos e evidência em accessibility-programme.**
   - Pedido: P0; P2 padrão1–11; P3 regra4; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
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
   - Estado: **em andamento; branch codex/address-confirmation; depende explicitamente634; alterações próprias em RenameForm e suíte store-copy, sem editar SignInForm/agreements**.
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
   - Estado: **em implementação; PR663, head d61038e passou completo; conflito do histórico da fila resolvido preservando main; nova suíte integral obrigatória**.
   - Escopo: preservar perguntas existentes de lib/home-faq.ts; acrescentar How much does it cost? (lib/plan.ts), Is there a contract? Can I cancel anytime? (termos reais), Can I move from Kajabi, Stan or another platform? (contatos/produtos/compradores conforme importadores e /platform/switching-to-marktmorgen), Does it connect to my other tools? (Zapier/webhooks/API reais e /developers), Is there support, and how? (canal real sem SLA inventado), How long does it take to open a store? (somente passos/tempo demonstráveis, sem promessa).
   - Prova: conferir código/main e páginas antes de responder; preços sem duplicação, links, FAQ acessível,390px, lint/tipos/testes integrais. Custo/M0 antes/depois: texto e links no envelope existente; nova chamada/email/IA/banda exige registry/spend-floor, maior custo pago, impostos e teto automático antes. A leitura vinculante continua reprovada, não certificada; vendas fechadas.

152. **[S11-HOME-CTAS] Ações ao longo da home**
   - Pedido: mesma continuação direta S10–S12.
   - Estado: **em implementação; PR664/head e91c584 passou integral; integração explícita do pai atual exige novo CI completo**.
   - Escopo: a cada uma ou duas seções, botão Start your store e segunda opção See the live demo, com destinos existentes e nomes consistentes. Sem free no CTA, Talk to an expert ou Book a demo; sem pop-up/urgência.
   - Prova: sequência real de seções, links, foco/teclado, nomes acessíveis e390px sem overflow. Sem telemetria/chamada/custo novo por inserir botões; registrar M0 antes/depois, não mudar preço/limite/gate nem afirmar60% fiscal comprovado.

153. **[S12-HOME-PATH] Jornada factual do Marktmorgen Path na home**
   - Pedido: mesma continuação direta S10–S12.
   - Estado: **em implementação; PR665/head7c77a6b passou integral; integração explícita do pai atual exige novo CI completo**.
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
- Estado: **Implementado; aguardando verificação integral e incorporação documental**.
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

- Estado: **Cálculo próprio registrado antes da implementação; implementado; CI integral e publicação pendentes**.
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

- Estado: **Cálculo próprio registrado antes do código; implementado; CI integral e publicação pendentes**.
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

Estado: em andamento, iniciado em20/10/2026 17:29 de Fortaleza após publicação123. Primeira etapa: executar a suíte existente também emFirefox/WebKit, sem substituir motores silenciosamente. Matriz completa de jornadas/larguras/modos AAA ainda pendente; item não concluído. Antes do item202 e de qualquer novo B2.

Escopo e prova: acrescentar Firefox e WebKit (Safari) aos testes Playwright existentes, sem serviço pago; se a instalação não for possível, registrar motivo exato e requisitos. Exercitar home, preços, cadastro, criação de produto, publicação da loja, página da loja, checkout e área do comprador nas larguras320,390,768,1280 e1920px: axe incluindo regras AAA, teclado, zoom400% com reflow, espaçamento WCAG1.4.12, movimento reduzido e alto contraste. Corrigir falhas em PRs pequenos com prova de falha antes e aprovação depois. Inventariar lacunas de aparelhos reais (iPhone, Android, Windows/Edge, tablets), custos de aparelhos ou nuvem como BrowserStack/Sauce Labs com fonte oficial e data. Não contratar, criar conta nem realizar submissão externa. Ao concluir registrar data/hora Fortaleza, commits, testes, publicação e lacunas; evidência sintética não equivale a aparelho real.

Custo e margem: calcular minutos de CI e qualquer outro custo. Testes não têm custo por cliente; eventual custo fixo novo entra nos custos fixos da empresa, nunca em preços ou limites. Não contratar serviço. Mínimo60% líquido por cliente isolado com100% dos direitos no pior mês e no consolidado, após todos os custos/impostos inclusive brasileiros; desconhecido reprova. PLANS_ON_SALE, tax gate, art.9a, revisão comercial, preços, limites e comissão intactos.

202. **[P0-REAL-PEOPLE] Planejar testes com pessoas reais com deficiência e calcular o custo**

Pedido: P0, pedido de excelência/acessibilidade de 19/10/2026; acrescentado por pedido do dono em 20/10/2026, às16:51 de Fortaleza.

Estado: na fila; executar após201, antes de qualquer novo B2. Termina com plano e custo; contratação depende exclusivamente do dono.

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
