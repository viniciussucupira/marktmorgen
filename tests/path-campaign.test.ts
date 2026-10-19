import { pathCampaign } from "@/lib/path-campaign";
import { readStarterGoal, matchingStarters, starterCard } from "@/lib/funnel-starter-catalog";
import { FUNNEL_STARTERS } from "@/lib/funnel-starters";
import { dayMissions, trafficMissions, NO_FACTS } from "@/lib/path-rules";
import { done, is, part } from "./check";
part("Only an open matching mission suggests a campaign");
for(const id of ["product","sale"] as const) is(id,pathCampaign({id,state:"open"})?.goal,"sales");
is("lead",pathCampaign({id:"lead",state:"open"})?.goal,"leads");
for(const state of ["done","unavailable"] as const) is(state,pathCampaign({id:"product",state}),null);
is("no mission",pathCampaign(null),null);
const answers={minutes:15 as const,audience:"none" as const,subject:"",skills:""};
for(const mission of [...dayMissions(NO_FACTS,answers),...trafficMissions(NO_FACTS)]) {
 const choice=pathCampaign(mission);
 if(choice) is(mission.id+" has actual starters",matchingStarters(FUNNEL_STARTERS.map(starterCard),choice.goal,"").length>0,true);
}
is("test has no shortcut",pathCampaign({id:"test",state:"open"}),null);
is("lead traffic target",pathCampaign({id:"traffic-4",state:"open"})?.goal,"leads");
is("visitor target not misclassified",pathCampaign({id:"traffic-5",state:"open"}),null);
is("form responses are not presented as Path contacts",pathCampaign({id:"lead",state:"open"})?.why.includes("form response alone does not count"),true);
part("URL goals are allowlisted");
for(const raw of [null,undefined,["sales"],{}, "__proto__","SALES","sales<script>","all"]) is(String(raw),readStarterGoal(raw),"all");
for(const goal of ["sales","leads","teaching","services"]) is(goal,readStarterGoal(goal),goal);
done();
