import { confirmedProfitRevenue } from "@/lib/profit-revenue";
import { done,is,part } from "./check";
const base={subscriptionsCents:10000,usageCents:2000,platformCommissionsCents:1000,refundsAndCreditsCents:500,refundableBalanceCents:1500,collectedConfirmed:true,currency:"USD",period:"month",validUntil:2000,evidence:"SYNTHETIC evidence"};
part("Only retained platform receipts enter the margin");
is("refunds and refundable balances are excluded",confirmedProfitRevenue(base,"month",1000),11000);
is("fully refundable revenue is zero",confirmedProfitRevenue({...base,refundableBalanceCents:12500},"month",1000),0);
for(const key of ["subscriptionsCents","usageCents","platformCommissionsCents","refundsAndCreditsCents","refundableBalanceCents"]){
  const missing:Record<string,unknown>={...base};delete missing[key];is("missing amount is unknown",confirmedProfitRevenue(missing,"month",1000),null);
  for(const value of [-1,0.5,"100",null,NaN,Infinity,Number.MAX_SAFE_INTEGER+1])is("invalid amount is refused",confirmedProfitRevenue({...base,[key]:value},"month",1000),null);
}
for(const change of [{collectedConfirmed:false},{evidence:""},{validUntil:1000},{currency:"BRL"},{period:"other"},{creatorSalesCents:1000000},{futureRenewalsCents:1000000},{subscriptionsCents:0,usageCents:0,platformCommissionsCents:0}])is("unknown, third-party or negative retained revenue refused",confirmedProfitRevenue({...base,...change},"month",1000),null);
is("unsafe net receipt total rejected",confirmedProfitRevenue({...base,subscriptionsCents:Number.MAX_SAFE_INTEGER,usageCents:10000},"month",1000),null);
for(const now of [NaN,-1,0.5])is("invalid assessment time refused",confirmedProfitRevenue(base,"month",now),null);
is("empty horizon refused",confirmedProfitRevenue(base,"",1000),null);
done();
