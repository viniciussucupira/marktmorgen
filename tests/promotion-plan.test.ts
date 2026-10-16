import { promotionChoices, promotionLink, MAX_PROMOTION_PRODUCTS } from "@/lib/promotion-plan";
import type { StatsData } from "@/lib/stats";
import { done, is, part } from "./check";

const row = (views: number, cents: number) => ({ views, checkouts: 0, sales: cents ? 1 : 0, cents });
const data = {
 sales: "ok", partial: false, products: [
  { id: "revenue", d7: row(10, 5000), d30: row(1, 0), d90: row(10, 5000) },
  { id: "traffic", d7: row(500, 0), d30: row(600, 8000), d90: row(500, 0) },
  { id: "private", d7: row(900, 99000), d30: row(900, 99000), d90: row(900, 99000) },
 ], channels: { d7: [
  { source: "direct", cents: 99999, visits: 900 },
  { source: "x", cents: 5000, visits: 20 },
  { source: "instagram", cents: 2000, visits: 100 },
 ], d30: [], d90: [] },
} as unknown as StatsData;
const products = [
 { id: "traffic", title: "Traffic", url: "https://shop.example/p/traffic?coupon=SAVE#details" },
 { id: "revenue", title: "Revenue", url: "https://shop.example/p/revenue" },
];
part("Recommendations use the selected period and eligible products");
is("revenue first", promotionChoices(data,"d7",products).products.map(p=>p.id),["revenue","traffic"]);
is("new period changes ranking", promotionChoices(data,"d30",products).products[0].id,"traffic");
is("only server-approved products", promotionChoices(data,"d7",products).products.some(p=>p.id==="private"),false);
is("identified supported revenue channel", promotionChoices(data,"d7",products).channel,"x");
is("unknown sources do not become named recommendations",promotionChoices({...data,channels:{...data.channels,d7:[{source:"direct",cents:1,visits:1,checkouts:0,sales:1,free:0}]}}, "d7",products).channelEvidence,null);
part("Financial coverage and traffic");
for (const incomplete of [{...data,partial:true},{...data,sales:"error" as const},{...data,sales:"none" as const}]) {
 const p=promotionChoices(incomplete,"d7",products);
 is("incomplete paid data never ranks by revenue",[p.known,p.products[0].id,p.channel],[false,"traffic","instagram"]);
}
is("empty products",promotionChoices(data,"d7",[]).products,[]);
is("missing product measurement remains absent",promotionChoices(data,"d7",[{id:"new",title:"New",url:"https://shop.example/p/new"}]).products[0].figures,null);
part("Bounded and safe choices");
const many=Array.from({length:100},(_,i)=>({id:String(i),title:String(i),url:"https://shop.example/p/"+i}));
is("choice cap",promotionChoices(data,"d7",many).products.length,MAX_PROMOTION_PRODUCTS);
is("deduplicate",promotionChoices(data,"d7",[...products,...products]).products.length,2);
is("reject executable and insecure urls",promotionChoices(data,"d7",[
 {id:"a",title:"A",url:"javascript:alert(1)"},{id:"b",title:"B",url:"http://shop.example"},
 {id:"c",title:"C",url:"not a URL"},
]).products.length,0);
part("Campaign links preserve attribution and commercial parameters");
const link=promotionLink(products[0],"email","Launch 2026","email","First email");
const url=new URL(link);
is("campaign",url.searchParams.get("utm_campaign"),"launch-2026");
is("variant",url.searchParams.get("utm_content"),"first-email");
is("source and medium",[url.searchParams.get("utm_source"),url.searchParams.get("utm_medium")],["email","email"]);
is("coupon and anchor",[url.searchParams.get("coupon"),url.hash],["SAVE","#details"]);
is("blank name blocks",promotionLink(products[0],"x"," !!! ","post",""),"");
is("unsafe link blocks",promotionLink({...products[0],url:"javascript:alert(1)"},"x","launch","post",""),"");
const replaced=new URL(promotionLink({...products[0],url:link},"x","Next","post",""));
is("tags replace, never duplicate",replaced.searchParams.getAll("utm_campaign"),["next"]);
is("empty creative clears old variant",replaced.searchParams.has("utm_content"),false);
done();
