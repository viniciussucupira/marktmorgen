# Own acknowledgement before scheduling a plan break

pausePlan must know the annual eligibility result and all three durable scheduling writes before asking Stripe to stop renewal at the paid period's end. Previously those checks read array entries directly, permitting inherited values or invoking accessors.

A bounded private decoder now requires own length1 or3, then own data entries before interpreting exactly numeric0/1 for annual eligibility, or OK/numeric0or1/OK for persistence. Unknown annual state refuses before writes; uncertain committed scheduling retains the exact pause, due membership and annual marker, and refuses provider mutation. No retry, cleanup, rollback or weaker eligibility was added.

The existing actual pausePlan integration test uses its current synthetic provider/Redis stub. Additional inherited/accessor/oversized replies exercise both boundaries; scheduling replies are replaced after the existing stub actually commits the three writes, then retained evidence and absence of provider mutation are checked. Invalid cardinality is refused before member descriptors; getters stay uncalled. Existing happy paths, provider-lost-ACK, ownership/card, funded hold and real Lua tests remain. Full branch CI is required; not a lifetime funded notice guarantee.

## Acessibilidade

No interface, wording or task change:0to0new steps/decisions; no AAA/human certification. Benefit is refusing to schedule a subscription stop on fabricated acknowledgement evidence while preserving possibly committed financial state. No extra productive request, service, key, retention or cost authorization. Local bounded descriptor checks only; CI/review remain company FX275 costs, unknown notzero. Prices, rights, limits, all gates and creator/Hazelsong content unchanged.

This branch is stacked on the actual1252union1941439 after preserving Claude1253/1251. It only edits pause scheduling source/tests plus its documentation/journal, not1252funding implementation. The valid1252CI is left running; no competing edits to that branch.
