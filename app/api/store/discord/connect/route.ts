import type { NextRequest } from "next/server";
import { authorizeUrl, isDiscordConfigured, redirectUri } from "@/lib/discord";
import { startTrip } from "@/lib/discord-store";
import { ensureStoreId } from "@/lib/store";
import { away, creatorFrom, studioPath } from "@/lib/studio-route";
import { withinLimit } from "@/lib/request-guard";

/**
 * "Connect a Discord server": the studio's form posts here, and the owner or
 * an Admin ("settings") is sent to Discord's own page to add Marktmorgen's
 * bot to a server of theirs (lib/discord.ts). Not found until the
 * deployment has the application's keys.
 */
export async function POST(request: NextRequest) {
  if (!isDiscordConfigured()) return new Response("Not found.", { status: 404 });
  const creator = await creatorFrom(request, "settings");
  if (creator instanceof Response) return creator;
  const { store, ref, email, origin } = creator;
  const sid = store.sid || (await ensureStoreId(ref))?.sid || "";
  const back = (query: string) => away(origin, studioPath(store, query, "discord"));
  if (!sid) return back("discord=error");
  if (!(await withinLimit("discord-connect", sid, 10, 600))) return back("discord=limited");
  const redirect = redirectUri(origin);
  const state = await startTrip({ k: "install", sid, by: email, redirect });
  return new Response(null, { status: 303, headers: { Location: authorizeUrl("install", state, redirect), "Cache-Control": "no-store" } });
}
