/**
 * Writes docs/margin-alignment-2026-10-18.md from tests/margin-alignment-table.ts,
 * with the same wiring the test runner uses (tests/test-config.mjs), so the
 * document's figures are never typed. tests/margin-alignment.test.ts fails
 * when the file on disk is not what this writes.
 *
 *   node scripts/margin-alignment.mjs
 */
import { mkdtempSync, rmSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { spawnSync } from "node:child_process";
import { build } from "esbuild";
import { testAliases, testEnvironment } from "../tests/test-config.mjs";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const here = join(root, "tests");
const out = mkdtempSync(join(tmpdir(), "margin-alignment-"));
try {
  const bundle = join(out, "render.cjs");
  await build({
    stdin: {
      contents: `import { renderMarginAlignment } from "./margin-alignment-table";\nimport { ASSISTANT_ON_SALE, PLANS_ON_SALE } from "@/lib/opening";\nprocess.stdout.write(renderMarginAlignment(PLANS_ON_SALE, ASSISTANT_ON_SALE));\n`,
      resolveDir: here,
      loader: "ts",
    },
    bundle: true,
    platform: "node",
    format: "cjs",
    outfile: bundle,
    logLevel: "error",
    alias: testAliases("margin-alignment.test.ts", root, here),
  });
  const run = spawnSync(process.execPath, [bundle], { encoding: "utf8", env: testEnvironment(process.env), maxBuffer: 16 * 1024 * 1024 });
  if (run.status !== 0) {
    process.stderr.write(run.stderr);
    process.exit(1);
  }
  const target = join(root, "docs/margin-alignment-2026-10-18.md");
  if (process.argv.includes("--stdout")) process.stdout.write(run.stdout);
  else { writeFileSync(target, run.stdout); console.log(`Wrote ${target}`); }
} finally {
  rmSync(out, { recursive: true, force: true });
}
