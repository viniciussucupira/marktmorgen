import type { Store } from "@/lib/store";
import { storeFolder, storeRef } from "@/lib/store";
import { reservePaidResourceWindow } from "@/lib/contract-resource-window";
import { addCaption, type CaptionAnswer } from "@/lib/stream";
import { readStreamPath } from "@/lib/stream-rules";

/** New manual caption work, bound to the owner of the video's folder. */
export async function addStoreCaption(store: Store, pathname: string, lang: string, file: unknown): Promise<CaptionAnswer> {
  const path = readStreamPath(pathname);
  if (!path || path.folder !== await storeFolder(storeRef(store))) return { ok: false, reason: "unknown" };
  if (store.period?.funded === true && !await reservePaidResourceWindow(store)) return { ok: false, reason: "unavailable" };
  return addCaption(pathname, lang, file);
}
