/**
 * Copying a whole store into another of the account's stores
 * (docs/store-copy.md), in a real browser: the studio's link to it, the page,
 * its preview, the copy run step by step to "Done", and the page at 390 and
 * 1280 with no sideways scroll and nothing axe-core (this project's copy)
 * finds at WCAG 2.0, 2.1 and 2.2 A and AA. What the copy writes is checked
 * field by field in tests/store-copy.test.ts.
 *
 *   node tests/e2e/store-copy.mjs              builds the app, then checks
 *   node tests/e2e/store-copy.mjs --no-build   uses the build already in .next
 *
 * The real app against the stand-in database of tests/e2e/services.mjs, as
 * tests/e2e/agreements.mjs runs it; nothing real is reached. In CI it runs
 * after the production build of the "verify" job.
 */
import { spawn } from "node:child_process";
import { mkdtempSync, readFileSync, rmSync } from "node:fs";
import { createRequire } from "node:module";
import { tmpdir } from "node:os";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { build } from "esbuild";
import { startServices } from "./services.mjs";

const here = dirname(fileURLToPath(import.meta.url));
const root = resolve(here, "../..");
const SERVICES = Number(process.env.E2E_SERVICES_PORT || 4489);
const APP = Number(process.env.E2E_APP_PORT || 3189);
const LOCAL = `http://localhost:${APP}`;
const FAKE = `http://127.0.0.1:${SERVICES}`;
const BUILD = !process.argv.includes("--no-build");

const env = {
  ...process.env,
  UPSTASH_REDIS_REST_URL: FAKE,
  UPSTASH_REDIS_REST_TOKEN: "local",
  RESEND_API_KEY: "re_local_only_a_stand_in",
  RESEND_API_BASE: FAKE,
  NEXT_FONT_GOOGLE_MOCKED_RESPONSES: join(here, "google-fonts-mock.cjs"),
  E2E_FONT_ORIGIN: FAKE,
  NEXT_TELEMETRY_DISABLED: "1",
};

const require = createRequire(join(root, "package.json"));
let chromium;
for (const name of ["playwright", "playwright-core", process.env.PLAYWRIGHT_CORE].filter(Boolean)) {
  try {
    ({ chromium } = require(name));
    break;
  } catch {}
}
if (!chromium) {
  console.error("This needs Playwright or playwright-core on the machine (PLAYWRIGHT_CORE=<its folder> to name one). Nothing was run.");
  process.exit(2);
}
const axeSource = readFileSync(require.resolve("axe-core/axe.min.js"), "utf8");

async function launch() {
  if (process.env.CHROMIUM) return chromium.launch({ executablePath: process.env.CHROMIUM });
  try {
    return await chromium.launch();
  } catch (first) {
    try {
      return await chromium.launch({ channel: "chrome" });
    } catch {
      throw first;
    }
  }
}

let failed = 0;
function is(name, got, want) {
  const same = JSON.stringify(got) === JSON.stringify(want);
  console.log(`  ${same ? "ok  " : "FAIL"}  ${name}`);
  if (!same) {
    failed += 1;
    console.log(`        expected ${JSON.stringify(want)}\n        got      ${JSON.stringify(got)}`);
  }
}

const services = await startServices(SERVICES);
let app = null;
let browser = null;
let appLog = "";
const run = (cmd, args) =>
  new Promise((done) => {
    const child = spawn(cmd, args, { cwd: root, env, stdio: ["ignore", "pipe", "pipe"] });
    let said = "";
    child.stdout.on("data", (chunk) => (said += chunk));
    child.stderr.on("data", (chunk) => (said += chunk));
    child.on("close", (status) => done({ status, said }));
  });

