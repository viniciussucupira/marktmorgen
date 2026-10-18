# Copying a whole store into another store of the same account

Added 18 October 2026 (HighLevel's snapshots; item 4 of [zero-cost-value-2026-10-18.md](zero-cost-value-2026-10-18.md)). Code: `lib/store-copy-rules.ts` (rules, browser-safe), `lib/store-copy.ts` (reading, charging and writing), `addCopiedProducts` and `applyCopiedSetup` in `lib/store.ts`, `app/api/store/store-copy/route.ts`, `app/studio/copy/page.tsx` and `components/store-copy-panel.tsx`. Checked by `tests/store-copy.test.ts`, and in a browser by `tests/e2e/store-copy.mjs` (run in CI after the production build).

## What it does

The account's owner opens the store to copy, chooses another store they own, and presses See what it makes. The preview lists what the copy would make there, what it leaves out, and, when it does not fit as a whole, why. Copy then makes it there in steps, each one request.

Copied, as drafts: the products (words, prices, schedules, payment plans, introductory and yearly prices, checkout questions, boxes at checkout, offers after paying, pairings, bundles whose every product is copied, long descriptions and pages of blocks), each kept off the store until published; the store's own pages, out of the menu and kept back; the forms, quizzes and surveys with their questions and no answers; the funnels of pages, off. When the owner checks the box, the store page's setup too, replacing the other store's: the about line, theme, color, letters and background (not whether it shows the badge or its counts), links (without their pictures), social profiles (not email, WhatsApp or Telegram, which reach the creator in person), questions and answers, the order of the page's parts, sections and the line of news. Every product, page and form named anywhere is mapped to its copy; a reference to something not copied is dropped.

Never copied: customers, orders, contacts, emails, answers, reviews, numbers, payments, payout details, the Stripe or PayPal account, taxes, the domain, the email sender and its postal address, the team, integrations and keys, licence keys, thank-you notes, and every file and picture (the first store's storage). A call, a course, a private podcast, a package of calls, a product with options or licence keys, and a bundle holding something not copied are not copied, each named in the preview.

## Rules that must survive

- **Only the account's owner, only between its own stores** (`ownTarget`): a teammate, a store of anyone else and the same store are refused.
- **Nothing is cut to fit.** The first step plans the copy again from both stores as they are, and refuses it whole, writing nothing, when the other store has no room for every product, page, form or funnel, its data room for every byte, or its studio requests of the month for every step; or when the two sell in different currencies. The preview says which.
- **Charged before it writes.** Every request is one of the other store's studio requests (`countStudio`), and each step takes more of them before it writes (`charge`): reading the first store is paid for at what its records weigh in its data room, read in one command first, and each step at `unitsFor(commands, bytes)`, a studio request for at most 20 store commands or 40 KB through the database, never under four. A studio request is priced at 24 commands and 50 KB (`UNIT_COST.studio` in `tests/plan-cost-registry.ts`); the test holds that one of a copy's costs no more. So a copy is inside every plan's priced studio requests and adds no per-use cost, no cost line and no change to any limit.
- **Storage counted before writing.** Every product, description, page and funnel takes its room in the other store's data room before it is written, as everything a store writes does, and the progress record is counted until it goes by itself.
- **Done twice, nothing twice.** Every id a copy makes is `idFor(copyId, kind, sourceId)`: a step done again, after a failure, a lost answer or a second tab, finds what it made and adds nothing. One step runs at a time in a store (`nl:copy:lock:<sid>`, a minute), and a copy's id sent from another store is refused.

## Keys

| Key | What | Bounded by |
| --- | --- | --- |
| `nl:copy:<sid>:<copy id>` | a copy's progress: the two stores, the products' ids, how far it is | data room of the receiving store until it expires, 7 days |
| `nl:copy:lock:<sid>` | one step at a time | a minute |

## Store commands, measured

`tests/store-copy.test.ts` copies a store of 30 products, a page, a quiz, a funnel and the setup, and counts the commands sent to the store and the studio requests charged, step by step:

| Step | Commands | Studio requests charged |
| --- | ---: | ---: |
| First: the plan, then 25 products with their descriptions and pages | 242 | 56 |
| The other 5 products | 61 | 7 |
| Forms | 21 | 5 |
| Pages | 38 | 5 |
| Funnels | 23 | 5 |
| The store page's setup | 33 | 6 |

Each step stays under 20 commands for every studio request it is charged. A step writes at most 25 products, so one never sends more than a few hundred commands, whatever the store holds.

## Not built

Copying files and pictures (they would be a second copy of storage, priced per byte), courses with their lessons, podcasts, calls, options and licence keys; copying a store into someone else's account; and copying changes made after a copy (a copy is a snapshot).
