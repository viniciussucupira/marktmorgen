import {pathGrowthMoney} from "@/lib/path-growth-money";
import type {Sale} from "@/lib/stats";
import {done,is,part} from "./check";
const handles=new Set(["own-store","old-own"]);
const sale=(id:number,email="buyer@example.test",over:Partial<Sale>={}):Sale=>({created:1790000000+id,product:"p1",cents:1000,currency:"usd",upsell:false,source:"",medium:"",campaign:"",first:"",content:"",country:"",paymentIntent:"pi_"+id,row:{id:"cs_live_"+id,livemode:true,status:"complete",payment_status:"paid",metadata:{store:"own-store"},customer_details:{email}},...over});
const read=(sales:Sale[],refunds:{cents:number;currency:string;paymentIntent:string}[]|null=[],partial=false)=>pathGrowthMoney(sales,refunds,handles,partial);
part("Own distinct live checkouts after known refunds");
is("two purchases by one buyer",read([sale(1),sale(2)]),{repeatBuyer:true,keptOrders:2});
is("normalized buyer match",read([sale(1," BUYER@example.test "),sale(2)]).repeatBuyer,true);
is("no identities returned",Object.keys(read([sale(1),sale(2)])).sort(),["keptOrders","repeatBuyer"]);
is("one session twice",read([sale(1),sale(1)]).keptOrders,1);
is("one payment twice",read([sale(1),sale(2,undefined,{paymentIntent:"pi_1"})]).keptOrders,1);
is("post-purchase extra excluded",read([sale(1),sale(2,undefined,{upsell:true})]).repeatBuyer,false);
for(const row of [
 {...sale(1).row,livemode:false},
 {...sale(1).row,payment_status:"unpaid"},
 {...sale(1).row,status:"open"},
 {...sale(1).row,metadata:{store:"another-store"}},
 {...sale(1).row,metadata:{store:"own-store",kind:"tip"}},
 {...sale(1).row,metadata:{store:"own-store",kind:"request"}},
 {...sale(1).row,id:"pi_1"},
])is("unverified or unrelated payment excluded",read([sale(1,undefined,{row})]).keptOrders,0);
is("previous own handle accepted",read([sale(1,undefined,{row:{...sale(1).row,metadata:{store:"old-own"}}})]).keptOrders,1);
is("unknown refunds cannot prove completion",read([sale(1),sale(2)],null),{repeatBuyer:null,keptOrders:null});
is("full refund removes repeat",read([sale(1),sale(2)],[{cents:1000,currency:"usd",paymentIntent:"pi_2"}]),{repeatBuyer:false,keptOrders:1});
is("partial refund leaves a purchase",read([sale(1),sale(2)],[{cents:999,currency:"usd",paymentIntent:"pi_2"}]).repeatBuyer,true);
is("refund currency mismatch unavailable",read([sale(1)],[{cents:1,currency:"eur",paymentIntent:"pi_1"}]),{repeatBuyer:null,keptOrders:null});
is("incomplete absence is unknown",read([sale(1)],[],true),{repeatBuyer:null,keptOrders:null});
is("incomplete positive repeat witness",read([sale(1),sale(2)],[],true).repeatBuyer,true);
is("ten remaining witnesses suffice",read(Array.from({length:10},(_,i)=>sale(i+1)),[],true).keptOrders,10);
is("nine remaining are inconclusive in partial reading",read(Array.from({length:9},(_,i)=>sale(i+1)),[],true).keptOrders,null);
is("missing buyer address cannot prove no repeat",read([sale(1,"")]).repeatBuyer,null);
done();
