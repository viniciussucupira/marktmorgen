# Confirmed essential studio allowance

The existing authenticated essential studio path used a public abuse limiter that deliberately fails open. It could not serve as a confirmed finite prerequisite for billing/data actions. A separate essential-only helper now uses the identical SET NX + INCR, key, TTL and ten/day limit, requiring its own two-entry data acknowledgement and a positive safe integer count. Missing configuration, thrown/unknown/malformed replies refuse before downstream work. A lost acknowledgement retains any committed count, with no retry/readback.

Generic public guards remain unchanged. Tests exercise actual helper and countStudio with committed MemoryRedis increments, accessor/inherited/oversized/wrong-number replies, exhaustion and positive recovery. This is not real Lua proof. Full hosted CI required.

No new productive commands, reads, keys, retention, services or allowance. Refused requests still cost work; ten confirmed admissions per store/day is not a global cost/reserve proof. All six monthly/annual contracts, source-funded obligations and all-tax review/reserves still require complete evidence; unknown fails. No new operation authorized. CI/review FX275 unknown is not zero. Accessibility: same existing refusal route, zero added steps/decisions; no human/conformance claim.
