type Counts = { seen: number | null; done: number | null; product: boolean; free: boolean };
const confirmed = (value: number | null): value is number => value !== null && Number.isSafeInteger(value) && value >= 0;
const share = (part: number, whole: number) => whole > 0 ? `${Math.round(part / whole * 100)}%` : "–";

/** Customer-facing metrics must distinguish unavailable data from measured zero. */
export function funnelStepMetrics({ seen, done, product, free }: Counts): string {
  if (!confirmed(seen) || !confirmed(done)) return "Counts unavailable. Reload to try again.";
  const people = `${seen.toLocaleString("en-US")} ${seen === 1 ? "person" : "people"} opened it`;
  return people + (product ? ` · ${done.toLocaleString("en-US")} ${free ? "signed up" : "paid"} (${share(done, seen)})` : "");
}

/** Do not infer a completion rate from missing measurements or an empty denominator. */
export function funnelCompletionMetric(first: number | null, last: number | null): string {
  return confirmed(first) && confirmed(last) && first > 0
    ? `${share(last, first)} of the people who opened the first step reached the last. `
    : "";
}
