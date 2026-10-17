# Conditional CRM stage migration

When a stage is removed, writeStages validates the full saved opportunity snapshot before saving the new stage definitions. Each affected opportunity then uses a single-key Redis compare-and-set script. It writes the moved record only when the current serialized value exactly matches the snapshot read earlier.

A deleted record returns 0 and stays absent. A changed record returns -1, preserves the concurrent edit and makes the operation explicitly unconfirmed through the existing CRM recovery flow. An unchanged record returns 1 and retains every other stored field, including unknown metadata. Invalid replies or unavailable scripting never authorize an ordinary-write fallback.

Stage configuration and all opportunity moves are not one transaction. A conflict or lost reply can leave the new definitions and some moves applied. An explicit retry reads current records and attempts remaining moves without restoring stale fields. Concurrent schema changes and general opportunity edit conflicts remain outside this change. A writer with an obsolete stage definition can still introduce a reference to a removed stage; this change does not add global schema locking or revisions.

The existing MAX_DEALS limit and record retention do not change. Migration cannot increase hash size by recreating an opportunity deleted after preflight. No additional history, service, production credentials or paid entitlement is introduced.

Verification covers deletion between snapshot and move, concurrent note/value/metadata edits, retry from the fresh record, existing malformed/lost replies and the actual static Lua script against disposable local CI Redis. Hosted Upstash REST and authenticated browser verification remain separate release checks.
