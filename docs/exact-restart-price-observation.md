# Restart response must match the actual requested price

The parsed tier/cycle can come from a lookup name. Matching that name alone does not establish the returned charge's price, amount, currency, recurring interval or item count. Restart now keeps the price ID already obtained for the existing provider request and verifies one returned item with that exact ID, the unchanged published monthly amount, USD, monthly interval and interval count1 before returning the observation for store activation.

Six additional synthetic mismatches cover another price ID, a changed amount, another currency, a doubled interval, an extra item and a yearly recurring interval hidden behind the monthly lookup name. The successful synthetic restart response now describes the requested current price; the old source-subscription fixture remains on its legacy price. Earlier customer/tier/cycle/status/trial cases and normal pause/undo/manual-restart flows remain.

No additional provider or Redis request, send, key or persisted field is introduced. Comparisons and bytes are unmeasured, not zero. This is observation validation, not a receipt/payment proof, funded pre-charge intent, reconciliation protocol or fix for a null store write. Prices, sales, tax gates and financial coverage remain unchanged.
