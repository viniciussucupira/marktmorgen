/**
 * MM-SA-04: pictures a cache had not seen were read by a function every
 * time, counted by nothing.
 *
 * A product picture (app/api/image), a store photo (app/api/photo) and a
 * store's home-screen icon (app/[handle]/app-icon) are costed as requests the
 * CDN answers (tests/traffic-cost.ts). The CDN keeps an answer per address,
 * query string included, so the same picture asked with `?1`, `?2`, `?3` was
 * read again from the file store or the database each time, and a made-up
 * name was a function and a read each time, from any machine, with no limit.
 *
 * Proved against a real Redis, through the real routes: three hundred
 * requests from one machine, with query strings or made-up names, must cost
 * no more than a minute's pace of reads, and a visitor asking the plain
 * address must still get the picture.
 */
import { GET as photoRoute } from "@/app/api/photo/[id]/route";
import { GET as imageRoute } from "@/app/api/image/[folder]/[file]/route";
import { GET as iconRoute } from "@/app/[handle]/app-icon/[size]/route";
import { claimHandle, ensureStatsId, ensureStoreId, setPhotoId, storeForEmail } from "@/lib/store";
import { writePhoto } from "@/lib/store-photo";
import { iconUrl } from "@/lib/store-app";
import * as fileStore from "@/lib/blob";
import { check, finish } from "./check";

const counts = { photoReads: 0 };
// The file store is answered by tests/security/blob.ts, which records every call.
const blobCalls = (fileStore as unknown as { blobCalls: string[] }).blobCalls;
const real = globalThis.fetch;
globalThis.fetch = (async (input: string | URL | Request, init?: RequestInit) => {
  const url = new URL(String(input instanceof Request ? input.url : input));
  if (String(url).startsWith(String(process.env.UPSTASH_REDIS_REST_URL))) {
    if (String(init?.body).includes('"GET","nl:store:photo:')) counts.photoReads += 1;
    return real(input as string, init);
  }
  throw new Error(`no network in this check: ${url.hostname}`);
}) as typeof fetch;

const PNG = Uint8Array.from(Buffer.from("iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==", "base64"));
const ATTACKER = "203.0.113.9";
const VISITOR = "198.51.100.77";
const at = (ip: string, path: string) => new Request(`https://marktmorgen.com${path}`, { headers: { "x-forwarded-for": ip, host: "marktmorgen.com" } });
const hex = (n: number, width: number) => n.toString(16).padStart(width, "0").slice(-width);

async function main(): Promise<void> {
  process.env.NIMBUS_DATA_KEY ??= "tests-only-not-a-real-deployment-secret";
  const owner = "owner@picture-pace.example";
  await claimHandle(owner, "picture-pace", "Picture Pace", "");
  await ensureStatsId(owner);
  await ensureStoreId(owner);
  const photo = await writePhoto(PNG, "image/png");
  await setPhotoId(owner, photo);
  const store = (await storeForEmail(owner))!;
  const SENT = 300;

  // 1. One photo asked with three hundred query strings.
  counts.photoReads = 0;
  for (let i = 0; i < SENT; i += 1) await photoRoute(at(ATTACKER, `/api/photo/${photo}?n=${i}`), { params: Promise.resolve({ id: photo }) });
  check("a photo asked with a query string is not read again for each one", counts.photoReads, 0);

  // 2. Three hundred made-up photo ids.
  counts.photoReads = 0;
  for (let i = 0; i < SENT; i += 1) {
    const id = hex(i, 32);
    await photoRoute(at(ATTACKER, `/api/photo/${id}`), { params: Promise.resolve({ id }) });
  }
  check("made-up photo ids from one machine are read no more than a minute's pace", counts.photoReads <= 150, true);

  // 3. One product picture asked with three hundred query strings, and three hundred made-up names.
  blobCalls.length = 0;
  const folder = "a".repeat(24);
  for (let i = 0; i < SENT; i += 1) {
    const file = `${"e".repeat(32)}.webp`;
    await imageRoute(at(ATTACKER, `/api/image/${folder}/${file}?n=${i}`), { params: Promise.resolve({ folder, file }) });
  }
  check("a product picture asked with a query string is not fetched from the file store for each one", blobCalls.length, 0);
  blobCalls.length = 0;
  for (let i = 0; i < SENT; i += 1) {
    const file = `${hex(i, 32)}.webp`;
    await imageRoute(at("203.0.113.10", `/api/image/${folder}/${file}`), { params: Promise.resolve({ folder, file }) });
  }
  check("made-up picture names from one machine are fetched no more than a minute's pace", blobCalls.length <= 150, true);

  // 4. The home-screen icon asked with three hundred query strings.
  counts.photoReads = 0;
  const icon = iconUrl(store, 192);
  for (let i = 0; i < SENT; i += 1) {
    await iconRoute(at("203.0.113.11", `${icon}&n=${i}`), { params: Promise.resolve({ handle: "@picture-pace", size: "192.png" }) });
  }
  check("an icon asked with a query string is not drawn again for each one", counts.photoReads, 0);

  // 5. Visitors asking the plain addresses still get them.
  counts.photoReads = 0;
  const plain = await photoRoute(at(VISITOR, `/api/photo/${photo}`), { params: Promise.resolve({ id: photo }) });
  check("a visitor asking the plain photo address gets the photo", [plain.status, (await plain.arrayBuffer()).byteLength, counts.photoReads], [200, PNG.byteLength, 1]);
  const drawn = await iconRoute(at(VISITOR, icon), { params: Promise.resolve({ handle: "@picture-pace", size: "192.png" }) });
  check("and the icon at its own address is drawn", [drawn.status, drawn.headers.get("content-type")], [200, "image/png"]);
  finish();
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
