# Standard field keyboard-focus paint

The generic :focus-visible outline was overridden by the more specific,later
.field:focus rule,which removed the outline and used a1px border plus a faint
shadow. Standard fields now keep an opaque3px deep-indigo outline offset3px,
with an opaque3px white inner band. Invalid borders remain red. These two
bands are more than9:1 apart,helping at least one remain distinct on flat
light,dark and intermediate surfaces.

Forced-colors uses the system Highlight outline and no shadow,with the
browser's normal forced-colour adjustment retained. No native control is
replaced,no focus order/value/submission is changed,and there is no layout shift.

## Evidence and limits

The disposable Chromium test uses actual Tab navigation and screenshot crops
before/after focus. The browser's own PNG decoder and OffscreenCanvas compare
the same pixels,excluding the component's original border/content/caret.
Pixels changing by at least3:1 must cover at least the conservative rectangular
2px-perimeter area4w+4h. Screenshots stay in memory; none are saved or sent to
another service. Fonts are ready and animations are suppressed for measurement.

Real sign-in fields are checked at320/390/768/1280. Explicit synthetic flat
white/navy/middle-grey surfaces exercise native input/select/readonly textarea
and invalid fields. The prior suppressed-outline/faint-shadow styling is
reproduced only in the fixture and must fail this pixel guard. Forced-colours
emulation also checks actual paint for native input/select/textarea.

This is narrow,repeatable evidence for selected standard controls,not full
WCAG2.2 AAA conformance. Real Windows high-contrast settings,other browsers/OS,
all clipping/occlusion states,custom creator fields,screen readers and people
with varied access needs remain unverified. The in-app browser connection timed
out; no live-production keyboard inspection through it is claimed. Full
programme/open scope remains in docs/accessibility-programme.md.

Source: [W3C focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html),
reviewed19 October2026. It describes a minimum2px-perimeter area and3:1 change
between the same pixels in focused/unfocused states; a visible outline alone
does not prove the whole criterion across a product.

No provider/AI call,key,price,allowance,fiscal/commercial gate or payment change.
