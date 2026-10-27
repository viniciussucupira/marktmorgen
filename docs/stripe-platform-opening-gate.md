# SR2 — Condição adicional de abertura da plataforma Stripe

> **TX vigente — dono, 27/10/2026, 12h34 Fortaleza.** As referências anteriores deste documento à regra 19, à leitura que dá mais imposto, ao ISS de 5% como certo ou a consultas tributárias ficam preservadas como histórico e são substituídas, nos pontos conflitantes, pela política TX de [AGENTS.md](../AGENTS.md). Nenhuma consulta será feita ou preparada para envio. As taxas de recebimento mais caras, SR, desconhecido reprova, reservas, exposição e custeio continuam obrigatórios. A [matriz TX1](tx-legal-source-review-2026-10-27.md) distingue fontes conferidas e lacunas; não certifica incidência zero. O código e os números antigos ainda não adaptados não provam a nova leitura; revisão e regeneração pertencem a TX2/TX5. Flags continuam false.
>
> **SV vigente — dono, 27/10/2026, 13h19 Fortaleza.** EU1 e SV1–SV5 ficam depois da abertura, com trabalho e provas preservados, sem novos PRs desses itens até lá. EU_HOSTING_CONFIRMED permanece false e não é condição de abertura por decisão do dono; a retirada técnica da dependência está em TX2. A conferência de DPF/SCC dos fornecedores atuais segue no Bloco de abertura, sem aceitar termos ou contratar.


Solicitação do dono27/10/2026 08h00Fortaleza,468[SR2]. A [regra SR1](stripe-platform-eligibility.md) permanece vinculante: vale a resposta menos favorável, sem presumir aceitação de país/empresa a partir de configuração ou lista de países.

## O que o código exige

lib/stripe-platform-eligibility.ts define uma revisão controlada no código, com data de revisão e prova datada de uma conta de plataforma ativa **em nome da empresa americana**, com país da conta e empresaUS. Cada uma das quatro regiõesUS,CA,GB(ReinoUnido) eEUROPE(Europa,sem reduzir silenciosamente aUE) precisa de prova explícita de elegibilidade para cobrançasdiretas, vinculada às mesmas referências de conta e empresa. Uma lista geral de paísesStripe não é prova.

A prova da existência/posse da conta precisa ser um registro de contaStripe; para a aptidão regional aceita registro de conta ou confirmação escritaStripe. Datas precisam ser dias reais, não futuras nem posteriores à revisão. A revisão não pode preceder esta decisão. Campos ausentes/desconhecidos, país/posse/status incorretos, prova sem fonte/checksum, vínculo diferente, região ausente/extra, getters/protótipos/hooksexecutáveis e dados adicionais são recusados. As regiões/regras são imutáveis emruntime.

As referências são checksums técnicos opacos de evidência validada. **Nunca inserir segredo,URLprivada,SSN,ITIN,identificadorpessoal ouhash deidentificadorpessoal no código.** O validador confere estrutura/vínculo/data, não autentica independentemente os documentosStripe. Só preencher a constante depois de obter e revisar prova real, nunca copiar fixture sintética. Nenhuma rota aceita prova enviada por visitante.

## Estado atual e proteção da abertura

CURRENT_STRIPE_PLATFORM_ELIGIBILITY_REVIEW continua **null**: nenhuma conta de plataformaUS/empresa/aptidão foi comprovada. stripePlatformEligibilityReady() retornafalse. lib/opening.ts acrescenta essa condição às condições anteriores porAND; OPENING_REQUESTED=false,commercialPlansMayOpen,taxGateValid e deemedSupplierReady ficam preservados. Remover a condição nova ou anterior faz o teste de vínculo falhar.

O teste positivo usa somente documento sintético identificado como tal e verifica a forma do registro. Ele não altera a constante real, não abre vendas e não prova aceitaçãoStripe. Não existe leitura/criação deconta,termo,contato,contrato,pagamento oumensagem real por estes testes.

## Limites e dependências

A prova datada é pontual, não monitoramento contínuo de conta nem promessa de aceitação futura. Restrições conhecidas e prova incompleta continuam reprovadas pela políticaSR1; nunca interpretar o schema como autorização para inventar comprovação. SSN/ITIN,representanteresidente eendereçoreal precisam ser atendidos segundo a leitura conservadora; esta implementação não solicita, armazena ou dispensa dados pessoais.

469[SR3] ainda deve verificar fontes oficiais datadas, custos mensais/anuais integrais100%FX275 e a base mínima;470[SR4]sóroteiro do dono. MR2piso/relatório eMR3resultados continuam separados. Prova de elegibilidade não substitui imposto maisoneroso,ISS5%,art9a,revisão comercial,reservas,exposição oucusteio de contratos.

Acessibilidade:semUI,0→0passos/decisões;Markdowncomtítulos/links explícitos,sem avaliação humana/certificação. Sem novosIOs,chaves,retenção,serviço oufornecedor;registrorealnull econdiçõesanterioresfechadas. Delta deoperaçõesprovider6contratos0/0nesteestado,nãocustototalCI/LLC/byte/CPUzero. A futura revisão/prova/operação exige custo/teto/reserva e verificação antes da abertura; desconhecido reprova.

VR: condição adicional construída em ramo separado, ainda sujeita aCI/incorporação. O que passa a funcionar depois de testado/incorporado é a recusa de abertura sem registro completo. Não funciona por este item a contaUS,empresa/representante/endereço,aceitaçãoregionalreal ouabertura;provasoriginais/fornecedores/custos não verificados. Nenhuma entrega funcional255 ou margem certificada.
