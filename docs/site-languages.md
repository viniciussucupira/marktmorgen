# Site languages: approved design, deferred launch

Owner request19October2026, queue B4. This document is the implementation contract for future platform translations. Writing this design is authorized now. Shipping translated platform routes, switching the studio language or opening sales remains deferred until sales are open and the owner explicitly authorizes translation (K3-LANG/PATH14). Current platform language remains American English (`en-US`), including public pages, studio, Path and company messages.

## Existing code and boundaries

Reviewed `app/layout.tsx`, `lib/store-language.ts`, `lib/buyer-words/`, `lib/email.ts` and `docs/platform-language-policy.md` before proposing this work. The platform already declares en-US. Store buyer language is a separate existing feature: stored codes en/es/fr/de/it/nl/pt select complete buyer dictionaries and local number/date formatting. The existing pt record means Portuguese (Portugal), locale pt-PT. Do not silently change those stored stores to Brazilian Portuguese or rename their identifiers.

Creator-authored products, pages, posts, imports, customer quotations and messages retain their author's language and meaning. A platform language never translates creator content, changes a buyer's consent, changes a transaction's currency or imports a legal claim. Existing technical keys, routes, payment-provider locale values and signed links retain compatibility.

## Release sequence

After the launch and owner gates are satisfied, add German, French, Dutch, Spanish and Italian as separate complete-language releases. The intended platform regional locales are de-DE, fr-FR, nl-NL, es-ES and it-IT, alongside en-US. Review whether those regional choices fit the actual audience before shipping; language does not establish tax residence.

Each language must cover the whole platform journey: marketing and help, account entry/recovery, studio navigation, editors, dialogs, errors, empty/loading/disabled states, validation, accessibility names and descriptions, Path facts and private certificates, account/billing notices and platform email subjects/plain text/HTML. Include legal disclosures and honest unavailable states. Do not advertise a language with unfinished routes or return success in one language and an error in another.

Use complete checked-in source dictionaries and reviewed grammar/plural rules. No request-time machine translation, translation API, paid model call, implicit runtime fallback that hides missing text, or added language plan allowance is authorized. Tests must fail on missing keys, unresolved placeholders and accidental mixed platform language. Keep concise English diagnostics in developer tests unless a test explicitly verifies another language.

Portuguese for the platform is a later Brazilian Portuguese release (pt-BR), subject to the same gates. Keep it separate from existing buyer pt/pt-PT. Design a versioned migration or an explicit new supported buyer choice only when that buyer-language work is authorized; retain old store links and data throughout. Japanese, Korean and Chinese are study candidates, not committed releases. Chinese also needs a deliberate script/region decision, not a single unspecified locale.

## Navigation and indexing acceptance criteria

The future selector uses written language names (English, Deutsch, Français, Nederlands, Español, Italiano), without flags. Its accessible name, current choice, keyboard operation, visible focus and touch target must be verified. The reader's explicit selection wins and must not create a redirect loop. Do not force navigation from browser locale; propose a language only when a complete equivalent page exists. Preserve form state and unsaved changes when switching.

Choose a route strategy in the translation implementation PR after inventorying public and authenticated routes. Preserve existing English URLs and inbound account/payment/signature links. Every localized public page must have a stable URL, matching document lang, localized title/description, canonical URL and reciprocal hreflang links only to equivalent published pages, with an intentional x-default destination. Do not generate alternates for nonexistent or incomplete pages. Private studio, token-bearing and account-recovery URLs must not become indexable or appear in public alternates.

Verify navigation, direct links, query/hash preservation, caching isolation, browser back/forward and social metadata for every published locale. Cookie or saved preference must not mix personalized language into a shared cached response. Provider checkout locale remains a separately validated mapping; no unsupported provider locale is inferred from a platform label.

## Claims that must never be translated into promises

The following are review examples of prohibited promises, not approved marketing text. Apply the rule to equivalent wording and implication, not just literal matching. Require fluent review before release. Never promise guaranteed earnings/profit, guaranteed sales or zero risk; never present a 60% target as certified net margin.

