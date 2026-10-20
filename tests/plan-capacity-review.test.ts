import {test} from "node:test";
import assert from "node:assert/strict";
import {readFileSync} from "node:fs";
import {PLAN_PRICES,TIERS,monthlyEmails} from "@/lib/plan";
import {MOST_TAX_READING,SIZING_READING,FLOOR_BPS,unitUnder} from "@/lib/receiving-costs";
import {gateReading} from "@/lib/tax-gate";
import {PAID_STORAGE_BYTES} from "@/lib/storage-rules";
import {STORE_ALLOWANCES} from "@/lib/store-allowance-rules";
import {VISITS_INCLUDED} from "@/lib/traffic-rules";
import {ORDERS_INCLUDED} from "@/lib/order-rules";
import {PAID_VIDEO_HOURS} from "@/lib/video-admission-rules";
import {capacityStatus,capacityRows,capacityModelLines,capacityQuantityLines,capacityInputLines,capacityTaxCeilingBps,capacityQuantities} from "./plan-capacity-review";
const doc=()=>readFileSync("docs/plan-capacity-precheck.md","utf8");
test("capacity precheck: no feasible maximum is never a zero allowance",()=>{
 const reading=gateReading(),rows=capacityRows();
 assert.equal(rows.length,6);
 for(const row of rows){
  assert.equal(row.maximum,null);
  assert.equal(row.zeroUsage.netBps,unitUnder(PLAN_PRICES[row.tier][row.cycle],0,reading).netBps);
  assert.ok(row.full.netBps<=row.zeroUsage.netBps);
  if(capacityTaxCeilingBps(reading)<FLOOR_BPS){
   assert.equal(row.status,"infeasible");assert.equal(row.zeroUsage.meetsFloor,false);
   assert.ok(row.zeroUsage.usageRoomCents<0);
  }
 }
 assert.ok(capacityTaxCeilingBps(MOST_TAX_READING)<FLOOR_BPS);
});
test("capacity precheck: even a favorable counterfactual never approves unreviewed costs",()=>{
 assert.equal(capacityStatus(999000,SIZING_READING),"unreviewed");
 assert.throws(()=>capacityStatus(Number.NaN,MOST_TAX_READING));
 assert.throws(()=>capacityStatus(0,MOST_TAX_READING));
 assert.throws(()=>capacityStatus(6900,{...MOST_TAX_READING,profitTaxBps:Number.NaN}));
 assert.throws(()=>capacityStatus(6900,{...MOST_TAX_READING,profitTaxBps:10000}));
});
test("capacity precheck: annual windows cover twelve full months and preserve concurrent storage",()=>{
 for(const tier of TIERS){
  const month=capacityQuantities(tier,"month"),year=capacityQuantities(tier,"year");
  assert.equal(month.emails,monthlyEmails(tier));assert.equal(month.buyerActions,STORE_ALLOWANCES[tier].buyer);
  assert.equal(month.visits,VISITS_INCLUDED[tier]);assert.equal(month.orders,ORDERS_INCLUDED[tier]);
  assert.equal(month.videoHours,PAID_VIDEO_HOURS[tier]);
  assert.equal(month.storageGiB,PAID_STORAGE_BYTES[tier]/(1024**3));
  assert.equal(year.windows,12);assert.equal(year.storageGiB,month.storageGiB);
  for(const key of ["emails","buyerActions","visits","orders","storageGiBMonths","videoHours"] as const)assert.equal(year[key],12*month[key]);
 }
});
test("capacity precheck: the recorded six payment cases and36 entitlements cannot become stale",()=>{
 const text=doc();
 for(const line of [...capacityModelLines(),...capacityQuantityLines(),...capacityInputLines()])assert.ok(text.includes(line),"stale or missing: "+line);
 assert.match(text,/not a zero supplier cost/);
 assert.match(text,/No feasible maximum is different from a maximum of zero/);
 assert.match(text,/Queue89 remains in progress/);
});
