import { readFields, writeFields } from "@/lib/crm";
import { findToken } from "@/lib/buyer-profile";
import { KIND } from "@/lib/catalog";
import {writePage} from "@/lib/sales-page-store";
import {parsePage} from "@/lib/sales-page";
import {redisPipeline} from "@/lib/redis";
import {setProductPage,storeForEmail} from "@/lib/store";
import { startPath } from "@/lib/path";
import { mayNotify } from "@/lib/path-rules";
/**
 * The stores tests/e2e/store-copy.mjs opens: one with three products, and a
 * second store of the same owner to copy it into, both on a running plan,
 * with a session for their owner.
 */
import { addProduct, claimHandle, createStore, ensureStatsId, setMailSettings, setSubscription, storeRef } from "@/lib/store";
import { openSession } from "@/lib/auth";
const OWNER = "owner@example.com";
async function main(): Promise<void> {
  const claimed = await claimHandle(OWNER, "signshop", "Harbor Coaching Local", "Coaching sessions.");
  if (!claimed.ok) throw new Error(claimed.reason);
  await setSubscription(OWNER, { active: true, tier: "creator", cycle: "month", subscriptionId: null, customerId: null, trialEnds: 0 });
  await setMailSettings(OWNER, { fromName: "Harbor Coaching", address: "1 Main St, Austin, TX 78701" });
  await ensureStatsId(OWNER);
  for (const t of ["One session", "Four sessions", "Free checklist"]) await addProduct(OWNER, t, "Words.", t.startsWith("Free") ? "0" : "40", null);
  const abStore=(await storeForEmail(OWNER))!;
  const abProduct=abStore.catalog.items.find(product=>(product.kind & KIND.paid)!==0)?.id;
  if(!abProduct)throw Error("No paid synthetic experiment product");
  const abPage=parsePage({blocks:[{id:"abhero01",kind:"hero",headline:"One session",sub:"A local synthetic fixture",media:"none",video:null}],test:{headline:"Try a coaching session",sub:""}});
  if(!abPage.test || !abStore.statsId)throw Error("No synthetic experiment");
  await writePage(abStore.statsId,abProduct,abPage,abStore);
  if(!(await setProductPage(OWNER,abProduct,true)).ok)throw Error("Synthetic page was not indexed");
  await redisPipeline([["HSET",`nl:ab:${abStore.statsId}:${abProduct}:${abPage.test.id}`,"va","NaN"]]);
  if(!abStore.statsId)throw Error("No contact fixture store");
  await writeFields(abStore.statsId,[{id:"cmp001",name:"Company",type:"text",options:[]},{id:"seg001",name:"Segment",type:"choice",options:["New","Returning"]}]);
  if((await readFields(abStore.statsId)).length!==2)throw Error("Invalid synthetic contact field schema");
  const contactToken=await findToken(abStore,"contact-fixture@example.test");
  if(!contactToken)throw Error("No contact fixture token");
  const second = await createStore(OWNER, "secondshop", "Second Coaching", "");
  if (!second.ok) throw new Error("no second");
  await ensureStatsId(storeRef(second.store));
  await setSubscription(storeRef(second.store), { active: true, tier: "creator", cycle: "month", subscriptionId: null, customerId: null, trialEnds: 0 });
  const reminderNow=Date.now();
  const reminderZone=["Europe/London","Asia/Tokyo","Pacific/Honolulu"].find(zone=>mayNotify(zone,reminderNow));
  if(!reminderZone)throw new Error("No daytime test zone");
  const reminderStarted=await startPath(second.store,{goalCents:0,goalCurrency:"usd",skills:"",subject:"",minutes:15,audience:"none",timeZone:reminderZone},reminderNow-86400000);
  if(!reminderStarted.ok)throw new Error("No synthetic Path");
  console.log(JSON.stringify({ session: await openSession(OWNER), second: second.store.sid, abProduct, abStore:abStore.sid,contactToken }));
}
main().catch((e) => { console.error(e); process.exit(1); });
