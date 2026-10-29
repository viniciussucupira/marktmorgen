# Bounded acknowledgement of the pause due batch

The actual runBreaks reader previously serialized the complete acknowledgement with canonicalFinancialSnapshot before checking its cardinality and member byte limits. A malformed over-limit array could therefore consume traversal and string encoding work outside the accepted 200-member envelope, even though it ultimately failed closed.

The worker now checks the outer own length and entry, then the inner own length, before visiting members. It reads at most200 own member descriptors, requires strings, checks UTF-16 length before UTF-8 encoding, retains the1280-byte limit and rejects duplicates, sparse arrays, symbols and accessors without invoking getters. It copies accepted refs into a fresh local array. Exceptions hold the batch. The Lua selector and its200/1280 limits are unchanged. No malformed acknowledgement authorizes owner reads, provider work, email or cleanup.

Synthetic tests use the actual worker and a201-member instrumented acknowledgement: it must reject without reading any member descriptor. Additional oversized ASCII/UTF8, duplicate, sparse and outer-shape cases have no follow-on IO. Existing valid worker and200-member/1280-byte Lua tests remain intact. Full current-head CI is required; no isolated job rerun or weakened assertions.

## Costs and gates

No additional Redis/provider command, key, field, TTL, job or email is introduced. Accepted reply traversal is at most200members, each string encoded only after its character length is at most1280; accepted member bytes total at most256000. This bounds parser work, not the upstream transport/JSON decoder, Redis memory, invocation frequency or whole-company/lifetime exposure. Unknown full CPU/transport/storage/CI/tax and fixed costs continue to reject in all six monthly/annual contracts. No zero-cost or certified-margin claim. Existing cash/coverage/reviews remain unchanged and sales stay closed.

## PR1212 incorporation and production evidence carried with this code

PR1212 merged29/10/2026 at15:57:09Fortaleza/18:57:09UTC as2cd4fbda3b5880658db7bc88ab20c49089b32060. Tested head26857b7b6af9ae9e2cf797772d94d2de9a2aa9f0 and tested/predicted/actual tree d330d1d0efaa3f6a19eb336f34aae16b6396968a matched. All39checks succeeded plus Vercel on that head; no separate39main result invented. Mobile candidate123652244264 had9cold synthetic samples,LCPmax1088ms,CLS0,interactionproxy152ms,0writes; not fieldINP. NVDA123651336247 andVoiceOver123651335949 each checked2entryheadings,0writes/foreign,not complete product accessibility.

Production dpl_AKUhYUYi7yBFqWrhiDuCbAgyFsGB wasREADY at the exact mergeSHA, with7aliases including marktmorgen.com/www and actualHTML data-dpl-id matching on /,/pricing,/platform/path,/help,/proof/comparisons. Counter254held: ownerChromeinteractive blocker unchanged, no retry or new delivery claim. Initial runner-shutdown failure and fresh complete-suite history retained. Later PR1213 and1214/1215 registered queue scope only, not feature implementations.

MR/TX/FX275/SD1/AV1/LQ17/LQ18/FIM1, prices, visible rights, commission, opt-in, persisted identifiers, creator content, buyer languages and Hazelsong remain intact. PLANS_ON_SALE=false;OPENING_REQUESTED=false. Funded notice obligations still require source cash reservation, durable generation, provider acknowledgement and global/lifetime envelope; parser safety does not authorize sending or charging.
