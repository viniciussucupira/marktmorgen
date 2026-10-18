import { canonicalPicture, connectionRefusal, readRefusal } from "@/lib/picture-pace";
import { isRedisConfigured } from "@/lib/redis";
import { PHOTO_ID_PATTERN } from "@/lib/store-photo";
import { readPhoto } from "@/lib/store-photo";

/**
 * Serves a store photo.
 *
 * A photo's id changes whenever the picture does, so what is behind one
 * address never changes and may be cached everywhere for a year. That keeps
 * the one request every visitor makes out of this function almost entirely.
 *
 * An address with a query string is sent to the plain one before anything is
 * read, and what a function answers is paced (lib/picture-pace.ts): a query
 * string or a made-up id was a database read every time, counted by nothing.
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const missing = () =>
    new Response("Not found.", {
      status: 404,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });

  if (!isRedisConfigured() || !PHOTO_ID_PATTERN.test(id)) return missing();
  const refused = connectionRefusal(request) ?? canonicalPicture(request) ?? readRefusal(`photo:${id}`);
  if (refused) return refused;

  try {
    const photo = await readPhoto(id);
    if (!photo) return missing();
    return new Response(Buffer.from(photo.bytes), {
      headers: {
        "Content-Type": photo.type,
        "Content-Length": String(photo.bytes.length),
        "Cache-Control": "public, max-age=31536000, immutable",
        "X-Content-Type-Options": "nosniff",
        // It is a picture and nothing else: it may not run, frame or fetch.
        "Content-Security-Policy": "default-src 'none'; sandbox",
        "Cross-Origin-Resource-Policy": "cross-origin",
      },
    });
  } catch (error) {
    console.error("serving a store photo failed", error);
    return new Response("Try again in a moment.", {
      status: 502,
      headers: { "Content-Type": "text/plain; charset=utf-8", "Cache-Control": "no-store" },
    });
  }
}
