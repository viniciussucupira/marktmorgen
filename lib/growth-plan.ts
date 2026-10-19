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

/** Static discovery only; campaign setup needs the existing page permission. */
export function growthCampaignGoal(goal: GrowthGoal, role: Role): import("@/lib/funnel-starter-catalog").StarterGoal | null {
  return goal !== "retention" && can(role,"page") ? goal : null;
}

export type GrowthReview={question:string;baseline:string;change:string;review:string};
const REVIEWS:Record<GrowthGoal,GrowthReview>={
 leads:{question:"Are the right people choosing to hear from you?",baseline:"Record the same date range and traffic source for visits and confirmed subscribers. Note how consent and duplicate sign-ups are counted.",change:"Change one part of the free offer or sign-up page. Keep the audience and other steps comparable; do not add anyone without consent.",review:"Compare confirmed subscribers with visits over the same period. A larger list alone does not show better buyers or profit; check unsubscribes and later purchases."},
 sales:{question:"Where does the buying journey lose people?",baseline:"Record visits, paid orders, refunds and costs for the same offer and date range. Keep test traffic separate from real buyers.",change:"Change one page element or offer explanation. Use the funnel A/B tools when suitable, keeping its published waiting and evidence rules.",review:"Compare the same metric and date range. Gross payments are not profit: review refunds, disputes, fees, taxes and delivery costs separately before deciding."},
 services:{question:"Are suitable enquiries becoming completed deals?",baseline:"Record qualified enquiries and won deals using the same qualification rule and date range. Allow for the time a service deal takes to close.",change:"Change one application question or follow-up step. Keep the service scope and qualification rule clear; follow up only with appropriate permission.",review:"Review the same enquiry cohort after enough time to close. Check completed delivery, cancellations and service costs, not just a larger pipeline value."},
 retention:{question:"Are buyers getting value and choosing to return?",baseline:"Choose one group of buyers from the same starting period. Record repeat purchases or renewals, cancellations and refunds over a defined follow-up period.",change:"Improve one onboarding or follow-up step. Keep optional marketing consent separate from essential purchase help and honour stop requests.",review:"Compare groups with the same time to return. Review refunds, cancellations and support costs alongside repeat orders; repeat revenue alone is not profit."},
};
/** Static guidance only; never reads records or declares a winning change. */
export function growthReview(goal:GrowthGoal,role:Role):GrowthReview|null{return can(role,"stats")?REVIEWS[goal]:null;}
