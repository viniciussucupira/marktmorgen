# Auditoria da ordem da fila (docs/codex-queue.md) — proposta de correções

Base lida: origin/main `3c2164696648f2e54e97c1aece382e0a2aef0964` (30/10/2026, 13h29). Esse main já tem o 568 [GD2] logo depois do 567 [GD1]. Por isso, a partir da posição 7, o Grupo A tem uma posição a mais do que a tabela da MQ2.

Somente leitura: nada foi gravado, commitado ou enviado. Nenhum item muda de número, texto, estado ou escopo por esta proposta. Os pontos fixos foram respeitados: AV1, SD1, o Bloco de abertura (com 538 [AB1] e 448 [LE1]), os concluídos e os em andamento, e as posições que o dono escreveu (310 em primeiro; 556 depois de 513; 206 depois de 515; 241 depois de 531; 567 depois de 427; 568 depois de 567).

Como li: tirei o texto inteiro de cada item restante (106 + 1 do Grupo A, 226 do Grupo B e 59 da cauda). Procurei por script as referências de um item a outro ("depende", "reaproveite", "junto", "complemento") e as menções de estado espalhadas pelo arquivo. Depois li por inteiro todos os itens suspeitos.

Posições: "A#n", "B#n" e "FIM1#n" são as posições atuais na ordem vigente. "Logo depois de N" vale para a ordem que resulta depois de aplicar as mudanças anteriores desta lista.

---

## 1. Mudanças propostas

### 1.1 Mudanças de grupo (8 itens)

