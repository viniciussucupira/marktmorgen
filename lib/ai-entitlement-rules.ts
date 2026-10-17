import { AI_MONTHLY } from '@/lib/ai-rules';
import { ANSWERS_MONTHLY } from '@/lib/answers-rules';
import { AI_REQUEST_LIMITS, SUPPORTED_AI_MODELS } from '@/lib/ai-request-rules';
import type { AiBudgetTier, AiSpendPolicy } from '@/lib/ai-spend-policy';
/** Current source envelope: translated help can make two calls in one job.
 * Visitor answers and the store guide share one separate monthly allowance.
 * Affiliate drafts, inbox, voice and number summaries share writing jobs.
 * This is a request-count envelope, not proof of model prices or tax treatment.
 */
export const AI_ENTITLEMENT_RULES = {
  schema: 2,
  writingCallsPerJob: 2,
  visitorCallsPerAttempt: 1,
  failedAttempts: 'retained',
  callEnvelope: 'async-job-shared-counter-owner-bound-no-reset-after-completion',
  writing: AI_MONTHLY,
  visitor: ANSWERS_MONTHLY,
  request: AI_REQUEST_LIMITS,
  models: SUPPORTED_AI_MODELS,
} as const;
export function aiEntitlementsSnapshot(): string {
  return JSON.stringify(AI_ENTITLEMENT_RULES);
}
/** Any allowed model may be selected by deployment configuration, so fund the
 * most expensive reviewed request for every permitted call, never an average.
 */
export function requiredAiStoreMicroUsd(tier: AiBudgetTier, requestMicroUsd: Readonly<Record<string, number>>): bigint | null {
  // Non-paying scopes can retain any historical plan: fund the largest rights.
  const rights = tier === 'setup' || tier === 'ended' ? 'scale' : tier;
  if (!Object.hasOwn(AI_MONTHLY,rights) || !Object.hasOwn(ANSWERS_MONTHLY,rights)) return null;
  const charges = SUPPORTED_AI_MODELS.map(model=>requestMicroUsd?.[model]);
  if(charges.some(value=>!Number.isSafeInteger(value)||value<=0))return null;
  const calls = BigInt(AI_MONTHLY[rights])*BigInt(AI_ENTITLEMENT_RULES.writingCallsPerJob)
    + BigInt(ANSWERS_MONTHLY[rights])*BigInt(AI_ENTITLEMENT_RULES.visitorCallsPerAttempt);
  return calls*BigInt(Math.max(...charges));
}

/** A valid monetary ledger can still underfund the advertised usage. Commercial
 * release must cover all calls for every scope with at least one funded slot. */
export function aiEntitlementsFunded(policy: AiSpendPolicy): boolean {
  return Object.entries(policy.fundedStores).every(([scope, slots]) => {
    if (slots === 0) return true;
    const tier = scope as AiBudgetTier;
    const required = requiredAiStoreMicroUsd(tier, policy.requestMicroUsd);
    const cap = policy.storeMicroUsd[tier];
    return required !== null && Number.isSafeInteger(cap) && cap >= 0 && BigInt(cap) >= required;
  });
}
