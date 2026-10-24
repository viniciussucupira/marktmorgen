# Período financiado sem renovação presumida de recursos

Somente uma observação cuja prova de caixa foi reconhecida marca o período pago com funded=true. O marcador acompanha o período já encaminhado pelos fluxos de retorno, recuperação, leitura, troca e sincronização, sem novas requisições.

O cálculo das franquias segue o mesmo período pago e os mesmos doze meses ancorados do contrato anual. Quando um período marcado termina, não se aplica a tolerância antiga de dois dias que presumiria outro mês. A confirmação de um período novo depende de outra prova reconhecida. O campo renews continua refletindo a configuração de cobrança do fornecedor; o marcador não cancela nem altera essa cobrança.

A persistência lê o marcador estritamente (somente true ou ausente), preserva-o numa escrita do mesmo período e recusa mudança de identidade, plano ou período sem um período novamente marcado. Contratos sem marcador mantêm seu caminho existente. Cancelamento ainda limpa period; pausa/retomada e migração precisam de seu próprio ciclo financiado antes de abrir vendas.

## Validação e custos

Testes sintéticos cobrem ausência de renovação presumida, doze meses anuais, preservação na leitura/gravação, mudança sem prova recusada e marcador produzido apenas após observação reconhecida. Suíte completa do novo head exigida antes de incorporar.

Nenhum comando Redis, requisição Stripe, dependência, job ou serviço novo. O campo custa14 bytes JSON brutos adicionais por período pago. Condicionalmente a320 transmissões/gravações do registro por pior mês:4480 bytes/mês e53760 bytes/12 piores meses para cada Store/Studio/Scale, mensal ou anual. Não é teto operacional nem custo certificado: preço, retenção, cópias, sobrecarga, CPU, memória e tráfego desconhecidos continuam reprovados. Nenhuma reserva ou teto financeiro reduzido; todos os custos fixos da LLC permanecem integralmente no Marktmorgen, com leitura tributária mais onerosa.

Este é um componente do controle das janelas, não autorização integral de alocações ou renovação. Orçamento global, alocações por recurso, exposição de trial/gratuito/encerrado, pausa e conciliação permanecem incompletos. Três coberturas falsas, políticas reais nulas e PLANS_ON_SALE=false preservados. Preços, limites visíveis, conteúdo, idiomas e identificadores não mudam; nenhuma certificação de margem ou AAA.
