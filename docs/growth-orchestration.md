# Growth orchestration: first implementation

This increment connects existing product capabilities. It does not claim that every feature from the ClickFunnels benchmark has been implemented.

## Delivered

- /studio/growth: four goal-based plans using existing products, pages, funnels, forms, email, buyers and reports. Links respect the current role and carry the selected store.
- CRM: optional next action, UTC calendar date and responsible teammate. Existing deal records remain readable. Overdue, today, upcoming and unplanned filters exclude won/lost deals. No messages or payments are triggered.
- Assignment validates the owner or current teammates with orders permission. A former assignee does not prevent an existing opportunity from moving stages.
- Funnel review: unavailable configured steps, insufficient traffic and inconsistent estimated counts. Numerical observations are descriptive and never infer causes, revenue uplift or statistical significance. Rates are unavailable for missing, negative, infinite or impossible estimates. Independent counts never claim that the same visitors moved from the first step to the last.
- The CRM initializes records using the selected store reference, including secondary stores.
- Date fields reject normalized overflow dates such as February 30.
- Product checks run lint, the existing behavior suite and a production build on pull requests and main. Actions are pinned; the job uses read-only repository permission and no production secrets.

## Saved paid-offer checks

The funnel editor and growth workspace now reuse canSell, canSellProduct, paypalReady, canGiveProduct and bundleReady. They flag unavailable store payments, offers without configured delivery, free sign-ups that fail the public eligibility rule, and bundles without enough eligible items. PayPal-only offers are accepted when the public product page would accept them. The check reads only the selected store and never creates payment sessions, sends email, fetches external links or changes products. Failed reads are explicitly unknown.

This is a configuration review, not a live checkout or delivery test. Actual sign-up/email delivery, stock and license availability, provider health, external link health, and actual file access remain manual release checks.

## Payment-plan diagnostics

The saved review also reuses planState and planPauseWords to explain configured installment plans that no longer appear at checkout: changed product type, buyer-chosen prices, missing option payments, or payments below the current price. Each warning identifies the funnel step and the exact correction. A suppressed plan is distinguished from the up-front purchase; no price or payment configuration is changed. A valid plan produces no warning. This remains configuration review, not a provider transaction test.

## Checkout add-on diagnostics

Saved order bumps are reviewed with bumpStates and bumpPauseWords, using only the selected store catalog. A removed target, a changed price, incompatible product type, buyer-chosen pricing, limited stock or missing configured delivery produces the same reason used by the checkout rules. Targets outside the funnel are read in one batch; no additional target read occurs without configured bumps. The warning identifies the step and affected product and separates the add-on from the main purchase. Eligible add-ons remain quiet. This does not verify live checkout, bundle delivery or provider support, and does not change charges or select an add-on for buyers.

## Guided corrections

When a review has issues or is incomplete, it offers navigation to products/delivery and the store pages. Only owners receive payment-connection and plan destinations. Links preserve the selected store query before the fragment. These are navigation links; no subscription, payment connection, product or page is changed by clicking them. Destination routes keep their own permission checks.

## Unsaved CRM work

The existing leave guard now covers modified deal, stage and custom-field drafts. Opening an unchanged editor does not activate it. It remains active during a pending save and after a failed save, until the draft is successfully saved or explicitly cancelled. It covers browser reload/close and normal same-origin navigation links under the existing guard rules. It is not autosave or durable draft storage; browser Back behavior remains outside this guard. The CRM now allows one editor at a time: opening another editor and moving/removing cards wait until the current deal, stage or field editor is saved or cancelled. This prevents in-page replacement of an open draft without adding another confirmation dialog.

## Created-funnel handoff

A successful guided creation keeps the validated funnel id from the response and offers a native link directly to its saved review, carrying the current store. Links to the generated pages remain available. Starting another setup clears the previous success panel so its destinations cannot be confused with the new draft. The success message asks for review before sharing. If an older or malformed response has no valid funnel id, the destination falls back to the general funnel editor rather than inventing a target. No publication, payment or campaign send is triggered by the handoff.

## Guided creation safeguards

Type-based setup reuses slotProblem to identify missing or incompatible selections and refuses repeated products before posting. Empty names, capacity and page-permission problems also block creation, while server validation remains authoritative. Suggested selections prefer published products, with drafts still selectable and labelled. Setup uses the existing departure guard through pending and failed requests, and a disabled native fieldset prevents concurrent edits during creation. Cancel setup explicitly discards the current setup. The shared departure guard asks at most once per navigation event when several editors are dirty. This is not autosave or a live offer-readiness test.

## Refreshing saved checks

The review summary includes unavailable steps, offer issues and unknown reads rather than only step visibility. A clear summary says saved checks passed, not that live checkout or delivery were tested. Refresh checks requests the current route again through router.refresh inside a React transition. While refreshing, competing edit/create/remove controls are disabled; refreshing checks waits for an open draft or removal confirmation to be saved/cancelled. Read-failure recovery uses the same transition and remains available for recovery. No payment session or email is created.

