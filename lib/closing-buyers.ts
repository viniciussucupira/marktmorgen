/**
 * The buyers of a store that closes, told by Marktmorgen itself (queue item
 * 307 [EC1], part 5; lib/closing-buyers-rules.ts says why and what).
 *
 *   tellBuyers     BUYER_NOTICE_DAYS days before the closing at the least:
 *                  one service email to everyone who bought from the store
 *                  (its paid checkouts on the creator's Stripe account, its
 *                  PayPal sales, and the buyers it brought over or was given
 *                  as gifts), each address once, a part a day for a store
 *                  with more than one run can read
 *   tellStaysOpen  the plan was started again after that: one short email to
 *                  each address that was told
 *   tellRefundShort  a member whose refund the store's balance did not cover
 *
 * The cap, before every email: the closing's emails, set when its members
 * were held (lib/closing-credit.ts, buyerNoticeCap), priced against every
 * payment with the rest of the closing (tests/plan-cost-registry.ts,
 * closure). Telling a buyer takes EMAILS_PER_BUYER_PER_ENDING from it at
 * once, the notice and the one follow-up either of the two others can be,
 * so a follow-up is never short of what it costs. An address the cap no
 * longer covers is not written to, and is counted (`untold`) for the
 * creator's notices and studio, never left silent.
 *
 *   nl:closing:credit:<folder>  what is left of the closing's emails (lib/closing-credit.ts)
 *   nl:closing:told:<folder>    the addresses told for this ending, until the store closes or stays
 *
 * Sent from Marktmorgen's own address with its postal address
 * (lib/company-postal.ts), counted on the company's sender (EmailMeter
 * "company"), never on the store's own emails, which end with its plan.
 */
import { createHash } from "node:crypto";
import { EMAIL_PATTERN, normaliseEmail } from "@/lib/auth";
import { NIMBUS_FROM, sendBatch, type BatchMessage } from "@/lib/email";
import { onAccount } from "@/lib/stripe-account";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { type Store, saleHandles, storeFolder, storeRef } from "@/lib/store";
import { readPayPalSales } from "@/lib/paypal-sales";
import { importedBuyers } from "@/lib/imported-purchases";
import { storeBase } from "@/lib/purchase-email";
import { formatMoney } from "@/lib/money";
import { companyPostal } from "@/lib/company-postal";
import { paidPeriods } from "@/lib/closing-holds";
import { returnCredit, takeCredit } from "@/lib/closing-credit";
import {
  BUYER_PAGES_PER_RUN,
  EMAILS_PER_BUYER_PER_ENDING,
  type BuyerLetter,
  buyerNotice,
  letterHtml,
  refundShortLetter,
  staysOpenLetter,
  unusedOf,
} from "@/lib/closing-buyers-rules";

export const toldKey = (folder: string) => `nl:closing:told:${folder}`;

const contactOf = (store: Store) => `reply to this email, or write to ${store.email}`;

function message(store: Store, to: string, letter: BuyerLetter, postal: string): BatchMessage {
  const text = `${letter.text}\n\nMarktmorgen, ${postal}`;
  return { from: NIMBUS_FROM, to, replyTo: store.email, subject: letter.subject, text, html: letterHtml(letter.text, postal), tags: { kind: "closing_notice" } };
}

/** Sends one batch; true when it went. */
async function send(messages: BatchMessage[], key: string): Promise<boolean> {
  if (!messages.length) return true;
  const sent = await sendBatch(messages, key, { by: "company" });
  if (sent !== "sent") console.error(`a closing store's buyers' emails were not sent (${sent}); tried again tomorrow`);
  return sent === "sent";
}

const batchKey = (what: string, folder: string, endedAt: number, to: string[]) =>
  `closing:${what}:${createHash("sha256").update(`${folder}:${endedAt}:${to.join(",")}`).digest("hex").slice(0, 40)}`;

/** The addresses of a page of the store's checkouts that bought something it hands over: paid, or a membership's free start. */
function buyersIn(rows: Record<string, unknown>[], handles: Set<string>): string[] {
  const out: string[] = [];
  for (const row of rows) {
    const meta = (row.metadata ?? {}) as Record<string, string>;
    if (!handles.has(meta.store ?? "")) continue;
    if (row.status !== "complete") continue;
    if (row.payment_status !== "paid" && !(row.mode === "subscription" && row.payment_status === "no_payment_required")) continue;
    const details = (row.customer_details ?? {}) as { email?: unknown };
    const email = typeof details.email === "string" ? details.email : typeof row.customer_email === "string" ? row.customer_email : "";
    if (email) out.push(email);
  }
  return out;
}

export type Told = { done: boolean; after: string; sent: number; untold: number; blocked?: "postal" };

/**
 * Tells the next part of the store's buyers. `after` is where the last run
 * stopped in the store's checkouts ("" the first time: then the buyers
 * kept here are told first; each address told is written down at once, so
 * a run that stops part-way never writes to anybody twice).
 * `day` is the closing day the emails name.
 */
