/**
 * DE1: build a review packet only from retained records of this exact purchase.
 * No network, persistence, AI, submission or inferred historical acceptance.
 * Callers must authenticate the creator and resolve the purchase on their account.
 */
export const DISPUTE_EVIDENCE_KINDS = [
  "receipt", "confirmation", "download", "course", "call",
  "community", "membership", "accepted_terms", "accepted_refund_policy", "message",
] as const;
export type DisputeEvidenceKind = typeof DISPUTE_EVIDENCE_KINDS[number];
export type PurchaseEvidenceScope = {
  account: string; store: string; purchase: string; buyer: string;
};
export type RetainedPurchaseEvidence = PurchaseEvidenceScope & {
  kind: DisputeEvidenceKind;
  /** Identifier of the original record, never a public access token or URL. */
  source: string;
  recordedAt: number;
  retainedUntil: number;
  text: string;
};
export type EvidencePacket = {
  records: { kind: DisputeEvidenceKind; source: string; recordedAt: number; text: string }[];
  missing: DisputeEvidenceKind[];
  /** A review packet is never authorization to send evidence. */
  submitted: false;
};
const MAX_RECORDS = 64;
const MAX_RECORD_CHARACTERS = 10_000;
const MAX_PACKET_CHARACTERS = 50_000;
function validScope(scope: PurchaseEvidenceScope): boolean {
  return [scope.account, scope.store, scope.purchase, scope.buyer]
    .every(value => typeof value === "string" && value.length > 0 && value.length <= 256 && value === value.trim());
}
function samePurchase(a: PurchaseEvidenceScope, b: PurchaseEvidenceScope): boolean {
  return a.account === b.account && a.store === b.store && a.purchase === b.purchase && a.buyer === b.buyer;
}
/**
 * Reject a mixed or malformed batch in full, without returning any record text.
 * Expired records are omitted: this helper does not extend retention.
 * Limits reject rather than truncate original evidence.
 */
export function buildDisputeEvidencePacket(
  scope: PurchaseEvidenceScope,
  records: readonly RetainedPurchaseEvidence[],
  now: number,
): EvidencePacket {
  if (!validScope(scope) || !Number.isSafeInteger(now) || now < 0 || records.length > MAX_RECORDS) {
    throw new Error("Evidence packet unavailable");
  }
  const kept: EvidencePacket["records"] = [];
  const seen = new Set<string>();
  let characters = 0;
  for (const record of records) {
    if (!validScope(record) || !samePurchase(scope, record) ||
        !DISPUTE_EVIDENCE_KINDS.includes(record.kind) ||
        typeof record.source !== "string" || !/^[A-Za-z0-9_.:-]{1,128}$/.test(record.source) ||
        !Number.isSafeInteger(record.recordedAt) || record.recordedAt < 0 || record.recordedAt > now ||
        !Number.isSafeInteger(record.retainedUntil) || record.retainedUntil <= record.recordedAt ||
        typeof record.text !== "string" || !record.text.trim() ||
        record.text.length > MAX_RECORD_CHARACTERS) {
      throw new Error("Evidence packet unavailable");
    }
    if (record.retainedUntil <= now) continue;
    const key = record.kind + ":" + record.source;
    if (seen.has(key)) throw new Error("Evidence packet unavailable");
    seen.add(key);
    characters += record.text.length;
    if (characters > MAX_PACKET_CHARACTERS) throw new Error("Evidence packet unavailable");
    kept.push({ kind: record.kind, source: record.source, recordedAt: record.recordedAt, text: record.text });
  }
  kept.sort((a, b) => a.recordedAt - b.recordedAt || a.source.localeCompare(b.source));
  return {
    records: kept,
    missing: DISPUTE_EVIDENCE_KINDS.filter(kind => !kept.some(record => record.kind === kind)),
    submitted: false,
  };
}