try {
  const out = mkdtempSync(join(tmpdir(), "mm-copy-seed-"));
  const seedFile = join(out, "seed.cjs");
  await build({ entryPoints: [join(here, "store-copy-seed.ts")], bundle: true, platform: "node", format: "cjs", outfile: seedFile, logLevel: "error", alias: { "@": root } });
  // Not spawnSync: the stand-in database it writes to is served by this very process.
  const seeded = await run(process.execPath, [seedFile]);
  rmSync(out, { recursive: true, force: true });
  if (seeded.status !== 0) throw new Error(`the store could not be made:\n${seeded.said}`);
  const { session } = JSON.parse(seeded.said.trim().split("\n").at(-1));

  if (BUILD) {
    const built = await run("npx", ["next", "build"]);
    if (built.status !== 0) throw new Error(`the app did not build:\n${built.said.slice(-3000)}`);
  }
  app = spawn("npx", ["next", "start", "-p", String(APP)], { cwd: root, env, stdio: ["ignore", "pipe", "pipe"], detached: true });
  app.stdout.on("data", (chunk) => (appLog += chunk));
  app.stderr.on("data", (chunk) => (appLog += chunk));
  const started = Date.now();
  while (!(await fetch(`${LOCAL}/@signshop`).then((r) => r.status === 200).catch(() => false))) {
    if (Date.now() - started > 120_000) throw new Error(`the app did not start:\n${appLog.slice(-2000)}`);
    await new Promise((wait) => setTimeout(wait, 1000));
  }

  browser = await launch();
  const errors = [];
  const watch = (page) => page.on("pageerror", (error) => errors.push(String(error)));
  const open = (page, url) => page.goto(url, { waitUntil: "networkidle", timeout: 60_000 });
  const studio = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  await studio.addCookies([{ name: "nl_session", value: session, url: LOCAL }]);
  const owner = await studio.newPage();
  watch(owner);
  await open(owner, `${LOCAL}/studio`);
  is("the studio links to the copy", await owner.getByRole("link", { name: "Copy it into another store" }).count(), 1);
  await open(owner, `${LOCAL}/studio/copy`);
  is("the page names the other store", (await owner.locator("select").innerText()).includes("Second Coaching"), true);
  await owner.getByRole("button", { name: "See what it makes" }).click();
  await owner.waitForSelector("ul[aria-label] li");
  is("the preview says what it makes and what never comes across", [(await owner.locator("ul[aria-label]").innerText()).includes("Makes 3 products"), (await owner.locator("ul[aria-label]").innerText()).includes("Never copied: customers")], [true, true]);
  await owner.getByRole("button", { name: /Copy into/ }).click();
  await owner.waitForFunction(() => document.querySelector('main [role="status"]')?.textContent?.startsWith("Done."), null, { timeout: 60_000 });
  is("the copy runs to the end and says what it made", (await owner.locator('main [role="status"]').innerText()).startsWith("Done. Made in Second Coaching: 3 products"), true);
  await open(owner, `${LOCAL}/studio/path`);
  await owner.getByRole("textbox", {name:"Your skills"}).fill("Baking");
  await owner.getByRole("textbox", {name:"Your subject"}).fill("Sourdough");
  await owner.getByRole("button", {name:"Start your Path",exact:true}).click();
  await owner.getByRole("heading", {name:"Your next mission",exact:true}).waitFor();
  is("Path records published store facts", await owner.getByRole("heading", {name:"First Light",exact:true}).count(), 1);
  is("Path never asks to tick completion", await owner.locator('main input[type="checkbox"]').count(), 0);
  await owner.reload({waitUntil:"networkidle"});
  is("Path persists the answers", await owner.locator('input[name="subject"]').inputValue(), "Sourdough");
  for (const width of [390, 1280]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    await ctx.addCookies([{ name: "nl_session", value: session, url: LOCAL }]);
    const page = await ctx.newPage();
    await open(page, `${LOCAL}/studio/copy`);
    await page.getByRole("button", { name: "See what it makes" }).click();
    await page.waitForSelector("ul[aria-label] li");
    const sideways = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await page.addScriptTag({ content: axeSource });
    const found = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"] } })).violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`));
    is(`copy page at ${width}: no sideways scroll`, sideways, 0);
    is(`copy page at ${width}: axe`, found, []);
    await open(page, `${LOCAL}/studio/path`);
    await page.addScriptTag({content:axeSource});
    const pathViolations=await page.evaluate(async ()=>(await window.axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22a","wcag22aa"]}})).violations.map(v=>v.id));
    is(`Path at ${width}: axe`,pathViolations,[]);
    is(`Path at ${width}: no sideways scroll`,await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),0);
    await ctx.close();
  }
  is("no page threw", errors, []);
} catch (error) {
  failed += 1;
  console.error(error);
  console.error(appLog.slice(-3000));
} finally {
  await browser?.close().catch(() => {});
  if (app?.pid && app.exitCode === null) {
    try {
      process.kill(-app.pid, "SIGTERM");
    } catch {}
  }
  await services.close().catch(() => {});
}
console.log(failed ? `\n${failed} failed` : "\nall passed");
process.exit(failed ? 1 : 0);
