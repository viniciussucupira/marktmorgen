/**
 * Runs every *.test.ts in this folder.
 *
 * esbuild does the TypeScript, which is why it is a devDependency: these run
 * with `npm test` and nothing else installed. "@/lib/redis" is swapped for an
 * in-memory one, so a test exercises the real code against a store that
 * behaves like the one it was written for, without reaching anything real.
 */
import { readdirSync, mkdtempSync, rmSync } from "node:fs";
import { tmpdir } from "node:os";
import { join, dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { checkClientBundles } from "./client-bundles.mjs";
import {testAliases,testEnvironment} from "./test-config.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "..");
const out = mkdtempSync(join(tmpdir(), "nimbus-tests-"));
let failed = 0;

try {
  const files = readdirSync(here).filter((f) => f.endsWith(".test.ts")).sort();
  if (!files.length) {
    console.log("No tests found.");
    process.exit(0);
  }
  for (const file of files) {
    const bundle = join(out, `${file}.cjs`);
    await build({
      entryPoints: [join(here, file)],
      bundle: true,
      platform: "node",
      format: "cjs",
      outfile: bundle,
      logLevel: "error",
      alias: testAliases(file,root,here),
    });
    console.log(`\n=== ${file} ===`);
    const { spawnSync } = await import("node:child_process");
    const run = spawnSync(process.execPath, [bundle], {
      stdio: "inherit",
      env: testEnvironment(process.env),
    });
    if (run.status !== 0) failed += 1;
  }
} finally {
  rmSync(out, { recursive: true, force: true });
}

const clientBundles = await checkClientBundles(root);
console.log(`\nBrowser bundles: ${clientBundles.total - clientBundles.failed}/${clientBundles.total} passed.`);
for (const failure of clientBundles.failures) console.error(failure);
failed += clientBundles.failed;

if (failed) {
  console.log(`\n${failed} test file(s) failed.`);
  process.exit(1);
}
console.log("\nEverything passing.");
