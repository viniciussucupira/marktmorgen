/**
 * MM-SA-10: request bodies with no declared length read whole.
 *
 * proxy.ts refuses a body by its declared length, and one sent chunked with
 * none. A body sent over HTTP/2 needs neither, and these readers took it whole
 * before looking at its size: the v1 API's readApiBody (lib/api-guard.ts),
 * the MCP server, and three of the community's doors, which anybody can post
 * to before anything else is asked. Each request then held up to the host's
 * own ceiling (4.5 MB) in a function's memory and parsed it, for a body no
 * honest page sends at more than a few kilobytes.
 *
 * Proved with the real handlers: each is sent a two-megabyte body with no
 * length, and must stop reading it within a few kilobytes of its own ceiling.
 */
import type { NextRequest } from "next/server";
import { readApiBody } from "@/lib/api-guard";
import { POST as mcp } from "@/app/api/mcp/route";
import { POST as chat } from "@/app/api/store/community/chat/route";
import { POST as push } from "@/app/api/store/community/push/route";
import { POST as messages } from "@/app/api/store/community/messages/route";
import { check, finish } from "./check";

const CHUNK = 16 * 1024;
const WHOLE = 2 * 1024 * 1024;
/** The most any of these readers may take before it stops: its ceiling (at most 32 KB) and one chunk the network handed over with it. */
const MOST = 32 * 1024 + CHUNK;

/** A request whose body is two megabytes with no declared length, counting what the handler pulled from it. */
function bigRequest(path: string, contentType: string): { request: NextRequest; pulled: () => number } {
  let pulled = 0;
  const filler = new TextEncoder().encode(`{"x":"${"a".repeat(CHUNK - 8)}`);
  const body = new ReadableStream<Uint8Array>({
    pull(controller) {
      if (pulled >= WHOLE) {
        controller.close();
        return;
      }
      pulled += filler.byteLength;
      controller.enqueue(filler);
    },
  });
  const url = new URL(`https://marktmorgen.com${path}`);
  const request = new Request(url, { method: "POST", headers: { "Content-Type": contentType }, body, duplex: "half" } as RequestInit);
  Object.assign(request, { nextUrl: url, cookies: { get: () => undefined } });
  return { request: request as unknown as NextRequest, pulled: () => pulled };
}

async function main(): Promise<void> {
  const read: Record<string, number> = {};
  const api = bigRequest("/api/v1/products", "application/json");
  const answered = await readApiBody(api.request);
  read.api = api.pulled();
  check("the v1 API refuses a body past its ceiling", answered instanceof Response ? answered.status : "read", 413);

  const rpc = bigRequest("/api/mcp", "application/json");
  await mcp(rpc.request);
  read.mcp = rpc.pulled();

  const said = bigRequest("/api/store/community/chat", "application/json");
  await chat(said.request);
  read.chat = said.pulled();

  const device = bigRequest("/api/store/community/push", "application/json");
  await push(device.request);
  read.push = device.pulled();

  const dm = bigRequest("/api/store/community/messages", "application/x-www-form-urlencoded");
  await messages(dm.request);
  read.messages = dm.pulled();

  for (const [door, bytes] of Object.entries(read)) check(`${door}: a body with no declared length stops being read at its ceiling`, bytes <= MOST, true);
  console.log(`read: ${JSON.stringify(read)}`);
  finish();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
