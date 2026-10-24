# AX2 — Native public keyboard cycles

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
