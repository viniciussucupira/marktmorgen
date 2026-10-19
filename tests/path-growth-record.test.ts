import {parsePath,pathJson,type PathRecord} from "@/lib/path";
import {done,is,part} from "./check";
const record:PathRecord={answers:{goalCents:0,goalCurrency:"usd",skills:"Teaching",subject:"Guides",minutes:15,audience:"none",timeZone:"America/New_York"},startedAt:1790000000000,checkins:["2026-10-19"],best:0,bestAt:1790000000000,money:{at:1790000000000,test:false,real:2,cents:2000,currency:"usd",growth:{repeatBuyer:true,keptOrders:2}},counts:null};
part("Growth witnesses remain small and private in the existing Path record");
is("growth survives the existing record round trip",parsePath(pathJson(record))?.money?.growth,{repeatBuyer:true,keptOrders:2});
const raw=JSON.parse(pathJson(record));
delete raw.m.growth;
is("legacy record has no invented witness",parsePath(JSON.stringify(raw))?.money?.growth,undefined);
for(const growth of [{repeatBuyer:"yes",keptOrders:2},{repeatBuyer:true,keptOrders:-1},{repeatBuyer:true,keptOrders:1.5},{repeatBuyer:true}]){
 raw.m.growth=growth;
 is("invalid witness discarded",parsePath(JSON.stringify(raw))?.money?.growth,undefined);
}
raw.m.growth={repeatBuyer:true,keptOrders:2,buyer:"private@example.test"};
const parsed=parsePath(JSON.stringify(raw))!;
is("only booleans and count retained",parsed.money?.growth,{repeatBuyer:true,keptOrders:2});
is("extra identity is not reserialized",pathJson(parsed).includes("private@example.test"),false);
done();
