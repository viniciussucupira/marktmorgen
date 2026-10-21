# Product action accessibility matrix — item201

20/10/2026, Fortaleza. Teste sintético da criação real de produto no serviço local descartável, reload, mudança manual de visibilidade e leitura da loja local. Usa activationFixture existente e seus limites atuais: nenhum gate, conta externa, preço/limite de plano ou configuração de produção é alterado. Só POST local /api/store/product com action add/visibility é permitido; demais escritas e origens externas são bloqueadas. Produto sintético gratuito sem arquivo, sem pedido de email, pagamento, mensagem ou chamada de IA. O conteúdo e os identificadores dos criadores reais não são acessados.

25casos por motor,75no total:320/390/768/1280/1920 e baseline/espaçamento1.4.12/movimento reduzido/alto contraste/reflow320. Axe AAA no formulário, eventos reais de teclado, persistência após reload e título presente na loja após publicação manual. Não prova checkout, área do comprador, entrega/download, zoom real400%, aparelhos ou pessoas com deficiência. Incompletos continuam abertos; não é conclusão do201 nem início do202/B2.

Custo fixo máximo adicional3×40=120minutos por execução; R execuções/mês=120Rmin/mês e1440R/ano além dos fluxos existentes. Runner Linux padrão público com elegibilidade atual sem cobrança incremental de minutos, sem novo serviço/contratação/conta. Fonte oficial consultada20/10/2026: https://docs.github.com/en/billing/concepts/product-billing/github-actions . Minutos efetivos, falhas e cancelamentos entram na consolidação. Nenhum custo variável de cliente ou novo direito; desconhecido não é zero e o piso60% após todos os impostos continua obrigatório.

Primeira execução Firefox, head59f0c2d, job118927517023:25casos,27marcas de falha (mais de uma por caso possível), zero provas completas. Identificou botão Remove do produto com21px de altura e vizinhos próximos: alvo passa a min44px. Falhas de visibility agora exigem resposta real doPOST/snapshot e término do refreshRSC antes de procurar o próximo estado. Tentativa de escrita bloqueada não identificada ganha diagnóstico somente de método/caminho, sem cookies/dados; continua abortada e reprova até revisão. Nenhum caso ou gate dispensado; nova execução completa obrigatória.


## Diagnóstico completo do head0dca (20/10/2026)

Firefox e WebKit falharam; nenhuma prova completa é declarada. O POST bloqueado foi identificado como `/api/store/hit`: código da rota revisado confirma beacon de visita/estatísticas, que pode gravar contagem. O teste agora intercepta somente a visita `h=activationonboarding,k=v` e responde204 sem executar a rota; exige exatamente uma interceptação por caso concluído. Não permite nova escrita nem chamada externa. Outras operações continuam falhando. A falta de atualização visível após o POST de visibilidade e o overflow WebKit continuam abertos, com diagnóstico dos botões renderizados e caixas com overflow interno. Alvos de remoção44px dependem de nova verificação completa, sem relaxar axe ou a largura.


## 20/10/2026 — diagnóstico WebKit no headc8ec

25casos/25falhas WebKit e25/4marcas Firefox preservados. Diagnóstico: painel fechado do seletor de lojas com largura20–37px e conteúdo interno excedente; passa a ficar explicitamente oculto enquanto details está fechado e ganha largura móvel calc(100vw - 2rem), preservando abertura nativa/teclado. Grade principal Studio declara grid-cols-1/minmax(0,1fr) abaixo de lg; nenhuma ocultação de overflow da página ou relaxamento do teste. Diagnóstico de visibilidade passa a registrar trecho sintético RSC; beacon WebKit inesperado continua bloqueado com h/k e tamanho do corpo. CI completo novo obrigatório; sem publicação ou conclusão201.


## Identidade da linha no teste — 20/10/2026

Diagnóstico Firefox mostrou resposta de visibilidade do produto anterior enquanto o caso buscava o recém-criado. O filtro por texto em qualquer descendente da linha também alcançava nomes em seletores de produtos relacionados. O teste passa a vincular a linha ao ID realmente retornado pela criação e ao botão com aria-controls product-panel-ID, exige exatamente uma linha e confere o mesmo ID no pedido e na resposta de visibilidade. Não altera identificadores persistidos nem força a interface a aparentar publicação. Todas as provas de reload, ativação manual, visibilidade, overflow e axe permanecem; CI completo no novo head. Não atribuir as falhas anteriores a bug confirmado de produção.


## Largura do campo e beacon WebKit — 20/10/2026

Head a489: painel fechado deixou de contribuir ao overflow, mas input readonly de compartilhar URL tinha client80–88/scroll393–480 com overflow visible e propagava largura ao Studio. Limita-se o overflow ao próprio campo readonly, preservando valor integral, seleção/cópia e foco; a grade do painel declara coluna zero-min. Cabeçalho estreito reduz espaçamento e oculta chevron decorativo abaixo de sm, mantendo rótulo acessível, alvo e seletor nativo. Teste não esconde overflow da página.

WebKit expôs bodyBytes0 no beacon Blob, enquanto Firefox expôs h/k. O mock agora aceita esse caso apenas no WebKit, POST local store-hit vindo do frame da loja sintética exata, responde204 sem executar rota e registra lacuna explícita de validação do payload. Quando corpo existe, h/k continuam exigidos. Exatamente uma interceptação por caso concluído; nenhuma escrita de estatísticas, chamada externa ou promessa de cobertura desse payload. CI completo novo obrigatório.


## Paginação e URL legível — 20/10/2026

