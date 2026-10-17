/**
 * Assignments: where they are kept, and what handing one in and reviewing it
 * do (lib/assignment-rules.ts says what they are).
 *
 *   nl:course:<course>:task:<lesson>              the prompt and its switches
 *   nl:course:<course>:task:<lesson>:sub:<who>    one student's work, and what came back
 *   nl:course:<course>:task:<lesson>:files        every file handed in for it, and its size, to delete with it
 *   nl:course:<course>:tasks:waiting              work waiting for the creator, oldest first
 *   nl:course:<course>:tasks:all                  all the work handed in, by when it last was
 *   nl:tasks:bytes:<store key>                    what the store's students keep handed in, in bytes
 *   nl:tasks:doors                                files a student was let upload, by when: handed in, or deleted after a day
 *   nl:course:<course>:tasks:told                 the creator was told of new work this hour
 *
 * Done is what the rest of the course already reads: the lesson marked done
 * (its progress, its certificate) and written down beside the quizzes passed,
 * which is what holds later lessons shut (lib/quiz.ts, heldBack). Handed in
 * on an assignment the creator does not review, it is done at once; on one
 * they review, when they approve it.
 */
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { markLesson } from "@/lib/learn";
import { markPassed } from "@/lib/quiz";
import { ITEM_ID_PATTERN } from "@/lib/course";
import {
  type HandedFile,
  MAX_ANSWER_TEXT,
  MAX_FEEDBACK,
  MAX_STORE_TASK_BYTES,
  type Submission,
  type Task,
  type TaskState,
  parseTaskSetup,
} from "@/lib/assignment-rules";

const taskKey = (courseId: string, lessonId: string) => `nl:course:${courseId}:task:${lessonId}`;
const subKey = (courseId: string, lessonId: string, who: string) => `nl:course:${courseId}:task:${lessonId}:sub:${who}`;
const filesKey = (courseId: string, lessonId: string) => `nl:course:${courseId}:task:${lessonId}:files`;
const waitingKey = (courseId: string) => `nl:course:${courseId}:tasks:waiting`;
const allKey = (courseId: string) => `nl:course:${courseId}:tasks:all`;
const bytesKey = (room: string) => `nl:tasks:bytes:${room}`;
const DOORS_KEY = "nl:tasks:doors";
/** A file uploaded and not handed in within this long is deleted. */
export const DOOR_SECONDS = 24 * 60 * 60;
const WHO = /^[0-9a-f]{16,64}$/;

function parse<T>(raw: unknown): T | null {
  if (typeof raw !== "string" || !raw) return null;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return null;
  }
}

export async function readTaskFor(courseId: string, lessonId: string): Promise<Task | null> {
  if (!isRedisConfigured() || !ITEM_ID_PATTERN.test(lessonId)) return null;
  const [raw] = await redisPipeline([["GET", taskKey(courseId, lessonId)]]);
  const value = parse<Record<string, unknown>>(raw);
  if (!value || typeof value.prompt !== "string" || !value.prompt) return null;
  return { ...(parseTaskSetup(value) as Task), prompt: value.prompt };
}

export async function saveTask(courseId: string, lessonId: string, task: Task): Promise<void> {
  await redisPipeline([["SET", taskKey(courseId, lessonId), JSON.stringify(task)]]);
}

/** Forgets an assignment and all the work handed in for it. Returns the files to delete. */
export async function dropTask(courseId: string, lessonId: string, room: string | null): Promise<string[]> {
  if (!isRedisConfigured()) return [];
  const [flat] = await redisPipeline([["HGETALL", filesKey(courseId, lessonId)]]);
  const pairs = Array.isArray(flat) ? flat : [];
  const files: string[] = [];
  let bytes = 0;
  for (let i = 0; i + 1 < pairs.length; i += 2) {
    files.push(String(pairs[i]));
    bytes += Number(pairs[i + 1]) || 0;
  }
  // Each student's own record, found by the list of all the work handed in.
  const [waiting] = await redisPipeline([["ZRANGEBYSCORE", allKey(courseId), "-inf", "+inf"]]);
  const gone = (Array.isArray(waiting) ? waiting : []).filter((m): m is string => typeof m === "string" && m.startsWith(`${lessonId}|`));
  await redisPipeline([
    ["DEL", taskKey(courseId, lessonId), filesKey(courseId, lessonId)],
    ...gone.map((member) => ["DEL", subKey(courseId, lessonId, member.slice(lessonId.length + 1))]),
    ...(gone.length ? [["ZREM", waitingKey(courseId), ...gone], ["ZREM", allKey(courseId), ...gone]] : []),
  ]);
  if (room && bytes) await releaseBytes(room, bytes);
  return files;
}

