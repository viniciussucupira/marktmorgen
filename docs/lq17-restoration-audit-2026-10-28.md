# LQ17/LQ18 restoration audit — 28 October2026

Owner decisions:28 October2026,23:37 and23:39 Fortaleza. Reference:9c224622c0f93fc864026f48114267e6b6d79998. This report records a restoration, not new financial approval or a functional delivery.

## Automatic queue comparison

The entire operative prefix of docs/codex-queue.md equals the reference file byte for byte (2184147 JavaScript characters, including original CR/LF). An automatic heading scan covered each number1–508:508 distinct items,509 matching headings (the same pre-existing repeated heading remains); every item body, state, scope, ordering and position matches. Missing numbers: none. Differences: **none**. No exception to the reference was needed. The historical appendix is outside the operative prefix and does not create operative item headings.

199 inserted cleanup blocks and the later appended records were retained in the historical appendix with their original line references. Every cleanup block has the exact annotation “Desfeito por decisão do dono em 28/10/2026, 23h37 (LQ17)”; the single LQ3 table is historical, with the annotation on its rows. Original pre-cleanup lines changed only by newline formatting were restored too. No original item was reconstructed or renumbered.

## Code and documents

lib/llc-fixed-costs.ts and tests/llc-fixed-costs.test.ts restored exactly to the reference. ITIN/acceptance-agent and US-resident representative categories again have unknown, unreviewed ceilings; restoration is not a legal obligation or a service purchase. docs/margin-alignment-2026-10-18.md restored to the reference generated output. A new synthetic test invokes the real margin generator with --stdout and compares every output byte with the committed document; the complete new-head suite must pass before merge. The existing generator-equality test remains unchanged.

docs/llc-fixed-costs-2026-10-22.md restores the entire reference as its operative prefix. The cleanup banner is preserved only at the end, explicitly annotated as undone. No cleanup change remains operative in any of the four files. Main changes to those files since the reference were checked against PR1184's actual file diff; no independent implementation was overwritten. New AV/Meta/Store source changes and ClaudePR1173 CI are retained because the tree starts from main060273784e7cb1591df85829497e948bcd5cf906.

## Open PRs and old branches

Zero open PRs after1189. Inspected all743 codex/* refs:742 commit records read successfully, plus the just-created1189 head already read; six heads after the cleanup's earliest relevant time had their queues read. All six contain historical cleanup and none already contained LQ17/LQ18:

- refs/heads/codex/av-meta-spend-read-cohort — 7408d0097a07308dabba532ec782059f0dda0ef4
- refs/heads/codex/av-restart-store-ack — c5cf8b03e19f9659959373584f62f8044b2ac50f
- refs/heads/codex/av-restart-store-source — f4b2e97f461a6b968ccf266473f7f19c5140ee19
- refs/heads/codex/lq-queue-cleanup-2026-10-28 — 9b753969b9061d17835f7db2bfcdf10ccd8a031b
- refs/heads/codex/lq12-reopen-live-chat-member-map — 07d4da9d0034f61709a0a2e7a1d1591bbb420ef7
- refs/heads/codex/lq13-lq15-owner-queue-corrections — d88d65a52280a8eea6f1d1bea46c6bd184e66629

The remaining737 branch heads predate28 October20:18Fortaleza; they cannot contain the later cleanup commits. Forty distinct recent PR queues were also read without an equivalent LQ17/LQ18 request. Any future merge from the six old branches must resolve the queue against LQ17; never restore their cleanup decisions. No branch was reset, deleted or rewritten. The restoration's own new branch is additional to this inventory.

## Later real work retained as evidence

PR1185/head7408d0097a07308dabba532ec782059f0dda0ef4/merge958709aa875e687c16d424b443f3f5885d344cad: Meta spend-read funded cohort. PR1186/headc5cf8b03e19f9659959373584f62f8044b2ac50f/merge7ff9c5e7616a2088326cccff93687e7ab958731d: Store acknowledgment before cleanup. PR1187/headf4b2e97f461a6b968ccf266473f7f19c5140ee19/mergeb33fdc70105f18225bd72503b134963fc395e68d: concurrent Store source comparison. Their code, tests and limited proofs are retained. Queue progress/proofs remain historical facts, not item-state changes. PR1188 and1189 decisions become historical by LQ17; their provenance remains. SD1/TX/SV/AX274/English/not-Brazil/AV1 decisions outside cleanup remain binding.

## Limits and costs

MR: each customer at100% rights/add-ons in the worst month/monthly/yearly must not lose money after all costs/taxes; company non-loss from calculated minimum base;60% actual monthly company net target. Unknown rejects, never zero; dearest receiving cost/reserves/exposure/funding and100% LLC allocation preserved. No price, limit, commission, opening/sale flag, provider/account/payment/message or creator/Hazelsong content change. Synthetic CI only; unmeasured CI cost is not assumed zero. No functional counter increment. Full new-head CI and production/version checks remain pending at this preparation stage; no interactive production proof claimed.