**247 [SP4] — Página de status e página de segurança**
- Hoje: Grupo B, B#2. Proposta: Grupo A, logo depois de 507 [SG3], ou seja, logo antes de 508 [SG4].
- Critério: (a) segurança. Também conserta uma dependência.
- Motivo: o 508 [SG4] (A#20) manda publicar o security.txt "com ... link para a página de segurança de 247 [SP4], coordenando com ele". Hoje o 508 fica no Grupo A e a página de que ele precisa fica no Grupo B.

**393 [CX4] — Preço próprio por país**
- Hoje: Grupo B, B#22. Proposta: Grupo A, logo depois de 22 [E5].
- Critério: (b).
- Motivo: a MQ2 justificou a posição com "depois do 31". Mas o 31 [E14] trata do preço dos planos do Marktmorgen, e o texto do CX4 diz "preço DE PRODUTO do criador, não plano Marktmorgen". Na verdade o CX4 é a mesma área do 22 [E5] ("preços em várias moedas definidos pelo criador"). Fazer os dois juntos evita trabalho em dobro.

**213 [SH10] — Página "Marktmorgen vs Shopify"** e **237 [SK5] — Página "Marktmorgen vs Skool"**
- Hoje: Grupo B, B#29 e B#36. Proposta: Grupo A, 213 logo depois de 238 [CF1] e 237 logo depois de 213.
- Critério: (b). Também resolve uma dependência e uma duplicação.
- Motivo: o 238 [CF1] (A#31) manda "Reúna num único modelo, reutilizado em todas as páginas, as comparações dos itens 213 [SH10] e 237 [SK5]". Ou seja, o CF1 já faz o trabalho dos dois. Se eles ficarem no Grupo B, o modelo será construído sem eles ou eles serão refeitos depois.

**533 [DP1] — Depoimentos reais de criadores no site do Marktmorgen**
- Hoje: Grupo A, A#75. Proposta: Grupo B, logo depois de 229 [HL10].
- Critério: (b), mas depende de clientes reais.
- Motivo: o próprio texto diz "Estado inicial: na fila, somente depois da abertura das vendas" e só vale para "o criador que já vendeu de verdade". A MQ1(f) põe no Grupo B "o que depende de clientes reais para valer". O 229 [HL10] (biblioteca de casos reais), que é a mesma ideia, já está no Grupo B.

**535 [MV1] — Imagem real de cada modelo antes de escolher**
- Hoje: Grupo A, A#100. Proposta: Grupo B, logo depois de 526 [FN2].
- Critério: (e). Também conserta uma dependência.
- Motivo: o MV1 diz "Reaproveite o mecanismo de miniatura real de 526 [FN2], sem um segundo gerador". O FN2 está em B#61. Do jeito que está, o MV1 seria feito antes do mecanismo de que precisa. Descer o MV1, que é (e) e já está entre os últimos do Grupo A, é mais simples do que subir o FN2, que é grande.

**406 [AM1] — Histórico de pagamentos confirmados pelos afiliados**
- Hoje: cauda, FIM1#32. Proposta: Grupo B, logo depois de 405 [HX1], ou seja, logo antes de 409 [AM4].
- Critério: dependência. Também tem um pouco de (a)/(c), porque protege o afiliado de não receber o que lhe é devido.
- Motivo: dois itens do Grupo B usam o AM1. O 409 [AM4] diz "Criador REGISTRA pagamento feito, reusando AM1 confirmações/recibos e histórico". O 413 [AM8] diz "MESMO programa/lote AM4, histórico AM1" e "Atrasos reais registrados em AM1".
- Atenção: isso desfaz, só neste item, a decisão FIM1 do dono (28/10, 23h43). Precisa do OK dele.

**482 [SB5] — Proposta de parceria para marcas a partir do kit de mídia**
- Hoje: Grupo B, B#225. Proposta: cauda, logo depois de 425 [BX1].
- Critério: dependência. Além disso, a MQ2 classificou errado.
- Motivo: o texto diz "um e-mail de proposta de parceria com os números conferidos do kit de mídia (425 [BX1])". O BX1 está na cauda (FIM1#15). A conferência LQ5(l), de 28/10, registra que "lib/outreach.ts e writePitch já existem; resta incluir os números do kit de mídia, junto com 425 [BX1]". Ou seja, o que falta no SB5 é justamente o BX1.
- Erro da MQ2: ela marcou o SB5 como (f) ao ler "proposta" como documento. Na verdade é um recurso (um rascunho de e-mail).

### 1.2 Mudanças dentro do Grupo A (9 itens)

**414 [KX1] — Avisos de renovação e de preço, cancelamento e prova de consentimento**
- Hoje: A#10. Proposta: logo depois de 310 [AX2], que passa a ser a nova A#2.
- Critério: (a) obrigação legal que vale para todo assinante desde a primeira venda.
- Motivo: o estado do item diz "PRÉ-REQUISITO ANTES DA ABERTURA. Avaliação autorizada pelo dono: ANTECIPAR A CONCLUSÃO/VERIFICAÇÃO DESTE ESCOPO para ANTES de QUALQUER abertura de vendas". As regras de renovação automática atingem os planos do próprio Marktmorgen, que são assinaturas. Por isso esse item vem antes de backup e de acessibilidade, que também são (a), mas não dependem de cada cobrança.
- Ver também o erro de estado E6, mais abaixo.

**461 [EL5] — Segmento de contatos ativos**
- Hoje: A#16. Proposta: logo depois de 439 [FC2], no fim do trecho (d).
- Critério: (d).
- Motivo: a própria MQ2 classificou como (d) ("reduz e-mails desperdiçados"), mas deixou o item entre os de critério (a), só para manter a família EL junta. Manter a família junta não é um critério da MQ2.

**460 [EL4] — Conta antes de enviar**
- Hoje: A#15. Proposta: logo depois de 461 [EL5].
- Critério: (e). Também conserta uma dependência.
- Motivo: o 457 [EL1] diz "EL4 depende de EL5", e o texto do EL4 oferece "enviar só para os contatos ativos (EL5)". Hoje o EL4 vem antes do EL5.

**459 [EL3] — Frase simples junto do número de e-mails**
- Hoje: A#14. Proposta: logo depois de 243 [CF6].
- Critério: (e)/(b), valor percebido na página de preços.
- Motivo: a MQ2 marcou como (e), mas o deixou acima de itens (a) de segurança (SG1, SG3, SG4, TB4). O item mexe "na página de preços", a mesma página do 243 [CF6]. Fazer os dois juntos economiza trabalho.

**462 [EL6] — Duas conferências, sem mudar nada**
- Hoje: A#17. Proposta: logo depois de 546 [EB1], ou seja, logo antes de 39 [G1], no começo do trecho (f).
- Critério: (f).
- Motivo: a própria MQ2 marcou como (f), mas o deixou na 17ª posição, acima de auditoria de segurança e de obrigações fiscais. O texto é "Confirme, só por leitura ..." e "Estude ... o recurso SES Tenants ... Somente estudo".

**417 [CC1] — Lixeira por 30 dias com restauração**
- Hoje: A#11. Proposta: logo depois de 491 [PP2], no começo do trecho (c).
- Critério: (c). Confiança média.
- Motivo: é um recurso novo, não uma obrigação. O próprio texto separa: "Exclusão de dados pessoais ... continua IMEDIATA, sem lixeira". O ganho é evitar perda acidental e cancelamento. Não é direito legal nem correção de algo quebrado.

**374 [SU7] — Ninguém recebe e-mails demais (limite de frequência)**
- Hoje: A#22. Proposta: logo depois de 362 [AP2].
- Critério: (c). Confiança média.
- Motivo: o texto diz "Não sobrepõe consentimento/opt-out nem afeta legais". É uma proteção além do mínimo legal, como a do 362 [AP2], que a MQ2 marcou (c) ("protege a reputação de envio"). O 568 [GD2](e) cita os dois juntos.

**281 [SF1] — Orçamento de desempenho das lojas no celular** e **497 [ME2] — complemento do 281**
- Hoje: A#40 e A#41. Proposta: 281 logo depois de 248 [ST1], e 497 logo depois de 281.
- Critério: (b). O próprio item define a posição.
- Motivo: o estado do 281 diz "Posição: logo depois de 248 [ST1]". O registro do PR #809 confirma: "SF1 executa logo após 248 [ST1]". E o texto diz: "Este item complementa o 248 [ST1] ... não repita o que o 248 já fizer". Hoje há quatro itens entre os dois.

### 1.3 Mudanças dentro do Grupo B (5 itens)

**500 [OX2] — Um lembrete educado, no máximo**
- Hoje: B#7, marcado (a). Proposta: logo depois de 499 [OX1] (B#156).
- Critério: (b)/(e). A MQ2 classificou errado.
- Motivo: não é obrigação legal. É um recurso novo da área Outreach: "mostre no estúdio um único rascunho de lembrete curto". O limite de "no máximo um" é uma regra do próprio recurso. O item faz parte da família OX (499, 500, 501), cujos outros itens estão em B#156 e B#205.

**422 [PT2] — Acompanhamento dos benefícios prometidos e entregues à mão**
- Hoje: B#8, marcado (a). Proposta: logo depois de 421 [PT1].
- Critério: (c). A MQ2 classificou errado.
- Motivo: é uma ferramenta nova do estúdio ("Criador configura, EM CADA NÍVEL, benefícios MANUAIS ..."), sem cobrança nem obrigação nova do Marktmorgen. Ajuda o criador a cumprir o que prometeu e a não perder membros. Pela família e pelo critério, fica ao lado do 421 [PT1].

**15 [D12] — Painel privado do dono com ativação diária e tempo até a primeira venda**
- Hoje: B#211, marcado (f). Proposta: logo depois de 447 [GE3].
- Critério: duplicação e dependência. A MQ2 classificou errado.
- Motivo: não é um estudo, é um painel a construir. É o mesmo painel do 445 a 447 [GE1–GE3]: a conferência LQ14(b) registrou "15 [D12] absorvido por 445, 446 e 447 ... inclusive ativação diária e tempo até primeira venda". Essa decisão foi desfeita pela LQ17, mas a sobreposição continua.

**489 [IT6] — Taxa real de primeira venda, publicada com dados reais**
- Hoje: B#85. Proposta: logo depois de 15 [D12], já na posição nova.
- Critério: dependência.
- Motivo: o texto diz "calculado pelo próprio código a partir de 15 [D12]" e "Quando houver pelo menos 50 lojas pagas". Hoje o IT6 vem 126 posições antes do item de que depende.

**24 [E7] — Expiração de acesso a curso e pontos por concluir aulas**
- Hoje: B#162. Proposta: logo depois de 502 [RX1], ou seja, logo antes de 112 [E2-POINTS].
- Critério: junção já ordenada pelo dono.
- Motivo: o 112 [E2-POINTS] (B#106) diz "Escopo e prova: Juntar a E7". A conferência LQ6 também concluiu "112 em 24". São um trabalho só, mas hoje estão separados por 56 posições.

### 1.4 Resumo

22 itens mudam de lugar. Desses, 8 mudam de grupo: 247, 393, 213 e 237 sobem de B para A; 533 e 535 descem de A para B; 406 sai da cauda para B; e 482 sai de B para a cauda.

---

## 2. Erros de estado (não corrigidos, só relatados)

- **E1. 496 [ME1] e 498 [ME3]:** a linha canônica diz "Estado inicial: na fila", mas parte de cada um já foi publicada. Os registros dizem "Parte de 496 [ME1]: PR1153 incorporado em 28/10/2026 09:36:34" e "Parte de 498 [ME3]: PR1154 incorporado em 28/10/2026 09:38:01", com publicação conferida. O estado deveria ser "em andamento, parcialmente publicado". Pela própria MQ2, um item em andamento não muda de lugar.
- **E2. 273 [BK1]:** a linha canônica diz "na fila". O histórico mostra o codec incorporado no PR785, o roundtrip sintético pendente no PR786 e "BK273: aguardando o dono após mais de 1 hora de bloqueio". Ou seja, está iniciado e esperando o dono. O estado não diz isso.
- **E3. 440 [FC3] — Estado de abertura da LLC (comparar Delaware, Wyoming e New Mexico):** o texto diz "Decisão do estado fica em Depende do dono". Mas o SD1 (28/10, 18h41) registra que o dono já decidiu: "escolheu abertura pela LLC de Delaware". O item está superado pela decisão. Pela regra MQ2 ele não deve ser descartado, mas o estado deveria dizer isso.
- **E4. 278 [H3-3] — Um link por vídeo curto, com as vendas de cada vídeo:** a conferência LQ5(h), de 28/10, diz "lib/short-links.ts já faz um link por vídeo com visitas, vendas e receita", que é exatamente o título. A LQ17 desfez a decisão de fechar o item, mas não desmentiu esse fato do código. O item continua "na fila" em B#42 e provavelmente já está feito.
- **E5. Itens que a conferência LQ5 achou parcialmente prontos no código** e que continuam "a fazer" sem dizer "somente a diferença":
  - 30 [E13]: exit-offer já existe, e o checkout é hospedado pelo Stripe;
  - 95 [D2-DEMAND-RADAR]: customer-voice já existe;
  - 115 [E2-FOUNDING-MEMBERS]: falta só o rótulo de fundador;
  - 211 [SH8]: falta só conferir as carteiras;
  - 226 [HL7]: as coortes já existem;
  - 291 [SQ2]: a busca de aulas já existe;
  - 409 [AM4]: affiliate-payday já existe; falta o lembrete;
  - 416 [KX3]: startsAt e dripDays já existem;
  - 482 [SB5]: falta só incluir os números do kit de mídia.
- **E6. 414 [KX1]:** o estado diz "PRÉ-REQUISITO ANTES DA ABERTURA", mas o item está no Grupo A, que só começa depois da abertura. A AV1 (28/10), que é mais recente, manda no passo 3 construir antes da abertura "somente o que não puder começar desligado (por exemplo, renovação das assinaturas)". Há conflito de posição. O mínimo legal do KX1 (consentimento da recorrência, aviso antes da renovação, cancelamento em um clique) precisa ser conferido dentro do passo 3 ou do passo 12 da AV1. Se não for, falta algo para abrir. Isso fica para o dono decidir; a proposta 1.2 só sobe o item dentro do Grupo A.
- **E7. 23 [E6] — Perguntas de telefone e checkbox no checkout:** o texto do 389 [TB15] diz que a pergunta de telefone no checkout já existe ("existente segundo Claude 11/10/2026"). Então a parte de telefone do E6 provavelmente está feita, e a parte de checkbox repete o 387 [TB13]. O estado continua "a fazer".

---

## 3. Possíveis duplicações

Duplicações que o dono já mandou juntar (só confirmo): 108↔364, 118↔267, 109↔36, 112↔24, 28↔100 e 32↔375.

Duplicações novas ou não marcadas no texto dos itens:
1. **21 [E4] ↔ 403 [SN1]:** os dois são um complemento pago de IA que gera ideias, legendas e um plano de posts para redes sociais a partir dos fatos da loja.
2. **18 [E1] ↔ 198 [HT13]:** tutor por IA nas aulas. O 198 já foi avaliado e reprovado por custo; a conferência LQ6 tinha juntado os dois.
3. **40 [G2] ↔ 228 [HL9]:** agendamento de posts no Meta e no TikTok ou em todas as redes. A linha 6973 já pedia para conferir os dois juntos.
4. **42 [G4] ↔ 401 [WX2]:** criação de anúncios dentro do produto e estudo de anúncios do Meta no painel.
5. **244 [SP1] ↔ 512 [CK4]:** central de ferramentas grátis sem cadastro. Os mesmos exemplos aparecem nos dois: QR code, redimensionar imagem e "quanto sobra de uma venda".
6. **20 [E3] ↔ 227 [HL8]:** automação montada por IA a partir de um objetivo, com aprovação do criador.
7. **27 [E10] ↔ 258 [KJ3]:** ações de escrita no MCP criando rascunhos. A linha 6973 já apontava.
8. **34 [F3] ↔ 385 [TB11]:** portal ou área individual do cliente de mentoria.
9. **15 [D12] ↔ 445–447 [GE1–GE3]:** painel do dono (ver a mudança 1.3).
10. **51 [I2] ↔ 309 [EM1]:** a cota de e-mails do Store já é tratada no complemento do passo 6 do 309, que está no Bloco (k). A LQ6 já tinha juntado os dois.
11. **22 [E5] ↔ 393 [CX4]**, em parte também ↔ 208 [SH5]: preço do produto do criador por moeda e por país.
12. **28 [E11]/100 ↔ 428 [BV1]:** posts e edições só para quem paga. O BV1 acrescenta a prévia, mas é a mesma restrição de acesso.
13. **110 [E2-MEMBER-PROFILES] ↔ 398 [SL2]:** os dois pedem "mapa de membros" com cidade aproximada e opt-in.
14. **117 [F2-COMMUNITY-MAIL] ↔ 264 [CI2]:** resumo periódico da comunidade por e-mail, só para quem optou.
15. **122 [F2-COMMUNITY-AI] ↔ 263 [CI1]**, e em parte ↔ 113: moderação da comunidade com IA. A linha 6973 já apontava.
16. **25 [E8] ↔ 405 [HX1]**, e em parte ↔ 11 [D8]: relatórios agendados por e-mail.
17. **299 [H5-2] ↔ 560 [AS1]:** oferta do próximo produto dentro do curso ou ao concluir. A proveniência do 560 diz "nenhum item pede oferta do próximo produto dentro da área do curso", mas o 299 já pede o mesmo "ao final de no máximo uma aula escolhida".
18. **509 [CK1] ↔ 241 [CF4]:** os dois gravam vídeos reais do produto por automação. O CK1 não cita o CF4; deveria reaproveitar os vídeos dele.
19. **525 [FN1] ↔ 392 [CX3]:** receita por funil e por etapa.
20. **508 [SG4], parte 3 ↔ 568 [GD2], parte (k):** os dois pedem um plano escrito de resposta a incidentes. A proveniência do 568 diz que "nenhum item pede ... plano de resposta a incidentes", mas o 508 manda "Escreva docs/incident-response.md". Como o 568 vem antes, o 508 deve só reaproveitar o plano.
21. **17 [D15] ↔ 310 [AX2], partes 4 e 5:** testes com NVDA, VoiceOver e TalkBack reais.
22. **389 [TB15] ⊂ 427 [VR1]:** corrigir explicações públicas falsas é uma parte da varredura "faz de conta" do VR1.
23. **23 [E6], parte checkbox ↔ 387 [TB13]:** pergunta do tipo checkbox no checkout.
24. **120 [F2-IMPORTS], parte Teachable ↔ 260 [KJ5]:** importador de cursos. A linha 6973 já pedia para conferir com o 210.
25. **44 [H1] ↔ 449–456 [AP1–AP7, AN1]:** o pedido do app reabriu o app de iPhone "sobrepondo ... a referência 44 [H1]". O estudo H1 ficou depois da construção.
26. **218 [OP4] ⊂ 225 [HL6]:** o HL6 manda "Amplie a calculadora do item 218 ... para uma única ferramenta".
27. **436 [AC1] ↔ 332 [RD1]:** custos do débito em conta ACH. O 332 está no Bloco (k); o AC1 é um complemento e deve fazer só a diferença.
28. **567 [GD1], parte (h) "Trust and safety" ↔ 247 [SP4] "página de segurança":** duas páginas públicas sobre práticas de segurança e confiança.

---

## 4. O que não consegui julgar

- **13 [D10] e 12 [D9] (Path):** se o código atual já conta um lead do Path antes da confirmação, ou conta vendas PayPal sem confirmação do servidor, é algo quebrado (a) e deveria subir para o Grupo A. Só o código responde isso.
- **97 [D2-OPEN-EXIT]:** se a exportação atual não devolve os dados ao criador ao sair (dever do operador de dados no RGPD, art. 28(3)(g)), a parte de exportação é (a) e deveria ir para o Grupo A. A AV3 afirma que "exportação" já existe, mas não diz o quê.
- **462 [EL6], parte 1:** se mail.marktmorgen.com não estiver "verified" no Resend, os e-mails da plataforma podem estar falhando. Nesse caso é (a). A conferência é só leitura e rápida.
- **338 [HZ3]:** se a Hazelsong está gastando dinheiro hoje, antes de qualquer receita, o item merece subir dentro do (d). Isso depende da fatura real.
- **216 [OP2] e 210 [SH7]:** pela MQ1(f) ("vendas dos planos do próprio Marktmorgen" e "traz criadores de outras plataformas"), os dois seriam do Grupo A. Mas o 52 [I3] fala em indicação "já pronta/pausada", e não sei quanto do OP2 já existe. Os importadores 120 e 260 estão no Grupo A e o 210 no Grupo B, sem motivo claro.
- **443 [TS1] e 444 [TS2]:** o texto do TS2 diz "depois de TODO o Bloco de abertura ... antes de avançar aos pendentes antigos". Não consegui confirmar se o dono escreveu essa posição ou se foi uma interpretação do Codex.
- **437 [AC2]:** o próprio item avisa que a lei citada (SB122) não foi confirmada. Se existir, é uma obrigação com data (01/01/2027) e pode precisar subir.
- **561 [NE1]:** o dono pôs no Grupo B de forma expressa. Pode ter peso legal (regras da FTC sobre promessa de renda), mas não mexi.
- **Dependências fracas, só de reaproveitamento.** Não propus mover, mas o primeiro a ser feito deve construir o mecanismo comum:
  - 503 [AG1] (B#56) → 372 [SU5] (B#149) → 258 [KJ3] (B#175);
  - 487 [IT4] (A#90) → 481 [SB4] (B#224) → 38 [F7] (cauda);
  - 356 [ES2], parte do Store (A#95) → 343 [RN1] (B#45);
  - 361 [AP1] → 268 [KT2];
  - 355 [ES1] → 352 [DN4] (cauda);
  - 271 [SEO1] e 242 [CF5] → 230 [HL11];
  - 567 [GD1](c) → 492 [DE1]. Essa já está anotada no próprio item, e a posição é fixa.
- **17 [D15], 13 [D10] e 231 [EQ1]:** ficaram fora da tabela da MQ2, nas posições A#2, B#4 e B#74, sem motivo escrito.
