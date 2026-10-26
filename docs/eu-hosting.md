# Hospedagem na União Europeia — EU1 / SV

Levantamento documental de 25/10/2026, 21h57 de Fortaleza (26/10/2026,00h57UTC). Base do código: 7343f87a55794f226c61f42bc072f26ba989a0b3. Estado: **em andamento**. Este primeiro resultado reúne fontes verificadas e lacunas da etapa SV1(a)/317[EU1]; não conclui o inventário, a comparação SV5, a construção SV4 ou a migração.

O objetivo é preparar uma operação cuja residência regional e custo completo sejam demonstráveis, com capacidade financiada e previsível. SV3 substitui o dedicado inicial por nuvem mínima principal+reserva; SV5 exige comparar fornecedores antes da escolha final. SV4 permite preparar e ensaiar desligado desde já. Nenhuma conta, contratação, envio, alteração de DNS, região, variável ou serviço real foi realizada. Nenhum segredo foi lido ou gravado neste documento.

## Resultado das fontes regionais

Selecionar uma região de função, guardar objetos numa jurisdição, limitar CDN e limitar logs/telemetria são controles diferentes. A configuração efetiva precisa demonstrar cada um. Conformidade GDPR anunciada pelo fornecedor não certifica a condição fiscal/comercial mais restrita do dono.

