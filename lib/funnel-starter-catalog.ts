import type { FunnelStarter } from "@/lib/funnel-starters";

export const STARTER_GOALS = ["leads", "sales", "teaching", "services"] as const;
export type StarterGoal = (typeof STARTER_GOALS)[number];
export const STARTER_GOAL_LABELS: Record<StarterGoal, string> = {
  leads: "Grow your audience",
  sales: "Sell a product",
  teaching: "Teach or build a membership",
  services: "Book calls or find clients",
};

/** Only this small, public outline reaches the browser; no page blocks or store records. */
export type StarterCard = {
  id: string;
  label: string;
  hint: string;
  goal: StarterGoal;
  pages: number;
  forms: number;
  products: { label: string; wants: "free" | "paid" }[];
  steps: { title: string; kind: "page" | "product" }[];
};

const GOALS: Record<string, StarterGoal> = {
  "guide-signup": "leads",
  "launch-waitlist": "leads",
  "coaching-application": "services",
  "paid-call": "services",
  membership: "teaching",
  "course-free-lesson": "teaching",
  "recorded-workshop": "teaching",
  "digital-product": "sales",
  "course-launch": "teaching",
};

/** Derived from the actual bundle so the preview cannot drift from what is created. */
export function starterCard(starter: FunnelStarter): StarterCard {
  const { bundle } = starter;
  return {
    id: starter.id,
    label: starter.label,
    hint: starter.hint,
    goal: GOALS[starter.id] ?? "sales",
    pages: bundle.pages.length,
    forms: bundle.forms.length,
    products: bundle.products.map(({ label, wants }) => ({ label, wants })),
    steps: bundle.steps.map((step) => ({
      kind: step.kind,
      title: (step.kind === "page" ? bundle.pages.find((page) => page.ref === step.ref)?.title : bundle.products.find((product) => product.ref === step.ref)?.label) ?? "Step",
    })),
  };
}

const searchable = (value: string) => value.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/** All terms must match. Filtering is local and never spends a preview request. */
export function matchingStarters(cards: readonly StarterCard[], goal: StarterGoal | "all", query: string): StarterCard[] {
  const terms = searchable(query.trim().slice(0, 100)).split(/\s+/).filter(Boolean);
  return cards.filter((card) => {
    if (goal !== "all" && card.goal !== goal) return false;
    const words = searchable([card.label, card.hint, STARTER_GOAL_LABELS[card.goal], ...card.products.map((p) => p.label), ...card.steps.map((s) => s.title)].join(" "));
    return terms.every((term) => words.includes(term));
  });
}
