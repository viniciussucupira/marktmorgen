# Agentic commerce — item 204

Status: internal foundation only, not a public feed or working agent checkout. Consulted 2026-10-21. AGENTIC_COMMERCE_APPROVED=false. No route imports the projection; no opt-in setting, provider upload, checkout hook, account onboarding or public capability is enabled.

The pure projection in lib/agentic-catalog.ts copies an explicit public field allowlist from an existing listing. It preserves creator text and persisted product IDs and reuses productSegment. It requires explicit creator participation, a published store and independently checked checkout readiness. A discriminated stock reading distinguishes unknown from known unlimited; limited products cannot use an unlimited reading. Complex prices, variants, bookings, bundles, shipping and license pools are refused until verified representations exist. This is deliberately an internal data shape, not a claim of Stripe, ACP or UCP schema compliance.

A future caller must reuse visibleIds/readPage (24 listings per page) and existing admission, permission and cost controls. listingOf includes delivery files/links and is not a public privacy boundary. Do not spread listings into a feed. Do not read the entire catalog on each request. Stock readers can make provider calls and writes; do not invoke them as an unbudgeted feed refresh. Unknown availability must not become in-stock. Existing buyer languages, content and IDs remain unchanged.

Sources read on 2026-10-21:
- [Google UCP overview](https://developers.google.com/merchant/ucp/guides/overview), updated 2026-10-19: Google participation requires Merchant Center configuration and approval. Checkout, cart handoff, signed profiles and payment handlers are distinct requirements.
- [Google UCP](https://developers.google.com/merchant/ucp): the seller retains merchant responsibility; an open standard is not Google launch approval.
- [Stripe platform guide](https://docs.stripe.com/connect/saas/tasks/enable-in-context-selling-on-ai-agents): platform access requires US business eligibility and waitlist approval. Direct charges are supported and keep the connected account as seller; destination charges are excluded by owner policy. Examples use 2026-09-30.preview.
- [Stripe catalog feed](https://docs.stripe.com/agentic-commerce/concepts/catalog-feed.md): stable per-variant IDs, explicit deletion, asynchronous processing and discovery-only mode. Omission under upsert does not delete stale products. Missing manufacturer identifiers must not be invented.
- [Stripe retail](https://docs.stripe.com/agentic-commerce/sellers/use-cases/retail.md): managed checkout differs from own UCP checkout; availability varies.
- [Stripe token index](https://docs.stripe.com/agentic-commerce/concepts/shared-payment-tokens.md): Connect token details require further verification; the variant document was inaccessible through the research tool.

Open work: verify the exact current ACP specification and provider feed schemas, product eligibility, Standard-account permissions, token scope, replay/idempotency, signed hooks, refunds and order lifecycle. Do not claim ChatGPT, Google or Stripe compatibility from this helper. No provider sandbox submission is allowed under the owner's synthetic-only instruction.

Costs and gates: current pure helper has no network, storage, provider usage or dependency. Operational costs are unknown and therefore fail approval. Before any operation, calculate each Store/Studio/Scale monthly and annual plan at 100% rights in the worst month, with highest paid provider rates, reads, bytes, refresh cadence, hooks, support, all Brazil/US taxes under the most onerous reading, per-client and consolidated 60% minimum, automatic caps and advance reservation. Stripe's suggested periodic updates are not a free budget. Existing prices, visible limits, commission, PLANS_ON_SALE, tax gate, art. 9a and commercial review remain unchanged.

Owner-only prerequisites, recorded without requesting or executing them: provider eligibility and onboarding, contracts/terms, approval and verified commercial/tax review. Do not create accounts, join waitlists, accept terms, pay, submit catalogs or enable switches. Further internal implementation can continue with simulated providers.

## Pinned ACP feed adapter (2026-10-21)

Canonical source: [ACP repository](https://github.com/agentic-commerce-protocol/agentic-commerce-protocol/tree/7fdd78df677a94dce04c770644b0fbbb1401272b/spec/2026-04-17), commit 7fdd78df677a94dce04c770644b0fbbb1401272b (2026-07-18). The released snapshot is 2026-04-17; its changelog deprecates January. The website changelog and some checkout examples lag behind this revision. Do not infer the active wire format from those examples.

The pinned feed is an agent-hosted push interface. Merchants send partial upserts to agents; offline metadata.json/products.jsonl ingestion replaces the entire set. A merchant-hosted public JSON endpoint does not by itself implement ACP feed ingestion. No external submission or agent account was created.

lib/agentic-feed.ts maps only checked projection fields into a partial-upsert payload: product plus one simple variant, plain descriptions, uppercase currency and integer minor units, availability and published seller policy links. Exported IDs are storeId:productId to avoid cross-store collisions; persisted IDs remain untouched. Same-origin HTTPS links, duplicate rejection, 24-entry and 64,000 UTF-8-byte caps apply before return. Invalid batches are rejected whole. Out-of-stock entries remain present to update stale offers. This payload is never a full replacement and never deletes products omitted from a page.

The adapter has no route, reads, writes, network or new dependency. Tests use fictional fixtures only. AGENTIC_COMMERCE_APPROVED remains false; no public page advertises it. Operational approval, creator opt-in persistence, budget reservations, bounded refresh orchestration, actual upstream validation, deletion lifecycle, checkout, payment handlers and eligibility remain incomplete. Conforming to this selected data shape is not end-to-end protocol or provider certification.

ACP security/capability/checkout references consulted 2026-10-21:
- https://www.agenticcommerce.dev/docs/concepts/architecture
- https://www.agenticcommerce.dev/docs/concepts/security
- https://www.agenticcommerce.dev/docs/reference/checkout
- https://www.agenticcommerce.dev/docs/changelog

Bearer authentication, signed operations, supported-version negotiation, current payment handlers and constrained delegated credentials need separate implementation and verification against the pinned release. Existing creator direct-charge, tax, order admission and opt-in requirements remain binding. No new operational costs are assumed zero.
