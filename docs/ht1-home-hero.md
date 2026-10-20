# HT1 — home hero

Owner task HT1,20October2026; main queue item183. Reuses app/page.tsx and its existing HomeActions.

The hero leads with “Sell your work. Build your business.” and a first-sale→next-offer journey. This is an invitation to use existing tools, not an earnings forecast or a guaranteed sale. The ownership pillar remains exactly “Your store. Your Stripe. Your money.” Stripe processing fees and the existing availability/price copy remain unchanged.

The single prominent hero link is “Start your store” to the existing /signin setup route. The demo remains a secondary text link. The same setup action repeats in the existing HomeActions at the larger button size. This changes no registration, checkout, opt-in or paid-sale behavior.

Only existing text/layout/classes change: no new API read/write, model/provider request, image, storage or runtime service. Existing prices, limits and all opening/tax/commercial gates remain intact. No new variable per-client operation is introduced; the most-tax sales M0 remains failed and sales remain closed.

Synthetic browser coverage at390/1280 checks the headline/pillar, a single dominant hero CTA, existing destinations, large targets, repeated setup link, keyboard order and local GET navigation to sign-in, closed-sale notice, no API writes, no overflow and axe A/AA checks. No real account, submission, checkout or payment. Full final-head CI and exact production proof are required before a publication number; synthetic axe checks do not certify general accessibility.

CI also captures the public hero at both viewport widths as bounded JPEGs, for visual review before incorporation. These are verification output, not new public image assets.
