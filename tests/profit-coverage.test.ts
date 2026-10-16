import { assessProfitCoverage } from "@/lib/profit-coverage";
import { PROFIT_COST_CATEGORIES } from "@/lib/profit-policy";
import { done, is, part } from "./check";
// Synthetic positive revenues only test matrix completeness; these are NOT real refund/trial economics.
const cases=["full_entitlement","maximum_discount","refund","nonpayment","trial","cancellation","post_closure"];
function fixture(){
  const scenarios:Record<string,unknown>[]=[];
  const add=(scope:string,reference:string,scenario:string,plan?:string,cycle?:string)=>scenarios.push({scope,reference,scenario,plan,cycle,currency:"USD",period:"synthetic-horizon",retainedRevenueCents:10000,fullEntitlementBoundConfirmed:true,taxesConfirmed:true,ownerTaxesConfirmed:true,validUntil:2000,costs:Object.fromEntries(PROFIT_COST_CATEGORIES.map(key=>[key,{cents:0,evidence:"SYNTHETIC matrix fixture, not certified costs"}]))});
  for(const plan of ["creator","pro","scale"])for(const cycle of ["month","year"]){
    for(const scenario of cases)add("plan",plan+":"+cycle,scenario,plan,cycle);
    add("company","offer:"+plan+":"+cycle,"single_customer_maximum_usage",plan,cycle);
  }
  for(const scenario of cases)add("customer","client-a",scenario,"creator","month");
  add("company","customer:client-a","single_customer_maximum_usage","creator","month");
  add("company","company","all_customers_maximum_usage");
  return {coverageConfirmed:true,customers:[{reference:"client-a",plan:"creator",cycle:"month"}],scenarios};
}
part("All six published plan/cycle combinations and customer/company stress cases are required");
const complete=fixture();is("fixture includes all 57 required combinations",complete.scenarios.length,57);
is("complete declared matrix can meet arithmetic rule",assessProfitCoverage(complete,1000).meetsPolicy,true);
for(let i=0;i<complete.scenarios.length;i++){
  const raw=fixture(),removed=raw.scenarios.splice(i,1)[0],result=assessProfitCoverage(raw,1000);
  is("omitting any required scenario blocks assessment",result.meetsPolicy,false);
  is("missing row is identified exactly",result.missing,[JSON.stringify([removed.scope,removed.reference,removed.scenario])]);
}
part("Customer inventory and terms cannot be replaced by profitable unrelated rows");
for(const change of [{coverageConfirmed:false},{customers:[]},{customers:null},{customers:[{reference:"client-a",plan:"unknown",cycle:"month"}]},{customers:[{reference:"client-a",plan:"creator",cycle:"week"}]},{customers:[complete.customers[0],complete.customers[0]]}])is("invalid inventory never passes",assessProfitCoverage({...fixture(),...change},1000).meetsPolicy,false);
const extra=fixture();extra.customers.push({reference:"client-b",plan:"pro",cycle:"year"});
is("each additional customer requires its own complete matrix",assessProfitCoverage(extra,1000).missing.length,8);
for(const scope of ["plan","customer","company"]){
  let raw=fixture();const index=raw.scenarios.findIndex(row=>row.scope===scope);
  raw.scenarios[index].retainedRevenueCents=0;
  is("zero revenue cannot be averaged away: "+scope,assessProfitCoverage(raw,1000).meetsPolicy,false);
  raw=fixture();raw.scenarios.push({...raw.scenarios[index]});
  is("duplicate cannot stand for another case: "+scope,assessProfitCoverage(raw,1000).meetsPolicy,false);
}
for(const scope of ["plan","customer"]){
  const raw=fixture(),row=raw.scenarios.find(row=>row.scope===scope)!;row.plan="scale";
  is("scenario must use the declared plan: "+scope,assessProfitCoverage(raw,1000).reasons.includes("scenario_terms_mismatch"),true);
}
let raw=fixture();raw.scenarios[0].ownerTaxesConfirmed=false;
is("missing Brazilian owner tax confirmation blocks whole matrix",assessProfitCoverage(raw,1000).meetsPolicy,false);
raw=fixture();raw.scenarios.find(row=>row.reference==="company")!.retainedRevenueCents=0;
is("company totals cannot be replaced by customer profits",assessProfitCoverage(raw,1000).meetsPolicy,false);
raw=fixture();raw.scenarios.push({...raw.scenarios[0],reference:"unregistered"});
is("unregistered scenario is explicit",assessProfitCoverage(raw,1000).reasons.includes("unexpected_scenario"),true);
raw=fixture();raw.scenarios[0].period="different-period";
is("incomparable periods remain rejected",assessProfitCoverage(raw,1000).meetsPolicy,false);
is("empty input rejected",assessProfitCoverage(null,1000).meetsPolicy,false);
is("unknown coverage cannot pass",assessProfitCoverage({...fixture(),coverageConfirmed:"true"},1000).meetsPolicy,false);
done();
