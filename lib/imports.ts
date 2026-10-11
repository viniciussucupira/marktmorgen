/**
 * Moving from another platform: three imports, each a spreadsheet the
 * creator brings from Stan, Gumroad, Kajabi, Mailchimp or anywhere else.
 *
 *   contacts   addresses onto the store's email list — only people the
 *              creator confirms agreed to hear from them, and never anyone
 *              who unsubscribed here (lib/contacts.ts). Up to 50,000 rows.
 *   products   drafts in the store, each checked the way the product editor
 *              checks it, hidden until the creator publishes it. Up to 500.
 *   purchases  past buyers given what they bought before, with no payment
 *              and no receipt here, marked for what they are
 *              (lib/imported-purchases.ts). Up to 20,000 rows, and, only if
 *              the creator ticks it, one email to each buyer saying so — at
 *              most MOVED_EMAILS_PER_30_DAYS per store in thirty days, and
 *              within the company's daily cap (lib/mail.ts), since they go
 *              out from our sender to addresses only the creator vouches for.
 *
 * The browser reads the file (lib/csv.ts), the creator says which column is
 * which, and the rows come here in batches of up to BATCH_ROWS, each cell
 * capped. Nothing is trusted: every row is checked again here, when it is
 * applied. The work itself is done a chunk at a time — a few hundred rows,
 * or fifty products — so no request runs long: the studio's page advances it
 * while it is open (runImport, from app/api/store/import), and the job every
 * five minutes finishes whatever is left (app/api/cron/imports). Two never
 * run the same import at once: each takes the import's lock.
 *
 * Every row that is not brought in is written down with its row number, the
 * column and the reason, and the creator downloads that as a spreadsheet
 * (lib/csv.ts writes it, so nothing in it runs as a formula). A store runs
 * one import at a time.
 *
 *   nl:import:<id>              the import: its kind, store, state, counts
 *   nl:import:<id>:rows         the rows as they came, one batch per entry
 *   nl:import:<id>:seen         what was seen already -> the row it was on
 *   nl:import:<id>:errors       rows not brought in, for the report
 *   nl:import:<id>:mail         buyers still to be emailed (purchases only)
 *   nl:import:<id>:lock         whoever is working on it now
 *   nl:imports:busy:<sid>       the import a store is running, while it runs
 *   nl:imports:list:<sid>       the store's last imports, newest first
 *   nl:imports:active           imports with work left, for the job
 *
 * Everything but the list of a store's last imports is let go two weeks
 * after the import began.
 */
import { randomBytes } from "node:crypto";
import { EMAIL_PATTERN, MAX_EMAIL_LENGTH, normaliseEmail } from "@/lib/auth";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { LockBusyError, releaseLock, takeLock } from "@/lib/redis-lock";
import {
  type DraftProduct,
  type Store,
  MAX_PRODUCTS,
  MAX_SUMMARY_LENGTH,
  MAX_TITLE_LENGTH,
  addDraftProducts,
  ensureListId,
  ensureStatsId,
  setPastBuyers,
  storeForId,
  storeRef,
} from "@/lib/store";
import { readAllListings, readListings } from "@/lib/catalog";
import { priceInRange, rangeWords, readMoney } from "@/lib/money";
import { LINK_PROBLEMS, type LinkProblem, readLink } from "@/lib/product-link";
import { MAX_ABOUT_LENGTH, cleanAbout, writeAbout } from "@/lib/product-about";
import { MAX_CONTACT_NAME, importContactRows, readTags } from "@/lib/contacts";
import { csvLine, readConsent } from "@/lib/csv";
import { grantImported, importedFor } from "@/lib/imported-purchases";
import { deliverableItems } from "@/lib/bundle-rules";
import { NIMBUS_FROM, isSenderConfigured, sendBatch } from "@/lib/email";
import { releaseDay, reserveDay } from "@/lib/mail";
import { healthTags, noteSent, pausedFor, rampBack, rampRoom, startRamp } from "@/lib/mail-health";
import { isPaidUp } from "@/lib/billing";
import { storeBase } from "@/lib/purchase-email";

export type ImportKind = "contacts" | "products" | "purchases";

/** The most rows one import may bring, by kind. */
export const IMPORT_LIMITS: Record<ImportKind, number> = { contacts: 50_000, products: 500, purchases: 20_000 };
/** Rows one upload request may carry. */
export const BATCH_ROWS = 1_000;
/** The most an upload request may weigh. */
export const BATCH_BYTES = 1_000_000;
/** Rows kept for the report of what was not brought in; the count goes on past it. */
export const MAX_REPORT_ROWS = 5_000;

/** The columns each kind's rows carry, after the row number. */
export const COLUMNS: Record<ImportKind, string[]> = {
  contacts: ["email", "name", "tags", "consent"],
  products: ["title", "price", "description", "type", "link"],
  purchases: ["email", "product"],
};

/** How long a cell may be as it arrives; one longer is kept to this plus one, to be refused. */
const CELL_CAPS: Record<ImportKind, number[]> = {
  contacts: [MAX_EMAIL_LENGTH, MAX_CONTACT_NAME, 400, 40],
  products: [MAX_TITLE_LENGTH, 30, MAX_ABOUT_LENGTH * 2, 20, 2_000],
  purchases: [MAX_EMAIL_LENGTH, 200],
};

