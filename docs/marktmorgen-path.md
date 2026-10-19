# Marktmorgen Path

**From first light to first sale.** *Every step is real. Every sale is yours.*

A path of short daily missions that takes a creator from a published store to
the first real sale, with levels after it. Approved by the owner on 18 October
2026 with five corrections (below). This file is the inventory the path was
built from, its rules, what it costs, and what it will not do.

Status: **built behind the studio, nothing on sale.** `PLANS_ON_SALE`
(`lib/opening.ts`) is false, so no store can take a real order today: the
first six days can be done for real, the seventh (a real paid order) cannot
until sales open. Both the test purchase and the real order are built and
tested end to end against Stripe's test mode with synthetic records
(`tests/path-facts.test.ts`).

## 1. What every store already records (the inventory)

Nothing in the path counts anything new. Each mission closes on a record the
store already keeps; the table says which, and what the path does with it.

| Record | Where | What the path reads it for |
| --- | --- | --- |
| The store's name and line (`name`, `bio`) | `lib/store.ts`, the store's own record | Day 1, "title published": both non-empty on the public page |
| The catalog: listed items, each listing's `file`, `link`, `course`, options' files | `lib/store.ts` (`catalog.items`, `catalog.head`, `catalog.inline`), `lib/catalog.ts` (`KIND.hidden`) | Day 2, a listed product with something to hand over; First Light |
| Paid checkouts on the creator's own Stripe account, with `livemode` | `lib/stats.ts` `readPaidSales` (the same ledger the five-minute job `watchStripe` in `lib/webhooks.ts` walks for `checkout.session.completed`) | Day 3 (a paid checkout with `livemode: false`), Day 7 and the levels (`livemode: true`) |
| Refunds on the creator's Stripe account | `lib/stats.ts` `readRefunds` (exported as `readStoreRefunds`), the source of `charge.refunded` in `lib/webhooks.ts` and of the rule in `lib/refunds.ts` | A refund in full takes a real sale off; every refund is taken off the money |
| Visits by where they came from, all time (`r:<source>`) and visitors (`u`) | `lib/stats.ts`, the all-time record `nl:stats:<id>:life` (now readable whole with `readLifeRecord`); sources named by `lib/source-rules.ts`; the channel a buyer is credited to by `lib/visit-channel.ts` | Day 4 (a visit from a social network), traffic missions |
| Addresses left on the store, by channel (`fs:<channel>`) | `lib/stats.ts`, counted by `app/api/store/free/route.ts` (a free product asked for) and `app/api/store/join/route.ts` (the sign-up box) and `app/api/store/waitlist/join/route.ts` (`kind: "signup"`) when the store sends its confirmation email | Day 6, "first lead"; traffic missions. An import (`lib/imports.ts`) never counts: imported contacts are not `fs:` |
| Short links made for posts | `lib/short-links.ts` (now `countLinks`, one `HLEN`) | Day 5 (three links), traffic missions |
| The list itself, its export | `lib/free.ts`, `lib/contacts.ts`, `app/api/store/leads/route.ts` | Not read by the path (see §6, open decision 2) |
| The 14-day trial | `lib/plan.ts` `TRIAL_DAYS` | The path runs the same in the trial and on every plan |
| Phone notifications (Web Push) | `lib/web-push.ts`, `lib/phone-alerts.ts` (`PHONE_EVENTS`) | The path's reminder (second PR) |
| Trial nudges (two emails, days 3 and 9) | `lib/trial-nudges.ts` | Kept as they are; the path sends no email of its own |
| "Getting your store ready" steps | `components/studio-start.tsx`, built in `app/studio/page.tsx` | Kept; the path starts where they end. Their "Buy it once yourself" step asks for a live purchase; the path never does (Day 3 is test mode only) |
| The store coach | `lib/store-coach.ts` | Kept; read beside the path, never mixed into it |
| The month's sales goal | `lib/sales-goal-rules.ts`, `lib/sales-goal.ts` | The goal's reader (`readGoal`) bounds the onboarding's goal; the path's goal is the person's own and separate from the month's goal |

### What was missing, and what this adds

- **A record of the person's path**: `nl:path:<sid>` (`lib/path.ts`), one JSON
  value: the four answers and time zone, when the path began, the days opened
  (the latest 60), the best level reached and when, and the last reading of
  the money and the counts. Counted in the store's data room (slot `path`,
  `tests/store-data-registry.ts`). **No mission is ever stored as done.**
