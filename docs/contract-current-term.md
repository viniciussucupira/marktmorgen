# Observação do período de contrato já ativado

A ativação inicial permanece limitada ao prazo do recibo. Uma resposta Lua de código1 confirma o primeiro consumo e traz esse prazo. Uma resposta de código2 exige prova imutável já existente e apontador ativo iguais à identidade/fase/período observados, e traz exatamente o fim do período. A aplicação valida a forma da resposta e verifica novamente o relógio após recebê-la. Não há tolerância após o fim nem inferência de renovação.

A observação pode continuar após o prazo de ativação somente no mesmo período já comprometido. Sem prova, prazo vencido é recusa antes de qualquer escrita. A troca também conserva a prova e o recibo de origem, ambas as obrigações, caixa e slots. Uma prova antiga que deixou de ser ativa não autoriza direitos.

Leitura e sincronização de assinaturas marcadas de Checkout exigem a prova, como já acontece com trocas. Assinaturas sem marcadores preservam o caminho legado. Resposta desconhecida não registra novos direitos.

## Limites e evidência

Em verificação: suíte completa no novo head, casos de período exato após dois dias, ausência de prova após o prazo, fase/identidade divergente, renovação, política vencida, respostas malformadas e Lua real em Redis descartável. O script mede os comandos internos e exige14/11 no Checkout e16/13 na troca; não considera EVAL como apenas um comando faturável.

Este passo ainda exige política e revisão atuais. Não implementa arquivo de políticas vencidas nem migração, trial para período pago, renovação, pausa ou concessões de recursos. As três coberturas incompletas permanecem falsas. Configurações financeiras reais continuam nulas e vendas fechadas.

## Custos antes da operação

Sem novo campo, serviço, dependência, job ou chamada Stripe. No caminho antes sem verificação de Checkout marcado há uma EVAL adicional: até14 comandos no primeiro consumo,11 na observação. Nos caminhos já protegidos o número de comandos não aumenta; o código de resposta muda de1 para2 no ramo somente de leitura. Memória e CPU locais não são presumidos gratuitos.

Hipótese condicionada: uma primária sem replicação,320 observações no pior mês, PAYG pago a US$0,20/100mil comandos. Para cada Store, Studio e Scale, mensal ou anual:14 comandos representam US$0,00896/mês e US$0,10752 por12 piores meses; com admissão15, US$0,01856/mês e US$0,22272/ano. A troca mantém16/13; máximo com admissão17 é US$0,02112/mês e US$0,25344/ano. Tetos globais de chamadas e custos de topologia, memória, transferência, CPU e retenção continuam desconhecidos; nenhum total, margem60%, teto ou reserva é certificado ou reduzido.

Todos os custos fixos da LLC permanecem atribuídos integralmente ao Marktmorgen; aplica-se a leitura tributária mais onerosa Brasil/EUA. Preços, limites visíveis, conteúdo, idiomas e identificadores preservados. Sem alteração de interface ou alegação de conformidade AAA.
