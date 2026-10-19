# Board participation confirmation

Joining still requires the existing explicit, unchecked consent; leaving retains existing privacy allowance access. No server, API, allowance, financial, payment or tax rule changes.

A synchronous lock prevents same-event-loop duplicate requests. Only an integer 2xx response with own `ok: true` reloads participation. Recognized 4xx refusals permit an explicit retry; contradictory, malformed, server or network replies pause further changes until a refresh reviews the actual participation. No claim of successful withdrawal is shown for unknown outcomes. The privacy link remains available.

Synthetic browser tests intercept all added board POSTs and cover both join and leave at390/1280: consent, pending lock, refusal, uncertain retry suppression, acknowledgement reload, scoped AA and fit. Existing real local persistence/export/withdrawal flows remain in the full suite. No real external messages or payments. Broad AAA and net margin remain unverified.
