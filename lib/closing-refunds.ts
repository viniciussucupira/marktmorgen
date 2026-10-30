/**
 * Time members paid for past a store's closing day, given back from the
 * creator's own Stripe account (queue item 307 [EC1], part 4, and its
 * complement of 30 October 2026, 13h12 Fortaleza).
 *
 * Two ways in, one calculation (lib/closing-buyers-rules.ts, unusedOf and
 * stillToGive) and one function:
 *
 *   - the creator's button, after a review screen (app/studio/closing-refunds):
 *     every member's amount shown before it is confirmed, and refused if what
 *     Stripe says changed since the screen was drawn;
 *   - the closing day (lib/plan-closing.ts): whatever was not given back by
 *     then is given back that day, the same amounts, by the code.
 *
 * Read on 30 October 2026 in Stripe's documentation:
 * docs.stripe.com/connect/saas/tasks/refunds-disputes ("Create a refund using
 * your platform's secret key with charge_write permission for connected
 * accounts when authenticated as the connected account"; "With direct
 * charges ... Stripe debits refunds and disputed amounts from that account's
 * balance"); docs.stripe.com/connect/account-balances (a connected account's
 * negative balance can fall on the platform when controller.losses.payments
 * is "application"); docs.stripe.com/errors (balance_insufficient,
 * charge_disputed, refund_disputed_payment, charge_already_refunded);
 * docs.stripe.com/changelog/basil/2025-04-30/refund-pending-reason (a refund
 * pending for insufficient_funds).
 *
 * So the platform never pays and never owes: each refund is made only when
 * the account's available balance in that currency, read first, covers it,
 * and is counted off as it goes; one that does not fit is not attempted.
 *
 * Never twice: each refund carries the invoice it gives back for in its
 * metadata and in its idempotency key; before one is made Stripe is asked
 * for the refunds already made on that payment, and whatever was given back
 * already (here, by the creator at Stripe, for any reason) is taken off the
 * unused part (stillToGive). A lock keeps two requests from running at once.
 */
import { createHash } from "node:crypto";
import { onAccount, StripeError } from "@/lib/stripe-account";
import { redisPipeline } from "@/lib/redis";
import { type Store, storeFolder, storeRef } from "@/lib/store";
import { type PaidPeriod, REFUNDS_PER_REQUEST, stillToGive, totalsOf, unusedOf } from "@/lib/closing-buyers-rules";
import { paidPeriods, savePaidPeriod } from "@/lib/closing-holds";

const INTENT_ID = /^pi_[A-Za-z0-9]{6,64}$/;
const lockKey = (folder: string) => `nl:closing:refund:${folder}`;
const LOCK_SECONDS = 120;

export type UnusedRow = { sub: string; paid: PaidPeriod; unused: number };

/** Every member who paid for time past `day` (ms) and has not been settled yet, with what that time is worth. */
export async function unusedRows(store: Store, day: number): Promise<UnusedRow[]> {
  const rows: UnusedRow[] = [];
  for (const [sub, paid] of await paidPeriods(store)) {
    if (paid.r && paid.r !== "pending") continue;
    const unused = unusedOf(paid, day);
    if (unused > 0) rows.push({ sub, paid, unused });
  }
  return rows.sort((a, b) => b.paid.pe - a.paid.pe || a.sub.localeCompare(b.sub));
}

/** The figure the creator reads: how many members, and what in all, by currency. */
export async function unusedSummary(store: Store, day: number): Promise<{ members: number; totals: { cur: string; amount: number }[]; rows: UnusedRow[] }> {
  const rows = await unusedRows(store, day);
  return { members: rows.length, totals: totalsOf(rows.map((r) => ({ amount: r.unused, cur: r.paid.cur }))), rows };
}

/** A fingerprint of what a review screen showed: the rows and their amounts, as it was drawn. */
export function reviewMark(rows: UnusedRow[]): string {
  return createHash("sha256").update(rows.slice(0, REFUNDS_PER_REQUEST).map((r) => `${r.sub}:${r.unused}:${r.paid.cur}`).join("|")).digest("hex");
}

export type Settled = {
  done: { sub: string; amount: number; cur: string }[];
  short: { sub: string; amount: number; cur: string; email: string }[];
  pending: number;
  disputed: number;
  none: number;
  /** Not reached: Stripe could not be asked. Tried again. */
  failed: number;
};

/** The payment intent an invoice was paid by, whichever way this account's API version names it. */
async function intentOf(account: string, invoice: string): Promise<string> {
  const read = await onAccount("GET", account, `/invoices/${encodeURIComponent(invoice)}`);
  const direct = typeof read.payment_intent === "string" ? read.payment_intent : (read.payment_intent as { id?: unknown } | null)?.id;
  if (typeof direct === "string" && INTENT_ID.test(direct)) return direct;
  const listed = await onAccount("GET", account, `/invoice_payments?${new URLSearchParams({ invoice, limit: "10" })}`);
  for (const row of Array.isArray(listed.data) ? (listed.data as Record<string, unknown>[]) : []) {
    if (row.status !== "paid") continue;
    const pi = (row.payment as { payment_intent?: unknown } | null)?.payment_intent;
    const id = typeof pi === "string" ? pi : (pi as { id?: unknown } | null)?.id;
    if (typeof id === "string" && INTENT_ID.test(id)) return id;
  }
  return "";
}

