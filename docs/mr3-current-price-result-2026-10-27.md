# MR3 — Resultado dos preços atuais, 27/10/2026

Item466[MR3], pedido do dono27/10/2026 07h42 Fortaleza. Estado: relatório documental com números do modelo registrado; **não é aprovação de abertura ou certificação de lucro real**. MR2 teve o critério financeiro incorporado no PR1094, mas o relatório mensal automático real ainda está incompleto. Sua dependência de dados reconciliados não pode ser preenchida com testes sintéticos.

## Preços preservados e pior leitura registrada

Fonte numérica: [alinhamento regenerado](margin-alignment-2026-10-18.md), código de15ceac3351087bbd9a0937193e4202ad7e7df5a4, verify122233986996:8/8 testes de alinhamento, incluindo igualdade do documento com o gerador. A suíte completa do novohead3fcbac teve31/31checks eVercel aprovados antes da incorporação.

Leitura vinculante: VAT27%dentro do preço, imposto sobre lucro78,18% eISS5%sobre receita; recebimento mais caro, remessa e reservas de reembolso/contestação do modelo único. Uso integral dos direitos registrados; anual inclui12janelas mensais completas. Nenhuma comissão subsidia o resultado. Isso não prova cobertura de fornecedor ainda desconhecida ou custos reais da LLC.

A última coluna é uma retenção **conservadora**: lucro em centavos mostrado pelo gerador menos a folga de custo já existente, sem reduzir os impostos mostrados. Não é novo imposto, preço ou limite. Não supõe benefício fiscal dessa folga.

| Contrato atual | Preço | Lucro líquido registrado antes da folga | Folga reservada | Lucro conservador depois da folga |
| --- | --- | --- | --- | --- |
| Store mensal | US$69 | US$6,57 | US$0,25 | US$6,32 |
| Store anual | US$690 | US$66,39 | US$1,00 | US$65,39 |
| Studio mensal | US$449 | US$42,92 | US$0,25 | US$42,67 |
| Studio anual | US$4.490 | US$424,98 | US$1,00 | US$423,98 |
| Scale mensal | US$999 | US$95,75 | US$0,25 | US$95,50 |
| Scale anual | US$9.990 | US$945,87 | US$1,00 | US$944,87 |
| Assistente da loja, mensal,700respostas | US$69 | US$6,59 | US$0,25 | US$6,34 |

O assistente tem contrato mensal nesta análise; não se inventa preço ou intervalo anual para ele. Seu custo próprio não é subsidiado pelo plano. Legendas e outros complementos não foram dispensados: suas linhas continuam no alinhamento gerado e sujeitos ao critério positivo, limites próprios, custeio e demaisgates.

**Os números são positivos no modelo registrado. O lucro líquido completo comprovado continua desconhecido enquanto custos, cobertura e revisões estiverem ausentes.** Não extrapolar esta tabela para uma garantia de margem real.

## Base mínima da empresa

| Contrato usado para financiar a base | Base mínima comprovada |
| --- | --- |
| Store mensal | Não estabelecida |
| Store anual | Não estabelecida |
| Studio mensal | Não estabelecida |
| Studio anual | Não estabelecida |
| Scale mensal | Não estabelecida |
| Composição de contratos e assistente | Não estabelecida |

Motivo: inventário integral FX275, câmbio máximo, apropriação/reserva de obrigações anuais e exposições financiadas ainda não têm revisão completa. [SR3](stripe-us-requirements-cost-evidence.md) também não comprovou teto e aceite deITIN/agente quando aplicável, representante residenteUS e endereço comercial real. Não substituir incógnitas por zero, preço inicial anunciado, cota grátis ou contribuição da Hazelsong.

O cálculo da base está implementado e testado com dados sintéticos completos, inclusive anual e composição mais fraca. Sem entradas reais/revistas, não há numerador completo; portanto não há número finito honesto para apresentar. Nenhuma quantidade de clientes conserta um cliente com lucro nulo ou prejuízo.

## Travas que continuam fechadas

| Condição | Estado e motivo |
| --- | --- |
| Pedido de abertura e venda | OPENING_REQUESTED=false ePLANS_ON_SALE=false; nenhum plano ou assistente pode ser comprado |
| Revisão comercial | Ausente; tabela positiva não preenche revisões nem prova cobertura integral |
| Custos fixos/base/exposições | Revisões completas ausentes; teste grátis, reembolso, inadimplência e retenção não são dispensados |
| Custeio e operações | Direitos, reservas, contratos e políticas continuam exigindo teto anterior a cada gasto; nenhuma cobertura desconhecida foi aprovada |
| Tax gate | Sem redução de leitura; EU_HOSTING_CONFIRMED=false e dúvidas continuam sujeitas à prova oficial/consulta registrada |
| Art.9a e demais jurisdições | Tratamentos completos ainda não registrados; cobrança direta no criador não elimina responsabilidade tributária |
| Plataforma StripeUS | Conta/empresa e elegibilidadeUS/CA/UK/Europa não comprovadas; SR2 no PR1095 tem9testes próprios aprovados, porém a falha móvel ainda impede incorporar a condição nova |
| Relatório mensal real | Calculador existe, mas dataset reconciliado, ingestão, agendamento e apresentação automática ainda não estão operacionais |

SR2 é requisito vigente do dono mesmo antes de sua condição técnica ser incorporada; não declarar que já está em lib/opening.ts no main desta revisão.

## Dependência dos dados reais e verificação

A ausência do dataset reconciliado já estava explícita no código testado do relatório às13:14:04UTC de27/10. Mais de uma hora depois, a consulta de faturamento Vercel do último mêsUTC completo, setembro2026, não permitiu reconciliação: o intervalo completo excedeu o limite4MiB do conector; a janela menor01/09inclusive–08/09exclusive retornou404costs_not_found. Isso não prova custo zero nem mês inteiro sem cobranças. Nenhum total parcial foi publicado.

Dependência externa de MR2: **aguardando o dono para disponibilizar fonte contábil completa e reconciliável**, sem dados pessoais no relatório. Não se pede criar conta, contratar, pagar ou contatar terceiros. A engenharia restante do relatório permanece em andamento; registrar esta dependência não a declara concluída. Enquanto isso, este MR3 informa os números condicionais e as travas, sem aguardar autorização repetida.

Verificado: código/gerador/testes remotos deMR2; preços e folgas preservados; aritmética conservadora da tabela. Não verificado: custo real integral, enquadramento tributário pessoal, conta Stripe/elegibilidade, dados reais e relatório automático entregue ao dono. Testes sintéticos não servem de fatura ou prova de aceite.

Nenhum preço proposto/aplicado, limite visível cortado, comissão ou trava afrouxada. Nenhuma conta, termo, contrato, pagamento ou mensagem. Sem nova operação produtiva, chave ou retenção; pesquisa/CI continuam custo fixo integral do Marktmorgen, nunca presumido grátis. Acessibilidade: títulos e tabelas,0→0passos/decisões de cliente, sem teste humano ou certificação. Documento não é publicação funcional; contador254.
