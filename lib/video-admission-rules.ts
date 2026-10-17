import type { Tier } from '@/lib/plan';
/** Provisional watched-time limits, separate from historical invoice rules.
 * These reduce admitted playback; they do not cap supplier bytes, buffering,
 * replay or token lifetime, and do not certify the all-tax margin target.
 */
export const PAID_VIDEO_HOURS = Object.freeze({ creator: 4, pro: 32, scale: 64 }) satisfies Record<Tier, number>;
export const TRIAL_VIDEO_HOURS = 1;
export const TRIAL_VIDEO_SECONDS = TRIAL_VIDEO_HOURS * 3600;
/** An omitted or unknown tier receives the smallest paid allowance. */
export function paidVideoSeconds(tier: Tier = 'creator'): number {
  const hours = Object.hasOwn(PAID_VIDEO_HOURS, tier) ? PAID_VIDEO_HOURS[tier] : PAID_VIDEO_HOURS.creator;
  return hours * 3600;
}
export function paidVideoWords(): string {
  return `${PAID_VIDEO_HOURS.creator} hours on Store, ${PAID_VIDEO_HOURS.pro} hours on Studio and ${PAID_VIDEO_HOURS.scale} hours on Scale`;
}