/** The account's available balance, by currency, in the smallest unit. */
async function available(account: string): Promise<Map<string, number>> {
  const balance = await onAccount("GET", account, "/balance");
  const out = new Map<string, number>();
  for (const row of Array.isArray(balance.available) ? (balance.available as { amount?: unknown; currency?: unknown }[]) : []) {
    if (typeof row.currency === "string" && typeof row.amount === "number") out.set(row.currency.toLowerCase(), (out.get(row.currency.toLowerCase()) ?? 0) + row.amount);
  }
  return out;
}

/**
 * Gives back each member's unused part, from the creator's own account.
 * `subs` limits it to the rows a review screen showed; `mark` is that
 * screen's reviewMark, and nothing is done when the rows changed since.
 */
export async function giveBackUnused(store: Store, day: number, options: { subs?: string[]; mark?: string } = {}): Promise<Settled | "changed" | "busy" | "unavailable"> {
  const account = store.stripeAccountId;
  if (!account) return "unavailable";
  const folder = await storeFolder(storeRef(store));
  const [got] = await redisPipeline([["SET", lockKey(folder), "1", "NX", "EX", LOCK_SECONDS]]);
  if (got === null) return "busy";
  try {
    let rows = await unusedRows(store, day);
    if (options.subs) {
      const wanted = new Set(options.subs);
      rows = rows.filter((r) => wanted.has(r.sub));
    }
    if (options.mark !== undefined && options.mark !== reviewMark(rows)) return "changed";
    rows = rows.slice(0, REFUNDS_PER_REQUEST);
    const out: Settled = { done: [], short: [], pending: 0, disputed: 0, none: 0, failed: 0 };
    if (!rows.length) return out;
    let funds: Map<string, number>;
    try {
      funds = await available(account);
    } catch (error) {
      console.error("reading a closing store's Stripe balance failed", error);
      return { ...out, failed: rows.length };
    }
    for (const row of rows) {
      const settle = async (r: PaidPeriod["r"], amount?: number) =>
        savePaidPeriod(store, row.sub, { ...row.paid, r, ...(amount ? (r === "short" ? { want: amount } : { back: amount }) : {}) });
      try {
        const intent = await intentOf(account, row.paid.inv);
        if (!intent) {
          await settle("none");
          out.none += 1;
          continue;
        }
        const pi = await onAccount("GET", account, `/payment_intents/${encodeURIComponent(intent)}?expand[]=latest_charge`);
        const charge = pi.latest_charge && typeof pi.latest_charge === "object" ? (pi.latest_charge as Record<string, unknown>) : {};
        if (charge.disputed === true) {
          await settle("disputed");
          out.disputed += 1;
          continue;
        }
        // One made here before, under this invoice: never a second.
        const made = await onAccount("GET", account, `/refunds?${new URLSearchParams({ payment_intent: intent, limit: "100" })}`);
        const ours = (Array.isArray(made.data) ? (made.data as Record<string, unknown>[]) : []).find(
          (r) => (r.metadata as Record<string, string> | null)?.closing_refund === row.paid.inv && r.status !== "failed" && r.status !== "canceled",
        );
        if (ours) {
          await settle(ours.status === "pending" ? "pending" : "done", Number(ours.amount) || undefined);
          if (ours.status === "pending") out.pending += 1;
          else out.done.push({ sub: row.sub, amount: Number(ours.amount) || 0, cur: row.paid.cur });
          continue;
        }
        const give = stillToGive(row.unused, typeof charge.amount_refunded === "number" ? charge.amount_refunded : 0);
        if (give <= 0) {
          await settle("none");
          out.none += 1;
          continue;
        }
        if ((funds.get(row.paid.cur) ?? 0) < give) {
          await settle("short", give);
          out.short.push({ sub: row.sub, amount: give, cur: row.paid.cur, email: row.paid.e });
          continue;
        }
        let refund: Record<string, unknown>;
        try {
          refund = await onAccount(
            "POST",
            account,
            "/refunds",
            new URLSearchParams({ payment_intent: intent, amount: String(give), reason: "requested_by_customer", "metadata[closing_refund]": row.paid.inv, "metadata[store_closing]": "unused_time" }),
            undefined,
            `closing-refund:${row.paid.inv}`,
          );
        } catch (error) {
          if (error instanceof StripeError && error.code === "balance_insufficient") {
            await settle("short", give);
            out.short.push({ sub: row.sub, amount: give, cur: row.paid.cur, email: row.paid.e });
            continue;
          }
          if (error instanceof StripeError && (error.code === "charge_disputed" || error.code === "refund_disputed_payment")) {
            await settle("disputed");
            out.disputed += 1;
            continue;
          }
          if (error instanceof StripeError && error.code === "charge_already_refunded") {
            await settle("none");
            out.none += 1;
            continue;
          }
          throw error;
        }
        funds.set(row.paid.cur, (funds.get(row.paid.cur) ?? 0) - give);
        if (refund.status === "pending") {
          await settle("pending", give);
          out.pending += 1;
        } else {
          await settle("done", give);
          out.done.push({ sub: row.sub, amount: give, cur: row.paid.cur });
        }
      } catch (error) {
        console.error("giving a member's unused time back failed; tried again", error);
        out.failed += 1;
      }
    }
    return out;
  } finally {
    await redisPipeline([["DEL", lockKey(folder)]]).catch(() => {});
  }
}
