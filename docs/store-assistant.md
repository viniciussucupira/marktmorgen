# Store assistant (paid add-on), 17 Oct 2026

One add-on, **Store assistant, $49 a month per store**, on any plan once the plan is paid (not during the trial). It has three functions that share one monthly pool of AI replies, built in this order:

1. **24/7 store Q&A chat** on every page of the store, grounded only in the creator's own published products, pages and FAQ. **Built here** (`lib/store-assistant-rules.ts`, `lib/store-assistant.ts`, `components/store-assistant.tsx`, `app/api/store/assistant`).
2. **After-purchase next-product offer** chosen among the creator's own products. Follow-up, design below.
3. **Abandoned-cart recovery email.** Follow-up, design below.

It is published but **not sold**: `ASSISTANT_ON_SALE` (`lib/opening.ts`) is `PLANS_ON_SALE && assistantMeetsFloor()`, and `PLANS_ON_SALE` stays false behind the commercial review and the most-tax reading (`docs/tax-uncertainty.md`). The checkout route refuses with `assistant=not-open` and never reaches Stripe.

## Market (read 17 Oct 2026, scratchpad research, official pages)

- Kajabi Sales Agent: $79/month per agent on a $179+ plan, 1,000 messages + 250 AI credits, hand-over to a person is manual only ("does not escalate automatically"), lead capture by email only, GPT-5.4.
- HighLevel Conversation AI (H36): Growth $50/month for 1,000 agent responses; Unlimited $97 "fair use".
- Circle agents only on Scale ($419) / Plus; Thinkific Thinker only on Plus; Stan, ClickFunnels, Skool: no buyer-facing agent; Hotmart Tutor answers "as if it were you" (what this must never do).

