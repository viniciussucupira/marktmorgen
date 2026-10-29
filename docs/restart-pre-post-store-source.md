# Current Store source before a funded restart POST

The funded owner already proves the stopped provider subscription and reads its existing price. Those waits can outlive the current Store plan. Before its single subscription POST, the real restartPlan path now reads the current owner record again and requires the exact ref, handle, statsId, source subscription, customer, inactive status, tier and monthly interval from its immutable intent. It rechecks the submission clock after that read.

The read uses GETRANGE0..MAX_STORE_BYTES inclusive: at most1000001raw bytes; anything above the1million-byte Store ceiling, partial, malformed, missing, foreign or accessor-based is refused. It cannot migrate/save a catalog. The comparator reads own primitive properties without invoking source getters. A refusal keeps the already-armed owner, cash and pause evidence; it never re-arms, frees a grant, substitutes a price or permits another POST. Recovery keeps its existing3lifetime provider-read allowances and does not enter this first-POST path.

This is an additional current-source restriction, not funding authorization or atomic synchronization with a later owner edit. An edit after the read is still possible. It does not publish the funded Store, create a durable publication receipt or clean up the funded generation. Both existing terminal holds and pauseRestart=false remain. Policies/reviews stay null and no actual funded request is enabled.

## Synthetic verification

The source predicate tests changed handle/stats/subscription/customer/status/tier/cycle/owner, foreign extra-store SID, unknown and inherited records, and getters with0invocations. The real Store lookup tests exactlyone bounded GETRANGE, valid ownership, malformed/oversized/UTF8/foreign replies and accessor ACKs. Disposable CI Redis executes actual GETRANGE and measures1command/1000001raw-byte maximum. Existing funded closed-coverage tests remain; no positive end-to-end funded publication proof is claimed.

## Costs and bounds before any operation

This is a separate first-owner pre-POST read, not silently folded into the existing17command Lua ceilings. CONTRACT_FUNDING_RULES binds its1command and1000001raw-byte bound into the terms snapshot, requiring a fresh review. It adds no key, receipt, storage allowance, retention, provider call, job, schedule or retry entitlement.

| Contract | Construction envelope per first acknowledged armed attempt | Reviewed monthly/annual total |
| --- | --- | --- |
| Creator monthly | 1GETRANGE;max1000001raw bytes | unknown,rejected |
| Creator annual | same conservative per-attempt envelope;annual restart still refused | unknown,rejected |
| Pro monthly | 1GETRANGE;max1000001raw bytes | unknown,rejected |
| Pro annual | same conservative per-attempt envelope;annual restart still refused | unknown,rejected |
| Scale monthly | 1GETRANGE;max1000001raw bytes | unknown,rejected |
| Scale annual | same conservative per-attempt envelope;annual restart still refused | unknown,rejected |

The current spend table's Redis command component is$2/million, so1command is$0.000002 per attempt before all other costs. This is not the whole request cost or an approved monthly/annual budget: JSON escaping/envelope and all transfer hops, hash/parse/CPU, maximum paid provider rates, source and pending-liability horizons, taxes, receiving,100%rights/add-ons,100%LLCfixedcosts,global exposures and reserves remain required. Raw bytes are not a wire-byte claim. Attempt horizons for annual profiles are not inferred by multiplying a monthly observation. Unknown monthly/annual totals fail and coverage remainsfalse, so no operation is enabled by this component.

## Previous actual incorporation and production

PR1197 merge da6e51189856123d555a1aeef2454d3d6310a07a at29/10/2026 03:44:21Fortaleza(06:44:21UTC),testedhead90bbe624ef6760f3369c134e4ab65a68e331cef3,tree5932b27009df93738aa4d95b053c139e1b5b5465 actual=predicted=tested;parents e4c251468cc7d26fff9f6c56552efbb5bae71d95 andtestedhead.39/39checks+Vercel passed on thathead. Formation-omission test passed06:20:54.0764129UTC;actual-generator bytecomparison06:20:54.5311451UTC/job123296684742. Eightfullscopes10+7/productextra6;signup3x30cases150audits0failures;mobile9cold samples LCPmax1052ms,CLS0,interaction120ms,0writes(labproxyonly). NVDA/VoiceOver2entryheadings each,0writes/foreign,notfull tasks.

READY dpl_CN74QnscTBUetDsxPQmz84XntzCy,exactSHA da6e51189856123d555a1aeef2454d3d6310a07a,sevenaliases andHTMLdata-dpl-id on marktmorgen.com /,/pricing,/platform/path,/help,/proof/comparisons matched. No independent39main rerun or interactive proof is invented;counter254 stays. This evidence accompanies actual wired code,not an exclusive proof PR.

MR/TX/SD1/AV1 andLQ17/LQ18/FIM1 remain binding. Prices,visiblelimits,commission,permissions/opt-in,buyerlangs,creatorcontent,persistedIDs andHazelsong remain. OPENING_REQUESTED=false andPLANS_ON_SALE=false.
