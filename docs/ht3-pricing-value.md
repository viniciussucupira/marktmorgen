# HT3 — value before plan prices

Owner HT3, queue item185. Both existing price sections reuse one static PricingValue component: the home #pricing section and /pricing. The ten requested benefit groups link to existing feature pages, and appear before the existing plan-price markup. Plan prices, annual terms, visible limits and add-ons are unchanged.

The contrast reuses lib/competitor-prices.ts and feeWords(), not a new fee model. The existing browser-only ToolsCalculator remains the calculator; no new submission or API is added. Fee scope is qualified by currency/threshold, extra processing/withdrawal/tax charges and transaction-specific confirmation. No promise of a lower total bill, equivalent features, profit or earnings.

Official sources rechecked October20,2026:
- https://hotmart.com/en/pricing — Hotmart advertises no recurring subscription price and a per-sale charge.
- https://hotmart.com/en/legal/payments-policy — September21,2026 English policy, section5/tables: current fixed USD fee and microtransaction bands. English policy takes precedence under its own terms.
- https://suportehotmart.zendesk.com/hc/en-us/articles/208298448-What-are-the-fees-charged-by-Hotmart — updated general-fee table and Player FAQ agree with the newer fixed fee; an older currency-mismatch sentence still mentions the former amount. Confirm the applicable transaction quote. No separate legacy Player fee is added.

Existing repository facts were already current; they are preserved. The UI links to the same sources and displays the existing read date. Public wording summarizes fee models and does not provide individualized tax advice or certify Marktmorgen's margin.

Only static text/layout/data change: no provider/account read, stored record, model call, image or runtime operation. Feature links disable prefetch. Sales remain closed; no price, visible allowance, commission, tax/art9a/commercial/opening gate changes.

Unit tests resolve all ten categories to existing feature pages and check reuse of dated official scope. Synthetic local browser checks at390/1280 on both routes verify placement before prices, all categories, keyboard targets, source/scope/availability/calculator links, overflow, axe and no API writes. No real account, signup, payment, checkout or message. Full final-head CI and exact production proof are required before publication.
