/**
 * A store whose plan has ended, and what it still keeps.
 *
 * lib/plan-standing.ts gives a store with no plan room for five gigabytes.
 * A store whose plan ends may be keeping far more than that, put there
 * while it paid, and it goes on costing us to keep for as long as it is
 * kept: up to four dollars a month, for ever, for a store that pays
 * nothing. Nothing else here costs anything once a plan has ended.
 *
 * So what such a store keeps past the room of a store with no plan has a
 * date on it, and the date is said three times before it comes.
 *
 *   - Nothing happens to a store that keeps no more than a store with no
 *     plan may. It is a store with no plan, and stays as it is.
 *   - One that keeps more has CLOSING_DAYS from the day its plan ended. Its
 *     owner is written to when the plan ends, WARN_MONTH_DAYS before the
 *     date and WARN_WEEK_DAYS before it, each time with the figures, the
 *     date, and the two ways out: start a plan again, or delete enough to
 *     fit.
 *   - On the date, what it keeps is removed (removeStored): the files its
 *     products hand over, its lessons' videos and downloads, its podcast's
 *     episodes. The store itself is not touched: its page, its products and
 *     prices, its lessons' text and quizzes, its contacts and its orders
 *     all stay, and a file can be put back on a product the day a plan is
 *     started again.
 *
 * This is the one thing in this codebase that deletes what a creator put
 * here without being asked to, so it is hedged every way it can be:
 *
 *   - never before the last notice has been out for a full week. A notice
 *     that could not be sent moves the date; it is not skipped;
 *   - never on our own note that the plan is over. Stripe is asked, that
 *     day, whether the store has a subscription in good standing, and if it
 *     has, the note is put right and nothing is removed;
 *   - never when the store cannot be measured, emailed or checked: each of
 *     those is a reason to do nothing that day, and try the next;
 *   - one store at a time, by the daily job, with what it did written down.
 *
 *   nl:plan:ended            the stores whose plan has ended, by the day
 *   nl:plan:closing:<key>    what a store was told and when; when removed
 *   nl:plan:closing:after    where a run that ran out of time stopped
 *
 * A store with no plan cannot add to what it keeps past its room
 * (lib/storage-quota.ts, fits), so one that was found to fit is not measured
 * again for RECHECK_DAYS: measuring is the dear part of a look, and nearly
 * every store whose plan ended fits.
 */
import { createHash } from "node:crypto";
import { findStoreSubscriptions, isBillingConfigured, readSubscription } from "@/lib/billing";
import { readAllListings } from "@/lib/catalog";
import { editCourse, filesInCourse, readCourse, saveCourse } from "@/lib/course";
import { bytesWords } from "@/lib/delivery";
import { NIMBUS_FROM, isSenderConfigured, sendEmail } from "@/lib/email";
import { deleteFile, listFiles } from "@/lib/file-store";
import { CLOSING_DAYS, RECHECK_DAYS, WARN_MONTH_DAYS, WARN_WEEK_DAYS } from "@/lib/plan-closing-rules";
import { ENDED_INDEX, SETUP_STORAGE_BYTES, standingOf } from "@/lib/plan-standing";
import { editPodcast, readPodcast, savePodcast } from "@/lib/podcast";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { onBreak } from "@/lib/plan-pause";
import { withLock } from "@/lib/redis-lock";
import { SITE_URL } from "@/lib/site-url";
import { storageUsed, storageWords } from "@/lib/storage-quota";
import { type Store, setPodcastEpisodes, setProductFile, setSubscription, storeFolder, storeForEmail, storeRef } from "@/lib/store";
import { dropAllStreams, dropStream } from "@/lib/stream";
import { readStreamPath } from "@/lib/stream-rules";
import { SUPPORT_EMAIL } from "@/lib/creator-research";

export { CLOSING_DAYS, RECHECK_DAYS, WARN_MONTH_DAYS, WARN_WEEK_DAYS };

const DAY_MS = 24 * 60 * 60 * 1000;
const stateKey = (key: string) => `nl:plan:closing:${createHash("sha256").update(key).digest("hex").slice(0, 40)}`;

