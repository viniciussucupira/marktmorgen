# Pause notice completion preserves the observed generation

The actual legacy runBreaks notice path previously sent email and then overwrote the pause with an unconditional SET. A replacement or removed pause during that wait could be overwritten or recreated.

The worker now accepts the told marker only for the exact raw record and matching due score in one Lua operation. It changes only the notice timestamp, preserves TTL with SET KEEPTTL, refuses funded records, unknown future fields, changed plans, expired notice windows and already-told records. Unknown future fields already observed are held before another email. Negative, lost or malformed ACK never falls back to SET and never increments acknowledged told count.

The email may already have been sent before a concurrent replacement is detected. This is not exactly-once delivery or a funded notice protocol. A lost ACK after a committed marker is read back on the next ordinary pass, so no second notice is sent for that committed marker. No paid restart, cash release, cleanup, new provider write or new permission follows. Funded pre-due notices and funded Store publication remain blocked.

Five synthetic worker cases exercise replacement, removal, changed due, missing ACK after commit and future evidence. Disposable CI Redis executes production Lua for eight negative cases, retained expiry, exact-byte generation, lost ACK and later replacement. Existing full tests and 39check gates remain mandatory.

## Cost before operation

Old marker SET is1command; new EVAL+GET+ZSCORE+SET is at most4, incremental3. No new key, retained byte ceiling, lifetime, job, schedule, provider call or message allowance is added. Notice and cleanup branches are mutually exclusive for a member in one worker pass. Therefore PR1195's conservative shared envelope still bounds this combined change:200distinct members/pass,31daily passes/month and12suchmonths/year ->18600additionalcommands/month,223200/year at incremental3/member.

At current lib/spend-cost-table.ts registry$2/million, this command component is$0.0372/month and$0.4464/year, conservatively assigned in full to each of Creator monthly,Creator annual,Pro monthly,Pro annual,Business monthly,Business annual; no averaging over an unknown customer count. Higher actual paid rate, wire/CPU/CI, taxes, dearest receiving costs,100%rights/add-ons,100%LLCfixedcosts,exposures and reserves still require complete funding and unknown fails. Extra passes are not authorized by the200/pass bound and must consume existing funded ceilings/reserves. No full-margin certification, cap increase or opening permission follows.

## PR1195 incorporation and production evidence

Merge da5cd6664eb913cda66aeed98da53246f9679c58 on29/10/2026 02:26:50Fortaleza(05:26:50UTC). Tested head7cb113faf98276bc1de6b0ebe0d901a0d3b3d9b0,tree c939fba87b789d18fec1becb75fae5095eef453b; actual merge parents exactly da5's baseb081d84669f991af2deca9774eb8427f5aeeaad2 and testedhead, actualtree=predicted=tested.39/39checks+Vercel passed on the testedhead; this does not invent a separate39main result.

Three worker races passed in job123272102518 at05:01:11UTC; actualRedis123272102556 at04:58:16UTC confirmed5known/3missing cleanup commands. Eight scopesfulltrue,10+7each/productextra6. Signupjobs123271964903/4866/4905 each30cases150audits0failures. Mobile123272102565 ninecold samples,LCPmax844ms,CLS0,interaction96ms,0writes; labproxy only. NVDA123271928188 andVoiceOver123271928276 checked2entryheadings each,0writes/foreign,notcomplete tasks orhumanAAA.

Production dpl_Fq7TTNUQrWGWxg6aTJDc57rTtdHe wasREADY at exactsha da5cd6664eb913cda66aeed98da53246f9679c58;sevenaliases and publicHTMLdata-dpl-id on marktmorgen.com /,/pricing,/platform/path,/help,/proof/comparisons matched. Counter254 remains;interactiveproof pending. Earlier failed1195heads and full corrective reruns remain in queue/continuity; no isolated rerun or weakenedassert.

MR/TX/SD1/AV1,LQ17/LQ18,FIM1,creatorcontent,buyerlangs,persistedIDs,Hazelsong,prices/limits/commission/permissions remain. OPENING_REQUESTED=false andPLANS_ON_SALE=false;fundedcoverage and reviews/policies unchanged.
