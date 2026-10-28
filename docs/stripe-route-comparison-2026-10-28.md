# 495 [SR6] — Brasil (CPF) ou LLC: decisão antes de contratar

> **Decisão posterior [SD1],28/10/2026 18h41Fortaleza:** o dono escolheu aLLC deDelaware e contaStripe americana em nome dela, contrariando a recomendação brasileira abaixo. Em495, “Depende do dono” está resolvido. A quantificação restante será exclusivamenteLLC em275FX1; não quantificar a rota brasileira. O conteúdo abaixo fica preservado como estudo/histórico, sem autorizar abertura ou contratação. Novo primeiro passoAV1:470SR4, roteiro documental das ações exclusivas do dono. Ver docs/codex-queue.md,SD1.
Data de corte: 28/10/2026. Estudo solicitado pelo dono; política TX vigente e prioridade AV1. Base técnica: main 962faa93378f8f06e9bbbb9e72eb4c15f8adf262. Sem alteração de conta, termos, cálculo fiscal, elegibilidade ou trava.

## Resultado e recomendação única
**Recomendar a rota brasileira já ativada para a primeira abertura, condicionada à escolha expressa do dono e à conclusão dos gates AV.** A recomendação reduz dependências de implantação: a rota LLC ainda exige endereço comercial real aceito, banco americano no nome exato da empresa e constituição/EIN. Não significa que a rota brasileira já seja financeiramente aprovada, mais barata em todos os volumes ou disponível para vender hoje.

Não há base documental para publicar lucro líquido mensal ou uma base mínima finita em nenhuma das rotas. Os tetos completos de FX275, custos variáveis a100% dos direitos, exposições financiadas e fatos tributários não estão fechados. Os resultados abaixo são **indeterminados/reprovados**, não zero. Este documento entrega a comparação e delimita a decisão; **495 não está integralmente concluído**, pois falta a quantificação validada exigida pelo pedido. Nenhuma contratação LLC é proposta como requisito para continuar os outros trabalhos AV.

## Premissas idênticas e método
Preços preservados em USD: planos69/690,449/4490,999/9990; assistente69 por700respostas. Comissão considerada zero para sustentar assinaturas. Direitos e complementos usados100%, no pior mês, sem quota grátis tratada como custo zero. Fixos e resíduos da Hazelsong100%Marktmorgen, sem apagar conteúdo. Mesma base/mix de clientes, países, conversão, cadência e uso nos dois caminhos; não inventar crescimento ou uma cotação cambial estável por48meses.

Para cada mês m e rota r:
- Receita reconhecida R(m): mensalidades mais1/12 das anuidades vigentes, separando dinheiro recebido de receita. Tributos de consumo recolhidos por conta de terceiros exigem enquadramento contábil; não assumir que são receita própria nem dedução automática.
- Custos V(r,m): uso integral, maior taxa de recebimento entre o modelo vinculante e a tarifa aplicável, conversão/remessa, reservas de reembolso/contestação e exposição financiada. Taxa fixa em BRL exige teto cambial antes de converter em USD.
- Fixos F(r,m):100% custos completos, obrigações aplicáveis, domínios, infraestrutura, acessibilidade e preservação; custos anuais exigem reserva anterior ao vencimento. Constituição inicial aparece também no fluxo de caixa do mês1, não escondida pela amortização.
- Lucro líquido L(r,m)=R(m)-V(r,m)-F(r,m)-tributos legalmente incidentes sobre suas respectivas bases. IRPF progressivo não é uma taxa fixa sobre a receita nem a soma indiscriminada de países.
- Base mínima: menor vetor inteiro de clientes por plano/cadência que cobre fixos e exposições, depois dos tributos, **somente se cada unidade isolada é positiva com a folga existente**. Nenhuma quantidade corrige uma unidade deficitária. Meta60% é relatório mensal real, não piso comercial.

| Mês | CPF: líquido mensal | LLC: líquido mensal | Base mínima de cada rota |
| --- | --- | --- | --- |
|1|Indeterminado: faltam V/F/tributos/fatos/câmbio|Indeterminado, incluindo desembolso inicial e reservas|Não estabelecida; reprova|
|6|Indeterminado pelas mesmas lacunas|Indeterminado; não presumir custos iniciais repetidos|Não estabelecida; reprova|
|12|Indeterminado; separar anual recebido de receita|Indeterminado; provisionar obrigações anuais aplicáveis|Não estabelecida; reprova|
|24|Indeterminado; preços de fornecedor precisam teto vigente|Indeterminado; renovação RA/endereço/banco sem teto completo|Não estabelecida; reprova|
|48|Indeterminado; não congelar legislação/câmbio por4anos|Indeterminado; sem projeção fictícia de benefícios fiscais|Não estabelecida; reprova|

A matriz não é simulação numérica aprovada. Publicar números finitos agora preencheria entradas desconhecidas com suposições, contrariando MR/TX/FX275. Deve ser recalculada com entradas documentadas e testes sintéticos antes da conclusão de495.

