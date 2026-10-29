# Retaining the observed restart publication facts

The committed paid binding retains the subscription and paid period, but not the observed renewal/share values needed by a future Store writer. Recovering those booleans from timestamps or an inactive old Store would invent facts; asking the provider again would defeat the retained-evidence recovery.

The actual provider-to-activation handoff now includes the already-observed period.renews and shared values. Renewal observation requires explicit boolean cancel_at_period_end and null or positive safe-integer cancel_at; missing or malformed cancellation fields refuse. The existing exact price proof supplies the share interpretation. The activation script commits a versioned checkpoint {version,binding,renews,shared}, maximum384 UTF8 bytes, and matching two-field submission.publication in the owned intent in the same existing HSET as active/activated. The intent must still fit4096 bytes before anything is written.

Replay requires exact binding/checkpoint/retained intent flags. Missing, foreign, extra, unknown or mismatched evidence stays held; there is no backfill. Unbacked checkpoint or intent flags cannot authorize a first activation. The original seven-field paid binding remains unchanged. Recovery reads that bounded checkpoint, compares its booleans to the retained intent and carries them to the actual billing revalidation without another provider read or counter mutation.

This is a publication checkpoint, not Store publication. It does not write the Store, alter its indexes, remove pause/due/annual evidence, clear pending liabilities, release cash or authorize another POST. Existing publication/cleanup terminal holds remain and pauseRestart coverage stays false. A future joint Store/index/generation protocol must acknowledge its own writes and lost ACK recovery before coverage can change.

## Synthetic verification required

Actual Redis tests cover lost activation ACK/exact late replay,64 contenders at0/1/3 consumed reads, all4 explicit renewal/share combinations,6 unknown boolean refusals,8 missing/foreign/changed checkpoint cases and2 unbacked first-activation cases. Existing23 activation/11 recovery refusals and all cash/source/pause/year/due preservation remain. The handoff tests retain immutable observed flags and reject unknown cancellation shape/getters. Closed-coverage activation still refuses before IO. Full hosted results must be recorded only after the exact final head passes.

## Costs and bounds before operation

No new Redis key, provider operation, job, retry or invocation entitlement is added. One bounded hash field per existing owned restart grant is new retained storage, not zero-cost data: maximum384 checkpoint raw bytes plus the matching two booleans inside the existing4096-byte intent cap. It remains with the permanent grant; no TTL or deletion is silently added. Lifetime grant count, hash-field overhead, replication/transfer hops and retention horizon must be reserved; unknown fails. The rule binding changes, requiring fresh review.

The new activated branch has one additional HGET. Recovery must remain within its existing17-command ceiling, confirmed by actual Redis measurement before approval; activation keeps its existing17 ceiling and adds the fields to its existing single HSET. Recovery plus revalidation therefore remains bounded by34 commands, a command-only component of$0.000068 at$2/million. No complete request cost or savings claim follows. Returned raw string fields sum at most4096+256+384=4736 bytes; this is not a JSON/wire ceiling. JSON escaping, parse/hash/CPU, all hops, highest paid rates, per-contract/global invocation/grant caps, source and pending liability horizons, taxes/receiving,100%rights/add-ons,100%FX275 allocation and reserves remain required.

| Contract | Construction envelope per activated recovery + revalidation | Complete monthly / annual costs |
| --- | --- | --- |
| Creator monthly | at most34 Redis commands;0 provider reads;384 new retained field bytes within owned grant | unknown / unknown, rejected |
| Creator annual | same conservative envelope;annual restart remains refused | unknown / unknown, rejected |
| Pro monthly | same command/storage envelope | unknown / unknown, rejected |
| Pro annual | same conservative envelope;annual restart remains refused | unknown / unknown, rejected |
| Scale monthly | same command/storage envelope | unknown / unknown, rejected |
| Scale annual | same conservative envelope;annual restart remains refused | unknown / unknown, rejected |

No annual horizon is invented from a monthly observation. Policies/reviews remain null,PLANS_ON_SALE=false,OPENING_REQUESTED=false,counter254. MR/TX/SD1/AV1/LQ17/LQ18/FIM1,prices,visiblelimits,permissions/opt-in,creatorcontent,buyerlangs,persistedIDs andHazelsong remain binding.

## Previous actual publication

PR1199: merge13c7965cc042bdc88a10e72a7bbf0457d1be14b4 em29/10/2026 05:27:44Fortaleza(08:27:44UTC),head b0c0b1f60d0819a00d608acc6709b8a8c1762b8c,árvore197defc683550b2f6a730628a662432fd7a423a0 actual=predicted=tested;parents02ba94bdc11403dae5ceb1ea6471c341706372b5 ehead.39/39+Vercel aprovados noheadfinal. Verify123330536911:234/234bundles/Everythingpassing08:05:12.5679813UTC. Redis123330536909 em07:59:55.9133296UTC:ACKperdido+64corridas em0/1/3leiturasconsumidas,11negações,0HSET,16comandos(EVAL1/GET2/HGET10/TTL1/TYPE1/ZSCORE1) dentro17.8escopos fulltrue10+7/productextra6. SignupChr123330502175/Fx123330502253/WK123330502196:30casos/150auditorias/0falhascada. Mobile123330536903:9frias,LCPmax756ms/CLS0/interação80ms/0writes,proxy laboratório. NVDA123330505818/VoiceOver123330505831:2cabeçalhoscada/0writes/foreign,sem tarefascompletas. BrowsersFx123330536881/WK123330536950 aprovados. READY dpl_39uZvTUdGEVLwtSXcUhcMCy6xD7c,SHAexato13c7965cc042bdc88a10e72a7bbf0457d1be14b4,setealiases eHTMLdata-dpl-id em marktmorgen.com /,/pricing,/platform/path,/help,/proof/comparisons conferidos08:29:52UTC. HTTPsomenteleitura;sem provainterativa,contador254mantido. Não se inventa39rerunsindependentes no main. Registro acompanha código real,semPRexclusivodeprovas.
