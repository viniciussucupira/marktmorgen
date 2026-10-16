import { assessProfitPortfolio, assessProfitScenario, MINIMUM_NET_MARGIN_BPS, PROFIT_COST_CATEGORIES, type ProfitScenario } from "@/lib/profit-policy";
import { done, is, part } from "./check";
const now=1_000;
const scenario=(): ProfitScenario => ({scope:"customer",reference:"synthetic-client",scenario:"all-entitlements",currency:"USD",period:"synthetic-month",retainedRevenueCents:10_000,fullEntitlementBoundConfirmed:true,taxesConfirmed:true,ownerTaxesConfirmed:true,validUntil:2_000,costs:Object.fromEntries(PROFIT_COST_CATEGORIES.map(key=>[key,{cents:0,evidence:"synthetic confirmed zero exposure",currency:"USD",period:"synthetic-month",validUntil:2000}])) as ProfitScenario["costs"]});
part("Sixty percent after every declared cost, with conservative cent rounding");
is("floor cannot be configured below sixty percent",MINIMUM_NET_MARGIN_BPS,6000);
for (const revenue of [1,2,3,4,5,99,100,101,9999,10000,Number.MAX_SAFE_INTEGER]) {
  const item=scenario();item.retainedRevenueCents=revenue;
  const allowed=Number(BigInt(revenue)*BigInt(2)/BigInt(5));item.costs.taxes.cents=allowed;
  const exact=assessProfitScenario(item,now);
  is("largest affordable integer cost meets floor",exact.status,"meets_floor");
  if(exact.status!=="unverified")is("cost ceiling is rounded down",exact.maximumCostCents,allowed);
  item.costs.taxes.cents=allowed+1;
  is("one cent beyond ceiling fails",assessProfitScenario(item,now).status,"below_floor");
}
let item=scenario();item.costs.ownerTaxes.cents=1000;item.costs.taxes.cents=1000;item.costs.paymentFees.cents=1000;item.costs.ai.cents=1001;
is("taxes and all other costs add together",assessProfitScenario(item,now).status,"below_floor");
item.retainedRevenueCents=0;
is("fully refunded or free customer cannot claim a positive margin",assessProfitScenario(item,now).status,"no_revenue");
is("zero revenue has negative profit when costs remain",assessProfitScenario(item,now),{status:"no_revenue",totalCostCents:4001,netProfitCents:-4001,maximumCostCents:0});
const personal=scenario();personal.costs.ai.cents=3000;personal.costs.ownerTaxes.cents=1000;
is("sixty percent after owner taxes meets the minimum",assessProfitScenario(personal,now).status,"meets_floor");
personal.costs.ownerTaxes.cents=1001;
is("profitable company cannot hide personal taxes below sixty percent",assessProfitScenario(personal,now).status,"below_floor");
part("Unknown and stale assumptions never receive a passing assessment");
for(const key of PROFIT_COST_CATEGORIES){
  const raw=scenario() as unknown as {costs:Record<string,unknown>};delete raw.costs[key];
  is("omitted cost is unknown: "+key,assessProfitScenario(raw,now).status,"unverified");
  raw.costs[key]={cents:0,evidence:""};
  is("zero cost needs evidence too: "+key,assessProfitScenario(raw,now).status,"unverified");
}
for(const bad of [-1,NaN,Infinity,0.1,"0",null,Number.MAX_SAFE_INTEGER+1]){
  const raw=scenario();(raw.costs.ai as {cents:unknown}).cents=bad;
  is("invalid cost cannot pass",assessProfitScenario(raw,now).status,"unverified");
  raw.costs.ai.cents=0;
  (raw as unknown as {retainedRevenueCents:unknown}).retainedRevenueCents=bad;
  is("invalid revenue cannot pass",assessProfitScenario(raw,now).status,"unverified");
}
for(const change of [{taxesConfirmed:false},{ownerTaxesConfirmed:false},{ownerTaxesConfirmed:undefined},{fullEntitlementBoundConfirmed:false},{validUntil:now},{validUntil:now-1},{currency:"BRL"},{scope:"other"},{reference:""},{period:""},{costs:null}])is("incomplete assumptions are unverified",assessProfitScenario({...scenario(),...change},now).status,"unverified");
item=scenario();item.costs.ai.cents=Number.MAX_SAFE_INTEGER;item.costs.email.cents=1;
is("overflow cannot undercount costs",assessProfitScenario(item,now).status,"unverified");
for(const raw of [null,[],{},true])is("invalid scenario rejected",assessProfitScenario(raw,now).status,"unverified");
part("Each customer must pass, independently of company totals");
const customer=scenario(),company={...scenario(),scope:"company",reference:"company"};
const portfolio={coverageConfirmed:true,scenarios:[customer,company]};
is("individually and globally proven bounds meet policy",assessProfitPortfolio(portfolio,now).meetsPolicy,true);
const losing=scenario();losing.reference="expensive-client";losing.costs.ai.cents=9000;
is("healthy aggregate cannot subsidize a failing customer",assessProfitPortfolio({...portfolio,scenarios:[customer,losing,company]},now).meetsPolicy,false);
is("company without clients is insufficient",assessProfitPortfolio({...portfolio,scenarios:[company]},now).meetsPolicy,false);
is("clients without company costs are insufficient",assessProfitPortfolio({...portfolio,scenarios:[customer]},now).meetsPolicy,false);
is("unconfirmed population/lifecycle cannot pass",assessProfitPortfolio({...portfolio,coverageConfirmed:false},now).meetsPolicy,false);
is("duplicate scenarios cannot inflate coverage",assessProfitPortfolio({...portfolio,scenarios:[customer,customer,company]},now).meetsPolicy,false);
is("different periods are not silently compared",assessProfitPortfolio({...portfolio,scenarios:[customer,{...company,period:"another-period"}]},now).meetsPolicy,false);
const refund={...scenario(),scenario:"full-refund",retainedRevenueCents:0};
is("refunded customer cannot disappear into profitable average",assessProfitPortfolio({...portfolio,scenarios:[customer,refund,company]},now).meetsPolicy,false);
for(const raw of [null,{},[],{scenarios:[]}])is("missing portfolio cannot pass",assessProfitPortfolio(raw,now).meetsPolicy,false);
const sparse=[customer,company];sparse.length=3;
is("missing array entries cannot hide unassessed scenarios",assessProfitPortfolio({...portfolio,scenarios:sparse},now).meetsPolicy,false);
part("Each cost evidence has its own valid currency, horizon and expiry");
for(const category of PROFIT_COST_CATEGORIES){
  for(const change of [{validUntil:undefined},{validUntil:null},{validUntil:1000},{validUntil:999},{validUntil:1000.5},{validUntil:Infinity},{validUntil:"2000"},{currency:"BRL"},{currency:undefined},{period:"another-month"},{period:undefined}]){
    const raw=scenario();Object.assign(raw.costs[category],change);is("invalid individual evidence cannot hide behind a valid scenario",assessProfitScenario(raw,now).status,"unverified");
  }
}
const expiresFirst=scenario();expiresFirst.costs.ownerTaxes.validUntil=1500;
is("personal tax evidence is valid strictly before its own expiry",assessProfitScenario(expiresFirst,1499).status,"meets_floor");
is("personal tax evidence expires before the scenario deadline",assessProfitScenario(expiresFirst,1500).status,"unverified");
done();
