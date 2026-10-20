import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync,readdirSync } from "node:fs";
import { join } from "node:path";
import { NEW_CREATOR_PAGES, CREATOR_PHOTOS, CREATOR_PHOTO_LICENSE } from "@/lib/creator-situations";
import { findPage } from "@/lib/site-pages";
import sitemap from "@/app/sitemap";
function files(folder:string):string[]{return readdirSync(folder,{withFileTypes:true}).flatMap(entry=>entry.isDirectory()?files(join(folder,entry.name)):/\.(?:ts|tsx)$/.test(entry.name)?[join(folder,entry.name)]:[]);}
test("new situations preserve existing creator routes and add four real indexed product paths",()=>{
 for(const slug of ["coaches","cooks","fitness","designers"])assert.ok(findPage("for",slug),slug);
 assert.equal(NEW_CREATOR_PAGES.length,4);
 assert.equal(new Set(NEW_CREATOR_PAGES.map(page=>page.slug)).size,4);
 assert.equal(new Set(NEW_CREATOR_PAGES.map(page=>page.photo?.id)).size,4);
 for(const page of NEW_CREATOR_PAGES){
  assert.equal(findPage("for",page.slug)?.title,page.title);
  assert.ok(sitemap().some(entry=>entry.url.endsWith("/for/"+page.slug)));
  assert.ok(page.blocks.some(block=>block.kind==="ladder"));
  const store=page.blocks[0];assert.ok(store.kind==="storecard");
  assert.equal(store.photo,undefined);assert.match(store.example!,/not a customer or a live store/);
  for(const block of page.blocks)if(block.kind==="ladder")for(const step of block.items){assert.ok(step.href.startsWith("/"));assert.ok(step.price);}
 }
});
test("each new photograph has its own source, license date and no repeated source thumbnail",()=>{
 const ids=Object.values(CREATOR_PHOTOS).map(photo=>photo.id);assert.equal(new Set(ids).size,4);
 const sources=["app","components","lib"].flatMap(files).map(path=>readFileSync(path,"utf8"));
 for(const photo of Object.values(CREATOR_PHOTOS)){
  assert.match(photo.source,/^https:\/\/unsplash\.com\//);assert.ok(photo.author);assert.ok(photo.alt.length>20);
  assert.equal(sources.reduce((sum,source)=>sum+source.split(photo.id).length-1,0),1,photo.id+" must be declared once, without a duplicate thumbnail");
 }
 assert.equal(CREATOR_PHOTO_LICENSE.readOn,"2026-10-20");
 const renderer=readFileSync("components/topic-page.tsx","utf8");
 assert.ok(renderer.includes('https://images.unsplash.com/'));assert.ok(renderer.includes('A licensed photograph of somebody at work, not a customer of ours.'));
 assert.doesNotMatch(renderer,/from "next\/image"/);
});
test("newsletter and consultancy scope is explicit without fabricated outcomes",()=>{
 const newsletter=JSON.stringify(findPage("for","newsletter-writers"));const consulting=JSON.stringify(findPage("for","consultants-and-mentors"));
 assert.match(newsletter,/not.*claim.*paywall/i);assert.match(newsletter,/permission|consent/);
 assert.match(consulting,/due date is not an automatic debit/);assert.match(consulting,/not a guarantee of legal enforceability/);
 for(const page of NEW_CREATOR_PAGES)assert.doesNotMatch(JSON.stringify(page),/guaranteed revenue|double your|scale your business|verified customer/i);
});
