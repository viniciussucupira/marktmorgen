/**
 * The registry of every metered feature's worst month
 * (tests/plan-cost-registry.ts) cannot fall behind the code: a feature that
 * adds a counter or a limit constant fails here until it says where its cost
 * is counted, and a line whose sources moved fails until it points at them
 * again. Added 17 October 2026, when the per-plan model was found to leave
 * out every feature merged that day.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync, existsSync } from "node:fs";
import { join } from "node:path";
import { COST_LINES, NOT_A_COST, OPEN, SCOPES } from "./plan-cost-registry";
import { TIERS } from "@/lib/plan";
import { PAID_VIDEO_HOURS } from "@/lib/video-admission-rules";
import { VIDEO_HOURS_INCLUDED } from "@/lib/watch-rules";

const root = process.cwd();
const read = (file: string) => readFileSync(join(root, file), "utf8");

function walk(dir: string, out: string[] = []): string[] {
  for (const name of readdirSync(join(root, dir))) {
    const path = `${dir}/${name}`;
    if (statSync(join(root, path)).isDirectory()) walk(path, out);
    else if (/\.(ts|tsx)$/.test(name)) out.push(path);
  }
  return out;
}
const code = ["app", "lib", "components"].flatMap((dir) => walk(dir));

/** Every scope a counter is called with, as tests/plan-cost-registry.ts names them. */
function scopesInCode(): Map<string, string[]> {
  const found = new Map<string, string[]>();
  const add = (scope: string, file: string) => found.set(scope, [...(found.get(scope) ?? []), file]);
  for (const file of code) {
    const text = read(file);
    for (const m of text.matchAll(/\bwithin(?:Limit|Month)\(([^,]+),/g)) {
      const literals = [...m[1].matchAll(/"([^"]+)"/g)].map((l) => l[1]);
      if (literals.length) for (const l of literals) add(l, file);
      else add(`<dynamic:${m[1].trim()}>`, file);
    }
    for (const m of text.matchAll(/\bcountUse\(([^,]+),/g)) add(`countUse:${m[1].trim().slice(0, 60)}`, file);
  }
  return found;
}

const ids = new Set(COST_LINES.map((line) => line.id));
const openIds = new Set(OPEN.map((item) => item.id));

test("every line has a unique id, a figure for every plan, and sources that hold what it names", () => {
  assert.equal(ids.size, COST_LINES.length);
  for (const line of COST_LINES) {
    for (const tier of TIERS) {
      const usd = line.monthlyUsd(tier);
      assert.ok(Number.isFinite(usd) && usd >= 0, `${line.id}, ${tier}: ${usd}`);
    }
    assert.ok(line.sources.length > 0, `${line.id} names no source`);
    for (const source of line.sources) {
      assert.ok(existsSync(join(root, source.file)), `${line.id}: ${source.file} is not there`);
      const text = read(source.file);
      for (const name of source.names) assert.ok(text.includes(name), `${line.id}: ${source.file} does not hold ${name}`);
    }
  }
});

test("every counter in the code is classified: counted in a line, an account or provider guard, or an open item", () => {
  const found = scopesInCode();
  const missing = [...found.keys()].filter((scope) => !Object.hasOwn(SCOPES, scope));
  assert.deepEqual(missing.map((scope) => `${scope} (${found.get(scope)!.join(", ")})`), [], "classify each in SCOPES of tests/plan-cost-registry.ts, with the line its cost is in or an OPEN item");
  for (const [scope, kind] of Object.entries(SCOPES)) {
    if ("line" in kind) assert.ok(ids.has(kind.line), `${scope}: no line ${kind.line}`);
    if ("open" in kind) assert.ok(openIds.has(kind.open), `${scope}: no open item ${kind.open}`);
    if ("guard" in kind) assert.ok(kind.guard.length > 10, `${scope}: say why it is a guard`);
  }
  // A scope that left the code leaves the registry too, so it stays a list of what is there.
  const gone = Object.keys(SCOPES).filter((scope) => !found.has(scope));
  assert.deepEqual(gone, [], "remove scopes no longer in the code");
});

test("every exported limit or cost constant in lib/ is cited by a line, an open item or NOT_A_COST", () => {
  const metered = /(_PER_(DAY|HOUR|MINUTE|MONTH|30_DAYS|STORE|SHARE|TEN_MINUTES)|DAILY|MONTHLY|_INCLUDED|^WORST_|WORST_|ALLOWANCES?$|_LIMITS$|_BY_TIER)/;
  const cited = new Set([
    ...COST_LINES.flatMap((line) => line.sources.flatMap((s) => s.names)),
    ...OPEN.flatMap((item) => item.names ?? []),
    ...Object.keys(NOT_A_COST),
  ]);
  const uncited: string[] = [];
  for (const file of code.filter((f) => f.startsWith("lib/"))) {
    for (const m of read(file).matchAll(/^export const ([A-Z][A-Z0-9_]+)\b/gm)) {
      if (metered.test(m[1]) && !cited.has(m[1])) uncited.push(`${m[1]} (${file})`);
    }
  }
  assert.deepEqual(uncited, [], "cite each in a line's sources, an OPEN item's names, or NOT_A_COST with the reason");
});

test("the features merged on October 17, 2026 are each a line of the worst month", () => {
  for (const id of ["workflows", "imports", "clickfunnels", "funnel-share", "collections", "embed", "ai", "team-scheduling", "orders", "visits"]) assert.ok(ids.has(id), id);
});

test("lesson video's legacy invoice line stays out of reach: admission stops at every plan's hours first", () => {
  for (const tier of TIERS) assert.ok(PAID_VIDEO_HOURS[tier] < VIDEO_HOURS_INCLUDED, tier);
});

test("nothing is billed for visits or orders: the daily job settles neither, and their meters owe nothing", () => {
  const job = read("app/api/cron/usage/route.ts");
  assert.doesNotMatch(job, /settleAllVisits|settleAllOrders|visitsOwedCents|ordersOwedCents/);
  for (const file of ["lib/traffic-billing.ts", "lib/orders-billing.ts"]) {
    const text = read(file);
    assert.match(text, /owed: \(\) => 0,/, file);
    assert.doesNotMatch(text, /settleUsage|settleAllUsage/, file);
  }
});
