import type { FunnelLaunchIssue, FunnelLaunchStep } from "@/lib/funnel-launch-review";

/** A manual handoff from saved configuration only. Never includes metrics, buyers or edit links. */
export function funnelLaunchChecklist(name: string, enabled: boolean, steps: readonly Pick<FunnelLaunchStep,"title"|"open"|"product"|"free">[], issues: readonly Pick<FunnelLaunchIssue,"title"|"detail">[]): string {
  const plain = (text: string) => text.replace(/\s+/g," ").trim();
  const lines = [
    "Marktmorgen — saved funnel launch checklist",
    "Funnel: "+plain(name),
    "Saved address status: "+(enabled?"On":"Off"),
    "",
    "This is a saved-settings review, not proof of a working checkout, delivery or sales. Recheck the current studio before sharing.",
    "",
    "Saved launch review:",
    ...(issues.length ? issues.map(issue=>"[ ] "+plain(issue.title)+" — "+plain(issue.detail)) : ["No launch issues were reported from saved settings. Manual testing is still required."]),
    "",
    "Walk the saved steps in order:",
    ...steps.map((step,index)=>"[ ] Step "+(index+1)+": "+plain(step.title)+" ("+(step.product?(step.free?"free product":"paid product"):"page")+(step.open?"; available in saved review":"; unavailable in saved review")+")."),
    ...(steps.length?[]:["[ ] Add and review at least one step."]),
    "",
    "Manual checks — not performed by this checklist:",
    "[ ] Open the journey on a phone and a computer; check layout and readable content.",
    "[ ] Follow every button and link to the intended next step.",
    "[ ] Check forms, consent wording, confirmation and delivery with synthetic details.",
    ...(steps.some(step=>step.product&&!step.free)?["[ ] When payments are available, use your payment provider's sandbox to check price, tax, checkout and delivery."]:[]),
    "[ ] Resolve the saved launch issues and review again before sharing the funnel address.",
    "",
    "Only saved funnel/step names and launch issues are added here. Buyer records and performance totals are not included. Review this text before sharing."
  ];
  return lines.join("\n");
}
