import { GROWTH_GOALS, growthActions, growthGoal } from "@/lib/growth-plan";
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
done();
