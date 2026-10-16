# Limited video playback must not treat lookup failures as zero

A limited store's lesson used watchedIn(), whose display-friendly fallback returns zero when Redis is unavailable, misconfigured or returns an invalid value. That fallback could issue a hosted-player token without confirming the balance.

watchedForAdmission() now distinguishes a successful GET from a failed/ambiguous read. It accepts only nonnegative safe integer seconds, a valid store folder, and a valid month. An acknowledged Redis null retains the existing meter convention of no recorded usage for that month. Invalid strings, booleans, negative/fractional numbers, unsafe integers, missing result acknowledgments and network errors return null. Display/history callers keep their existing reader; they cannot grant limited playback.

lessonVideo() validates a supplied finite allowance before requesting the hosted player. It returns unavailable on unknown consumption or an invalid allowance, pauses at the exact limit, and issues the player only below the confirmed limit. It does not convert a failed read into an exhausted-franchise message.

## Scope and remaining financial controls

No plan price, commission, numerical allowance, signed-token lifetime, metering schedule or public entitlement changes. The existing paid postpaid path still passes null and is unchanged. Existing issued tokens are not revoked. Direct private-file video is a separate delivery path and is not bounded by this change.

This is a lookup-error fix, not a monetary spending cap or proof of 60% net margin. The existing meter can lag, the provider's watch seconds do not precisely bound replay/download bytes, concurrent sessions can use already-issued tokens, and an absent key cannot be distinguished from lost/evicted state by this legacy counter. Provider-side delivery limits, persistent funded reservations, complete fresh measurement, exact byte/session exposure, prepaid admission and revised plan caps remain necessary. No live provider configuration is changed.

Validation: 10 new tests exercise the real limited lessonVideo path with Redis and player doubles, including proving the player is never requested after a failed/ambiguous/corrupt read or exhausted/invalid allowance. Changed modules/tests pass strict TypeScript using the repository ES2017 target and current dependency fixtures. The 71 watch checks, 119 stream checks and 18 course-video checks passed (208 total). The watch assertions used current main Terms/help/feature-page text fixtures and the proposed learn source instead of older local edited copies; other dependency fixtures came from the local checkout. No full current-main build or live provider billing test was run.
