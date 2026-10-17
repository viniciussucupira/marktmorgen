/** Client-safe community chat limits and refusal types. No storage, search or server imports. */
export const MAX_CHAT_TEXT = 1_000;
/** How many messages the room keeps. Older ones fall off the end. */
export const MAX_CHAT_KEPT = 500;
/** How many one look can bring back. */
export const CHAT_PAGE = 100;
/** The longest cooldown a creator may set, in seconds. */
export const MAX_SLOW = 300;

export type ChatRefusal =
  | "off"
  | "empty"
  | "links"
  | "slow"
  | "hourly"
  | "creatorOnly"
  | "muted"
  | "full"
  | "name"
  | "out"
  | "unknown";
