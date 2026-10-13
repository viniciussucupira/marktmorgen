import type { NextRequest } from "next/server";
import { startMeta } from "@/lib/meta-routes";

/** Starts connecting the store's Meta ad account: the numbers' form posts here (lib/meta-routes.ts). */
export async function POST(request: NextRequest) {
  return startMeta(request);
}