/** Rows applied in one step, by kind: small enough that a step is a few seconds at most. */
const CHUNK: Record<ImportKind, number> = { contacts: 1_000, products: 50, purchases: 250 };
/** Buyers emailed in one step. */
const MAIL_CHUNK = 100;
/**
 * Buyers brought over one store may email in thirty days: one full import's
 * worth. The addresses are the creator's word alone, and the email goes out
 * from our sender, so a store cannot turn imports into a mailing list.
 */
export const MOVED_EMAILS_PER_30_DAYS = 20_000;
const movedKey = (sid: string) => `nl:imports:moved:${sid}`;

/** Takes up to `n` from the store's thirty days; answers how many it may send now. */
async function reserveMoved(sid: string, n: number): Promise<number> {
  const [, total] = await redisPipeline([
    ["SET", movedKey(sid), "0", "NX", "EX", 30 * 86_400],
    ["INCRBY", movedKey(sid), n],
  ]);
  const over = Math.min(n, Math.max(0, Number(total) - MOVED_EMAILS_PER_30_DAYS));
  if (over > 0) await redisPipeline([["DECRBY", movedKey(sid), over]]);
  return n - over;
}
const KEEP_SECONDS = 14 * 86_400;
/** An upload that stops before its last batch is given up after this long. */
const RECEIVING_MS = 2 * 60 * 60 * 1000;
const LOCK_SECONDS = 70;
const LIST_SIZE = 10;

export const IMPORT_ID_PATTERN = /^[0-9a-f]{24}$/;

export type ImportState = "receiving" | "queued" | "running" | "mailing" | "done" | "canceled" | "failed";

export type ImportJob = {
  id: string;
  kind: ImportKind;
  /** The store's own id. */
  sid: string;
  /** Who started it. */
  by: string;
  /** When it began, in milliseconds. */
  at: number;
  state: ImportState;
  /** The file's name, for the list of imports. */
  file: string;
  /** Rows the browser said it would send. */
  expected: number;
  /** Rows received. */
  total: number;
  /** Rows looked at. */
  done: number;
  /** Where the next step starts: which batch, and which row in it. */
  cursor: { batch: number; row: number };
  counts: {
    /** Brought in: added to the list, made as a draft, given to a buyer. */
    added: number;
    /** Already there: on the list as agreeing, or already given that product. */
    already: number;
    /** Left out on purpose: no consent, unsubscribed, a repeated row. */
    skipped: number;
    /** Could not be brought in: see the report. */
    errors: number;
    /** Buyers emailed, and emails the sender refused. */
    mailed: number;
    unmailed: number;
  };
  options: {
    /** Contacts: the creator confirmed these people agreed to hear from them. */
    agreed: boolean;
    /** Contacts: the file has a column saying, row by row, whether each did. */
    consentColumn: boolean;
    /** Contacts: labels given to everyone this file brings. */
    tags: string[];
    /** Purchases: one email to each buyer given something. */
    email: boolean;
  };
  finishedAt: number;
};

const jobKey = (id: string) => `nl:import:${id}`;
const rowsKey = (id: string) => `nl:import:${id}:rows`;
const seenKey = (id: string) => `nl:import:${id}:seen`;
const errorsKey = (id: string) => `nl:import:${id}:errors`;
const mailKey = (id: string) => `nl:import:${id}:mail`;
const lockKey = (id: string) => `nl:import:${id}:lock`;
const busyKey = (sid: string) => `nl:imports:busy:${sid}`;
const listKey = (sid: string) => `nl:imports:list:${sid}`;
const ACTIVE_KEY = "nl:imports:active";

type Command = (string | number)[];

function parseJob(raw: unknown): ImportJob | null {
  if (typeof raw !== "string") return null;
  try {
    const value = JSON.parse(raw) as ImportJob;
    return value && typeof value.id === "string" && IMPORT_ID_PATTERN.test(value.id) ? value : null;
  } catch {
    return null;
  }
}

export async function readJob(id: string): Promise<ImportJob | null> {
  if (!IMPORT_ID_PATTERN.test(id) || !isRedisConfigured()) return null;
  const [raw] = await redisPipeline([["GET", jobKey(id)]]);
  return parseJob(raw);
}

/** One import of this store, or null when it is not this store's. */
export async function jobOf(store: Store, id: string): Promise<ImportJob | null> {
  const job = await readJob(id);
  return job && store.sid && job.sid === store.sid ? job : null;
}

function saveJob(job: ImportJob): Command {
  return ["SET", jobKey(job.id), JSON.stringify(job), "EX", KEEP_SECONDS];
}

/** The store's last imports, newest first, and the one running now if any. */
export async function storeImports(store: Store): Promise<ImportJob[]> {
  if (!store.sid || !isRedisConfigured()) return [];
  const [ids] = await redisPipeline([["LRANGE", listKey(store.sid), 0, LIST_SIZE - 1]]);
  const list = Array.isArray(ids) ? ids.map(String).filter((id) => IMPORT_ID_PATTERN.test(id)) : [];
  if (!list.length) return [];
  const raws = await redisPipeline(list.map((id) => ["GET", jobKey(id)]));
  return raws.map(parseJob).filter((job): job is ImportJob => job !== null && job.sid === store.sid);
}

export type StartProblem = "busy" | "too_many" | "consent" | "email" | "list" | "store" | "unavailable";

/**
 * Begins an import: the browser has read the file and says how many rows it
 * will send. A store runs one import at a time, so a second waits for the
 * first to finish or be cancelled.
 */
