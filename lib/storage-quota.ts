/**
 * The brake on what one store can keep stored with us.
 *
 * Not a plan limit. A brake.
 *
 * The difference matters, and getting it wrong is how a protection costs
 * more than the thing it protects against. A plan limit goes on the pricing
 * page, a creator comparing two products reads it, and we lose a line to
 * Stan — who publishes no storage limit at all, no file-count limit and no
 * bandwidth limit. Their only published figure is 5 GB a file, which is also
 * ours. Publishing a storage quota would make us visibly worse than them on
 * a page, to guard against a cost that no honest creator will ever reach.
 *
 * So this is set far above any real use, appears nowhere a buyer or a
 * creator is choosing a plan, and exists for one case: a store being used as
 * a file host rather than to sell its owner's own work. Section 5 of the
 * Terms is what says we may act on that; this is what acts, by itself, so
 * nobody has to be watching.
 *
 * Storage was the cost with no measurement of any kind. The only bound on
 * what a store could hold was 2,000 products times a 5 GB file — ten
 * terabytes, about $230 a month, every month, from a creator paying $29,
 * whether or not they ever sold anything.
 *
 * The line falls where it costs nobody anything: a new upload. No buyer is
 * ever refused, nothing already sold is removed, nothing that exists stops
 * working. A store at the brake is asked to delete something before adding
 * more, which is pressure on the person who chose to store the files and
 * never on the person who bought one.
 */
import { filesHeld } from "@/lib/file-store";
import { SETUP_STORAGE_BYTES, type Standing, TRIAL_STORAGE_BYTES } from "@/lib/plan-standing";
import { streamHeld } from "@/lib/stream";

const GB = 1024 * 1024 * 1024;

/**
 * Where new uploads stop, on every plan.
 *
 * Two hundred gigabytes. At $0.023 a gigabyte a month that is $4.60 at the
 * very top, against the $27.86 a $29 subscription leaves after the card fee.
 *
 * It was five hundred until the worst case of each plan was actually added
 * up rather than eyeballed. At that figure storage alone took $11.50 of a
 * $27.86 plan, and with every other brake at its limit the cheapest plan
 * lost money in its own worst case. A brake is only a brake if the sum of
 * all of them sits well under the revenue they protect.
 *
 * And it is not a number a creator selling their own work meets. Two hundred
 * gigabytes is four hundred half-gigabyte videos, or eighty thousand ebooks,
 * against the two to five gigabytes a real store holds. A store past it is
 * not a storefront any more.
 *
 * It is the same on both plans on purpose: a brake that differs by plan is a
 * plan limit wearing a disguise, and would end up on the pricing page.
 */
export const STORAGE_BRAKE_BYTES = 200 * GB;

export type StorageUse = { bytes: number; brake: number; left: number; full: boolean; available: boolean };

/**
 * What a store is holding, read from storage itself.
 *
 * Not kept as a counter. A counter has to be incremented everywhere a file
 * is attached and decremented everywhere one is dropped, and the day someone
 * adds a seventh such place without knowing, the counter is wrong in the
 * direction that costs money and nothing ever says so. Reading the folder is
 * one operation, costs a fraction of a cent, and cannot drift.
 *
 * A missing, invalid or incomplete measurement cannot authorize more storage.
 * Existing downloads and content are unaffected; upload doors return a temporary failure.
 */
export async function storageUsed(folder: string, brake: number = STORAGE_BRAKE_BYTES): Promise<StorageUse> {
  const unavailable: StorageUse = { bytes: 0, brake, left: 0, full: false, available: false };
  if (!folder || !Number.isSafeInteger(brake) || brake <= 0) return unavailable;
  try {
    const files = await filesHeld(folder);
    const videos = await streamHeld(folder);
    if (videos === null || !Number.isSafeInteger(files) || files < 0 ||
        !Number.isSafeInteger(videos) || videos < 0) return unavailable;
    const bytes = files + videos;
    if (!Number.isSafeInteger(bytes)) return unavailable;
    return { bytes, brake, left: Math.max(0, brake - bytes), full: bytes >= brake, available: true };
  } catch (error) {
    console.error("could not read what a store is storing", error);
    return unavailable;
  }
}

/**
 * Where new uploads stop for a store, by where it stands with its plan
 * (lib/plan-standing.ts). The brake above is every paid plan's; a store in
 * its free trial, and one with no plan at all, have less room, because
 * nothing is yet paying for what they keep.
 */
export function storageBrakeFor(standing: Standing): number {
  return standing === "paid" ? STORAGE_BRAKE_BYTES : standing === "trial" ? TRIAL_STORAGE_BYTES : SETUP_STORAGE_BYTES;
}

/**
 * Maximum bytes one upload may authorize against a confirmed measurement.
 * The signature and its URL options must use this same ceiling.
 * This does not reserve capacity against simultaneous or in-flight uploads.
 */
export function maximumUploadBytes(held: StorageUse, perFileMaximum: number): number {
  if (held.available !== true || held.full ||
      !Number.isSafeInteger(perFileMaximum) || perFileMaximum <= 0 ||
      !Number.isSafeInteger(held.bytes) || held.bytes < 0 ||
      !Number.isSafeInteger(held.brake) || held.brake <= 0 ||
      !Number.isSafeInteger(held.left) || held.left < 0 ||
      held.left !== Math.max(0, held.brake - held.bytes)) return 0;
  return Math.min(perFileMaximum, held.left);
}

/** A new file must fit entirely, including on a paid plan. Existing files are untouched. */
export function fits(held: StorageUse, bytes: number): boolean {
  return Number.isSafeInteger(bytes) && bytes > 0 && maximumUploadBytes(held, bytes) === bytes;
}

/** "480 GB", "1.4 TB", "5 GB", "900 MB". */
export function storageWords(bytes: number): string {
  const gb = bytes / GB;
  if (gb >= 1024) return `${(gb / 1024).toFixed(1)} TB`;
  if (gb >= 10) return `${Math.round(gb)} GB`;
  // "5 GB", not "5.0 GB": a round figure is written as one.
  if (gb >= 1) return `${Number(gb.toFixed(1))} GB`;
  return `${Math.max(1, Math.round(bytes / (1024 * 1024)))} MB`;
}
