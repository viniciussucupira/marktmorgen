# Bounded pause-record acknowledgement before financial work

The pause record reader already asks Redis for at most 4097 bytes and rejects records over 4096 bytes. Its JavaScript acknowledgement decoder nevertheless used canonicalFinancialSnapshot before checking cardinality and record size. That generic serializer could traverse a malformed oversized response before refusing it.

The actual storedPauseAt reader now accepts only the finite own-data shapes [[0]] and [[1, raw]]. It checks both array lengths before visiting members, refuses accessors/symbols/sparse or wrong shapes, and checks raw string length before UTF-8 byte length. There is no generic snapshot serialization. Unknown evidence keeps closing on hold and the due worker refuses follow-on work; explicit absence retains existing stale-index behavior.

Tests exercise actual pauseOf, onBreak and runBreaks with synthetic malformed responses, including instrumented outer and inner over-limit arrays, ASCII/UTF-8 oversize, accessor, sparse and symbol responses. Positive instrumentation checks guard against a vacuous zero-read assertion. Tests require original funded pause bytes, due membership and annual marker to remain and zero owner/provider/email/cleanup operations after rejection. Existing valid observation and explicit-miss tests remain.

## Accessibility and benefit

No UI, text, required step or decision changes (0 to 0). This prevents unreadable evidence from authorizing content removal or extra provider work. It reduces unnecessary decoder work without claiming zero cost or full product accessibility/interactive proof.

## Costs and scope limits

The same Redis script, keys, 4096-byte record limit, source lookup, provider and send paths remain. No extra command, field, job, retry, retention or vendor operation is introduced. Transport/JSON-decoder bounds and global/lifetime/source-reserved notice costs remain separate unresolved obligations. No monetary zero, full margin or complete funded notice lifecycle is certified.

MR/TX/FX275, prices, visible rights, commissions, opt-ins, creator data, persisted identifiers and all release gates remain. pauseRestart/resourceAllocations/renewals/settlementAndReserveReconciliation remain false. Funded notices still require source cash reservation and durable generation before admission; the company email meter is not that reservation. Synthetic tests only. Counter254 remains held without interactive production proof.
