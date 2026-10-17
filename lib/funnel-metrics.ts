type Counts = { seen: number | null; done: number | null; product: boolean; free: boolean };
const confirmed = (value: number | null): value is number => value !== null && Number.isSafeInteger(value) && value >= 0;
const share = (part: number, whole: number) => whole > 0 ? `${Math.round(part / whole * 100)}%` : "–";

/** Customer-facing metrics must distinguish unavailable data from measured zero. */
export function funnelStepMetrics({ seen, done, product, free }: Counts): string {
  if (!confirmed(seen) || !confirmed(done)) return "Counts unavailable. Reload to try again.";
  const people = `${seen.toLocaleString("en-US")} ${seen === 1 ? "person" : "people"} opened it`;
  return people + (product ? ` · ${done.toLocaleString("en-US")} ${free ? "signed up" : "paid"} (${share(done, seen)})` : "");
}

/** Step cardinalities are a reach ratio, not proof that the same visitors completed the journey. */
export function funnelReachRatioMetric(first: number | null, last: number | null): string {
  return confirmed(first) && confirmed(last) && first > 0
    ? `Last-step opens compared with first-step opens: ${share(last, first)}. `
    : "";
}
