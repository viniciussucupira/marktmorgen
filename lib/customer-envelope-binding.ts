import { reviewedResourceEnvelope, type ReviewedResourceEnvelope } from './reviewed-resource-envelope';
import type { CustomerWorstCase } from './net-margin-rules';

export type CustomerEnvelopeBinding = {
  customerKey: string;
  termsSnapshot: string;
  validFrom: number;
  expiresAt: number;
  review: CustomerWorstCase | null;
};

/** Accessors and inherited values are not stored binding data and are never executed. */
function ownData(record: object, key: string): unknown {
  try {
    const field = Object.getOwnPropertyDescriptor(record, key);
    return field && Object.prototype.hasOwnProperty.call(field, 'value') ? field.value : undefined;
  } catch { return undefined; }
}

/** Planning only: callers must obtain the binding from trusted server storage,
 * derive customer identity from authentication, and reserve spending atomically.
 * Never accept a review, identity, snapshot, or clock supplied by the browser.
 */
export function boundCustomerEnvelope(
  binding: CustomerEnvelopeBinding | null,
  authenticatedCustomerKey: string,
  currentTermsSnapshot: string,
  now: number,
  unitCeilingMicroUsd: number,
  requestedUnits: number,
): ReviewedResourceEnvelope {
  const deny = (reason: string): ReviewedResourceEnvelope => ({ approved: false, reason, remainingMicroUsd: null, affordableUnits: null });
  if (!binding || typeof binding !== 'object' || Array.isArray(binding)) return deny('missing_binding');
  // Read once into a plain snapshot so every check uses identical data.
  const customerKey = ownData(binding, 'customerKey');
  const termsSnapshot = ownData(binding, 'termsSnapshot');
  const validFrom = ownData(binding, 'validFrom');
  const expiresAt = ownData(binding, 'expiresAt');
  const review = ownData(binding, 'review');
  if (typeof authenticatedCustomerKey !== 'string' || !authenticatedCustomerKey.trim() ||
      typeof customerKey !== 'string' || customerKey !== authenticatedCustomerKey) return deny('customer_mismatch');
  if (typeof currentTermsSnapshot !== 'string' || !currentTermsSnapshot.trim() ||
      typeof termsSnapshot !== 'string' || termsSnapshot !== currentTermsSnapshot) return deny('terms_mismatch');
  if (![now, validFrom, expiresAt].every(n => typeof n === 'number' && Number.isSafeInteger(n) && n >= 0) ||
      (expiresAt as number) <= (validFrom as number)) return deny('invalid_validity');
  if (now < (validFrom as number)) return deny('review_not_yet_valid');
  if (now >= (expiresAt as number)) return deny('review_expired');
  return reviewedResourceEnvelope((review ?? null) as CustomerWorstCase | null, unitCeilingMicroUsd, requestedUnits);
}
