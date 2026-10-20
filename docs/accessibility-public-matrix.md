# Item201 — matriz pública independente
Início20/10/2026 18:07 Fortaleza. Incremento do mesmo item201, em branch separada enquanto PR730 roda, sem editar seus arquivos.

Executa home, preços e entrada do cadastro nos três motores, nas larguras320/390/768/1280/1920. Cada combinação recebe axe A/AA/AAA (presença da regra color-contrast-enhanced obrigatória), checagem de overflow, baseline com Tab real, espaçamento WCAG1.4.12, movimento reduzido e pedido de forced-colors. Reflow320 é evidência de largura equivalente1280/4, não zoom real do menu do navegador; este permanece lacuna explícita. Emulação sem mídia forced-colors efetiva é lacuna, nunca aprovação de alto contraste. Inconclusivos do axe são registrados para revisão manual, nunca tratados como conformidade. Nenhuma regra/violação encontrada é excluída.

São75casos por motor (3rotas×5larguras×5modos); três motores=225 no total. Nenhum cadastro é enviado, conta criada ou compra realizada: POST e origem externa são bloqueados, zero writes exigido. Não cobre ainda os fluxos autenticados/criação/publicação/checkout/comprador do escopo integral. Não encerra201 nem autoriza202/B2 antecipados.

Custo fixo operacional:3jobs padrão Linux×30min=teto90min por execução. Para Rexecuções/mês: teto90Rmin/mês e1080Rmin/ano à mesma frequência. Repositório público e runner padrão elegível a minutos gratuitos; incremento atual USD0/mês e USD0/ano, conforme [fonte oficial GitHub consultada20/10/2026](https://docs.github.com/en/billing/concepts/product-billing/github-actions). Não usa franquia de fornecedor para reduzir custo variável por cliente. Sem artefatos/runner maior/serviço pago novo. Custo por cliente zero pois nenhum direito/operação de cliente é alterado. Consumo real pendente do CI; qualquer mudança de elegibilidade/custo exige recálculo fixo integral, reserva e base mínima antes de operar.

Piso líquido mínimo60% por cliente no pior mês a100% dos direitos e no consolidado após todos os custos/impostosBrasil/EUA permanece. Desconhecido reprova. Não muda preços, limites, comissão, PLANS_ON_SALE, tax gate, art.9a, revisão comercial ou SW/app de produção. Plano de testes com pessoas permanece item202, posterior ao201.


## Primeira execução e correções
20/10/2026 18:18 Fortaleza, headaf4a89a34adbefae59e3eb82187fef521cdb0609: Firefox118887720647 executou75casos sem violação automática, com56registros de lacunas/inconclusivos; não é certificação. Chromium118887721086 e WebKit118887721276 reprovaram25casos com color-contrast-enhanced na home (nome do produto no exemplo, badge de indisponibilidade, badge de economia anual), mais overflow de texto espaçado no cadastro320px (324/328px de scroll). Nenhuma falha foi excluída.

Os três textos pequenos usam agora a cor escura já existente do produto, mantendo fundos, palavras, preços, economia e estados. O main do cadastro permite quebra de palavras longas e shrink, sem ocultar/cortar conteúdo. Overflow restante emitirá bounds/elementos para correção. Mesmas larguras, modos, teclado e AAA; suíte completa e225casos obrigatórios no novohead. Demais lacunas/autenticados/zoom real/aparelhos continuam abertas.
