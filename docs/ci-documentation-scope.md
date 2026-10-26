# PV8(a): conservative documentation-only pull requests

Status: em andamento; implementation submitted for full remote verification. Not a functional delivery.

Owner authorization: 25 October 2026, 16:47 America/Fortaleza; expedited PV8(a)–(c) without interrupting AB(a). This increment implements only (a). PV8(b), (c) and pre-production proof reuse are not implemented. Main still runs the full existing suite.

Each of the eight existing workflows first runs the same lightweight Python classification and synthetic policy regressions. Heavy jobs keep their existing names, browser matrices, tests, and timeouts. Only a pull request whose actual base-to-head Git diff contains exclusively regular non-executable Markdown documentation can skip heavy jobs. Policy files (AGENTS.md, SKILL.md), hidden directories, test/tool/script paths, executable modes, symlinks, submodules, malformed records, unknown events and unavailable history require full coverage. Other files under docs/, including code examples and images, conservatively require full coverage too. Renames are expanded into deletions/additions so renaming code cannot hide a code deletion.

Git references come from event SHA fields through environment variables, never shell interpolation. The comparison uses NUL-delimited Git output, not a PR title, a filename line parser or a truncated API file list. If the scope job fails or its output is absent, dependent heavy jobs use !cancelled() and default to running unless their workflow is canceled. Cancellation never supplies full-test proof. The existing public-only restriction for real screen-reader machines is preserved.

## Cost record

Before: owner measurement of about 153 aggregate job-minutes per change across 24 jobs, including macOS/Windows; not independently remeasured by this increment. After: expected eight short Linux scope jobs for qualifying documentation-only PRs; actual minutes, monthly/annual totals and savings remain UNKNOWN until workflow measurements. Non-documentation PRs and all main pushes retain full coverage plus scope overhead. No numerical cost reduction is applied to a model. No new supplier, production request or per-plan entitlement changes; private-repository machine pricing and consolidated fixed-cost allocation remain PV8(d)/FX275 work. See docs/cost-savings.md, PV8.

## Verification and accessibility

The new workflow/script/configuration changes themselves trigger full coverage. Synthetic regressions cover mixed changes, moved code, policy/config/dependency changes, malformed and truncated output, Unicode names, special paths, missing history and push/scheduled/manual events. CI results must be recorded on the exact new head before incorporation. Browser and accessibility coverage remains unchanged for all code/configuration/test changes. No customer-facing interface changes or accessibility conformity claim.

Official source consulted 25 October 2026: [GitHub conditional jobs](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-jobs-with-conditions) explains that a conditionally skipped job reports success and does not block a required check. Workflows are therefore not skipped with paths-ignore; named jobs remain present. A skipped job is NOT evidence of full testing, and must never be reused as full-test proof for PV8(b), (c), or production.


### PV8 — cancelar verificações obsoletas sem aceitar cobertura incompleta (25/10/2026, 21h16 Fortaleza)

Achado: os jobs pesados usavam always() no nível do job. Isso também permanece verdadeiro durante cancelamento e pode manter a execução antiga ocupando seu grupo enquanto a nova aguarda. A documentação oficial do GitHub recomenda !cancelled() para trabalho que deve executar após sucesso/falha, mas parar quando a execução é cancelada: https://docs.github.com/en/actions/reference/workflows-and-actions/expressions#always (consultada25/10/2026 em Fortaleza; sem data editorial oficial estabelecida). Substituído exclusivamente o predicado de estado dos11jobs pesados por expressão YAML explícita ${{ !cancelled() && needs.documentation-scope.outputs.full != 'false' }}; a restrição pública adicional dos leitores reais permanece. Não substituir por success(): falha/saída ausente no classificador ainda exige cobertura completa numa execução não cancelada. Matrizes, comandos, timeouts e cobertura diária/manual preservados.

Execução cancelada não aprova publicação nem reutilização: a prova PV8(b) continua exigindo o conjunto exato de jobs concluídos com sucesso na mesma árvore. Nova suíte INTEGRAL no novo head, sem reaproveitar checks de heads antigos. O teste estrutural existente agora impede always() no gate pesado e exige !cancelled() com expressão fechada; não há corte de testes do head que será publicado.

Custo: evitar trabalho de head substituído é redução esperada de desperdício, ainda sem medição faturada, mensal/anual ou economia certificada. Mantido o limite configurado707min agregados por execução completa e todos os cenários conservadores anteriores,100% fixos Marktmorgen/FX275; nenhum novo workflow, fornecedor, operação produtiva ou franquia. Incremento de requisições produtivas por plano mês/ano0/0; fatura/topologia/impostos desconhecidos não viram zero. Estado: em andamento no PR1036, sem incorporação/publicação ou entrega funcional. Sem mudança adicional de interface; passos/decisões e lacuna de pessoas reais202 preservados. PLANS_ON_SALE=false e demais gates intactos.
