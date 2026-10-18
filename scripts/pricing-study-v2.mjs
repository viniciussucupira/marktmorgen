/**
 * Writes the files of the pricing study v2 (an ANALYSIS: no price, limit,
 * gate, commission switch or tax assumption in code changes):
 *
 *   1. docs/pricing-study-v2-input-2026-10-18.json, from
 *      tests/pricing-study-v2-table.ts studyInput() (the repository's own
 *      margin code and the sourced dataset), with the test runner's wiring;
 *   2. docs/pricing-study-v2-output-2026-10-18.json, by running
 *      scripts/pricing-study-v2.py (scipy.optimize.milp and linprog, HiGHS;
 *      about an hour on two cores);
 *   3. docs/pricing-study-v2-2026-10-18.md, from renderPricingStudyV2(),
 *      which checks every plan again with the repository's code.
 *
 * tests/pricing-study-v2.test.ts fails when any of them is stale.
 *
 *   node scripts/pricing-study-v2.mjs            # all three
 *   node scripts/pricing-study-v2.mjs --render   # the document only, from the output already written
 *   node scripts/pricing-study-v2.mjs --input    # the program's input only
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
const out = mkdtempSync(join(tmpdir(), "pricing-study-v2-"));
const renderOnly = process.argv.includes("--render");
const inputOnly = process.argv.includes("--input");

async function run(contents) {
  const bundle = join(out, `run-${Math.random().toString(36).slice(2)}.cjs`);
  await build({
    stdin: { contents, resolveDir: here, loader: "ts" },
    bundle: true, platform: "node", format: "cjs", outfile: bundle, logLevel: "error",
    alias: testAliases("pricing-study-v2.test.ts", root, here),
  });
  const r = spawnSync(process.execPath, [bundle], { cwd: root, encoding: "utf8", env: testEnvironment(process.env), maxBuffer: 256 * 1024 * 1024 });
  if (r.status !== 0) { process.stderr.write(r.stderr); process.exit(1); }
  return r.stdout;
}

try {
  if (!renderOnly) {
    const input = await run(`import { studyInput } from "./pricing-study-v2-table"; process.stdout.write(JSON.stringify(studyInput(), null, 1) + "\\n");`);
    writeFileSync(join(root, "docs/pricing-study-v2-input-2026-10-18.json"), input);
    if (inputOnly) { console.log("Wrote docs/pricing-study-v2-input-2026-10-18.json"); process.exit(0); }
    const py = spawnSync("python3", [join(root, "scripts/pricing-study-v2.py")], { cwd: root, stdio: "inherit" });
    if (py.status !== 0) process.exit(1);
  }
  const doc = await run(`import { renderPricingStudyV2 } from "./pricing-study-v2-table"; process.stdout.write(renderPricingStudyV2());`);
  writeFileSync(join(root, "docs/pricing-study-v2-2026-10-18.md"), doc);
  console.log("Wrote docs/pricing-study-v2-2026-10-18.md");
} finally {
  rmSync(out, { recursive: true, force: true });
}