export async function startImport(
  store: Store,
  by: string,
  kind: ImportKind,
  input: { expected: number; file: string; agreed?: boolean; consentColumn?: boolean; tags?: string[]; email?: boolean },
): Promise<{ ok: true; job: ImportJob } | { ok: false; reason: StartProblem; limit?: number }> {
  if (!isRedisConfigured()) return { ok: false, reason: "unavailable" };
  if (!store.sid) return { ok: false, reason: "store" };
  const expected = Math.floor(Number(input.expected));
  if (!Number.isFinite(expected) || expected < 1 || expected > IMPORT_LIMITS[kind]) {
    return { ok: false, reason: "too_many", limit: IMPORT_LIMITS[kind] };
  }
  // Contacts come in only when the creator says, in so many words, that these
  // people agreed to hear from them. A per-row consent column narrows that;
  // it never replaces it.
  if (kind === "contacts" && input.agreed !== true) return { ok: false, reason: "consent" };
  if (kind === "products" && store.catalog.items.length >= MAX_PRODUCTS) return { ok: false, reason: "too_many", limit: MAX_PRODUCTS };
  // The one email to past buyers is sent from the store's name by our sender:
  // only for a store in good standing, where email can go out at all.
  if (kind === "purchases" && input.email === true && (!isSenderConfigured() || !isPaidUp(store))) return { ok: false, reason: "email" };
  const ref = storeRef(store);
  if (kind === "contacts" && !store.listId && !(await ensureListId(ref))?.listId) return { ok: false, reason: "list" };
  if ((kind === "purchases" || kind === "products") && !store.statsId) await ensureStatsId(ref);

  const id = randomBytes(12).toString("hex");
  const [claimed] = await redisPipeline([["SET", busyKey(store.sid), id, "NX", "EX", KEEP_SECONDS]]);
  if (claimed === null) {
    // A slot held by an import that has since finished, or was given up, is freed.
    const [holder] = await redisPipeline([["GET", busyKey(store.sid)]]);
    const other = typeof holder === "string" ? await readJob(holder) : null;
    if (other && !finished(other.state) && !(other.state === "receiving" && Date.now() - other.at > RECEIVING_MS)) {
      return { ok: false, reason: "busy" };
    }
    if (other && other.state === "receiving") await cancelJob(other);
    await redisPipeline([["SET", busyKey(store.sid), id, "EX", KEEP_SECONDS]]);
  }
  const job: ImportJob = {
    id,
    kind,
    sid: store.sid,
    by,
    at: Date.now(),
    state: "receiving",
    file: String(input.file ?? "").replace(/[\r\n]/g, " ").slice(0, 120),
    expected,
    total: 0,
    done: 0,
    cursor: { batch: 0, row: 0 },
    counts: { added: 0, already: 0, skipped: 0, errors: 0, mailed: 0, unmailed: 0 },
    options: {
      agreed: kind === "contacts" && input.agreed === true,
      consentColumn: kind === "contacts" && input.consentColumn === true,
      tags: kind === "contacts" ? readTags(input.tags ?? []) : [],
      email: kind === "purchases" && input.email === true,
    },
    finishedAt: 0,
  };
  await redisPipeline([saveJob(job), ["LPUSH", listKey(store.sid), id], ["LTRIM", listKey(store.sid), 0, LIST_SIZE - 1]]);
  return { ok: true, job };
}

function finished(state: ImportState): boolean {
  return state === "done" || state === "canceled" || state === "failed";
}

/** Rows as they arrive: arrays of strings, the row number first, each cell capped. */
export function readBatch(kind: ImportKind, raw: unknown): string[][] | null {
  if (!Array.isArray(raw) || raw.length === 0 || raw.length > BATCH_ROWS) return null;
  const caps = CELL_CAPS[kind];
  const out: string[][] = [];
  for (const entry of raw) {
    if (!Array.isArray(entry) || entry.length !== caps.length + 1) return null;
    const line = Number(entry[0]);
    if (!Number.isInteger(line) || line < 1 || line > 10_000_000) return null;
    const cells: string[] = [String(line)];
    for (let i = 0; i < caps.length; i += 1) {
      const cell = entry[i + 1];
      if (cell !== null && typeof cell !== "string") return null;
      // One past the cap is kept, so a cell that was too long is said to be.
      cells.push(typeof cell === "string" ? cell.slice(0, caps[i] + 1) : "");
    }
    out.push(cells);
  }
  return out;
}

export type RowsProblem = "unknown" | "state" | "too_many";

/** Adds one batch of rows to an import that is still receiving them. */
export async function addRows(store: Store, id: string, rows: string[][]): Promise<{ ok: true; job: ImportJob } | { ok: false; reason: RowsProblem }> {
  const job = await jobOf(store, id);
  if (!job) return { ok: false, reason: "unknown" };
  if (job.state !== "receiving") return { ok: false, reason: "state" };
  if (job.total + rows.length > Math.min(job.expected, IMPORT_LIMITS[job.kind])) return { ok: false, reason: "too_many" };
  job.total += rows.length;
  await redisPipeline([
    ["RPUSH", rowsKey(id), JSON.stringify(rows)],
    ["EXPIRE", rowsKey(id), KEEP_SECONDS],
    saveJob(job),
  ]);
  return { ok: true, job };
}

