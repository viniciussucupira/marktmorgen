# Review loaded form answers

Forms includes text search across human-readable answers and quiz result titles, ignoring case and accents. Quiz result filters combine with search. Removed or missing result definitions can be grouped as No current result. Filters preserve each server response identity and the existing explicit opportunity-review flow; they do not create opportunities or send messages.

Search and filters apply only to the newest responses already authorized and loaded for that form (currently up to 50). Counts state this limit. Download shown answers generates a CSV from that exact visible selection with the existing spreadsheet formula protection and consent wording. Download all answers on the form card retains the authorized server export of all kept responses.

The change adds no provider calls, server reads or tracking. Existing response/export role checks remain unchanged. Static rendering and filter/export behavior are tested; authenticated interactive browser verification remains outstanding.
