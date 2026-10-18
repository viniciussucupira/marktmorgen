# Proposals and agreements with an electronic signature (HighLevel H28)

Added 18 October 2026. Code: `lib/agreement-rules.ts` (rules, browser-safe), `lib/agreement-store.ts` (storage and the signature), `lib/agreements.ts` (emails and the signed copy), `lib/buyer-words/agreements.ts` (the signer's words in the store's seven languages), `app/[handle]/sign/[agreement]/page.tsx` (the signer's page), `app/api/store/agreement-sign/route.ts` (signing), `app/api/store/agreements/route.ts` and `app/studio/agreements/page.tsx` (the studio). Checked by `tests/agreements.test.ts`.

## What it does

1. A creator writes a proposal or an agreement for one person: a title, plain text and, if they want, lines with amounts. They confirm they deal with this person and the person expects it.
2. The person gets one email from the store's name with a link to a store page that shows the exact text and its SHA-256 fingerprint.
3. To sign, they type their full name and the email address it was sent to, and check "I agree to sign this electronically, and I am the person it was sent to." Before the form, the page says they don't have to sign there, that they may ask the creator for a paper copy or another way to sign, what they need to sign and keep a copy, what is recorded, and that whether it can be enforced depends on the law where they are and on what it says.
4. The record keeps: the exact text signed (written once, under its own key), its SHA-256, the version number, the name typed, the time, the consent sentence and its version, and an HMAC-SHA-256 of the signer's internet address under a key derived from `NIMBUS_DATA_KEY` and the agreement's id. The address itself is never stored, and nothing is recorded for it when no key is set (the record says so).
5. Both parties get the signed copy by email: the exact text and the record in the message, and the same as a self-contained HTML file attached. The page shows the same record and can be printed or saved as PDF.
6. An existing open payment request of the store can be attached; the page shows a link to it once signed. Signing never charges anything.

## Rules that must survive

- **The text never changes after a signature.** A version's text is written once with `SET … NX`; any edit is a new version (`reviseAgreement`), up to `MAX_VERSIONS`, which needs a new signature. An earlier signature stays recorded against the text it signed. A text whose stored fingerprint no longer matches is never shown and never signed (`readVersion`).
- **Nobody signs for someone else.** The address typed must be the address it was sent to; the version number and fingerprint the page showed must still be the latest (a creator's edit while the person reads makes their signature refused as "changed"); a browser signed in to the store's studio, or a device the creator marked, is refused (`isStorePeople`); a signature and a new version take the same lock and re-read the record under it; each version is signed once. These are records of what happened, not proof of identity: anyone holding the link and the address could sign, and the pages never say otherwise.
- **Never claimed:** "legally binding", "court-admissible", compliance with ESIGN, UETA or any other law. `tests/agreements.test.ts` fails on those words in the signer's words, the pages and the emails.
- **Erasure.** Deleting the person from the store (`lib/person-erasure.ts`, `forgetAgreementsPerson`) deletes every agreement of theirs, signed or not, with every version's text. A closing store's agreements go with its other records (`lib/closed-store-data.ts`, follower of `nl:agree:s:`). The creator may withdraw one waiting for a signature and delete any not waiting. Copies already emailed stay with whoever received them, and the privacy policy says so.

## Keys

| Key | What | Bounded by |
| --- | --- | --- |
| `nl:agree:r:<id>` | the record: who it is for, each version's fingerprint and signature | data room (`recordRoomBytes`, with 3 KB for signatures), 400 days |
| `nl:agree:v:<id>:<n>` | one version's exact text, written once | data room (`versionRoomBytes`), the record's 400 days |
| `nl:agree:s:<sid>` | the store's agreements by when made | counted with the record; at most `MAX_KEPT_AGREEMENTS` (200) |
| `nl:agree:p:<sid>:<person>` | one person's agreements | counted with the record; at most `MAX_PER_PERSON` (20) |
| `nl:agree:lock:<id>` | a signature or a new version being written | 10 seconds |

## Cost: nothing new beyond existing meters

- **Emails:** every email (the link, a new version, a resend, each signed copy to the signer and to the creator) is `{ by: "store", kind: "email" }`, one of the store's own emails for the month, taken before it goes. When those are used, nothing goes and the creator is told. At most `MAX_SENDS` (8) emails to the signer per agreement and one copy to each side per signed version.
- **Storage:** every record and every version is counted in the store's data room before it is written (`takeData`), until the day it goes by itself.
- **Reads by the signer:** the page and the signing form each count as one of the store's public buyer requests (`withinStore`, scopes `agreement-view` and `agreement-sign`), as every buyer page does.
- **No model, no provider call, no file storage:** the HTML copy is built in memory and attached; the PDF is the browser's own print to PDF.

Store commands per action, measured in `tests/agreements.test.ts` (commands sent to the store, a script counted as one):

| Action | Commands |
| --- | ---: |
| Create (counts, data room, record, first version) | 11 |
| Email the link (store email meter, record) | 5 |
| Open the signing page (record, version) | 2, plus the page's public-request count |
| New version (lock, data room, version, record) | 6 |
| Sign through the route, with its two signed copies (rate limit, public request, studio check, lock, record, version, two emails) | 20 |
| Signed copies alone (two emails through the meter, record) | 10 |
| Withdraw | 4 |
| Delete | 4 |
| List in the studio | 2 |
| Delete the person | 2 per agreement, plus 2 |

## A visible limit, proposed and not made

No pricing file was changed. A visible figure such as "agreements sent per month" by plan is not needed for cost, because every agreement already costs only the store's own emails and its data room, both enforced per plan. If the owner wants one for positioning, the proposal is: Store 20 a month, Pro 100, Scale 300, enforced like `REQUEST_LIMITS` and listed in `NOT_A_COST` of `tests/plan-cost-registry.ts`. That is the owner's decision and would touch the pricing page.

## Sources, read 18 October 2026

- HighLevel, "How to use Documents & Contracts" (support portal, modified 11 Aug 2026), https://help.gohighlevel.com/support/solutions/articles/155000000594-how-to-use-documents-contracts- (accessed 2026-10-18 UTC). Shows contracts, proposals and estimates, templates, fields, several signers and signing order, sending by email or link, payments, expiry, and a certificate that "records signer details, IP address, and timestamps". It also says the feature collects "legally binding signatures" and "provides legal protection"; Marktmorgen makes neither claim.
- Electronic Signatures in Global and National Commerce Act, 15 U.S.C. ch. 96, United States Code 2024 edition (GPO), https://www.govinfo.gov/content/pkg/USCODE-2024-title15/html/USCODE-2024-title15-chap96.htm (accessed 2026-10-18 UTC). § 7001(a): a signature, contract or record "may not be denied legal effect, validity, or enforceability solely because it is in electronic form"; § 7001(c)(1): where a law requires information to be given to a consumer in writing, an electronic record satisfies it only after the consumer's affirmative consent and disclosures about paper copies, withdrawing consent and the hardware and software needed; § 7001(e): a record may be denied effect if it "is not in a form that is capable of being retained and accurately reproduced"; § 7006(5): an electronic signature is a sound, symbol or process "executed or adopted by a person with the intent to sign the record". The page's paper-copy, other-way-to-sign and what-you-need sentences, and the copy each side receives, follow these; they are not a claim that the act applies to a given agreement or that its conditions are met.
- Uniform Electronic Transactions Act as enacted in Rhode Island, R.I. Gen. Laws ch. 42-127.1, https://webserver.rilegislature.gov/Statutes/TITLE42/42-127.1/INDEX.htm (accessed 2026-10-18 UTC): § 42-127.1-5(b), it "applies only to transactions between parties each of which has agreed to conduct transactions by electronic means", determined from context; § 42-127.1-7, a record or signature "may not be denied legal effect or enforceability solely because it is in electronic form"; § 42-127.1-9(a), an electronic signature is attributable to a person "if it was the act of the person", which may be shown in any manner; § 42-127.1-3(b), wills, codicils and testamentary trusts are outside it. One state's enactment, read as an example of UETA, not as the law of any other state. The consent checkbox and the address check are why the page records agreement to sign electronically and what was done; whether that suffices anywhere is for the parties' law.

## Not built

Templates, uploaded PDFs, placed fields (initials, dates, checkboxes), several signers or a signing order, a countersignature by the creator, payments collected inside the document, automatic reminders, and SMS delivery. A creator's sending is recorded as the creator's own act; the creator does not sign on the page.
