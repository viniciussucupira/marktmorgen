import type { NextRequest } from "next/server";
import { guardStoreWrite, text } from "@/lib/store-request";
import { jsonAccess } from "@/lib/studio-route";
import { contentDisposition, withinLimit } from "@/lib/request-guard";
import {
  BATCH_BYTES,
  IMPORT_ID_PATTERN,
  type ImportJob,
  type ImportKind,
  addRows,
  cancelImport,
  finishUpload,
  jobOf,
  readBatch,
  reportCsv,
  runImport,
  startImport,
  storeImports,
} from "@/lib/imports";

/**
 * Moving from another platform (lib/imports.ts), for the studio's page
 * /studio/import. Only the owner and admins may (the "import" permission,
 * lib/team-roles.ts).
 *
 *   GET  ?id=<import>                    how it stands
 *   GET  ?id=<import>&report=1           what was not brought in, as a spreadsheet
 *   POST { action: "start", kind, expected, file, agreed, consentColumn, tags, email }
 *   POST { action: "rows", id, rows }    one batch of up to 1,000 rows
 *   POST { action: "finish", id }        every row is sent
 *   POST { action: "step", id }          a few seconds of work, while the page is open
 *   POST { action: "cancel", id }
 *
 * The page advances an import while it is open; the job every five minutes
 * finishes what is left (app/api/cron/imports). Each step and each batch is
 * counted per store, so a script cannot keep either busy.
 */
export const maxDuration = 60;

/** How long one step from the page may work. */
const STEP_MS = 8_000;

const KINDS = new Set<ImportKind>(["contacts", "products", "purchases", "members"]);

/** What the page is told about an import: nothing it does not show. */
function view(job: ImportJob) {
  return {
    id: job.id,
    kind: job.kind,
    state: job.state,
    file: job.file,
    at: job.at,
    finishedAt: job.finishedAt,
    expected: job.expected,
    total: job.total,
    done: job.done,
    counts: job.counts,
    email: job.options.email,
  };
}

export async function GET(request: NextRequest) {
  const access = await jsonAccess(request, "import");
  if (access instanceof Response) return access;
  const { store } = access;
  const id = request.nextUrl.searchParams.get("id") ?? "";
  try {
    if (!id) {
      const jobs = await storeImports(store);
      return Response.json({ ok: true, imports: jobs.map(view) }, { headers: { "Cache-Control": "private, no-store" } });
    }
    if (!IMPORT_ID_PATTERN.test(id)) return Response.json({ ok: false, error: "unknown" }, { status: 404 });
    const job = await jobOf(store, id);
    if (!job) return Response.json({ ok: false, error: "unknown" }, { status: 404 });
    if (request.nextUrl.searchParams.get("report") === "1") {
      if (!(await withinLimit("import-report", store.sid, 60, 600))) return new Response("Too many downloads for now. Try again in a few minutes.", { status: 429 });
      const csv = await reportCsv(job);
      const day = new Date(job.at).toISOString().slice(0, 10);
      return new Response(csv, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": contentDisposition("attachment", `${store.handle}-import-${job.kind}-${day}-not-imported.csv`),
          "Cache-Control": "private, no-store",
          "X-Content-Type-Options": "nosniff",
        },
      });
    }
    return Response.json({ ok: true, import: view(job) }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("reading an import failed", error);
    return Response.json({ ok: false, error: "server_error" }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const guarded = await guardStoreWrite(request, "import", BATCH_BYTES);
  if (!guarded.ok) return guarded.response;
  const { store, body, email } = guarded;
  const action = text(body.action, 10);
  const id = text(body.id, 24);
  const refuse = (error: string, status = 400, extra: Record<string, unknown> = {}) => Response.json({ ok: false, error, ...extra }, { status });

  try {
    if (action === "start") {
      const kind = text(body.kind, 12) as ImportKind;
      if (!KINDS.has(kind)) return refuse("invalid");
      // Twenty imports a day is far more than moving a store takes.
      if (!(await withinLimit("import-start", store.sid || guarded.ref, 20, 86_400))) return refuse("slow", 429);
      const started = await startImport(store, email, kind, {
        expected: Number(body.expected),
        file: text(body.file, 200),
        agreed: body.agreed === true,
        consentColumn: body.consentColumn === true,
        tags: Array.isArray(body.tags) ? body.tags.filter((t): t is string => typeof t === "string").slice(0, 10) : [],
        email: body.email === true,
        stopped: body.stopped === true,
      });
      if (!started.ok) return refuse(started.reason, started.reason === "busy" ? 409 : 400, { limit: started.limit });
      return Response.json({ ok: true, import: view(started.job) });
    }

    if (!IMPORT_ID_PATTERN.test(id)) return refuse("unknown", 404);

    if (action === "rows") {
      // Fifty batches carry the biggest import; four hundred in ten minutes is room for retries.
      if (!(await withinLimit("import-rows", store.sid || guarded.ref, 400, 600))) return refuse("slow", 429);
      const job = await jobOf(store, id);
      if (!job) return refuse("unknown", 404);
      const rows = readBatch(job.kind, body.rows);
      if (!rows) return refuse("rows");
      const added = await addRows(store, id, rows);
      return added.ok ? Response.json({ ok: true, import: view(added.job) }) : refuse(added.reason, 409);
    }

    if (action === "finish") {
      const done = await finishUpload(store, id);
      if (!done.ok) return refuse(done.reason, 409);
      // The first few seconds of work right away, so a small file is done
      // by the time the page shows it.
      const after = await runImport(id, Date.now() + STEP_MS);
      return Response.json({ ok: true, import: view(after ?? done.job) });
    }

    if (action === "step") {
      if (!(await withinLimit("import-step", store.sid || guarded.ref, 900, 600))) return refuse("slow", 429);
      const job = await jobOf(store, id);
      if (!job) return refuse("unknown", 404);
      const after = await runImport(id, Date.now() + STEP_MS);
      return Response.json({ ok: true, import: view(after ?? job) });
    }

    if (action === "cancel") {
      const job = await cancelImport(store, id);
      return job ? Response.json({ ok: true, import: view(job) }) : refuse("unknown", 404);
    }

    return refuse("invalid");
  } catch (error) {
    console.error("an import request failed", error);
    return refuse("server_error", 500);
  }
}
