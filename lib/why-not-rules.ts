/**
 * The answers to "is anything stopping you from buying?" (lib/page-depth.ts,
 * components/page-depth.tsx), in the order they are offered. Browser-safe.
 */
export const WHY_NOT = ["price", "fit", "details", "later", "other"] as const;

export type WhyNot = (typeof WHY_NOT)[number];

export function isWhyNot(raw: unknown): raw is WhyNot {
  return typeof raw === "string" && (WHY_NOT as readonly string[]).includes(raw);
}

/** What each answer is called in the studio, which speaks English. */
export const WHY_NOT_NAMES: Record<WhyNot, string> = {
  price: "The price",
  fit: "Not sure it is for them",
  details: "They need more details",
  later: "They will decide later",
  other: "Something else",
};
