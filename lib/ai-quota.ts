/** Exact counters plus confirmed expiry from the AI quota reservation pipeline. */
export function confirmedAiReservation(raw: unknown, increments: readonly number[]): number[] | null {
  if (!increments.length || increments.some(value => !Number.isSafeInteger(value) || value < 1) || !Array.isArray(raw) || raw.length !== increments.length * 2) return null;
  const counters: number[] = [];
  for (let i = 0; i < increments.length; i++) {
    const counter: unknown = raw[i * 2];
    if (typeof counter !== "number" || !Number.isSafeInteger(counter) || counter < increments[i] || raw[i * 2 + 1] !== 1) return null;
    counters.push(counter);
  }
  return counters;
}
