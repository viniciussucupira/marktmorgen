# SES claim acknowledgement

The actual sendEmail path now distinguishes a confirmed claim from an uncertain acknowledgement. viaAmazon bounds the array at one own data member before reading that member. Only exact OK permits an SES send; exact null retains the existing claimed-key behavior. Any other response or exception holds both providers, returns false to the caller and retains a possibly committed claim.

The existing SES sender test runs the actual entry with synthetic HTTP providers and MemoryRedis. It commits each claim before injecting malformed responses or throwing, then checks no provider sends, no claim deletion and no sender counts. Accessor, inherited, sparse, symbol, non-array and oversized responses are covered, with an observed positive own-member control. Existing successful, duplicate and fallback paths remain covered by that same suite.

This does not turn a claim into delivery evidence, change the existing one-day TTL, guarantee exactly-once delivery across retries, or fund notices for a source contract lifetime. Existing claim semantics and other definitive provider fallback paths remain unchanged. Unknown outcomes require reconciliation; no funded notice lifecycle gate is enabled.

Runtime work is fixed descriptor inspection replacing unvalidated destructuring. No new productive IO, provider, retry, price or limit. Synthetic CI and review costs remain wholly attributed to Marktmorgen; unknown costs are not zero. Full new-head CI is required before merge.
