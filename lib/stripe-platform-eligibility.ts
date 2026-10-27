import { canonicalFinancialSnapshot } from "./contract-funding-rules";

/** SR2 is an additional gate. These are required evidence scopes, not country availability inferred from COUNTRIES. */
export const STRIPE_PLATFORM_REQUIRED_REGIONS = Object.freeze(["US", "CA", "GB", "EUROPE"] as const);
export type StripePlatformRegion = typeof STRIPE_PLATFORM_REQUIRED_REGIONS[number];
export const STRIPE_PLATFORM_ELIGIBILITY_RULES = Object.freeze({
  schema: 1, ownerDecision: "2026-10-27T08:00:00-03:00",
  platformCountry: "US", companyCountry: "US", chargeType: "direct",
  creatorRegions: STRIPE_PLATFORM_REQUIRED_REGIONS, missingEvidence: "deny",
} as const);
type Evidence = {
  /** Opaque technical evidence references, never a key, URL, SSN/ITIN, personal identifier or personal-ID hash. */
  accountReferenceSha256: string;
  companyReferenceSha256: string;
  recordedOn: string;
  evidenceSha256: string;
  source: "stripe-platform-account" | "stripe-written-confirmation";
};
export type StripePlatformEligibilityReview = {
  schema: 1;
  reviewedOn: string;
  platform: Evidence & {
    platformCountry: "US"; companyCountry: "US";
    accountInCompanyName: true; accountActive: true;
  };
  regions: Record<StripePlatformRegion, Evidence & { region: StripePlatformRegion; directChargesEligible: true }>;
};
/** No US-company platform account or dated eligibility evidence has been supplied. */
export const CURRENT_STRIPE_PLATFORM_ELIGIBILITY_REVIEW: StripePlatformEligibilityReview | null = null;
const HASH = /^[a-f0-9]{64}$/;
const EVIDENCE_KEYS = ["accountReferenceSha256", "companyReferenceSha256", "recordedOn", "evidenceSha256", "source"];
function exact(value: unknown, keys: readonly string[]): value is Record<string, unknown> {
  return !!value && typeof value === "object" && !Array.isArray(value)
    && Object.keys(value).length === keys.length && keys.every(key => Object.hasOwn(value, key));
}
function day(value: unknown): value is string {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const at = new Date(value + "T00:00:00Z");
  return Number.isFinite(at.getTime()) && at.toISOString().slice(0, 10) === value;
}
function evidence(value: Record<string, unknown>, reviewedOn: string, account: string, company: string): boolean {
  return value.accountReferenceSha256 === account && value.companyReferenceSha256 === company
    && typeof value.evidenceSha256 === "string" && HASH.test(value.evidenceSha256)
    && day(value.recordedOn) && value.recordedOn <= reviewedOn
    && (value.source === "stripe-platform-account" || value.source === "stripe-written-confirmation");
}
/**
 * Checks a detached, dated, explicitly account/company-bound review record.
 * Schema validation is not independent verification of Stripe documents.
 * Production uses only the owner-reviewed constant above, never request data.
 * Empty/unknown proofs fail. No provider read, write, account creation or secret.
 */
export function stripePlatformEligibilityReady(
  review: StripePlatformEligibilityReview | null = CURRENT_STRIPE_PLATFORM_ELIGIBILITY_REVIEW,
  now = Date.now(),
): boolean {
  if (!Number.isSafeInteger(now) || now < 0 || now > 253_402_300_799_999) return false;
  const today = new Date(now).toISOString().slice(0, 10);
  const encoded = canonicalFinancialSnapshot(review);
  if (encoded === null) return false;
  const data: unknown = JSON.parse(encoded);
  if (!exact(data, ["schema", "reviewedOn", "platform", "regions"]) || data.schema !== 1
    || !day(data.reviewedOn) || data.reviewedOn < "2026-10-27" || data.reviewedOn > today) return false;
  const platform = data.platform;
  if (!exact(platform, [...EVIDENCE_KEYS, "platformCountry", "companyCountry", "accountInCompanyName", "accountActive"])
    || platform.platformCountry !== "US" || platform.companyCountry !== "US"
    || platform.accountInCompanyName !== true || platform.accountActive !== true
    || platform.source !== "stripe-platform-account") return false;
  const account = platform.accountReferenceSha256, company = platform.companyReferenceSha256;
  if (typeof account !== "string" || !HASH.test(account) || typeof company !== "string"
    || !HASH.test(company) || account === company || !evidence(platform, data.reviewedOn, account, company)) return false;
  const regions = data.regions;
  if (!exact(regions, STRIPE_PLATFORM_REQUIRED_REGIONS)) return false;
  return STRIPE_PLATFORM_REQUIRED_REGIONS.every(region => {
    const proof = regions[region];
    return exact(proof, [...EVIDENCE_KEYS, "region", "directChargesEligible"])
      && proof.region === region && proof.directChargesEligible === true
      && evidence(proof, data.reviewedOn as string, account, company);
  });
}
