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
