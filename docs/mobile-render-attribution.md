# Atribuição de renderização móvel

Item201. Investigação isolada a partir do head90613a7, sem interromper os jobs dePR730. Home teve duas amostras240ms (job119014702016) e o head030c1a3 teve272ms (job119014689986), enquanto seus LCP/CLS passaram. Nenhuma amostra descartada: critério estrito interação<200ms continua idêntico, três amostras frias/página,CPU4x,rede1.6Mbps/150ms e mesmas interações reais.

O teste registra adicionalmente Long Animation Frames quando a engine suporta: scripts, invocador, duração e tempo de estilo/layout forçado, além do alvo nativo e posição de rolagem de cada pointerdown real. Não há trace de conta, e-mail ou dados de cliente; somente páginas públicas locais e zeroPOST. Isso permite distinguir custo de script/primeira interação/layout sem atribuir previamente a causa aHeroFlow ou àFAQ nativa. A ausência deAPI de atribuição não transforma falha em aprovação.

Branch de diagnóstico não é publicação funcional e não substitui correção do produto. Nenhum workflow recorrente novo: usa o mobile render e a suíte completa existentes, incluindo custos de falhas/cancelamentos no custo fixo da empresa; fatura desconhecida não ézero. Nenhum custo variável/provedor/operação nova, preços/limites/gates fiscais ou comerciais alterados. Integração posterior com730 precisa preservar203–219 e executar novamente a suíte completa no head corrigido.

## Otimização concreta do bloco de planos

A atribuição de37a240d mostrou o controle real: summary da lista de recursos dePricing,scrollY22890; nãoFAQ. As9amostras desta execução passaram (home96/48/56ms), o que não apaga240/272ms anteriores. O primeiro frame de interação registrouDOMWindow.onclick8.2ms; isso não prova causa exclusiva.

O CTA de cada plano passa a desativar prefetch automático do destino de cadastro. Os três destinos dependem do plano e do intervalo escolhido; rolar até a lista de recursos não precisa buscar antecipadamente cadastro/RSC nem competir por trabalho de navegador/rede. Links reais continuam com mesmosendereços/plan/billing, texto e navegação ao clique. Toda a apresentação, preços/condições/limites, opt-in e gates ficam preservados. A pausa deHeroFlow fora da tela do730 também permanece. Nova suíte integral no head corrigido é obrigatória; nenhuma alteração de limiar, intervalo de interação, amostragem ou exclusão de outlier. Redução de solicitações especulativas não é certificação deINP nem prova antecipada de resolver todas as falhas.


### PV8(c): diagnóstico da falha móvel — 25/10/2026, 20h43 Fortaleza

Em andamento, sem incorporação/publicação: head ac0c8da7c27cd7ea57031e90e1668b207172fcd6, PR1036, Mobile render (candidate), job121324652469, falhou às20h32:07 Fortaleza. Primeira amostra fria de /:392ms de interação; demais oito passaram. Frame lento389,7ms sem script atribuído: causa ainda não determinada. Preservados limiar200ms, três amostras frias por página, CPU/rede e interações reais; sem exclusão de amostra nem espera adicional. Teste passa a registrar diferenças dos contadores nativos de tarefa/script/layout/estilo e heap por interação, fora do intervalo pointer-to-paint. Instrumentação não resolve nem aprova a falha; exige diagnóstico, correção e suíte integral no novo head, nunca só reexecução do job. Sem fornecedor, dependência, armazenamento persistente ou operação paga nova; poucos contadores no log existente, CI permanece custo fixo integral FX275 e fatura desconhecida não certifica margem. PLANS_ON_SALE=false, preços, limites e travas preservados. Nenhuma entrega funcional ou incremento de contador.


### PV8(c): reduzir a hidratação dos termos estáticos dos planos — 25/10/2026, 21h03 Fortaleza

