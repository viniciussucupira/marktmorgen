import { apiStore } from "@/lib/api-guard";
import { products, storeInfo } from "@/lib/api-read";
import { readNumbers, summaryOf } from "@/lib/stats-report";

/**
 * The Marktmorgen MCP server (added 11 October 2026): a creator's AI
 * assistant — Claude, ChatGPT, Cursor, anything that speaks the Model Context
 * Protocol — can ask about their store in plain words: "which channel made me
 * money this month?", "what did my October reel bring?".
 *
 * Streamable HTTP, JSON only, one JSON-RPC message per request; a GET is
 * answered 405, because no stream is offered. The key is the same API key as
 * /api/v1, through the same door (lib/api-guard.ts) and the same limit per
 * minute; `initialize` alone is answered before the key is read, so a client
 * can learn what this is before it has been given anything, and that answer
 * carries no store's data.
 *
 * Read only, and numbers and products only. Buyers' and subscribers'
 * addresses stay out of it on purpose: an assistant's conversation is kept by
 * whoever runs the assistant, and the people on a creator's list never agreed
 * to be read there. The API is where a creator's own tools read those.
 */
const PROTOCOL = "2025-06-18";

const TOOLS = [
  {
    name: "get_numbers",
    description:
      "The store's numbers for the last 7, 30 and 90 days: visitors, checkouts, sales and revenue; each channel (instagram, tiktok, newsletter…) from visit to sale; and page views by country and device. Money is in the smallest unit of the store's currency (cents for USD), before Stripe's fee.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
  },
  {
    name: "list_products",
    description: "The store's products in the order the store shows them, drafts included, 50 at a time. Pass the returned `next` as `cursor` for more.",
    inputSchema: { type: "object", properties: { cursor: { type: "string" } }, additionalProperties: false },
    annotations: { readOnlyHint: true },
  },
  {
    name: "get_store",
    description: "Which store this key reads: its handle, name and currency.",
    inputSchema: { type: "object", properties: {}, additionalProperties: false },
    annotations: { readOnlyHint: true },
  },
];

type Rpc = { jsonrpc?: unknown; id?: unknown; method?: unknown; params?: unknown };

const json = (body: unknown, status = 200) =>
  Response.json(body, { status, headers: { "Cache-Control": "no-store", "X-Content-Type-Options": "nosniff" } });
const result = (id: unknown, value: unknown) => json({ jsonrpc: "2.0", id, result: value });
const failure = (id: unknown, code: number, message: string) => json({ jsonrpc: "2.0", id: id ?? null, error: { code, message } });
const said = (value: unknown, isError = false) => ({ content: [{ type: "text", text: JSON.stringify(value, null, 2) }], isError });

export async function GET() {
  return new Response("This MCP server answers POST only.", { status: 405, headers: { Allow: "POST" } });
}

export async function POST(request: Request) {
  let message: Rpc;
  try {
    message = (await request.json()) as Rpc;
  } catch {
    return failure(null, -32700, "Parse error");
  }
  if (Array.isArray(message)) return failure(null, -32600, "One message per request.");
  if (!message || message.jsonrpc !== "2.0" || typeof message.method !== "string") return failure(message?.id, -32600, "Invalid request");
  const { id, method } = message;
  // A notification has no id and wants no answer.
  if (id === undefined || id === null) return new Response(null, { status: 202 });

  if (method === "initialize") {
    return result(id, {
      protocolVersion: PROTOCOL,
      capabilities: { tools: {} },
      serverInfo: { name: "marktmorgen", version: "1.0.0" },
      instructions:
        "Read a Marktmorgen store's numbers and products. Money fields are in the smallest unit of the store's currency. A channel named 'direct' is a visit or sale from nowhere the store could name.",
    });
  }
  if (method === "ping") return result(id, {});

  const store = await apiStore(request);
  if (store instanceof Response) {
    return failure(id, -32001, store.status === 429 ? "Too many requests this minute for this key." : "Send your Marktmorgen API key as: Authorization: Bearer nl_live_…");
  }

  if (method === "tools/list") return result(id, { tools: TOOLS });
  if (method !== "tools/call") return failure(id, -32601, "Method not found");

  const params = (message.params ?? {}) as { name?: unknown; arguments?: Record<string, unknown> };
  try {
    if (params.name === "get_store") return result(id, said(storeInfo(store)));
    if (params.name === "get_numbers") {
      const data = await readNumbers(store);
      return result(id, data ? said(summaryOf(data)) : said({ error: "Your numbers could not be read just now. Try again in a moment." }, true));
    }
    if (params.name === "list_products") {
      const cursor = typeof params.arguments?.cursor === "string" ? params.arguments.cursor.slice(0, 200) : null;
      return result(id, said(await products(store, cursor)));
    }
    return result(id, said({ error: `There is no tool called ${String(params.name).slice(0, 40)}.` }, true));
  } catch (error) {
    console.error("mcp: a tool failed", error);
    return result(id, said({ error: "That could not be read just now. Try again in a moment." }, true));
  }
}
