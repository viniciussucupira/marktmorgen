# CRM agenda view

The authorized Deals board can switch between Board and Agenda. Board remains the default. Agenda orders the selected loaded records across stage boundaries; when first choosing Agenda from Current order, the control selects earliest action date. Other explicit ordering choices are preserved. Missing dates remain after known dates. Existing search, responsible teammate and action filters apply before either view.

The existing editor stays outside the view switch, so switching layout does not clear its draft. Agenda Edit uses that editor and the same pending/unsaved/unconfirmed-write locks. Closed opportunities are not labeled overdue. Notes and contact details stay within the existing authenticated permission boundary.

CSV uses the same projected row order: stage groups for Board, global chosen order for Agenda. The additive view column records the layout. Existing headers and recorded estimate/currency definitions remain; no estimate becomes confirmed revenue. Shared CSV escaping is retained and export only runs on an explicit click. Unknown stage references are omitted consistently by the row projection; management reads already reject unconfirmed opportunity data.

No new data reads, provider, storage history, messages, marketing enrollment, tracking, paid activation or entitlement changes are introduced. Behavior and static-render tests use synthetic records; authenticated interactive browser checks remain separate.
