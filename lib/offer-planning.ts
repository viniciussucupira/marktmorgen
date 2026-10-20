/** A local price reference, never a demand forecast or margin certificate. */
export type OfferPlanningProduct={id:string;title:string;priceCents:number;category:"course"|"other";eligible:boolean};
export type OfferPlanningCandidate={id:string;title:string;priceCents:number};
export type OfferPlan={product:OfferPlanningProduct;priceCents:number;basis:"own-category"|"current";comparisonCount:number;observedRange:[number,number]|null;companion:OfferPlanningCandidate|null;steps:string[];conditions:string[]};
export function proposeOfferPlan(input:{productId:string;products:readonly OfferPlanningProduct[];candidates:readonly OfferPlanningCandidate[];oneClickAvailable:boolean;pageAvailable:boolean}):OfferPlan|null{
 const valid=(p:{id:string;title:string;priceCents:number})=>Boolean(p.id&&p.title)&&Number.isSafeInteger(p.priceCents)&&p.priceCents>0;
 const product=input.products.find(p=>p.id===input.productId&&p.eligible&&valid(p));
 if(!product)return null;
 const comparisons=input.products.filter(p=>p.id!==product.id&&p.eligible&&p.category===product.category&&valid(p)).sort((a,b)=>a.priceCents-b.priceCents||a.id.localeCompare(b.id));
 // Lower middle is an actual observed catalog price, including for an even sample.
 const reference=comparisons.length?comparisons[Math.floor((comparisons.length-1)/2)].priceCents:product.priceCents;
 const companion=input.oneClickAvailable?input.candidates.filter(p=>p.id!==product.id&&valid(p)).sort((a,b)=>a.priceCents-b.priceCents||a.id.localeCompare(b.id))[0]??null:null;
 return {product,priceCents:reference,basis:comparisons.length?"own-category":"current",comparisonCount:comparisons.length,
 observedRange:comparisons.length?[comparisons[0].priceCents,comparisons[comparisons.length-1].priceCents]:null,companion,
 steps:[input.pageAvailable?"Review an existing sales page or prepare an unsaved page draft.":"Review the product page; your role does not allow page changes here.","Review the existing checkout settings, delivery, consent and buyer terms.",...(companion?["Optionally review "+companion.title+" as one offer after payment; the buyer can decline."]:[]),"Check delivery and support before sharing any live link."],
 conditions:[...(input.oneClickAvailable?[]:["A one-click offer is unavailable under the current payment or tax settings. Nothing is enabled by this plan."]),"Paid selling remains subject to every opening and fiscal gate.","The reference compares catalog prices, not equivalent content, costs, demand or profitability."]};
}
