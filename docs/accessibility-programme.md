# Marktmorgen accessibility and experience programme

The user's19 October2026 brief sets WCAG2.2 AAA as a starting point, plus practical
inclusion, cognitive clarity, usability, performance and reliability. It remains
a programme in progress, not a claim of whole-product conformance or superiority.
The original Path, customer-sales and60% net-margin goals and commercial gates
remain in force.

## Scope and evidence

The inventory lists124 page templates,283 shared TSX components,309 API route
sources,4 layouts and3 error/not-found/loading boundaries at its source revision. Dynamic
templates and integrations have many states; a listed source is not a tested
journey. A test guard detects added/missing sources so the scope cannot silently
shrink. Each group still needs appropriate manual and automated assessment.

First implementation: the shared secondary text greys and standard field
placeholder become darker. Muted text moves from 5.49:1 to 9.42:1 on ivory and
from 5.98:1 to 10.26:1 on white (W3C relative-luminance calculation). The selected
flat light palette has at least7.34:1 for muted text; tests hold both secondary
tokens above7.25:1. Standard placeholders use that grey with opacity1, avoiding
browser-default fading. This is narrow palette evidence, not all rendered text.

Browser tests use actual compiled styles on selected leaf secondary-text nodes,
with axe's colour-contrast-enhanced rule. They cover the existing390/1280
Funnels/Path flows, add320/768 layout checks, and check sign-in at320/390/768/1280
including its computed placeholder style. Existing AA,keyboard,manual refresh,
clipboard fallback and privacy browser tests remain. No real payment/email.

## Open work

Semantic/action colours, gradients, dark and creator-configured themes still need
context/size-aware enhanced-contrast review. The inventory records known palette
pairs below7:1 rather than treating them as passed. All page/process states,
zoom/text-spacing,orientation,keyboard/focus/drag alternatives,media,plain language,
errors/help and cognitive usability require broader review.

NVDA,JAWS,VoiceOver,TalkBack,all OS/browser combinations and sessions with people
with varied access needs have not been conducted here. Chromium automation is not
a screen-reader or human usability study. No benchmark against another product,
latency-percentile comparison or sales uplift is claimed. Performance needs
controlled representative tasks and network/device measurements.

## References reviewed19 October2026

- [WCAG2.2](https://www.w3.org/TR/WCAG22/) — full pages and complete processes matter.
- [Contrast enhanced](https://www.w3.org/WAI/WCAG22/Understanding/contrast-enhanced.html) —7:1 for normal text,with exceptions; colour math is not the whole standard.
- [WAI evaluation tools](https://www.w3.org/WAI/test-evaluate/tools/list/) — tool evidence informs the audit.
- [GOV.UK accessibility](https://design-system.service.gov.uk/accessibility/) — component reuse still requires service research/design/testing.
- [Microsoft Inclusive Design](https://inclusive.microsoft.design/) — diverse lived experiences inform practical inclusion.

Changes affect shared readability and test/documentation coverage only. No AI,
provider call,record,price,allowance or fiscal/commercial gate change.

## Standard field focus follow-up

Delivery19 strengthens standard field focus and measures actual Tab paint area,
including forced-colours emulation and synthetic invalid/readonly/select cases.
See docs/accessibility-field-focus.md. This partially addresses the standard
field focus entry; custom fields,all journeys/clipping and manual assistive/user
coverage remain open.

## Store fields and placeholder follow-up

Delivery20 gives store .st-field controls an opaque two-tone keyboard focus and
system outline in forced colours; scoped native-control screenshot checks use
the actual production palettes. See docs/accessibility-store-field-focus.md.

Delivery21 removes the faded creator-field placeholder and uses the theme's
primary text colour at full opacity. Computed pseudo-element and background
colours are measured in synthetic Chromium inputs for four themes/ten presets,
textareas on four theme cards with a custom accent,and four viewport widths.
The tests require7:1 after opacity compositing and confirm the example is
actually shown; a negative control must reject the former faded Night style.
Typing still replaces the example. Visible labels remain separate.

This fixes the shared style,not every buyer journey or custom override.
Read-only/disabled/error states,all browser/OS/assistive technology,real-user
research and whole-product AAA remain open. No sales uplift or margin proof
is inferred from this readability change.

## Sign-in error copy

Delivery22 separates light-surface error text from the brighter error-border
token. The actual sign-in inline format hint uses the darker text token;the
existing error notice uses the same value through the token. Border colours
and other red actions do not change. This is scoped evidence,not a wholesale
semantic-colour pass.

Synthetic browser cases at320/390/768/1280 trigger blur/invalid submit/empty
submit/correction. Enhanced-contrast axe checks must have actual passes,no
violations and no incomplete readings on the visible hint/alerts. Tests also
check field descriptions,invalid state,a single alert,correction cleanup and
zero login API requests. Requests are intercepted locally;no message is sent.
Other routes,colours,assistive technologies and user research remain open.

## Shared success copy
The shared light-surface live tag and success notice use a separate darker
success-text token on their existing mint surface. Existing mint action/border
tokens, messages, status behavior and all commercial controls are unchanged.
A palette guard requires7.25:1 reserve. Synthetic native samples in the real
built app at320/390/768/1280 use actual shared CSS and axe enhanced contrast,
with actual passes and no incomplete results. At390 a negative control must
reject both former colours, then the restored styles must pass again.
This is component-level evidence; it does not certify every rendered route,
custom override, screen reader or whole-product AAA.
