/**
 * The per-plan worst-case cost model shared by tests/plan-margin.test.ts and
 * tests/spend-floor.test.ts. Moved here unchanged on October 17, 2026 so the
 * two files cannot hold different figures; the AI line is now the automatic
 * ceiling the code enforces (lib/ai-spend-policy.ts) instead of a rough
 * per-draft figure, and the upload line is the operations the automatic
 * upload allowance can start (lib/upload-budget-policy.ts).
 */
import { paidStorageBytes } from '@/lib/storage-rules';
import { PLAN_PRICES, monthlyEmails, type Cycle, type Tier } from "@/lib/plan";
import { FREE_PAUSE_ABOVE_BYTES } from "@/lib/delivery";
import { TOP_HEIGHT, viewingBytes } from "@/lib/stream-rules";
import { PAID_VIDEO_HOURS } from "@/lib/video-admission-rules";
import { VISITS_INCLUDED } from "@/lib/traffic-rules";
import { ORDERS_INCLUDED } from "@/lib/order-rules";
import { AUTOMATIC_AI_STORE_MICRO_USD } from "@/lib/ai-spend-policy";
import { uploadWorstCostMicroUsd } from "@/lib/upload-budget-policy";
import { visitCost } from "./traffic-cost";

/** The automatic monthly AI ceiling of a plan, in dollars. */
export function aiCeilingUsd(tier: Tier): number {
  return AUTOMATIC_AI_STORE_MICRO_USD[tier] / 1_000_000;
}
/** Every upload operation a plan's monthly allowance can start, in dollars. */
export function uploadOpsUsd(tier: Tier): number {
  return uploadWorstCostMicroUsd(tier) / 1_000_000;
}

export const GB = 1024 * 1024 * 1024;

/** Keeping a file, at the dearest of the three stores one may be in. */
export const STORAGE_PER_GB = 0.023;
/** Sending a file that is sold: nothing, from the store they are kept in. */
export const FILE_DELIVERY_PER_GB = 0;
/** What the video service charges to keep a gigabyte, and to send one. */
export const STREAM_STORAGE_PER_GB = 0.02;
export const STREAM_DELIVERY_PER_GB = 0.005;
/** What a player fetches beyond what is watched: the next seconds, and a size it then leaves. */
export const FETCHED_AHEAD = 1.25;
export const PER_EMAIL = 0.0009;
/**
 * What one order costs us, at the most an order sends: its confirmation and,
 * for a physical product, the email that says it shipped, and the pages and
 * jobs that settle it (the thanks page, the five-minute sweep, the database
 * writes), set at three hundredths of a cent, which is well over what a
 * visit's whole page costs (tests/traffic-cost.ts).
 */
export const ORDER_COMPUTE = 0.0003;
export const ORDER_COST = 2 * PER_EMAIL + ORDER_COMPUTE;
/**
 * The other emails nothing counts by the order: sign-in links and a buyer's
 * link to their purchases, each held back per address. Set high. Until
 * October 13, 2026 receipts were in this figure as well (2,000, 5,000 and
 * 10,000 emails), which put a number on what no limit held; they are orders
 * now (lib/order-rules.ts).
 */
export const TRANSACTIONAL: Record<Tier, number> = { creator: 500, pro: 1_000, scale: 2_000 };
/** What Stripe Billing takes of a subscription charge, on top of the card fee. */
export const BILLING_RATE = 0.007;

/**
 * What reaches us for one month of a plan, after Stripe takes its cut: one
 * monthly charge, or a twelfth of the yearly one.
 */
export type Prices = Record<Tier, Record<Cycle, number>>;
export function netOf(tier: Tier, cycle: Cycle = "month", prices: Prices = PLAN_PRICES): number {
  const gross = prices[tier][cycle] / 100;
  const kept = gross - (gross * (0.029 + BILLING_RATE) + 0.3);
  return cycle === "year" ? kept / 12 : kept;
}

/** Historical operating model only: encoded-size assumptions and fetched-ahead factor.
 * This is not a verified bound on provider bytes, replay, invoice rates or taxes. */
export function hourCost(): number {
  const gigabytes = (viewingBytes(3600, TOP_HEIGHT, Number.POSITIVE_INFINITY) / GB) * FETCHED_AHEAD;
  return gigabytes * STREAM_DELIVERY_PER_GB;
}

/** The hours of video a plan covers, all of them watched. */
export function videoCost(tier: Tier = "creator"): number {
  return PAID_VIDEO_HOURS[tier] * hourCost();
}

/** The visits a plan covers, all of them made, each by the heavy visitor a visit is costed as. */
export function visitsCost(tier: Tier): number {
  return VISITS_INCLUDED[tier] * visitCost();
}

/** The orders a plan covers, all of them made, each at the most an order costs. */
export function ordersCost(tier: Tier): number {
  return ORDERS_INCLUDED[tier] * ORDER_COST;
}

/** Everything one store on this plan can run up in a month, at every limit at once. */
export function worstCost(tier: Tier): number {
  const storage = (paidStorageBytes(tier) / GB) * STORAGE_PER_GB;
  const free = (FREE_PAUSE_ABOVE_BYTES / GB) * FILE_DELIVERY_PER_GB;
  const video = videoCost(tier);
  const email = monthlyEmails(tier) * PER_EMAIL;
  // The automatic AI ceiling and the upload operations, from lib/spend-cost-table.ts.
  const drafts = aiCeilingUsd(tier);
  const uploads = uploadOpsUsd(tier);
  const receipts = TRANSACTIONAL[tier] * PER_EMAIL;
  return storage + free + video + visitsCost(tier) + email + drafts + uploads + receipts + ordersCost(tier);
}

