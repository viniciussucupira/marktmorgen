# Exact-generation cleanup in the existing pause worker

The worker must not delete a replacement pause written while its provider or Store save awaited. It now removes only its exact observed raw record and matching due score in one Redis script. An observed explicit miss only removes a stale due member if the pause is still absent. A lost, malformed or negative acknowledgement retains evidence and prevents a restart/drop announcement. The annual marker is never touched.

This changes the actual legacy runBreaks cleanup at its four sites. Creator undo/drop semantics remain separate. Funded records are explicitly refused by the cleanup script; the funded restart's terminal hold and pauseRestart=false remain. This is not complete funded Store publication, notice generation safety or renewal funding. Notice SET after email is a separate outstanding race.

Synthetic verification includes three actual worker races (explicit miss, manual replacement, post-provider Store save), preserving replacement raw/due/year and suppressing success notices. Disposable CI Redis executes the production Lua directly for replacement raw, changed due, funded evidence, successful cleanup and lost-ACK/new-generation replay. No real provider account, payment, notice or external submission is used.

## Commands and costs before operation

Known cleanup replaces DEL+ZREM (2 commands) with EVAL+GET+ZSCORE+DEL+ZREM (at most 5): incremental ceiling 3. Missing cleanup uses EVAL+GET+ZREM (3), replacing 2: incremental ceiling 1. Refusal never falls back. No key, retention, product content, annual counter or provider operation is added.

The daily worker already bounds each batch to 200 distinct members. For conservative 31-day months, 12 such months in the annual allocation, 6200/74400 cleanups at the maximum incremental 3 yield 18600/223200 commands. At the current registry UPSTASH_MICRO_USD_PER_MILLION_COMMANDS=2000000 ($2 per million, no free quota), the incremental command component is $0.0372/month and $0.4464/year. This whole shared bound is conservatively assigned to EACH contract below rather than divided by an unknown customer count.

| Contract | Monthly command component | 12-month command component |
| --- | ---: | ---: |
| Creator monthly | $0.0372 | $0.4464 |
| Creator annual | $0.0372 | $0.4464 |
| Pro monthly | $0.0372 | $0.4464 |
| Pro annual | $0.0372 | $0.4464 |
| Business monthly | $0.0372 | $0.4464 |
| Business annual | $0.0372 | $0.4464 |

These are command components and a configured daily-pass scenario, not full costs or a new scheduling entitlement. Additional invocations must be counted against existing funded resource ceilings and reservations; 200 per invocation alone is not a global spending cap. Wire/CPU, deployment/CI, provider rates above the current registry, taxes, receiving, LLC fixed costs, all rights/add-ons at 100% and exposure/reserve funding remain required and unknown fails. No margin certification or new cost permission follows from this table. No schedule, ceiling, policy, reservation, price, visible limit, commission or flag changes.

## Previous actual publication evidence

PR1194 merged at 29/10/2026 01:16:24 Fortaleza (04:16:24 UTC), exact main b081d84669f991af2deca9774eb8427f5aeeaad2, tree d0f57f53347f1570e0e5c5605f48071d48bba8ac. Claude SC1 merged concurrently and was preserved; all 39 checks on that actual combined main subsequently passed, with no borrowing of the earlier PR-head result. Behavior job123259867717:234/234 bundles and Everything passing at04:22:29.8713939UTC; real Redis job123259867663 verified restart recovery11/activation23 cases and unchanged17command ceilings. Eight full scope gates, signup3x30cases/150audits/0failures, mobile9cold samples and entry headings in NVDA/VoiceOver were separately checked. Reader headings and lab timings do not prove complete human journeys.

Production dpl_A6Nf5ihJFptEgyKvYdWQqtYTiDNS was READY at the exact SHA; seven aliases and HTML data-dpl-id on marktmorgen.com /,/pricing,/platform/path,/help,/proof/comparisons matched. Interactive proof remains pending; functional counter254 stays unchanged. This evidence accompanies an actual code correction, not an exclusive proof PR.

MR, TX, SD1, AV1, LQ17/LQ18 restoration and FIM1 order remain binding. OPENING_REQUESTED=false and PLANS_ON_SALE=false; policies/reviews stay null and unknown costs never become zero.
