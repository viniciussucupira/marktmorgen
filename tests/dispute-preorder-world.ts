export const state = { configured: true, funded: true, allowance: true, error: false, reply: null as unknown, order: [] as string[], commands: [] as (string | number)[][] };
export function reset() { Object.assign(state, { configured: true, funded: true, allowance: true, error: false, reply: null, order: [], commands: [] }); }
export function isRedisConfigured() { return state.configured; }
export async function reservePaidResourceWindow() { state.order.push("funding"); return state.funded; }
export async function takeAllowance(_store: unknown, kind: string) { state.order.push(kind); return { ok: state.allowance }; }
export async function redisPipeline(commands: (string | number)[][]) { state.order.push("read"); state.commands = commands; if (state.error) throw Error("Synthetic private record"); return [state.reply]; }
