import assert from "node:assert/strict";
import test from "node:test";
import {templateLibraryCards} from "@/lib/template-library";
import {matchingLibrary,libraryDestination} from "@/lib/template-library-rules";
import {PAGE_TEMPLATES} from "@/lib/sales-page";
import {MAIL_TEMPLATES} from "@/lib/mail-body";
import {FUNNEL_STARTERS} from "@/lib/funnel-starters";
test("library uses canonical models, distinct identities, and conjunctive objective/type/search filters",()=>{
 const cards=templateLibraryCards({fromName:"Synthetic creator",storeLink:"https://example.test",ordersLink:"https://example.test/orders",product:null,paidCount:0});
 assert.equal(cards.length,PAGE_TEMPLATES.length+MAIL_TEMPLATES.length+FUNNEL_STARTERS.length+2);
 assert.equal(new Set(cards.map(card=>card.kind+":"+card.id)).size,cards.length);
 for(const card of cards){assert.ok(card.preview.length);assert.ok(card.preview.every(text=>typeof text==="string"&&text.length>0));}
 const welcome=matchingLibrary(cards,"leads","sequence","welcome");assert.equal(welcome.length,1);assert.equal(welcome[0].id,"welcome");
 assert.equal(matchingLibrary(cards,"sales","sequence","welcome").length,0);
 assert.equal(matchingLibrary(cards,"all","all","not-a-template-928337").length,0);
 for(const card of cards){const url=new URL(libraryDestination(card,"store/value","product & value"),"https://example.test");assert.equal(url.searchParams.get("store"),"store/value");assert.equal(url.searchParams.get("product"),"product & value");assert.ok(["/studio/pages","/studio/email","/studio/funnels"].includes(url.pathname));assert.equal(url.searchParams.has("active"),false);}
 const funnel=cards.find(card=>card.kind==="funnel")!;assert.equal(new URL(libraryDestination(funnel,"sid"),"https://example.test").hash,"#starter="+encodeURIComponent(funnel.id));
});
