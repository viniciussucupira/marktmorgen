import type { NextRequest } from "next/server";
import { guardStoreWrite, text } from "@/lib/store-request";
import { withinLimit } from "@/lib/request-guard";
import { AI_PER_MINUTE } from "@/lib/ai-rules";
import { readNumbers } from "@/lib/stats-report";
import { MAX_QUESTION, askNumbers } from "@/lib/numbers-ask";

/**
 * A question about the store's numbers (lib/numbers-ask.ts): `{ question }`.
 * For whoever may see the numbers; answered from exactly what the Numbers
 * panel shows, and one of the month's AI jobs.
 */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "stats", 2_000);
  if (!guarded.ok) return guarded.response;
  const { store, body } = guarded;
  const question = text(body.question, MAX_QUESTION).trim();
  if (question.length < 3) return Response.json({ ok: false, error: "notes" }, { status: 400 });
  if (!(await withinLimit("ai", store.sid || store.handle, AI_PER_MINUTE, 60))) return Response.json({ ok: false, error: "slow" }, { status: 429 });
  const data = await readNumbers(store).catch(() => null);
  if (!data) return Response.json({ ok: false, error: "numbers" }, { status: 503 });
  const done = await askNumbers(store, question, data);
  if (!done.ok) return Response.json({ ok: false, error: done.reason }, { status: done.reason === "failed" ? 502 : 400 });
  return Response.json({ ok: true, value: done.value, left: done.left });
}