How this one is different, each in code: works on every plan; hands over by itself (keyword pre-check before any model call, and the model's own `handoff` status) into the existing inbox with the buyer's email; refuses in code any reply with a number, a deal word, a code or a link that is not in the creator's own published words (`heldToFacts`); the AI label is drawn by the page and sent by the server, never written by the model; the chat becomes a no-AI "leave your question" form when the month is used. It gives fewer replies a month than Kajabi or HighLevel (700): that is what the owner's 60% floor allows at $49 with every cost counted, and the page says the number.

## Cost per message and the allowance (binding)

Model: **Claude Haiku 5.5**, the cheapest current model (platform.claude.com pricing, re-read 17 Oct 2026: $0.10 in / $0.50 out per million tokens for prompts up to 100,000 tokens; $0.50 / $2.50 above, which the 24 KiB cap never reaches). Fixed in `ASSISTANT_MODEL`, not overridable by a deployment setting.

Worst case of one message, `assistantMessageWorstMicroUsd()` = **$0.003539**:

- model hold at the caps (`ASSISTANT_INPUT_BYTES` 24,576 bytes counted as tokens + framing, `ASSISTANT_OUTPUT_TOKENS` 320), the cost table's 10% provider allowance (invoice tax, FX, remittance to the provider) and the 45-second function wait at 2 GB: **$0.003339** (`aiRequestHoldMicroUsd`, `lib/spend-cost-table.ts`);
- the message's own database work: 40 commands, the store record (1 MB at most), 40 products and 6 stored pages read, the conversation read and written, and a day of keeping it plus four months of one unanswered question: **$0.000200**.

One payment of $49 at full use (`assistantMonthWorst()`), all in whole cents rounded up:

| Line | Cents |
|---|---:|
| Dearer provider's fee on the whole (tax-inclusive) amount: Stripe 2.9% + 1.5% international + 1% conversion + 0.7% Billing + 0.5% Tax = 6.6% + 30¢ (Paddle 5% + 50¢ is cheaper) | 354 |
| Remittance allowance, 1.5% | 74 |
| Dispute reserve: 1 payment in 100 lost with both $15 fees | 79 |
| Refund reserve: 1 payment in 100 refunded (refunds only where the law requires) | 49 |
| AI: 700 replies at the worst | 248 |
| **Total** | **804** |
| Most a payment may cost and keep 60% after 27.5% (P × 5/29, `maximumPretaxCostCents`) | 844 |
| Room kept (`ADD_ON_ROOM_CENTS` ≥ 25) | 40 |

Net after 27.5%: **60.59%** (`assessCustomerWorstCase`, integer cents). 750 replies would leave 22¢ of room and 800 only 4¢, below the 25¢ kept; 700 keeps it. Under the most-tax reading (VAT 27% inside the price, US 37%, Brazil 27.5% without credit, IOF) the add-on keeps about 27%: it fails like everything else, so it stays closed.

Emails and inbox messages a hand-over makes are taken from the plan's own figures (`inbox`, `store-email` lines of `tests/plan-cost-registry.ts`) and refused past them, so a plan's worst month is unchanged by the add-on. Non-AI requests of the chat (read, delete, hand-over) are public requests of the store's window (`withinStore`).

The registry line is `ADD_ON_LINES` → `store-assistant` in `tests/plan-cost-registry.ts`; `OPEN` stays `[]`. The terms are bound into `CURRENT_COMMERCIAL_TERMS.storeAssistant` (schema 19), so any change invalidates an earlier review.

## Enforcement (before every model call)

`nl:assist:pool:<statsId>:<add-on period start>` holds the month in micro-USD (`ASSISTANT_POOL`, one Lua script, real-Redis test `scripts/test_assistant_pool_redis.py`):

- `reserve` this request's own worst cost before the fetch; refused (0) when the pool cannot hold it → the chat becomes the creator form, no AI cost;
- `settle` at what the model billed (its `usage` token counts at the same rates and allowance, plus the fixed parts), giving back the rest;
- `release` whole when the provider answered with an error status (not billed); a timeout or lost connection may have been billed, so it is settled at the full hold;
- the cap a month opened with is kept and only ever lowered; the key expires 40 days after it opened.

The window is the add-on's own paid month (`assistantWindow`), with the same two-day renewal grace as `lib/allowance-window.ts`; unknown is closed. Only `status: active` answers (no grace for an unpaid month of AI). Burst limits: 10 per visitor in 10 minutes, 40 a day, 20 per store a minute.

## Billing

Its own monthly Stripe subscription on the store's existing customer (`lib/assistant-billing.ts`): a yearly plan cannot carry a monthly line, and `planOf`/`periodStart`/`tier-switch` read a subscription's first item as the plan. Metadata `addon=assistant`, `assistant_for=<handle>`, never `store`, so `findStoreSubscriptions` and the daily sync never read it as a plan; `failedPlan`/`dueReminder` pass it over. The first payment asks for 3-D Secure. The daily sync (`lib/billing-sync.ts`) brings it in line, ends it at once on a disputed payment (and never sells it to that store again), and sets it to stop at the period's end when the plan is no longer paid.

## Privacy

Kept: the conversation for 24 hours after its last message under a random token in the buyer's browser, with addresses, phone numbers and links taken out (the model never sees them either); deletable at once ("Delete this chat"). Unanswered questions for the creator for ~4 months, never who asked. A hand-over goes into the inbox with the email the buyer typed, kept and erased as the inbox is (180 days, `lib/person-erasure.ts`). Registry: `lib/person-data.ts`. Privacy policy `#store-assistant`, Terms `#store-assistant`, Refund Policy `#store-assistant`.

## Follow-ups (not in this PR)

**(2) After-purchase next product.** On the thanks page after a paid order, one offer chosen by the model only among the creator's own published, purchasable products the buyer does not already own, with one sentence of why taken from the product's own summary; never a discount, never a countdown; shown once per order. Draws one reply from the same pool, reserved like a chat message (`ASSISTANT_POOL`), and falls back to the creator's static choice (`lib/upsell.ts`, `product-extras`) when the pool is spent. Cached per (order's products, catalog hash) for a day so repeated thanks-page loads cost nothing. Reuses `assistantFacts` with the catalog only, `heldToFacts` on the sentence, the AI label on the card.

**(3) Abandoned-cart recovery email.** Only to an address typed at checkout with the existing consent rules of `lib/checkout-recovery.ts` (its stop link, its one-a-week mark, CAN-SPAM; the owner to confirm the EU basis, consent or legitimate interest). The model writes two sentences in the buyer's language from the product's facts, and, if the buyer asked the assistant something in the same browser, answers that question from the facts; no discount unless the creator published one, no scarcity. One reply from the pool per email; the email itself from the plan's store-email figure. Falls back to the existing fixed reminder when the pool is spent. Needs the cart-to-conversation link (the chat token on the checkout session) and a per-email reservation in the same script.

Also open: the buyer-language bridge (the creator reads a handed-over question translated and their answer goes back in the buyer's language) and citing the source block of each answer in the chat.
