import { COMPETITOR_PRICES, type CompetitorPlanPrice, type OfficialPriceSource } from "@/lib/competitor-prices";
import { PUBLISHED_PLAN_PRICES, COMMISSION_PLANS_PUBLISHED, COMMISSION_BPS, type Tier, type Cycle } from "@/lib/plan";

export type ToolId = keyof typeof COMPETITOR_PRICES;
export const TOOL_IDS = Object.keys(COMPETITOR_PRICES) as ToolId[];
export type StackLine = {
 tool:ToolId; planIndex:number; monthlySalesCents:number; monthlyOrders:number;
 /** A quote entered by the visitor, not a published universal processing rate. */
 processingBps:number|null; processingFixedCents:number|null;
 /** Other monthly usage, payout, billing, tax or conversion charges: explicit, never assumed zero. */
 otherMonthlyCents:number|null;
 /** They checked the provider/country/cohort conditions linked alongside the result. */
 conditionsConfirmed:boolean;
 gatewayFeeApplies:boolean|null; recurringFeeMode:"separate"|"included"|null;
};
export type LineQuote = {name:string;subscriptionCents:number|null;paymentCents:number|null;otherCents:number|null;monthlyCents:number|null;unknown:string[];sources:OfficialPriceSource[]};
export const centsInput=(raw:string):number|null=>{
 if(!/^\d+(?:\.\d{1,2})?$/.test(raw.trim()))return null;
 const n=Number(raw);return Number.isFinite(n)&&n<=100000000?Math.round(n*100):null;
};
export const countInput=(raw:string):number|null=>/^\d+$/.test(raw.trim())&&Number(raw)<=100000000?Number(raw):null;

