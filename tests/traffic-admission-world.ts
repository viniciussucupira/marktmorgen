export const world: { configured: boolean; throws: boolean; results: unknown[]; reads: number; folder: string } = { configured: true, throws: false, results: [[null, null]], reads: 0, folder: 'a'.repeat(32) };
export const isRedisConfigured = () => world.configured;
export async function redisPipeline(_commands: unknown): Promise<unknown[]> { world.reads++; if(world.throws)throw Error('unavailable'); return world.results; }
export const storeRef = (_store: unknown) => 'synthetic-owner';
export const storeFolder = async (_ref: string) => world.folder;
export const rememberFolderOwner = async (..._args: unknown[]) => {};
export const deriveKey = (_name: string) => null;
export const monthKey = (date = new Date()) => date.toISOString().slice(0,7);
