/**
 * A buyer's photo on their review (lib/review-photo.ts, lib/reviews.ts;
 * added 10 October 2026). Checked:
 *
 *   - only a JPEG or a WebP, by its own first bytes, of a sensible size and
 *     at most MAX_REVIEW_PHOTO_BYTES, is kept, in the store's own picture
 *     folder, under a name of its own;
 *   - a photo stays on its review through the buyer's edit;
 *   - putting a new one on gives back the one it displaced, and taking one
 *     off gives it back too, for deleting; the review itself stays;
 *   - deleting a product's reviews gives back their photos' paths;
 *   - a kept review with a photo that is not a store picture reads as none.
 */
import { checkReviewPhoto, reviewPhotoPath } from "@/lib/review-photo";
import { dropReviews, parseReview, readReview, saveReview, setReviewPhoto } from "@/lib/reviews";
import { MAX_REVIEW_PHOTO_BYTES, type ReviewPhoto } from "@/lib/review-summary";
import { imageFolder } from "@/lib/store";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";
import { ROOM } from "./data-room";

const STATS = "d".repeat(32);
const PRODUCT = "mugs000001";
const REF = "owner@example.com";

/** A JPEG's first bytes, enough to be read: the start, then a frame of the given size. */
function jpeg(width: number, height: number, padding = 0): string {
  const bytes = [0xff, 0xd8, 0xff, 0xc0, 0x00, 0x11, 0x08, height >> 8, height & 255, width >> 8, width & 255, 3, ...new Array(12 + padding).fill(0)];
  return `data:image/jpeg;base64,${Buffer.from(bytes).toString("base64")}`;
}

async function main(): Promise<void> {
  redis.clear();
  const folder = await imageFolder(REF);

  part("What is kept");
  const checked = checkReviewPhoto(jpeg(1200, 900));
  is("a JPEG of 1200 by 900 is kept", typeof checked === "object" ? { w: checked.width, h: checked.height, type: checked.type } : checked, { w: 1200, h: 900, type: "image/jpeg" });
  const path = await reviewPhotoPath(REF, "image/jpeg");
  is("in the store's own picture folder, under a new name", path.startsWith(`images/${folder}/`) && path.endsWith(".jpg") && path !== (await reviewPhotoPath(REF, "image/jpeg")), true);
  const kept: ReviewPhoto | "photo" = typeof checked === "object" ? { path, width: checked.width, height: checked.height } : checked;
  is("too large a picture is not", checkReviewPhoto(jpeg(2400, 900)), "photo");
  is("nor too small a one", checkReviewPhoto(jpeg(8, 8)), "photo");
  const png = `data:image/png;base64,${Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a, ...new Array(40).fill(0)]).toString("base64")}`;
  is("nor a PNG, whatever the form says", checkReviewPhoto(png), "photo");
  is("nor text that is not base64", checkReviewPhoto("data:image/jpeg;base64,<script>"), "photo");
  is("nor a file over the limit", checkReviewPhoto(jpeg(800, 600, MAX_REVIEW_PHOTO_BYTES)), "photo");
  is("nor nothing", checkReviewPhoto(""), "photo");
  const webp = Buffer.from("RIFF\0\0\0\0WEBPVP8X\0\0\0\0\0\0\0\0", "latin1");
  const sized = Buffer.concat([webp, Buffer.from([0x1f, 0x03, 0x00, 0x57, 0x02, 0x00])]);
  const readWebp = checkReviewPhoto(sized.toString("base64"));
  is("a WebP is read too", typeof readWebp === "object" ? { w: readWebp.width, h: readWebp.height, type: readWebp.type } : readWebp, { w: 800, h: 600, type: "image/webp" });
  if (typeof kept !== "object") throw new Error("no photo kept");

  part("On a review");
  const saved = await saveReview(STATS, { productId: PRODUCT, email: "buyer@example.com", reference: "cs_test_1", pi: "pi_1", rating: 5, text: "Lovely mug.", name: "Ana" }, ROOM, 1_700_000_000_000);
  if (saved.state !== "created") throw new Error("review not written");
  const id = saved.review.id;
  const first = await setReviewPhoto(STATS, PRODUCT, id, kept);
  is("put on, nothing displaced", typeof first === "object" ? first.removed : first, null);
  is("it reads back", (await readReview(STATS, PRODUCT, id))?.photo, kept);
  await saveReview(STATS, { productId: PRODUCT, email: "buyer@example.com", reference: "cs_test_1", pi: "pi_1", rating: 4, text: "Lovely mug, a little small.", name: "Ana" }, ROOM, 1_700_000_100_000);
  const edited = await readReview(STATS, PRODUCT, id);
  is("the buyer's edit keeps it", { text: edited?.text, photo: edited?.photo }, { text: "Lovely mug, a little small.", photo: kept });
  const other: ReviewPhoto = { path: `images/${folder}/${"ab".repeat(16)}.webp`, width: 800, height: 800 };
  const swapped = await setReviewPhoto(STATS, PRODUCT, id, other);
  is("a new one gives back the old one", typeof swapped === "object" ? swapped.removed : swapped, kept);
  const again = await setReviewPhoto(STATS, PRODUCT, id, other);
  is("the same one again displaces nothing", typeof again === "object" ? again.removed : again, null);
  const off = await setReviewPhoto(STATS, PRODUCT, id, null);
  is("taken off, it is given back", typeof off === "object" ? off.removed : off, other);
  const after = await readReview(STATS, PRODUCT, id);
  is("and the review stays, without it", { text: after?.text, photo: after?.photo }, { text: "Lovely mug, a little small.", photo: null });
  is("a review that is not there", await setReviewPhoto(STATS, PRODUCT, "0".repeat(24), other), "missing");

  part("A product deleted");
  await setReviewPhoto(STATS, PRODUCT, id, other);
  is("its reviews' photos are given back", await dropReviews(STATS, PRODUCT), [other.path]);
  is("and the review is gone", await readReview(STATS, PRODUCT, id), null);

  part("Read safely");
  const base = { id: "1".repeat(24), productId: PRODUCT, rating: 5, text: "Good", name: "B", createdAt: 1 };
  is("a photo outside the picture folders reads as none", parseReview(JSON.stringify({ ...base, photo: { path: "../secret.jpg", width: 10, height: 10 } }))?.photo, null);
  is("nor one of no size", parseReview(JSON.stringify({ ...base, photo: { path: other.path, width: 0, height: 10 } }))?.photo, null);
  is("an older review has none", parseReview(JSON.stringify(base))?.photo, null);

  done();
}

void main();
