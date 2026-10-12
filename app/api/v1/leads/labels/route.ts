import { apiError, apiOk, apiWriter, readApiBody } from "@/lib/api-guard";
import { WRITE_ERRORS, changeLeadLabels } from "@/lib/api-write";

/**
 * POST /api/v1/leads/labels — adds and takes away labels of somebody on the
 * list: `{ "email", "add": [...], "remove": [...] }`. A label added starts the
 * sequences it starts in the studio (lib/api-write.ts). A key that may write only.
 */
export async function POST(request: Request) {
  const writer = await apiWriter(request);
  if (writer instanceof Response) return writer;
  const body = await readApiBody(request);
  if (body instanceof Response) return body;
  try {
    const done = await changeLeadLabels(writer.store, body);
    if (!done.ok) return apiError(WRITE_ERRORS[done.error][0], done.error, WRITE_ERRORS[done.error][1]);
    return apiOk({ data: done.value });
  } catch (error) {
    console.error("api: changing labels failed", error);
    return apiError(502, "unavailable", "The labels could not be changed just now. Try again in a moment.");
  }
}
