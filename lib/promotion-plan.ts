import type { StatsData } from "@/lib/stats";
import { paidFiguresComplete } from "@/lib/paid-coverage";
import { POST_PLACES, campaignLink, postName, type CampaignMedium } from "@/lib/share-links";

export type PromotionProduct = { id: string; title: string; url: string };
export type PromotionWindow = "d7" | "d30" | "d90";
export const MAX_PROMOTION_PRODUCTS = 50;

/** Rank only published products supplied by the server; never infer a product/channel pairing. */
export function promotionChoices(data: StatsData, range: PromotionWindow, products: PromotionProduct[]) {
  const known = paidFiguresComplete(data);
  const measured = new Map(data.products.map(product => [product.id, product[range]]));
  const seen = new Set<string>();
  const choices = products.filter(product => {
    if (seen.has(product.id)) return false;
    seen.add(product.id);
    try { return new URL(product.url).protocol === "https:"; } catch { return false; }
  }).map(product => ({ ...product, figures: measured.get(product.id) ?? null }));
  choices.sort((a, b) => {
    if (known) {
      const money = (b.figures?.cents ?? 0) - (a.figures?.cents ?? 0);
      if (money) return money;
    }
    return (b.figures?.views ?? 0) - (a.figures?.views ?? 0) || a.id.localeCompare(b.id);
  });
  const supported = new Set(POST_PLACES.map(place => place.place));
  const channels = [...(data.channels?.[range] ?? [])].filter(row => supported.has(row.source));
  channels.sort((a, b) => known && b.cents !== a.cents ? b.cents - a.cents : b.visits - a.visits || a.source.localeCompare(b.source));
  const channel = channels.find(row => known ? row.cents > 0 : row.visits > 0);
  return { products: choices.slice(0, MAX_PROMOTION_PRODUCTS), known, channel: channel?.source ?? "instagram", channelEvidence: channel ?? null };
}

/** Blank campaign names never produce an unlabelled promotion link. */
export function promotionLink(product: PromotionProduct, channel: string, campaign: string, medium: CampaignMedium, variant: string) {
  if (!postName(campaign)) return "";
  try { if (new URL(product.url).protocol !== "https:") return ""; } catch { return ""; }
  return campaignLink(product.url, channel, campaign, medium, variant);
}
