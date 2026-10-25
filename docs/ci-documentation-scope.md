# PV8(a): conservative documentation-only pull requests

Status: em andamento; implementation submitted for full remote verification. Not a functional delivery.

Owner authorization: 25 October 2026, 16:47 America/Fortaleza; expedited PV8(a)–(c) without interrupting AB(a). This increment implements only (a). PV8(b), (c) and pre-production proof reuse are not implemented. Main still runs the full existing suite.

Each of the eight existing workflows first runs the same lightweight Python classification and synthetic policy regressions. Heavy jobs keep their existing names, browser matrices, tests, and timeouts. Only a pull request whose actual base-to-head Git diff contains exclusively regular non-executable Markdown documentation can skip heavy jobs. Policy files (AGENTS.md, SKILL.md), hidden directories, test/tool/script paths, executable modes, symlinks, submodules, malformed records, unknown events and unavailable history require full coverage. Other files under docs/, including code examples and images, conservatively require full coverage too. Renames are expanded into deletions/additions so renaming code cannot hide a code deletion.

Git references come from event SHA fields through environment variables, never shell interpolation. The comparison uses NUL-delimited Git output, not a PR title, a filename line parser or a truncated API file list. If the scope job fails or its output is absent, dependent heavy jobs use always() and default to running. The existing public-only restriction for real screen-reader machines is preserved.

## Cost record

Before: owner measurement of about 153 aggregate job-minutes per change across 24 jobs, including macOS/Windows; not independently remeasured by this increment. After: expected eight short Linux scope jobs for qualifying documentation-only PRs; actual minutes, monthly/annual totals and savings remain UNKNOWN until workflow measurements. Non-documentation PRs and all main pushes retain full coverage plus scope overhead. No numerical cost reduction is applied to a model. No new supplier, production request or per-plan entitlement changes; private-repository machine pricing and consolidated fixed-cost allocation remain PV8(d)/FX275 work. See docs/cost-savings.md, PV8.

## Verification and accessibility

The new workflow/script/configuration changes themselves trigger full coverage. Synthetic regressions cover mixed changes, moved code, policy/config/dependency changes, malformed and truncated output, Unicode names, special paths, missing history and push/scheduled/manual events. CI results must be recorded on the exact new head before incorporation. Browser and accessibility coverage remains unchanged for all code/configuration/test changes. No customer-facing interface changes or accessibility conformity claim.

Official source consulted 25 October 2026: [GitHub conditional jobs](https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/control-jobs-with-conditions) explains that a conditionally skipped job reports success and does not block a required check. Workflows are therefore not skipped with paths-ignore; named jobs remain present. A skipped job is NOT evidence of full testing, and must never be reused as full-test proof for PV8(b), (c), or production.
