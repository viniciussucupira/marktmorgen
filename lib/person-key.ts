/**
 * The key one address is kept under for one store, never the address itself
 * (lib/buyer-profile.ts, lib/crm.ts): one small module, so anything that needs
 * it does not load a buyer's whole page with it.
 */
import { createHash } from "node:crypto";
import { normaliseEmail } from "@/lib/auth";

export function personKey(statsId: string, email: string): string {
  return createHash("sha256").update(`nimbus-person:${statsId}:${normaliseEmail(email)}`).digest("hex").slice(0, 32);
}
