# Unknown pause undo stays unconfirmed

undoPause uses the existing bounded storedPauseAt observation directly. Only atomic known absence returns none. Unreadable, malformed or unknown evidence throws through the existing error route before any provider mutation or cleanup. No extra read, retry, storage or service is introduced.

Actual undoPause regressions cover malformed raw, wrong type, lost/invalid/inherited ACK and thrown read; assert preserved raw, annual and due evidence, one observation and zero provider/cleanup writes. Known absence and later acknowledged undo remain functional. MemoryRedis tests are models, not real Lua proof. Lua unchanged. Complete hosted CI required.

No flag, policy, price, right, visible limit or notice promise changes. Funded notice lifetime reservation/generation/attempt/settlement and concurrent generation cleanup remain unresolved. Accessibility 0→0 steps/decisions; no human/conformance claim. No new productive I/O cost; CI/review FX275 remains unknown, never zero.
