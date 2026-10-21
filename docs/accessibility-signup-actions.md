# Cadastro sintético com confirmação explícita

Item201,20/10/2026 Fortaleza. Esta matriz amplia a jornada de cadastro sem criar conta real: formulário usa o endpoint local real, envia para Resend simulado em memória, lê o link somente da caixa sintética, comprova queGET não abre sessão, confirma com teclado e exige cookieHttpOnly/SameSiteLax e entrada no primeiroStudio. Todo request de navegador fora do host local é bloqueado; somentePOSTauth/request eauth/callback são permitidos. Dados descartáveis@example.test, serviçosRedis/e-mail/Stripe/AI locais. VERCEL=0 mantém somente o bypass local já existente em bot-check, sem mudar código nem gate deprodução; BotIDreal permanece lacuna.

Três engines reais Playwright1.56.1,5larguras320/390/768/1280/1920 e5modos,25jornadas/engine75total. Três estados auditados por jornada: formulário,confirmação antesdoPOST,primeiroStudio. Axeintegral comAAAcontraste,teclado,nãooverflow,espaçamento persistido,movimento reduzido ecoresforçadas. Reflow320 não equivale zoomreal400%;dispositivos/AT/manualscroll permanecemabertos. Falhas e incompletes são registrados,sem certificaçãoAAAdoproduto. Nenhum token/corpo de e-mail é escrito no log.

Custo fixo CI adicional:3jobs×30min=90job-min/execução;Rexecuções/mês teto90Rmensal/1080Ranual. Não é custo porcliente. Nenhum provedor/serviço novo,nenhuma operação real; elegibilidade de runner público e fatura devem ser reconciliadas com todos os jobs,inclusivefalhas/cancelados. Desconhecido não ézero nem margemcertificada. Preservados preços/limites,PLANS_ON_SALE=false,comissão,optin,taxgate/art9a/revisãocomercial e mínimo60%individual/consolidado após custos/impostosBrazil/EUA.

Estado inicial: implementação submetida aCIintegral; sem resultado ou entrega antecipados. Item202 e203Teamsmantêm ordem; este teste integra201ativo.

## Correção de ambiente em21/10/2026

No head398bb66, Chromium eFirefox concluíram;WebKit falhou nas25confirmações:callback303 seguido de retorno a/signin, sem sessão aceita. A aplicação deprodução emite cookieSecure; HTTP localhost não reproduz consistentemente sua aceitação entre engines. A matriz passa a usar HTTPSlocal3199 com proxy paraNext3198, certificado descartável gerado somente no runner e host/protocolo encaminhados coerentemente. IgnoreHTTPSErrors é limitado ao contexto sintético, sem alterar TLS ou autenticação deprodução. A exigência de cookie agora incluiSecure além deHttpOnly/SameSiteLax; nenhum cookie é injetado e o fluxo real de confirmação continua obrigatório. Hipótese depende da nova execução completa, sem declaração antecipada de correção. Custos/tetos anteriores mantidos, histórico de falhas preservado.

## Integração explícita para nova verificação completa

Head730a7b7ec0 incorporado na branch de cadastro, mantendo integralmente o harnessHTTPS,workflow e225auditorias anteriores; traz as correções de desempenho, seletorDunning e settlement antes de reload. Integração somente para testar o conjunto enquanto730éverificado, sem merge emmain ou publicação antecipada. O head030c1a3 passou75jornadas/225auditorias de cadastro mas reprovoumobile272ms; não pode ser declarado concluído. Toda a suíte deve rodar novamente no novohead, inclusive cadastro nas3engines. Nenhuma operação/provedor/custo variável novo; todos os jobs adicionais fixos devem ser reconciliados, incluindo cancelados/falhos. Preços/limites/gates e fila203–219 preservados.

## Prefetch de links informativos

No headdbe95fa, WebKit119024282128 concluiu25jornadas/75auditorias mas reprovou1caso390/forced-colors por3pageerrors deRSC para/terms,/privacy,/refunds; Chromium/Firefox passaram. Toda a evidência é mantida e não se filtra esse erro. FooterAnchor passa a não buscar antecipadamente cada destino informativo; os linksTerms/Privacy do cadastro também usam prefetchfalse. Permanecem linksnativosNext com mesmosendereços,textos,foco e navegação real ao clique. Ler/concluir cadastro não precisa solicitar páginaslegais especulativas; reduz concorrência desnecessária de rede/browser, sem remover acesso aos termos ou consentimento. Não é prova antecipada de resolver oWebKit: nova suíte completa no novohead obrigatória.

Esta alteração compartilha components/site-footer.tsx eapp/signin/page.tsx; ownership desta branch até integração explícita com730/736. Nenhum preço/limite/gate/optin/custo deprovedor novo.


## Initial store address and publication follow-up

The earlier matrix stopped at the empty authenticated Studio. Publishing a product in a seeded store is a different proof from claiming the first store after signup. Extend each existing case through the actual /api/store/claim form, require the returned handle and32hex store ID to match the synthetic input, wait for the real Studio refresh, activate its actual View my store link with the keyboard, remove the creator browser session and reload anonymously. Require HTTP200 and the real store heading after reload; an owner preview alone cannot pass.

Five audited states per completed case now intend125audits per engine/375total across75journeys, not claimed until new-head CI passes. All earlier signup/Secure-cookie/explicit-confirmation requirements remain. Only three declared POSTs per case are allowed: auth request, auth callback and initial claim. Exact-fixture visit beacons are intercepted204 without stats writes; WebKit missing beacon bodies are an explicit payload-proof gap, never generalized acceptance. GPC is enabled in the synthetic browser to avoid advertising writes. No real store/account/message/payment/provider or public submission.

Existing3x30min CI ceiling is unchanged: maximum90job-min/run,90Rmonthly1080Rannual forRruns/month, not observed use or an invoice. No new provider or customer-variable operation; failed/canceled runs count, unknown actual invoices are notzero. Existing prices/limits/permissions/tax/commercial gates remain. Actual400%zoom, physical devices/AT, manual incompletes and whole-process keyboard review remain open; this extension does not certify AAA. The initial-store flow is new coverage and may reveal product defects; fix them and require the entire suite on the corrected head before conclusion.
