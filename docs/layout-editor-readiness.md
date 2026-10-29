# Layout editor readiness after WebKit failure

On combined head60b4b154, WebKit job123734592076 failed at21:31:34UTC: after Add a section completed, the test timed out waiting for Heading1. Existing layout controls were enabled in server HTML before React attached their handlers. A visible element and network idle do not prove the handlers are ready.

The actual StoreLayoutEditor now reuses useHydrated. All eight input/select/button disabled bindings and the save guard require readiness; the card exposes readiness and busy state. No timer, retry, threshold change, second hook or provider operation is added. This closes the identified early-interaction window; the failed browser result is not declared repaired until the new full suite passes.

The regression loads a real authenticated synthetic studio with JavaScript disabled: server readiness must be false, all actual controls disabled, busy true, and no API write. Normal390/1280contexts observe the real readiness state and retain every original exact-value,selected-product,48intercepted-writes,busy,uncertainty,save/removal and width assertion.

Accessibility: same labels, targets, styles and keyboard controls; no extra user step/decision,0→0. Disabled only while handlers are unavailable, then existing controls work normally. This is not full accessibility or interactive production certification.

Costs: existing local readiness hook, small JS/markup/render change, no new productive IO, supplier, email, key, field in stored data, retention or retry. CI and full cost are not assumed zero. New full CI/mobile/accessibility checks required. MR/TX/FX275 and financial coverage/reviews/flags/prices/rights/consent/creator data/IDs remain unchanged. Counter254 held.
