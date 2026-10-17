import { standingOf, type PlanFields } from '@/lib/plan-standing';
import type { Tier } from '@/lib/plan';
import { isRedisConfigured, redisPipeline } from '@/lib/redis';
import { AI_BUDGET_TIERS, aiSpendPolicySnapshot, isAiSpendPolicyValid, CURRENT_AI_SPEND_POLICY, type AiBudgetTier, type AiSpendPolicy } from '@/lib/ai-spend-policy';
import { SUPPORTED_AI_MODELS } from '@/lib/ai-request-rules';

/** Acquisition and ended accounts never consume a paid-tier allocation. */
export function aiBudgetScopeFor(store: PlanFields & { tier: Tier }, nowSeconds = Date.now() / 1000): AiBudgetTier {
  const standing = standingOf(store, nowSeconds);
  return standing === 'paid' ? store.tier : standing === 'none' ? 'setup' : standing;
}

export function isAiBudgetConfigured(policy: AiSpendPolicy | null = CURRENT_AI_SPEND_POLICY, now = new Date()): policy is AiSpendPolicy {
  return isAiSpendPolicyValid(policy, now);
}

/** A single hash keeps both counters in the same Redis cluster slot. Read and
 * validate everything before writing. Missing/corrupt/expiring ledgers deny.
 * Ledger creation belongs to the reviewed funding migration, never this path.
 */
export const RESERVE_AI_SPEND = `
local function amount(value)
  if not value or not string.match(value, '^%d+$') or (#value > 1 and string.sub(value, 1, 1) == '0') then return nil end
  local n = tonumber(value)
  if not n or n < 0 or n > 1000000000000 or n ~= math.floor(n) then return nil end
  return n
end
if redis.call('TYPE', KEYS[1]).ok ~= 'hash' then return 0 end
if redis.call('TTL', KEYS[1]) ~= -1 then return 0 end
if redis.call('HGET', KEYS[1], 'review') ~= ARGV[1] then return 0 end
if redis.call('HGET', KEYS[1], 'policy') ~= ARGV[6] then return 0 end
local company = amount(redis.call('HGET', KEYS[1], 'company'))
local raw = redis.call('HGET', KEYS[1], ARGV[2])
local scopeField = 'tier:' .. ARGV[2]
local scope = redis.call('HGET', KEYS[1], scopeField)
if scope and (scope ~= ARGV[7] or not raw) then return 0 end
if not scope and raw then return 0 end
local store = raw and amount(raw) or 0
if raw and not amount(raw) then return 0 end
local funded = amount(ARGV[8])
local slotsField = 'slots:' .. ARGV[7]
local slots = amount(redis.call('HGET', KEYS[1], slotsField))
if not funded or not slots or slots > funded or (not scope and slots <= 0) then return 0 end
local charge, storeLimit, companyLimit = amount(ARGV[3]), amount(ARGV[4]), amount(ARGV[5])
if not company or not charge or charge <= 0 or not storeLimit or not companyLimit then return 0 end
if store > company or store > storeLimit or company > companyLimit or charge > storeLimit - store or charge > companyLimit - company then return 0 end
if not scope then
  redis.call('HINCRBY', KEYS[1], slotsField, -1)
  redis.call('HSET', KEYS[1], scopeField, ARGV[7])
end
redis.call('HINCRBY', KEYS[1], ARGV[2], ARGV[3])
redis.call('HINCRBY', KEYS[1], 'company', ARGV[3])
return 1
`;

/** The reservation is final before fetch. Never refund on timeout, provider
 * rejection, invalid output, response loss or a failed creator job. A retry is
 * a new paid call with a new reservation. Caller-supplied historical dates
 * cannot choose a fresh spending month.
 */
export async function reserveAiSpend(
  statsId: string, tier: AiBudgetTier, model: string,
  policy: AiSpendPolicy | null = CURRENT_AI_SPEND_POLICY,
): Promise<boolean> {
  if (!isAiBudgetConfigured(policy) || !isRedisConfigured() || typeof statsId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(statsId)
    || !(AI_BUDGET_TIERS as readonly string[]).includes(tier) || !(SUPPORTED_AI_MODELS as readonly string[]).includes(model)) return false;
  const charge = policy.requestMicroUsd[model as keyof typeof policy.requestMicroUsd];
  if (policy.fundedStores[tier] === 0 || charge > policy.storeMicroUsd[tier] || charge > policy.companyMicroUsd) return false;
  try {
    const result = await redisPipeline([['EVAL', RESERVE_AI_SPEND, 1,
      'nl:ai-spend:v1:' + policy.month, policy.reviewId, 'store:' + statsId,
      charge, policy.storeMicroUsd[tier], policy.companyMicroUsd, aiSpendPolicySnapshot(policy), tier, policy.fundedStores[tier]]]);
    return result.length === 1 && result[0] === 1;
  } catch { return false; }
}
