export const state: {
  funded: boolean; allowances: boolean[]; replies: (Record<string, unknown> | Error)[];
  events: string[]; calls: { method: string; account: string; path: string; timeout: number }[];
} = { funded: true, allowances: [], replies: [], events: [], calls: [] };
export function reset() { state.funded = true; state.allowances = []; state.replies = []; state.events = []; state.calls = []; }
export function saleHandles(store: { handle: string }) { return new Set([store.handle, "old-handle"]); }
export async function reservePaidResourceWindow() { state.events.push("fund"); return state.funded; }
export async function takeAllowance(_store: unknown, kind: string) {
  state.events.push("allow:" + kind);
  return { ok: state.allowances.length ? state.allowances.shift() : true };
}
export async function onAccount(method: string, account: string, path: string, body: unknown, version: unknown, key: unknown, timeout: number) {
  if (body !== undefined || version !== undefined || key !== undefined) throw new Error("Unexpected write or custom signing");
  state.events.push("read"); state.calls.push({ method, account, path, timeout });
  const reply = state.replies.shift();
  if (reply instanceof Error) throw reply;
  if (!reply) throw new Error("No synthetic response");
  return reply;
}
