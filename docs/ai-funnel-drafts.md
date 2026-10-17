# AI funnel drafts (F03, F04, part of F54)

The guided funnel setup's review step can ask the writing help for a first draft of the whole funnel and for a summary of who it is for. Code: `lib/funnel-ai-rules.ts` (pure rules, weights, validators), `lib/funnel-ai.ts` (server), `lib/funnel-ai-sequence.ts` (sequence payload), `components/funnel-ai-draft.tsx` (panel), kinds `funnel` and `funnel-research` in `app/api/store/ai`.

## What it produces

The draft fills the guided setup's own structures (docs/guided-funnel-drafts.md): `pageCopy` (headline, introduction), `formDrafts` (questions; the subscription checkbox always starts off) and a new strict `blockCopy` (hero line, text, steps, who it is for, questions, button) accepted by the same `from-type` route only for blocks the page type has. It also returns offer suggestions mapped to the store's own paid one-off products (shown with links to set them up; nothing is created or priced), follow-up emails (saved only on request, switched off, through the Email Studio's own `flow` route and its checks) and a list of facts to add.

Nothing is published. Pages are created hidden and the funnel disabled, as before. A part only the creator knows is marked `⟦like this⟧`; the site-page route now refuses to show or schedule a page holding one, and `saveFlow` already refuses sequences holding one.

## Honesty rules enforced in code

- Facts are read on the server from the store: the chosen products (checked with `slotProblem` like the setup), prices, delivery, summaries and descriptions, other paid one-off products, and unanswered visitor questions. The browser sends only product ids and the creator's own words.
- Any sentence with a number that none of those facts carries is removed (`withoutInventedNumbers`); placeholders and link addresses are not read as claims. Buttons never carry a price or a placeholder. Email links are limited to the store's own (`readDraftedSteps`).
- Research reads only dated store records (`researchSources`): what the creator typed, products as saved, verified review counts and averages, 30-day visit counts, and unanswered visitor questions with their dates. It does not search the web (`webSearch: false`). A claim is kept only if it cites a provided source whose text carries every number in it; source labels and dates come from the store, never from the model. Store-written uncertainty lines are always shown.
- Deterministic diagnostics (the F54 slice sharing this engine): no proof, thin product records, draft products, unanswered questions, and visit counts that are either flagged as a small sample (under 30 opens) or reported as counts with an explicit no-causality note.
- Output is American English regardless of store language, as requested for this feature.

## Cost and admission

Every request goes through the existing path: `counted` takes the month's writing jobs before any request (failed starts stay counted), `withAiCallBudget` limits attempts to two per job, and `askModel` validates request bounds, reserves funded exposure for non-paying scopes and reserves the request's own spending hold from the plan's monthly AI budget before fetch (docs/automatic-spend-policies.md). The panel appears only where `aiAvailableFor(store)` is true (Studio and Scale today).

Weight in writing jobs is the request's hold at the writing model's rates (`aiRequestHoldMicroUsd` with its byte and output bounds) divided by the priced writing job (`WRITING_JOB_MICRO_USD`), rounded up: pages 4,500 output tokens / 16 KiB input = 2 jobs; emails 3,000 / 12 KiB = 1; research 2,000 / 12 KiB = 1. A draft is 2 jobs, or 3 with emails; the panel shows this before running and disables itself when fewer remain. Inputs larger than a request's byte bound are refused before anything is counted or reserved. A draft makes at most two provider calls. No new allowance, price or plan limit is introduced, and this does not certify the 60% margin.

## Not included

No page design or layout generation, pictures, videos, quiz choices/results, bump or offer creation, automatic sequence activation, web research, or AI evaluation of funnel performance. Existing product sales pages keep their own "Write the whole page" draft.
