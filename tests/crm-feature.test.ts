import assert from "node:assert/strict";
import test from "node:test";
import { findPage } from "@/lib/site-pages";
import { TIERS, PLAN_TITLES } from "@/lib/plan";
import { PIPELINES_BY_TIER, MAX_CRM_FIELDS, MAX_STAGES, MAX_DEALS } from "@/lib/crm-rules";
import { DATA_ROOM_BYTES, dataWords } from "@/lib/store-data-rules";
import sitemap from "@/app/sitemap";
test("public CRM page states real canonical ceilings and their shared record space",()=>{
 const page=findPage("platform","crm");assert.ok(page);
 assert.equal(page.title+" "+page.highlight,"People, deals and pipelines");
 const table=page.blocks.find(block=>block.kind==="table");assert.ok(table&&table.kind==="table");
 assert.equal(table.rows.length,TIERS.length);
 for(const tier of TIERS){const matched:[string,string,string]|undefined=table.rows.find(cells=>cells[0]===PLAN_TITLES[tier]);assert.ok(matched);assert.equal(matched[1],String(PIPELINES_BY_TIER[tier]));for(const value of [String(MAX_CRM_FIELDS),MAX_DEALS.toLocaleString("en-US"),String(MAX_STAGES),dataWords(DATA_ROOM_BYTES[tier])])assert.ok(matched[2].includes(value),tier+" "+value);}
 assert.ok(table.note?.includes("byte limit"));
});
test("CRM describes recorded facts, scoped email consent and the real channel gap",()=>{
 const page=findPage("platform","crm");assert.ok(page);const text=JSON.stringify(page);
 for(const fact of ["not a forecast","not permission to send marketing","SMS, WhatsApp","not included here","Only your team"])assert.ok(text.includes(fact),fact);
 assert.ok(sitemap().some(entry=>entry.url.endsWith("/platform/crm")));
 const hl=findPage("proof","highlevel");assert.ok(hl);
 assert.ok(JSON.stringify(hl).includes('"/platform/crm"'));
 assert.ok(text.includes('"/proof/highlevel"'));assert.ok(text.includes('"/pricing"'));
});
