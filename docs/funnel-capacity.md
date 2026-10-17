# Funnel capacity and address ownership

All guided and manual funnel saves share a single atomic Redis check/write. New funnels cannot exceed the store cap, replace an existing identity or duplicate another funnel address (case insensitive). Existing funnels remain editable at capacity. Editing a removed funnel cannot recreate it. Malformed stored records block an unsafe write instead of being treated as free capacity or an unused address.

Only an explicit successful script acknowledgement confirms a save. After a lost response, review saved funnels before trying again. This does not make the multi-record guided setup transactional, solve concurrent changes to the same funnel's content, or reserve site-page capacity.

Behavior tests cover concurrent creation/renames, stale identity snapshots, deletion, corrupt data and ambiguous replies. CI also executes the actual application script against disposable Redis. No production customer records or provider calls are used. Prices, consent, existing product visibility and commercial release gates are unchanged.
