import { build } from "esbuild";
import { join, resolve } from "node:path";
import { execFileSync } from "node:child_process";
const root = resolve(process.argv[2]); const file = process.argv[3];
const out = "/tmp/claude-0/-home-claude-kudobox/d5f171f1-7fbe-5a05-a129-47642ba243a6/scratchpad/one.cjs";
await build({ entryPoints: [join(root, "tests", file)], bundle: true, platform: "node", format: "cjs", outfile: out, logLevel: "error", alias: { "@": root, "@/lib/redis": join(root, "tests", "redis-stub.ts") } });
try { process.stdout.write(execFileSync("node", [out], { cwd: root, encoding: "utf8" })); } catch (e) { process.stdout.write(e.stdout || ""); process.stderr.write(e.stderr || ""); process.exit(1); }
