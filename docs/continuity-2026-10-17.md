# Continuity record — 17 Oct 2026 (Claude, taking over from Codex)

This file is the durable handoff for whoever works on Hazelsong or Marktmorgen next (Claude, Codex or a person). Conversations are not shared between assistants; this file, CLAUDE.md/AGENTS.md and the merged history are.

## What was recovered from Codex (8–17 Oct 2026)

- **GitHub:** every open, draft, merged and closed PR updated 8–17 Oct in both repositories was classified (local only / branch without PR / draft / merged not deployed / deployed). Superseded Codex PRs were closed on 17 Oct with a comment naming what replaced them; their branches remain.
- **Owner's computer (C:\Users\vinic\Documents\Codex and C:\Users\vinic\.codex):** all 1,317 local code files were compared by content with GitHub; the few that existed only locally became PRs and were merged (Marktmorgen #504, #505; Hazelsong #254, #256, #257). Drafts, research and inventories were preserved and delivered to the owner as codex-local-recovery-2026-10-17.zip. The six Codex automations are PAUSED (read 17 Oct). Codex's credentials file was never read.
- **Not read:** Codex's internal session transcripts (~150 large files under .codex/sessions). Everything they produced that reached the repositories or the workspace folders was recovered; decisions made only in chat with Codex may be missing.

## Owner rules in force (binding; see AGENTS.md / CLAUDE.md for the full text)

1. 60% net margin after every tax, per paying customer at full use of every entitlement, and company-wide from a computed minimum base (17 Oct 2026, verbatim in AGENTS.md / CLAUDE.md). Limits are lowered, never prices; protections act on their own.
2. Free accounts, trials and refunds: automatic ceiling paid by the company ("Teto mínimo pago pela empresa").
3. Rule 19: where tax law is unclear, use the reading with MORE tax; open questions are in docs/tax-uncertainty.md. Under that reading 60% is unreachable, so paid sales stay closed; since 18 Oct 2026 a doubt is closed only by an official text or a recorded consultation answer (docs/tax-consultations.md) (the owner uses no accountant).

## State at the end of 17 Oct 2026

- **Marktmorgen:** ClickFunnels parity work merged and deployed (#507–#510, #516–#519, #522); automatic AI/upload budgets (#509); complete per-plan cost registry with no open cost (#524–#528); billing-period allowances and caps; contact erasure (#527); order data charged at real size (#529). Every plan meets 60% at the 27.5% stress rate in the model; lib/commercial-margin.ts stays closed (no real review). Google Calendar sync scopes added and GOOGLE_CALENDAR_SYNC_SCOPES=1 set (#523).
- **Hazelsong:** Stripe billing path (#259, inactive until the owner's Stripe account exists), competitor research (#260), affiliates and referrals with 60%-bounded ceilings (#261, #264), onboarding and the form-send/import fixes (#262), one owner-margin model (#263), billing-period allowances and enforced free ceiling (#268), automatic moderation, send-once and deletion hardening (#265–#267). Packs stay off sale (need $29 / $21). GitHub Actions is out of minutes until 1 Nov: validate locally (quality.yml steps with real Redis, tsc, lint, next build) before every merge.

## Still open

- Marktmorgen: closed stores keep creator-side records after the closing day (bounded per store, not over time); community posts of an erased person stay as "A member"; PR #331 (Codex growth orchestration) is not reviewed.
- Hazelsong: drafts #38 (owner-flagged parts: free-plan holds, fail-closed rate limiter, Deepgram/OpenAI fallback removal, 30-day media deletion), #162 (atomic storage reservations), #189 (retention margin evidence); free accounts' stored files/testimonials have no count ceiling, so free sign-ups stay paused; scripts/allowances-public.mjs has a stale assertion ("every write a reader can see throws the copy away").
- Owner only: the consultations to the Receita and to Fortaleza (docs/tax-consultations.md; 27 questions in docs/tax-uncertainty.md), registering the LLC in the EU's non-Union OSS and for UK VAT before any store sells (docs/eu-vat-article-9a.md), forming the Delaware LLC, US Stripe account and prices, supplier spend caps (Vercel, Upstash, Resend, Anthropic, Google), archiving off-sale prices in Paddle, legal review of the erasure choices (#527).
