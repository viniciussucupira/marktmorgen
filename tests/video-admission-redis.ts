export let configured = true;
export let result: unknown[] = [null];
export let fail = false;
export const commands: (string | number)[][][] = [];
export const isRedisConfigured = () => configured;
export async function redisPipeline(input: (string|number)[][]) {commands.push(input);if(fail)throw Error('unavailable');return result;}
export function set(value: unknown[], options: {configured?: boolean;fail?: boolean} = {}) {result=value;configured=options.configured??true;fail=options.fail??false;commands.length=0;}
