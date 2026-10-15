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

export type StorageUse = { bytes: number; brake: number; left: number; full: boolean };

/**
 * What a store is holding, read from storage itself.
 * Upload admission passes requireComplete: unavailable or incomplete counts
 * then refuse new uploads. Display and retention keep their conservative
 * fallback so an outage never triggers deletion.
 *
 * Not kept as a counter. A counter has to be incremented everywhere a file
 * is attached and decremented everywhere one is dropped, and the day someone
 * adds a seventh such place without knowing, the counter is wrong in the
 * direction that costs money and nothing ever says so. Reading the folder is
 * one operation, costs a fraction of a cent, and cannot drift.
 *
 * Paged, and stopped after a sane number of pages so this can never become a
 * long walk while a creator waits to upload. An incomplete count refuses
 * upload admission; display and retention may conservatively undercount.
 *
 * Lesson videos kept by the video service are counted too, by the service's
 * own count of the store's collection (lib/stream.ts): every size of every
 * video, which is what is paid for. An unavailable video count also refuses
 * upload admission.
 */
export async function storageUsed(folder: string, brake: number = STORAGE_BRAKE_BYTES, requireComplete = false): Promise<StorageUse> {
  if (requireComplete && !folder) throw new Error("storage_unavailable");
  if (!folder) return { bytes: 0, brake, left: brake, full: false };
  let bytes = 0;
  try {
    // Both file stores a sold file may be kept in, together (lib/file-store.ts).
    bytes = await filesHeld(folder, requireComplete);
  } catch (error) {
    if (requireComplete) throw new Error("storage_unavailable", { cause: error });
    // A display or retention read must not move a store toward deletion
    // based on unknown usage. Upload admission has already thrown above.
    console.error("could not read what a store is storing", error);
    return { bytes: 0, brake, left: brake, full: false };
  }
  const videoBytes = await streamHeld(folder).catch(() => null);
  if (requireComplete && videoBytes === null) throw new Error("storage_unavailable");
  bytes += videoBytes ?? 0;
  return { bytes, brake, left: Math.max(0, brake - bytes), full: bytes >= brake };
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

/** Every new file must fit in the remaining measured space, including paid plans. */
export function fits(held: StorageUse, bytes: number, standing: Standing): boolean {
  void standing;
  return !held.full && Number.isSafeInteger(bytes) && bytes > 0 &&
    Number.isSafeInteger(held.left) && bytes <= held.left;
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
