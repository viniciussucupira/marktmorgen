# Paid order resource cohort

AB(a), 24 October 2026. A store period explicitly marked `funded:true` must obtain the shared paid resource window acknowledgement in `admitOrders` before order/data-room capacity is held and before the calling checkout can ask a buyer to pay. Missing actual financial approval refuses the new admission. Existing trial and unmarked legacy admission rules remain in place. This does not establish financial approval for those paths.

`settleAdmitted` remains callable for already-paid checkouts even when new resource admissions are refused. It returns only the existing capacity hold; it never releases the contract's financial principal or cash reserve. Actual suppliers and buyer payments are not exercised by tests.

## Conditional incremental cost before operation

One additional shared-cohort EVAL per marked funded admission: at most 18 commands for the first acknowledgement, 17 for an identical retry. Serialized request JSON is bounded to 12,288 bytes by the existing resource helper. All resources share the same permanent ledger field: no additional order-specific cohort field, maximum one field/month or twelve/annual grant. Existing order ledger, open-hour hold and settlement commands are unchanged.

Conditional scenario only: one admission observation per advertised order unit, one primary, no replication, paid PAYG USD0.20 per 100,000 commands, using 18 commands for every observation. Both billing intervals retain the same worst-month allowance:

| Plan | Orders/month | Extra USD/month | Extra USD/12 worst months | JSON bytes/month | JSON bytes/12 months |
|---|---:|---:|---:|---:|---:|
| Store | 200 | 0.0072 | 0.0864 | 2,457,600 | 29,491,200 |
| Studio | 450 | 0.0162 | 0.1944 | 5,529,600 | 66,355,200 |
| Scale | 1,500 | 0.054 | 0.648 | 18,432,000 | 221,184,000 |

These numbers are NOT an upper bound for real attempted checkouts: rejected admissions, abandoned checkouts, retries, multi-unit calls and abusive requests can produce more observations than completed orders. No total request cap is introduced by this change. A known global cap, topology, CPU/memory, replies, transfer, HTTP/TLS overhead, retention and reserve are still required before operation. Unknown costs fail approval, not zero. Published prices, rights, commission and tax controls are unchanged; the most onerous tax reading and full allocation of LLC fixed costs remain binding. No 60% margin certification.

## Synthetic verification

Run the full existing CI on the exact head. The real admission module must refuse a marked funded store without actual financial reviews before writing order holds. Existing tests continue to exercise legacy quota/open checkouts/data-room behavior. A capacity hold created before payment is settled using the marked store without requiring new financial approval, preserving already-paid fulfillment. Shared resource helper tests separately cover funded proofs, cash reconciliation, retries and anchored monthly/annual windows. Full coverage of all resources, renewals and settlement/reserve reconciliation is still false.