- **Three narrow readers** for records that were kept but not readable from
  outside their file: `readLifeRecord` and `readStoreRefunds` (`lib/stats.ts`)
  and `countLinks` (`lib/short-links.ts`). No write path changed.
- **The rules** (`lib/path-rules.ts`, pure), **the facts** (`lib/path-facts.ts`),
  **the route** (`app/api/store/path/route.ts`: `start`, `forget`).

## 2. Rules (the owner's, with the five corrections)

1. **Progress only from verified events.** `PathFacts` is the only input to
   a mission's state, and nothing a person presses can close one. Orders and
   refunds are read only from the creator's own Stripe account, server side
   (status `complete`, `payment_status: paid`, this store's metadata, never a
   tip or a payment request, never a thanks page). A refund in full takes the
   sale back off Day 7. **Levels never go down**: the best level ever reached
   is the one thing remembered (`levelKept`).
   *How "after the webhook" is read:* the five-minute job reads Stripe's
   events from the same account; the path reads the same paid checkouts and
   refunds directly from that ledger when the owner opens it (reused for ten
   minutes). Nothing reaches the path that Stripe did not confirm, and a
   refund made in Stripe's dashboard counts on the next reading.
2. **Onboarding: four questions.** The person's own monthly income goal (kept
   only as their goal, shown as "Your goal: $X a month. It is yours, and
   nothing here predicts it."; never a forecast, never compared), what they
   know and want to make something about, 15, 30 or 60 minutes a day, and
   where their audience is (Instagram, TikTok, YouTube, an email list, nowhere
   yet). The time zone comes from their browser, so days and quiet hours are
   theirs.
3. **Seven days closed by events**, in order: title published; a product with
   a file; a test purchase **in Stripe's test mode only**; the first visit
   from a social network; three post links; the first lead; the first real
   paid order. On a store whose checkout runs live, Day 3 is shown as not
   available, never asked for with a real card, and never holds the path
   back. **Then traffic missions** (social visits, post links, leads,
   visitors) until the first sale. **No failure screen**: a day not done is the
   day to do next; there is no "missed" or "behind".
4. **Levels by cumulative real money kept** (paid live orders less refunds,
   in the store's currency): First Light (title and a product), Sunrise (the
   first real sale), Morning $100, Midday $1,000, Golden Hour $10,000, Zenith
   $100,000; other currencies on the scale `lib/money.ts` already sets prices
   on, never a conversion. Never "Hero" or "Games" (`FORBIDDEN_MARKS`).
5. **Streak**: the days the owner opened the path, in their own days. Sunday
   never breaks it; two other rest days a week are free; today is never a
   missed day. Nothing is bought to keep it.
6. **Quiet hours**: no notification from 21:00 to 08:00 in the person's own
   time (`mayNotify`).
7. **Words at no cost.** Every mission's text is a template filled with the
   person's answers. AI is only ever an option the person presses, from the
   plan's existing AI allowance with its reservation, **never in the trial**,
   and **AI never decides completion**.
8. **Ranking** (third PR): opt-in, by missions done only, never money, with no
   real name by default.
9. **Share card** (third PR): the level and the days on the path; dollars
   only if the person turns them on.
10. **Every plan and the trial** have the whole path.
11. **No "Studio pays for itself from $3,629" or "Scale from $7,273"** (an old
    commission list; a sale carries 0% today). A plan change is shown only
    near a limit, with the person's real usage, computed by code (second PR).
12. **Forbidden phrases**, tested on every text the path can draw
    (`tests/path-words.test.ts`): "make money online", "financial freedom",
    "replace your job", "passive income", any amount earned, "get rich",
    six- or seven-figure, "pays for itself", and the two figures above.
13. **Notifications**: in the studio and by push only; email only within the
    plan's own email figure.
14. **Accessible**, and one visual: the logo's sun rising in a progress ring.

## 3. Days 3 and 7 while sales are closed

`PLANS_ON_SALE` is false, so `canSell` refuses every real checkout. In a
deployment whose Stripe Connect runs in test mode (`isConnectInTestMode`,
`sellsInTestMode`), every store's checkout is a test one: Day 3 closes on a
real test purchase made with Stripe's test card, and Day 7 says plainly that a
real order can only come once the checkout runs live. `tests/path-facts.test.ts`
plays Stripe with synthetic sessions and refunds (test mode, live mode, a tip,
a payment request, unpaid, another store's, a full and a part refund, refunds
not listed in full) and walks the record end to end.

