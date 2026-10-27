/** Read-only C2 precheck. No operation, price, allowance or sales gate is changed. */
import {PLAN_PRICES,PLAN_TITLES,TIERS,monthlyEmails,type Tier,type Cycle} from "@/lib/plan";
import {STORE_ALLOWANCES} from "@/lib/store-allowance-rules";
import {VISITS_INCLUDED} from "@/lib/traffic-rules";
import {ORDERS_INCLUDED} from "@/lib/order-rules";
import {paidStorageBytes} from "@/lib/storage-rules";
import {PAID_VIDEO_HOURS} from "@/lib/video-admission-rules";
import {STRESS_PROFIT_TAX_BPS,unitUnder,type Reading} from "@/lib/receiving-costs";
import {gateReading} from "@/lib/tax-gate";
import {planUnits,evaluate} from "./margin-alignment-table";
import {PER_EMAIL,STORAGE_PER_GB} from "./plan-cost-registry";

export function capacityStatus(priceCents:number,reading:Reading):"infeasible"|"unreviewed"{
 if(!Number.isSafeInteger(priceCents)||priceCents<=0)throw Error("Unknown price is not capacity");
 const amounts=[reading.salesTaxInsideBps,reading.salesTaxOnTopBps,reading.remittanceBps,reading.profitTaxBps,reading.revenueTaxBps];
 if(amounts.some(n=>!Number.isSafeInteger(n)||n<0)||reading.profitTaxBps>=10000)throw Error("Unknown tax is not capacity");
 // Zero usage is a counterfactual upper bound, never a free supplier quote.
 return unitUnder(priceCents,0,reading).meetsFloor?"unreviewed":"infeasible";
}
export function capacityWindows(cycle:Cycle):number{return cycle==="year"?12:1;}
export function capacityQuantities(tier:Tier,cycle:Cycle){
 const windows=capacityWindows(cycle),storageGiB=paidStorageBytes(tier)/(1024**3);
 return {windows,emails:monthlyEmails(tier)*windows,buyerActions:STORE_ALLOWANCES[tier].buyer*windows,visits:VISITS_INCLUDED[tier]*windows,orders:ORDERS_INCLUDED[tier]*windows,storageGiB,storageGiBMonths:storageGiB*windows,videoHours:PAID_VIDEO_HOURS[tier]*windows};
}
export function capacityRows(){
 const reading=gateReading(),units=planUnits(false);
 return TIERS.flatMap(tier=>(["month","year"] as const).map(cycle=>{
  const unit=units.find(u=>u.id===tier+"-"+cycle+"-list");
  if(!unit)throw Error("Missing plan unit");
  return {tier,cycle,priceCents:PLAN_PRICES[tier][cycle],full:evaluate(unit,reading),zeroUsage:unitUnder(PLAN_PRICES[tier][cycle],0,reading),status:capacityStatus(PLAN_PRICES[tier][cycle],reading),maximum:null,...capacityQuantities(tier,cycle)};
 }));
}
const percent=(bps:number)=>(bps/100).toFixed(2)+"%";
export function capacityModelLines():string[]{
 return capacityRows().map(row=>"| "+PLAN_TITLES[row.tier]+" | "+row.cycle+" | $"+(row.priceCents/100).toFixed(2)+" | "+percent(row.full.netBps)+" | "+percent(row.zeroUsage.netBps)+" | "+row.status+"; no approved maximum |");
}
export function capacityQuantityLines():string[]{
 return capacityRows().map(r=>"| "+PLAN_TITLES[r.tier]+" | "+r.cycle+" | "+[r.windows,r.emails,r.buyerActions,r.visits,r.orders,r.storageGiB,r.storageGiBMonths,r.videoHours].join(" | ")+" |");
}
export function capacityTaxCeilingBps(reading:Reading):number{return 10000-Math.max(reading.profitTaxBps,STRESS_PROFIT_TAX_BPS)-reading.revenueTaxBps;}
export function capacityInputLines():string[]{
 const reading=gateReading();
 return [
  "Binding configured reading: `"+reading.id+"`.",
  "Counterfactual ceiling before all non-tax costs: "+percent(capacityTaxCeilingBps(reading))+"; required: positive net with the existing spend-floor room.60%is the actual monthly company target.",
  "Existing registered list-email delivery assumption: $"+PER_EMAIL.toFixed(6)+" per email; storage assumption: $"+STORAGE_PER_GB.toFixed(6)+" per model GiB-month.",
 ];
}
