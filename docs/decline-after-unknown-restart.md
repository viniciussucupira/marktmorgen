# Card refusal after an uncertain plan restart

A provider or network failure can precede a later card refusal. The later refusal is evidence about the latest attempt; it does not prove that an earlier attempt did not charge the creator. The failed restart notice now preserves that distinction and asks the creator to review billing before trying again. It never requests card details.

The existing synthetic provider-error-then-card-refusal test checks this sequence, alongside the standalone template assertions. Existing restart, pause, undo, retry horizon, manual restart and unknown-outcome tests remain.

This change only corrects the notice. It does not implement durable restart intents, receipt reconciliation, acknowledged store activation or duplicate-charge recovery. Those remain required work in opening block AB(a). It adds no send, Redis operation, provider operation, key or persisted field. Template bytes and processing are unmeasured, not zero. No margin certification is made; commercial policies remain closed, with all costs and the most onerous tax reading still binding.
