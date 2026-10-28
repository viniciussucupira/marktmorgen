# AV(a) — coorte antes de nova leitura de gasto Meta

28/10/2026, base9c224622. Componente parcial de resourceAllocations; renovação e conciliação continuam obrigatórias e incompletas.

## Problema concreto e correção

Início e retorno OAuth já verificam a coorte. readMetaSpend também é chamado pelo seletor de conta e pelo job diário; essas novas consultas ao fornecedor não repetiam a prova. A função comum agora resolve a loja atual pelo sid da conexão e confere statsId, antes de criar o lock de leitura ou chamar Meta. Loja marcada period.funded=true sem coorte retorna busy pelo resultado já existente. Conexão, dados retidos e desconexão não dependem dessa nova autorização; cancelamento/revogação seguem intactos. Nenhum contrato não marcado passa a ser marcado ou aprovado.

Benefício: impedir nova consulta externa de uma obrigação marcada sem vinculação ao caixa, preservando o que já foi lido. Teste da função real em3planos×2intervalos exige recusa sem chamada Meta nem registro de leitura/gasto; o job real deve pular a consulta. Testes existentes de leitura não marcada, moeda, erros, paginação, dados digitados e desconexão permanecem. Nenhuma chamada real, conta, anúncio ou mensagem.

## Custo antes de operar

Cada consulta elegível adiciona duas leituras canônicas de loja. Marcada e financeiramente elegível também observa a coorte existente: até18comandos na primeira observação ou17na repetição, total incremental de20/19comandos; corpo da coorte máximo12288bytes, sem nova chave/TTL de ledger nem liberação de principal. A consulta negada ainda pode custar leituras; não contar recusa como gratuita. CPU/criptografia/HTTP/TLS/respostas/egress/retenção não estão representados só por essa conta.

Somente componente ilustrativo, não teto aprovado: primária sem réplica aUS$0,20/100mil comandos e50/200/500leituras por mês implicam20comandos adicionais por leitura: StoreUS$0,002/mês e0,024/12meses; Studio0,008/mês e0,096/12meses; Scale0,020/mês e0,240/12meses. Mesmos valores por pior mês para contratos mensais e anuais com100%dos direitos. Contagens50/200/500 não são franquias nem limites medidos; paginação e custos Meta atuais permanecem. Chamadas diárias por conta, trocas manuais, repetição, topologia real, preço pago mais caro e limite global ainda exigem cálculo/teto/reserva. Total mensal/anual completo desconhecido reprova; não habilitar operação real com estes exemplos. FW1 continua no275FX1/próximo PR de custos previsto, sem PR independente.

MR/TX vigentes: unidade positiva com folga e100%dos direitos/complementos, empresa coberta desde base mínima e60%meta mensal real.100%custos fixos FX275, desconhecido nunca zero. Sem custo fixo/serviço/entitlement novo; CI e uso efetivo continuam custos da empresa desconhecidos. Nenhuma mudança de preços69/690,449/4490,999/9990, limites, comissão, COUNTRIES, idiomas, conteúdo ou Hazelsong. CURRENTpolicies/revisões continuamnull e flags false.

Acessibilidade:0→0passos/decisões de interface; nenhuma tela nova ou alegação AAA. Não declarar AB(a), resourceAllocations ou renovação concluídos. Exigir suíte integral no novo head; produção só após READY/domínio/versão exatos. Sem incremento funcional enquanto prova interativa de produção permanecer pendente.
