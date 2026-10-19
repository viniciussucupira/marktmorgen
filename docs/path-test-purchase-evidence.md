# Test purchase evidence wording

The test-purchase mission is recorded from Stripe's test checkout, not from opening a file or confirming delivery. Its explanation no longer claims that this proves the whole journey. The completion criterion visibly retains the need to check file access/delivery manually even after a test checkout is recorded. Test instructions start with confirming test mode and explicitly prohibit using a real card for a live store.

Mission states, Stripe facts, levels, payment implementation and fiscal/cost gates are unchanged. Rendered tests cover both open and recorded states and confirm that the latter does not assert delivery verification; existing live-unavailable no-card-instructions checks remain. This is evidence accuracy, not a claim that live payments or delivery have been tested.
