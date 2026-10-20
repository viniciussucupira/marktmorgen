import assert from "node:assert/strict";
import test from "node:test";
import {measureSalesLevers,salesLeverSettings} from "@/lib/sales-levers";
import {claimHandle,storeForEmail,addProduct} from "@/lib/store";
import {store as redis} from "./redis-stub";
const now=Date.parse("2026-10-20T12:00:00Z");
const sale=(meta:Record<string,string>,cents=1200,upsell=false,currency="usd")=>({created:now-60000,cents,currency,upsell,row:{metadata:meta}});
test("only actual tagged payments are shown; line allocation and missing attribution stay unknown",()=>{
 const reading=measureSalesLevers([sale({bump:"extra001"}),sale({bundle:"inside001"},2400),sale({kind:"upsell"},500,true),sale({bump:"extra001"},9900,false,"eur")],"usd",false,now);
 assert.equal(reading.rows.bump.cents,1200);
 assert.match(reading.rows.bump.scope,/Whole checkout/);
 assert.equal(reading.rows.upsell.cents,500);
 assert.match(reading.rows.upsell.scope,/including downsells/);
 assert.equal(reading.rows.downsell.cents,null);assert.equal(reading.rows.next.cents,null);
 assert.equal(reading.rows.bundle.cents,2400);
 assert.equal(measureSalesLevers([],"usd",false,now).rows.upsell.cents,null);
 assert.equal(measureSalesLevers([sale({kind:"upsell"},500,true)],"usd",true,now).rows.upsell.cents,null);
});
test("reviewing lever settings cannot enable paid/opted-out features or contact a provider",async()=>{
 redis.clear();await claimHandle("levers@example.test","leversfixture","Synthetic levers","");
 const store=(await storeForEmail("levers@example.test"))!;const before=JSON.stringify(store);
 const settings=salesLeverSettings(store);assert.equal(settings.length,6);
 assert.match(settings.find(s=>s.key==="recovery")!.state,/Off/);assert.match(settings.find(s=>s.key==="next")!.state,/Off/);
 assert.equal(JSON.stringify(store),before);
 const product=await addProduct("levers@example.test","Synthetic product","","12");assert.ok(product.ok);
 assert.match(salesLeverSettings(product.store).find(s=>s.key==="upsell")!.state,/No visible/);
});
