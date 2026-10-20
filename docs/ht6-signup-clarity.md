# HT6 — Signup clarity
The existing email-link form already has one visible email field, no password and no card input. Its truthful Email me a link action, anti-bot protection, passkey/returning login and consent/legal wording remain intact. No request is added.

New-creator /signin shows every canonical monthly price first, then explains card-free setup and that requesting a link neither subscribes nor charges. With PLANS_ON_SALE=false, setup is explicitly not an active trial/free paid plan and paid selling remains closed.
When sales become available through the existing gates, trial wording is conditional on an eligible first store; returning/additional stores are not promised a trial. Selected annual/monthly plan acknowledgment stays intact. Returning login stays focused.

Static text/layout only; no new provider, storage, account, email or payment operation. Prices/limits/consent, M0/tax/art9a/commercial gates unchanged.
Synthetic browser390/1280 verifies canonical prices, one visible email field, no card/password field, truthful CTA, eligibility/closed copy, returning flow, axe and width. It makes no login request or external submission. Complete final-head CI and ordered production proof required.
