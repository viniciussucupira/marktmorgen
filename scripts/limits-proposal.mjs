/**
 * Writes docs/limits-proposal-2026-10-18.md (a PROPOSAL: no limit in code changes) from tests/limits-proposal-table.ts,
 * with the same wiring the test runner uses (tests/test-config.mjs), so the
 * document's figures are never typed. tests/limits-proposal.test.ts fails
 * when the file on disk is not what this writes.
 *
 *   node scripts/limits-proposal.mjs
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
const out = mkdtempSync(join(tmpdir(), "limits-proposal-"));
try {
  const bundle = join(out, "render.cjs");
  await build({
    stdin: {
      contents: `import { renderLimitsProposal } from "./limits-proposal-table";\nimport { PLANS_ON_SALE } from "@/lib/opening";\n// AI captions are charged only to a store with an active subscription, so they are on sale exactly when the plans are.\nprocess.stdout.write(renderLimitsProposal(PLANS_ON_SALE, PLANS_ON_SALE));\n`,
      resolveDir: here,
      loader: "ts",
    },
    bundle: true,
    platform: "node",
    format: "cjs",
    outfile: bundle,
    logLevel: "error",
    alias: testAliases("limits-proposal.test.ts", root, here),
  });
  const run = spawnSync(process.execPath, [bundle], { encoding: "utf8", env: testEnvironment(process.env), maxBuffer: 16 * 1024 * 1024 });
  if (run.status !== 0) {
    process.stderr.write(run.stderr);
    process.exit(1);
  }
  const target = join(root, "docs/limits-proposal-2026-10-18.md");
  writeFileSync(target, run.stdout);
  console.log(`Wrote ${target}`);
} finally {
  rmSync(out, { recursive: true, force: true });
}
