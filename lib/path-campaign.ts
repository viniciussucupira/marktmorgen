import { TRAFFIC_MISSIONS, type Mission } from "@/lib/path-rules";
import type { StarterGoal } from "@/lib/funnel-starter-catalog";

/** Discovery alone never creates a campaign or completes a mission. */
export function pathCampaign(mission: Pick<Mission, "id" | "state"> | null | undefined): { goal: StarterGoal; why: string } | null {
  if (!mission || mission.state !== "open") return null;
  if (mission.id === "product" || mission.id === "sale") return { goal: "sales", why: "Explore a product-page journey with space to explain what buyers receive, answer questions and show the price." };
  const traffic = mission.id.match(/^traffic-(\d+)$/);
  if (mission.id === "lead" || (traffic && TRAFFIC_MISSIONS[Number(traffic[1]) - 1]?.kind === "leads")) return { goal: "leads", why: "Explore a free-resource journey. Path counts the store sign-up, free-product or waitlist confirmation; a campaign form response alone does not count. Review the separate marketing choice before publishing." };
  return null;
}
