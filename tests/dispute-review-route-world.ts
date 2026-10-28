export const chosenStore = { handle: "chosen", sid: "store-fixture", stripeAccountId: "acct_fixture" };
export const state: { body: Record<string, unknown>; denial: Response | null; result: unknown; error: boolean; historyReads: number; checks: { need: string; max: number }[]; reads: { store: unknown; id: string }[] } =
  { body: {}, denial: null, result: { ok: false, reason: "funding" }, error: false, historyReads: 0, checks: [], reads: [] };
export function reset() { state.body = { action: "review", dispute: "du_fixture" }; state.denial = null; state.result = { ok: false, reason: "funding" }; state.error = false; state.historyReads = 0; state.checks = []; state.reads = []; }
export async function guardStoreWrite(_request: unknown, need: string, max: number) {
  state.checks.push({ need, max });
  return state.denial ? { ok: false, response: state.denial } : { ok: true, store: chosenStore, body: state.body };
}
export async function readDisputePurchaseReview(store: unknown, id: string) {
  state.reads.push({ store, id });
  if (state.error) throw new Error("Synthetic private provider detail");
  return state.result;
}

export async function readRetainedPreorderReview() { state.historyReads++; return { status: "unavailable" }; }
