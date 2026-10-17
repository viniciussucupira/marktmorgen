# CRM worklist priority and export

The authorized Deals board can order loaded records within each stage by earliest action date, highest recorded opportunity estimate, or longest without an update. Current order remains the default. Search, responsible teammate and action filters compose before ordering; missing dates and update timestamps follow known values. Equal priorities use a stable record identity. Stage grouping and whole-board totals remain intact.

Download selected deals exports only the loaded rows matching the current selection, in stage order and then the selected priority. Columns include stored estimate cents and currency, contact, next action, UTC calendar date, responsibility, notes and filter context. Stored opportunity estimates are not receipts or confirmed revenue. Formula-like cells are escaped with the existing shared CSV writer. Files are generated only on an explicit click, without new provider or server reads; changes, messages and enrollment are never triggered by filtering or export.

The file does not certify that the underlying CRM read was complete. It explicitly describes loaded selected records. Existing management-read availability and concurrent general edits remain separate concerns. No entitlements, permissions, storage retention or commercial activation change.
