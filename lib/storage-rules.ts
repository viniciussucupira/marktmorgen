/** Client-safe provisional storage ceilings, in exact bytes.
 * Lower exposure is not proof of the funded all-tax net-margin floor.
 * At public R2 Standard rates, rounded storage-only monthly costs are
 * $0.135 / $1.035 / $2.070 before requests, other providers and all other costs.
 * Source: https://developers.cloudflare.com/r2/pricing/ (checked 2026-10-16).
 */
import type { Tier } from '@/lib/plan';
import { SETUP_STORAGE_BYTES, TRIAL_STORAGE_BYTES, type Standing } from '@/lib/plan-standing';
const GiB=1024*1024*1024;
export const PAID_STORAGE_BYTES = Object.freeze({ creator:8*GiB, pro:64*GiB, scale:128*GiB }) satisfies Record<Tier,number>;
/** Conservative default when a caller has not supplied a paid tier. */
export const STORAGE_BRAKE_BYTES=PAID_STORAGE_BYTES.creator;
export function paidStorageBytes(tier: Tier='creator'):number {
 return PAID_STORAGE_BYTES[tier]??PAID_STORAGE_BYTES.creator;
}

/** A trial never authorizes more stored bytes than the chosen paid tier. */
export function storageBrakeFor(standing: Standing, tier: Tier='creator'):number {
 const paid=paidStorageBytes(tier);
 return standing==='paid'?paid:standing==='trial'?Math.min(TRIAL_STORAGE_BYTES,paid):SETUP_STORAGE_BYTES;
}
