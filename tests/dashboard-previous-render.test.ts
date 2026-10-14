import { StatsPanel } from "@/components/stats-panel";
import { readStats, studioStats, type StatsData } from "@/lib/stats";
import { claimHandle, ensureStatsId, storeForEmail } from "@/lib/store";
import { createElement } from "react";
import { renderToStaticMarkup } from "react-dom/server";
import { done, is } from "./check";
process.env.NIMBUS_DATA_KEY="a-local-key-for-tests-only-0123456789abcdef";
const OWNER="dashboard-previous@example.com";
const totals={visitors:50,views:100,checkouts:10,sales:2,cents:10000};
const before={visitors:0,views:0,checkouts:0,sales:1,cents:5000};
const render=(data:StatsData)=>renderToStaticMarkup(createElement(StatsPanel,{data,canExport:false,askHeard:false}));
function tile(html:string,label:string):string { const start=html.indexOf(">"+label+"</dt>");return html.slice(start,html.indexOf("</div>",start)); }
async function main(){
 await claimHandle(OWNER,"dashboard-previous","Coverage Store","");
 await ensureStatsId(OWNER);
 const store=(await storeForEmail(OWNER))!;
 const stats=await readStats(store,Date.UTC(2026,9,14));if(!stats)throw Error("Missing test stats");
 const base=studioStats(store,stats,null,"none",[]);
 const data={...base,sales:"ok",totals:{...base.totals,d7:totals,all:totals},previous:{...base.previous,d7:before},previousTrafficAvailable:{d7:false,d30:true,d90:true}} as StatsData;
 const unknown=render(data);
 is("missing previous traffic has visible status",unknown.includes("Previous traffic figures are unavailable"),true);
 for(const label of ["Visitors","Page views","Checkouts started"]){
  is(label+" does not claim no prior activity",tile(unknown,label).includes("None in the"),false);
 }
 is("current visitors remain visible",tile(unknown,"Visitors").includes(">50</dd>"),true);
 is("current page views remain visible",tile(unknown,"Page views").includes(">100</dd>"),true);
 is("current checkouts remain visible",tile(unknown,"Checkouts started").includes(">10</dd>"),true);
 is("confirmed purchase comparison remains visible",tile(unknown,"Sales").includes("100%"),true);
 is("confirmed purchase revenue comparison remains visible",tile(unknown,"Revenue").includes("100%"),true);
 const zero=render({...data,previousTrafficAvailable:{...data.previousTrafficAvailable!,d7:true}});
 is("confirmed zero prior traffic keeps its label",tile(zero,"Visitors").includes("None in the 7 days before"),true);
 is("confirmed zero prior traffic has no unavailable notice",zero.includes("Previous traffic figures are unavailable"),false);
 is("other missing windows do not block selected traffic",render({...data,previousTrafficAvailable:{d7:true,d30:false,d90:true}}).includes("Previous traffic figures are unavailable"),false);
 const absent=render({...data,previous:undefined} as unknown as StatsData);
 is("absent prior object has unavailable notice",absent.includes("Previous traffic figures are unavailable"),true);
 const partial=render({...data,partial:true});
 is("partial paid reading still retains current visitors",tile(partial,"Visitors").includes(">50</dd>"),true);
 is("partial paid reading has no revenue comparison",tile(partial,"Revenue").includes("100%"),false);
 const known=render({...data,previousTrafficAvailable:{...data.previousTrafficAvailable!,d7:true},previous:{...data.previous,d7:{...before,visitors:25,views:50,checkouts:5}}});
 is("confirmed positive traffic has its real change",tile(known,"Visitors").includes("100%"),true);
 is("legacy snapshot without new flag retains reported comparison",tile(render({...data,previousTrafficAvailable:undefined}),"Visitors").includes("None in the 7 days before"),true);
 is("rendering preserves the source snapshot",data.previous.d7.visitors,0);
 done();
}
main().catch(error=>{console.error(error);process.exit(1);});
