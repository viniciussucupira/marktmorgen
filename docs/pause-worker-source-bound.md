# Funded pause worker: bound the current owner observation

The due worker now uses the existing storeForRestartSource reader for funded pause records only. This replaces the generic unbounded owner GET with one GETRANGE from byte0 through MAX_STORE_BYTES (1,000,000), rejecting a 1,000,001-byte response, malformed JSON, unknown/accessor acknowledgement, a foreign owner or missing raw financial primitives before restartPlan admission. The helper already checks the exact raw fields before legacy normalization. The legacy worker path is unchanged.

A readable source is only an observation: it does not prove paid funding, authorize another POST, release cash, enable notices, or complete pause/restart coverage. All existing policy/review/coverage gates remain closed. Unknown source and transport failures retain the exact pause, annual evidence and due member without cleanup.

The actual runBreaks funded fixture verifies one bounded source read and zero unbounded owner GET, plus empty/null/malformed/ASCII-overlimit/UTF8-overlimit/accessor/foreign/missing-field/transport cases. These cases must perform no follow-on provider call, ledger work, mutation or email. The positive helper test and actual due branch remain covered; complete new-head CI is required.

## Cost boundary

The worker replaces one owner command with one owner command; it does not add a provider, key family, financial write or notice. This is not a zero-cost claim. Each funded owner response is bounded by1,000,001raw bytes, with only<=1,000,000accepted; the200-member due batch ceiling fromPR1208 still applies. Request/response overhead, CPU, total batch frequency, failures, global/monthly/annual usage and taxes remain part of the full reviewed plan envelope. No monthly resource reservation substitutes for a per-original-source notice obligation. All six monthly/annual contracts, highest receiving rates, 100%Marktmorgen fixed costs and unknown-cost refusal remain binding. No paid operation is enabled by this change.

## Incorporated antecedent: PR1208

PR1208 incorporated29/10/2026 14:48:14Fortaleza (17:48:14UTC), merge63fb0308a49e46e76d8d31c3553ad02e5650925a, testedhead62fa89236ebd1cebf04e56c5f0e8c4b0e511ac49, treee6de942b138479701fc234511f48dd191639d1f4, parents332a38db16d7a2907a5c6fed08e5169403853c01 and62fa89236ebd1cebf04e56c5f0e8c4b0e511ac49. All39checks and Vercel succeeded. Verify123611061636:234/234bundles, Everything passing17:24:54.6748654UTC. Real Redis123611061594 proved bounded due observation with EVAL1+TYPE1+ZRANGEBYSCORE1. Eight scopes required full coverage. Signup3engines30cases/150audits/0failed each. Mobile9cold samples,maxLCP856ms,CLS0,interaction96ms,0writes (synthetic lab proxy,notfieldINP). NVDA123610931770/VoiceOver123610931649 proved2entryheadings each,0writes/foreign,notwhole-product assistive tasks.

Cold-LCP and public geometry/wording failures were corrected in real CSS across successive heads; no isolated rerun, warmed/discarded sample, relaxed assertion or higher limit. Final native offscreen containment is limited to the long product strip; editorial sections, pricing, reasons,FAQ and creator proof disclosures render immediately. Existing tests retained.

Productiondpl_HSwdRbxvJZxbJn1WUNysQtGyXmnu READYexactmergeSHA,7aliasesincludingmarktmorgen.com. ActualHTML /,/pricing,/platform/path,/help,/proof/comparisons allreturnedtheexactdata-dpl-id. Counter254held: the ownerChromeinteractiveblocker remains, HTTP/CIisnotinteractiveproof. No255claimed.

Queue records and full provenance through533DP1, allTB375/FN525/FN526/CK509complements,HE527,FT528–530,VP531andfourcomplements,AF532,DP533strictlypostopening are incorporated as queue-only,not feature implementations. Only requested241CF4positionafter531VP1 and earlier206SH3after519PF7overrideFIM1; otherstates/positions/scopes/proofs preserved. No pricing,limits,PLANS_ON_SALE,OPENING_REQUESTED,permissions,opt-in,fiscal gates,art9a,commercialreview,creatorcontent,buyer languages or persistedIDs changed.
