/** Platform fees only, never creator GMV. All amounts are USD cents for one customer's worst case.
 * This checks supplied ceilings, not the accuracy of tax advice, vendor quotes or usage enforcement.
 */
export const MINIMUM_NET_MARGIN_BPS=6_000;
export const CUSTOMER_COST_CATEGORIES=[
 "infrastructure","storageDeliveryVideo","email","ai","paymentAndFx",
 "supportAndOperations","acquisitionAndAffiliates","fixedBusinessCosts",
 "postCancellation","refundAndDisputeFees","other",
] as const;
export type CustomerCostCategory=typeof CUSTOMER_COST_CATEGORIES[number];
export type CustomerWorstCase={
 collectedRevenueCents:number|null;
 refundableRevenueCents:number|null;
 taxesCeilingCents:number|null;
 costCeilings:Partial<Record<CustomerCostCategory,number|null>>;
 allCostsBounded:boolean;
 allTaxesReviewed:boolean;
 revenueCollected:boolean;
};
export type MarginAssessment={approved:boolean;reason:"unknown"|"invalid"|"unbounded"|"uncollected"|"no_revenue"|"below_floor"|"approved";netCents:number|null;marginBps:number|null};
const stopped=(reason:MarginAssessment["reason"]):MarginAssessment=>({approved:false,reason,netCents:null,marginBps:null});
const money=(n:unknown):n is number=>typeof n==="number"&&Number.isSafeInteger(n)&&n>=0;
/** Exact integer comparison: a display rounded to 60% never approves an amount below the floor. */
export function assessCustomerWorstCase(value:CustomerWorstCase|null):MarginAssessment{
 if(!value||typeof value!=="object"||!value.costCeilings||typeof value.costCeilings!=="object")return stopped("unknown");
 const amounts=[value.collectedRevenueCents,value.refundableRevenueCents,value.taxesCeilingCents,...CUSTOMER_COST_CATEGORIES.map(key=>value.costCeilings[key])];
 if(amounts.some(n=>n===null||n===undefined))return stopped("unknown");
 if(!amounts.every(money)||value.refundableRevenueCents!>value.collectedRevenueCents!)return stopped("invalid");
 if(value.allCostsBounded!==true||value.allTaxesReviewed!==true)return stopped("unbounded");
 if(value.revenueCollected!==true)return stopped("uncollected");
 const gross=BigInt(value.collectedRevenueCents!);
 if(gross===0n)return stopped("no_revenue");
 const costs=CUSTOMER_COST_CATEGORIES.reduce((total,key)=>total+BigInt(value.costCeilings[key]!),0n);
 const net=gross-BigInt(value.refundableRevenueCents!)-BigInt(value.taxesCeilingCents!)-costs;
 if(net>BigInt(Number.MAX_SAFE_INTEGER)||net< -BigInt(Number.MAX_SAFE_INTEGER))return stopped("invalid");
 const ratio=Number(net*10_000n/gross);
 const approved=net*10_000n>=gross*BigInt(MINIMUM_NET_MARGIN_BPS);
 return {approved,reason:approved?"approved":"below_floor",netCents:Number(net),marginBps:Number.isSafeInteger(ratio)?ratio:null};
}