/**
 * What a store was told, and when (ms); `removed` once what it kept is gone.
 * `of` is the day the plan ended that all of it is about: a plan that was
 * started again and ended again begins from nothing, with every notice
 * still to come.
 */
type State = { of?: number; ended?: number; month?: number; week?: number; removed?: number; said?: number; fit?: number };

function parseState(raw: unknown): State {
  if (typeof raw !== "string") return {};
  try {
    const value = JSON.parse(raw) as Record<string, unknown>;
    const out: State = {};
    for (const name of ["of", "ended", "month", "week", "removed", "said", "fit"] as const) {
      if (typeof value[name] === "number" && Number.isFinite(value[name] as number)) out[name] = value[name] as number;
    }
    return out;
  } catch {
    return {};
  }
}

/** The day what a store keeps is removed, from the day its plan ended: both in ms. */
export function removalDay(endedAt: number): number {
  return endedAt + CLOSING_DAYS * DAY_MS;
}

/**
 * For the studio: the day what a store keeps would be removed, counted the
 * way the job counts it. Null when the store's plan has not ended, or when
 * what it kept has been removed already. Whether the store keeps more than
 * its room, which is what makes the day matter, is for the caller to measure.
 */
export async function closingOf(store: Store, now = Date.now()): Promise<{ endedAt: number; day: number } | null> {
  const endedAt = Date.parse(store.planEndedAt);
  if (standingOf(store, now / 1000) !== "ended" || !Number.isFinite(endedAt) || !isRedisConfigured()) return null;
  // A break the creator chose keeps everything until it ends (lib/plan-pause.ts).
  if (await onBreak(storeRef(store), now / 1000)) return null;
  const [raw] = await redisPipeline([["GET", stateKey(storeRef(store))]]);
  const read = parseState(raw);
  const state: State = read.of === endedAt ? read : {};
  if (state.removed) return null;
  // Never sooner than a week after the last notice, which, where it has not
  // gone out yet, is today at the soonest.
  return { endedAt, day: Math.max(removalDay(endedAt), (state.week ?? now) + WARN_WEEK_DAYS * DAY_MS) };
}

/** Which notice is the one for today: the first, the one two weeks before, or the last. */
export function noticeFor(endedAt: number, now: number): "ended" | "month" | "week" {
  const day = removalDay(endedAt);
  if (now >= day - WARN_WEEK_DAYS * DAY_MS) return "week";
  if (now >= day - WARN_MONTH_DAYS * DAY_MS) return "month";
  return "ended";
}

const dateWords = (ms: number) => new Date(ms).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" });

