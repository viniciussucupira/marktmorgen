import type { FunnelLaunchIssue } from "@/lib/funnel-launch-review";
import type { FunnelFinding } from "@/lib/funnel-diagnosis";

export type FunnelNextCheck = {
 phase:"launch"|"data"|"journey"|"sample"|"test";
 title:string;detail:string;stepIndex?:number;formId?:string;
 action:"settings"|"payments"|"forms"|"step"|"none";
};
export const NEXT_CHECK_NOTE="Suggested order for manual checks, from saved configuration and approximate counts. This is not a forecast or an experiment result.";
/** Deterministic priority, without a new read, a model call or a mutation. */
export function funnelNextCheck(issues:readonly FunnelLaunchIssue[],findings:readonly FunnelFinding[]):FunnelNextCheck {
 const issue=issues[0];
 if(issue)return {phase:"launch",title:issue.title,detail:issue.detail,stepIndex:issue.stepIndex,formId:issue.formId,
 action:issue.formId?"forms":issue.code==="disabled"||issue.code==="empty"?"settings":issue.code==="payments"||issue.code==="payments_unknown"?"payments":issue.stepIndex!==undefined?"step":"none"};
 const finding=findings.find(item=>item.code==="unavailable")
   ??findings.find(item=>item.code==="unreached")
   ??findings.find(item=>item.code==="none_completed")
   ??findings.find(item=>item.code==="largest_fall")
   ??findings.find(item=>item.code==="too_few");
 if(finding)return {phase:finding.code==="unavailable"?"data":finding.code==="too_few"?"sample":"journey",title:finding.title,detail:finding.detail,stepIndex:finding.stepIndex,action:finding.stepIndex===undefined?"none":"step"};
 return {phase:"test",title:"Test the complete customer journey",detail:"These saved checks found no issue to prioritize. Review the offer, form consent, checkout and delivery as a customer before sharing. Counts alone do not verify those steps or explain results.",action:"none"};
}