## 4. What it costs, and how the 60% floor is kept

- **The record**: one value of at most a few kilobytes, in the store's data
  room (`takeData`, slot `path`, set, so a rewrite never grows the room by
  more than it weighs), written only when something changed.
- **A reading of the money and the counts** (`visitPath`): the numbers'
  all-time record (up to `LIFE_WRITE_MAX` fields), one `HLEN`, and up to
  `PATH_SALE_PAGES` + `PATH_REFUND_PAGES` pages of the creator's Stripe
  account. It takes `PATH_READ_UNITS` (8) of the store's studio requests first
  (`countStudio`), at most once every `PATH_MONEY_SECONDS` (ten minutes);
  `tests/plan-cost-registry.test.ts` holds 8 studio requests above its cost at
  every ceiling (`PATH_READ`). When the studio's figure has no room, the path
  shows the last reading with when it was read and never pauses the studio
  for it. So the path adds no cost line: every request it makes is a studio
  request of the plan's own figure, which `tests/spend-floor.test.ts` already
  holds to 60%.
- **No email, no model call, no new counter** in this first part.

## 5. Privacy and erasure

The record is the store owner's own (`lib/person-data.ts`, "account"): their
answers, days and level, nothing about a buyer. It is deleted from the path
(`forget`), with the store (`app/api/store/stores/route.ts`) and with the
store's closing (`lib/closed-store-data.ts`, `prepareStore`). The privacy
policy says so (`/privacy#path`).

## 6. Open decisions for the owner

1. **"Midday"** is also the name of a business app for freelancers and founders
   (midday.ai). Proposed in its place: **"High Sun"**. One line
   (`LEVEL_NAMES`) changes it.
2. **What a lead is.** Today: an address left on the store, counted when the
   store sends its confirmation email (`fs:`), so an import never counts. The
   stricter reading, an address that used its confirmation link, would need
   either a walk of the list or a new counter on the confirmation; not built.
3. **PayPal sales** carry no test mode and are not counted toward Day 7 or a
   level yet.

## 7. What it will not do

- It will not mark a mission done because somebody pressed something.
- It will not predict, promise or compare earnings, or show anybody's money
  to anybody else.
- It will not ask for a real purchase of one's own; the test purchase is in
  Stripe's test mode only.
- It will not take a level back, and it will not show a failure.
- It will not notify between 21:00 and 08:00 in the person's own time, or send
  email outside the plan's own figure.
- It will not use AI in the trial, or let AI decide that a mission is done.
- It will not put a person on a ranking they did not join, or under their
  real name by default.

## 8. How it is split for review

1. Inventory, rules and events (this): `docs/marktmorgen-path.md`,
   `lib/path-rules.ts`, `lib/path-facts.ts`, `lib/path.ts`,
   `app/api/store/path/route.ts`, the three readers, the registries, the
   privacy policy, erasure, and the tests.
2. The studio page, onboarding, the reminder, the plan line near a limit, the
   feature page.
3. The ranking and the share card.

## 9. Mission guidance in the studio (19 October 2026)

The mission list shows each existing count as a visible fraction and a named
native progress meter. Each open mission has a native keyboard-operable
disclosure with its existing steps and a link to that store's studio destination.
Opening instructions changes no mission state, sends no request and uses no AI.
Recorded and unavailable missions have no action; in particular an unavailable
test purchase never exposes test-payment instructions on a live checkout.

The largest mission list stays below 30 KB of the existing Path page's 70 KB
response bound; no supplier request, storage family or quota is added.
The browser checks the keyboard disclosure, scoped link, unchanged mission state,
and expanded instructions at 390 and 1280 pixels with axe and no overflow.

## 10. Campaign discovery from a mission (19 October 2026)

An open product or sale mission links to the existing sales campaign category.
An open lead mission or lead traffic target links to the audience category, with
a clear distinction: a campaign form response alone is not a Path lead. The Path
confirmation sources in section 1 remain unchanged. Test purchases, unavailable,
recorded and unrelated missions have no campaign suggestion.

The link keeps the chosen store, validates the category against the gallery's
allowlist and scrolls to the gallery. It neither imports a campaign nor spends a
preview or AI request. Changing filters stays local; choosing a starter still
uses the existing metered preview, product mapping and capacity checks.
There are no new provider calls, stored records, quotas or prices.
