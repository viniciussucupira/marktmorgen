import type { FunnelLaunchIssue, FunnelLaunchStep } from "@/lib/funnel-launch-review";

/** A manual handoff from saved configuration only. Never includes metrics, buyers or edit links. */
export function funnelLaunchChecklist(name: string, enabled: boolean, steps: readonly Pick<FunnelLaunchStep,"title"|"open"|"product"|"free">[], issues: readonly Pick<FunnelLaunchIssue,"title"|"detail">[], kind: "funnel" | "store" = "funnel"): string {
  const plain = (text: string) => text.replace(/\s+/g," ").trim();
  const lines = [
    kind === "store" ? "Marktmorgen — saved store activation checklist" : "Marktmorgen — saved funnel launch checklist",
    (kind === "store" ? "Store: " : "Funnel: ")+plain(name),
    (kind === "store" ? "Saved offer visibility status: " : "Saved address status: ")+(enabled?"On":"Off"),
    "",
    "This is a saved-settings review, not proof of a working checkout, delivery or sales. Recheck the current studio before sharing.",
    "",
    "Saved launch review:",
    ...(issues.length ? issues.map(issue=>"[ ] "+plain(issue.title)+" — "+plain(issue.detail)) : ["No launch issues were reported from saved settings. Manual testing is still required."]),
    "",
    "Walk the saved steps in order:",
    ...steps.map((step,index)=>"[ ] Step "+(index+1)+": "+plain(step.title)+(kind === "store" ? (step.open?" (completed in saved settings).":" (still to review).") : " ("+(step.product?(step.free?"free product":"paid product"):"page")+(step.open?"; available in saved review":"; unavailable in saved review")+").")),
    ...(steps.length?[]:[kind === "store" ? "[ ] Prepare and review your first offer." : "[ ] Add and review at least one step."]),
    "",
    "Manual checks — not performed by this checklist:",
    "[ ] Open the journey on a phone and a computer; check layout and readable content.",
    "[ ] Follow every button and link to the intended next step.",
    "[ ] Check forms, consent wording, confirmation and delivery with synthetic details.",
    ...(steps.some(step=>step.product&&!step.free)?["[ ] When payments are available, use your payment provider's sandbox to check price, tax, checkout and delivery."]:[]),
    kind === "store" ? "[ ] Review your offer and choose Publish yourself. Paid selling still requires all sales gates." : "[ ] Resolve the saved launch issues and review again before sharing the funnel address.",
    "",
    kind === "store" ? "Only saved store/checklist names and checks are added here. Buyer records and performance totals are not included." : "Only saved funnel/step names and launch issues are added here. Buyer records and performance totals are not included. Review this text before sharing."
  ];
  return lines.join("\n");
}
