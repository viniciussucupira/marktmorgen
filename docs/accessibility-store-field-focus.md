# Store field keyboard focus — delivery20

Creator-facing pages share .st-field for buyer form controls. Its former focus rule removed the outline and painted only the chosen theme's soft wash. A keyboard user could lose their position.

A three-pixel opaque black outline at three-pixel offset and a three-pixel white inner band now identify keyboard focus independently of the chosen accent. Pointer focus retains the theme border; fields keep their sizes, values and tab order. Forced colours use the system Highlight outline with automatic colour adjustment and no shadow.

## Evidence scope

The existing disposable Chromium browser suite compiles lib/store-look.ts and applies its actual lookStyle variables to native synthetic controls. It measures real Tab focus using the delivery19 same-pixel screenshot helper, requiring at least 3:1 changed pixels across the area of a two-pixel bounding-box perimeter. Inputs cover four themes and all ten preset accents on theme backgrounds. Selects and read-only textareas cover all four themes on their card surfaces with a custom yellow accent. A Night/custom-yellow input also covers320/390/768/1280. Forced colours cover all three native control types. A negative control must reject the former suppressed-outline style.

These are scoped synthetic paint checks, not a claim about every actual buyer journey, custom background, clipping container, browser, OS or assistive technology. Placeholder opacity, semantic colours, whole-product AAA conformance and real-user research remain open. No external services, real buyers, payments or messages are involved. No fiscal/commercial gate, price or entitlement changes.

Criteria: [W3C focus appearance](https://www.w3.org/WAI/WCAG22/Understanding/focus-appearance.html).
