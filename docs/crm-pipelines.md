# Pipelines and stage-entered workflows

Added 17 October 2026 for HighLevel audit H02 (pipelines and opportunities) and the stage trigger of H18 (workflows). It extends the one deal board (`lib/crm.ts`, `lib/crm-rules.ts`, `components/deals-board.tsx`); there is no second deal store.

## Model and migration

- A pipeline is `{ id, name, stages }`, kept as one JSON record, `nl:crm:pipes:<statsId>`, counted in the store's data room (slot `crm:pipes`) before it is written.
- A deal still names only a stage. Stage ids are unique across a store's pipelines (`parsePipelines`), so a deal's pipeline is its stage's. Moving a deal to another pipeline is saving it with one of that pipeline's stages.
- A store that never saved pipelines reads one pipeline, "Sales" (`FIRST_PIPELINE_ID`), with the stages its board had (`nl:crm:stages:`, or the defaults). Reading writes nothing and no deal is rewritten, so every existing deal, form opportunity and payment-request link keeps working. Every save also writes the first pipeline's stages back to `nl:crm:stages:`, so an older deployment still reads the first board.
- A save is a compare-and-set over the exact record read (`SAVE_CRM_PIPELINES`, single key): a concurrent change answers `crm_conflict` and nothing is written. The old `stages` action (first pipeline only, removed stages to its first open stage) still works for open tabs.

## Stages and pipelines removed

`changePipeline` refuses (`moves`) to remove a stage that holds deals unless the request names a stage that is kept, in that pipeline or another; removing a pipeline needs one stage of another pipeline for all its deals, and the last pipeline cannot be removed. Each deal is moved over its exact record (`MOVE_CRM_DEAL`), so a concurrent edit or deletion is kept and the operation reports itself unconfirmed. A deal whose stage was already in no pipeline is brought back to the first pipeline's first open stage.

## Limits (enforced in code)

| | No plan | Free trial | Store | Studio | Scale |
|---|---|---|---|---|---|
| Pipelines | 1 | 2 | 2 | 5 | 10 |

At most `MAX_PIPELINES` (10) are kept whatever the plan; a store that moves to a smaller plan keeps its pipelines but cannot add one. Each pipeline has up to `MAX_STAGES` (8) stages, at least one open, one won and one lost. `MAX_DEALS` (1,000) still counts every deal of every pipeline together.

## Totals

`pipelineTotals` adds up recorded deal values by open, won and lost, in the store's currency. No probability, weighting or forecast is computed.

## Stage-entered workflows

Workflow trigger `"stage"` with `stageId` (`lib/flows.ts`). `lib/deal-stage-trigger.ts` starts it after a deal is saved from the board (`/api/store/crm`, action `deal`) when the deal names an address and is new or in another stage than before. `enroll` then requires the person to be on the list and mailable, and each person starts a workflow once. One workflow per stage (`stage_taken`). Not triggers, on purpose: form conversions (they never enroll anybody), moves made by removing a stage or a pipeline, and a workflow's own deal step (a run's cost ceiling, `WORST_COMMANDS_PER_RUN`, is unchanged; the "start another workflow" step chains instead). A deal step now moves the person's open deal in its target stage's pipeline and leaves deals in other pipelines alone.

## Cost

Zero per-use cost outside the database. A deal entering a stage on a plan with workflows takes one more studio request (`STAGE_TRIGGER_UNITS`) before the check; the check measured 16 commands with an admitted start (`tests/crm-pipelines.test.ts`), within one studio request (20 commands) beside the run's own start, which the workflow line prices. Plans without workflows read nothing. The pipelines record is in the data room. `tests/plan-cost-registry.ts` keeps `OPEN` empty and the spend floor is unchanged from main.

## Not included

- Weighted forecasts, win probabilities and per-stage reporting toggles (left out on purpose, or follow-up).
- Stage-stall reminders ("no change for N days") and tasks per stage.
- A trigger when a deal leaves a stage, or on a value change.
- Drag-and-drop between columns; moving is the stage menu on each deal.

## Verification

`tests/crm-pipelines.test.ts` (62 checks), `tests/deals-board-pipelines-render.test.ts`, the updated CRM tests, and `scripts/test_crm_pipelines_redis.py` against a disposable Redis 7. No real accounts, messages or customer records are used.
