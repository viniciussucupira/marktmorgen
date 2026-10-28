# AV(a): vincular franquias marcadas à coorte de caixa
Base de implementação:0b3f19b (com correção urgente1176 como ancestral da candidata). Avaliação28/10/2026, sem ativação comercial.

## Decisão por cobertura
| Cobertura false atual | Pode simplesmente começar desligada? | Ação |
| --- | --- | --- |
|pauseRestart|Não demonstrado: pausa/retomada já têm promessa e regras publicadas|Completar protocolo e aviso financiado; preservar registros e direitos|
|resourceAllocations|Não para retirar franquias publicadas; recurso adicional só pode OFF com prova de ausência de oferta/direito|Completar vinculação de todos os caminhos ao caixa sem cortar limites|
|renewals|Não: renovação faz parte da assinatura|Reserva anterior à obrigação/cobrança; sync diário posterior não basta|
|settlementAndReserveReconciliation|Não é um recurso opcional de interface|Completar evidência de caixa/obrigações e conciliação306SY2|
checkout eplanSwitch true não demonstram os quatro ciclos restantes. Fonte atual tem quatro false; referências antigas a três são históricas. Nenhum flag muda neste passo.

## Alteração concreta
Somente a tentativa de entregawebhook em takeAllowance exige a coorte paga imutável quando period.funded=true, antes de pool/contador e de safeFetch. Isso abrange primeira tentativa e repetições pelo ponto comum; semprova recusa. Nenhum ledger adicional ou liberação de principal.

A candidata ampla3aee67de foi reprovada peloCI123114390011:autorizaçãoAPI/studio também atende remoção,acke disconnect; bloqueá-la genericamente impediu ações preservadas. A correção restringe a guarda ao trabalho externo de webhook. AutorizaçãoAPI/studio e outros medidores permanecem contados,com seus guards específicos separando obrigação nova de redução/manutenção. Não alterar asserções existentes503/429ou liberar novos recursos para fazer testes passarem.

Contratosnão marcados e admissão não pagante preservados. Políticas reais continuamnull; nenhuma operação financiada nova é autorizada. Guardsespecíficos existentes continuam,não são substituídos pela guarda de entrega. Duplicidade em testes de envio pode ter custo e exige orçamento completo.

## Custos antes da operação
Uma avaliação adicional da coorte por chamada que alcança a guarda; máximo teórico18comandos na criação/17na repetição segundo o protocolo existente, incluindoEVAL. Não é nova mediçãoRedis. O corpo completo continua limitado12288bytes e mesma coorte mensal ou até12anuais. Sem novo campo de protocolo/fornecedor.

Com o teto de entregaswebhook consumido em chamadas unitárias, apenas o componente de tentativas admitidas:
| Plano mensal ou anual | Chamadas/mês | Comandos adicionais/mês,18cada | Chamadas/12meses | Comandos/12meses |
| --- | ---: | ---: | ---: | ---: |
|Store/creator|300|5400|3600|64800|
|Studio/pro|1000|18000|12000|216000|
|Scale|3000|54000|36000|648000|

Na hipótese ilustrativa da documentação existente de uma primária sem réplica e preço pagoUS$0,20/100mil comandos, os componentes seriam respectivamenteUS$0,0108/0,036/0,108por mês eUS$0,1296/0,432/1,296por12meses. **Não são tetos totais aprovados**: recusas/repetições após esgotar franquia, topologia, HTTP/TLS/respostas, CPU, armazenamento e retenção ainda exigem limites globais e maior preço pago vigente. Não usar essas parcelas como custo final nem quota grátis como zero. Total mensal/anual por plano continua desconhecido/reprovado; nenhuma operação real nova é habilitada até cálculo completo,tetos e reserva. Sem contratação ou economia certificada.

## Verificação
Teste sintético da função real:três planos×doisintervalos;webhook sem aprovação recusa sem alterar chaves, e cada um dos sete outros tipos mantém sua autorização de manutenção/medição. Caminho não marcado continua admitindo integração. Testes existentes preservam remoção de acesso,label,endpoint,disconnect e recusa específica de obrigação nova. Testes existentes de email/provider/consentimento/essenciais permanecem. Nenhum teste local; suíte integral hospedada requerida na candidata. Este passo não conclui AB(a), resourceAllocations, renovação, caixa real, cálculo fiscal, margem ou abertura. MRvigente:unidade positiva com folga e100%direitos;empresa coberta na base mínima;60%meta mensal real. TXsubstitui soma automática de impostos. Preços,conteúdo,idiomas e identificadores preservados.
