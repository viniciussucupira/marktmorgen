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
 const required = ["us-form-5472","us-pro-forma-1120","br-irpf","br-cbe","vat-oss-and-local-compliance","us-business-address"];
 for(const id of required){
  assert.ok((LLC_FIXED_COST_IDS as readonly string[]).includes(id));
  assert.equal(allocateEntireLlcFixedCosts(fixture().filter(line=>line.id!==id)),null);
  const current=CURRENT_LLC_FIXED_COST_CEILINGS.find(line=>line.id===id)!;
  assert.equal(current.fullMonthlyUsdCents,null);
  assert.equal(current.fullAnnualUsdCents,null);
  assert.equal(current.reserveReviewed,false);
 }
});

test("cost evidence accessors never execute or substitute a lower second value",()=>{
 for(const key of ["id","fullMonthlyUsdCents","fullAnnualUsdCents","evidence","reserveReviewed"] as const){
  let reads=0;
  const lines=fixture();
  Object.defineProperty(lines[0],key,{enumerable:true,get(){reads++;throw new Error("unreviewed getter");}});
  assert.equal(allocateEntireLlcFixedCosts(lines),null);
  assert.equal(reads,0);
 }
 let reads=0;
 const changing=fixture();
 Object.defineProperty(changing[0],"fullMonthlyUsdCents",{enumerable:true,get(){return ++reads===1?101:-100000;}});
 assert.equal(allocateEntireLlcFixedCosts(changing),null);
 assert.equal(reads,0);
});
test("inherited cost records, sparse arrays and accessor entries are not complete evidence",()=>{
 const inherited=fixture();
 inherited[0]=Object.create(inherited[0]);
 assert.equal(allocateEntireLlcFixedCosts(inherited),null);
 const sparse=fixture();Reflect.deleteProperty(sparse,"0");
 assert.equal(allocateEntireLlcFixedCosts(sparse),null);
 let reads=0;const indexed=fixture();
 Object.defineProperty(indexed,"0",{enumerable:true,get(){reads++;return fixture()[0];}});
 assert.equal(allocateEntireLlcFixedCosts(indexed),null);
 assert.equal(reads,0);
});
test("detached cost evidence retains valid totals and refuses unsafe aggregate amounts",()=>{
 const lines=fixture(),expected=allocateEntireLlcFixedCosts(lines);
 assert.deepEqual(allocateEntireLlcFixedCosts(lines.map(line=>Object.assign(Object.create(null),line))),expected);
 const overflow=fixture();overflow[0].fullMonthlyUsdCents=Number.MAX_SAFE_INTEGER;
 assert.equal(allocateEntireLlcFixedCosts(overflow),null);
 const annual=fixture();annual[0].fullAnnualUsdCents=Number.MAX_SAFE_INTEGER;
 assert.equal(allocateEntireLlcFixedCosts(annual),null);
});

test("LQ1 removes only canceled identity categories and retains unresolved real US address",()=>{
 const ids=LLC_FIXED_COST_IDS as readonly string[];
 assert.ok(!ids.includes("itin-and-acceptance-agent"));
 assert.ok(!ids.includes("us-resident-representative"));
 assert.ok(ids.includes("us-business-address"));
 const address=CURRENT_LLC_FIXED_COST_CEILINGS.find(line=>line.id==="us-business-address")!;
 assert.deepEqual(address,{id:"us-business-address",fullMonthlyUsdCents:null,fullAnnualUsdCents:null,evidence:"",reserveReviewed:false});
 assert.equal(allocateEntireLlcFixedCosts(CURRENT_LLC_FIXED_COST_CEILINGS),null);
 for(const obsolete of ["itin-and-acceptance-agent","us-resident-representative"]){
  const lines=fixture();
  lines[0]={...lines[0],id:obsolete as FixedCostCeiling["id"]};
  assert.equal(allocateEntireLlcFixedCosts(lines),null);
 }
});
