/**
 * Where a paid order of a physical product is going (lib/shipping.ts), read
 * from the checkout itself: Stripe keeps it under `collected_information`
 * in its newer API and under `shipping_details` in the older one, and either
 * may be what the creator's account answers with. Browser-safe.
 */
export type ShipAddress = { name: string; lines: string[]; country: string };

type Raw = { name?: unknown; address?: { line1?: unknown; line2?: unknown; city?: unknown; state?: unknown; postal_code?: unknown; country?: unknown } | null } | null | undefined;

const str = (value: unknown) => (typeof value === "string" ? value.trim() : "");

/** The address on a checkout, as lines to print, or null when it holds none. */
export function shippingAddressOf(session: Record<string, unknown> | null | undefined, locale = "en-US"): ShipAddress | null {
  if (!session) return null;
  const collected = (session.collected_information as { shipping_details?: Raw } | null | undefined)?.shipping_details;
  const details = (collected ?? (session.shipping_details as Raw) ?? (session.shipping as Raw)) as Raw;
  const address = details?.address;
  if (!address || !str(address.line1)) return null;
  const country = str(address.country).toUpperCase();
  let countryName = country;
  try {
    countryName = country ? new Intl.DisplayNames([locale], { type: "region" }).of(country) ?? country : "";
  } catch {
    countryName = country;
  }
  const town = [str(address.city), [str(address.state), str(address.postal_code)].filter(Boolean).join(" ")].filter(Boolean).join(", ");
  return {
    name: str(details?.name).slice(0, 120),
    lines: [str(address.line1), str(address.line2), town, countryName].filter(Boolean).map((line) => line.slice(0, 200)),
    country,
  };
}

/** Whether a checkout was for something shipped (lib/store-checkout.ts sets this). */
export function wasShipped(session: { metadata?: unknown } | null | undefined): boolean {
  const meta = session?.metadata;
  return Boolean(meta && typeof meta === "object" && (meta as Record<string, unknown>).ship === "yes");
}
