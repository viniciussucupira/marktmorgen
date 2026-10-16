<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->


## Owner requirement: customer-level net margin

Every customer, including a single isolated customer using all entitlements, must meet a minimum 60% net margin after all applicable taxes and all costs. Do not use average customer consumption or cross-subsidies to pass an unprofitable customer. Include annual discounts, overages, free periods, refunds, non-payment and post-cancellation costs. Unknown taxes or unbounded costs do not count as zero. Paid commercial release stays closed while the review in lib/commercial-margin.ts is absent or fails. Existing operating-margin tests are not proof of all-tax net margin. Do not claim that this requirement is satisfied merely because a guard or a calculator was added.
