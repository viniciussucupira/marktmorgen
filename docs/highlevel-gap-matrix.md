# HighLevel gap matrix

Reviewed 2026-10-18 UTC. The machine-readable twin is [highlevel-gap-matrix.json](highlevel-gap-matrix.json); `tests/highlevel-gap-matrix.test.ts` checks that the two agree and that every cited Marktmorgen file exists.

**Method.** Each HighLevel row names only what the cited HighLevel page shows, read on the date given; a feature no page read here shows is not listed. Each Marktmorgen 'built' or 'partial' row cites the files that implement it at main on the review date. Gaps and partial rows are ranked by sales impact divided by effort, each 1 to 5, as in docs/clickfunnels-feature-audit.json. The scores are this review's judgment, not measurements. No row claims Marktmorgen is better than HighLevel.

**Identifiers.** Earlier code comments cite a HighLevel audit by H-number (H02 pipelines, H13 upsells, H15 quizzes, H18 workflows, H26 and H27 payment requests and invoices, H29 pay per lead, H36 Conversation AI) whose file is not in the repository. Those numbers keep their meaning here, except H13: no page read here shows HighLevel upsells or order bumps, so H13 is not listed. The others are new.

**Counts:** 16 built, 10 partial, 6 gaps, 5 not planned.

## Ranked gaps

