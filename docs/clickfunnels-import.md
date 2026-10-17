# Moving from ClickFunnels (F55 CSV contacts, F56 full funnel migration)

Implemented 17 October 2026. Code: `lib/clickfunnels-csv.ts`, `lib/imports.ts` (`source: "clickfunnels"`, `previewImport`), `lib/contacts.ts` (`decideContact`, `previewContactRows`), `lib/clickfunnels-page.ts`, `lib/clickfunnels-funnel.ts`, `app/api/store/import/route.ts` (`preview`), `app/api/store/import/funnel/route.ts`, `components/import-tool.tsx`, `components/clickfunnels-funnel.tsx`, `app/studio/import/page.tsx` (`?what=clickfunnels`), public guide `/platform/move-from-clickfunnels` (`lib/feature-pages.ts`). Tests: `tests/clickfunnels-import.test.ts`.

## What a ClickFunnels owner can export (sources, accessed 2026-10-17 UTC)

Only what the workspace owner can export, or their own published pages saved by their own browser, is read. Nothing signs in to ClickFunnels, fetches a page, follows a link, loads a picture or copies a ClickFunnels template.

| What | What the official help center says | Source (page's own "last updated") |
|---|---|---|
| Contacts export | Customers → Contacts → Actions/Bulk actions → Export; the owner selects fields (examples given: email address, phone number, LTV, tags, last updated, custom fields); the file is downloaded from the export's details page. No complete column list is published. | [How to Export Contacts](https://support.myclickfunnels.com/docs/contacts-how-to-export-contacts/) (2026-09-30) |
| Contact status | The contacts list has Subscribed and Unsubscribed tabs and a Status column with Subscribed, Unsubscribed and Undeliverable. | [Overview of the Contacts Page](https://support.myclickfunnels.com/docs/overview-of-the-contacts-page) (2026-10-05) |
| Contact fields | New contact form: Email address, First name, Last name, Phone number, Time Zone, Organizations, Tags; unsubscribing and GDPR deletion are described. | [How to Manage Contacts](https://support.myclickfunnels.com/docs/contacts-how-to-manage-contacts.md) (2026-10-05) |
| Contact import consent (for comparison) | Importing into ClickFunnels requires confirming each contact is over 18 and gave permission to receive marketing; imported contacts are tagged "Import -" with date and time; CSV under 50 MB; one import at a time. | [How to Import Contacts From a CSV File](https://support.myclickfunnels.com/docs/how-to-import-contacts-from-a-csv-file.md) (2026-10-05) |
| Products export | Products → All Products → Bulk actions → Export; fields chosen in a side menu; CSV downloaded from Actions → Exports. No field list is published; variants and prices are not described. | [How to Export Products](https://support.myclickfunnels.com/docs/how-to-export-products.md) (2026-10-07) |
| Orders export | Orders → Bulk actions → Export; fields chosen (examples: Order Number, Customer Name, Billing Status); CSV downloaded from Order Exports; Workspace Owner or Admin role. No complete field list is published. | [How to Export Orders](https://support.myclickfunnels.com/docs/how-to-export-orders/) (2026-09-30); [order exports](https://support.myclickfunnels.com/docs/order-exports.md) (2025-03-03) |
| Funnels and pages | Sharing creates a link that copies a funnel (pages, workflows, settings) into another ClickFunnels account. No HTML/JSON file export of a funnel or page is described; the export articles cover products, orders and contacts only. | [How to Share and Clone a Funnel](https://support.myclickfunnels.com/docs/how-to-share-and-clone-a-funnel/) (2026-09-23) |
| Developer API (not used) | The contacts endpoint documents listing identified contacts; it is not used here because it requires the creator's API credentials and is not a self-service export. | [Contacts API reference](https://developers.myclickfunnels.com/reference/contact) |

Not established: exact export column names (the help pages give examples only), whether the contacts export includes the Status column by name, the product export's price/variant columns, and any workflow export. Matching is therefore by header name with editable column choices, and the dry run shows the result before anything is saved.

## Design

**CSV imports (F55)** reuse the existing bounded imports (contacts 50,000, products 500, past buyers 20,000 rows; 1,000 rows and 1 MB per request; per-store rate limits; one import at a time; two-week retention of rows and reports). A `clickfunnels` source changes only how files read:

- Header names: ClickFunnels' (Email Address, First Name/Last Name, Tags, Status; Product Name, Price, Description; Customer Email, Product Name, Billing Status), then common names; the creator sees and can change every match.
- Consent: only rows marked Subscribed, in a file whose importer checks "The contacts marked Subscribed agreed to receive my emails", become mailable. Every other row is imported as a contact who cannot be emailed (`agreed: false`). Unsubscribed and Undeliverable rows are recorded as unsubscribed here (Undeliverable also as bounced), so a later import cannot make them mailable; only the person's own new opt-in can. An existing mailable contact whose ClickFunnels status is Unsubscribed/Undeliverable stops being emailed (counted as `stopped` and in the list's unsubscribed counter). Nobody is emailed because of an import.
- Orders: only rows whose status reads as paid (or with no status column) grant past purchases; refunded, failed, canceled, pending and similar rows are skipped and reported; an unreadable status is an error row. This optional status column also applies to the generic past-buyers import.
- Idempotency: contacts and past purchases were already repeat-safe; products are now matched against the store's existing titles (case-insensitive), so re-running a products file makes no copies (all sources).
- Dry run: `POST /api/store/import { action: "preview" }`, one batch at a time, runs the same row classification as the import (shared `classifyContacts`, `classifyProducts`, `classifyPurchases`), reads the list/catalog, writes nothing but its request-rate counters and, for a store that predates it, the existing product-name cache that any product list fills once (no contact, draft, purchase, email or import record), and refuses whatever `startProblem` would refuse at start (row limit, product capacity, email eligibility). The studio adds batches, finds cross-batch repeats by key and applies the list/store room the server reported. For the ClickFunnels source the import button appears only after a dry run of the current file and settings. The import re-checks every row.

**Funnel migration (F56)**: the owner saves each published page ("Save Page As", HTML only). The browser empties script/style/svg bodies and inline data URIs (`trimSavedPage`); the server converts what arrives (≤ 1.5M characters) with `convertSavedPage` into native blocks: first heading → hero, headings/paragraphs/lists → text blocks (long text split, never dropped), button main/sub text → button blocks (up to 3 distinct), YouTube/Vimeo/Loom → video blocks rebuilt from the id, the first form's email/short/long questions → a form, checkboxes at a checkout → order-bump candidates. Dropped and listed with counts and examples: scripts, tracking, styles, pictures, other embeds, in-text link addresses, payment/address fields, consent boxes, other question types, countdown timers, nav/footer, extra forms/buttons, duplicates, overflow beyond 30 blocks/page weight, and every shortened text with its full wording. No imported markup is stored or rendered.

The creator assigns each page a role. `planFunnelImport` (dry run) validates every draft with the page editor's own rules (`parsePage`, `pageProblem`, `SITE_KINDS`, `oversized`) and the store's capacities (10 own pages, 20 forms, 10 funnels, 20 steps, 3 checkout boxes, 5 offers after paying, product kinds, minimum charge) and lists every page, step, box and offer to be made, plus errors and warnings. `saveFunnelImport` takes a per-store lock, re-plans against the latest store, refuses on any error, then appends hidden pages (`appendSitePages`), writes their blocks and forms, saves a disabled funnel of pages (`writePageFunnel`), and adds boxes (`setProductExtras`) and offers (`setProductFunnel`) through their existing validated setters. Mapping:

| ClickFunnels | Marktmorgen |
|---|---|
| Opt-in/sales/thank-you page | Store's own page (hidden), blocks as above; buttons lead to the funnel's next step or a chosen product |
| Order form | The chosen product's own page and checkout as the funnel step (page words not copied) |
| Order bump | Checkout box on that product for the chosen product, at that product's own price, the bump's words as its line |
| Upsell (OTO) | Offer after paying for the preceding checkout's product, at the offered product's own price; yes → next upsell |
| Downsell | Offer reached by "no" on the upsell right before it |
| Workflows, automations, courses, memberships, pictures, design, scripts, countdowns | Not converted; listed |

Idempotency: each run is recorded under `nl:imports:cf:<sid>` (`run:<hash>` of pages and choices → result) and each made page under `page:<hash>` → its id; the same request returns the first result, a re-run after a partial failure reuses pages that still exist, existing identical checkout boxes are left, and a product that already has offers after paying is left unchanged. The ledger expires 400 days after the last write. Not a transaction: a failure after some writes leaves those pieces saved; the UI says so and the next run reuses them.

## Cost and limits

No AI request, email, file storage, picture download or other outbound fetch is added. The only per-use cost is Redis commands (Upstash's advertised pay-as-you-go price is $0.20 per 100,000 commands, baseline source C06; not verified against the actual plan). Each new path draws on per-store allowances checked before any work, in Redis, by `withinLimit` and, by calendar month, `withinMonth`:

| Path | Allowance (since 17 Oct 2026: per calendar month, by plan, `lib/import-limits.ts`) | Worst-case commands per call |
|---|---|---|
| Dry run, contacts/products batch | 400 per 10 min; a month: Store 60, Studio 200, Scale 300 | 2 reads (list size and the batch's addresses; or the product names) + 6 limiter commands |
| Dry run, past-buyers batch | 400 per 10 min; a month: Store 10, Studio 30, Scale 60 | product names + only the named products (≤ 500 in a store, plus bundle contents) + 6 |
| Read a saved page | 60 per 10 min; a month: Store 50, Studio 150, Scale 150 | 4 limiter commands (conversion is CPU only) |
| Funnel dry run | 120 per 10 min; a month: Store 50, Studio 150, Scale 150 | ≈ 25 reads (ledger, ≤ 40 named products, forms count, funnels) + 4 |
| Funnel import | 10 per day; a month: Store 5, Studio 15, Scale 15 | ≈ 200 (the plan again, ≤ 10 pages and forms, the funnel, ≤ 30 boxes and offers through their setters, ledger) |

Until 17 October 2026 these were 30-day windows (10,000 dry-run batches, 200 past-buyer batches, 300 saved pages a day, 1,500 funnel dry runs, 60 funnel imports), about $0.55 of commands per store per 30 days before compute and transfer, which no plan's worst month counted. The ClickFunnels CSVs also run through the existing imports, which had no monthly row figure and sent up to 20,000 emails to people brought over per store in 30 days. Since then (`lib/import-limits.ts`): rows imported a month, all kinds together (Store 1,000, Studio 8,000, Scale 20,000, each upload counting at least 50), imports started (20, 60, 100), steps the studio page asks for (100, 300, 600; past them the five-minute job still finishes every import) and report downloads (20, 60, 100); emails to people brought over come out of the plan's monthly emails on Studio and Scale and are 20 a month on Store. Each path's worst month, with compute and transfer, is a line of `tests/plan-cost-registry.ts` (`clickfunnels` and `imports`), held to the owner's 60% floor by `tests/spend-floor.test.ts`.

Redis storage stays inside existing caps (contacts 100,000 per list, products 500, own pages 10 at ≤ 120 KB, forms 20, funnels 10; the ledger holds one entry per run and per page, expiring 400 days after the last write). The limiter fails open only when Redis itself is failing, when the metered work cannot run either. This bounds the feature's own exposure; it does not certify the owner's 60% net margin, and prices and commercial gates are unchanged.

## Not included (follow-ups)

- Members/subscriptions from a ClickFunnels subscriptions export (the existing "Your members" import remains available).
- Products with several prices or variants; course and lesson import; picture upload from the saved page's own folder (the browser's "complete" save); workflow/email-sequence mapping.
- A dry run for the members import.
- Matched click/time measurements against ClickFunnels; no faster/fewer-clicks claim is made.
