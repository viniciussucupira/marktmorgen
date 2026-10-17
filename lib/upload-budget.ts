import { isRedisConfigured, redisPipeline } from '@/lib/redis';
import { standingOf, type PlanFields } from '@/lib/plan-standing';
import type { Tier } from '@/lib/plan';
import { CURRENT_UPLOAD_BUDGET_POLICY, UPLOAD_BUDGET_RULES, UPLOAD_BUDGET_SCOPES, isUploadBudgetConfigured, uploadBudgetSnapshot, type UploadBudgetPolicy, type UploadBudgetScope } from '@/lib/upload-budget-policy';

export type UploadBackend = 'r2'|'blob'|'stream';
export type UploadStore = PlanFields & { statsId: string|null; tier: Tier };
export function uploadScopeFor(store: UploadStore): UploadBudgetScope {
  const standing=standingOf(store);
  return standing==='paid'?store.tier:standing==='none'?'setup':standing;
}
/** One persistent cluster-slot hash covers all providers and all customers.
 * Its initial policy, company counters and allocation slots are supplied by a
 * reviewed migration. This request path never initializes a missing ledger.
 */
export const RESERVE_UPLOAD_BUDGET = `
local function amount(value)
  if not value or not string.match(value, '^%d+$') or (#value > 1 and string.sub(value, 1, 1) == '0') then return nil end
  local n = tonumber(value)
  if not n or n < 0 or n > 1000000000000 or n ~= math.floor(n) then return nil end
  return n
end
if redis.call('TYPE', KEYS[1]).ok ~= 'hash' or redis.call('TTL', KEYS[1]) ~= -1 then return 0 end
if redis.call('HGET', KEYS[1], 'policy') ~= ARGV[1] then return 0 end
local action, bytes = ARGV[4], amount(ARGV[5])
if not bytes or (action ~= 'open' and action ~= 'control') then return 0 end
if (action == 'open' and bytes <= 0) or (action == 'control' and bytes ~= 0) then return 0 end
local storeLimit = {amount(ARGV[6]), amount(ARGV[7]), amount(ARGV[8])}
local companyLimit = {amount(ARGV[9]), amount(ARGV[10]), amount(ARGV[11])}
local funded = amount(ARGV[12])
if not funded then return 0 end
local names = {'opens','bytes','controls'}
local company, used = {}, {}
local prefix = 'store:' .. ARGV[2] .. ':'
local scope = redis.call('HGET', KEYS[1], prefix .. 'scope')
for i = 1, 3 do
  if not storeLimit[i] or not companyLimit[i] then return 0 end
  company[i] = amount(redis.call('HGET', KEYS[1], 'company:' .. names[i]))
  if not company[i] or company[i] > companyLimit[i] then return 0 end
  local raw = redis.call('HGET', KEYS[1], prefix .. names[i])
  if not scope then
    if raw then return 0 end
    used[i] = 0
  else
    used[i] = amount(raw)
    if not used[i] or used[i] > storeLimit[i] or used[i] > company[i] then return 0 end
  end
end
if scope and scope ~= ARGV[3] then return 0 end
local slots
if not scope then
  slots = amount(redis.call('HGET', KEYS[1], 'slots:' .. ARGV[3]))
  if not slots or slots <= 0 or slots > funded then return 0 end
end
local charge = {action == 'open' and 1 or 0, bytes, 1}
for i = 1, 3 do
  if charge[i] > storeLimit[i] - used[i] or charge[i] > companyLimit[i] - company[i] then return 0 end
end
-- No writes until every field and every ceiling has been checked.
if not scope then
  redis.call('HINCRBY', KEYS[1], 'slots:' .. ARGV[3], -1)
  redis.call('HSET', KEYS[1], prefix .. 'scope', ARGV[3])
end
for i = 1, 3 do
  redis.call('HINCRBY', KEYS[1], prefix .. names[i], charge[i])
  redis.call('HINCRBY', KEYS[1], 'company:' .. names[i], charge[i])
end
return 1
`;

async function reserve(statsId: string, scope: UploadBudgetScope, action: 'open'|'control', bytes: number, policy: UploadBudgetPolicy|null): Promise<boolean> {
  if(!isUploadBudgetConfigured(policy) || !isRedisConfigured() || !/^[a-f0-9]{32}$/.test(statsId)
    || !(UPLOAD_BUDGET_SCOPES as readonly string[]).includes(scope)
    || !Number.isSafeInteger(bytes) || bytes<0 || bytes>UPLOAD_BUDGET_RULES.maxInteger
    || (action==='open' && bytes===0) || (action==='control' && bytes!==0))return false;
  const cap=policy.perStore[scope], company=policy.company;
  if(cap.controlRequests<1 || (action==='open' && (cap.opens<1 || bytes>cap.authorizedBytes)))return false;
  try{
    const result=await redisPipeline([['EVAL',RESERVE_UPLOAD_BUDGET,1,UPLOAD_BUDGET_RULES.ledgerPrefix+policy.month,
      uploadBudgetSnapshot(policy),statsId,scope,action,bytes,cap.opens,cap.authorizedBytes,cap.controlRequests,
      company.opens,company.authorizedBytes,company.controlRequests,policy.fundedStores[scope]]]);
    return result.length===1 && result[0]===1;
  }catch{return false;}
}
/** The full authorized size is retained on abort, timeout, rejection or lost
 * acknowledgement. Reopening is a new reservation; deleting a file never
 * refunds monthly upload capacity. This is not a supplier-dollar ceiling.
 */
export async function reserveStoreUpload(store: UploadStore, bytes: number, backend: UploadBackend, policy: UploadBudgetPolicy|null=CURRENT_UPLOAD_BUDGET_POLICY): Promise<boolean> {
  // Direct Blob/Bunny grants do not establish the same revocable, size-bound
  // session contract. Keep them closed until that provider path is proven.
  if(backend!=='r2')return false;
  return !!store?.statsId && reserve(store.statsId,uploadScopeFor(store),'open',bytes,policy);
}
/** Signing requests share the store's monthly control ceiling.
 * Completing or canceling an existing grant remains accessible; the reviewed
 * per-open liability must include that work and month-boundary carryover.
 */
export async function reserveUploadControl(store: UploadStore, policy: UploadBudgetPolicy|null=CURRENT_UPLOAD_BUDGET_POLICY): Promise<boolean> {
  return !!store?.statsId && reserve(store.statsId,uploadScopeFor(store),'control',0,policy);
}
