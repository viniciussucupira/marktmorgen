import { apiError, apiOk, apiStore, apiWriter, readApiBody } from "@/lib/api-guard";
import { leads } from "@/lib/api-read";
import { WRITE_ERRORS, addLead, roomFor } from "@/lib/api-write";

/**
 * GET /api/v1/leads?cursor=&agreed=true — the creator's list: the same rows as
 * the studio's CSV export. `agreed=true` keeps only those who agreed to hear
 * from the creator and have not unsubscribed — the ones it is fair to email.
 */
export async function GET(request: Request) {
  const store = await apiStore(request);
  if (store instanceof Response) return store;
  const params = new URL(request.url).searchParams;
  try {
    return apiOk(await leads(store, params.get("cursor"), params.get("agreed") === "true"));
  } catch (error) {
    console.error("api: leads failed", error);
    return apiError(502, "unavailable", "The list could not be read just now. Try again in a moment.");
  }
}

/**
 * POST /api/v1/leads — puts somebody who agreed to hear from the creator on
 * the list (lib/api-write.ts): `{ "email", "name", "tags", "agreed": true }`.
 * A key that may write only.
 */
export async function POST(request: Request) {
  const writer = await apiWriter(request);
  if (writer instanceof Response) return writer;
  const body = await readApiBody(request);
  if (body instanceof Response) return body;
  try {
    const done = await roomFor(() => addLead(writer.store, body));
    if (!done.ok) return apiError(WRITE_ERRORS[done.error][0], done.error, WRITE_ERRORS[done.error][1]);
    return apiOk({ data: done.value });
  } catch (error) {
    console.error("api: adding a lead failed", error);
    return apiError(502, "unavailable", "The list could not be changed just now. Nothing was changed; try again in a moment.");
  }
}
