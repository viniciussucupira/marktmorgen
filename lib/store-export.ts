/**
 * Everything a store keeps, as one file its owner can take anywhere (added
 * 18 October 2026), offered in the studio and in every notice before a
 * store closes (lib/plan-closing.ts): its products and their prices, pages,
 * long descriptions and notes after paying; its blog posts; its courses with
 * every lesson's text; its forms with their answers; its contacts; and a
 * summary of its orders, read from its own Stripe account and its PayPal
 * records. Files, videos and community posts are not in it: files and videos
 * are downloaded from the studio one by one, and a community's posts are its
 * members' as much as the creator's.
 *
 * Written out as it is read, a part at a time, so a large store is never
 * held whole in memory. What it reads is the store's data room, so what it
 * costs is counted the way the room is: while a plan runs it is taken from
 * the store's studio figure at exportUnits of its size (tests/closing-cost.test.ts
 * holds the units to the cost), and once a plan has ended a store may take
 * ENDED_STORE_EXPORTS of them (lib/plan-closing-rules.ts), priced with the
 * rest of what a closing store costs (docs/funded-exposure-review.md).
 */
import { readAllListings } from "@/lib/catalog";
import { readBodies, readCourses } from "@/lib/course";
import { listAsCsv, listSize } from "@/lib/free";
import { dataUsed } from "@/lib/store-data";
import { readForms, readResponses } from "@/lib/form-store";
import { readAbout } from "@/lib/product-about";
import { readPage } from "@/lib/sales-page-store";
import { salesCsv, readsSales } from "@/lib/stats";
import { allPosts, readPost } from "@/lib/store-blog";
import { type Store } from "@/lib/store";
import { readThanksNote } from "@/lib/thanks-note-store";

/**
 * What an export reads: every byte the store's data room counts at the
 * most, and a few commands for each thing it reads one at a time (a
 * product's page, long description and note, a lesson's text, a post, a
 * form's answers), the contacts a thousand at a command, and its fixed part.
 */
export type ExportShape = { bytes: number; commands: number };
/** Commands a product, a lesson (its text read a hundred at a command), a post and a form take at the most; and the fixed part, the catalog's pages included. */
export const EXPORT_COMMANDS = { product: 3, lesson: 0.01, post: 2, form: 1, fixed: 60 };
/** One studio unit is twenty commands and fifty kilobytes through the database (tests/plan-cost-registry.ts, UNIT_COST); an export is counted at less than both. */
export const EXPORT_COMMANDS_PER_UNIT = 16;
export const EXPORT_BYTES_PER_UNIT = 40_000;

/** The studio units a whole export of this shape takes (tests/closing-cost.test.ts holds them to its cost). */
export function exportUnits(shape: ExportShape): number {
  return 1 + Math.ceil(Math.max(0, shape.commands) / EXPORT_COMMANDS_PER_UNIT) + Math.ceil(Math.max(0, shape.bytes) / EXPORT_BYTES_PER_UNIT);
}

/** What exporting this store reads, counted before it is read: the room's bytes, and its products, lessons, posts, forms and contacts. */
export async function exportShape(store: Store): Promise<ExportShape> {
  const used = await dataUsed(store);
  const listings = await readAllListings(store);
  const ids = listings.flatMap((l) => (l.course ? [l.course.id] : []));
  const courses = ids.length ? await readCourses(ids) : new Map();
  let lessons = 0;
  for (const course of courses.values()) for (const unit of course.modules) lessons += unit.lessons.length;
  const posts = (await allPosts(store.statsId)).length;
  const forms = (await readForms(store.statsId)).length;
  const contacts = (await listSize(store)).total;
  return {
    bytes: used?.used ?? 0,
    commands: Math.ceil(EXPORT_COMMANDS.fixed + EXPORT_COMMANDS.product * listings.length + EXPORT_COMMANDS.lesson * lessons + courses.size + EXPORT_COMMANDS.post * posts + EXPORT_COMMANDS.form * forms + contacts / 1000),
  };
}

const encoder = new TextEncoder();

/**
 * The whole export, as a stream of JSON. Each part is read just before it
 * is written; a part that cannot be read is written as what could not be
 * read, never left out without a word.
 */
export function storeExport(store: Store, now = Date.now()): ReadableStream<Uint8Array> {
  const statsId = store.statsId;
  const parts: (() => Promise<string>)[] = [
    async () => `{"exportedAt":${JSON.stringify(new Date(now).toISOString())},"store":${JSON.stringify({ handle: store.handle, name: store.name, bio: store.bio, links: store.links, createdAt: store.createdAt, currency: store.currency })}`,
    async () => {
      const listings = await readAllListings(store);
      const out: unknown[] = [];
      for (const listing of listings) {
        out.push({
          product: listing,
          page: statsId ? await readPage(statsId, listing.id).catch(() => null) : null,
          about: statsId ? await readAbout(statsId, listing.id).catch(() => "") : "",
          thanks: statsId ? await readThanksNote(statsId, listing.id).catch(() => null) : null,
        });
      }
      const ids = listings.flatMap((l) => (l.course ? [l.course.id] : []));
      const courses = ids.length ? await readCourses(ids) : new Map();
      const withText: unknown[] = [];
      for (const course of courses.values()) {
        const lessons = await readBodies(course.id, course.modules.flatMap((unit: { lessons: { id: string }[] }) => unit.lessons.map((lesson) => lesson.id)));
        withText.push({ ...course, lessonText: lessons });
      }
      return `,"products":${JSON.stringify(out)},"courses":${JSON.stringify(withText)}`;
    },
    async () => {
      const posts: unknown[] = [];
      for (const meta of await allPosts(statsId)) posts.push((await readPost(statsId, meta.id)) ?? meta);
      return `,"posts":${JSON.stringify(posts)}`;
    },
    async () => {
      const forms: unknown[] = [];
      for (const form of await readForms(statsId)) forms.push({ form, answers: (await readResponses(statsId, form.id)).responses });
      return `,"forms":${JSON.stringify(forms)}`;
    },
    async () => `,"contactsCsv":${JSON.stringify(await listAsCsv(store, false))}`,
    async () => {
      if (!readsSales(store)) return `,"ordersCsv":"","ordersNote":"No Stripe or PayPal account was connected, so there are no orders to list."`;
      const { csv, partial } = await salesCsv(store, 0);
      return `,"ordersCsv":${JSON.stringify(csv)}${partial ? `,"ordersNote":"More orders than one file reads: the rest are on your own Stripe account."` : ""}`;
    },
    async () => `,"notIncluded":"Files, videos and community posts are not in this file: download files and videos from your studio."}\n`,
  ];
  let at = 0;
  return new ReadableStream<Uint8Array>({
    async pull(controller) {
      if (at >= parts.length) {
        controller.close();
        return;
      }
      const part = parts[at];
      at += 1;
      let text: string;
      try {
        text = await part();
      } catch (error) {
        console.error("a part of a store's export could not be read", error);
        text = at === 1 ? `{"exportedAt":${JSON.stringify(new Date(now).toISOString())}` : `,"unreadPart${at}":"This part could not be read just now. Download the file again in a few minutes."`;
      }
      controller.enqueue(encoder.encode(text));
    },
  });
}
