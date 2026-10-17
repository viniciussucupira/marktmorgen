import type { NextRequest } from "next/server";
import { startConnect, startHostConnect } from "@/lib/meet-routes";

/**
 * Starts connecting the store to Google Calendar: the studio's form posts here and
 * the person is sent to the consent page (lib/meet-routes.ts). Not found
 * until the deployment has the app's keys.
 *
 * `?for=host` is a team host connecting their own Google Calendar for
 * two-way sync of the team calls they host (lib/host-calendar.ts), from
 * their calendar page in the studio.
 */
export async function POST(request: NextRequest) {
  if (request.nextUrl.searchParams.get("for") === "host") return startHostConnect(request);
  return startConnect(request, "google");
}
