<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


## Owner requirement: customer-level net margin

Every paying customer, taken one at a time and using every entitlement of its plan at the maximum in the worst month (commission on sales counted as zero), must meet a minimum 60% net margin after all applicable taxes and all variable costs. Do not use average customer consumption or cross-subsidies to pass an unprofitable customer. Include annual discounts and overages. Never count a supplier's free quota as zero cost; use the paid unit price at its most expensive tier. If a plan misses 60%, fix it by REDUCING that plan's limits, never by changing its price, and enforce the limits automatically with per-supplier spending ceilings: the owner will not watch dashboards or act on alerts.

The owner's own rule (16 Oct 2026) puts two things outside the per-customer unit, and both stay mandatory:

- **Fixed costs** (tool subscriptions, domains, the LLC's compliance costs, split 50/50 with Hazelsong) are computed separately as the minimum number of paying customers needed to cover them. The whole company must reach 60% after all US and Brazilian taxes in the worst case (everyone using everything at once); release needs that minimum base, never a smaller one.
- **Free trial, the money-back refund, non-payment and post-cancellation retention** are funded exposures: each has a calculated maximum cost, is kept low by limits, is bounded by occurrence caps and is paid from a reviewed company exposure ceiling added to the fixed costs above (docs/funded-exposure-review.md). They are never waived and never offset by another scope's profit.

Unknown taxes, unbounded costs and missing reviews do not count as zero: they keep release closed. Use 27.5% (the Brazilian individual top rate) as the minimum profit-tax stress rate until an accountant confirms a higher combined rate. Paid commercial release stays closed while the review in lib/commercial-margin.ts is absent or fails. Existing operating-margin tests are not proof of all-tax net margin. Do not claim that this requirement is satisfied merely because a guard or a calculator was added.
