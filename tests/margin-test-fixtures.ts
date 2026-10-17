import {CUSTOMER_COST_CATEGORIES,type CustomerWorstCase} from '@/lib/net-margin-rules';
/** Synthetic economics only. Choose costs/taxes that leave an exact net amount
 * while covering the owner's 27.5% minimum without optimistic cent rounding.
 */
export function fundedCustomerScenario(gross=10000,net=6000):CustomerWorstCase{
 const pretax=Number((BigInt(net)*BigInt(10000)+BigInt(7249))/BigInt(7250));
 return{collectedRevenueCents:gross,refundableRevenueCents:0,taxesCeilingCents:pretax-net,costCeilings:Object.fromEntries(CUSTOMER_COST_CATEGORIES.map(key=>[key,key==='infrastructure'?gross-pretax:0])),allCostsBounded:true,allTaxesReviewed:true,revenueCollected:true};
}
export const zeroFixedCompanyFixture={monthlyFixedCostsCeilingCents:0,monthlyFixedTaxesCeilingCents:0,allFixedCostsBounded:true,allFixedTaxesReviewed:true,fixedCostsEvidence:'TEST ONLY: zero fixed costs',fixedTaxEvidence:'TEST ONLY: zero fixed taxes',reviewedPayingCustomers:1};

/** Reallocate existing synthetic costs; keep the same total, tax and net result. */
export function fundedCustomerWithAi(gross=10000,net=6000,aiCents=12):CustomerWorstCase{
 const value=fundedCustomerScenario(gross,net);
 const infrastructure=value.costCeilings.infrastructure!;
 if(infrastructure<aiCents)throw new Error('Synthetic scenario has no room for its AI allocation');
 return {...value,costCeilings:{...value.costCeilings,infrastructure:infrastructure-aiCents,ai:aiCents}};
}
