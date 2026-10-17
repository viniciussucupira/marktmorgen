/**
 * How many orders a store handed over this month.
 *
 * lib/order-rules.ts says what an order is and why it is counted. This file
 * keeps the count.
 *
 *   nl:orders:seen:<hash>         an order already counted, by its reference
 *   nl:orders:n:<folder>:<month>  orders counted, that month
 *   nl:orders:folders:<month>     the stores that had any, that month
 *
 * An order is counted where its email goes out, because the email is what
 * it costs and goes out once: a checkout confirmed (lib/purchase-email.ts),
 * an offer taken after paying (the same file), a place taken in a purchase
 * for several people (lib/group-buy.ts), a free copy (lib/free.ts). Each is
 * marked by its own reference before it is added, so a confirmation sent
 * again, or noticed by two paths at once, counts once.
 *
 * What this errs toward. A count that cannot be written is not made, and an
 * order that paid a share of its sale is not counted at all. Both are in the
 * creator's favor, which is the way round a figure that is billed from has
 * to err.
 */
import { createHash } from "node:crypto";
import { rememberFolderOwner } from "@/lib/delivery";
import { allowanceWindow, calendarWindow } from "@/lib/allowance-window";
import { shareBps } from "@/lib/platform-share";
import { isRedisConfigured, redisPipeline } from "@/lib/redis";
import { type Store, storeFolder, storeRef } from "@/lib/store";

const seenKey = (reference: string) => `nl:orders:seen:${createHash("sha256").update(reference).digest("hex").slice(0, 32)}`;
const countKey = (folder: string, month: string) => `nl:orders:n:${folder}:${month}`;
const foldersKey = (month: string) => `nl:orders:folders:${month}`;

/** An order's mark lasts longer than the month it is counted in, and the days that month is still settled. */
const SEEN_SECONDS = 45 * 24 * 60 * 60;
/** A month's figures are kept long enough to be billed, asked about and answered for. */
const KEEP_SECONDS = 400 * 24 * 60 * 60;

const FOLDER_PATTERN = /^[0-9a-f]{32}$/;

/**
 * Whether an order is covered by the share its sale paid, and so is not
 * counted: something was paid, and the store's sales pay a share right now.
 */
export function coveredByShare(store: Parameters<typeof shareBps>[0], paidCents: number, nowSeconds = Date.now() / 1000, live?: boolean): boolean {
  return Number.isFinite(paidCents) && paidCents > 0 && shareBps(store, nowSeconds, live) > 0;
}

/**
 * One order handed over. `reference` names it (a checkout, a payment, a
 * place, a free copy) and `paidCents` is what was paid for it, zero for
 * nothing. Answers whether it was counted.
 *
 * Never throws: a count that cannot be written must not cost a buyer their
 * email.
 */
export async function countOrder(store: Store, reference: string, paidCents: number, now = Date.now()): Promise<boolean> {
  if (!isRedisConfigured() || !reference) return false;
  try {
    const [fresh] = await redisPipeline([["SET", seenKey(reference), "1", "NX", "EX", SEEN_SECONDS]]);
    if (fresh === null) return false;
    // What the order leaves in the database is counted in the store's data
    // room by the writes that leave it, at what each really adds
    // (lib/order-data.ts), never refused: its room was held when its checkout
    // was admitted (lib/order-admission.ts), at the most an order can take.
    if (coveredByShare(store, paidCents, now / 1000)) return false;
    const owner = storeRef(store);
    const folder = await storeFolder(owner);
    // Counted in the store's window (lib/allowance-window.ts). An order paid
    // for when no window is known (its checkout was opened before) still
    // counts, in the calendar month, rather than nowhere.
    const window = (allowanceWindow(store, now) ?? calendarWindow(now)).id;
    const month = calendarWindow(now).id;
    const [count] = await redisPipeline([
      ["INCR", countKey(folder, window)],
      ["EXPIRE", countKey(folder, window), KEEP_SECONDS],
    ]);
    // Written with the month's first order, and again at every hundredth, so
    // one write lost to a bad moment mends itself long before a bill could be
    // made from the count: no plan covers fewer than a hundred orders.
    const n = Number(count);
    if (n === 1 || n % 100 === 0) {
      await redisPipeline([
        ["SADD", foldersKey(month), folder],
        ["EXPIRE", foldersKey(month), KEEP_SECONDS],
      ]);
      // Whose folder this is, for the daily job that bills and writes (lib/usage-billing.ts, storeOf).
      await rememberFolderOwner(folder, owner);
    }
    return true;
  } catch (error) {
    console.error("could not count an order", error);
    return false;
  }
}

/** The orders a store had in a window: a calendar month ("2026-10"), this one by default, or a billing month ("2026-10-19"). Zero when it cannot be read. */
export async function ordersIn(folder: string, month = calendarWindow().id): Promise<number> {
  if (!isRedisConfigured() || !folder) return 0;
  try {
    const [raw] = await redisPipeline([["GET", countKey(folder, month)]]);
    const n = Number(raw);
    return Number.isFinite(n) && n > 0 ? Math.floor(n) : 0;
  } catch (error) {
    console.error("could not read a store's orders", error);
    return 0;
  }
}

/** The orders a store has had in its window (its billing month when it pays), by the store. */
export async function storeOrdersThisMonth(store: Store, now = Date.now()): Promise<number> {
  return ordersIn(await storeFolder(storeRef(store)), (allowanceWindow(store, now) ?? calendarWindow(now)).id);
}

/** The stores that had any order counted in a month. */
export async function orderedFolders(month = calendarWindow().id): Promise<string[]> {
  if (!isRedisConfigured()) return [];
  const [raw] = await redisPipeline([["SMEMBERS", foldersKey(month)]]);
  return Array.isArray(raw) ? raw.filter((f): f is string => typeof f === "string" && FOLDER_PATTERN.test(f)).sort() : [];
}
