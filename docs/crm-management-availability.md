# CRM management availability

The authorized Deals page uses the existing readOpportunityReview reader to check stages and opportunity records in one batched read. A confirmed empty hash with default stages still opens the normal board. Failed, missing, partial or malformed replies show a dedicated unavailable state, without zero totals, opportunity creation or selection CSVs.

Reload preserves the store and validated follow-up queue. Loaded contact-field names stay visible and the Buyers link retains the existing contact information/list-export path. Saved records are never removed or rewritten by a failed read. CRM editing on this page waits for a confirmed opportunity snapshot; existing server permissions and separate contact/export routes remain unchanged. This is a read-availability check, not a cross-request transaction or a guarantee against later concurrent edits.

No new paid provider, retention policy, entitlement or commercial opening is introduced. The existing strict-reader regression tests cover unavailable versus confirmed empty reads; static-render checks cover the warning, store-scoped recovery, escaped field labels and retained Buyers access. Authenticated interactive browser testing is separate.
