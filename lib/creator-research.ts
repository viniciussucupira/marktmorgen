// Shared by the /creators form (client) and the /api/creators route (server).

export const PLATFORMS = [
  "Stan",
  "Beacons",
  "Payhip",
  "Gumroad",
  "Kajabi",
  "Linktree",
  "Shopify",
  "Etsy",
  "My own website",
  "Other",
] as const;

export const LIMITS = {
  name: 80,
  email: 200,
  link: 300,
  country: 60,
  problem: 2000,
  tools: 1000,
  cost: 200,
} as const;

export const PROBLEM_MIN_LENGTH = 10;

export const SUPPORT_EMAIL = "support@marktmorgen.com";

// Stored with every answer as proof of what the person agreed to.
export const CONSENT_VERSION = "2026-09-28-1";

export const CONSENT_RESEARCH_TEXT =
  "Marktmorgen may store my answers and use them for this research. I can ask for them to be deleted at any time.";

export const CONSENT_FOLLOWUP_TEXT =
  "Marktmorgen may email me follow-up questions about my answers.";

export const CONSENT_UPDATES_TEXT =
  "Marktmorgen may email me when it adds something for creators.";

export type CreatorAnswer = {
  name: string;
  email: string;
  platform: (typeof PLATFORMS)[number];
  link: string;
  country: string;
  problem: string;
  tools: string;
  cost: string;
  consentResearch: true;
  // Missing on answers saved with consent version "2026-09-16".
  consentFollowUp?: boolean;
  consentUpdates: boolean;
};

/** A transport success is not proof that research answers were stored. */
export function isSavedCreatorAnswer(httpOK: boolean, raw: unknown): boolean {
  if (!httpOK || !raw || typeof raw !== "object" || Array.isArray(raw)) return false;
  const data = raw as Record<string, unknown>;
  return Object.hasOwn(data, "ok") && data.ok === true &&
    Object.hasOwn(data, "saved") && data.saved === true &&
    !Object.hasOwn(data, "error") && !Object.hasOwn(data, "field");
}
