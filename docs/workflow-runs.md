# Workflows: branches, goals, limits and run history

Added 17 October 2026 on top of the existing sequence engine (`lib/flows.ts`); there is no second engine. Covers ClickFunnels audit capabilities F21 (behavior triggers), F22 (actions and handoffs), F23 (branching and goals) and F24 (execution history).

## What a creator can build

- **Triggers:** joins the list, gets a product, first purchase, label given by another workflow, sends a form, finishes a course, and two new ones: **opens a course for the first time** (`lib/course-finish.ts`, `noteIfOpened`) and **abandoned checkout** (`lib/checkout-sweep.ts`, `startAbandonedWorkflows`). An abandoned-checkout run starts only when the buyer checked Stripe's promotional-consent box on that checkout (`consent.promotions === "opt_in"`, the same evidence `lib/checkout-recovery.ts` already requires) and is on the creator's list and mailable (`enroll`). It starts once per checkout, never for the demo store, and the workflow must have a purchase goal.
- **Steps:** email (through the existing `sendTo`, so every email is reserved from the monthly allowance before it is sent), wait only, give/take off a label, start another workflow, set a field, move a deal to a stage, **make a teammate responsible for the person's open deal** (owner or a teammate with the "orders" permission, checked on save and again at run time), write a note, email the owner, tell the store's webhooks (the existing signed `sequence.step` event, its endpoints and retry ceiling).
- **Branches:** a step's condition can skip, end, or **jump to a later step**; any step can go **next** to a later step or end. Routes only go forward (`lib/flow-paths.ts`, `checkRoutes`), so a run never loops and visits each step at most once.
- **Goals:** bought anything, got one product, or **carries a label**. Checked before every step.
- **Preview:** `previewRun` shows the exact path for a sample contact (typed in, or read from one person on the list). It is the same routing code the scheduled job uses, it simulates the workflow's own label steps, and it sends or saves nothing.
- **Explicit activation:** a new workflow is saved paused whatever the request says; switching on is `flow-activate` from the workflow's card, shown after the preview. "Keep sending it" from a sent email is an explicit switch on and passes `activate`.

## Run history and uncertain outcomes

`lib/flow-runs.ts` keeps one record per (workflow, person) for 400 days: status, current step and an event list capped by `MAX_RUN_EVENTS`. Before an email is handed to the sender or an action runs, the attempt is claimed with `HSETNX` on the run (`attempted`). The outcome then clears it: `confirmed`, `failed`, or `deferred` (allowance, daily sending room, pause: nothing was sent and the step is queued again). When the provider may have taken an email but the answer was lost (`sendTo` now returns those addresses as `uncertain`), or an action's write cannot be confirmed, the attempt stays open and the run is **held**. A run that finds its own attempt still open, because a job stopped between the attempt and the outcome, is held too. Nothing held is retried by itself. The studio lists held runs, and the creator chooses once (`resolveHeldRun`, only one `HDEL` wins): it went through, continue; try again, which may deliver twice; or end the run.

The next step is queued before the attempt is cleared. If clearing fails, the next step finds the attempt open and holds the run instead of repeating anything.

## Limits (enforced in code, shown in the studio)

| | Store | Studio | Scale | Trial |
|---|---|---|---|---|
| Workflows kept | email not on plan | 20 | 20 | 20 |
| Steps per workflow | | 20 | 20 | 20 |
| Switched on at once | 0 | 10 | 20 | 3 |
| New runs per UTC day, all workflows | 0 | 300 | 600 | 50 |

Runs past the daily ceiling are refused before any record is written, their start claim is given back, and the refusals are counted and shown. A store that moves to a smaller plan keeps its workflows; only the oldest switched-on ones up to the new limit start new runs. The limits are in `CURRENT_COMMERCIAL_TERMS.workflows`, so changing any of them invalidates an earlier margin review.

## Cost reasoning

Emails draw on the existing monthly allowance and its supplier reservation; nothing here adds an email that bypasses it. Owner notices use the platform sender once per group of people. Webhook events reuse the store's endpoints (at most 5) and the existing seven-try retry ceiling. The non-email cost is Redis commands. `WORST_COMMANDS_PER_RUN` (8 to start, plus 20 steps × (8 history + 6 queue/contact) = 288) is a review ceiling, not a measured average. At Upstash's published $0.20 per 100,000 commands (baseline doc C06), the daily run ceiling gives about $5.36 a month for Studio (300 × 31 × 288) and $10.71 for Scale. The figures are inputs for the margin review. They are not proof that any plan meets the 60% after-tax floor.

## Verification

`tests/workflow-branching.test.ts` (52 checks) covers routes, preview determinism, plan limits, save validation, explicit activation, IF/ELSE delivery, label goals, step history, the daily ceiling, a lost provider answer that is held rather than resent, an attempt left open by a stopped job, and the creator's one-time resolution. Existing sequence tests were updated only where new workflows now need an explicit switch on. Everything runs against the in-memory Redis double and a stand-in email provider. No real messages, Stripe accounts or customer records are used.

## Not included

- A date/time trigger (start everyone matching on a set date). It needs paging over the list under the daily ceiling, so it is left for follow-up work.
- Granting or revoking course or community access from a workflow. Access is derived from Stripe purchases and refunds (`lib/community-access.ts`, `lib/learn.ts`), and audit item F38 asks for subscription/refund reconciliation before access automations.
- A drag-and-drop canvas. The editor stays a list of steps with branch targets and a step map. The preview shows the path.
- Page-visit triggers and split-test steps beyond the existing A/B halves.
- Erasing run history when a person is deleted. It ages out with the 400-day start record, the same as before.