/** The three notices before, and the one after. */
function letter(kind: "ended" | "month" | "week" | "removed", store: Store, held: number, endedAt: number, day: number, now: number): { subject: string; text: string } {
  const room = storageWords(SETUP_STORAGE_BYTES);
  // Written the way the room is, so the two can be told apart at a glance;
  // a store a hair over its room is not said to keep exactly its room.
  const kept = storageWords(held) === room ? `a little over ${room}` : storageWords(held);
  const what = [
    "What is removed: the files your products hand over, your lessons' videos and",
    "downloads, and your podcast's episodes. After that day your buyers can no",
    "longer download those files or watch those videos.",
    "",
    "What stays: your store and its page, your products and their prices, your",
    "lessons' text and quizzes, your contacts and your orders. A product whose",
    "file was removed is off sale until you give it one again.",
  ];
  const ways = [
    "Two things stop it, either one:",
    "",
    `  - start a plan again, and everything stays exactly as it is; or`,
    `  - delete files or lessons you no longer need until your store keeps ${room} or less.`,
  ];
  if (kind === "removed") {
    return {
      subject: `The files ${store.name} kept have been removed`,
      text: [
        `Your Marktmorgen plan for ${store.name} ended on ${dateWords(endedAt)}, and your store was`,
        `keeping more than the ${room} a store with no plan may keep. As our notices said`,
        "they would be, the files and lesson videos it kept have now been removed.",
        "",
        "Your store is still yours: its page, your products and their prices, your",
        "lessons' text and quizzes, your contacts and your orders are all there. Start",
        "a plan again and you can put a file back on each product and a video back on",
        "each lesson.",
        "",
        `${SITE_URL}/studio`,
        "",
        `If any of this is not what you expected, reply to this email or write to ${SUPPORT_EMAIL}.`,
      ].join("\n"),
    };
  }
  const days = Math.max(1, Math.ceil((day - now) / DAY_MS));
  const head =
    kind === "ended"
      ? [
          `Your Marktmorgen plan for ${store.name} ended on ${dateWords(endedAt)}.`,
          "",
          "Your store is still there and nothing has been removed. Your buyers can",
          "still download what they bought.",
          "",
          "One thing has a date on it.",
        ]
      : [
          `Your Marktmorgen plan for ${store.name} ended on ${dateWords(endedAt)}. Nothing has been removed`,
          "yet, and your buyers can still download what they bought.",
        ];
  return {
    subject: kind === "ended" ? `${store.name}: what happens to your files now that your plan has ended` : `${days} days until the files ${store.name} keeps are removed`,
    text: [
      ...head,
      "",
      `A store with no plan may keep ${room} of files and lesson videos. Yours keeps`,
      `${kept}. On ${dateWords(day)}, ${CLOSING_DAYS} days after your plan ended, what your store`,
      "keeps will be removed.",
      "",
      ...ways,
      "",
      ...what,
      "",
      kind === "ended"
        ? `We will write to you again ${WARN_MONTH_DAYS} days before that day and ${WARN_WEEK_DAYS} days before it. Nothing is removed without a notice at least a week old.`
        : kind === "month"
          ? `We will write to you once more, ${WARN_WEEK_DAYS} days before that day. Nothing is removed without a notice at least a week old.`
          : "This is the last notice before that day.",
      "",
      `${SITE_URL}/studio`,
      "",
      `Questions: reply to this email or write to ${SUPPORT_EMAIL}.`,
    ].join("\n"),
  };
}

/**
 * The three things a look at a store does outside this file's own records,
 * named so that a test can stand in for the one that has no stand-in (the
 * host's file store, whose library does not ask through `fetch`).
 */
export type Hands = {
  /**
   * How many bytes a store keeps, by the stores' own counts. What cannot be
   * read is counted as nothing (lib/storage-quota.ts), which is the safe way
   * round here too: a store is never moved toward removal on a figure we do
   * not have.
   */
  measure: (folder: string) => Promise<number>;
  /** Every path kept under a prefix. Throws when it cannot be read. */
  list: (prefix: string) => Promise<string[]>;
  /** Deletes files. Throws when one could not be. */
  remove: (pathnames: string[]) => Promise<void>;
};

const HANDS: Hands = {
  measure: async (folder) => (await storageUsed(folder, SETUP_STORAGE_BYTES)).bytes,
  list: listFiles,
  remove: deleteFile,
};

/**
 * Removes what a store keeps: every file on a product, a price option or a
 * lesson, every lesson video, every podcast episode, and whatever else sits
 * in the store's folders (the copies stamped for buyers, an upload that was
 * never attached). Each record is written without its file before the file
 * is deleted, the order every removal here is done in, so nothing is ever
 * left pointing at a file that is gone because a write failed halfway.
 *
 * `clean` is whether all of it was seen through: every record written, every
 * folder read to its end, every file deleted. Anything short of that and the
 * store is not written down as done, and this is run again the next day.
 * Safe to run again: what is already gone is passed over.
 *
 * A store that keeps thousands of files is more than one run can delete.
 * Past `until` this stops where it is and says it was not seen through, and
 * the next day's run carries on from what is left in the folders.
 */