export async function tellBuyers(store: Store, endedAt: number, day: number, after: string, until: number): Promise<Told> {
  const postal = companyPostal();
  if (!postal) return { done: false, after, sent: 0, untold: 0, blocked: "postal" };
  const folder = await storeFolder(storeRef(store));
  const out: Told = { done: false, after, sent: 0, untold: 0 };
  const members = new Map<string, string>();
  for (const paid of (await paidPeriods(store)).values()) {
    const unused = unusedOf(paid, day);
    if (paid.e) members.set(paid.e, unused > 0 ? formatMoney(unused, paid.cur) : members.get(paid.e) ?? "");
  }
  const base = storeBase(store);
  const tell = async (raw: string[]): Promise<boolean> => {
    const fresh = [...new Set(raw.map((e) => normaliseEmail(e)).filter((e) => EMAIL_PATTERN.test(e)))];
    if (!fresh.length) return true;
    const known = await redisPipeline([["HMGET", toldKey(folder), ...fresh]]);
    const marks = Array.isArray(known[0]) ? (known[0] as unknown[]) : [];
    const todo = fresh.filter((_, i) => marks[i] === null || marks[i] === undefined);
    for (let i = 0; i < todo.length; i += 100) {
      const going: string[] = [];
      for (const email of todo.slice(i, i + 100)) {
        if (await takeCredit(folder, EMAILS_PER_BUYER_PER_ENDING)) going.push(email);
        else out.untold += 1;
      }
      const letters = going.map((email) =>
        message(store, email, buyerNotice({ store: store.name, storeUrl: base, day, contact: contactOf(store), member: members.has(email), refund: members.get(email) || undefined }), postal),
      );
      if (!(await send(letters, batchKey("notice", folder, endedAt, going)))) {
        await returnCredit(folder, going.length * EMAILS_PER_BUYER_PER_ENDING);
        return false;
      }
      if (going.length) await redisPipeline([["HSET", toldKey(folder), ...going.flatMap((email) => [email, String(endedAt)])]]);
      out.sent += going.length;
    }
    return true;
  };

  if (!after) {
    // (The told list of an earlier ending was let go when this one's members were held: lib/plan-closing.ts.)
    const kept: string[] = [...members.keys()];
    kept.push(...(await importedBuyers(store.statsId)).keys());
    kept.push(...(await readPayPalSales(store.statsId, 0, 100_000)).sales.map((sale) => sale.email));
    if (!(await tell(kept))) return out;
    out.after = "start";
  }
  const account = store.stripeAccountId;
  if (!account) return { ...out, done: true };
  const handles = saleHandles(store);
  let cursor = out.after === "start" ? "" : out.after;
  for (let page = 0; page < BUYER_PAGES_PER_RUN; page += 1) {
    if (Date.now() > until) return out;
    const list = await onAccount("GET", account, `/checkout/sessions?limit=100${cursor ? `&starting_after=${encodeURIComponent(cursor)}` : ""}`);
    const rows = Array.isArray(list.data) ? (list.data as Record<string, unknown>[]) : [];
    if (!(await tell(buyersIn(rows, handles)))) return out;
    const last = rows[rows.length - 1];
    if (list.has_more !== true || !last || typeof last.id !== "string") return { ...out, done: true };
    cursor = last.id;
    out.after = cursor;
  }
  return out;
}

/** The short email to everyone told, once the plan runs again; true when all of it went (or there was nobody). */
export async function tellStaysOpen(store: Store, until: number): Promise<boolean> {
  if (!isRedisConfigured()) return false;
  const folder = await storeFolder(storeRef(store));
  const postal = companyPostal();
  const base = storeBase(store);
  for (let round = 0; round < 1_000; round += 1) {
    if (Date.now() > until) return false;
    const [reply] = await redisPipeline([["HSCAN", toldKey(folder), "0", "COUNT", 100]]);
    const flat = Array.isArray(reply) && Array.isArray(reply[1]) ? (reply[1] as unknown[]).map(String) : [];
    const told: { email: string; ending: string }[] = [];
    for (let i = 0; i + 1 < flat.length; i += 2) told.push({ email: flat[i], ending: flat[i + 1] });
    if (!told.length) return true;
    // Each was told with a follow-up paid for (tellBuyers takes both at once); without an address of ours to sign with, nothing goes.
    if (!postal) return false;
    const letters = told.map(({ email }) => message(store, email, staysOpenLetter({ store: store.name, storeUrl: base, contact: contactOf(store) }), postal));
    if (!(await send(letters, batchKey("stays", folder, Number(told[0].ending) || 0, told.map((t) => t.email))))) return false;
    await redisPipeline([["HDEL", toldKey(folder), ...told.map((t) => t.email)]]);
  }
  return false;
}

/**
 * The email to members whose refund could not be made on the closing day.
 * Paid for by the follow-up taken when they were told; one who was not told
 * takes it from the store's credit now. True when every one went or was
 * counted as not coverable.
 */
export async function tellRefundShort(store: Store, short: { email: string; amount: number; cur: string }[], endedAt: number): Promise<{ sent: number; untold: number; ok: boolean }> {
  const postal = companyPostal();
  const out = { sent: 0, untold: 0, ok: true };
  if (!short.length) return out;
  if (!postal) return { ...out, ok: false };
  const folder = await storeFolder(storeRef(store));
  const going: BatchMessage[] = [];
  const addresses: string[] = [];
  for (const row of short) {
    const email = normaliseEmail(row.email);
    if (!EMAIL_PATTERN.test(email)) {
      out.untold += 1;
      continue;
    }
    const [told] = await redisPipeline([["HGET", toldKey(folder), email]]);
    if (told === null && !(await takeCredit(folder, 1))) {
      out.untold += 1;
      continue;
    }
    addresses.push(email);
    going.push(message(store, email, refundShortLetter({ store: store.name, amount: formatMoney(row.amount, row.cur), contact: contactOf(store) }), postal));
  }
  for (let i = 0; i < going.length; i += 100) {
    if (!(await send(going.slice(i, i + 100), batchKey("short", folder, endedAt, addresses.slice(i, i + 100))))) return { ...out, ok: false };
    out.sent += Math.min(100, going.length - i);
  }
  return out;
}

/** Once the store is closed or runs on: the addresses told are let go. */
export async function forgetTold(folder: string): Promise<void> {
  await redisPipeline([["DEL", toldKey(folder)]]);
}
