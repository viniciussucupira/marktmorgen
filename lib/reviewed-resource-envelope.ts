import { remainingResourceCostCents } from './cost-envelope';
import { assessCustomerWorstCase, CUSTOMER_COST_CATEGORIES, MINIMUM_NET_PROFIT_CENTS, PLANNING_PROFIT_TAX_FLOOR_BPS, type CustomerWorstCase } from './net-margin-rules';

export type ReviewedResourceEnvelope = { approved: boolean; reason: string; remainingMicroUsd: number | null; affordableUnits: number | null };
const denied = (reason: string): ReviewedResourceEnvelope => ({ approved: false, reason, remainingMicroUsd: null, affordableUnits: null });

/** Only explicit own data is reviewed data. Accessors and inherited values are
 * neither executed nor accepted, matching lib/net-margin-rules.ts and lib/cost-envelope.ts. */
function ownData(record: unknown, key: string): unknown {
  try {
    if (!record || typeof record !== 'object' || Array.isArray(record)) return undefined;
    const field = Object.getOwnPropertyDescriptor(record, key);
    return field && Object.prototype.hasOwnProperty.call(field, 'value') ? field.value : undefined;
  } catch { return undefined; }
}

/** Read the review once into a plain snapshot so validation and arithmetic use identical data. */
function snapshot(review: unknown): CustomerWorstCase | null {
  if (!review || typeof review !== 'object' || Array.isArray(review)) return null;
  const costs = ownData(review, 'costCeilings');
  return {
    collectedRevenueCents: ownData(review, 'collectedRevenueCents') as number | null,
    refundableRevenueCents: ownData(review, 'refundableRevenueCents') as number | null,
    taxesCeilingCents: ownData(review, 'taxesCeilingCents') as number | null,
    costCeilings: Object.fromEntries(CUSTOMER_COST_CATEGORIES.map(key => [key, ownData(costs, key)])) as CustomerWorstCase['costCeilings'],
    allCostsBounded: ownData(review, 'allCostsBounded') === true,
    allTaxesReviewed: ownData(review, 'allTaxesReviewed') === true,
    revenueCollected: ownData(review, 'revenueCollected') === true,
  };
}

/** A conservative planning bound, NOT a reservation or proof of supplier funding.
 * Cost ceilings must include all contractual consumption and pending reservations.
 * Taxes remain reserved in full; do not replace them with the planning tax floor.
 * Use the same period for revenue, refunds, costs, and requested units.
 * The result never exceeds lib/cost-envelope.ts's remaining resource cost for the
 * same revenue net of refunds, costs and the planning tax floor.
 */
export function reviewedResourceEnvelope(review: CustomerWorstCase | null, unitCeilingMicroUsd: number, requestedUnits: number): ReviewedResourceEnvelope {
  if (!Number.isSafeInteger(unitCeilingMicroUsd) || unitCeilingMicroUsd <= 0 || !Number.isSafeInteger(requestedUnits) || requestedUnits <= 0) return denied('invalid_request');
  const value = snapshot(review);
  const assessment = assessCustomerWorstCase(value);
  if (!assessment.approved || !value) return denied(assessment.reason);
  const scale = BigInt(10000);
  const gross = BigInt(value.collectedRevenueCents!);
  const refunds = BigInt(value.refundableRevenueCents!);
  const minimumNet = BigInt(MINIMUM_NET_PROFIT_CENTS);
  const costList = CUSTOMER_COST_CATEGORIES.map(key => value.costCeilings[key]!);
  const costs = costList.reduce((sum, cost) => sum + BigInt(cost), BigInt(0));
  let remaining = gross - minimumNet - refunds - BigInt(value.taxesCeilingCents!) - costs;
  if (remaining < BigInt(0)) return denied('below_floor');
  // Defense in depth: never exceed the shared cost-envelope bound for the same inputs.
  const shared = remainingResourceCostCents(Number(gross - refunds), PLANNING_PROFIT_TAX_FLOOR_BPS, costList);
  if (shared === null) return denied('below_floor');
  if (BigInt(shared) < remaining) remaining = BigInt(shared);
  const remainingMicro = remaining * scale;
  const units = remainingMicro / BigInt(unitCeilingMicroUsd);
  // Fail closed when callers cannot represent the ledger amounts exactly.
  if (remainingMicro > BigInt(Number.MAX_SAFE_INTEGER) || units > BigInt(Number.MAX_SAFE_INTEGER)) return denied('unsafe_ledger_amount');
  const fits = BigInt(requestedUnits) <= units;
  return { approved: fits, reason: fits ? 'within_reviewed_envelope' : 'insufficient_headroom', remainingMicroUsd: Number(remainingMicro), affordableUnits: Number(units) };
}
