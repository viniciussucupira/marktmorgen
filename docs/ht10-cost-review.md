# HT10 — Cost review before changing the pixel/attribution center

Reviewed20October2026 before implementation. Sources: lib/pixels.ts, components/pixel-editor.tsx, components/store-pixels.tsx, components/attribution-table.tsx, existing pixels/attribution API routes, guarded counted studio routes, tests/plan-cost-model.ts, tests/plan-cost-registry.ts and generated docs/margin-alignment-2026-10-18.md. Existing Meta/Google/TikTok/Pinterest IDs, consent-country/unknown-country rules and Global Privacy Control remain intact. Ad spend belongs to the creator; this item neither starts ads nor contacts an ad provider.

Scope is navigation between the existing configuration and existing channel table, visible consent explanation, and stricter confirmation of the exact settings already returned by the two existing save endpoints. No endpoint, read, write, provider, model, event, pixel load, reporting interval, data retention, account, background task or sending entitlement is added. At100% of every existing allowance in the worst billing month, the same operations remain counted in the same existing cost lines. Incremental supplier cost is explicitly zero, not an unknown provider quote set to zero. Stored IDs, consent and permissions are unchanged; new response validation runs locally.

| Plan/interval | Existing collected price ceiling | Added supplier cost/month | Added supplier cost/charge interval | Sizing net after all modeled costs/tax, unchanged |
|---|---:|---:|---:|---:|
| Store/month | $69 | $0 | $0 | 60.31% |
| Store/year | $690 | $0 | $0 | 60.59% |
| Studio/month | $449 | $0 | $0 | 60.38% |
| Studio/year | $4,490 | $0 | $0 | 60.06% |
| Scale/month | $999 | $0 | $0 | 60.46% |
| Scale/year | $9,990 | $0 | $0 | 60.07% |

Method unchanged from Store assistant and base-plan sizing: all rights at caps, dearer of Stripe/Paddle per charge including buyer tax on top, remittance/refund/dispute reserves, profit tax27.5% (including Brazil assumption), and integer60% floor. Annual charge covers all12 usage windows and post-plan exposure. No extra commission/revenue or pooled profit from another customer. No new cost requires a new operating reserve or ceiling because no new operation is introduced; existing envelopes stay binding.

The most-tax reading remains the binding sales gate and still fails (about12.02–12.21%, below60%). This table is the existing sizing reading and a zero-delta review, not a fiscal opinion, margin certification or permission to open sales. Unknowns remain failures. PLANS_ON_SALE=false, COMMISSION_LIVE=false, prices, visible limits, opt-in, tax gate, art.9a and commercial review unchanged. If implementation needs a new provider or metered operation beyond this scope, stop and calculate it before using it.

Status: cost review recorded; implementation and full CI pending. No real account, payment, third-party message or external submission.

## Reconciliação de implementação —23October2026

The pending implementation/publication wording above is historical. Canonical source and actual browser regressions were inspected on published179 head65d84a8fa7c3cdd03789684ee6e09de0ce44323f: all22checks passed, verify120309909474. PR829 mergedbcf8b21fb4777a971f66189bd2543ca43549cfcd at23October2026 05:29:12Fortaleza; dpl_D9ARZGwcRGgkRqzDXwKLCANJQCSG READY05:29:52.708Fortaleza, exactdomain/SHA and five200routes verified. Existing390/1280 synthetic tests cover this feature; no duplicate implementation or new supplier operation is introduced by this reconciliation. Earlier sizing percentages remain historical, not current margin certification. Most-tax60%individual/global and100%LLC remain binding; actual CI/deploy bills unknownnotzero; all opening/fiscal/commercial gates unchanged. Manual AT/device/AAA gaps remain.
