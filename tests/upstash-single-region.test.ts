/**
 * The database stays in one region (18 October 2026). Upstash bills the data
 * a database keeps once for every copy it keeps, a read region included
 * (lib/spend-cost-table.ts, UPSTASH_MICRO_USD_PER_GB_MONTH), and every plan's
 * worst month prices one copy (tests/plan-cost-registry.ts, the lines
 * database-storage and retained-data). A read region would multiply both by
 * the copies and spend the owner's 60% without any test noticing, so this
 * fails if the code, the deployment or the jobs ever configure one, or talk
 * to the database through a second address. Turning one on in Upstash's
 * console is the owner's act, and docs/order-data.md says it must be priced
 * first.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";

const root = process.cwd();
function walk(dir: string, out: string[] = []): string[] {
  if (!existsSync(join(root, dir))) return out;
  for (const name of readdirSync(join(root, dir))) {
    if (name === "node_modules" || name.startsWith(".next")) continue;
    const path = `${dir}/${name}`;
    if (statSync(join(root, path)).isDirectory()) walk(path, out);
    else if (/\.(ts|tsx|mjs|js|json|yml|yaml|py|toml)$/.test(name)) out.push(path);
  }
  return out;
}

const FILES = [...["app", "lib", "infra", "scripts", ".github", "components"].flatMap((dir) => walk(dir)), "vercel.json", "package.json", "next.config.ts", "proxy.ts"].filter((file) => existsSync(join(root, file)));

/** Ways a Redis database is told to keep or read from another region's copy. */
const READ_REGION = [/read[_-]?regions?/i, /readYourWrites/, /upstash-sync-token/i, /UPSTASH_REDIS_REST_URL_[A-Z0-9_]+/, /KV_REST_API_URL_[A-Z0-9_]+/, /primary[_-]?region/i, /\breplicas?\b\s*[:=]/i];

test("nothing configures a read region or a second address for the database", () => {
  const found: string[] = [];
  for (const file of FILES) {
    const text = readFileSync(join(root, file), "utf8");
    for (const pattern of READ_REGION) if (pattern.test(text)) found.push(`${file}: ${pattern}`);
  }
  assert.deepEqual(found, [], "a read region multiplies what every plan pays to keep its data: price it in tests/plan-cost-registry.ts first");
});

test("the database is reached at one address, the one the storage lines price", () => {
  const client = readFileSync(join(root, "lib/redis.ts"), "utf8");
  const urls = new Set(client.match(/process\.env\.[A-Z_]*URL[A-Z_]*/g) ?? []);
  assert.deepEqual([...urls].sort(), ["process.env.KV_REST_API_URL", "process.env.UPSTASH_REDIS_REST_URL"], "one address, by either of its names");
  assert.ok(!/@upstash\/redis/.test(readFileSync(join(root, "package.json"), "utf8")), "a client that can read from replicas is not used");
  assert.match(readFileSync(join(root, "lib/spend-cost-table.ts"), "utf8"), /one region is priced here/);
});