## Unknown funnel metrics

The studio review uses a strict counter reader. Storage failures, missing counter configuration, incomplete replies and invalid counts are unavailable instead of zero. Confirmed zero remains valid. Each funnel carries a countsAvailable flag; unavailable counts suppress numerical step labels, rates and observations while keeping configuration review and editing available. The legacy reader remains unchanged for other callers.

## Failed funnel-list reads

A rejected saved-funnel list read is shown as an explicit unknown state instead of an empty catalog. The page-funnel editor offers a reload action and hides its mutation controls; the type-based creation picker is withheld until the saved list can be read. A successful empty list retains the normal onboarding. This does not delete funnels or retry writes automatically. The separate post-purchase-offer area remains available under its existing permissions.

## Direct funnel review links

Each funnel requiring attention in Growth links to its own review, carrying the selected store query and a fragment based on the saved funnel id. The target is inside the native details disclosure so fragment navigation can reveal the review. Duplicate funnel names use distinct ids and no longer share a React key. The general editor link remains available. Links do not mutate a funnel and destination authorization remains unchanged.

## Unsaved funnel work

The page-funnel editor now guards changed saved funnels and new drafts, including pending or failed saves. Opening an unchanged saved funnel does not activate the departure guard. Its controls are disabled as a group during a save so later edits cannot be discarded by an earlier response. A removal confirmation and an editor cannot be opened together; competing edit/remove actions wait for the current operation to finish. This uses the existing leave guard and is not autosave, durable storage or browser Back protection.

## Store changes

The shared StudioStorePin provider now keys its child area by the selected store id. Switching stores remounts that area, clearing previous local drafts, selections and dialog state. Refreshes within the same store preserve local state. This changes client state isolation only: no stored records are deleted, and the existing API authorization and store-pin checks remain in force.

## Verification

The new regression file covers date validation, queue membership, descriptive funnel observations, role-filtered plans, route validation, cross-site rejection, pinned-store isolation, multi-store writes and teammate eligibility. Existing CRM and page-funnel regressions must pass too.

Calendar dates currently use an explicitly labelled UTC day. Store-local timezone preferences remain a follow-up requirement.

## Remaining product work

Audit the existing implementations of every benchmark item before replacing them. Next priorities are a full journey preflight that validates delivery and payment capabilities, versioned workflows and publication, contextual AI creation of complete operations, controlled experiments, and validated predictive models. This change supplies practical guidance and descriptive review; it does not introduce autonomous optimization or predict revenue/churn.

Before production release: require successful CI, validate authenticated desktop/mobile flows, and verify that role-based visibility matches the current permissions table. No deployment settings, prices, payment destinations or campaign opt-ins are changed by this increment.


Guided setup checks the stored form count before writing pages. This is a preflight, not a transaction: concurrent changes or storage failures can leave partial records. Required form failures stop setup. The client treats interrupted or unrecognized responses as uncertain, preserves selections, disables immediate retries, and offers store-scoped pages/forms/funnels review links. No automatic rollback or cleanup is performed.

Paid-offer configuration review flags a one-off offer whose configured stock is zero using limitedStock. Positive quantity is not a live availability guarantee; reservations, provider reconciliation and license inventory are not checked by this read-only configuration review.

Funnel correction actions explicitly separate Stripe and PayPal connection destinations, both carrying the selected store and shown only with payments permission. Existing destination authorization remains authoritative; navigation does not connect a provider or initiate a payment.

A structurally valid installment plan is reviewed against canSell(store): unavailable Stripe/store billing produces a separate installment warning. PayPal eligibility for the up-front offer remains independent. Existing structural plan errors retain their detailed messages. No checkout is opened.

Published funnel pages now receive read-only checks of form bindings in their saved default blocks and configured A/B variant. Empty bindings and forms missing from the selected store are flagged. Malformed pages/forms and storage failures keep the configuration review unknown. Kept-back or foreign pages are left to step availability checks. Variant alerts identify Version A or Version B, while malformed variants remain unknown. This does not validate submitted answers, email delivery or quiz scoring, and sends no messages.

Form-binding review now offers a direct Forms and quizzes correction link to roles with page permission, carrying the selected store. Form responses remain subject to the destination export permission; the link itself neither reads answers nor submits a form.

Page/form review batches unique published page ids into one read and unique form ids into one store-scoped HMGET. A funnel uses at most two storage round trips, with no form read when none is selected. Incomplete replies remain unknown; duplicate steps keep their own diagnostic labels.

Saved quiz recommendations are checked against the selected store catalog index: removed/foreign and draft products produce result-named alerts. Text-only outcomes remain valid. A missing catalog index with product recommendations leaves review unknown. This adds no storage reads and does not score answers or validate payment/delivery for recommended products.
