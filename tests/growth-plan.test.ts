import { GROWTH_GOALS, growthActions, growthGoal, growthCampaignGoal, growthReview } from "@/lib/growth-plan";
import { can, type Role } from "@/lib/team-roles";
import { is, done } from "./check";
for (const role of ["owner","admin","editor","support"] as Role[]) for (const goal of GROWTH_GOALS) {
  is("every action honours current permission:"+role+"/"+goal.id,growthActions(goal.id,role).every(action=>can(role,action.need)),true);
}
is("array query rejected",growthGoal(["leads"]),"sales");
is("prototype query rejected",growthGoal("constructor"),"sales");
is("support gets only service follow-up",growthActions("services","support").map(action=>action.path),["deals"]);
is("support cannot use lead tools",growthActions("leads","support"),[]);
is("editor is not offered sending",growthActions("leads","editor").some(action=>action.path==="email"),false);
is("editor has forms through page permission",growthActions("services","editor").some(action=>action.path==="forms"),true);
for(const role of ["owner","admin","editor","support"] as Role[]){
  for(const goal of GROWTH_GOALS){
    is("campaign discovery honours page permission and has no retention substitute:"+role+"/"+goal.id,growthCampaignGoal(goal.id,role),goal.id!=="retention"&&can(role,"page")?goal.id:null);
  }
}
for(const role of ["owner","admin","editor","support"] as Role[])for(const goal of GROWTH_GOALS){
 is("measurement guidance follows stats permission:"+role+"/"+goal.id,Boolean(growthReview(goal.id,role)),can(role,"stats"));
}
is("sales review distinguishes gross from profit",growthReview("sales","owner")?.review.includes("Gross payments are not profit"),true);
is("retention uses comparable observation periods",growthReview("retention","owner")?.review.includes("same time to return"),true);
is("leads require confirmed subscribers",growthReview("leads","owner")?.baseline.includes("confirmed subscribers"),true);
is("service review uses enquiry cohorts",growthReview("services","owner")?.review.includes("same enquiry cohort"),true);
done();
