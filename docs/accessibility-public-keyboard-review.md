# AX2 — Native public keyboard reachability

Prepared on October 23, 2026, while independent AX2 checks run. This extends the existing public wording journeys; it does not replace the five accessibility matrices or their first-focus checks.

## Cost before implementation

For Store, Studio and Scale, new runtime cost is $0 monthly and $0 annually: this change adds browser-test code only. The extra traversal runs inside the existing, time-bounded standard Ubuntu jobs; it adds no runner job, supplier, paid recording, artifact or storage. Incremental runner cost is $0 monthly and annually only under the owner's verified October 23 public-repository standard-runner exception. The new traversal flag is false for private or unknown visibility. Existing job timeouts and concurrency stay unchanged. Other actual bills remain unknown where not verified; this is not an all-tax margin review or a certification of the 60% floor. All LLC fixed costs remain Marktmorgen's responsibility.

## What the check does

The existing nine public wording routes keep all their copy checks. In the same synthetic browser, the new helper captures visible, enabled, non-inert HTML targets with a nonnegative native tab index. The wording journey has opened main-content details; that settled open-details state is the state tested here.

It sends real Tab and Shift+Tab keys through the browser. Each direction must return to its first target, visit every captured sequential target and avoid a repeated inner loop. Every visited target must remain in the settled document, match focus-visible and have a visible box. Browser-chrome transitions may occur between the last and first page target. The complete captured target list and the existing target-count-plus-five key budget bound each traversal; failure to reach every target or to complete the traversal fails rather than truncating the result. The check does not assign focus, change tab indices, activate a control, submit a form or change persisted identifiers.

Each actual result logs AX2_KEYBOARD_CYCLE with route, direction, expected and reached counts. Counts are taken from the document, not written into a coverage claim. No passing result is claimed before the complete new-head CI run.

## Acessibilidade

Methods address a bounded part of WCAG 2.2 SC 2.1.1, 2.1.2 and 2.4.7. Official W3C explanations reviewed October 23, 2026:

- https://www.w3.org/WAI/WCAG22/Understanding/no-keyboard-trap.html
- https://www.w3.org/WAI/WCAG22/Understanding/focus-order.html

A complete sequential cycle is not proof that the order preserves meaning. The helper does not measure focus contrast, thickness or obscuring, and focus-visible alone does not prove SC 2.4.13. It does not test activation, open menus, modal escape, closed-details states, composite-widget arrow keys, other widths or modes, real devices, all routes or all criteria. Those remain AX2 gaps. No accessibility overlay or conformity claim is added.

All interactions use existing local synthetic pages. The public site, prices, printed limits, opt-in, commercial review, tax gate, Article 9a and PLANS_ON_SALE are unchanged.

## First-run failures and diagnostic repair

Standalone head bbdee1a3003975a27b85915ed2477ef5218de749 failed: Chromium job 120743349103 reported three failures (home: 160 captured versus 151 reached in each direction; help: 282 targets exceeded an unjustified 250-target fixture assertion even though all 282 were traversed). Firefox job 120743348911 reported 146 failures, including repeated apparent end-of-document loops; the exact cause of every missed home target is not yet established. No passing result is claimed.

The diagnostic repair distinguishes document.hasFocus() from a retained activeElement after focus leaves for browser controls, activates the browser page before the reverse traversal without selecting a DOM element, and includes the actual initial focused target. It allows either a complete wrap or transfer to browser controls, while still requiring every captured target and rejecting inner loops. The existing expected-target-count-plus-five loop budget and every job timeout remain unchanged. The false 250-target fixture assertion is removed: it never limited traversal execution (the assertion collector continued through 282 targets), and it is not a product or accessibility requirement. Neither the 100% reachability criterion nor any accessibility threshold is reduced. Two animation frames settle native details tasks before capture. Missing target identity, connection, box, style and enclosing-details state are now logged; an unsuccessful route fails early with those diagnostics. If targets are still missing, they must be investigated rather than excluded merely to pass.

Official focus behavior reviewed October 23, 2026: https://html.spec.whatwg.org/multipage/interaction.html#dom-document-hasfocus and its sequential focus navigation algorithm permit transfer to the browser controls; a page need not trap focus by forcing a wrap. All nine routes and both native key directions remain required. The complete new-head 24-check suite must pass before incorporation.

## Oracle correction after exact missing-target diagnostics

Reviewed October 23, 2026. Head 8a8bb8221399bb16107bcb9b365c294e47791ae6 failed keyboard checks in jobs 120749549690 (Chromium), 120749549903 (Firefox) and 120749549786 (WebKit). Each report identified exactly seven anchors beneath closed details and two unchecked native radio options. The earlier wording fixture opens details sequentially; the home FAQ has an exclusive name group, so only the last panel remains open. Positive descendant geometry does not make hidden disclosure contents sequential targets. The corrected snapshot checks every closed details ancestor and retains its first summary and descendants of that summary. Closed-panel contents are not reported as tested; other disclosure states remain gaps.

Official sources read October 23, 2026: https://html.spec.whatwg.org/multipage/interactive-elements.html#the-details-element (Living Standard updated October 22, 2026) describes exclusive name groups and hidden closed content. https://www.w3.org/WAI/ARIA/apg/patterns/radio/ describes Tab entering the checked option and arrows selecting other options. Checked native groups now contribute one Tab stop, while real ArrowRight presses verify every enabled rendered option, checked state, focus visibility and restoration of the original selection. A group with no checked option or a toolbar group fails as an unsupported fixture, never silently passes. Membership uses name, form owner and tree root. No DOM focus assignment or tabindex mutation is used.

The previous paragraph requiring a browser wrap is superseded by bounded target reachability. Firefox retained document.hasFocus and activeElement at its terminal boundary in this headless environment; the test cannot prove whether browser chrome received the next key. Every captured target must still be reached in each direction, with no repetition before full coverage. The traversal stops after full coverage rather than treating a browser boundary as a product trap. Browser-chrome exit and full no-keyboard-trap conformity remain explicitly unverified; this is a narrower evidence claim, not a passing trap audit. All nine routes, both Tab directions, full target coverage, existing key budgets and all timeouts remain required. The existing public wording assertions remain unchanged. New arrow interactions block and count all non-GET/HEAD and foreign-origin requests; both counts must be zero.

Independent mobile-render failure 120749549868 at 02:12:35 UTC is preserved separately: the first cold-home sample recorded interaction-to-paint 272 ms (target failed), later samples did not erase it. No mobile threshold, sample count, CPU/network throttle, interaction or pass aggregation is relaxed by this keyboard correction. A complete new-head suite, including the unchanged mobile measurement, remains required. No successful corrected run is claimed here.


### Controlled-radio observation synchronization

Combined head caf4964951ae16e4d97161a0f9824f46ad01a579, WebKit job120758938172, failed at02:57:10–02:57:12UTC: forward Tab reached151/151; the first native ArrowRight moved focus to the expected next radio but its selected state had not yet been observed, and immediately sent later keys remained on that option. Source components/feature-demos.tsx uses controlled checked state and onChange/setChosen. This suggests observation before the controlled state commit; it does not establish an exclusive browser defect or certify the widget. The repair waits at most3000ms for the actual expected element to have native focus, checked state and focus-visible after each single ArrowRight. It never assigns focus or selection and never resends a key. Failure logs the actual observed state and still fails. Existing global timeouts, route count, per-group key count and target criteria stay unchanged. Complete new-head verification is required; no corrected passing result is claimed.
