import { MAX_FILE_BYTES } from "@/lib/product-file";
import { PIECE_BYTES, PIECES_PER_ASK } from "@/lib/vault-rules";
/** Public numerical ceilings, not proof of supplier pricing or tax treatment. */
export const UPLOAD_BUDGET_SCOPES = ['creator','pro','scale','trial','setup','ended'] as const;
export type UploadBudgetScope = typeof UPLOAD_BUDGET_SCOPES[number];
export type UploadCaps = { opens: number; authorizedBytes: number; controlRequests: number };
export type UploadBudgetPolicy = {
  reviewId: string;
  month: string;
  evidence: string;
  company: UploadCaps;
  perStore: Record<UploadBudgetScope,UploadCaps>;
  /** Maximum store allocations in this month, not a forecast of average usage. */
  fundedStores: Record<UploadBudgetScope,number>;
};
export const UPLOAD_BUDGET_RULES = {
  schema: 1,
  boundedBackend: 'r2-revocable-multipart-only',
  completionAndCancellation: 'reserved-liability-not-blocked',
  maxInteger: 1_000_000_000_000,
  ledgerPrefix: 'nl:upload-budget:v1:',
  scopeChanges: 'review-required-no-counter-reset',
  reservation: 'before-provider-authorization-no-refund',
  missingLedger: 'deny',
  expiry: 'none',
} as const;
/** No full monthly allocation has been reviewed or funded. Unknown is not zero cost. */
export const CURRENT_UPLOAD_BUDGET_POLICY: UploadBudgetPolicy|null = null;
const amount = (n: unknown): n is number => typeof n==='number' && Number.isSafeInteger(n) && n>=0 && n<=UPLOAD_BUDGET_RULES.maxInteger;
const caps = (value: unknown): value is UploadCaps => {
  if(!value || typeof value!=='object')return false;
  const row=value as UploadCaps;
  return amount(row.opens)&&amount(row.authorizedBytes)&&amount(row.controlRequests);
};
export function isUploadBudgetConfigured(policy: UploadBudgetPolicy|null = CURRENT_UPLOAD_BUDGET_POLICY, now = new Date()): policy is UploadBudgetPolicy {
  if(!policy || !Number.isFinite(now.getTime()) || policy.month!==now.toISOString().slice(0,7)
    || !/^[A-Za-z0-9_-]{1,128}$/.test(policy.reviewId) || typeof policy.evidence!=='string' || !policy.evidence.trim()
    || !caps(policy.company) || !policy.perStore || !policy.fundedStores)return false;
  if(!UPLOAD_BUDGET_SCOPES.every(scope=>caps(policy.perStore[scope]) && amount(policy.fundedStores[scope])))return false;
  for(const scope of UPLOAD_BUDGET_SCOPES){
    const row=policy.perStore[scope];
    if(row.opens===0){if(row.authorizedBytes!==0)return false;}
    else {
      if(row.authorizedBytes<row.opens || BigInt(row.authorizedBytes)>BigInt(row.opens)*BigInt(MAX_FILE_BYTES))return false;
      const signBatches=BigInt(row.opens)+(BigInt(row.authorizedBytes)-BigInt(row.opens))/BigInt(PIECE_BYTES*PIECES_PER_ASK);
      if(BigInt(row.controlRequests)<BigInt(row.opens)+signBatches)return false;
    }
  }
  // Every allocated store can use its full allowance simultaneously. Do not
  // approve a shared pool that is smaller than the sum of all promised units.
  for(const dimension of ['opens','authorizedBytes','controlRequests'] as const){
    const total=UPLOAD_BUDGET_SCOPES.reduce((sum,scope)=>sum+BigInt(policy.perStore[scope][dimension])*BigInt(policy.fundedStores[scope]),BigInt(0));
    if(total>BigInt(policy.company[dimension]))return false;
  }
  return true;
}
/** Canonical binding prevents silently reusing a ledger after a limit changes. */
export function uploadBudgetSnapshot(policy: UploadBudgetPolicy): string {
  const fields=(row: UploadCaps)=>[row.opens,row.authorizedBytes,row.controlRequests];
  return JSON.stringify([UPLOAD_BUDGET_RULES.schema,policy.reviewId,policy.month,policy.evidence,fields(policy.company),
    UPLOAD_BUDGET_SCOPES.map(scope=>[scope,fields(policy.perStore[scope]),policy.fundedStores[scope]])]);
}

/** Customer-facing wording uses the same current ceilings as admission. */
export function uploadAllowanceWords(scope: UploadBudgetScope, policy: UploadBudgetPolicy|null=CURRENT_UPLOAD_BUDGET_POLICY): string {
  if(!isUploadBudgetConfigured(policy))return 'New product and lesson file uploads are paused while monthly allowances are being reviewed.';
  const cap=policy.perStore[scope];
  const bytes=cap.authorizedBytes;
  const unit=bytes>=1_000_000_000?1_000_000_000:bytes>=1_000_000?1_000_000:1;
  const label=unit===1_000_000_000?'GB':unit===1_000_000?'MB':'bytes';
  const shown=Math.floor(bytes/unit*1000)/1000;
  return 'Product and lesson files: up to '+cap.opens.toLocaleString('en-US')+' upload starts and '+shown.toLocaleString('en-US',{maximumFractionDigits:3})+' '+label+' of newly authorized file data per calendar month. Starting over uses a new allowance. The monthly limit includes '+cap.controlRequests.toLocaleString('en-US')+' requests to start uploads or obtain upload links.';
}
