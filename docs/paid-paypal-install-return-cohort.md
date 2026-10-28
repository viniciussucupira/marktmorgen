# AV(a) — revalidar coorte no retorno de instalação PayPal
28/10/2026. Implementação parcial deAV1, sem ativar serviço ou abertura.

## Obrigação nova e limite do reparo
O início de instalação já verifica reservePaidResourceWindow para período marcadofunded. O retorno em app/api/store/paypal/onboarded/route.ts podia chegar depois de a revisão financeira mudar e ainda consultarPayPal, substituir o vendedor e agendar aviso. Depois da sessão/permissão/configuração/trackingId próprios, repetir a admissão antes de checkSeller. Recusa volta aoStudio com paypal=limited. Não confiar no merchantId vindo daURL.

Não alterar captura/retorno de compra, entrega/reembolso, reconciliação, desconexão ou limpeza. Nenhum direito vendido pode ser descartado para corrigir instalação opcional nova. Stores legadas não marcadas seguem o caminho existente; políticas reais continuam null e nada é habilitado.

## Custo pré-operação — componente, não total aprovado
A guarda reutiliza umEVAL financeiro: hipótese conservadora18comandos equivalentes na primeira reserva e17na repetição, corpo até12288bytes. Não adiciona chamadaPayPal na recusa; sessão e permissão já existiam. Custo admitido deve incluir repetição/recusas,CPU,transferência,logs,topologia/réplicas e preço máximo efetivamente pago, com teto global e reserva. Desconhecidos reprovam.

Apenas para mostrar a parcela aritmética sob hipótese histórica deUSD0,20/100mil comandos primários:18×0,20/100000=USD0,000036porretorno. Os volumes abaixo são cenários de cálculo, **não franquias novas, limites do produto ou demanda máxima demonstrada**.

| Plano/cadência | Retornos hipotéticos/mês | ParcelaUSD/mês | ParcelaUSD/12meses |
| --- | ---: | ---: | ---: |
| US$69 mensal | 50 | 0,0018 | 0,0216 |
| US$690 anual | 50 | 0,0018 | 0,0216 |
| US$449 mensal | 200 | 0,0072 | 0,0864 |
| US$4490 anual | 200 | 0,0072 | 0,0864 |
| US$999 mensal | 500 | 0,0180 | 0,2160 |
| US$9990 anual | 500 | 0,0180 | 0,2160 |

Os valores identificam os seis contratos existentes; preços/limites persistidos não mudam. A parcela não é teto completo, orçamento porcliente aprovado ou prova de cobertura no pior mês. A operação permanece recusada para coortes semprova. Contratos anual/mensal e complementos devem preservar100% dos direitos, exposição máxima, folga/reserva e reconhecimento anual por mês;meta60%empresa nãoé certificada. Custosfixos/pesquisa/CI100%FX275.

FW1 fica na execução conjunta275FX1/ou próximoPRde custosAV1: esta correção de admissão não declara incluído o custoWAF no registro nem medidos picos porIP. Nenhuma regraVercel alterada.

## Verificação
Teste da rota real com sessão assinada, loja sintética marcada e vendedor existente. Exigir303limited, zerochamadasPayPal incluindo autenticação e vendedor inalterado, mesmo com merchantId não confiável no retorno. A prova de desconexão existente continua. Suite hospedada completa no novohead; nenhum serviço/pagamento/conta/consentimento/mensagem real. PR depende da correção1178; não incorporar sobre umhead reprovado. Flagsfalse,COUNTRIES,preços/limites/comissão/idiomas/ID/conteúdo/Hazelsong preservados. Sem entrega funcional/contador254.