export async function removeStored(key: string, hands: Pick<Hands, "list" | "remove"> = HANDS, until = Number.POSITIVE_INFINITY): Promise<{ files: number; clean: boolean }> {
  const store = await storeForEmail(key);
  if (!store) return { files: 0, clean: true };
  const folder = await storeFolder(key);
  const gone: string[] = [];
  let clean = true;
  const failed = (what: string, error: unknown) => {
    clean = false;
    console.error(`removing what a store kept: ${what}`, error);
  };

  // Every product the store has, read whole: each may carry a file, and
  // this runs once for a store, from a daily job, never when a page opens.
  for (const listing of await readAllListings(store)) {
    try {
      for (const id of [...(listing.file ? [listing.id] : []), ...listing.options.filter((option) => option.file).map((option) => option.id)]) {
        const done = await setProductFile(key, id, null);
        if (done.ok && done.removed) gone.push(done.removed.pathname);
        else if (!done.ok) failed(`could not take the file off ${id}`, done.reason);
      }
      if (listing.course) {
        const courseId = listing.course.id;
        await withLock(`nl:course:${courseId}:lock`, 60, 15_000, async () => {
          let course = await readCourse(courseId);
          if (!course) return;
          const files = filesInCourse(course);
          for (const file of files) {
            const lesson = course.modules.flatMap((unit) => unit.lessons).find((l) => l.video?.pathname === file.pathname || l.files.some((f) => f.pathname === file.pathname));
            if (!lesson) continue;
            const edited = editCourse(course, { op: "media-remove", lessonId: lesson.id, pathname: file.pathname });
            if (edited.ok) course = edited.course;
          }
          if (files.length) {
            await saveCourse(course);
            const left = new Set(filesInCourse(course).map((f) => f.pathname));
            gone.push(...files.map((f) => f.pathname).filter((path) => !left.has(path)));
            if (left.size) failed(`a course kept ${left.size} of its files`, courseId);
          }
        });
      }
      if (listing.podcast) {
        const podcastId = listing.podcast.id;
        const productId = listing.id;
        await withLock(`nl:pod:${podcastId}:lock`, 60, 15_000, async () => {
          let podcast = await readPodcast(podcastId);
          if (!podcast || podcast.episodes.length === 0) return;
          for (const episode of [...podcast.episodes]) {
            const edited = editPodcast(podcast, { op: "remove", id: episode.id });
            if (edited.ok) {
              podcast = edited.podcast;
              gone.push(episode.pathname);
            }
          }
          await savePodcast(podcast);
          await setPodcastEpisodes(key, productId, podcast.episodes.length);
        });
      }
    } catch (error) {
      failed(`one product's records (${listing.id})`, error);
    }
  }

  // The bytes, now that nothing points at them. A lesson's video kept by the
  // video service is taken away there (and kept in line there if it cannot
  // be just now: lib/stream.ts); everything else, from the file store.
  const late = () => Date.now() > until;
  /** Deletes files a few at a time, several at once: one after another, a large store would take hours. */
  const removeAll = async (paths: string[]): Promise<void> => {
    let at = 0;
    const work = async () => {
      while (at < paths.length && !late()) {
        const some = paths.slice(at, at + 20);
        at += some.length;
        await hands.remove(some);
      }
    };
    await Promise.all(Array.from({ length: 6 }, work));
    if (at < paths.length) throw new Error("out of time");
  };
  try {
    for (const path of gone.filter((path) => readStreamPath(path) !== null)) {
      if (late()) throw new Error("out of time");
      await dropStream(path);
    }
    await removeAll(gone.filter((path) => readStreamPath(path) === null));
  } catch (error) {
    failed("what its records named could not all be deleted", error);
  }
  // And whatever else is in the store's own folders, in either file store.
  for (const prefix of [`vault/${folder}/`, `stores/${folder}/`]) {
    try {
      await removeAll(await hands.list(prefix));
    } catch (error) {
      failed(`what was left under ${prefix.split("/")[0]}/`, error);
    }
  }
  if ((await dropAllStreams(folder, until).catch(() => null)) === null) failed("the video service could not be read to its end", folder);
  return { files: gone.length, clean };
}

