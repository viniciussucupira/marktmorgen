# LE448 — platform waitlist record transitions

Owner request:26October2026 00:19Fortaleza. Partial implementation only.
The public waitlist, consent page, funded admission, atomic persistence/outbox,
owner-only weekly CSV/email and opening notice are not implemented by this module.
No real enrollment, email, account or provider operation occurs.

`lib/platform-waitlist-record.ts` models pending, confirmed and left records.
It reuses the existing email normalization/validation, waitlist retention ceiling
and scoped token decoder. An explicit fresh request creates a new random
generation; a token binds the opaque email-derived identity, generation, purpose,
request time and bounded expiry. Confirming again preserves the first confirmation
time. Leaving removes email/plan/country from the planned contact record and
retains a minimal generation/consent/revocation tombstone until the supplied
retention deadline. A new request after leaving requires a new generation and
fresh confirmation; earlier newsletter choice is not inherited.

Consent text and versions are kept exactly as offered, with the request timestamp
and separate explicit newsletter choice. The digest detects inconsistent stored
fields; it is not a signature, authentication or evidence that a person consented.
Only a confirmed, unexpired record appears in the shared private-report projection.
Self-reported plan/country are not paid subscriptions, verified residency or
funding. Country is bounded self-reported text, not an ISO or tax determination.

Every transition carries the exact previous raw value as its expected predecessor.
The library does not perform compare-and-set: callers must apply the plan only
after complete reviewed funding and automatic operation/byte caps, using atomic
persistence that rejects a stale predecessor. Reading/planning alone does not
consume a token, prevent a Redis race, authorize money or send an email. Unknown
or corrupt prior data cannot be replaced as if it were absent. Expired/unknown
clocks, wrong token scope/generation/purpose and contradictory records refuse.

The deadline is supplied, never invented as a paid retention promise. Existing
365day ceiling is a maximum, not a funded default: full retention, later opening
notice, summaries/CSV, retries/refusals and old obligations must be financed
before a real record is admitted. No current null policy is enabled here.
Tombstone retention and erasure/privacy handling still require the complete
review and policy update before capture; this document does not certify them.

Eleven synthetic tests check explicit requests and exact offered wording,
unknown prior reads, malformed metadata/clock/lifetime, token binding,
confirmation replay, withdrawal, re-entry without revived consent, pending
updates, expired records, stored integrity and exact expected predecessors.
No local command/test execution is used; complete remote CI on the new head is
required. No new dependency/job/provider or operating service starts. Incremental
actual CI cost is unknown and cannot reduce FX275 ceilings/reserves. No
functional delivery count; AB(a), commercial/tax gates and existing creator
content, buyer languages and persisted store identifiers remain unchanged.


## Private report projection (partial prerequisite)

`lib/platform-waitlist-report.ts` reuses `csvLine` from the existing CSV
library and the confirmed-contact projection above. A complete supplied snapshot
produces a deterministic private CSV (email, first confirmation UTC date,
intended plan, country), total confirmed, confirmed since an explicit inclusive
cutoff, and exact self-reported plan/country group counts. Null metadata remains
unknown, distinct from a literal country label. Pending, withdrawn and expired
entries are excluded. Corruption, duplicate identities, future observations,
incomplete snapshots and exceeded explicit record/UTF-8 byte bounds refuse the
whole report, rather than silently producing partial counts or a partial CSV.

Eight synthetic tests cover those invariants, formula/quote escaping through the
existing encoder, exact week/byte boundaries, Unicode byte accounting, stable
scan order and empty snapshots. The module performs no reads, sends or access
checks. The caller's completeness flag is a contract, not authenticated evidence
or a consistency guarantee. Its safety ceilings (10,000 supplied records /4MiB
CSV) are not approved operating budgets or promised capacity. Real use still
requires a reviewed coherent snapshot, owner authentication, pre-funded read/
retention/generation/email obligations and automatic caps before any operation.
There is no public route, owner dashboard, scheduled email, CSV download or
opening notice enabled by this prerequisite; no new provider/dependency/job.
