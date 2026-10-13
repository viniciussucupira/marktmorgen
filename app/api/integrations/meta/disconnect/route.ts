import type { NextRequest } from "next/server";
import { stopMeta } from "@/lib/meta-routes";

/** Disconnects the store's Meta ad account and gives the permission back (lib/meta-routes.ts). */
export async function POST(request: NextRequest) {
  return stopMeta(request);
}
