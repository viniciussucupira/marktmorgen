# Atribuição de renderização móvel

Item201. Investigação isolada a partir do head90613a7, sem interromper os jobs dePR730. Home teve duas amostras240ms (job119014702016) e o head030c1a3 teve272ms (job119014689986), enquanto seus LCP/CLS passaram. Nenhuma amostra descartada: critério estrito interação<200ms continua idêntico, três amostras frias/página,CPU4x,rede1.6Mbps/150ms e mesmas interações reais.

O teste registra adicionalmente Long Animation Frames quando a engine suporta: scripts, invocador, duração e tempo de estilo/layout forçado, além do alvo nativo e posição de rolagem de cada pointerdown real. Não há trace de conta, e-mail ou dados de cliente; somente páginas públicas locais e zeroPOST. Isso permite distinguir custo de script/primeira interação/layout sem atribuir previamente a causa aHeroFlow ou àFAQ nativa. A ausência deAPI de atribuição não transforma falha em aprovação.

Branch de diagnóstico não é publicação funcional e não substitui correção do produto. Nenhum workflow recorrente novo: usa o mobile render e a suíte completa existentes, incluindo custos de falhas/cancelamentos no custo fixo da empresa; fatura desconhecida não ézero. Nenhum custo variável/provedor/operação nova, preços/limites/gates fiscais ou comerciais alterados. Integração posterior com730 precisa preservar203–219 e executar novamente a suíte completa no head corrigido.

## Otimização concreta do bloco de planos

A atribuição de37a240d mostrou o controle real: summary da lista de recursos dePricing,scrollY22890; nãoFAQ. As9amostras desta execução passaram (home96/48/56ms), o que não apaga240/272ms anteriores. O primeiro frame de interação registrouDOMWindow.onclick8.2ms; isso não prova causa exclusiva.

O CTA de cada plano passa a desativar prefetch automático do destino de cadastro. Os três destinos dependem do plano e do intervalo escolhido; rolar até a lista de recursos não precisa buscar antecipadamente cadastro/RSC nem competir por trabalho de navegador/rede. Links reais continuam com mesmosendereços/plan/billing, texto e navegação ao clique. Toda a apresentação, preços/condições/limites, opt-in e gates ficam preservados. A pausa deHeroFlow fora da tela do730 também permanece. Nova suíte integral no head corrigido é obrigatória; nenhuma alteração de limiar, intervalo de interação, amostragem ou exclusão de outlier. Redução de solicitações especulativas não é certificação deINP nem prova antecipada de resolver todas as falhas.
