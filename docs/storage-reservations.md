# Reserved R2 uploads

New sold-file uploads to R2 negotiate multipart sessions, including one-part files. The server requires the negotiation; older clients receive `upload_refresh` and must reload. Existing content and download paths are not changed.

## Admission and lifecycle

A store-folder lease serializes R2 admission. Admission measures confirmed stored files and videos, adds every outstanding R2 reservation, and refuses a new file that would exceed the existing standing-specific ceiling. Unavailable measurements and malformed ledgers cannot authorize space. At most 64 reservations are retained per folder. Fenced Redis writes require a confirmed numeric acknowledgement; there is no non-atomic write fallback.

Reservations do not expire just because time passes. Completion releases a reservation after the provider reports a completed file of the expected size. Cancellation keeps the reservation on provider failure. A missing session alone is not a successful cancellation: a positively observed completed object is required before freeing its reservation on a 404 response; a missing or unreadable object retains the reservation. Before a new admission, cleanup attempts at most one expired reservation, retaining bound reservations when cancellation is not confirmed. This is opportunistic cleanup, not a global scheduled sweeper.

No file path or signed part address is returned to the browser before its reservation is bound. An unbound reservation can be retired after the session window because this wrapper has not published a signing capability for it.

Confirmed objects are included in subsequent R2 listings, consistent with [Cloudflare's consistency model](https://developers.cloudflare.com/r2/reference/consistency/). The code must not treat a negative read as proof that an earlier ambiguous write cannot later complete.

## Remaining limits of this protection

- This ledger coordinates new R2 uploads. Blob uploads and Bunny video uploads do not yet reserve against the same ledger.
- Previously issued whole-object URLs and legacy in-flight sessions are not retroactively revoked or added to this ledger.
- Session cancellation and fencing do not establish a complete supplier-dollar ceiling. [Presigned URLs can be reused until expiry](https://developers.cloudflare.com/r2/api/s3/presigned-urls/); repeated part requests and provider operations need their own bounded budget.
- Multipart sessions and reservation checks add provider and Redis operations. Their maximum cost has not been certified as funded by every plan.
- The bucket must expose ETag to the browser, as already required for multi-part large files. No real bucket configuration or paid upload was exercised in this change.
- Encoded video expansion, playback bytes, provider-side budgets, abandoned-part retention, post-cancellation costs and all-tax margin remain separate unresolved work.

Storage/video allowances and prices are unchanged. Paid commercial release remains closed. These reservations are not proof of the 60% customer-level net margin.

## Verification

Behavior tests cover concurrent admissions, exact fits, corrupt/unknown measurements, lost leases, unavailable atomic scripting, uncertain write acknowledgements, cancellation failures and one-part multipart completion. Provider behavior is simulated; this is not a real-provider load test.
