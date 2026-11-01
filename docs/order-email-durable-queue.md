# EM1 — fila durável de e-mails de pedido

Registro técnico de 01/11/2026, mesmo ramo/PR #1502. Construção para revisão; não é ativação produtiva, comprovação de entrega, autorização de cobrança ou conclusão do complemento 309. `PER_EMAIL`, `ORDER_COST`, preços, direitos, comissões e flags não mudam.

## Primeira fatia: atualização do envio físico

O chamador real é `markShipped`, usado por `POST /api/store/shipped`. A origem continua sendo um checkout pago da própria loja, lido na sua conta Stripe. O payload original completo fica cifrado com AES-GCM (`secret-box`), vinculado ao ID da mensagem, antes de qualquer POST ao provedor. Marca física, payload, índices e reserva de bytes/itens são gravados atomicamente na mesma Lua. O produtor só aceita ACK explícito; concorrência devolve a marca persistida vencedora, inclusive seu rastreio.

`CURRENT_SHIPMENT_MAIL_LIFECYCLE` está em `never_activated` e `CURRENT_SHIPMENT_MAIL_POLICY` permanece `null`. Nesse estado não existem novos polls de status no navegador nem Redis adicional para status/apagamento/cron desta fila. Uma marca legada continua aparecendo como enviada fisicamente, com aceitação do e-mail não registrada e sem reenvio automático prometido. Um novo pedido físico com destinatário válido retorna `mail_unavailable`/HTTP 503 antes de criar a marca: esse efeito precisa ser resolvido antes de publicar uma integração que substitua o direito já existente. Os testes positivos passam dependências internas sintéticas; não há interruptor HTTP ou de ambiente que ligue a fila.

Uma futura primeira ativação exige `active`, política financeira válida e limpeza habilitada/custeada. Depois de qualquer uso, `retired` conserva leitura e exclusão do legado mesmo sem política de envio; não permite nova admissão ou POST. Nunca voltar a `never_activated` enquanto puder haver payload, reserva incerta ou cauda histórica. O estado operacional não é prova de financiamento.

| Estado persistido | Comportamento |
| --- | --- |
| `queued` | Espera conhecida; o cron pode preparar o mesmo payload quando houver política válida. |
| `preparing` | Lease de 60 segundos; só preparação sem POST pode ser retomada. |
| `dispatching` | Barreira persistida e ACK recebido antes do POST. Ausência de resposta/ACK permanece aceitação desconhecida e nunca é repetida por expirar lease. |
| `refused` | Recusa explícita, payload conservado; nenhum novo envio confirmado. |
| Limite de verificações esgotado | Índice de execução removido, estado visível `on_hold`; nenhum falso retry agendado. |

Pendências não expiram em 24/72 horas; 72 horas apenas acrescenta o aviso de atraso. A fonte `nl:ship:done:<session>` não tem TTL enquanto a pendência vive. Após aceitação/cancelamento confirmado, somente a fonte ainda correspondente recebe 400 dias; fonte alterada não ganha um prazo certificado. Fechar admissões não impede drenar trabalho já financiado. Trocar revisão exige sucessão explícita `continuedReviewIds`, sem converter revisão ausente em autorização.

Os índices por loja/pessoa acompanham os payloads sem depender do índice genérico de 401 dias. Apagamento/fechamento grava primeiro um fence sem TTL, cancela os payloads e confirma a conclusão; só então o fence recebe dez minutos. Produtores têm validade de cinco minutos, evitando a volta de um produtor pausado antes da exclusão. Uma exclusão que vence antes da barreira impede o POST; um dispatch já iniciado ainda pode chegar. Falha conserva fence/reserva desconhecida. Pools locais comprovadamente zerados são apagados; contadores corrompidos nunca liberam uma reserva por suposição. Fences históricos não são limitados pelo número de mensagens pendentes.

## Provas e custo ainda não aprovado

`scripts/test_shipment_mail_outbox_redis.py` executa a Lua real em Redis 7.2.7 descartável. Inclui concorrência de 16 produtores, ACK perdido, espera acima de 72 horas, fonte sem TTL, sucessão de revisão, lease final abandonado, exclusão concorrente, pool corrompido e formato inteiro não canônico. Os testes TypeScript exercitam cifra real, fronteira de ACK, chamada real `markShipped` e provedor SES HTTP sintético, mantendo conteúdo/rastreio/endereço.

Máximos observados por mutação nessa prova: enqueue 27, claim 16, dispatch 16 e aceitação 27 comandos, contando **EVAL + cada redis.call**. Leituras externas, autenticação, cron, provedor, contagens, exclusão e retries acrescentam operações. A prova de memória compara os bytes reservados antes da gravação com `MEMORY USAGE`, incluindo ciphertext grande/chaves longas; não é preço nem financiamento. O envelope pago de armazenamento por tempo indeterminado, cópias, encerramento, fences, polling e reconciliação permanece desconhecido/rejeitado nos registros. Não tratar como room, cota grátis ou custo zero; não reduzir o custo dos e-mails com esta construção.

## Continuação obrigatória

### Integração do teto global em construção

