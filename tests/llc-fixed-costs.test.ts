import test from "node:test";
import assert from "node:assert/strict";
import { allocateEntireLlcFixedCosts, CURRENT_LLC_FIXED_COST_CEILINGS, FIXED_COST_SOURCE_OBSERVATIONS as sources, LLC_FIXED_COST_ALLOCATION, LLC_FIXED_COST_IDS, type FixedCostCeiling } from "../lib/llc-fixed-costs";
const fixture = (): FixedCostCeiling[] => LLC_FIXED_COST_IDS.map((id,i)=>({id,fullMonthlyUsdCents:101+i,fullAnnualUsdCents:1201+i,evidence:"SYNTHETIC FULL COST; no provider",reserveReviewed:true}));
test("every entire LLC cost is allocated to Marktmorgen with no Hazelsong subsidy",()=>{
 const lines=fixture(), result=allocateEntireLlcFixedCosts(lines)!;
 assert.equal(result.monthlyUsdCents,lines.reduce((sum,x)=>sum+x.fullMonthlyUsdCents!,0));
 assert.equal(result.annualUsdCents,lines.reduce((sum,x)=>sum+x.fullAnnualUsdCents!,0));
 assert.equal(result.marktmorgenBps,10000);assert.equal(result.hazelsongBps,0);
 assert.equal(LLC_FIXED_COST_ALLOCATION.marktmorgenBps,10000);
 for(const line of lines){const changed=lines.map(x=>x.id===line.id?{...x,fullMonthlyUsdCents:x.fullMonthlyUsdCents!+100,fullAnnualUsdCents:x.fullAnnualUsdCents!+1200}:x);const next=allocateEntireLlcFixedCosts(changed)!;assert.equal(next.monthlyUsdCents-result.monthlyUsdCents,100);assert.equal(next.annualUsdCents-result.annualUsdCents,1200);}
});
test("unknown costs, evidence, reserves or incomplete identities never become zero",()=>{
 assert.equal(allocateEntireLlcFixedCosts(CURRENT_LLC_FIXED_COST_CEILINGS),null);
 for(const id of LLC_FIXED_COST_IDS){for(const bad of [{fullMonthlyUsdCents:null},{fullAnnualUsdCents:null},{evidence:""},{reserveReviewed:false},{fullMonthlyUsdCents:-1},{fullAnnualUsdCents:0.5}])assert.equal(allocateEntireLlcFixedCosts(fixture().map(x=>x.id===id?{...x,...bad}:x)),null);}
 assert.equal(allocateEntireLlcFixedCosts(fixture().slice(1)),null);const duplicate=fixture();duplicate[1]={...duplicate[0]};assert.equal(allocateEntireLlcFixedCosts(duplicate),null);
});
test("source observations preserve full taxes, INSS and higher monthly mailbox rate",()=>{
 assert.equal(sources.delaware.annualMinor,40000);assert.equal(sources.californiaTax.annualMinor,80000);
 assert.equal(sources.californiaFee.maximumAnnualMinor,1179000);assert.equal(sources.inss.monthlyMinor,169511);assert.equal(sources.inss.annualMinor,2034132);
 assert.equal(sources.mailbox.monthlyMinor,5900);assert.equal(sources.mailbox.twelveMonthlyPaymentsMinor,70800);
});

test("TX4 and SR obligations cannot disappear inside the old fixed-cost inventory",()=>{
 const required = ["us-form-5472","us-pro-forma-1120","br-irpf","br-cbe","vat-oss-and-local-compliance","itin-and-acceptance-agent","us-resident-representative","us-business-address"];
 for(const id of required){
  assert.ok((LLC_FIXED_COST_IDS as readonly string[]).includes(id));
  assert.equal(allocateEntireLlcFixedCosts(fixture().filter(line=>line.id!==id)),null);
  const current=CURRENT_LLC_FIXED_COST_CEILINGS.find(line=>line.id===id)!;
  assert.equal(current.fullMonthlyUsdCents,null);
  assert.equal(current.fullAnnualUsdCents,null);
  assert.equal(current.reserveReviewed,false);
 }
});
