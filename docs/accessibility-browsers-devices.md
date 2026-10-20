# Navegadores e aparelhos — item201

Iniciado em20/10/2026 17:29 de Fortaleza. Estado: em andamento; nenhuma conformidade AAA global ou validação em aparelho real afirmada.

## Etapa1: motores adicionais na suíte existente

Playwright-core1.56.1 do lockfile instala Firefox/WebKit e dependências Linux no CI. E2E_BROWSER seleciona explicitamente o motor; instalação/lançamento falho reprova sem fallback para Chromium. O job Chromium original continua. A suíte existente inteira de studio/páginas públicas roda em cada motor, com serviços sintéticos. Não há conta, pagamento ou envio real.

A matriz completa exigida (home, preços, cadastro, criação de produto, publicação da loja, página da loja, checkout, comprador;320/390/768/1280/1920px;axe AAA, teclado, zoom400%/reflow, espaçamento1.4.12, movimento reduzido, alto contraste) ainda precisa ser acrescentada e verificada. Rodar esta etapa não encerra201. Axe não certifica critérios que exigem avaliação humana; resultados inconclusivos devem permanecer registrados.

## Custo de CI

Fonte oficial consultada20/10/2026: [GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions). Runners padrão em repositórios públicos são gratuitos. Este repositório é público e usa ubuntu-latest padrão. Matriz nova:2jobs, teto45min cada =90min adicionais/execução; Rexecuções consomem no máximo90Rmin. Consumo observado pendente da primeira execução. Sem upload de artefato/cache customizado/runner maior novo. Nenhuma franquia de fornecedor por cliente foi usada para reduzir um custo unitário: teste é custo fixo operacional, sem operação por cliente.

Elegibilidade atual: custo incremental cobrado de minutos padrão USD0/mês e USD0/ano; não é promessa de custo futuro. Se mudar para privado ou runner pago, recalcular antes de operar usando maior tarifa aplicável e impostos; não assumir franquia gratuita. Não há assinatura/conta nova autorizada. Preços, direitos e todos os gates intactos.

## Aparelhos reais: lacunas e opções para decisão do dono

Linux WebKit não é Safari instalado no iPhone/macOS. Viewports não validam toque/teclado virtual, VoiceOver/TalkBack/NVDA/JAWS, renderização do sistema, gestos, contraste do Windows, hardware/energia, orientação física ou fluxos com apps de pagamento. Precisam de iPhone/iPad, Android/tablet e Windows/Edge reais; não foram testados aqui. Automação de motor não substitui os participantes do item202.

Preços oficiais consultados20/10/2026, somente pesquisa, sem conta/contato/contratação:

- [Sauce Labs](https://saucelabs.com/pricing): Live Testing USD49/mês mensal (USD588/12meses), ou USD39/mês com cobrança anual (USD468/ano); Real Device Cloud USD249/mês mensal (USD2988/12meses), ou USD199/mês anual (USD2388/ano),1teste paralelo. Confirmar dispositivos/tecnologias assistivas incluídos antes de qualquer decisão.
- [BrowserStack](https://www.browserstack.com/pricing): Automate Desktop & Mobile USD175/mês faturado anualmente (USD2100/ano),1paralelo; Pro USD225/mês anual (USD2700/ano). Valores não equivalem a orçamento final de acessibilidade/participantes. Mensalidade sem fidelidade, impostos e recursos assistivos específicos não confirmados: desconhecidos, não zero.

Compra de aparelhos físicos não orçada; impostos Brasil/EUA, câmbio, remessa, pessoas executando testes, reserva e preços finais completos permanecem desconhecidos. Nenhum gasto aprovado nem margem certificada. Antes de contratar, calcular custo fixo integral mensal/anual e base mínima de clientes sob leitura mais onerosa. Mínimo60% líquido por cliente isolado a100% dos direitos e global permanece obrigatório; vendas fechadas.