Gaps and partial rows, by sales impact divided by effort (each 1 to 5; this review's judgment, not a measurement).

| Rank | ID | Feature | Marktmorgen | Sales | Effort | Score |
|---:|---|---|---|---:|---:|---:|
| 1 | H28 | Documents, contracts and proposals with e-signature | Gap | 4 | 3 | 1.33 |
| 2 | H14 | Social media planner (scheduling and posting) | Gap | 4 | 5 | 0.80 |
| 3 | H01 | Website and funnel builder with templates | Partial | 3 | 4 | 0.75 |
| 4 | H07 | Unified conversations across SMS, email, Instagram, Facebook, WhatsApp and live chat | Partial | 3 | 4 | 0.75 |
| 5 | H11 | SMS marketing and SMS conversations | Gap | 3 | 4 | 0.75 |
| 6 | H22 | Workflow AI: automation recommended from a goal | Gap | 2 | 3 | 0.67 |
| 7 | H04 | Cloning whole funnel setups (snapshots) | Partial | 2 | 4 | 0.50 |
| 8 | H12 | Inbound and outbound calling | Gap | 2 | 5 | 0.40 |
| 9 | H17 | Ad Manager: creating ads from inside the product | Partial | 2 | 5 | 0.40 |
| 10 | H34 | Mobile app | Partial | 2 | 5 | 0.40 |
| 11 | H08 | Custom dashboards and scheduled reports to any address | Partial | 1 | 3 | 0.33 |
| 12 | H09 | Prospecting tool (add-on) | Partial | 1 | 3 | 0.33 |
| 13 | H20 | Reviews AI: replies to reviews | Partial | 1 | 3 | 0.33 |
| 14 | H05 | Domain management | Partial | 1 | 4 | 0.25 |
| 15 | H23 | Voice AI: answering phone calls | Gap | 1 | 5 | 0.20 |
| 16 | H35 | Branded client portal app (add-on) | Partial | 1 | 5 | 0.20 |

**Built from this matrix:** H19 in #549 (the creator's public review page named in every review request).

## Every row

### Funnels and sites

| ID | HighLevel shows | Sources | Marktmorgen | Evidence | Note |
|---|---|---|---|---|---|
| H01 | Website and funnel builder with templates | [HL01](https://www.gohighlevel.com/pricing), [HL04](https://www.gohighlevel.com/no-code-website-builder) | Partial | [`lib/page-funnel.ts`](../lib/page-funnel.ts), [`lib/site-pages.ts`](../lib/site-pages.ts), [`lib/sales-page.ts`](../lib/sales-page.ts), [`lib/funnel-starters.ts`](../lib/funnel-starters.ts) | Funnels of pages, sales pages of structured blocks, store pages and a few starter funnels. Not a free-form drag-and-drop canvas (ClickFunnels audit F07 is C/U), and nothing near HighLevel's stated 200+ templates. |
| H03 | Funnel AI: a funnel drafted with AI | [HL01](https://www.gohighlevel.com/pricing), [HL02](https://www.gohighlevel.com/post/highlevel-101-everything-you-need-to-know) | Built | [`lib/funnel-ai.ts`](../lib/funnel-ai.ts) | Drafts the whole funnel from the store's own records, reviewed by the creator before anything is saved (ClickFunnels F03, D). |
| H04 | Cloning whole funnel setups (snapshots) | [HL04](https://www.gohighlevel.com/no-code-website-builder) | Partial | [`lib/funnel-bundle.ts`](../lib/funnel-bundle.ts) | A funnel is shared or copied as a versioned file, by link, or into another store of the same account (F05, D). A whole account's setup (forms, workflows, courses, settings) is not copied as one snapshot. |
| H05 | Domain management | [HL01](https://www.gohighlevel.com/pricing) | Partial | [`lib/domains.ts`](../lib/domains.ts) | A creator's own domain is connected and checked. Buying a domain inside the product is not offered. |
| H06 | WordPress hosting (add-on) | [HL01](https://www.gohighlevel.com/pricing) | Not planned | — | Out of scope: Marktmorgen hosts its own pages and does not host WordPress. |

### CRM

| ID | HighLevel shows | Sources | Marktmorgen | Evidence | Note |
|---|---|---|---|---|---|
| H02 | CRM and pipelines | [HL01](https://www.gohighlevel.com/pricing), [HL03](https://www.gohighlevel.com/crm) | Built | [`lib/crm.ts`](../lib/crm.ts), [`lib/crm-rules.ts`](../lib/crm-rules.ts), [`lib/contacts.ts`](../lib/contacts.ts) | Contacts, deals and several pipelines with ordered stages and honest recorded totals. |
| H07 | Unified conversations across SMS, email, Instagram, Facebook, WhatsApp and live chat | [HL01](https://www.gohighlevel.com/pricing), [HL03](https://www.gohighlevel.com/crm), [HL12](https://help.gohighlevel.com/support/solutions/articles/155000004779-how-to-use-the-all-in-one-chat-widget) | Partial | [`lib/inbox.ts`](../lib/inbox.ts), [`lib/inbound-mail.ts`](../lib/inbound-mail.ts), [`lib/community-dm.ts`](../lib/community-dm.ts) | One inbox holds the store's chat with visitors and members' messages; email to the store's addresses is read. SMS, WhatsApp, Instagram and Messenger conversations are not connected. |
| H08 | Custom dashboards and scheduled reports to any address | [HL01](https://www.gohighlevel.com/pricing), [HL10](https://help.gohighlevel.com/support/solutions/articles/155000003965-how-to-create-custom-reports-and-schedule-reports) | Partial | [`lib/stats-report.ts`](../lib/stats-report.ts), [`lib/custom-range-view.ts`](../lib/custom-range-view.ts), [`lib/stats.ts`](../lib/stats.ts) | Fixed dashboards with custom date ranges and CSV downloads; a weekly email to the creator and the team list they choose. No widget-built dashboards and no PDF reports to outside addresses. |
| H09 | Prospecting tool (add-on) | [HL01](https://www.gohighlevel.com/pricing) | Partial | [`lib/outreach.ts`](../lib/outreach.ts) | Outreach reads a business's own website for the address it published and drafts a pitch the creator sends from their own mailbox. No lead database. |

### Marketing

| ID | HighLevel shows | Sources | Marktmorgen | Evidence | Note |
|---|---|---|---|---|---|
| H10 | Email marketing | [HL01](https://www.gohighlevel.com/pricing) | Built | [`lib/broadcasts.ts`](../lib/broadcasts.ts), [`lib/mail.ts`](../lib/mail.ts), [`lib/flows.ts`](../lib/flows.ts) | Broadcasts and sequences inside each plan's sending allowance. Dedicated sending IPs are not offered. |
| H11 | SMS marketing and SMS conversations | [HL01](https://www.gohighlevel.com/pricing), [HL03](https://www.gohighlevel.com/crm) | Gap | — | Not built. It would cost per message and need carrier registration, so it would draw on a new metered allowance. |
| H12 | Inbound and outbound calling | [HL01](https://www.gohighlevel.com/pricing) | Gap | — | Not built. A per-minute cost with a telephony provider. |
| H14 | Social media planner (scheduling and posting) | [HL01](https://www.gohighlevel.com/pricing), [HL07](https://help.gohighlevel.com/support/solutions/articles/155000005063-getting-started-setup-social-planner) | Gap | — | Not built. The share links and post drafting below exist, but nothing posts to or schedules on a social platform. Each platform needs its own app review and connection. |
| H16 | Content AI: posts, emails and campaign copy | [HL01](https://www.gohighlevel.com/pricing), [HL02](https://www.gohighlevel.com/post/highlevel-101-everything-you-need-to-know) | Built | [`lib/ai.ts`](../lib/ai.ts) | Drafts social posts (writePosts), emails, sequences, blog posts and affiliate posts on plans with AI writing, for the creator to edit. |
| H17 | Ad Manager: creating ads from inside the product | [HL01](https://www.gohighlevel.com/pricing), [HL11](https://help.gohighlevel.com/support/solutions/articles/155000002433-overview-of-ad-manager) | Partial | [`lib/meta-ads.ts`](../lib/meta-ads.ts), [`lib/ad-spend.ts`](../lib/ad-spend.ts) | A Meta ad account is connected read-only, and what campaigns spent comes into the numbers beside what they brought. No ads are created or published from Marktmorgen. |
| H19 | Reputation management: review requests to a public review site | [HL01](https://www.gohighlevel.com/pricing), [HL08](https://help.gohighlevel.com/support/solutions/articles/48000980328-how-to-customize-the-review-request-messages-sms-email-) | Built | [`lib/review-requests.ts`](../lib/review-requests.ts), [`lib/review-elsewhere.ts`](../lib/review-elsewhere.ts), [`lib/reviews.ts`](../lib/reviews.ts) | One email asks each buyer, some days after buying, for a review on the store, shown as a verified purchase, and since 18 October 2026 also names the creator's own Google, Trustpilot or Facebook page, the same for every buyer. By email only, once per order; not by text message and not repeated until clicked. |
| H20 | Reviews AI: replies to reviews | [HL01](https://www.gohighlevel.com/pricing), [HL02](https://www.gohighlevel.com/post/highlevel-101-everything-you-need-to-know) | Partial | [`lib/ai.ts`](../lib/ai.ts), [`lib/reviews.ts`](../lib/reviews.ts) | A reply to a store review can be drafted with AI (replyToReview) and is posted only by the creator. Google and Facebook reviews are not read. |
| H21 | Online listings management (add-on) | [HL01](https://www.gohighlevel.com/pricing) | Not planned | — | Out of scope for an online creator store. |

### Automation

| ID | HighLevel shows | Sources | Marktmorgen | Evidence | Note |
|---|---|---|---|---|---|
| H18 | Workflow automation | [HL01](https://www.gohighlevel.com/pricing) | Built | [`lib/flows.ts`](../lib/flows.ts), [`lib/flow-runs.ts`](../lib/flow-runs.ts), [`lib/deal-stage-trigger.ts`](../lib/deal-stage-trigger.ts) | Triggers, branches, goals, waits and a bounded run history (ClickFunnels F23, F24, D). |
| H22 | Workflow AI: automation recommended from a goal | [HL02](https://www.gohighlevel.com/post/highlevel-101-everything-you-need-to-know) | Gap | — | Not built. Workflows are made by the creator; sequences can be drafted with AI (lib/sequence-draft.ts). |
| H36 | Conversation AI: an AI agent answering visitors | [HL01](https://www.gohighlevel.com/pricing), [HL02](https://www.gohighlevel.com/post/highlevel-101-everything-you-need-to-know) | Built | [`lib/store-assistant.ts`](../lib/store-assistant.ts), [`lib/store-assistant-rules.ts`](../lib/store-assistant-rules.ts) | A chat on the store grounded only in the store's own pages, handing over to the creator's inbox. Website chat only; not SMS, Instagram or Messenger. |
| H23 | Voice AI: answering phone calls | [HL01](https://www.gohighlevel.com/pricing), [HL02](https://www.gohighlevel.com/post/highlevel-101-everything-you-need-to-know) | Gap | — | Not built: needs calling (H12) first. |

### Selling

| ID | HighLevel shows | Sources | Marktmorgen | Evidence | Note |
|---|---|---|---|---|---|
| H24 | Forms, surveys and quizzes | [HL01](https://www.gohighlevel.com/pricing) | Built | [`lib/forms.ts`](../lib/forms.ts), [`lib/quiz.ts`](../lib/quiz.ts) | Forms with question types, scored quizzes with categories and ranges (H15). |
| H15 | Quizzes | [HL01](https://www.gohighlevel.com/pricing) | Built | [`lib/quiz.ts`](../lib/quiz.ts) | Quizzes with points per answer, categories and score ranges. The pages read name quizzes and do not describe HighLevel's scoring. |
| H25 | Booking calendars | [HL01](https://www.gohighlevel.com/pricing) | Built | [`lib/calls.ts`](../lib/calls.ts), [`lib/team-booking.ts`](../lib/team-booking.ts), [`lib/calendar-sync.ts`](../lib/calendar-sync.ts) | Paid and free calls, team event types (round robin, collective) and two-way Google Calendar sync for hosts. |
| H26 | Payments by link | [HL01](https://www.gohighlevel.com/pricing) | Built | [`lib/payment-requests.ts`](../lib/payment-requests.ts), [`lib/payment-request-rules.ts`](../lib/payment-request-rules.ts) | A custom amount requested from one person by an emailed link, paid on the creator's own Stripe account. Not sent by text message. |
| H27 | Invoicing | [HL01](https://www.gohighlevel.com/pricing) | Built | [`lib/payment-requests.ts`](../lib/payment-requests.ts), [`lib/tax.ts`](../lib/tax.ts) | A payment request with lines and a due date, with Stripe's invoice where the creator switched it on. |
| H28 | Documents, contracts and proposals with e-signature | [HL04](https://www.gohighlevel.com/no-code-website-builder), [HL06](https://help.gohighlevel.com/support/solutions/articles/155000000594-how-to-use-documents-contracts-) | Gap | — | Not built. Payment requests exist; nothing records a signature on an agreement. |
| H29 | Affiliate manager: pay per lead and per sale | [HL09](https://help.gohighlevel.com/support/solutions/articles/155000003637-how-does-the-affiliate-manager-work-) | Built | [`lib/affiliates.ts`](../lib/affiliates.ts), [`lib/affiliate-leads.ts`](../lib/affiliate-leads.ts), [`lib/affiliate-payouts.ts`](../lib/affiliate-payouts.ts), [`lib/paypal-payouts.ts`](../lib/paypal-payouts.ts) | Commissions per sale and per confirmed lead, two tiers, refunds and disputes settled, PayPal batches from the creator's own account. |
| H30 | Payment providers beyond Stripe and PayPal | [HL01](https://www.gohighlevel.com/pricing) | Not planned | — | Sales go through the creator's own Stripe or PayPal. NMI, Authorize.net, Square, Adyen and Razorpay are not connected. |

### Courses and community

| ID | HighLevel shows | Sources | Marktmorgen | Evidence | Note |
|---|---|---|---|---|---|
| H31 | Courses and memberships | [HL01](https://www.gohighlevel.com/pricing), [HL05](https://www.gohighlevel.com/community-builder) | Built | [`lib/course.ts`](../lib/course.ts), [`lib/membership-access.ts`](../lib/membership-access.ts), [`lib/certificate.ts`](../lib/certificate.ts) | Modules, lessons, timed release, membership access tied to purchases, certificates. |
| H32 | Communities with live events | [HL01](https://www.gohighlevel.com/pricing), [HL05](https://www.gohighlevel.com/community-builder) | Built | [`lib/community.ts`](../lib/community.ts), [`lib/community-events.ts`](../lib/community-events.ts), [`lib/event-meetings.ts`](../lib/event-meetings.ts) | Groups, topics, polls, levels and points, moderation, and live events with a Google Meet or Zoom meeting. |

### Platform

| ID | HighLevel shows | Sources | Marktmorgen | Evidence | Note |
|---|---|---|---|---|---|
| H33 | API access | [HL01](https://www.gohighlevel.com/pricing) | Built | [`lib/api-keys.ts`](../lib/api-keys.ts), [`lib/api-read.ts`](../lib/api-read.ts), [`lib/api-write.ts`](../lib/api-write.ts), [`lib/webhooks.ts`](../lib/webhooks.ts), [`lib/mcp-tools.ts`](../lib/mcp-tools.ts) | A REST API with keys, signed webhooks and an MCP server. |
| H34 | Mobile app | [HL01](https://www.gohighlevel.com/pricing) | Partial | [`lib/phone-alerts.ts`](../lib/phone-alerts.ts), [`lib/web-push.ts`](../lib/web-push.ts), [`lib/store-app.ts`](../lib/store-app.ts) | The studio installs on a phone's home screen with push notifications, and each store has its own installable page. No native app in the app stores (ClickFunnels F66, U). |
| H35 | Branded client portal app (add-on) | [HL01](https://www.gohighlevel.com/pricing) | Partial | [`lib/buyer-library.ts`](../lib/buyer-library.ts), [`lib/store-app.ts`](../lib/store-app.ts) | A buyer's library of everything they bought, with no account, and a store's own installable page. Not a branded app in the app stores. |
| H37 | Sub-accounts, white label and SaaS mode | [HL01](https://www.gohighlevel.com/pricing), [HL02](https://www.gohighlevel.com/post/highlevel-101-everything-you-need-to-know), [HL03](https://www.gohighlevel.com/crm) | Not planned | — | Out of scope: Marktmorgen sells to creators, not to agencies reselling it. One account can hold several stores with team roles (lib/team-roles.ts). |
| H38 | HIPAA compliance (add-on) | [HL01](https://www.gohighlevel.com/pricing) | Not planned | — | Not offered, and no page may claim it. |

## Sources

- **HL01** [HighLevel pricing](https://www.gohighlevel.com/pricing), accessed 2026-10-18 UTC. What it shows: Plans Starter $97/month or $970/year (3 sub-accounts), Unlimited $297/month or $2,970/year, Agency Pro $497/month or $4,970/year, Enterprise unpriced; unlimited contacts and users on all plans; 14-day free trial; 'Usage based charges apply' to email and SMS marketing, inbound and outbound calling, Conversation AI, Voice AI and Reviews AI, with no per-unit rates on the page; add-ons (AI Employee $50 or $97 a month per sub-account, Branded Client Portal App $49, dedicated email IP $59, HIPAA $297, listings $30, prospecting $29, premium support $500, SEO $79, WhatsApp $10, white label mobile app $497, WordPress hosting from $10 a site); the core features list.
- **HL02** [HighLevel 101: Everything You Need to Know (HighLevel blog)](https://www.gohighlevel.com/post/highlevel-101-everything-you-need-to-know), accessed 2026-10-18 UTC. What it shows: Published 30 Sep 2024. The AI Employee suite: Voice AI, Conversation AI, Reviews AI, Funnel AI, Content AI, Workflow AI, each with one sentence; social planner, reputation, e-commerce, white label and SaaS mode.
- **HL03** [HighLevel CRM for agencies](https://www.gohighlevel.com/crm), accessed 2026-10-18 UTC. What it shows: Pipelines; a unified inbox of SMS, email, Instagram, Facebook, WhatsApp and live chat; AI-handled calls; sub-accounts.
- **HL04** [HighLevel funnel builder](https://www.gohighlevel.com/no-code-website-builder), accessed 2026-10-18 UTC. What it shows: Drag-and-drop funnel builder, '200+ conversion-ready templates', built-in AI copy, and cloning whole funnel setups with a 'snapshot system'.
- **HL05** [HighLevel community builder](https://www.gohighlevel.com/community-builder), accessed 2026-10-18 UTC. What it shows: Branded community hubs, courses and memberships with paid tiers and drip schedules, live events and video rooms, notifications, AI-written posts and replies.
- **HL06** [Documents & Contracts in HighLevel (support portal)](https://help.gohighlevel.com/support/solutions/articles/155000000594-how-to-use-documents-contracts-), accessed 2026-10-18 UTC. What it shows: Modified 11 Aug 2026. Contracts, proposals and estimates; templates; online signatures 'with a certificate that records signer details, IP address, and timestamps'; signature, text, date, initials and checkbox fields; send by email or link; one-time or recurring payments inside a contract; expiry dates; signing order.
- **HL07** [Getting started: Social Planner (support portal)](https://help.gohighlevel.com/support/solutions/articles/155000005063-getting-started-setup-social-planner), accessed 2026-10-18 UTC. What it shows: Modified 18 Aug 2026. Posting to Facebook, Instagram, Threads, Google Business Profile, LinkedIn, TikTok, YouTube, Pinterest, HighLevel Community and Bluesky from one calendar; bulk upload of up to 90 posts by CSV or XLSX; recurring posts; approval.
- **HL08** [Customize the review request messages (support portal)](https://help.gohighlevel.com/support/solutions/articles/48000980328-how-to-customize-the-review-request-messages-sms-email-), accessed 2026-10-18 UTC. What it shows: Modified 25 Aug 2026. Review requests by SMS and email (WhatsApp set up separately), sending people to a connected Google Business Profile or to a custom link, repeated on a schedule until the link is clicked, sent by hand or from a workflow.
- **HL09** [How does the Affiliate Manager work? (support portal)](https://help.gohighlevel.com/support/solutions/articles/155000003637-how-does-the-affiliate-manager-work-), accessed 2026-10-18 UTC. What it shows: Modified 25 Sep 2026. Campaigns paying per lead or per sale, fixed, percentage or recurring; referral links; an affiliate portal; payouts approved by an admin, automated through PayPal or made by hand.
- **HL10** [How to create and schedule reports (support portal)](https://help.gohighlevel.com/support/solutions/articles/155000003965-how-to-create-custom-reports-and-schedule-reports), accessed 2026-10-18 UTC. What it shows: Modified 6 Aug 2026. Custom reports from dashboard widgets, emailed on a schedule to any address with no login, downloadable as PDF.
- **HL11** [Overview of Ad Manager (support portal)](https://help.gohighlevel.com/support/solutions/articles/155000002433-overview-of-ad-manager), accessed 2026-10-18 UTC. What it shows: Modified 23 Sep 2026. Creating and managing Facebook, Instagram, Google (Search only) and LinkedIn campaigns in HighLevel, lead forms, a performance dashboard, and an AI assistant for ad workflows.
- **HL12** [How to use the All-in-One Chat Widget (support portal)](https://help.gohighlevel.com/support/solutions/articles/155000004779-how-to-use-the-all-in-one-chat-widget), accessed 2026-10-18 UTC. What it shows: Modified 17 Sep 2026. One website widget offering live chat, SMS/email, WhatsApp, Facebook, Instagram and Voice AI.

## What this matrix does not establish

- Only the pages listed were read. A HighLevel capability those pages do not show is not listed, and a row's wording is limited to what its page says.
- HighLevel's usage-based rates (email, SMS, calling, AI) are not on its pricing page, so none is compared here.
- Nothing here measures speed, ease, conversion or outcomes in either product. It makes no claim that Marktmorgen is better than, cheaper than or equal to HighLevel.
- "Built" means the code is at main with the files cited; it is not browser, load or live-provider evidence. Paid sales stay closed.
