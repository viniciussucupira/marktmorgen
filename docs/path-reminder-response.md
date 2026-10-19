# Path reminder response integrity
The owner-requested reminder UI now requires an HTTP success and a valid
nonnegative safe integer device count before confirming a request.
A zero count says no device request was confirmed, not that none was sent.
Known pre-dispatch refusals (not started,quiet,stale,complete,allowance) retain
their current text and allow an explicit retry. Unavailable may occur after
dispatch has begun, even with the API's409 response; it remains uncertain.

Contradictory/malformed replies,network errors and unavailable outcomes pause
the button until page refresh and say the request may have gone through.
A synchronous reference blocks concurrent handlers before React renders.
No automatic retry,background polling or claim of notification delivery.
Server dispatch,consent,quiet hours,once-per-day dedupe,20 additional studio
requests,reservation,pricing,limits,payments,tax and commercial gates unchanged.
PLANS_ON_SALE remains false. This is UI integrity,not scheduled reminders.

Pure reply tests cover malformed counts,status contradictions,known refusals,
prototype keys and partial-dispatch uncertainty. Browser tests intercept every
reminder POST,exercise pending simultaneous clicks,confirmed/zero counts,
quiet refusal/manual retry,503 success-body contradiction,409 unavailable,
malformed JSON and network loss at390/1280 with scoped AA and layout checks.
No real push,external message or payment is made.