## Rota CPF brasileira
A ativação existente é informação do dono. SR5 registra a resposta do Stripe conferida pelo Claude: plataforma BR pode conectar criadores US/CA/UK/EEE excetoIslândia por cobranças diretas sem taxa de aplicação. Não se estende a destination charges, separate charges/transfers ou aprovação de qualquer conta. Cobrança da assinatura é distinta da cobrança do comprador ao criador.

**Recebimento:** [Stripe Brasil, preços](https://stripe.com/br/pricing), conferido28/10: cartão3,99%+R$0,39 e adicional2% para cartão internacional, portanto5,99%+R$0,39 antes dos demais produtos aplicáveis; Billing0,7% quando aplicável. DisputaR$55 e contestação manualR$55: eventual devolução por vitória não elimina reserva no pior caso. Quem paga StripeTax em direct charges Standard continua sem resposta comprovada; preservar tratamento vinculante mais caro de lib/receiving-costs.ts. Não substituir o modelo por5,99% isolado.

**Moedas e prazo:** [currencies](https://docs.stripe.com/currencies), [settlement](https://docs.stripe.com/payments/currencies/settlement-payouts) e [payouts](https://docs.stripe.com/payouts), conferidos28/10. A lista global de135moedas não prova disponibilidade específica da conta BR. A leitura pública obtida não resolveu a tabela por país nem as moedas habilitadas dessa conta: **USD de apresentação e liquidação BRL não estão certificados neste estudo**. Conta de recebimento precisa corresponder à moeda suportada. A documentação de prazos distingue cartões internacionais no Brasil de cartões locais; prazo de saque não é data da primeira venda. Confirmar moeda suportada é pendência de evidência, sem ler segredos ou criar operação.

**IRPF:** [tabela Receita2026](https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/tabelas/2026) e [deduções carnê-leão](https://www.gov.br/receitafederal/pt-br/assuntos/meu-imposto-de-renda/pagamento/carne-leao/deducoes), conferidas28/10. Tabela mensal progressiva0–27,5%, com deduções e redução2026 condicionadas ao rendimento tributável; rendimentos totais e ajuste anual importam. Livro-caixa só admite despesas elegíveis/documentadas nos limites legais: não declarar que toda despesa SaaS reduz automaticamente a base. Recebimento do exterior exige regra fiscal de conversão própria, distinta do teto cambial prudencial de custos. Fatos do trabalho autônomo, titularidade e demais rendimentos ainda impedem cálculo individual fechado.

**INSS:** [tabela oficial2026](https://www.gov.br/inss/pt-br/direitos-e-deveres/inscricao-e-contribuicao/tabela-de-contribuicao-mensal), conferida28/10: contribuinte individual20% sobre salário de contribuição, limitesR$1.621–R$8.475,55, contribuiçãoR$324,20–R$1.695,11 quando esse enquadramento se aplica. Não tratar o teto como débito inevitável nem adotar plano11% sem condições. Enquadramento/remuneração precisam refletir os fatos.

**ISS:** [LC116 texto atualizado, Câmara](https://www2.camara.leg.br/legin/fed/leicom/2003/leicomplementar-116-31-julho-2003-492028-normaatualizada-pl.html), arts2I/parágrafoúnico,3–5, conferidos28/10. Exportação tem não incidência, mas pagamento estrangeiro sozinho não prova resultado no exterior. Domicílio/estabelecimento e execução real importam. Valor municipal2026 e enquadramento autônomo não comprovados: não presumir ISS5% certo nem zero universal.

**IOF/câmbio:** [PGFN, questões sobre IOF](https://www.gov.br/pgfn/pt-br/cidadania-tributaria/por-assunto/outros-tributos-em-especie-1/iof-2/outras-questoes-sobre-iof), [Siscomex, incentivos exportação](https://www.gov.br/siscomex/pt-br/servicos/aprendendo-a-exportar/5-formacao-do-preco-de-exportacao/incentivos-as-exportacoes-brasileiras-1). Orientação sobre câmbio de exportação não torna distribuição de lucro LLC uma exportação. Natureza/data da operação e legislação cambial aplicável precisam ser compatíveis; preservar a divergência TX sobre base entrada versus lucro, sem somar alíquotas incompatíveis.

**Termos:** operador atual permanece a pessoa física indicada nos termos. A rota CPF não autoriza trocar operador paraLLC; a rotaLLC exigiria revisão de identidade, contratos, privacidade, faturamento e obrigações dos clientes antes da troca. Nenhuma edição de termos feita aqui.

## Rota DelawareLLC
SR5 substitui as exigências históricas de ITIN obrigatório e representante residenteUS: o dono pode representar morando no Brasil, mas há verificação individual. Endereço comercial realUS e bancoUS no nome exatoLLC continuam necessários; registered agent não prova endereço operacional e escritório virtual não tem aceitação garantida. Nenhum fornecedor/endereço foi aprovado.

[Atlas, signup](https://docs.stripe.com/atlas/signup), conferido28/10: semSSN, EIN normalmente10–35dias úteis **após incorporação**, além de prazos de endereço/banco/verificação/gates. Não equivale a data prometida de venda ou aprovaçãoConnect. AtlasUS$500 inicial/RAprimeiroano e renovaçãoRAUS$100 são observações públicas registradas em docs/llc-fixed-costs-2026-10-22.md, não teto total contratado.

[Delaware, annualtax](https://corp.delaware.gov/alt-entitytaxinstructions/), conferido28/10: LLCUS$400/ano, vencimento1junho, sem relatório anual de franchise taxLLC. Reserva mensal equivalenteUS$33,34 isoladamente não cobre o conjuntoFX275. Endereço, banco, câmbio, declarações, infraestrutura e resíduos ainda sem teto completo/reserva revisada. Ofertas promocionais não são maior preço pago garantido.

**Brasil:** políticaTX exige confirmar enquadramento em Lei14.754art5 antes de aplicar15% ao lucro anual. A coleção oficial [NormasRFB](https://normas.receita.fazenda.gov.br/sijut2consulta/consulta.action) indexa Cosit56de9/4/2026, publicada15/4: LLC transparente composta por não residentesUS como regime fiscal privilegiado, IN1037art2**VII**, divergente do incisoIV do pedido histórico. Ementa indexada não substitui conferência integral do ato, classificação da empresa e cálculo do lucro. Não acumular15% e27,5% sobre o mesmo lucro sem fundamento, nem assumirINSS/ISS/IOFzerados por haverLLC.

**EUA:** [IRS instruções5472](https://www.irs.gov/instructions/i5472), conferidas28/10: entidadeUS desconsiderada de proprietário estrangeiro pode ter5472 com1120proforma conforme operações reportáveis; penalidadeUS$25mil é risco de descumprimento, não despesa ordinária inevitável. Nenhuma declaração preparada/enviada. Fonte de renda, estabelecimento, atividade, nexo estadual e obrigações brasileiras precisam enquadramento real; não certificar impostoUS0% em todos os estados apenas por vendas abaixo de um limiar.


### Lei14.754: mecanismo conferido no texto atualizado

Em28/10foi lido o [texto oficial atualizado da Câmara](https://www2.camara.leg.br/legin/fed/lei/2023/lei-14754-12-dezembro-2023-795058-normaatualizada-pl.pdf), arts2§1 e5§§1,5,10–15. O regime prevê15% no ajuste anual; controle e regime privilegiado são hipóteses legais relevantes. Para controlada abrangida, apuração individual anual, padrões contábeis brasileiros no regime privilegiado e conversão pela cotaçãoBCBvenda do último dia útil de dezembro. Lucro já tributado não é novamente tributado quando distribuído (§11); crédito de imposto exterior depende das condições do§15. Isso confirma o mecanismo, sem confirmar fatos de umaLLC ainda não constituída nem a opção distinta doart8. Não aplicar27,5% adicional ao mesmo lucro apenas porque esse número existe no código histórico. A conferência integralCosit56/IN1037 e o enquadramento concreto continuam pendentes; nenhuma taxa do código foi alterada.

## Consumo: obrigatório nos dois caminhos
Trocar CPF porLLC não elimina IVA/OSS, regras de fornecedor presumido ou sales tax. Separar assinatura própria e venda do criador; B2B e consumidor; eletrônico automatizado, serviço humano e físico; país/estado e evidências do cliente. Não transportar uma taxa universal27% como conclusão jurídica.

A sequência AV exige DEEMED_SUPPLIER_RECORDS porUE/UK/US/outros: collect somente implementado/testado, ou recusa testada do checkout eletrônico a consumidor; contador estadualUSTX11 antes do limiar. UEarts44/58/196/9a,UKnãoestabelecido e regrasCanadá/Suíça/Noruega mantêm as pendências da matriz docs/tx-legal-source-review-2026-10-27.md. Cobrança “por fora” não prova implementação, registro ou ausência de custo. Não liberar países por este estudo.

## Depende do dono
**Uma decisão:** escolher priorizar a rotaCPF existente, preservando aLLC como alternativa futura e sem autorizar seus custos fixos agora. Esta recomendação não é pedido para contratar ou abrir vendas.

Para a quantificação restante: registrar fatos reais de operador/remuneração/rendimentos tributáveis relevantes e enquadramento municipal; evidência de moeda suportada sem segredos; inventário completo de custos atuais e tetos pagos, câmbio/reservas e exposições; mix de clientes/países/cadências para cenário comum. O agente continua pesquisa oficial e implementaçãoAV independente sem consultas tributárias ou contato externo. Somente ações exclusivamente do dono entram na lista finalAV; não transformar lacuna pesquisável em tarefa dele.

Primeira venda possível em qualquer rota: **após** a escolha, coberturaAV e base mínima validada, com autorização finalOPENING_REQUESTED. Hoje não há data nem número de clientes certificado. PLANS_ON_SALE=false e OPENING_REQUESTED=false permanecem.

## Verificação e custos desta entrega
Documento comparativo, sem operação financeira ou configuração; fontes públicas datadas, lacunas explícitas e fórmulas revisáveis. Não houve teste local, conta, mensagem, pagamento ou mudança em código. CI hospedado do novohead será registrado na fila; não presumir aprovado. Custo de pesquisa/CI/deploy não medido não é zero; nenhum serviço novo contratado.
