import { numbersContext } from "@/lib/numbers-ask";
import { funnelTool } from "@/lib/mcp-tools";
import type { StatsData } from "@/lib/stats";
import { done, is, part } from "./check";
const current={visitors:50,views:100,checkouts:10,sales:2,cents:10000};
const prior={visitors:0,views:0,checkouts:0,sales:1,cents:5000};
const data={sales:"ok",currency:"usd",days:[],products:[],totals:{d7:current,d30:current,d90:current,all:current},previous:{d7:prior,d30:prior,d90:prior},previousTrafficAvailable:{d7:false,d30:true,d90:true}} as unknown as StatsData;
const reports=(snapshot:StatsData)=>[
 {name:"AI",read:(numbersContext(snapshot).last_7_days as Record<string,unknown>),key:"the_same_number_of_days_before"},
 {name:"MCP",read:funnelTool(snapshot,"d7") as unknown as Record<string,unknown>,key:"the_same_days_before"},
];
part("Prior traffic is independent of paid history");
for(const report of reports(data)){
 const before=report.read[report.key] as Record<string,unknown>;
 is(report.name+" availability",report.read.previous_traffic_available,false);
 is(report.name+" unavailable traffic",[before.visitors,before.page_views,before.checkouts_started],[null,null,null]);
 is(report.name+" current traffic",[report.read.visitors,report.read.page_views,report.read.checkouts_started],[50,100,10]);
 is(report.name+" paid prior count retained",before.sales,1);
 is(report.name+" paid prior money retained",before.revenue,report.name==="AI"?"$50":5000);
}
part("Confirmed zero, legacy and absent histories");
for(const report of reports({...data,previousTrafficAvailable:{d7:true,d30:false,d90:false}})){
 const before=report.read[report.key] as Record<string,unknown>;
 is(report.name+" real zero",[report.read.previous_traffic_available,before.visitors,before.checkouts_started],[true,0,0]);
}
for(const report of reports({...data,previousTrafficAvailable:undefined}))is(report.name+" legacy confirmed history",report.read.previous_traffic_available,true);
for(const report of reports({...data,previous:undefined}))is(report.name+" missing history",[report.read.previous_traffic_available,report.read[report.key]],[false,null]);
part("Independent paid availability");
for(const report of reports({...data,partial:true})){
 const before=report.read[report.key] as Record<string,unknown>;
 is(report.name+" partial paid figures absent",[before.sales??null,before.revenue??null],[null,null]);
 is(report.name+" partial retains current traffic",report.read.visitors,50);
}
is("source snapshot unchanged",data.previous?.d7,prior);
done();
