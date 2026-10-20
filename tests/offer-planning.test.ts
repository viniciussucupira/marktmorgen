import assert from "node:assert/strict";
import test from "node:test";
import {proposeOfferPlan,type OfferPlanningProduct} from "@/lib/offer-planning";
const p=(id:string,priceCents:number,category:"course"|"other"="other",eligible=true):OfferPlanningProduct=>({id,title:id,priceCents,category,eligible});
test("copilot uses only observed own-category prices and leaves original offers untouched",()=>{
 const products=[p("main",1000),p("a",2000),p("b",4000),p("different-category",99999,"course"),p("hidden",1,"other",false),p("invalid",NaN)];
 const before=JSON.stringify(products);
 const plan=proposeOfferPlan({productId:"main",products,candidates:[{id:"main",title:"same",priceCents:1},{id:"offer",title:"Optional workbook",priceCents:500}],oneClickAvailable:true,pageAvailable:true})!;
 assert.equal(plan.priceCents,2000);assert.equal(plan.basis,"own-category");assert.equal(plan.comparisonCount,2);assert.deepEqual(plan.observedRange,[2000,4000]);
 assert.equal(plan.companion?.id,"offer");assert.ok(plan.steps.some(step=>step.includes("buyer can decline")));assert.equal(JSON.stringify(products),before);
});
test("missing comparables keep the current price; gated offers never become planned one-click operations",()=>{
 const plan=proposeOfferPlan({productId:"main",products:[p("main",1700)],candidates:[{id:"other",title:"Not available",priceCents:500}],oneClickAvailable:false,pageAvailable:false})!;
 assert.equal(plan.priceCents,1700);assert.equal(plan.basis,"current");assert.equal(plan.observedRange,null);assert.equal(plan.companion,null);
 assert.ok(plan.conditions.some(text=>text.includes("unavailable")));assert.ok(plan.steps.some(text=>text.includes("role does not allow")));
 for(const price of [0,-1,NaN,Infinity,Number.MAX_SAFE_INTEGER+1])assert.equal(proposeOfferPlan({productId:"main",products:[p("main",price)],candidates:[],oneClickAvailable:true,pageAvailable:true}),null);
 assert.equal(proposeOfferPlan({productId:"missing",products:[p("main",1700)],candidates:[],oneClickAvailable:true,pageAvailable:true}),null);
});
