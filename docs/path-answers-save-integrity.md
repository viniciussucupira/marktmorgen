# Path answer save integrity

The form blocks edits only while a request is pending, so edits typed after submission cannot be silently discarded by a successful reload. A synchronous lock blocks concurrent writes. Known pre-write refusals preserve entries and allow explicit retry. Malformed,contradictory or network outcomes keep entries editable/copyable and pause write/delete buttons until refresh; the message explains that copying is needed before refreshing. No automatic retries or browser-storage persistence is claimed. Confirmed acknowledgement alone reloads. No server/API,privacy deletion,cost,allowance,pricing,payment or tax changes;PLANS_ON_SALE stays false.

Pure reply tests and synthetic390/1280 browser cases cover pending single-flight,all fields/actions disabled while pending,retained values after refusal and uncertainty,editable unknown values,paused writes,confirmed mock acknowledgement reload,scoped AA and fit. Every POST is intercepted: no real write,push,message or payment. Existing backend atomicity and complete flows remain in full CI. Unsaved navigation protection and durable draft storage are outside this change.

The form also replaces its unstyled input class with the shared field system, reusing the tested labels,visible boundaries,placeholder and keyboard ring. The actual Path skills field receives a real Tab/same-pixel3:1 focus-area check at390/1280.
