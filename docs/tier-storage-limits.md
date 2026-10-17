# Provisional tier storage limits

Store admits up to 8 GiB of stored files and lesson videos, Studio 64 GiB and Scale 128 GiB. The existing UI's GB labels retain their binary-byte convention; finance must use exact bytes and the provider's decimal billing units. A free trial is capped by both its selected paid tier and the existing 50 GiB trial maximum. Setup and ended-store retention thresholds remain unchanged at 5 GiB.

These are provisional engineering allocations, not certification of the 60% all-tax floor. They replace the shared 200 GiB new-upload ceiling. The R2, Blob and stream upload routes and the studio pass the actual tier to the same pure function. Direct Blob and Bunny upload grants remain closed under the separate upload policy.

## Derivation and limitations

For this first reduction, storage alone is allocated at most 1% of annual subscription revenue recognized monthly, using R2 Standard public pricing with no free-tier credit. Choose the largest power-of-two GiB allowance whose rounded decimal GB-month charge fits that allocation: Store 8 GiB costs at most $0.135, Studio 64 GiB $1.035, and Scale 128 GiB $2.070 in storage-only charges for a full month. This 1% allocation is an explicit engineering choice, not a statutory rate or a complete cost budget.

The provider charges $0.015 per decimal GB-month and rounds usage up to billing units. Requests, incomplete uploads, daily peak measurement, supplier invoice rounding, other providers, replicas, taxes, transfer, CPU, support, acquisition and retention must be reviewed separately. Existing stream-library comments about two regions and a volume network are not a current authenticated contract verification.

Source: https://developers.cloudflare.com/r2/pricing/ (checked 2026-10-16). All six locked subscription prices and commissions are unchanged.

## Existing content

The new limit is an admission threshold. A store already above its new tier limit cannot add files, but the guard does not delete existing content or change the cancellation/closing schedule. Existing retained bytes and cleanup liabilities still have to be funded and included in the all-cost review. No current approved upload policy or commercial margin review is introduced here.