Head030d: Firefox25casos/3marcas, WebKit25/10, sem aprovação. A criação25 passou do limite existente de24produtos por página da loja (lib/catalog.ts STORE_PAGE_SIZE=24). O teste segue o link real rel=next quando o título não estiver na primeira página e exige o título e a contagem exata de beacons por navegação; preserva24/50 e todos os demais limites.

O input readonly da URL ainda propagou largura no WebKit mesmo com overflow hidden. Usa-se textarea readonly de duas linhas, texto com quebra, redimensionamento vertical e seleção/cópia integral preservados; nenhuma alteração em URLs/IDs. Violação target-size parcialmente obstruída em dois Remove com espaçamento continua aberta: diagnóstico acrescenta retângulo e elementos que recebem hit-test, sem filtrar regras nem reduzir requisitos. CI integral no novo head.


## Contexto da auditoria e transição de página — 20/10/2026

Head1f69 manteve duas marcas target-size Firefox. Hit-test identificou nav Look sobre Remove de outra linha em y76–120 após preencher o formulário no fim da lista; não era o botão sendo acionado. Auditoria documental passa a começar em scroll0 consistente, mantendo axe integral e todas as regras; a interação seguinte ainda usa formulário/teclado reais. O resultado anterior e a necessidade de revisão manual de sobreposição em posições intermediárias permanecem explícitos; não é prova de conformidade global.

A verificação da página2 passa a aguardar URL page=2 e o título anexado após a transição RSC, em vez de ler count imediatamente após networkidle. Se ausente, continua falhando e registra URL/pager/ID sintético. Limite24 preservado e contagem de beacons exata por página. CI completo obrigatório.


## Conteúdo recolhido e visita por documento — 20/10/2026

Head7169 Firefox25casos/1falha: título do produto25 apareceu após esperar página2; contagem2 era expectativa incorreta. StoreBeacon tem efeito por handle/front/product, sem dependência da query page, portanto navegação cliente não cria novo beacon de documento. Mantém-se exatamente1interceptação, sem alterar rastreamento ou cotas.

WebKit25casos/9falhas: retirados os inputs da evidência, a largura ainda veio de conteúdo do SharePanel dentro de details fechado (retângulos visuais zero, descendentes com scroll interno). O main do Studio explicita display none só para filhos não-summary de details sem open, reproduzindo a semântica nativa; quando open, conteúdo reaparece normalmente. Não aplica clipping à página nem suprime texto aberto. Diagnóstico de overflow prioriza caixas visíveis com largura maior que1, excluindo caixas já contidas e sr-only; assertion raiz continua integral. CI completo novo, revisão manual de rolagem permanece aberta.


## Grade de promoção e origem estável — 20/10/2026

Head7bec preservado: Firefox25/2marcas target-size; WebKit continuou overflow. Diagnóstico mais profundo mostrou PromotionPlanner com coluna implícita, label Product client206/scroll386 e nome de produto longo no select. O painel declara grid-cols-1/minmax0, labels/controles min-width0 e limites nativos, sem mudar escolha, URL, limites50, métricas, fórmulas ou custos. Texto comum do Studio pode quebrar palavras longas em colunas estreitas. Os controles Edit/mover/remover passam a mínimo48px; antes To the top media21px.

scrollTo(0,0) seguia CSS smooth e não concluía antes de axe; há evidência de retângulos parcialmente sob cabeçalho após o pedido. Preparação passa a desfocar o campo, rolar instantaneamente e esperar dois frames, exigindo scrollX/Y0 antes da auditoria integral; posição após axe é registrada. Nenhuma regra/falha removida; lacuna de sobreposição intermediária permanece. Alterações anteriores de SharePanel/details não resolveram sozinhas a largura e não são declaradas causa exclusiva. CI integral novo obrigatório.


## Renderização nativa e espera limitada — 20/10/2026 Fortaleza

Head6c: Firefox25/5falhas na preparação nova de origem0, antes de axe; dois frames não bastaram para scroll/foco. Mantém-se origem0 e aguarda-se condição real estável200ms dentro do timeout existente, sem aumentar tolerância nem remover falha se origem mudar.

WebKit continuou a propagar a largura de opções dos selects do PromotionPlanner com aparência nativa, mesmo com grade e limites. Os três selects permanecem HTML nativo com aparência controlada e chevron decorativo em SVG, sem trocar opções, valores, handlers ou teclado; aplica-se o mesmo princípio de renderização já usado nos campos compartilhados. Sem clipping da seção/página. As hipóteses anteriores permanecem no histórico; novo head requer CI integral.


## Próximos selects revelados pelo produto publicado — 20/10/2026 Fortaleza

Head d310: Firefox25 casos sem falhas; WebKit25/9 falhas de largura, todas na raiz estreita ou text-spacing. PromotionPlanner deixou de aparecer como ancestral expansivo; os controles Product de BuyButtonEditor e What it opens de CheckoutScriptEditor propagaram opções longas (label client238/scroll372 com espaçamento; raiz413/client320). Ambos passam a grade explícita com mínimos0 e select HTML nativo com aparência controlada/chevron decorativo, preservando opções, teclado, estado, limites, código e permissões. Não se oculta overflow da seção/página. Inputs com texto rolável continuam disponíveis. A medição de origem estável passou no Firefox; não certifica rolagem intermediária. CI integral no novo head é obrigatório; resultados anteriores e lacunas permanecem. Nenhum serviço novo ou custo operacional por cliente; teto CI120min/execução já registrado, custo real final ainda exige duração de todos os jobs.
