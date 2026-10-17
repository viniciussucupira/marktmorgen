import { MINIMUM_NET_MARGIN_BPS, PLANNING_PROFIT_TAX_FLOOR_BPS } from './net-margin-rules';

/** Exact arithmetic only. A ceiling does not verify vendor costs or tax treatment. */
export function maximumPretaxCostCents(revenueCents: number, combinedProfitTaxBps: number): number | null {
  if (!Number.isSafeInteger(revenueCents) || revenueCents <= 0 ||
      !Number.isSafeInteger(combinedProfitTaxBps) || combinedProfitTaxBps < 0 || combinedProfitTaxBps >= 10_000) return null;
  const tax = Math.max(combinedProfitTaxBps, PLANNING_PROFIT_TAX_FLOOR_BPS);
  const p = BigInt(revenueCents), unit = BigInt(10_000);
  const minimumNet = (p * BigInt(MINIMUM_NET_MARGIN_BPS) + unit - BigInt(1)) / unit;
  const retained = BigInt(10_000 - tax);
  const requiredPretaxProfit = (minimumNet * unit + retained - BigInt(1)) / retained;
  const available = p - requiredPretaxProfit;
  return available < BigInt(0) ? null : Number(available);
}

/** All non-resource costs must be explicitly supplied, even when zero.
 * Fixed expenses belong either here as an allocation or in the company base,
 * never both. This result must not be used as proof of prepaid supplier funds.
 */
export function remainingResourceCostCents(
  revenueCents: number,
  combinedProfitTaxBps: number,
  otherCostCeilings: readonly (number | null)[],
): number | null {
  const maximum = maximumPretaxCostCents(revenueCents, combinedProfitTaxBps);
  if (maximum === null || !otherCostCeilings.length || otherCostCeilings.some(n => n === null || !Number.isSafeInteger(n) || n < 0)) return null;
  const remaining = BigInt(maximum) - otherCostCeilings.reduce<bigint>((sum, n) => sum + BigInt(n!), BigInt(0));
  return remaining < BigInt(0) ? null : Number(remaining);
}
