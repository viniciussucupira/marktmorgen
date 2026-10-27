# Transferências internacionais — fornecedores atuais

Conferência em 27/10/2026, pela decisão do dono de 13h19 Fortaleza. Trabalho do Bloco de abertura; não implementa nem retoma EU1/SV1–SV5, que permanecem depois da abertura.

Este registro distingue mecanismo oferecido publicamente, condições de aplicação e cobertura efetiva do contrato/conta. Ler uma página não aceita termos. Nenhuma conta, contrato, assinatura, contato ou configuração foi criada ou alterada.

## Inventário e fontes oficiais

O inventário inicial vem de app/privacy/page.tsx no main38205f7ad797f470abc2eb602740c60398fa2221. A página nomeia Vercel, Upstash, Resend e Anthropic. AWS SES, Bunny Stream e Cloudflare R2 aparecem conforme configuração; esta pesquisa não leu segredos nem confirmou quais estão ativos em produção. Serviços ligados pelo criador e controladores independentes exigem análise separada.

| Fornecedor | Fonte e data publicada | Oferta/escopo conferidos | O que falta provar |
|---|---|---|---|
| Vercel Inc. | [DPA](https://vercel.com/legal/dpa), atualizado17/03/2026, vigente31/03/2026 | Introdução: Pro/Enterprise. Seção13 eSchedule3: transferências eSCC2021/914,módulos1/2/3 conforme papéis;UKAddendum. Dados de serviço/contato podem ter papel de controlador. | Plano/entidade/Agreement efetivos,serviços abrangidos,regiões/suboperadores e configuração. Não inferir cobertura deHobby. |
| Upstash, Inc. | [DPA](https://upstash.com/trust/dpa.pdf) e [Privacy Policy](https://upstash.com/trust/privacy), abril2025; PDF conferido27/10/2026 | DPA: escopo de processador vinculado aoAgreement; seção3 prevêDPF eSCC de fallback. Anexo2 prevê módulos2/3 conforme o papel do cliente eUKAddendum. | Contrato/versão aplicáveis à conta,entidade/listagemDPF/escopo ativo,anexos e suboperadores efetivos. Não confundir oferta contratual pública com cobertura da conta ou registro governamental conferidos. |
| Plus Five Five, Inc./Resend | [DPA](https://resend.com/legal/dpa),31/12/2025 | Definições1.14–1.16 incorporamEUSCC2021/914 eUKAddendum;papéis e condições ligadas aoAgreement/execuçãoDPA. | Agreement aplicável à conta,entidade,anexos/serviço e subprocessadores atuais. |
| Anthropic | [Privacy Center](https://privacy.claude.com/en/articles/7996862-how-do-i-view-and-sign-your-data-processing-addendum-dpa),16/03/2026 | Produtos comerciais/API:DPAcomSCCincorporado aosCommercialTerms;serviço de terceiro usa termos daquele provedor. | DPA detalhado,contrato/entidade e canal efetivamente usado;consumer não equivale aAPI. Nenhum termo foi aceito nesta pesquisa. |
| AWS, seSESconfigurado | [GDPR Center](https://aws.amazon.com/compliance/gdpr-center/),conferido27/10/2026,sem data de revisão visível confirmada | FAQdeclaraSCC2021incluídas nosServiceTerms/DPA para transferências a terceiros países;suboperadores dependem de região/serviço. | Versão datada doAgreement/DPA aplicável,entidade,regiãoSES e configuração real. A data de leitura não é data de vigência. |
| Cloudflare Inc., seR2configurado | [CustomerDPA](https://www.cloudflare.com/cloudflare-customer-dpa/),v6.4,vigente03/04/2026 | Seção6.2:SCCmódulos2/3 e adaptaçõesUK/Swiss;6.4:DPFe fallbackSCCsecertificação cessar. | DPA agreed/signed,entidade/contaR2,anexos,regiões,suboperadores e registroDPF efetivo. |
| Bunny, seStreamconfigurado | [GDPR](https://bunny.net/gdpr/),conferido27/10/2026,sem data de revisão confirmada | Página informaDPA disponível no painel quando houver tratamento de dados pessoais. | Texto datadoDPA/CCT,mecanismo de transferência,entidade e contrato efetivo. Frase sobre anonimização não comprova ausência de dados pessoais. Não acessar/assinar painel por esta pesquisa. |
| Stripe | [DPA](https://stripe.com/legal/dpa),28/09/2026;[DTA](https://stripe.com/legal/dta),18/11/2025 | DPAsepara controlador/processador e incorporaDTApara transferências que exigem mecanismo. DTAmostraDPF/SCCmódulos1/2/3 e capítulos regionais. | RotaDTAredirecionouen-de;não é prova do contrato da futura plataformaUS ou das contas dos criadores. Entidade/papéis/Agreement,região e cobertura devem ser conferidos no contexto real. |

As fontes acima demonstram oferta e condições públicas, não certificam o cumprimento do Marktmorgen. CertificaçãoDPF exige conferir a entidade/escopo/período no registro governamental;SCCexigem aplicação contratual e anexos adequados. A existência de transferência na cadeia não desaparece por mudar um servidor de região.

## Lacunas e limites do inventário

Google para o email de contato, calendárioGoogle/Zoom,plataformas de email conectadas,Jitsi,serviços de notificações dos navegadores e pixels escolhidos pelos criadores não foram todos auditados por este registro. A página de privacidade descreve funções/opt-in;isso não transforma todos em processadores próprios nem substitui a análise dos papéis. Não inventar que todas as integrações estão ativas, nem que estão ausentes só por não aparecerem numa variável local.

A seção7da página atual diz que oDPAUpstash incluiSCC/UKAddendum/DPF. O PDF oficial doDPA, atualizado em abril2025 e conferido em27/10/2026, sustenta a oferta dos mecanismos: seção3.2(B) prevêDPF para recebimento de dados europeus nosEUA e incorporação dasSCC quando oDPF não cobrir a transferência ou for invalidado; Anexo2 trata dos módulos2/3 eUKAddendum. O escopo inicial exclui os tratamentos próprios de administração,marketing,analytics,segurança e obrigações legais do fornecedor. RegistroDPF e contrato/configuração da conta continuam não verificados. A lacuna anterior de leitura doDPA foi resolvida pela fonte pública; a lacuna de cobertura efetiva permanece. Não ampliar essa frase para garantia geral de todos os fornecedores. Qualquer ajuste público futuro deve relatar somente o estado comprovado, preservando permissões e conteúdo.

## Próximo resultado necessário

Concluir inventário dos fornecedores efetivamente configurados sem expor segredos;vincular entidade/serviço/região/versão do contrato;conferirSCC/DPF/escopo/suboperadores e registrar lacunas por fornecedor. Se um passo exigir conta/aceite/contratação/contato,permanece não executado;esta pesquisa não concede autorização para fazê-lo. Não esperar migraçãoUEpara essa conferência,nem usar oferta pública como cobertura já verificada.

Custos mensais/anuais de eventuais exigências permanecem sujeitos aFX275 e aos seis contratos;desconhecido reprova,nunca zero. Não presumir revisão contratual/auditoria/assistência grátis. Nenhum serviço operacional adicional foi habilitado por este registro.

VR: oferta pública pesquisada e inventário inicial registrados;contratos reais,registroDPF e revisão completa de todos os fornecedores ainda não verificados. Nenhuma migração,aceite ou garantia de conformidade. Acessibilidade:Markdown com tabela/links,zero ações novas;sem teste humano/certificação. Preços,limites,comissão,flagsfalse,exposição,custeio,reservas,opt-ins/conteúdo/Hazelsong/idiomas/IDs preservados. Contador254;documento não é entrega funcional.
