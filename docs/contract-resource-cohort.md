# Coorte paga de recursos vinculada ao caixa

Uploads R2 e novos controles de períodos marcados devem reconhecer uma coorte financiada antes de consumir o orçamento do fornecedor. A coorte usa a prova ativa e imutável da assinatura: mesma loja, identidade, plano e período pago ainda vigente. Uma coorte mensal ou até12 anuais é compartilhada entre chamadas e repetição; não há nonce de recurso que possa criar outra.

A Lua verifica o principal retido contra todos os seis contadores: carry mais cada quantidade consumida vezes sua cotação deve ser exatamente reserved. Compara o recibo e a prova ativos antes de criar somente o campo da coorte. Mantém todos os centavos, slots, recibos e provas. Campo divergente, caixa/contador incompatível, período encerrado ou identidade divergente são recusados antes da escrita. A aplicação calcula âncoras reais de calendário e revalida janela, revisão e política após a resposta. Resposta perdida mantém a coorte e a repetição idêntica a recupera.

## Custos calculados antes da operação

Uma EVAL adicional por observação marcada, máximo18 comandos na primeira coorte/17 repetidos, incluindo chamadas internas; confirmação em Redis real ainda pendente. Apenas na hipótese de uma primária sem replicação e320 chamadas no pior mês, com PAYG pago US$0,20/100mil: US$0,01152/mês e US$0,13824/12 piores meses por cada Store/Studio/Scale, mensal ou anual.

O código recusa corpo JSON da requisição maior que12288 bytes. Na mesma hipótese:3932160 bytes/mês e47185920/12 piores meses, sem HTTP/TLS/resposta/erros. Cada campo+valor de coorte tem teto bruto de140 bytes:1 por grant mensal ou12 por anual (1680 por grant anual), sem expiração. Sobrecarga, cópias, retenção, CPU, memória, tráfego e custo de resposta/erro não viram zero. Teto global de chamadas, topologia e preços pagos aplicáveis permanecem desconhecidos/reprovados; não há total aprovado nem redução de reserva/teto. Nenhuma chamada Stripe nova.

## Limites

Este passo integra uploads e novos controles pagos marcados. Contratos sem marcador mantêm seu caminho; completar/cancelar uma sessão já existente continua permitido. A coorte é parte do financiamento integral reservado, não libera principal nem autoriza renovação. Arquivo/migração, trial→pago, pausa, todos os outros recursos, orçamento global e conciliação seguem incompletos; três coberturas falsas e políticas reais nulas, vendas fechadas.

Somente testes sintéticos em serviços simulados e Redis descartável no CI. Sem fornecedor contratado, pagamento, mensagem real ou mudança de configuração. Todos os custos fixos da LLC ficam integralmente no Marktmorgen e aplica-se o imposto mais oneroso. Preços, limites visíveis, conteúdo, idiomas e identificadores preservados. Nenhuma alteração de interface ou certificação de margem/AAA.
