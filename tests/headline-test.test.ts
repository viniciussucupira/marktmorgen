/**
 * A/B test of a sales page's headline (lib/headline-test.ts). What is checked:
 * a group always sees the same version of a test, and the halves are near
 * even; the test is only kept with a hero and different words, with an id
 * that follows the words; no winner before both are seen enough or while the
 * difference could be chance; a clear difference names its winner; counting
 * adds up.
 */
import { MIN_VIEWS, count, readBucket, readCounts, versionFor, winner } from "@/lib/headline-test";
import { parsePage } from "@/lib/sales-page";
import { store as redis } from "./redis-stub";
import { done, is, part } from "./check";

async function main(): Promise<void> {
  redis.clear();
  part("Groups");
  is("a group number is read only when it is one", [readBucket("42"), readBucket("1000"), readBucket("x"), readBucket(undefined)], [42, null, null, null]);
  is("the same group, the same version", versionFor(7, "abc12345"), versionFor(7, "abc12345"));
  const b = Array.from({ length: 1000 }, (_, i) => versionFor(i, "abc12345")).filter((v) => v === "b").length;
  is("about half and half", b > 420 && b < 580, true);

  part("Kept on the page");
  const hero = { id: "hero0001", kind: "hero", headline: "Forty dinners", sub: "For busy parents", media: "none", video: null };
  const page = parsePage({ blocks: [hero], test: { headline: "Dinner in 30 minutes", sub: "" } });
  is("with a hero and other words", page.test?.headline, "Dinner in 30 minutes");
  is("an id the words give it", typeof page.test?.id === "string" && page.test.id.length > 0, true);
  const changed = parsePage({ blocks: [hero], test: { headline: "Dinner in 20 minutes", sub: "" } });
  is("other words, another test", changed.test?.id !== page.test?.id, true);
  is("not the same words twice", parsePage({ blocks: [hero], test: { headline: "Forty dinners", sub: "For busy parents" } }).test, null);
  is("not without a hero", parsePage({ blocks: [{ id: "text0001", kind: "text", heading: "", body: "x" }], test: { headline: "Hi", sub: "" } }).test, null);

  part("Who wins");
  is("nobody before both are seen enough", winner({ va: MIN_VIEWS - 1, vb: 5000, ca: 0, cb: 500 }), null);
  is("nobody while it could be chance", winner({ va: 400, vb: 400, ca: 20, cb: 24 }), null);
  is("the second, when it is clearly better", winner({ va: 1000, vb: 1000, ca: 30, cb: 60 }), "b");
  is("the first, when it is", winner({ va: 1000, vb: 1000, ca: 70, cb: 35 }), "a");

  part("Counting");
  await count("stats1", "prod1", "t1", "v", "a");
  await count("stats1", "prod1", "t1", "v", "a");
  await count("stats1", "prod1", "t1", "c", "b");
  const added = await readCounts("stats1", "prod1", "t1");
  is("adds up per version, and keeps when it was first seen", [{ va: added.va, vb: added.vb, ca: added.ca, cb: added.cb }, (added.t0 ?? 0) > 0], [{ va: 2, vb: 0, ca: 0, cb: 1 }, true]);
  done();
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
