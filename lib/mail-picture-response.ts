import { pictureLine, readPicture } from "@/lib/mail-picture-rules";

/** Only an explicit HTTP-success reply with a supported local picture may be inserted. */
export function confirmedMailPictureUrl(responseOk: boolean, raw: unknown): string | null {
  if (!responseOk || !raw || typeof raw !== "object" || Array.isArray(raw)) return null;
  const data = raw as Record<string, unknown>;
  if (data.ok !== true || typeof data.url !== "string") return null;
  return readPicture(pictureLine("", data.url))?.url === data.url ? data.url : null;
}
