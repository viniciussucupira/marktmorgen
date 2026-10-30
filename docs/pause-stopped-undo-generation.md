# Taking back a stopped break: exact generation cleanup

AV1/SD1 correction. A creator taking back a break after it starts must not delete a break replaced while the request waited. The actual `undoPause` stopped branch now reuses `PAUSE_WORKER_FORGET`: exact raw record, exact due score, no funding owner, own numeric success acknowledgement. A missing/lost acknowledgement refuses confirmation; there is no retry, readback, blind DEL/ZREM fallback or annual refund. Before-start undo and `dropPause` still need their separate annual/provider generation protocol; this change does not claim those races solved.

The known-generation Lua branch reads at most 4097 bytes with GETRANGE and refuses an empty or oversized value before decoding. Existing worker known cleanup gets this same bound. Its missing-record branch is unchanged. Cleanup has at most five billed Redis commands including EVAL, versus two blind writes in the stopped undo branch. No additional network round trip, key, retention, provider request, email or service. The old bounded observation is unchanged.

Tests exercise actual undo with the existing synthetic provider and MemoryRedis: replaced raw/annual marker, changed due score, committed cleanup with lost acknowledgement, funded evidence, and positive cleanup retaining annual eligibility. This is an actual-function/model test, not a real-Redis claim. The existing hosted real Redis harness executes the extracted production Lua, counts commands without changing its five-command ceiling, and now probes 4096/4097/100000-byte records. Full CI is required on the final head. No real payment, account, email or external submission.

## Costs, ceilings and limits of proof

The unchanged confirmed essential meter permits ten admitted actions per rolling daily window per store. For one fixed store/key, explicitly allow 320 admissions over a 31-day month including partial boundary windows; independently allow 3670 over a leap-year horizon including its boundary. Denied requests, mutable identities, all legacy/source lifetimes and retained funded liabilities are **not** proven bounded by this meter. They remain outstanding; do not use these numbers as global or source-grant funding proof.

The executable six-profile comparison uses canonical highest-paid database/transfer and hosting rates in `lib/spend-cost-table.ts`, plus its 10% supplier-charge allowance: 5 cleanup commands, 65536 transferred bytes, one function call with 2 GB for 60 seconds and 1000 ms CPU, no newly retained bytes per admitted action. The function/CPU allocations are conservative comparison allowances, not measured request duration, an enforced hosting deadline, a new reserve, or total request cost. Existing observation/auth/meter costs, rights, payment charges, taxes BR/US, support, exposure, fixed LLC costs FX275 and any longer lifetime still require their existing canonical review; unknown is refusal, never zero. No service is purchased and no financial gate is opened.

| Plan | Monthly profile, USD | Independently priced annual horizon, USD | Annual profile worst 31-day month, USD |
| --- | ---: | ---: | ---: |
| Creator | 0.141314 | 1.620676 | 0.141314 |
| Pro | 0.141314 | 1.620676 | 0.141314 |
| Scale | 0.141314 | 1.620676 | 0.141314 |

These are infrastructure comparison components rounded up at each canonical rate, before the unresolved full economic review. They certify neither unit profit nor the company's net margin. All real pause/restart funding policies/coverage/reservation gates remain held. MR/TX and the latest direct instruction govern their respective requirements; no tax conclusion is introduced.

Accessibility: existing action remains one action and zero new decisions (1→1,0→0). No screen, label, language, persisted identity, price, visible entitlement, content or opt-in changes. PLANS_ON_SALE and OPENING_REQUESTED remain false. Human/interactive Chrome proof is not supplied by these tests; counter254 remains held.