`lib/resend-fallback-transport.ts` passa a ser o único transporte dos POSTs transacionais do sender: single, batch e fallback da remessa. Probes e alertas que chamam o sender também passam pela guarda. A revisão e o vínculo de credenciais reais permanecem `null`, portanto não há novo GET de uso nem reserva/POST de fallback sem essas provas. O vínculo exige fingerprints SHA-256 das credenciais de envio e da credencial full access do GET/usage, todos associados à mesma identidade estável de conta. O uso recebido é validado pelo módulo real do orçamento, somando `sent + received` no período oficial.

O transporte captura payload e credenciais uma vez. A identidade da tentativa vincula caminho, JSON final e chave efetivamente enviada. Sem chave estável, cada chamada ganha nonce próprio: duas intenções iguais não são suprimidas pelo texto igual. O número de destinatários precisa corresponder ao corpo; cc/bcc adicionais não podem escapar da reserva. Variantes de tags/remetente recebem suas próprias identidades. O envelope serializado conserva os anexos já permitidos pelo produtor (15 MB antes de base64), sem reduzir `MAX_FILES_BYTES`.

Cada dispatch tem um token exclusivo, diferente do token compartilhado de reserva. Cancelamento anterior ao POST usa CAS que só libera `reserved`; não pode liberar o POST em voo de outro worker. Uma resposta HTTP conhecida é assentada apenas com o `dispatch.claim` recebido por esta invocação. O prazo é conferido imediatamente antes do fetch. Timeout, 5xx, conflito ou HTTP 2xx sem IDs explícitos permanecem desconhecidos. Uma repetição reconcilia somente o settlement, sem repetir o POST. Receipt aceito é validado em leitura pela conta, tentativa, fingerprint, unidades, estado, proveniência e expiração absoluta pelo relógio Redis; nenhum motivo textual de recusa vira sucesso. Recuperar esse receipt não incrementa de novo o contador local de enviados.

O budget v2 preserva holds sem TTL para pendências/incertezas e conserva o ledger global. Terminais completos têm 35 dias de retenção, sem renovação pela leitura. Perfil do ensaio Redis real, incluindo EVAL e chamadas internas: inicialização 4, reserva 11, dispatch 11, aceitação 14, leitura de receipt 10 e cancelamento 13 comandos. Uma chamada do transporte acrescenta GET/usage, validação/bytes e possíveis leituras/reconciliações; isso não é custo monetário aprovado. Não existe bootstrap automático de ledger ausente.

Persistem regressões de recuperação que bloqueiam disponibilizar o conjunto: `store-alerts` e os avisos de capacidade/SES consomem marcas antes de confirmar envio; alerta de novo navegador e avisos de passkey/two-step podem ignorar false; cron de recuperação de mail/Stripe atualiza estado antes do aviso; cron de usage marca avisados mesmo com falha; solicitações de login/mudança de endereço podem responder como enviadas ignorando false. A guarda cobre o POST, mas não certifica a recuperação desses chamadores nem a fila durável de todas as categorias de pedido. Esses caminhos exigem correção coordenada, respeitando a faixa de contas do Claude.

Confirmação de compra ainda exige uma fonte durável de conteúdo/direitos/links, auditoria dos produtores e checkpoint contábil ligado ao pagamento confirmado, independente da aceitação do e-mail. O snapshot deve conservar a admissão original, sem inferir hora/janela/share do momento do replay. O prazo do helper contábil é relativo à janela original; não é promessa de retenção fixa de 400 dias desde o checkout. Chamadas de grupo, presente, pré-venda, solicitação de pagamento, oferta adicional e nova cópia precisam de seus contratos reais; não repetir ingenuamente `countOrder`/`settleAdmitted`.

O teto Resend deve anteceder **todos** os POSTs `/emails` e `/emails/batch`, inclusive variantes sem tags, remetente alternativo, probes e alertas. Reserva não autoriza POST: é obrigatório ACK único `dispatch`, teste imediato de `sendBeforeMs`, identidade de conta vinculada às credenciais e attemptId ligado ao payload/chave finais. Resposta incerta mantém a reserva; `sendEmail(false)` não prova recusa. O ledger nunca é inicializado automaticamente quando ausente. Fallback bloqueado de pedido conserva espera durável na SES; outros chamadores devem propagar falha recuperável sem perder direito ou concluir antes do ACK.

## Fontes oficiais consultadas em 01/11/2026

- [Preços Resend](https://resend.com/pricing?product=transactional): e-mails recebidos também usam a cota transacional; excedentes opcionais ficam em `Transactional Overages`.
- [Pay-as-you-go Pricing](https://resend.com/changelog/pay-as-you-go-pricing): descreve a ativação de excedentes em Settings e a cobrança por blocos adicionais. A existência da opção não comprova a configuração da conta do dono.
- [Account Usage API](https://resend.com/changelog/account-usage-api) e [OpenAPI oficial](https://github.com/resend/resend-openapi/blob/main/resend.yaml): contrato que deve orientar o snapshot de uso agregado e reset real de faturamento, sem trocar por mês de calendário.

Continuam ausentes a prova real de conta/credenciais, plano pago e cota incluída, período/reset, configuração inclusiva sem overages ou controle completo de emissores/entrada/SMTP, inicialização revisada e financiamento da cauda. Nenhuma conta/configuração foi alterada e nenhum e-mail real foi disparado.
