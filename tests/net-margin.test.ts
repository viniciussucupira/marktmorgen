import {test} from "node:test";
import assert from "node:assert/strict";
import {assessNetMargin,assessCompanyAndCustomers,maximumUsageCost,minimumCustomerBase} from "@/lib/net-margin-rules";
const base={revenue:100,processing:3,usage:10,support:2,fixedAllocation:5,referralCredits:0,acquisitionAndLosses:0,taxes:20};
test("60 percent after all supplied expenses passes exactly, and a fraction below fails",()=>{assert.equal(assessNetMargin(base).status,"meets_floor");assert.equal(assessNetMargin({...base,usage:10.0001}).status,"below_floor");});
test("missing taxes and overhead never certify net margin",()=>{for(const field of Object.keys(base)){const input={...base};delete (input as Record<string,unknown>)[field];assert.equal(assessNetMargin(input).status,"unverified");}assert.equal(assessNetMargin({...base,revenue:0}).status,"unverified");});
test("tax scenario spends less than the old after-processing contribution test",()=>{const cap=maximumUsageCost(100,3,5,0.21)!;const beforeTax=100-3-5-cap;assert.ok(Math.abs(beforeTax*0.79-60)<1e-9);assert.ok(cap<40);assert.equal(maximumUsageCost(100,3,5,1),null);assert.ok(maximumUsageCost(100,3,5,0.5)!<0);});
test("a profitable company cannot hide a customer below the floor",()=>{assert.equal(assessCompanyAndCustomers({...base,usage:0},[base,{...base,referralCredits:50}]),"below_floor");assert.equal(assessCompanyAndCustomers(base,[base]),"meets_floor");assert.equal(assessCompanyAndCustomers(base,[{...base,taxes:undefined}]),"unverified");assert.equal(assessCompanyAndCustomers(base,[]),"unverified");});

test("minimum base protects the least profitable tier rather than averaging it away",()=>{
  const scenarios=[{tier:"Store",revenue:220/12,processing:.685,usage:2.384084387,otherVariableCosts:0},{tier:"Studio",revenue:1490/12,processing:4.495,usage:20.168925049,otherVariableCosts:0},{tier:"Scale",revenue:3490/12,processing:10.495,usage:50.837850097,otherVariableCosts:0}];
  const result=minimumCustomerBase(scenarios,500,.15);
  assert.equal(result.customers,216);assert.equal(result.bindingTier,"Store");
  for(const row of scenarios){const profit=(row.revenue-row.processing-row.usage-500/result.customers!)*.85;assert.ok(profit/row.revenue>=.6);}
  const store=scenarios[0];assert.ok((store.revenue-store.processing-store.usage-500/215)*.85/store.revenue<.6);
  assert.equal(minimumCustomerBase(scenarios,500,.30).status,"no_finite_base");
  assert.equal(minimumCustomerBase(scenarios,NaN,.15).status,"unverified");
  assert.equal(minimumCustomerBase(scenarios,500,NaN).status,"unverified");
});
