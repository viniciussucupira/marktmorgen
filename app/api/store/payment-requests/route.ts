import type { NextRequest } from "next/server";
import { guardStoreWrite, text } from "@/lib/store-request";
import { ensureStoreId } from "@/lib/store";
import { DRAFT_PROBLEMS, ID_PATTERN, readDraft } from "@/lib/payment-request-rules";
import { cancelRequest, createRequest, deleteRequest } from "@/lib/payment-request-store";
import { remindNow, requestsOpen, sendRequestEmail } from "@/lib/payment-requests";

/**
 * The studio's payment requests (lib/payment-request-rules.ts), for a role
 * that may email people for the store ("send": the owner and admins):
 *
 *   { action: "create", email, name, lines: [{ text, quantity, amount }], note, dueDate, autoReminders, consent }
 *   { action: "remind" | "cancel" | "delete", id }
 *
 * Creating keeps the request within every count and emails it at once, from
 * the store's emails for the month. Answers `{ ok, sent? }` or `{ ok: false,
 * error, message }` with a sentence to show.
 */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "send", 16_000);
  if (!guarded.ok) return guarded.response;
  const { body } = guarded;
  let store = guarded.store;
  const refuse = (error: string, message: string, status = 400) => Response.json({ ok: false, error, message }, { status });
  try {
    const action = text(body.action, 20);
    if (action === "create") {
      if (!requestsOpen(store)) return refuse("closed", "Payment requests can be sent once your Stripe account takes payments and your plan, or free trial, is running.", 409);
      if (!store.sid) store = (await ensureStoreId(guarded.ref)) ?? store;
      const read = readDraft(body, store.currency);
      if (!read.ok) return refuse(read.problem, read.line !== undefined ? `Line ${read.line + 1}: ${DRAFT_PROBLEMS[read.problem]}` : DRAFT_PROBLEMS[read.problem]);
      const created = await createRequest(store, read.draft);
      if (!created.ok) return refuse(created.reason, created.message, created.reason === "unavailable" ? 503 : 409);
      const done = await sendRequestEmail(store, created.request);
      return Response.json({ ok: true, id: created.request.id, sent: done.sent });
    }
    const id = text(body.id, 40);
    if (!ID_PATTERN.test(id)) return refuse("invalid", "That request is not one of this store's. Reload the page.");
    if (action === "remind") {
      if (!requestsOpen(store)) return refuse("closed", "Your store can't take payments right now, so nothing was sent.", 409);
      const done = await remindNow(store, id);
      if (!done.ok) return refuse("not_now", done.why, 409);
      return Response.json({ ok: true, sent: done.sent });
    }
    if (action === "cancel") {
      const done = await cancelRequest(store, id);
      if (done === null) return refuse("gone", "That request is gone. Reload the page.", 404);
      if (done === "not_open") return refuse("not_open", "Only an open request can be canceled.", 409);
      return Response.json({ ok: true });
    }
    if (action === "delete") {
      const done = await deleteRequest(store, id);
      if (done === null) return refuse("gone", "That request is gone. Reload the page.", 404);
      if (done === "open") return refuse("open", "Cancel the request before deleting it.", 409);
      return Response.json({ ok: true });
    }
    return refuse("invalid", "That is not something this page can do.");
  } catch (error) {
    console.error("a payment request action failed", error);
    return refuse("server_error", "That could not be done right now. Try again in a minute.", 500);
  }
}
