# Closing waits for readable pause evidence

lib/plan-closing.ts uses onBreak before calculating a creator's closing/removal day. That guard previously swallowed a read failure as no pause, and unreadable persisted data was also treated as no pause. Unknown evidence could therefore allow closing to proceed.

The existing pause read now distinguishes explicit absence from unreadable data. Closing waits when the stored pause is unreadable or the read fails. An explicit miss still permits ordinary closing, and valid future/expired pauses retain their existing behavior. No new provider/Redis read is added.

Synthetic cases verify unreadable records, unavailable reads with restoration of the test adapter, explicit absence and the existing valid future/expired controls. This is protection against destructive decisions on unknown evidence, not a repair or proof of an active paid plan. Retention and repeated reads still have costs: unknown duration/cost is not zero or a saving. Funded pause/restart/retention lifecycles must reserve these obligations before commercial operation; policies and coverage remain closed.

Persisted times must be positive safe whole seconds, the end must follow the start, and the notice time must be a nonnegative safe whole second. Missing legacy notice time still means zero. Invalid card identifiers or malformed notice values are unreadable evidence, not an expired pause. Synthetic negative/fractional/unsafe times, invalid card and malformed notice values exercise the same preservation and closing hold.
