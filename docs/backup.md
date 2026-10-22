# Cloud backup — BK273
Status: incomplete, production disabled. This is an offline codec and synthetic restore prerequisite, not a working daily backup. No cron, bucket, credential, provider call or privacy promise is enabled.

## Inventory (22 October 2026)
| Asset | Existing source | Independent copy proof / missing work |
|---|---|---|
| Redis stores, products, orders, contacts, community, settings, queues | lib/redis.ts; tests/store-data-registry.ts | No verified independent snapshot. Preserve types and absolute expiry, account for concurrent writes, bounded SCAN/DUMP/restore support and shared keys. Count alone cannot prove snapshot consistency. |
| Sold files and stamped PDFs | lib/vault.ts: R2, Blob fallback; lib/blob.ts | No verified independent copy. Daily manifests and source durability must be evaluated before duplication. No real file listing performed. |
| Creator videos, hand-ins and community pictures | Existing storage/video adapters and docs/tier-storage-limits.md | Included in inventory; sold-file cap alone is not the complete byte envelope. Provider contracts/copy proof unknown. |
| SES configuration | infra/amazon-ses.yml | Git-tracked source exists; separate repository bundle missing. Live AWS state not verified. |
| Vercel variable names | Source references only | Names-only authenticated inventory not yet completed. Never export values, secrets or keys to repository/logs/plaintext backup. |
| Code | viniciussucupira/marktmorgen, viniciussucupira/hazelsong (formerly kudobox, repository1367384911), viniciussucupira/solrenning; all main | GitHub is source, not independent account-loss backup. No git bundle created or tested. Metadata size is not a funded maximum. |

## Cost admission
Reuse lib/receiving-costs.ts and docs/tax-uncertainty.md. MOST_TAX_READING currently imposes78.18% profit tax plus5% revenue tax and inside VAT. Even before receiving/operation costs, the60% net floor cannot pass. Credentials alone must never enable this job. No price, visible limit or tax assumption changed.

Official prices checked22October2026: [R2](https://developers.cloudflare.com/r2/pricing/): Standard$0.015/decimalGB-month, ClassA$4.50/million, ClassB$0.36/million, rounded up to billing units; no free-tier credit. [Redis](https://upstash.com/pricing/redis): public PAYG$0.20/100k commands; actual contract and all operation/bandwidth accounting unverified.
A deliberately conservative43 full sold-file copies (30daily+13weekly), without compression/dedup/free quota, would cost storage alone$3.465/$27.705/$55.410 monthly for5/40/80GiB caps. This excludes student/community/video/Redis/repository/compute/operations/taxes and is not an approved design or complete budget. File checks need not duplicate unchanged content daily.
Monthly and annual per-plan complete cost matrix, company fixed allocation, highest paid provider rates, funded reserves and automatic pre-operation ceilings remain required. Unknown fails.

## Offline codec and synthetic restore
lib/backup-codec.ts compresses bounded JSON then authenticates it with AES256GCM, fresh96-bit nonce and versioned associated data. Encryption key is supplied in memory; no environment or provider is read. Maximum plaintext4MiB and10000rows are safety limits for this codec, not reduced customer entitlements or a full-export design.
Rows contain a namespaced key, opaque base64 dump and absolute expiry. Decrypt/authenticate before bounded decompression; validate duplicates, schema and expiry; expired rows are excluded at restore time. The codec does not implement Redis DUMP or RESTORE, a consistent export, uploading, retention, git bundles or a production restore.
tests/backup-codec.test.ts restores synthetic rows into an in-memory map and checks byte identity, expiry, corruption, wrong keys and bounds. CI result is pending; no local subprocess tests. This is not a tested real Redis restore and does not count as a production backup.

## Owner prerequisites — do not perform them yet
1. Resolve the failed cost/tax admission and specify funded monthly/annual ceilings before paid operations.
2. Owner creates a separate private R2 backup bucket, distinct from sold files; account-loss and encryption-key recovery procedures must be reviewed.
3. Owner creates bucket-scoped credentials. Write-only credentials cannot perform required read-back verification or retention deletion; scope separate writer, verifier and retention identities according to the final design.
4. Owner stores only secret values in Vercel environment, never Git/logs. Proposed names (not live configuration): BACKUP_R2_ACCOUNT_ID, BACKUP_R2_BUCKET, BACKUP_R2_ACCESS_KEY_ID, BACKUP_R2_SECRET_ACCESS_KEY, BACKUP_ENCRYPTION_KEY. Existing R2 sold-file credentials must not be reused.
5. Review encryption-key version/rotation and independent secure recovery; losing the only key makes backups unrestorable. No secret may appear in plaintext backup.
6. Only after implementation, synthetic full restore and cost admission: configure daily Vercel execution (no GitHub Actions backup minutes), bounded retries next day, read-back verification before retention, and visible daily report after two failures.
7. Activate accurate privacy retention text at the same time as the feature. No active policy promise is added by this prerequisite.

## Restoration runbook — prerequisite, not operational
In an isolated simulated database, supply synthetic key, authenticate/decrypt with openBackup, validate version and all rows, exclude expired rows using restoreRows, and compare exact dump bytes and absolute expiries. Never apply these rows to production by default. Real recovery additionally needs provider-supported RESTORE/type/TTL checks, clean isolated destination, full manifest/checksum verification, permissions and application validation before switching traffic. These missing steps block production readiness.
