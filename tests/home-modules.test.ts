import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync, existsSync } from "node:fs";
import { HOME_MODULES } from "@/lib/home-modules";
import { findPage } from "@/lib/site-pages";
test("home modules point to existing factual pages for all fourteen requested capabilities",()=>{
 assert.equal(HOME_MODULES.length,14);assert.equal(new Set(HOME_MODULES.map(capability=>capability.name)).size,14);
 for(const capability of HOME_MODULES){const parts=capability.href.split("/");const section=parts[1];if(section!=="platform"&&section!=="proof"&&section!=="for")throw Error("Unexpected section");assert.ok(findPage(section,parts[2])||existsSync("app"+capability.href+"/page.tsx"),capability.href);assert.ok(capability.body.length>30);}
});
test("home keeps the real headline and demo, removes stale Zoom gap and delivery deadline",()=>{
 const page=readFileSync("app/page.tsx","utf8");
 for(const words of ["Your store.","Stripe.","Your money.","See the live demo"])assert.ok(page.includes(words),words);
 const platform=readFileSync("app/platform/page.tsx","utf8");
 assert.ok(page.includes('href="/platform#home-modules-heading"'));
 assert.ok(platform.includes('href="/pricing#calculator-heading"'));
 assert.doesNotMatch(page,/Zoom links made for each booking|confirmation reaches them by email within minutes/);
 assert.ok(platform.includes("HOME_MODULES.map"));
 assert.ok(!page.includes("HOME_MODULES.map"));
});
test("studio capture uses local synthetic demo facts and never opens an external session",()=>{
 const capture=readFileSync("tests/e2e/home-studio-capture.mjs","utf8");
 assert.ok(capture.includes('"127.0.0.1"'));assert.ok(capture.includes("140000"));
 const seed=readFileSync("tests/e2e/store-copy-seed.ts","utf8");
 assert.ok(seed.includes('home-demo@example.test'));assert.ok(seed.includes("DEMO_PRODUCT,...DEMO_EXTRAS"));
});
