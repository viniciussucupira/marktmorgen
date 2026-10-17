/** Shared pure rules. No server operations or private configuration. */

export type RecoverySetting = {
  /** Switched on by the creator in the studio. Off until they do. */
  enabled: boolean;
  /**
   * Where the creator can be reached by post. A reminder is an email about
   * buying something, and the law in the United States asks every such email
   * to carry the sender's postal address, so it cannot be switched on
   * without one.
   */
  address: string;
  /**
   * Whether Stripe is asked to put its own consent box on the checkout.
   * Stripe offers that only to businesses in the United States, so it is
   * true for a US account and false for every other — which still has the
   * reminder a buyer asks for themselves (lib/checkout-ask.ts). A record from
   * before this was kept reads as true: only US accounts could switch it on.
   */
  asks: boolean;
};

export const MAX_RECOVERY_ADDRESS = 200;

export const NO_RECOVERY: RecoverySetting = { enabled: false, address: "", asks: true };

export function parseRecovery(raw: unknown): RecoverySetting {
  if (!raw || typeof raw !== "object") return { ...NO_RECOVERY };
  const value = raw as Record<string, unknown>;
  const address =
    typeof value.address === "string" ? value.address.replace(/\s+/g, " ").trim().slice(0, MAX_RECOVERY_ADDRESS) : "";
  // On only with an address to print; a record that lost it reads as off.
  return { enabled: value.enabled === true && address !== "", address, asks: value.asks !== false };
}
