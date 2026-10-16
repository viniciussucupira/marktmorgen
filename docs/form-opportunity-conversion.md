# Create-once opportunities from form responses

The reviewed conversion endpoint is POST /api/store/form-opportunity. It requires orders and export access to the pinned store, an existing form and a response among the newest 50 shown in Forms. The same shared limit bounds the verification read; this endpoint does not fetch all 2,000 retained responses per click. It never enrolls contacts or sends email.

The server fingerprints the store ID, form ID and stored response. The first ten hex characters choose the existing CRM-compatible deal ID; the full 64-character reference is stored on the deal as formResponseRef. A short-ID collision is refused when the full reference differs. Ordinary CRM edits preserve this server-owned field and cannot reassign it from submitted input.

A single-key Lua script checks whether the deal already exists, checks the CRM hash capacity, and performs one HSET only when absent. It returns the existing record on replay without overwriting work done afterward. There is no non-atomic fallback. A lost reply is uncertain; retrying the same conversion uses the same identity. Capacity includes malformed hash entries. This endpoint enforces capacity atomically with respect to its own conversions; unrelated legacy CRM writes retain their previous capacity behavior.

There is no second receipt table, lock lease or new unbounded history. The existing MAX_DEALS limit is unchanged. A deleted opportunity can be created again from its still-retained response, because deletion removes the identity-bearing record. A response outside this current 50-response conversion window cannot start or replay a conversion through this endpoint; an existing opportunity remains in Deals.

## Scope and limitations

- This applies to the new reviewed conversion route, not arbitrary manual opportunities or records created before the feature.
- Existing response records have no unique event ID. Identical content submitted in the same second has the same identity, even if stored twice. A future response schema with an event ID would remove that ambiguity.
- Returning an existing deal can fail closed if its current stage no longer parses, storage is unavailable or its identity is corrupt. It never replaces the existing record to repair it automatically.
- Two sessions can propose different titles or values for the same response. The first stored record wins. Further edits belong in Deals.
- The existing email-match warning is still useful for other submissions or unrelated sales to the same contact; it is separate from exact conversion identity.

## Verification

The behavior suite uses the project's MemoryRedis test double. Its explicit EVAL branch models this one script and rejects unsupported scripts; it is not a Lua interpreter. Tests cover concurrent requests, lost commit replies, preservation of later CRM edits, server-owned metadata, role checks, capacity, replay at capacity, and collision refusal. The actual application Lua script also passed the disposable Redis 7.4 CI job on 2026-10-16 (run 38930500852, job 117072947744, commit c0e89ec7f90a5cbc65f028cf20da8d392cfc0823). The job verified 64 concurrent requests, replay after a committed request, later-edit preservation, the application capacity limit and wrong-type refusal. It reads the script directly from lib/form-opportunity.ts and requires no application credentials. Hosted Upstash REST integration and authenticated browser verification remain outstanding. No production data or accounts were used.

References: [Redis scripting guarantees](https://redis.io/docs/latest/interact/programmability/eval-intro/), [Upstash EVAL](https://upstash.com/docs/redis/sdks/ts/commands/scripts/eval).