/** One student's work on one assignment, or null when they have handed nothing in. */
export async function submissionOf(courseId: string, lessonId: string, who: string): Promise<Submission | null> {
  if (!isRedisConfigured() || !WHO.test(who) || !ITEM_ID_PATTERN.test(lessonId)) return null;
  const [raw] = await redisPipeline([["GET", subKey(courseId, lessonId, who)]]);
  return parse<Submission>(raw);
}

/** Several students' work at once, in the order asked, null where there is none. */
export async function submissionsOf(courseId: string, rows: { lessonId: string; who: string }[]): Promise<(Submission | null)[]> {
  const asked = rows.filter((r) => WHO.test(r.who) && ITEM_ID_PATTERN.test(r.lessonId));
  if (!isRedisConfigured() || !asked.length) return rows.map(() => null);
  const raw = await redisPipeline(asked.map((r) => ["GET", subKey(courseId, r.lessonId, r.who)]));
  const found = new Map(asked.map((r, i) => [`${r.lessonId}|${r.who}`, parse<Submission>(raw[i])]));
  return rows.map((r) => found.get(`${r.lessonId}|${r.who}`) ?? null);
}

/**
 * Room for a file of this size in what this store's students keep: taken
 * now, given back when the file is no longer kept (releaseBytes). `limit`
 * is the store's own (lib/assignment-rules.ts, taskRoomFor).
 */
export async function takeRoom(room: string, bytes: number, limit: number = MAX_STORE_TASK_BYTES): Promise<boolean> {
  if (!isRedisConfigured() || !Number.isFinite(bytes) || bytes <= 0 || !Number.isSafeInteger(limit) || limit <= 0) return false;
  const [used] = await redisPipeline([["INCRBY", bytesKey(room), Math.ceil(bytes)]]);
  if (Number(used) > limit) {
    await redisPipeline([["DECRBY", bytesKey(room), Math.ceil(bytes)]]);
    return false;
  }
  return true;
}

/** Whether a file of this size would still fit, read without taking anything. */
export async function hasRoom(room: string, bytes: number, limit: number = MAX_STORE_TASK_BYTES): Promise<boolean> {
  if (!isRedisConfigured()) return false;
  const [used] = await redisPipeline([["GET", bytesKey(room)]]);
  return (Number(used) || 0) + bytes <= limit;
}

/** Gives back room taken for files that are no longer kept. */
export async function releaseBytes(room: string, bytes: number): Promise<void> {
  if (!isRedisConfigured() || !(bytes > 0)) return;
  const [left] = await redisPipeline([["DECRBY", bytesKey(room), Math.ceil(bytes)]]);
  if (Number(left) < 0) await redisPipeline([["SET", bytesKey(room), 0]]);
}

/** What handing in did: where the work stands, and the earlier file it replaced, with its size, to delete. */
export type HandIn = { state: TaskState; replaced: HandedFile | null };

/**
 * A student hands their work in, or hands it in again. What they handed in
 * before is replaced; its file, if this one has another, is returned to be
 * deleted. Done at once on an assignment nobody reviews.
 */
export async function handIn(input: {
  courseId: string;
  lessonId: string;
  who: string;
  email: string;
  task: Task;
  text: string;
  file: HandedFile | null;
  now?: number;
}): Promise<HandIn> {
  const { courseId, lessonId, who, task } = input;
  const at = input.now ?? Math.floor(Date.now() / 1000);
  const before = await submissionOf(courseId, lessonId, who);
  const state: TaskState = task.review ? "waiting" : "approved";
  const kept: Submission = {
    text: input.text.replace(/\r\n?/g, "\n").trim().slice(0, MAX_ANSWER_TEXT),
    file: input.file,
    at,
    state,
    feedback: "",
    reviewedAt: 0,
    tries: (before?.tries ?? 0) + 1,
  };
  const member = `${lessonId}|${who}`;
  await redisPipeline([
    ["SET", subKey(courseId, lessonId, who), JSON.stringify(kept)],
    ...(input.file ? [["HSET", filesKey(courseId, lessonId), input.file.path, input.file.bytes]] : []),
    task.review ? ["ZADD", waitingKey(courseId), at, member] : ["ZREM", waitingKey(courseId), member],
    ["ZADD", allKey(courseId), at, member],
  ]);
  if (!task.review) await finish(courseId, lessonId, who, input.email);
  const replaced = before?.file && before.file.path !== input.file?.path ? before.file : null;
  if (replaced) await redisPipeline([["HDEL", filesKey(courseId, lessonId), replaced.path]]);
  return { state, replaced };
}

/** The lesson done, for the outline, the progress and the certificate, and the lessons after it open. */
async function finish(courseId: string, lessonId: string, who: string, email: string): Promise<void> {
  await markPassed(courseId, who, lessonId);
  if (email) await markLesson(courseId, email, lessonId, true);
}

