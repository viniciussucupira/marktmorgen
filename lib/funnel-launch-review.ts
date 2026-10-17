export type FunnelLaunchStep = { title: string; open: boolean; why: string; product: boolean; free: boolean };
export type FunnelLaunchIssue = { code: "disabled" | "empty" | "step" | "payments" | "payments_unknown" | "form" | "forms_unknown"; title: string; detail: string; stepIndex?: number };
/** Saved configuration checks only; never proof of checkout, delivery or conversion. */
export function funnelLaunchIssues(enabled: boolean, steps: readonly FunnelLaunchStep[], paymentsAvailable: boolean | null): FunnelLaunchIssue[] {
  const issues: FunnelLaunchIssue[] = [];
  if (!enabled) issues.push({ code: "disabled", title: "The funnel address is disabled", detail: "Review its settings and enable it only after preparing and testing the journey." });
  if (!steps.length) issues.push({ code: "empty", title: "There are no steps to visit", detail: "Choose at least one existing page or product in the funnel settings." });
  steps.forEach((step, stepIndex) => {
    if (!step.open) issues.push({ code: "step", title: `Step ${stepIndex + 1}: ${step.title}`, detail: step.why || "This step is unavailable to visitors. Review the page or product before sharing.", stepIndex });
  });
  if (steps.some(step => step.open && step.product && !step.free)) {
    if (paymentsAvailable === false) issues.push({ code: "payments", title: "Store payments are unavailable", detail: "A paid step is visible, but the saved store configuration does not currently allow Stripe or PayPal sales. The owner should review the payment connection and store plan." });
    else if (paymentsAvailable === null) issues.push({ code: "payments_unknown", title: "Store payments have not been checked", detail: "Ask the owner to review payment availability before sharing a paid offer." });
  }
  return issues;
}