Em andamento no PR1036. O diagnóstico do head7415a9cde89fb1448ca781ee1284e21619a6b74a (job121330464591) passou nas nove amostras móveis; na home,112/72/72ms. Isso NÃO apaga392ms no head anterior nem demonstra causa única. Os contadores cobrem também a preparação/rolagem do clique e não são tempos exclusivos do evento. A primeira interação da home ainda mostrou trabalho de script; layout/estilo não explicam por si o frame anterior sem script atribuído.

Correção concreta: os termos de cada plano, que não possuem eventos, passam a usar o mesmo mecanismo de HTML estático escapado já usado na lista nativa de recursos. React mantém o dl e não precisa hidratar cada div/dt/dd dessas linhas para abrir o disclosure. Mesmos textos derivados das constantes, preços, estrutura semântica, termos, links, intervalos e condições. Nenhum novo fornecedor, requisição, chave, TTL, contador produtivo ou uso cobrado: incremento de operações por plano mês/ano0/0; CPU/bytes totais reais não medidos e nenhum teto/custo assumido foi reduzido. CI existente e suas falhas continuam100% fixo Marktmorgen/FX275, fatura desconhecida não é zero nem certificação60%.

Testes adicionam escape de rótulos/valores hostis, pares dt/dd e preservação de cada termo nos três planos; mantêm todos os testes móveis e seus critérios originais. Verificação INTEGRAL obrigatória no novo head antes de incorporar. Acessibilidade: abrir/fechar detalhes1pressão→1pressão, escolher intervalo1decisão→1decisão; mesma descrição semântica e nomes acessíveis. Pessoas reais202 ainda não verificadas. Desempenho real e resolução da amostra392ms não certificados antecipadamente; publicação, domínio, fluxo e logs ainda pendentes. PLANS_ON_SALE=false e demais travas preservadas; contador254 inalterado.


### SR2/PV8 — primeira interação dos planos,27/10/2026

Falha preservada do head eee77780e3eba07566c416b87311a3f5ecd5b1a6/job122239993154 às14:15:46.2219649UTC: primeira interação fria /208ms, demais80/72ms; limite estrito<200ms permanece, nenhuma amostra descartada. Alvo summary nativo de recursos dos planos,scrollY22890; primeiro frame142.3ms/90.6ms bloqueio, sem script atribuído. Contadores incluem preparação/rolagem:224.8ms script,5.4ms layout,23.3ms estilo; não demonstram causa exclusiva.

Correção candidata concreta: os três destinos de cadastro dos planos usam âncora HTML normal, mantendo o hrefselecionado/CTA/classes e intervalo. Retira instâncias de navegação cliente NextLink de cada cartão; cadastro navega como documento. Estado de comparação mensal/anual e disclosure nativo permanece no contexto existente. Isso não prova que NextLink causou208ms, nem ganho de bytes/tempo ou resolução da falha. Guia instalado next/dist/docs/01-app/03-api-reference/02-components/link.md lido antes da alteração.

Nova suíte INTEGRAL no novohead obrigatória, incluindo navegação, preços/termos/URLs/teclado e todas as9amostras frias; nenhum ajuste de limiar, espera, aquecimento ou workflow. Não incorporar por reexecução isolada ou aprovação anterior30/31. Risco: destino faz navegação de documento; verificar fluxo. Sem fornecedor/serviço/chave/retencão/limite/preço/flag novo. Navegação continua leitura do destino existente, mas bytes/CPU/fatura total não medidos nem presumidoszero; CI/falhas100%FX275. Acessibilidade:1ação→1ação de cadastro,1decisão→1decisão de intervalo; sem testehumano/certificação. Dados sintéticos apenas, sem submissão/conta/pagamento/contato.

SR2código/prova permanece realnull, nove testes próprios passaram no headanterior, nova verificação necessária. Incorpora main ae725d5 com todos os relatórios/históricos MR1/MR2/MR3/SR3; sem editarbranches de terceiros. PR1097documental ae725d5fab5fe947aa12498bcb930958e51384a2 incorporado27/10/2026 11:41:51Fortaleza,8escopos10+7/fullfalse+11skips+Vercel; árvore19d28975ab48d549cca94b18d2d26e11947d42a8. Relatório automático real MR2 e custos completos continuam faltando. Contador254.
