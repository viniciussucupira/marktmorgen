/**
 * The cap on one closing's emails to its buyers (queue item 307 [EC1]):
 * set once, when the members of a store whose plan ended are held
 * (lib/plan-closing.ts), at EMAILS_PER_BUYER_PER_ENDING for each buyer its
 * cap allows (lib/closing-buyers-rules.ts, buyerNoticeCap), and taken from
 * before every email (lib/closing-buyers.ts). Never added to after.
 *
 *   nl:closing:credit:<folder>   what is left, until the store closes or stays
 */
import { isRedisConfigured, redisPipeline } from "@/lib/redis";

export const creditKey = (folder: string) => `nl:closing:credit:${folder}`;

/** Sets the closing's emails, for one ending. */
export async function startClosingCredit(folder: string, emails: number): Promise<void> {
  if (!isRedisConfigured() || !folder) return;
  await redisPipeline([["SET", creditKey(folder), Math.max(0, Math.floor(emails))]]);
}

/** Takes `n`, all or none. Nothing set is nothing to take. */
export async function takeCredit(folder: string, n: number): Promise<boolean> {
  const [left] = await redisPipeline([["DECRBY", creditKey(folder), n]]);
  if (Number(left) >= 0) return true;
  await redisPipeline([["INCRBY", creditKey(folder), n]]);
  return false;
}

/** Puts back what was taken for emails that did not go. */
export async function returnCredit(folder: string, n: number): Promise<void> {
  if (n > 0) await redisPipeline([["INCRBY", creditKey(folder), n]]);
}

/** Let go once the store is closed or runs on. */
export async function forgetCredit(folder: string): Promise<void> {
  await redisPipeline([["DEL", creditKey(folder)]]);
}