export type Closing = {
  key: string;
  /**
   *   fits       keeps no more than a store with no plan may: nothing to do
   *   running    a plan runs again (or Stripe says one does): out of line
   *   told       a notice was sent today
   *   waiting    told already, and the day has not come
   *   removed    what it kept was removed today
   *   held       something could not be done or checked: tried again tomorrow
   *   gone       the store is not there any more
   */
  state: "fits" | "running" | "told" | "waiting" | "removed" | "held" | "gone";
  note?: string;
};

/** One store whose plan has ended, looked at for today. */
export async function closeOne(key: string, now = Date.now(), hands: Hands = HANDS, until = Number.POSITIVE_INFINITY): Promise<Closing> {
  const store = await storeForEmail(key);
  if (!store) {
    await redisPipeline([["ZREM", ENDED_INDEX, key], ["DEL", stateKey(key)]]);
    return { key, state: "gone" };
  }
  const endedAt = Date.parse(store.planEndedAt);
  if (standingOf(store, now / 1000) !== "ended" || !Number.isFinite(endedAt)) {
    await redisPipeline([["ZREM", ENDED_INDEX, key], ["DEL", stateKey(key)]]);
    return { key, state: "running" };
  }
  // On a break the creator chose (lib/plan-pause.ts): everything is kept and
  // nobody is written to until it ends. Nothing is written down either, so
  // the day after it ends this store is looked at as if for the first time.
  if (await onBreak(key, now / 1000)) return { key, state: "held", note: "on a break" };
  const [raw] = await redisPipeline([["GET", stateKey(key)]]);
  const read = parseState(raw);
  // Notices about an earlier ending say nothing about this one.
  const state: State = read.of === endedAt ? read : { of: endedAt };
  const save = (next: State) => redisPipeline([["SET", stateKey(key), JSON.stringify(next)]]);
  const send = async (kind: "ended" | "month" | "week" | "removed", day: number, held: number): Promise<boolean> => {
    const { subject, text } = letter(kind, store, held, endedAt, day, now);
    // The same notice asked for twice in a day is sent once (a record that
    // could not be written after it went out).
    const idempotencyKey = `${stateKey(key)}:${endedAt}:${kind}`;
    const sent = await sendEmail({ from: NIMBUS_FROM, to: store.email, replyTo: SUPPORT_EMAIL, subject, text, idempotencyKey }).catch((error) => {
      console.error("sending a notice about an ended plan's files failed", error);
      return false;
    });
    return sent !== false;
  };

  if (state.removed) {
    // Done. All that can be left is the letter saying so, if it could not
    // be sent on the day.
    if (!state.said && isSenderConfigured() && (await send("removed", now, 0))) await save({ ...state, said: now });
    return { key, state: "fits" };
  }
  if (state.fit && now - state.fit < RECHECK_DAYS * DAY_MS) return { key, state: "fits" };

  const folder = await storeFolder(storeRef(store));
  const held = await hands.measure(folder);
  if (held <= SETUP_STORAGE_BYTES) {
    // It fits, so whatever it was told no longer stands. Should it ever keep
    // more again (a copy stamped for a buyer is kept in its folder too), it
    // is told from the start, and has its week from that notice.
    await save({ of: endedAt, fit: now });
    return { key, state: "fits" };
  }

  if (!isSenderConfigured()) return { key, state: "held", note: "no way to write to the creator" };

  // The day is never sooner than a week after the last notice went out.
  const day = Math.max(removalDay(endedAt), state.week ? state.week + WARN_WEEK_DAYS * DAY_MS : 0);
  const due = noticeFor(endedAt, now);
  if (!state[due]) {
    // The last notice names the day it makes true: a week from today, when
    // it goes out later than a week before the day first given.
    const named = due === "week" ? Math.max(removalDay(endedAt), now + WARN_WEEK_DAYS * DAY_MS) : removalDay(endedAt);
    if (!(await send(due, named, held))) return { key, state: "held", note: "the notice could not be sent" };
    await save({ ...state, [due]: now });
    return { key, state: "told", note: due };
  }
  if (!state.week || now < day) return { key, state: "waiting" };

  // The day has come. Stripe is asked, today, before anything is touched:
  // about the subscription this store has written down, and then for any
  // other in good standing that names it.
  if (!isBillingConfigured()) return { key, state: "held", note: "Stripe could not be asked" };
  let live;
  try {
    if (store.subscriptionId) {
      const own = await readSubscription(store.subscriptionId);
      if (own.state === "unknown") return { key, state: "held", note: "Stripe could not be asked" };
      if (own.state === "active") {
        await setSubscription(key, { active: true, tier: own.tier, cycle: own.cycle, trialEnds: own.trialing ? own.until : 0, shared: own.shared });
        await redisPipeline([["DEL", stateKey(key)]]);
        return { key, state: "running", note: "Stripe says the plan runs" };
      }
    }
    live = (await findStoreSubscriptions(store)).live;
  } catch (error) {
    console.error("asking Stripe about an ended plan failed", error);
    return { key, state: "held", note: "Stripe could not be asked" };
  }
  if (live) {
    // Our note was wrong, or the plan was started again a moment ago: put right.
    await setSubscription(key, { customerId: live.customerId, subscriptionId: live.subscriptionId, active: true, tier: live.tier, cycle: live.cycle, trialEnds: live.trialEnds, shared: live.shared });
    await redisPipeline([["DEL", stateKey(key)]]);
    return { key, state: "running", note: "Stripe says the plan runs" };
  }

  const done = await removeStored(key, hands, until);
  if (!done.clean) return { key, state: "held", note: `removed ${done.files}, and something could not be removed` };
  const after = await hands.measure(folder);
  if (after > SETUP_STORAGE_BYTES) return { key, state: "held", note: `removed ${done.files} and it still keeps ${bytesWords(after)}` };
  await save({ ...state, removed: now });
  if (await send("removed", now, 0)) await save({ ...state, removed: now, said: now });
  return { key, state: "removed", note: `${done.files} files` };
}

