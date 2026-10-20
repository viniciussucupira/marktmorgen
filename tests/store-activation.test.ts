import assert from "node:assert/strict";
import test from "node:test";
import {activationTiming} from "@/lib/store-activation";
import {claimHandle,storeForEmail,addProduct,setProductHidden} from "@/lib/store";
import {keepStoreSetup} from "@/lib/store-setup";
import {KIND} from "@/lib/catalog";
import {store as redis} from "./redis-stub";
test("activation records only explicit publication, preserves the first timestamp and never calls a provider",async()=>{
 redis.clear();const owner="activation@example.test";let calls=0;
 const before=globalThis.fetch;globalThis.fetch=(async()=>{calls++;throw new Error("unexpected provider");}) as typeof fetch;
 try{
 await claimHandle(owner,"activationfixture","My own name","");let store=(await storeForEmail(owner))!;
 assert.equal(store.activationTracked,true);
 assert.equal(activationTiming(store).state,"waiting");
 await keepStoreSetup(owner,store,{bio:"My own bio",products:[{title:"A draft",summary:"Review before publishing",price:"12",kind:"download"}]});
 store=(await storeForEmail(owner))!;assert.equal(store.catalog.items.length,1);
 assert.equal(store.catalog.items[0].kind&KIND.hidden,KIND.hidden);assert.equal(store.firstOfferPublishedAt,undefined);
 const id=store.catalog.items[0].id;await setProductHidden(owner,id,false);store=(await storeForEmail(owner))!;
 assert.ok(store.firstOfferPublishedAt);const first=store.firstOfferPublishedAt;
 assert.equal(activationTiming(store).state,"published");
 await setProductHidden(owner,id,true);await setProductHidden(owner,id,false);
 assert.equal((await storeForEmail(owner))!.firstOfferPublishedAt,first);
 const extra=await addProduct(owner,"Another hidden draft","","12",null,null,true);assert.ok(extra.ok);assert.equal(extra.product.hidden,true);
 assert.equal(calls,0);
 }finally{globalThis.fetch=before;}
});
test("historic or invalid activation timing stays unknown, never zero",()=>{
 const catalog={items:[],head:[],id:"fixture",inline:null};
 const base={createdAt:"2026-10-20T12:00:00Z",activationTracked:true,catalog};
 assert.equal(activationTiming(base,Date.parse("2026-10-20T12:12:00Z")).minutes,12);
 assert.equal(activationTiming({...base,activationTracked:false}).minutes,null);
 assert.equal(activationTiming({...base,createdAt:"invalid"}).state,"unknown");
 assert.equal(activationTiming({...base,firstOfferPublishedAt:"2020-01-01T00:00:00Z"}).state,"unknown");
});
