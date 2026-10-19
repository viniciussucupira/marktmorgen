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
const nextCli = join(root, "node_modules/next/dist/bin/next");
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
  const { session, second, abProduct, abStore } = JSON.parse(seeded.said.trim().split("\n").at(-1));

  if (BUILD) {
    const built = await run(process.execPath, [nextCli, "build"]);
    if (built.status !== 0) throw new Error(`the app did not build:\n${built.said.slice(-3000)}`);
  }
  app = spawn(process.execPath, [nextCli, "start", "-p", String(APP)], { cwd: root, env, stdio: ["ignore", "pipe", "pipe"], detached: process.platform !== "win32" });
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
  await open(owner,LOCAL+"/studio?store="+second);
  const studioReminder=owner.locator('aside[aria-labelledby="path-studio-reminder-title"]');
  is("an owner sees the unvisited-day reminder",await studioReminder.isVisible(),true);
  is("reminder keeps the selected store",await studioReminder.getByRole("link",{name:"Open your Path",exact:true}).getAttribute("href"),"/studio/path?store="+second);
  for(const width of [390,1280]) {
    await owner.setViewportSize({width,height:900});
    await owner.addScriptTag({content:axeSource});
    is("studio Path reminder at "+width+": axe",await owner.evaluate(async()=>(await window.axe.run('aside[aria-labelledby="path-studio-reminder-title"]',{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22a","wcag22aa"]}})).violations.map(v=>v.id)),[]);
    is("studio Path reminder at "+width+": fits",await studioReminder.evaluate(node=>node.scrollWidth<=node.clientWidth),true);
  }
  await studioReminder.getByRole("link",{name:"Open your Path",exact:true}).click();
  await owner.getByRole("heading",{name:"Your next mission",exact:true}).waitFor();
  await open(owner,LOCAL+"/studio?store="+second);
  is("opening Path removes today's studio reminder",await owner.locator('aside[aria-labelledby="path-studio-reminder-title"]').count(),0);
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
  // Campaign discovery must stay local; only choosing one starts a metered
  // server preview. Exercise its real import route with a form-only campaign.
  await open(owner, `${LOCAL}/studio/funnels`);
  let previews = 0;
  owner.on("request", (request) => {
    if (request.url().includes("/api/store/funnel-share") && request.method() === "POST") previews += 1;
  });
  await owner.getByLabel("What do you want to do?").selectOption("sales");
  await owner.getByLabel("Find a campaign").fill("digital toolkit");
  await owner.getByRole("button", { name: "See the journey and what you need", exact: true }).click();
  is("campaign requirements come from the actual bundle", await owner.getByText("Your download or toolkit (paid)", { exact: true }).isVisible(), true);
  is("the journey is keyboard accessible", await owner.getByRole("button", { name: "Hide the journey", exact: true }).getAttribute("aria-expanded"), "true");
  await owner.getByLabel("Find a campaign").fill("no-such-campaign");
  is("unmatched search can be reset", await owner.getByText("No campaigns match these filters.", { exact: true }).isVisible(), true);
  await owner.getByRole("button", { name: "Show all campaigns", exact: true }).click();
  is("browsing spends no server previews", previews, 0);
  await owner.getByRole("button", { name: "Set up the Build a launch waitlist campaign", exact: true }).click();
  await owner.getByLabel("Name, for you", { exact: true }).waitFor();
  is("choosing a campaign starts one server preview", previews, 1);
  await owner.getByLabel("Name, for you", { exact: true }).fill("Browser waitlist campaign");
  await owner.getByRole("button", { name: "Bring it in as a draft", exact: true }).click();
  await owner.getByText("Made as a draft. It is in the list above, off, with its pages kept back.", { exact: true }).waitFor();
  // A success notice precedes router.refresh(). Read a fresh page to prove
  // persistence rather than racing the asynchronous refresh of the list.
  await owner.reload({ waitUntil: "networkidle" });
  const savedCampaign = owner.locator("#fs-funnel option").filter({ hasText: /^Browser waitlist campaign$/ });
  await savedCampaign.waitFor({ state: "attached" });
  is("a new waitlist campaign is saved by the real import", await savedCampaign.count(), 1);
  const nextCheck=owner.locator('details[aria-label="Suggested next funnel check"]').first();
  const nextSummary=nextCheck.locator("summary");
  await nextSummary.focus();
  await owner.keyboard.press("Enter");
  is("next funnel check opens with keyboard",await nextCheck.getAttribute("open"),"");
  is("next funnel check explains its limits",await nextCheck.getByText("Suggested order for manual checks, from saved configuration and approximate counts. This is not a forecast or an experiment result.",{exact:true}).isVisible(),true);
  await open(owner, `${LOCAL}/studio/path`);
  await owner.getByRole("textbox", {name:"Your skills"}).fill("Baking");
  await owner.getByRole("textbox", {name:"Your subject"}).fill("Sourdough");
  await owner.getByRole("button", {name:"Start your Path",exact:true}).click();
  await owner.getByRole("heading", {name:"Your next mission",exact:true}).waitFor();
  is("Path explains live sales availability",await owner.getByRole("heading",{name:"Live sales are not available yet",exact:true}).isVisible(),true);
  is("Path explains its current payment coverage",await owner.getByText("Path currently verifies Stripe orders. PayPal sales do not update its sale mission or levels yet.",{exact:true}).isVisible(),true);
  is("Path records published store facts", await owner.getByRole("heading", {name:"First Light",exact:true}).count(), 1);
  is("Path never asks to tick completion", await owner.locator('section[aria-labelledby="path-missions"] input[type="checkbox"], section[aria-labelledby="path-next"] input[type="checkbox"]').count(), 0);
  await owner.reload({waitUntil:"networkidle"});
  is("Path persists the answers", await owner.locator('input[name="subject"]').inputValue(), "Sourdough");
  const boardConsent=owner.getByLabel("Share my recorded mission count, a generated pseudonym and the reading time with other Path owners on the board.",{exact:true});
  is("board starts with unchecked explicit consent",await boardConsent.isChecked(),false);
  is("joining is disabled without consent",await owner.getByRole("button",{name:"Join the mission board",exact:true}).isDisabled(),true);
  is("API refuses missing board consent",await owner.evaluate(async()=>{const r=await fetch("/api/store/path",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({action:"board_join"})});return r.status;}),400);
  await boardConsent.check();
  await owner.getByRole("button",{name:"Join the mission board",exact:true}).click();
  await owner.getByRole("button",{name:"Leave the mission board",exact:true}).waitFor();
  await owner.getByRole("table",{name:"Recorded mission counts and their reading times"}).waitFor();
  is("board uses a generated alias",await owner.locator('section[aria-labelledby="path-board-title"]').getByText(/Creator [0-9a-f]{12}/).count()>0,true);
  await owner.reload({waitUntil:"networkidle"});
  is("board participation persists",await owner.getByRole("button",{name:"Leave the mission board",exact:true}).isVisible(),true);
  const postMission=owner.locator('section[aria-labelledby="path-missions"] > ul > li').filter({has:owner.getByRole("heading",{name:"Make 3 post links",exact:true})});
  is("partial post progress is shown",await postMission.getByText("0 of 3 recorded",{exact:true}).isVisible(),true);
  is("the progress meter has its verified count",await postMission.getByRole("progressbar").getAttribute("value"),"0");
  const stepToggle=postMission.locator("summary");
  await stepToggle.focus();
  await owner.keyboard.press("Enter");
  is("mission steps open with the keyboard",await postMission.locator("details").getAttribute("open"),"");
  is("the mission links to its own store",await postMission.getByRole("link",{name:"Share the store: posts",exact:true}).getAttribute("href"),"/studio?store="+(new URL(await owner.getByRole("link",{name:"Back to the studio",exact:true}).getAttribute("href"),LOCAL)).searchParams.get("store")+"#details");
  is("opening steps does not complete the mission",await postMission.getByText("Ready when you are",{exact:true}).isVisible(),true);
  await owner.keyboard.press("Enter");
  const campaignLink=owner.getByRole("link",{name:"Explore campaigns for this mission",exact:true});
  const campaignUrl=new URL(await campaignLink.getAttribute("href"),LOCAL);
  const beforeCampaignPreviews=previews;
  await campaignLink.click();
  await owner.getByLabel("What do you want to do?").waitFor();
  is("Path opens the sales campaign goal",await owner.getByLabel("What do you want to do?").inputValue(),"sales");
  is("campaign discovery keeps the Path store",new URL(owner.url()).searchParams.get("store"),campaignUrl.searchParams.get("store"));
  is("campaign discovery creates no preview",previews,beforeCampaignPreviews);
  await open(owner,LOCAL+campaignUrl.pathname+"?store="+campaignUrl.searchParams.get("store")+"&campaignGoal=leads#campaign-starters");
  is("lead campaigns can be opened directly",await owner.getByLabel("What do you want to do?").inputValue(),"leads");
  await open(owner,LOCAL+campaignUrl.pathname+"?store="+campaignUrl.searchParams.get("store")+"&campaignGoal=unknown#campaign-starters");
  is("invalid campaign goals fall back to all",await owner.getByLabel("What do you want to do?").inputValue(),"all");
  await open(owner,LOCAL+"/studio/path?store="+campaignUrl.searchParams.get("store"));
  is("sales sharing starts switched off",await owner.getByLabel("Include sales kept after refunds",{exact:true}).isChecked(),false);
  await owner.getByRole("button",{name:"Send your current mission",exact:true}).click();
  await owner.waitForFunction(()=>Boolean(document.querySelector('section[aria-labelledby="path-reminder-title"] [role="status"]')?.textContent));
  is("a requested reminder has a visible result",await owner.locator('section[aria-labelledby="path-reminder-title"] [role="status"]').isVisible(),true);
  const cardDownload=owner.waitForEvent("download");
  await owner.getByRole("button",{name:"Download card",exact:true}).click();
  const card=await cardDownload;
  is("the owner can download their card",card.suggestedFilename(),"marktmorgen-path.svg");
  const cardStream=await card.createReadStream();
  if(!cardStream)throw new Error("The card download could not be read");
  let cardText="";
  for await(const chunk of cardStream)cardText+=chunk.toString();
  is("the default card keeps sales private",cardText.includes("Sales kept after refunds"),false);
  is("the card contains the reached level",cardText.includes("First Light"),true);
  await owner.getByLabel("Include sales kept after refunds",{exact:true}).check();
  is("sales enter the preview only after explicit choice",await owner.getByText("Sales kept after refunds: $0",{exact:true}).isVisible(),true);
  await owner.getByLabel("Include sales kept after refunds",{exact:true}).uncheck();
  for (const width of [390, 1280]) {
    const ctx = await browser.newContext({ viewport: { width, height: 900 } });
    await ctx.addCookies([{ name: "nl_session", value: session, url: LOCAL }]);
    const page = await ctx.newPage();
    await open(page, `${LOCAL}/studio/copy`);
    await page.getByRole("button", { name: "See what it makes" }).click();
    await page.waitForSelector("ul[aria-label] li");
    is(`copy page at ${width}: no sideways scroll`, await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth), 0);
    await page.addScriptTag({ content: axeSource });
    is(`copy page at ${width}: axe`, await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"] } })).violations.map((v) => v.id)), []);
    await open(page, `${LOCAL}/studio/funnels`);
    await page.getByLabel("Find a campaign").fill("launch waitlist");
    await page.getByRole("button", { name: "See the journey and what you need", exact: true }).click();
    const nextAtWidth=page.locator('details[aria-label="Suggested next funnel check"]').first();
    await nextAtWidth.locator("summary").click();
    // Stress a long unbroken customer title at the actual mobile and desktop widths.
    await nextAtWidth.locator("summary > span").evaluate(node=>{node.textContent="Next check: "+"LongTitle".repeat(20);});
    const sideways = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    await page.addScriptTag({ content: axeSource });
    const found = await page.evaluate(async () => (await window.axe.run(document, { runOnly: { type: "tag", values: ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22a", "wcag22aa"] } })).violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(" ")).join(", ")}`));
    is(`campaign page at ${width}: no sideways scroll`, sideways, 0);
    is(`campaign page at ${width}: axe`, found, []);
    await open(page, `${LOCAL}/studio/path`);
    await page.locator('section[aria-labelledby="path-missions"] summary').first().click();
    await page.addScriptTag({content:axeSource});
    const pathViolations=await page.evaluate(async ()=>(await window.axe.run(document,{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22a","wcag22aa"]}})).violations.map(v=>v.id));
    is(`Path at ${width}: axe`,pathViolations,[]);
    is(`Path at ${width}: no sideways scroll`,await page.evaluate(()=>document.documentElement.scrollWidth-document.documentElement.clientWidth),0);
    await ctx.close();
  }
  const abUrl=LOCAL+"/studio/pages?store="+abStore+"&product="+abProduct+"&test=headline";
  const unavailableText="Test counts are unavailable or inconsistent. No winner is selected from this reading. Use Refresh results to try again. Your unsaved page edits stay here.";
  for(const width of [390,1280]){
    await owner.setViewportSize({width,height:900});
    const unavailableReply=owner.waitForResponse(response=>response.url().includes("/api/store/ab?id="));
    await owner.goto(abUrl,{waitUntil:"domcontentloaded",timeout:60_000});
    is("malformed saved experiment reports HTTP503 at "+width,(await unavailableReply).status(),503);
    const unavailable=owner.getByText(unavailableText,{exact:true});
    await unavailable.waitFor();
    is("experiment failure is visible at "+width,await unavailable.isVisible(),true);
    is("experiment failure does not display a zero tally or winner at "+width,await owner.locator("[data-test-results]").count(),0);
    is("experiment warning fits at "+width,await unavailable.evaluate(node=>node.scrollWidth<=node.clientWidth),true);
    await owner.addScriptTag({content:axeSource});
    is("experiment warning accessibility at "+width,await owner.evaluate(async()=>(await window.axe.run("#headline-test",{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22a","wcag22aa"]}})).violations.map(v=>v.id)),[]);
  }
  // Recovery uses a synthetic, coherent successful response; no payment is made.
  let allocation=0;
  let experimentAgeDays=30;
  let transientFailure=false;
  let holdReading=false;
  let releaseReading;
  let notifyHeldReading;
  let experimentRequests=0;
  await owner.route("**/api/store/ab?**",async route=>{
    experimentRequests++;
    if(holdReading)await new Promise(resolve=>{releaseReading=resolve;notifyHeldReading?.();});
    if(transientFailure)return route.fulfill({status:503,contentType:"application/json",body:JSON.stringify({ok:false,error:"unavailable"})});
    return route.fulfill({status:200,contentType:"application/json",body:JSON.stringify({ok:true,currency:"usd",declared:null,shareB:allocation,counts:{va:1000,vb:1000,ca:30,cb:90,sa:30,sb:90,ra:30000,rb:90000,qa:30000000,qb:90000000,t0:Date.now()-experimentAgeDays*86400000}})});
  });
  await owner.goto(abUrl,{waitUntil:"domcontentloaded",timeout:60_000});
  await owner.getByText(unavailableText,{exact:true}).waitFor();
  is("invalid allocation is not silently replaced with an even split",await owner.locator("[data-test-results]").count(),0);
  allocation=0.5;
  await owner.goto(abUrl,{waitUntil:"domcontentloaded",timeout:60_000});
  await owner.locator("[data-test-results]").waitFor();
  await owner.getByText("The second headline wins. Your page now shows it to everybody. Make it the hero's own headline and switch the test off to keep it.",{exact:true}).waitFor();
  is("a coherent successful reading replaces the failure notice",await owner.getByText(unavailableText,{exact:true}).count(),0);
  const paymentBasisText="Gross buyer payments are measured here, including any tax collected at checkout. Refunds, disputes and payment fees are not deducted. This is not net revenue or profit.";
  for(const width of [390,1280]){
    await owner.setViewportSize({width,height:900});
    for(const age of [1,30]){
      experimentAgeDays=age;
      await owner.goto(abUrl,{waitUntil:"domcontentloaded",timeout:60_000});
      const basis=owner.getByText(paymentBasisText,{exact:true});
      await basis.waitFor();
      is("paid results disclose the actual measurement at "+width+" age "+age,await basis.isVisible(),true);
      is("gross payment basis fits at "+width+" age "+age,await basis.evaluate(node=>node.scrollWidth<=node.clientWidth),true);
      if(age===1)await owner.getByText("One version is ahead, but a test decided by gross payments waits until it has run 14 days. This waiting period does not deduct refunds from either version.",{exact:true}).waitFor();
      else await owner.getByText("The second headline wins. Your page now shows it to everybody. Make it the hero's own headline and switch the test off to keep it.",{exact:true}).waitFor();
      await owner.addScriptTag({content:axeSource});
      is("paid experiment result accessibility at "+width+" age "+age,await owner.evaluate(async()=>(await window.axe.run("#headline-test",{runOnly:{type:"tag",values:["wcag2a","wcag2aa","wcag21a","wcag21aa","wcag22a","wcag22aa"]}})).violations.map(v=>v.id)),[]);
    }
  }
  const secondHeadline=owner.getByLabel("Second headline",{exact:true});
  const originalHeadline=await secondHeadline.inputValue();
  let experimentWrites=0;
  const watchExperimentWrites=request=>{
    if(request.method()!=="GET" && request.url().includes("/api/store/page"))experimentWrites++;
  };
  owner.on("request",watchExperimentWrites);
  for(const width of [390,1280]){
    await owner.setViewportSize({width,height:900});
    const draftHeadline="Keep this unsaved headline "+width;
    await secondHeadline.fill(draftHeadline);
    const requestedBefore=experimentRequests;
    const urlBefore=owner.url();
    transientFailure=true;
    const refresh=owner.getByRole("button",{name:"Refresh results",exact:true});
    await refresh.click();
    await owner.getByText(unavailableText,{exact:true}).waitFor();
    is("failed manual refresh keeps draft at "+width,await secondHeadline.inputValue(),draftHeadline);
    is("one request for manual refresh at "+width,experimentRequests,requestedBefore+1);
    transientFailure=false;
    holdReading=true;
    const heldReading=new Promise(resolve=>{notifyHeldReading=resolve;});
    await refresh.click();
    await heldReading;
    await owner.getByText("Loading test counts…",{exact:true}).waitFor();
    const pendingRefresh=owner.getByRole("button",{name:"Refreshing results…",exact:true});
    is("refresh disabled while reading at "+width,await pendingRefresh.isDisabled(),true);
    is("old winner hidden during refresh at "+width,await owner.locator("[data-test-results]").count(),0);
    await pendingRefresh.evaluate(button=>button.click());
    if(!releaseReading)throw Error("Synthetic delayed experiment was not requested");
    holdReading=false;
    releaseReading();
    releaseReading=undefined;
    await owner.locator("[data-test-results]").waitFor();
    is("retry makes only one extra request at "+width,experimentRequests,requestedBefore+2);
    is("successful retry keeps draft at "+width,await secondHeadline.inputValue(),draftHeadline);
    is("refresh stays on the editor at "+width,owner.url(),urlBefore);
    is("refresh target is at least44 pixels at "+width,await refresh.evaluate(button=>button.getBoundingClientRect().height>=44),true);
    await refresh.focus();
    is("refresh remains keyboard reachable at "+width,await refresh.evaluate(button=>document.activeElement===button),true);
    await secondHeadline.fill(originalHeadline);
  }
  owner.off("request",watchExperimentWrites);
  is("refresh and retry never save the edited page",experimentWrites,0);
  await owner.unroute("**/api/store/ab?**");
  const quotaDir=mkdtempSync(join(tmpdir(),"mm-path-quota-"));
  const quotaFile=join(quotaDir,"quota.cjs");
  await build({entryPoints:[join(here,"path-board-quota.ts")],bundle:true,platform:"node",format:"cjs",outfile:quotaFile,logLevel:"error",alias:{"@":root}});
  const exhausted=await run(process.execPath,[quotaFile]);
  rmSync(quotaDir,{recursive:true,force:true});
  if(exhausted.status!==0)throw new Error("synthetic quota setup failed: "+exhausted.said);
  const pathSid=campaignUrl.searchParams.get("store");
  await open(owner,LOCAL+"/studio/path/privacy?store="+pathSid);
  await owner.getByRole("heading",{name:"Path board privacy",exact:true}).waitFor();
  const privateFile=await owner.evaluate(async sid=>{const r=await fetch("/api/store/path?store="+sid);return {status:r.status,body:await r.json()};},pathSid);
  is("private Path downloads after monthly quota exhaustion",privateFile.status,200);
  is("private export includes the owner's answers",privateFile.body.path.answers.subject,"Sourdough");
  is("private export includes explicit participation",Boolean(privateFile.body.path.board?.token),true);
  is("internal revision is excluded",privateFile.body.path.revision,undefined);
  await owner.getByRole("button",{name:"Leave the mission board",exact:true}).click();
  await owner.getByText("You are not on the mission board.",{exact:true}).waitFor();
  const afterLeave=await owner.evaluate(async sid=>(await fetch("/api/store/path?store="+sid)).json(),pathSid);
  is("withdrawal preserves private Path answers",afterLeave.path.answers.subject,"Sourdough");
  is("withdrawal removes exported membership",afterLeave.path.board,null);
  is("no page threw", errors, []);
} catch (error) {
  failed += 1;
  console.error(error);
  console.error(appLog.slice(-3000));
  if(browser){for(const context of browser.contexts())for(const page of context.pages()){if(page.url().includes("/studio/pages"))console.error("Experiment editor state:",await page.locator("body").innerText().then(text=>text.slice(-6000)).catch(()=>"unreadable"));}}
} finally {
  await browser?.close().catch(() => {});
  if (app?.pid && app.exitCode === null) {
    try {
      if (process.platform === "win32") app.kill("SIGTERM");
      else process.kill(-app.pid, "SIGTERM");
    } catch {}
  }
  await services.close().catch(() => {});
}
console.log(failed ? `\n${failed} failed` : "\nall passed");
process.exit(failed ? 1 : 0);