| Language | Prohibited example phrases |
| --- | --- |
| English (US) | Guaranteed income; guaranteed profit; guaranteed sales; risk-free; proven 60% net margin |
| German | Garantiertes Einkommen; garantierter Gewinn; garantierte Verkäufe; risikofrei; nachgewiesene Nettomarge von 60% |
| French | Revenus garantis; bénéfices garantis; ventes garanties; sans risque; marge nette prouvée de 60% |
| Dutch | Gegarandeerd inkomen; gegarandeerde winst; gegarandeerde verkopen; zonder risico; bewezen nettomarge van 60% |
| Spanish | Ingresos garantizados; beneficios garantizados; ventas garantizadas; sin riesgo; margen neto demostrado del 60% |
| Italian | Guadagni garantiti; profitti garantiti; vendite garantite; senza rischi; margine netto dimostrato del 60% |
| Brazilian Portuguese (future) | Renda garantida; lucro garantido; vendas garantidas; sem risco; margem líquida comprovada de 60% |

Path language must describe saved server-confirmed facts, uncertainty, refunds, eligibility and optional actions faithfully. No translation turns an imported product into a lead, a click into a sale, a gross value into net profit or a private certificate into an accredited credential. Reminders and sharing retain explicit opt-in. Screen-reader labels must communicate the same limitation as visible text.

## Country study before East Asian release

Language support never establishes tax or payment compliance. Queue C's EU/UK/US work remains separate. Before proposing Japanese, Korean or Chinese platform launch, create a country-by-country evidence dossier from current official authorities and the actual transaction paths. This design makes no claim about rates, thresholds, exemptions, registration duties or a provider's availability.

| Candidate audience | Mandatory unresolved study |
| --- | --- |
| Japan | Consumption-tax treatment and platform/intermediary responsibility for each digital-service path; seller/buyer location evidence; registration, invoice, refund, reporting and retention requirements; provider support and full compliance cost |
| South Korea | VAT and foreign digital-service/platform duties by transaction role; location evidence, registration, reporting, invoices/refunds, retention and provider support; full compliance cost |
| Mainland China | Relevant VAT and cross-border digital-service/platform rules, registrations and permitted operating/payment arrangements; location evidence, invoices/refunds, data/retention requirements and full cost |
| Taiwan, Hong Kong, Macau or other Chinese-reading markets | Separate jurisdiction dossiers where targeted; do not apply mainland conclusions or a generic Chinese-language rule |

For each dossier identify the actual contracting entity, creator/platform/merchant-of-record roles, buyer type, seller residence, checkout path, collection/remittance party, official source and review date. Resolve conflicting interpretations using the most-tax modeling requirement and professional review where needed. Unknown compliance cost fails admission. Do not add production collection logic based on this planning table.

## Cost and launch gates

This documentation adds no runtime bytes, calls, storage records, messages, provider account or paid service. Monthly/annual Store, Studio and Scale costs and margins are unchanged from M0 in `docs/codex-queue.md`: binding most-tax net margins remain Store12.09%/12.21%, Studio12.14%/12.02%, Scale12.17%/12.02%; these fail the 60% target. The separate sizing model around60% is not fiscal clearance.

Before translation implementation measure checked-in content/build size, per-locale bundle and caching behavior, locale-specific email size, maintenance and professional translation/legal-review cost, plus country compliance/retention obligations. Model each plan's monthly and annual full-use worst case before/after, using the most expensive paid provider unit if any. Add enforced ceilings and pre-work reservations for every newly metered operation. Do not conceal missing costs as zero or raise prices/limits without authorization.

Release checklist: sales open and explicit owner translation authorization; complete route/email/state inventory; fluent/legal review; exact-source and browser tests for all target locales; accessibility checks with documented manual gaps; no unsupported public alternates; existing English/store data compatibility; financial/fiscal gates satisfied. PLANS_ON_SALE remains false until independently authorized and eligible. This document opens no gate.
