import assert from "node:assert/strict";
import test from "node:test";
import { centsInput,countInput,quoteLine,quoteOwn,type StackLine } from "@/lib/tools-calculator";
import { PUBLISHED_PLAN_PRICES } from "@/lib/plan";
const line=(change:Partial<StackLine>={}):StackLine=>({tool:"clickfunnels",planIndex:0,monthlySalesCents:100000,monthlyOrders:10,processingBps:290,processingFixedCents:30,otherMonthlyCents:0,conditionsConfirmed:true,gatewayFeeApplies:null,recurringFeeMode:null,...change});
test("calculator rejects invalid money and transaction counts without turning them into zero",()=>{
 for(const value of [""," ","-1","1e3","NaN","Infinity","1.001","$5"])assert.equal(centsInput(value),null,value);
 assert.equal(centsInput("2.9"),290);assert.equal(centsInput("0"),0);assert.equal(centsInput("0.30"),30);
 for(const value of ["","1.5","-2","1e4"])assert.equal(countInput(value),null,value);
 assert.equal(countInput("10"),10);
 assert.equal(quoteLine(line({monthlyOrders:0}),"month").monthlyCents,null);
 assert.equal(quoteLine(line({monthlySalesCents:-1}),"month").monthlyCents,null);
});
test("calculator counts fixed processing charges by transactions and uses actual annual invoices",()=>{
 const monthly=quoteLine(line(),"month");assert.equal(monthly.subscriptionCents,9700);assert.equal(monthly.paymentCents,3200);assert.equal(monthly.monthlyCents,12900);
 const annual=quoteLine(line(),"year");assert.equal(annual.subscriptionCents,97000/12);
 assert.equal(quoteOwn("creator","year",100000,10,290,30,0),PUBLISHED_PLAN_PRICES.creator.year/12+3200);
 assert.equal(quoteOwn("creator","month",100000,0,290,30,0),null);
});
test("calculator never doubles inclusive Kit or Whop card fees",()=>{
 const kit=quoteLine(line({tool:"kit",processingBps:9900,processingFixedCents:9900}),"month");
 assert.equal(kit.paymentCents,3800);assert.equal(kit.monthlyCents,3800);
 const whop=quoteLine(line({tool:"whop",processingBps:null,processingFixedCents:null,otherMonthlyCents:250}),"month");
 assert.equal(whop.paymentCents,3000);assert.equal(whop.monthlyCents,3250);
});
test("unknown invoices, conflicting fees, transaction bands and unreviewed conditions stay incomplete",()=>{
 for(const tool of ["circle","podia"] as const)assert.equal(quoteLine(line({tool}),"month").monthlyCents,null);
 assert.equal(quoteLine(line({tool:"linktree"}),"month").monthlyCents,null);
 assert.equal(quoteLine(line({tool:"skool",planIndex:1}),"month").paymentCents,null);
 assert.equal(quoteLine(line({tool:"hotmart"}),"month").paymentCents,null);
 assert.equal(quoteLine(line({tool:"teachable"}),"year").subscriptionCents,null);
 assert.equal(quoteLine(line({otherMonthlyCents:null}),"month").monthlyCents,null);
 assert.equal(quoteLine(line({conditionsConfirmed:false}),"month").monthlyCents,null);
 assert.equal(quoteLine(line({processingBps:null}),"month").monthlyCents,null);
});
test("subscription-only selections require explicit other fees and preserve primary source dates",()=>{
 const result=quoteLine(line({tool:"highlevel",monthlySalesCents:0,monthlyOrders:0}),"month");
 assert.equal(result.paymentCents,0);assert.equal(result.monthlyCents,9700);
 for(const source of result.sources){assert.match(source.url,/^https:/);assert.match(source.readOn,/^2026-/);}
});

test("conditional gateway and recurring Billing fees require a choice and are counted once",()=>{
 assert.equal(quoteLine(line({tool:"kajabi"}),"month").monthlyCents,null);
 assert.equal(quoteLine(line({tool:"kajabi",gatewayFeeApplies:true}),"month").paymentCents,5200);
 assert.equal(quoteLine(line({tool:"kajabi",gatewayFeeApplies:false}),"month").paymentCents,3200);
 assert.equal(quoteLine(line({tool:"substack"}),"month").monthlyCents,null);
 const separate=quoteLine(line({tool:"substack",recurringFeeMode:"separate"}),"month");
 const included=quoteLine(line({tool:"substack",processingBps:360,recurringFeeMode:"included"}),"month");
 assert.equal(separate.paymentCents,13900);assert.equal(included.paymentCents,separate.paymentCents);
 const hobby=quoteLine(line({tool:"skool",processingBps:9999,processingFixedCents:9999}),"month");
 assert.equal(hobby.paymentCents,10300);assert.equal(hobby.monthlyCents,11200);
});
