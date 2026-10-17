import type { NextRequest } from "next/server";
import { guardStoreWrite, text } from "@/lib/store-request";
import { FORM_ID, newFormId, parseForm } from "@/lib/forms";
import { dropForm, readForm, writeForm } from "@/lib/form-store";
import { setSitePages } from "@/lib/store";

/** Twelve questions of eight options each, and six results, as JSON. */
const MAX_BODY_BYTES = 60_000;

/**
 * A store's forms, surveys and quizzes (lib/forms.ts): part of its public
 * pages, so what the "page" permission may change.
 *
 *   { form: { id?, name, fields, button, doneHeading, doneBody, outcomes, offerList } }   saves one
 *   { action: "remove", id }                                                                 removes it and its answers
 *
 * A result's product is kept only when it is one of the store's.
 */
export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "page", MAX_BODY_BYTES);
  if (!guarded.ok) return guarded.response;
  const { body, ref } = guarded;
  let store = guarded.store;
  try {
    if (!store.statsId) {
      // A store written before it had one is given its id with its pages.
      const marked = await setSitePages(ref, store.sitePages);
      if (!marked.ok || !marked.store.statsId) return Response.json({ ok: false, error: "server_error" }, { status: 500 });
      store = marked.store;
    }
    const statsId = store.statsId as string;

    if (body.action === "remove") {
      const id = text(body.id, 12);
      if (!FORM_ID.test(id)) return Response.json({ ok: false, error: "unknown" }, { status: 400 });
      return (await dropForm(statsId, id, store)) ? Response.json({ ok: true }) : Response.json({ ok: false, error: "unknown" }, { status: 404 });
    }

    const raw = body.form && typeof body.form === "object" ? (body.form as Record<string, unknown>) : null;
    if (!raw) return Response.json({ ok: false, error: "invalid" }, { status: 400 });
    const asked = typeof raw.id === "string" && FORM_ID.test(raw.id) ? raw.id : "";
    const existing = asked ? await readForm(statsId, asked) : null;
    if (asked && !existing) return Response.json({ ok: false, error: "unknown" }, { status: 404 });
    const form = parseForm({ ...raw, id: existing?.id ?? newFormId(), updatedAt: Math.floor(Date.now() / 1000) });
    if (!form) return Response.json({ ok: false, error: text(raw.name, 60).trim() ? "fields" : "name" }, { status: 400 });
    // A result points at one of this store's products, or at none.
    const known = new Set(store.catalog.items.map((item) => item.id));
    form.outcomes = form.outcomes.map((o) => (o.product && !known.has(o.product) ? { ...o, product: "" } : o));
    if (!(await writeForm(statsId, form))) return Response.json({ ok: false, error: "full" }, { status: 400 });
    return Response.json({ ok: true, form });
  } catch (error) {
    console.error("saving a form failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}
