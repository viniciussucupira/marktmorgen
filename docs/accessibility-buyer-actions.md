# Checkout e área do comprador — matriz sintética

Item201,21/10/2026. Branch isolada após734; reutiliza seed.ts, serviços em memória e endpoints reais já usados no teste de compra existente. Nenhum produto ou dado de criador real é alterado. Apenas três arquivos novos, sem edição concorrente do produto.

Cada engine real Chromium/Firefox/WebKit percorre25combinações (320/390/768/1280/1920;baseline/espaçamentoWCAG1.4.12/movimento reduzido/cores forçadas/reflow320). Em cada uma: produto/formulário de compra, envio por teclado com extras desmarcados, retorno pago simulado, formulário da biblioteca, biblioteca autenticada por link e pedidos do comprador. São5estados auditados por caso,125auditorias/engine375total quando todas as etapas concluem. Axeintegral+contrasteAAA,overflowestrito e foco de teclado; falhas/incompletes preservados, sem certificaçãoAAAglobal.

Compra é explicitamente simulada: oStripe local existente retorna uma sessão paga sem cartão. Exige exatamente uma sessão,produto escolhido e1900centavos,sem ofertas adicionais pré-selecionadas. Não cobre UI hospedada doStripe, pagamento/carteira real nem entrega externa. ApenasPOSTcheckout local ePOSTbiblioteca local permitidos;hits locais respondidos204sem gravar estatísticas; navegador bloqueia origens externas. Redis/Stripe/Resend/AI/ads são locais. Nenhuma mensagem ou submissão externa. Uma solicitação real ao endpoint local de biblioteca por engine é comprovada pela caixa em memória; seu token é reutilizado nos demais casos de viewport para não contornar limites antispam existentes. Não se afirma25solicitações de link porengine. Tokens nunca são logados.

Reflow320 não é zoomreal400%. Aparelhos físicos, AT/participantes, teclado virtual, contraste do sistema e avaliação manual intermediária de scroll continuam abertos. O cadastro e a criação/publicação de produto têm matrizes separadas; esta não encerra201sozinha.

Custo fixo adicional CI:3jobs×30min=90job-min/execução;Rexecuções/mês teto90Rmensal/1080Ranual. Sem serviço/assinatura/conta/provedor novo, sem custo variável porcliente. Minutos reais, falhas/cancelamentos e elegibilidade/fatura devem ser reconciliados; desconhecido nãozero. Preservados preços/limites,PLANS_ON_SALE=false,comissão,permissões/opt-in,taxgate/art9a/revisãocomercial e mínimo60%isolado100%direitos/pior-mês+consolidado após todosos custos/impostosBrasil/EUA. Nenhum gasto ou ativação autorizado.

Estado: implementação para verificação integral remota; nenhum resultado ou entrega funcional antecipado. Fila203–219 preservada e não iniciada.

## Primeira falha e correção de landmark

Head7b0e048:os3jobs119025543726/119025543892/119025544083 reprovam25casos cada no formulário da biblioteca. Checkout e recibo passaram; a regraregion detectou.bg-ink e.py-1 fora de landmark,semoverflow. A biblioteca chamavaSiteNav diretamente, sem oheader usado nas páginas públicas já verificadas. app/library/page.tsx passa a envolver a navegação emheader, dando landmarkbanner ao aviso e identidade do site, sem duplicar menu ou alterar texto/ações. Regraregion permanece integral,sem exceção ou filtro. Atéaqui3estados/caso75auditorias/engineforam executados, não125; as etapas seguintes ainda precisam passar.

Integração explícita do734a877384 preservaHTTPS/cadastro e desativa prefetch informativo deFooterAnchor/Terms/Privacy; parent registrado. Correção exige toda a suíte no novohead, não rerun isolado. Custos fixos dosjobsfalhos/cancelados devem ser reconciliados, nenhuma operação real ou mudança comercial/fiscal. Ownership deapp/library/page.tsx desta branch até integração posterior; sem editor concorrente.
