# Recovering a committed restart activation without another provider read

The recovery script already reads the durable active and activated bindings. Previously it still consumed a provider-read allowance and returned an exact-ID GET instruction after activation had committed. Three repeated passes could exhaust that allowance while the real billing path remained held for Store publication.

The wired recovery now returns a distinct activated observation only when the immutable owner, source receipts, observed subscription, annual marker, pause/due evidence and exact active/activated paid binding agree. The paid period must still be current. It returns the existing intent and paid binding without HSET or another provider-read entitlement. Billing checks the original owner/customer/card/tier, revalidates ledger activation and stays held for acknowledged Store publication and generation-aware cleanup. It does not POST, rearm, release cash, erase a pause, publish a Store or claim full funded coverage.

Unactivated uncertain/observed recovery keeps the existing three lifetime provider reads. Lost ACK still consumes a real provider-read allowance. A committed activated observation does not replenish or consume that counter, including when all three reads were previously consumed. Expired, corrupt, foreign or mismatched evidence refuses.

Synthetic actual Redis cases lose the first observation ACK and race64 callers at0,1,3 consumed reads, require identical retained evidence and zero HSET, preserve all ledger/pause/year/due fields and reject11 unknown/expired cases. Existing unactivated read-ceiling tests remain. Hosted full-suite results must be recorded after the exact final head passes; no positive production-funded lifecycle proof is claimed. redis-memory has no funding-script emulator; no such support is invented.

## Costs before operation

No new command, key, receipt, retention, job, provider call or retry allowance is added. Recovery remains bounded by17 Redis commands per invocation; current billing then revalidates activation under its existing17-command ceiling. This two-script component is at most34 commands, or$0.000068 at the registry component rate$2/million. This is not the whole request cost or an approved monthly/annual budget. The activated result contains at most4096 intent plus256 binding raw string bytes;4352 is a raw field sum, not a serialized/wire-byte ceiling. JSON escaping, transfer hops, parse/hash/CPU, maximum paid rates, per-contract invocation caps, source/pending liability horizons, taxes/receiving,100%rights/addons,100%FX275 fixed costs and reserves still need proof. The rule binding changes and requires fresh review.

| Contract | Per activated observation construction envelope | Monthly / annual all-cost result |
| --- | --- | --- |
| Creator monthly | recovery17 + revalidation17;0 provider read | unknown / unknown; rejected |
| Creator annual | same conservative envelope;annual restart remains refused | unknown / unknown; rejected |
| Pro monthly | recovery17 + revalidation17;0 provider read | unknown / unknown; rejected |
| Pro annual | same conservative envelope;annual restart remains refused | unknown / unknown; rejected |
| Scale monthly | recovery17 + revalidation17;0 provider read | unknown / unknown; rejected |
| Scale annual | same conservative envelope;annual restart remains refused | unknown / unknown; rejected |

No total is obtained by silently annualizing an unknown monthly horizon. Policies/reviews remain null,pauseRestart=false,OPENING_REQUESTED=false,PLANS_ON_SALE=false. MR/TX/SD1/AV1/LQ17/LQ18/FIM1, prices, limits, permissions/opt-in, creator content, buyer languages and persistent identifiers stay binding. Counter254 remains held.

## Previous actual publication

PR1198: merge02ba94bdc11403dae5ceb1ea6471c341706372b5 em29/10/2026 04:43:45Fortaleza(07:43:45UTC),head dd475569838b93a6744ada656551d38dba002a62,árvore7f8959d6aea4961b236e276cb5db24cdac8660a1 actual=predicted=tested;parents da6e51189856123d555a1aeef2454d3d6310a07a ehead.39/39+Vercel aprovados noheadfinal. Verify123315398963:234/234bundles/Everythingpassing07:20:29.6332458UTC;lookupreal/30camposausentes-malformados/getter0 em07:19:05UTC. Redis123315399021:1GETRANGE/max1000001rawbytes em07:16:05.1641687UTC.8escopos fulltrue10+7/productextra6. SignupChr123315156954/Fx123315156865/WK123315157062:30casos/150auditorias/0falhascada. Mobile123315399095:9frias,LCPmax1004ms/CLS0/interação104ms/0writes,proxy laboratório. NVDA123315453782/VoiceOver123315453710:2cabeçalhoscada/0writes/foreign,sem tarefascompletas. BrowsersFx123315399066/WK123315398984 aprovados. READY dpl_E436uzmG6KT9y4cEpb2VGUdVuegH,SHAexato02ba94bdc11403dae5ceb1ea6471c341706372b5,setealiases eHTMLdata-dpl-id em marktmorgen.com /,/pricing,/platform/path,/help,/proof/comparisons conferidos07:45UTC. HTTPsomenteleitura;sem provainterativa,contador254mantido. Não se inventa39rerunsindependentes no main. Registro acompanha próximo código real,semPRexclusivodeprovas.
