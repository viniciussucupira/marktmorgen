import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { CURRENT_STRIPE_PLATFORM_ELIGIBILITY_REVIEW, STRIPE_PLATFORM_ELIGIBILITY_RULES, STRIPE_PLATFORM_REQUIRED_REGIONS,
  stripePlatformEligibilityReady, type StripePlatformEligibilityReview } from "../lib/stripe-platform-eligibility";
import { PLANS_ON_SALE } from "../lib/opening";

const NOW = Date.UTC(2026, 9, 27, 18);
function fixture(): StripePlatformEligibilityReview {
  const common = { accountReferenceSha256: "a".repeat(64), companyReferenceSha256: "b".repeat(64),
    recordedOn: "2026-10-27", evidenceSha256: "c".repeat(64), source: "stripe-platform-account" as const };
  return { schema: 1, reviewedOn: "2026-10-27",
    platform: { ...common, platformCountry: "US", companyCountry: "US", accountInCompanyName: true, accountActive: true },
    regions: Object.fromEntries(STRIPE_PLATFORM_REQUIRED_REGIONS.map(region => [region, {
      ...common, region, directChargesEligible: true,
    }])) as StripePlatformEligibilityReview["regions"] };
}
test("no actual platform account or evidence exists in code, so the new gate is closed", () => {
  assert.equal(CURRENT_STRIPE_PLATFORM_ELIGIBILITY_REVIEW, null);
  assert.equal(stripePlatformEligibilityReady(), false);
  assert.equal(stripePlatformEligibilityReady(null, NOW), false);
  assert.equal(PLANS_ON_SALE, false);
});
test("a complete synthetic review passes data validation only and never updates the actual gate", () => {
  assert.equal(stripePlatformEligibilityReady(fixture(), NOW), true);
  assert.equal(CURRENT_STRIPE_PLATFORM_ELIGIBILITY_REVIEW, null);
  assert.equal(stripePlatformEligibilityReady(), false);
  assert.equal(PLANS_ON_SALE, false);
  assert.deepEqual(STRIPE_PLATFORM_REQUIRED_REGIONS, ["US", "CA", "GB", "EUROPE"]);
  assert.equal(Object.isFrozen(STRIPE_PLATFORM_REQUIRED_REGIONS), true);
  assert.equal(Object.isFrozen(STRIPE_PLATFORM_ELIGIBILITY_RULES), true);
});
test("a BR platform, personal account, foreign company or inactive account cannot substitute", () => {
  for (const [key, value] of [["platformCountry", "BR"], ["companyCountry", "BR"],
    ["accountInCompanyName", false], ["accountActive", false], ["source", "stripe-written-confirmation"]] as const) {
    const data = fixture(); Object.assign(data.platform, { [key]: value });
    assert.equal(stripePlatformEligibilityReady(data, NOW), false, key);
  }
});
test("every required region needs its own explicit direct-charge proof bound to the same account/company", () => {
  for (const region of STRIPE_PLATFORM_REQUIRED_REGIONS) {
    for (const [key, value] of [["region", "elsewhere"], ["directChargesEligible", false],
      ["accountReferenceSha256", "d".repeat(64)], ["companyReferenceSha256", "e".repeat(64)],
      ["evidenceSha256", ""], ["source", "general-supported-countries"]] as const) {
      const data = fixture(); Object.assign(data.regions[region], { [key]: value });
      assert.equal(stripePlatformEligibilityReady(data, NOW), false, region + ":" + key);
    }
    const missing = fixture();
    delete (missing.regions as Partial<StripePlatformEligibilityReview["regions"]>)[region];
    assert.equal(stripePlatformEligibilityReady(missing, NOW), false);
  }
  const extra = fixture(); Object.assign(extra.regions, { UK: extra.regions.GB });
  assert.equal(stripePlatformEligibilityReady(extra, NOW), false);
});
test("missing platform evidence, identity or evidence date never becomes a positive assertion", () => {
  for (const key of ["accountReferenceSha256", "companyReferenceSha256", "recordedOn", "evidenceSha256", "source"]) {
    const data = fixture(); delete (data.platform as unknown as Record<string, unknown>)[key];
    assert.equal(stripePlatformEligibilityReady(data, NOW), false, key);
  }
  for (const bad of ["", "not-a-hash", "C".repeat(64), "c".repeat(63)]) {
    const data = fixture(); data.platform.evidenceSha256 = bad;
    assert.equal(stripePlatformEligibilityReady(data, NOW), false);
  }
  const self = fixture(); self.platform.companyReferenceSha256 = self.platform.accountReferenceSha256;
  assert.equal(stripePlatformEligibilityReady(self, NOW), false);
});
test("review and evidence dates must be actual days, not future approvals or undated claims", () => {
  for (const date of ["", "2026-02-31", "2026-10-28", "2026-1-01", "2026-10-26"]) {
    const data = fixture(); data.reviewedOn = date;
    assert.equal(stripePlatformEligibilityReady(data, NOW), false, date);
  }
  for (const date of ["", "2026-02-29", "2026-10-28", "not-a-date"]) {
    const data = fixture(); data.platform.recordedOn = date;
    assert.equal(stripePlatformEligibilityReady(data, NOW), false);
    const regional = fixture(); regional.regions.EUROPE.recordedOn = date;
    assert.equal(stripePlatformEligibilityReady(regional, NOW), false);
  }
  for (const bad of [-1, 0.5, NaN, Infinity, Number.MAX_SAFE_INTEGER]) {
    assert.equal(stripePlatformEligibilityReady(fixture(), bad), false);
  }
});
test("inherited or executable proof fields are refused without running getters or JSON hooks", () => {
  let calls = 0;
  const data = fixture();
  Object.defineProperty(data.platform, "accountActive", { enumerable: true, get() { calls++; return true; } });
  assert.equal(stripePlatformEligibilityReady(data, NOW), false);
  const inherited = Object.create(fixture()) as StripePlatformEligibilityReview;
  assert.equal(stripePlatformEligibilityReady(inherited, NOW), false);
  const inheritedRegion = fixture(); inheritedRegion.regions.US = Object.create(inheritedRegion.regions.US);
  assert.equal(stripePlatformEligibilityReady(inheritedRegion, NOW), false);
  const hook = fixture(); Object.assign(hook, { toJSON() { calls++; return fixture(); } });
  assert.equal(stripePlatformEligibilityReady(hook, NOW), false);
  assert.equal(calls, 0);
});
test("unknown extra fields or malformed top-level data never enter an opening review", () => {
  for (const input of [undefined, [], "", 1, false, { ...fixture(), schema: 2 }, { ...fixture(), email: "synthetic@example.com" }]) {
    assert.equal(stripePlatformEligibilityReady(input as unknown as StripePlatformEligibilityReview, NOW), false);
  }
});
test("removing the extra condition or any prior opening condition fails this regression", () => {
  const opening = readFileSync("lib/opening.ts", "utf8");
  assert.match(opening, /const OPENING_REQUESTED: boolean = false;/);
  assert.match(opening, /export const PLANS_ON_SALE: boolean = commercialPlansMayOpen\(OPENING_REQUESTED\)\s*&&\s*taxGateValid\(\)\s*&&\s*deemedSupplierReady\(\)\s*&&\s*stripePlatformEligibilityReady\(\);/);
  assert.match(opening, /import \{ stripePlatformEligibilityReady \} from ["']@\/lib\/stripe-platform-eligibility["']/);
  assert.equal(STRIPE_PLATFORM_ELIGIBILITY_RULES.chargeType, "direct");
});