const AFTER = "nl:plan:closing:after";
const PAGE = 200;

/**
 * The daily run: every store whose plan has ended, the longest ended first.
 *
 * Stops at `deadline`, and writes down the day the store it stopped at lost
 * its plan; the next run begins there, so a line longer than one run can
 * look at is still walked to its end, a part a day. A store is looked at
 * once in a run however many share the moment their plans ended.
 */
export async function closeEnded(deadline: number, now = Date.now(), hands: Hands = HANDS): Promise<Closing[]> {
  if (!isRedisConfigured()) return [];
  const [saved] = await redisPipeline([["GET", AFTER]]);
  let from: string = typeof saved === "string" && /^\d+$/.test(saved) ? saved : "0";
  const seen = new Set<string>();
  const out: Closing[] = [];
  for (;;) {
    const [raw] = await redisPipeline([["ZRANGEBYSCORE", ENDED_INDEX, from, now, "WITHSCORES", "LIMIT", 0, PAGE]]);
    const flat = Array.isArray(raw) ? raw : [];
    const rows: { key: string; score: string }[] = [];
    for (let i = 0; i + 1 < flat.length; i += 2) rows.push({ key: String(flat[i]), score: String(flat[i + 1]) });
    for (const row of rows) {
      if (seen.has(row.key)) continue;
      if (Date.now() > deadline) {
        await redisPipeline([["SET", AFTER, String(Math.floor(Number(row.score))), "EX", 30 * 24 * 60 * 60]]);
        return out;
      }
      seen.add(row.key);
      try {
        out.push(await closeOne(row.key, now, hands, deadline));
      } catch (error) {
        console.error("looking at a store whose plan ended failed", error);
        out.push({ key: row.key, state: "held", note: "failed" });
      }
    }
    if (rows.length < PAGE) break;
    // The next page begins at the last moment of this one, which the page
    // was read up to and through: whoever shares it has been looked at.
    const last = String(Math.floor(Number(rows[rows.length - 1].score)));
    from = last === from.replace("(", "") ? `(${last}` : last;
  }
  await redisPipeline([["DEL", AFTER]]);
  return out;
}