| Serviço | Evidência oficial e data editorial quando disponível | Resultado e pendências |
| --- | --- | --- |
| Vercel | [CDN](https://vercel.com/docs/cdn),21/01/2026; [cache](https://vercel.com/docs/caching/cdn-cache),17/03/2026; [região de funções](https://vercel.com/docs/functions/configuring-functions/region), consultada nesta data | CDN global acompanha o deployment e cache estático é distribuído. A região de funções não demonstra restrição de CDN, builds, logs ou plataforma inteira à UE. O padrão documentado não comprova a condição EU-only do dono. Não foi encontrada nesta evidência uma opção Pro que certifique todas essas camadas; isso não é declaração universal sobre qualquer contrato personalizado. |
| Upstash Redis | [regiões/replicação](https://upstash.com/docs/redis/features/globaldatabase); [backup](https://upstash.com/docs/redis/features/backup), consultadas nesta data, sem data editorial estabelecida | Permite escolher primário e réplicas de leitura; sem réplicas de leitura, equivale ao regional. Irlanda/Frankfurt são opções UE; Londres não é UE. Isto não verifica a região da conta, de backups, logs, controle ou suboperadores. Documentação de backup oferece retenção diária de1ou3dias, mas não demonstra que esteja ligada ou que seja recuperação independente da conta. |
| Cloudflare R2 | [localização](https://developers.cloudflare.com/r2/reference/data-location/), consultada nesta data; [Data Localization Suite](https://developers.cloudflare.com/data-localization/),05/05/2026; [Regional Services](https://developers.cloudflare.com/data-localization/regional-services/),23/07/2026 | Jurisdição eu restringe objetos e usa endpoint S3 jurisdicional. Isso é distinto do DLS, descrito como adicional pago exclusivo Enterprise. Regional Services restringe TLS/cache/aplicações à região selecionada, mas aceita conexão L3/L4 em centros globais. Nem jurisdição de objeto nem TLS regional provam, sozinhos, nenhum servidor pago fora da UE. Preço completo/entitlement do pacote não estabelecidos. |
| Bunny | [Routing Filters EU-only](https://bunny.net/blog/introducing-routing-filters-gdpr-friendly-eu-only-cdn-routing/),13/04/2023; [replicação](https://support.bunny.net/hc/en-us/articles/360020526159-Understanding-Geo-Replication), consultada nesta data | Existe filtro específico UE para Standard/HighVolume; o texto inclui encaminhar também visitantes externos aos PoPs selecionados. É mais específico que desativar zonas de preço. Armazenamento/replicação, transcodificação, player, logs e backups ainda precisam de comprovação separada e configuração efetiva. Não foi feita troca ou teste em conta real. |

O DLS tem componentes próprios para chaves, processamento e metadados; a [compatibilidade oficial de15/10/2026](https://developers.cloudflare.com/data-localization/compatibility/) contém restrições por produto. Não tratar a compra de um único componente como garantia de todas as camadas. Nenhum contato comercial foi feito para obter preço.

A [rede Bunny](https://bunny.net/network/) inclui cidades fora da UE na lista geográfica Europe. Por isso, selecionar Europe não equivale a selecionar o filtro European Union. A [página GDPR](https://bunny.net/gdpr/), consultada nesta data sem data editorial estabelecida, informa que o iframe Stream pode consultar servidores CDN globais para métricas anônimas. Filtro de entrega não comprova que essa telemetria ou toda a transcodificação fiquem na UE. Não bloquear compradores de outros países para aparentar residência regional.

## Preços observados, sem alterar o modelo

Observações públicas não são preço contratado, orçamento aprovado ou teto completo com todos os impostos. Sem crédito de franquia gratuita, desconto temporário, câmbio otimista ou subsídio da Hazelsong. As hipóteses vigentes continuam vinculantes.

| Componente | Observação oficial | Uso permitido neste levantamento |
| --- | --- | --- |
| Vercel Pro | [preços](https://vercel.com/pricing):US$20/mês, impostos adicionais conforme cobrança. A [publicação de08/09/2026](https://vercel.com/changelog/flat-rate-cdn-is-now-ga-for-pro-teams) descreve Flat Rate CDN para Pro. | US$240 em12mensalidades é somente o componente base observado, não o custo anual total da operação. Não verificar modalidade efetiva da conta nem reduzir o modelo com base nesse anúncio. Compute, demais serviços, limites, cobrança e impostos continuam a reconciliar. Modalidade fixa de CDN não prova UE-only. |
| Upstash | [preços](https://upstash.com/pricing/redis):Fixed250MB US$10/mês;1GB US$20/mês; cada região de leitura tem preço adicional; ProdPack adicionaUS$200/mês por banco. | Se fossem escolhidos250MB+ProdPack, só esses dois componentes seriamUS$210/mês ouUS$2520 em12meses, antes de réplicas, excedentes e impostos. Exemplo aritmético, não seleção nem base suficiente. Dimensionamento/throughput, disponibilidade, tráfego, armazenamento e região completa não aprovados. Não assumir que preço por comando zerado elimina outros custos. |
| R2 Standard | [preços atualizados01/10/2026](https://developers.cloudflare.com/r2/pricing/):US$0,015/GB-mês,US$4,50/milhãoClasseA,US$0,36/milhãoClasseB, com arredondamento para unidade de cobrança. | Não aplicar automaticamente preço de InfrequentAccess nem tratar transferência sem tarifa R2 como entrega pública sem custos. Operações, outras camadas e eventual DLS são separados. Volume/teto completo mensal e anual por plano continuam desconhecidos. |
| Bunny | [CDN](https://bunny.net/pricing) publica mínimoUS$1/mês e preços por zona/rede; [Stream](https://bunny.net/pricing/stream/) anuncia armazenamento a partir deUS$0,01/GB e entrega a partir deUS$0,005/GB. | Valores a partir de não são teto. Número/local das cópias, rede, tráfego, player, processamento e impostos precisam entrar no pior caso. O custo de duas cópias que o modelo atual considera não foi reduzido. Não assumir que selecionar UE elimina custo de réplica ou reserva. |

As páginas de preço sem data editorial visível foram consultadas em25/10/2026 Fortaleza. Não inventar data de reajuste nem usar a data de consulta como publicação. Região ou preço efetivo desconhecido reprova. Nenhuma nova taxa foi digitada em código: tarifas de recebimento continuam centralizadas em lib/receiving-costs.ts; custos fixos continuam no inventário canônico de275[FX1].

Incremento de operações produtivas deste documento por plano:0no mês e0no ano, pois não há novo código de execução. Isso não transforma custo total de CPU, CI, transferência, tributos ou operação em zero. CI/documentação pertencem integralmente ao Marktmorgen. Não foi calculada nem aprovada margem de60%, capacidade de clientes, base mínima ou economia faturada.

## Inventário do código lido

- lib/tax-gate.ts mantém EU_HOSTING_CONFIRMED=false. Os comentários históricos sobre ambos os produtos não foram alterados; cumprir o317não autoriza apagar nada da Hazelsong.
- vercel.json não declara região. A leitura autenticada resumida de get_project confirmou projeto/Next.js/Node24.x, mas não expõe região. Portanto, não inferir configuração efetiva pelo padrão da documentação ou pela ausência do campo no arquivo.
- lib/redis.ts usa URL/token REST por variáveis. Um endpoint configurado não demonstra sozinho primário, réplicas, backups ou residência completa.
- lib/vault.ts monta o endpoint padrão account.r2.cloudflarestorage.com com região de assinatura auto; essa configuração não oferece explicitamente endpoint de jurisdição eu. Nenhum bucket real foi inspecionado ou alterado. Antes de qualquer adaptação, preservar nomes de objetos, referências persistidas, URLs/direitos já emitidos, assinaturas e permissões.
- lib/stream.ts documenta duas cópias Frankfurt/NewYork para seu custo. Comentário de custo não prova a configuração efetiva; também não pode ser usado como autorização para reduzir reserva ou apagar uma cópia.
- docs/backup.md já existe e declara o BK273 incompleto/desligado. Reutilizar backup-codec e backup-roundtrip; teste limitado de codec não é backup integral, diário ou restauração operacional. O teto do codec não é licença para cortar direitos visíveis. A restauração documentada pela Upstash substitui dados no destino: ensaios somente em destino isolado com dados sintéticos, nunca sobre dados reais.

## Depende do dono

Estes são resultados para a decisão futura, não pedido de ação agora nem bloqueio da pesquisa autônoma.

1. O padrão global Vercel e a mera configuração regional de funções não comprovam a condição integral do dono. Preparar a alternativa desligada autorizada porSV4, preservando a operação atual e o caminho de volta.
2. R2jurisdiçãoeu e DLS são mecanismos distintos; falta preço/escopo completo para qualquer proposta Enterprise. Não contatar vendas, assinar ou contratar. A escolha final de fornecedor continua reservada ao dono.
3. Bunny tem opção oficial específica de roteamento UE que merece verificação completa antes de decidir mantê-lo ou substituí-lo. Conta, armazenamento, cópias, Stream/transcodificação/telemetria e custos ainda não estão aprovados.
4. Upstash tem seleção regional e modalidades fixas, mas configuração, backups, capacidade, SLA e custo completo ainda precisam de prova. Não escolher o menor pacote sem dimensionamento.
5. Seguem pendentes os demais serviços de317, a comparaçãoSV5 dos fornecedores de servidor, o calendárioSV3, o IaC/comando/ensaioSV4 e seus tempos/custos, cargaSV1(d), margens por cliente/plano/período/pagamento, roteiro exato dos painéis e corte/rollback. Não há fornecedor escolhido ou ativação no mesmo dia demonstrada.

O calendário de caixa não exclui INSS, Califórnia ou outro custo possível dos tetos de margem. A escolha só pode ser submetida com custo completo mensal/anual, maior preço aplicável, capacidade, tetos e reserva, mantendo100% dos fixos da LLC no Marktmorgen. PLANS_ON_SALE=false, EU_HOSTING_CONFIRMED=false, taxgate, art.9a, revisão comercial, preços, direitos, idiomas e identificadores permanecem intactos. Não é conclusão deEU1/SV nem entrega funcional.


## SV5 — comparação inicial dos seis fornecedores

Consulta em25/10/2026,22h37Fortaleza. Resultado parcial verificável, sem seleção nem aprovação financeira. Preços abaixo são componentes publicados, não custos completos nem capacidade medida. A comparação final depende de armazenamento de arquivos, backup independente, IPs, tráfego excedente/replicação, impostos, câmbio mais oneroso, reserva e carga de100%dos direitos. Desconhecido reprova. Nenhum custo do modelo foi reduzido.

| Fornecedor | Computação observada | Disponibilidade contratual observada | Pendência que impede escolha |
| --- | --- | --- | --- |
| Hetzner | CX33:4vCPU,8GB,80GBNVMe;€8,49/mês ou€0,0136/h,semIPv4/VAT;2instâncias:€16,98/mês,€203,76/12meses sócompute |99,9%mensal porinstância,crédito conforme termos | Catálogo mostra indisponível; disponibilidade real,backup independente,custo completo,cadastro e desempenho não confirmados |
| Netcup | VPS1000G12:4vCore,8GB,256GBNVMe;€0,017/h ou mensal starting€10,37incl19%VAT; mensal regular12meses difere da cobrança horária antecipada | VPS99,6%anual;Root99,9%anual | Não igualar preço starting ao teto horário; API de gestão/domínios não comprova compra automática deVPS;backup,cadastro,custo completo pendentes |
| DigitalOcean | BasicRegular4vCPU/8GiB/160GiBSSD/5000GiBtransfer:US$48/mês ou0,07143/h;2combackupdiário30%:US$124,80/mês,US$1497,60/12meses sócompute+backup | CPU Droplet99,99%mensal porinstância,comexclusões ecréditosfuturos | Custos restantes,região debackup,cadastro e desempenho pendentes;v5 não consta disponível emAMS3/FRA1 |
| Scaleway | STANDARD2-A2C-8G:2vCPU/8GB/400Mbps,€0,0586/h;€42,77/mês é aproximação730h;31dias744h=€43,5984 sócompute,semstorage/IPv4/impostos | PáginaSLA atual:STANDARD2/3 99,5%mensal;BASIC2/3 99%;DEV1/PLAY2/PRO2 eoutros semSLO | MarketingPRO299,99% diverge da tabelaSLA; resolver termos vigentes porSKU antes de afirmar qualidade; custo completo e carga pendentes |
| OVHcloud | Páginas anunciam gamaVPS2027 com preços starting e termos variáveis; preço completo atual não confirmado | PublicidadeVPS99,9%,termos completos a conferir | Backup diárioaté7dias,3réplicas no MESMOdatacenter excluindo discos extras; não substitui backup independente;SKU/contrato/API/horário/custo total pendentes |
| Contabo | Catálogos oficiais deCloudVPS eCore/Performance exibem gerações distintas; não consolidar preço entre elas | Texto de termos indexado efetivo fev2025:95%anual de conectividade física comexclusões; versão vigente a confirmar | Abertura direta dos termos retornou403; não contornado.1mês mínimo em documentaçãoCloudVPS não confirma ensaiohorário;região/custo debackup e qualidade pendentes |

Fontes de preços e modalidades:
- [Hetzner reajuste15jun2026](https://docs.hetzner.com/general/infrastructure-and-availability/price-adjustment/) (atualizado8jul2026) e [catálogoCX33](https://www.hetzner.com/cloud/cost-optimized/). A indisponibilidade exibida impede prometer compra imediata.
- [NetcupVPS](https://www.netcup.com/en/server/vps) e [API](https://helpcenter.netcup.com/en/wiki/general/our-api). A oferta especialOpenClaw€11,94mensais e0setup não foi adotada como teto regular. Datas editoriais dessas páginas não estabelecidas; consulta acima.
- [DigitalOcean preços](https://www.digitalocean.com/pricing/droplets), [disponibilidade verificada25ago2026](https://docs.digitalocean.com/products/droplets/details/availability/) e [backup](https://docs.digitalocean.com/products/backups/details/pricing/). CPUcompartilhada não equivale aCPUdedicada:CPUoptimized4vCPU/8GiB custaUS$84/mês;GeneralPurpose2vCPU/8GiB custaUS$63/mês,comdiscos distintos.
- [Scaleway preços](https://www.scaleway.com/en/pricing/virtual-instances/) e [reajustes1jun2026](https://www.scaleway.com/en/blog/a-transparent-update-on-scaleway-pricing/). Não converter aproximação mensal em teto.
- [OVHcloudVPS](https://www.ovhcloud.com/en-ie/vps/). Nome2027 não prova por si que oferta é futura; condições de contratação atuais permanecem desconhecidas.
- [ContaboCloudVPS,atualizadojun2026](https://docs.contabo.com/docs/products/cloud-vps/), [famíliasVPS](https://docs.contabo.com/docs/servers-hosting/vps/) e [AutoBackup](https://docs.contabo.com/docs/servers-hosting/vps-auto-backup/). Backup pagooff-server retém até10cópias/10dias; não prova datacenter independente ou localizaçãoUE específica. Resultadoscontabo.se não usados,pois afiliação oficial não estabelecida.

Fontes contratuais: [HetznerSLA16mar2026](https://docs.hetzner.com/general/company-and-policy/slas-cloud/), [NetcupAmsterdam](https://www.netcup.com/en/ueber-netcup/server-standorte/amsterdam), [DigitalOceanCPU-SLA3jun2025](https://www.digitalocean.com/sla/cpu-droplets), [ScalewaySLA](https://www.scaleway.com/en/virtual-instances/sla/) e [Contabo termos](https://contabo.com/en/legal/terms-and-conditions/). Janela anual não é diretamente equivalente à mensal;SLA não certifica disponibilidade real nem a aplicação.

### Backup, caixa e automação: diferenças que afetamSV3/SV4

[Hetznerbackup,atualizado3set2026](https://docs.hetzner.com/cloud/servers/backups-snapshots/overview/) não inclui volumes anexados; são7slotsdiários. A [FAQ de cobrança](https://docs.hetzner.com/cloud/billing/faq/) define backup20%do servidor eIPs cobrados separadamente inclusive desassociados. [IPv4](https://docs.hetzner.com/general/infrastructure-and-availability/ipv4-pricing/),atualizado13abr2023,publica€0,50/mês porPrimaryIPv4 e€3porFloatingIPv4,semVAT. Nenhuma restauração destrutiva foi feita.

[PagamentoHetzner,atualizado28jul2026](https://docs.hetzner.com/general/billing-and-account-management/billing-at-hetzner/payment-overview/) depende do país:cartão/SEPAEUR automáticos;transferência/PayPal manuais. Cobrança retroativa não adia o início do custo do recurso. Cadastro pode exigir verificação/adiantamento; nenhuma conta foi criada. Elegibilidade específica pessoa física brasileira/LLC americana permanece não comprovada.

[DigitalOceanpagamentos](https://docs.digitalocean.com/platform/billing/manage-payment-methods/) pode exigir autorizaçãoPayPalUS$5; não executada. [VPC](https://docs.digitalocean.com/products/networking/vpc/details/pricing/) entre datacenters custaUS$0,01/GiB;franquiaDroplet não cobreNAT. Não zerar replicação/backup/tráfego da reserva.

Referências públicas deAPI localizadas: [HetznerCloud](https://docs.hetzner.cloud/reference/cloud), [DigitalOceanDroplets](https://docs.digitalocean.com/products/droplets/reference/api/droplets/) e [Scalewaycriação](https://www.scaleway.com/en/docs/instances/how-to/create-an-instance/). Parâmetros,limites,idempotência e provisão completa sem passos adicionais continuam por verificar; nenhuma chamada autenticada ou criação real foi feita. Nenhum script deSV4 é declarado pronto.

### Histórico público: evidência parcial, sem ranking

[Hetzner14out2026](https://status.hetzner.com/incident/23397b40-e121-48d7-9c4e-0a6b4dcc4307) registra ataque e indisponibilidade parcial deAPIs/Console12:58–14:25UTC.87min é duração do evento decontrole, não queda universal de todas as instâncias. Importa ao provisionamento e recuperação. [FalhaNBG1 em1out](https://status.hetzner.com/incident/64a888c8-1e30-4a0f-8938-ce79b89dee83) requer escopo/duração completos. [DigitalOceanstatus](https://status.digitalocean.com/) operacional agora não prova histórico sem incidentes; incidenteAppPlatform de implantação não equivale a indisponibilidadeDroplet.

Ainda falta janela comparável porproduto/região para os seisfornecedores,contagem completa,causas,duração e impacto efetivo. Ausência de resultados de busca nunca é disponibilidade100%. Não se escolheu fornecedor porpreço,SLApublicitário oucontagembruta.

### Estado exato

SV5(a) em pesquisa;SV5(b)–(d),SV1(b)–(e),SV3calendário eSV4infraestrutura/ensaio completo continuam pendentes. Não há carga sintética medida,teto porloja,reserva/custo total porplano,margem60%ou base mínima certificada. Decisão final de fornecedor continua emDepende do dono quando comparação estiver completa; nenhuma ação do dono é necessária agora. Nenhuma conta,contrato,pagamento,DNS,migração ou gate foi alterado.


## SV4 — contrato sintético HTTP para Redis real

Em construção, desligado deprodução. `scripts/test_self_hosted_redis_http.py` executa uma fixtureHTTP somente em127.0.0.1 com portaefêmera eRedis descartável16379 já existente noCI. Token gerado em memória; nenhum endereço/segredo do ambiente deprodução é lido. Não é proxy operacional nem novo banco deprodução.

O ensaio verifica rejeição anterior àmutação para autenticação/rota/comandos/corpo inválidos; respostas ordenadasUTF-8/null/erroporcomando;TTL persistente/expirável;64concorrentes pelaLua real de reserva integral do contrato; e resposta perdida apósINCR aplicado semreconexão/replay/liberação de dinheiro. Pipeline continua sendo nãoatômico; não foi convertido emMULTI. Somente chaves sintéticas deUUID são removidas ao final.

Limites1MiB/128comandos são dafixture e não mudam direitos/limites dos planos. Sem fornecedor,dependência externa,credencialconta,DNS ou recurso real. Acrescentado ao jobRedis existente,sem nova matriz,sem ampliar timeout,sem reduzir testes anteriores. Execução remota integral do novohead ainda pendente. Custo operacional novo porplano0/mês e0/ano por serfixture nãoimportada peloapp; custo total deCI,allocaçãoN,reserva e impacto da infraestrutura real permanecem não certificados,sem redução de teto.

Não verifica clienteTypeScript de ponta a ponta,criação decontêineres,site,replicação,backup/restauração,domínio deteste,rollback completo,tempo total ou capacidade100%dos direitos. SV4 completo continua pendente. Adaptadores externos pesquisados não foram adotados por publicidade decompatibilidade.

### SV4: cliente HTTP real no ensaio sintético de Redis (em verificação)

O ensaio do PR1043 agora também executa o próprio `lib/redis.ts` e o próprio
`lib/fetch-timeout.ts` em Node24, sem copiar o cliente, trocar Redis por memória
ou acrescentar dependência. O único alias de importação é resolvido pelo mecanismo
nativo [module.registerHooks do Node24](https://github.com/nodejs/node/blob/v24.0.0/doc/api/module.md).
A etapa usa o setup-node24/npm ci já existente no mesmo job, deslocando o ensaio
para depois dele; não adiciona job, matriz, instalação ou teto de execução.

O subprocesso recebe somente PATH e identificadores sintéticos do fixture efêmero
em127.0.0.1, nunca credenciais de provedor. O transporte nativo continua real;
o envoltório de teste restringe origem/rota e injeta perda de ACK uma vez. Os
cenários verificam configuração ausente/401 sem mutação, Unicode/null/ordem, TTL
persistente e com vencimento, erro parcial sem reenviar, mutação com ACK perdido
sem replay automático, cutoff vencido antes do envio e aliases KV existentes.
O coordenador remove somente chaves com UUID deste ensaio, inclusive após falha.

Este incremento exige toda a verificação do novo head; escrever o teste não é
evidência de aprovação. Continua sendo pré-requisito parcial de SV4: não fornece
proxy de produção, backup/restore binário, replicação, failover, contêineres da
troca integral, capacidade por plano, escolha de fornecedor ou migração pronta.
Nenhum serviço real, conta, segredo, DNS, direito comercial ou gate é alterado.
Custo operacional novo por plano: zero neste teste isolado; custo incremental
real de CI ainda desconhecido, não tratado como zero nem usado para reduzir
tetos/reserva de275[FX1]. Sem incremento do contador funcional.

Correção de verificação do primeiro head647536c1883cd1d0c968c6280ebe03191390a69a:
o job Redis121372336063 falhou em26/10/2026 02:46:40UTC (25/10 23:46:40Fortaleza),
antes de executar o cliente Node, porque urllib ainda enviava o corpo excedente
quando o fixture corretamente recusava Content-Length com413 e fechava a conexão.
O ensaio agora envia somente o cabeçalho que excede o teto e exige413 e o erro
JSON exato antes de enviar corpo. Não captura/ignora BrokenPipe, não aumenta
limites e mantém a conferência de nenhuma mutação. A falha anterior é preservada;
somente CI completo no novo head pode aprovar este incremento.

### SV4: restauração binária com codec existente e Redis descartável (em verificação)

O próximo ensaio usa o próprio `lib/backup-codec.ts`, mantendo seu envelope
AES256GCM/gzip e seus limites, com DUMP real de strings binárias, hash de reserva
sintético, lista, conjunto, conjunto ordenado e chave com vencimento. Captura
DUMP/PEXPIRETIME/relógio em uma única operação Lua para seis chaves UUID explícitas;
não enumera nem exporta dados reais. Bancos14/15 do Redis descartável de CI separam
origem e destino com as mesmas identidades, sem FLUSH, sem REPLACE e com limpeza
apenas das chaves deste ensaio. A adaptação RESP binária é transporte de teste,
sem reconexão/reenvio nem uso no cliente de produção.

Fontes primárias consultadas26/10/2026,00:16Fortaleza:
[Redis DUMP](https://github.com/redis/redis-doc/blob/master/commands/dump.md),
[RESTORE](https://github.com/redis/redis-doc/blob/master/commands/restore.md) e
[PEXPIRETIME](https://github.com/redis/redis-doc/blob/master/commands/pexpiretime.md).
DUMP não guarda TTL; RESTORE ABSTTL conserva o vencimento absoluto e recusa destino
ocupado sem REPLACE. O checksum RDB e a autenticação do envelope são controles
distintos, ambos exercitados. Data é de consulta, não publicação editorial.

O subprocesso Node24 recebe somente PATH, autorização explícita do ensaio e
snapshot sintético em stdin; a chave aleatória de criptografia vive apenas na
memória e não é retornada. Verifica roundtrip, nonces distintos, chave errada,
adulteração, truncamento, relógio anterior e registros expirados. Redis recebe
bytes opacos autenticados; asserções comparam cada tipo/conteúdo e vencimento,
a recusa de sobrescrita e checksum inválido, e a reserva/fonte intactas.

Etapa no mesmo job/setupNode/Redis já existente, sem dependências, jobs, matrizes
ou timeout novo. Aprovação depende de CI completo no novo head. Não certifica
backup operacional, armazenamento/offsite/contas independentes, consistência de
toda a base, todas as capacidades/direitos, segredos, agendamento, failover ou
troca integral em contêineres; nenhuma migração é autorizada por esse ensaio.
Custo real incremental de CI ainda desconhecido e permanece pendente em275[FX1],
sem redução de tetos ou reserva. Nenhuma operação paga ou novo custo de fornecedor
por plano é iniciado. Documento/ensaio não incrementam contador funcional.


### SV4: dois servidores Redis, cópia autenticada e retorno por DNS privado (26/10/2026)

Estado: implementação do ensaio; aprovação e durações medidas dependem do CI completo
do novo head. Pré-requisito parcial, sem declaração de SV4 concluído. A revisão de
AB(a) continua em sua branch independente conforme autorização do dono.

No job público padrão já existente, a etapa executa
`python3 scripts/test_self_hosted_redis_migration.py`. O programa recusa qualquer
contexto que não seja GitHub Actions/Linux/repositório canônico e autorização
explícita da etapa pública. Não existe modo de produção ou comando de migração
do cliente. Nenhum teste local foi executado.

O ensaio cria duas instâncias Redis7.4 e duas redes internas com UUID e rótulo de
propriedade, usando somente a imagem já presente no job e --pull=never. Nenhuma porta de
host é publicada: o controle usa o IP privado do contêiner, conferido no subnet
da rede interna com rótulo próprio; o consumidor
descartável usa apenas a rede privada, nome marktmorgen.test e ACL de leitura.
Contêineres não rodam como root, não têm capabilities e possuem limites de
memória/CPU, raiz somente leitura e dados/configuração em tmpfs. Senhas aleatórias
são transmitidas por stdin, não por argumentos, logs, artefatos ou metadados Docker.
O cliente Docker aponta explicitamente para o socket local com HOME temporário
vazio; contextos e credenciais externos não são herdados.

Etapas verificáveis:

1. Iniciar origem/destino e comprovar que o nome privado aponta à origem.
2. Gravar seis chaves sintéticas UUID: bytes/Unicode, reserva e obrigação de caixa,
   lista, conjunto, conjunto ordenado e vencimento absoluto. A chave de identidade
   de cada servidor é metadado do ensaio e fica fora das seis chaves copiadas.
3. Capturar DUMP/PEXPIRETIME/TIME atomicamente e autenticar o snapshot no codec real
   AES-GCM/gzip já usado pela aplicação, com os testes existentes de adulteração.
4. Copiar só cinco chaves e exigir reprovação antes de qualquer troca de DNS;
   apagar somente as seis chaves conhecidas do destino e restaurar o conjunto todo.
5. Comparar os dumps, tipos, conteúdo binário/Unicode, reserva100, ausência de TTL
   da reserva e prazo absoluto idêntico; não usar FLUSH, REPLACE ou enumeração real.
6. Desconectar a origem da rede do consumidor e conectar o destino ao mesmo alias.
   Consumidores novos devem ler identidade do destino e reserva100; INCR deve ser
   negado pela ACL tanto antes quanto depois da troca.
7. Parar o destino, exigir falha de leitura, devolver o alias à origem e confirmar
   identidade, reserva e todos os dumps originais intactos.
8. Remover apenas contêineres/redes UUID após verificar seus rótulos de propriedade,
   inclusive no caminho de falha. Inventário indisponível não prova ausência.

O programa emite `SV4_REDIS_MIGRATION_TIMINGS:` com segundos realmente medidos
por fase e total, somente depois das asserções e limpeza bem-sucedidas. Nesta
revisão os valores ainda estão pendentes: não são estimativas nem tempos de
migração de produção. Alarme de120s para o ensaio, até50s de operações de limpeza
(dez comandos de até5s), asserção de total≤180s e etapa de4min dentro do job
existente de12min; nenhum timeout do job ou matriz foi aumentado.

Fontes oficiais, consultadas26/10/2026 (data de consulta):
[GitHub Actions billing](https://docs.github.com/en/billing/concepts/product-billing/github-actions),
[standard runner selection](https://docs.github.com/en/actions/how-tos/write-workflows/choose-where-workflows-run/choose-the-runner-for-a-job)
e [Docker user-defined bridges](https://docs.docker.com/engine/network/drivers/bridge/).
GitHub documenta gratuidade de runners padrão para repositórios públicos, incluindo
ubuntu-latest; logs e resumos de jobs não contam armazenamento de artefatos. Runners
maiores continuam pagos. A API confirmou este repositório público nesta data.
Docker documenta resolução por nomes/aliases e conexão/desconexão de bridges em
execução. Isso fundamenta apenas o DNS privado deste ensaio.

Custo incremental desta etapa, condicionado ao runner público padrão já verificado,
sem novo cache, artefato, imagem, pull, conta ou fornecedor:

| Contrato preservado | Incremento mensal | Incremento anual |
| --- | --- | --- |
| Store69/mês | US$0 | US$0 |
| Store690/ano | US$0 | US$0 |
| Studio449/mês | US$0 | US$0 |
| Studio4490/ano | US$0 | US$0 |
| Scale999/mês | US$0 | US$0 |
| Scale9990/ano | US$0 | US$0 |

Custo fixo incremental deste ensaio para Marktmorgen: US$0/mês e US$0/ano;
reserva incremental0 apenas nesse escopo comprovado, com os tetos de tempo acima.
Nenhum preço cobrado foi alterado; maior preço pago continua o contrato original
correspondente. A etapa é omitida fora da condição pública conhecida e o script
recusa ausência de autorização; isso não conta como teste aprovado. Mudar para
runner pago/privado, armazenamento ou serviço novo exige novo cálculo e reserva
antes de operar. Os demais custos de CI/cache, hospedagem real, toda a LLC(FX275),
impostos, capacidade e direitos de cada plano continuam sujeitos às provas
anteriores; desconhecido reprova e nunca vira zero. A tabela não certifica margem
de60% nem retroage para aprovar custos históricos.

Não exercita a aplicação inteira, gravações concorrentes, drenagem/replay de
escritas, caches de clientes persistentes, topologia entre hosts, TLS/DNS de
fornecedor, carga por plano ou armazenamento operacional de backups. Não escolhe
fornecedor, não cria recursos externos, não muda domínio real, EU hosting flag,
PLANS_ON_SALE, preços/limites/comissão ou gates fiscais/comerciais. Todas essas
lacunas, SV5 e a publicação dependente do dono permanecem registradas.

Correção do primeiro headc67e7200a868e2e3c56274f631164ee9d0482eb0:
o job121752784855 falhou26/10/2026 às18:03:22.631UTC antes da cópia porque
Docker não publicou6379 na bridge interna, e a leitura desse mapeamento falhou.
Agora não solicita porta publicada: valida ausência de PortBindings e usa somente
o IPv4 privado confirmado no subnet da rede interna com rótulo do UUID. Não
abre bridge com egress nem afrouxa a checagem de propriedade. A falha permanece
registrada; somente o CI completo do novo head poderá aprovar o ensaio.


### Resultado medido do ensaio em contêineres — PR#1071

Head0c49d1c816e60b835ba2f7cef238992450a29a1e, jobRedis121754372959,
execução26/10/2026 às15:06:45.1379127Fortaleza(18:06:45.1379127UTC).
O log emitiu PASS somente após cópia real, troca do alias, falha do destino,
retorno à origem e limpeza dos recursos com rótulos conferidos.

| Fase | Segundos medidos |
| --- | --- |
| boot_two_servers_and_private_dns | 5.199005 |
| capture_real_binary_snapshot | 0.000516 |
| cleanup_owned_resources | 0.235496 |
| destination_failure_and_private_dns_rollback | 20.623908 |
| encrypt_authenticate_and_decode_actual_codec | 0.057417 |
| partial_copy_refuses_before_cutover | 0.160635 |
| restore_complete_second_server | 0.000227 |
| seed_synthetic_source | 0.27854 |
| switch_private_test_domain_and_read_destination | 0.47964 |
| total | 27.035956 |
| total_before_cleanup | 26.800437 |
| validate_types_binary_cash_and_absolute_expiry | 0.000271 |

Total27.035956s, dentro dos tetos originais. Trata-se desta execução sintética
no runner, não prazo prometido de migração real. Nenhum dado de cliente, host
externo, pull ou artefato; seis chaves copiadas, consumidor novo somente leitura.
Persistem todas as lacunas de aplicação inteira, escritas ao vivo, clientes
persistentes, topologia entre hosts, TLS/DNS de fornecedor, capacidade e custos.

Novo head aprovado por31/31checks e Vercel;8 classificadores10+7/full=true.
Verify121754373059: Everything18:09:40.9103029UTC, agreements18:11:09.9597840UTC,
store-copy18:23:54.9239972UTC. Mobile: home64/64/64ms, pricing40/40/32ms,
sales48/40/32ms; LCP628–728ms, CLS0, ciclo/teclado/details preservados.
Incorporado15:33:16Fortaleza(18:33:16UTC), merge
c19fae799a24643f9d10ab49d6fca2b29f856f7d, árvore
fbfe47b217d5856defcc8dcf58cdb9321e7d166c e pais conferidos.
A falha inicial permanece acima; não houve rerun isolado para declarar conclusão.
Este resultado conclui o ensaio restrito, não SV4 completo, hospedagem UE ou
entrega funcional255. Gates e contador254 mantidos.



### SV4 — falhas de destino antes da troca (26/10/2026, em verificação)

O mesmo ensaio real com dois Redis agora também injeta três falhas antes da
troca: chave já existente (RESTORE deve recusar BUSYKEY sem sobrescrever),
checksum DUMP adulterado depois do decode autenticado (Redis deve recusar sem
criar chave), e caixa alterado100→99 no destino completo (validação deve recusar).
Cada recusa confirma alias ainda na origem, snapshot binário integral da origem
inalterado e reserva100. A reparação ocorre só no destino sintético do UUID,
sem REPLACE/FLUSH nem acesso externo. Depois executa novamente validação completa,
troca, falha e retorno existentes. Não simula sucesso nem usa parser falso.

Mesmas seis chaves, dois servidores/cliente transitório, imagem já disponível,
job existente e tetos120s/50s/180s/4min/12min; sem novo job/matriz/pull/artefato/cache.
Incremento faturado do runner padrão público continua0mensal/0anual por contrato
nos seis contratos e fixo0, condicionado às mesmas verificações de repositório
público/runner padrão documentadas acima em26/10. Reserva adicional desse estágio0;
não declara CI inteiro, infraestrutura, LLC ou tributos gratuitos.
Custos operacionais e capacidade/retensão/BR-US+ISS5% desconhecidos reprovados.

Tempos das novas fases e suíte remota completa no novohead ainda pendentes;
não reutilizar27.035956s como medida deste incremento. Fonte antiga e falha inicial
preservadas. Continua pré-requisito parcial SV4, sem migração real/topologia/TLS/
capacidade certificada. AB(a) segue prioritário na branch própria em CI;
coveragefalse/políticasNULL/PLANS_ON_SALE=false econtador254 preservados.



### AB(a)/SV4 — incorporações e publicações verificadas, PR1077 e1078

PR1077 head6b7bc93d3707674cd7a6b33777aca1b0a636c9d7 aprovado31/31checks+Vercel,
8scope10+7/fulltrue. Merge74ce5faffe35a4c87bcfc7beabc06f271deb655d em26/10/2026
18:43:53Fortaleza(21:43:53UTC),árvore7701bcbc080c76d4a7b262f0dc2a2b47d43bf548
e pais[8302551,6b7bc93] conferidos. Falha inicial do VoiceOver preservada acima;
nenhum rerun isolado. Verify121853926486:477checks21:21:50.3933934UTC;
4novos casos origem21:22:18.747UTC;Everything21:23:24.6151385UTC,
agreements21:25:32.4700548UTC,store-copy21:40:51.6624796UTC.
Redis12185392619664/22casos21:17:59.562UTC. Voz real VoiceOver121853553323
21:25:12.8967880UTC e NVDA12185355339721:20:31.0365272UTC:2estados,0writes/foreign.
Preflight VoiceOver observou0processos antigos nesta execução; testes sintéticos
exercitam TERM/KILL e recusas, não alegar que o caso preso real foi reproduzido.
Mobilehome112/96/88ms,pricing48/56/32,sales56/40/48,LCP644–948ms,CLS0;
limites originais preservados.
Produção dpl_9eESTo7WPf5SFKcuQUqqNxncPHEL READY18:45:21.666Fortaleza
(21:45:21.666UTC),SHA74ce5fa e marktmorgen.com exatos;
5rotas /,/platform,/pricing,/mission,/library200comIDexato.
Error/fatal21:45:21.666→21:46:51.523UTC semregistros, somente essa janela.
Origem parada integrada ainda termina antes de preço/POST: cobertura e políticas
fechadas, AB(a) inteiro não concluído. Não autoriza cobrança ou limpeza.

PR1078 head40e80aa5c2de033d49c651f9d4a5a15e4d88b5a8 aprovado31/31checks+Vercel,
8scope10+7/fulltrue. Merge375052e8885109a95984f72f21ef1b856b3dcebb em26/10/2026
18:53:59Fortaleza(21:53:59UTC),árvoredd034e9cea51903fcf8241f3d32cfe0c9e2ba305
e pais[74ce5fa,40e80aa]conferidos. TestmergeGitHub6b3bedcached tinha pais830/40;
prova RESTcompare74...40 confirmou mergebase6b7 e maintree7701=basetree6b7,
somente2arquivos SV4 diferentes; resultado determinístico dd034, depois árvore/
pais reais conferidos. Não apresentar testmergecached como pais atualizados.
Verify121854772935:477checks21:23:12.6701974UTC,Everything21:24:32.4025789UTC,
agreements21:26:23.2154670UTC,store-copy21:39:13.1441772UTC.
Mobilehome112/64/56ms,pricing40/64/40,sales40/40/40,LCP640–1072,CLS0;
dois leitores reais aprovados. Redis12185477297921:21:32.9411788UTC:
ensaio24.891503s; destino ocupado recusa0.183491s,checksum0.176295s,
caixa alterado0.203393s, falha/retorno20.723790s,limpeza0.282140s.
Seis dados binários/caixa100/prazos preservados; sem sobrescrever destino ocupado,
sem hostexterno/pull/dadosreais. Tempos específicos deste head, não reutilizados.
Produção dpl_CFp57nnfPQLRbunEzTcUmESp38Zr READY18:54:51.319Fortaleza
(21:54:51.319UTC),SHA375052e e marktmorgen.com exatos;
5rotas200comIDexato. Error/fatal21:54:51.319→21:55:19.432UTC sem registros;
janela curta, não garantia de ausência de erros.

Custos: mesmos jobs/matrizes/tetos; nenhum serviço/artefato/cache/pull novo.
Incremento faturado do ensaio público padrão0mensal/0anual por seis contratos
e fixo0 no escopo condicional já comprovado; demais infraestrutura/retenção/
capacidade/LLC/BR-US+ISS5% continuam desconhecidos/reprovados,nãozero.
SV4 parcial, nenhuma migração real. AB(a) segue preço exato/submissão única
durável/ID/recuperação somente leitura/ativação/ACKstore/CAScleanup-undo/rollover/
custeio completo. PLANS_ON_SALE=false,preços/limites/permissões/AP449–455/AN456/
361–362 e contador254preservados; nenhum desses incrementos é entrega funcional255.
