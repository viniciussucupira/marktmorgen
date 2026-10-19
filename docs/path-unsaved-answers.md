# Unsaved Path answers

The existing shared leave guard now protects edited Path answers when following another same-origin page and on tab close/reload. Declining navigation keeps the entered values. Pending/refused/uncertain submissions retain the guard; they still use the existing single-flight and uncertain-write protection. No browser storage is introduced.

A valid acknowledgement sets a dedicated state. The guard's cleanup runs before an effect reloads the saved result, avoiding an unsaved-work prompt after confirmed save/deletion. Delete confirmation remains unchanged. No server, consent, pricing, limits, cost, payment or tax changes.

Synthetic browser tests at390/1280 confirm unload protection, actual dismissed navigation and retained entries, existing pending/refusal/uncertainty behavior and confirmed reload without a beforeunload dialog. Intentional fixture reloads accept their unsaved-work warning; final confirmed-save test asserts none. Browser-specific tab restoration and durable recovery are not promised.
