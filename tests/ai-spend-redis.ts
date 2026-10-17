export let available = true;
export let response: unknown[] | null = null;
export let failure = false;
export const calls: (string | number)[][][] = [];
export const ledger = new Map<string, Map<string, string>>();
export function reset() { available = true; response = null; failure = false; calls.length = 0; ledger.clear(); }
export const isRedisConfigured = () => available;
export function seed(key: string, review: string, policy: string) { ledger.set(key, new Map([['review', review], ['policy', policy], ['company', '0']])); }
export async function redisPipeline(commands: (string | number)[][]): Promise<unknown[]> {
  calls.push(commands);
  if (failure) throw new Error('Redis unavailable');
  if (response) return response;
  // Contract double only: the production Lua is separately reviewed, not executed by this double.
  const cmd = commands[0];
  const [, , keys, key, review, field, amount, storeLimit, companyLimit, policy] = cmd;
  if (cmd[0] !== 'EVAL' || commands.length !== 1 || keys !== 1) throw new Error('Expected one atomic reservation');
  const hash = ledger.get(String(key));
  if (!hash || hash.get('review') !== review || hash.get('policy') !== policy) return [0];
  const parse = (s: string | undefined) => s !== undefined && /^(0|[1-9][0-9]*)$/.test(s) && Number(s) <= 1e12 ? Number(s) : NaN;
  const company = parse(hash.get('company'));
  const used = hash.has(String(field)) ? parse(hash.get(String(field))) : 0;
  if (!Number.isSafeInteger(company) || !Number.isSafeInteger(used) || used > company || Number(amount) > Number(storeLimit) - used || Number(amount) > Number(companyLimit) - company) return [0];
  hash.set(String(field), String(used + Number(amount)));hash.set('company', String(company + Number(amount)));return [1];
}
export function settings(value: { available?: boolean; response?: unknown[] | null; failure?: boolean }) { if(value.available !== undefined)available=value.available;if(value.response !== undefined)response=value.response;if(value.failure !== undefined)failure=value.failure; }
