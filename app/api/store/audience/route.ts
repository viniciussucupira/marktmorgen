import type { NextRequest } from "next/server";
import { creatorFrom } from "@/lib/studio-route";
import { buyerAudience } from "@/lib/ad-audience";

/**
 * The store's buyers who agreed to hear from the creator, as a file Meta and
 * TikTok take for a customer list (lib/ad-audience.ts). Addresses, so only
 * the owner and an Admin reach it (lib/team-roles.ts, "export").
 */
export async function GET(request: NextRequest) {
  const creator = await creatorFrom(request, "export");
  if (creator instanceof Response) return creator;
  const { store } = creator;
  try {
    const { csv } = await buyerAudience(store);
    const day = new Date().toISOString().slice(0, 10);
    // No byte-order mark: the addresses are plain letters, and an upload form need not know what one is.
    return new Response(csv, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${store.handle}-buyers-audience-${day}.csv"`,
        "Cache-Control": "private, no-store",
        "X-Robots-Tag": "noindex",
        "X-Content-Type-Options": "nosniff",
      },
    });
  } catch (error) {
    console.error("making the buyers audience failed", error);
    return new Response("We could not read your list right now. Try again in a moment.", {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
}