export function quoteLine(line:StackLine,cycle:Cycle):LineQuote{
 const tool=COMPETITOR_PRICES[line.tool];
 const plan:CompetitorPlanPrice|undefined=tool?.plans[line.planIndex];
 const unknown:string[]=[];
 if(!tool||!plan)return {name:"Unknown plan",subscriptionCents:null,paymentCents:null,otherCents:null,monthlyCents:null,unknown:["Choose a listed tool and plan."],sources:[]};
 const invalid=[line.monthlySalesCents,line.monthlyOrders].some(n=>!Number.isSafeInteger(n)||n<0||n>10000000000)||line.monthlyOrders>100000000;
 if(invalid)unknown.push("Enter non-negative sales and a whole number of paid transactions.");
 if(line.monthlySalesCents>0&&line.monthlyOrders===0)unknown.push("Paid sales need a transaction count; fixed fees are charged per transaction.");
 if(line.monthlySalesCents===0&&line.monthlyOrders>0)unknown.push("This model is for paid transactions; give their gross sales amount.");
 const subscriptionCents=cycle==="month"?plan.monthlyCents:plan.annualCents===null?null:plan.annualCents/12;
 if(subscriptionCents===null)unknown.push("The exact subscription invoice for this billing interval is unverified.");
 if(!line.conditionsConfirmed)unknown.push("Check the linked country, provider, eligibility, subscriber and legacy-plan conditions.");
 let paymentCents:number|null=null;
 const inconsistentVolume=(line.monthlySalesCents>0&&line.monthlyOrders===0)||(line.monthlySalesCents===0&&line.monthlyOrders>0);
 if(line.monthlySalesCents===0&&!invalid&&!inconsistentVolume){paymentCents=0;}
 else if(!invalid&&!inconsistentVolume){
  // These inclusive quotes already contain processing; never add a visitor's processor twice.
  if(line.tool==="kit"||line.tool==="whop"||(line.tool==="skool"&&line.planIndex===0)){
   if(plan.listedPaymentFeeBps===undefined||plan.listedPaymentFixedCents===undefined)unknown.push("Inclusive payment quote is unverified.");
   else paymentCents=line.monthlySalesCents*plan.listedPaymentFeeBps/10000+line.monthlyOrders*plan.listedPaymentFixedCents;
  }else if(line.tool==="skool"||line.tool==="hotmart"){
   unknown.push("Per-payment bands or a fee boundary require individual transaction quotes; a monthly average cannot price them safely.");
  }else if(plan.platformFeeBps===null){
   unknown.push("The applicable platform share is unverified; it is not zero.");
  }else{
   const bps=line.processingBps,fixed=line.processingFixedCents;
   if(bps===null||fixed===null||!Number.isFinite(bps)||!Number.isFinite(fixed)||bps<0||bps>10000||fixed<0||fixed>100000000)unknown.push("Enter the processor's applicable percentage and fixed fee for this tool.");
   else {
    let extraBps=0;let conditionalFeesKnown=true;
    if(plan.externalProviderFeeBps!==undefined){
     if(typeof line.gatewayFeeApplies!=="boolean"){unknown.push("Confirm whether the published extra gateway fee applies to your country and provider.");conditionalFeesKnown=false;}
     else if(line.gatewayFeeApplies)extraBps+=plan.externalProviderFeeBps;
    }
    if(plan.usRecurringBillingBps!==undefined){
     if(line.recurringFeeMode!=="separate"&&line.recurringFeeMode!=="included"){unknown.push("Confirm whether the published recurring Billing fee applies separately or is already in your entered processing quote.");conditionalFeesKnown=false;}
     else if(line.recurringFeeMode==="separate")extraBps+=plan.usRecurringBillingBps;
    }
    paymentCents=conditionalFeesKnown?line.monthlySalesCents*(plan.platformFeeBps+bps+extraBps)/10000+line.monthlyOrders*fixed:null;
   }
  }
 }
 if(!line.conditionsConfirmed&&line.monthlySalesCents>0)paymentCents=null;
 if(paymentCents!==null&&(!Number.isFinite(paymentCents)||Math.abs(paymentCents)>Number.MAX_SAFE_INTEGER)){paymentCents=null;unknown.push("This payment quote exceeds the calculator\'s safe numeric range.");}
 const otherCents=line.otherMonthlyCents;
 if(otherCents===null||!Number.isSafeInteger(otherCents)||otherCents<0||otherCents>10000000000)unknown.push("Other applicable fees need a monthly quote, including an explicit zero when verified.");
 let monthlyCents=unknown.length||subscriptionCents===null||paymentCents===null||otherCents===null?null:subscriptionCents+paymentCents+otherCents;
 if(monthlyCents!==null&&(!Number.isFinite(monthlyCents)||Math.abs(monthlyCents)>Number.MAX_SAFE_INTEGER)){unknown.push("This total exceeds the calculator's safe numeric range.");monthlyCents=null;}
 return {name:tool.name+" — "+plan.name,subscriptionCents,paymentCents,otherCents,monthlyCents,unknown,sources:[plan.source,...(plan.feeSource?[plan.feeSource]:[])]};
}
export function quoteOwn(tier:Tier,cycle:Cycle,salesCents:number,orders:number,bps:number|null,fixed:number|null,other:number|null):number|null{
 if(!Number.isSafeInteger(salesCents)||salesCents<0||!Number.isSafeInteger(orders)||orders<0||(salesCents>0&&orders===0)||(salesCents===0&&orders>0)||bps===null||fixed===null||other===null||!Number.isFinite(bps)||bps<0||bps>10000||!Number.isFinite(fixed)||fixed<0||fixed>100000000||salesCents>10000000000||orders>100000000||!Number.isSafeInteger(other)||other<0||other>10000000000)return null;
 const total=(cycle==="month"?PUBLISHED_PLAN_PRICES[tier].month:PUBLISHED_PLAN_PRICES[tier].year/12)+salesCents*(bps+(COMMISSION_PLANS_PUBLISHED?COMMISSION_BPS[tier]:0))/10000+orders*fixed+other;
 return Number.isFinite(total)&&Math.abs(total)<=Number.MAX_SAFE_INTEGER?total:null;
}
