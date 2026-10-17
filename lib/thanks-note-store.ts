/**
 * Where a product's note after paying is kept (lib/thanks-note.ts): its own
 * small record, read only by the thank-you page and the confirmation email of
 * a product marked as having one, as a long description is
 * (lib/product-about.ts).
 */
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { type DataStore, giveData, needData } from "@/lib/store-data";
import { dataBytes } from "@/lib/store-data-rules";
import { type ThanksNote, parseNote } from "@/lib/thanks-note";

const noteKey = (statsId: string, productId: string) => `nl:product:note:${statsId}:${productId}`;

/** The note of one product, or null when it has none. */
export async function readThanksNote(statsId: string | null, productId: string): Promise<ThanksNote | null> {
  if (!statsId || !isRedisConfigured()) return null;
  const [raw] = await redisPipeline([["GET", noteKey(statsId, productId)]]);
  if (typeof raw !== "string" || raw.length > 20_000) return null;
  try {
    return parseNote(JSON.parse(raw));
  } catch {
    return null;
  }
}

/** Writes a note, or forgets it (null), after taking its room in the store's data room (DataRoomError when it does not fit). */
export async function writeThanksNote(statsId: string, productId: string, note: ThanksNote | null, room: DataStore): Promise<void> {
  const json = note ? JSON.stringify(note) : "";
  await needData(room, [{ slot: `tn:${productId}`, bytes: json ? dataBytes([json], 1) : 0, set: true }]);
  await redisPipeline([note ? ["SET", noteKey(statsId, productId), json] : ["DEL", noteKey(statsId, productId)]]);
}

/** Forgets the note of a product that is gone, and gives back its room. */
export async function dropThanksNote(statsId: string | null, productId: string, room: DataStore): Promise<void> {
  if (!statsId || !isRedisConfigured()) return;
  await redisPipeline([["DEL", noteKey(statsId, productId)]]);
  await giveData(room, [{ slot: `tn:${productId}`, bytes: 0, set: true }]);
}
