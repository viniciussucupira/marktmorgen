import assert from "node:assert/strict";
import test from "node:test";
import {findPage} from "@/lib/site-pages";
test("Hotmart comparison qualifies payout, branding and ecosystem tradeoffs",()=>{
 const page=findPage("proof","hotmart");assert.ok(page);
 const table=page.blocks.find(b=>b.kind==="table");assert.ok(table&&table.kind==="table");
 const row=(name:string)=>{const found=table.rows.find(r=>r[0]===name);assert.ok(found,name);return found;};
 assert.match(row("Payout timing")[1],/15 calendar days/);
 assert.match(row("Payout timing")[1],/guarantee period/);
 assert.match(row("Payout timing")[2],/does not mean an instant payout/);
 assert.match(row("Branding and domains")[1],/domain customization/);
 assert.match(row("Branding and domains")[2],/DNS|not configured/);
 assert.match(row("Ecosystem and portability")[1],/Hotpay/);
 assert.match(row("Ecosystem and portability")[2],/do not transfer live subscriptions/);
 const links=page.blocks.flatMap(b=>b.kind==="features"?b.items.map(i=>i.href):[]);
 for(const href of ["/platform/domain","https://docs.stripe.com/payouts","https://solutions.hotmart.com/update-your-members-area"])assert.ok(links.includes(href),href);
 for(const href of links.filter((h):h is string=>!!h&&h.startsWith("/platform/")))assert.ok(findPage("platform",href.split("/").at(-1)!));
 assert.match(row("Getting started")[2],/not open yet/);
});
