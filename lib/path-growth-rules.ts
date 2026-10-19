/** Server-derived evidence only. Null means the bounded reading could not verify the fact. */
export type PathGrowthFacts={
 realSale:boolean;
 fileProducts:number|null;
 listEmailSent:boolean|null;
 repeatBuyer:boolean|null;
 postPurchaseOffer:boolean|null;
 buyerReview:boolean|null;
 keptOrders:number|null;
};
export type PathGrowthMission={
 id:"second-product"|"list-email"|"repeat-buyer"|"post-purchase-offer"|"buyer-review"|"ten-orders";
 title:string;why:string;steps:readonly string[];closesOn:string;
 destination:"products"|"email"|"people"|"reviews"|"numbers";
 state:"done"|"open"|"unknown";
};
export function pathGrowthMissions(facts:PathGrowthFacts):PathGrowthMission[]{
 if(!facts.realSale)return [];
 const state=(value:boolean|null)=>value===null?"unknown":value?"done":"open";
 return [
 {id:"second-product",title:"Publish a second product with a file",why:"Give customers another useful option that stands on its own.",steps:["Choose a related problem you can help with.","Publish a distinct product and attach the file its buyer receives."],closesOn:"Recorded when two distinct published products have a file attached.",destination:"products",state:state(facts.fileProducts===null?null:facts.fileProducts>=2)},
 {id:"list-email",title:"Send your first list email",why:"Help people who chose to hear from you understand what you offer.",steps:["Write a useful message for confirmed subscribers with marketing consent.","Review your sending allowance and send it from the email studio."],closesOn:"Recorded when this store has a completed list campaign with at least one confirmed send. This does not prove delivery or a sale.",destination:"email",state:state(facts.listEmailSent)},
 {id:"repeat-buyer",title:"Welcome your first returning buyer",why:"A separate purchase can show that someone chose another offer.",steps:["Review what existing buyers already own before recommending anything.","Use their feedback to improve a relevant offer; wait for a real purchase."],closesOn:"Recorded from two distinct live Stripe checkouts for the same buyer, with neither refunded in full. A post-purchase extra in the same order does not count.",destination:"people",state:state(facts.repeatBuyer)},
 {id:"post-purchase-offer",title:"Configure your first post-purchase offer",why:"Make a relevant next option clear without changing what a buyer already purchased.",steps:["Choose a related product in the product editor.","Configure its post-purchase offer and review the saved settings and customer journey."],closesOn:"Recorded from a saved post-purchase offer on a published product. Configuration does not prove live checkout or delivery.",destination:"products",state:state(facts.postPurchaseOffer)},
 {id:"buyer-review",title:"Receive your first buyer-posted review",why:"Listen to a buyer's own experience and respect their choice to share it.",steps:["Use the existing verified-buyer review flow.","Let the buyer decide whether to post; do not write their words or offer a reward."],closesOn:"Recorded from a current written review posted by a verified buyer through the public-review form, not hidden or marked refunded. The buyer can withdraw it.",destination:"reviews",state:state(facts.buyerReview)},
 {id:"ten-orders",title:"Record ten paid purchases",why:"Review a wider set of real purchases and the work needed to fulfill them.",steps:["Keep improving the product and customer support from what buyers tell you.","Review paid checkouts and refunds in your own records."],closesOn:"Recorded from ten distinct live Stripe checkouts not refunded in full, after refunds have been read. No test payment, imported order, tip or payment request counts.",destination:"numbers",state:state(facts.keptOrders===null?null:facts.keptOrders>=10)},
 ];
}
