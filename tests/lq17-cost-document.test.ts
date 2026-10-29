import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";

test("restored LLC categories regenerate the complete margin document with the actual generator", () => {
 const generated = spawnSync(process.execPath, ["scripts/margin-alignment.mjs", "--stdout"], { cwd: process.cwd(), encoding: "utf8", env: process.env, maxBuffer: 16 * 1024 * 1024 });
 assert.equal(generated.status, 0, generated.stderr);
 assert.equal(generated.stdout, readFileSync("docs/margin-alignment-2026-10-18.md", "utf8"));
 assert.ok(generated.stdout.includes("| itin-and-acceptance-agent | unknown | unknown |"));
 assert.ok(generated.stdout.includes("| us-resident-representative | unknown | unknown |"));
});
