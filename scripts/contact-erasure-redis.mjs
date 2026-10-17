/**
 * Builds tests/erasure-redis-run.ts with the application's real Redis
 * client (lib/redis.ts) and runs it: called by
 * scripts/test_contact_erasure_redis.py, which serves Redis to it.
 */
import { mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { build } from "esbuild";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const out = mkdtempSync(join(tmpdir(), "nimbus-erasure-"));
try {
  const bundle = join(out, "erasure-redis-run.cjs");
  await build({
    entryPoints: [join(root, "tests", "erasure-redis-run.ts")],
    bundle: true,
    platform: "node",
    format: "cjs",
    outfile: bundle,
    logLevel: "error",
    alias: { "@": root, "@/lib/redis": join(root, "lib", "redis.ts") },
  });
  const run = spawnSync(process.execPath, [bundle], { stdio: "inherit", env: process.env });
  process.exitCode = run.status ?? 1;
} finally {
  rmSync(out, { recursive: true, force: true });
}
