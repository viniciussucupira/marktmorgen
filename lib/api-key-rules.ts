/**
 * What the studio's key panel needs to know about API keys, with nothing that
 * runs on the server: the panel runs in the browser, and lib/api-keys.ts
 * imports the crypto and the database.
 */
export const MAX_KEYS = 5;
export const MAX_KEY_NAME = 40;
/** How a key starts, so one pasted into the wrong place is recognisable for what it is. */
export const KEY_PREFIX = "nl_live_";

export type ApiKey = {
  id: string;
  name: string;
  /** The first characters after the prefix, so the creator can tell keys apart. */
  hint: string;
  madeAt: number;
  /** Seconds; 0 when never used. */
  usedAt: number;
  /**
   * Whether it may also change the store (added 12 October 2026): add people
   * to the list, change their labels, give and take back products. Chosen
   * when the key is made and never changed after, so a key made to read
   * stays one that reads.
   */
  write: boolean;
};
