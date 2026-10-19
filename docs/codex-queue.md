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
   - Estado: **em andamento (branch codex/us-english-composer-copy; áreas públicas/legais, após PR #623)**.
   - Custo e margem: Sem novo fornecedor; medir eventual mudança de payload dentro dos tetos existentes. M0 permanece referência, sem certificação fiscal.

5. **[B3] Adicionar teste de texto da plataforma que recuse grafias britânicas comuns: colour, centre, organise, licence, cancelled, behaviour, afterwards e tick/untick; distinguir texto exibido de código, citações e dados.**
   - Pedido: P2 B3; datas/horas e grau de certeza em Proveniência.
   - Estado: **em andamento (branch codex/platform-us-english-guard)**.
   - Custo e margem: Teste de desenvolvimento; sem custo de produção.

6. **[B4] Escrever docs/site-languages.md: traduções completas no código após abertura/autorização; alemão, francês, holandês, espanhol e italiano; seletor sem bandeiras, hreflang e frases proibidas por idioma; estudo fiscal por país para japonês/coreano/chinês; futuro português do Brasil.**
   - Pedido: P2 B4; datas/horas e grau de certeza em Proveniência.
   - Estado: **em andamento (documento completo em revisão; branch codex/site-language-design)**.
   - Custo e margem: Só documento. Nenhuma tradução em tempo de requisição ou custo por visita; custo de conteúdo/manutenção e fiscalidade ainda precisam ser calculados.

7. **[C-UE] Construir tratamento de IVA europeu do art.9a em docs/eu-vat-article-9a.md: OSS não-UE desde a primeira venda, duas provas de localização coerentes (24b/24f), retenção art.63c por10anos; imposto no comprador ou repasse, nunca na comissão. Dividir em PRs por caminho de checkout e prova.**
   - Pedido: P2 C1/C2; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Custo de cálculo, registros10anos, evidências e operação ainda não aprovado: calcular fornecedor pago mais caro, mensal/anual por plano, antes/depois; registrar no plan-cost-registry e spend-floor, reservar tetos antes do trabalho. Falta de conta é reprovação, não zero.

8. **[C-UK] Depois da UE, implementar tratamento do Reino Unido pela leitura com mais imposto, em todos os caminhos aplicáveis.**
   - Pedido: P2 C1/C2; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Ainda não calculado: orçamento por plano/intervalo e teto automático são pré-condições; não registrar tratamento como concluído antes de testes.

9. **[C-US] Depois do Reino Unido, implementar regras estaduais dos EUA de marketplace facilitator e registros necessários, por jurisdição e caminho de checkout.**
   - Pedido: P2 C1/C2; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Ainda não calculado; leitura fiscal mais onerosa, custos de obrigação/registro e teto por fornecedor/loja precisam de prova antes de custo novo.

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

45. **[H2] Transmissão ao vivo hospedada, preço por minuto e teto automático.**
   - Pedido: P2 H2; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: SOMENTE DOCUMENTO agora. Custos/franquias e margens antes/depois por plano mensal/anual ainda não calculados; qualquer custo desconhecido reprova implementação. Sem conta, contrato ou fornecedor novo.

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

50. **[I1] Escrever docs/packaging-vs-competitors.md comparando Store69/Studio449/Scale999 com os preços/fontes fornecidos de Stan/Kajabi/Hotmart/ClickFunnels/HighLevel, recurso por recurso.**
   - Pedido: P2 I1; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: SOMENTE PROPOSTA. Nenhum preço/pacote/limite/pagamento muda sem aprovação do dono; custo unitário pago mais caro, franquias/tetos e leitura fiscal mais onerosa antes/depois são obrigatórios. Enquanto M0 reprovar, não declarar proposta financeiramente aprovada.

51. **[I2] Propor quantos e-mails Store pode incluir nos intervalos mensal/anual mantendo piso na leitura fiscal vinculante, sem reduzir limite visível.**
   - Pedido: P2 I2; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: SOMENTE PROPOSTA. Nenhum preço/pacote/limite/pagamento muda sem aprovação do dono; custo unitário pago mais caro, franquias/tetos e leitura fiscal mais onerosa antes/depois são obrigatórios. Enquanto M0 reprovar, não declarar proposta financeiramente aprovada.

52. **[I3] Comparar indicação entre criadores já pronta/pausada (50% em crédito) com20% em dinheiro e propor após conta de margem.**
   - Pedido: P2 I3; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: SOMENTE PROPOSTA. Nenhum preço/pacote/limite/pagamento muda sem aprovação do dono; custo unitário pago mais caro, franquias/tetos e leitura fiscal mais onerosa antes/depois são obrigatórios. Enquanto M0 reprovar, não declarar proposta financeiramente aprovada.

53. **[J1] Criar matrizes Kajabi/Hotmart/Stan em .md e .json no formato HighLevel, usando levantamento oficial fornecido e conferindo cada capacidade no código; manter ClickFunnels/HighLevel atualizados em cada entrega.**
   - Pedido: P2 J1; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Documentação/teste; sem custo de fornecedor. Preços externos fornecidos são referência de19/10/2026, não cotação atual garantida.

54. **[J2] Registrar diferenças favoráveis já existentes somente com prova no código: Stripe direto, domínio, lojas/equipe/opções, presentes/equipe/waitlist/pré-venda/avaliações, podcast privado/licenças/PDF/Discord/provas, ofertas/API/Zapier/e-mail/importação/A-B e recursos do plano69. Velocidade comparativa exige metodologia/evidência real.**
   - Pedido: P2 J2; datas/horas e grau de certeza em Proveniência.
   - Estado: **a fazer**.
   - Custo e margem: Não repetir números PageSpeed fornecidos como medição própria ou alegar superioridade sem prova.

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
   - Estado: **feito (PR #625, mesclado em 19/10, 20:15, horário de Fortaleza; confirmação de publicação em andamento)**.
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
