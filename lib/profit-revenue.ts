/** Read-only validation of declared platform receipts; evidence still needs reconciliation. */
export function confirmedProfitRevenue(raw: unknown, period: unknown, nowSeconds: number): number | null {
  if (!Number.isSafeInteger(nowSeconds) || nowSeconds < 0 || typeof period !== "string" || !period.trim()) return null;
  if (!raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const value=raw as Record<string,unknown>;
  const amounts=["subscriptionsCents","usageCents","platformCommissionsCents","refundsAndCreditsCents","refundableBalanceCents"];
  const allowed=new Set([...amounts,"currency","period","validUntil","evidence","collectedConfirmed"]);
  if(Object.keys(value).some(key=>!allowed.has(key)))return null;
  if(value.currency!=="USD" || value.period!==period || value.collectedConfirmed!==true || typeof value.evidence!=="string" || !value.evidence.trim() || typeof value.validUntil!=="number" || !Number.isSafeInteger(value.validUntil) || value.validUntil<=nowSeconds)return null;
  for(const key of amounts)if(!Object.hasOwn(value,key) || typeof value[key]!=="number" || !Number.isSafeInteger(value[key]) || (value[key] as number)<0)return null;
  const retained=BigInt(value.subscriptionsCents as number)+BigInt(value.usageCents as number)+BigInt(value.platformCommissionsCents as number)-BigInt(value.refundsAndCreditsCents as number)-BigInt(value.refundableBalanceCents as number);
  if(retained<BigInt(0) || retained>BigInt(Number.MAX_SAFE_INTEGER))return null;
  return Number(retained);
}
