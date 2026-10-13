import type { NextRequest } from "next/server";
import { finishMetaConnect } from "@/lib/meta-routes";

/**
 * Where Meta sends the person back after its consent page: the redirect
 * address registered with the Meta app,
 * https://marktmorgen.com/api/integrations/meta/callback.
 */
export async function GET(request: NextRequest) {
  return finishMetaConnect(request);
}
