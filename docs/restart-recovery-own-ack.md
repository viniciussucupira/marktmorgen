# Own bounded acknowledgement for restart recovery

takeRestartRecovery controls a finite lifetime provider-read allowance and reconciliation of already-activated evidence. It previously traversed reply members and encoded strings before requiring bounded own data. A private decoder now requires outer own length1, inner own length1/2/4 before traversing data, known flags and own entries, and code-unit caps before the unchanged UTF8 byte caps. All receipt/source/financial/clock/expiry/checkpoint checks remain after the safe copy.

Unknown acknowledgements return null. They never restore a consumed read allowance, trigger readback/retry or permit POST. The Lua protocol, three-read lifetime cap, cash/receipts/pause/annual evidence, activation checkpoint and empty recovery policyBinding are unchanged. Production pauseRestart coverage stays false.

Actual-entry synthetic tests reuse real financial configuration, ownership decoder and preparation. A postcommit allowance model exercises read and activated replies,16malformed/lost cases in each, direct positive descriptor probes for all4flags, inherited/accessor/oversized tails, UTF8 limits, conflicting publication and expiry during ACK. It retains possibly committed source state and consumes the first read on a lost acknowledgement; only two more reads remain before held. Already-activated reconciliation consumes no extra provider read. Every returned recovery arm still refuses live submission permission.

The model is not execution of Redis Lua, actual provider IO, lifetime-notice funding or whole-product certification. Existing realRedisLua/productionclosedcoverage tests remain required. Full new-head CI is mandatory.

## Acessibilidade

No interface/wording/task change:0to0steps/decisions; no AAA/human-use claim. Benefit is refusing forged or unbounded recovery evidence without replenishing financial allowances, reducing operational risk. No additional productive request, key, retention or paid service; bounded local work only. CI/review are100%company FX275 costs, unknown notzero. No prices, rights, limits, commission, tax/commercial/opening/opt-in gates or creator/Hazelsong content changed. Source-grant lifetime funded notices remain held.
