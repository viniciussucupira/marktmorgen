# Order admission acknowledgement

The actual admitOrders entry now accepts only one own numeric pipeline response. Numeric1 grants the existing held admission; numeric0 or2 retains the existing paused result. Missing, coerced, inherited, computed or oversized responses return unavailable. Potentially committed order/data holds are retained, with no retry or cleanup.

The existing actual-entry MemoryRedis suite commits a real synthetic admission before each malformed response or exception. It checks refusal, exactly one admission attempt, retained order/data holds and no getter/coercion/member access for invalid envelopes. A valid numeric success observes the descriptor probe; explicit0/2 and existing quota/settlement tests remain covered. No private decoder is exported.

This does not implement geographic tax refusal, prove source-funded lifecycle completeness, or enable any gate. The Lua reservation, limits,25-hour window, settlement of existing paid orders and customer rights stay unchanged. No new productive operation/provider/retry/price or visible limit. CI/review costs remain100%MarktmorgenFX275, unknown never zero. Whole new-head CI is required before merge.
