import {pathGrowthMissions,type PathGrowthFacts} from "@/lib/path-growth-rules";
import {done,is,part} from "./check";
const empty:PathGrowthFacts={realSale:false,fileProducts:null,listEmailSent:null,repeatBuyer:null,postPurchaseOffer:null,buyerReview:null,keptOrders:null};
part("Six post-sale missions depend on server facts");
is("no growth before a real sale",pathGrowthMissions(empty),[]);
const unknown=pathGrowthMissions({...empty,realSale:true});
is("six distinct missions",new Set(unknown.map(m=>m.id)).size,6);
is("missing evidence stays unknown",unknown.map(m=>m.state),Array(6).fill("unknown"));
const open=pathGrowthMissions({realSale:true,fileProducts:1,listEmailSent:false,repeatBuyer:false,postPurchaseOffer:false,buyerReview:false,keptOrders:9});
is("below each factual threshold",open.map(m=>m.state),Array(6).fill("open"));
const completed=pathGrowthMissions({realSale:true,fileProducts:2,listEmailSent:true,repeatBuyer:true,postPurchaseOffer:true,buyerReview:true,keptOrders:10});
is("all six require their own facts",completed.map(m=>m.state),Array(6).fill("done"));
for(let index=0;index<6;index++){
 const facts={realSale:true,fileProducts:1,listEmailSent:false,repeatBuyer:false,postPurchaseOffer:false,buyerReview:false,keptOrders:9};
 const keys=["fileProducts","listEmailSent","repeatBuyer","postPurchaseOffer","buyerReview","keptOrders"] as const;
 const changed={...facts,[keys[index]]:index===0?2:index===5?10:true};
 is("one fact closes only its own mission "+index,pathGrowthMissions(changed).map(m=>m.state),keys.map((_,i)=>i===index?"done":"open"));
}
is("instructions always have a destination",unknown.every(m=>m.steps.length>0&&m.destination.length>0),true);
is("no buyer identities in mission model",JSON.stringify(completed).includes("@"),false);
done();
