import {DEMO_CONNECTED_ACCOUNT} from "@/lib/demo-account";
import { readFields, writeFields } from "@/lib/crm";
import { findToken } from "@/lib/buyer-profile";
import { KIND } from "@/lib/catalog";
import {writePage} from "@/lib/sales-page-store";
import {parsePage} from "@/lib/sales-page";
import {redisPipeline} from "@/lib/redis";
import {setProductPage,setProductFile,setStripeAccount,storeForEmail} from "@/lib/store";
import { startPath } from "@/lib/path";
import { localDay,mayNotify } from "@/lib/path-rules";
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

  // Separate synthetic owner: post-sale Path evidence never changes the copy fixtures.
  const growthOwner="path-growth-owner@example.test";
  const growthClaim=await claimHandle(growthOwner,"growthpath","Growth Path","Guides.");
  if(!growthClaim.ok)throw Error("No growth store");
  await setSubscription(growthOwner,{active:true,tier:"creator",cycle:"month",subscriptionId:null,customerId:null,trialEnds:0});
  await ensureStatsId(growthOwner);
  const growthProducts:string[]=[];
  for(const title of ["First guide","Second guide"]){
    const added=await addProduct(growthOwner,title,"Synthetic file guide.","10",null);
    if(!added.ok)throw Error("No growth product");
    growthProducts.push(added.product.id);
    const attached=await setProductFile(growthOwner,added.product.id,{pathname:"stores/path-growth/"+added.product.id+"/guide.pdf",name:"guide.pdf",bytes:100,contentType:"application/pdf",addedAt:new Date().toISOString()});
    if(!attached.ok)throw Error("No growth file");
  }
  if(!(await setStripeAccount(growthOwner,DEMO_CONNECTED_ACCOUNT,true)).ok)throw Error("No growth synthetic account");
  const growthStore=(await storeForEmail(growthOwner))!;
  if(!(await startPath(growthStore,{goalCents:0,goalCurrency:"usd",skills:"Teaching",subject:"Guides",minutes:15,audience:"none",timeZone:"America/New_York"})).ok)throw Error("No growth Path");
  const growthSession=await openSession(growthOwner);
  const returnOwner="path-return-owner@example.test";
  if(!(await claimHandle(returnOwner,"returnpath","Return Path","A first introduction.")).ok)throw Error("No return store");
  await setSubscription(returnOwner,{active:true,tier:"creator",cycle:"month",subscriptionId:null,customerId:null,trialEnds:0});
  const returnStore=(await ensureStatsId(returnOwner))!;
  const returnNow=Date.now(),returnStart=new Date(localDay("America/New_York",returnNow)+"T12:00:00Z");
  returnStart.setUTCDate(returnStart.getUTCDate()-8);
  if(!(await startPath(returnStore,{goalCents:0,goalCurrency:"usd",skills:"Teaching",subject:"Guides",minutes:15,audience:"none",timeZone:"America/New_York"},returnStart.getTime())).ok)throw Error("No return Path");
  const returnSession=await openSession(returnOwner);
  console.log(JSON.stringify({ returnSession,returnSid:returnStore.sid,growthSession,growthSid:growthStore.sid,growthProduct:growthProducts[0],session: await openSession(OWNER), second: second.store.sid, abProduct, abStore:abStore.sid,contactToken }));
}
main().catch((e) => { console.error(e); process.exit(1); });
