import { AsyncLocalStorage } from 'node:async_hooks';
/** One asynchronous job owns one shared attempt counter. No await occurs
 * between checking and consuming a slot, so concurrent calls cannot overdraw. */
type CallBudget = { storeId: string; remaining: number; closed: boolean };
const context = new AsyncLocalStorage<CallBudget>();
export function hasAiCallBudget(): boolean { return context.getStore() !== undefined; }
export function consumeAiCallBudget(storeId: string): boolean {
  const budget = context.getStore();
  if (!budget || budget.closed || budget.storeId !== storeId || budget.remaining <= 0) return false;
  budget.remaining--;
  return true;
}
/** Nested helpers share their parent's counter; they cannot renew it or move
 * the request to another store. Detached work cannot spend after completion. */
export async function withAiCallBudget<T>(storeId: string, maxCalls: number, run: () => Promise<T>): Promise<T | null> {
  if (typeof storeId !== 'string' || !/^[A-Za-z0-9_-]{1,128}$/.test(storeId)
    || !Number.isSafeInteger(maxCalls) || maxCalls <= 0) return null;
  const existing = context.getStore();
  if (existing) return existing.closed || existing.storeId !== storeId ? null : run();
  const budget: CallBudget = {storeId,remaining:maxCalls,closed:false};
  return context.run(budget, async () => {try {return await run();} finally {budget.closed=true;}});
}
