/** Missing or malformed direction must never turn into a downward reorder. */
export function readOptionDirection(raw: unknown): "up" | "down" | null {
  if (typeof raw !== "object" || raw === null || Array.isArray(raw)
    || !Object.hasOwn(raw, "direction")) return null;
  const direction = (raw as { direction?: unknown }).direction;
  return direction === "up" || direction === "down" ? direction : null;
}
