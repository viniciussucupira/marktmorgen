# Provisional tier storage limits

Store admits up to 5 GiB of stored files and lesson videos, Studio 40 GiB and Scale 80 GiB (8, 64 and 128 GiB until 18 October 2026, lowered with no price changed when what a store keeps after its plan ends was priced into each payment's worst case: see the update below). The existing UI's GB labels retain their binary-byte convention; finance must use exact bytes and the provider's decimal billing units. A free trial is capped by both its selected paid tier and the existing 50 GiB trial maximum. Setup and ended-store retention thresholds remain unchanged at 5 GiB.

These are provisional engineering allocations, not certification of the 60% all-tax floor. They replace the shared 200 GiB new-upload ceiling. The R2, Blob and stream upload routes and the studio pass the actual tier to the same pure function. Direct Blob and Bunny upload grants remain closed under the separate upload policy.

## Derivation and limitations

For this first reduction, storage alone is allocated at most 1% of annual subscription revenue recognized monthly, using R2 Standard public pricing with no free-tier credit. Choose the largest power-of-two GiB allowance whose rounded decimal GB-month charge fits that allocation: Store 8 GiB costs at most $0.135, Studio 64 GiB $1.035, and Scale 128 GiB $2.070 in storage-only charges for a full month. This 1% allocation is an explicit engineering choice, not a statutory rate or a complete cost budget.

The provider charges $0.015 per decimal GB-month and rounds usage up to billing units. Requests, incomplete uploads, daily peak measurement, supplier invoice rounding, other providers, replicas, taxes, transfer, CPU, support, acquisition and retention must be reviewed separately. Existing stream-library comments about two regions and a volume network are not a current authenticated contract verification.

Source: https://developers.cloudflare.com/r2/pricing/ (checked 2026-10-16). All six locked subscription prices and commissions are unchanged.

## Existing content

The new limit is an admission threshold. A store already above its new tier limit cannot add files, but the guard does not delete existing content or change the cancellation/closing schedule. Existing retained bytes and cleanup liabilities still have to be funded and included in the all-cost review. No current approved upload policy or commercial margin review is introduced here.

## Update, 18 October 2026

Since this day a plan that ends keeps none of its files past its closing day (`lib/plan-closing-rules.ts`, `KEEP_NOTHING_FROM`, `keptRoomFor`): the same three notices, the week after the last and the check with Stripe, applied to everything the store keeps, students' hand-ins and community pictures included. A plan that ended before keeps the old rule (5 GiB with no date). `tests/plan-cost-registry.ts` prices, once per payment, the plan's storage, its students' room (`TASK_ROOM_BYTES`: 250 MiB, 1 GiB, 2 GiB) and its community's pictures (`COMMUNITY_PICTURES`: 200, 1,000, 3,000 at 1 MB each) kept to that day (`PER_PAYMENT_LINES`, `retained-files`), at the registry's dearest rate ($0.023 a GB-month), and the students' room and the pictures every month (`task-files`, `community-pictures`). To keep every plan at the owner's 60% with that counted, the storage allowances were lowered to 5, 40 and 80 GiB; `tests/spend-floor.test.ts` holds the result.
