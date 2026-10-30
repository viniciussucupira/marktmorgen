# Owned stored pause evidence

The actual pause reader now requires each required ownership/date/plan field and each present funding field to belong to the parsed JSON record. Inherited optional told/funding fields are refused without invoking getters. Missing told remains the existing legacy zero default when no inherited field exists. An explicit unknown funded grant stays marked funded.

Tests exercise actual pauseOf and bounded observation through existing MemoryRedis, poisoning and restoring prototype fields in finally blocks. This is not real Redis Lua proof; Lua and network commands are unchanged. Existing scheduling, worker, billing and browser regressions remain required on the new complete head.

No new productive I/O, storage, retention, service, retries or cost authority. Bounded local property checks only. No prices, rights, visible limits, flags, tax policy or funded notice coverage changes. Funded notice source-grant lifetime reservation/generation/attempt/settlement remains held. Concurrent explicit undo generation cleanup is a separate unresolved finding; this patch does not claim to fix it.

Accessibility: zero additional steps or decisions; no interface changes or new conformance/human-test claim. Commercial costs/reviews, FX275 and unknown-fails rules remain binding.