/** Every row is here: the import is queued, for the page and the job to work through. */
export async function finishUpload(store: Store, id: string): Promise<{ ok: true; job: ImportJob } | { ok: false; reason: RowsProblem }> {
  const job = await jobOf(store, id);
  if (!job) return { ok: false, reason: "unknown" };
  if (job.state !== "receiving") return { ok: false, reason: "state" };
  job.state = job.total > 0 ? "queued" : "done";
  if (job.state === "done") job.finishedAt = Date.now();
  await redisPipeline([saveJob(job), ...(job.state === "queued" ? [["SADD", ACTIVE_KEY, id]] : [])]);
  if (job.state === "done") await releaseBusy(job);
  // Past buyers are looked for on the list of purchases from now on.
  if (job.kind === "purchases" && job.state === "queued" && !store.pastBuyers) await setPastBuyers(storeRef(store));
  return { ok: true, job };
}

async function cancelJob(job: ImportJob): Promise<ImportJob> {
  if (finished(job.state)) return job;
  job.state = "canceled";
  job.finishedAt = Date.now();
  await redisPipeline([saveJob(job), ["SREM", ACTIVE_KEY, job.id], ["DEL", rowsKey(job.id), seenKey(job.id), mailKey(job.id)]]);
  await releaseBusy(job);
  return job;
}

/** Lets go of the store's slot, when it is this import's: a newer import's hold is kept. */
async function releaseBusy(job: ImportJob): Promise<void> {
  const [holder] = await redisPipeline([["GET", busyKey(job.sid)]]);
  if (holder === job.id) await redisPipeline([["DEL", busyKey(job.sid)]]);
}

/**
 * Stops an import. What was brought in already stays: contacts on the list,
 * drafts in the store, buyers given their products. Nothing more is done.
 */
export async function cancelImport(store: Store, id: string): Promise<ImportJob | null> {
  const job = await jobOf(store, id);
  if (!job) return null;
  let held;
  try {
    held = await takeLock(lockKey(id), LOCK_SECONDS, 10_000);
  } catch (error) {
    if (error instanceof LockBusyError) return job;
    throw error;
  }
  try {
    const fresh = (await readJob(id)) ?? job;
    return await cancelJob(fresh);
  } finally {
    await releaseLock(held);
  }
}

// ---- Doing the work --------------------------------------------------------

type Problem = { line: number; column: string; problem: string; value: string };

async function note(job: ImportJob, problems: Problem[], kind: "errors" | "skipped"): Promise<void> {
  if (!problems.length) return;
  job.counts[kind] += problems.length;
  const [length] = await redisPipeline([["LLEN", errorsKey(job.id)]]);
  const room = Math.max(0, MAX_REPORT_ROWS - (Number(length) || 0));
  const kept = problems.slice(0, room).map((p) => JSON.stringify([p.line, p.column, `${kind === "skipped" ? "Left out: " : ""}${p.problem}`, p.value.slice(0, 300)]));
  if (kept.length) await redisPipeline([["RPUSH", errorsKey(job.id), ...kept], ["EXPIRE", errorsKey(job.id), KEEP_SECONDS]]);
}

/**
 * Notes each key as seen on its row; answers, for each, the earlier row it
 * was seen on, or null when this is the first. Seeing the same row again
 * (a step repeated after a failure) is not a repeat.
 */
async function firstSeen(job: ImportJob, keys: { key: string; line: number }[]): Promise<(number | null)[]> {
  if (!keys.length) return [];
  const answers = await redisPipeline([
    ...keys.map(({ key, line }) => ["HSETNX", seenKey(job.id), key, String(line)]),
    ["EXPIRE", seenKey(job.id), KEEP_SECONDS],
  ]);
  const again = keys.map((_, i) => Number(answers[i]) !== 1);
  const lines = again.some(Boolean)
    ? ((await redisPipeline([["HMGET", seenKey(job.id), ...keys.map((k) => k.key)]]))[0] as unknown[])
    : [];
  return keys.map(({ line }, i) => {
    if (!again[i]) return null;
    const earlier = Number(Array.isArray(lines) ? lines[i] : NaN);
    return Number.isFinite(earlier) && earlier !== line ? earlier : null;
  });
}

const isEmail = (email: string) => email.length <= MAX_EMAIL_LENGTH && EMAIL_PATTERN.test(email);

async function contactsStep(job: ImportJob, store: Store, rows: string[][]): Promise<void> {
  const listId = store.listId;
  if (!listId) throw new Error("the store has no list");
  const problems: Problem[] = [];
  const skipped: Problem[] = [];
  const valid: { line: number; email: string; name: string; tags: string[] }[] = [];
  for (const [lineText, rawEmail, name, tags, consent] of rows) {
    const line = Number(lineText);
    const email = normaliseEmail(rawEmail);
    if (!email) {
      problems.push({ line, column: "email", problem: "No email address", value: "" });
      continue;
    }
    if (!isEmail(email)) {
      problems.push({ line, column: "email", problem: "Not an email address", value: rawEmail });
      continue;
    }
    if (job.options.consentColumn) {
      const said = readConsent(consent);
      if (said === "no") {
        skipped.push({ line, column: "consent", problem: "The consent column does not say they agreed", value: consent });
        continue;
      }
      if (said === "unknown") {
        problems.push({ line, column: "consent", problem: "Not a yes or a no, so they were not added", value: consent });
        continue;
      }
    }
    valid.push({ line, email, name: name.trim().slice(0, MAX_CONTACT_NAME), tags: [...readTags(tags), ...job.options.tags] });
  }
  const seen = await firstSeen(job, valid.map((v) => ({ key: `e:${v.email}`, line: v.line })));
  const fresh = valid.filter((v, i) => {
    if (seen[i] === null) return true;
    skipped.push({ line: v.line, column: "email", problem: `The same address as row ${seen[i]}`, value: v.email });
    return false;
  });
  const outcomes = await importContactRows(listId, fresh.map((v) => ({ email: v.email, name: v.name, tags: readTags(v.tags) })));
  outcomes.forEach((outcome, i) => {
    const row = fresh[i];
    if (outcome === "added") job.counts.added += 1;
    else if (outcome === "already") job.counts.already += 1;
    else if (outcome === "left") skipped.push({ line: row.line, column: "email", problem: "Unsubscribed from your list before, so left alone", value: row.email });
    else problems.push({ line: row.line, column: "email", problem: "Your list is full", value: row.email });
  });
  await note(job, skipped, "skipped");
  await note(job, problems, "errors");
}

