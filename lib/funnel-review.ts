/** Readiness and descriptive checks. Counts are estimates, never proof of causality. */
export type ReviewStep = { title: string; open: boolean; why: string; product: boolean; free: boolean; seen: number; done: number };
export type FunnelReview = { ready: boolean; open: number; issues: string[]; observation: string | null };
export function reviewFunnel(steps: readonly ReviewStep[]): FunnelReview {
  const issues = steps.flatMap((step, i) => step.open ? [] : ["Step " + (i + 1) + ", " + step.title + ": " + (step.why || "not available to visitors")]);
  if (!steps.length) issues.push("Choose at least one step.");
  const invalid = steps.some(s => !Number.isFinite(s.seen) || !Number.isFinite(s.done) || s.seen < 0 || s.done < 0);
  if (invalid) issues.push("Some counts could not be read. Review the data before comparing results.");
  const inconsistent = steps.some(s => s.open && s.product && s.done > s.seen);
  if (inconsistent) issues.push("A completion count exceeds its page count. These independently estimated counts are not a reliable conversion rate.");
  const open = steps.filter(s => s.open).length;
  const eligible = steps.filter(s => s.open && s.product && !s.free && s.seen >= 30 && s.done <= s.seen && Number.isFinite(s.seen) && Number.isFinite(s.done));
  const lowest = eligible.slice().sort((a,b) => a.done / a.seen - b.done / b.seen)[0];
  let observation: string | null = null;
  if (!invalid && !inconsistent && lowest) observation = lowest.title + ": " + lowest.done + " paid out of approximately " + lowest.seen + " people who opened this step. Review the offer and test the checkout as a buyer. These counts do not explain why someone left.";
  else if (!invalid && !inconsistent && open) observation = "More visits are needed for a useful numerical comparison. Check the pages and payment path first.";
  return { ready: steps.length > 0 && open === steps.length, open, issues, observation };
}
