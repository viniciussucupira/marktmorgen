import { can, type Permission, type Role } from "@/lib/team-roles";
export type GrowthGoal = "leads" | "sales" | "services" | "retention";
export const GROWTH_GOALS: { id: GrowthGoal; label: string; hint: string }[] = [
  { id: "leads", label: "Grow my list", hint: "Offer something useful and welcome people who choose to hear from you." },
  { id: "sales", label: "Sell more products", hint: "Connect your offer, its pages and the next purchase." },
  { id: "services", label: "Close service deals", hint: "Qualify enquiries and keep a next action for every opportunity." },
  { id: "retention", label: "Keep customers", hint: "Help buyers use what they bought and review repeat purchases." },
];
export function growthGoal(raw: unknown): GrowthGoal { return GROWTH_GOALS.find(g => g.id === raw)?.id ?? "sales"; }
export type GrowthAction = { title: string; why: string; path: string; need: Permission };
const ACTIONS: Record<GrowthGoal, GrowthAction[]> = {
  leads: [
    { title: "Create a useful free product", why: "Choose a specific problem and make the free offer useful on its own.", path: "", need: "products" },
    { title: "Connect the pages", why: "Lead from the free product to one relevant paid offer; check each step before sharing.", path: "funnels", need: "products" },
    { title: "Prepare the welcome sequence", why: "Send only to confirmed subscribers who agreed to hear from you.", path: "email", need: "send" },
  ],
  sales: [
    { title: "Review the sales page", why: "Explain who the product helps, what is delivered and its real conditions.", path: "pages", need: "products" },
    { title: "Review the buying journey", why: "Check the pages, checkout and relevant offers as a buyer.", path: "funnels", need: "products" },
    { title: "Check results", why: "Compare visits, paid orders, refunds and costs before changing your offer.", path: "#numbers", need: "stats" },
  ],
  services: [
    { title: "Ask the right questions", why: "Use an application form to understand what the prospective client needs.", path: "forms", need: "page" },
    { title: "Plan the next action", why: "Name the opportunity, who is responsible and when to follow up.", path: "deals", need: "orders" },
    { title: "Prepare the service offer", why: "Make the scope, price and booking conditions clear.", path: "", need: "products" },
  ],
  retention: [
    { title: "Understand your buyers", why: "Review purchases and notes before recommending anything else.", path: "people", need: "orders" },
    { title: "Prepare useful follow-up", why: "Help people use their purchase; stop sales messages when their goal is reached.", path: "email", need: "send" },
    { title: "Review the results", why: "Check recurring revenue and cancellations; a change is a signal to investigate.", path: "#numbers", need: "stats" },
  ],
};
export function growthActions(goal: GrowthGoal, role: Role): GrowthAction[] { return ACTIONS[goal].filter(a => can(role, a.need)); }