export type Waiting = { lessonId: string; who: string; at: number };

/**
 * Work for the creator to read, and how much there is: what is waiting,
 * oldest first, or with `all` everything handed in, newest first.
 */
export async function waitingWork(courseId: string, limit = 50, all = false): Promise<{ rows: Waiting[]; total: number }> {
  if (!isRedisConfigured()) return { rows: [], total: 0 };
  const key = all ? allKey(courseId) : waitingKey(courseId);
  const [rows, total] = await redisPipeline([
    all ? ["ZREVRANGE", key, 0, limit - 1, "WITHSCORES"] : ["ZRANGEBYSCORE", key, "-inf", "+inf", "WITHSCORES", "LIMIT", 0, limit],
    ["ZCARD", key],
  ]);
  const flat = Array.isArray(rows) ? rows : [];
  const out: Waiting[] = [];
  for (let i = 0; i + 1 < flat.length; i += 2) {
    const [lessonId, who] = String(flat[i]).split("|");
    if (lessonId && who) out.push({ lessonId, who, at: Number(flat[i + 1]) || 0 });
  }
  return { rows: out, total: Number(total) || 0 };
}

export type Review = { ok: true; submission: Submission } | { ok: false; reason: "unknown" | "state" };

/**
 * The creator approves a student's work, or asks for another try, with what
 * they wrote back. Only work that is waiting is reviewed; approving it marks
 * the lesson done for the student.
 */
export async function review(input: {
  courseId: string;
  lessonId: string;
  who: string;
  email: string;
  verdict: "approved" | "again";
  feedback: string;
  now?: number;
}): Promise<Review> {
  const { courseId, lessonId, who } = input;
  const before = await submissionOf(courseId, lessonId, who);
  if (!before) return { ok: false, reason: "unknown" };
  if (before.state !== "waiting") return { ok: false, reason: "state" };
  const after: Submission = {
    ...before,
    state: input.verdict,
    feedback: input.feedback.replace(/\r\n?/g, "\n").trim().slice(0, MAX_FEEDBACK),
    reviewedAt: input.now ?? Math.floor(Date.now() / 1000),
  };
  await redisPipeline([
    ["SET", subKey(courseId, lessonId, who), JSON.stringify(after)],
    ["ZREM", waitingKey(courseId), `${lessonId}|${who}`],
  ]);
  if (input.verdict === "approved") await finish(courseId, lessonId, who, input.email);
  return { ok: true, submission: after };
}

// ---------------------------------------------------------------- uploads

/** Notes a file a student was let upload, so one never handed in is deleted (sweepTaskUploads). */
export async function noteTaskUpload(path: string, now = Date.now()): Promise<void> {
  await redisPipeline([["ZADD", DOORS_KEY, Math.floor(now / 1000), path]]);
}

/** Whether this file was let in through the door and not handed in yet; it is then taken. */
export async function takeTaskUpload(path: string): Promise<boolean> {
  const [removed] = await redisPipeline([["ZREM", DOORS_KEY, path]]);
  return Number(removed) === 1;
}

/**
 * Files uploaded more than a day ago and never handed in, to delete: the
 * student closed the page, or chose another file. Taken off the list here;
 * the caller deletes them. A few hundred a run at most.
 */
export async function staleTaskUploads(now = Date.now(), limit = 300): Promise<string[]> {
  if (!isRedisConfigured()) return [];
  const before = Math.floor(now / 1000) - DOOR_SECONDS;
  const [paths] = await redisPipeline([["ZRANGEBYSCORE", DOORS_KEY, 0, before, "LIMIT", 0, limit]]);
  const out = (Array.isArray(paths) ? paths : []).filter((p): p is string => typeof p === "string");
  if (out.length) await redisPipeline([["ZREM", DOORS_KEY, ...out]]);
  return out;
}

/** Whether to tell the creator about new work now: once an hour per course at most. */
export async function tellCreatorNow(courseId: string): Promise<boolean> {
  const [fresh] = await redisPipeline([["SET", `nl:course:${courseId}:tasks:told`, "1", "NX", "EX", 3_600]]);
  return fresh !== null;
}

/** Forgets every assignment of a course that is going, and returns their files to delete. */
export async function dropCourseTasks(course: { id: string; modules: { lessons: { id: string; task?: unknown }[] }[] }, room: string | null): Promise<string[]> {
  const files: string[] = [];
  for (const unit of course.modules) {
    for (const lesson of unit.lessons) {
      if (lesson.task) files.push(...(await dropTask(course.id, lesson.id, room)));
    }
  }
  if (files.length || course.modules.some((m) => m.lessons.some((l) => l.task))) {
    await redisPipeline([["DEL", waitingKey(course.id), allKey(course.id)]]);
  }
  return files;
}
