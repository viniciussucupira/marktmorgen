/** Shared pure rules. No server operations or private configuration. */
import type { KeySetup } from "./key-setup";
export * from "./key-setup";
export const MAX_UPLOAD_KEYS = 10_000;

export const MAX_POOL_KEYS = 10_000;

export const MIN_KEY_LENGTH = 4;

export const MAX_KEY_LENGTH = 100;

export const KEY_ALPHABET = "ABCDEFGHJKLMNPQRSTUVWXYZ23456789";

export const MAX_KEY_FILE_BYTES = 1_200_000;

export function sampleKey(setup: Pick<KeySetup, "prefix" | "groups" | "groupLength">): string {
  return [setup.prefix, ...Array.from({ length: setup.groups }, () => "X".repeat(setup.groupLength))].filter(Boolean).join("-");
}

export type IssuedKey = {
  key: string;
  /** The sale it went to: a checkout (cs_…) or a one-click payment (pi_…). */
  reference: string;
  email: string;
  at: number;
  /** When it was marked revoked; 0 while it is good. */
  revokedAt: number;
  /** Who revoked it: the creator, or a refund in full read from Stripe. */
  revokedBy: "creator" | "refund" | "";
};

export type KeyCounts = {
  /** Keys in the pool, not yet given. 0 for made keys. */
  left: number;
  issued: number;
  revoked: number;
  /** Sales paid while the pool was empty, still waiting for a key. */
  waiting: number;
};
