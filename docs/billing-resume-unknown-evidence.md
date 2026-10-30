# Resume and pause changes remain unconfirmed on unknown evidence

The actual cancellation resume route calls undoPause directly once. Known absence falls through to normal provider resume; a known pause preserves the existing resumed/ended responses. Unreadable evidence reaches the existing error path before provider writes. This removes a duplicate observation for a known pause.

Studio cancellation and pause error text now says the change could not be confirmed and asks the creator to check billing before retrying. It does not claim no change or charge occurred after an ambiguous reply.

Tests exercise actual POST, undoPause and billing against MemoryRedis and synthetic provider responses, with only authentication/request-size wiring replaced. No real provider request. Malformed/lost/wrong-type evidence keeps annual/due markers with one observation and zero provider writes; known absence resumes normally with one provider write. This is not Lua or human-test proof. Full hosted CI required.

Same actions, zero added steps/decisions. No prices, rights, limits, opt-in, language activation, gates or funding policies changed. No additional I/O/service/storage cost; CI/review FX275 unknown remains nonzero. Concurrent cleanup and funded notice source-grant lifecycle remain unresolved.