/** A price as another platform may write it: its currency's sign or code in front is dropped. */
function priceText(raw: string): string {
  return raw.trim().replace(/^(?:[A-Za-z]{1,3}\s?)?[$€£¥₹]?\s*/, "").replace(/\s*(?:[A-Za-z]{3})$/, "");
}

/** A description as another platform may export it, HTML and all, as plain text. */
function plainText(raw: string): string {
  const entities: Record<string, string> = { amp: "&", lt: "<", gt: ">", quot: '"', "#39": "'", apos: "'", nbsp: " " };
  return raw
    .replace(/<\s*br\s*\/?>/gi, "\n")
    .replace(/<\s*\/\s*(p|div|li|h[1-6])\s*>/gi, "\n\n")
    .replace(/<\s*li[^>]*>/gi, "- ")
    .replace(/<[^>]*>/g, "")
    .replace(/&(amp|lt|gt|quot|#39|apos|nbsp);/g, (_, name: string) => entities[name] ?? "");
}

/** The first sentences of a long description that fit the card, cut at a word. */
function summaryOf(text: string): string {
  const flat = text.replace(/\s+/g, " ").trim();
  if (flat.length <= MAX_SUMMARY_LENGTH) return flat;
  const cut = flat.slice(0, MAX_SUMMARY_LENGTH - 1);
  const space = cut.lastIndexOf(" ");
  return `${(space > MAX_SUMMARY_LENGTH / 2 ? cut.slice(0, space) : cut).replace(/[\s,;:.-]+$/, "")}\u2026`;
}

async function productsStep(job: ImportJob, store: Store, rows: string[][]): Promise<void> {
  const problems: Problem[] = [];
  const skipped: Problem[] = [];
  const drafts: { line: number; draft: DraftProduct; about: string }[] = [];
  for (const [lineText, rawTitle, rawPrice, rawDescription, rawType, rawLink] of rows) {
    const line = Number(lineText);
    const title = rawTitle.replace(/\s+/g, " ").trim();
    if (!title) {
      problems.push({ line, column: "title", problem: "No title", value: "" });
      continue;
    }
    if (title.length > MAX_TITLE_LENGTH) {
      problems.push({ line, column: "title", problem: `Longer than ${MAX_TITLE_LENGTH} characters`, value: title });
      continue;
    }
    const type = rawType.trim().toLowerCase();
    if (type && type !== "free" && type !== "paid") {
      problems.push({ line, column: "type", problem: "Type must be free or paid", value: rawType });
      continue;
    }
    const price = priceText(rawPrice);
    let priceCents = 0;
    if (type === "free" || (!type && (price === "" || /^0+([.,]0+)?$/.test(price)))) {
      if (price !== "" && !/^0+([.,]0+)?$/.test(price)) {
        problems.push({ line, column: "price", problem: "Marked free, but it has a price", value: rawPrice });
        continue;
      }
    } else {
      const amount = readMoney(price, store.currency);
      if (amount === null || amount === 0 || !priceInRange(amount, store.currency)) {
        problems.push({
          line,
          column: "price",
          problem: `A price is a plain amount ${rangeWords(store.currency)}, like 19 or 19.50`,
          value: rawPrice,
        });
        continue;
      }
      priceCents = amount;
    }
    const description = cleanAbout(plainText(rawDescription).slice(0, MAX_ABOUT_LENGTH * 2));
    if (plainText(rawDescription).trim().length > MAX_ABOUT_LENGTH) {
      problems.push({ line, column: "description", problem: `Longer than ${MAX_ABOUT_LENGTH.toLocaleString("en-US")} characters`, value: rawDescription.slice(0, 80) });
      continue;
    }
    let link: string | null = null;
    if (rawLink.trim()) {
      const read = readLink(rawLink);
      if (!read.ok) {
        problems.push({ line, column: "link", problem: LINK_PROBLEMS[read.reason as LinkProblem], value: rawLink });
        continue;
      }
      link = read.url;
    }
    const summary = summaryOf(description);
    // The whole description goes on the product's own page when the card cannot hold it.
    const about = description.length > MAX_SUMMARY_LENGTH || description.includes("\n") ? description : "";
    drafts.push({ line, draft: { title, summary, priceCents, link }, about });
  }
  const seen = await firstSeen(job, drafts.map((d) => ({ key: `t:${d.draft.title.toLowerCase()}`, line: d.line })));
  const unseen = drafts.filter((d, i) => {
    if (seen[i] === null) return true;
    skipped.push({ line: d.line, column: "title", problem: `The same title as row ${seen[i]}`, value: d.draft.title });
    return false;
  });
  // Rows a run already made a product of, before it stopped short of saving
  // its place: made once, never twice.
  const madeBefore = unseen.length
    ? ((await redisPipeline([["HMGET", seenKey(job.id), ...unseen.map((d) => `m:${d.line}`)]]))[0] as unknown[])
    : [];
  const fresh = unseen.filter((_, i) => !(Array.isArray(madeBefore) && madeBefore[i]));
  if (fresh.length) {
    let made = await addDraftProducts(storeRef(store), fresh.map((d) => ({ ...d.draft, about: d.about !== "" })));
    let taking = fresh;
    if (!made.ok && made.reason === "too_many") {
      // As many as there is room for, and the rest said plainly.
      taking = fresh.slice(0, made.room);
      for (const d of fresh.slice(made.room)) {
        problems.push({ line: d.line, column: "title", problem: `Your store is full (${MAX_PRODUCTS.toLocaleString("en-US")} products)`, value: d.draft.title });
      }
      made = taking.length ? await addDraftProducts(storeRef(store), taking.map((d) => ({ ...d.draft, about: d.about !== "" }))) : { ok: true, store, ids: [] };
    }
    if (!made.ok) throw new Error(`adding imported products failed: ${made.reason}`);
    if (made.ids.length) {
      await redisPipeline([
        ["HSET", seenKey(job.id), ...taking.slice(0, made.ids.length).flatMap((d) => [`m:${d.line}`, "1"])],
        ["EXPIRE", seenKey(job.id), KEEP_SECONDS],
      ]);
    }
    const statsId = made.store.statsId;
    for (let i = 0; i < made.ids.length; i += 1) {
      if (taking[i].about && statsId) await writeAbout(statsId, made.ids[i], taking[i].about);
    }
    job.counts.added += made.ids.length;
  }
  await note(job, skipped, "skipped");
  await note(job, problems, "errors");
}

async function purchasesStep(job: ImportJob, store: Store, rows: string[][]): Promise<void> {
  const statsId = store.statsId;
  if (!statsId) throw new Error("the store has no statsId");
  const problems: Problem[] = [];
  const skipped: Problem[] = [];
  const listings = await readAllListings(store);
  const byId = new Map(listings.map((p) => [p.id, p]));
  const byTitle = new Map<string, typeof listings>();
  for (const p of listings) {
    const key = p.title.replace(/\s+/g, " ").trim().toLowerCase();
    byTitle.set(key, [...(byTitle.get(key) ?? []), p]);
  }
  const valid: { line: number; email: string; productId: string; bundle: string[] | null }[] = [];
  for (const [lineText, rawEmail, rawProduct] of rows) {
    const line = Number(lineText);
    const email = normaliseEmail(rawEmail);
    if (!isEmail(email)) {
      problems.push({ line, column: "email", problem: email ? "Not an email address" : "No email address", value: rawEmail });
      continue;
    }
    const asked = rawProduct.replace(/\s+/g, " ").trim();
    const named = byId.get(asked) ? [byId.get(asked)!] : byTitle.get(asked.toLowerCase()) ?? [];
    if (named.length === 0) {
      problems.push({ line, column: "product", problem: "No product in your store has this name or id", value: rawProduct });
      continue;
    }
    if (named.length > 1) {
      problems.push({ line, column: "product", problem: `${named.length} products have this name: use the product's id instead`, value: rawProduct });
      continue;
    }
    const product = named[0];
    if (product.recurring) {
      problems.push({ line, column: "product", problem: "A membership runs on a subscription and cannot be given this way", value: rawProduct });
      continue;
    }
    if (product.call) {
      problems.push({ line, column: "product", problem: "A call is booked for a time and cannot be given this way", value: rawProduct });
      continue;
    }
    // A course or podcast at several prices still opens one thing: itself.
    if (product.options.length > 0 && !product.course && !product.podcast) {
      problems.push({ line, column: "product", problem: "It has several prices, so there is no one thing to give", value: rawProduct });
      continue;
    }
    // A bundle gives what it holds now, kept with the buyer as a checkout keeps it.
    const items = product.bundle ? deliverableItems(product, listings).map((p) => p.id) : null;
    if (!(product.course || product.file || product.link || (items && items.length > 0))) {
      problems.push({ line, column: "product", problem: "It has nothing to hand over yet: add its file, link or lessons, then import again", value: rawProduct });
      continue;
    }
    valid.push({ line, email, productId: product.id, bundle: items });
  }
  const seen = await firstSeen(job, valid.map((v) => ({ key: `p:${v.email}|${v.productId}`, line: v.line })));
  const fresh = valid.filter((v, i) => {
    if (seen[i] === null) return true;
    skipped.push({ line: v.line, column: "email", problem: `The same buyer and product as row ${seen[i]}`, value: v.email });
    return false;
  });
  const given = await grantImported(statsId, job.id, fresh.map((v) => ({ email: v.email, productId: v.productId, items: v.bundle })), undefined, store.sid);
  const toMail: string[] = [];
  given.forEach((isNew, i) => {
    if (isNew) {
      job.counts.added += 1;
      toMail.push(fresh[i].email);
    } else job.counts.already += 1;
  });
  if (job.options.email && toMail.length) {
    await redisPipeline([["SADD", mailKey(job.id), ...new Set(toMail)], ["EXPIRE", mailKey(job.id), KEEP_SECONDS]]);
  }
  await note(job, skipped, "skipped");
  await note(job, problems, "errors");
}

const escapeHtml = (text: string) => text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function displayName(name: string): string {
  return name.replace(/["\\<>\r\n]/g, "").trim().slice(0, 60) || "A store";
}

function senderAddress(): string {
  const match = NIMBUS_FROM.match(/<([^>]+)>/);
  return (match ? match[1] : NIMBUS_FROM).trim();
}

/** The one email a past buyer gets, when the creator ticked it: what moved, and how to open it. */
export async function movedEmail(store: Store, job: ImportJob, email: string): Promise<{ subject: string; text: string } | null> {
  const given = (await importedFor(store, email)).filter((p) => p.job === job.id);
  if (!given.length) return null;
  const products = await readListings(store, given.map((p) => p.productId));
  if (!products.length) return null;
  const base = storeBase(store);
  const lines = products.map((p) => (p.course ? `- ${p.title}: ${base}/course/${p.id}` : `- ${p.title}`));
  const subject = products.length === 1 ? `${products[0].title} has moved to ${store.name}` : `What you bought from ${store.name} has moved`;
  const text = [
    `${store.name} has moved to a new store, and what you bought before comes with you. Nothing was charged, and you do not need to buy it again.`,
    "",
    products.length === 1 ? "Yours there:" : "Yours there:",
    ...lines,
    "",
    `To open ${products.length === 1 ? "it" : "any of it"}, go to ${base}/orders and type ${email}. A link to everything you have there arrives within a minute. There is no password to make.`,
    "",
    `You are getting this one email because ${store.name} moved your purchases. Nothing more is sent because of it.`,
    `Sent by Marktmorgen on behalf of ${store.name}.`,
  ].join("\n");
  return { subject: subject.slice(0, 200), text };
}

async function mailStep(job: ImportJob, store: Store): Promise<"more" | "done" | "retry"> {
  const [waiting] = await redisPipeline([["SCARD", mailKey(job.id)]]);
  if (!(Number(waiting) > 0)) return "done";
  // These addresses are the creator's word alone. Once too many of them have
  // bounced, or been answered with a spam report, the rest are not written
  // to (lib/mail-health.ts): they are counted as not emailed, and the report
  // says so.
  const paused = await pausedFor(job.sid);
  // And until then they go out in portions that double, a hundred buyers
  // first, so that a file of dead addresses is found while few have been
  // written to. A portion not yet open is waited for; nobody is dropped.
  const portion = paused ? MAIL_CHUNK : await rampRoom(job.sid, Math.min(MAIL_CHUNK, Number(waiting)));
  if (portion <= 0) return "retry";
  const [popped] = await redisPipeline([["SPOP", mailKey(job.id), portion]]);
  const emails = (Array.isArray(popped) ? popped : typeof popped === "string" ? [popped] : []).map(String);
  if (emails.length === 0) return "done";
  if (paused) {
    job.counts.unmailed += emails.length;
    return "more";
  }
  /** What was taken from the portion and did not go is given back to it. */
  const unsent = (n: number) => rampBack(job.sid, n);
  const tags = healthTags(store, false);
  const messages = [];
  for (const email of emails) {
    const letter = await movedEmail(store, job, email);
    if (!letter) continue;
    messages.push({
      from: `"${displayName(store.name)} via Marktmorgen" <${senderAddress()}>`,
      to: email,
      subject: letter.subject,
      text: letter.text,
      html: `<div style="font-family:system-ui,sans-serif;line-height:1.5">${letter.text
        .split("\n\n")
        .map((para) => `<p>${escapeHtml(para).replace(/\n/g, "<br>")}</p>`)
        .join("")}</div>`,
      replyTo: store.email,
      tags,
    });
  }
  if (messages.length === 0) {
    await unsent(portion);
    return "more";
  }
  // The company's day first: over it, the same buyers wait for tomorrow.
  if (!(await reserveDay(messages.length))) {
    await redisPipeline([["SADD", mailKey(job.id), ...emails]]);
    await unsent(portion);
    return "retry";
  }
  // Then the store's thirty days: past them, the rest are not emailed.
  const room = await reserveMoved(job.sid, messages.length);
  const sending = messages.slice(0, room);
  if (sending.length < messages.length) await releaseDay(messages.length - sending.length);
  if (sending.length === 0) {
    job.counts.unmailed += messages.length;
    await unsent(portion);
    return "more";
  }
  const sent = await sendBatch(sending, `nimbus-import:${job.id}:${emails.slice().sort()[0]}:${emails.length}`);
  if (sent === "retry") {
    await redisPipeline([
      ["SADD", mailKey(job.id), ...emails],
      ["DECRBY", movedKey(job.sid), sending.length],
    ]);
    await releaseDay(sending.length);
    await unsent(portion);
    return "retry";
  }
  job.counts.unmailed += messages.length - sending.length;
  if (sent === "sent") {
    // What a bounce or a complaint is later measured against.
    await noteSent(job.sid, sending.length);
    await unsent(portion - sending.length);
    job.counts.mailed += sending.length;
  } else {
    await unsent(portion);
    job.counts.unmailed += sending.length;
  }
  return "more";
}

/**
 * Works on one import until `deadline` or until it is finished: its rows a
 * chunk at a time, then, for past buyers when the creator asked, the emails.
 * Returns the import as it stands. An import someone else is working on is
 * left to them.
 */
export async function runImport(id: string, deadline: number): Promise<ImportJob | null> {
  let held;
  try {
    held = await takeLock(lockKey(id), LOCK_SECONDS, 0);
  } catch (error) {
    if (error instanceof LockBusyError) return readJob(id);
    throw error;
  }
  const job = await readJob(id);
  try {
    if (!job) return null;
    if (job.state === "receiving" && Date.now() - job.at > RECEIVING_MS) return await cancelJob(job);
    if (job.state !== "queued" && job.state !== "running" && job.state !== "mailing") return job;
    const store = await storeForId(job.sid);
    if (!store) {
      job.state = "failed";
      job.finishedAt = Date.now();
      await redisPipeline([saveJob(job), ["SREM", ACTIVE_KEY, id], ["DEL", rowsKey(id)]]);
      return job;
    }
    const [batches] = await redisPipeline([["LLEN", rowsKey(id)]]);
    const count = Number(batches) || 0;
    while (Date.now() < deadline) {
      if (job.state === "queued") job.state = "running";
      if (job.state === "running") {
        if (job.cursor.batch >= count) {
          job.state = job.options.email ? "mailing" : "done";
          // Addresses brought in from elsewhere are of unknown age: the
          // store's next emails to them go out in portions that double
          // (lib/mail-health.ts). A file of contacts by how many it added;
          // past buyers, when they are to be emailed, by how many those are.
          if (job.kind === "contacts") await startRamp(job.sid, job.counts.added);
          else if (job.options.email) {
            const [toMail] = await redisPipeline([["SCARD", mailKey(job.id)]]);
            await startRamp(job.sid, Number(toMail) || 0);
          }
          await redisPipeline([saveJob(job)]);
          continue;
        }
        const [raw] = await redisPipeline([["LINDEX", rowsKey(id), job.cursor.batch]]);
        let batch: string[][] = [];
        try {
          batch = typeof raw === "string" ? (JSON.parse(raw) as string[][]) : [];
        } catch {
          batch = [];
        }
        const rows = batch.slice(job.cursor.row, job.cursor.row + CHUNK[job.kind]);
        if (rows.length) {
          // The store as it is now: a chunk of products changes it.
          const current = (await storeForId(job.sid)) ?? store;
          if (job.kind === "contacts") await contactsStep(job, current, rows);
          else if (job.kind === "products") await productsStep(job, current, rows);
          else await purchasesStep(job, current, rows);
          job.done += rows.length;
        }
        const next = job.cursor.row + CHUNK[job.kind];
        job.cursor = next >= batch.length ? { batch: job.cursor.batch + 1, row: 0 } : { batch: job.cursor.batch, row: next };
        await redisPipeline([saveJob(job)]);
        continue;
      }
      if (job.state === "mailing") {
        const step = await mailStep(job, store);
        await redisPipeline([saveJob(job)]);
        if (step === "retry") break;
        if (step === "done") job.state = "done";
        continue;
      }
      break;
    }
    if (job.state === "done") {
      job.finishedAt = Date.now();
      await redisPipeline([saveJob(job), ["SREM", ACTIVE_KEY, id], ["DEL", rowsKey(id), mailKey(id)]]);
      await releaseBusy(job);
    }
    return job;
  } catch (error) {
    console.error("an import step failed", error);
    // Left as it was: the next step starts again from the last saved place.
    return job;
  } finally {
    await releaseLock(held);
  }
}

/**
 * The job's pass: every import with work left, oldest first, until the
 * deadline. Uploads given up halfway are cancelled here too.
 */
export async function advanceImports(deadline: number): Promise<{ worked: number; finished: number }> {
  const counts = { worked: 0, finished: 0 };
  if (!isRedisConfigured()) return counts;
  const [members] = await redisPipeline([["SMEMBERS", ACTIVE_KEY]]);
  const ids = (Array.isArray(members) ? members.map(String) : []).filter((id) => IMPORT_ID_PATTERN.test(id));
  const jobs = (await Promise.all(ids.map(readJob))).filter((job): job is ImportJob => job !== null).sort((a, b) => a.at - b.at);
  for (const id of ids) {
    if (!jobs.some((job) => job.id === id)) await redisPipeline([["SREM", ACTIVE_KEY, id]]);
  }
  for (const job of jobs) {
    if (Date.now() >= deadline) break;
    const after = await runImport(job.id, deadline);
    counts.worked += 1;
    if (after && finished(after.state)) counts.finished += 1;
  }
  return counts;
}

/** The rows that were not brought in, as a spreadsheet: row, column, what was wrong, what it held. */
export async function reportCsv(job: ImportJob): Promise<string> {
  const [rows] = await redisPipeline([["LRANGE", errorsKey(job.id), 0, MAX_REPORT_ROWS - 1]]);
  const lines = [csvLine(["row", "column", "problem", "value"])];
  for (const raw of Array.isArray(rows) ? rows : []) {
    try {
      const [line, column, problem, value] = JSON.parse(String(raw)) as [number, string, string, string];
      lines.push(csvLine([line, column, problem, value]));
    } catch {
      // A line that cannot be read is left out of the report, not the import.
    }
  }
  const missing = job.counts.errors + job.counts.skipped - (lines.length - 1);
  if (missing > 0) lines.push(csvLine(["", "", `And ${missing.toLocaleString("en-US")} more rows like these, not listed`, ""]));
  return `\uFEFF${lines.join("\r\n")}\r\n`;
}
